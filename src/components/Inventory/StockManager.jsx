import React, { useState } from 'react';
import { Boxes, Shirt, PlusCircle, Edit3, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StockManager = () => {
  const { data, updateStockVariant, addStockVariant, deleteStockVariant, deleteFabricBrand } = useApp();

  // Get all unique fabric brands present in inventory
  const availableBrands = Object.keys(data.inventory || {});
  const [selectedBrand, setSelectedBrand] = useState(availableBrands[0] || 'Combed 24S');

  // Modals
  const [editModalData, setEditModalData] = useState(null); // { brand, sleeve, variant }
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);

  // Form New Color Variant / Custom Brand / Custom Model
  const [newVariantForm, setNewVariantForm] = useState({
    brandSelect: availableBrands[0] || 'Combed 24S',
    customBrand: '',
    sleeveSelect: 'Lengan Pendek',
    customSleeve: '',
    color: '',
    minAlert: 10,
    sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0, '4XL': 0 }
  });

  // Active brand models
  const activeBrandData = data.inventory[selectedBrand] || {};
  const activeSleeveTypes = Object.keys(activeBrandData);

  const handleSaveStockEdit = (e) => {
    e.preventDefault();
    if (!editModalData) return;
    updateStockVariant(
      editModalData.brand,
      editModalData.sleeve,
      editModalData.variant.id,
      editModalData.variant.sizes
    );
    setEditModalData(null);
  };

  const handleAddVariantSubmit = (e) => {
    e.preventDefault();

    const finalBrand =
      newVariantForm.brandSelect === '__NEW__'
        ? newVariantForm.customBrand.trim()
        : newVariantForm.brandSelect;

    const finalSleeve =
      newVariantForm.sleeveSelect === '__NEW__'
        ? newVariantForm.customSleeve.trim()
        : newVariantForm.sleeveSelect;

    if (!finalBrand) {
      alert('Masukkan Nama Merek Kain!');
      return;
    }

    if (!finalSleeve) {
      alert('Masukkan Model / Tipe Pakaian!');
      return;
    }

    if (!newVariantForm.color) {
      alert('Masukkan Nama Warna Kain!');
      return;
    }

    addStockVariant(
      finalBrand,
      finalSleeve,
      newVariantForm.color,
      newVariantForm.sizes,
      newVariantForm.minAlert
    );

    setSelectedBrand(finalBrand);
    setShowAddVariantModal(false);
    setNewVariantForm({
      brandSelect: finalBrand,
      customBrand: '',
      sleeveSelect: 'Lengan Pendek',
      customSleeve: '',
      color: '',
      minAlert: 10,
      sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0, '4XL': 0 }
    });
  };

  const renderStockTable = (sleeveTypeKey) => {
    const items = activeBrandData[sleeveTypeKey] || [];

    return (
      <div className="card-section" key={sleeveTypeKey} style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <div className="section-title">
            <Shirt size={18} style={{ color: 'var(--primary)' }} />
            <span>Tabel Stok {selectedBrand} - {sleeveTypeKey}</span>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
            {items.length} Variasi Warna
          </span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Belum ada data stok {sleeveTypeKey}. Silakan tambahkan warna kain baru.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Warna Kain</th>
                  <th style={{ textAlign: 'center' }}>S</th>
                  <th style={{ textAlign: 'center' }}>M</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>XL</th>
                  <th style={{ textAlign: 'center' }}>XXL</th>
                  <th style={{ textAlign: 'center' }}>3XL</th>
                  <th style={{ textAlign: 'center' }}>4XL</th>
                  <th style={{ textAlign: 'center' }}>Total Stok</th>
                  <th style={{ textAlign: 'center' }}>Status Stok</th>
                  <th style={{ textAlign: 'center' }}>Aksi & Kelola</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const sizes = item.sizes || {};
                  const totalPcs = Object.values(sizes).reduce((a, b) => a + (Number(b) || 0), 0);
                  const isLow = totalPcs <= (item.minAlert || 10);
                  const isEmpty = totalPcs === 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{item.color}</strong>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          Batas Min: {item.minAlert || 10} pcs
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes.S || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes.M || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes.L || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes.XL || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes.XXL || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes['3XL'] || 0}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{sizes['4XL'] || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                        {totalPcs} pcs
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            isEmpty ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'
                          }`}
                        >
                          {isEmpty ? 'Habis' : isLow ? 'Menipis' : 'Aman'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Update Stok"
                            onClick={() =>
                              setEditModalData({
                                brand: selectedBrand,
                                sleeve: sleeveTypeKey,
                                variant: JSON.parse(JSON.stringify(item))
                              })
                            }
                          >
                            <Edit3 size={14} /> Update
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Hapus Stok Warna Ini"
                            onClick={() => deleteStockVariant(selectedBrand, sleeveTypeKey, item.id)}
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
    );
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manajemen Stok Kaos & Kain</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Stok berkurang otomatis saat orderan masuk. Anda bebas menambah merek kain dan model pakaian baru kapan saja.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddVariantModal(true)}>
          <PlusCircle size={18} /> + Tambah Stok / Merek Kain Baru
        </button>
      </div>

      {/* Dynamic Tabs for All Available Brands */}
      <div className="tab-group" style={{ overflowX: 'auto', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {availableBrands.map((brandName) => (
            <button
              key={brandName}
              className={`tab-btn ${selectedBrand === brandName ? 'active' : ''}`}
              onClick={() => setSelectedBrand(brandName)}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Boxes size={16} inline /> STOK {brandName.toUpperCase()}
            </button>
          ))}
        </div>

        {selectedBrand && availableBrands.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', marginBottom: '0.5rem' }}
            onClick={() => deleteFabricBrand(selectedBrand)}
            title={`Hapus Seluruh Merek ${selectedBrand}`}
          >
            <Trash2 size={14} /> Hapus Merek {selectedBrand}
          </button>
        )}
      </div>

      {/* Dynamic Tables for Models under Active Brand */}
      {activeSleeveTypes.length === 0 ? (
        <div className="card-section" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Belum ada tabel stok untuk merek {selectedBrand}. Klik "+ Tambah Stok / Merek Kain Baru" untuk menambahkan!
        </div>
      ) : (
        activeSleeveTypes.map((sleeveKey) => renderStockTable(sleeveKey))
      )}

      {/* Edit Stock Modal */}
      {editModalData && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Update Stok #{editModalData.variant.color} ({editModalData.sleeve})</h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setEditModalData(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStockEdit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Sesuaikan jumlah pcs stok yang tersedia di gudang per ukuran:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((sz) => (
                    <div key={sz} style={{ textAlign: 'center' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>
                        {sz}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ textAlign: 'center', padding: '0.35rem' }}
                        value={editModalData.variant.sizes[sz] || 0}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setEditModalData({
                            ...editModalData,
                            variant: {
                              ...editModalData.variant,
                              sizes: {
                                ...editModalData.variant.sizes,
                                [sz]: val
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalData(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Variant Modal (Supports Custom Brand & Custom Model!) */}
      {showAddVariantModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Tambah Warna / Stok / Merek Kain Baru</h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowAddVariantModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddVariantSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  {/* Merek Kain Selector + Input Manual */}
                  <div className="form-group">
                    <label className="form-label">Merek Kain *</label>
                    <select
                      className="form-control"
                      value={newVariantForm.brandSelect}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, brandSelect: e.target.value })}
                    >
                      {availableBrands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="__NEW__">+ Tambah Merek Kain Baru (Ketik Manual)</option>
                    </select>

                    {newVariantForm.brandSelect === '__NEW__' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '0.5rem', borderColor: 'var(--primary)' }}
                        placeholder="Ketik Merek Kain Baru (contoh: Cotton Bamboo 30S)"
                        value={newVariantForm.customBrand}
                        onChange={(e) => setNewVariantForm({ ...newVariantForm, customBrand: e.target.value })}
                        required
                      />
                    )}
                  </div>

                  {/* Model Pakaian Selector + Input Manual */}
                  <div className="form-group">
                    <label className="form-label">Model / Tipe Pakaian *</label>
                    <select
                      className="form-control"
                      value={newVariantForm.sleeveSelect}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, sleeveSelect: e.target.value })}
                    >
                      <option value="Lengan Pendek">Lengan Pendek</option>
                      <option value="Lengan Panjang">Lengan Panjang</option>
                      <option value="Oversized">Oversized / Boxy Fit</option>
                      <option value="Raglan">Raglan</option>
                      <option value="Singlet / Sleeveless">Singlet / Tanpa Lengan</option>
                      <option value="Hoodie / Jaket">Hoodie / Jaket</option>
                      <option value="__NEW__">+ Tambah Model Baru (Ketik Manual)</option>
                    </select>

                    {newVariantForm.sleeveSelect === '__NEW__' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '0.5rem', borderColor: 'var(--primary)' }}
                        placeholder="Ketik Model Pakaian (contoh: Kaos Polo Berkerah)"
                        value={newVariantForm.customSleeve}
                        onChange={(e) => setNewVariantForm({ ...newVariantForm, customSleeve: e.target.value })}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Warna Kain *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Mustard Yellow / Sage Green"
                      value={newVariantForm.color}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, color: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Batas Peringatan Stok Menipis (Pcs)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newVariantForm.minAlert}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, minAlert: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <label className="form-label">Jumlah Stok Awal Per Ukuran:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((sz) => (
                      <div key={sz} style={{ textAlign: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>{sz}</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          style={{ textAlign: 'center', padding: '0.35rem' }}
                          value={newVariantForm.sizes[sz] || 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setNewVariantForm({
                              ...newVariantForm,
                              sizes: { ...newVariantForm.sizes, [sz]: val }
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddVariantModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Tambah ke Stok Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
