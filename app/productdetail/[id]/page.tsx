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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
  // Sync wishlist state for all products shown (related + popular)

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
  // Fetch product reviews by ID
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
  // Fetch product details by ID
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

  // Context for refreshing navbar counts
  const { refreshCartCount } = useNavbarCounts()

  // Global loading context
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading()

  // Product state
  const [product, setProduct] = useState<Product | null>(null)
  // For compatibility with product list API
  const getImagesArray = (prod: any) => {
    if (prod?.images && Array.isArray(prod.images) && prod.images.length > 0) return prod.images;
    if (prod?.image && Array.isArray(prod.image) && prod.image.length > 0) return prod.image;
    if (prod?.image && typeof prod.image === "string") return [prod.image];
    return [];
  }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [pinCode, setPinCode] = useState("")

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [menProducts, setMenProducts] = useState<Product[]>([])
  const [womenProducts, setWomenProducts] = useState<Product[]>([])

  // Wishlist state for related/popular products
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({})

  // Handle wishlist toggle for related/popular products
  const handleProductWishlistToggle = async (productId: string) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
  const isWishlisted = (wishlistMap as Record<string, any>)[productId];
    try {
      if (isWishlisted) {
        // Remove from wishlist
        await fetch(`${API_BASE}/api/user/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        // Add to wishlist
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

  // Action states
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)
  const [isInWishlistState, setIsInWishlistState] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [removingFromWishlist, setRemovingFromWishlist] = useState(false)
  // Utility to get random items from array
  function getRandomItems(arr: any[], count: number) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Fetch all products and filter by category
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    if (product) {
      checkWishlistStatus()
    }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          size: selectedSize,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart")
      }

      setCartSuccess(true)
      setTimeout(() => {
        setCartSuccess(false)
      }, 2000)
      
      // Refresh cart count in navbar
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to remove from wishlist")
        }

        setIsInWishlistState(false)
        setIsWishlisted(false)
        setWishlistSuccess(true)

        setTimeout(() => {
          setWishlistSuccess(false)
        }, 2000)
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to add to wishlist")
        }

        setIsInWishlistState(true)
        setIsWishlisted(true)
        setWishlistSuccess(true)

        setTimeout(() => {
          setWishlistSuccess(false)
        }, 2000)
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
    handleAddToCart();
    router.push("/cartpage")
  }

  const checkPinCode = () => {
    if (!pinCode) {
      alert("Please enter PIN code")
      return
    }
    alert("Delivery available in your area!")
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

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <div className="lg:hidden">
       

        {/* Product Title */}
        <div className="px-4 pb-4">
          <h1 className="text-lg font-medium">{product.name}</h1>
        </div>

        {/* Product Image */}
        <div className="relative bg-gray-100 aspect-square mx-4 mb-4">
          {(() => {
            const imagesArr = getImagesArray(product);
            let imgSrc = imagesArr.length > 0 && selectedImage < imagesArr.length
              ? imagesArr[selectedImage]
              : null;
            if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("/")) {
              imgSrc = `/${imgSrc}`;
            }
            if (!imgSrc) imgSrc = "/placeholder.png";
            return imgSrc ? (
              <Image
                src={imgSrc}
                alt={product?.name || "Product"}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            ) : null;
          })()}

          {/* Action Icons */}
          <div className="absolute right-3 top-3 flex flex-col gap-3">
            <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0 bg-white"
              onClick={handleWishlistToggle}
              disabled={addingToWishlist || removingFromWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-white">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Arrows */}
          {product?.images && product.images.length > 1 && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 p-0 bg-white"
                onClick={() =>
                  setSelectedImage((prev) => {
                    const maxIndex = (product?.images?.length || 1) - 1
                    return prev > 0 ? prev - 1 : maxIndex
                  })
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 p-0 bg-white"
                onClick={() =>
                  setSelectedImage((prev) => {
                    const maxIndex = (product?.images?.length || 1) - 1
                    return prev < maxIndex ? prev + 1 : 0
                  })
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Images */}
        {(() => {
          const imagesArr = getImagesArray(product);
          return imagesArr.length > 1 && (
            <div className="flex gap-2 px-4 mb-6 overflow-x-auto">
              {imagesArr.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImage === index ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={
                      image.startsWith("http")
                        ? image
                        : image.startsWith("/")
                          ? image
                          : `/${image}`
                    }
                    alt={product?.name || "Thumbnail"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          );
        })()}

        {/* Brand and Product Info */}
        <div className="px-4 mb-6">
          <div className="text-lg font-bold mb-2">{product.brand}</div>
          <h2 className="text-xl font-medium mb-3">{product.name}</h2>

          <div className="flex items-center gap-4 mb-4">
            {product.originalPrice && <span className="text-gray-500 line-through">₹{product.originalPrice}</span>}
            <span className="text-2xl font-bold">₹{product.price}</span>
            <span className="text-sm text-gray-600">{product.stock} Sold</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {typeof averageRating === "number" ? averageRating.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="text-green-600 bg-green-50">
            In Stock
          </Badge>
        </div>

        {/* Color Selection */}
        <div className="px-4 mb-6">
          <div className="text-sm text-gray-600 mb-3">Color: {selectedColor}</div>
          <div className="flex gap-2">
            {Array.isArray(product.colors) &&
              product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-8 rounded border-2 ${selectedColor === color ? "border-black" : "border-gray-200"}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="px-4 mb-6">
          <div className="text-sm text-gray-600 mb-3">Size: {selectedSize}</div>
          <div className="grid grid-cols-3 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 text-center border rounded ${
                  selectedSize === size ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5" />
            <span className="font-medium">Delivery Options</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter your PIN code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <Button onClick={checkPinCode} className="bg-orange-500 hover:bg-orange-600">
              Check ✓
            </Button>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>Please enter PIN code to check delivery time & pay on Delivery Availability</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100 % Original Products</span>
            </div>
            <p>Pay on delivery might be available</p>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span>Easy 14 days returns and exchanges</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-6 space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart || !selectedSize}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addingToCart ? "Adding..." : "Add To Cart"}
          </Button>

          <Button
            onClick={handleCheckout}
            disabled={!selectedSize}
            variant="outline"
            className="w-full py-3 bg-transparent"
          >
            Checkout Now
          </Button>

          {cartSuccess && <div className="text-green-600 text-sm text-center">✓ Added to cart successfully!</div>}
        </div>

        {/* Product Details */}
        <div className="px-4 pb-6">
          <h3 className="text-lg font-medium mb-4">Product Details</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.specifications &&
              typeof product.specifications === "object" &&
              Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <div className="font-medium text-gray-900 mb-1">{key}</div>
                  <div className="text-gray-600">{value}</div>
                </div>
              ))}
          </div>

          <div className="mt-4">
            <div className="font-medium text-gray-900 mb-2">Product Details</div>
            <p className="text-gray-600 text-sm">{product.description}</p>
          </div>
        </div>

        {/* Popular This Week */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Popular this week</h3>
            <button className="text-sm text-gray-600 underline">View All</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {relatedLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              : relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="border-0 shadow-none cursor-pointer"
                    onClick={() => router.push(`/productdetail/${relatedProduct.id}`)}
                  >
                    <div className="relative bg-gray-100 aspect-square rounded mb-3">
                      <img
                        src={relatedProduct.images?.[0] || "/placeholder.svg?height=300&width=300"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductWishlistToggle(relatedProduct.id)
                        }}
                      >
                         <Heart className={`h-4 w-4 ${wishlistMap[relatedProduct.id] ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">{relatedProduct.name}</h4>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(relatedProduct.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {relatedProduct.rating || 0} ({relatedProduct.reviewCount || 0}{" "}
                          Reviews)
                        </span>
                        <Badge variant="secondary" className="text-xs text-green-600 bg-green-50">
                          {relatedProduct.stock || "In Stock"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{relatedProduct.price}</span>
                        {relatedProduct.originalPrice && (
                          <>
                            <span className="text-xs text-gray-500 line-through">₹{relatedProduct.originalPrice}</span>
                            <span className="text-xs text-orange-500 font-medium">{relatedProduct.discount}% OFF</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
          </div>
        </div>

        {/* Product Reviews */}
        <div className="px-4 pb-6">
          <h3 className="text-lg font-medium mb-4">Product Reviews</h3>
          {/* ...existing code for reviews... */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#f97316"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(averageRating / 5) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {typeof averageRating === "number" ? averageRating.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">from {reviews.length} reviews</p>
              </div>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-3">{rating}.0</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Review Lists</div>
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={reviewFilter === "all" ? "default" : "outline"}
                onClick={() => setReviewFilter("all")}
              >
                All Reviews
              </Button>
              <Button
                size="sm"
                variant={reviewFilter === "photo" ? "default" : "outline"}
                onClick={() => setReviewFilter("photo")}
              >
                With Photo & Video
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              variant={reviewFilter === "description" ? "default" : "outline"}
              onClick={() => setReviewFilter("description")}
            >
              With Description
            </Button>
          </div>
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="text-center py-4">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No reviews yet</div>
            ) : (
              reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="font-medium mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500 mb-3">{review.date}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm font-medium">{review.user}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">👍</span>
                        <span className="text-sm">{review.helpful}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="p-1">
                        <span className="text-sm">💬</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Related Products Section for Mobile */}
          <div className="mt-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Related Products</h3>
              <button className="text-sm text-gray-600 underline">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {relatedLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                : relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <Card
                      key={relatedProduct.id}
                      className="border-0 shadow-none cursor-pointer"
                      onClick={() => router.push(`/productdetail/${relatedProduct.id}`)}
                    >
                      <div className="relative bg-gray-100 aspect-square rounded mb-3">
                        <img
                          src={relatedProduct.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductWishlistToggle(relatedProduct.id)
                          }}
                        >
                          <Heart className={`h-4 w-4 ${wishlistMap[relatedProduct.id] ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{relatedProduct.name}</h4>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(relatedProduct.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {relatedProduct.rating || 0} ({relatedProduct.reviewCount || 0} Reviews)
                          </span>
                          <Badge variant="secondary" className="text-xs text-green-600 bg-green-50">
                            {relatedProduct.stock || "In Stock"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{relatedProduct.price}</span>
                          {relatedProduct.originalPrice && (
                            <>
                              <span className="text-xs text-gray-500 line-through">₹{relatedProduct.originalPrice}</span>
                              <span className="text-xs text-orange-500 font-medium">{relatedProduct.discount}% OFF</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        
        <div className="px-4 md:px-6 lg:px-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                <Zoom>
                  {(() => {
                    const imagesArr = getImagesArray(product);
                    let imgSrc = imagesArr.length > 0 && selectedImage < imagesArr.length
                      ? imagesArr[selectedImage]
                      : null;
                    if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("/")) {
                      imgSrc = `/${imgSrc}`;
                    }
                    if (!imgSrc) imgSrc = "/placeholder.png";
                    return imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={product?.name || "Product"}
                        width={600}
                        height={600}
                        className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                        priority
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    ) : null;
                  })()}
                </Zoom>
                {/* Action buttons on image */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                    <Share2 size={20} className="text-gray-600" />
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
                {/* Navigation arrows */}
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

              {/* Thumbnail Images */}
              <div className="flex gap-2 overflow-x-auto">
                {(() => {
                  const imagesArr = getImagesArray(product);
                  return imagesArr.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={
                          img.startsWith("http")
                            ? img
                            : img.startsWith("/")
                              ? img
                              : `/${img}`
                        }
                        alt={`Thumbnail ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand and Title */}
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">{product.brand}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>

              {/* Price and Stock */}
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
                      In Stock
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

              {/* Color Selection */}
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

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Size: {selectedSize}</p>
                  <button className="text-sm text-blue-600 hover:underline">View Size Chart</button>
                </div>
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

              {/* Quantity and Actions */}
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
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0 || !selectedSize}
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
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Add To Cart
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-none font-medium"
                  >
                    Checkout Now
                  </Button>
                </div>
              </div>

              {/* Success Messages */}
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

              {/* Delivery Options */}
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
                      className="border border-gray-300 px-3 py-2 rounded flex-1"
                    />
                    <Button
                      variant="outline"
                      className="px-4 py-2 text-orange-600 border-orange-600 hover:bg-orange-50 bg-transparent"
                    >
                      Check ✓
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Please enter PIN code to check delivery time & pay on Delivery Availability
                  </p>
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

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Weave Pattern</h3>
                <p className="text-gray-600">Chambray</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fit</h3>
                <p className="text-gray-600">Regular Fit</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">Opaque</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sustainable</h3>
                <p className="text-gray-600">Regular</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Material & Care</h3>
                <p className="text-gray-600">
                  100% Cotton
                  <br />
                  Machine wash
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Size & Fit</h3>
                <p className="text-gray-600">
                  Fit: Regular Fit
                  <br />
                  The model (height 5'8") is wearing a size 40
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-[3/5] rounded-2xl mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                : relatedProducts.slice(0, 4).map((item) => (
                    <Card
                      key={`related-${item.id}`}
                      className="relative rounded-2xl shadow-lg border border-gray-100 p-0 cursor-pointer group hover:scale-[1.02] transition-transform"
                      onClick={() => router.push(`/productdetail/${item.id}`)}
                    >
                      <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden">
                        <Image
                          src={item.images?.[0] || "/placeholder.svg?height=300&width=400"}
                          alt={item.name}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                        <button
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductWishlistToggle(item.id)
                          }}
                        >
                          <Heart size={20} className={wishlistMap[item.id] ? "fill-red-500 text-red-500" : "text-gray-300"} />
                        </button>
                      </div>
                      <CardContent className="pt-3 pb-2 px-3">
                        <h4 className="font-semibold text-base mb-1 truncate">{item.name}</h4>
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{item.rating?.toFixed(1) || "0.0"}</span>
                          <span className="text-xs text-gray-500">({item.reviewCount || 0})</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">₹ {item.price}</span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-500 line-through">₹ {item.originalPrice}</span>
                          )}
                          {item.discount && (
                            <span className="text-xs text-orange-600 font-semibold">{item.discount}% OFF</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs px-2 py-1 rounded">
                            In Stock
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Product Reviews</h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Rating Overview and Filters */}
              <div className="lg:col-span-1 space-y-8">
                {/* Rating Overview */}
                <div className="text-center">
                  <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl font-bold">
                      {typeof averageRating === "number" ? averageRating.toFixed(1) : "4.5"}
                    </div>
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= Math.floor(averageRating || 4.5) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">from {reviews.length || 1250} reviews</p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-6">{rating}.0</span>
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>

                {/* Reviews Filter */}
                <div>
                  <h3 className="font-semibold mb-4">Reviews Filter</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center justify-between">
                        Rating
                        <ChevronDown size={16} />
                      </h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <label key={rating} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <span>{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center justify-between">
                        Brand
                        <ChevronDown size={16} />
                      </h4>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          Product Quality
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          Seller Services
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          Product Price
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          Shipment
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          Match with Description
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Review Lists */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Review Lists</h3>
                  <div className="flex gap-2 mb-6">
                    {["All Reviews", "With Photo & Video", "With Description"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setReviewFilter(filter)}
                        className={`px-4 py-2 text-sm border rounded transition-colors ${
                          reviewFilter === filter
                            ? "border-gray-800 bg-gray-800 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No reviews yet</div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-start gap-3">
                          <Image
                            src={review.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={review.user}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="font-medium mb-1">{review.comment}</p>
                            <p className="text-sm text-gray-600 mb-2">{review.user}</p>
                            <p className="text-xs text-gray-500 mb-3">{review.date}</p>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                                <ThumbsUp size={14} />
                                {review.likes || review.helpful || 0}
                              </button>
                              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                                <MessageCircle size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">1</button>
                    <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">2</button>
                    <span className="px-3 py-2">...</span>
                    <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">10</button>
                    <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">{">"}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular this week</h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-[3/5] rounded-2xl mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                : relatedProducts.slice(4, 8).map((item) => (
                    <Card
                      key={`popular-${item.id}`}
                      className="relative rounded-2xl shadow-lg border border-gray-100 p-0 cursor-pointer group hover:scale-[1.02] transition-transform"
                      onClick={() => router.push(`/productdetail/${item.id}`)}
                    >
                      <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden">
                        <Image
                          src={item.images?.[0] || "/placeholder.svg?height=300&width=400"}
                          alt={item.name}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                        <button
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductWishlistToggle(item.id)
                          }}
                        >
                          <Heart size={20} className={wishlistMap[item.id] ? "fill-red-500 text-red-500" : "text-gray-300"} />
                        </button>
                      </div>
                      <CardContent className="pt-3 pb-2 px-3">
                        <h4 className="font-semibold text-base mb-1 truncate">{item.name}</h4>
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{item.rating?.toFixed(1) || "0.0"}</span>
                          <span className="text-xs text-gray-500">({item.reviewCount || 0})</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">₹ {item.price}</span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-500 line-through">₹ {item.originalPrice}</span>
                          )}
                          {item.discount && (
                            <span className="text-xs text-orange-600 font-semibold">{item.discount}% OFF</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs px-2 py-1 rounded">
                            In Stock
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
