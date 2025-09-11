'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Phone, Mail, MessageCircle, MapPin, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/userSlice';

// Toast utility function
const toast = (msg: string, ok = true) => {
    if (typeof window === 'undefined') return;
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 transition-all duration-300 ${ok ? 'bg-green-600' : 'bg-red-600'
        }`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(el), 300);
    }, 3000);
};

export default function ContactPage() {
    const router = useRouter();
    const user = useAppSelector(selectUser);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check for refund order info and auto-fill form
    useEffect(() => {
        const refundOrderInfo = sessionStorage.getItem('refundOrderInfo');
        if (refundOrderInfo && user) {
            try {
                const orderInfo = JSON.parse(refundOrderInfo);
                setFormData({
                    fullName: user.name || user.fullName || '',
                    email: user.email || '',
                    subject: 'Replacement',
                    message: `I want replacement for the products which I have received in the order ${orderInfo.id}. The products which I want to replace are: `
                });
                // Clear the session storage after using it
                sessionStorage.removeItem('refundOrderInfo');
            } catch (error) {
                console.error('Error parsing refund order info:', error);
            }
        } else if (user && !formData.fullName && !formData.email) {
            // Auto-fill with user data if form is empty
            setFormData(prev => ({
                ...prev,
                fullName: user.name || user.fullName || '',
                email: user.email || ''
            }));
        }
    }, [user, formData.fullName, formData.email]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let ticketCreated = false;
        let ticketId = '';

        // Check if subject is related to replacement or refund
        const isReplacementOrRefund = formData.subject.toLowerCase().includes('replacement') || 
                                     formData.subject.toLowerCase().includes('refund') ||
                                     formData.subject.toLowerCase().includes('return') ||
                                     formData.subject.toLowerCase().includes('exchange');

        try {
            if (isReplacementOrRefund) {
                // 1. Create ticket via API only for replacement/refund requests
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                const response = await fetch(`${API_BASE_URL}/api/generateticket`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify({
                        fullName: formData.fullName,
                        email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                        userId: user?.id
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    ticketId = data.ticketId || data.id || '';
                    ticketCreated = true;
                    toast('Support ticket created successfully!');
                } else {
                    throw new Error('Failed to generate ticket');
                }
            }
        } catch (error) {
            if (isReplacementOrRefund) {
                toast('Failed to create ticket, but you can still send the email directly', false);
            }
        }

        try {
            // 2. Open Gmail with pre-filled email
            const companyEmail = 'support@dolchico.com'; // Replace with your company email
            const emailSubject = encodeURIComponent(formData.subject);

            let emailBodyContent = `Dear Support Team,\n\n${formData.message}\n\n`;
            
            if (ticketCreated && ticketId) {
                emailBodyContent += `Support Ticket ID: ${ticketId}\n(This ticket has been automatically generated for your request)\n\n`;
            }
            
            emailBodyContent += `Best regards,\n${formData.fullName}\n${formData.email}`;

            const emailBody = encodeURIComponent(emailBodyContent);

            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${companyEmail}&su=${emailSubject}&body=${emailBody}`;
            window.open(gmailUrl, '_blank');

            // Show appropriate success message
            if (ticketCreated) {
                toast(`Ticket ${ticketId} created and email opened! Please send the email to complete your request.`);
            } else {
                toast('Email opened in Gmail. Please send it to reach our support team.');
            }

            // Reset form
            setFormData({
                fullName: user?.name || user?.fullName || '',
                email: user?.email || '',
                subject: '',
                message: ''
            });

        } catch (error) {
            toast('Failed to open email client. Please contact support@dolchico.com directly.', false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsAppClick = () => {
        // Replace with your actual WhatsApp number
        const phoneNumber = '+1234567890';
        const message = 'Hello, I need help with a refund/replacement for my order.';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto flex gap-8 p-4 md:p-6">
                {/* Sidebar - Hidden on mobile */}
                <div className="hidden lg:block w-1/4 flex-shrink-0">
                    <div className="sticky top-6">
                        <ProfileSidebar activeSection="contact" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 w-full lg:w-3/4">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center mb-2">
                            {/* Back Button - Mobile only */}
                            <button
                                onClick={() => router.back()}
                                className="block lg:hidden mr-3 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-600">
                            Fill out the form below and we will reply within 24 hours
                        </p>
                    </div>

                    {/* Contact Form Section */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6 md:mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                            {/* Form */}
                            <div className="bg-gray-100 p-4 md:p-8 order-2 lg:order-1">
                                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full name
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your Full name"
                                            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            required
                                        />
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            required
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="Enter subject to contact us"
                                            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Enter message you want to give us ..."
                                            rows={4}
                                            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none bg-white"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 md:py-3 text-sm md:text-base rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send message'}
                                    </Button>
                                </form>
                            </div>

                            {/* Image - Full height and width */}
                            <div className="relative h-64 md:h-96 lg:h-full lg:min-h-[600px] bg-gray-200 order-1 lg:order-2">
                                <img
                                    src="/home_main.jpg"
                                    alt="Contact us"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Hide image and show fallback if it fails to load
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                {/* Fallback content if image doesn't load */}
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                                    <div className="text-center text-gray-500">
                                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">Contact Us</p>
                                        <p className="text-sm">We're here to help!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
                        {/* Call us directly */}
                        <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Call us directly</h3>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm text-gray-600">Customers: +1 50 537 53 082</p>
                                <p className="text-xs md:text-sm text-gray-600">Franchise: +1 50 537 53 000</p>
                            </div>
                        </div>

                        {/* Send a message */}
                        <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Send a message</h3>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm text-gray-600">Customers: info@cartzilla.com</p>
                                <p className="text-xs md:text-sm text-gray-600">Franchise: franchise@cartzilla.com</p>
                            </div>
                        </div>

                        {/* Store location */}
                        <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Store location</h3>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm text-gray-600">New York 11741, USA</p>
                                <p className="text-xs md:text-sm text-gray-600">396 Lillian Bolavandy, Holbrook</p>
                            </div>
                        </div>

                        {/* Working hours */}
                        <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Working hours</h3>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm text-gray-600">Mon - Fri  8:00 - 18:00</p>
                                <p className="text-xs md:text-sm text-gray-600">Sat - Sun  10:00 - 16:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Separation line */}
                    <div className="border-t border-gray-200 mb-6 md:mb-8"></div>

                    {/* Looking for support section */}
                    <div className="text-center py-6 md:py-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">Looking for support?</h2>
                        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-4">
                            We might already have what you're looking for. See our FAQs or head to our dedicated Help Center.
                        </p>
                        <button
                            onClick={() => router.push('/help-center')} // You can create this page later
                            className="bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-full font-medium transition-colors"
                        >
                            Help Center
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}