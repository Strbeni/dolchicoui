"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, Clock, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ReturnPolicyPage() {
    const router = useRouter();

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
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Return & Exchange Policy</h1>
                    <p className="text-gray-600 mt-1 hidden lg:block">Easy returns and exchanges for your peace of mind</p>
                </div>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-4 text-center">
                    <CardContent className="p-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">7 Days Return</h3>
                        <p className="text-sm text-gray-600">Easy returns within 7 days of delivery</p>
                    </CardContent>
                </Card>

                <Card className="p-4 text-center">
                    <CardContent className="p-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Quick Refunds</h3>
                        <p className="text-sm text-gray-600">Get your money back in 5-7 business days</p>
                    </CardContent>
                </Card>

                <Card className="p-4 text-center">
                    <CardContent className="p-0">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Package className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Free Pickup</h3>
                        <p className="text-sm text-gray-600">Free doorstep pickup for returns</p>
                    </CardContent>
                </Card>
            </div>

            {/* Return Policy Content */}
            <div className="space-y-6">
                {/* Return Window */}
                <Card className="p-6">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Window</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>You can return most items within <strong>7 days</strong> of delivery for a full refund.</p>
                            <p>For certain categories like innerwear, swimwear, and cosmetics, returns may not be accepted due to hygiene reasons.</p>
                            <p>The return window starts from the date of delivery, not the date of purchase.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Return Conditions */}
                <Card className="p-6">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Conditions</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>Items must be in their original condition to be eligible for return:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Items should be unused, unwashed, and in original packaging</li>
                                <li>All tags and labels must be attached</li>
                                <li>Items should not have any stains, damage, or alterations</li>
                                <li>Accessories and freebies (if any) should be included</li>
                                <li>Original invoice/receipt should be available</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Exchange Policy */}
                <Card className="p-6">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Exchange Policy</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>We offer easy exchanges for size and color variants:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Size exchanges are available for most clothing items</li>
                                <li>Color exchanges subject to availability</li>
                                <li>Exchange requests must be raised within 7 days of delivery</li>
                                <li>Exchanged items will be delivered within 7-10 business days</li>
                                <li>No additional charges for size/color exchanges</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Refund Process */}
                <Card className="p-6">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Process</h2>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">1. Initiate Return</h3>
                                <p className="text-sm">Log into your account and select the item you want to return from your order history.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">2. Schedule Pickup</h3>
                                <p className="text-sm">Choose a convenient time slot for our delivery partner to pick up the item from your address.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">3. Quality Check</h3>
                                <p className="text-sm">Once we receive the item, our team will inspect it to ensure it meets return conditions.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">4. Refund Processing</h3>
                                <p className="text-sm">After successful quality check, refund will be processed within 5-7 business days.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Non-Returnable Items */}
                <Card className="p-6 border-red-200 bg-red-50">
                    <CardContent className="p-0">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                            <div>
                                <h2 className="text-xl font-semibold text-red-900 mb-4">Non-Returnable Items</h2>
                                <div className="space-y-2 text-red-800">
                                    <p>The following items cannot be returned for hygiene and safety reasons:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Undergarments and innerwear</li>
                                        <li>Swimwear and intimate apparel</li>
                                        <li>Cosmetics and beauty products</li>
                                        <li>Items on final sale or clearance</li>
                                        <li>Customized or personalized items</li>
                                        <li>Gift cards and vouchers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Refund Methods */}
                <Card className="p-6">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Methods</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>Refunds will be processed using the same payment method used for the original purchase:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
                                <li><strong>Net Banking:</strong> 5-7 business days</li>
                                <li><strong>UPI/Wallet:</strong> 3-5 business days</li>
                                <li><strong>Cash on Delivery:</strong> Bank transfer within 7-10 business days</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-blue-900 mb-4">Need Help?</h2>
                        <div className="space-y-3 text-blue-800">
                            <p>If you have any questions about returns or need assistance:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Email us at: <strong>returns@dolchico.com</strong></li>
                                <li>Call our customer service: <strong>1800-123-4567</strong></li>
                                <li>Live chat available on our website (9 AM - 9 PM)</li>
                            </ul>
                            <p className="mt-4">Our customer service team is available Monday to Saturday, 9 AM to 9 PM to assist you.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}