'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const getAuthToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('token') || sessionStorage.getItem('token')
    : null;

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  instructions?: string;
  isDefault?: boolean;
}

export default function AddressBookPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    instructions: "",
  });
  const [error, setError] = useState("");

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch addresses.");
      const data = await response.json();
      setAddresses(data.addresses);
    } catch {
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddClick = () => {
    setEditingAddress(null);
    setForm({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      phone: "",
      instructions: "",
    });
    setModalOpen(true);
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setForm({ ...address, instructions: address.instructions || "" });
    setModalOpen(true);
  };

  const handleRemove = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const token = getAuthToken();
        await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchAddresses();
      } catch {
        window.alert("Failed to delete address.");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/api/addresses/${id}/set-default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAddresses();
    } catch {
      window.alert("Failed to set default address.");
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const method = editingAddress ? "PATCH" : "POST";
    const url = editingAddress
      ? `${API_BASE_URL}/api/addresses/${editingAddress.id}`
      : `${API_BASE_URL}/api/addresses`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save address.");
      setModalOpen(false);
      await fetchAddresses();
    } catch {
      window.alert("Error saving address.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen  p-3 lg:p-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/5 mb-4 lg:mb-0 lg:pr-6">
        <nav className="flex flex-row lg:flex-col gap-2 bg-white p-3 lg:p-4 shadow rounded-xl overflow-x-auto lg:overflow-visible">
          <button
            onClick={() => router.push("/profile")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-medium whitespace-nowrap lg:whitespace-normal text-sm lg:text-base"
          >
            Account
          </button>
          <button
            onClick={() => router.push("/profile/orderHistory")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-medium whitespace-nowrap lg:whitespace-normal text-sm lg:text-base"
          >
            Order History
          </button>
          <button
            onClick={() => router.push("/profile/paymentMethod")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-medium whitespace-nowrap lg:whitespace-normal text-sm lg:text-base"
          >
            Saved Payment Method
          </button>
          <button className="text-left px-3 py-2 rounded bg-orange-100 font-semibold whitespace-nowrap lg:whitespace-normal text-sm lg:text-base">
            Address Book
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Your Addresses</h1>
        {loading ? (
          <p className="text-sm lg:text-base">Loading addresses...</p>
        ) : error ? (
          <p className="text-red-500 text-sm lg:text-base">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <button
              type="button"
              className="border-dashed border-2 border-gray-300 rounded-lg p-4 lg:p-6 flex flex-col items-center justify-center min-h-[180px] lg:min-h-[200px] cursor-pointer hover:border-orange-500 hover:text-orange-500 transition-colors text-left"
              onClick={handleAddClick}
            >
              <div className="text-3xl lg:text-5xl text-gray-400 mb-2">+</div>
              <div className="font-semibold text-sm lg:text-base">Add address</div>
            </button>
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border rounded-lg p-3 lg:p-4 shadow-sm flex flex-col gap-2 min-h-[180px] lg:min-h-[200px]"
              >
                {address.isDefault && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 font-medium">
                    <span>Default Address</span>
                  </div>
                )}
                <div className="font-semibold text-sm lg:text-base">{address.name}</div>
                <div className="text-xs lg:text-sm text-gray-700">
                  {address.street}, {address.city}, {address.state} {address.zip},{" "}
                  {address.country}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Phone: {address.phone}</div>
                {address.instructions && (
                  <div className="text-xs lg:text-sm mt-1">
                    Delivery instructions:{" "}
                    <span className="text-gray-600">{address.instructions}</span>
                  </div>
                )}
                <div className="flex-grow" />
                <div className="flex flex-wrap gap-2 mt-2 text-xs lg:text-sm text-blue-600">
                  <button
                    type="button"
                    onClick={() => handleEditClick(address)}
                    className="hover:underline"
                  >
                    Edit
                  </button>
                  <span className="hidden sm:inline">|</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(address.id)}
                    className="hover:underline"
                  >
                    Remove
                  </button>
                  {!address.isDefault && (
                    <>
                      <span className="hidden sm:inline">|</span>
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        className="hover:underline"
                      >
                        Set as Default
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4">
            <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                {editingAddress ? "Edit Address" : "Add a new address"}
              </h2>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 lg:gap-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Full Name"
                  className="border rounded px-3 py-2 text-sm lg:text-base"
                  required
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Mobile Number"
                  className="border rounded px-3 py-2 text-sm lg:text-base"
                  required
                />
                <textarea
                  name="street"
                  value={form.street}
                  onChange={handleFormChange}
                  placeholder="Address (House No, Building, Street, Area)"
                  className="border rounded px-3 py-2 text-sm lg:text-base"
                  required
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="City/District/Town"
                    className="border rounded px-3 py-2 w-full text-sm lg:text-base"
                    required
                  />
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    placeholder="State"
                    className="border rounded px-3 py-2 w-full text-sm lg:text-base"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleFormChange}
                    placeholder="Pincode"
                    className="border rounded px-3 py-2 w-full text-sm lg:text-base"
                    required
                  />
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleFormChange}
                    placeholder="Country"
                    className="border rounded px-3 py-2 w-full bg-gray-100 text-sm lg:text-base"
                    readOnly
                  />
                </div>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
                  placeholder="Delivery Instructions (Optional)"
                  className="border rounded px-3 py-2 text-sm lg:text-base"
                />
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                  <button
                    type="button"
                    className="bg-gray-200 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 text-sm lg:text-base order-2 sm:order-1"
                    onClick={() => setModalOpen(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 text-sm lg:text-base order-1 sm:order-2"
                  >
                    SAVE ADDRESS
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
