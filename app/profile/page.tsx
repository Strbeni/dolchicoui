"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// --- Constants and helpers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const ORDERS_API_URL = "https://valyris-i.onrender.com/api";

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;

const statusColors = {
  IN_PROGRESS: "bg-gradient-to-r from-[#f05a2b] to-[#ff7a2a] text-white",
  COMPLETED: "bg-gradient-to-r from-green-400 to-green-700 text-white",
  CANCELLED: "bg-gradient-to-r from-red-400 to-red-700 text-white",
  PENDING: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-white",
  CONFIRMED: "bg-gradient-to-r from-blue-400 to-blue-700 text-white",
  SHIPPED: "bg-gradient-to-r from-purple-400 to-purple-700 text-white",
  DELIVERED: "bg-gradient-to-r from-green-400 to-green-700 text-white"
};

const formatStatus = (status) =>
  status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const mockCards = [
  {
    id: "mock-1",
    bankName: "HDFC Bank",
    last4: "4567",
    type: "VISA",
    typeOfCard: "Debit Card",
    name: "Demo User",
    bgColor: "bg-gradient-to-tr from-blue-600 via-blue-400 to-blue-800",
    isMock: true,
  },
  {
    id: "mock-2",
    bankName: "ICICI Bank",
    last4: "8901",
    type: "Mastercard",
    typeOfCard: "Credit Card",
    name: "Demo User",
    bgColor: "bg-gradient-to-tr from-purple-600 via-pink-400 to-purple-800",
    isMock: true,
  },
];

const mockUpis = [
  {
    id: "mock-upi-1",
    bankName: "PhonePe",
    upiId: "demo.user@ybl",
    type: "UPI",
    upiProvider: "PhonePe",
    name: "Demo User",
    bgColor: "bg-gradient-to-tr from-indigo-600 via-indigo-400 to-purple-700",
    isMock: true,
  },
  {
    id: "mock-upi-2",
    bankName: "Google Pay",
    upiId: "demo.user@okaxis",
    type: "UPI",
    upiProvider: "Google Pay",
    name: "Demo User",
    bgColor: "bg-gradient-to-tr from-green-500 via-teal-400 to-teal-700",
    isMock: true,
  }
];

// --- Main Component
export default function AccountDashboard() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);

  const [cards, setCards] = useState([]);
  const [upis, setUpis] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [error, setError] = useState("");

  const [settingsAction, setSettingsAction] = useState(""); // "edit", "password", "delete"
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetOtp, setPasswordResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [deleteEmailOtp, setDeleteEmailOtp] = useState("");
  const [deleteOtpError, setDeleteOtpError] = useState("");

  // --- Data Fetch ---
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/user/get-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile.");
      const data = await res.json();
      setProfile(data.user || data);
      setEditProfile(data.user || data);
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setAddressLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setPaymentLoading(true);
    try {
      const token = getAuthToken();
      const [cardsRes, upisRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/payment/cards`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/payment/upis`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const cardsData = await cardsRes.json();
      const upisData = await upisRes.json();
      setCards((cardsData.cards && cardsData.cards.length > 0) ? cardsData.cards : mockCards);
      setUpis((upisData.upis && upisData.upis.length > 0) ? upisData.upis : mockUpis);
    } catch (err) {
      setCards(mockCards);
      setUpis(mockUpis);
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${ORDERS_API_URL}/order/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders || []);
      setStats({
        total: (data.orders || []).length,
        pending: (data.orders || []).filter(
          (o) =>
            ["ORDER_PLACED", "CONFIRMED", "IN_PROGRESS", "PENDING", "SHIPPED"].includes(
              o.status.toUpperCase()
            )
        ).length,
        completed: (data.orders || []).filter(
          (o) =>
            o.status.toUpperCase() === "COMPLETED" ||
            o.status.toUpperCase() === "DELIVERED"
        ).length,
      });
    } catch (err) {
      setOrders([]);
      setStats({ total: 0, pending: 0, completed: 0 });
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchPayments();
    fetchOrders();
  }, [fetchProfile, fetchAddresses, fetchPayments, fetchOrders]);

  // --- Handlers ---
  const handleEditProfile = () => {
    setSettingsAction("edit");
    setIsEditing(true);
    setEditProfile(profile);
  };

  const handleProfileChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const updateData = {
        name: editProfile.name,
        username: editProfile.username,
        fullName: editProfile.fullName,
        country: editProfile.country,
        state: editProfile.state,
        zip: editProfile.zip,
      };
      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile");
      }
      setIsEditing(false);
      setSettingsAction("");
      fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  // --- Password Reset Handlers ---
  const handleRequestPasswordReset = async () => {
    setPasswordError("");
    setOtpRequested(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile?.email }),
      });
      const data = await response.json();
      if (response.ok && (data.success || data.message?.toLowerCase().includes("sent"))) {
        setShowPasswordReset(true);
        setOtpRequested(true);
        alert("OTP sent to your registered email.");
      } else {
        setPasswordError(data.message || "Failed to send password reset OTP");
      }
    } catch (err) {
      setPasswordError("Failed to request password reset");
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/\d/.test(password)) return "Password must contain a number";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must contain a special character";
    return "";
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile?.email,
          otp: passwordResetOtp,
          newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok && (data.success || data.message?.toLowerCase().includes("success"))) {
        setShowPasswordReset(false);
        setSettingsAction("");
        setPasswordResetOtp("");
        setNewPassword("");
        setConfirmPassword("");
        alert("Password changed successfully.");
      } else {
        setPasswordError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setPasswordError("Failed to reset password");
    }
  };

  // --- Delete Account Handlers ---
  const handleDeleteAccountClick = () => {
    setSettingsAction("delete");
    setIsDeleteModalOpen(true);
    setDeleteOtpError("");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/request-account-deletion`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && (data.success || data.message?.toLowerCase().includes("sent"))) {
        setShowDeleteOtp(true);
        setIsDeleteModalOpen(false);
        alert("OTP sent to your registered email.");
      } else {
        setDeleteOtpError(data.error || data.message || "Failed to send OTP");
      }
    } catch (err) {
      setDeleteOtpError("Failed to request account deletion");
    }
  };

  const handleDeleteOtpVerification = async (e) => {
    e.preventDefault();
    setDeleteOtpError("");
    if (!deleteEmailOtp) {
      setDeleteOtpError("Please enter the OTP");
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/verify-account-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: deleteEmailOtp }),
      });
      const data = await response.json();
      if (response.ok && (data.success || data.message?.toLowerCase().includes("success"))) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.push("/");
        alert("Account deleted.");
      } else {
        setDeleteOtpError(data.error || data.message || "Invalid OTP");
      }
    } catch (err) {
      setDeleteOtpError("Failed to verify OTP");
    }
  };

  const closeSettingsAction = () => {
    setSettingsAction("");
    setIsEditing(false);
    setShowPasswordReset(false);
    setOtpRequested(false);
    setIsDeleteModalOpen(false);
    setShowDeleteOtp(false);
    setDeleteEmailOtp("");
    setDeleteOtpError("");
    setPasswordResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  // --- Navigation Slider ---
  // On mobile view, show a horizontal slider for navigation tabs
  const navTabs = [
    { label: "Dashboard", path: "/profile" },
    { label: "Order History", path: "/profile/orderHistory" },
    { label: "Saved Payment Method", path: "/profile/paymentMethod" },
    { label: "Address Book", path: "/profile/addressBook" },
    
  ];
  // The "active" navigation is the current path (simulate)
  // For demonstration, we'll use window.location.pathname, but in Next.js, better to use usePathname from "next/navigation"
  const [activeTab, setActiveTab] = useState("Dashboard");
  const sliderRef = useRef(null);

  useEffect(() => {
    // Set active tab on mount
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const found = navTabs.find(tab => pathname.includes(tab.path.split("/profile/")[1] || "profile"));
      setActiveTab(found ? found.label : "Dashboard");
    }
  }, []);

  // --- UI ---
  return (
  <div className="min-h-screen pb-10 bg-white text-[#101820]">
      {/* Mobile Navigation Slider */}
  <div className="lg:hidden sticky top-0 z-40 backdrop-blur-md border-b border-orange-200 shadow-sm px-2 pt-3 pb-2 bg-white">
        <div className="flex items-center justify-between mb-2 px-2">
  
        
        </div>
        <div
          ref={sliderRef}
          className="flex gap-1  overflow-x-auto scrollbar-hide px-1 py-2 bg-white rounded-[18px] border border-orange-200 shadow-sm"
        >
          {navTabs.map(tab => (
            <button
              key={tab.label}
              className={`min-w-[160px] px-3 py-3 rounded-2xl text-md font-medium whitespace-nowrap ${
                activeTab === tab.label
                  ? "bg-[#fff6f2] text-[#f05a2b] font-bold"
                  : "bg-white text-[#101820] hover:bg-[#fff6f2]"
              }`}
              onClick={() => {
                setActiveTab(tab.label);
                router.push(tab.path);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

    

      <div className="flex flex-col h-fit-content  lg:flex-row gap-4 lg:gap-8 w-full px-4 lg:px-20 pt-4 lg:pt-10">
        {/* Desktop Sidebar */}
  <aside className="hidden lg:flex flex-col gap-3 rounded-xl lg:w-1/5 h-[250px] sticky top-10 bg-white border border-orange-200 shadow-sm">
          {navTabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                router.push(tab.path);
              }}
              className={`text-left px-3 py-2 rounded-xl font-semibold ${
                activeTab === tab.label
                  ? "bg-[#fff6f2] text-[#f05a2b] font-bold"
                  : "hover:bg-[#fff6f2] text-[#101820]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full">
          {/* Alert/Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Top Grid - Responsive */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 lg:mb-8">
            {/* Account Info */}
            <Card className="rounded-3xl bg-white border border-orange-200 shadow-md">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center gap-3 lg:gap-4 mb-3">
                  <Image
                    src="/avatar.svg"
                    alt="avatar"
                    width={36}
                    height={36}
                    className="lg:w-[46px] lg:h-[46px] rounded-full border-2 border-orange-200 "
                  />
                  <h2 className="font-semibold text-base lg:text-lg tracking-tight text-[#f05a2b]">Account Info</h2>
                </div>
                {profileLoading ? (
                  <div className="animate-pulse h-4 bg-orange-100 rounded w-2/3" />
                ) : (
                  <div className="space-y-2 text-xs lg:text-sm text-gray-700">
                    <div className="font-bold text-base lg:text-lg truncate">{profile?.name || profile?.displayName}</div>
                    <div className="opacity-70 text-xs">{profile?.country}, {profile?.state}</div>
                    <div className="text-xs">
                      <div className="truncate">Email: <span className="font-medium">{profile?.email}</span></div>
                      <div className="truncate">Phone: <span className="font-medium">{profile?.phoneNumber}</span></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="rounded-3xl bg-white border border-orange-200 shadow-md">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center gap-3 lg:gap-4 mb-3">
                  <Image src="/address.svg" alt="address" width={30} height={30} className="lg:w-[36px] lg:h-[36px]" />
                  <h2 className="font-semibold c text-base lg:text-lg tracking-tight text-[#f05a2b]">Billing Address</h2>
                </div>
                {addressLoading ? (
                  <div className="animate-pulse h-4 bg-orange-100 rounded w-2/3" />
                ) : addresses.length === 0 ? (
                  <div className="text-sm text-gray-600">No address found.</div>
                ) : (
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="font-bold text-sm lg:text-base truncate">{addresses[0].name}</div>
                    <div className="text-xs line-clamp-2">{addresses[0].street}, {addresses[0].city}, {addresses[0].state}, {addresses[0].zip}</div>
                    <div className="text-xs">{addresses[0].country}</div>
                    <div className="text-xs truncate">Phone: <span className="font-bold">{addresses[0].phone}</span></div>
                    <Button
                      onClick={() => router.push("/profile/addressBook")}
                      size="sm"
                      className="mt-2 bg-gradient-to-r from-orange-200 to-orange-400 text-orange-800 hover:bg-orange-300 text-xs px-3 py-1"
                    >
                      Edit Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="rounded-3xl bg-gradient-to-br from-[#fff6f2] via-[#eaf6ff] to-[#ffeaf2] border border-orange-200 shadow-md col-span-1 sm:col-span-2">
              <CardContent className="p-4 lg:p-5">
                <h2 className="font-semibold mb-3 text-base lg:text-lg tracking-tight text-[#f05a2b]">Order Summary</h2>
                <div className="grid grid-cols-1 gap-2 lg:gap-4">
                  <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-white/60 ">
                    <div className="font-semibold text-xl lg:text-2xl text-blue-700">{stats.total}</div>
                    <div className="text-xs text-gray-600 text-center">Total Orders</div>
                  </div>
                  <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-white/60 ">
                    <div className="font-semibold text-xl lg:text-2xl text-orange-600">{stats.pending}</div>
                    <div className="text-xs text-orange-600 text-center">Pending Orders</div>
                  </div>
                  <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-white/60 ">
                    <div className="font-semibold text-xl lg:text-2xl text-green-600">{stats.completed}</div>
                    <div className="text-xs text-green-600 text-center">Completed Orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Payment Option */}
          <section className="mb-6 lg:mb-8">
            <Card className="rounded-3xl bg-white border border-orange-200 shadow-md">
              <CardContent className="p-4 lg:p-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-base lg:text-lg tracking-tight text-[#f05a2b]">Payment Option</h2>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-200 to-orange-400 text-orange-800 hover:bg-orange-300 text-xs px-3"
                    onClick={() => router.push("/profile/paymentMethod")}
                  >
                    <span className="hidden sm:inline">Add Card / UPI</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
                {paymentLoading ? (
                  <div className="flex gap-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse h-32 w-48 lg:w-56 rounded-2xl bg-orange-100 flex-shrink-0" />
                    ))}
                  </div>
                ) : cards.length === 0 && upis.length === 0 ? (
                  <div className="text-sm text-gray-600">No payment methods saved.</div>
                ) : (
                  <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-1">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className={`rounded-2xl text-white p-4 min-w-[200px] lg:min-w-[220px] ${card.bgColor || "bg-gradient-to-br from-blue-600 to-blue-800"} relative flex-shrink-0`}
                      >
                        {card.isMock && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-lg ">
                            Demo
                          </div>
                        )}
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-xs">{card.bankName}</span>
                        </div>
                        <div className="mb-2 text-xs">
                          <span className="text-gray-200">CARD NUMBER</span>
                          <div className="tracking-widest text-sm font-mono">**** **** **** {card.last4}</div>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-bold text-xs">{card.type}</div>
                          <div className="text-gray-200 text-xs">{card.typeOfCard}</div>
                        </div>
                        <div className="font-semibold text-white text-xs truncate">{card.name}</div>
                      </div>
                    ))}
                    {upis.map((upi) => (
                      <div
                        key={upi.id}
                        className={`rounded-2xl text-white p-4 min-w-[200px] lg:min-w-[220px] ${upi.bgColor || "bg-gradient-to-br from-green-600 to-green-800"} relative flex-shrink-0`}
                      >
                        {upi.isMock && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-lg ">
                            Demo
                          </div>
                        )}
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-xs">{upi.bankName}</span>
                        </div>
                        <div className="mb-2 text-xs">
                          <span className="text-gray-200">UPI ID</span>
                          <div className="tracking-wide text-sm font-mono break-all">{upi.upiId}</div>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-bold text-xs">{upi.type}</div>
                          <div className="text-gray-200 text-xs">{upi.upiProvider}</div>
                        </div>
                        <div className="font-semibold text-white text-xs truncate">{upi.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Settings Section */}
          <section className="mb-6 lg:mb-8">
            <Card className="rounded-3xl bg-white border border-orange-200 shadow-md">
              <CardContent className="p-4 lg:p-5">
                <h2 className="font-semibold text-base lg:text-lg tracking-tight mb-3 text-[#f05a2b]">Settings</h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  <Button
                    variant={settingsAction === "edit" ? "default" : "outline"}
                    className="rounded-xl font-semibold text-xs px-3 py-2"
                    onClick={handleEditProfile}
                  >
                    <span className="hidden sm:inline">🖊️ Edit Profile</span>
                    <span className="sm:hidden">🖊️ Edit</span>
                  </Button>
                  <Button
                    variant={settingsAction === "password" ? "default" : "outline"}
                    className="rounded-xl font-semibold text-xs px-3 py-2"
                    onClick={() => {
                      setSettingsAction("password");
                      setShowPasswordReset(false);
                      setOtpRequested(false);
                      setPasswordResetOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                  >
                    <span className="hidden sm:inline">🔒 Change Password</span>
                    <span className="sm:hidden">🔒 Password</span>
                  </Button>
                  <Button
                    variant={settingsAction === "delete" ? "destructive" : "outline"}
                    className="rounded-xl font-semibold text-xs px-3 py-2"
                    onClick={handleDeleteAccountClick}
                  >
                    <span className="hidden sm:inline">🗑️ Delete Account</span>
                    <span className="sm:hidden">🗑️ Delete</span>
                  </Button>
                </div>
                <div className="mt-2">
                  {settingsAction === "edit" && (
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={handleSaveProfile}>
                      <input 
                        name="name" 
                        value={editProfile?.name || ""} 
                        onChange={handleProfileChange} 
                        placeholder="Display Name" 
                        className="border rounded-xl px-3 py-2 w-full text-sm" 
                      />
                      <input 
                        name="username" 
                        value={editProfile?.username || ""} 
                        onChange={handleProfileChange} 
                        placeholder="Username" 
                        className="border rounded-xl px-3 py-2 w-full text-sm" 
                      />
                      <input 
                        name="fullName" 
                        value={editProfile?.fullName || ""} 
                        onChange={handleProfileChange} 
                        placeholder="Full Name" 
                        className="border rounded-xl px-3 py-2 w-full text-sm sm:col-span-2" 
                      />
                      <select 
                        name="country" 
                        value={editProfile?.country || ""} 
                        onChange={handleProfileChange} 
                        className="border rounded-xl px-3 py-2 w-full text-sm"
                      >
                        <option value="">Select Country</option>
                        <option>Bangladesh</option>
                        <option>India</option>
                        <option>USA</option>
                      </select>
                      <select 
                        name="state" 
                        value={editProfile?.state || ""} 
                        onChange={handleProfileChange} 
                        className="border rounded-xl px-3 py-2 w-full text-sm"
                      >
                        <option value="">Select State</option>
                        <option>Dhaka</option>
                        <option>Delhi</option>
                        <option>California</option>
                      </select>
                      <input 
                        name="zip" 
                        value={editProfile?.zip || ""} 
                        onChange={handleProfileChange} 
                        placeholder="Zip Code" 
                        className="border rounded-xl px-3 py-2 w-full text-sm sm:col-span-2" 
                      />
                      <div className="flex gap-2 mt-2 sm:col-span-2">
                        <Button type="button" onClick={closeSettingsAction} size="sm" className="bg-gray-100 rounded-xl flex-1 sm:flex-none">
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={editLoading} className="rounded-xl flex-1 sm:flex-none">
                          {editLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  )}
                  {settingsAction === "password" && (
                    <div className="space-y-4">
                      {!otpRequested ? (
                        <div>
                          <Button
                            type="button"
                            onClick={handleRequestPasswordReset}
                            className="bg-orange-100 text-[#f68358] hover:bg-orange-200 font-semibold px-6 py-2 rounded-xl w-full sm:w-auto"
                          >
                            Request Password Reset OTP
                          </Button>
                          {passwordError && (
                            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                          )}
                        </div>
                      ) : (
                        <form className="grid grid-cols-1 gap-3" onSubmit={handleResetPassword}>
                          <input 
                            value={passwordResetOtp} 
                            onChange={(e) => setPasswordResetOtp(e.target.value)} 
                            placeholder="Enter OTP sent to email" 
                            className="border rounded-xl px-3 py-2 text-sm" 
                            maxLength={6} 
                          />
                          <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="New Password" 
                            className="border rounded-xl px-3 py-2 text-sm" 
                          />
                          <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="Confirm Password" 
                            className="border rounded-xl px-3 py-2 text-sm" 
                          />
                          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                          <div className="flex gap-2 mt-2">
                            <Button type="button" onClick={closeSettingsAction} className="bg-gray-100 rounded-xl flex-1 sm:flex-none">Cancel</Button>
                            <Button type="submit" className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl flex-1 sm:flex-none">Reset Password</Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                  {settingsAction === "delete" && (
                    <div>
                      <Button variant="destructive" className="mb-2 rounded-xl font-semibold w-full sm:w-auto" onClick={handleDeleteAccountClick}>Request Account Deletion</Button>
                      {isDeleteModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <Card className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-md border-0">
                            <CardContent className="p-0">
                              <h2 className="text-lg lg:text-xl font-semibold mb-4 text-red-600">Are you sure?</h2>
                              <p className="text-sm text-gray-600 mb-6">
                                This action cannot be undone. This will permanently delete your account and all your data.
                              </p>
                              <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <Button type="button" variant="outline" onClick={closeSettingsAction} className="rounded-xl flex-1 sm:flex-none">Cancel</Button>
                                <Button type="button" variant="destructive" onClick={handleDeleteAccount} className="rounded-xl flex-1 sm:flex-none">Delete</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      {showDeleteOtp && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <Card className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-md border-0">
                            <CardContent className="p-0">
                              <h2 className="text-lg lg:text-xl font-semibold mb-4 text-[#f68358]">Verify Identity</h2>
                              <p className="text-sm text-gray-600 mb-6">
                                Please verify your identity by entering the OTP sent to your registered email.
                              </p>
                              <form onSubmit={handleDeleteOtpVerification} className="space-y-4">
                                <input 
                                  value={deleteEmailOtp} 
                                  onChange={(e) => setDeleteEmailOtp(e.target.value)} 
                                  placeholder="Enter email OTP" 
                                  className="border rounded-xl px-3 py-2 w-full text-sm" 
                                  maxLength={6} 
                                />
                                {deleteOtpError && <p className="text-red-500 text-sm">{deleteOtpError}</p>}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                                  <Button type="button" variant="outline" onClick={closeSettingsAction} className="rounded-xl flex-1 sm:flex-none">Cancel</Button>
                                  <Button type="submit" variant="destructive" className="rounded-xl flex-1 sm:flex-none">Verify & Delete Account</Button>
                                </div>
                              </form>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent Orders Table */}
          <section>
            <Card className="rounded-3xl bg-white border border-[#f05a2b] shadow-sm">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-base lg:text-lg tracking-tight text-[#f05a2b]">Recent Orders</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs px-3"
                    onClick={() => router.push("/profile/orderHistory")}
                  >
                    View All
                  </Button>
                </div>
                {ordersLoading ? (
                  <div className="animate-pulse h-8 bg-orange-100 rounded w-2/3" />
                ) : orders.length === 0 ? (
                  <div className="text-sm text-gray-600 text-center py-8">No orders found.</div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full table-auto text-sm">
                        <thead>
                          <tr className="text-left border-b text-[#f68358]">
                            <th className="py-2 px-2 font-semibold">Order ID</th>
                            <th className="py-2 px-2 font-semibold">Status</th>
                            <th className="py-2 px-2 font-semibold">Date</th>
                            <th className="py-2 px-2 font-semibold">Total</th>
                            <th className="py-2 px-2 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b hover:bg-orange-50">
                              <td className="py-3 px-2 font-semibold">#{order.id}</td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-1 rounded-xl font-bold text-xs ${statusColors[order.status.toUpperCase()] || "bg-gray-200 text-gray-800"}`}>
                                  {formatStatus(order.status)}
                                </span>
                              </td>
                              <td className="py-3 px-2">{formatDate(order.date)}</td>
                              <td className="py-3 px-2 font-semibold">
                                IDR {order.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-xl text-xs px-3 py-1"
                                  onClick={() =>
                                    router.push(`/profile/orderHistory/orderDetail/${order.id}`)
                                  }
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-4 border border-orange-100">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-sm text-gray-800">#{order.id}</div>
                              <div className="text-xs text-gray-600 mt-1">{formatDate(order.date)}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg font-bold text-xs ${statusColors[order.status.toUpperCase()] || "bg-gray-200 text-gray-800"}`}>
                              {formatStatus(order.status)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="font-semibold text-sm text-[#f68358]">
                              IDR {order.amount.toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg text-xs px-3 py-1 border-orange-300 text-[#f68358] hover:bg-orange-100"
                              onClick={() =>
                                router.push(`/profile/orderHistory/orderDetail/${order.id}`)
                              }
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}