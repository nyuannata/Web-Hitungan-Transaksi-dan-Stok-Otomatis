import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  pushToCloudFirestore,
  subscribeToCloudFirestore,
  getSavedFirebaseConfig,
  saveFirebaseConfig
} from '../firebase';

const AppContext = createContext();

const STORAGE_KEY = 'WEB_TRANSAKSI_STOK_V1';

const getInitialData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local storage data', e);
    }
  }

  // Default initial demo data
  return {
    orders: [
      {
        id: 'ORD-202608-001',
        customerName: 'Budi Santoso',
        customerPhone: '0812-3456-7890',
        customerAddress: 'Jl. Sudirman No. 12, Jakarta Pusat',
        orderTitle: 'Sablon Kaos Event Panitia',
        fabricBrand: 'Combed 24S',
        sleeveType: 'Lengan Pendek',
        color: 'Hitam Reaktif',
        sizes: { S: 10, M: 20, L: 15, XL: 5, XXL: 0 },
        quantity: 50,
        unitPrice: 65000,
        totalPrice: 3250000,
        dp: 1500000,
        remaining: 1750000,
        status: 'DP',
        createdAt: '2026-08-10',
        updatedAt: '2026-08-10',
        notes: 'Sablon Plastisol 2 muka (Depan-Belakang)'
      },
      {
        id: 'ORD-202608-002',
        customerName: 'Rina Wijaya',
        customerPhone: '0819-8765-4321',
        customerAddress: 'Jl. Merdeka No. 88, Bandung',
        orderTitle: 'Kaos Polo Premium Stitch Supply',
        fabricBrand: 'Stitch Supply',
        sleeveType: 'Lengan Panjang',
        color: 'Navy Blue',
        sizes: { S: 0, M: 15, L: 15, XL: 0, XXL: 0 },
        quantity: 30,
        unitPrice: 85000,
        totalPrice: 2550000,
        dp: 2550000,
        remaining: 0,
        status: 'Selesai',
        createdAt: '2026-08-05',
        updatedAt: '2026-08-05',
        notes: 'Bordir Komputer Dada Kiri'
      }
    ],
    inventory: {
      'Combed 24S': {
        'Lengan Pendek': [
          { id: 'c24s-p-hitam', color: 'Hitam Reaktif', sizes: { S: 40, M: 30, L: 25, XL: 15, XXL: 10 }, minAlert: 15 },
          { id: 'c24s-p-putih', color: 'Putih Netral', sizes: { S: 50, M: 45, L: 35, XL: 20, XXL: 15 }, minAlert: 15 },
          { id: 'c24s-p-maroon', color: 'Maroon', sizes: { S: 25, M: 20, L: 15, XL: 10, XXL: 5 }, minAlert: 15 }
        ],
        'Lengan Panjang': [
          { id: 'c24s-pj-hitam', color: 'Hitam Reaktif', sizes: { S: 30, M: 25, L: 20, XL: 10, XXL: 5 }, minAlert: 15 },
          { id: 'c24s-pj-navy', color: 'Navy', sizes: { S: 25, M: 20, L: 15, XL: 10, XXL: 5 }, minAlert: 15 }
        ]
      },
      'Stitch Supply': {
        'Lengan Pendek': [
          { id: 'ss-p-black', color: 'Solid Black', sizes: { S: 35, M: 30, L: 25, XL: 15, XXL: 10 }, minAlert: 10 },
          { id: 'ss-p-white', color: 'Solid White', sizes: { S: 40, M: 35, L: 30, XL: 20, XXL: 10 }, minAlert: 10 }
        ],
        'Lengan Panjang': [
          { id: 'ss-pj-navy', color: 'Navy Blue', sizes: { S: 20, M: 15, L: 15, XL: 10, XXL: 5 }, minAlert: 10 }
        ]
      }
    },
    leftovers: [
      {
        id: 'LEB-001',
        fabricType: 'Combed 24S Hitam',
        weightKg: 2.5,
        lengthMeter: 5.0,
        sourceOrderId: 'ORD-202608-001',
        status: 'Bisa Dipakai',
        notes: 'Potongan sisa lengan & krah'
      }
    ],
    expenses: [
      {
        id: 'EXP-202608-001',
        date: '2026-08-01',
        category: 'Beli Kain',
        amount: 3500000,
        description: 'Beli Kain Roll Combed 24S Hitam & Putih'
      },
      {
        id: 'EXP-202608-002',
        date: '2026-08-03',
        category: 'Operasional',
        amount: 450000,
        description: 'Pembelian Tinta Sablon Plastisol & Thinner'
      }
    ],
    manualIncomes: [
      {
        id: 'INC-202608-001',
        date: '2026-08-02',
        category: 'Penjualan Sisa Kain',
        amount: 180000,
        description: 'Penjualan perca sisa potong 3.5kg'
      }
    ]
  };
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(getInitialData);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [firebaseConfig, setFirebaseConfigState] = useState(getSavedFirebaseConfig);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  // Check if Firebase config is configured with a real project ID
  useEffect(() => {
    if (firebaseConfig && firebaseConfig.projectId && !firebaseConfig.projectId.includes('demo')) {
      setIsCloudActive(true);
    } else {
      setIsCloudActive(false);
    }
  }, [firebaseConfig]);

  // Subscribe to real-time Cloud Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeToCloudFirestore((cloudData) => {
      if (cloudData) {
        setData(cloudData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
      }
    });

    return () => unsubscribe();
  }, [isCloudActive]);

  // Save to LocalStorage & push to Cloud when data changes locally
  const updateDataState = (updater) => {
    setData((prev) => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));

      if (isCloudActive) {
        pushToCloudFirestore(nextData);
      }

      return nextData;
    });
  };

  const normalizeSleeve = (s) => {
    if (!s) return 'Lengan Pendek';
    if (s === 'Pendek') return 'Lengan Pendek';
    if (s === 'Panjang') return 'Lengan Panjang';
    return s;
  };

  // Helper to deduct inventory based on order details
  const deductInventory = (fabricBrand, sleeveTypeInput, colorName, sizesObj) => {
    const sleeveType = normalizeSleeve(sleeveTypeInput);
    updateDataState((prev) => {
      const newInventory = JSON.parse(JSON.stringify(prev.inventory));
      if (newInventory[fabricBrand] && newInventory[fabricBrand][sleeveType]) {
        const items = newInventory[fabricBrand][sleeveType];
        const matchIndex = items.findIndex(
          (i) => i.color.toLowerCase() === colorName.toLowerCase()
        );

        if (matchIndex >= 0) {
          Object.keys(sizesObj).forEach((sz) => {
            const qtyNeeded = Number(sizesObj[sz]) || 0;
            if (items[matchIndex].sizes[sz] !== undefined) {
              items[matchIndex].sizes[sz] = Math.max(
                0,
                items[matchIndex].sizes[sz] - qtyNeeded
              );
            }
          });
        }
      }
      return { ...prev, inventory: newInventory };
    });
  };

  // Add new order
  const addOrder = (orderInput) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const orderMonth = todayStr.substring(0, 7);
    const orderId = `ORD-${orderMonth.replace('-', '')}-${String(data.orders.length + 1).padStart(3, '0')}`;

    const totalQty = Object.values(orderInput.sizes || {}).reduce(
      (acc, val) => acc + (Number(val) || 0),
      0
    );

    const totalPrice = (Number(orderInput.unitPrice) || 0) * totalQty;
    const dp = Number(orderInput.dp) || 0;
    const remaining = Math.max(0, totalPrice - dp);
    const status = remaining === 0 ? 'Selesai' : dp > 0 ? 'DP' : 'Belum Bayar';

    const normalizedSleeve = normalizeSleeve(orderInput.sleeveType);

    const newOrder = {
      id: orderId,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      customerAddress: orderInput.customerAddress,
      orderTitle: orderInput.orderTitle,
      fabricBrand: orderInput.fabricBrand,
      sleeveType: normalizedSleeve,
      color: orderInput.color,
      sizes: orderInput.sizes,
      quantity: totalQty,
      unitPrice: Number(orderInput.unitPrice) || 0,
      totalPrice,
      dp,
      remaining,
      status,
      createdAt: todayStr,
      updatedAt: todayStr,
      notes: orderInput.notes || ''
    };

    deductInventory(orderInput.fabricBrand, normalizedSleeve, orderInput.color, orderInput.sizes);

    updateDataState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders]
    }));

    return newOrder;
  };

  // Record balance payment (pelunasan)
  const payOrderBalance = (orderId, paymentAmount) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const amount = Number(paymentAmount) || 0;

    updateDataState((prev) => {
      const updatedOrders = prev.orders.map((ord) => {
        if (ord.id === orderId) {
          const newRemaining = Math.max(0, ord.remaining - amount);
          const newDp = ord.dp + amount;
          const newStatus = newRemaining === 0 ? 'Selesai' : 'DP';
          return {
            ...ord,
            dp: newDp,
            remaining: newRemaining,
            status: newStatus,
            updatedAt: todayStr
          };
        }
        return ord;
      });

      return {
        ...prev,
        orders: updatedOrders
      };
    });
  };

  // Add Expense
  const addExpense = (expenseInput) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const id = `EXP-${expenseInput.date ? expenseInput.date.replace(/-/g, '').substring(0, 6) : 'MAN'}-${Date.now().toString().slice(-4)}`;
    
    const newExp = {
      id,
      date: expenseInput.date || todayStr,
      category: expenseInput.category || 'Lain-lain',
      amount: Number(expenseInput.amount) || 0,
      description: expenseInput.description || ''
    };

    updateDataState((prev) => ({
      ...prev,
      expenses: [newExp, ...prev.expenses]
    }));
  };

  // Add Manual Income
  const addManualIncome = (incomeInput) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const id = `INC-${incomeInput.date ? incomeInput.date.replace(/-/g, '').substring(0, 6) : 'MAN'}-${Date.now().toString().slice(-4)}`;
    
    const newInc = {
      id,
      date: incomeInput.date || todayStr,
      category: incomeInput.category || 'Penjualan Lanjutan',
      amount: Number(incomeInput.amount) || 0,
      description: incomeInput.description || ''
    };

    updateDataState((prev) => ({
      ...prev,
      manualIncomes: [newInc, ...prev.manualIncomes]
    }));
  };

  // Update Inventory Stock (Restok or Adjust)
  const updateStockVariant = (brand, sleeve, variantId, newSizes) => {
    updateDataState((prev) => {
      const newInventory = JSON.parse(JSON.stringify(prev.inventory));
      if (newInventory[brand] && newInventory[brand][sleeve]) {
        const idx = newInventory[brand][sleeve].findIndex((i) => i.id === variantId);
        if (idx >= 0) {
          newInventory[brand][sleeve][idx].sizes = { ...newSizes };
        }
      }
      return { ...prev, inventory: newInventory };
    });
  };

  // Add New Color Variant
  const addStockVariant = (brandName, sleeveNameInput, colorName, sizesObj, minAlert = 10) => {
    const sleeveName = normalizeSleeve(sleeveNameInput);
    const id = `var-${Date.now().toString().slice(-6)}`;

    updateDataState((prev) => {
      const newInventory = JSON.parse(JSON.stringify(prev.inventory));

      if (!newInventory[brandName]) {
        newInventory[brandName] = {};
      }
      if (!newInventory[brandName][sleeveName]) {
        newInventory[brandName][sleeveName] = [];
      }

      newInventory[brandName][sleeveName].push({
        id,
        color: colorName,
        sizes: sizesObj,
        minAlert: Number(minAlert) || 10
      });

      return { ...prev, inventory: newInventory };
    });
  };

  // Add Leftover Fabric
  const addLeftover = (leftoverInput) => {
    const id = `LEB-${Date.now().toString().slice(-4)}`;
    const newLeftover = {
      id,
      fabricType: leftoverInput.fabricType,
      weightKg: Number(leftoverInput.weightKg) || 0,
      lengthMeter: Number(leftoverInput.lengthMeter) || 0,
      sourceOrderId: leftoverInput.sourceOrderId || '-',
      status: leftoverInput.status || 'Bisa Dipakai',
      notes: leftoverInput.notes || ''
    };

    updateDataState((prev) => ({
      ...prev,
      leftovers: [newLeftover, ...prev.leftovers]
    }));
  };

  // Delete Stock Variant
  const deleteStockVariant = (brand, sleeve, variantId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus variasi warna stok ini?')) {
      updateDataState((prev) => {
        const newInventory = JSON.parse(JSON.stringify(prev.inventory));
        if (newInventory[brand] && newInventory[brand][sleeve]) {
          newInventory[brand][sleeve] = newInventory[brand][sleeve].filter(
            (item) => item.id !== variantId
          );
        }
        return { ...prev, inventory: newInventory };
      });
    }
  };

  // Delete Entire Fabric Brand
  const deleteFabricBrand = (brand) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus SELURUH merek kain "${brand}" dan semua stok di dalamnya?`)) {
      updateDataState((prev) => {
        const newInventory = JSON.parse(JSON.stringify(prev.inventory));
        delete newInventory[brand];
        return { ...prev, inventory: newInventory };
      });
    }
  };

  // Delete Leftover Fabric
  const deleteLeftover = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pencatatan sisa kain ini?')) {
      updateDataState((prev) => ({
        ...prev,
        leftovers: prev.leftovers.filter((item) => item.id !== id)
      }));
    }
  };

  // Export & Import
  const exportDataJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_web_transaksi_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.orders && parsed.inventory) {
          updateDataState(parsed);
          alert('Data berhasil di-impor!');
        } else {
          alert('Format berkas JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan data ke data demo awal?')) {
      const init = getInitialData();
      localStorage.removeItem(STORAGE_KEY);
      updateDataState(init);
    }
  };

  // Update Cloud Firebase Config
  const updateFirebaseConfigKeys = (newConfig) => {
    saveFirebaseConfig(newConfig);
    setFirebaseConfigState(newConfig);
    alert('Pengaturan Cloud Firebase berhasil disimpan! Silakan muat ulang halaman.');
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        data,
        selectedMonth,
        setSelectedMonth,
        isCloudActive,
        firebaseConfig,
        updateFirebaseConfigKeys,
        addOrder,
        payOrderBalance,
        addExpense,
        addManualIncome,
        updateStockVariant,
        addStockVariant,
        deleteStockVariant,
        deleteFabricBrand,
        addLeftover,
        deleteLeftover,
        exportDataJSON,
        importDataJSON,
        resetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
