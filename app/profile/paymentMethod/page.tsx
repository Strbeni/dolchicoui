'use client';

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
// Add these imports for the carousel
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Arrow Components
const Arrow = ({ className, style, onClick, direction }: any) => (
  <button
    type="button"
    className={`absolute top-1/2 z-10 transform -translate-y-1/2 bg-white rounded-full shadow p-2 ${
      direction === "left" ? "left-0" : "right-0"
    }`}
    style={{ ...style }}
    onClick={onClick}
    aria-label={direction === "left" ? "Previous" : "Next"}
  >
    {direction === "left" ? (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M15 19l-7-7 7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M9 5l7 7-7 7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const PaymentMethodPage = () => {
  const router = useRouter();
  const [cards, setCards] = useState([
    {
      bankName: "Bank of America",
      type: "visa",
      last4: "3814",
      bgColor: "bg-blue-800",
      name: "Kevin Gilbert",
      typeOfCard: "Credit Card",
    },
    {
      bankName: "HSBC",
      type: "mastercard",
      last4: "1761",
      bgColor: "bg-green-600",
      name: "Kevin Gilbert",
      typeOfCard: "Credit Card",
    },
    {
      bankName: "HDFC",
      type: "visa",
      last4: "3814",
      bgColor: "bg-blue-300",
      name: "Kevin Gilbert",
      typeOfCard: "Debit Card",
    },
    {
      bankName: "Fedral Bank",
      type: "mastercard",
      last4: "1761",
      bgColor: "bg-green-800",
      name: "Kevin Gilbert",
      typeOfCard: "Debit Card",
    },
  ]);

  const [upis, setUpis] = useState([
    {
      bankName: "Bank of America",
      type: "UPI",
      upiId: "Kartik@axis",
      upiProvider: "Google Pay  (GPay)",
      bgColor: "bg-green-800",
      name: "Kevin Gilbert",
    },
    {
      bankName: "HSBC",
      type: "UPI",
      upiId: "Kartik@axis",
      upiProvider: "Google Pay  (GPay)",
      bgColor: "bg-blue-800",
      name: "Kevin Gilbert",
    },
    {
      bankName: "HDFC",
      type: "UPI",
      upiId: "Kartik@axis",
      upiProvider: "Google Pay  (GPay)",
      bgColor: "bg-blue-400",
      name: "Kevin Gilbert",
    },
    {
      bankName: "Fedral Bank",
      type: "UPI",
      upiId: "Kartik@axis",
      upiProvider: "Google Pay  (GPay)",
      bgColor: "bg-green-400",
      name: "Kevin Gilbert",
    },
  ]);

  const handleDelete = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUpi = (index: number) => {
    setUpis((prev) => prev.filter((_, i) => i !== index));
  };

  // Carousel settings with custom arrows and no dots
  const sliderSettings = {
    dots: false,
    infinite: cards.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <Arrow direction="right" />,
    prevArrow: <Arrow direction="left" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      {/* Sidebar Tabs */}
      <Tabs defaultValue="payment" className="w-full flex">
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
            <TabsTrigger value="payment">Saved Payment Method</TabsTrigger>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Address Book
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Billing
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Settings
            </button>
          </TabsList>
        </div>

        {/* Tab Content Area */}
        <div className="w-3/4">
          <TabsContent value="payment">
            <Card className="shadow-md">
              <CardContent className="p-6">
                {/* Saved Cards Section */}
                <div className="border rounded-md p-6 bg-white mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Saved Cards</h2>
                    <button className="text-orange-600 font-medium flex items-center hover:underline">
                      Add Card <span className="ml-1">→</span>
                    </button>
                  </div>

                  {/* Carousel Slider for Cards */}
                  <div className="mt-6 relative">
                    <Slider {...sliderSettings}>
                      {cards.map((card, index) => (
                        <div key={index} className="px-2">
                          <div className="relative group">
                            {/* Card */}
                            <div
                              className={`rounded-lg text-white p-6 ${card.bgColor} shadow-md`}
                            >
                              <div className="-mt-3">
                                <p className="tracking-widest text-lg">{card.bankName}</p>
                              </div>
                              <div className="mt-6 text-sm">
                                <p className="text-gray-200">CARD NUMBER</p>
                                <div className="flex items-center space-x-2">
                                  <p className="tracking-widest text-lg">
                                    **** **** **** {card.last4}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-6">
                                <div className="flex flex-row items-center gap-10">
                                  <div style={{ paddingTop: "2px" }}>
                                    {card.type === "visa" ? (
                                      <p className="font-bold text-white">VISA</p>
                                    ) : (
                                      <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                                        alt="mastercard"
                                        className="h-5"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-gray-200">{card.typeOfCard}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold">{card.name}</p>
                              </div>
                            </div>
                            {/* Delete icon outside the card */}
                            <div className="flex justify-center mt-2">
                              <button
                                type="button"
                                className="hover:bg-red-100 rounded-full p-2 transition"
                                aria-label="Delete card"
                                onClick={() => handleDelete(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-red-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>

                {/* Saved UPI Section */}
                <div className="border rounded-md p-6 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Saved UPI</h2>
                    <button className="text-orange-600 font-medium flex items-center hover:underline">
                      Add UPI <span className="ml-1">→</span>
                    </button>
                  </div>

                  {/* Carousel Slider for UPI */}
                  <div className="mt-6 relative">
                    <Slider {...sliderSettings}>
                      {upis.map((upi, index) => (
                        <div key={index} className="px-2">
                          <div className="relative group">
                            {/* UPI Card */}
                            <div
                              className={`rounded-lg text-white p-6 ${upi.bgColor} shadow-md`}
                            >
                              <div className="-mt-3">
                                <p className="tracking-widest text-lg">{upi.bankName}</p>
                              </div>
                              <div className="mt-6 text-sm">
                                <div className="flex items-center space-x-2">
                                  <p className="tracking-widest text-lg">
                                    {upi.upiId}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-6">
                                <div className="flex flex-row items-center gap-10">
                                  <div style={{ paddingTop: "2px" }}>
                                    <p className="font-bold text-white">UPI</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-200">{upi.upiProvider}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold">{upi.name}</p>
                              </div>
                            </div>
                            {/* Delete icon outside the card */}
                            <div className="flex justify-center mt-2">
                              <button
                                type="button"
                                className="hover:bg-red-100 rounded-full p-2 transition"
                                aria-label="Delete UPI"
                                onClick={() => handleDeleteUpi(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-red-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PaymentMethodPage;