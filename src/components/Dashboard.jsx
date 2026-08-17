import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  PlusCircle,
  Clock,
  Shirt,
  ArrowRight,
  Coins,
  Wallet,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard = ({ onNavigate, onOpenNewOrder, onOpenNewExpense }) => {
  const { data, selectedMonth, setInitialBalance } = useApp();
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  // Initial balance for selected month
  const currentInitialBalance = (data.initialBalances && data.initialBalances[selectedMonth]) || 0;

  // Filter incomes for selected month
  const monthlyDPIncomes = data.orders
    .filter((o) => o.createdAt && o.createdAt.startsWith(selectedMonth))
    .reduce((acc, o) => acc + (o.dp || 0), 0);

  const monthlyManualIncomes = data.manualIncomes
    .filter((i) => i.date && i.date.startsWith(selectedMonth))
    .reduce((acc, i) => acc + (i.amount || 0), 0);

  const totalIncome = monthlyDPIncomes + monthlyManualIncomes;

  // Filter expenses for selected month
  const totalExpense = data.expenses
    .filter((e) => e.date && e.date.startsWith(selectedMonth))
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;
  const totalEndingCash = currentInitialBalance + netProfit;

  // Total pending payment from active orders
  const activeOrders = data.orders.filter((o) => o.status !== 'Selesai');
  const completedOrders = data.orders.filter((o) => o.status === 'Selesai');
  const totalReceivables = activeOrders.reduce((acc, o) => acc + (o.remaining || 0), 0);

  // Check low stock items safely
  const lowStockItems = [];
  if (data.inventory) {
    Object.entries(data.inventory).forEach(([brandName, sleevesObj]) => {
      if (sleevesObj && typeof sleevesObj === 'object') {
        Object.entries(sleevesObj).forEach(([sleeveName, itemsArr]) => {
          if (Array.isArray(itemsArr)) {
            itemsArr.forEach((item) => {
              const totalPcs = Object.values(item.sizes || {}).reduce((a, b) => a + Number(b), 0);
              if (totalPcs <= (item.minAlert || 15)) {
                lowStockItems.push({
                  brand: brandName,
                  sleeve: sleeveName,
                  color: item.color,
                  totalPcs,
                  minAlert: item.minAlert || 15
                });
              }
            });
          }
        });
      }
    });
  }

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleSaveInitialBalance = (e) => {
    e.preventDefault();
    setInitialBalance(balanceInput, selectedMonth);
    setShowBalanceModal(false);
  };

  return (
    <div>
      {/* Quick Actions Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ringkasan Usaha ({selectedMonth})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Pantau arus kas, orderan aktif, dan stok kaos secara *real-time*.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24' }}
            onClick={() => {
              setBalanceInput(currentInitialBalance > 0 ? currentInitialBalance : '');
              setShowBalanceModal(true);
            }}
            title="Masukkan / Ubah Saldo Awal Kas Usaha Bulan Ini"
          >
            <Coins size={17} /> Saldo Awal: {formatRupiah(currentInitialBalance)}
          </button>
          <button className="btn btn-primary" onClick={onOpenNewOrder}>
            <PlusCircle size={18} /> + Input Order Baru
          </button>
          <button className="btn btn-secondary" onClick={onOpenNewExpense}>
            + Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid-stats">
        <div
          className="stat-card"
          style={{ cursor: 'pointer', border: '1px solid rgba(251, 191, 36, 0.35)' }}
          onClick={() => {
            setBalanceInput(currentInitialBalance > 0 ? currentInitialBalance : '');
            setShowBalanceModal(true);
          }}
          title="Klik untuk mengubah Saldo Awal"
        >
          <div className="stat-header">
            <span>Saldo Awal Kas ({selectedMonth})</span>
            <div className="stat-icon warning">
              <Coins size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {formatRupiah(currentInitialBalance)}
          </div>
          <div className="stat-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Modal kas awal periode</span>
            <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Edit3 size={11} /> Ubah
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Pemasukan Bulan Ini</span>
            <div className="stat-icon success">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {formatRupiah(totalIncome)}
          </div>
          <div className="stat-footer">
            Termasuk DP orderan & pemasukan manual
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Pengeluaran Bulan Ini</span>
            <div className="stat-icon danger">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f43f5e' }}>
            {formatRupiah(totalExpense)}
          </div>
          <div className="stat-footer">
            Total biaya operasional & bahan
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Keuntungan Bersih (Profit)</span>
            <div className="stat-icon primary">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? '#818cf8' : '#f43f5e' }}>
            {formatRupiah(netProfit)}
          </div>
          <div className="stat-footer">
            Hasil bersih pemasukan - pengeluaran
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Sisa Pembayaran (Piutang)</span>
            <div className="stat-icon warning">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {formatRupiah(totalReceivables)}
          </div>
          <div className="stat-footer">
            Dari {activeOrders.length} orderan aktif
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <div className="stat-icon warning" style={{ flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>
              Peringatan Stok Menipis ({lowStockItems.length} Item)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Beberapa kain kaos mendekati atau berada di bawah batas minimum stok:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {lowStockItems.map((item, idx) => (
                <span
                  key={idx}
                  className="badge badge-warning"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  <Shirt size={14} /> {item.brand} ({item.sleeve}) - {item.color}: <strong>{item.totalPcs} pcs</strong>
                </span>
              ))}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('stock')}>
            Kelola Stok <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Recent Orders Preview */}
      <div className="card-section">
        <div className="section-header">
          <div className="section-title">
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <span>Orderan Masuk Terbaru</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders_active')}>
            Lihat Semua Orderan ({activeOrders.length})
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Belum ada orderan masuk yang aktif. Silakan tambahkan orderan baru!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Order</th>
                  <th>Pelanggan</th>
                  <th>Jenis Orderan & Kain</th>
                  <th>Jumlah (Pcs)</th>
                  <th>Total Harga</th>
                  <th>DP Masuk</th>
                  <th>Sisa Pembayaran</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.orderTitle}</div>
                      {Array.isArray(order.items) && order.items.length > 1 ? (
                        <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 600 }}>
                          📦 {order.items.length} Rincian Kain ({order.items.map((it) => `${it.sleeveType === 'Lengan Panjang' ? 'Panjang' : 'Pendek'} ${it.color}`).join(', ')})
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {order.fabricBrand} ({order.sleeveType}) - {order.color}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>{order.quantity} pcs</td>
                    <td>{formatRupiah(order.totalPrice)}</td>
                    <td style={{ color: '#34d399' }}>{formatRupiah(order.dp)}</td>
                    <td style={{ color: '#fbbf24', fontWeight: 700 }}>{formatRupiah(order.remaining)}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === 'Selesai'
                            ? 'badge-success'
                            : order.status === 'DP'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saldo Awal Input Modal */}
      {showBalanceModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                <Coins size={22} /> Masukkan Saldo Awal Kas
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setShowBalanceModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveInitialBalance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <p style={{ fontSize: '0.825rem', color: '#fef3c7', margin: 0, lineHeight: 1.5 }}>
                    💡 <strong>Saldo Awal ({selectedMonth})</strong> adalah modal kas / uang kas toko yang tersedia sebelum transaksi usaha bulan ini dimulai.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Nominal Saldo Awal Kas (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Contoh: 5000000"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}
                    autoFocus
                    required
                  />
                  {balanceInput > 0 && (
                    <small style={{ color: '#34d399', fontWeight: 600, display: 'block', marginTop: '0.35rem' }}>
                      Terbaca: {formatRupiah(balanceInput)}
                    </small>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBalanceModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', borderColor: '#d97706' }}>
                  Simpan Saldo Awal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
