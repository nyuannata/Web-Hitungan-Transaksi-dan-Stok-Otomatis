import React from 'react';
import { Printer, X, Shirt, CheckCircle } from 'lucide-react';

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

  const sizesStr = Object.entries(order.sizes || {})
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([sz, qty]) => `${sz}: ${qty} pcs`)
    .join(', ');

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  KONVEKSI & SABLON KAOS
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                  Layanan Produksi Kaos Combed 24S & Stitch Supply
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Telp/WA: 0812-9988-7766 | Email: order@konveksikaos.com
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>NOTA ORDERAN</div>
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
                  Bahan: <strong>{order.fabricBrand}</strong> ({order.sleeveType})
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>Warna: {order.color}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a' }}>No</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a' }}>Rincian Pekerjaan & Kain</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a' }}>Rincian Ukuran</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'center' }}>Jumlah</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'right' }}>Harga / Pcs</th>
                  <th style={{ padding: '0.6rem 0.8rem', border: '1px solid #0f172a', textAlign: 'right' }}>Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1' }}>1</td>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1' }}>
                    <strong>{order.orderTitle}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {order.fabricBrand} - {order.sleeveType} ({order.color})
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                    {sizesStr}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>
                    {order.quantity} Pcs
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                    {formatRupiah(order.unitPrice)}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
                    {formatRupiah(order.totalPrice)}
                  </td>
                </tr>
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
                  <strong>{formatRupiah(order.dp)}</strong>
                </div>
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
