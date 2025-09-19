"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, Star, Truck, Heart, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/userSlice";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLoading } from "../../../contexts/LoadingContext";

export default function DashboardPage() {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const { setLoading: setGlobalLoading } = useLoading();

    const { isAuthorized, isLoading: authLoading, authInitialized } = useAuthGuard({
        requireAuth: true,
        redirectTo: '/login'
    });

    // Clear global loading when page is ready
    useEffect(() => {
        if (!authLoading && isAuthorized && authInitialized) {
            setGlobalLoading(false);
        }
    }, [authLoading, isAuthorized, authInitialized, setGlobalLoading]);

    // Navigation handlers with loading states
    const handleNavigation = (path: string) => {
        setGlobalLoading(true);
        router.push(path);
    };

    // Mock data - replace with actual API calls
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 12,
        pendingReviews: 3,
        wishlistItems: 8,
        recentOrders: [
            { id: 1, orderNumber: "DLC001234", status: "Delivered", date: "2025-01-20" },
            { id: 2, orderNumber: "DLC001235", status: "Shipped", date: "2025-01-18" },
            { id: 3, orderNumber: "DLC001236", status: "Processing", date: "2025-01-15" }
        ]
    });

    // Show loading if authentication is being checked
    if (authLoading || !isAuthorized || !authInitialized) {
        return (
            <div className="flex min-h-screen bg-gray-100 p-6 items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#d9673f] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium">
                        {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1 hidden lg:block">Welcome back, {user?.name || 'User'}!</p>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Product Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingReviews}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Wishlist Items</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.wishlistItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available Coupons</p>
                                <p className="text-2xl font-bold text-gray-900">5</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/order-history')}
                            className="text-sm"
                        >
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {dashboardStats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                        <p className="text-sm text-gray-600">{order.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'Shipped'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/reviews')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <Star className="w-5 h-5" />
                            <span>Write Reviews</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/wishlist')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <Heart className="w-5 h-5" />
                            <span>View Wishlist</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/delivery-reviews')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <Truck className="w-5 h-5" />
                            <span>Delivery Reviews</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/personal-info')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Update Profile</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/addresses')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>Manage Addresses</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleNavigation('/account/coupons')}
                            className="flex items-center gap-2 p-4 h-auto"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span>View Coupons</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}