const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwK__oY_oHekdQMCNsT71oDkqvXssb4UUaNQreEDM8-3wxkQ-wLGlYAcaA5593SwoNr/exec',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1acKbzLiz-fMC72_TxDsxbNCEv64b6DmA7B-Z-lga-J0/edit',

  SALES_TABLE_KEYS: [
    'bruto', 'dineIn', 'takeAway', 'shopeeFood', 'goFood', 'grabFood', 'katering',
    'mdr', 'diskonOnline', 'biayaOnline', 'biayaPemasaran', 'diskon', 'biayaPengemasan', 'netto'
  ],

  SALES_FIELDS: [
    { key: 'bruto',             header: 'Bruto',              source: 'bruto',              label: { id: 'Bruto',              en: 'Gross' } },
    { key: 'rataBruto',         header: 'Rata-rata Bruto',    source: 'rata-rata bruto',    label: { id: 'Rata-rata Bruto',    en: 'Avg Gross' }, agg: 'none' },
    { key: 'dineIn',            header: 'Dine In',            source: 'dine in',            label: { id: 'Dine In',            en: 'Dine In' },   group: 'offline' },
    { key: 'dineInCu',          header: 'Dine In CU',         source: 'dine in',            sub: 'cu', label: { id: 'CU Dine In',    en: 'Dine In CU' },    type: 'count' },
    { key: 'takeAway',          header: 'Take Away',          source: 'take away',          label: { id: 'Take Away',          en: 'Take Away' }, group: 'offline' },
    { key: 'takeAwayCu',        header: 'Take Away CU',       source: 'take away',          sub: 'cu', label: { id: 'CU Take Away',  en: 'Take Away CU' },  type: 'count' },
    { key: 'goFood',            header: 'GoFood',             source: 'gofood',             label: { id: 'GoFood',             en: 'GoFood' },    group: 'online' },
    { key: 'goFoodCu',          header: 'GoFood CU',          source: 'gofood',             sub: 'cu', label: { id: 'CU GoFood',     en: 'GoFood CU' },     type: 'count' },
    { key: 'grabFood',          header: 'GrabFood',           source: 'grabfood',           label: { id: 'GrabFood',           en: 'GrabFood' },  group: 'online' },
    { key: 'grabFoodCu',        header: 'GrabFood CU',        source: 'grabfood',           sub: 'cu', label: { id: 'CU GrabFood',   en: 'GrabFood CU' },   type: 'count' },
    { key: 'shopeeFood',        header: 'ShopeeFood',         source: 'shopeefood',         label: { id: 'ShopeeFood',         en: 'ShopeeFood' }, group: 'online' },
    { key: 'shopeeFoodCu',      header: 'ShopeeFood CU',      source: 'shopeefood',         sub: 'cu', label: { id: 'CU ShopeeFood', en: 'ShopeeFood CU' }, type: 'count' },
    { key: 'katering',          header: 'Katering',           source: 'katering',           label: { id: 'Katering',           en: 'Catering' },  group: 'catering' },
    { key: 'kateringCu',        header: 'Katering CU',        source: 'katering',           sub: 'cu', label: { id: 'CU Katering',   en: 'Catering CU' },   type: 'count' },
    { key: 'totalCu',           header: 'Total CU',           source: 'total cu',           label: { id: 'Total CU',           en: 'Total CU' },  type: 'count' },
    { key: 'mdr',               header: 'Mdr',                source: 'mdr',                label: { id: 'Mdr',                en: 'Mdr' } },
    { key: 'diskonOnline',      header: 'Diskon Online',      source: 'diskon online',      label: { id: 'Diskon Online',      en: 'Online Discount' } },
    { key: 'biayaOnline',       header: 'Biaya Online',       source: 'biaya online',       label: { id: 'Biaya Online',       en: 'Online Fee' } },
    { key: 'biayaPemasaran',    header: 'Biaya Pemasaran',    source: 'biaya pemasaran',    label: { id: 'Biaya Pemasaran',    en: 'Marketing Fee' } },
    { key: 'biayaPengemasan',   header: 'Biaya Pengemasan',   source: 'biaya pengemasan',   label: { id: 'Biaya Pengemasan',   en: 'Packaging Fee' } },
    { key: 'selisihPembulatan', header: 'Selisih Pembulatan', source: 'selisih pembulatan', label: { id: 'Selisih Pembulatan', en: 'Rounding Diff' } },
    { key: 'selisihSetoran',    header: 'Selisih Setoran',    source: 'selisih setoran',    label: { id: 'Selisih Setoran',    en: 'Deposit Diff' } },
    { key: 'diskon',            header: 'Diskon',             source: 'diskon',             label: { id: 'Diskon',             en: 'Discount' } },
    { key: 'netto',             header: 'Netto',              source: 'netto',              label: { id: 'Netto',              en: 'Net' } },
    { key: 'rataNetto',         header: 'Rata-rata Netto',    source: 'rata-rata netto',    label: { id: 'Rata-rata Netto',    en: 'Avg Net' }, agg: 'none' }
  ],

  SALES_GROUPS: [
    { key: 'offline',  label: { id: 'Offline',  en: 'Offline' } },
    { key: 'online',   label: { id: 'Online',   en: 'Online' } },
    { key: 'catering', label: { id: 'Katering', en: 'Catering' } }
  ],

  ACTIVITY_TYPES: [
    {
      key: 'FLD', label: { id: 'FLD', en: 'FLD' }, color: '#3B82C4',
      fields: [
        { slot: 'k1', type: 'text',   max: 80, label: { id: 'Nama TK',         en: 'Kindergarten name' } },
        { slot: 'k2', type: 'number', max: 6,  label: { id: 'Jumlah Peserta',  en: 'Participants' } }
      ]
    },
    {
      key: 'GCOM', label: { id: 'GCOM', en: 'GCOM' }, color: '#C9853A',
      fields: [
        { slot: 'k1', type: 'text',   max: 80, label: { id: 'Nama Komunitas',  en: 'Community name' } },
        { slot: 'k2', type: 'number', max: 6,  label: { id: 'Jumlah Peserta',  en: 'Participants' } }
      ]
    },
    {
      key: 'CX', label: { id: 'CX', en: 'CX' }, color: '#4F9E76',
      fields: [
        { slot: 'k1', type: 'textarea', max: 140, label: { id: 'Tujuan Kunjungan', en: 'Visit purpose' } }
      ]
    }
  ],

  COMPLAINT_MEDIA: ['WhatsApp', 'Instagram', 'Google Review', 'Aplikasi GoFood', 'Aplikasi GrabFood', 'Aplikasi ShopeeFood'],
  COMPLAINT_CATEGORIES: ['Kualitas Produk', 'Kurang Produk', 'Salah Produk', 'Kualitas Pelayanan', 'Kualitas Peralatan', 'Produk Kosong', 'Tidak Terima Struk'],
  COMPLAINT_LIMITS: { nama: 80, kontak: 40, alamat: 200, isi: 2000 },

  COMPLAINT_UPLOAD_COLUMNS: [
    { key: 'caseId',      header: 'Case Id',           type: 'text' },
    { key: 'name',        header: 'Nama',              type: 'text' },
    { key: 'contact',     header: 'Kontak',            type: 'text' },
    { key: 'address',     header: 'Alamat',            type: 'text' },
    { key: 'store',       header: 'Nama Store',        type: 'text' },
    { key: 'media',       header: 'Media Komplain',    type: 'text' },
    { key: 'category',    header: 'Kategori',          type: 'text' },
    { key: 'trxDate',     header: 'Tanggal Transaksi', type: 'datetime' },
    { key: 'cmpDate',     header: 'Tanggal Komplain',  type: 'datetime' },
    { key: 'body',        header: 'Isi Komplain',      type: 'text' },
    { key: 'inputDate',   header: 'Tanggal Input',     type: 'datetime' },
    { key: 'areaMgr',     header: 'Area Manager',      type: 'text' },
    { key: 'regionalMgr', header: 'Regional Manager',  type: 'text' }
  ],

  EXPORT_FORMATS: [
    { key: 'pdf',  label: 'PDF',  ext: 'pdf',  mime: 'application/pdf' },
    { key: 'xlsx', label: 'XLSX', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { key: 'md',   label: 'MD',   ext: 'md',   mime: 'text/markdown' }
  ],

  PDF_LIBS: [
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js'
  ],

  MONEY_FORMATS: {
    auto: { id: 'Otomatis', en: 'Auto' },
    full: { id: 'Penuh',    en: 'Full' }
  },

  LANGUAGES: {
    id: { id: 'Indonesia', en: 'Indonesian' },
    en: { id: 'Inggris',   en: 'English' }
  },

  PALETTES: {
    krem_biru: {
      type: 2, label: { id: 'Krem Biru', en: 'Cream Blue' }, themeColor: '#F7F4EC',
      vars: {
        '--bone':'#F7F4EC','--bone-2':'#FFFDF7','--ink':'#1F2937','--ink-2':'#5B6472','--ink-3':'#8A93A0',
        '--line':'#E8E2D3','--line-2':'#D8D2C3',
        '--sea':'#4A90B8','--sea-hover':'#3A7A9E','--sea-2':'#E6F0F6','--sea-3':'#C7DDEA',
        '--danger':'#B85A4A','--danger-bg':'#FBEAE8','--danger-fg':'#8B3A2B',
        '--warn-bg':'#FFF4E6','--warn-fg':'#8B6A20',
        '--success':'#4A90B8','--accent-2':'#4A90B8',
        '--profit':'#1E9E57','--loss':'#D33B2C'
      }
    },
    putih_hijau: {
      type: 2, label: { id: 'Putih Hijau', en: 'White Green' }, themeColor: '#FAFAF7',
      vars: {
        '--bone':'#FAFAF7','--bone-2':'#FFFFFF','--ink':'#1F2937','--ink-2':'#5B6472','--ink-3':'#8A93A0',
        '--line':'#EBEBE5','--line-2':'#D8D8D2',
        '--sea':'#4A9B7F','--sea-hover':'#3A7E67','--sea-2':'#EAF3EF','--sea-3':'#C6DFD3',
        '--danger':'#B85A4A','--danger-bg':'#FBEAE8','--danger-fg':'#8B3A2B',
        '--warn-bg':'#FFF4E6','--warn-fg':'#8B6A20',
        '--success':'#4A9B7F','--accent-2':'#4A9B7F',
        '--profit':'#1E9E57','--loss':'#D33B2C'
      }
    },
    gelap_biru: {
      type: 2, label: { id: 'Gelap Biru', en: 'Dark Blue' }, themeColor: '#1A1D21',
      vars: {
        '--bone':'#1A1D21','--bone-2':'#22262B','--ink':'#E8E6E0','--ink-2':'#A0A5AD','--ink-3':'#6C7178',
        '--line':'#2E3238','--line-2':'#3A3F46',
        '--sea':'#6BB0D9','--sea-hover':'#7CBFE6','--sea-2':'#1E3A4A','--sea-3':'#2A5570',
        '--danger':'#D97565','--danger-bg':'#3A1E1A','--danger-fg':'#F0A090',
        '--warn-bg':'#3A2F1A','--warn-fg':'#E8C888',
        '--success':'#6BB0D9','--accent-2':'#6BB0D9',
        '--profit':'#4ED18A','--loss':'#FF6F5E'
      }
    },

    krem_biru_koral: {
      type: 3, label: { id: 'Krem Biru Koral', en: 'Cream Blue Coral' }, themeColor: '#F7F4EC',
      vars: {
        '--bone':'#F7F4EC','--bone-2':'#FFFDF7','--ink':'#1F2937','--ink-2':'#5B6472','--ink-3':'#8A93A0',
        '--line':'#E8E2D3','--line-2':'#D8D2C3',
        '--sea':'#4A90B8','--sea-hover':'#3A7A9E','--sea-2':'#E6F0F6','--sea-3':'#C7DDEA',
        '--danger':'#B85A4A','--danger-bg':'#FBEAE8','--danger-fg':'#8B3A2B',
        '--warn-bg':'#FFF4E6','--warn-fg':'#8B6A20',
        '--success':'#D08B6C','--accent-2':'#D08B6C',
        '--profit':'#1E9E57','--loss':'#D33B2C'
      }
    },
    putih_sage_emas: {
      type: 3, label: { id: 'Putih Sage Emas', en: 'White Sage Gold' }, themeColor: '#FAFAF7',
      vars: {
        '--bone':'#FAFAF7','--bone-2':'#FFFFFF','--ink':'#1F2937','--ink-2':'#5B6472','--ink-3':'#8A93A0',
        '--line':'#EBEBE5','--line-2':'#D8D8D2',
        '--sea':'#7A9B8B','--sea-hover':'#5F8272','--sea-2':'#EAF1ED','--sea-3':'#CFDDD5',
        '--danger':'#B85A4A','--danger-bg':'#FBEAE8','--danger-fg':'#8B3A2B',
        '--warn-bg':'#FFF4E6','--warn-fg':'#8B6A20',
        '--success':'#C9A96E','--accent-2':'#C9A96E',
        '--profit':'#1E9E57','--loss':'#D33B2C'
      }
    },
    gelap_teal_salmon: {
      type: 3, label: { id: 'Gelap Teal Salmon', en: 'Dark Teal Salmon' }, themeColor: '#1E2226',
      vars: {
        '--bone':'#1E2226','--bone-2':'#262B30','--ink':'#E8E6E0','--ink-2':'#A0A5AD','--ink-3':'#6C7178',
        '--line':'#2E3238','--line-2':'#3A3F46',
        '--sea':'#5DB5B5','--sea-hover':'#6EC4C4','--sea-2':'#1E3A3A','--sea-3':'#2A5555',
        '--danger':'#D97565','--danger-bg':'#3A1E1A','--danger-fg':'#F0A090',
        '--warn-bg':'#3A2F1A','--warn-fg':'#E8C888',
        '--success':'#E8998C','--accent-2':'#E8998C',
        '--profit':'#4ED18A','--loss':'#FF6F5E'
      }
    }
  },

  FONT_OPTIONS: {
    default:   { label: { id: 'Default (sistem)', en: 'Default (system)' }, stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif" },
    rounded:   { label: { id: 'Bulat',            en: 'Rounded' },          stack: "'SF Pro Rounded', 'Nunito', 'Quicksand', ui-rounded, system-ui, sans-serif" },
    serif:     { label: { id: 'Klasik',           en: 'Serif' },            stack: "'Iowan Old Style', 'Georgia', 'Times New Roman', serif" },
    mono:      { label: { id: 'Monospace',        en: 'Monospace' },        stack: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace" },
    condensed: { label: { id: 'Rapat',            en: 'Condensed' },        stack: "'Roboto Condensed', 'PT Sans Narrow', 'Segoe UI', system-ui, sans-serif" }
  },

  I18N: {
    id: {
      nav_dashboard: 'Dasbor', nav_sales: 'Penjualan', nav_activity: 'Kegiatan', nav_complaint: 'Komplain',
      nav_upload: 'Upload data', nav_settings: 'Pengaturan',
      close: 'Tutup', cancel: 'Batal', reset: 'Reset', ok: 'OK', save: 'Simpan', saving: 'Menyimpan...',
      search_placeholder: 'Cari...', no_result: 'Tidak ada hasil',
      chars_left: '{n} karakter lagi',

      loading: 'Memuat data',

      total_sales: 'Total penjualan', click_for_detail: 'Klik untuk detail', prev_month: 'bulan lalu',

      sales_regional: 'Penjualan Regional', sales_area: 'Penjualan Area', sales_store: 'Penjualan Toko',

      sort_name: 'Nama ▾', sort_largest: 'Terbesar ▾', sort_smallest: 'Terkecil ▾',

      view_simple: 'Simpel ▾', view_full: 'Penuh ▾',

      trend_daily: 'Harian', trend_weekly: 'Mingguan', trend_monthly: 'Bulanan',
      trend_title: 'Tren', trend_current: 'Periode ini', trend_prev: 'Bulan lalu',
      trend_prev_year: 'Tahun lalu',
      trend_compare_hint: 'Ketuk grafik untuk perbandingan',
      trend_compare_title: 'Perbandingan',
      trend_week_prefix: 'M',

      top10: '10 Toko penjualan tertinggi', low10: '10 Toko penjualan terendah',

      top10_cmp: '10 Toko komplain tertinggi', cmp_unit: 'komplain',

      dd_all_regionals: 'Semua regional',
      setting_regional_access: 'Regional yang bisa diakses',
      setting_regional_access_note: 'Kosong = semua regional bisa diakses. Kalau hanya 1 regional yang dipilih, filter regional di Dasbor, Penjualan, Komplain, dan Kegiatan otomatis disembunyikan.',
      dd_all_stores: 'Semua toko', dd_n_selected: '{n} toko dipilih',
      dd_select_all: 'Pilih semua', dd_clear: 'Kosongkan',

      trend_yearly: 'Tahunan',

      cmp_per_store: 'Komplain per toko', cmp_other_cat: 'Lainnya',
      tbl_scroll_hint: 'Geser tabel ke samping untuk melihat semua kolom',
      cmp_store_title: 'Komplain {store}',
      sort_most: 'Terbanyak ▾', sort_least: 'Tersedikit ▾',

      tbl_name: 'Nama',
      tbl_total: 'Total', tbl_growth: 'Pertumbuhan',

      regional: 'Regional', area: 'Area', store: 'Toko', all: 'Semua',

      detail: 'Detail', difference: 'Selisih', growth: 'Pertumbuhan',
      no_data: 'Tidak ada data.',

      filter_period: 'Filter periode', date_range: 'Rentang tanggal',
      pick_date_placeholder: 'Pilih tanggal...', pick_range: 'Pilih rentang tanggal',
      click_first_date: 'Klik tanggal pertama untuk "Dari"',
      from_prefix: 'Dari: ', click_to_date: ' — Klik tanggal untuk "Sampai"',

      setting_theme: 'Tema', setting_language: 'Bahasa', setting_money: 'Format uang',
      setting_text: 'Format text', setting_info: 'Info data', setting_storage: 'Penyimpanan',
      setting_source: 'Sumber data', setting_app: 'Aplikasi', setting_version: 'Versi',
      setting_cache_app: 'Cache app', setting_status: 'Status', setting_last_date: 'Data terakhir',
      setting_row_count: 'Total baris', setting_days: 'Hari tersimpan', setting_active_stores: 'Toko aktif',
      setting_cache: 'Cache', setting_reload: 'Muat ulang data', setting_open_sheet: 'Buka Spreadsheet',
      setting_clear_cache: 'Bersihkan', setting_connected: 'Terhubung', setting_not_connected: 'Belum terhubung',
      days_suffix: 'hari', stores_suffix: 'toko',

      upload_title: 'Upload data', upload_drag: 'Tarik file ke sini', upload_or: 'atau',
      upload_pick: 'Pilih file', upload_processing: 'Memproses...',

      upload_all: 'Upload semua',

      upload_progress: 'Upload {a} / {b}',
      upload_done: 'Selesai. {n} baris ditambahkan.',
      upload_success: 'Upload berhasil', upload_fail_title: 'Upload gagal',
      upload_fail_process: 'Gagal memproses file',

      upload_kind_sales: 'Penjualan', upload_kind_complaint: 'Komplain',
      upload_detected: 'Terdeteksi file {k}',
      upload_skipped_rows: '{n} baris dilewati karena datanya tidak lengkap/tidak valid.',
      upload_complaints_suffix: 'komplain',
      upload_ready: '{n} baris siap diupload. Baris yang sudah ada (tanggal + toko sama) otomatis dilewati.',
      upload_split: '{a} baru · {b} sudah ada di spreadsheet',
      upload_done_complaint: '{n} komplain ditambahkan.',
      upload_dup_skipped: '{n} duplikat dilewati.',
      upload_none_added: 'Tidak ada data baru — semua baris sudah ada di spreadsheet.',
      upload_redeploy_hint: 'Apps Script masih versi lama. Copy ulang Code.gs, lalu Deploy → Manage deployments → Version: New version → Deploy.',

      toast_cache_cleared: 'Cache dibersihkan. Refresh halaman.',
      toast_cache_loading: 'Data cache · memuat versi terbaru...',
      toast_load_failed: 'Gagal update: {msg}',
      splash_failed: 'Gagal: {msg}',

      pct_used: '{p}% terpakai',

      act_add: 'Tambahkan kegiatan', act_calendar: 'Kalender kegiatan', act_list: 'Daftar kegiatan',
      act_form_title: 'Tambahkan kegiatan', act_name: 'Nama', act_date: 'Tanggal',
      act_store: 'Toko', act_type: 'Kegiatan',
      act_pick_store: 'Pilih toko', act_pick_type: 'Pilih kegiatan',
      act_saved: 'Kegiatan tersimpan', act_save_failed: 'Gagal menyimpan kegiatan',

      act_count: '{n} kegiatan', act_none: 'Belum ada kegiatan pada filter ini.',
      act_day_title: 'Kegiatan {date}',
      act_reload: 'Muat ulang kegiatan',
      act_err_name: 'Nama wajib diisi.', act_err_date: 'Tanggal wajib diisi.',
      act_err_store: 'Toko wajib dipilih.', act_err_type: 'Kegiatan wajib dipilih.',
      act_err_field: '{f} wajib diisi.',

      cmp_add: 'Tambahkan komplain', cmp_form_title: 'Tambahkan komplain',
      cmp_name: 'Nama', cmp_contact: 'Kontak', cmp_address: 'Alamat', cmp_store: 'Nama Store',
      cmp_media: 'Media Komplain', cmp_category: 'Kategori',
      cmp_trx_date: 'Tanggal Transaksi', cmp_body: 'Isi Komplain',
      cmp_pick_media: 'Pilih media', cmp_pick_category: 'Pilih kategori',
      cmp_saved: 'Komplain tersimpan', cmp_save_failed: 'Gagal menyimpan komplain',
      cmp_count: '{n} komplain',
      cmp_none: 'Belum ada komplain pada filter ini.',
      cmp_reload: 'Muat ulang komplain',
      cmp_err_name: 'Nama wajib diisi.', cmp_err_store: 'Nama Store wajib dipilih.',
      cmp_err_media: 'Media Komplain wajib dipilih.', cmp_err_category: 'Kategori wajib dipilih.',
      cmp_err_date: 'Tanggal Transaksi wajib diisi.', cmp_err_body: 'Isi Komplain wajib diisi.',

      export_btn: 'Export ▾', export_title: 'Export data', export_format: 'Format file',
      export_mode: 'Rekap', export_mode_summary: 'Rekap periode', export_mode_daily: 'Per tanggal',
      export_columns: 'Kolom', export_pick_all: 'Semua', export_pick_default: 'Bawaan',
      export_summary: '{r} baris · {c} kolom', export_need_column: 'Pilih minimal 1 kolom.',
      export_col_date: 'Tanggal',
      export_dest: 'Kirim ke', export_save: 'Simpan file', export_telegram: 'Telegram',
      export_whatsapp: 'WhatsApp', export_generating: 'Menyiapkan file...',
      export_ready: 'File {f} siap.', export_saved: 'File tersimpan',
      export_shared: 'File dikirim', export_share_unsupported: 'Perangkat ini tidak bisa mengirim file langsung. File sudah tersimpan, lampirkan manual di chat yang terbuka.',
      export_failed: 'Export gagal: {msg}', export_lib_failed: 'Gagal memuat pembuat PDF. Butuh internet untuk export PDF.',
      export_empty: 'Tidak ada data untuk diexport.',
      export_period: 'Periode',
      upload_new_columns: '{n} kolom baru ditambahkan di sheet: {list}.',
      bruto: 'Bruto', netto: 'Netto', rows_suffix: 'baris', upload_file_count: '{n} file',
      months_short: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
      months_full:  ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
      days_short:   ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
    },
    en: {
      nav_dashboard: 'Dashboard', nav_sales: 'Sales', nav_activity: 'Activity', nav_complaint: 'Complaint',
      nav_upload: 'Upload data', nav_settings: 'Settings',
      close: 'Close', cancel: 'Cancel', reset: 'Reset', ok: 'OK', save: 'Save', saving: 'Saving...',
      search_placeholder: 'Search...', no_result: 'No result',
      chars_left: '{n} characters left',

      loading: 'Loading data',

      total_sales: 'Total sales', click_for_detail: 'Tap for detail', prev_month: 'last month',

      sales_regional: 'Regional sales', sales_area: 'Area sales', sales_store: 'Store sales',

      sort_name: 'Name ▾', sort_largest: 'Largest ▾', sort_smallest: 'Smallest ▾',

      view_simple: 'Simple ▾', view_full: 'Full ▾',

      trend_daily: 'Daily', trend_weekly: 'Weekly', trend_monthly: 'Monthly',
      trend_title: 'Trend', trend_current: 'This period', trend_prev: 'Last month',
      trend_prev_year: 'Last year',
      trend_compare_hint: 'Tap chart to compare',
      trend_compare_title: 'Comparison',
      trend_week_prefix: 'W',

      top10: 'Top 10 stores by sales', low10: 'Bottom 10 stores by sales',

      top10_cmp: 'Top 10 stores by complaints', cmp_unit: 'complaints',

      dd_all_regionals: 'All regionals',
      setting_regional_access: 'Accessible regionals',
      setting_regional_access_note: 'Empty = every regional is accessible. When only 1 regional is selected, the regional filter on Dashboard, Sales, Complaint, and Activity is hidden automatically.',
      dd_all_stores: 'All stores', dd_n_selected: '{n} stores selected',
      dd_select_all: 'Select all', dd_clear: 'Clear',

      trend_yearly: 'Yearly',

      cmp_per_store: 'Complaints per store', cmp_other_cat: 'Other',
      tbl_scroll_hint: 'Swipe the table sideways to see all columns',
      cmp_store_title: 'Complaints · {store}',
      sort_most: 'Most ▾', sort_least: 'Fewest ▾',

      tbl_name: 'Name',
      tbl_total: 'Total', tbl_growth: 'Growth',

      regional: 'Regional', area: 'Area', store: 'Store', all: 'All',

      detail: 'Detail', difference: 'Difference', growth: 'Growth',
      no_data: 'No data.',

      filter_period: 'Filter period', date_range: 'Date range',
      pick_date_placeholder: 'Pick a date...', pick_range: 'Pick date range',
      click_first_date: 'Click the first date for "From"',
      from_prefix: 'From: ', click_to_date: ' — Click a date for "To"',

      setting_theme: 'Theme', setting_language: 'Language', setting_money: 'Money format',
      setting_text: 'Text style', setting_info: 'Data info', setting_storage: 'Storage',
      setting_source: 'Data source', setting_app: 'Application', setting_version: 'Version',
      setting_cache_app: 'App cache', setting_status: 'Status', setting_last_date: 'Last data',
      setting_row_count: 'Total rows', setting_days: 'Days stored', setting_active_stores: 'Active stores',
      setting_cache: 'Cache', setting_reload: 'Reload data', setting_open_sheet: 'Open Spreadsheet',
      setting_clear_cache: 'Clear', setting_connected: 'Connected', setting_not_connected: 'Not connected',
      days_suffix: 'days', stores_suffix: 'stores',

      upload_title: 'Upload data', upload_drag: 'Drag file here', upload_or: 'or',
      upload_pick: 'Pick file', upload_processing: 'Processing...',

      upload_all: 'Upload all',

      upload_progress: 'Uploading {a} / {b}',
      upload_done: 'Done. {n} rows added.',
      upload_success: 'Upload successful', upload_fail_title: 'Upload failed',
      upload_fail_process: 'Failed to process file',

      upload_kind_sales: 'Sales', upload_kind_complaint: 'Complaint',
      upload_detected: 'Detected {k} file',
      upload_skipped_rows: '{n} rows skipped because the data was incomplete/invalid.',
      upload_complaints_suffix: 'complaints',
      upload_ready: '{n} rows ready to upload. Existing rows (same date + store) are skipped automatically.',
      upload_split: '{a} new · {b} already in the spreadsheet',
      upload_done_complaint: '{n} complaints added.',
      upload_dup_skipped: '{n} duplicates skipped.',
      upload_none_added: 'No new data — every row already exists in the spreadsheet.',
      upload_redeploy_hint: 'The Apps Script is still an old version. Re-copy Code.gs, then Deploy → Manage deployments → Version: New version → Deploy.',

      toast_cache_cleared: 'Cache cleared. Refresh the page.',
      toast_cache_loading: 'Cached data · loading latest...',
      toast_load_failed: 'Update failed: {msg}',
      splash_failed: 'Failed: {msg}',

      pct_used: '{p}% used',

      act_add: 'Add activity', act_calendar: 'Activity calendar', act_list: 'Activity list',
      act_form_title: 'Add activity', act_name: 'Name', act_date: 'Date',
      act_store: 'Store', act_type: 'Activity',
      act_pick_store: 'Pick a store', act_pick_type: 'Pick an activity',
      act_saved: 'Activity saved', act_save_failed: 'Failed to save activity',

      act_count: '{n} activities', act_none: 'No activity matches this filter.',
      act_day_title: 'Activities on {date}',
      act_reload: 'Reload activities',
      act_err_name: 'Name is required.', act_err_date: 'Date is required.',
      act_err_store: 'Store is required.', act_err_type: 'Activity is required.',
      act_err_field: '{f} is required.',

      cmp_add: 'Add complaint', cmp_form_title: 'Add complaint',
      cmp_name: 'Name', cmp_contact: 'Contact', cmp_address: 'Address', cmp_store: 'Store name',
      cmp_media: 'Complaint media', cmp_category: 'Category',
      cmp_trx_date: 'Transaction date', cmp_body: 'Complaint detail',
      cmp_pick_media: 'Pick media', cmp_pick_category: 'Pick category',
      cmp_saved: 'Complaint saved', cmp_save_failed: 'Failed to save complaint',
      cmp_count: '{n} complaints',
      cmp_none: 'No complaint matches this filter.',
      cmp_reload: 'Reload complaints',
      cmp_err_name: 'Name is required.', cmp_err_store: 'Store name is required.',
      cmp_err_media: 'Complaint media is required.', cmp_err_category: 'Category is required.',
      cmp_err_date: 'Transaction date is required.', cmp_err_body: 'Complaint detail is required.',

      export_btn: 'Export ▾', export_title: 'Export data', export_format: 'File format',
      export_mode: 'Summary', export_mode_summary: 'Period summary', export_mode_daily: 'Per date',
      export_columns: 'Columns', export_pick_all: 'All', export_pick_default: 'Default',
      export_summary: '{r} rows · {c} columns', export_need_column: 'Pick at least 1 column.',
      export_col_date: 'Date',
      export_dest: 'Send to', export_save: 'Save file', export_telegram: 'Telegram',
      export_whatsapp: 'WhatsApp', export_generating: 'Preparing file...',
      export_ready: 'File {f} is ready.', export_saved: 'File saved',
      export_shared: 'File sent', export_share_unsupported: 'This device cannot share files directly. The file has been saved, attach it manually in the chat that opened.',
      export_failed: 'Export failed: {msg}', export_lib_failed: 'Failed to load the PDF builder. PDF export needs internet.',
      export_empty: 'No data to export.',
      export_period: 'Period',
      upload_new_columns: '{n} new columns added to the sheet: {list}.',
      bruto: 'Gross', netto: 'Net', rows_suffix: 'rows', upload_file_count: '{n} files',
      months_short: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      months_full:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
      days_short:   ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    }
  }
};
