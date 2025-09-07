'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// FIX: Removed the unused 'Image' import.
// import Image from "next/image";

// Define a type for our address object to match the backend model
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

function AddressCard({ address, onEdit, onRemove, onSetDefault }: {
  address: AddressType;
  onEdit: () => void;
  onRemove: () => void;
  onSetDefault?: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 min-w-[300px] max-w-[350px] h-full">
      {address.isDefault && (
        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 font-medium">
          <span>Default Address</span>
        </div>
      )}
      <div className="font-semibold">{address.name}</div>
      <div className="text-sm whitespace-pre-line">{formatAddress(address)}</div>
      <div className="text-sm">Phone number: {address.phone}</div>
      {address.instructions && (
        <div className="text-sm mt-1">
          Delivery instructions: <span className="text-gray-600">{address.instructions}</span>
        </div>
      )}
      <div className="flex-grow" /> {/* Pushes buttons to the bottom */}
      <div className="flex gap-2 mt-2 text-sm text-blue-600">
        <button type="button" onClick={onEdit} className="hover:underline">Edit</button>
        <span>|</span>
        <button type="button" onClick={onRemove} className="hover:underline">Remove</button>
        {!address.isDefault && onSetDefault && (
          <>
            <span>|</span>
            <button type="button" onClick={onSetDefault} className="hover:underline">Set as Default</button>
          </>
        )}
      </div>
    </div>
  );
}

function AddAddressCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-w-[300px] max-w-[350px] h-full cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors text-left"
      onClick={onAdd}
    >
      <div className="text-5xl text-gray-400 mb-2">+</div>
      <div className="font-semibold">Add address</div>
    </button>
  );
}


// --- Main Page Component ---

export default function AddressBookPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialFormState = {
    name: "", street: "", city: "", state: "", zip: "", country: "India", phone: "", instructions: "",
  };
  const [form, setForm] = useState(initialFormState);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
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
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
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
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <div>
      <Tabs defaultValue="addressbook" className="w-full flex">
        <div className="w-1/4 pr-6">
          <TabsList className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <button type="button" onClick={() => router.push("/profile")} className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full">Account</button>
            <button type="button" onClick={() => router.push("/profile/orderHistory")} className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full">Order History</button>
            <button type="button" onClick={() => router.push("/profile/paymentMethod")} className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full">Saved Payment Method</button>
            <TabsTrigger value="addressbook">Address Book</TabsTrigger>
          </TabsList>
        </div>

        <div className="w-3/4 p-8">
          <h1 className="text-3xl font-bold mb-8">Your Addresses</h1>
          
          {loading && <p>Loading addresses...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AddAddressCard onAdd={handleAddClick} />
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditClick(address)}
                  onRemove={() => handleRemove(address.id)}
                  onSetDefault={() => handleSetDefault(address.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-6">{editingAddress ? "Edit Address" : "Add a new address"}</h2>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <input name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" className="border rounded px-3 py-2" required />
              <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Mobile Number" className="border rounded px-3 py-2" required />
              <textarea name="street" value={form.street} onChange={handleFormChange} placeholder="Address (House No, Building, Street, Area)" className="border rounded px-3 py-2" required rows={3}/>
              <div className="flex gap-4">
                  <input name="city" value={form.city} onChange={handleFormChange} placeholder="City/District/Town" className="border rounded px-3 py-2 w-full" required />
                  <input name="state" value={form.state} onChange={handleFormChange} placeholder="State" className="border rounded px-3 py-2 w-full" required />
              </div>
              <div className="flex gap-4">
                  <input name="zip" value={form.zip} onChange={handleFormChange} placeholder="Pincode" className="border rounded px-3 py-2 w-full" required />
                  <input name="country" value={form.country} onChange={handleFormChange} placeholder="Country" className="border rounded px-3 py-2 w-full bg-gray-100" readOnly />
              </div>
              <textarea name="instructions" value={form.instructions} onChange={handleFormChange} placeholder="Delivery Instructions (Optional)" className="border rounded px-3 py-2" />
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="bg-gray-200 px-4 py-2 rounded-md font-semibold hover:bg-gray-300" onClick={() => setModalOpen(false)}>CANCEL</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">SAVE ADDRESS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}