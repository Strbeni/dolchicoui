"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

// Types matching your API response
type Product = { 
  name: string; 
  image: string[]; // Changed to array since your API returns image array
}

type CartItem = {
  id: number;           // cartItemId
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: Product;
}

type CartSummary = {
  totalItems: number;
  subtotal: number;
}

// API Helper functions - Fixed port to match your backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('🔍 Auth token exists:', !!token);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Local storage helpers for cart state
const getLocalCartState = (): Record<number, number> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('cartQuantities');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveLocalCartState = (quantities: Record<number, number>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cartQuantities', JSON.stringify(quantities));
  } catch (error) {
    console.error('Failed to save cart state:', error);
  }
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({ totalItems: 0, subtotal: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({})
  
  const router = useRouter()

  // Merge server data with local state
  const mergeWithLocalState = (serverItems: CartItem[]) => {
    const localState = getLocalCartState();
    return serverItems.map(item => ({
      ...item,
      quantity: localState[item.id] !== undefined ? localState[item.id] : item.quantity
    }));
  };

  // Calculate summary based on current quantities
  const calculateSummary = (cartItems: CartItem[]) => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalItems, subtotal };
  };

  // Fetch cart from API with proper nested response handling
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const endpoint = `${API_BASE}/api/cart`;
      console.log('🔍 Fetching cart from:', endpoint);
      
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: authHeaders(),
      })

      console.log('🔍 Cart fetch response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          console.log('🔍 Unauthorized - redirecting to login');
          router.push('/login')
          return
        }
        const errorText = await res.text();
        console.error('🔍 Cart fetch error response:', errorText);
        throw new Error(`Failed to fetch cart: ${res.status} ${res.statusText}`)
      }

      const response = await res.json()
      console.log('🔍 Full cart response:', response);
      
      // Handle the nested data structure from your API
      if (!response.success) {
        throw new Error(response.message || 'API returned success: false');
      }
      
      const { data } = response;
      if (!data) {
        throw new Error('No data in API response');
      }
      
      // Merge with local state and calculate summary
      const mergedItems = mergeWithLocalState(data.items || []);
      const calculatedSummary = calculateSummary(mergedItems);
      
      setItems(mergedItems);
      setSummary(calculatedSummary);
      
      console.log('🔍 Cart items set:', mergedItems.length);
      console.log('🔍 Cart summary calculated:', calculatedSummary);
      
    } catch (err) {
      console.error('🔍 Cart fetch error:', err)
      setError(`Failed to load cart: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Update local quantity immediately, sync with server
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      // Update local state immediately
      const newLocalQuantities = { ...localQuantities, [cartItemId]: newQuantity };
      setLocalQuantities(newLocalQuantities);
      saveLocalCartState(newLocalQuantities);

      // Update items state immediately for instant UI feedback
      const updatedItems = items.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setItems(updatedItems);
      setSummary(calculateSummary(updatedItems));

      setUpdating(cartItemId)
      console.log('🔍 Updating quantity:', { cartItemId, newQuantity });
      
      const res = await fetch(`${API_BASE}/api/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      })

      console.log('🔍 Update quantity response:', res.status);

      if (!res.ok) {
        const errorData = await res.json()
        // Revert local state on error
        const revertedQuantities = { ...localQuantities };
        delete revertedQuantities[cartItemId];
        setLocalQuantities(revertedQuantities);
        saveLocalCartState(revertedQuantities);
        
        // Refresh from server to get correct state
        await fetchCart();
        
        throw new Error(errorData.error || errorData.message || 'Failed to update quantity')
      }

      // Clear local override on successful sync
      const updatedLocalQuantities = { ...newLocalQuantities };
      delete updatedLocalQuantities[cartItemId];
      setLocalQuantities(updatedLocalQuantities);
      saveLocalCartState(updatedLocalQuantities);

    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert(error instanceof Error ? error.message : 'Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  // Remove item from cart
  const removeItem = async (cartItemId: number) => {
    try {
      setUpdating(cartItemId)
      console.log('🔍 Removing item:', cartItemId);
      
      const res = await fetch(`${API_BASE}/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      console.log('🔍 Remove item response:', res.status);

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || errorData.message || 'Failed to remove item')
      }

      // Remove from local state
      const updatedLocalQuantities = { ...localQuantities };
      delete updatedLocalQuantities[cartItemId];
      setLocalQuantities(updatedLocalQuantities);
      saveLocalCartState(updatedLocalQuantities);

      // Refresh cart after removing
      await fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert(error instanceof Error ? error.message : 'Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  // Handle quantity change
  const handleQuantityChange = async (cartItemId: number, delta: number) => {
    const item = items.find(i => i.id === cartItemId)
    if (!item) return
    
    const newQuantity = Math.max(0, item.quantity + delta)
    
    if (newQuantity === 0) {
      await removeItem(cartItemId)
    } else {
      await updateQuantity(cartItemId, newQuantity)
    }
  }

  // Handle delete
  const handleDelete = async (cartItemId: number) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeItem(cartItemId)
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      router.push('/checkout')
    } else {
      router.push('/login')
    }
  }

  // Load cart on component mount and initialize local state
  useEffect(() => {
    console.log('🔍 CartPage mounted, fetching cart...');
    setLocalQuantities(getLocalCartState());
    fetchCart()
  }, [fetchCart])

  // Calculate totals from current state
  const subtotal = summary.subtotal
  const discount = 50000
  const total = Math.max(0, subtotal - discount) // Ensure non-negative total

  if (loading) {
    return (
      <div className="px-6 lg:px-20 py-10 flex justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading cart...</p>
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
              fetchCart();
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 lg:px-20 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left Cart Items */}
      <div className="lg:col-span-2 space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CART</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCart}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Button 
              onClick={() => router.push('/productlist')}
              className="bg-[#d46331] hover:bg-[#b75121]"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 border-b pb-6">
              <div className="flex items-center gap-4">
                <Image 
                  src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/placeholder.png'} 
                  alt={item.product.name} 
                  width={80} 
                  height={100} 
                  className="object-cover rounded shadow-sm" 
                />
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">Size: {item.size}</p>
                  <p className="text-red-600 font-semibold">IDR {item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={updating === item.id}
                    className="px-3 py-1 text-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 min-w-[50px] text-center">
                    {updating === item.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                    ) : (
                      item.quantity
                    )}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, 1)}
                    disabled={updating === item.id}
                    className="px-3 py-1 text-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  disabled={updating === item.id}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 disabled:opacity-50 p-2 rounded transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>

              {/* Notes */}
              <div className="pl-[84px]">
                <p className="text-sm text-orange-500 mb-1">Notes</p>
                <input
                  type="text"
                  placeholder="Eg: Please double check before packing."
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded transition-colors"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right Checkout Box */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">SHOPPING INFO</h2>

        {/* Promo Box */}
        <div className="bg-orange-100 border text-sm border-orange-300 p-3 flex justify-between items-center rounded">
          <span>Hooray! You have promo code! <a className="underline text-orange-600" href="#">Use promo code</a></span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({summary.totalItems} items)</span>
            <span>IDR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-IDR {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>IDR {total.toLocaleString()}</span>
          </div>
          
          {/* Show savings if applicable */}
          {subtotal > discount && (
            <div className="text-xs text-green-600 text-center mt-2">
              You saved IDR {discount.toLocaleString()}!
            </div>
          )}
        </div>

        <Button
          className="w-full bg-[#d46331] hover:bg-[#b75121] text-white text-sm py-3 transition-colors"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          PROCEED TO CHECKOUT ({summary.totalItems} items)
        </Button>
      </div>
    </div>
  )
}
