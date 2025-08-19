"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  image: string[]
  category: string
  subCategory: string
  sizes: string[]
  color?: string[]
  stock: number
  rating?: number
  reviews?: number
  isNew?: boolean
  badge?: string
}

interface WishlistEntry {
  productId: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

const authHeaders = () => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" }
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const showToast = (msg: string, success = true) => {
  if (typeof window === "undefined") return
  const el = document.createElement("div")
  el.textContent = msg
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
    success ? "bg-green-600" : "bg-red-600"
  }`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

export default function Women() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [brandSearch, setBrandSearch] = useState("")
  const [sortBy, setSortBy] = useState("Newest")
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [addedToCart, setAddedToCart] = useState<number | null>(null)
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set())
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedFilterSection, setExpandedFilterSection] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError("")

      try {
        console.log("[v0] Fetching products from:", `${API_BASE}/api/product/list`)
        const response = await fetch(`${API_BASE}/api/product/list`, {
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] API Response:", data)

        if (data.success && Array.isArray(data.products)) {
          const transformedProducts = data.products
            .filter((product: any) => product.category === "Women")
            .map((product: any, index: number) => ({
              id: product.id || index + 1,
              name: product.name || "Product",
              description: product.description || "",
              price: product.price || 600,
              originalPrice: product.originalPrice || product.price * 2,
              discount: product.discount || 55,
              image: Array.isArray(product.image) ? product.image : [product.image || "/images/hoodie-placeholder.png"],
              category: "Women",
              subCategory: product.subCategory || "T-Shirt",
              sizes: Array.isArray(product.sizes) ? product.sizes : ["S", "M", "L", "XL"],
              color: Array.isArray(product.color) ? product.color : ["Gray"],
              stock: product.stock || 10,
              rating: product.rating || 5.0,
              reviews: product.reviews || 10,
              isNew: index % 4 === 2,
              badge: index % 4 === 2 ? "New" : undefined,
            }))

          setProducts(transformedProducts)
        } else {
          throw new Error("Invalid API response format")
        }
      } catch (err) {
        console.error("[v0] Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to load products")

        const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: "Women's Fashion",
          description: "Premium quality women's clothing",
          price: 600,
          originalPrice: 1200,
          discount: 55,
          image: ["/images/hoodie-placeholder.png"],
          category: "Women",
          subCategory: "T-Shirt",
          sizes: ["S", "M", "L", "XL"],
          color: ["Gray"],
          stock: 10,
          rating: 5.0,
          reviews: 10,
          isNew: i === 2 || i === 8,
          badge: i === 2 || i === 8 ? "New" : undefined,
        }))
        setProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const colorOptions = [
    { name: "Red", hex: "#ef4444" },
    { name: "Orange", hex: "#f97316" },
    { name: "Green", hex: "#22c55e" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Magenta", hex: "#d946ef" },
    { name: "Black", hex: "#000000" },
  ]

  const categoryOptions = [
    { name: "New", count: 5 },
    { name: "Trending", count: 8 },
    { name: "Hot Deals", count: 3 },
  ]

  const priceRangeOptions = ["₹0 - ₹15", "₹16 - ₹30", "₹31 - ₹45", "₹46 - ₹60"]

  const brandOptions = [
    { name: "Antise", count: 12 },
    { name: "Apple", count: 8 },
    { name: "Boat", count: 15 },
    { name: "Bergamot", count: 6 },
    { name: "Lemon", count: 4 },
  ]

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) => product.sizes.some((size) => selectedSizes.includes(size)))
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(
        (product) => product.color && product.color.some((color) => selectedColors.includes(color)),
      )
    }

    // Category filter (New, Trending, Hot Deals)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        if (selectedCategories.includes("New") && product.isNew) return true
        if (selectedCategories.includes("Trending") && product.rating && product.rating >= 4.5) return true
        if (selectedCategories.includes("Hot Deals") && product.discount && product.discount >= 50) return true
        return false
      })
    }

    // Brand filter (using product name as brand for now)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.some((brand) => product.name.toLowerCase().includes(brand.toLowerCase())),
      )
    }

    // Price range filter (checkboxes)
    if (priceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        return priceRanges.some((range) => {
          const [min, max] = range
            .replace("₹", "")
            .split(" - ")
            .map((p) => Number.parseInt(p))
          return product.price >= min && product.price <= max
        })
      })
    }

    // Min/Max price filter
    const minPriceNum = minPrice ? Number.parseInt(minPrice) : 0
    const maxPriceNum = maxPrice ? Number.parseInt(maxPrice) : Number.POSITIVE_INFINITY
    if (minPrice || maxPrice) {
      filtered = filtered.filter((product) => product.price >= minPriceNum && product.price <= maxPriceNum)
    }

    // Sorting
    switch (sortBy) {
      case "Sort: Price Low to High":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "Sort: Price High to Low":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "Sort: Most Popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "Sort: Newest":
      default:
        // Keep original order for newest
        break
    }

    return filtered
  }, [
    products,
    selectedSizes,
    selectedColors,
    selectedCategories,
    selectedBrands,
    priceRanges,
    minPrice,
    maxPrice,
    sortBy,
  ])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
        <div className="flex items-center text-xs md:text-sm text-gray-600 space-x-1 md:space-x-2">
          <Link href="/" className="hover:text-black truncate">
            Home
          </Link>
          <span>›</span>
          <Link href="/women" className="hover:text-black truncate">
            Women
          </Link>
          <span>›</span>
          <span className="text-black truncate">T-Shirt</span>
        </div>
      </div>

      <div className="md:hidden px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Women</h1>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {filteredAndSortedProducts.length} Items
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 bg-white"
          >
            <option>Sort: Newest</option>
            <option>Sort: Price Low to High</option>
            <option>Sort: Price High to Low</option>
            <option>Sort: Most Popular</option>
          </select>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded text-sm bg-white min-w-fit"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* ... existing code for filters and product grid ... */}
    </div>
  )
}
