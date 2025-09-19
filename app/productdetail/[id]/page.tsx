"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Share2,
  Search,
  Plus,
  Minus,
  Star,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Filter,
  ShoppingCart,
  ThumbsUp,
  MessageCircle,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Zoom from "react-medium-image-zoom"
import "react-medium-image-zoom/dist/styles.css"
import { useNavbarCounts } from "@/contexts/NavbarCountsContext"
import { useLoading } from "@/contexts/LoadingContext"
import ShareButton from "@/components/ShareButton"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  images: string[]
  colors: string[]
  sizes: string[]
  stock: number
  description: string
  specifications: Record<string, string>
  inStock: boolean
}

interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
  avatar?: string
  helpful: number
  likes?: number
}

const breadcrumbs = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: `/products/${123}`, label: "Product Name" },
]

export default function ProductDetailPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [wishlistSuccess, setWishlistSuccess] = useState(false)
  const [deliveryEta, setDeliveryEta] = useState<any>(null)
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await fetch(`${API_BASE}/api/product/${params.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err)
    } finally {
      setReviewsLoading(false)
    }
  }
  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/product/single/${params.id}`)
      if (!response.ok) throw new Error("Product not found")
      const data = await response.json()
      setProduct(data.product)
      if (data.product.colors && data.product.colors.length > 0) {
        setSelectedColor(data.product.colors[0])
      }
      if (data.product.sizes && data.product.sizes.length > 0) {
        setSelectedSize(data.product.sizes[0])
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product")
    } finally {
      setLoading(false)
    }
  }
  const params = useParams()
  const router = useRouter()

  const { refreshCartCount } = useNavbarCounts()
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading()

  const [product, setProduct] = useState<Product | null>(null)
  const getImagesArray = (prod: any) => {
    if (prod?.images && Array.isArray(prod.images) && prod.images.length > 0) return prod.images
    if (prod?.image && Array.isArray(prod.image) && prod.image.length > 0) return prod.image
    if (prod?.image && typeof prod.image === "string") return [prod.image]
    return []
  }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [pinCode, setPinCode] = useState("")
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const [deliveryError, setDeliveryError] = useState<string>("")

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [menProducts, setMenProducts] = useState<Product[]>([])
  const [womenProducts, setWomenProducts] = useState<Product[]>([])

  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({})

  const handleProductWishlistToggle = async (productId: string) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    const isWishlisted = (wishlistMap as Record<string, any>)[productId]
    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/api/user/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await fetch(`${API_BASE}/api/user/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        })
      }
      setWishlistMap((prev) => ({ ...prev, [productId]: !isWishlisted }))
    } catch (error) {
      alert("Wishlist action failed")
    }
  }

  const [addingToCart, setAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)
  const [isInWishlistState, setIsInWishlistState] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [removingFromWishlist, setRemovingFromWishlist] = useState(false)

  function getRandomItems(arr: any[], count: number) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const fetchCategoryProducts = async () => {
    try {
      setRelatedLoading(true)
      const response = await fetch(`${API_BASE}/api/product/list`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      const allProducts = Array.isArray(data.products) ? data.products : []
      const men = allProducts.filter((p: any) => p.category?.toLowerCase() === "men")
      const women = allProducts.filter((p: any) => p.category?.toLowerCase() === "women")
      setMenProducts(getRandomItems(men, 4))
      setWomenProducts(getRandomItems(women, 4))
      setRelatedProducts(getRandomItems(allProducts, 8))
    } catch (err) {
      setRelatedProducts([])
      setMenProducts([])
      setWomenProducts([])
    } finally {
      setRelatedLoading(false)
    }
  }

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token || !product) return
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist/check/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok && data.success) {
          setIsInWishlistState(data.data.isInWishlist || false)
          setIsWishlisted(data.data.isInWishlist || false)
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error)
      }
    }
    if (product) checkWishlistStatus()
  }, [product])

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    fetchCategoryProducts()
  }, [params.id])

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(0)
    }
  }, [product?.images])

  const handleAddToCart = async () => {
    if (!product || addingToCart) return
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    if (!selectedSize) {
      alert("Please select a size")
      return
    }
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`)
      return
    }
    setAddingToCart(true)
    setCartSuccess(false)
    setLoadingMessage("Adding to cart...")
    setGlobalLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, quantity, size: selectedSize }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to add to cart")
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 2000)
      refreshCartCount()
    } catch (error) {
      console.error("Failed to add to cart:", error)
      alert(error instanceof Error ? error.message : "Failed to add to cart")
    } finally {
      setAddingToCart(false)
      setGlobalLoading(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!product) return
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    if (isInWishlistState) {
      setRemovingFromWishlist(true)
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Failed to remove from wishlist")
        setIsInWishlistState(false)
        setIsWishlisted(false)
        setWishlistSuccess(true)
        setTimeout(() => setWishlistSuccess(false), 2000)
      } catch (error) {
        console.error("Failed to remove from wishlist:", error)
        alert(error instanceof Error ? error.message : "Failed to remove from wishlist")
      } finally {
        setRemovingFromWishlist(false)
      }
    } else {
      setAddingToWishlist(true)
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Failed to add to wishlist")
        setIsInWishlistState(true)
        setIsWishlisted(true)
        setWishlistSuccess(true)
        setTimeout(() => setWishlistSuccess(false), 2000)
      } catch (error) {
        console.error("Failed to add to wishlist:", error)
        alert(error instanceof Error ? error.message : "Failed to add to wishlist")
      } finally {
        setAddingToWishlist(false)
      }
    }
  }

  const handleCheckout = () => {
    if (!selectedSize) {
      alert("Please select a size")
      return
    }
    handleAddToCart()
    router.push("/cartpage")
  }

  const checkPinCode = async () => {
    if (!pinCode) {
      setDeliveryError("Please enter PIN code")
      setDeliveryEta(null)
      return
    }
    if (pinCode.length !== 6) {
      setDeliveryError("Please enter a valid 6-digit PIN code")
      setDeliveryEta(null)
      return
    }
    setCheckingDelivery(true)
    setDeliveryError("")
    setDeliveryInfo(null)
    setDeliveryEta(null)
    try {
      const apiUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pinCode}&weight=0.5&cod=1`
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjc5MTY2OTEsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzU4OTYyNjY0LCJqdGkiOiJubDFnVXZUZXNEZ0h6QWg1IiwiaWF0IjoxNzU4MDk4NjY0LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTc1ODA5ODY2NCwiY2lkIjo3Njc2MjU5LCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.cx7SYrEdS49X1i1mEVtpHCQs1LlVUrRplZU9ARIbpms`,
        },
      }).then(res => res.json()).then(data => {
        if (data.status === 200 && data.data && data.data.available_courier_companies && data.data.available_courier_companies.length > 0) {
          const estimatedDays = data.data.available_courier_companies[0].estimated_delivery_days
          setDeliveryEta(estimatedDays)
          setDeliveryInfo(data.data)
        } else {
          setDeliveryError("Delivery not available for this PIN code")
          setDeliveryEta(null)
        }
      })
    } catch (error) {
      console.error("Error checking delivery:", error)
      setDeliveryError("Unable to check delivery. Please try again later.")
      setDeliveryEta(null)
    } finally {
      setCheckingDelivery(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Product not found"}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
        <div className="px-4 md:px-6 lg:px-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                <Zoom>
                  {(() => {
                    const imagesArr = getImagesArray(product)
                    let imgSrc = imagesArr.length > 0 && selectedImage < imagesArr.length
                      ? imagesArr[selectedImage]
                      : null
                    if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("/")) imgSrc = `/${imgSrc}`
                    if (!imgSrc) imgSrc = "/placeholder.png"
                    return imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={product?.name || "Product"}
                        width={600}
                        height={600}
                        className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                        priority
                        onError={(e) => { e.currentTarget.src = "/placeholder.png" }}
                      />
                    ) : null
                  })()}
                </Zoom>
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                    <ShareButton />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={addingToWishlist || removingFromWishlist}
                    className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    {addingToWishlist || removingFromWishlist ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart size={20} className={isWishlisted ? "text-red-500 fill-current" : "text-gray-600"} />
                    )}
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                    <Search size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                    <Plus size={20} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  disabled={selectedImage === 0}
                >
                  <span className="text-gray-600">{"<"}</span>
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => Math.min((product?.images?.length || 1) - 1, prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  disabled={selectedImage >= (product?.images?.length || 1) - 1}
                >
                  <span className="text-gray-600">{">"}</span>
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(() => {
                  const imagesArr = getImagesArray(product)
                  return imagesArr.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img.startsWith("http") ? img : img.startsWith("/") ? img : `/${img}`}
                        alt={`Thumbnail ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                })()}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">{product.brand}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Out of Stock
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="font-medium">{product.rating || 4.5}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Color: {selectedColor}</p>
                <div className="flex gap-2">
                  {product.colors?.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${
                        selectedColor === color ? "ring-2 ring-gray-800 ring-offset-2" : ""
                      }`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 text-sm font-medium border rounded transition-colors ${
                        selectedSize === size
                          ? "border-gray-800 bg-gray-800 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0 || !selectedSize || quantity > product.stock}
                    className={`flex-1 py-3 rounded-none font-medium transition-colors ${
                      cartSuccess
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    }`}
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Adding...
                      </>
                    ) : cartSuccess ? (
                      <>✓ Added to Cart</>
                    ) : product.stock === 0 ? (
                      <>Out of Stock</>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Add To Cart
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={!selectedSize || product.stock === 0 || quantity > product.stock}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-none font-medium"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Checkout Now"}
                  </Button>
                </div>
              </div>
              {cartSuccess && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  <ShoppingCart size={16} className="text-green-600" />
                  Item added to cart successfully!
                </div>
              )}
              {wishlistSuccess && (
                <div className="mt-2 text-sm text-pink-600 flex items-center gap-2">
                  <Heart size={16} fill="currentColor" />
                  {isInWishlistState ? "Added to wishlist!" : "Removed from wishlist!"}
                </div>
              )}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  Delivery Options
                  <Truck size={18} className="text-gray-600" />
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <input
                      type="text"
                      placeholder="Enter your PIN code"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded flex-1"
                      maxLength={6}
                    />
                    <Button
                      variant="outline"
                      onClick={checkPinCode}
                      disabled={checkingDelivery}
                      className="px-4 py-2 text-orange-600 border-orange-600 hover:bg-orange-50 bg-transparent"
                    >
                      {checkingDelivery ? "Checking..." : "Check ✓"}
                    </Button>
                  </div>
                  {deliveryError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{deliveryError}</p>
                    </div>
                  )}
                  {deliveryEta ? (
                    <p className="text-sm text-green-600 font-medium">
                      This product will arrive in {deliveryEta} days
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Please enter PIN code to check delivery time & pay on Delivery Availability
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      100% Original Products
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Pay on delivery might be available
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Easy 14 days returns and exchanges
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ... rest of the component (related products, reviews, etc.) ... */}
        </div>
      </div>
    </div>
  )
}