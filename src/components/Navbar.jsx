import React from 'react';
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
  Shirt
} from 'lucide-react';
import { useApp } from '../context/AppContext';

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
      <div className="sidebar-header">
        <div className="logo-badge">
          <Shirt size={24} />
        </div>
        <div>
          <div className="brand-title">KONVEKSI APPS</div>
          <div className="brand-subtitle">Transaksi & Stok Otomatis</div>
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
  const { selectedMonth, setSelectedMonth, exportDataJSON, importDataJSON, resetData } = useApp();

  const handleFileImport = (e) => {
    if (e.target.files && e.target.files[0]) {
      importDataJSON(e.target.files[0]);
    }
  };

  return (
    <header className="topbar no-print">
      <div className="topbar-title">{title}</div>

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

        <button className="btn btn-secondary btn-sm" onClick={resetData} title="Reset ke Data Demo">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </header>
  );
};
