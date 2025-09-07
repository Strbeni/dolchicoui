'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import ProfileSidebar from "@/components/ProfileSidebar";
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

// Helper function to format the address for display
const formatAddress = (address: Omit<AddressType, 'id' | 'isDefault'>) => {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
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

export default function AddressBookPage() {
  const router = useRouter();
  const { setLoading, setLoadingMessage } = useLoading();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);
  const [loading, setComponentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const initialFormState = {
    name: "", street: "", city: "", state: "", zip: "", country: "India", phone: "", instructions: "",
  };
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
    setModalOpen(true);
  };

  const handleEditClick = (address: AddressType) => {
    setEditingAddress(address);
    setForm({
      ...address,
      instructions: address.instructions || ""
    });
    setModalOpen(true);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Failed to save address.');

      setModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      // FIX: Log the error to the console for debugging.
      console.error("Error saving address:", err);
      window.alert("Error saving address. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 p-6">
        <Tabs defaultValue="addressbook" className="w-full flex">
          <div className="w-1/4 pr-6">
            <ProfileSidebar activeSection="addresses" />
          </div>

          <div className="w-3/4">
            <div className="bg-white p-8 rounded-lg shadow-md">
              {/* Header with title and Add Address button */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-semibold">Saved Address</h1>
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 hover:text-white hover:bg-orange-500 hover:border-orange-500 font-semibold rounded-lg transition-colors cursor-pointer"
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
            </div>
          </div>
        </Tabs>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">{editingAddress ? "Edit Address" : "Add a new address"}</h2>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors" required />
                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Mobile Number" className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors" required />
                <textarea name="street" value={form.street} onChange={handleFormChange} placeholder="Address (House No, Building, Street, Area)" className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors resize-none" required rows={3} />
                <div className="flex gap-4">
                  <input name="city" value={form.city} onChange={handleFormChange} placeholder="City/District/Town" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-orange-500 focus:outline-none transition-colors" required />
                  <input name="state" value={form.state} onChange={handleFormChange} placeholder="State" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-orange-500 focus:outline-none transition-colors" required />
                </div>
                <div className="flex gap-4">
                  <input name="zip" value={form.zip} onChange={handleFormChange} placeholder="Pincode" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-orange-500 focus:outline-none transition-colors" required />
                  <input name="country" value={form.country} onChange={handleFormChange} placeholder="Country" className="border border-gray-300 rounded-lg px-4 py-3 w-full bg-gray-50 cursor-not-allowed" readOnly />
                </div>
                <textarea name="instructions" value={form.instructions} onChange={handleFormChange} placeholder="Delivery Instructions (Optional)" className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors resize-none" rows={2} />

                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" className="bg-gray-200 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 cursor-pointer transition-colors" onClick={() => setModalOpen(false)}>CANCEL</button>
                  <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 cursor-pointer transition-colors">SAVE ADDRESS</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}