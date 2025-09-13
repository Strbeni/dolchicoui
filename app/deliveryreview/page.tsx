'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Star, ChevronDown, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// Toast notification function
const toast = (msg: string, ok = true) => {
    if (typeof window === 'undefined') return;
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 transition-all duration-300 ${ok ? 'bg-green-600' : 'bg-red-600'
        }`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => el.remove(), 300);
    }, 2700);
};

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
                className="w-full sm:w-48 h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
                <span className="block truncate text-sm">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full sm:w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
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
    category?: string;
    subCategory?: string;
    sizes: string[];
    bestseller: boolean;
    isActive: boolean;
    stock: number;
    date: string;
    createdAt: any;
    updatedAt: any;
}

interface DeliveryReview {
    id: number;
    userId: number;
    orderId: number;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

interface Order {
    id: number;
    orderNumber: string;
    products: Product[];
    orderDate: string;
    deliveryDate: string;
    status: string;
    deliveryReview?: DeliveryReview;
}

// Static Data for Testing (Replace with API later)
const STATIC_ORDERS: Order[] = [
    {
        id: 1,
        orderNumber: "DLC001234",
        products: [
            {
                id: 101,
                name: "Premium Cotton T-Shirt",
                description: "Comfortable cotton t-shirt perfect for daily wear",
                price: 1299,
                image: ["/product.jpg", "/p1.svg"],
                category: "Men",
                subCategory: "T-Shirts",
                sizes: ["S", "M", "L", "XL"],
                bestseller: true,
                isActive: true,
                stock: 50,
                date: "1693123200000",
                createdAt: "1693123200000",
                updatedAt: "1693123200000"
            }
        ],
        orderDate: "2025-01-15",
        deliveryDate: "2025-01-20",
        status: "delivered",
        deliveryReview: {
            id: 1,
            userId: 1,
            orderId: 1,
            rating: 4,
            comment: "Great delivery experience, package arrived on time and in perfect condition.",
            createdAt: "2025-01-21",
            updatedAt: "2025-01-21"
        }
    },
    {
        id: 2,
        orderNumber: "DLC001235",
        products: [
            {
                id: 102,
                name: "Casual Denim Jeans",
                description: "Classic blue denim jeans with perfect fit",
                price: 2499,
                image: ["/product.jpg", "/p2.svg"],
                category: "Men",
                subCategory: "Jeans",
                sizes: ["30", "32", "34", "36"],
                bestseller: false,
                isActive: true,
                stock: 30,
                date: "1693123200000",
                createdAt: "1693123200000",
                updatedAt: "1693123200000"
            }
        ],
        orderDate: "2025-02-01",
        deliveryDate: "2025-02-05",
        status: "delivered"
        // No delivery review yet
    },
    {
        id: 3,
        orderNumber: "DLC001236",
        products: [
            {
                id: 103,
                name: "Formal White Shirt",
                description: "Crisp white formal shirt for professional look",
                price: 1899,
                image: ["/product.jpg", "/p3.svg"],
                category: "Men",
                subCategory: "Shirts",
                sizes: ["S", "M", "L", "XL"],
                bestseller: true,
                isActive: true,
                stock: 25,
                date: "1693123200000",
                createdAt: "1693123200000",
                updatedAt: "1693123200000"
            }
        ],
        orderDate: "2025-02-10",
        deliveryDate: "2025-02-15",
        status: "delivered",
        deliveryReview: {
            id: 2,
            userId: 1,
            orderId: 3,
            rating: 5,
            comment: "Excellent delivery service! Fast, safe, and professional. Highly recommended.",
            createdAt: "2025-02-16",
            updatedAt: "2025-02-16"
        }
    },
    {
        id: 4,
        orderNumber: "DLC001237",
        products: [
            {
                id: 104,
                name: "Running Sneakers",
                description: "Comfortable running shoes with excellent cushioning",
                price: 3999,
                image: ["/product.jpg", "/p4.svg"],
                category: "Men",
                subCategory: "Shoes",
                sizes: ["7", "8", "9", "10", "11"],
                bestseller: true,
                isActive: true,
                stock: 40,
                date: "1693123200000",
                createdAt: "1693123200000",
                updatedAt: "1693123200000"
            }
        ],
        orderDate: "2025-03-01",
        deliveryDate: "2025-03-05",
        status: "delivered"
        // No delivery review yet
    },
    {
        id: 5,
        orderNumber: "DLC001238",
        products: [
            {
                id: 105,
                name: "Winter Jacket",
                description: "Warm winter jacket perfect for cold weather",
                price: 4999,
                image: ["/product.jpg", "/p5.svg"],
                category: "Men",
                subCategory: "Jackets",
                sizes: ["S", "M", "L", "XL"],
                bestseller: false,
                isActive: true,
                stock: 15,
                date: "1693123200000",
                createdAt: "1693123200000",
                updatedAt: "1693123200000"
            }
        ],
        orderDate: "2025-03-15",
        deliveryDate: "2025-03-20",
        status: "delivered",
        deliveryReview: {
            id: 3,
            userId: 1,
            orderId: 5,
            rating: 3,
            comment: "Delivery was delayed by a day, but package was in good condition.",
            createdAt: "2025-03-21",
            updatedAt: "2025-03-21"
        }
    }
];

export default function DeliveryReviewPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedReview, setSelectedReview] = useState<DeliveryReview | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHeading, setReviewHeading] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const router = useRouter();

    // Filter options
    const filterOptions: DropdownOption[] = [
        { value: "all", label: "Orders and delivery reviews" },
        { value: "reviewed", label: "Reviewed" },
        { value: "not_reviewed", label: "Not Reviewed" }
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

    // Fetch delivered orders (currently using static data)
    const fetchDeliveredOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!checkAuth()) return;

            try {
                // Try API call first
                const response = await fetch(`${API_BASE_URL}/api/orders/delivered/user`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success) {
                    setOrders(result.data?.orders || []);
                    return;
                }
            } catch (apiError) {
                console.warn('API call failed, falling back to static data:', apiError);
                // Fall back to static data if API fails
                setOrders(STATIC_ORDERS);
            }
        } catch (err) {
            console.error('Error fetching delivered orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [checkAuth]);

    // Get auth headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...orders];

        if (filter === "reviewed") {
            filtered = filtered.filter(order => order.deliveryReview);
        } else if (filter === "not_reviewed") {
            filtered = filtered.filter(order => !order.deliveryReview);
        }

        setFilteredOrders(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [orders, filter]);

    // Load orders on component mount
    useEffect(() => {
        fetchDeliveredOrders();
    }, [fetchDeliveredOrders]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const handleLeaveReview = (orderId: number) => {
        const order = orders.find(order => order.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setSelectedReview(null);
            setIsEditMode(false);
            setShowReviewForm(true);
            setReviewRating(0);
            setReviewHeading("");
            setReviewComment("");
            setUploadedFiles([]);
        }
    };

    const handleEditReview = (orderId: number) => {
        const order = orders.find(order => order.id === orderId);
        if (order && order.deliveryReview) {
            setSelectedOrder(order);
            setSelectedReview(order.deliveryReview);
            setIsEditMode(true);
            setShowReviewForm(true);
            setReviewRating(order.deliveryReview.rating);
            setReviewHeading(""); // Assuming heading is not stored in current review structure
            setReviewComment(order.deliveryReview.comment);
            setUploadedFiles([]);
        }
    };

    const handleCloseReviewForm = () => {
        setShowReviewForm(false);
        setIsEditMode(false);
        setSelectedOrder(null);
        setSelectedReview(null);
        setReviewRating(0);
        setReviewHeading("");
        setReviewComment("");
        setUploadedFiles([]);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/zip'].includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
            return isValidType && isValidSize;
        });

        setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async () => {
        if (!selectedOrder || reviewRating === 0 || !reviewComment.trim()) {
            toast('Please fill in all required fields', false);
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Replace with actual API call
            const formData = new FormData();
            formData.append('orderId', selectedOrder.id.toString());
            formData.append('rating', reviewRating.toString());
            formData.append('heading', reviewHeading);
            formData.append('comment', reviewComment);

            if (isEditMode && selectedReview) {
                formData.append('reviewId', selectedReview.id.toString());
            }

            uploadedFiles.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isEditMode && selectedReview) {
                // Update existing review
                const updatedReview: DeliveryReview = {
                    ...selectedReview,
                    rating: reviewRating,
                    comment: reviewComment,
                    updatedAt: new Date().toISOString()
                };

                setOrders(prev =>
                    prev.map(order =>
                        order.id === selectedOrder.id
                            ? { ...order, deliveryReview: updatedReview }
                            : order
                    )
                );

                toast('Delivery review updated successfully!');
            } else {
                // Create new review
                const newReview: DeliveryReview = {
                    id: Date.now(),
                    userId: 1,
                    orderId: selectedOrder.id,
                    rating: reviewRating,
                    comment: reviewComment,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                setOrders(prev =>
                    prev.map(order =>
                        order.id === selectedOrder.id
                            ? { ...order, deliveryReview: newReview }
                            : order
                    )
                );

                toast('Delivery review submitted successfully!');
            }

            handleCloseReviewForm();
        } catch (error) {
            console.error('Error submitting delivery review:', error);
            toast(`Failed to ${isEditMode ? 'update' : 'submit'} delivery review. Please try again.`, false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStarSelector = (rating: number, onRatingChange: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${star <= rating
                                ? 'text-orange-400 fill-current'
                                : 'text-gray-300 hover:text-orange-300'
                            }`}
                        onClick={() => onRatingChange(star)}
                    />
                ))}
            </div>
        );
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Loading state
    if (loading) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto flex gap-8">
                        <div className="w-1/4 flex-shrink-0">
                            <div className="sticky top-6">
                                <ProfileSidebar activeSection="delivery-reviews" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading your orders...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto flex gap-8">
                        <div className="w-1/4 flex-shrink-0">
                            <div className="sticky top-6">
                                <ProfileSidebar activeSection="delivery-reviews" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
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
                                        <Button onClick={fetchDeliveredOrders} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                            Try Again
                                        </Button>
                                        <Button variant="outline" onClick={() => router.push('/')} className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                                            Back to Home
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-3 md:p-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
                    {/* Sidebar - Hidden on mobile, visible on desktop */}
                    <div className="hidden lg:block lg:w-80 flex-shrink-0">
                        <div className="sticky top-6">
                            <ProfileSidebar activeSection="delivery-reviews" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 max-w-4xl w-full">
                        {showReviewForm ? (
                            /* Review Form */
                            <div className="bg-white rounded-lg shadow-sm lg:bg-transparent lg:shadow-none">
                                {/* Mobile Header with Back Button */}
                                <div className="flex items-center p-4 border-b lg:hidden">
                                    <button
                                        onClick={handleCloseReviewForm}
                                        className="mr-3 p-1"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        {isEditMode ? 'Edit delivery review' : 'Add delivery review'}
                                    </h1>
                                </div>

                                <div className="p-4 lg:p-0">
                                    {/* Desktop Breadcrumb - Hidden on mobile */}
                                    <div className="mb-6 hidden lg:block">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <button
                                                onClick={handleCloseReviewForm}
                                                className="hover:text-gray-800"
                                            >
                                                My delivery reviews
                                            </button>
                                            <span className="mx-2">›</span>
                                            <span>{isEditMode ? 'Edit delivery review' : 'Add delivery review'}</span>
                                        </div>
                                    </div>

                                    {/* Desktop Header - Hidden on mobile */}
                                    <div className="mb-8 hidden lg:block">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-6">{isEditMode ? 'Edit delivery review' : 'Add delivery review'}</h1>

                                        {/* Order Info */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 relative shrink-0">
                                                <Image
                                                    src={selectedOrder?.products[0]?.image[0] || '/placeholder.png'}
                                                    alt={selectedOrder?.orderNumber || ''}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            </div>
                                            <div>
                                                <h2 className="text-lg text-gray-900">
                                                    Order #{selectedOrder?.orderNumber}
                                                </h2>
                                                <p className="text-sm text-gray-600">
                                                    Delivered on {selectedOrder?.deliveryDate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Order Info */}
                                    <div className="flex items-center gap-3 mb-6 lg:hidden">
                                        <div className="w-12 h-12 relative shrink-0">
                                            <Image
                                                src={selectedOrder?.products[0]?.image[0] || '/placeholder.png'}
                                                alt={selectedOrder?.orderNumber || ''}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-medium text-gray-900">
                                                Order #{selectedOrder?.orderNumber}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                Delivered on {selectedOrder?.deliveryDate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Review Form */}
                                    <div className="space-y-4 lg:space-y-6">
                                        {/* Review Heading */}
                                        <div>
                                            <label className="block text-sm lg:text-md font-semibold text-gray-900 mb-2">
                                                Write feedback heading
                                            </label>
                                            <input
                                                type="text"
                                                value={reviewHeading}
                                                onChange={(e) => setReviewHeading(e.target.value)}
                                                placeholder="Give heading for delivery experience"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base"
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div>
                                            <label className="block text-sm lg:text-md font-semibold text-gray-900 mb-2">
                                                Rating
                                            </label>
                                            {renderStarSelector(reviewRating, setReviewRating)}
                                        </div>

                                        {/* Review Text */}
                                        <div>
                                            <label className="block text-sm lg:text-md font-semibold text-gray-900 mb-2">
                                                Give overall delivery experience
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Write your delivery experience"
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base"
                                            />
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="block text-sm lg:text-md font-semibold text-gray-900 mb-2">
                                                Upload Photo / Video
                                            </label>
                                            <p className="text-xs lg:text-sm text-gray-600 mb-3">
                                                Add your documents here, and you can upload up to 5 files max
                                            </p>

                                            {/* Upload Area */}
                                            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 lg:p-8 text-center mb-4">
                                                <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mx-auto mb-3" />
                                                <p className="text-sm lg:text-base text-gray-600 mb-2">
                                                    Drag your file(s) or{' '}
                                                    <label className="text-blue-600 cursor-pointer hover:underline">
                                                        browse
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept=".jpg,.png,.svg,.zip"
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </p>
                                                <p className="text-xs lg:text-sm text-gray-500">
                                                    Max 10 MB files are allowed
                                                </p>
                                            </div>

                                            <p className="text-xs lg:text-sm text-gray-500 mb-4">
                                                Only support .jpg, .png and .svg and zip files
                                            </p>

                                            {/* Uploaded Files */}
                                            {uploadedFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    {uploadedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <span className="text-sm text-gray-700 truncate mr-2">{file.name}</span>
                                                            <button
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 lg:pt-6">
                                            <Button
                                                onClick={handleCloseReviewForm}
                                                variant="outline"
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-md w-full sm:w-auto"
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                onClick={handleSubmitReview}
                                                disabled={isSubmitting}
                                                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-md w-full sm:w-auto"
                                            >
                                                {isSubmitting
                                                    ? (isEditMode ? 'Updating...' : 'Submitting...')
                                                    : (isEditMode ? 'Save Changes' : 'Save')
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Orders List View */
                            <>
                                {/* Header with Filter */}
                                <div className="mb-6 lg:mb-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => router.back()}
                                                className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
                                                aria-label="Go back"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                                            </button>
                                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My delivery reviews</h1>
                                        </div>
                                        <div className="w-full sm:w-auto">
                                            <CustomDropdown
                                                value={filter}
                                                onValueChange={setFilter}
                                                options={filterOptions}
                                                placeholder="Orders and delivery reviews"
                                                className="w-full sm:w-auto"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Orders List */}
                                <div className="space-y-0">
                                    {currentOrders.length === 0 ? (
                                        <div className="text-center py-8 lg:py-12">
                                            <div className="text-gray-400 mb-4">
                                                <Star className="w-12 h-12 lg:w-16 lg:h-16 mx-auto" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                                            <p className="text-gray-500 mb-6 px-4">
                                                {filter === "reviewed"
                                                    ? "You haven't reviewed any deliveries yet."
                                                    : filter === "not_reviewed"
                                                        ? "All your delivered orders have been reviewed."
                                                        : "You haven't received any delivered orders yet."
                                                }
                                            </p>
                                            <Button
                                                onClick={() => router.push('/productlist')}
                                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 cursor-pointer"
                                            >
                                                Shop Products
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-0">
                                            {currentOrders.map((order, index) => (
                                                <div key={order.id}>
                                                    <div className="px-0 py-4 lg:py-6">
                                                        <div className="flex items-center gap-3 lg:gap-6">
                                                            {/* Order Image */}
                                                            <div className="w-12 h-12 lg:w-16 lg:h-16 relative shrink-0">
                                                                <Image
                                                                    src={order.products[0]?.image[0] || '/placeholder.png'}
                                                                    alt={order.orderNumber}
                                                                    fill
                                                                    className="object-cover rounded"
                                                                />
                                                            </div>

                                                            {/* Order Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-normal text-sm lg:text-lg text-gray-900 leading-snug">
                                                                    Order #{order.orderNumber}
                                                                </h3>
                                                                <p className="text-xs lg:text-sm text-gray-600">
                                                                    Delivered on {order.deliveryDate}
                                                                </p>
                                                            </div>

                                                            {/* Review Status / Action */}
                                                            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                                                                {order.deliveryReview ? (
                                                                    <button
                                                                        onClick={() => handleEditReview(order.id)}
                                                                        className="flex items-center gap-1 lg:gap-2 hover:bg-gray-50 p-1 lg:p-2 rounded-md transition-colors cursor-pointer"
                                                                        title="Click to edit delivery review"
                                                                    >
                                                                        <div className="flex gap-0.5 lg:gap-1">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <Star
                                                                                    key={star}
                                                                                    className={`w-3 h-3 lg:w-4 lg:h-4 ${star <= order.deliveryReview!.rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 ml-0.5 lg:ml-1" />
                                                                    </button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => handleLeaveReview(order.id)}
                                                                        size="sm"
                                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 px-3 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-base rounded-md font-normal"
                                                                    >
                                                                        <span className="sm:inline">Leave delivery review</span>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Separator line (not for last item) */}
                                                    {index < currentOrders.length - 1 && (
                                                        <div className="border-t border-gray-200"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center gap-1 px-4">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => handlePageClick(page)}
                                                className={`min-w-[32px] h-8 p-0 text-sm ${currentPage === page
                                                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}