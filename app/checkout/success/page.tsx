"use client";

import Link from "next/link";
import { CheckCircle, Package, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface OrderDetails {
    id: number;
    status: string;
    amount: number;
    items: Array<{
        id: number;
        quantity: number;
        product: {
            name: string;
        };
    }>;
}

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch order details if orderId is provided
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`http://localhost:3000/api/order/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setOrderDetails(result.order);
                    }
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    return (
        <>
            {/* Order Information */}
            {loading ? (
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Loading order details...</span>
                </div>
            ) : orderId ? (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md w-full">
                    <div className="text-sm text-gray-600 mb-2">Order Number</div>
                    <div className="font-mono font-semibold text-lg mb-4">{orderId}</div>
                    
                    {orderDetails && (
                                <>
                                    <div className="text-sm text-gray-600 mb-1">Status</div>
                                    <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
                                        {orderDetails.status.replace('_', ' ')}
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                                    <div className="font-semibold text-lg mb-4">IDR {orderDetails.amount?.toLocaleString()}</div>
                                    
                                    <div className="text-sm text-gray-600 mb-1">Items Ordered</div>
                                    <div className="text-sm font-medium">
                                        {orderDetails.items?.length} item{orderDetails.items && orderDetails.items.length > 1 ? 's' : ''}
                                    </div>
                                </>
                            )}
                </div>
            ) : null}
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {orderId && (
                    <Link
                        href="/orders"
                        className="bg-[#d86538] hover:bg-[#b9552e] text-white px-8 py-3 uppercase text-sm font-semibold tracking-wide transition flex items-center space-x-2"
                        legacyBehavior>
                        <Eye className="w-4 h-4" />
                        <span>Track Order</span>
                    </Link>
                )}
                
                <Link
                    href="/productlist"
                    className="border border-[#d86538] text-[#d86538] hover:bg-[#d86538] hover:text-white px-8 py-3 uppercase text-sm font-semibold tracking-wide transition flex items-center space-x-2"
                    legacyBehavior>
                    <Package className="w-4 h-4" />
                    <span>Continue Shopping</span>
                </Link>
            </div>
        </>
    );
}

// Loading fallback for the Suspense boundary
function OrderSuccessLoading() {
    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-500">Loading order details...</span>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
            {/* Logo */}
            <div className="absolute top-6 left-6">
                <h1 className="text-2xl font-serif tracking-wide">
                    <span className="text-[#e76f34] font-bold">M</span>
                    <span className="text-black font-medium">ODEVA</span>
                </h1>
            </div>

            {/* Check icon */}
            <CheckCircle className="text-green-500 w-14 h-14 mb-6" />

            {/* Heading */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">ORDER PLACED SUCCESSFULLY!</h1>

            {/* Suspense boundary for the component using useSearchParams */}
            <Suspense fallback={<OrderSuccessLoading />}>
                <OrderSuccessContent />
            </Suspense>

            {/* Description */}
            <p className="max-w-xl text-sm text-gray-600 mb-8">
                Lean back and relax, knowing our team is hard at work preparing and shipping your package swiftly.
                Feel free to browse our diverse product selection during this time – you might discover another item you&apos;d like to add to your collection!
            </p>

            {/* Back to Home */}
            <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm underline transition"
            >
                Back to Home
            </Link>

            {/* Email Confirmation Note */}
            <div className="mt-8 max-w-md">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-1">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-blue-800 text-sm">Email Confirmation</div>
                            <div className="text-blue-600 text-xs mt-1">
                                An order confirmation email has been sent to your registered email address.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
