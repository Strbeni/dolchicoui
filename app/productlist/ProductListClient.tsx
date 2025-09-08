"use client"

import { useState, useEffect, useMemo } from "react";
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Heart, ChevronDown, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
  selectIsInWishlist
} from "@/lib/store/wishlistSlice";
import { useNavbarCounts } from "@/contexts/NavbarCountsContext";
import { useLoading } from "@/contexts/LoadingContext";

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
  tags?: string[]
}

interface WishlistEntry {
  productId: number
}

interface ProductListClientProps {
  category?: "Men" | "Women" | "Kids" | "Home" | "Accessories" | "All";
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
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${success ? "bg-green-600" : "bg-red-600"
    }`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

export default function ProductListClient({ category = "Men" }: ProductListClientProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Redux wishlist for unauthenticated users
  const reduxWishlistItems = useAppSelector(selectWishlistItems)

  // Context for refreshing navbar counts
  const { refreshWishlistCount, refreshCartCount } = useNavbarCounts()

  // Global loading context
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading()

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
  const [apiWishlistItems, setApiWishlistItems] = useState<Set<number>>(new Set()) // For authenticated users
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedFilterSection, setExpandedFilterSection] = useState<string | null>(null)

  // Cart count state - used for fetching cart items count
  const [cartCount, setCartCount] = useState<number>(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) // 12 items per page for better mobile experience

  // Determine authentication status
  const isAuthenticated = () => {
    if (typeof window === "undefined") return false
    return !!(localStorage.getItem("token") || sessionStorage.getItem("token"))
  }

  // Get wishlist items based on authentication status
  const wishlistItems = isAuthenticated()
    ? apiWishlistItems
    : new Set(reduxWishlistItems.map(item => item.id))

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
          const transformedProducts = data.products.map((product: any, index: number) => {
            const discount = product.discount || 0
            const originalPrice = product.price
            const discountedPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice

            return {
              id: product.id || index + 1,
              name: product.name || "Product",
              description: product.description || "",
              price: discountedPrice,
              originalPrice: discount > 0 ? originalPrice : undefined,
              discount: discount,
              image: Array.isArray(product.image) ? product.image : ["/images/hoodie-placeholder.png"],
              category: product.category?.name || "Men",
              subCategory: product.subcategory?.name || "Topwear",
              sizes: Array.isArray(product.sizes) ? product.sizes : ["S", "M", "L", "XL"],
              color: [], // Not in API, set empty
              stock: product.stock || 10,
              rating: 5.0, // Default
              reviews: 10, // Default
              isNew: false, // Can be based on date if needed
              badge: product.bestseller ? "Bestseller" : undefined,
              tags: product.tags || [],
            }
          })

          setProducts(transformedProducts)
        } else {
          throw new Error("Invalid API response format")
        }
      } catch (err) {
        console.error("[v0] Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to load products")

        const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: "SSneakers",
          description: "Premium quality sneakers",
          price: 600,
          originalPrice: 1200,
          discount: 55,
          image: ["/images/hoodie-placeholder.png"],
          category: "Men",
          subCategory: "T-Shirt",
          sizes: ["S", "M", "L", "XL"],
          color: [],
          stock: 10,
          rating: 5.0,
          reviews: 10,
          isNew: i === 2 || i === 8,
          badge: i === 2 || i === 8 ? "New" : undefined,
          tags: [],
        }))
        setProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [cartCount])

  useEffect(() => {
    if (!isAuthenticated()) return // Only fetch wishlist for authenticated users

    // Fetch wishlist
    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/wishlist`, { headers: authHeaders() })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && Array.isArray(data.data?.wishlist)) {
          const wishlistProductIds = new Set<number>(
            (data.data.wishlist as WishlistEntry[]).map((item) => item.productId),
          )
          setApiWishlistItems(wishlistProductIds)
        }
      } catch (err) {
        console.error("[v0] Error fetching wishlist:", err)
      }
    }

    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cart`, { headers: authHeaders() })
        if (!res.ok) return
        const data = await res.json()
        if (data.success && Array.isArray(data.data?.items)) {
          setCartCount(data.data.items.length)
        } else if (data.success && typeof data.data?.totalItems === "number") {
          setCartCount(data.data.totalItems)
        }
      } catch (err) {
        console.error("[v0] Error fetching cart count:", err)
      }
    }

    fetchWishlistStatus()
    fetchCartCount()
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

  const handleSizeFilter = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const handleColorFilter = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleBrandFilter = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const handlePriceRangeFilter = (range: string) => {
    setPriceRanges((prev) => (prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]))
  }

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      showToast("Product is out of stock", false)
      return
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
      showToast("Please login to add items to cart", false)
      router.push("/login")
      return
    }

    setAddingToCart(product.id)
    setLoadingMessage("Adding to cart...")
    setGlobalLoading(true)
    console.log("[v0] Adding to cart - Product ID:", product.id, "Stock:", product.stock)

    try {
      const requestBody = {
        productId: product.id,
        size: product.sizes[0] || "M",
        quantity: 1,
      }
      console.log("[v0] Cart request body:", requestBody)
      console.log("[v0] Cart API URL:", `${API_BASE}/api/cart/items`)
      console.log("[v0] Auth headers:", authHeaders())

      const response = await fetch(`${API_BASE}/api/cart/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Cart response status:", response.status)
      console.log("[v0] Cart response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("[v0] Cart response text:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] Failed to parse response as JSON:", parseError)
        throw new Error(`Server returned invalid JSON: ${responseText}`)
      }

      console.log("[v0] Cart response data:", data)

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to add to cart")
      }

      setAddedToCart(product.id)
      showToast("Added to cart successfully!")
      setTimeout(() => setAddedToCart(null), 2000)
      
      // Refresh cart count in navbar
      refreshCartCount()
    } catch (error) {
      console.error("[v0] Add to cart error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart"
      showToast(errorMessage, false)
    } finally {
      setAddingToCart(null)
      setGlobalLoading(false)
    }
  }

  const handleWishlistToggle = async (product: Product) => {
    const isAuth = isAuthenticated()
    const isInWishlist = wishlistItems.has(product.id)
    setAddingToWishlist(product.id)

    try {
      if (isAuth) {
        // Authenticated user - use API with global loading
        setLoadingMessage(isInWishlist ? "Removing from wishlist..." : "Adding to wishlist...")
        setGlobalLoading(true)

        if (isInWishlist) {
          const response = await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
            method: "DELETE",
            headers: authHeaders(),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to remove from wishlist")
          }

          setApiWishlistItems((prev) => {
            const next = new Set(prev)
            next.delete(product.id)
            return next
          })
          showToast("Removed from wishlist!")
          // Refresh navbar count
          refreshWishlistCount()
        } else {
          const response = await fetch(`${API_BASE}/api/user/wishlist`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ productId: product.id }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to add to wishlist")
          }

          setApiWishlistItems((prev) => new Set([...prev, product.id]))
          showToast("Added to wishlist!")
          // Refresh navbar count
          refreshWishlistCount()
        }
      } else {
        // Unauthenticated user - use Redux
        if (isInWishlist) {
          dispatch(removeFromWishlist(product.id))
          showToast("Removed from wishlist!")
        } else {
          dispatch(addToWishlist({
            ...product,
            bestseller: product.badge === "bestseller" || false,
            createdAt: new Date().toISOString()
          }))
          showToast("Added to wishlist!")
        }
      }
    } catch (error) {
      console.error("[v0] Wishlist toggle error:", error)
      showToast(error instanceof Error ? error.message : "Wishlist operation failed", false)
    } finally {
      if (isAuth) {
        setGlobalLoading(false)
      }
      setAddingToWishlist(null)
    }
  }

  const filteredBrands = brandOptions.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    if (category !== "All") {
      filtered = filtered.filter((product) => product.category === category)
    }

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
    category,
  ])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedProducts.slice(startIndex, endIndex)
  }, [filteredAndSortedProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSizes, selectedColors, selectedCategories, selectedBrands, priceRanges, minPrice, maxPrice, sortBy])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFilterSectionToggle = (section: string) => {
    setExpandedFilterSection(expandedFilterSection === section ? null : section)
  }

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
          <Link
            href={`/${category.toLowerCase()}`}
            className="hover:text-black truncate"
          >
            {category}
          </Link>
          <span>›</span>
          <span className="text-black truncate">
            {category === "Men" || category === "Women"
              ? "T-Shirt"
              : category === "Kids"
                ? "Kids Wear"
                : category === "Home"
                  ? "Home Decor"
                  : category === "Accessories"
                    ? "All Accessories"
                    : "Products"}
          </span>
        </div>
      </div>
      <div className="md:hidden px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">{category === "All" ? "All Products" : category}</h1>
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
      <div className="flex">
        <div className="hidden md:block w-64 border-r border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold">Filters</h2>

          {/* Size Filter */}
          <div>
            <h3 className="font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeFilter(size)}
                  className={`px-3 py-1 border text-sm transition-colors ${selectedSizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:border-black"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Color
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorFilter(color.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.name)
                      ? "border-black scale-110"
                      : "border-gray-300 hover:border-gray-400"
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Category
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label key={category.name} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryFilter(category.name)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Price
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-3">
              <div className="flex space-x-2 flex-col">
                <input
                  type="text"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="space-y-2">
                {priceRangeOptions.map((range) => (
                  <label key={range} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceRanges.includes(range)}
                      onChange={() => handlePriceRangeFilter(range)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Brand
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filteredBrands.map((brand) => (
                  <label key={brand.name} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => handleBrandFilter(brand.name)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{brand.name}</span>
                    <span className="text-xs text-gray-500">({brand.count})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 bg-white z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <button onClick={() => setShowMobileFilters(false)} className="mr-3">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Product Search */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("product")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Product</span>
                  </button>
                  {expandedFilterSection === "product" && (
                    <div className="px-4 pb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search Product..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("brand")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Brand</span>
                  </button>
                  {expandedFilterSection === "brand" && (
                    <div className="px-4 pb-4 space-y-3">
                      {filteredBrands.map((brand) => (
                        <label key={brand.name} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => handleBrandFilter(brand.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("size")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Size</span>
                  </button>
                  {expandedFilterSection === "size" && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {["S", "M", "L", "XL"].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeFilter(size)}
                            className={`px-4 py-2 border text-sm rounded transition-colors min-w-[48px] ${selectedSizes.includes(size)
                                ? "bg-black text-white border-black"
                                : "border-gray-300 hover:border-black"
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("color")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Color</span>
                  </button>
                  {expandedFilterSection === "color" && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => handleColorFilter(color.name)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColors.includes(color.name)
                                ? "border-black scale-110"
                                : "border-gray-300 hover:border-gray-400"
                              }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("category")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Category</span>
                  </button>
                  {expandedFilterSection === "category" && (
                    <div className="px-4 pb-4 space-y-3">
                      {categoryOptions.map((category) => (
                        <label key={category.name} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => handleCategoryFilter(category.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("price")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Price</span>
                  </button>
                  {expandedFilterSection === "price" && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Minimum"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Maximum"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        {priceRangeOptions.map((range) => (
                          <label key={range} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={priceRanges.includes(range)}
                              onChange={() => handlePriceRangeFilter(range)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{range}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section with Product Count and Done Button */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{filteredAndSortedProducts.length} Product Found</span>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <span>Done</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-3 md:p-6">
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
              >
                <option>Sort: Newest</option>
                <option>Sort: Price Low to High</option>
                <option>Sort: Price High to Low</option>
                <option>Sort: Most Popular</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{filteredAndSortedProducts.length} items</span>
              {totalPages > 1 && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">API connection issue: {error}. Showing sample data.</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer" onClick={() => router.push(`/productdetail/${product.id}`)}>
                <div className="relative mb-2 md:mb-3">
                  {product.badge && (
                    <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-orange-500 text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded z-10">
                      {product.badge}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWishlistToggle(product)
                    }}
                    disabled={addingToWishlist === product.id}
                    className={`absolute top-1 md:top-2 right-1 md:right-2 p-1 md:p-1.5 rounded-full transition-colors z-10 ${wishlistItems.has(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                  >
                    <Heart
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill={wishlistItems.has(product.id) ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="aspect-[4/5] bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={product.image[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={375}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <h3 className="font-medium text-sm md:text-base line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-xs">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 hidden md:inline">({product.reviews})</span>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${product.stock > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                        }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="font-semibold text-base md:text-lg">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="text-sm text-red-500 font-medium">{product.discount}% OFF</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product)
                    }}
                    disabled={addingToCart === product.id || product.stock <= 0}
                    className={`w-full py-2 md:py-2.5 text-sm font-medium rounded transition-colors flex items-center hover:cursor-pointer justify-center space-x-2 ${product.stock <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-black disabled:opacity-50"
                      }`}
                  >
                    {addingToCart === product.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : addedToCart === product.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </>
                    ) : product.stock <= 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <span>+ Add To Cart</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 md:mt-12">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded transition-colors ${currentPage === pageNum ? "bg-black text-white" : "border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of{" "}
                {filteredAndSortedProducts.length} products
              </div>
            </div>
          )}

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
