"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, ChevronRight } from "lucide-react"
import { useInfiniteScroll } from "@/app/hooks/use-infinite-scroll"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
// Mock data for Women section
const womenProducts = [
  {
    id: 1,
    brand: "Libas",
    title: "Women Printed Kurta Set",
    originalPrice: "₹1,252",
    salePrice: "₹738",
    discount: "41% OFF",
    rating: 4.2,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
    badge: "AD",
  },
  {
    id: 2,
    brand: "Zivame",
    title: "Women Pack Of 7 Briefs",
    originalPrice: "₹1,799",
    salePrice: "₹1,275",
    discount: "Rs. 524 OFF",
    rating: 4.5,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop",
    badge: "AD",
  },
  {
    id: 3,
    brand: "H&M",
    title: "Women Floral Dress",
    originalPrice: "₹2,999",
    salePrice: "₹1,499",
    discount: "50% OFF",
    rating: 4.3,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    brand: "Biba",
    title: "Women Ethnic Suit Set",
    originalPrice: "₹3,499",
    salePrice: "₹2,099",
    discount: "40% OFF",
    rating: 4.4,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop",
  },
  {
    id: 5,
    brand: "Vero Moda",
    title: "Women Casual Top",
    originalPrice: "₹1,599",
    salePrice: "₹799",
    discount: "50% OFF",
    rating: 4.1,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
  },
  {
    id: 6,
    brand: "Nike",
    title: "Women Running Shoes",
    originalPrice: "₹5,995",
    salePrice: "₹3,597",
    discount: "40% OFF",
    rating: 4.6,
    reviews: 134,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&h=200&fit=crop",
  },
  {
    id: 7,
    brand: "Global Desi",
    title: "Women Printed Maxi Dress",
    originalPrice: "₹2,499",
    salePrice: "₹1,249",
    discount: "50% OFF",
    rating: 4.0,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
  },
  {
    id: 8,
    brand: "W",
    title: "Women Solid Casual Top",
    originalPrice: "₹1,299",
    salePrice: "₹649",
    discount: "50% OFF",
    rating: 4.2,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
  },
]

// Removed unused womenCategories array

const womenProductCategories = [
  {
    title: "DRESSES",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
  },
  {
    title: "TOPS",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
  },
  {
    title: "ETHNIC",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
  },
  {
    title: "JEANS",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop",
  },
  {
    title: "FOOTWEAR",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&h=200&fit=crop",
  },
]

const womenFestivalSection = {
  title: "Festivals Of INDIA",
  subtitle: "Get Tyohaar Ready with Us",
  items: [
    {
      title: "GANESH CHATURTHI SHOP",
      subtitle: "Traditional Wear",
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop",
    },
    {
      title: "Premium Ethnic Wear",
      subtitle: "Min. 60% Off",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
    },
    {
      title: "Ethnic Dresses",
      subtitle: "Up To 70% Off",
      image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=200&h=200&fit=crop",
    },
    {
      title: "PONNONAM VARAVAAYI!",
      subtitle: "Celebration Styles",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=200&fit=crop",
    },
  ],
}

const carouselSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&h=600&fit=crop",
    title: "SUMMER COLLECTION",
    subtitle: "Fresh & Vibrant Styles",
    description: "Discover the latest trends for the season",
    badge: "NEW ARRIVALS",
    gradient: "from-orange-500 to-pink-500"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1200&h=600&fit=crop",
    title: "ETHNIC ELEGANCE",
    subtitle: "Traditional with a Modern Twist",
    description: "Celebrate culture with contemporary designs",
    badge: "TRENDING",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=600&fit=crop",
    title: "CASUAL CHIC",
    subtitle: "Everyday Comfort Meets Style",
    description: "Perfect looks for your daily adventures",
    badge: "BEST SELLERS",
    gradient: "from-blue-500 to-teal-500"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    title: "WINTER WARMTH",
    subtitle: "Cozy & Stylish Layers",
    description: "Stay warm without compromising on style",
    badge: "SEASON SALE",
    gradient: "from-red-500 to-orange-500"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea3c4019?w=1200&h=600&fit=crop",
    title: "FESTIVE GLAMOUR",
    subtitle: "Shine Bright This Season",
    description: "Dazzling outfits for special occasions",
    badge: "LIMITED EDITION",
    gradient: "from-indigo-500 to-purple-500"
  }
]

export default function WomenSection() {
  const { items: products, loading, hasMore } = useInfiniteScroll(womenProducts, () => womenProducts, 6)

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Product Categories */}
      <div className="px-2 mb-3 py-2">
        <div className="grid grid-cols-5 gap-1">
          {womenProductCategories.map((category, index) => (
            <div key={index} className="text-center">
              <div className="relative h-12 sm:h-14 mb-1 rounded-md overflow-hidden">
                <Image src={category.image || "/placeholder.svg"} alt={category.title} fill className="object-cover" />
              </div>
              <span className="text-xs font-medium">{category.title}</span>
            </div>
          ))}
        </div>
      </div>


      <div className="px-3 sm:px-4 mb-4 sm:mb-6">
        <div className="relative h-56 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={4000}
            arrows={false}
            pauseOnHover={true}
            className="h-full w-full"
            customPaging={(i: number) => (
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 bg-white/50 hover:bg-white/80" />
            )}
            appendDots={(dots: React.ReactNode) => (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <ul className="flex gap-2">{dots}</ul>
              </div>
            )}
          >
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="relative h-56 sm:h-72 lg:h-80">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 drop-shadow-lg">
                    {slide.subtitle}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl mb-1 drop-shadow-md">
                    {slide.description}
                  </p>
                  <p className="text-sm sm:text-base font-medium text-pink-200 drop-shadow-md">
                    #WomensFashion
                  </p>
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                  <span className="text-xs sm:text-sm font-medium">{slide.badge}</span>
                </div>
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 cursor-pointer hover:scale-110">
                    <ChevronRight className="text-gray-800 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      

      {/* Fun in the Sun Section */}
      <div className="px-4 py-6 bg-blue-50">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Fun In The Sun</h2>
          <p className="text-sm sm:text-base text-blue-700">Comfy Fits For Sunny Days</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <Card className="min-w-[200px] overflow-hidden bg-yellow-100">
            <div className="relative h-32">
              <Image
                src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop"
                alt="Printed Tops"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-white px-2 py-1 rounded">H&M</span>
              </div>
              <h4 className="text-sm font-semibold">Printed Tops & Tees</h4>
              <p className="text-xs text-gray-600">Min. 50% Off</p>
            </CardContent>
          </Card>
          <Card className="min-w-[200px] overflow-hidden bg-pink-100">
            <div className="relative h-32">
              <Image
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop"
                alt="Ethnic Sets"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-white px-2 py-1 rounded">Soja</span>
              </div>
              <h4 className="text-sm font-semibold">Sharara & Dhoti Sets</h4>
              <p className="text-xs text-gray-600">50-70% Off</p>
            </CardContent>
          </Card>
          <Card className="min-w-[200px] overflow-hidden bg-green-100">
            <div className="relative h-32">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop"
                alt="Summer Dresses"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <h4 className="text-sm font-semibold">Summer Dresses</h4>
              <p className="text-xs text-gray-600">40-60% Off</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Festival Section */}
      <div className="px-4 py-6 bg-orange-50">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-800">Festivals Of INDIA</h2>
          <p className="text-sm sm:text-base text-orange-700">Get Tyohaar Ready with Us</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {womenFestivalSection.items.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-24 sm:h-32">
                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-1 left-1 text-white">
                  <h4 className="text-xs font-bold truncate">{item.title}</h4>
                  <p className="text-xs truncate">{item.subtitle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Beauty & Personal Care */}
      <div className="px-4 py-6 bg-pink-50">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-pink-800">Beauty & Personal Care</h2>
          <p className="text-sm sm:text-base text-pink-700">Glow Up Your Routine</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <Card className="min-w-[200px] overflow-hidden bg-purple-100">
            <div className="relative h-32">
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop"
                alt="Skincare"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <h4 className="text-sm font-semibold">Skincare Essentials</h4>
              <p className="text-xs text-gray-600">Min. 30% Off</p>
            </CardContent>
          </Card>
          <Card className="min-w-[200px] overflow-hidden bg-red-100">
            <div className="relative h-32">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop"
                alt="Makeup"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <h4 className="text-sm font-semibold">Makeup Must-Haves</h4>
              <p className="text-xs text-gray-600">40-60% Off</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-2 py-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">Trending Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden relative group hover:shadow-lg transition-all duration-300 bg-white"
            >
              {product.badge && (
                <div className="absolute top-1 left-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs px-1.5 py-0.5 rounded z-10">
                  {product.badge}
                </div>
              )}
              <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Heart className="w-3 h-3 text-white drop-shadow cursor-pointer hover:text-red-500 transition-colors" />
              </div>
              <div className="relative h-32 sm:h-36">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-2">
                <h4 className="text-xs font-semibold text-gray-800 truncate mb-0.5">{product.brand}</h4>
                <p className="text-xs text-gray-600 mb-1 line-clamp-1">{product.title}</p>
                <div className="flex items-center gap-0.5 mb-1">
                  <Star className="w-2.5 h-2.5 fill-green-500 text-green-500" />
                  <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-bold text-gray-900">{product.salePrice}</span>
                  <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                  <span className="text-xs text-orange-600 font-medium">
                    {product.discount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-4 font-medium">Loading more products...</p>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium">You've explored all our products!</p>
          </div>
        )}
      </div>
    </div>
  )
}
