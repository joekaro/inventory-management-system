'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('action', filter);
    }

    const { data, error } = await query;
    
    console.log('Logs data:', data);
    console.log('Logs error:', error);

    // Fetch user details separately
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(log => log.user_id).filter(Boolean))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const usersMap = new Map(users?.map(u => [u.id, u]) || []);
      
      const logsWithUsers = data.map(log => ({
        ...log,
        user: usersMap.get(log.user_id)
      }));
      
      setLogs(logsWithUsers);
    } else {
      setLogs(data || []);
    }
    
    setLoading(false);
  };

  const actionColors: any = {
    'PRODUCT_CREATED': 'bg-green-100 text-green-800',
    'PRODUCT_UPDATED': 'bg-blue-100 text-blue-800',
    'PRODUCT_DELETED': 'bg-red-100 text-red-800',
    'SALE_CREATED': 'bg-purple-100 text-purple-800',
    'STOCK_ADJUSTED': 'bg-yellow-100 text-yellow-800',
    'TEST': 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{logs.length} activities</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'PRODUCT_CREATED', 'SALE_CREATED', 'STOCK_ADJUSTED', 'TEST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        actionColors[log.action] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">
                        by {log.user?.name || log.user?.email || 'System'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{log.details}</p>
                    {log.entity_type && (
                      <p className="text-xs text-gray-500 mt-1">
                        Entity: {log.entity_type} {log.entity_id && `(${log.entity_id.slice(0, 8)}...)`}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {logs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter !== 'all' ? 'Try changing the filter' : 'Create some products or sales to see logs'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
