"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, ChevronRight, ChevronLeft } from "lucide-react"

// Carousel data for top section
const carouselItems = [
  {
    id: 1,
    title: "AUTUMN WINTER'25",
    subtitle: "Cute & Cosy",
    description: "Season's Latest Styles",
    hashtag: "#KidsEdit",
    badge: "NEW SEASON",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "SUMMER VIBES",
    subtitle: "Bright & Fun",
    description: "Colorful Summer Collection",
    hashtag: "#SummerKids",
    badge: "HOT DEALS",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "FESTIVE SPECIALS",
    subtitle: "Traditional & Modern",
    description: "Celebrate in Style",
    hashtag: "#FestiveWear",
    badge: "SPECIAL OFFER",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=400&fit=crop"
  }
]

const kidsCategories = [
  {
    id: 1,
    name: "Girls",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop",
    bgColor: "bg-blue-900",
  },
  {
    id: 2,
    name: "Boys",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop",
    bgColor: "bg-green-600",
  },
  {
    id: 3,
    name: "Infants",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop",
    bgColor: "bg-pink-300",
  },
  {
    id: 4,
    name: "Teens",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=80&h=80&fit=crop",
    bgColor: "bg-gray-300",
  },
  {
    id: 5,
    name: "Add-ons",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
    bgColor: "bg-pink-200",
  },
]

const ageGroups = [
  { name: "0-6 Months", bgColor: "bg-yellow-200" },
  { name: "6-24 Months", bgColor: "bg-purple-200" },
  { name: "2-4 Years", bgColor: "bg-pink-200" },
  { name: "4-6 Years", bgColor: "bg-green-200" },
]

// Removed unused productCategories array

const miniStyleStealsProducts = [
  {
    id: 1,
    title: "Under ₹399",
    subtitle: "Adorable Finds",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=200&fit=crop",
    brands: [
      { name: "babyshop", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=30&fit=crop" },
      { name: "mothercare", logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=30&fit=crop" },
    ],
  },
  {
    id: 2,
    title: "Under ₹299",
    subtitle: "Aww-dorable Fits On A Budget",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop",
    brands: [
      { name: "NUSYL", logo: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=60&h=30&fit=crop" },
      { name: "V MART", logo: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=60&h=30&fit=crop" },
    ],
  },
  {
    id: 3,
    title: "Cute & Comfy",
    subtitle: "Everyday Essentials",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=200&fit=crop",
    brands: [{ name: "max", logo: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=60&h=30&fit=crop" }],
  },
]

const festivalProducts = [
  {
    id: 1,
    title: "GANESH CHATURTHI SHOP",
    subtitle: "Little Fits, Big Smiles",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop",
    hasArrow: true,
  },
  {
    id: 2,
    title: "Pretty Lehenga Cholis",
    subtitle: "Min. 60% Off",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
    hasArrow: false,
  },
  {
    id: 3,
    title: "Royal Dhoti Kurta Sets",
    subtitle: "Min. 50% Off",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=200&h=200&fit=crop",
    hasArrow: false,
  },
  {
    id: 4,
    title: "Ethnic Dresses",
    subtitle: "Up To 70% Off",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=200&fit=crop",
    hasArrow: false,
  },
  {
    id: 5,
    title: "PONNONAM VARAVAAYI!",
    subtitle: "Sweet Styles To Celebrate",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
    hasArrow: true,
  },
  {
    id: 6,
    title: "Ethnic Dresses",
    subtitle: "Under ₹1499",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop",
    hasArrow: false,
  },
  {
    id: 7,
    title: "Anarkali Sets",
    subtitle: "Min. 30% Off",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
    hasArrow: false,
  },
  {
    id: 8,
    title: "The Janmashtami Edit",
    subtitle: "Joyful Celebrations",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=200&h=200&fit=crop",
    hasArrow: true,
  },
]

const funInSunProducts = [
  {
    id: 1,
    title: "Sharara & Dhoti Sets",
    subtitle: "50-70% Off",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop",
    brands: ["Soja", "READIPRINT"],
  },
  {
    id: 2,
    title: "Printed Tops & Tees",
    subtitle: "Min. 50% Off",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
    brands: ["H&M", "UNITED COLORS OF BENETTON"],
  },
  {
    id: 3,
    title: "Casual Wear",
    subtitle: "Everyday Comfort",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    brands: ["GAP"],
  },
]

const productListings = [
  {
    id: 1,
    brand: "Biskid",
    title: "Pack Of 2 Printed Capris",
    originalPrice: "₹1,252",
    salePrice: "₹738",
    discount: "41% OFF",
    rating: 4.2,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
    isAd: true,
  },
  {
    id: 2,
    brand: "You Got Plan B",
    title: "Girls Pack Of 7 Briefs",
    originalPrice: "₹1,799",
    salePrice: "₹1,275",
    discount: "Rs. 524 OFF",
    rating: 4.2,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
    isAd: true,
    pack: "7 - PACK",
  },
  {
    id: 3,
    brand: "Little Star",
    title: "Cotton Summer Dress",
    originalPrice: "₹899",
    salePrice: "₹549",
    discount: "39% OFF",
    rating: 4.5,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
    isAd: false,
  },
  {
    id: 4,
    brand: "Tiny Tots",
    title: "Boys Casual T-Shirt Set",
    originalPrice: "₹1,199",
    salePrice: "₹799",
    discount: "33% OFF",
    rating: 4.3,
    reviews: 15,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    isAd: false,
  },
]

// Custom hook for infinite scroll (simplified for demo)
function useInfiniteScroll(initialItems: any[], fetchMore: () => any[], increment: number) {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  return { items, loading, hasMore }
}

export default function KidsSection() {
  const { items: products, loading, hasMore } = useInfiniteScroll(productListings, () => productListings, 4)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
    

      <div className="px-2 py-3 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        {/* Compact Kids Categories */}
        <div className="flex justify-between items-center mb-3 gap-1">
          {kidsCategories.map((category) => (
            <div key={category.id} className="flex flex-col items-center space-y-1 group cursor-pointer">
              <div
                className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
              >
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-medium text-gray-800 text-center">
                {category.name}
              </span>
            </div>
          ))}
        </div>

        {/* Compact Age Groups */}
        <div className="flex justify-between items-center mb-4 gap-1">
          {ageGroups.map((group, index) => (
            <div
              key={index}
              className={`${group.bgColor} px-2 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105`}
            >
              <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{group.name}</span>
            </div>
          ))}
        </div>

          {/* Top Carousel Section */}
      <div className="relative mb-4 rounded-xl overflow-hidden shadow-xl mx-2 mt-2">
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
          {carouselItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                {item.badge}
              </div>
              <div className="absolute bottom-3 left-3 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-lg">{item.title}</h2>
                <h3 className="text-sm sm:text-base font-semibold mb-1 drop-shadow-md">{item.subtitle}</h3>
                <p className="text-xs sm:text-sm mb-1 drop-shadow-md">{item.description}</p>
                <p className="text-xs text-blue-200 drop-shadow-md">{item.hashtag}</p>
              </div>
            </div>
          ))}
          
          {/* Carousel Navigation */}
          <button 
            onClick={prevSlide}
            title="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button 
            onClick={nextSlide}
            title="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-2 mt-3 mb-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              title={`Go to slide ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
      </div>

      {/* Compact Mini Style Steals Section */}
      <div className="px-2 py-4 bg-gradient-to-br from-blue-100 via-teal-50 to-green-100">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-1">
            Mini Style Steals
          </h2>
          <p className="text-sm text-teal-700 font-medium">Big Deals For Tiny Trendsetters</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {miniStyleStealsProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40 space-y-2 snap-start">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90">
                <div className="relative h-28">
                  <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <h4 className="text-xs font-bold drop-shadow-md">{product.title}</h4>
                    <p className="text-xs drop-shadow-md">{product.subtitle}</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center space-x-1">
                {product.brands.map((brand, index) => (
                  <div
                    key={index}
                    className="bg-white/90 rounded-lg p-1 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      width={40}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Festivals Section */}
      <div className="px-3 py-4 bg-gradient-to-r from-orange-400 to-orange-500">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-1">Festivals</h2>
          <h2 className="text-xl font-bold text-yellow-300 mb-1">Of INDIA</h2>
          <p className="text-white text-sm">Get Tyohaar Ready With Us</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {festivalProducts.map((item) => (
            <Card key={item.id} className="overflow-hidden relative">
              <div className="relative h-32">
                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2 left-2 text-white max-w-[80%]">
                  <h4 className="text-xs font-bold mb-1 leading-tight">{item.title}</h4>
                  <p className="text-xs">{item.subtitle}</p>
                </div>
                {item.hasArrow && (
                  <div className="absolute bottom-2 right-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xs">→</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Compact Personalization Quiz Section */}
      <div className="mx-3 my-3 bg-yellow-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready To Personalize?</h3>
          <h2 className="text-lg font-bold text-gray-900">Take the quiz!</h2>
        </div>
        <div className="flex space-x-1">
          <Image
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=50&h=60&fit=crop"
            alt="Boy"
            width={50}
            height={60}
            className="rounded-lg object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=50&h=60&fit=crop"
            alt="Girl"
            width={50}
            height={60}
            className="rounded-lg object-cover"
          />
        </div>
        <div className="ml-2">
          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">→</span>
          </div>
        </div>
      </div>

      {/* Compact Fun In The Sun Section */}
      <div className="px-3 py-4 bg-blue-50">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-teal-600">Fun In The Sun</h2>
          <p className="text-sm text-teal-700">Comfy Fits For Sunny Days</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {funInSunProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40 space-y-2">
              <Card className="overflow-hidden bg-yellow-100">
                <div className="relative h-32">
                  <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                  <div className="absolute top-2 left-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  </div>
                </div>
                <CardContent className="p-2">
                  <h4 className="text-xs font-semibold text-teal-600">{product.title}</h4>
                  <p className="text-xs text-gray-600">{product.subtitle}</p>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-1">
                {product.brands.map((brand, index) => (
                  <div key={index} className="bg-white rounded-lg px-1 py-1 shadow-sm">
                    <span className="text-xs font-medium text-gray-700">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Product Listings */}
      <div className="px-2 py-4">
        <h2 className="text-lg font-bold mb-3 text-gray-800">Trending Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white"
            >
              {product.isAd && (
                <div className="absolute top-1 right-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white px-1 py-0.5 rounded-full text-xs font-bold z-10">
                  AD
                </div>
              )}
              <div className="relative h-36">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.pack && (
                  <div className="absolute bottom-1 right-1 bg-white/90 rounded-full px-1 py-0.5">
                    <span className="text-xs font-bold text-gray-800">{product.pack}</span>
                  </div>
                )}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-4 h-4 text-white drop-shadow-lg cursor-pointer hover:text-red-500 transition-colors" />
                </div>
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-gray-800 truncate flex-1">{product.brand}</h4>
                  <Heart className="w-3 h-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                </div>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.title}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">{product.salePrice}</span>
                  <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                  <span className="text-xs text-orange-600 font-medium bg-orange-100 px-1 py-0.5 rounded">
                    {product.discount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {loading && (
          <div className="flex justify-center items-center py-4">
            <span className="text-gray-500">Loading more products...</span>
          </div>
        )}
        {!hasMore && (
          <div className="text-center text-gray-500 py-4">
            <span>No more products available</span>
          </div>
        )}
      </div>
   
    </div>
  )
}
