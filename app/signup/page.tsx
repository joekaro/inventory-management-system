'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [isNewCompany, setIsNewCompany] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isNewCompany) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: companyName, owner_id: authData.user.id }])
          .select()
          .single();

        if (companyError) throw companyError;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            name: name,
            email: email,
            company_id: companyData.id,
            role: 'admin'
          }]);

        if (profileError) throw profileError;

        alert('Company account created! You can now login.');
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            name: name,
            email: email,
            company_id: companyId,
            role: 'staff'
          }]);

        if (profileError) throw profileError;

        alert('Account created! You joined the company. You can now login.');
      }

      router.push('/login');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">Join your company's inventory system</p>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsNewCompany(true)}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              isNewCompany ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            New Company
          </button>
          <button
            type="button"
            onClick={() => setIsNewCompany(false)}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              !isNewCompany ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Join Company
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {isNewCompany && (
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Acme Corp"
              />
            </div>
          )}

          {!isNewCompany && (
            <div>
              <label className="block text-sm font-medium mb-1">Company ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
                placeholder="Paste company ID from your admin"
              />
              <p className="text-xs text-gray-500 mt-1">Get this from your company admin</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Your Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : isNewCompany ? 'Create Company' : 'Join Company'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
