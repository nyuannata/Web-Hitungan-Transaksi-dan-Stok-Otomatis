import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  CheckCircle2,
  Boxes,
  Scissors,
  Users,
  Wallet,
  Download,
  Upload,
  RotateCcw,
  Shirt,
  Cloud,
  Settings,
  Eye,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MengudaraLogo } from './MengudaraLogo';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { data } = useApp();

  const activeOrdersCount = data.orders.filter((o) => o.status !== 'Selesai').length;
  const completedOrdersCount = data.orders.filter((o) => o.status === 'Selesai').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders_active', label: 'Orderan Masuk', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'orders_completed', label: 'Orderan Selesai', icon: CheckCircle2, badge: completedOrdersCount },
    { id: 'finance', label: 'Pemasukan & Pengeluaran', icon: Wallet },
    { id: 'stock', label: 'Stok Kaos & Kain', icon: Boxes },
    { id: 'leftovers', label: 'Lebihan Kain', icon: Scissors },
    { id: 'customers', label: 'Database Konsumen', icon: Users }
  ];

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'center', padding: '1.25rem 1rem 1rem 1rem', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.6rem 0.5rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
          <MengudaraLogo width={200} color="#000000" />
        </div>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div className="brand-subtitle" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase' }}>TRANSAKSI & STOK OTOMATIS</div>
        </div>
      </div>


      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const Topbar = ({ title }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    exportDataJSON,
    exportToExcel,
    importDataJSON,
    clearFinancialData,
    resetAllToZero,
    resetData,
    isCloudActive,
    firebaseConfig,
    updateFirebaseConfigKeys
  } = useApp();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [configForm, setConfigForm] = useState(firebaseConfig || {});
  const [showShowApiKey, setShowShowApiKey] = useState(false);

  const handleFileImport = (e) => {
    if (e.target.files && e.target.files[0]) {
      importDataJSON(e.target.files[0]);
    }
  };

  const handleSaveFirebaseKeys = (e) => {
    e.preventDefault();
    updateFirebaseConfigKeys(configForm);
    setShowConfigModal(false);
  };

  return (
    <>
      <header className="topbar no-print">
        <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{title}</span>
          <span
            className={`badge ${isCloudActive ? 'badge-success' : 'badge-warning'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Status Database Cloud Firebase Real-Time"
          >
            <Cloud size={12} />
            {isCloudActive ? 'Cloud Sync Aktif' : 'Mode Lokal (Offline)'}
          </span>
        </div>

        <div className="topbar-actions">
          <div className="month-selector">
            <span>Bulan Periode:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.2rem 0.5rem', height: '32px' }}
            />
          </div>

          <button className="btn btn-success btn-sm" onClick={exportToExcel} title="Ekspor Laporan Bulanan ke File Excel (.csv)">
            <FileSpreadsheet size={14} /> Ekspor Excel
          </button>

          <button className="btn btn-secondary btn-sm" onClick={exportDataJSON} title="Ekspor Cadangan Data JSON">
            <Download size={14} /> Ekspor JSON
          </button>

          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }} title="Impor Cadangan Data JSON">
            <Upload size={14} /> Impor
            <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowResetModal(true)} title="Pilihan Reset & Kosongkan Data">
            <RotateCcw size={14} /> Reset Data
          </button>
        </div>
      </header>
      {/* Reset Options Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={20} style={{ color: 'var(--primary)' }} /> Pilihan Reset & Kosongkan Data
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowResetModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Pilih aksi reset data sesuai kebutuhan usaha Anda:
              </p>

              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '1rem', textAlign: 'left', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }}
                onClick={() => {
                  clearFinancialData();
                  setShowResetModal(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>1. Kosongkan Pemasukan & Pengeluaran (Mulai dari Rp 0)</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Menghapus riwayat transaksi & pengeluaran agar hitungan saldo dan laporan laba-rugi dimulai bersih dari Rp 0.
                  </div>
                </div>
              </button>

              <button
                className="btn btn-danger"
                style={{ justifyContent: 'flex-start', padding: '1rem', textAlign: 'left' }}
                onClick={() => {
                  resetAllToZero();
                  setShowResetModal(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>2. Kosongkan SELURUH Data Usaha (Mulai dari 0)</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem' }}>
                    Menghapus seluruh transaksi, pengeluaran, sisa kain, dan mengosongkan stok kaos menjadi 0.
                  </div>
                </div>
              </button>

              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '1rem', textAlign: 'left' }}
                onClick={() => {
                  resetData();
                  setShowResetModal(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>3. Muat Ulang Data Contoh / Demo Awal</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Mengisi kembali aplikasi dengan data transaksi contoh untuk keperluan simulasi.
                  </div>
                </div>
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
