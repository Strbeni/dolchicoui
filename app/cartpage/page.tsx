"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Heart, Plus, Minus, Share, X, ChevronDown, Check, ShoppingBag, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNavbarCounts } from '@/contexts/NavbarCountsContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/lib/store/wishlistSlice';

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
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${success ? 'bg-green-600' : 'bg-red-600'
    }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// Available coupons data
const availableCoupons = [
  {
    code: 'WELCOME15',
    discount: 15,
    type: 'percentage',
    minAmount: 999,
    description: '15% OFF on your first order',
    maxDiscount: 500,
    validTill: '31st Dec 2024'
  },
  {
    code: 'FLAT200',
    discount: 200,
    type: 'fixed',
    minAmount: 1500,
    description: 'Flat ₹200 OFF on orders above ₹1500',
    validTill: '25th Dec 2024'
  },
  {
    code: 'MEGA30',
    discount: 30,
    type: 'percentage',
    minAmount: 2500,
    description: '30% OFF on orders above ₹2500',
    maxDiscount: 1000,
    validTill: '30th Nov 2024'
  },
  {
    code: 'SAVE500',
    discount: 500,
    type: 'fixed',
    minAmount: 3000,
    description: 'Save ₹500 on orders above ₹3000',
    validTill: '15th Jan 2025'
  },
  {
    code: 'FASHION25',
    discount: 25,
    type: 'percentage',
    minAmount: 2000,
    description: '25% OFF on fashion items',
    maxDiscount: 750,
    validTill: '28th Dec 2024'
  },
  {
    code: 'NEWUSER10',
    discount: 10,
    type: 'percentage',
    minAmount: 0,
    description: '10% OFF for new users - No minimum order',
    maxDiscount: 300,
    validTill: '31st Dec 2024'
  },
  {
    code: 'FESTIVE40',
    discount: 40,
    type: 'percentage',
    minAmount: 4000,
    description: 'Festive Special - 40% OFF',
    maxDiscount: 1500,
    validTill: '5th Jan 2025'
  },
  {
    code: 'FLAT100',
    discount: 100,
    type: 'fixed',
    minAmount: 800,
    description: 'Flat ₹100 OFF on orders above ₹800',
    validTill: '20th Dec 2024'
  }
];

export default function ShoppingCartComplete() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Authentication guard - redirect to login if not authenticated
  const { isAuthorized, isLoading: authLoading } = useAuthGuard({
    requireAuth: true,
    redirectTo: '/login'
  });

  // Context for refreshing navbar counts
  const { refreshCartCount, refreshWishlistCount } = useNavbarCounts();

  // Global loading context
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading();

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
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [showMobileAvailableCoupons, setShowMobileAvailableCoupons] = useState(false);
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

  // Validate and auto-remove coupon if minimum order amount is not met or cart is empty
  const validateAndUpdateCoupon = (newSubtotal) => {
    if (appliedCoupon) {
      // Remove coupon if cart is empty
      if (newSubtotal === 0) {
        setAppliedCoupon(null);
        localStorage.removeItem("appliedCoupon");
        showToast(`Coupon ${appliedCoupon.code} removed: Cart is empty`, false);
        return;
      }

      // Remove coupon if minimum amount is not met
      if (newSubtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
        localStorage.removeItem("appliedCoupon");
        showToast(`Coupon ${appliedCoupon.code} removed: Minimum order amount of ₹${appliedCoupon.minAmount.toLocaleString()} required`, false);
      }
    }
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
    const newSummary = calculateSummary(items, newSelected);
    setSummary(newSummary);
    validateAndUpdateCoupon(newSummary.subtotal);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allItemIds = new Set(items.map(item => item.id));
      setSelectedItems(allItemIds);
      const newSummary = calculateSummary(items, allItemIds);
      setSummary(newSummary);
      validateAndUpdateCoupon(newSummary.subtotal);
    } else {
      setSelectedItems(new Set());
      const newSummary = { totalItems: 0, subtotal: 0 };
      setSummary(newSummary);
      validateAndUpdateCoupon(newSummary.subtotal);
    }
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Check authentication before making the request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view your cart');
      }

      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Clear invalid tokens and redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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

      // Debug: Log cart items structure
      console.log('Cart items from API:', cartItems);
      if (cartItems.length > 0) {
        console.log('First cart item structure:', cartItems[0]);
      }

      // Select all items by default when cart loads
      const allItemIds = new Set(cartItems.map(item => item.id));
      setItems(cartItems);
      setSelectedItems(allItemIds);
      const newSummary = calculateSummary(cartItems, allItemIds);
      setSummary(newSummary);
      validateAndUpdateCoupon(newSummary.subtotal);

    } catch (err) {
      console.error('Cart fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load cart: ${errorMessage}`);

      // If it's an authentication error, redirect to login
      if (errorMessage.includes('Please login')) {
        router.push('/login');
      }
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
    // Only fetch cart if user is authenticated and not loading
    if (isAuthorized && !authLoading) {
      fetchCart();
      fetchProducts();
      fetchWishlist();
    }
    // Coupon sync from localStorage
    const storedCoupon = localStorage.getItem("appliedCoupon");
    if (storedCoupon) {
      setAppliedCoupon(JSON.parse(storedCoupon));
    }
  }, [isAuthorized, authLoading, fetchCart, fetchProducts, fetchWishlist]);

  // Validate coupon whenever summary changes
  useEffect(() => {
    if (appliedCoupon && (summary.subtotal === 0 || summary.subtotal < appliedCoupon.minAmount)) {
      validateAndUpdateCoupon(summary.subtotal);
    }
  }, [summary.subtotal, appliedCoupon]);

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      setUpdating(cartItemId);
      setLoadingMessage("Updating quantity...");
      setGlobalLoading(true);

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
      const newSummary = calculateSummary(updatedItems, selectedItems);
      setSummary(newSummary);
      validateAndUpdateCoupon(newSummary.subtotal);

      // Refresh cart count in navbar
      refreshCartCount()

    } catch (error) {
      console.error('Failed to update quantity:', error);
      showToast(error.message, false);
    } finally {
      setUpdating(null);
      setGlobalLoading(false);
    }
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    try {
      setUpdating(cartItemId);
      setLoadingMessage("Removing item...");
      setGlobalLoading(true);

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
      const newSummary = calculateSummary(updatedItems, updatedSelected);
      setSummary(newSummary);
      validateAndUpdateCoupon(newSummary.subtotal);

      setShowDeleteModal(false);
      setItemToDelete(null);
      showToast('Item removed from cart');

      // Refresh cart count in navbar
      refreshCartCount()

    } catch (error) {
      console.error('Failed to remove item:', error);
      showToast(error.message, false);
    } finally {
      setUpdating(null);
      setGlobalLoading(false);
    }
  };

  // Save for later functionality
  const saveForLater = async (cartItemId) => {
    try {
      setUpdating(cartItemId);

      // Find the cart item to get product details
      const cartItem = items.find(item => item.id === cartItemId);
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Check if user is logged in
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showToast('Please login to add items to wishlist', false);
        return;
      }

      // First, add the item to wishlist
      const response = await fetch(`${API_BASE}/api/user/wishlist`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId: cartItem.productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to wishlist');
      }

      // Update local wishlist state
      setWishlistItems(prev => new Set([...prev, cartItem.productId]));

      // Update Redux store
      dispatch(addToWishlist(cartItem.product));

      // Refresh wishlist count in navbar
      refreshWishlistCount();

      // Then remove from cart
      await removeItem(cartItemId);
      showToast('Item moved to wishlist');

    } catch (error) {
      console.error('Failed to save item for later:', error);
      showToast(error.message || 'Failed to move item to wishlist', false);
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

  // Handle "See more like this" - redirect to product list with category filter
  const handleSeeMoreLikeThis = async (productId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

      console.log('Fetching product details for ID:', productId);

      const res = await fetch(`${API_BASE}/api/product/single/${productId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', res.status);

      if (res.ok) {
        const response = await res.json();
        console.log('API Response:', response);

        const product = response.product;
        console.log('Product data:', product);
        console.log('Product category:', product?.category);

        const category = product?.category?.name || product?.category || 'All';
        console.log('Extracted category:', category);

        // Redirect to product list with category filter
        router.push(`/productlist?cat=${encodeURIComponent(category)}`);
      } else {
        console.log('API call failed with status:', res.status);
        // Fallback to general product list if API call fails
        router.push('/productlist?cat=All');
      }
    } catch (error) {
      console.error('Error fetching product category:', error);
      // Fallback to general product list on error
      router.push('/productlist?cat=All');
    }
  };

  // Handle share product link
  const handleShareProduct = async (productId) => {
    try {
      const productUrl = `${window.location.origin}/productdetail/${productId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(productUrl);

      // Show success toast
      showToast('Link Copied');
    } catch (error) {
      console.error('Error copying link to clipboard:', error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `${window.location.origin}/productdetail/${productId}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        showToast('Link Copied');
      } catch (fallbackError) {
        console.error('Fallback copy method failed:', fallbackError);
        showToast('Failed to copy link', false);
      }
    }
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
        dispatch(removeFromWishlist(product.id));
        refreshWishlistCount();
        showToast('Removed from wishlist!');
      } else {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ productId: product.id }),
        });

        if (!response.ok) throw new Error('Failed to add to wishlist');

        setWishlistItems(prev => new Set([...prev, product.id]));
        dispatch(addToWishlist(product));
        refreshWishlistCount();
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

      if (summary.subtotal === 0) {
        throw new Error('Cannot apply coupon to an empty cart');
      }

      if (summary.subtotal < coupon.minAmount) {
        throw new Error(`Minimum order amount of ₹${coupon.minAmount.toLocaleString()} required for this coupon`);
      }

      setAppliedCoupon(coupon);
      localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
      setCouponCode('');
      setShowPromoInput(false);
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

  // Calculate tax (18% GST on subtotal after discount)
  const taxRate = 0.18; // 18% GST
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * taxRate * 100) / 100; // Round to 2 decimal places

  const total = Math.max(0, subtotal - discount + deliveryCharges + tax);

  // Show loading if authentication is being checked
  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
          <div className="space-x-4">
            {error.includes('Please login') ? (
              <button
                onClick={() => router.push('/login')}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Go to Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setError('');
                  fetchCart();
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Try Again
              </button>
            )}
          </div>
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
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
          <div className="bg-[#fafafa] rounded-[16px] max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              {itemToDelete?.action === 'saveForLater' ? 'Move to Wishlist?' : 'Remove from Cart?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {itemToDelete?.action === 'saveForLater'
                ? 'Do you want to move this item to your wishlist?'
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
                {itemToDelete?.action === 'saveForLater' ? 'Move to Wishlist' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="bg-gray-100 mx-2 mt-8 rounded-md px-4 py-3 border-b shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 font-libre">Shopping Cart</h1>
              <div className="text-right">
                <div className="text-xs text-gray-500">Sub Total : <span className="text-base font-semibold text-gray-900">₹ {subtotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="px-4 py-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some items to your cart to get started</p>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Product Content */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                          />
                        </div>

                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/api/placeholder/80/100'}
                              alt={item.product.name}
                              className="w-20 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleProductClick(item.productId)}
                            />
                            {item.product.isNew && (
                              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                NEW
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-base text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-orange-500 transition-colors"
                            onClick={() => handleProductClick(item.productId)}
                          >
                            {item.product.name}
                          </h3>

                          <div className="space-y-1 mb-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Color:</span> {item.product.color?.[0] || 'White'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Model:</span> {item.product.model || '128 GB'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Fit:</span> Regular Fit
                            </p>
                          </div>

                          {/* Price */}
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                            {item.product.originalPrice && item.product.originalPrice > item.price && (
                              <span className="text-sm text-gray-400 line-through">₹{item.product.originalPrice.toLocaleString()}</span>
                            )}

                            
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={updating === item.id}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="px-3 py-2 text-sm font-semibold min-w-[40px] text-center bg-gray-50 border-x border-gray-300">
                                {updating === item.id ? '...' : item.quantity}
                              </div>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={updating === item.id}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons - 5 buttons as per design */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          disabled={updating === item.id}
                          className="text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleSaveForLaterClick(item.id)}
                          disabled={updating === item.id}
                          className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                        >
                          Save for later
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          onClick={() => handleSeeMoreLikeThis(item.productId)}
                        >
                          See more like this
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          onClick={() => handleShareProduct(item.productId)}
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary - Now placed after products */}
          {selectedCount > 0 && (
            <div className="bg-white mx-4 rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Order summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal ({summary.totalItems} items):</span>
                  <span className="text-lg font-bold text-gray-900">₹ {subtotal.toLocaleString()}</span>
                </div>

                {/* Show discount if applied */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Saving:</span>
                    <span className="text-lg font-bold text-red-500">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax collected:</span>
                  <span className="text-lg font-bold text-gray-900">₹ {tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Delivery Charges:</span>
                  <span className="text-lg font-bold text-green-600">Free Delivery</span>
                </div>

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">✓ {appliedCoupon.code} applied (₹ {discount.toLocaleString()} OFF)</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Estimated total:</span>
                    <span className="text-xl font-bold text-gray-900">₹ {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedCount === 0}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold mt-6 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                Proceed To Checkout
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Coupons Section - Desktop style directly in mobile */}
          <div className="bg-white mx-4 rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Coupons</h2>

            {/* Coupon Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={() => applyCoupon(couponCode)}
                disabled={!couponCode.trim() || couponLoading || subtotal === 0}
                className="bg-orange-500 text-white px-4 py-3 rounded-lg text-sm disabled:opacity-50 font-medium hover:bg-orange-600"
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>

            {/* Available Coupons */}
            <div className="space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
              >
                <h3 className="font-medium text-gray-800">Available coupons:</h3>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${showAvailableCoupons ? 'rotate-180' : ''}`}
                />
              </div>

              {showAvailableCoupons && availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{coupon.code}</h4>
                    <span className="text-green-600 font-semibold text-sm">
                      ₹ {coupon.type === 'percentage'
                        ? Math.floor((subtotal * coupon.discount) / 100)
                        : coupon.discount.toLocaleString()
                      } OFF
                    </span>
                  </div>

                  {/* Coupon Banner */}
                  <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-lg p-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <span className="text-lg">🏷️</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-sm">SALE</h5>
                        <p className="text-xs text-gray-600">
                          ₹{coupon.type === 'percentage'
                            ? Math.floor((subtotal * coupon.discount) / 100)
                            : coupon.discount.toLocaleString()
                          } OFF
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      Minimum order ₹ {coupon.minAmount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => applyCoupon(coupon.code)}
                      disabled={subtotal === 0 || subtotal < coupon.minAmount || couponLoading}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-xs disabled:opacity-50 font-medium hover:bg-orange-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                        className={`absolute top-1 right-1 p-1 rounded-full bg-white shadow ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400'
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
                        className={`absolute top-1 right-1 p-1 rounded-full bg-white shadow ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400'
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
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-md">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <span className="text-gray-600 ">Select all</span>
                    </div>
                    <span className="text-gray-600 bg-gray-200 px-4 py-2 rounded-md">Items selected: {selectedCount}</span>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some items to your cart to get started</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100 border border-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start p-6 hover:bg-gray-50 transition-colors">
                      {/* Checkbox */}
                      <div className="flex items-start pt-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        />
                      </div>

                      {/* Product Image */}
                      <div className="ml-4">
                        <div className="relative">
                          <img
                            src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image || '/api/placeholder/120/150'}
                            alt={item.product.name}
                            className="w-24 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                            onClick={() => handleProductClick(item.productId)}
                          />
                          {item.product.isNew && (
                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                              NEW
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 ml-6">
                        <h3
                          className="font-semibold text-lg mb-2 cursor-pointer hover:text-orange-500 transition-colors line-clamp-2"
                          onClick={() => handleProductClick(item.productId)}
                        >
                          {item.product.name}
                        </h3>

                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          <p><span className="font-medium text-gray-700">Color:</span> {item.product.color?.[0] || 'White'}</p>
                          <p><span className="font-medium text-gray-700">Size:</span> {item.size || 'M'}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={updating === item.id}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="px-4 py-2 text-base font-semibold min-w-[50px] text-center bg-gray-50 border-x border-gray-300">
                              {updating === item.id ? '...' : item.quantity}
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={updating === item.id}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">Qty</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center  space-x-6 text-sm">
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            disabled={updating === item.id}
                            className="text-orange-500 border-r-2 border-r-gray-200 pr-3 hover:text-orange-600 font-medium disabled:opacity-50 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => handleSaveForLaterClick(item.id)}
                            disabled={updating === item.id}
                            className="text-blue-500 border-r-2 border-r-gray-200 pr-3 hover:text-blue-600 font-medium disabled:opacity-50 transition-colors"
                          >
                            Move to wishlist
                          </button>
                          <button
                            className="text-blue-500 border-r-2 border-r-gray-200 pr-3 hover:text-blue-600 font-medium transition-colors"
                            onClick={() => handleSeeMoreLikeThis(item.productId)}
                          >
                            See more like this
                          </button>
                          <button
                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                            onClick={() => handleShareProduct(item.productId)}
                          >
                            Share
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">₹{item.price.toLocaleString()}</div>
                        {item.product.originalPrice && item.product.originalPrice > item.price && (
                          <>
                            <div className="text-sm text-gray-400 line-through mb-1">₹{item.product.originalPrice.toLocaleString()}</div>
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium inline-block">
                              {Math.round(((item.product.originalPrice - item.price) / item.product.originalPrice) * 100)}% OFF
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Continue Shopping */}
              <div className="mt-6">
                <button
                  onClick={() => router.push('/products')}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue shopping
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-96">
              <div className="bg-white rounded-lg p-6 sticky top-6">
                <h2 className="text-2xl text-center font-semibold mb-6 text-gray-800">Order summary</h2>

                {/* Summary Details */}
                <div className="space-y-4 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({summary.totalItems} items):</span>
                    <span className="font-semibold">₹ {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charges:</span>
                    <span className="font-semibold">Free Delivery</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax collected:</span>
                    <span className="font-semibold">₹ {tax.toLocaleString()}</span>
                  </div>

                  {/* Applied Coupons - Only show if coupon is applied */}
                  {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 font-medium text-sm">✓ {appliedCoupon.code} applied (₹ {discount.toLocaleString()} OFF)</span>
                        <button
                          onClick={removeCoupon}
                          className="text-orange-500 hover:text-orange-600 font-medium text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-800">Estimated total:</span>
                      <span className="text-gray-800">₹ {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-medium mt-6 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  Proceed To Checkout
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Separate Coupons Section */}
              <div className="bg-white rounded-lg p-6 mt-4">
                <h2 className="text-2xl text-center font-semibold mb-6 text-gray-800">Coupons</h2>

                {/* Coupon Input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => applyCoupon(couponCode)}
                    disabled={!couponCode.trim() || couponLoading || subtotal === 0}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-orange-600"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                {/* Available Coupons */}
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  >
                    <h3 className="text-lg font-medium text-gray-800">Available coupons:</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${showAvailableCoupons ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {showAvailableCoupons && availableCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">{coupon.code}</h4>
                        <span className="text-green-600 font-semibold text-lg">
                          ₹ {coupon.type === 'percentage'
                            ? Math.floor((subtotal * coupon.discount) / 100)
                            : coupon.discount.toLocaleString()
                          } OFF
                        </span>
                      </div>

                      {/* Coupon Image/Banner */}
                      <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-lg p-4 mb-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🏷️</span>
                            </div>
                            <div>
                              <h5 className="font-bold text-lg text-gray-800">SALE</h5>
                              <p className="text-gray-600">
                                ₹{coupon.type === 'percentage'
                                  ? Math.floor((subtotal * coupon.discount) / 100)
                                  : coupon.discount.toLocaleString()
                                } OFF
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Minimum order ₹ {coupon.minAmount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => applyCoupon(coupon.code)}
                          disabled={subtotal === 0 || subtotal < coupon.minAmount || couponLoading}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-orange-600"
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
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
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
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
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