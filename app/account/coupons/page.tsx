"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Percent, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface Coupon {
    id: number;
    code: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderValue: number;
    maxDiscount?: number;
    expiryDate: string;
    isUsed: boolean;
    isExpired: boolean;
}

export default function CouponsPage() {
    const router = useRouter();

    const { isAuthorized, isLoading: authLoading, authInitialized } = useAuthGuard({
        requireAuth: true,
        redirectTo: '/login'
    });

    // Mock data - replace with actual API calls
    const [coupons, setCoupons] = useState<Coupon[]>([
        {
            id: 1,
            code: "WELCOME20",
            title: "Welcome Offer",
            description: "Get 20% off on your first order",
            discount: 20,
            discountType: 'percentage',
            minOrderValue: 999,
            maxDiscount: 500,
            expiryDate: "2025-12-31",
            isUsed: false,
            isExpired: false
        },
        {
            id: 2,
            code: "FLAT100",
            title: "Flat ₹100 Off",
            description: "Flat ₹100 discount on orders above ₹799",
            discount: 100,
            discountType: 'fixed',
            minOrderValue: 799,
            expiryDate: "2025-10-15",
            isUsed: false,
            isExpired: false
        },
        {
            id: 3,
            code: "SUMMER25",
            title: "Summer Sale",
            description: "25% off on summer collection",
            discount: 25,
            discountType: 'percentage',
            minOrderValue: 1499,
            maxDiscount: 750,
            expiryDate: "2025-06-30",
            isUsed: true,
            isExpired: false
        },
        {
            id: 4,
            code: "WINTER50",
            title: "Winter Special",
            description: "₹50 off on winter wear",
            discount: 50,
            discountType: 'fixed',
            minOrderValue: 599,
            expiryDate: "2025-03-31",
            isUsed: false,
            isExpired: true
        },
        {
            id: 5,
            code: "FESTIVE15",
            title: "Festive Discount",
            description: "15% off on all festive wear",
            discount: 15,
            discountType: 'percentage',
            minOrderValue: 1200,
            maxDiscount: 400,
            expiryDate: "2025-11-30",
            isUsed: false,
            isExpired: false
        }
    ]);

    const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('active');

    // Filter coupons based on selected filter
    const filteredCoupons = coupons.filter(coupon => {
        switch (filter) {
            case 'active':
                return !coupon.isUsed && !coupon.isExpired;
            case 'used':
                return coupon.isUsed;
            case 'expired':
                return coupon.isExpired;
            default:
                return true;
        }
    });

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        // Show toast notification
        const toast = document.createElement('div');
        toast.textContent = 'Coupon code copied!';
        toast.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 transition-all duration-300 bg-green-600';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Show loading if authentication is being checked
    if (authLoading || !isAuthorized || !authInitialized) {
        return (
            <div className="flex min-h-screen bg-gray-100 p-6 items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#d9673f] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium">
                        {authLoading ? 'Checking authentication...' : 'Loading coupons...'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Coupons</h1>
                    <p className="text-gray-600 mt-1 hidden lg:block">Save more with exclusive discount coupons</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                    { key: 'active', label: 'Active' },
                    { key: 'used', label: 'Used' },
                    { key: 'expired', label: 'Expired' },
                    { key: 'all', label: 'All' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
                {filteredCoupons.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Tag className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No coupons found</h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'active'
                                ? "You don't have any active coupons right now."
                                : filter === 'used'
                                    ? "You haven't used any coupons yet."
                                    : filter === 'expired'
                                        ? "You don't have any expired coupons."
                                        : "No coupons available."
                            }
                        </p>
                        <Button
                            onClick={() => router.push('/productlist')}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
                        >
                            Shop Now
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCoupons.map((coupon) => (
                            <Card key={coupon.id} className={`p-4 ${coupon.isUsed || coupon.isExpired
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'border-orange-200 bg-gradient-to-r from-orange-50 to-white'
                                }`}>
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Coupon Icon */}
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.isUsed || coupon.isExpired
                                                    ? 'bg-gray-200'
                                                    : 'bg-orange-100'
                                                }`}>
                                                {coupon.discountType === 'percentage' ? (
                                                    <Percent className={`w-6 h-6 ${coupon.isUsed || coupon.isExpired
                                                            ? 'text-gray-400'
                                                            : 'text-orange-600'
                                                        }`} />
                                                ) : (
                                                    <Tag className={`w-6 h-6 ${coupon.isUsed || coupon.isExpired
                                                            ? 'text-gray-400'
                                                            : 'text-orange-600'
                                                        }`} />
                                                )}
                                            </div>

                                            {/* Coupon Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-semibold ${coupon.isUsed || coupon.isExpired
                                                            ? 'text-gray-500'
                                                            : 'text-gray-900'
                                                        }`}>
                                                        {coupon.title}
                                                    </h3>
                                                    {coupon.isUsed && (
                                                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                            Used
                                                        </span>
                                                    )}
                                                    {coupon.isExpired && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm mb-2 ${coupon.isUsed || coupon.isExpired
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                    }`}>
                                                    {coupon.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Min order: ₹{coupon.minOrderValue}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Expires: {formatDate(coupon.expiryDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coupon Code and Action */}
                                        <div className="text-right">
                                            <div className={`font-mono text-lg font-bold mb-2 ${coupon.isUsed || coupon.isExpired
                                                    ? 'text-gray-400'
                                                    : 'text-orange-600'
                                                }`}>
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discount}% OFF`
                                                    : `₹${coupon.discount} OFF`
                                                }
                                            </div>
                                            <div className={`text-sm font-mono mb-3 px-3 py-1 rounded border ${coupon.isUsed || coupon.isExpired
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400'
                                                    : 'bg-white border-orange-200 text-gray-700'
                                                }`}>
                                                {coupon.code}
                                            </div>
                                            {!coupon.isUsed && !coupon.isExpired && (
                                                <Button
                                                    onClick={() => copyToClipboard(coupon.code)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                                >
                                                    Copy Code
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Terms and Conditions */}
            {filteredCoupons.length > 0 && (
                <Card className="mt-8 p-4 bg-blue-50 border-blue-200">
                    <CardContent className="p-0">
                        <h3 className="font-semibold text-blue-900 mb-2">Terms & Conditions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Coupons are valid only for the specified period</li>
                            <li>• Minimum order value must be met to use the coupon</li>
                            <li>• Only one coupon can be used per order</li>
                            <li>• Coupons cannot be combined with other offers</li>
                            <li>• Dolchico reserves the right to modify or cancel coupons</li>
                        </ul>
                    </CardContent>
                </Card>
            )}
        </>
    );
}