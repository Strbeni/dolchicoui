'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, Truck, MapPin, Calendar, DollarSign, Hash, ChevronDown, ShoppingBag, X } from "lucide-react";
import { useLoading } from '../../../contexts/LoadingContext';

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
                className="w-full md:w-48 h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
                <span className="block truncate text-sm">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full md:w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
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

// Refund/Replacement Dialog Component
interface RefundReplacementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onEmailContact: (selectedProducts: SelectedProduct[]) => void;
    onWhatsAppContact: (selectedProducts: SelectedProduct[]) => void;
    onCancel: () => void;
    order: Order | null;
}

interface SelectedProduct {
    productId: number;
    productName: string;
    size: string;
    type: 'refund' | 'replacement';
}

const RefundReplacementDialog: React.FC<RefundReplacementDialogProps> = ({
    isOpen,
    onClose,
    onEmailContact,
    onWhatsAppContact,
    onCancel,
    order
}) => {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [availableProducts, setAvailableProducts] = useState<{ id: number; name: string; size: string }[]>([]);

    useEffect(() => {
        if (order && order.items) {
            const products = order.items.map(item => ({
                id: item.productId,
                name: item.product.name,
                size: item.size
            }));
            setAvailableProducts(products);
            setSelectedProducts([]);
        }
    }, [order]);

    const addProductSelection = () => {
        setSelectedProducts([...selectedProducts, {
            productId: 0,
            productName: '',
            size: '',
            type: 'refund'
        }]);
    };

    const removeProductSelection = (index: number) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    const updateProductSelection = (index: number, field: keyof SelectedProduct, value: string | number) => {
        const updated = [...selectedProducts];
        if (field === 'productId') {
            const product = availableProducts.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    productId: product.id,
                    productName: product.name,
                    size: product.size
                };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setSelectedProducts(updated);
    };

    const handleEmailContact = () => {
        const validProducts = selectedProducts.filter(p => p.productId > 0);
        if (validProducts.length === 0) {
            alert('Please select at least one product');
            return;
        }
        onEmailContact(validProducts);
        onClose();
    };

    const handleWhatsAppContact = () => {
        const validProducts = selectedProducts.filter(p => p.productId > 0);
        if (validProducts.length === 0) {
            alert('Please select at least one product');
            return;
        }
        onWhatsAppContact(validProducts);
        onClose();
    };

    if (!isOpen || !order) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Dialog content */}
                <div className="p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 pr-8">
                        Request Refund/Replacement
                    </h2>

                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        Select the products you want to refund or replace from Order #{order.id}
                    </p>

                    {/* Product Selection Section */}
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-800 mb-3">Select Products:</h3>

                        {selectedProducts.map((selectedProduct, index) => (
                            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Product Dropdown */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product
                                        </label>
                                        <select
                                            value={selectedProduct.productId}
                                            onChange={(e) => updateProductSelection(index, 'productId', parseInt(e.target.value))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value={0}>Select a product</option>
                                            {availableProducts.map((product) => (
                                                <option key={`${product.id}-${product.size}`} value={product.id}>
                                                    {product.name} (Size: {product.size})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Type Selection */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Request Type
                                        </label>
                                        <select
                                            value={selectedProduct.type}
                                            onChange={(e) => updateProductSelection(index, 'type', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="refund">Refund</option>
                                            <option value="replacement">Replacement</option>
                                        </select>
                                    </div>

                                    {/* Remove Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => removeProductSelection(index)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                                            title="Remove product"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Product Button */}
                        <button
                            onClick={addProductSelection}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span>
                            Add Product
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <Button
                            onClick={handleEmailContact}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md py-2 cursor-pointer"
                        >
                            Email Contact
                        </Button>
                        <Button
                            onClick={handleWhatsAppContact}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md py-2 cursor-pointer"
                        >
                            WhatsApp Contact
                        </Button>
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md py-2 cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
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
    category?: string; // Made optional
    subCategory?: string; // Made optional
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
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);

    const router = useRouter();
    const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading();

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

    // Clear global loading when component is ready
    useEffect(() => {
        if (!loading) {
            setGlobalLoading(false);
        }
    }, [loading, setGlobalLoading]);

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
        setGlobalLoading(true);
        setLoadingMessage('Loading order details...');
        router.push(`/account/order-history/orderDetail/${orderId}`);
    };

    const handleNavigateToDeliveryReviews = () => {
        setGlobalLoading(true);
        setLoadingMessage('Loading delivery reviews...');
        router.push('/account/delivery-reviews');
    };

    const handleNavigateToProductReviews = () => {
        setGlobalLoading(true);
        setLoadingMessage('Loading product reviews...');
        router.push('/account/reviews');
    };

    const handleRefundClick = (order: Order) => {
        setSelectedOrderForRefund(order);
        setIsRefundDialogOpen(true);
    };

    const handleEmailContact = async (selectedProducts: SelectedProduct[]) => {
        if (!selectedOrderForRefund) return;

        // Generate detailed message with selected products
        const refundProducts = selectedProducts.filter(p => p.type === 'refund');
        const replacementProducts = selectedProducts.filter(p => p.type === 'replacement');

        // Generate subject
        const subject = refundProducts.length > 0 && replacementProducts.length > 0
            ? 'Refund and Replacement Request'
            : refundProducts.length > 0
                ? 'Refund Request'
                : 'Replacement Request';

        let messageContent = `Dear Support Team,

I would like to request a `;

        if (refundProducts.length > 0 && replacementProducts.length > 0) {
            messageContent += `refund and replacement`;
        } else if (refundProducts.length > 0) {
            messageContent += `refund`;
        } else {
            messageContent += `replacement`;
        }

        messageContent += ` for my order.

Order Details:
- Order ID: #${selectedOrderForRefund.id}
- Order Date: ${formatDate(selectedOrderForRefund.date)}
- Order Amount: ₹${selectedOrderForRefund.amount}

`;

        if (refundProducts.length > 0) {
            messageContent += `Products for REFUND:
`;
            refundProducts.forEach((product, index) => {
                messageContent += `${index + 1}. ${product.productName} (Size: ${product.size})
`;
            });
            messageContent += `
`;
        }

        if (replacementProducts.length > 0) {
            messageContent += `Products for REPLACEMENT:
`;
            replacementProducts.forEach((product, index) => {
                messageContent += `${index + 1}. ${product.productName} (Size: ${product.size})
`;
            });
            messageContent += `
`;
        }

        messageContent += `Please assist me with the ${refundProducts.length > 0 && replacementProducts.length > 0 ? 'refund and replacement' : selectedProducts[0]?.type} process.

Best regards`;

        // Try to generate ticket via API
        let ticketId = '';
        let ticketCreated = false;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

            const response = await fetch(`${API_BASE_URL}/api/generateticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    fullName: user?.name || user?.fullName || 'Customer',
                    email: user?.email || '',
                    subject: subject,
                    message: messageContent,
                    userId: user?.id,
                    orderId: selectedOrderForRefund.id,
                    selectedProducts: selectedProducts
                })
            });

            if (response.ok) {
                const data = await response.json();
                ticketId = data.ticketId || data.id || '';
                ticketCreated = true;
            }
        } catch (error) {
            console.log('Failed to generate ticket, will proceed without it');
        }

        // If ticket was created, add it to the message
        if (ticketCreated && ticketId) {
            messageContent = messageContent.replace('Best regards', `Support Ticket ID: ${ticketId}

Best regards`);
        }

        // Store the enhanced contact info in sessionStorage for the contact page
        const orderInfo = {
            orderId: selectedOrderForRefund.id,
            orderDate: selectedOrderForRefund.date,
            orderAmount: selectedOrderForRefund.amount,
            selectedProducts: selectedProducts,
            ticketId: ticketId,
            ticketCreated: ticketCreated,
            prefilledMessage: messageContent,
            subject: subject
        };

        sessionStorage.setItem('refundOrderInfo', JSON.stringify(orderInfo));
        setGlobalLoading(true);
        setLoadingMessage('Loading contact page...');
        router.push('/account/contact');
    };

    const handleWhatsAppContact = async (selectedProducts: SelectedProduct[]) => {
        if (!selectedOrderForRefund) return;

        // Generate detailed message with selected products
        const refundProducts = selectedProducts.filter(p => p.type === 'refund');
        const replacementProducts = selectedProducts.filter(p => p.type === 'replacement');

        // Generate subject for ticket
        const subject = refundProducts.length > 0 && replacementProducts.length > 0
            ? 'Refund and Replacement Request'
            : refundProducts.length > 0
                ? 'Refund Request'
                : 'Replacement Request';

        // Try to generate ticket via API
        let ticketId = '';
        let ticketCreated = false;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

            // Create ticket message for API
            let ticketMessage = `Refund/Replacement request for Order #${selectedOrderForRefund.id}`;
            if (refundProducts.length > 0) {
                ticketMessage += `\n\nRefund Products: ${refundProducts.map(p => `${p.productName} (${p.size})`).join(', ')}`;
            }
            if (replacementProducts.length > 0) {
                ticketMessage += `\n\nReplacement Products: ${replacementProducts.map(p => `${p.productName} (${p.size})`).join(', ')}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/generateticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    fullName: user?.name || user?.fullName || 'Customer',
                    email: user?.email || '',
                    subject: subject,
                    message: ticketMessage,
                    userId: user?.id,
                    orderId: selectedOrderForRefund.id,
                    selectedProducts: selectedProducts
                })
            });

            if (response.ok) {
                const data = await response.json();
                ticketId = data.ticketId || data.id || '';
                ticketCreated = true;
            }
        } catch (error) {
            console.log('Failed to generate ticket, will proceed without it');
        }

        // Get user information for the message
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

        // Format products list for WhatsApp message
        let productsText = '';
        if (refundProducts.length > 0) {
            productsText += `*Products for REFUND:*\n`;
            refundProducts.forEach((product, index) => {
                productsText += `${index + 1}. ${product.productName} (Size: ${product.size})\n`;
            });
            productsText += '\n';
        }

        if (replacementProducts.length > 0) {
            productsText += `*Products for REPLACEMENT:*\n`;
            replacementProducts.forEach((product, index) => {
                productsText += `${index + 1}. ${product.productName} (Size: ${product.size})\n`;
            });
            productsText += '\n';
        }

        // Create WhatsApp message
        let message = `Hello! I would like to request a ${refundProducts.length > 0 && replacementProducts.length > 0 ? 'refund and replacement' : selectedProducts[0]?.type} for my order.

*Order Details:*
- Order ID: #${selectedOrderForRefund.id}
- Order Date: ${formatDate(selectedOrderForRefund.date)}
- Order Amount: ₹${selectedOrderForRefund.amount}`;

        if (ticketCreated && ticketId) {
            message += `
- Support Ticket ID: ${ticketId}`;
        }

        message += `

*Customer Details:*
- Name: ${user?.name || user?.fullName || 'Not available'}
- Email: ${user?.email || 'Not available'}

${productsText}Please assist me with the ${refundProducts.length > 0 && replacementProducts.length > 0 ? 'refund and replacement' : selectedProducts[0]?.type} process.

Thank you!`;

        // WhatsApp customer care number - replace with actual number
        const whatsappNumber = "+917317690770"; // Replace with actual customer care number
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    };

    const handleCancelClick = () => {
        setIsRefundDialogOpen(false);
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
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-3 md:p-6 overflow-x-hidden">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center max-w-md px-4">
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
        <>
            <div className="max-w-7xl mx-auto">
            {/* Page Header with Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
                        aria-label="Go back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Order History</h1>
                </div>
                
                <div className="flex gap-3 md:gap-4">
                    {/* Status Filter */}
                    <div className="flex-1 md:flex-none md:w-auto">
                        <CustomDropdown
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            options={statusOptions}
                            placeholder="Select status"
                            className="w-full md:w-auto"
                        />
                    </div>

                    {/* Time Filter */}
                    <div className="flex-1 md:flex-none md:w-auto">
                        <CustomDropdown
                            value={timeFilter}
                            onValueChange={setTimeFilter}
                            options={timeOptions}
                            placeholder="For all time"
                            className="w-full md:w-auto"
                        />
                    </div>
                </div>
            </div>
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your orders...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center max-w-md px-4">
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
                                <p className="text-gray-500 mb-6 px-4">
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
                                    <div className="bg-gray-100 px-4 md:px-6 py-3 md:py-4 border-b">
                                        <div className="flex justify-between items-start text-sm">
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
                                    <div className="px-4 md:px-6 py-4 bg-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-bold text-gray-900">
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
                                                    <span className="text-sm font-medium text-black">
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                                        {order.items && order.items.length > 0 && (
                                            <div>
                                                {/* Show up to 2 products, each in its own row */}
                                                {order.items.slice(0, 2).map((item, index) => (
                                                    <div key={item.id} className={`${index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}`}>
                                                        {/* Product Image and Info Container */}
                                                        <div className="flex flex-col md:flex-row gap-4">
                                                            <div className="flex gap-4 flex-1">
                                                                {/* Product Image */}
                                                                <div className="w-16 h-20 md:w-20 md:h-24 relative shrink-0">
                                                                    <Image
                                                                        src={item.product.image[0] || '/placeholder.png'}
                                                                        alt={item.product.name}
                                                                        fill
                                                                        className="object-cover rounded border"
                                                                    />
                                                                </div>

                                                                {/* Product Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-medium text-base md:text-lg text-gray-900 break-words">
                                                                            {item.product.name}
                                                                        </h4>
                                                                        <p className="text-gray-600 text-sm">
                                                                            Size: <span className="font-medium">{item.size}</span>
                                                                        </p>
                                                                        {item.product.category && item.product.subCategory && (
                                                                            <p className="text-gray-600 text-sm break-words">
                                                                                Category: <span className="font-medium">{item.product.category} - {item.product.subCategory}</span>
                                                                            </p>
                                                                        )}
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
                                                                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center gap-2 text-sm h-8 cursor-pointer w-fit"
                                                                            style={{ paddingLeft: '16px', paddingRight: '16px' }}
                                                                            onClick={() => router.push(`/productdetail/${item.product.id}`)}
                                                                        >
                                                                            <ShoppingBag className="w-4 h-4" />
                                                                            Buy again
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons - Only show for first product to avoid duplication */}
                                                            {index === 0 && (
                                                                <div className="flex flex-col gap-2 w-full md:w-auto md:shrink-0 mt-4 md:mt-0">
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-3 text-xs md:text-sm h-8 cursor-pointer w-full md:w-auto whitespace-nowrap"
                                                                        onClick={handleNavigateToDeliveryReviews}
                                                                    >
                                                                        Leave Delivery Feedback
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-3 text-xs md:text-sm h-8 cursor-pointer w-full md:w-auto whitespace-nowrap"
                                                                        onClick={handleNavigateToProductReviews}
                                                                    >
                                                                        Leave Product Review
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-3 text-xs md:text-sm h-8 cursor-pointer w-full md:w-auto whitespace-nowrap"
                                                                        onClick={() => handleRefundClick(order)}
                                                                    >
                                                                        Refund/replacement
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* View order details button - always visible */}
                                                <div className="pt-4 flex justify-center">
                                                    <button
                                                        className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium cursor-pointer"
                                                        onClick={() => handleViewDetails(order.id)}
                                                    >
                                                        View order details
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Refund/Replacement Dialog */}
            <RefundReplacementDialog
                isOpen={isRefundDialogOpen}
                onClose={() => setIsRefundDialogOpen(false)}
                onEmailContact={handleEmailContact}
                onWhatsAppContact={handleWhatsAppContact}
                onCancel={handleCancelClick}
                order={selectedOrderForRefund}
            />
        </>
    );
}