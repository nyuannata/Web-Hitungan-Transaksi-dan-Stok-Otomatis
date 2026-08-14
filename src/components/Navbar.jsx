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
  Settings
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
    importDataJSON,
    resetData,
    isCloudActive,
    firebaseConfig,
    updateFirebaseConfigKeys
  } = useApp();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState(firebaseConfig || {});

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
    <header className="topbar no-print">
      <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>{title}</span>
        <button
          className={`badge ${isCloudActive ? 'badge-success' : 'badge-warning'}`}
          style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          onClick={() => setShowConfigModal(true)}
          title="Klik untuk Pengaturan Database Cloud Firebase"
        >
          <Cloud size={12} />
          {isCloudActive ? 'Cloud Sync Aktif' : 'Mode Lokal (Offline)'}
        </button>
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

        <button className="btn btn-secondary btn-sm" onClick={exportDataJSON} title="Ekspor Cadangan Data JSON">
          <Download size={14} /> Ekspor
        </button>

        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }} title="Impor Cadangan Data JSON">
          <Upload size={14} /> Impor
          <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
        </label>

        <button className="btn btn-secondary btn-sm" onClick={() => setShowConfigModal(true)} title="Pengaturan Cloud Database">
          <Settings size={14} /> Cloud DB
        </button>

        <button className="btn btn-secondary btn-sm" onClick={resetData} title="Reset ke Data Demo">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Cloud DB Config Modal */}
      {showConfigModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={20} style={{ color: 'var(--primary)' }} /> Pengaturan Cloud Database (Firebase)
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowConfigModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveFirebaseKeys}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Hubungkan ke proyek Firebase Cloud Anda gratis agar **semua HP, Laptop, dan Tablet terhubung & tersinkronisasi otomatis secara real-time**:
                </p>

                <div className="form-group">
                  <label className="form-label">Project ID Firebase *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: konveksi-usahaku-123"
                    value={configForm.projectId || ''}
                    onChange={(e) => setConfigForm({ ...configForm, projectId: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">API Key Firebase *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: AIzaSyD..."
                    value={configForm.apiKey || ''}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Auth Domain</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="proyek-anda.firebaseapp.com"
                      value={configForm.authDomain || ''}
                      onChange={(e) => setConfigForm({ ...configForm, authDomain: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">App ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="1:123456789:web:abcdef"
                      value={configForm.appId || ''}
                      onChange={(e) => setConfigForm({ ...configForm, appId: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan & Hubungkan Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
