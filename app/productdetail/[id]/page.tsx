'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, Heart, Badge, Truck, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  stock: number;
}

// API Helper functions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [removingFromWishlist, setRemovingFromWishlist] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/product/single/${productId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.product);
          // Set default size to first available size
          if (data.product?.sizes?.length > 0) {
            setSelectedSize(data.product.sizes[0]);
          }
        } else {
          throw new Error('Invalid response');
        }
      } catch {
        setError('Product not found');
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Check if item is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !product) return;

      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist/check/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setIsInWishlistState(data.data.isInWishlist || false);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [product]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || addingToCart) return; // Prevent multiple calls

    // Check authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Validate size selection
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Validate quantity
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    setAddingToCart(true);
    setCartSuccess(false);
    
    try {
      // Make direct API call to backend
      const response = await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          size: selectedSize
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      // Show success state without popup
      setCartSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCartSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle (add/remove)
  const handleWishlistToggle = async () => {
    if (!product) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isInWishlistState) {
      // Remove from wishlist
      setRemovingFromWishlist(true);
      
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to remove from wishlist');
        }

        setIsInWishlistState(false);
        setWishlistSuccess(true);
        
        // Show success message briefly
        setTimeout(() => {
          setWishlistSuccess(false);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        alert(error instanceof Error ? error.message : 'Failed to remove from wishlist');
      } finally {
        setRemovingFromWishlist(false);
      }
    } else {
      // Add to wishlist
      setAddingToWishlist(true);
      
      try {
        const response = await fetch(`${API_BASE}/api/user/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to add to wishlist');
        }

        setIsInWishlistState(true);
        setWishlistSuccess(true);
        
        // Show success message briefly
        setTimeout(() => {
          setWishlistSuccess(false);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        alert(error instanceof Error ? error.message : 'Failed to add to wishlist');
      } finally {
        setAddingToWishlist(false);
      }
    }
  };

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Loading product details...</div>;
  }

  return (
    <>
      <div className="px-6 lg:px-20 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <Zoom>
              <Image
                src={product.image?.[0] || '/placeholder.png'}
                alt={product.name}
                width={600}
                height={600}
                className="rounded object-cover"
              />
            </Zoom>

            <div className="flex gap-2 mt-4">
              {product.image?.slice(0, 4).map((src, idx) => (
                <Image
                  key={idx}
                  src={src}
                  alt={`Thumb ${idx}`}
                  width={80}
                  height={80}
                  className="rounded border object-cover cursor-pointer hover:opacity-80"
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-gray-500 uppercase">{product.subCategory}</p>
            <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>
            <p className="text-xl font-bold text-red-600 mt-1">INR {product.price.toLocaleString()}</p>
            
            {/* Stock indicator */}
            <div className="mt-2">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600">✓ In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-sm text-red-600">✗ Out of Stock</p>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              {product.description || 'No description available.'}
            </p>

            {/* Sizes */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Size:</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      size === selectedSize
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart + Wishlist */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  disabled={addingToCart}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  disabled={addingToCart || quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button 
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0 || !selectedSize}
                className={`rounded-none px-8 flex items-center gap-2 disabled:opacity-50 transition-colors ${
                  cartSuccess 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-[#c2552d] hover:bg-[#a8441d] text-white'
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ADDING...
                  </>
                ) : cartSuccess ? (
                  <>
                    ✓ ADDED TO CART
                  </>
                ) : (
                  <>
                    ADD TO CART <ShoppingCart size={18} />
                  </>
                )}
              </Button>

              <button 
                onClick={handleWishlistToggle}
                disabled={addingToWishlist || removingFromWishlist}
                className={`border p-2 rounded-full transition-colors ${
                  isInWishlistState 
                    ? 'bg-pink-100 border-pink-300 text-pink-600 hover:bg-pink-200' 
                    : 'hover:bg-gray-100 border-gray-300 hover:border-pink-300'
                }`}
                title={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {(addingToWishlist || removingFromWishlist) ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart 
                    size={20} 
                    fill={isInWishlistState ? 'currentColor' : 'none'}
                    className={isInWishlistState ? 'text-pink-600' : 'hover:text-pink-600'}
                  />
                )}
              </button>
            </div>

            {/* Success messages */}
            {cartSuccess && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                ✓ Item added to cart successfully!
              </div>
            )}
            
            {wishlistSuccess && (
              <div className="mt-2 text-sm text-pink-600 flex items-center gap-2">
                <Heart size={16} fill="currentColor" />
                {isInWishlistState ? 'Added to wishlist!' : 'Removed from wishlist!'}
              </div>
            )}

            {/* Delivery Info */}
            <div className="mt-6 space-y-3 text-sm border-t pt-4">
              <div className="flex gap-3 items-start">
                <Truck size={20} className="text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-gray-600 text-xs">
                    <a href="#" className="underline text-blue-600">
                      Enter your postal code for delivery date
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <RefreshCw size={20} className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Return Delivery</p>
                  <p className="text-gray-600 text-xs">
                    Free 30 Days Delivery Returns. {' '}
                    <a href="#" className="underline text-blue-600">Details</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mt-10 flex gap-10 text-sm text-gray-600 uppercase tracking-wide">
          {['details', 'spec', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-colors ${
                activeTab === tab 
                  ? 'border-b-2 border-black font-semibold text-black' 
                  : 'hover:text-gray-800'
              }`}
            >
              {tab === 'details' ? 'Product Details' : tab === 'spec' ? 'Specification' : 'Ratings & Reviews'}
            </button>
          ))}
        </div>

        <div className="mt-6 text-sm space-y-4">
          {activeTab === 'details' && (
            <>
              <div>
                <h3 className="font-semibold">Product Details</h3>
                <p>{product.description || 'Blue washed jacket, has a spread collar, 4 pockets, button closure, long sleeves, straight hem'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Size & Fit</h3>
                <p>The model (height 5&apos;8&quot;) is wearing a size M</p>
              </div>
              <div>
                <h3 className="font-semibold">Material & Care</h3>
                <p>100% cotton<br />Machine Wash</p>
              </div>
            </>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">General</h3>
                <ul className="list-disc ml-5 text-gray-700">
                  <li>Category: {product.category}</li>
                  <li>Sub Category: {product.subCategory}</li>
                  <li>Available Sizes: {product.sizes.join(', ')}</li>
                  <li>Stock: {product.stock} units</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="font-semibold">Ratings & Reviews</h3>
              <div className="space-y-4 mt-2">
                <div className="border p-4 rounded">
                  <p className="font-medium">John D.</p>
                  <p className="text-yellow-500">★★★★☆</p>
                  <p className="text-gray-600 mt-1">Great quality and fits perfectly. Highly recommend!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <section className="px-6 lg:px-20 py-10">
        <h2 className="text-3xl font-semibold text-start mb-6">YOU MIGHT ALSO LIKE</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((id) => (
            <Link key={id} href={`/productdetail/${id}`}>
              <Card className="relative p-2 hover:shadow-lg transition-shadow">
                <Image
                  src={`/h${id}.svg`}
                  alt={`Product ${id}`}
                  width={300}
                  height={400}
                  className="w-full h-120 object-cover"
                />
                <Badge className="absolute top-2 right-2 rounded-full px-4 py-2 bg-[#844416] text-white text-xs">
                  ⭐ 4.8
                </Badge>
                <CardContent className="mt-2">
                  <p className="text-xs text-gray-500">PRODUCT CATEGORY</p>
                  <p className="text-sm font-medium">Product Name {id}</p>
                  <p className="text-sm text-gray-700">IDR XXX</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 pt-10 flex justify-start">
          <Link href="/productlist">
            <Button className="bg-[#844416] hover:bg-[#6e3612] text-white text-lg gap-2">
              SEE MORE
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
