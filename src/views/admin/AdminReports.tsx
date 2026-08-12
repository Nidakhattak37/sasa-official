import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { generatePDFReport, generateExcelReport } from '../../utils/reportExporter';
import {
  FileText, Download, Calendar, Filter, ShoppingBag, DollarSign,
  Package, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw,
  Search, CheckCircle2, Clock, XCircle, ShieldAlert, Layers
} from 'lucide-react';

interface InventoryTx {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: string;
  qtyIn: number;
  qtyOut: number;
  balance: number;
  note: string;
}

export const AdminReports: React.FC = () => {
  const { orders, products, updateProduct, categories } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'orders' | 'sales' | 'ledger' | 'inventory' | 'lowstock'>('orders');

  // Ledger state from backend
  const [ledgerTx, setLedgerTx] = useState<InventoryTx[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Date Range Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickTimeframe, setQuickTimeframe] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');

  // Specific Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');

  // Fetch Inventory Ledger from API
  const fetchLedger = async () => {
    setLoadingLedger(true);
    try {
      const res = await fetch('/api/inventory/transactions');
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setLedgerTx(data.transactions);
      }
    } catch (err) {
      console.warn('Failed to fetch ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Set preset dates
  const handleQuickTimeframeChange = (type: 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month') => {
    setQuickTimeframe(type);
    const now = new Date();
    if (type === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      const yestStr = yest.toISOString().slice(0, 10);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (type === 'this_week') {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (type === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Date Filter Check
  const isDateInRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;
    const d = new Date(dateStr).getTime();
    if (startDate) {
      const s = new Date(startDate + 'T00:00:00').getTime();
      if (d < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate + 'T23:59:59').getTime();
      if (d > e) return false;
    }
    return true;
  };

  // 1. ORDERS REPORT LOGIC
  const filteredOrders = orders.filter(o => {
    if (!isDateInRange(o.createdAt)) return false;
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (paymentStatusFilter !== 'all' && o.paymentStatus !== paymentStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.shippingAddress?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.shippingAddress?.phone?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const ordersTotalCount = filteredOrders.length;
  const ordersTotalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const ordersAvgValue = ordersTotalCount > 0 ? Math.round(ordersTotalRevenue / ordersTotalCount) : 0;
  const ordersDeliveredCount = filteredOrders.filter(o => o.orderStatus === 'Delivered').length;

  const exportOrdersPDF = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Status', 'Payment', 'Total (PKR)'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt ? o.createdAt.slice(0, 10) : 'N/A',
      o.shippingAddress?.fullName || 'Guest Customer',
      o.shippingAddress?.phone || 'N/A',
      o.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'N/A',
      o.orderStatus,
      o.paymentStatus,
      `PKR ${o.totalAmount.toLocaleString()}`
    ]);

    generatePDFReport({
      reportTitle: 'Customer Orders Detailed Audit Report',
      subtitle: 'SASA Official E-Commerce Orders Log',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      summaryCards: [
        { label: 'Total Orders', value: String(ordersTotalCount) },
        { label: 'Total Revenue', value: `PKR ${ordersTotalRevenue.toLocaleString()}` },
        { label: 'Average Order Value', value: `PKR ${ordersAvgValue.toLocaleString()}` },
        { label: 'Delivered Orders', value: String(ordersDeliveredCount) }
      ],
      headers,
      rows,
      fileName: 'SASA_Orders_Report'
    });
  };

  const exportOrdersExcel = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Phone', 'City', 'Items Purchased', 'Subtotal', 'Discount', 'Shipping', 'Total Amount (PKR)', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt,
      o.shippingAddress?.fullName || 'Guest',
      o.shippingAddress?.phone || '',
      o.shippingAddress?.city || '',
      o.items?.map(i => `${i.productName} x${i.quantity}`).join('; ') || '',
      o.subtotal || o.totalAmount,
      o.discountAmount || 0,
      o.shippingFee || 0,
      o.totalAmount,
      o.paymentMethod || 'COD',
      o.paymentStatus,
      o.orderStatus
    ]);

    generateExcelReport({
      reportTitle: 'Customer Orders Detailed Report',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      summaryCards: [
        { label: 'Total Orders', value: String(ordersTotalCount) },
        { label: 'Total Revenue', value: `PKR ${ordersTotalRevenue.toLocaleString()}` },
        { label: 'Average Order Value', value: `PKR ${ordersAvgValue.toLocaleString()}` }
      ],
      headers,
      rows,
      fileName: 'SASA_Orders_Report'
    });
  };

  // 2. SALES REPORT LOGIC
  const validSalesOrders = filteredOrders.filter(o => o.orderStatus !== 'Cancelled');
  const totalGrossSales = validSalesOrders.reduce((acc, o) => acc + (o.subtotal || o.totalAmount), 0);
  const totalDiscounts = validSalesOrders.reduce((acc, o) => acc + (o.discountAmount || 0), 0);
  const totalShipping = validSalesOrders.reduce((acc, o) => acc + (o.shippingFee || 0), 0);
  const totalNetSales = validSalesOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Product level sales map
  const productSalesMap = new Map<string, { id: string; name: string; sku: string; category: string; qty: number; revenue: number }>();
  validSalesOrders.forEach(o => {
    if (Array.isArray(o.items)) {
      o.items.forEach(i => {
        const key = i.productId || i.productName;
        const existing = productSalesMap.get(key) || {
          id: i.productId,
          name: i.productName,
          sku: i.sku || 'N/A',
          category: i.category || 'Apparel',
          qty: 0,
          revenue: 0
        };
        existing.qty += i.quantity;
        existing.revenue += (i.price * i.quantity);
        productSalesMap.set(key, existing);
      });
    }
  });

  const productSalesList = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  const exportSalesPDF = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Units Sold', 'Total Revenue (PKR)'];
    const rows = productSalesList.map(p => [
      p.name,
      p.sku,
      p.category,
      p.qty,
      `PKR ${p.revenue.toLocaleString()}`
    ]);

    generatePDFReport({
      reportTitle: 'Sales & Revenue Financial Report',
      subtitle: 'Product Performance & Net Revenue Breakdown',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      summaryCards: [
        { label: 'Gross Sales', value: `PKR ${totalGrossSales.toLocaleString()}` },
        { label: 'Discounts Given', value: `PKR ${totalDiscounts.toLocaleString()}` },
        { label: 'Shipping Fees', value: `PKR ${totalShipping.toLocaleString()}` },
        { label: 'Net Sales Revenue', value: `PKR ${totalNetSales.toLocaleString()}` }
      ],
      headers,
      rows,
      fileName: 'SASA_Sales_Financial_Report'
    });
  };

  const exportSalesExcel = () => {
    const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Units Sold', 'Total Revenue (PKR)'];
    const rows = productSalesList.map(p => [
      p.id,
      p.name,
      p.sku,
      p.category,
      p.qty,
      p.revenue
    ]);

    generateExcelReport({
      reportTitle: 'Sales Financial Summary Report',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      summaryCards: [
        { label: 'Gross Sales', value: `PKR ${totalGrossSales.toLocaleString()}` },
        { label: 'Total Discounts', value: `PKR ${totalDiscounts.toLocaleString()}` },
        { label: 'Net Sales', value: `PKR ${totalNetSales.toLocaleString()}` }
      ],
      headers,
      rows,
      fileName: 'SASA_Sales_Financial_Report'
    });
  };

  // 3. INVENTORY LEDGER REPORT LOGIC
  const filteredLedger = ledgerTx.filter(tx => {
    if (!isDateInRange(tx.date)) return false;
    if (ledgerTypeFilter !== 'all' && tx.type !== ledgerTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!tx.productName?.toLowerCase().includes(q) && !tx.sku?.toLowerCase().includes(q) && !tx.note?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const exportLedgerPDF = () => {
    const headers = ['Date / Time', 'Product Name', 'SKU', 'Movement Type', 'Qty In', 'Qty Out', 'Ending Balance', 'Reference Note'];
    const rows = filteredLedger.map(tx => [
      tx.date ? new Date(tx.date).toLocaleString() : 'N/A',
      tx.productName,
      tx.sku,
      tx.type,
      tx.qtyIn > 0 ? `+${tx.qtyIn}` : '-',
      tx.qtyOut > 0 ? `-${tx.qtyOut}` : '-',
      tx.balance,
      tx.note || ''
    ]);

    generatePDFReport({
      reportTitle: 'Inventory Stock Movement Ledger Audit',
      subtitle: 'Automated Real-Time Stock Transaction Records',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      summaryCards: [
        { label: 'Total Movements', value: String(filteredLedger.length) },
        { label: 'Total Inflow (Qty)', value: String(filteredLedger.reduce((sum, t) => sum + t.qtyIn, 0)) },
        { label: 'Total Outflow (Qty)', value: String(filteredLedger.reduce((sum, t) => sum + t.qtyOut, 0)) }
      ],
      headers,
      rows,
      fileName: 'SASA_Inventory_Ledger_Report'
    });
  };

  const exportLedgerExcel = () => {
    const headers = ['Transaction ID', 'Date & Time', 'Product Name', 'SKU', 'Movement Type', 'Qty In', 'Qty Out', 'Ending Stock Balance', 'Reference Note'];
    const rows = filteredLedger.map(tx => [
      tx.id,
      tx.date,
      tx.productName,
      tx.sku,
      tx.type,
      tx.qtyIn,
      tx.qtyOut,
      tx.balance,
      tx.note
    ]);

    generateExcelReport({
      reportTitle: 'Inventory Stock Movement Ledger Audit',
      dateRangeStr: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
      headers,
      rows,
      fileName: 'SASA_Inventory_Ledger_Report'
    });
  };

  // 4. CURRENT INVENTORY REPORT LOGIC
  const activeUnfulfilledOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const reservedStockMap = new Map<string, number>();
  activeUnfulfilledOrders.forEach(o => {
    o.items?.forEach(i => {
      const prev = reservedStockMap.get(i.productId) || 0;
      reservedStockMap.set(i.productId, prev + i.quantity);
    });
  });

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalInventoryValuation = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalStockUnits = filteredProducts.reduce((sum, p) => sum + p.stock, 0);

  const exportInventoryPDF = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Unit Price', 'Current Stock', 'Reserved', 'Available', 'Inventory Value (PKR)'];
    const rows = filteredProducts.map(p => {
      const reserved = reservedStockMap.get(p.id) || 0;
      const available = Math.max(0, p.stock - reserved);
      return [
        p.sku,
        p.name,
        p.category,
        `PKR ${p.price.toLocaleString()}`,
        p.stock,
        reserved,
        available,
        `PKR ${(p.price * p.stock).toLocaleString()}`
      ];
    });

    generatePDFReport({
      reportTitle: 'Current Stock & Inventory Valuation Report',
      subtitle: 'SASA Official Warehouse Inventory Valuation',
      summaryCards: [
        { label: 'Total Active SKUs', value: String(filteredProducts.length) },
        { label: 'Total Units in Stock', value: `${totalStockUnits.toLocaleString()} units` },
        { label: 'Total Valuation', value: `PKR ${totalInventoryValuation.toLocaleString()}` }
      ],
      headers,
      rows,
      fileName: 'SASA_Current_Inventory_Report'
    });
  };

  const exportInventoryExcel = () => {
    const headers = ['Product ID', 'SKU', 'Product Name', 'Category', 'Piece Type', 'Unit Price (PKR)', 'Stock Quantity', 'Reserved Stock', 'Available Stock', 'Total Inventory Value (PKR)'];
    const rows = filteredProducts.map(p => {
      const reserved = reservedStockMap.get(p.id) || 0;
      return [
        p.id,
        p.sku,
        p.name,
        p.category,
        p.pieceType || '3 Piece',
        p.price,
        p.stock,
        reserved,
        Math.max(0, p.stock - reserved),
        p.price * p.stock
      ];
    });

    generateExcelReport({
      reportTitle: 'Current Stock Valuation Report',
      summaryCards: [
        { label: 'Total Active SKUs', value: String(filteredProducts.length) },
        { label: 'Total Inventory Value', value: `PKR ${totalInventoryValuation.toLocaleString()}` }
      ],
      headers,
      rows,
      fileName: 'SASA_Current_Inventory_Report'
    });
  };

  // 5. LOW STOCK REPORT LOGIC
  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);

  const exportLowStockPDF = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Price (PKR)', 'Stock Remaining', 'Urgency Level'];
    const rows = lowStockProducts.map(p => [
      p.sku,
      p.name,
      p.category,
      `PKR ${p.price.toLocaleString()}`,
      p.stock,
      p.stock === 0 ? 'CRITICAL OUT OF STOCK' : p.stock < 5 ? 'CRITICAL LOW' : 'LOW'
    ]);

    generatePDFReport({
      reportTitle: 'Low Stock & Reorder Alert Report',
      subtitle: `Products with Stock Less Than or Equal to ${lowStockThreshold} Units`,
      summaryCards: [
        { label: 'Low Stock Threshold', value: `${lowStockThreshold} units` },
        { label: 'Alert Items Count', value: `${lowStockProducts.length} SKUs` },
        { label: 'Out of Stock SKUs', value: String(lowStockProducts.filter(p => p.stock === 0).length) }
      ],
      headers,
      rows,
      fileName: 'SASA_Low_Stock_Alert_Report'
    });
  };

  const exportLowStockExcel = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Unit Price', 'Current Stock', 'Urgency Status'];
    const rows = lowStockProducts.map(p => [
      p.sku,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.stock === 0 ? 'Out of Stock' : p.stock < 5 ? 'Critical' : 'Low Stock'
    ]);

    generateExcelReport({
      reportTitle: 'Low Stock & Reorder Alert Report',
      headers,
      rows,
      fileName: 'SASA_Low_Stock_Report'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#222] text-[#D4AF37] rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#222]">
                Automated Business & Audit Reports
              </h1>
              <p className="text-xs text-gray-500 font-sans">
                Professional PDF & Excel exports for Orders, Sales Revenue, Stock Valuation, and Automated Inventory Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeReportTab === 'orders') exportOrdersPDF();
              else if (activeReportTab === 'sales') exportSalesPDF();
              else if (activeReportTab === 'ledger') exportLedgerPDF();
              else if (activeReportTab === 'inventory') exportInventoryPDF();
              else if (activeReportTab === 'lowstock') exportLowStockPDF();
            }}
            className="px-4 py-2.5 bg-[#1E1E24] hover:bg-[#D4AF37] text-white hover:text-[#1E1E24] text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm font-sans"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={() => {
              if (activeReportTab === 'orders') exportOrdersExcel();
              else if (activeReportTab === 'sales') exportSalesExcel();
              else if (activeReportTab === 'ledger') exportLedgerExcel();
              else if (activeReportTab === 'inventory') exportInventoryExcel();
              else if (activeReportTab === 'lowstock') exportLowStockExcel();
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm font-sans"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeReportTab === 'orders'
              ? 'bg-[#222] text-[#D4AF37] shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Report</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
            {filteredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReportTab('sales')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeReportTab === 'sales'
              ? 'bg-[#222] text-[#D4AF37] shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sales & Revenue Report</span>
        </button>

        <button
          onClick={() => setActiveReportTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeReportTab === 'ledger'
              ? 'bg-[#222] text-[#D4AF37] shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Automated Inventory Ledger</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-900 font-bold">
            {ledgerTx.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeReportTab === 'inventory'
              ? 'bg-[#222] text-[#D4AF37] shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Current Stock Valuation</span>
        </button>

        <button
          onClick={() => setActiveReportTab('lowstock')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeReportTab === 'lowstock'
              ? 'bg-[#222] text-[#D4AF37] shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Low Stock Alerts</span>
          {lowStockProducts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
              {lowStockProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            <span>Date & Timeframe Controls:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'today', 'yesterday', 'this_week', 'this_month'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => handleQuickTimeframeChange(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  quickTimeframe === preset
                    ? 'bg-[#222] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setQuickTimeframe('all'); }}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setQuickTimeframe('all'); }}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Search Text (ID / SKU / Name)
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
              />
            </div>
          </div>

          {/* Conditional filter based on active tab */}
          {activeReportTab === 'orders' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Order Status
              </label>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
              >
                <option value="all">All Order Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {activeReportTab === 'ledger' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Transaction Type
              </label>
              <select
                value={ledgerTypeFilter}
                onChange={e => setLedgerTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
              >
                <option value="all">All Transaction Types</option>
                <option value="Opening Stock">Opening Stock</option>
                <option value="Stock Added">Stock Added</option>
                <option value="Sale">Sale</option>
                <option value="Return">Return</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Cancellation">Cancellation</option>
              </select>
            </div>
          )}

          {(activeReportTab === 'inventory' || activeReportTab === 'sales') && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Product Category
              </label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeReportTab === 'lowstock' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#222]"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB CONTENT 1: ORDERS REPORT */}
      {activeReportTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Orders Matching
              </span>
              <span className="text-2xl font-serif font-bold text-[#222]">
                {ordersTotalCount}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Revenue
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-700">
                PKR {ordersTotalRevenue.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Average Order Value
              </span>
              <span className="text-2xl font-serif font-bold text-indigo-700">
                PKR {ordersAvgValue.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Fulfilled / Delivered
              </span>
              <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                {ordersDeliveredCount} orders
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#222]">
                Detailed Orders Log ({filteredOrders.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E24] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Items Summary</th>
                    <th className="p-3.5">Order Status</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No orders match the selected filters or date range.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50 transition">
                        <td className="p-3.5 font-bold font-mono text-[#222]">
                          {o.id}
                        </td>
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">
                          {o.createdAt ? o.createdAt.slice(0, 16) : 'N/A'}
                        </td>
                        <td className="p-3.5 font-medium text-gray-900">
                          {o.shippingAddress?.fullName || 'Guest Customer'}
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {o.shippingAddress?.phone || 'N/A'}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-gray-600">
                          {o.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            o.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {o.paymentMethod || 'COD'} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold font-mono text-gray-900">
                          PKR {o.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SALES & REVENUE REPORT */}
      {activeReportTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Gross Sales
              </span>
              <span className="text-2xl font-serif font-bold text-[#222]">
                PKR {totalGrossSales.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Discounts Issued
              </span>
              <span className="text-2xl font-serif font-bold text-amber-700">
                - PKR {totalDiscounts.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Shipping Collected
              </span>
              <span className="text-2xl font-serif font-bold text-blue-700">
                + PKR {totalShipping.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Net Sales Revenue
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-700">
                PKR {totalNetSales.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-serif font-bold text-base text-[#222]">
                Product-Level Sales Breakdown ({productSalesList.length} SKUs Sold)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E24] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Units Sold</th>
                    <th className="p-3.5 text-right">Total Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {productSalesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No product sales recorded in this timeframe.
                      </td>
                    </tr>
                  ) : (
                    productSalesList.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="p-3.5 font-bold text-[#222]">
                          {p.name}
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {p.sku}
                        </td>
                        <td className="p-3.5 text-gray-600">
                          {p.category}
                        </td>
                        <td className="p-3.5 text-center font-bold font-mono">
                          {p.qty} units
                        </td>
                        <td className="p-3.5 text-right font-bold font-mono text-emerald-800">
                          PKR {p.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AUTOMATED INVENTORY LEDGER */}
      {activeReportTab === 'ledger' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-sans">
              Continuous stock movement logs automatically recorded on initial product setup, manual edits, sales, returns, and cancellations.
            </div>
            <button
              onClick={fetchLedger}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E24] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Movement Type</th>
                    <th className="p-3.5 text-center text-emerald-400">Qty In</th>
                    <th className="p-3.5 text-center text-red-400">Qty Out</th>
                    <th className="p-3.5 text-center">Ending Balance</th>
                    <th className="p-3.5">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No inventory ledger records found matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition">
                        <td className="p-3.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {tx.date ? new Date(tx.date).toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-3.5 font-bold text-[#222]">
                          {tx.productName}
                        </td>
                        <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                          {tx.sku}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.type === 'Opening Stock' ? 'bg-purple-100 text-purple-900' :
                            tx.type === 'Stock Added' ? 'bg-emerald-100 text-emerald-900' :
                            tx.type === 'Sale' ? 'bg-blue-100 text-blue-900' :
                            tx.type === 'Return' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-900'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                          {tx.qtyIn > 0 ? `+${tx.qtyIn}` : '-'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-red-700">
                          {tx.qtyOut > 0 ? `-${tx.qtyOut}` : '-'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-[#222]">
                          {tx.balance}
                        </td>
                        <td className="p-3.5 text-gray-500">
                          {tx.note || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CURRENT INVENTORY REPORT */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Active Product SKUs
              </span>
              <span className="text-2xl font-serif font-bold text-[#222]">
                {filteredProducts.length} SKUs
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Physical Units
              </span>
              <span className="text-2xl font-serif font-bold text-indigo-700">
                {totalStockUnits.toLocaleString()} units
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Inventory Valuation
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-700">
                PKR {totalInventoryValuation.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E24] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-center">Total Stock</th>
                    <th className="p-3.5 text-center text-amber-600">Reserved</th>
                    <th className="p-3.5 text-center text-emerald-600">Available</th>
                    <th className="p-3.5 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No products match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const reserved = reservedStockMap.get(p.id) || 0;
                      const available = Math.max(0, p.stock - reserved);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="p-3.5 font-mono text-gray-500 font-bold text-[11px]">
                            {p.sku}
                          </td>
                          <td className="p-3.5 font-bold text-[#222]">
                            {p.name}
                          </td>
                          <td className="p-3.5 text-gray-600">
                            {p.category}
                          </td>
                          <td className="p-3.5 text-right font-mono font-medium">
                            PKR {p.price.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#222]">
                            {p.stock}
                          </td>
                          <td className="p-3.5 text-center font-mono text-amber-700 font-medium">
                            {reserved}
                          </td>
                          <td className="p-3.5 text-center font-mono text-emerald-700 font-bold">
                            {available}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                            PKR {(p.price * p.stock).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: LOW STOCK REPORT */}
      {activeReportTab === 'lowstock' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Stock Replenishment Alert Threshold: ≤ {lowStockThreshold} Units
                </h4>
                <p className="text-[11px] text-amber-800">
                  {lowStockProducts.length} product(s) require stock restocking to prevent order fulfillment delays.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E24] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Price</th>
                    <th className="p-3.5 text-center">Current Stock</th>
                    <th className="p-3.5">Urgency Level</th>
                    <th className="p-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        🎉 All products have comfortable stock levels above {lowStockThreshold} units.
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="p-3.5 font-mono text-gray-500 font-bold text-[11px]">
                          {p.sku}
                        </td>
                        <td className="p-3.5 font-bold text-[#222]">
                          {p.name}
                        </td>
                        <td className="p-3.5 text-gray-600">
                          {p.category}
                        </td>
                        <td className="p-3.5 text-right font-mono font-medium">
                          PKR {p.price.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-red-600 text-sm">
                          {p.stock}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.stock === 0 ? 'bg-red-600 text-white animate-pulse' :
                            p.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.stock === 0 ? 'OUT OF STOCK' : p.stock < 5 ? 'CRITICAL LOW' : 'LOW STOCK'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              const addQtyStr = window.prompt(`Restock Stock for ${p.name}\nEnter quantity to add:`, '25');
                              if (addQtyStr) {
                                const addQty = parseInt(addQtyStr, 10);
                                if (!isNaN(addQty) && addQty > 0) {
                                  updateProduct({
                                    ...p,
                                    stock: p.stock + addQty
                                  });
                                }
                              }
                            }}
                            className="px-3 py-1 bg-[#222] hover:bg-[#D4AF37] text-white hover:text-[#222] text-[11px] font-bold rounded-lg transition"
                          >
                            + Add Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
