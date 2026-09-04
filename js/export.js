const Exporter = {
  _spec: null,
  _mode: 'summary',
  _keys: [],
  _file: null,
  _built: null,

  init(app) {
    this.app = app;
    const modal = document.getElementById('exportModal');
    if (!modal) return;
    modal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', () => { modal.hidden = true; });
    });
    modal.querySelectorAll('.export-mini').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this._spec) return;
        this._keys = btn.dataset.pick === 'all'
          ? this._spec.columns.map(c => c.key)
          : this._spec.defaultKeys.slice();
        this._renderCols();
        this._reset();
      });
    });
  },

  open(spec) {
    const t = (k, p) => this.app.t(k, p);
    if (!spec) { this.app._toast(t('export_empty')); return; }
    this._spec = spec;
    this._mode = 'summary';
    this._keys = spec.defaultKeys.slice();
    document.getElementById('exportTitle').textContent = t('export_title');
    document.getElementById('exportSub').textContent = spec.title + ' · ' + spec.period;
    this._renderModes();
    this._renderCols();
    this._renderFormats();
    this._reset();
    document.getElementById('exportModal').hidden = false;
  },

  _reset() {
    this._file = null;
    this._built = null;
    const status = document.getElementById('exportStatus');
    status.textContent = '';
    status.classList.remove('err');
    document.getElementById('exportStep2').hidden = true;
    this._renderSummary();
  },

  _renderModes() {
    const t = (k, p) => this.app.t(k, p);
    const box = document.getElementById('exportModes');
    const modes = [
      { key: 'summary', label: t('export_mode_summary') },
      { key: 'daily', label: t('export_mode_daily') }
    ];
    box.innerHTML = modes.map(m =>
      `<button class="export-seg-btn${m.key === this._mode ? ' active' : ''}" data-mode="${m.key}">${this.app._esc(m.label)}</button>`
    ).join('');
    box.querySelectorAll('.export-seg-btn').forEach(btn => {
      btn.onclick = () => {
        this._mode = btn.dataset.mode;
        this._renderModes();
        this._reset();
      };
    });
  },

  _renderCols() {
    const box = document.getElementById('exportCols');
    box.innerHTML = this._spec.columns.map(c =>
      `<button class="export-chip${this._keys.indexOf(c.key) >= 0 ? ' on' : ''}" data-key="${this.app._esc(c.key)}">${this.app._esc(c.label)}</button>`
    ).join('');
    box.querySelectorAll('.export-chip').forEach(chip => {
      chip.onclick = () => {
        const k = chip.dataset.key;
        const i = this._keys.indexOf(k);
        if (i >= 0) this._keys.splice(i, 1); else this._keys.push(k);
        chip.classList.toggle('on');
        this._reset();
      };
    });
  },

  _renderFormats() {
    const box = document.getElementById('exportFormats');
    box.innerHTML = CONFIG.EXPORT_FORMATS.map(f =>
      `<button class="export-fmt" data-fmt="${f.key}"><span class="export-fmt-name">${f.label}</span><span class="export-fmt-note">.${f.ext}</span></button>`
    ).join('');
    box.querySelectorAll('.export-fmt').forEach(btn => {
      btn.onclick = () => this._build(btn.dataset.fmt);
    });
  },

  _orderedKeys() {
    return this._spec.columns.map(c => c.key).filter(k => this._keys.indexOf(k) >= 0);
  },

  _dataset() {
    const keys = this._orderedKeys();
    if (!keys.length) return null;
    const built = this._spec.buildRows({ mode: this._mode, keys });
    return {
      title: this._spec.title,
      period: this._spec.period,
      sheetName: this._spec.sheetName,
      unit: this._spec.unit,
      fileBase: this._spec.fileBase + (this._mode === 'daily' ? '_harian' : ''),
      meta: built.meta,
      blocks: built.blocks,
      totals: built.totals
    };
  },

  _rowCount(ds) { return ds.blocks.reduce((n, b) => n + b.rows.length, 0); },

  _renderSummary() {
    const el = document.getElementById('exportSummary');
    const keys = this._orderedKeys();
    if (!keys.length) { el.textContent = this.app.t('export_need_column'); return; }
    this._built = this._dataset();
    const ds = this._built;
    const rows = this._rowCount(ds);
    if (this._mode === 'daily') {
      el.textContent = this.app.t('export_summary_daily', {
        n: ds.blocks.length,
        r: rows.toLocaleString(this.app._locale()),
        d: Math.max(ds.blocks[0].columns.length - 1, 0)
      });
      return;
    }
    el.textContent = this.app.t('export_summary', {
      r: rows.toLocaleString(this.app._locale()),
      c: ds.blocks[0].columns.length
    });
  },

  async _build(fmtKey) {
    const t = (k, p) => this.app.t(k, p);
    const fmt = CONFIG.EXPORT_FORMATS.find(f => f.key === fmtKey);
    const status = document.getElementById('exportStatus');
    const step2 = document.getElementById('exportStep2');
    const buttons = document.querySelectorAll('.export-fmt');
    status.classList.remove('err');
    if (!this._orderedKeys().length) {
      status.classList.add('err');
      status.textContent = t('export_need_column');
      return;
    }
    const ds = this._built || this._dataset();
    if (!ds || this._rowCount(ds) === 0) {
      status.classList.add('err');
      status.textContent = t('export_empty');
      return;
    }
    this._ds = ds;
    status.textContent = t('export_generating');
    step2.hidden = true;
    buttons.forEach(b => b.classList.add('busy'));
    try {
      const name = ds.fileBase + '.' + fmt.ext;
      const blob = fmtKey === 'xlsx' ? this._xlsx() : fmtKey === 'md' ? this._md() : await this._pdf();
      this._file = new File([blob], name, { type: fmt.mime });
      status.textContent = t('export_ready', { f: fmt.label });
      document.getElementById('exportFileName').textContent = name;
      step2.hidden = false;
      document.getElementById('exportDestLabel').textContent = t('export_dest');
      const dests = document.getElementById('exportDests');
      dests.innerHTML = [
        `<button class="btn btn-primary" data-dest="save">${this.app._esc(t('export_save'))}</button>`,
        `<button class="btn" data-dest="telegram">${this.app._esc(t('export_telegram'))}</button>`,
        `<button class="btn" data-dest="whatsapp">${this.app._esc(t('export_whatsapp'))}</button>`
      ].join('');
      dests.querySelectorAll('[data-dest]').forEach(b => {
        b.onclick = () => this._send(b.dataset.dest);
      });
    } catch (e) {
      status.classList.add('err');
      status.textContent = t('export_failed', { msg: e.message });
    } finally {
      buttons.forEach(b => b.classList.remove('busy'));
    }
  },

  async _send(dest) {
    const t = (k, p) => this.app.t(k, p);
    if (!this._file) return;
    if (dest === 'save') { this._download(); this.app._toast(t('export_saved')); return; }
    const text = this._summary();
    if (navigator.canShare && navigator.canShare({ files: [this._file] })) {
      try {
        await navigator.share({ files: [this._file], title: this._ds.title, text });
        this.app._toast(t('export_shared'));
        document.getElementById('exportModal').hidden = true;
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    this._download();
    const url = dest === 'telegram'
      ? 'https://t.me/share/url?url=' + encodeURIComponent(this._ds.title) + '&text=' + encodeURIComponent(text)
      : 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
    this.app._toast(t('export_share_unsupported'));
  },

  _download() {
    const url = URL.createObjectURL(this._file);
    const a = document.createElement('a');
    a.href = url;
    a.download = this._file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  },

  _summary() {
    const ds = this._ds;
    const lines = [ds.title, ds.period];
    ds.totals.forEach(tt => lines.push(tt.label + ': ' + tt.text));
    lines.push(this._rowCount(ds) + ' ' + ds.unit);
    lines.push(this._file.name);
    return lines.join('\n');
  },

  _cellText(col, v) {
    if (v == null) return '';
    if (col.type === 'money') return this._money(v);
    if (col.type === 'num') return this._num(v);
    return String(v);
  },

  _money(v) {
    const n = Math.round(Number(v) || 0);
    return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('id-ID');
  },

  _num(v) {
    const n = Number(v) || 0;
    return (Math.round(n * 100) / 100).toLocaleString('id-ID');
  },

  _xlsx() {
    const ds = this._ds;
    const aoa = [[ds.title]];
    ds.meta.forEach(m => aoa.push([m.label, m.value]));
    aoa.push([]);
    let width = 0;
    ds.blocks.forEach(b => {
      if (b.name) aoa.push([b.name]);
      aoa.push(b.columns.map(c => c.label));
      b.rows.forEach(r => aoa.push(r.map((v, i) => (b.columns[i].type === 'text' ? String(v == null ? '' : v) : Number(v) || 0))));
      aoa.push([]);
      width = Math.max(width, b.columns.length);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const first = ds.blocks[0].columns;
    ws['!cols'] = [];
    for (let i = 0; i < width; i++) {
      const c = first[i];
      ws['!cols'].push({ wch: !c || c.type === 'text' ? 26 : Math.max(12, String(c.label).length + 2) });
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ds.sheetName);
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([out], { type: CONFIG.EXPORT_FORMATS.find(f => f.key === 'xlsx').mime });
  },

  _md() {
    const ds = this._ds;
    const esc = (s) => String(s).replace(/\|/g, '\\|');
    const lines = ['# ' + ds.title, ''];
    ds.meta.forEach(m => lines.push('**' + m.label + ':** ' + m.value));
    ds.blocks.forEach(b => {
      lines.push('');
      if (b.name) { lines.push('## ' + b.name); lines.push(''); }
      lines.push('| ' + b.columns.map(c => esc(c.label)).join(' | ') + ' |');
      lines.push('| ' + b.columns.map(c => (c.type === 'text' ? ':---' : '---:')).join(' | ') + ' |');
      b.rows.forEach(r => {
        lines.push('| ' + r.map((v, i) => esc(this._cellText(b.columns[i], v))).join(' | ') + ' |');
      });
    });
    lines.push('');
    return new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  },

  async _pdf() {
    await this._loadPdfLibs();
    const ds = this._ds;
    const wide = Math.max.apply(null, ds.blocks.map(b => b.columns.length));
    const doc = new window.jspdf.jsPDF({ orientation: wide > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(ds.title, 32, 34);
    doc.setFontSize(9);
    doc.text(ds.meta.map(m => m.label + ': ' + m.value).join('   |   '), 32, 50, { maxWidth: doc.internal.pageSize.getWidth() - 64 });
    let y = 66;
    const MAX_COLS = 13;
    ds.blocks.forEach(b => {
      const chunks = [];
      if (b.columns.length <= MAX_COLS) chunks.push(b.columns.map((c, i) => i));
      else {
        for (let i = 1; i < b.columns.length; i += MAX_COLS - 1) {
          chunks.push([0].concat(b.columns.slice(i, i + MAX_COLS - 1).map((c, k) => i + k)));
        }
      }
      chunks.forEach((idxs, ci) => {
        const cols = idxs.map(i => b.columns[i]);
        const label = b.name ? b.name + (chunks.length > 1 ? ' (' + cols[1].label + ' – ' + cols[cols.length - 1].label + ')' : '') : '';
        if (label) {
          if (y > doc.internal.pageSize.getHeight() - 90) { doc.addPage(); y = 40; }
          doc.setFontSize(11);
          doc.text(label, 26, y + 10);
          y += 16;
        }
        doc.autoTable({
          head: [cols.map(c => c.label)],
          body: b.rows.map(r => idxs.map(i => this._cellText(b.columns[i], r[i]))),
          startY: y,
          margin: { left: 24, right: 24 },
          styles: { fontSize: cols.length > 10 ? 6 : 8, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { fillColor: [74, 144, 184], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [246, 246, 242] },
          columnStyles: cols.reduce((acc, c, i) => {
            acc[i] = { halign: c.type === 'text' ? 'left' : 'right' };
            return acc;
          }, {})
        });
        y = doc.lastAutoTable.finalY + 18;
      });
    });
    return doc.output('blob');
  },

  _loadPdfLibs() {
    if (this._pdfReady) return Promise.resolve();
    const load = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(this.app.t('export_lib_failed')));
      document.head.appendChild(s);
    });
    return CONFIG.PDF_LIBS.reduce((p, src) => p.then(() => load(src)), Promise.resolve())
      .then(() => { this._pdfReady = true; });
  }
};
