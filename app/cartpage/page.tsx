"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Heart, Plus, Minus, Share, X, ChevronDown, Check, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types matching your API response
type Product = { 
  name: string; 
  image: string[];
  id?: number;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category?: string;
  subCategory?: string;
  sizes?: string[];
  color?: string[];
  stock?: number;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  badge?: string;
  description?: string;
}

type CartItem = {
  id: number;
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

// API Helper functions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const showToast = (msg, success = true) => {
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
    success ? 'bg-green-600' : 'bg-red-600'
  }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// Available coupons data
const availableCoupons = [
  { code: 'SAVE20', discount: 20, type: 'percentage', minAmount: 100000, description: '₹300 OFF Coupon Applied' },
  { code: 'FLAT50K', discount: 50000, type: 'fixed', minAmount: 200000, description: '₹500 OFF' },
  { code: 'WELCOME10', discount: 10, type: 'percentage', minAmount: 0, description: 'Welcome Offer' },
  { code: 'SALE50', discount: 300000, type: 'fixed', minAmount: 500000, description: '₹3000 OFF' },
];

export default function ShoppingCartComplete() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items
  const [summary, setSummary] = useState({ totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showMobileCoupons, setShowMobileCoupons] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [addingToWishlist, setAddingToWishlist] = useState(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate summary based on SELECTED items only
  const calculateSummary = (cartItems, selected) => {
    const selectedCartItems = cartItems.filter(item => selected.has(item.id));
    const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalItems, subtotal };
  };

  // Handle item selection
  const handleItemSelect = (itemId, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
    setSummary(calculateSummary(items, newSelected));
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allItemIds = new Set(items.map(item => item.id));
      setSelectedItems(allItemIds);
      setSummary(calculateSummary(items, allItemIds));
    } else {
      setSelectedItems(new Set());
      setSummary({ totalItems: 0, subtotal: 0 });
    }
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please login to view your cart');
        }
        throw new Error(`Failed to fetch cart: ${res.status}`);
      }

      const response = await res.json();
      
      if (!response.success) {
        throw new Error(response.message || 'API returned success: false');
      }
      
      const { data } = response;
      const cartItems = data.items || [];
      
      // Select all items by default when cart loads
      const allItemIds = new Set(cartItems.map(item => item.id));
      setItems(cartItems);
      setSelectedItems(allItemIds);
      setSummary(calculateSummary(cartItems, allItemIds));
      
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(`Failed to load cart: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products for recommendations
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/product/list`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          // Transform and take first 6 products for recommendations
          const transformedProducts = data.products.slice(0, 6).map((product, index) => ({
            id: product.id || index + 1,
            name: product.name || 'Product',
            price: product.price || 60000,
            originalPrice: product.originalPrice || product.price * 1.5,
            image: Array.isArray(product.image) ? product.image[0] : product.image || '/api/placeholder/200/250',
            stock: product.stock || 10,
            category: product.category || 'Men',
            sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL'],
            isNew: index < 2,
          }));
          setRecommendedProducts(transformedProducts);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/user/wishlist`, { 
        headers: authHeaders() 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.wishlist)) {
          const wishlistProductIds = new Set(
            data.data.wishlist.map(item => item.productId)
          );
          setWishlistItems(wishlistProductIds);
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchProducts();
    fetchWishlist();
    // Coupon sync from localStorage
    const storedCoupon = localStorage.getItem("appliedCoupon");
    if (storedCoupon) {
      setAppliedCoupon(JSON.parse(storedCoupon));
    }
  }, [fetchCart, fetchProducts, fetchWishlist]);

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      setUpdating(cartItemId);
      
      const res = await fetch(`${API_BASE}/api/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }

      // Update local state immediately
      const updatedItems = items.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setItems(updatedItems);
      setSummary(calculateSummary(updatedItems, selectedItems));

    } catch (error) {
      console.error('Failed to update quantity:', error);
      showToast(error.message, false);
    } finally {
      setUpdating(null);
    }
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    try {
      setUpdating(cartItemId);
      
      const res = await fetch(`${API_BASE}/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove item');
      }

      // Update local state
      const updatedItems = items.filter(item => item.id !== cartItemId);
      const updatedSelected = new Set(selectedItems);
      updatedSelected.delete(cartItemId);
      
      setItems(updatedItems);
      setSelectedItems(updatedSelected);
      setSummary(calculateSummary(updatedItems, updatedSelected));
      
      setShowDeleteModal(false);
      setItemToDelete(null);
      showToast('Item removed from cart');

    } catch (error) {
      console.error('Failed to remove item:', error);
      showToast(error.message, false);
    } finally {
      setUpdating(null);
    }
  };

  // Save for later functionality
  const saveForLater = async (cartItemId) => {
    try {
      setUpdating(cartItemId);
      
      // In a real implementation, you'd call an API to save the item
      // For now, we'll just remove it from cart and show a message
      await removeItem(cartItemId);
      showToast('Item saved for later');
      
    } catch (error) {
      console.error('Failed to save item for later:', error);
      showToast('Failed to save item for later', false);
    } finally {
      setUpdating(null);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (cartItemId, delta) => {
    const item = items.find(i => i.id === cartItemId);
    if (!item) return;
    
    const newQuantity = Math.max(0, item.quantity + delta);
    
    if (newQuantity === 0) {
      setItemToDelete({ id: cartItemId, action: 'delete' });
      setShowDeleteModal(true);
    } else {
      await updateQuantity(cartItemId, newQuantity);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (cartItemId) => {
    setItemToDelete({ id: cartItemId, action: 'delete' });
    setShowDeleteModal(true);
  };

  // Handle save for later button click
  const handleSaveForLaterClick = (cartItemId) => {
    setItemToDelete({ id: cartItemId, action: 'saveForLater' });
    setShowDeleteModal(true);
  };

  // Handle modal confirm
  const handleModalConfirm = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.action === 'delete') {
      await removeItem(itemToDelete.id);
    } else if (itemToDelete.action === 'saveForLater') {
      await saveForLater(itemToDelete.id);
    }
  };

  // Handle product image click - redirect to product detail
  const handleProductClick = (productId) => {
    router.push(`/productdetail/${productId}`);
  };

  // Handle checkout
  const handleCheckout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      showToast('Please login to proceed with checkout', false);
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', false);
      return;
    }

    const selectedCartItems = items.filter(item => selectedItems.has(item.id));
    
    if (selectedCartItems.length === 0) {
      showToast('Please select items to checkout', false);
      return;
    }

    try {
      // Prepare checkout data
      const checkoutData = {
        items: selectedCartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        })),
        subtotal: subtotal,
        discount: discount,
        total: total,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discount: discount,
          type: appliedCoupon.type
        } : null
      };

      // Store checkout data in localStorage and redirect
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      router.push('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Failed to proceed to checkout', false);
    }
  };

  // Toggle wishlist
  const handleWishlistToggle = async (product) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      showToast('Please login to manage wishlist', false);
      return;
    }

    const isInWishlist = wishlistItems.has(product.id);
    setAddingToWishlist(product.id);

    try {
      if (isInWishlist) {
        const response = await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });

        if (!response.ok) throw new Error('Failed to remove from wishlist');

        setWishlistItems(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        showToast('Removed from wishlist!');
      } else {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ productId: product.id }),
        });

        if (!response.ok) throw new Error('Failed to add to wishlist');

        setWishlistItems(prev => new Set([...prev, product.id]));
        showToast('Added to wishlist!');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      showToast(error.message, false);
    } finally {
      setAddingToWishlist(null);
    }
  };

  // Apply coupon
  const applyCoupon = async (code) => {
    setCouponLoading(true);
    try {
      const coupon = availableCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
      
      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      if (summary.subtotal < coupon.minAmount) {
        throw new Error(`Minimum order amount of ₹${coupon.minAmount.toLocaleString()} required for this coupon`);
      }

      setAppliedCoupon(coupon);
      localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
      setCouponCode('');
      setShowPromoInput(false);
      setShowMobileCoupons(false);
      showToast('Coupon applied successfully!');
    } catch (error) {
      showToast(error.message, false);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
    showToast('Coupon removed');
  };

  // Calculate totals
  const subtotal = summary.subtotal;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.floor((subtotal * appliedCoupon.discount) / 100);
    } else {
      discount = appliedCoupon.discount;
    }
  }
  const deliveryCharges = 0; // Free delivery
  const total = Math.max(0, subtotal - discount + deliveryCharges);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchCart();
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = selectedItems.size;
  const allSelected = items.length > 0 && selectedItems.size === items.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-opacity-50 z-50 border-10 flex items-center justify-center p-4">
          <div className="bg-[#fafafa] rounded-[16px] max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              {itemToDelete?.action === 'saveForLater' ? 'Save for Later?' : 'Remove from Cart?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {itemToDelete?.action === 'saveForLater' 
                ? 'Do you want to save this item for later?' 
                : 'Do you want to remove this item from cart?'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {itemToDelete?.action === 'saveForLater' ? 'Save' : 'Remove'}
              </button>
            </div>
            <div className="mt-4 p-2 font-bold h-[40px] border-2 border-[#B8B8B8] bg-[#FFFFFF] rounded-lg">
              <button 
                onClick={async () => {
                  if (itemToDelete?.action === 'saveForLater') {
                    // Switch to delete action
                    await removeItem(itemToDelete.id);
                  } else {
                    // Switch to save for later action
                    await saveForLater(itemToDelete.id);
                  }
                }}
                className="w-full text-center text-orange-500 hover:text-orange-600"
              >
                {itemToDelete?.action === 'saveForLater' ? 'Add To Wishlist' : 'Add To Wishlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="bg-white">
          {/* Header */}
          <div className="px-4 py-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Shopping Cart</h1>
              <div className="text-sm text-gray-500">
                Sub Total: <span className="font-semibold text-black">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
            {items.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Select All ({selectedCount}/{items.length})</span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="px-4 py-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        />
                      </div>

                      {/* Product Image - Clickable */}
                      <div className="flex-shrink-0">
                        <img 
                          src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/api/placeholder/80/100'} 
                          alt={item.product.name} 
                          className="w-16 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => handleProductClick(item.productId)}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-medium text-sm line-clamp-2 mb-1 cursor-pointer hover:text-orange-500"
                          onClick={() => handleProductClick(item.productId)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">Color: White</p>
                        <p className="text-xs text-gray-500 mb-2">Size: {item.size}</p>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold">₹{item.price.toLocaleString()}</span>
                          {item.product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{item.product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={updating === item.id}
                              className="w-6 h-6 flex items-center justify-center border rounded text-sm disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[20px] text-center">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={updating === item.id}
                              className="w-6 h-6 flex items-center justify-center border rounded text-sm disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleDeleteClick(item.id)}
                              disabled={updating === item.id}
                              className="text-gray-400 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400">
                              <Share className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Save for later / Delete */}
                        <div className="flex items-center space-x-4 mt-2 pt-2 border-t">
                          <button 
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-xs text-gray-600 hover:text-red-600"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => handleSaveForLaterClick(item.id)}
                            className="text-xs text-gray-600 hover:text-blue-600"
                          >
                            Save for later
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {selectedCount > 0 && (
            <div className="px-4 py-4 border-t bg-white">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({summary.totalItems} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Savings</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Coupons</span>
                  <div className="flex items-center space-x-2">
                    {appliedCoupon ? (
                      <span className="text-green-600">-₹{discount.toLocaleString()}</span>
                    ) : (
                      <button 
                        onClick={() => setShowMobileCoupons(true)}
                        className="text-orange-500 text-xs"
                      >
                        Apply coupon
                      </button>
                    )}
                  </div>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded">
                    <span className="text-xs text-green-700">COUPON APPLIED</span>
                    <button onClick={removeCoupon} className="text-green-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Estimated total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={selectedCount === 0}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium mt-4 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed To Checkout ({selectedCount} items)
              </button>
            </div>
          )}

          {/* Mobile Recommendations Section */}
          {recommendedProducts.length > 0 && (
            <div className="px-4 py-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Save up to ₹120 with this cloths. Shop now!</h2>
                <button className="text-orange-500 text-sm">View All</button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="relative mb-2">
                      <img 
                        src={product.image || '/api/placeholder/150/180'} 
                        alt={product.name} 
                        className="w-full h-36 object-cover rounded cursor-pointer"
                        onClick={() => handleProductClick(product.id)}
                      />
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        disabled={addingToWishlist === product.id}
                        className={`absolute top-1 right-1 p-1 rounded-full bg-white shadow ${
                          wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <Heart 
                          className="w-3 h-3" 
                          fill={wishlistItems.has(product.id) ? 'currentColor' : 'none'} 
                        />
                      </button>
                      {product.isNew && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                          New
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 
                        className="font-medium text-xs line-clamp-2 cursor-pointer hover:text-orange-500"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Frequently Bought Together Section */}
          {recommendedProducts.length > 0 && (
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Frequently bought together with Long Sleeve Oversize</h2>
                <button className="text-orange-500 text-sm">View All</button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <div key={`freq-${product.id}`} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="relative mb-2">
                      <img 
                        src={product.image || '/api/placeholder/150/180'} 
                        alt={product.name} 
                        className="w-full h-36 object-cover rounded cursor-pointer"
                        onClick={() => handleProductClick(product.id)}
                      />
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        disabled={addingToWishlist === product.id}
                        className={`absolute top-1 right-1 p-1 rounded-full bg-white shadow ${
                          wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <Heart 
                          className="w-3 h-3" 
                          fill={wishlistItems.has(product.id) ? 'currentColor' : 'none'} 
                        />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 
                        className="font-medium text-xs line-clamp-2 cursor-pointer hover:text-orange-500"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">Fit (V Neck/m). In Stock</p>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                            <span className="text-xs text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Coupon Modal */}
          {showMobileCoupons && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="bg-white w-full max-h-[80vh] rounded-t-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Available coupons</h3>
                  <button onClick={() => setShowMobileCoupons(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4">
                  {/* Coupon Input */}
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Apply promo code"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={() => applyCoupon(couponCode)}
                      disabled={!couponCode.trim() || couponLoading}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Available Coupons */}
                  <div className="space-y-3">
                    {appliedCoupon && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <img src="/api/placeholder/60/40" alt="Sale" className="rounded" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{appliedCoupon.code}</h4>
                            <p className="text-xs text-gray-600">
                              {appliedCoupon.type === 'percentage' 
                                ? `${appliedCoupon.discount}% OFF` 
                                : `₹${appliedCoupon.discount.toLocaleString()} OFF`
                              }
                            </p>
                            <p className="text-xs text-orange-600">Coupon Applied</p>
                          </div>
                          <button onClick={removeCoupon} className="text-orange-500 text-xs border border-orange-300 px-2 py-1 rounded">
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {availableCoupons.filter(c => c.code !== appliedCoupon?.code).map((coupon) => (
                      <div key={coupon.code} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{coupon.code}</h4>
                            <p className="text-xs text-gray-600">
                              {coupon.type === 'percentage' 
                                ? `${coupon.discount}% OFF` 
                                : `₹${coupon.discount.toLocaleString()} OFF`
                              }
                            </p>
                            {coupon.minAmount > 0 && (
                              <p className="text-xs text-gray-500">Min order: ₹{coupon.minAmount.toLocaleString()}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => applyCoupon(coupon.code)}
                            className="text-orange-500 text-xs border border-orange-300 px-3 py-1 rounded hover:bg-orange-50"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Left Column - Cart Items */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Shopping Cart</h1>
                {items.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-orange-500 border-gray-300 rounded"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <span className="text-gray-600">Select All ({selectedCount}/{items.length})</span>
                    </div>
                  </div>
                )}
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg">
                  {items.map((item, index) => (
                    <div key={item.id} className={`flex items-start space-x-4 p-6 ${index !== items.length - 1 ? 'border-b' : ''}`}>
                      {/* Checkbox */}
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-orange-500 border-gray-300 rounded mt-1"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                      />
                      
                      {/* Product Image - Clickable */}
                      <img 
                        src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/api/placeholder/120/150'} 
                        alt={item.product.name} 
                        className="w-24 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => handleProductClick(item.productId)}
                      />
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 
                          className="font-medium text-lg mb-2 cursor-pointer hover:text-orange-500"
                          onClick={() => handleProductClick(item.productId)}
                        >
                          {item.product.name}
                        </h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Color: White</p>
                          <p>Size: {item.size}</p>
                          <p>SKU: 138 GB</p>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-3 mt-3 mb-4">
                          <span className="text-2xl font-bold">₹{item.price.toLocaleString()}</span>
                          {item.product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">₹{item.product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={updating === item.id}
                              className="w-8 h-8 flex items-center justify-center border rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-medium min-w-[30px] text-center">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={updating === item.id}
                              className="w-8 h-8 flex items-center justify-center border rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => handleDeleteClick(item.id)}
                              disabled={updating === item.id}
                              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                            <button 
                              onClick={() => handleSaveForLaterClick(item.id)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Save for later</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                              <Share className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-96">
              <div className="bg-white rounded-lg p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6">Order summary</h2>
                
                {/* Summary Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Contact ({summary.totalItems} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery charges</span>
                    <span className="text-green-600">Free Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coupons</span>
                    {appliedCoupon ? (
                      <span className="text-green-600">-₹{discount.toLocaleString()}</span>
                    ) : (
                      <button 
                        onClick={() => setShowPromoInput(true)}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        Apply coupon
                      </button>
                    )}
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded">
                      <span className="text-green-700 text-xs">COUPON APPLIED</span>
                      <button onClick={removeCoupon} className="text-green-700 hover:text-green-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Estimated total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Input */}
                {showPromoInput && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border rounded text-sm"
                      />
                      <button
                        onClick={() => applyCoupon(couponCode)}
                        disabled={!couponCode.trim() || couponLoading}
                        className="bg-orange-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    
                    {/* Available Coupons */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Available offers:</p>
                      {availableCoupons.map((coupon) => (
                        <div 
                          key={coupon.code} 
                          className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => applyCoupon(coupon.code)}
                        >
                          <div>
                            <span className="font-medium text-sm">{coupon.code}</span>
                            <p className="text-xs text-gray-600">
                              {coupon.type === 'percentage' 
                                ? `${coupon.discount}% OFF` 
                                : `₹${coupon.discount.toLocaleString()} OFF`
                              }
                            </p>
                            {coupon.minAmount > 0 && (
                              <p className="text-xs text-gray-500">Min: ₹{coupon.minAmount.toLocaleString()}</p>
                            )}
                          </div>
                          <button className="text-xs text-orange-500 border border-orange-300 px-2 py-1 rounded">
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setShowPromoInput(false)}
                      className="w-full text-center text-xs text-gray-500 mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium mt-6 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed To Checkout ({selectedCount} items)
                </button>

                {/* Available Coupons Section */}
                <div className="mt-6">
                  <h3 className="font-medium text-sm mb-3">Available coupons</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <img src="/api/placeholder/60/40" alt="Sale banner" className="rounded" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">SALE</h4>
                        <p className="text-xs text-gray-600">₹300 OFF</p>
                        <p className="text-xs text-orange-600">{appliedCoupon ? 'Coupon Applied' : 'Available'}</p>
                      </div>
                      <button className="text-orange-500 text-xs">
                        Check Validity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Save up to ₹120 with this cloths. Shop now!</h2>
                <button className="text-orange-500 text-sm hover:text-orange-600">View All</button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow">
                    <div className="relative mb-3">
                      <img 
                        src={product.image || '/api/placeholder/200/240'} 
                        alt={product.name} 
                        className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => handleProductClick(product.id)}
                      />
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        disabled={addingToWishlist === product.id}
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow ${
                          wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className="w-4 h-4" 
                          fill={wishlistItems.has(product.id) ? 'currentColor' : 'none'} 
                        />
                      </button>
                      {product.isNew && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          New
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 
                        className="font-medium text-sm cursor-pointer hover:text-orange-500"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frequently Bought Together Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Frequently bought together with Long Sleeve Oversize</h2>
                <button className="text-orange-500 text-sm hover:text-orange-600">View All</button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <div key={`freq-${product.id}`} className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow">
                    <div className="relative mb-3">
                      <img 
                        src={product.image || '/api/placeholder/200/240'} 
                        alt={product.name} 
                        className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => handleProductClick(product.id)}
                      />
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        disabled={addingToWishlist === product.id}
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow ${
                          wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className="w-4 h-4" 
                          fill={wishlistItems.has(product.id) ? 'currentColor' : 'none'} 
                        />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 
                        className="font-medium text-sm cursor-pointer hover:text-orange-500"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">Fit (V Neck/m). In Stock</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                            <span className="text-xs text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}