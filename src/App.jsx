import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar, Topbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/Orders/OrderList';
import { OrderFormModal } from './components/Orders/OrderFormModal';
import { InvoiceModal } from './components/Orders/InvoiceModal';
import { FinanceManager } from './components/Finance/FinanceManager';
import { StockManager } from './components/Inventory/StockManager';
import { FabricLeftovers } from './components/Inventory/FabricLeftovers';
import { CustomerManager } from './components/Customers/CustomerManager';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Usaha';
      case 'orders_active':
        return 'Orderan Masuk (Aktif)';
      case 'orders_completed':
        return 'Orderan Selesai (Arsip)';
      case 'finance':
        return 'Keuangan: Pemasukan & Pengeluaran';
      case 'stock':
        return 'Stok Kaos & Bahan Kain';
      case 'leftovers':
        return 'Lebihan & Sisa Kain';
      case 'customers':
        return 'Database Konsumen';
      default:
        return 'MENGUDARA SCREEN PRINTING - Transaksi & Stok';
    }
  };

  const handleOrderCreated = (newOrder) => {
    setSelectedInvoiceOrder(newOrder);
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Topbar title={getTabTitle()} />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onOpenNewOrder={() => setShowOrderModal(true)}
              onOpenNewExpense={() => {
                setActiveTab('finance');
                setShowExpenseModal(true);
              }}
            />
          )}

          {activeTab === 'orders_active' && (
            <OrderList
              isCompletedView={false}
              onOpenNewOrder={() => setShowOrderModal(true)}
              onOpenInvoice={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'orders_completed' && (
            <OrderList
              isCompletedView={true}
              onOpenNewOrder={() => setShowOrderModal(true)}
              onOpenInvoice={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceManager defaultExpenseModalOpen={showExpenseModal} />
          )}

          {activeTab === 'stock' && <StockManager />}

          {activeTab === 'leftovers' && <FabricLeftovers />}

          {activeTab === 'customers' && <CustomerManager />}
        </main>
      </div>

      {/* Input Order Modal */}
      {showOrderModal && (
        <OrderFormModal
          onClose={() => setShowOrderModal(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
