const UploadParser = {
  async parseFiles(files, progress) {
    const list = Array.from(files || []);
    if (list.length === 0) throw new Error('Tidak ada file yang dipilih.');
    const step = (m, p) => progress && progress(m, p);
    const parsed = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      step('Membaca ' + f.name + ' (' + (i + 1) + '/' + list.length + ')', Math.round((i / list.length) * 80) + 5);
      parsed.push(await this._parseOne(f));
    }
    const kinds = Array.from(new Set(parsed.map(p => p.kind)));
    if (kinds.length > 1) throw new Error('File penjualan dan komplain tidak bisa diupload bersamaan. Pilih satu jenis saja.');
    step('Menggabungkan data...', 90);
    return kinds[0] === 'komplain' ? this._mergeComplaint(parsed) : this._mergeSales(parsed);
  },

  async _parseOne(file) {
    const bytes = new Uint8Array(await this._readBuffer(file));
    if (!bytes.length) throw new Error('File "' + file.name + '" kosong.');
    if (this._looksHtml(bytes)) return this._parseSales(file, this._decode(bytes));
    const wb = XLSX.read(bytes, { type: 'array', cellDates: false });
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, raw: true });
    const headerRow = this._findComplaintHeader(aoa);
    if (headerRow < 0) {
      throw new Error('Format file "' + file.name + '" tidak dikenali. Penjualan: file export Grand Total All Store. Komplain: file dengan kolom "Nama Store" & "Media Komplain".');
    }
    return this._parseComplaint(file, aoa, headerRow);
  },

  async _readBuffer(file) {
    try {
      return await file.arrayBuffer();
    } catch (e) {
      try {
        return await this._readWithFileReader(file);
      } catch (e2) {
        throw new Error('File "' + file.name + '" tidak bisa dibaca. Biasanya karena filenya masih di cloud (Google Drive / Files) atau sudah dipindah, dihapus, atau ditimpa setelah dipilih. Download dulu ke penyimpanan perangkat, lalu pilih ulang filenya.');
      }
    }
  },

  _readWithFileReader(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr.error || new Error('read failed'));
      try { fr.readAsArrayBuffer(file); } catch (e) { reject(e); }
    });
  },

  _decode(bytes) {
    const utf8 = new TextDecoder('utf-8').decode(bytes);
    if (utf8.indexOf('\uFFFD') < 0) return utf8;
    try { return new TextDecoder('windows-1252').decode(bytes); } catch (e) { return utf8; }
  },

  _looksHtml(bytes) {
    const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 4096)).toLowerCase();
    return head.indexOf('<table') >= 0 || head.indexOf('<html') >= 0 || head.indexOf('<!doctype html') >= 0;
  },

  _mergeSales(parsed) {
    const rows = [];
    const files = [];
    let skipped = 0;
    parsed.forEach(p => {
      rows.push(...p.rows);
      files.push(p.meta.fileName);
      skipped += p.meta.skipped;
    });
    const seen = {};
    const dupes = [];
    rows.forEach(r => {
      const k = r.date + '|' + r.branch;
      if (seen[k]) dupes.push(k); else seen[k] = 1;
    });
    if (dupes.length) throw new Error('Ada ' + dupes.length + ' baris tanggal + toko yang sama di file yang dipilih. Pastikan satu tanggal hanya diupload sekali.');
    if (rows.length === 0) throw new Error('Tidak ada baris penjualan yang valid.');
    const dates = Array.from(new Set(rows.map(r => r.date))).sort();
    return {
      kind: 'sales',
      rows,
      meta: {
        fileName: files.length === 1 ? files[0] : files.length + ' file',
        fileCount: files.length,
        rowCount: rows.length,
        skipped,
        branches: Array.from(new Set(rows.map(r => r.branch))),
        dates,
        totalBruto: rows.reduce((s, r) => s + r.bruto, 0),
        dateStart: dates[0],
        dateEnd: dates[dates.length - 1]
      }
    };
  },

  _mergeComplaint(parsed) {
    const rows = [];
    const files = [];
    let skipped = 0;
    parsed.forEach(p => {
      rows.push(...p.rows);
      files.push(p.meta.fileName);
      skipped += p.meta.skipped;
    });
    if (rows.length === 0) throw new Error('Tidak ada baris komplain yang valid.');
    const dates = rows.map(r => String(r.trxDate).slice(0, 10)).sort();
    return {
      kind: 'komplain',
      rows,
      meta: {
        fileName: files.length === 1 ? files[0] : files.length + ' file',
        fileCount: files.length,
        rowCount: rows.length,
        skipped,
        branches: Array.from(new Set(rows.map(r => r.store))),
        dateStart: dates[0],
        dateEnd: dates[dates.length - 1]
      }
    };
  },

  _parseSales(file, text) {
    const date = this.dateFromFileName(file.name);
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const table = doc.querySelector('table');
    if (!table) throw new Error('Tabel penjualan tidak ditemukan di "' + file.name + '".');
    const flat = this._salesHeaderMap(table);
    const storeIdx = flat.indexOf('toko');
    if (storeIdx < 0) throw new Error('Kolom "Toko" tidak ada di "' + file.name + '".');
    const idx = {};
    CONFIG.SALES_FIELDS.forEach(f => {
      const i = this._findColumn(flat, f);
      if (i < 0) throw new Error('Kolom "' + f.header + '" tidak ada di "' + file.name + '".');
      idx[f.key] = i;
    });

    const rows = [];
    let skipped = 0;
    const trs = table.querySelectorAll('tbody tr');
    trs.forEach(tr => {
      const cells = Array.from(tr.cells).map(td => td.textContent.trim());
      const branch = cells[storeIdx] || '';
      if (!branch || branch.toLowerCase() === 'total') return;
      if (cells.length < flat.length) { skipped++; return; }
      const row = { date, branch };
      CONFIG.SALES_FIELDS.forEach(f => { row[f.key] = this._num(cells[idx[f.key]]); });
      rows.push(row);
    });
    if (rows.length === 0) throw new Error('Tidak ada baris toko di "' + file.name + '".');
    return { kind: 'sales', rows, meta: { fileName: file.name, skipped } };
  },

  _salesHeaderMap(table) {
    const rows = table.querySelectorAll('thead tr');
    if (rows.length === 0) throw new Error('Baris header tabel tidak ditemukan.');
    const top = Array.from(rows[0].cells);
    const sub = rows.length > 1 ? Array.from(rows[1].cells) : [];
    const flat = [];
    let subPos = 0;
    top.forEach(cell => {
      const name = cell.textContent.trim().toLowerCase().replace(/\s+/g, ' ');
      const span = parseInt(cell.getAttribute('colspan') || '1', 10) || 1;
      if (span > 1) {
        for (let k = 0; k < span; k++) {
          const s = sub[subPos] ? sub[subPos].textContent.trim().toLowerCase().replace(/\s+/g, ' ') : String(k);
          flat.push(name + '|' + s);
          subPos++;
        }
      } else {
        flat.push(name);
      }
    });
    return flat;
  },

  _findColumn(flat, field) {
    const source = field.source;
    if (field.sub) return flat.indexOf(source + '|' + field.sub);
    let i = flat.indexOf(source);
    if (i >= 0) return i;
    i = flat.indexOf(source + '|penjualan');
    if (i >= 0) return i;
    return flat.findIndex(h => h.indexOf(source + '|') === 0);
  },

  dateFromFileName(name) {
    const raw = String(name);
    let found = (raw.match(/\d{4}-\d{1,2}-\d{1,2}/g) || []).map(v => this._fromParts(v.split('-')));
    if (found.length === 0) found = (raw.match(/\d{8}/g) || []).map(v => this._fromParts([v.slice(0, 4), v.slice(4, 6), v.slice(6, 8)]));
    const dates = Array.from(new Set(found.filter(Boolean))).sort();
    if (dates.length === 0) throw new Error('Tanggal tidak ada di nama file "' + name + '". Nama file harus memuat tanggal, contoh: Grand_Total_All_Store_2026-08-01_2026-08-01.xls');
    if (dates.length > 1) throw new Error('Nama file "' + name + '" memuat rentang tanggal ' + dates[0] + ' s/d ' + dates[dates.length - 1] + '. File harus data 1 hari.');
    return dates[0];
  },

  _fromParts(parts) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!(y >= 2000 && y <= 2999)) return null;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    const p = (n) => String(n).padStart(2, '0');
    return y + '-' + p(m) + '-' + p(d);
  },

  _num(v) {
    if (v == null) return 0;
    let s = String(v).replace(/[\s\u00a0]/g, '');
    if (!s) return 0;
    const neg = /^\(.*\)$/.test(s) || s.indexOf('-') === 0;
    s = s.replace(/[()\-]/g, '').replace(/\./g, '').replace(',', '.');
    const n = parseFloat(s);
    if (isNaN(n)) return 0;
    return neg ? -n : n;
  },

  _findComplaintHeader(aoa) {
    const has = (row, name) => row.some(c => typeof c === 'string' && c.trim().toLowerCase() === name);
    for (let i = 0; i < Math.min(aoa.length, 25); i++) {
      const r = aoa[i] || [];
      if (has(r, 'nama store') && has(r, 'media komplain')) return i;
    }
    return -1;
  },

  _parseComplaint(file, aoa, headerRow) {
    const header = aoa[headerRow].map(c => String(c || '').trim());
    const lower = header.map(h => h.toLowerCase());
    const cols = CONFIG.COMPLAINT_UPLOAD_COLUMNS
      .map(c => ({ ...c, idx: lower.indexOf(c.header.toLowerCase()) }))
      .filter(c => c.idx >= 0);

    const need = ['name', 'store', 'media', 'category', 'trxDate', 'body'];
    const missing = need.filter(k => !cols.some(c => c.key === k));
    if (missing.length) {
      const labels = CONFIG.COMPLAINT_UPLOAD_COLUMNS.filter(c => missing.includes(c.key)).map(c => c.header);
      throw new Error('Kolom wajib tidak ada di "' + file.name + '": ' + labels.join(', '));
    }

    const rows = [];
    let skipped = 0;
    for (let i = headerRow + 1; i < aoa.length; i++) {
      const r = aoa[i];
      if (!r) continue;
      const row = {};
      cols.forEach(c => {
        const raw = r[c.idx];
        row[c.key] = c.type === 'datetime' ? this._normalizeDateTime(raw) : this._text(raw);
      });
      if (!row.name && !row.store && !row.body) continue;
      if (!row.name || !row.store || !row.trxDate || !row.body) { skipped++; continue; }
      row.dedupKey = this.complaintKey(row);
      rows.push(row);
    }
    if (rows.length === 0) throw new Error('Tidak ada baris komplain yang valid di "' + file.name + '".');
    return { kind: 'komplain', rows, meta: { fileName: file.name, skipped } };
  },

  complaintKey(row) {
    const norm = (v) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase();
    if (norm(row.caseId)) return 'id:' + norm(row.caseId);
    return 'x:' + [norm(row.name), norm(row.store), String(row.trxDate || '').slice(0, 10), norm(row.body)].join('|');
  },

  _text(v) {
    if (v == null) return '';
    if (typeof v === 'number') return String(v);
    return String(v).replace(/\r\n/g, '\n').trim();
  },

  _normalizeDateTime(v) {
    if (v == null || v === '') return '';
    const p = (n) => String(n).padStart(2, '0');
    if (v instanceof Date) {
      const base = v.getFullYear() + '-' + p(v.getMonth() + 1) + '-' + p(v.getDate());
      return (v.getHours() || v.getMinutes()) ? base + 'T' + p(v.getHours()) + ':' + p(v.getMinutes()) : base;
    }
    if (typeof v === 'number') {
      const d = XLSX.SSF.parse_date_code(v);
      if (!d) return '';
      const base = d.y + '-' + p(d.m) + '-' + p(d.d);
      return (d.H || d.M) ? base + 'T' + p(d.H) + ':' + p(d.M) : base;
    }
    const str = String(v).trim();
    let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?$/);
    if (m) {
      const base = m[1] + '-' + p(m[2]) + '-' + p(m[3]);
      return m[4] ? base + 'T' + p(m[4]) + ':' + m[5] : base;
    }
    m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:[T ](\d{1,2}):(\d{2}))?$/);
    if (m) {
      const base = m[3] + '-' + p(m[2]) + '-' + p(m[1]);
      return m[4] ? base + 'T' + p(m[4]) + ':' + m[5] : base;
    }
    return '';
  }
};
