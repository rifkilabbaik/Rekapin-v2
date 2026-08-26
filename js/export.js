const Exporter = {
  _ds: null,
  _file: null,

  init(app) {
    this.app = app;
    const modal = document.getElementById('exportModal');
    if (!modal) return;
    modal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', () => { modal.hidden = true; });
    });
  },

  open(dataset) {
    const t = (k, p) => this.app.t(k, p);
    if (!dataset || dataset.rows.length === 0) { this.app._toast(t('export_empty')); return; }
    this._ds = dataset;
    this._file = null;
    const modal = document.getElementById('exportModal');
    document.getElementById('exportTitle').textContent = t('export_title');
    document.getElementById('exportSub').textContent = dataset.title + ' · ' + dataset.period;
    const fmt = document.getElementById('exportFormats');
    fmt.innerHTML = CONFIG.EXPORT_FORMATS
      .map(f => `<button class="export-fmt" data-fmt="${f.key}">${f.label}</button>`).join('');
    fmt.querySelectorAll('.export-fmt').forEach(btn => {
      btn.onclick = () => this._build(btn.dataset.fmt);
    });
    document.getElementById('exportStep2').hidden = true;
    document.getElementById('exportStatus').textContent = '';
    modal.hidden = false;
  },

  async _build(fmtKey) {
    const t = (k, p) => this.app.t(k, p);
    const fmt = CONFIG.EXPORT_FORMATS.find(f => f.key === fmtKey);
    const status = document.getElementById('exportStatus');
    const step2 = document.getElementById('exportStep2');
    status.textContent = t('export_generating');
    step2.hidden = true;
    try {
      const name = this._ds.fileBase + '.' + fmt.ext;
      const blob = fmtKey === 'xlsx' ? this._xlsx() : fmtKey === 'md' ? this._md() : await this._pdf();
      this._file = new File([blob], name, { type: fmt.mime });
      status.textContent = t('export_ready', { f: name });
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
      status.textContent = t('export_failed', { msg: e.message });
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
    lines.push(ds.rows.length + ' ' + ds.unit);
    lines.push(this._file.name);
    return lines.join('\n');
  },

  _cellText(col, v) {
    if (v == null) return '';
    if (col.type === 'money') return this._money(v);
    if (col.type === 'num') return Number(v).toLocaleString('id-ID');
    return String(v);
  },

  _money(v) {
    const n = Math.round(Number(v) || 0);
    return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('id-ID');
  },

  _xlsx() {
    const ds = this._ds;
    const aoa = [[ds.title], [ds.period]];
    ds.totals.forEach(tt => aoa.push([tt.label, tt.value]));
    aoa.push([]);
    aoa.push(ds.columns.map(c => c.label));
    ds.rows.forEach(r => aoa.push(r.map((v, i) => (ds.columns[i].type === 'text' ? String(v == null ? '' : v) : Number(v) || 0))));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = ds.columns.map((c, i) => ({ wch: i === 0 ? 28 : Math.max(12, c.label.length + 2) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ds.sheetName);
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([out], { type: CONFIG.EXPORT_FORMATS.find(f => f.key === 'xlsx').mime });
  },

  _md() {
    const ds = this._ds;
    const esc = (s) => String(s).replace(/\|/g, '\\|');
    const lines = ['# ' + ds.title, '', '**' + this.app.t('export_period') + ':** ' + ds.period];
    ds.totals.forEach(tt => lines.push('**' + tt.label + ':** ' + tt.text));
    lines.push('');
    lines.push('| ' + ds.columns.map(c => esc(c.label)).join(' | ') + ' |');
    lines.push('| ' + ds.columns.map(c => (c.type === 'text' ? ':---' : '---:')).join(' | ') + ' |');
    ds.rows.forEach(r => {
      lines.push('| ' + r.map((v, i) => esc(this._cellText(ds.columns[i], v))).join(' | ') + ' |');
    });
    lines.push('');
    return new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  },

  async _pdf() {
    await this._loadPdfLibs();
    const ds = this._ds;
    const jsPDFCtor = window.jspdf.jsPDF;
    const doc = new jsPDFCtor({ orientation: ds.columns.length > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(ds.title, 32, 34);
    doc.setFontSize(9);
    const head = [this.app.t('export_period') + ': ' + ds.period]
      .concat(ds.totals.map(tt => tt.label + ': ' + tt.text));
    doc.text(head.join('   |   '), 32, 50);
    doc.autoTable({
      head: [ds.columns.map(c => c.label)],
      body: ds.rows.map(r => r.map((v, i) => this._cellText(ds.columns[i], v))),
      startY: 62,
      margin: { left: 24, right: 24 },
      styles: { fontSize: ds.columns.length > 10 ? 6 : 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [74, 144, 184], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [246, 246, 242] },
      columnStyles: ds.columns.reduce((acc, c, i) => {
        acc[i] = { halign: c.type === 'text' ? 'left' : 'right' };
        return acc;
      }, {})
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
