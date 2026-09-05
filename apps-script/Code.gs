

const SHEETS = { DATA: 'Data', REGIONAL: 'Regional', KEGIATAN: 'Kegiatan', KOMPLAIN: 'Komplain' };
const SALES_FIELDS = [
  ['bruto',             'Bruto',              ['bruto']],
  ['rataBruto',         'Rata-rata Bruto',    ['rata-rata bruto', 'rata rata bruto', 'rerata bruto']],
  ['dineIn',            'Dine In',            ['dine in', 'dinein']],
  ['dineInCu',          'Dine In CU',         ['dine in', 'dinein'], 'cu'],
  ['takeAway',          'Take Away',          ['take away', 'takeaway']],
  ['takeAwayCu',        'Take Away CU',       ['take away', 'takeaway'], 'cu'],
  ['goFood',            'GoFood',             ['gofood', 'go food']],
  ['goFoodCu',          'GoFood CU',          ['gofood', 'go food'], 'cu'],
  ['grabFood',          'GrabFood',           ['grabfood', 'grab food']],
  ['grabFoodCu',        'GrabFood CU',        ['grabfood', 'grab food'], 'cu'],
  ['shopeeFood',        'ShopeeFood',         ['shopeefood', 'shopee food']],
  ['shopeeFoodCu',      'ShopeeFood CU',      ['shopeefood', 'shopee food'], 'cu'],
  ['katering',          'Katering',           ['katering', 'catering']],
  ['kateringCu',        'Katering CU',        ['katering', 'catering'], 'cu'],
  ['totalCu',           'Total CU',           ['total cu', 'jumlah cu']],
  ['mdr',               'Mdr',                ['mdr']],
  ['diskonOnline',      'Diskon Online',      ['diskon online']],
  ['biayaOnline',       'Biaya Online',       ['biaya online']],
  ['biayaPemasaran',    'Biaya Pemasaran',    ['biaya pemasaran']],
  ['biayaPengemasan',   'Biaya Pengemasan',   ['biaya pengemasan']],
  ['selisihPembulatan', 'Selisih Pembulatan', ['selisih pembulatan']],
  ['selisihSetoran',    'Selisih Setoran',    ['selisih setoran']],
  ['diskon',            'Diskon',             ['diskon']],
  ['netto',             'Netto',              ['netto']],
  ['rataNetto',         'Rata-rata Netto',    ['rata-rata netto', 'rata rata netto', 'rerata netto']]
];
const SALES_DATE_ALIASES = ['tanggal', 'sales date', 'date'];
const SALES_BRANCH_ALIASES = ['nama toko', 'toko', 'nama store', 'branch name', 'branch'];
const HEADERS = {
  DATA:     ['Tanggal', 'Nama Toko'].concat(SALES_FIELDS.map(function (f) { return f[1]; })),
  REGIONAL: ['Regional', 'Area', 'Nama Toko'],

  KEGIATAN: ['Tanggal', 'Nama', 'Nama Toko', 'Kegiatan', 'Keterangan 1', 'Keterangan 2'],

  KOMPLAIN: ['Nama', 'Kontak', 'Alamat', 'Nama Store', 'Media Komplain', 'Kategori', 'Tanggal Transaksi', 'Isi Komplain']
};

const KOMPLAIN_FIELDS = [
  ['caseId',      'Case Id'],
  ['name',        'Nama'],
  ['contact',     'Kontak'],
  ['address',     'Alamat'],
  ['store',       'Nama Store'],
  ['media',       'Media Komplain'],
  ['category',    'Kategori'],
  ['trxDate',     'Tanggal Transaksi'],
  ['cmpDate',     'Tanggal Komplain'],
  ['body',        'Isi Komplain'],
  ['inputDate',   'Tanggal Input'],
  ['areaMgr',     'Area Manager'],
  ['regionalMgr', 'Regional Manager']
];

const KOMPLAIN_DATE_KEYS = ['trxDate', 'cmpDate', 'inputDate'];
const CELL_LIMIT = 10000000;

function doGet(e) {
  return _handle(e, (p) => {
    const a = p.action || 'status';
    if (a === 'fetchAll')      return { status: 'ok', data: _fetchAll() };
    if (a === 'fetchRegional') return { status: 'ok', data: _fetchRegional() };
    if (a === 'status')        return { status: 'ok', data: _status() };
    if (a === 'fetchKegiatan') return { status: 'ok', data: _fetchKegiatan() };
    if (a === 'fetchKomplain') return { status: 'ok', data: _fetchKomplain() };
    if (a === 'debug')         return { status: 'ok', debug: _debug() };
    throw new Error('Unknown action: ' + a);
  });
}

function doPost(e) {
  return _handle(e, () => {
    const b = JSON.parse(e.postData.contents);
    if (b.action === 'upload')         return { status: 'ok', data: _upload(b.rows || []) };
    if (b.action === 'addKegiatan')    return { status: 'ok', data: _addKegiatan(b.row || {}) };
    if (b.action === 'addKomplain')    return { status: 'ok', data: _addKomplain(b.row || {}) };
    if (b.action === 'uploadKomplain') return { status: 'ok', data: _uploadKomplain(b.rows || []) };
    throw new Error('Unknown action: ' + b.action);
  });
}

function _handle(e, fn) {
  try { return _json(fn((e && e.parameter) || {})); }
  catch (err) { return _json({ status: 'error', error: err.message, stack: (err.stack||'').split('\n').slice(0,3).join('\n') }); }
}

const SALES_SUB_HEADERS = ['penjualan', 'cu'];

function _norm(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase();
}

function _salesHeaderNames(sheet) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const rowCount = sheet.getMaxRows() > 1 ? 2 : 1;
  const raw = sheet.getRange(1, 1, rowCount, width).getValues();
  const top = raw[0].map(_norm);
  const sub = (raw[1] || []).map(_norm);
  const hasSubRow = sub.some(v => SALES_SUB_HEADERS.indexOf(v) >= 0);
  const names = [];
  let lastTop = '';
  for (let c = 0; c < width; c++) {
    if (top[c]) lastTop = top[c];
    const parent = top[c] || (hasSubRow && sub[c] ? lastTop : '');
    const child = hasSubRow ? sub[c] : '';
    names.push(child ? (parent ? parent + '|' + child : child) : parent);
  }
  return { width: width, names: names, headerRows: hasSubRow ? 2 : 1 };
}

function _salesIndex(sheet) {
  const h = _salesHeaderNames(sheet);
  const idx = {};
  h.names.forEach((n, i) => { if (n && idx[n] === undefined) idx[n] = i; });
  const pick = (aliases, sub) => {
    for (let i = 0; i < aliases.length; i++) {
      const a = aliases[i];
      if (sub) {
        if (idx[a + '|' + sub] !== undefined) return idx[a + '|' + sub];
        if (idx[a + ' ' + sub] !== undefined) return idx[a + ' ' + sub];
        continue;
      }
      if (idx[a] !== undefined) return idx[a];
      if (idx[a + '|penjualan'] !== undefined) return idx[a + '|penjualan'];
    }
    return undefined;
  };
  const col = { date: pick(SALES_DATE_ALIASES), branch: pick(SALES_BRANCH_ALIASES) };
  SALES_FIELDS.forEach(f => { col[f[0]] = pick(f[2], f[3]); });
  return { width: h.width, names: h.names, headerRows: h.headerRows, firstDataRow: h.headerRows + 1, col: col };
}

function _salesIndexEnsure(sheet) {
  const ix = _salesIndex(sheet);
  const need = [['date', HEADERS.DATA[0]], ['branch', HEADERS.DATA[1]]]
    .concat(SALES_FIELDS.map(f => [f[0], f[1]]));
  let width = ix.width;
  const addedHeaders = [];
  need.forEach(n => {
    if (ix.col[n[0]] !== undefined) return;
    width++;
    sheet.getRange(1, width, 1, 1).setValue(n[1]);
    ix.col[n[0]] = width - 1;
    addedHeaders.push(n[1]);
  });
  ix.width = width;
  ix.addedHeaders = addedHeaders;
  return ix;
}

function _fetchAll() {
  const sheet = _getSheetSoft(SHEETS.DATA, HEADERS.DATA);
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const ix = _salesIndex(sheet);
  if (ix.col.date === undefined || ix.col.branch === undefined) {
    throw new Error('Header sheet ' + SHEETS.DATA + ' tidak punya kolom ' + HEADERS.DATA[0] + ' & ' + HEADERS.DATA[1] + '.');
  }
  const rows = [];
  for (let i = ix.firstDataRow - 1; i < values.length; i++) {
    const r = values[i];
    if (!r[ix.col.date] || !r[ix.col.branch]) continue;
    const date = _normalizeDate(r[ix.col.date]);
    if (!date) continue;
    const row = { date: date, branch: String(r[ix.col.branch]).trim() };
    SALES_FIELDS.forEach(f => {
      const ci = ix.col[f[0]];
      row[f[0]] = ci === undefined ? 0 : (Number(r[ci]) || 0);
    });
    rows.push(row);
  }
  return rows;
}

function _fetchRegional() {
  const sheet = _getSheetSoft(SHEETS.REGIONAL, HEADERS.REGIONAL);
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const idx = _headerIndex(values[0]);
  const at = (name, fallback) => (idx[name] === undefined ? fallback : idx[name]);
  const rIdx = at('regional', 0);
  const aIdx = at('area', 1);
  const bIdx = idx['nama toko'] === undefined ? at('toko', 2) : idx['nama toko'];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[rIdx] || !r[bIdx]) continue;
    rows.push({
      regional: String(r[rIdx]).trim(),
      area: String(r[aIdx] === undefined ? '' : r[aIdx]).trim(),
      branch: String(r[bIdx]).trim()
    });
  }
  return rows;
}

function _status() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let totalCells = 0;
  const perSheet = {};
  sheets.forEach(s => {
    const c = s.getMaxRows() * s.getMaxColumns();
    totalCells += c;
    perSheet[s.getName()] = { rows: s.getLastRow(), cells: c };
  });
  const usage = totalCells / CELL_LIMIT;
  const dataSheet = ss.getSheetByName(SHEETS.DATA);
  let lastDate = null, rowCount = 0, dateSet = {};
  const dataIx = dataSheet ? _salesIndex(dataSheet) : null;
  if (dataSheet && dataIx && dataSheet.getLastRow() > dataIx.headerRows) {
    const dateCol = dataIx.col.date === undefined ? 0 : dataIx.col.date;
    const dates = dataSheet.getRange(dataIx.firstDataRow, dateCol + 1, dataSheet.getLastRow() - dataIx.headerRows, 1).getValues();
    for (const [v] of dates) {
      const d = _normalizeDate(v);
      if (d) {
        dateSet[d] = 1;
        if (!lastDate || d > lastDate) lastDate = d;
      }
    }
    rowCount = dataSheet.getLastRow() - dataIx.headerRows;
  }
  const distinctDates = Object.keys(dateSet).length;
  return {
    lastDate, rowCount, distinctDates,
    totalCells, cellLimit: CELL_LIMIT, usage,
    perSheet, timestamp: new Date().toISOString()
  };
}

function _debug() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets().map(s => ({ name: s.getName(), rows: s.getLastRow(), cols: s.getLastColumn(), maxRows: s.getMaxRows(), maxCols: s.getMaxColumns() }));
  return { spreadsheet: ss.getName(), id: ss.getId(), sheets: allSheets };
}

function _salesKey(date, branch) {
  const d = _normalizeDate(date) || String(date == null ? '' : date).trim();
  const b = String(branch == null ? '' : branch).replace(/\s+/g, ' ').trim().toLowerCase();
  return (d && b) ? d + '|' + b : '';
}

function _salesExistingRows(sheet, ix) {
  const map = {};
  if (ix.col.date === undefined || ix.col.branch === undefined) return map;
  if (sheet.getLastRow() <= ix.headerRows) return map;
  const values = sheet.getDataRange().getValues();
  for (let i = ix.firstDataRow - 1; i < values.length; i++) {
    const key = _salesKey(values[i][ix.col.date], values[i][ix.col.branch]);
    if (key && !map[key]) map[key] = { row: i + 1, values: values[i] };
  }
  return map;
}

function _round2(v) { return Math.round((Number(v) || 0) * 100) / 100; }

function _sameSalesValues(row, existing, ix) {
  if (!existing.values) return false;
  for (let i = 0; i < SALES_FIELDS.length; i++) {
    const ci = ix.col[SALES_FIELDS[i][0]];
    if (ci === undefined) continue;
    if (_round2(row[SALES_FIELDS[i][0]]) !== _round2(existing.values[ci])) return false;
  }
  return true;
}

function _writeSalesRows(sheet, ix, startRow, list, valuesOnly) {
  const head = valuesOnly ? [] : [{ key: 'date', col: ix.col.date }, { key: 'branch', col: ix.col.branch }];
  const targets = head
    .concat(SALES_FIELDS.map(f => ({ key: f[0], col: ix.col[f[0]] })))
    .sort((a, b) => a.col - b.col);
  const cell = (r, key) => {
    if (key === 'date') return String(r.date);
    if (key === 'branch') return String(r.branch);
    return Number(r[key]) || 0;
  };
  if (!valuesOnly) sheet.getRange(startRow, ix.col.date + 1, list.length, 1).setNumberFormat('@');
  let i = 0;
  while (i < targets.length) {
    let j = i;
    while (j + 1 < targets.length && targets[j + 1].col === targets[j].col + 1) j++;
    const block = targets.slice(i, j + 1);
    sheet.getRange(startRow, block[0].col + 1, list.length, block.length)
      .setValues(list.map(r => block.map(t => cell(r, t.key))));
    i = j + 1;
  }
}

function _upload(rows) {
  if (!rows || rows.length === 0) return { added: 0, updated: 0, skipped: 0, addedColumns: [] };
  const sheet = _getSheetSoft(SHEETS.DATA, HEADERS.DATA);
  const ix = _salesIndexEnsure(sheet);
  const existing = _salesExistingRows(sheet, ix);
  const fresh = [];
  const updates = [];
  let skipped = 0;
  rows.forEach(r => {
    const key = _salesKey(r.date, r.branch);
    if (!key) { skipped++; return; }
    const hit = existing[key];
    if (hit) {
      if (!hit.row || _sameSalesValues(r, hit, ix)) { skipped++; return; }
      updates.push({ row: hit.row, data: r });
      hit.values = null;
      hit.row = 0;
      return;
    }
    existing[key] = { row: 0, values: null };
    fresh.push(r);
  });

  if (fresh.length) _writeSalesRows(sheet, ix, sheet.getLastRow() + 1, fresh);
  updates.sort((a, b) => a.row - b.row);
  let i = 0;
  while (i < updates.length) {
    let j = i;
    while (j + 1 < updates.length && updates[j + 1].row === updates[j].row + 1) j++;
    _writeSalesRows(sheet, ix, updates[i].row, updates.slice(i, j + 1).map(u => u.data), true);
    i = j + 1;
  }
  return { added: fresh.length, updated: updates.length, skipped: skipped, addedColumns: ix.addedHeaders };
}

function _fetchKegiatan() {
  const sheet = _getSheetSoft(SHEETS.KEGIATAN, HEADERS.KEGIATAN);
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const idx = _headerIndex(values[0]);
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const date = _normalizeDate(_at(r, idx, 'tanggal'));
    const type = String(_at(r, idx, 'kegiatan') || '').trim();
    const name = String(_at(r, idx, 'nama') || '').trim();
    if (!date && !type && !name) continue;
    out.push({
      date: date || '',
      name: name,
      store: String(_at(r, idx, 'nama toko') || '').trim(),
      type: type,
      k1: String(_at(r, idx, 'keterangan 1') == null ? '' : _at(r, idx, 'keterangan 1')).trim(),
      k2: String(_at(r, idx, 'keterangan 2') == null ? '' : _at(r, idx, 'keterangan 2')).trim()
    });
  }
  return out;
}

function _addKegiatan(row) {
  const date = _normalizeDate(row.date);
  if (!date) throw new Error('Tanggal kegiatan tidak valid');
  if (!row.name)  throw new Error('Nama wajib diisi');
  if (!row.store) throw new Error('Nama Toko wajib diisi');
  if (!row.type)  throw new Error('Kegiatan wajib diisi');
  return _appendByHeader(SHEETS.KEGIATAN, HEADERS.KEGIATAN, {
    'tanggal':       date,
    'nama':          String(row.name).trim(),
    'nama toko':     String(row.store).trim(),
    'kegiatan':      String(row.type).trim(),
    'keterangan 1':  String(row.k1 == null ? '' : row.k1).trim(),
    'keterangan 2':  String(row.k2 == null ? '' : row.k2).trim()
  }, ['tanggal']);
}

function _fetchKomplain() {
  const sheet = _getSheetSoft(SHEETS.KOMPLAIN, HEADERS.KOMPLAIN);
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const idx = _headerIndex(values[0]);
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const name = String(_at(r, idx, 'nama') || '').trim();
    const store = String(_at(r, idx, 'nama store') || '').trim();
    if (!name && !store) continue;
    out.push({
      name: name,
      contact: String(_at(r, idx, 'kontak') || '').trim(),
      address: String(_at(r, idx, 'alamat') || '').trim(),
      store: store,
      media: String(_at(r, idx, 'media komplain') || '').trim(),
      category: String(_at(r, idx, 'kategori') || '').trim(),
      trxDate: _normalizeDate(_at(r, idx, 'tanggal transaksi')) || '',
      body: String(_at(r, idx, 'isi komplain') || '').trim()
    });
  }
  return out;
}

function _addKomplain(row) {
  const date = _normalizeDate(row.trxDate);
  if (!row.name)     throw new Error('Nama wajib diisi');
  if (!row.store)    throw new Error('Nama Store wajib diisi');
  if (!row.media)    throw new Error('Media Komplain wajib diisi');
  if (!row.category) throw new Error('Kategori wajib diisi');
  if (!date)         throw new Error('Tanggal Transaksi tidak valid');
  if (!row.body)     throw new Error('Isi Komplain wajib diisi');
  return _appendByHeader(SHEETS.KOMPLAIN, HEADERS.KOMPLAIN, {
    'nama':              String(row.name).trim(),
    'kontak':            String(row.contact == null ? '' : row.contact).trim(),
    'alamat':            String(row.address == null ? '' : row.address).trim(),
    'nama store':        String(row.store).trim(),
    'media komplain':    String(row.media).trim(),
    'kategori':          String(row.category).trim(),
    'tanggal transaksi': date,
    'isi komplain':      String(row.body).trim()
  }, ['tanggal transaksi']);
}

function _komplainKey(row) {
  const norm = (v) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase();
  if (norm(row.caseId)) return 'id:' + norm(row.caseId);
  return 'x:' + [norm(row.name), norm(row.store), String(row.trxDate || '').slice(0, 10), norm(row.body)].join('|');
}

function _komplainExistingKeys() {
  const sheet = _getSheetSoft(SHEETS.KOMPLAIN, HEADERS.KOMPLAIN);
  const set = {};
  if (sheet.getLastRow() < 2) return set;
  const values = sheet.getDataRange().getValues();
  const idx = _headerIndex(values[0]);
  const pick = {};
  KOMPLAIN_FIELDS.forEach(f => { pick[f[0]] = idx[f[1].toLowerCase()]; });
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const row = {};
    KOMPLAIN_FIELDS.forEach(f => {
      const ci = pick[f[0]];
      row[f[0]] = ci === undefined ? '' : r[ci];
    });
    if (!String(row.name || '').trim() && !String(row.store || '').trim()) continue;

    row.trxDate = _normalizeDate(row.trxDate) || String(row.trxDate || '');
    set[_komplainKey(row)] = true;
  }
  return set;
}

function _uploadKomplain(rows) {
  if (!rows || rows.length === 0) return { added: 0, skipped: 0 };
  const sheet = _getSheetSoft(SHEETS.KOMPLAIN, HEADERS.KOMPLAIN);
  const lastCol = Math.max(sheet.getLastColumn(), HEADERS.KOMPLAIN.length);
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const idx = _headerIndex(headerRow);

  let width = lastCol;
  KOMPLAIN_FIELDS.forEach(f => {
    const key = f[1].toLowerCase();

    const used = rows.some(r => String(r[f[0]] == null ? '' : r[f[0]]).trim() !== '');
    if (idx[key] === undefined && used) {
      width++;
      sheet.getRange(1, width, 1, 1).setValue(f[1]);
      idx[key] = width - 1;
    }
  });

  const existing = _komplainExistingKeys();
  const matrix = [];
  let skipped = 0;
  rows.forEach(r => {
    if (!String(r.name || '').trim() || !String(r.store || '').trim()) { skipped++; return; }
    if (existing[_komplainKey(r)]) { skipped++; return; }
    existing[_komplainKey(r)] = true;
    const line = new Array(width).fill('');
    KOMPLAIN_FIELDS.forEach(f => {
      const ci = idx[f[1].toLowerCase()];
      if (ci === undefined) return;
      const v = r[f[0]];
      line[ci] = v == null ? '' : String(v);
    });
    matrix.push(line);
  });
  if (matrix.length === 0) return { added: 0, skipped: skipped };

  const targetRow = sheet.getLastRow() + 1;

  KOMPLAIN_DATE_KEYS.forEach(k => {
    const header = (KOMPLAIN_FIELDS.filter(f => f[0] === k)[0] || [])[1];
    const ci = header ? idx[header.toLowerCase()] : undefined;
    if (ci !== undefined) sheet.getRange(targetRow, ci + 1, matrix.length, 1).setNumberFormat('@');
  });
  sheet.getRange(targetRow, 1, matrix.length, width).setValues(matrix);
  return { added: matrix.length, skipped: skipped };
}

function _normalizeDate(v) {
  if (v instanceof Date) {
    const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  }
  if (typeof v === 'string') {
    let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return m[1] + '-' + _pad(m[2]) + '-' + _pad(m[3]);
    m = v.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (m) return m[3] + '-' + _pad(m[2]) + '-' + _pad(m[1]);
    const d = new Date(v);
    if (!isNaN(d)) {
      const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
      return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
    }
  }
  return null;
}
function _pad(s) { return String(s).padStart(2, '0'); }
function _json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function _getSheetSoft(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.getRange(1, 1, 1, headers.length).setValues([headers]);
    s.setFrozenRows(1);
    return s;
  }
  if (s.getLastRow() === 0 || !String(s.getRange(1, 1).getValue()).trim()) {
    s.getRange(1, 1, 1, headers.length).setValues([headers]);
    s.setFrozenRows(1);
  }
  return s;
}

function _headerIndex(headerRow) {
  const map = {};
  (headerRow || []).forEach((h, i) => {
    const k = String(h == null ? '' : h).trim().toLowerCase();
    if (k && map[k] === undefined) map[k] = i;
  });
  return map;
}
function _at(row, idx, key) {
  const i = idx[key];
  return i === undefined ? '' : row[i];
}

function _appendByHeader(sheetName, defaultHeaders, valuesByHeader, textCols) {
  const sheet = _getSheetSoft(sheetName, defaultHeaders);
  const lastCol = Math.max(sheet.getLastColumn(), defaultHeaders.length);
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const idx = _headerIndex(headerRow);

  let width = lastCol;
  Object.keys(valuesByHeader).forEach(key => {
    if (idx[key] === undefined) {
      width++;
      const proper = defaultHeaders.filter(h => h.toLowerCase() === key)[0] || key;
      sheet.getRange(1, width, 1, 1).setValue(proper);
      idx[key] = width - 1;
    }
  });

  const line = new Array(width).fill('');
  Object.keys(valuesByHeader).forEach(key => { line[idx[key]] = valuesByHeader[key]; });

  const targetRow = sheet.getLastRow() + 1;

  (textCols || []).forEach(key => {
    if (idx[key] !== undefined) sheet.getRange(targetRow, idx[key] + 1, 1, 1).setNumberFormat('@');
  });
  sheet.getRange(targetRow, 1, 1, width).setValues([line]);
  return { added: 1, row: targetRow };
}
