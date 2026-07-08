'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, RefreshCw, Grid3X3 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  material: string;
  dimensions: string;
  stock: number;
}

interface Category {
  databaseId?: number | null;
  id?: string;
  name: string;
  slug: string;
  description: string;
}

interface ProductListingClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialMaterials: string[];
  initialMaxPrice: number;
  categories: Category[];
}

const ProductListingContent: React.FC<ProductListingClientProps> = ({ 
  initialProducts, 
  initialTotal, 
  initialMaterials, 
  initialMaxPrice, 
  categories 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialTotal);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(initialTotal / 24));

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Helper to build URL search queries
  const createQueryString = (params: Record<string, string | number | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });
    return current.toString();
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const query = createQueryString({ category: catSlug, page: 1 });
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setMaxPrice(initialMaxPrice);
    setSortBy('popular');
    router.push(pathname, { scroll: false });
  };

  // Fetch paginated data from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          q: searchParam,
          category: selectedCategory,
          material: selectedMaterial,
          maxPrice: String(maxPrice),
          sortBy: sortBy,
          page: String(pageParam),
          limit: '24'
        });
        const res = await fetch(`/api/products/search?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      }
      setLoading(false);
    };

    // Debounce the API call
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParam, selectedCategory, selectedMaterial, maxPrice, sortBy, pageParam]);

  const activeCategoryDetail = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">
      {/* Category/Page Header */}
      <div className="bg-white border border-tcf-sand p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-premium rounded-2xl">
        <div className="space-y-2 text-center md:text-left max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark">
            {searchParam 
              ? `Search Results for "${searchParam}"` 
              : activeCategoryDetail?.name || 'All Furniture Catalog'}
          </h1>
          <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
            {searchParam
              ? `Showing ${total} items matching your query.`
              : activeCategoryDetail?.description || 'Explore our full range of masterfully handcrafted solid wood furniture.'}
          </p>
        </div>

        {/* Mobile Filters Trigger */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full sm:w-auto px-6 py-3 bg-tcf-red text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-premium cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" /> 
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar Panel */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-1 space-y-6 animate-in fade-in duration-200`}>
          <div className="bg-white border border-tcf-sand p-6 shadow-premium space-y-8 rounded-2xl">
            
            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-tcf-dark border-b border-tcf-sand pb-2">
                Category
              </h3>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`text-left text-sm font-semibold transition-colors cursor-pointer ${
                    selectedCategory === 'all' ? 'text-tcf-red' : 'text-tcf-dark/80 hover:text-tcf-red'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.databaseId || cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-left text-sm font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat.slug ? 'text-tcf-red font-semibold' : 'text-tcf-dark/80 hover:text-tcf-red'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-tcf-dark border-b border-tcf-sand pb-2">
                Wood Material
              </h3>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setSelectedMaterial('all')}
                  className={`text-left text-sm font-semibold transition-colors cursor-pointer ${
                    selectedMaterial === 'all' ? 'text-tcf-red' : 'text-tcf-dark/80 hover:text-tcf-red'
                  }`}
                >
                  All Materials
                </button>
                {initialMaterials.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`text-left text-sm font-medium transition-colors cursor-pointer ${
                      selectedMaterial.toLowerCase() === mat.toLowerCase() ? 'text-tcf-red font-semibold' : 'text-tcf-dark/80 hover:text-tcf-red'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-tcf-sand pb-2">
                <h3 className="font-serif font-bold text-base text-tcf-dark">
                  Max Price
                </h3>
                <span className="text-xs font-mono font-bold text-tcf-red bg-tcf-light px-2 py-0.5 rounded">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max={initialMaxPrice}
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-tcf-red cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-tcf-dark/40 font-mono">
                <span>₹5,000</span>
                <span>₹{initialMaxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Reset Action */}
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-tcf-red text-tcf-red hover:bg-tcf-red hover:text-white transition-colors font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reset Filters
            </button>

          </div>
        </aside>

        {/* Product Grid Panel */}
        <div className="space-y-6 md:col-span-2 lg:col-span-3">
          {/* Grid Toolbar Controls */}
          <div className="bg-white border border-tcf-sand px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-premium rounded-xl">
            <div className="flex items-center gap-2 text-sm text-tcf-dark/70">
              <Grid3X3 className="w-4 h-4 text-tcf-red" />
              Showing <span className="font-semibold text-tcf-dark">{total}</span> masterpieces
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-tcf-dark/50 font-bold uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold uppercase tracking-wider text-tcf-dark border border-tcf-sand p-2 bg-tcf-light focus:outline-none focus:border-tcf-red rounded-lg cursor-pointer"
              >
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Catalog grid cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-tcf-red animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-tcf-sand p-16 text-center shadow-premium space-y-4 rounded-2xl">
              <Grid3X3 className="w-12 h-12 text-tcf-sand mx-auto" />
              <h2 className="text-xl font-serif text-tcf-dark">No matching products found</h2>
              <p className="text-sm text-tcf-dark/60 font-light">
                Try adjusting your wood filters, loosening the price caps, or resetting the search parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-6 py-2.5 bg-tcf-red text-white hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider shadow-premium rounded-lg cursor-pointer"
              >
                Clear All Search Rules
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10">
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => {
                      const query = createQueryString({ page: pageParam - 1 });
                      router.push(query ? `${pathname}?${query}` : pathname, { scroll: true });
                    }}
                    className="px-4 py-2 border border-tcf-sand disabled:opacity-50 hover:bg-tcf-red hover:text-white transition-colors rounded-lg font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-sm text-tcf-dark/70">
                    Page {pageParam} of {totalPages}
                  </span>
                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => {
                      const query = createQueryString({ page: pageParam + 1 });
                      router.push(query ? `${pathname}?${query}` : pathname, { scroll: true });
                    }}
                    className="px-4 py-2 border border-tcf-sand disabled:opacity-50 hover:bg-tcf-red hover:text-white transition-colors rounded-lg font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export const ProductListingClient: React.FC<ProductListingClientProps> = (props) => {
  return (
    <Suspense fallback={<div className="text-center py-20 font-serif">Loading furniture catalog...</div>}>
      <ProductListingContent {...props} />
    </Suspense>
  );
};
