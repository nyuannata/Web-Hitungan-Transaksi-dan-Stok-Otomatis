import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  PlusCircle,
  Clock,
  Shirt,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard = ({ onNavigate, onOpenNewOrder, onOpenNewExpense }) => {
  const { data, selectedMonth } = useApp();

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
    }).format(val);
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
            Hasil bersih pemasukan dikurangi pengeluaran
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
            Dari {activeOrders.length} orderan aktif yang belum pelunasan
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
                      <div>{order.orderTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.fabricBrand} ({order.sleeveType}) - {order.color}
                      </div>
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
    </div>
  );
};
