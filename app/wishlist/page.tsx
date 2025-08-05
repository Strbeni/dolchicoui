// app/wishlist/page.tsx
'use client';

import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Filter,
  SortAsc,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

/* ────────────────  Models  ──────────────── */
interface Product {
  id: number;
  name: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  bestseller: boolean;
  stock: number;
  createdAt: string;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface WishlistSummary {
  totalItems: number;
  totalValue: number;
  categories: Record<string, number>;
  averagePrice: number;
}

/* ────────────────  Helpers  ──────────────── */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = (): HeadersInit => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const toast = (msg: string, ok = true) => {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
    ok ? 'bg-green-600' : 'bg-red-600'
  }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3_000);
};

/* ────────────────  Component  ──────────────── */
export default function WishlistPage() {
  /* Data */
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [summary, setSummary] = useState<WishlistSummary | null>(null);

  /* UI state */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});

  /* Filters & pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('');
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const router = useRouter();

  /* ── Fetch wishlist (paginated) ── */
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (filterCategory) params.append('category', filterCategory);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(
        `${API_BASE}/api/user/wishlist?${params.toString()}`,
        { headers: authHeaders() },
      );

      if (!res.ok) {
        if (res.status === 401) return router.push('/login');
        throw new Error(`HTTP ${res.status}`);
      }

      const {
        success,
        data,
        message,
      }: {
        success: boolean;
        data: {
          wishlist: WishlistItem[];
          pagination: PaginationData;
        };
        message?: string;
      } = await res.json();

      if (!success) throw new Error(message || 'API error');

      setItems(data.wishlist);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterCategory, sortBy, router]);

  /* ── Fetch summary & count ── */
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/wishlist/summary`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const {
        success,
        data,
      }: { success: boolean; data: WishlistSummary } = await res.json();
      if (success) setSummary(data);
    } catch {
      /* ignore */
    }
  }, []);

  /* ── Mutations ── */
  const removeItem = async (pid: number) => {
    try {
      setRemoving(pid);
      const res = await fetch(`${API_BASE}/api/user/wishlist/${pid}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || 'Remove failed');
      toast('Removed from wishlist!');
      await fetchWishlist();
      await fetchSummary();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Remove failed', false);
    } finally {
      setRemoving(null);
    }
  };

  const clearWishlist = async () => {
    if (
      !window.confirm('Are you sure you want to clear your entire wishlist?')
    )
      return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/user/wishlist`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || 'Clear failed');
      setItems([]);
      setSummary(null);
      toast('Wishlist cleared!');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Clear failed', false);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (pid: number, size: string) => {
    try {
      setAddingToCart(pid);
      const res = await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId: pid, size, quantity: 1 }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || 'Add failed');
      setAddedToCart(pid);
      toast('Added to cart!');
      setTimeout(() => setAddedToCart(null), 2_000);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Add failed', false);
    } finally {
      setAddingToCart(null);
    }
  };

  /* ── Effects ── */
  useEffect(() => {
    fetchWishlist();
    fetchSummary();
  }, [fetchWishlist, fetchSummary]);

  /* ── Helpers ── */
  const categories = Array.from(new Set(items.map((i) => i.product.category)));

  const handleSizeSelect = (pid: number, size: string) =>
    setSelectedSize((prev) => ({ ...prev, [pid]: size }));

  const handleAddToCart = (it: WishlistItem) => {
    const size =
      selectedSize[it.productId] || it.product.sizes[0] || 'One Size';
    addToCart(it.productId, size);
  };

  /* ── UI ── */
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-gray-300 border-t-pink-600 rounded-full animate-spin" />
          <span>Loading wishlist…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchWishlist}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-20 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="text-pink-500" size={32} />
            MY WISHLIST
          </h1>
          {summary && (
            <p className="text-gray-500 mt-1">
              {summary.totalItems} items · Value ₹
              {summary.totalValue.toLocaleString()}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchWishlist}>
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={clearWishlist}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Filter / Sort */}
      {items.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A-Z</option>
              <option value="price_low">Price Low-High</option>
              <option value="price_high">Price High-Low</option>
            </select>
          </div>

          <Button
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => setCurrentPage(1)}
          >
            Apply
          </Button>
        </div>
      )}

      {/* Empty */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <Heart className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 mb-2 text-lg">Your wishlist is empty.</p>
          <Button onClick={() => router.push('/productlist')}>
            Start shopping
          </Button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((it) => (
              <div key={it.id} className="space-y-2">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={
                      Array.isArray(it.product.image)
                        ? it.product.image[0]
                        : it.product.image || '/placeholder.png'
                    }
                    alt={it.product.name}
                    width={300}
                    height={400}
                    className="object-cover w-full h-full"
                  />

                  <button
                    onClick={() => removeItem(it.productId)}
                    disabled={removing === it.productId}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow disabled:opacity-50"
                  >
                    {removing === it.productId ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart className="text-pink-500 fill-current" size={16} />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-sm">{it.product.name}</h3>
                <p className="text-sm text-gray-800">
                  ₹{it.product.price.toLocaleString()}
                </p>

                {/* Size */}
                {it.product.sizes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Size:</p>
                    <div className="flex flex-wrap gap-1">
                      {it.product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSizeSelect(it.productId, s)}
                          className={`px-2 py-1 text-xs border rounded transition-colors ${
                            selectedSize[it.productId] === s
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:bg-black hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <div
                    onClick={() => handleAddToCart(it)}
                    className="relative w-6 h-6 cursor-pointer"
                  >
                    {addingToCart === it.productId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      </div>
                    )}
                    {addedToCart === it.productId ? (
                      <Check className="text-green-600 w-6 h-6" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-black" />
                    )}
                  </div>

                  <span className="text-xs text-gray-400">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
