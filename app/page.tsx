'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Package, ShoppingCart, Activity, Settings, Home, BarChart3, Plus, MapPin, TrendingUp, FileText, AlertTriangle, ArrowUp, DollarSign } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalLocations: 0,
    totalValue: 0,
    totalSales: 0,
    todayRevenue: 0,
    monthRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login';
      return;
    }
    
    setUser(session.user);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, companies(name)')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.companies) {
      setCompanyName((profile.companies as any).name);
    }
    
    await fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: products } = await supabase.from('products').select('*');
    const { data: locations } = await supabase.from('locations').select('*');
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*, products(reorder_point, selling_price, cost_price)');

    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;
    const today = new Date().toDateString();
    const todayRevenue = sales?.filter(s => new Date(s.created_at).toDateString() === today)
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;
    
    const thisMonth = new Date().getMonth();
    const monthRevenue = sales?.filter(s => new Date(s.created_at).getMonth() === thisMonth)
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;

    const totalValue = inventory?.reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.selling_price || 0));
    }, 0) || 0;

    setStats({
      totalProducts: products?.length || 0,
      lowStockItems: inventory?.filter((item: any) => 
        item.quantity < (item.products?.reorder_point || 0)
      ).length || 0,
      totalLocations: locations?.length || 0,
      totalValue,
      totalSales: sales?.length || 0,
      todayRevenue,
      monthRevenue,
    });

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentActivity(logs || []);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDay = last7Days.map(date => {
      const daySales = sales?.filter(s => s.created_at.startsWith(date)) || [];
      const revenue = daySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: revenue,
        sales: daySales.length,
      };
    });
    setSalesData(salesByDay);

    const categoryMap: any = {};
    products?.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat]++;
    });
    const catData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    setCategoryData(catData);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{companyName}</h1>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {companyName || 'Inventory Management'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <LogoutButton />
              <Link 
                href="/products/new"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-500/30 transition-all"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Mobile Stats - 2 columns, compact */}
        <div className="grid grid-cols-2 gap-3 mb-4 lg:hidden">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Products</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Low Stock</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Sales</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalSales}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Value</p>
            </div>
            <p className="text-lg font-bold text-green-600">₦{(stats.totalValue / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Desktop Stats - 4 columns */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" /> Active
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockItems}</p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Needs attention
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalSales}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" /> ₦{stats.monthRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₦{(stats.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">Total worth</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg shadow-green-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions - Horizontal Scroll */}
        <div className="lg:hidden mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 px-1">Quick Actions</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Link href="/products" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-blue-100 p-3 rounded-xl mb-2 w-fit">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Products</p>
            </Link>
            <Link href="/sales/new" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-purple-100 p-3 rounded-xl mb-2 w-fit">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">New Sale</p>
            </Link>
            <Link href="/locations" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-green-100 p-3 rounded-xl mb-2 w-fit">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Locations</p>
            </Link>
            <Link href="/inventory" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-teal-100 p-3 rounded-xl mb-2 w-fit">
                <BarChart3 className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Stock</p>
            </Link>
            <Link href="/reports" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-orange-100 p-3 rounded-xl mb-2 w-fit">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Reports</p>
            </Link>
            <Link href="/logs" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-indigo-100 p-3 rounded-xl mb-2 w-fit">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Activity</p>
            </Link>
            <Link href="/sales" className="flex-shrink-0 w-32 bg-white rounded-2xl p-4 border-2 border-gray-200 active:scale-95 transition-transform">
              <div className="bg-pink-100 p-3 rounded-xl mb-2 w-fit">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">All Sales</p>
            </Link>
          </div>
        </div>

        {/* Mobile Chart - Simplified */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sales (7 Days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={salesData}>
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desktop Charts */}
        <div className="hidden lg:grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desktop Quick Actions & Activity */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/products" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <Package className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Products</p>
                <p className="text-xs text-gray-500">Manage inventory</p>
              </Link>
              <Link href="/sales/new" className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <ShoppingCart className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">New Sale</p>
                <p className="text-xs text-gray-500">Record transaction</p>
              </Link>
              <Link href="/locations" className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <MapPin className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Locations</p>
                <p className="text-xs text-gray-500">Manage sites</p>
              </Link>
              <Link href="/inventory" className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <FileText className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Stock Movements</p>
                <p className="text-xs text-gray-500">View transfers</p>
              </Link>
              <Link href="/reports" className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all group">
                <TrendingUp className="w-8 h-8 text-pink-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Reports</p>
                <p className="text-xs text-gray-500">View analytics</p>
              </Link>
              <Link href="/logs" className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <Activity className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Activity Logs</p>
                <p className="text-xs text-gray-500">Track changes</p>
              </Link>
              <Link href="/sales" className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group">
                <ShoppingCart className="w-8 h-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Sales</p>
                <p className="text-xs text-gray-500">View all sales</p>
              </Link>
              <Link href="/settings" className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all group">
                <Settings className="w-8 h-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-xs text-gray-500">Company settings</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link href="/logs" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Activity className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{log.details}</p>
                    <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-3 text-blue-600 bg-blue-50">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">Products</span>
          </Link>
          <Link href="/products/new" className="flex flex-col items-center justify-center py-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-2xl shadow-lg -mt-6">
              <Plus className="w-6 h-6" />
            </div>
          </Link>
          <Link href="/sales" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Sales</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
