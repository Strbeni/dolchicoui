'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';

import { ArrowLeft, Package, Calendar, MapPin, CreditCard, FileText, Box, Truck, Handshake, Check, X, Download } from "lucide-react";
import Image from "next/image";
import ProfileSidebar from "@/components/ProfileSidebar";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// Types
interface OrderItem {
  id: number;
  quantity: number;
  size: string;
  price: number;
  product: {
    id: number;
    name: string;
    image: string[];
    description?: string;
    categoryId?: number;
    subcategoryId?: number;
  };
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
  paymentId?: string;
  date: string | number;
  items: OrderItem[];
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

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

  // Fetch order details from backend
  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!checkAuth()) return;

      console.log(`Fetching order details for ID: ${orderId}`);

      // Try to get all user orders first (since we know this endpoint works)
      // and then filter for the specific order
      console.log(`API URL: ${API_BASE_URL}/api/order/user`);

      const response = await fetch(`${API_BASE_URL}/api/order/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const responseText = await response.text();
        console.log(`Error response body:`, responseText);

        if (response.status === 404) {
          throw new Error('Orders not found');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText} - ${responseText}`);
        }
      }

      const result = await response.json();
      console.log(`API response:`, result);

      if (result.success && result.orders) {
        // Find the specific order by ID
        const specificOrder = result.orders.find((order: any) => order.id.toString() === orderId);

        if (specificOrder) {
          setOrder(specificOrder);
        } else {
          throw new Error(`Order with ID ${orderId} not found`);
        }
      } else {
        throw new Error(result.message || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, checkAuth, getAuthHeaders]);

  // Load order details on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  // Format order placed date for display
  const formatOrderDate = useCallback((timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Get status progress
  const getStatusStep = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'ORDER_PLACED':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  }, []);

  // Calculate estimated delivery date (7 days from order placed)
  const getEstimatedDelivery = useCallback((orderDate: string | number) => {
    const date = new Date(typeof orderDate === 'string' ? parseInt(orderDate) : orderDate);
    const estimatedDate = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    return estimatedDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // Handle View Bill click
  const handleViewBill = useCallback((item: OrderItem) => {
    setSelectedItem(item);
    setShowBillDialog(true);
  }, []);

  // Calculate order totals
  const calculateOrderTotals = useCallback(() => {
    if (!order) return { subtotal: 0, total: 0 };

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = order.amount; // Use the actual total from API

    // Calculate potential savings, tax, delivery charges if the total differs from subtotal
    const difference = subtotal - total;
    let savings = 0;
    let tax = 0;
    let deliveryCharges = 0;
    let couponDiscount = 0;

    // If there's a difference, we can assume there might be discounts or additional charges
    if (difference > 0) {
      // If total is less than subtotal, there might be savings/discounts
      savings = difference;
    } else if (difference < 0) {
      // If total is more than subtotal, there might be tax or delivery charges
      tax = Math.abs(difference);
    }

    return { subtotal, total, savings, tax, deliveryCharges, couponDiscount };
  }, [order]);

  // Generate and download PDF bill
  const generatePDF = useCallback(async () => {
    if (!order) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const fontSize = options.fontSize || 10;
        const maxWidth = options.maxWidth || pageWidth - 40;
        pdf.setFontSize(fontSize);
        if (options.fontStyle) pdf.setFont(undefined, options.fontStyle);
        const splitText = pdf.splitTextToSize(text, maxWidth);
        pdf.text(splitText, x, y);
        return y + (splitText.length * fontSize * 0.4);
      };

      // Header with logo and website name
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('DOLCHICO', 20, yPosition);
      
      // Add Dolchico logo (simplified path representation)
      pdf.setFillColor(243, 97, 42); // Orange color #F3612A
      // Draw a simplified version of the Dolchico logo
      // Main cart/shopping bag shape
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(243, 97, 42);
      
      // Cart body
      pdf.roundedRect(pageWidth - 45, yPosition - 8, 20, 6, 1, 1, 'D');
      
      // Cart handle
      pdf.line(pageWidth - 40, yPosition - 8, pageWidth - 35, yPosition - 8);
      
      // Cart wheels
      pdf.setFillColor(36, 45, 53); // Dark color #242D35
      pdf.circle(pageWidth - 40, yPosition - 1, 1, 'F');
      pdf.circle(pageWidth - 30, yPosition - 1, 1, 'F');
      
      // Add "DOLCHI" text in smaller font
      pdf.setFillColor(243, 97, 42);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      pdf.text('DOLCHI', pageWidth - 43, yPosition - 3);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('Premium Fashion & Lifestyle', 20, yPosition);
      
      yPosition += 20;

      // Order Information
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('ORDER BILL', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Order ID: #${order.id}`, 20, yPosition);
      pdf.text(`Date: ${formatOrderDate(order.date)}`, pageWidth - 80, yPosition);
      yPosition += 15;

      // Products Table
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('PRODUCTS', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('Product', 20, yPosition);
      pdf.text('Price', 100, yPosition);
      pdf.text('Qty', 125, yPosition);
      pdf.text('Subtotal', 145, yPosition);
      yPosition += 5;

      // Draw line under headers
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      // Table content
      pdf.setFont(undefined, 'normal');
      order.items.forEach((item) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        const productName = item.product.name.length > 40 
          ? item.product.name.substring(0, 40) + '...' 
          : item.product.name;
        
        pdf.text(productName, 20, yPosition);
        pdf.text(`Rs.${item.price.toLocaleString()}`, 100, yPosition);
        pdf.text(`x${item.quantity}`, 125, yPosition);
        pdf.text(`Rs.${(item.price * item.quantity).toLocaleString()}`, 145, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Order Summary
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('ORDER SUMMARY', 20, yPosition);
      yPosition += 10;

      const totals = calculateOrderTotals();
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      pdf.text('Total Price:', 20, yPosition);
      pdf.text(`Rs.${totals.subtotal.toLocaleString()}`, 145, yPosition);
      yPosition += 6;

      if (totals.savings > 0) {
        pdf.text('Savings:', 20, yPosition);
        pdf.text(`-Rs.${totals.savings.toLocaleString()}`, 145, yPosition);
        yPosition += 6;
      }

      if (totals.tax > 0) {
        pdf.text('Tax collected:', 20, yPosition);
        pdf.text(`Rs.${totals.tax.toLocaleString()}`, 145, yPosition);
        yPosition += 6;
      }

      pdf.text('Delivery Charges:', 20, yPosition);
      pdf.text(totals.deliveryCharges > 0 ? `Rs.${totals.deliveryCharges.toFixed(2)}` : 'Free Delivery', 145, yPosition);
      yPosition += 6;

      if (totals.couponDiscount > 0) {
        pdf.text('Coupon Discount:', 20, yPosition);
        pdf.text(`-Rs.${totals.couponDiscount}`, 145, yPosition);
        yPosition += 6;
      }

      // Draw line above total
      pdf.line(20, yPosition, 170, yPosition);
      yPosition += 5;

      pdf.setFont(undefined, 'bold');
      pdf.text('Estimated Total:', 20, yPosition);
      pdf.text(`Rs.${order.amount.toLocaleString()}`, 145, yPosition);
      yPosition += 15;

      // Billing Information
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('BILLING INFORMATION', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Billing Address
      pdf.setFont(undefined, 'bold');
      pdf.text('Billing Address:', 20, yPosition);
      yPosition += 6;
      pdf.setFont(undefined, 'normal');
      yPosition = addText(order.address.name, 20, yPosition);
      yPosition = addText(order.address.street, 20, yPosition);
      yPosition = addText(`${order.address.city}, ${order.address.state} ${order.address.zip}`, 20, yPosition);
      if (order.address.phone) {
        yPosition = addText(`Phone: ${order.address.phone}`, 20, yPosition);
      }
      yPosition += 10;

      // Payment Method
      pdf.setFont(undefined, 'bold');
      pdf.text('Payment Method:', 20, yPosition);
      yPosition += 6;
      pdf.setFont(undefined, 'normal');
      pdf.text(order.paymentMethod, 20, yPosition);
      if (order.paymentId) {
        yPosition += 6;
        pdf.text(`Payment ID: #${order.paymentId}`, 20, yPosition);
      }
      yPosition += 15;

      // Footer
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Thank you for shopping with Dolchico!', 20, yPosition);
      yPosition += 4;
      pdf.text('For any queries, please contact our customer support.', 20, yPosition);
      yPosition += 4;
      pdf.text('Website: www.dolchico.com | Email: support@dolchico.com', 20, yPosition);

      // Add page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`Dolchico_Order_${order.id}_Bill.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You can add a toast notification here to inform the user about the error
    }
  }, [order, formatOrderDate, calculateOrderTotals]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchOrderDetail} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile/orderHistory')} className="w-full">
                Back to Order History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <div className="text-gray-400 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order with ID #{orderId} could not be found.
            </p>
            <Button onClick={() => router.push('/profile/orderHistory')}>
              Back to Order History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);
  // const statusStep = 3;

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-1/4 flex-shrink-0">
          <div className="sticky top-6">
            <ProfileSidebar activeSection="order-history" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white p-3 md:p-6 rounded-lg shadow">
          {/* Header */}
          <div className="mb-6">
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900"
                onClick={() => router.push('/profile/orderHistory')}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Order History</span>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  <span className="md:hidden">Order Details</span>
                  <span className="hidden md:block">Order Details</span>
                </h1>
                <div className="text-sm text-gray-500 hidden md:block">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => router.push('/profile/orderHistory')}
                  >
                    Order History
                  </span>
                  <span className="mx-2">{'>'}</span>
                  <span>Delivery status</span>
                </div>
              </div>
              <Button
                className="bg-orange-600 hover:bg-orange-700 rounded-3xl text-white px-4 md:px-6 py-2 text-sm md:text-base hidden md:block"
                onClick={() => console.log('Leave feedback')}
              >
                Leave Delivery Feedback
              </Button>
            </div>
          </div>

          {/* Order Info Container */}
          <div className="mb-6 bg-gray-100 rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  #{order.id}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  {order.items.length} Product{order.items.length > 1 ? "s" : ""} • Order Placed on {formatOrderDate(order.date)}
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₹ {order.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Expected Delivery Date */}
          <div className="mb-6">
            <div className="text-left flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <span className="text-sm text-gray-600">Order expected arrival</span>
              <span className="text-lg font-semibold text-gray-800">
                {getEstimatedDelivery(order.date)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full">
              <div className="relative mb-16 md:mb-20">
                {/* Lines Container */}
                <div className="absolute top-3 md:top-4 left-0 w-full flex items-center">
                  {/* We add a small invisible div at the start and end to make the flex container span the full width
                      and allow the line to be sized correctly without absolute positioning math on width */}
                  <div className="w-8 md:w-10"></div> {/* Half of node container width */}
                  <div className="flex-grow relative h-1 bg-gray-200 rounded-full">
                    {/* Progress Line */}
                    <div
                      className="absolute top-0 left-0 h-1 bg-orange-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((statusStep - 1) / 3) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 md:w-10"></div> {/* Half of node container width */}
                </div>

                {/* Nodes */}
                <div className="relative flex justify-between">
                  {/* Order Placed */}
                  <div className="w-16 md:w-20 flex flex-col items-center text-center">
                    {/* Node Circle */}
                    <div className={`relative z-10 w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${statusStep > 1
                      ? 'bg-orange-600 border-orange-600'
                      : statusStep === 1
                        ? 'bg-white border-orange-600'
                        : 'bg-white border-gray-300'
                      }`}>
                      {statusStep > 1 ? (
                        <Check className="w-3 md:w-5 h-3 md:h-5 text-white" />
                      ) : statusStep === 1 ? (
                        <div className="w-3 md:w-5 h-3 md:h-5 bg-orange-600 rounded-full animate-pulse"></div>
                      ) : null}
                    </div>

                    {/* Icon and Label */}
                    <div className="mt-3 md:mt-4 flex flex-col items-center">
                      <FileText className={`w-6 md:w-8 h-6 md:h-8 mb-1 md:mb-2 transition-colors duration-300 ${statusStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`text-xs md:text-sm font-medium transition-colors duration-300 ${statusStep >= 1 ? 'text-gray-800' : 'text-gray-500'}`}>Order Placed</div>
                    </div>
                  </div>

                  {/* Packaging */}
                  <div className="w-16 md:w-20 flex flex-col items-center text-center">
                    {/* Node Circle */}
                    <div className={`relative z-10 w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${statusStep > 2
                      ? 'bg-orange-600 border-orange-600'
                      : statusStep === 2
                        ? 'bg-white border-orange-600'
                        : 'bg-white border-gray-300'
                      }`}>
                      {statusStep > 2 ? (
                        <Check className="w-3 md:w-5 h-3 md:h-5 text-white" />
                      ) : statusStep === 2 ? (
                        <div className="w-3 md:w-5 h-3 md:h-5 bg-orange-600 rounded-full animate-pulse"></div>
                      ) : null}
                    </div>

                    {/* Icon and Label */}
                    <div className="mt-3 md:mt-4 flex flex-col items-center">
                      <Box className={`w-6 md:w-8 h-6 md:h-8 mb-1 md:mb-2 transition-colors duration-300 ${statusStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`text-xs md:text-sm font-medium transition-colors duration-300 ${statusStep >= 2 ? 'text-gray-800' : 'text-gray-500'}`}>Packaging</div>
                    </div>
                  </div>

                  {/* On The Road */}
                  <div className="w-16 md:w-20 flex flex-col items-center text-center">
                    {/* Node Circle */}
                    <div className={`relative z-10 w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${statusStep > 3
                      ? 'bg-orange-600 border-orange-600'
                      : statusStep === 3
                        ? 'bg-white border-orange-600'
                        : 'bg-white border-gray-300'
                      }`}>
                      {statusStep > 3 ? (
                        <Check className="w-3 md:w-5 h-3 md:h-5 text-white" />
                      ) : statusStep === 3 ? (
                        <div className="w-3 md:w-5 h-3 md:h-5 bg-orange-600 rounded-full animate-pulse"></div>
                      ) : null}
                    </div>

                    {/* Icon and Label */}
                    <div className="mt-3 md:mt-4 flex flex-col items-center">
                      <Truck className={`w-6 md:w-8 h-6 md:h-8 mb-1 md:mb-2 transition-colors duration-300 ${statusStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`text-xs md:text-sm font-medium transition-colors duration-300 ${statusStep >= 3 ? 'text-gray-800' : 'text-gray-500'}`}>On The Road</div>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="w-16 md:w-20 flex flex-col items-center text-center">
                    {/* Node Circle */}
                    <div className={`relative z-10 w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${statusStep > 4
                      ? 'bg-orange-600 border-orange-600'
                      : statusStep === 4
                        ? 'bg-white border-orange-600'
                        : 'bg-white border-gray-300'
                      }`}>
                      {statusStep > 4 ? (
                        <Check className="w-3 md:w-5 h-3 md:h-5 text-white" />
                      ) : statusStep === 4 ? (
                        <div className="w-3 md:w-5 h-3 md:h-5 bg-orange-600 rounded-full animate-pulse"></div>
                      ) : null}
                    </div>

                    {/* Icon and Label */}
                    <div className="mt-3 md:mt-4 flex flex-col items-center">
                      <Handshake className={`w-6 md:w-8 h-6 md:h-8 mb-1 md:mb-2 transition-colors duration-300 ${statusStep >= 4 ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`text-xs md:text-sm font-medium transition-colors duration-300 ${statusStep >= 4 ? 'text-gray-800' : 'text-gray-500'}`}>Delivered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table and Order Summary */}
          <div className="mt-8 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Products Table - Mobile and Desktop */}
              <div className="flex-1">
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden space-y-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
                      PRODUCTS
                    </h3>
                  </div>
                  
                  {order.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.image[0] || '/placeholder.png'}
                            alt={item.product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                            SMARTPHONE
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-gray-500">PRICE</span>
                                <div className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">QUANTITY</span>
                                <div className="font-semibold text-gray-900">x{item.quantity}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">SUB-TOTAL</span>
                                <div className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <Button 
                              variant="outline"
                              className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 rounded-full text-sm py-2"
                              onClick={() => handleViewBill(item)}
                            >
                              View Bill
                            </Button>
                            <Button 
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm py-2"
                              onClick={() => console.log('Leave feedback for item:', item.id)}
                            >
                              Leave Product Feedback
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table Layout */}
                <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      <div className="col-span-2">PRODUCT ({order.items.length})</div>
                      <div className="text-center">PRICE</div>
                      <div className="text-center">QUANTITY</div>
                      <div className="text-center">SUB-TOTAL</div>
                      <div className="text-center">VIEW</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="px-6 py-6">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          {/* Product Info */}
                          <div className="col-span-2 flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={item.product.image[0] || '/placeholder.png'}
                                alt={item.product.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                                SMARTPHONE
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {item.product.name}
                              </h3>
                              {item.size && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Size: {item.size}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Quantity */}
                          <div className="text-center">
                            <span className="text-sm text-gray-900">
                              x{item.quantity}
                            </span>
                          </div>

                          {/* Sub-total */}
                          <div className="text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          {/* View Bill Button */}
                          <div className="text-center">
                            <Button 
                              variant="ghost"
                              className="text-gray-600 hover:text-gray-700 hover:bg-blue-50 text-sm px-3 py-1"
                              onClick={() => handleViewBill(item)}
                            >
                              View Bill
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>  
                </div>
              </div>

              {/* Order Summary - Right side on desktop, below on mobile */}
              <div className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="bg-gray-100 rounded-2xl p-4 md:p-6 lg:sticky lg:top-6">
                  <div className="space-y-4 md:space-y-6">
                    {/* Header */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-black mb-2 md:mb-3">
                        Product ({order.items.length < 10 ? '0' + order.items.length : order.items.length})
                      </h3>
                      <h4 className="text-lg md:text-xl font-semibold text-black">Order Summary</h4>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm md:text-base">Total Price</span>
                        <span className="font-semibold text-black text-sm md:text-base">₹ {calculateOrderTotals().subtotal.toLocaleString()}</span>
                      </div>

                      {/* Show savings only if there's a positive difference */}
                      {calculateOrderTotals().savings > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Saving:</span>
                          <span className="font-semibold text-green-600 text-sm md:text-base">-₹{calculateOrderTotals().savings.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Show tax only if calculated */}
                      {calculateOrderTotals().tax > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">Tax collected:</span>
                          <span className="font-semibold text-black text-sm md:text-base">₹ {calculateOrderTotals().tax.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Always show delivery charges - assume free if not specified */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm md:text-base">Delivery Charges:</span>
                        <span className="font-semibold text-black text-sm md:text-base">
                          {calculateOrderTotals().deliveryCharges > 0
                            ? `₹ ${calculateOrderTotals().deliveryCharges.toFixed(2)}`
                            : 'Free Delivery'
                          }
                        </span>
                      </div>

                      {/* Show coupons section only if there are discounts applied */}
                      {calculateOrderTotals().couponDiscount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm md:text-base">SALE coupon(300 OFF):</span>
                          <span className="font-semibold text-green-600 text-sm md:text-base">-₹ 300</span>
                        </div>
                      )}

                      <div className="border-t border-gray-300 pt-3 md:pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-black text-sm md:text-base font-semibold">Estimated total:</span>
                          <span className="text-black text-sm md:text-base font-semibold">₹ {order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="mt-8 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Billing Address */}
                <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{order.address.name}</div>
                    <div>{order.address.street}</div>
                    <div>{order.address.city}, {order.address.state} {order.address.zip}</div>
                    {order.address.phone && (
                      <>
                        <div className="mt-3">
                          <span className="font-medium">Phone Number:</span> {order.address.phone}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {order.address.name.toLowerCase().replace(' ', '.')}@gmail.com
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      Thank you for your order! Your items are being carefully prepared for shipment.
                      We appreciate your business and hope you enjoy your purchase from Dolchico.
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{order.paymentMethod}</div>
                    {order.paymentId && (
                      <div>
                        <span className="font-medium">Payment Id:</span> #{order.paymentId}
                      </div>
                    )}
                    <div className="mt-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.payment || order.paymentId
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.payment || order.paymentId ? 'Payment Completed' : 'Payment Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Order Bill Dialog */}
      {showBillDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ display: 'flex' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            onClick={() => setShowBillDialog(false)}
          />

          {/* Dialog Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-3 md:mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 md:p-6 pb-3 md:pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Order Bill</h2>
                <button
                  onClick={() => setShowBillDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {selectedItem && order && (
                <div className="space-y-4">
                  {/* Bill Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({order.items.length} items):</span>
                      <span className="font-semibold">₹ {calculateOrderTotals().subtotal.toLocaleString()}</span>
                    </div>

                    {/* Show savings only if there's a positive difference */}
                    {calculateOrderTotals().savings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Saving:</span>
                        <span className="font-semibold text-green-600">-₹{calculateOrderTotals().savings.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Show tax only if calculated */}
                    {calculateOrderTotals().tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax collected:</span>
                        <span className="font-semibold">₹ {calculateOrderTotals().tax.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Always show delivery charges - assume free if not specified */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charges:</span>
                      <span className="font-semibold text-green-600">
                        {calculateOrderTotals().deliveryCharges > 0
                          ? `₹ ${calculateOrderTotals().deliveryCharges.toFixed(2)}`
                          : 'Free Delivery'
                        }
                      </span>
                    </div>

                    {/* Show coupons section only if there are discounts applied */}
                    {calculateOrderTotals().couponDiscount > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Coupons</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount Applied:</span>
                          <span className="font-semibold text-green-600">-₹ {calculateOrderTotals().couponDiscount}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Coupon applied (₹ {calculateOrderTotals().couponDiscount} OFF)</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold">{order.paymentMethod}</span>
                      </div>

                      <div className="flex justify-between text-base md:text-lg font-bold border-t pt-3">
                        <span>Estimated total:</span>
                        <span>₹ {calculateOrderTotals().total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
                      onClick={generatePDF}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => {
                        console.log('Leave review');
                        setShowBillDialog(false);
                      }}
                    >
                      Leave Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}