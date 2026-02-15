'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { UserPlus, Mail, Copy, CheckCircle, Trash2, User, Settings as SettingsIcon, Home, Package, ShoppingCart, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [copied, setCopied] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
    
    const interval = setInterval(fetchCompanyData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        return;
      }
      
      setCurrentUserId(user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role, companies(name)')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        setLoading(false);
        return;
      }

      if (profile?.companies) {
        setCompanyName((profile.companies as any).name);
        setCompanyId(profile.company_id);
        setCurrentUserRole(profile.role);
      }

      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile?.company_id)
        .order('created_at', { ascending: true });
      
      if (staffError) {
        console.error('Staff error:', staffError);
      }
      
      setStaff(staffData || []);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  const copyCompanyCode = () => {
    navigator.clipboard.writeText(companyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (staffId === currentUserId) {
      alert("You can't delete yourself!");
      return;
    }

    if (!confirm(`Remove ${staffName} from the company? They will lose access to all inventory data.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      alert('Staff member removed successfully');
      fetchCompanyData();
    } catch (error: any) {
      alert('Error removing staff: ' + error.message);
    }
  };

  const isAdmin = currentUserRole === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">{companyName}</p>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/30">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Company Settings
              </h1>
              <p className="text-sm text-gray-600">{companyName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 lg:py-8 space-y-4 lg:space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyId}
                  disabled
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-xs font-mono"
                />
                <button
                  onClick={copyCompanyCode}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 flex items-center gap-2 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="hidden sm:inline text-green-600 font-medium text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this ID with staff members
              </p>
            </div>
          </div>
        </div>

        {/* How to Add Staff */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 lg:p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            How to Add Staff
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <span>Copy Company ID above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <span>Send to staff member</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <span>Staff creates account with Company ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
              <span>They can login and access inventory!</span>
            </li>
          </ol>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Team ({staff.length})
            </h2>
            {!isAdmin && (
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
                View Only
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {staff.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-sm">
                No staff members yet
              </p>
            ) : (
              staff.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 lg:p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 lg:p-3 rounded-xl flex-shrink-0">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{member.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs rounded-xl capitalize font-bold ${
                      member.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700' 
                        : member.role === 'manager'
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                    
                    {isAdmin && member.id !== currentUserId && (
                      <button
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    )}
                    
                    {member.id === currentUserId && (
                      <span className="text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-2 lg:px-3 py-1 lg:py-1.5 rounded-xl font-bold">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!isAdmin && (
            <p className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-xl">
              Only admins can remove staff
            </p>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
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
          <Link href="/settings" className="flex flex-col items-center justify-center py-3 text-indigo-600 bg-indigo-50">
            <SettingsIcon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
