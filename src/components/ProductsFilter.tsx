'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';

interface ProductsFilterProps {
  categories: string[];
}

export default function ProductsFilter({ categories }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  const updateFilters = (newSearch: string, newCategory: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCategory !== 'all') params.set('category', newCategory);
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateFilters(value, category);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilters(search, value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    startTransition(() => {
      router.push('/products');
    });
  };

  const hasFilters = search || category !== 'all';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isPending && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="md:col-span-2">
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              disabled={isPending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: "{search}"
              <button
                onClick={() => handleSearchChange('')}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Category: {category}
              <button
                onClick={() => handleCategoryChange('all')}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
