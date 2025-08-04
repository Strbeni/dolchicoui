"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2, Heart, ShoppingCart, Filter, SortAsc } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

// Types based on your wishlist API response
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string[]; // Array of image URLs
  category: string;
  subCategory: string;
  sizes: string[];
  bestseller: boolean;
  isActive: boolean;
  stock: number;
  createdAt: string;
}

type WishlistItem = {
  id: number;           // wishlist item ID
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

type WishlistData = {
  wishlist: WishlistItem[];
  count: number;
  user?: {
    id: number;
    name: string | null;
    isProfileComplete: boolean;
  };
}

type WishlistSummary = {
  totalItems: number;
  totalValue: number;
  categories: Record<string, number>;
  subCategories: Record<string, number>;
  averagePrice: number;
}

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API Helper functions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('🔍 Auth token exists:', !!token);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Sort and filter options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [summary, setSummary] = useState<WishlistSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<number | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({})
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('')
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  
  const router = useRouter()

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async (page: number = 1, category: string = '', sort: string = 'newest') => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams();
      if (page > 1) params.append('page', page.toString());
      if (itemsPerPage !== 10) params.append('limit', itemsPerPage.toString());
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      
      const queryString = params.toString();
      const endpoint = `${API_BASE}/api/user/wishlist${queryString ? `?${queryString}` : ''}`;
      console.log('🔍 Fetching wishlist from:', endpoint);
      
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: authHeaders(),
      })

      console.log('🔍 Wishlist fetch response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          console.log('🔍 Unauthorized - redirecting to login');
          router.push('/login')
          return
        }
        const errorText = await res.text();
        console.error('🔍 Wishlist fetch error response:', errorText);
        throw new Error(`Failed to fetch wishlist: ${res.status} ${res.statusText}`)
      }

      const response = await res.json()
      console.log('🔍 Full wishlist response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned success: false');
      }
      
      const { data } = response;
      if (!data) {
        throw new Error('No data in API response');
      }
      
      // Handle both paginated and regular responses
      if (data.wishlist && data.pagination) {
        // Paginated response
        setItems(data.wishlist);
        setPagination(data.pagination);
      } else {
        // Regular response
        setItems(data.wishlist || []);
        setPagination(null);
      }
      
      console.log('🔍 Wishlist items set:', data.wishlist?.length || 0);
      
    } catch (err) {
      console.error('🔍 Wishlist fetch error:', err)
      setError(`Failed to load wishlist: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [router, itemsPerPage])

  // Fetch wishlist summary
  const fetchWishlistSummary = useCallback(async () => {
    try {
      const endpoint = `${API_BASE}/api/user/wishlist/summary`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: authHeaders(),
      })

      if (res.ok) {
        const response = await res.json()
        if (response.success && response.data) {
          setSummary(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch wishlist summary:', err)
    }
  }, [])

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number) => {
    try {
      setRemoving(productId)
      console.log('🔍 Removing from wishlist:', productId);
      
      const res = await fetch(`${API_BASE}/api/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      console.log('🔍 Remove wishlist response:', res.status);

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to remove from wishlist')
      }

      // Remove from local state immediately
      setItems(prevItems => prevItems.filter(item => item.productId !== productId))
      
      // Refresh summary
      await fetchWishlistSummary()
      
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      alert(error instanceof Error ? error.message : 'Failed to remove from wishlist')
    } finally {
      setRemoving(null)
    }
  }

  // Add item to cart
  const addToCart = async (productId: number, size: string) => {
    try {
      setAddingToCart(productId)
      console.log('🔍 Adding to cart:', { productId, size });
      
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ 
          productId, 
          size, 
          quantity: 1 
        }),
      })

      console.log('🔍 Add to cart response:', res.status);

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to add to cart')
      }

      // Show success message
      alert('Product added to cart successfully!')
      
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert(error instanceof Error ? error.message : 'Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/user/wishlist`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to clear wishlist')
      }

      setItems([])
      setSummary(null)
      
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      alert(error instanceof Error ? error.message : 'Failed to clear wishlist')
    } finally {
      setLoading(false)
    }
  }

  // Handle size selection
  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSize(prev => ({ ...prev, [productId]: size }))
  }

  // Handle add to cart with size validation
  const handleAddToCart = async (item: WishlistItem) => {
    const size = selectedSize[item.productId]
    if (!size && item.product.sizes.length > 0) {
      alert('Please select a size first')
      return
    }
    await addToCart(item.productId, size || item.product.sizes[0] || 'One Size')
  }

  // Handle filters and sorting
  const applyFilters = () => {
    setCurrentPage(1)
    fetchWishlist(1, filterCategory, sortBy)
  }

  // Get unique categories from items
  const getCategories = () => {
    const categories = new Set(items.map(item => item.product.category))
    return Array.from(categories)
  }

  // Load wishlist on component mount
  useEffect(() => {
    console.log('🔍 WishlistPage mounted, fetching wishlist...');
    fetchWishlist(currentPage, filterCategory, sortBy)
    fetchWishlistSummary()
  }, [fetchWishlist, fetchWishlistSummary, currentPage, filterCategory, sortBy])

  if (loading) {
    return (
      <div className="px-6 lg:px-20 py-10 flex justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 lg:px-20 py-10 flex justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError('');
              fetchWishlist(currentPage, filterCategory, sortBy);
            }}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
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
            <p className="text-gray-500 mt-2">
              {summary.totalItems} items · Total Value: IDR {summary.totalValue.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchWishlist(currentPage, filterCategory, sortBy)}
            className="text-xs"
          >
            Refresh
          </Button>
          {items.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      {items.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-500"
            >
              <option value="">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
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
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={applyFilters}
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Apply Filters
          </Button>
        </div>
      )}

      {/* Wishlist Items */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 mb-4 text-lg">Your wishlist is empty.</p>
          <p className="text-gray-400 mb-6">Save items you love to view them here!</p>
          <Button 
            onClick={() => router.push('/productlist')}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                {/* Product Image */}
                <div className="relative mb-4">
                  <Image 
                    src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/placeholder.png'} 
                    alt={item.product.name} 
                    width={200} 
                    height={250} 
                    className="w-full h-48 object-cover rounded" 
                  />
                  
                  {/* Bestseller badge */}
                  {item.product.bestseller && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-semibold">
                      Bestseller
                    </div>
                  )}
                  
                  {/* Remove from wishlist button */}
                  <button 
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={removing === item.productId}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {removing === item.productId ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
                    ) : (
                      <Heart className="text-pink-500 fill-current" size={16} />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">{item.product.category} · {item.product.subCategory}</p>
                  <p className="text-pink-600 font-bold">IDR {item.product.price.toLocaleString()}</p>
                  
                  {/* Stock status */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${item.product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={item.product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Size selection */}
                  {item.product.sizes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Size:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(item.productId, size)}
                            className={`px-2 py-1 text-xs border rounded transition-colors ${
                              selectedSize[item.productId] === size
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart === item.productId || item.product.stock === 0}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-xs py-2 disabled:opacity-50"
                    >
                      {addingToCart === item.productId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ShoppingCart size={14} />
                          Add to Cart
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => removeFromWishlist(item.productId)}
                      disabled={removing === item.productId}
                      variant="outline"
                      className="px-3 py-2 text-xs hover:text-red-600 hover:border-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Added date */}
                <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                  Added: {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Summary Section */}
      {summary && items.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wishlist Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{summary.totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">IDR {summary.totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">IDR {summary.averagePrice.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Average Price</p>
            </div>
          </div>
          
          {/* Category breakdown */}
          {Object.keys(summary.categories).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">By Category:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.categories).map(([category, count]) => (
                  <span key={category} className="px-3 py-1 bg-white rounded-full text-sm border">
                    {category}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
