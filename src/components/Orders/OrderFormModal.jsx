import React, { useState } from 'react';
import { ShoppingBag, Shirt, User, Calculator } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderFormModal = ({ onClose, onOrderCreated }) => {
  const { data, addOrder } = useApp();

  const availableBrands = Object.keys(data.inventory || {});

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    orderTitle: '',
    brandSelect: availableBrands[0] || 'Combed 24S',
    customBrand: '',
    sleeveSelect: 'Lengan Pendek',
    customSleeve: '',
    color: '',
    unitPrice: 65000,
    dp: 0,
    notes: '',
    sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
  });

  // Calculate live total pcs
  const totalQty = Object.values(formData.sizes).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );

  // Calculate live prices
  const totalPrice = (Number(formData.unitPrice) || 0) * totalQty;
  const remaining = Math.max(0, totalPrice - (Number(formData.dp) || 0));

  const handleSizeChange = (sizeKey, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setFormData((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [sizeKey]: qty }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.orderTitle) {
      alert('Mohon lengkapi Nama Pelanggan dan Judul Orderan!');
      return;
    }

    if (totalQty <= 0) {
      alert('Jumlah (pcs) orderan minimal 1 pcs!');
      return;
    }

    const finalBrand =
      formData.brandSelect === '__NEW__'
        ? formData.customBrand.trim()
        : formData.brandSelect;

    const finalSleeve =
      formData.sleeveSelect === '__NEW__'
        ? formData.customSleeve.trim()
        : formData.sleeveSelect;

    if (!finalBrand) {
      alert('Masukkan Nama Merek Kain!');
      return;
    }

    if (!finalSleeve) {
      alert('Masukkan Model Pakaian!');
      return;
    }

    const orderPayload = {
      ...formData,
      fabricBrand: finalBrand,
      sleeveType: finalSleeve
    };

    const createdOrder = addOrder(orderPayload);
    if (onOrderCreated) onOrderCreated(createdOrder);
    onClose();
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="modal-overlay no-print">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} /> Input Orderan Baru
          </h3>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Section 1: Data Pelanggan */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <User size={16} /> DATA PELANGGAN
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nama Pelanggan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. HP / Whatsapp</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 08123456789"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Pelanggan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Alamat lengkap pengiriman"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                />
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.25rem 0' }} />

            {/* Section 2: Detail Orderan & Kain */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <Shirt size={16} /> DETAIL ORDERAN & KAOS
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Orderan / Judul Pekerjaan *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Sablon Kaos Panitia Event 300 Pcs"
                  value={formData.orderTitle}
                  onChange={(e) => setFormData({ ...formData, orderTitle: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                {/* Merek Kain */}
                <div className="form-group">
                  <label className="form-label">Merek Kain *</label>
                  <select
                    className="form-control"
                    value={formData.brandSelect}
                    onChange={(e) => setFormData({ ...formData, brandSelect: e.target.value })}
                  >
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="__NEW__">+ Ketik Merek Kain Baru</option>
                  </select>

                  {formData.brandSelect === '__NEW__' && (
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: '0.5rem', borderColor: 'var(--primary)' }}
                      placeholder="Ketik Merek Kain (contoh: Cotton Bamboo 30S)"
                      value={formData.customBrand}
                      onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                      required
                    />
                  )}
                </div>

                {/* Model Lengan */}
                <div className="form-group">
                  <label className="form-label">Model / Tipe Pakaian *</label>
                  <select
                    className="form-control"
                    value={formData.sleeveSelect}
                    onChange={(e) => setFormData({ ...formData, sleeveSelect: e.target.value })}
                  >
                    <option value="Lengan Pendek">Lengan Pendek</option>
                    <option value="Lengan Panjang">Lengan Panjang</option>
                    <option value="Oversized">Oversized / Boxy Fit</option>
                    <option value="Raglan">Raglan</option>
                    <option value="Singlet / Sleeveless">Singlet / Tanpa Lengan</option>
                    <option value="__NEW__">+ Ketik Model Baru</option>
                  </select>

                  {formData.sleeveSelect === '__NEW__' && (
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: '0.5rem', borderColor: 'var(--primary)' }}
                      placeholder="Ketik Model Pakaian (contoh: Hoodie Polos)"
                      value={formData.customSleeve}
                      onChange={(e) => setFormData({ ...formData, customSleeve: e.target.value })}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Warna Kain</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Hitam Reaktif"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              {/* Input Rincian Ukuran */}
              <div style={{ marginTop: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Jumlah Pcs Per Ukuran:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <div key={sz} style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                        {sz}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ textAlign: 'center', padding: '0.4rem' }}
                        value={formData.sizes[sz]}
                        onChange={(e) => handleSizeChange(sz, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', textAlign: 'right', color: 'var(--primary)', fontWeight: 700 }}>
                  Total Pcs: {totalQty} Pcs (Stok kaos otomatis berkurang)
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.25rem 0' }} />

            {/* Section 3: Kalkulasi Harga & Pembayaran DP */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <Calculator size={16} /> KALKULASI PEMBAYARAN
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Harga Per Pcs (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pembayaran DP (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.dp}
                    onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
                  />
                </div>
              </div>

              {/* Summary Kalkulasi Automatic */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Harga Orderan</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatRupiah(totalPrice)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DP (Masuk Pemasukan)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                    {formatRupiah(formData.dp)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sisa Pembayaran</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: remaining > 0 ? '#fbbf24' : '#34d399' }}>
                    {formatRupiah(remaining)}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Catatan Tambahan</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Catatan sablon, posisi gambar, deadline, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Orderan & Potong Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
