import React, { useState } from 'react';
import { Scissors, PlusCircle, Scale, Tag, Layers, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FabricLeftovers = () => {
  const { data, addLeftover, deleteLeftover } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    fabricType: '',
    weightKg: '',
    lengthMeter: '',
    sourceOrderId: '',
    status: 'Bisa Dipakai',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fabricType) {
      alert('Masukkan Jenis Kain / Warna sisa!');
      return;
    }

    addLeftover(form);
    setShowModal(false);
    setForm({
      fabricType: '',
      weightKg: '',
      lengthMeter: '',
      sourceOrderId: '',
      status: 'Bisa Dipakai',
      notes: ''
    });
  };

  const totalWeight = data.leftovers.reduce((acc, l) => acc + (Number(l.weightKg) || 0), 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pencatatan Lebihan Kain (Sisa Produksi)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Inventaris sisa gulungan/potongan kain sisa potong kaos yang masih dapat digunakan atau dijual sebagai perca.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> + Catat Sisa Kain Baru
        </button>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Catatan Sisa Kain</span>
            <div className="stat-icon primary">
              <Scissors size={20} />
            </div>
          </div>
          <div className="stat-value">{data.leftovers.length} Item</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Estimasi Total Berat (Kg)</span>
            <div className="stat-icon warning">
              <Scale size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {totalWeight.toFixed(1)} Kg
          </div>
        </div>
      </div>

      <div className="card-section">
        {data.leftovers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Belum ada pencatatan sisa kain.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kode / ID</th>
                  <th>Jenis & Warna Kain Sisa</th>
                  <th>Berat (Kg)</th>
                  <th>Estimasi Panjang (Meter)</th>
                  <th>Sumber Order ID</th>
                  <th>Status Penggunaan</th>
                  <th>Catatan / Lokasi Simpan</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.leftovers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{item.id}</strong>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.fabricType}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.weightKg} Kg</td>
                    <td>{item.lengthMeter ? `${item.lengthMeter} Meter` : '-'}</td>
                    <td>
                      <span className="badge badge-info">{item.sourceOrderId || '-'}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Siap Dijual (Perca)'
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.notes || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Hapus Catatan Sisa Kain Ini"
                        onClick={() => deleteLeftover(item.id)}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Lebihan Kain */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scissors size={20} style={{ color: 'var(--primary)' }} /> Catat Lebihan / Sisa Kain
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Jenis & Warna Kain *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Combed 24S Hitam Reaktif"
                    value={form.fabricType}
                    onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estimasi Berat (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="Contoh: 2.5"
                      value={form.weightKg}
                      onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimasi Panjang (Meter)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      placeholder="Contoh: 5.0"
                      value={form.lengthMeter}
                      onChange={(e) => setForm({ ...form, lengthMeter: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sumber Order ID (Opsional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: ORD-202608-001"
                      value={form.sourceOrderId}
                      onChange={(e) => setForm({ ...form, sourceOrderId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Kain Sisa</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Bisa Dipakai">Bisa Dipakai (Saku/Lengan/Krah)</option>
                      <option value="Siap Dijual (Perca)">Siap Dijual (Perca Kiloan)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan / Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Rak sisa potong B2"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Sisa Kain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
