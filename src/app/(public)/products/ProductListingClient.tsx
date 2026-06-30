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
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface ProductListingClientProps {
  initialProducts: Product[];
  categories: Category[];
}

const ProductListingContent: React.FC<ProductListingClientProps> = ({ initialProducts, categories }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Derive unique materials list
  const materials = useMemo(() => {
    const list = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.material) list.add(p.material);
    });
    return Array.from(list);
  }, [initialProducts]);

  // Helper to build URL search queries
  const createQueryString = (params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    return current.toString();
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const query = createQueryString({ category: catSlug });
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setMaxPrice(150000);
    setSortBy('popular');
    router.push(pathname);
  };

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Search query filter
    if (searchParam) {
      const q = searchParam.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Material filter
    if (selectedMaterial !== 'all') {
      list = list.filter((p) => p.material.toLowerCase() === selectedMaterial.toLowerCase());
    }

    // Price filter
    list = list.filter((p) => {
      const activePrice = p.salePrice || p.price;
      return activePrice <= maxPrice;
    });

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'name-az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [initialProducts, selectedCategory, selectedMaterial, maxPrice, sortBy, searchParam]);

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
              ? `Showing ${filteredProducts.length} items matching your query.`
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
                    key={cat.id}
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
                {materials.map((mat) => (
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
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-tcf-red cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-tcf-dark/40 font-mono">
                <span>₹5,000</span>
                <span>₹1,50,000</span>
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
              Showing <span className="font-semibold text-tcf-dark">{filteredProducts.length}</span> masterpieces
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
          {filteredProducts.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
