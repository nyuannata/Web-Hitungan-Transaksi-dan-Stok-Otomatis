import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PlusCircle, Calendar, Tag, FileText, Trash2, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinanceManager = ({ defaultExpenseModalOpen }) => {
  const { data, selectedMonth, addExpense, deleteExpense, addManualIncome, deleteManualIncome, clearFinancialData, resetAllToZero } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('pengeluaran'); // 'pengeluaran' | 'pemasukan'

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(defaultExpenseModalOpen || false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Beli Kain',
    amount: '',
    description: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Penjualan Sisa Kain',
    amount: '',
    description: ''
  });

  // Filter incomes & expenses for selected month
  const monthlyExpenses = data.expenses.filter(
    (e) => e.date && e.date.startsWith(selectedMonth)
  );

  const monthlyManualIncomes = data.manualIncomes.filter(
    (i) => i.date && i.date.startsWith(selectedMonth)
  );

  // Auto incomes derived from Order DP & Pelunasan
  const orderIncomes = [];
  data.orders.forEach((ord) => {
    if (ord.createdAt && ord.createdAt.startsWith(selectedMonth) && ord.dp > 0) {
      orderIncomes.push({
        id: `INC-DP-${ord.id}`,
        date: ord.createdAt,
        category: 'DP / Pembayaran Order',
        amount: ord.dp,
        description: `DP Order #${ord.id} - ${ord.customerName} (${ord.orderTitle})`,
        isAutoOrder: true
      });
    }
  });

  const allMonthlyIncomes = [...orderIncomes, ...monthlyManualIncomes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const totalExpense = monthlyExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalIncome = allMonthlyIncomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert('Masukkan nominal pengeluaran yang valid!');
      return;
    }
    addExpense(expenseForm);
    setShowExpenseModal(false);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: 'Beli Kain',
      amount: '',
      description: ''
    });
  };

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    if (!incomeForm.amount || Number(incomeForm.amount) <= 0) {
      alert('Masukkan nominal pemasukan yang valid!');
      return;
    }
    addManualIncome(incomeForm);
    setShowIncomeModal(false);
    setIncomeForm({
      date: new Date().toISOString().split('T')[0],
      category: 'Penjualan Sisa Kain',
      amount: '',
      description: ''
    });
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pemasukan & Pengeluaran ({selectedMonth})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Laporan seluruh transaksi keuangan per bulan. Tampilan otomatis berganti saat memasuki bulan baru.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.4)' }} onClick={clearFinancialData} title="Kosongkan Semua Transaksi Keuangan ke Rp 0">
            <RotateCcw size={15} /> Reset Hitungan ke Rp 0
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setShowExpenseModal(true)}>
            <TrendingDown size={16} /> + Catat Pengeluaran
          </button>
          <button className="btn btn-success btn-sm" onClick={() => setShowIncomeModal(true)}>
            <TrendingUp size={16} /> + Catat Pemasukan Manual
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Pemasukan ({selectedMonth})</span>
            <div className="stat-icon success">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {formatRupiah(totalIncome)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Total Pengeluaran ({selectedMonth})</span>
            <div className="stat-icon danger">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f43f5e' }}>
            {formatRupiah(totalExpense)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Hasil Bersih (Profit/Loss)</span>
            <div className="stat-icon primary">
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? '#818cf8' : '#f43f5e' }}>
            {formatRupiah(netProfit)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button
          className={`tab-btn ${activeSubTab === 'pengeluaran' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pengeluaran')}
        >
          <TrendingDown size={16} inline /> Data Pengeluaran ({monthlyExpenses.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'pemasukan' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pemasukan')}
        >
          <TrendingUp size={16} inline /> Data Pemasukan ({allMonthlyIncomes.length})
        </button>
      </div>

      {/* Pengeluaran Table */}
      {activeSubTab === 'pengeluaran' && (
        <div className="card-section">
          {monthlyExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Belum ada pencatatan pengeluaran pada periode {selectedMonth}.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID / Tanggal</th>
                    <th>Kategori</th>
                    <th>Keterangan / Deskripsi</th>
                    <th>Nominal Pengeluaran</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{exp.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.date}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{exp.category}</span>
                      </td>
                      <td>{exp.description || '-'}</td>
                      <td style={{ color: '#f43f5e', fontWeight: 800 }}>
                        {formatRupiah(exp.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Hapus pengeluaran ini"
                          onClick={() => deleteExpense(exp.id)}
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
      )}

      {/* Pemasukan Table */}
      {activeSubTab === 'pemasukan' && (
        <div className="card-section">
          {allMonthlyIncomes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Belum ada pencatatan pemasukan pada periode {selectedMonth}.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID / Tanggal</th>
                    <th>Kategori</th>
                    <th>Keterangan / Transaksi</th>
                    <th>Nominal Pemasukan</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {allMonthlyIncomes.map((inc) => (
                    <tr key={inc.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{inc.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inc.date}</div>
                      </td>
                      <td>
                        <span className="badge badge-success">{inc.category}</span>
                      </td>
                      <td>{inc.description}</td>
                      <td style={{ color: '#34d399', fontWeight: 800 }}>
                        {formatRupiah(inc.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {!inc.isAutoOrder ? (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Hapus pemasukan manual ini"
                            onClick={() => deleteManualIncome(inc.id)}
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Otomatis dari Order</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={20} style={{ color: 'var(--danger)' }} /> Catat Pengeluaran Usaha
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowExpenseModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori Pengeluaran *</label>
                  <select
                    className="form-control"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    <option value="Beli Kain">Beli Kain / Restok Bahan</option>
                    <option value="Tinta & Plastisol">Tinta Sablon & Kimia</option>
                    <option value="Gaji Karyawan">Gaji Karyawan / Tukang Jahit</option>
                    <option value="Operasional & Listrik">Operasional & Listrik</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nominal Pengeluaran (Rp) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 1500000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Catatan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Beli 2 roll Kain Combed 24S Hitam"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-danger">
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--success)' }} /> Catat Pemasukan Manual
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowIncomeModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleIncomeSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori Pemasukan *</label>
                  <select
                    className="form-control"
                    value={incomeForm.category}
                    onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  >
                    <option value="Penjualan Sisa Kain">Penjualan Sisa Kain / Perca</option>
                    <option value="Jasa Tambahan">Jasa Sablon Tambahan</option>
                    <option value="Modal Awal / Suntikan">Modal Awal / Suntikan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nominal Pemasukan (Rp) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 250000"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Catatan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Penjualan perca sisa potong 5kg"
                    value={incomeForm.description}
                    onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-success">
                  Simpan Pemasukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
