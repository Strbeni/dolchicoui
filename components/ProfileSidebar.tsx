"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/userSlice";

interface ProfileSidebarProps {
    activeSection?: string;
    className?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    activeSection = "personal-info",
    className = ""
}) => {
    const router = useRouter();
    const user = useAppSelector(selectUser);

    const navigationItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="m16 10-4 4-4-4" />
                </svg>
            )
        },
        {
            id: "reviews",
            label: "My Reviews",
            href: "/reviews",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            )
        },
        {
            id: "delivery-reviews",
            label: "Delivery Reviews",
            href: "/deliveryreview",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
            )
        },
        {
            id: "order-history",
            label: "Order History",
            href: "/profile/orderHistory",
            icon: <ShoppingCart className="w-5 h-5" />
        },
        {
            id: "wishlist",
            label: "Wishlist",
            href: "/wishlist",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            )
        },
        {
            id: "coupons",
            label: "Coupons",
            href: "/profile/coupons",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            )
        }
    ];

    const accountManagementItems = [
        {
            id: "personal-info",
            label: "Personal Info",
            href: "/profile",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            id: "addresses",
            label: "Addresses",
            href: "/profile/addressBook",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            )
        }
    ];

    const customerServiceItems = [
        {
            id: "return-policy",
            label: "Return Policy",
            href: "/return-policy",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            )
        },
        {
            id: "contact",
            label: "Contact Us",
            href: "/contact",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            )
        }
    ];

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    const isActive = (itemId: string) => {
        return activeSection === itemId;
    };

    return (
        <div className={`bg-white p-6 shadow rounded-xl ${className}`}>
            {/* User Profile Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-[#F3612A] font-semibold text-lg">
                            {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                        <p className="text-sm text-gray-500">{user?.email || ""}</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="space-y-2 mb-6">
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg transition font-medium ${isActive(item.id)
                                ? "bg-[#F3612A] text-white"
                                : "hover:bg-gray-100 text-gray-900"
                            }`}
                    >
                        <div className={`w-5 h-5 ${isActive(item.id) ? "text-white" : "text-gray-600"}`}>
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Account Management Section */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 tracking-wide mb-3">Manage Account</h3>
                <div className="space-y-2">
                    {accountManagementItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigation(item.href)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg transition font-medium ${isActive(item.id)
                                    ? "bg-[#F3612A] text-white"
                                    : "hover:bg-gray-100 text-gray-900"
                                }`}
                        >
                            <div className={`w-5 h-5 ${isActive(item.id) ? "text-white" : "text-gray-600"}`}>
                                {item.icon}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer Service Section */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 tracking-wide mb-3">Customer Service</h3>
                <div className="space-y-2">
                    {customerServiceItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigation(item.href)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg transition font-medium ${isActive(item.id)
                                    ? "bg-[#F3612A] text-white"
                                    : "hover:bg-gray-100 text-gray-900"
                                }`}
                        >
                            <div className={`w-5 h-5 ${isActive(item.id) ? "text-white" : "text-gray-600"}`}>
                                {item.icon}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Logout Section */}
            <div className="pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => handleNavigation("/logout")}
                    className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-red-50 transition font-medium text-red-600"
                >
                    <div className="w-5 h-5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileSidebar;
