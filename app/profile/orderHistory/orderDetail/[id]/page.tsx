"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Download } from "lucide-react";

// Mock data - in a real app, you'd fetch this based on the orderId
const getOrderById = (orderId: string) => {
  const orders = {
    "406-9025561-0841152": {
      id: "406-9025561-0841152",
      subtotal: 699,
      shippingCost: 40,
      tax: 55.92,
      couponDiscount: 50,
      couponCode: "SAVE50",
      total: 744.92,
      datePlaced: "6 July, 2025",
      time: "2:45 PM",
      productsCount: 1,
      expectedDate: "9 July, 2025",
      status: "Delivered",
      products: [
        {
          name: "Weavers Villa Beads Hanging Curtain",
          description: "20 Strings, 7 Ft - Sparkling Decor for Doors/Windows",
          price: 699,
          quantity: 1,
          image: "/curtain.jpg"
        }
      ]
    },
    "406-3908338-4442743": {
      id: "406-3908338-4442743",
      subtotal: 699,
      shippingCost: 0,
      tax: 55.92,
      couponDiscount: 0,
      couponCode: null,
      total: 754.92,
      datePlaced: "6 July, 2025",
      time: "3:20 PM",
      productsCount: 1,
      expectedDate: "8 July, 2025",
      status: "Delivered",
      products: [
        {
          name: "BNSN Pure & Original Kala Gond",
          description: "Gond Siyah | Pure Jadibooti | for Joint Pain & Arthritis",
          price: 699,
          quantity: 1,
          image: "/gond.jpg"
        }
      ]
    },
    "406-3396058-1809901": {
      id: "406-3396058-1809901",
      subtotal: 588.82,
      shippingCost: 0,
      tax: 47.11,
      couponDiscount: 100,
      couponCode: "NEWUSER100",
      total: 535.93,
      datePlaced: "27 June, 2025",
      time: "10:30 AM",
      productsCount: 1,
      expectedDate: "30 June, 2025",
      status: "Processing",
      products: [
        {
          name: "Broadband - Airtel",
          description: "Monthly broadband service",
          price: 588.82,
          quantity: 1,
          image: "/airtel.png"
        }
      ]
    }
  };
  
  return orders[orderId as keyof typeof orders] || null;
};

const OrderDetail = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  // Get order data based on the ID
  const order = getOrderById(orderId);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">The order with ID {orderId} could not be found.</p>
            <Button onClick={() => router.push("/profile/orderHistory")}>
              Back to Order History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case "Order Placed":
        return 1;
      case "Processing":
      case "Packaging":
        return 2;
      case "On The Road":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 0;
    }
  };

  const statusStep = getStatusStep();

  const steps = [
    { label: "Order Placed", icon: "📦" },
    { label: "Processing", icon: "📦" },
    { label: "On The Road", icon: "🚚" },
    { label: "Delivered", icon: "📬" },
  ];

  const handleDownloadInvoice = () => {
    // In a real application, this would generate and download a PDF invoice
    // For now, we'll simulate the download process
    const invoiceData = {
      orderId: order.id,
      customerName: "Akash Kulshrestha",
      date: order.datePlaced,
      products: order.products,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shippingCost,
      discount: order.couponDiscount,
      total: order.total
    };
    
    // Create a blob with invoice data (in real app, this would be a PDF)
    const invoiceContent = `
INVOICE - Order #${order.id}
Date: ${order.datePlaced}
Customer: Akash Kulshrestha

Products:
${order.products.map(p => `${p.name} - ₹${p.price} x ${p.quantity} = ₹${p.price * p.quantity}`).join('\n')}

Subtotal: ₹${order.subtotal}
Tax: ₹${order.tax}
Shipping: ${order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}
${order.couponDiscount > 0 ? `Discount (${order.couponCode}): -₹${order.couponDiscount}` : ''}
Grand Total: ₹${order.total}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-6">
          <div className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/orderHistory")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full bg-gray-100"
            >
              Order History
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Saved Payment Method
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Address Book
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Billing
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Order Detail Content */}
        <div className="w-3/4">
          <Card>
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center text-sm text-gray-500 cursor-pointer hover:underline"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Order Details
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadInvoice}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </Button>
                  <Button
                    variant="link"
                    className="text-sm text-red-500 hover:underline flex items-center gap-1"
                  >
                    Leave a Product Feedback <Star className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Order Info Card */}
              <Card className="mb-6 shadow-md bg-yellow-50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">#{order.id}</div>
                    <div className="text-sm text-gray-600">
                      {order.productsCount} Product{order.productsCount > 1 ? 's' : ''} • Order Placed on{" "}
                      {order.datePlaced} at {order.time}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    ₹{order.total.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Expected Date */}
              <div className="text-sm text-gray-600 mb-2">
                Order expected arrival{" "}
                <span className="font-semibold text-black">
                  {order.expectedDate}
                </span>
              </div>
              <Button
                    variant="link"
                    className="text-sm text-red-500 hover:underline flex items-center gap-1"
                  >
                    Leave a Delivery Feedback <Star className="w-4 h-4" />
                  </Button>

              {/* Order Progress */}
              <div className="flex items-center justify-between mt-4">
                {steps.map((step, index) => {
                  const isCompleted = index < statusStep;
                  const isCurrent = index + 1 === statusStep;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted || isCurrent
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div className="text-xs mt-2 text-center">
                        {step.label}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-4 left-1/2 right-[-50%] h-1 ${
                            isCompleted ? "bg-orange-600" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Product List Section */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  Product{order.productsCount > 1 ? 's' : ''} ({order.productsCount.toString().padStart(2, '0')})
                </h2>
                <div className="grid grid-cols-5 gap-4 text-sm font-medium border-b pb-2">
                  <div className="col-span-2">PRODUCTS</div>
                  <div>PRICE</div>
                  <div>QUANTITY</div>
                  <div>SUBTOTAL</div>
                </div>

                {order.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b items-center text-sm">
                    <div className="col-span-2 flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-contain border rounded"
                      />
                      <div>
                        <p className="font-semibold text-sm">{product.name.toUpperCase()}</p>
                        <p className="text-gray-600">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div>₹{product.price.toFixed(2)}</div>
                    <div>x{product.quantity}</div>
                    <div className="font-medium">₹{(product.price * product.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Order Summary / Grand Total */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-end">
                  <div className="w-80">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toFixed(2)}`}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{order.tax.toFixed(2)}</span>
                      </div>
                      
                      {order.couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon Discount ({order.couponCode}):</span>
                          <span>-₹{order.couponDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Grand Total:</span>
                          <span className="text-green-700">₹{order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Download Invoice Button in Summary */}
                      <div className="mt-4 pt-3 border-t">
                        <Button
                          onClick={handleDownloadInvoice}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4" />
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Addresses, Billing and Notes */}
          <Card className="mt-8">
            <CardContent className="p-6">
              {/* Addresses and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Billing Address Card */}
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-semibold">💳</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Billing Address</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-900">Akash Kulshrestha</p>
                      <p className="text-gray-600 leading-relaxed">
                        Sector 22, Chandigarh, Punjab - 160022, India
                      </p>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Phone:</span>{" "}
                          +91-98765-43210
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          akash.kulshrestha@gmail.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address Card */}
                <Card className="shadow-sm border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-semibold">🚚</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-900">Akash Kulshrestha</p>
                      <p className="text-gray-600 leading-relaxed">
                        Sector 22, Chandigarh, Punjab - 160022, India
                      </p>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Phone:</span>{" "}
                          +91-98765-43210
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          akash.kulshrestha@gmail.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes Card */}
                <Card className="shadow-sm border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 text-sm font-semibold">📝</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Order Notes</h3>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md italic">
                        "Please handle with care. Delivery to be made during daytime hours only."
                      </p>
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Special instructions for delivery
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {/* Product Feedback provided By User */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                  Product Feedback provided By You
                </h2>
            </CardContent>
            </Card>

          {/* Delivery Feedback provided By User */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                  Delivery Feedback provided By You
                </h2>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;