'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const getAuthToken = () => typeof window !== 'undefined'
  ? localStorage.getItem('token') || sessionStorage.getItem('token')
  : null;

// Mock data for when no cards/UPIs are available
const mockCards = [
  {
    id: 'mock-1',
    bankName: 'HDFC Bank',
    last4: '4567',
    type: 'VISA',
    typeOfCard: 'Debit Card',
    name: 'John Doe',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
    isMock: true
  },
  {
    id: 'mock-2',
    bankName: 'ICICI Bank',
    last4: '8901',
    type: 'Mastercard',
    typeOfCard: 'Credit Card',
    name: 'John Doe',
    bgColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    isMock: true
  },
  {
    id: 'mock-3',
    bankName: 'SBI Bank',
    last4: '2345',
    type: 'RuPay',
    typeOfCard: 'Debit Card',
    name: 'John Doe',
    bgColor: 'bg-gradient-to-br from-green-600 to-green-800',
    isMock: true
  }
];

const mockUpis = [
  {
    id: 'mock-upi-1',
    bankName: 'PhonePe',
    upiId: 'john.doe@ybl',
    type: 'UPI',
    upiProvider: 'PhonePe',
    name: 'John Doe',
    bgColor: 'bg-gradient-to-br from-indigo-600 to-purple-700',
    isMock: true
  },
  {
    id: 'mock-upi-2',
    bankName: 'Google Pay',
    upiId: 'john.doe@okaxis',
    type: 'UPI',
    upiProvider: 'Google Pay',
    name: 'John Doe',
    bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
    isMock: true
  }
];

export default function PaymentMethodPage() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [upis, setUpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      const token = getAuthToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [cardsRes, upisRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/payment/cards`, { headers }),
          fetch(`${API_BASE_URL}/api/payment/upis`, { headers })
        ]);
        const cardsData = await cardsRes.json();
        const upisData = await upisRes.json();
        
        // Use real data if available, otherwise use mock data
        const realCards = cardsData.cards || [];
        const realUpis = upisData.upis || [];
        
        setCards(realCards.length > 0 ? realCards : mockCards);
        setUpis(realUpis.length > 0 ? realUpis : mockUpis);
      } catch (err) { 
        // On error, use mock data
        setCards(mockCards); 
        setUpis(mockUpis); 
      }
      setLoading(false);
    }
    fetchPayments();
  }, []);

  const handleDeleteCard = async (id) => {
    // Don't delete mock cards
    const cardToDelete = cards.find(c => c.id === id);
    if (cardToDelete?.isMock) {
      alert("This is a demo card and cannot be deleted");
      return;
    }

    const token = getAuthToken();
    await fetch(`${API_BASE_URL}/api/payment/cards/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setCards(cards.filter(c => c.id !== id));
  };

  const handleDeleteUpi = async (id) => {
    // Don't delete mock UPIs
    const upiToDelete = upis.find(u => u.id === id);
    if (upiToDelete?.isMock) {
      alert("This is a demo UPI and cannot be deleted");
      return;
    }

    const token = getAuthToken();
    await fetch(`${API_BASE_URL}/api/payment/upis/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setUpis(upis.filter(u => u.id !== id));
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 2,
          slidesToScroll: 1,
        } 
      },
      { 
        breakpoint: 640, 
        settings: { 
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
        } 
      },
    ],
  };

  const upiSliderSettings = {
    ...sliderSettings,
    infinite: false,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-3 lg:p-6">
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
          <button className="text-left px-3 py-2 rounded bg-orange-100 font-semibold whitespace-nowrap lg:whitespace-normal text-sm lg:text-base">
            Saved Payment Method
          </button>
          <button 
            onClick={() => router.push("/profile/addressBook")} 
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-medium whitespace-nowrap lg:whitespace-normal text-sm lg:text-base"
          >
            Address Book
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Saved Cards Section */}
          <div className="border rounded-md p-4 lg:p-6 bg-white mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0">
              <h2 className="text-lg lg:text-xl font-semibold">Saved Cards</h2>
              <button className="text-orange-600 font-medium flex items-center hover:underline text-sm lg:text-base">
                Add Card <span className="ml-1">→</span>
              </button>
            </div>
            <div className="mt-4 lg:mt-6 relative">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500 text-sm lg:text-base">Loading...</div>
                </div>
              ) : (
                <div className="block sm:hidden">
                  {/* Mobile: Stack cards vertically */}
                  <div className="space-y-4">
                    {cards.map((card, index) => (
                      <div key={card.id || index} className="w-full">
                        <div className={`rounded-lg text-white p-4 ${card.bgColor || 'bg-gradient-to-br from-blue-600 to-blue-800'} shadow-md relative`}>
                          {card.isMock && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                              Demo
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                            <p className="tracking-wider text-sm font-medium">{card.bankName}</p>
                            <button 
                              type="button" 
                              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1" 
                              aria-label="Delete card"
                              onClick={() => handleDeleteCard(card.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                              </svg>
                            </button>
                          </div>
                          <div className="mb-3 text-xs">
                            <p className="text-gray-200 mb-1">CARD NUMBER</p>
                            <p className="tracking-widest text-sm">**** **** **** {card.last4}</p>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-white text-sm">{card.type}</div>
                            <div><p className="text-gray-200 text-xs">{card.typeOfCard}</p></div>
                          </div>
                          <div><p className="font-medium text-sm">{card.name}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Desktop and Tablet: Use slider */}
              <div className="hidden sm:block">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <Slider {...sliderSettings}>
                    {cards.map((card, index) => (
                      <div key={card.id || index} className="px-2">
                        <div className={`rounded-lg text-white p-4 lg:p-6 ${card.bgColor || 'bg-gradient-to-br from-blue-600 to-blue-800'} shadow-md relative min-h-[180px] lg:min-h-[200px]`}>
                          {card.isMock && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                              Demo
                            </div>
                          )}
                          <div className="-mt-3 mb-4 lg:mb-6">
                            <p className="tracking-widest text-sm lg:text-lg font-medium">{card.bankName}</p>
                          </div>
                          <div className="mt-4 lg:mt-6 text-xs lg:text-sm">
                            <p className="text-gray-200 mb-1">CARD NUMBER</p>
                            <p className="tracking-widest text-sm lg:text-lg">**** **** **** {card.last4}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 lg:mt-6">
                            <div className="font-bold text-white text-sm lg:text-base">{card.type}</div>
                            <div><p className="text-gray-200 text-xs lg:text-sm">{card.typeOfCard}</p></div>
                          </div>
                          <div className="mt-2">
                            <p className="font-semibold text-sm lg:text-base">{card.name}</p>
                          </div>
                          <div className="absolute top-2 right-2">
                            <button 
                              type="button" 
                              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 lg:p-2" 
                              aria-label="Delete card"
                              onClick={() => handleDeleteCard(card.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-6 lg:w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
            </div>
          </div>

          {/* Saved UPI Section */}
          <div className="border rounded-md p-4 lg:p-6 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0">
              <h2 className="text-lg lg:text-xl font-semibold">Saved UPI</h2>
              <button className="text-orange-600 font-medium flex items-center hover:underline text-sm lg:text-base">
                Add UPI <span className="ml-1">→</span>
              </button>
            </div>
            <div className="mt-4 lg:mt-6 relative">
              {/* Mobile: Stack UPIs vertically */}
              <div className="block sm:hidden">
                <div className="space-y-4">
                  {upis.map((upi, index) => (
                    <div key={upi.id || index} className="w-full">
                      <div className={`rounded-lg text-white p-4 ${upi.bgColor || 'bg-gradient-to-br from-green-600 to-green-800'} shadow-md relative`}>
                        {upi.isMock && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                            Demo
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <p className="tracking-wider text-sm font-medium">{upi.bankName}</p>
                          <button 
                            type="button" 
                            className="hover:bg-white hover:bg-opacity-20 rounded-full p-1" 
                            aria-label="Delete UPI"
                            onClick={() => handleDeleteUpi(upi.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                            </svg>
                          </button>
                        </div>
                        <div className="mb-3 text-xs">
                          <p className="tracking-widest text-sm font-mono">{upi.upiId}</p>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-bold text-white text-sm">{upi.type}</div>
                          <div><p className="text-gray-200 text-xs">{upi.upiProvider}</p></div>
                        </div>
                        <div><p className="font-medium text-sm">{upi.name}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop and Tablet: Use slider */}
              <div className="hidden sm:block">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <Slider {...upiSliderSettings}>
                    {upis.map((upi, index) => (
                      <div key={upi.id || index} className="px-2">
                        <div className={`rounded-lg text-white p-4 lg:p-6 ${upi.bgColor || 'bg-gradient-to-br from-green-600 to-green-800'} shadow-md relative min-h-[180px] lg:min-h-[200px]`}>
                          {upi.isMock && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                              Demo
                            </div>
                          )}
                          <div className="-mt-3 mb-4 lg:mb-6">
                            <p className="tracking-widest text-sm lg:text-lg font-medium">{upi.bankName}</p>
                          </div>
                          <div className="mt-4 lg:mt-6 text-xs lg:text-sm">
                            <p className="tracking-widest text-sm lg:text-lg font-mono">{upi.upiId}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 lg:mt-6">
                            <div className="font-bold text-white text-sm lg:text-base">{upi.type}</div>
                            <div><p className="text-gray-200 text-xs lg:text-sm">{upi.upiProvider}</p></div>
                          </div>
                          <div className="mt-2">
                            <p className="font-semibold text-sm lg:text-base">{upi.name}</p>
                          </div>
                          <div className="absolute top-2 right-2">
                            <button 
                              type="button" 
                              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 lg:p-2" 
                              aria-label="Delete UPI"
                              onClick={() => handleDeleteUpi(upi.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-6 lg:w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}