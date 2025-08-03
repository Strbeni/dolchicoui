'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";


const initialAddresses = [
  {
    name: "Prakhar Singh",
    address: "Plot no-20 First Floor, Society, Area, Near hospital(Landmark), City, UTTAR PRADESH 201013, India",
    phone: "9484489494",
    isDefault: true,
    instructions: "io;io;iio",
  },
  {
    name: "Kartik Mahajan",
    address: "Plot no-20 First Floor, Society, Area, Near hospital(Landmark), City, UTTAR PRADESH 201013, India",
    phone: "99489187187",
    isDefault: false,
    instructions: "",
  },
  {
    name: "Lucky Ali",
    address: "Plot no-20 First Floor, Society, Area, Near hospital(Landmark), City, UTTAR PRADESH 201013, India",
    phone: "4588441818",
    isDefault: false,
    instructions: "",
  },
  {
    name: "Akash Thanda",
    address: "Plot no-20 First Floor, Society, Area, Near hospital(Landmark), City, UTTAR PRADESH 201013, India",
    phone: "88488481818",
    isDefault: false,
    instructions: "",
  },
];


function AddressCard({ address, onEdit, onRemove, onSetDefault }: {
  address: typeof initialAddresses[0];
  onEdit: () => void;
  onRemove: () => void;
  onSetDefault?: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 min-w-[300px] max-w-[350px]">
      {address.isDefault && (
        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
          <span>Default:</span>
          {/* Use next/image for optimization in production */}
          <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" width={16} height={16} className="h-4" />
        </div>
      )}
      <div className="font-semibold">{address.name}</div>
      <div className="text-sm whitespace-pre-line">{address.address}</div>
      <div className="text-sm">Phone number: {address.phone}</div>
      {address.instructions && (
        <div className="text-sm">Delivery instructions: <span className="text-gray-600">{address.instructions}</span></div>
      )}
      <a href="#" className="text-blue-600 text-sm">Add delivery instructions</a>
      <div className="flex gap-2 mt-2 text-xs text-blue-700">
        <button type="button" onClick={onEdit} className="hover:underline">Edit</button>
        <span>|</span>
        <button type="button" onClick={onRemove} className="hover:underline">Remove</button>
        {!address.isDefault && onSetDefault && <><span>|</span><button type="button" onClick={onSetDefault} className="hover:underline">Set as Default</button></>}
      </div>
    </div>
  );
}


function AddAddressCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-w-[300px] max-w-[350px] h-full cursor-pointer" onClick={onAdd}>
      <div className="text-5xl text-gray-400 mb-2">+</div>
      <div className="font-semibold text-gray-500">Add address</div>
    </div>
  );
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    instructions: "",
  });

  // Open modal for add/edit
  const handleAdd = () => {
    setEditIndex(null);
    setForm({ name: "", address: "", phone: "", instructions: "" });
    setModalOpen(true);
  };
  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setForm({
      name: addresses[idx].name,
      address: addresses[idx].address,
      phone: addresses[idx].phone,
      instructions: addresses[idx].instructions,
    });
    setModalOpen(true);
  };
  const handleRemove = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };
  const handleSetDefault = (idx: number) => {
    setAddresses(addresses.map((a, i) => ({ ...a, isDefault: i === idx })));
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex === null) {
      setAddresses([...addresses, { ...form, isDefault: addresses.length === 0 }]);
    } else {
      setAddresses(addresses.map((a, i) => i === editIndex ? { ...a, ...form } : a));
    }
    setModalOpen(false);
  };


  const router = useRouter();
  return (
    <div>
        {/* Sidebar Tabs */}
        <Tabs defaultValue="addressbook" className="w-full flex">
        <div className="w-1/4 pr-6">
          <TabsList className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Order History
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
                Saved Payment Method
            </button>
            <TabsTrigger value="addressbook" className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full">Address Book</TabsTrigger>
              
            
           
          </TabsList>
        </div>

        {/* Tab Content Area */}
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Your Addresses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AddAddressCard onAdd={handleAdd} />
        {addresses
          .map((address, originalIdx) => ({ address, originalIdx }))
          .sort((a, b) => (b.address.isDefault ? 1 : 0) - (a.address.isDefault ? 1 : 0))
          .map(({ address, originalIdx }) => (
              <AddressCard
              key={originalIdx}
              address={address}
              onEdit={() => handleEdit(originalIdx)}
              onRemove={() => handleRemove(originalIdx)}
              onSetDefault={address.isDefault ? undefined : () => handleSetDefault(originalIdx)}
              />
            ))}
      </div>

      {/* Modal for Add/Edit */}
      {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[350px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{editIndex === null ? "Add Address" : "Edit Address"}</h2>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Name"
                className="border rounded px-2 py-1"
                required
                />
              <textarea
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Address"
                className="border rounded px-2 py-1"
                required
                />
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="Phone number"
                className="border rounded px-2 py-1"
                required
                />
              <input
                name="instructions"
                value={form.instructions}
                onChange={handleFormChange}
                placeholder="Delivery instructions (optional)"
                className="border rounded px-2 py-1"
                />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-1 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Tabs>
      </div>
  );
}
