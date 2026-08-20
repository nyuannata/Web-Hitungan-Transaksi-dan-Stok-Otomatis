import React, { useState } from 'react';
import { ShoppingBag, Shirt, User, Calculator, Plus, Trash2, Layers, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderFormModal = ({ onClose, onOrderCreated }) => {
  const { data, addOrder } = useApp();

  const availableBrands = Object.keys(data.inventory || {});

  const [customerData, setCustomerData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    orderTitle: '',
    dp: 0,
    notes: ''
  });

  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}-1`,
      brandSelect: availableBrands[0] || 'Combed 24S',
      customBrand: '',
      sleeveSelect: 'Lengan Pendek',
      customSleeve: '',
      color: 'Hitam Reaktif',
      unitPrice: 65000,
      sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0, '4XL': 0 }
    }
  ]);

  // Add new item variant row
  const handleAddItem = () => {
    const lastItem = items[items.length - 1];
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        brandSelect: lastItem ? lastItem.brandSelect : availableBrands[0] || 'Combed 24S',
        customBrand: '',
        sleeveSelect: lastItem && lastItem.sleeveSelect === 'Lengan Pendek' ? 'Lengan Panjang' : 'Lengan Pendek',
        customSleeve: '',
        color: lastItem ? lastItem.color : 'Hitam Reaktif',
        unitPrice: lastItem ? lastItem.unitPrice : 65000,
        sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0, '4XL': 0 }
      }
    ]);
  };

  // Remove item row
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Update item sizes
  const handleItemSizeChange = (index, sizeKey, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        sizes: { ...updated[index].sizes, [sizeKey]: qty }
      };
      return updated;
    });
  };

  // Helper to calculate total pcs for a single item
  const getItemQty = (item) => {
    return Object.values(item.sizes || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
  };

  // Overall totals
  const totalOrderQty = items.reduce((sum, it) => sum + getItemQty(it), 0);
  const totalOrderPrice = items.reduce((sum, it) => {
    const qty = getItemQty(it);
    return sum + qty * (Number(it.unitPrice) || 0);
  }, 0);

  const remaining = Math.max(0, totalOrderPrice - (Number(customerData.dp) || 0));

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerData.customerName.trim() || !customerData.orderTitle.trim()) {
      alert('Mohon lengkapi Nama Pelanggan dan Judul Orderan!');
      return;
    }

    if (totalOrderQty <= 0) {
      alert('Jumlah (pcs) orderan minimal 1 pcs! Silakan isi ukuran kaos pada item pesanan.');
      return;
    }

    // Validate and build normalized items
    const preparedItems = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const finalBrand = it.brandSelect === '__NEW__' ? it.customBrand.trim() : it.brandSelect;
      const finalSleeve = it.sleeveSelect === '__NEW__' ? it.customSleeve.trim() : it.sleeveSelect;

      if (!finalBrand) {
        alert(`Masukkan Merek Kain untuk Item #${i + 1}!`);
        return;
      }
      if (!finalSleeve) {
        alert(`Masukkan Model Pakaian untuk Item #${i + 1}!`);
        return;
      }

      const itQty = getItemQty(it);
      if (itQty <= 0) {
        alert(`Item #${i + 1} (${finalBrand} - ${finalSleeve}) belum memiliki jumlah ukuran! Masukkan minimal 1 pcs.`);
        return;
      }

      preparedItems.push({
        id: it.id,
        fabricBrand: finalBrand,
        sleeveType: finalSleeve,
        color: it.color.trim() || 'Standar',
        sizes: it.sizes,
        quantity: itQty,
        unitPrice: Number(it.unitPrice) || 0,
        subtotal: itQty * (Number(it.unitPrice) || 0)
      });
    }

    const orderPayload = {
      customerName: customerData.customerName.trim(),
      customerPhone: customerData.customerPhone.trim(),
      customerAddress: customerData.customerAddress.trim(),
      orderTitle: customerData.orderTitle.trim(),
      items: preparedItems,
      dp: Number(customerData.dp) || 0,
      notes: customerData.notes.trim()
    };

    const createdOrder = addOrder(orderPayload);
    if (onOrderCreated) onOrderCreated(createdOrder);
    onClose();
  };

  return (
    <div className="modal-overlay no-print">
      <div className="modal-card modal-lg" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} /> Input Orderan Baru (Multi-Item)
          </h3>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Section 1: Data Pelanggan */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 800 }}>
                <User size={16} /> 1. DATA PELANGGAN
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nama Pelanggan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Budi Santoso / CV Maju Bersama"
                    value={customerData.customerName}
                    onChange={(e) => setCustomerData({ ...customerData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. HP / Whatsapp</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 08123456789"
                    value={customerData.customerPhone}
                    onChange={(e) => setCustomerData({ ...customerData, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Judul Pekerjaan / Sablon *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Sablon Kaos Panitia Event & Staf"
                    value={customerData.orderTitle}
                    onChange={(e) => setCustomerData({ ...customerData, orderTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pelanggan / Pengiriman</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Alamat pengiriman / kota"
                    value={customerData.customerAddress}
                    onChange={(e) => setCustomerData({ ...customerData, customerAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.25rem 0' }} />

            {/* Section 2: Detail Multi-Item Kaos & Kain */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', margin: 0, fontWeight: 800 }}>
                  <Layers size={16} /> 2. RINCIAN KAOS & KAIN ({items.length} Jenis Item)
                </div>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  onClick={handleAddItem}
                >
                  <Plus size={15} /> + Tambah Jenis Kain / Lengan / Warna
                </button>
              </div>

              {/* Item Rows Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, index) => {
                  const itemQty = getItemQty(item);
                  const itemSubtotal = itemQty * (Number(item.unitPrice) || 0);

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(38, 10, 14, 0.75)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.1rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Item Row Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              background: 'var(--primary)',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}
                          >
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fca5a5' }}>
                            Item #{index + 1}: {item.brandSelect === '__NEW__' ? item.customBrand || 'Kain Baru' : item.brandSelect} ({item.sleeveSelect === '__NEW__' ? item.customSleeve || 'Model Baru' : item.sleeveSelect}) - {item.color || 'Warna'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                            Subtotal: {formatRupiah(itemSubtotal)} ({itemQty} pcs)
                          </span>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                                borderRadius: '6px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                fontSize: '0.75rem'
                              }}
                              title="Hapus baris item ini"
                            >
                              <Trash2 size={13} /> Hapus
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Item Form Inputs */}
                      <div className="form-row" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr' }}>
                        {/* Merek Kain */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>Merek Kain *</label>
                          <select
                            className="form-control"
                            value={item.brandSelect}
                            onChange={(e) => handleItemChange(index, 'brandSelect', e.target.value)}
                          >
                            {availableBrands.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                            <option value="__NEW__">+ Ketik Merek Kain Baru</option>
                          </select>
                          {item.brandSelect === '__NEW__' && (
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: '0.35rem', borderColor: 'var(--primary)', fontSize: '0.85rem' }}
                              placeholder="Ketik merek kain..."
                              value={item.customBrand}
                              onChange={(e) => handleItemChange(index, 'customBrand', e.target.value)}
                              required
                            />
                          )}
                        </div>

                        {/* Model Lengan */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>Model Lengan *</label>
                          <select
                            className="form-control"
                            value={item.sleeveSelect}
                            onChange={(e) => handleItemChange(index, 'sleeveSelect', e.target.value)}
                          >
                            <option value="Lengan Pendek">Lengan Pendek</option>
                            <option value="Lengan Panjang">Lengan Panjang</option>
                            <option value="Oversized">Oversized / Boxy Fit</option>
                            <option value="Raglan">Raglan</option>
                            <option value="Singlet / Sleeveless">Singlet / Tanpa Lengan</option>
                            <option value="__NEW__">+ Ketik Model Baru</option>
                          </select>
                          {item.sleeveSelect === '__NEW__' && (
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: '0.35rem', borderColor: 'var(--primary)', fontSize: '0.85rem' }}
                              placeholder="Ketik model pakaian..."
                              value={item.customSleeve}
                              onChange={(e) => handleItemChange(index, 'customSleeve', e.target.value)}
                              required
                            />
                          )}
                        </div>

                        {/* Warna Kain */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>Warna Kain *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Contoh: Hitam Reaktif"
                            value={item.color}
                            onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                            required
                          />
                        </div>

                        {/* Harga Satuan (Rp/pcs) */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>Harga / Pcs (Rp) *</label>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            className="form-control"
                            placeholder="65000"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Sizes Grid */}
                      <div style={{ marginTop: '0.75rem', background: 'rgba(20, 4, 6, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>Rincian Jumlah Per Ukuran:</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)' }}>Item Qty: {itemQty} pcs</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                          {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((sz) => (
                            <div key={sz} style={{ textAlign: 'center' }}>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem', color: '#cbd5e1' }}>
                                Size {sz}
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                style={{ textAlign: 'center', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}
                                value={item.sizes[sz] || 0}
                                onChange={(e) => handleItemSizeChange(index, sz, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Item Bottom Button */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.65rem', border: '1px dashed rgba(239, 68, 68, 0.5)', color: '#fca5a5', justifyContent: 'center' }}
                  onClick={handleAddItem}
                >
                  <Plus size={16} /> + Tambah Jenis Kain / Lengan / Warna Lainnya
                </button>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.25rem 0' }} />

            {/* Section 3: Pembayaran DP & Total Keseluruhan */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 800 }}>
                <Calculator size={16} /> 3. TOTAL ORDERAN & PEMBAYARAN DP
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Uang Muka / DP Masuk (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-control"
                    placeholder="0 (Jika belum bayar DP)"
                    value={customerData.dp}
                    onChange={(e) => setCustomerData({ ...customerData, dp: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Orderan (Opsional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Posisi sablon, ukuran film, deadline, dll."
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Total Calculation Highlight Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(16, 185, 129, 0.12))',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  padding: '1.2rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '1rem',
                  marginTop: '0.75rem',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Jumlah Kaos</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{totalOrderQty} Pcs</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Biaya Orderan</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{formatRupiah(totalOrderPrice)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DP (Masuk Pemasukan)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                    {formatRupiah(customerData.dp)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sisa Tagihan (Piutang)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: remaining > 0 ? '#fbbf24' : '#34d399' }}>
                    {formatRupiah(remaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}>
              Simpan Orderan & Potong Stok ({totalOrderQty} Pcs)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
