import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Printer,
  Search,
  PlusCircle,
  CreditCard,
  DollarSign,
  Phone,
  MapPin,
  Shirt,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderList = ({ isCompletedView, onOpenNewOrder, onOpenInvoice }) => {
  const { data, payOrderBalance, deleteOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  // Filter orders by active vs completed
  const orders = data.orders.filter((o) =>
    isCompletedView ? o.status === 'Selesai' : o.status !== 'Selesai'
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleOpenPayment = (order) => {
    setPaymentModalOrder(order);
    setPaymentAmountInput(order.remaining);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    const amount = Number(paymentAmountInput);
    if (amount <= 0) {
      alert('Masukkan jumlah pembayaran yang valid!');
      return;
    }
    if (amount > paymentModalOrder.remaining) {
      alert('Jumlah pembayaran melebihi sisa tagihan!');
      return;
    }

    payOrderBalance(paymentModalOrder.id, amount);
    setPaymentModalOrder(null);
    setPaymentAmountInput('');
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isCompletedView ? 'Orderan Selesai' : 'Orderan Masuk (Aktif)'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isCompletedView
              ? 'Arsip riwayat orderan yang telah lunas dan diselesaikan.'
              : 'Daftar transaksi orderan aktif yang sedang diproses atau menunggu pelunasan.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Cari pelanggan / ID order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: '240px' }}
            />
          </div>

          {!isCompletedView && (
            <button className="btn btn-primary" onClick={onOpenNewOrder}>
              <PlusCircle size={18} /> + Input Order Baru
            </button>
          )}
        </div>
      </div>

      <div className="card-section">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            {searchTerm ? 'Tidak ada orderan yang cocok dengan pencarian.' : 'Belum ada data orderan.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Nota / Tgl</th>
                  <th>Data Pelanggan</th>
                  <th>Detail Orderan & Kain</th>
                  <th>Ukuran (S s/d 4XL)</th>
                  <th>Total Harga</th>
                  <th>DP (Pembayaran)</th>
                  <th>Sisa Tagihan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const sizesStr = Object.entries(order.sizes || {})
                    .filter(([_, qty]) => Number(qty) > 0)
                    .map(([sz, qty]) => `${sz}:${qty}`)
                    .join(' | ');

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.createdAt}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} /> {order.customerPhone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {order.customerAddress}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.orderTitle}</div>
                        {Array.isArray(order.items) && order.items.length > 1 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700 }}>
                              📦 {order.items.length} Jenis Kain/Item:
                            </span>
                            {order.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                • {it.fabricBrand} ({it.sleeveType}) - {it.color}: <strong style={{ color: '#ffffff' }}>{it.quantity} pcs</strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                            <Shirt size={12} /> {order.fabricBrand} ({order.sleeveType}) - {order.color}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.quantity} pcs</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{sizesStr}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(order.totalPrice)}</td>
                      <td style={{ color: '#34d399', fontWeight: 600 }}>{formatRupiah(order.dp)}</td>
                      <td style={{ color: order.remaining > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>
                        {formatRupiah(order.remaining)}
                      </td>
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
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          {order.remaining > 0 && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleOpenPayment(order)}
                              title="Pelunasan / Tambah Bayar"
                            >
                              <CreditCard size={14} /> Pelunasan
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenInvoice(order)}
                            title="Cetak Nota Orderan"
                          >
                            <Printer size={14} /> Nota
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteOrder(order.id)}
                            title="Hapus Orderan Ini"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Input Modal */}
      {paymentModalOrder && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} style={{ color: 'var(--success)' }} /> Pelunasan Order #{paymentModalOrder.id}
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setPaymentModalOrder(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmPayment}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pelanggan:</div>
                  <div style={{ fontWeight: 700 }}>{paymentModalOrder.customerName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Total Harga: <strong>{formatRupiah(paymentModalOrder.totalPrice)}</strong></span>
                    <span>Sisa Tagihan: <strong style={{ color: '#fbbf24' }}>{formatRupiah(paymentModalOrder.remaining)}</strong></span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nominal Pelunasan / Pembayaran Tambahan (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    max={paymentModalOrder.remaining}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    * Jika dibayar lunas Rp {paymentModalOrder.remaining.toLocaleString('id-ID')}, orderan otomatis berpindah ke **Orderan Selesai**.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalOrder(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-success">
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
