import { supabase } from '@/lib/supabase';

export default async function TestDB() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className="bg-green-100 p-4 rounded mb-4">
        ✅ Connected successfully! Found {products?.length} products
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  );
}
