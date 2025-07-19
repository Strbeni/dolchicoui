'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, Heart, Badge, Truck, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
// import MultiSelect from '@/components/ui/multi-select';
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
}

// const allSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetail() {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState('');
  // const [selected, setSelected] = useState<string[]>([]);
  // const [isLoading,] = useState(false);
  // const frameworks = [
  //   { label: "Next.js", value: "nextjs" },
  //   { label: "React", value: "react" },
  //   { label: "Vue.js", value: "vue" }
  // ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/single/${productId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.product);
          // Default size
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
            {/* <Image
              src={product.image?.[0] || '/placeholder.png'}
              alt={product.name}
              width={600}
              height={600}
              className="rounded object-cover"
            /> */}
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
                  className="rounded border object-cover"
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-gray-500 uppercase">{product.subCategory}</p>
            <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>
            <p className="text-xl font-bold text-red-600 mt-1">INR {product.price}</p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              {product.description || 'No description available.'}
            </p>

            {/* Sizes */}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-1 border text-sm ${size === selectedSize
                    ? 'bg-black text-white'
                    : 'border-gray-300'
                    }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>


            {/* Quantity + Add to Cart */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border px-2 py-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </button>
                <span className="px-4">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <Button className="bg-[#c2552d] hover:bg-[#a8441d] text-white rounded-none px-8 flex items-center gap-2">
                ADD TO CART <ShoppingCart size={18} />
              </Button>
              <button className="border p-2 rounded-full hover:bg-gray-100">
                <Heart size={20} />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 space-y-2 text-sm border-t pt-4">
              <div className="flex gap-2 items-center">
                <Truck size={30} />
                <span>
                  <strong>Free Delivery</strong> &nbsp;
                  <a href="#" className="underline text-blue-600 text-xs">
                    Enter your postal code
                  </a>
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <RefreshCw size={30} />
                <span>
                  <strong>Return Delivery</strong> &nbsp;
                  <span className="text-xs text-gray-600">Free 30 Days Delivery Returns.</span> &nbsp;
                  <a href="#" className="underline text-blue-600 text-xs">Details</a>
                </span>
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
              className={`pb-2 ${activeTab === tab ? 'border-b-2 border-black font-semibold text-black' : ''}`}
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
                <p>Blue washed jacket, has a spread collar, 4 pockets, button closure, long sleeves, straight hem</p>
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
                  <li>Brand: FameFash</li>
                  <li>Gender: Men</li>
                  <li>Occasion: Casual</li>
                  <li>Fit: Regular Fit</li>
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

      {/* You can keep this section as-is */}
      <section className="px-6 lg:px-20 py-10">
        <h2 className="text-3xl font-semibold text-start mb-6">THE BEST DRESS FOR THE BEST WOMAN</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((id) => (
            <Link key={id} href={`/productdetail/${id}`}>
              <Card className="relative p-2">
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
