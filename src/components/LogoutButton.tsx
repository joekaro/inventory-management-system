'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}