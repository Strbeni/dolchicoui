'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Package, Truck, MapPin, Calendar, DollarSign, Hash, ChevronDown, ShoppingBag } from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// Custom Dropdown Component
interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-48 h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <span className="block truncate text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${value === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-900'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  bestseller: boolean;
  isActive: boolean;
  stock: number;
  date: string;
  createdAt: any;
  updatedAt: any;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  createdAt: any;
  updatedAt: any;
  product: Product;
}

interface Address {
  zip: string;
  city: string;
  name: string;
  phone: string;
  state: string;
  street: string;
}

interface Order {
  id: number;
  userId: number;
  amount: number;
  address: Address;
  status: string;
  paymentMethod: string;
  payment: boolean;
  paymentId: string;
  date: string;
  createdAt: any;
  updatedAt: any;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Dropdown options
  const statusOptions: DropdownOption[] = [
    { value: "all", label: "All Status" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const timeOptions: DropdownOption[] = [
    { value: "all", label: "For all time" },
    { value: "past30days", label: "Past 30 days" },
    { value: "past3months", label: "Past 3 months" },
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" }
  ];

  // Authentication check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return false;
    }
    return true;
  }, [router]);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch user orders from backend
  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!checkAuth()) return;

      const response = await fetch(`${API_BASE_URL}/api/order/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.orders || []);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [checkAuth, getAuthHeaders]);

  // Load orders on component mount
  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const formatDate = useCallback((timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Format status for display
  const formatStatus = useCallback((status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return 'text-orange-600';
      case 'confirmed':
        return 'text-orange-600';
      case 'shipped':
        return 'text-purple-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-orange-600';
    }
  }, []);

  // Get dynamic status message based on order status
  const getStatusMessage = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return 'Order is being packaged for shipment';
      case 'confirmed':
        return 'Order confirmed and being packaged';
      case 'shipped':
        return 'Package is on the way to your address';
      case 'delivered':
        return 'Package was delivered successfully';
      case 'cancelled':
        return 'Order has been cancelled';
      default:
        return 'Order is being packaged for shipment';
    }
  }, []);

  // Get dynamic status label
  const getStatusLabel = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return 'Packaging';
      case 'confirmed':
        return 'Packaging';
      case 'shipped':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Packaging';
    }
  }, []);

  const getFilteredOrdersByTime = useCallback((orders: Order[]) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFilter) {
      case "past30days":
        cutoffDate.setDate(now.getDate() - 30);
        return orders.filter((order) => new Date(parseInt(order.date)) >= cutoffDate);
      case "past3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        return orders.filter((order) => new Date(parseInt(order.date)) >= cutoffDate);
      case "2025":
        return orders.filter((order) => new Date(parseInt(order.date)).getFullYear() === 2025);
      case "2024":
        return orders.filter((order) => new Date(parseInt(order.date)).getFullYear() === 2024);
      case "2023":
        return orders.filter((order) => new Date(parseInt(order.date)).getFullYear() === 2023);
      default:
        return orders;
    }
  }, [timeFilter]);

  // Filter orders by status and time
  const filteredOrders = useCallback(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter === "delivered") {
      filtered = filtered.filter(order =>
        order.status.toUpperCase() === 'DELIVERED'
      );
    } else if (statusFilter === "shipped") {
      filtered = filtered.filter(order =>
        order.status.toUpperCase() === 'SHIPPED'
      );
    } else if (statusFilter === "processing") {
      filtered = filtered.filter(order =>
        ['ORDER_PLACED', 'CONFIRMED'].includes(order.status.toUpperCase())
      );
    } else if (statusFilter === "cancelled") {
      filtered = filtered.filter(order =>
        order.status.toUpperCase() === 'CANCELLED'
      );
    }

    // Filter by time
    filtered = getFilteredOrdersByTime(filtered);

    return filtered;
  }, [orders, statusFilter, getFilteredOrdersByTime]);

  const handleViewDetails = (orderId: number) => {
    router.push(`/profile/orderHistory/orderDetail/${orderId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
      case 'confirmed':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <MapPin className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-orange-500" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchUserOrders} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedOrders = filteredOrders();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sidebar */}
        <div className="w-1/4 flex-shrink-0">
          <div className="sticky top-6">
            <ProfileSidebar activeSection="order-history" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between min-h-[2.5rem]">
              <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">Orders history</h1>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Status Filter */}
                <div>
                  <CustomDropdown
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    options={statusOptions}
                    placeholder="Select status"
                  />
                </div>

                {/* Time Filter */}
                <div>
                  <CustomDropdown
                    value={timeFilter}
                    onValueChange={setTimeFilter}
                    options={timeOptions}
                    placeholder="For all time"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button
                    onClick={fetchUserOrders}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 cursor-pointer"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Grid */}
          {!loading && !error && (
            <div className="space-y-4">
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <div className="text-gray-400 mb-4">
                    <Package className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't placed any orders in this category yet.
                  </p>
                  <Button
                    onClick={() => router.push('/productlist')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 cursor-pointer"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                displayedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                    {/* Order Header with Gray Background */}
                    <div className="bg-gray-100 px-6 py-4 border-b">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-gray-600">Order Placed</p>
                            <p className="font-medium">{formatDate(order.date)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Ship to</p>
                            <p className="font-medium">{order.address?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Order #{order.id}</p>
                          <p className="font-medium">Delivery status</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Banner */}
                    <div className="px-6 py-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {formatStatus(order.status)} {formatDate(order.date)}
                          </h3>
                          <p className="text-gray-600 font-semibold text-sm">
                            {getStatusMessage(order.status)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <div className={getStatusColor(order.status) + ""}>
                              {getStatusIcon(order.status)}
                            </div>
                            <span className="text-md font-medium text-black">
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="px-6 pb-6">
                      {order.items && order.items.length > 0 && (
                        <div>
                          {/* Show up to 2 products, each in its own row */}
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={item.id} className={`flex gap-4 ${index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}`}>
                              {/* Product Image */}
                              <div className="w-20 h-24 relative shrink-0">
                                <Image
                                  src={item.product.image[0] || '/placeholder.png'}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover rounded border"
                                />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium text-lg text-gray-900">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    Size: <span className="font-medium">{item.size}</span>
                                  </p>
                                  <p className="text-gray-600 text-sm">
                                    Category: <span className="font-medium">{item.product.category} - {item.product.subCategory}</span>
                                  </p>
                                  <p className="text-gray-600 text-sm">
                                    Price: <span className="font-medium">₹{item.price.toLocaleString()}</span>
                                  </p>
                                  <p className="text-gray-600 text-sm">
                                    Quantity: <span className="font-medium">{item.quantity}</span>
                                  </p>
                                </div>

                                {/* Buy Again Button for each product */}
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center gap-2 text-sm h-8 cursor-pointer"
                                    style={{ paddingLeft: '16px', paddingRight: '16px' }}
                                    onClick={() => router.push(`/productdetail/${item.product.id}`)}
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                    Buy again
                                  </Button>
                                </div>
                              </div>

                              {/* Action Buttons - Only show for first product to avoid duplication */}
                              {index === 0 && (
                                <div className="flex flex-col gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-3 text-sm h-8 cursor-pointer"
                                  >
                                    Leave Delivery Feedback
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-3 text-sm h-8 cursor-pointer"
                                  >
                                    Leave Product Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-3 text-sm h-8 cursor-pointer"
                                  >
                                    Refund/replacement
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Show "+X more" section if there are more than 2 products */}
                          {order.items.length > 2 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-center py-2">
                                <div className="text-center">
                                  <div className="text-base font-medium text-gray-600">
                                    +{order.items.length - 2} more product{order.items.length - 2 > 1 ? 's' : ''}
                                  </div>
                                  <button
                                    className="mt-1 text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium cursor-pointer"
                                    onClick={() => handleViewDetails(order.id)}
                                  >
                                    View all products
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* View order details button - show when there are multiple products */}
                          {order.items.length > 1 && (
                            <div className="pt-4 flex justify-center">
                              <button
                                className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium cursor-pointer"
                                onClick={() => handleViewDetails(order.id)}
                              >
                                View order details
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}