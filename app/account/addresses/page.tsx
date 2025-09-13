'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

type AddressType = {
    id: number;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    instructions?: string;
    isDefault: boolean;
};

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
};

// --- Sub-components ---

// Empty State Component
function EmptyAddressCard({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="bg-gray-100 rounded-lg p-8 shadow-sm border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition-colors" onClick={onAdd}>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-500"
                >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Add Address</h3>
            <p className="text-gray-500 text-center text-sm">Click here to add your first address</p>
        </div>
    );
}

function AddressCard({ address, onEdit, onRemove, onSetDefault }: {
    address: AddressType;
    onEdit: () => void;
    onRemove: () => void;
    onSetDefault?: () => void;
}) {
    return (
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border border-gray-200 relative">
            {/* Header with full name, default tag and edit button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div>
                        <span className="font-semibold text-gray-600">Full Name : </span>
                        <span className="font-semibold text-black capitalize">{address.name}</span>
                    </div>
                    {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            Default Address
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-300 hover:border-gray-400 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 text-sm cursor-pointer"
                    aria-label="Edit address"
                >
                    Edit
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            </div>

            {/* Address details */}
            <div className="space-y-3">
                <div>
                    <span className="font-semibold text-gray-600">Mobile Number : </span>
                    <span className="font-semibold text-black">{address.phone}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-600">Postcode : </span>
                    <span className="font-semibold text-black">{address.zip}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-600">City : </span>
                    <span className="font-semibold text-black capitalize">{address.city}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-600">State : </span>
                    <span className="font-semibold text-black capitalize">{address.state}</span>
                </div>
                <div>
                    <span className="font-semibold text-gray-600">House / Apartment No. And Street Address : </span>
                    <span className="font-semibold text-black capitalize">{address.street}</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-300 text-sm">
                <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">
                    Remove
                </button>
                {!address.isDefault && onSetDefault && (
                    <>
                        <span className="text-gray-300">|</span>
                        <button type="button" onClick={onSetDefault} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                            Set as Default
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function AddressesPage() {
    const router = useRouter();
    const { setLoading, setLoadingMessage } = useLoading();
    const [addresses, setAddresses] = useState<AddressType[]>([]);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);
    const [loading, setComponentLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const initialFormState = {
        name: "", lastName: "", street: "", city: "", state: "", zip: "", country: "India", phone: "", instructions: "",
    };

    // Indian states list
    const indianStates = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry"
    ];
    const [form, setForm] = useState(initialFormState);

    const fetchAddresses = useCallback(async () => {
        setComponentLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication required.");

            const response = await fetch(`${API_BASE_URL}/api/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch addresses.');

            const data = await response.json();
            setAddresses(data.addresses);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setComponentLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleAddClick = () => {
        setEditingAddress(null);
        setForm(initialFormState);
        setShowEditForm(true);
    };

    const handleEditClick = (address: AddressType) => {
        setEditingAddress(address);
        const nameParts = address.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setForm({
            name: firstName,
            lastName: lastName,
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
            phone: address.phone,
            instructions: address.instructions || ""
        });
        setShowEditForm(true);
    };

    const handleRemove = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                setLoadingMessage("Deleting address...");
                setLoading(true);
                const token = getAuthToken();
                await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await fetchAddresses();
            } catch (err) {
                // FIX: Log the error to the console for debugging.
                console.error("Failed to delete address:", err);
                window.alert("Failed to delete address.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            setLoadingMessage("Setting default address...");
            setLoading(true);
            const token = getAuthToken();
            await fetch(`${API_BASE_URL}/api/addresses/${id}/set-default`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchAddresses();
        } catch (err) {
            // FIX: Log the error to the console for debugging.
            console.error("Failed to set default address:", err);
            window.alert("Failed to set default address.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingMessage(editingAddress ? "Updating address..." : "Adding address...");
        setLoading(true);
        const token = getAuthToken();
        const method = editingAddress ? 'PATCH' : 'POST';
        const url = editingAddress
            ? `${API_BASE_URL}/api/addresses/${editingAddress.id}`
            : `${API_BASE_URL}/api/addresses`;

        // Prepare the data to send - combine firstName and lastName into name
        const fullName = `${form.name.trim()} ${form.lastName.trim()}`.trim();
        const addressData = {
            name: fullName,
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
            phone: form.phone,
            instructions: form.instructions
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(addressData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(`Failed to save address: ${response.status} ${response.statusText}`);
            }

            setShowEditForm(false);
            await fetchAddresses();
        } catch (err) {
            // FIX: Log the error to the console for debugging.
            console.error("Error saving address:", err);
            window.alert("Error saving address. Please check your input and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowEditForm(false);
        setEditingAddress(null);
        setForm(initialFormState);
    };

    return (
        <>
            {!showEditForm ? (
                <>
                    {/* Page Header with Add Address button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
                                aria-label="Go back"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Saved Address</h1>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 hover:text-white hover:bg-orange-500 hover:border-orange-500 font-semibold rounded-lg transition-colors cursor-pointer w-fit"
                        >
                            Add Address +
                        </button>
                    </div>

                    {loading && <p>Loading addresses...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {!loading && !error && (
                        <>
                            {addresses.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EmptyAddressCard onAdd={handleAddClick} />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(showAll ? addresses : addresses.slice(0, 6)).map((address) => (
                                            <AddressCard
                                                key={address.id}
                                                address={address}
                                                onEdit={() => handleEditClick(address)}
                                                onRemove={() => handleRemove(address.id)}
                                                onSetDefault={() => handleSetDefault(address.id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Show More button */}
                                    {addresses.length > 6 && !showAll && (
                                        <div className="flex justify-center mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setShowAll(true)}
                                                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors cursor-pointer"
                                            >
                                                Show More ({addresses.length - 6} more addresses)
                                            </button>
                                        </div>
                                    )}

                                    {/* Show Less button */}
                                    {showAll && addresses.length > 6 && (
                                        <div className="flex justify-center mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setShowAll(false)}
                                                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors cursor-pointer"
                                            >
                                                See less
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* Edit Address Form */}
                    <div className="mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{editingAddress ? "Edit Address" : "Add Address"}</h1>
                        {/* Breadcrumb */}
                        <div className="flex items-center text-sm text-gray-600 mb-6">
                            <button
                                onClick={() => setShowEditForm(false)}
                                className="hover:text-orange-500 transition-colors"
                            >
                                Saved Address
                            </button>
                            <span className="mx-2">{'>'}</span>
                            <span className="text-gray-900">{editingAddress ? "Edit address" : "Add address"}</span>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-8">
                        {/* Personal Contact Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Personal Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Enter first name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleFormChange}
                                        placeholder="Enter last name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleFormChange}
                                    placeholder="Enter mobile number"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Address Details Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Address details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postcode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="zip"
                                        value={form.zip}
                                        onChange={handleFormChange}
                                        placeholder="Enter postcode"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleFormChange}
                                        placeholder="Enter your city"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="state"
                                        value={form.state}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                                        required
                                    >
                                        <option value="">Select your state</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    House / apartment number and street address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="street"
                                    value={form.street}
                                    onChange={handleFormChange}
                                    placeholder="Enter your address"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                                    required
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-2"
                            >
                                Save & Continue
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </form>
                </>
            )}
        </>
    );
}