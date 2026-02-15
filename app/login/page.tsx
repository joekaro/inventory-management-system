'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Package, TrendingUp, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex">
      {/* Left Side - Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
        <h1 className="text-5xl font-bold mb-6">Inventory Management System</h1>
        <p className="text-xl mb-8 text-blue-100">
          Streamline your inventory, boost your productivity, and grow your business.
        </p>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Multi-Location Tracking</h3>
              <p className="text-blue-100">Manage inventory across warehouses and stores</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Real-Time Analytics</h3>
              <p className="text-blue-100">Get insights with comprehensive reports</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Stock Alerts</h3>
              <p className="text-blue-100">Never run out with automated low-stock alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your inventory</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              Create company account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}