import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Users, Award, ArrowUpRight } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { orders, products, currency } = useApp();

  // Monthly Sales & Revenue mock data
  const monthlyData = [
    { month: 'Jan', revenue: 1250000, orders: 84 },
    { month: 'Feb', revenue: 1480000, orders: 96 },
    { month: 'Mar', revenue: 1820000, orders: 120 },
    { month: 'Apr', revenue: 2150000, orders: 145 },
    { month: 'May', revenue: 2600000, orders: 180 },
    { month: 'Jun', revenue: 2950000, orders: 210 },
    { month: 'Jul', revenue: 3400000, orders: 242 },
    { month: 'Aug', revenue: 3890000, orders: 275 }
  ];

  const categoryShare = [
    { name: 'Luxury Pret', value: 42, color: '#D4AF37' },
    { name: 'Pret', value: 28, color: '#9E8055' },
    { name: 'Unstitched', value: 22, color: '#8A9A86' },
    { name: 'Accessories', value: 8, color: '#D8A48F' }
  ];

  const totalRevenue = monthlyData.reduce((acc, item) => acc + item.revenue, 0);
  const totalOrders = monthlyData.reduce((acc, item) => acc + item.orders, 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#222]">Analytics & Sales Intelligence</h2>
        <p className="text-xs text-gray-500">Real-time revenue metrics, order velocity, and category performance breakdown.</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{formatPrice(totalRevenue, currency)}</p>
          <span className="text-[10px] text-green-700 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +24.8% vs last month
          </span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#9E8055]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{totalOrders}</p>
          <span className="text-[10px] text-green-700 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18.2% conversion rate
          </span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Average Order Value</span>
            <Award className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">
            {formatPrice(Math.round(totalRevenue / totalOrders), currency)}
          </p>
          <span className="text-[10px] text-gray-500 font-semibold">
            Based on 1,352 customer checkouts
          </span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Conversion Rate</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">3.84%</p>
          <span className="text-[10px] text-green-700 font-semibold flex items-center gap-0.5">
            Top 5% international fashion benchmark
          </span>
        </div>
      </div>

      {/* Revenue & Sales Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Growth Line Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-3">
            <h3 className="font-serif text-base font-bold text-[#222]">Revenue Growth (PKR)</h3>
            <span className="text-xs text-gray-400 font-medium">Monthly Trend 2026</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#222', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#EAE4DC] pb-3">
            <h3 className="font-serif text-base font-bold text-[#222]">Category Revenue Share</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {categoryShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
                <Legend tick={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
          Top Performing Products by Units Sold
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC]">
                <th className="p-3 font-semibold">Product Title</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold">Rating</th>
                <th className="p-3 font-semibold text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {products.slice(0, 5).map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAFAFA]">
                  <td className="p-3 font-semibold text-[#222] flex items-center space-x-3">
                    <img src={prod.images[0]} alt="" className="w-8 h-10 object-cover rounded" />
                    <span>{prod.name}</span>
                  </td>
                  <td className="p-3 text-gray-600">{prod.category}</td>
                  <td className="p-3 font-bold">{formatPrice(prod.price, currency)}</td>
                  <td className="p-3">⭐ {prod.rating} ({prod.reviewsCount})</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prod.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prod.stock} units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
