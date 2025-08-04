'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ColorFilter from './ColorFilter';
import PriceFilter from './PriceFilter';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  color?: string[];
  stock: number;
}

// Point at your backend port
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Simple in‐DOM toast
const showToast = (msg: string, success = true) => {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
    success ? 'bg-green-600' : 'bg-red-600'
  }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

export default function ProductListClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  
  // Wishlist states
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);
  const [removingFromWishlist, setRemovingFromWishlist] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const router = useRouter();

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          headers: authHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.wishlist) {
            const wishlistProductIds = new Set<number>(
              data.data.wishlist.map((item: any) => item.productId)
            );
            setWishlistItems(wishlistProductIds);
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlistStatus();
  }, []);

  // Fetch & filter products
  useEffect(() => {
    const id = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const url = searchQuery
          ? `${API_BASE}/api/product/search?q=${encodeURIComponent(searchQuery)}`
          : `${API_BASE}/api/product/list`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success || !Array.isArray(data.products)) throw new Error('Bad format');
        const filtered = data.products.filter((p: Product) => {
          const okPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
          const okColor = !selectedColors.length || selectedColors.some(c => p.color?.includes(c));
          const okSize = !selectedSizes.length || selectedSizes.some(s => p.sizes.includes(s));
          return okPrice && okColor && okSize;
        });
        setProducts(filtered);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, priceRange, selectedColors, selectedSizes]);

  const handleSizeFilter = (size: string) => {
    setSelectedSizes(s => s.includes(size) ? s.filter(x => x !== size) : [...s, size]);
  };

  const handleAddToCart = async (p: Product) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return router.push('/login');
    if (!p.sizes.length) return showToast('No sizes available', false);
    setAddingToCart(p.id);
    try {
      const res = await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId: p.id, size: p.sizes[0], quantity: 1 }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Add failed');
      }
      const body = await res.json();
      if (body.success === false) throw new Error(body.message || 'Add failed');
      setAddedToCart(p.id);
      showToast('Added to cart!');
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Add failed', false);
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product: Product) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return router.push('/login');

    const isInWishlist = wishlistItems.has(product.id);
    
    if (isInWishlist) {
      // Remove from wishlist
      setRemovingFromWishlist(product.id);
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove from wishlist');
        }

        // Update local state
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });

        showToast('Removed from wishlist!', true);
        
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        showToast(error instanceof Error ? error.message : 'Failed to remove from wishlist', false);
      } finally {
        setRemovingFromWishlist(null);
      }
    } else {
      // Add to wishlist
      setAddingToWishlist(product.id);
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            productId: product.id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add to wishlist');
        }

        // Update local state
        setWishlistItems(prev => new Set([...prev, product.id]));
        
        showToast('Added to wishlist!', true);
        
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        showToast(error instanceof Error ? error.message : 'Failed to add to wishlist', false);
      } finally {
        setAddingToWishlist(null);
      }
    }
  };

  return (
    <div className="px-6 lg:px-20 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
      {/* Filters */}
      <div className="space-y-6 px-6">
        <h1 className="text-3xl font-bold">ALL PRODUCTS</h1>

        {/* Size */}
        <div>
          <p className="font-semibold mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {['S','M','L','XL'].map(sz => (
              <button
                key={sz}
                onClick={() => handleSizeFilter(sz)}
                className={`border px-3 py-1 text-sm transition ${
                  selectedSizes.includes(sz)
                    ? 'bg-black text-white'
                    : 'border-gray-300 hover:bg-black hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
          {selectedSizes.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedSizes.join(', ')}
            </p>
          )}
        </div>

        {/* Color & Price */}
        <ColorFilter
          colors={[
            { name: 'Red', hex: '#f87171', count: 10 },
            { name: 'Blue', hex: '#60a5fa', count: 7 },
            { name: 'Green', hex: '#34d399', count: 5 },
            { name: 'Yellow', hex: '#facc15', count: 3 },
            { name: 'Purple', hex: '#a78bfa', count: 4 },
          ]}
          selectedColors={selectedColors}
          onChange={setSelectedColors}
        />
        <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />

        <button
          onClick={() => {
            setSelectedSizes([]); setSelectedColors([]); setPriceRange([0,15000]);
          }}
          className="w-full border border-red-300 text-red-600 px-3 py-2 text-sm hover:bg-red-50 transition rounded"
        >
          Clear All Filters
        </button>
      </div>

      {/* Product Grid */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4 col-span-full">
            Showing results for <span className="font-semibold">&quot;{searchQuery}&quot;</span>
          </p>
        )}

        {loading && (
          <div className="col-span-full text-center py-10">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <p>Loading products...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="col-span-full text-center py-10">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !products.length && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 mb-2">No products match your criteria.</p>
            <button
              onClick={() => {
                setSelectedSizes([]); setSelectedColors([]); setPriceRange([0,15000]);
              }}
              className="text-blue-500 underline hover:text-blue-600"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && products.map(p => (
          <div key={p.id} className="space-y-2 group">
            <Link href={`/productdetail/${p.id}`}>
              <div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
                <Image
                  src={p.image[0] || '/placeholder.png'}
                  alt={p.name}
                  width={300}
                  height={400}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                
                {/* Wishlist button overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleWishlistToggle(p);
                  }}
                  disabled={addingToWishlist === p.id || removingFromWishlist === p.id}
                  className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 ${
                    wishlistItems.has(p.id)
                      ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-pink-600'
                  } disabled:opacity-50`}
                >
                  {(addingToWishlist === p.id || removingFromWishlist === p.id) ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart 
                      size={20} 
                      fill={wishlistItems.has(p.id) ? 'currentColor' : 'none'}
                      className="transition-colors"
                    />
                  )}
                </button>
                
                <div className="absolute inset-0 bg-black bg-opacity-30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  Quick View
                </div>
              </div>
            </Link>

            <h3 className="font-medium text-sm">{p.name}</h3>
            <p className="text-sm text-gray-800">₹{p.price.toLocaleString()}</p>

            <div className="flex items-center justify-between mt-1">
              <div className="flex gap-1">
                {p.sizes.slice(0,3).map((sz,i) => (
                  <span key={i} className="text-xs border px-2 py-0.5 rounded bg-gray-100">{sz}</span>
                ))}
                {p.sizes.length > 3 && <span className="text-xs text-gray-500">+{p.sizes.length-3}</span>}
              </div>

              <div
                onClick={() => handleAddToCart(p)}
                className="relative w-6 h-6 cursor-pointer"
              >
                {addingToCart === p.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  </div>
                )}
                {addedToCart === p.id ? (
                  <Check className="text-green-600 w-6 h-6" />
                ) : (
                  <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-black transition-colors" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
