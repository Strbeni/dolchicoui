// app/account/wishlist/page.tsx
'use client';

import Image from 'next/image';
import {
    Heart,
    ShoppingCart,
    Filter,
    SortAsc,
    Check,
    X,
    Grid3X3,
    List,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useNavbarCounts } from '@/contexts/NavbarCountsContext';
import { useLoading } from '@/contexts/LoadingContext';
import {
    selectWishlistItems,
    selectWishlistLoading,
    selectWishlistError,
    removeFromWishlist,
    clearWishlist as clearReduxWishlist,
    loadWishlistItems,
    setWishlistLoading,
} from '@/lib/store/wishlistSlice';


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
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
};

const toast = (msg: string, ok = true) => {
    if (typeof window === 'undefined') return;
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 transition-all duration-300 ${ok ? 'bg-green-600' : 'bg-red-600'
        }`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => el.remove(), 300);
    }, 2700);
};

const formatDate = (dateString: string): string => {
    try {
        // Use consistent date formatting to avoid hydration issues
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

/* ────────────────  Component  ──────────────── */
function WishlistPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { refreshWishlistCount, refreshCartCount } = useNavbarCounts();
    const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading();

    // Redux selectors for unauthenticated users
    const reduxWishlistItems = useAppSelector(selectWishlistItems);
    const reduxWishlistLoading = useAppSelector(selectWishlistLoading);
    const reduxWishlistError = useAppSelector(selectWishlistError);

    /* Hydration state */
    const [isMounted, setIsMounted] = useState(false);

    /* Data - for authenticated users (API) */
    const [apiItems, setApiItems] = useState<WishlistItem[]>([]);
    const [summary, setSummary] = useState<WishlistSummary | null>(null);

    // Determine which data source to use
    const isAuth = isMounted && isAuthenticated();
    const items = isAuth ? apiItems : reduxWishlistItems.map(item => ({
        id: item.id,
        userId: 0, // Not applicable for Redux items
        productId: item.id,
        createdAt: item.addedAt,
        product: item.product
    }));

    /* UI state */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removing, setRemoving] = useState<number | null>(null);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [addedToCart, setAddedToCart] = useState<number | null>(null);
    const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    /* Filters & pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [sortBy, setSortBy] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('');
    const [pagination, setPagination] = useState<PaginationData | null>(null);

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

            setApiItems(data.wishlist);
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

            if (isAuth) {
                // Authenticated user - use API with global loading
                setLoadingMessage("Removing from wishlist...");
                setGlobalLoading(true);

                const res = await fetch(`${API_BASE}/api/user/wishlist/${pid}`, {
                    method: 'DELETE',
                    headers: authHeaders(),
                });
                if (!res.ok)
                    throw new Error((await res.json()).message || 'Remove failed');
                toast('Removed from wishlist!');
                await fetchWishlist();
                await fetchSummary();
                // Refresh navbar count
                refreshWishlistCount();
            } else {
                // Unauthenticated user - use Redux
                dispatch(removeFromWishlist(pid));
                toast('Removed from wishlist!');
            }
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Remove failed', false);
        } finally {
            if (isAuth) {
                setGlobalLoading(false);
            }
            setRemoving(null);
        }
    };

    const clearWishlist = async () => {
        try {
            if (isAuth) {
                // Authenticated user - use API with global loading
                setLoadingMessage("Clearing wishlist...");
                setGlobalLoading(true);

                const res = await fetch(`${API_BASE}/api/user/wishlist`, {
                    method: 'DELETE',
                    headers: authHeaders(),
                });
                if (!res.ok)
                    throw new Error((await res.json()).message || 'Clear failed');
                setApiItems([]);
                setSummary(null);
                // Refresh navbar count
                refreshWishlistCount();
            } else {
                // Unauthenticated user - use Redux with local loading
                setLoading(true);
                dispatch(clearReduxWishlist());
            }

            toast('Wishlist cleared!');
            setShowClearModal(false);
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Clear failed', false);
        } finally {
            if (isAuth) {
                setGlobalLoading(false);
            } else {
                setLoading(false);
            }
        }
    };

    const addToCart = async (pid: number, size: string) => {
        if (!isAuth) {
            toast('Please login to add items to cart', false);
            router.push('/login');
            return;
        }

        try {
            setAddingToCart(pid);
            setLoadingMessage("Adding to cart...");
            setGlobalLoading(true);

            const res = await fetch(`${API_BASE}/api/cart/items`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ productId: pid, size, quantity: 1 }),
            });
            if (!res.ok)
                throw new Error((await res.json()).message || 'Add failed');
            setAddedToCart(pid);
            toast('Added to cart!');
            // Refresh navbar cart count
            refreshCartCount();
            setTimeout(() => setAddedToCart(null), 2_000);
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Add failed', false);
        } finally {
            setGlobalLoading(false);
            setAddingToCart(null);
        }
    };

    /* ── Effects ── */
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Clear global loading when component is ready
    useEffect(() => {
        if (isMounted && !loading) {
            setGlobalLoading(false);
        }
    }, [isMounted, loading, setGlobalLoading]);

    useEffect(() => {
        if (isAuth) {
            // For authenticated users, fetch from API
            fetchWishlist();
            fetchSummary();
        } else {
            // For unauthenticated users, load from Redux (already available)
            setLoading(false);
            setError(reduxWishlistError || '');
        }
    }, [fetchWishlist, fetchSummary, isAuth, reduxWishlistError]);

    const categories = Array.from(new Set(items.map((i) => {
        const cat = i.product.category;
        if (!cat) return '';
        return (cat as any)?.name || cat;
    }).filter(s => s !== '')));

    const handleSizeSelect = (pid: number, size: string) =>
        setSelectedSize((prev) => ({ ...prev, [pid]: size }));

    const handleAddToCart = (it: WishlistItem) => {
        const size =
            selectedSize[it.productId] || it.product.sizes[0] || 'One Size';
        addToCart(it.productId, size);
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handleRefresh = () => {
        if (isAuth) {
            fetchWishlist();
            fetchSummary();
        } else {
            // For non-authenticated users, just refresh the error state
            setError('');
        }
    };

    /* ── UI ── */
    const isLoadingData = isAuth ? loading : reduxWishlistLoading;
    const errorMessage = isAuth ? error : reduxWishlistError;

    // Prevent hydration mismatch during initial mount
    if (!isMounted) {
        return (
            <div className="px-4 md:px-6 lg:px-20 py-6 md:py-10">
                <div className="flex justify-center py-10">
                    <div className="text-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-base md:text-lg">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoadingData) {
        return (
            <div className="px-4 md:px-6 lg:px-20 py-6 md:py-10">
                <div className="flex justify-center py-10">
                    <div className="text-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-base md:text-lg">Loading wishlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="px-4 md:px-6 lg:px-20 py-6 md:py-10">
                <div className="flex justify-center py-10">
                    <div className="text-center">
                        <p className="text-base md:text-lg text-red-600 mb-4">{errorMessage}</p>
                        <Button
                            onClick={handleRefresh}
                            className="bg-pink-500 hover:bg-pink-600"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-6 lg:px-20 py-6 md:py-10">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                            <Heart className="text-red-500" size={28} />
                            MY WISHLIST
                        </h1>
                        {isAuth && summary && (
                            <p className="text-gray-500 text-sm md:text-base mt-1">
                                {summary.totalItems} items · Value IDR{' '}
                                {summary.totalValue.toLocaleString()}
                            </p>
                        )}
                        {!isAuth && (
                            <p className="text-gray-500 text-sm md:text-base mt-1">
                                {items.length} items · Sign in to sync across devices
                            </p>
                        )}
                    </div>

                    {/* Desktop Actions */}
                    {items.length > 0 && (
                        <div className="hidden md:flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setShowClearModal(true)}
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Actions */}
                {items.length > 0 && (
                    <div className="flex md:hidden gap-2 justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-1"
                            >
                                <Filter size={16} />
                                Filters
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="flex items-center gap-1"
                            >
                                {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => setShowClearModal(true)}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter / Sort - Responsive */}
            {items.length > 0 && (
                <>
                    {/* Desktop Filters */}
                    <div className="hidden md:flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Filter size={16} />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c, index) => (
                                    <option key={`${c}-${index}`} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <SortAsc size={16} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-500"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="name">Name A-Z</option>
                                <option value="price_low">Price Low-High</option>
                                <option value="price_high">Price High-Low</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="flex items-center gap-1"
                            >
                                {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
                                {viewMode === 'grid' ? 'List' : 'Grid'}
                            </Button>
                        </div>

                        <Button
                            size="sm"
                            className="bg-[#d46331] hover:bg-[#d46331]  text-white"
                            onClick={applyFilters}
                        >
                            Apply
                        </Button>
                    </div>

                    {/* Mobile Filters Dropdown */}
                    {showFilters && (
                        <div className="md:hidden mb-6 p-4 bg-gray-50 rounded-lg border space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Filters & Sort</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((c, index) => (
                                            <option key={`${c}-${index}`} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="name">Name A-Z</option>
                                        <option value="price_low">Price Low-High</option>
                                        <option value="price_high">Price High-Low</option>
                                    </select>
                                </div>

                                <Button
                                    className="w-full bg-[#d46331] hover:bg-[#d46331]  text-white"
                                    onClick={applyFilters}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {items.length === 0 && (
                <div className="text-center py-12 md:py-16">
                    <Heart className="mx-auto text-gray-300 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-4">Save your favorite items to buy them later</p>
                    <Button
                        onClick={() => router.push('/productlist')}
                        className="bg-[#d46331] hover:bg-[#d46331]  text-white"
                    >
                        Start Shopping
                    </Button>
                </div>
            )}

            {/* Grid/List View */}
            {items.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
                            {items.map((it) => (
                                <div key={it.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="relative aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-t-lg">
                                        <Image
                                            src={
                                                Array.isArray(it.product.image)
                                                    ? it.product.image[0]
                                                    : it.product.image || '/placeholder.png'
                                            }
                                            alt={it.product.name}
                                            fill
                                            className="object-cover"
                                        />

                                        <button
                                            onClick={() => removeItem(it.productId)}
                                            disabled={removing === it.productId}
                                            className="absolute top-1 right-1 md:top-2 md:right-2 p-1 md:p-1.5 bg-white rounded-full shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        >
                                            {removing === it.productId ? (
                                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Heart className="text-[#d46331] fill-current" size={12} />
                                            )}
                                        </button>

                                        {it.product.bestseller && (
                                            <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-[#d46331] text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-xs font-medium">
                                                Best
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2 md:p-4">
                                        <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2 leading-tight">{(it.product.name as any)?.name || it.product.name || 'Unknown Product'}</h3>
                                        <p className="text-sm md:text-base font-bold text-[#d46331] mb-2">
                                            IDR {it.product.price.toLocaleString()}
                                        </p>

                                        {/* Size Selection - Compact for Mobile */}
                                        {it.product.sizes.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs font-medium mb-1 hidden md:block">Size:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {it.product.sizes.slice(0, 3).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleSizeSelect(it.productId, s)}
                                                            className={`px-1.5 py-0.5 md:px-2 md:py-1 text-xs border rounded transition-colors ${selectedSize[it.productId] === s
                                                                ? 'border-black bg-black text-white'
                                                                : 'border-gray-300 hover:bg-black hover:text-white'
                                                                }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                    {it.product.sizes.length > 3 && (
                                                        <span className="text-xs text-gray-500 px-1">+{it.product.sizes.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-1">
                                            <button
                                                onClick={() => handleAddToCart(it)}
                                                disabled={addingToCart === it.productId}
                                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-1.5 py-1 md:px-3 md:py-1.5 rounded transition-colors disabled:opacity-50 flex-1 justify-center"
                                            >
                                                {addingToCart === it.productId ? (
                                                    <div className="w-3 h-3 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                                ) : addedToCart === it.productId ? (
                                                    <Check className="text-green-600 w-3 h-3" />
                                                ) : (
                                                    <ShoppingCart className="w-3 h-3 text-gray-600" />
                                                )}
                                                <span className="hidden md:inline text-xs">
                                                    {addedToCart === it.productId ? 'Added' : 'Cart'}
                                                </span>
                                            </button>

                                            <span className="text-xs text-gray-400 hidden md:block">
                                                {formatDate(it.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-3 md:space-y-4">
                            {items.map((it) => (
                                <div key={it.id} className="bg-white rounded-lg shadow-sm border p-3 md:p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-3 md:gap-4">
                                        <div className="relative w-16 md:w-24 aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded flex-shrink-0">
                                            <Image
                                                src={
                                                    Array.isArray(it.product.image)
                                                        ? it.product.image[0]
                                                        : it.product.image || '/placeholder.png'
                                                }
                                                alt={it.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {it.product.bestseller && (
                                                <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 bg-[#d46331] text-white px-1 py-0.5 rounded text-xs font-medium">
                                                    Best
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 md:mb-2">
                                                <h3 className="font-semibold text-sm md:text-base line-clamp-2 pr-2">{(it.product.name as any)?.name || it.product.name || 'Unknown Product'}</h3>
                                                <button
                                                    onClick={() => removeItem(it.productId)}
                                                    disabled={removing === it.productId}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                                                >
                                                    {removing === it.productId ? (
                                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Heart className="text-pink-500 fill-current" size={16} />
                                                    )}
                                                </button>
                                            </div>

                                            <p className="text-base md:text-lg font-bold text-[#d46331] mb-1 md:mb-2">
                                                IDR {it.product.price.toLocaleString()}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-2 md:mb-3">
                                                {(it.product.category as any)?.name || it.product.category || 'Unknown'} • {formatDate(it.createdAt)}
                                            </p>

                                            {/* Size Selection - Compact */}
                                            {it.product.sizes.length > 0 && (
                                                <div className="mb-2 md:mb-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {it.product.sizes.slice(0, 5).map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleSizeSelect(it.productId, s)}
                                                                className={`px-2 py-1 text-xs border rounded transition-colors ${selectedSize[it.productId] === s
                                                                    ? 'border-black bg-black text-white'
                                                                    : 'border-gray-300 hover:bg-black hover:text-white'
                                                                    }`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                        {it.product.sizes.length > 5 && (
                                                            <span className="text-xs text-gray-500 px-1 py-1">+{it.product.sizes.length - 5}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleAddToCart(it)}
                                                disabled={addingToCart === it.productId}
                                                className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors disabled:opacity-50"
                                            >
                                                {addingToCart === it.productId ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                                ) : addedToCart === it.productId ? (
                                                    <Check className="text-green-600 w-4 h-4" />
                                                ) : (
                                                    <ShoppingCart className="w-4 h-4 text-gray-600" />
                                                )}
                                                <span className="text-xs md:text-sm">
                                                    {addedToCart === it.productId ? 'Added' : 'Add to Cart'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="hover:bg-pink-50 hover:border-pink-300"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600 px-2">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasNextPage}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="hover:bg-pink-50 hover:border-pink-300"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowClearModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100 opacity-100">
                        <div className="relative p-6">
                            {/* Close button */}
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <Heart className="w-6 h-6 text-red-600" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Clear Entire Wishlist?
                            </h3>

                            <p className="text-sm text-gray-500 text-center mb-6">
                                Are you sure you want to remove all {items.length} items from your wishlist?
                                This action cannot be undone.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClearModal(false)}
                                    className="flex-1 order-2 sm:order-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={clearWishlist}
                                    className="flex-1 order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Clear All Items
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Export directly without protection
export default WishlistPage;