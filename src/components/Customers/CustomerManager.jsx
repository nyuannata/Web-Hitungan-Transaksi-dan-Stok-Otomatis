import React, { useState } from 'react';
import { Users, Search, ShoppingBag, Phone, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerManager = ({ onSelectCustomerForOrder }) => {
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Auto compile database konsumen from orders
  const customerMap = {};

  data.orders.forEach((ord) => {
    const key = ord.customerName.trim().toLowerCase();
    if (!customerMap[key]) {
      customerMap[key] = {
        name: ord.customerName,
        phone: ord.customerPhone || '-',
        address: ord.customerAddress || '-',
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: ord.createdAt
      };
    }

    customerMap[key].orderCount += 1;
    customerMap[key].totalSpent += ord.totalPrice || 0;
    if (new Date(ord.createdAt) > new Date(customerMap[key].lastOrderDate)) {
      customerMap[key].lastOrderDate = ord.createdAt;
    }
  });

  const customerList = Object.values(customerMap);

  const filteredCustomers = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Database Konsumen / Pelanggan</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Data pelanggan otomatis terhimpun dan diperbarui dari setiap transaksi orderan yang masuk.
          </p>
        </div>

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
            placeholder="Cari pelanggan / telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem', width: '260px' }}
          />
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Konsumen Terdaftar</span>
            <div className="stat-icon primary">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{customerList.length} Pelanggan</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Rata-Rata Transaksi Pelanggan</span>
            <div className="stat-icon success">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {formatRupiah(
              customerList.length > 0
                ? customerList.reduce((a, b) => a + b.totalSpent, 0) / customerList.length
                : 0
            )}
          </div>
        </div>
      </div>

      <div className="card-section">
        {filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Belum ada data pelanggan yang cocok.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Pelanggan</th>
                  <th>No. HP / Whatsapp</th>
                  <th>Alamat Lengkap</th>
                  <th style={{ textAlign: 'center' }}>Total Order</th>
                  <th>Total Transaksi (Rp)</th>
                  <th>Order Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cust.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        {cust.phone}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} />
                        {cust.address}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-info">{cust.orderCount} Order</span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {formatRupiah(cust.totalSpent)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {cust.lastOrderDate}
                      </div>
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
