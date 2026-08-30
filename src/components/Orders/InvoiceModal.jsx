import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';
import { MengudaraLogo } from '../MengudaraLogo';

export const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const orderItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          id: 'item-1',
          fabricBrand: order.fabricBrand,
          sleeveType: order.sleeveType,
          color: order.color,
          sizes: order.sizes || {},
          quantity: order.quantity || 0,
          unitPrice: order.unitPrice || 0,
          subtotal: order.totalPrice || 0
        }
      ];

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg" style={{ background: '#0f172a' }}>
        <div className="modal-header no-print">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={20} style={{ color: 'var(--primary)' }} /> Cetak Nota Orderan #{order.id}
          </h3>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="modal-body" style={{ background: '#ffffff', color: '#0f172a', padding: '2.5rem' }}>
          <div className="printable-invoice">
            {/* Header Nota */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ marginBottom: '0.35rem' }}>
                  <MengudaraLogo width={260} color="#0f172a" />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                  Jasa Sablon Manual & Konveksi Kaos Custom
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Telp/WA: 0812-9988-7766 | Email: order@mengudarascreenprinting.com
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>NOTA ORDERAN</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>No: {order.id}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tanggal: {order.createdAt}</div>
              </div>
            </div>


            {/* Customer & Order Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  PELANGGAN:
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{order.customerName}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>No. HP: {order.customerPhone || '-'}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>Alamat: {order.customerAddress || '-'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  SPESIFIKASI PEKERJAAN:
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{order.orderTitle}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  Total Qty: <strong>{order.quantity} Pcs</strong> ({orderItems.length} Rincian Kain/Item)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Bahan: {order.fabricBrand} ({order.sleeveType})
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', width: '35px', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a' }}>Rincian Jenis Kain & Warna</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a' }}>Rincian Ukuran</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'center' }}>Jumlah</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'right' }}>Harga / Pcs</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'right' }}>Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => {
                  const itemSizesStr = Object.entries(item.sizes || {})
                    .filter(([_, qty]) => Number(qty) > 0)
                    .map(([sz, qty]) => `${sz}: ${qty}`)
                    .join(', ') || '-';
                  const itemPrice = Number(item.unitPrice) || Number(order.unitPrice) || 0;
                  const itemSubtotal = Number(item.subtotal) || (Number(item.quantity) * itemPrice);

                  return (
                    <tr key={item.id || index}>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1' }}>
                        <strong style={{ color: '#0f172a' }}>{item.fabricBrand || order.fabricBrand}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                          Model: <strong>{item.sleeveType || order.sleeveType}</strong> | Warna: <strong>{item.color || order.color}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                        {itemSizesStr}
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity || 0} Pcs
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                        {formatRupiah(itemPrice)}
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
                        {formatRupiah(itemSubtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Payment Summary Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>
                  CATATAN:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                  {order.notes || 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian.'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Tagihan:</span>
                  <strong style={{ fontSize: '1.1rem' }}>{formatRupiah(order.totalPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Uang Muka / DP:</span>
                  <strong>{formatRupiah(order.initialDp !== undefined ? order.initialDp : (order.dp || 0))}</strong>
                </div>
                {order.paidAmount > (order.initialDp !== undefined ? order.initialDp : (order.dp || 0)) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Pelunasan Masuk:</span>
                    <strong>{formatRupiah(order.paidAmount - (order.initialDp !== undefined ? order.initialDp : (order.dp || 0)))}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '0.4rem', color: order.remaining === 0 ? '#059669' : '#d97706' }}>
                  <span style={{ fontWeight: 800 }}>Sisa Pembayaran:</span>
                  <strong style={{ fontSize: '1.15rem' }}>{formatRupiah(order.remaining)}</strong>
                </div>
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      background: order.remaining === 0 ? '#dcfce7' : '#fef3c7',
                      color: order.remaining === 0 ? '#15803d' : '#b45309',
                      border: '1px solid currentColor'
                    }}
                  >
                    STATUS: {order.remaining === 0 ? 'LUNAS (SELESAI)' : 'DP / BELUM LUNAS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'center', marginTop: '3rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pelanggan</div>
                <div style={{ marginTop: '3.5rem', fontWeight: 700, borderTop: '1px dashed #94a3b8', paddingTop: '0.3rem' }}>
                  ( {order.customerName} )
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Penerima / Hormat Kami</div>
                <div style={{ marginTop: '3.5rem', fontWeight: 700, borderTop: '1px dashed #94a3b8', paddingTop: '0.3rem' }}>
                  ( Admin Production )
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Cetak Nota Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
