"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronRight } from "lucide-react"
import { useInfiniteScroll } from "@/app/hooks/use-infinite-scroll"

// Original carousel slides
const heroImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=400&fit=crop",
]

// Compact categories
const menCategories = [
  { name: "Shirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=100&h=100&fit=crop" },
  { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" },
  { name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop" },
  { name: "Formal", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { name: "Ethnic", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop" },
]

const allMenProducts = [
  {
    id: 1,
    brand: "Roadster",
    title: "Men Solid Casual Shirt",
    originalPrice: "₹1,299",
    salePrice: "₹649",
    discount: "50% OFF",
    rating: 4.3,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
  },
  {
    id: 2,
    brand: "HRX",
    title: "Men Active T-shirt",
    originalPrice: "₹999",
    salePrice: "₹499",
    discount: "50% OFF",
    rating: 4.1,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: 3,
    brand: "Levis",
    title: "Men Slim Fit Jeans",
    originalPrice: "₹3,999",
    salePrice: "₹1,999",
    discount: "50% OFF",
    rating: 4.5,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
  },
  {
    id: 4,
    brand: "Nike",
    title: "Men Running Shoes",
    originalPrice: "₹4,995",
    salePrice: "₹3,247",
    discount: "35% OFF",
    rating: 4.2,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
  },
  {
    id: 5,
    brand: "Allen Solly",
    title: "Men Formal Shirt",
    originalPrice: "₹1,799",
    salePrice: "₹899",
    discount: "50% OFF",
    rating: 4.0,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    id: 6,
    brand: "Puma",
    title: "Men Sports T-shirt",
    originalPrice: "₹1,299",
    salePrice: "₹779",
    discount: "40% OFF",
    rating: 4.3,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
]

export default function MenSection() {
  const [currentHero, setCurrentHero] = useState(0)
  const { items: products, loading, hasMore } = useInfiniteScroll(allMenProducts, () => allMenProducts, 8)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-white">
      {/* Original Carousel - Keep as is */}
     
      {/* Compact Categories */}
      <div className="px-3 py-2">
        <div className="grid grid-cols-5 gap-1">
          {menCategories.map((category, index) => (
            <div key={index} className="text-center">
              <div className="relative h-12 mb-1 rounded-md overflow-hidden">
                <Image src={category.image} alt={category.name} fill className="object-cover" />
              </div>
              <span className="text-xs font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
 <div className="px-3 sm:px-4 mb-4 sm:mb-6">
        <div className="relative h-56 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src={heroImages[currentHero]}
            alt="Men's Collection"
            fill
            className="transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">SUMMER</h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg">COLLECTION'25</h2>
            <p className="text-base sm:text-lg lg:text-xl mb-1 drop-shadow-md">Fresh & Trendy</p>
            <p className="text-sm sm:text-base drop-shadow-md">Season's Latest Styles</p>
            <p className="text-sm sm:text-base font-medium text-blue-200 drop-shadow-md">#MensFashion</p>
          </div>
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="text-xs sm:text-sm font-medium">NEW SEASON</span>
          </div>
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 cursor-pointer hover:scale-110"
              onClick={() => setCurrentHero((prev) => (prev + 1) % heroImages.length)}
            >
              <ChevronRight className="text-gray-800 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        {/* Carousel dots */}
        <div className="flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          {heroImages.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${i === currentHero ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" : "bg-gray-300 hover:bg-gray-400"}`}
              onClick={() => setCurrentHero(i)}
            />
          ))}
        </div>
      </div>

      {/* Compact Products */}
      <div className="px-3 py-2">
        <h2 className="text-lg font-bold mb-2">Trending Products</h2>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-32">
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              </div>
              <CardContent className="p-2">
                <h4 className="text-xs font-semibold truncate">{product.brand}</h4>
                <p className="text-xs text-gray-600 truncate">{product.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-bold">{product.salePrice}</span>
                  <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-2">Loading...</p>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">End of products</p>
          </div>
        )}
      </div>
    </div>
  )
}
