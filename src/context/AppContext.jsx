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
    ],
    initialBalances: {}
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

  // Check if Firebase config is configured with a real project ID and API key
  useEffect(() => {
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
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

  // Add new order (Supports multiple items/variants in a single order)
  const addOrder = (orderInput) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const orderMonth = todayStr.substring(0, 7);
    const orderId = `ORD-${orderMonth.replace('-', '')}-${String((data.orders || []).length + 1).padStart(3, '0')}`;

    let normalizedItems = [];
    let totalQty = 0;
    let totalPrice = 0;
    const combinedSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

    if (Array.isArray(orderInput.items) && orderInput.items.length > 0) {
      normalizedItems = orderInput.items.map((item, index) => {
        const normSleeve = normalizeSleeve(item.sleeveType);
        const itemSizes = item.sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
        const itemQty = Object.values(itemSizes).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0
        );
        const itemUnitPrice = Number(item.unitPrice) || 0;
        const itemSubtotal = itemQty * itemUnitPrice;

        totalQty += itemQty;
        totalPrice += itemSubtotal;

        Object.keys(itemSizes).forEach((sz) => {
          combinedSizes[sz] = (combinedSizes[sz] || 0) + (Number(itemSizes[sz]) || 0);
        });

        // Deduct inventory for this item variant
        deductInventory(item.fabricBrand, normSleeve, item.color, itemSizes);

        return {
          id: item.id || `item-${index + 1}`,
          fabricBrand: item.fabricBrand,
          sleeveType: normSleeve,
          color: item.color,
          sizes: itemSizes,
          quantity: itemQty,
          unitPrice: itemUnitPrice,
          subtotal: itemSubtotal
        };
      });
    } else {
      // Single-item fallback for backward compatibility
      const normSleeve = normalizeSleeve(orderInput.sleeveType);
      const singleSizes = orderInput.sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
      totalQty = Object.values(singleSizes).reduce((acc, val) => acc + (Number(val) || 0), 0);
      const singleUnitPrice = Number(orderInput.unitPrice) || 0;
      totalPrice = singleUnitPrice * totalQty;

      deductInventory(orderInput.fabricBrand, normSleeve, orderInput.color, singleSizes);

      normalizedItems = [
        {
          id: 'item-1',
          fabricBrand: orderInput.fabricBrand,
          sleeveType: normSleeve,
          color: orderInput.color,
          sizes: singleSizes,
          quantity: totalQty,
          unitPrice: singleUnitPrice,
          subtotal: totalPrice
        }
      ];
      Object.assign(combinedSizes, singleSizes);
    }

    const dp = Number(orderInput.dp) || 0;
    const remaining = Math.max(0, totalPrice - dp);
    const status = remaining === 0 ? 'Selesai' : dp > 0 ? 'DP' : 'Belum Bayar';

    // Summary strings for quick table display
    const brandsList = [...new Set(normalizedItems.map((i) => i.fabricBrand))].join(', ');
    const sleevesList = [...new Set(normalizedItems.map((i) => i.sleeveType))].join(', ');
    const colorsList = [...new Set(normalizedItems.map((i) => i.color))].join(', ');

    const newOrder = {
      id: orderId,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      customerAddress: orderInput.customerAddress,
      orderTitle: orderInput.orderTitle,
      items: normalizedItems,
      // Backward-compatible summary fields
      fabricBrand: brandsList || (orderInput.fabricBrand || '-'),
      sleeveType: sleevesList || (orderInput.sleeveType || '-'),
      color: colorsList || (orderInput.color || '-'),
      sizes: combinedSizes,
      quantity: totalQty,
      unitPrice: normalizedItems[0]?.unitPrice || Number(orderInput.unitPrice) || 0,
      totalPrice,
      dp,
      remaining,
      status,
      createdAt: todayStr,
      updatedAt: todayStr,
      notes: orderInput.notes || ''
    };

    updateDataState((prev) => ({
      ...prev,
      orders: [newOrder, ...(prev.orders || [])]
    }));

    return newOrder;
  };

  // Record balance payment (pelunasan)
  const payOrderBalance = (orderId, paymentAmount) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const amount = Number(paymentAmount) || 0;
    let targetCustomerName = '';

    updateDataState((prev) => {
      const updatedOrders = prev.orders.map((ord) => {
        if (ord.id === orderId) {
          targetCustomerName = ord.customerName;
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

      const newIncomeEntry = {
        id: `INC-PEL-${orderId}-${Date.now().toString().slice(-4)}`,
        date: todayStr,
        category: 'Pelunasan Order',
        amount: amount,
        description: `Pelunasan Order #${orderId} - ${targetCustomerName}`
      };

      return {
        ...prev,
        orders: updatedOrders,
        manualIncomes: [newIncomeEntry, ...(prev.manualIncomes || [])]
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

  // Set Initial Balance (Saldo Awal) per month
  const setInitialBalance = (amount, month = selectedMonth) => {
    updateDataState((prev) => {
      const currentBalances = prev.initialBalances || {};
      return {
        ...prev,
        initialBalances: {
          ...currentBalances,
          [month]: Number(amount) || 0
        }
      };
    });
  };

  // Export full monthly report to Excel (CSV format compatible with Excel & Google Sheets)
  const exportToExcel = () => {
    const monthlyOrders = data.orders.filter(
      (o) => o.createdAt && o.createdAt.startsWith(selectedMonth)
    );
    const monthlyExpenses = data.expenses.filter(
      (e) => e.date && e.date.startsWith(selectedMonth)
    );
    const monthlyManualIncomes = data.manualIncomes.filter(
      (i) => i.date && i.date.startsWith(selectedMonth)
    );

    const initialBalance = (data.initialBalances && data.initialBalances[selectedMonth]) || 0;

    const totalIncome =
      monthlyOrders.reduce((acc, o) => acc + (o.dp || 0), 0) +
      monthlyManualIncomes.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalExpense = monthlyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const finalCashBalance = initialBalance + totalIncome - totalExpense;

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel character rendering

    // Section 1: Ringkasan Usaha
    csvContent += `=== MENGUDARA SCREEN PRINTING - LAPORAN PERIODE ${selectedMonth} ===\n\n`;
    csvContent += `RINGKASAN KEUANGAN BULANAN\n`;
    csvContent += `Periode,Saldo Awal Kas,Total Pemasukan,Total Pengeluaran,Keuntungan Bersih (Profit/Loss),Total Saldo Kas Akhir\n`;
    csvContent += `"${selectedMonth}","Rp ${initialBalance.toLocaleString('id-ID')}","Rp ${totalIncome.toLocaleString('id-ID')}","Rp ${totalExpense.toLocaleString('id-ID')}","Rp ${netProfit.toLocaleString('id-ID')}","Rp ${finalCashBalance.toLocaleString('id-ID')}"\n\n`;

    // Section 2: Orderan Masuk & Transaksi
    csvContent += `DAFTAR ORDERAN DAN TRANSAKSI PELANGGAN\n`;
    csvContent += `ID Order,Tanggal,Nama Pelanggan,No Telp/WA,Alamat,Judul Orderan,Merek Kain,Lengan,Warna,Ukuran (S/M/L/XL/XXL),Jumlah (Pcs),Total Harga,DP Masuk,Sisa Pembayaran,Status\n`;
    
    if (data.orders.length === 0) {
      csvContent += `Belum ada orderan tercatat.\n`;
    } else {
      data.orders.forEach((o) => {
        const sizesStr = Object.entries(o.sizes || {})
          .map(([k, v]) => `${k}:${v}`)
          .join(' ');

        let detailTitle = o.orderTitle || '';
        if (Array.isArray(o.items) && o.items.length > 1) {
          const itemsDetail = o.items
            .map((it, idx) => {
              const szStr = Object.entries(it.sizes || {})
                .filter(([_, q]) => Number(q) > 0)
                .map(([k, v]) => `${k}:${v}`)
                .join(' ');
              return `[Item ${idx + 1}] ${it.fabricBrand} (${it.sleeveType}) - ${it.color} (${szStr}) = ${it.quantity}pcs @Rp ${(it.unitPrice || 0).toLocaleString('id-ID')}`;
            })
            .join('; ');
          detailTitle += ` (${itemsDetail})`;
        }

        csvContent += `"${o.id}","${o.createdAt || ''}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.customerAddress || '').replace(/"/g, '""')}","${detailTitle.replace(/"/g, '""')}","${o.fabricBrand || ''}","${o.sleeveType || ''}","${o.color || ''}","${sizesStr}","${o.quantity || 0}","Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}","Rp ${(o.dp || 0).toLocaleString('id-ID')}","Rp ${(o.remaining || 0).toLocaleString('id-ID')}","${o.status || ''}"\n`;
      });
    }
    csvContent += `\n`;

    // Section 3: Pengeluaran Usaha
    csvContent += `DAFTAR PENGELUARAN USAHA\n`;
    csvContent += `ID Pengeluaran,Tanggal,Kategori,Keterangan/Deskripsi,Nominal\n`;
    if (data.expenses.length === 0) {
      csvContent += `Belum ada pengeluaran tercatat.\n`;
    } else {
      data.expenses.forEach((e) => {
        csvContent += `"${e.id}","${e.date || ''}","${e.category || ''}","${(e.description || '').replace(/"/g, '""')}","Rp ${(e.amount || 0).toLocaleString('id-ID')}"\n`;
      });
    }
    csvContent += `\n`;

    // Section 4: Pemasukan Manual
    csvContent += `DAFTAR PEMASUKAN MANUAL & PELUNASAN\n`;
    csvContent += `ID Pemasukan,Tanggal,Kategori,Keterangan/Deskripsi,Nominal\n`;
    if (data.manualIncomes.length === 0) {
      csvContent += `Belum ada pemasukan manual tercatat.\n`;
    } else {
      data.manualIncomes.forEach((i) => {
        csvContent += `"${i.id}","${i.date || ''}","${i.category || ''}","${(i.description || '').replace(/"/g, '""')}","Rp ${(i.amount || 0).toLocaleString('id-ID')}"\n`;
      });
    }
    csvContent += `\n`;

    // Section 5: Stok Kaos & Kain
    csvContent += `REKAP STOK KAOS DAN BAHAN KAIN\n`;
    csvContent += `Merek Kain,Jenis Lengan,Warna Kain,Ukuran S,Ukuran M,Ukuran L,Ukuran XL,Ukuran XXL,Total Stok (Pcs)\n`;
    if (data.inventory) {
      Object.entries(data.inventory).forEach(([brand, sleeves]) => {
        if (sleeves && typeof sleeves === 'object') {
          Object.entries(sleeves).forEach(([sleeve, items]) => {
            if (Array.isArray(items)) {
              items.forEach((item) => {
                const s = item.sizes || {};
                const totalPcs = Object.values(s).reduce((a, b) => a + Number(b || 0), 0);
                csvContent += `"${brand}","${sleeve}","${item.color || ''}","${s.S || 0}","${s.M || 0}","${s.L || 0}","${s.XL || 0}","${s.XXL || 0}","${totalPcs} pcs"\n`;
              });
            }
          });
        }
      });
    }

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Excel_Mengudara_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export & Import JSON Backup
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

  // Delete Expense
  const deleteExpense = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pencatatan pengeluaran ini?')) {
      updateDataState((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id)
      }));
    }
  };

  // Delete Manual Income
  const deleteManualIncome = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pencatatan pemasukan ini?')) {
      updateDataState((prev) => ({
        ...prev,
        manualIncomes: prev.manualIncomes.filter((i) => i.id !== id)
      }));
    }
  };

  // Delete Order
  const deleteOrder = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus orderan ini dari riwayat?')) {
      updateDataState((prev) => ({
        ...prev,
        orders: prev.orders.filter((o) => o.id !== id)
      }));
    }
  };

  // Clear Financial Transactions to Rp 0
  const clearFinancialData = () => {
    if (window.confirm('Apakah Anda yakin ingin MENGOSONGKAN SEMUA Pemasukan & Pengeluaran agar hitungan dimulai dari Rp 0?')) {
      updateDataState((prev) => ({
        ...prev,
        orders: [],
        expenses: [],
        manualIncomes: []
      }));
    }
  };

  // Reset ALL Data to Zero (Fresh Start)
  const resetAllToZero = () => {
    if (window.confirm('Apakah Anda yakin ingin MENGOSONGKAN SELURUH DATA (Transaksi, Stok, & Sisa Kain) menjadi 0 untuk memulai usaha dari awal?')) {
      updateDataState((prev) => {
        const cleanInventory = JSON.parse(JSON.stringify(prev.inventory || {}));
        Object.keys(cleanInventory).forEach((brand) => {
          Object.keys(cleanInventory[brand]).forEach((sleeve) => {
            if (Array.isArray(cleanInventory[brand][sleeve])) {
              cleanInventory[brand][sleeve].forEach((item) => {
                item.sizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
              });
            }
          });
        });

        return {
          orders: [],
          expenses: [],
          manualIncomes: [],
          leftovers: [],
          inventory: cleanInventory
        };
      });
    }
  };

  const resetData = () => {
    if (window.confirm('Apakah Anda yakin ingin memuat kembali data demo contoh awal?')) {
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
        deleteExpense,
        addManualIncome,
        deleteManualIncome,
        deleteOrder,
        updateStockVariant,
        addStockVariant,
        deleteStockVariant,
        deleteFabricBrand,
        addLeftover,
        deleteLeftover,
        exportDataJSON,
        exportToExcel,
        importDataJSON,
        clearFinancialData,
        resetAllToZero,
        resetData,
        setInitialBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
