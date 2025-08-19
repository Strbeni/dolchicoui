"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, Grid3X3 } from "lucide-react"
import { useRouter } from "next/navigation"
import PromotionalBanner from "@/components/promotional-banner"

const topDeals = [
  { id: "deal-1", productId: 1, title: "Ethnic wears", image: "/w1.svg", badge: "New", discount: "50 - 30% OFF" },
  { id: "deal-2", productId: 2, title: "Casual Wear", image: "/w2.svg", badge: "Hot Deal", discount: "50 - 30% OFF" },
  { id: "deal-3", productId: 3, title: "Womens active", image: "/w3.svg", badge: "New", discount: "50 - 30% OFF" },
  { id: "deal-4", productId: 4, title: "Mens active", image: "/w4.svg", badge: "New", discount: "50 - 30% OFF" },
]

const categories = [
  { id: "cat-1", productId: 1, title: "T-shirts", image: "/h1.svg", badge: "New", discount: "50 - 30% OFF" },
  { id: "cat-2", productId: 2, title: "Shirts", image: "/h2.svg", badge: "Trending", discount: "60 - 70% OFF" },
  { id: "cat-3", productId: 3, title: "Jeans", image: "/h3.svg", badge: "Trending", discount: "50 - 30% OFF" },
  { id: "cat-4", productId: 4, title: "Trousers", image: "/h4.svg", badge: "New", discount: "50 - 30% OFF" },
  { id: "cat-5", productId: 1, title: "Sports Shoes", image: "/h1.svg", badge: "Hot Deal", discount: "60 - 70% OFF" },
  { id: "cat-6", productId: 2, title: "Sneakers", image: "/h2.svg", badge: "Hot Deal", discount: "60 - 70% OFF" },
  { id: "cat-7", productId: 3, title: "Track Pants", image: "/h3.svg", badge: "New", discount: "50 - 30% OFF" },
  { id: "cat-8", productId: 4, title: "Kurtas", image: "/h4.svg", badge: "Hot Deal", discount: "60 - 70% OFF" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState("Men")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPromoBanner, setShowPromoBanner] = useState(false)
  const router = useRouter()

  const navigationTabs = ["All", "Men", "Women", "Kids"]
  const categoryIcons = [
    {
      name: "Girls",
      icon: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=80&h=80&fit=crop&crop=face",
    },
    { name: "Boys", icon: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=80&h=80&fit=crop&crop=face" },
    {
      name: "Infant",
      icon: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=80&h=80&fit=crop&crop=face",
    },
    {
      name: "Teens",
      icon: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
    },
    {
      name: "Other",
      icon: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop&crop=face",
    },
  ]

  const heroSlides = [
    {
      image: "/casual.jpg?height=400&width=300",
      title: "New & Now",
      subtitle: "Discover fashion that reflects your values",
      buttonText: "Shop Now",
    },
    {
      image: "/formal-men.jpg?height=400&width=300",
      title: "Style your way",
      subtitle: "Discover fashion that reflects your values",
      buttonText: "Shop Now",
    },
    {
      image: "/product.jpg?height=400&width=300",
      title: "Trendy",
      subtitle: "Discover fashion that reflects your values",
      buttonText: "Shop Now",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [heroSlides.length])

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    // Navigate to respective pages based on tab selection
    switch (tab) {
      case "Men":
        router.push("/men")
        break
      case "Women":
        router.push("/women")
        break
      case "Kids":
        router.push("/kids")
        break
      case "All":
        router.push("/productlist")
        break
      default:
        break
    }
  }

  return (
    <div className="w-full">
      {/* Mobile-only navigation and hero section */}
      <div className="block sm:hidden">
        {/* Mobile Navigation Tabs */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex space-x-6">
            {navigationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-[#f05a2b] border-[#f05a2b]"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Grid3X3 className="w-5 h-5 text-gray-600" />
        </div>

        {/* Category Icons */}
        <div className="flex justify-between px-4 py-4 bg-gray-50">
          {categoryIcons.map((category) => (
            <Link key={category.name} href={`/${category.name.toLowerCase()}`}>
              <div className="flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                  <Image
                    src={category.icon || "/placeholder.svg"}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Product..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#f05a2b] focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Hero Section */}
        <div className="relative h-[400px] mx-4 rounded-2xl overflow-hidden">
          <Image src={heroSlides[currentSlide].image || "/placeholder.svg"} alt="Hero" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{heroSlides[currentSlide].title}</h1>
            <p className="text-sm mb-4 opacity-90">{heroSlides[currentSlide].subtitle}</p>
            <Button className="bg-[#f05a2b] hover:bg-[#de491a] text-white rounded-full px-6 py-3">
              {heroSlides[currentSlide].buttonText} →
            </Button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 py-4">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-[#f05a2b]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="hidden sm:block">
        {/* Hero */}
        <section className="px-6 lg:px-20 pt-10 pb-8">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Discover Fashion with Purpose
            </span>
          </div>
          <h1 className="text-center text-4xl md:text-6xl font-serif font-bold leading-tight max-w-5xl mx-auto">
            Focuses on comfort and lasting style
          </h1>
          <p className="text-center text-gray-600 mt-3 max-w-3xl mx-auto">
            Discover fashion that reflects your values and your style. Sustainably sourced, thoughtfully designed,
            endlessly stylish.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link href="/productlist">
              <Button className="rounded-full bg-[#f05a2b] hover:bg-[#de491a] text-white px-6 py-5">Shop Now →</Button>
            </Link>
            <Link href="/productlist">
              <Button variant="outline" className="rounded-full px-6 py-5 bg-transparent">
                Trendy Collections→
              </Button>
            </Link>
          </div>

          {/* Preview cards - desktop grid */}
          <div className="mt-10 grid grid-cols-3 gap-8">
            {["/product.jpg", "/w3.svg", "/w2.svg"].map((src, i) => (
              <div key={i} className="flex items-center justify-center">
                {i === 1 ? (
                  <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden bg-gray-100">
                    <Image src={src || "/placeholder.svg"} alt={`preview-${i}`} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 w-full max-w-[360px] h-[260px] md:h-[300px] mx-auto">
                    <Image src={src || "/placeholder.svg"} alt={`preview-${i}`} fill className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 text-center divide-x divide-gray-200 pt-6">
            <div className="px-3">
              <p className="text-2xl md:text-3xl font-semibold">30k+</p>
              <p className="text-xs text-gray-600">Happy Customers</p>
            </div>
            <div className="px-3">
              <p className="text-2xl md:text-3xl font-semibold">500+</p>
              <p className="text-xs text-gray-600">New Products</p>
            </div>
            <div className="px-3">
              <p className="text-2xl md:text-3xl font-semibold">50M+</p>
              <p className="text-xs text-gray-600">Followers</p>
            </div>
          </div>
        </section>
      </div>

      {/* Promotional banner modal */}
      <PromotionalBanner isOpen={showPromoBanner} onClose={() => setShowPromoBanner(false)} />

      {/* ₹300 OFF banner - overlay style like screenshot */}
      <section className="px-4 md:px-6 lg:px-20 mb-6">
        <div
          className="relative h-[260px] sm:h-[300px] md:h-[360px] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          onClick={() => setShowPromoBanner(true)}
        >
          <Image src="/casual.jpg" alt="Flat 300 OFF" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-5 sm:px-8 max-w-xl text-white">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight">
                Flat ₹300 OFF - on your first purchase
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-200">
                Discover fashion that reflects your value style. Sustainably sourced, thoughtfully designed, endlessly
                stylish.
              </p>
              <div className="mt-5">
                <Button className="w-full sm:w-auto rounded-full bg-[#f05a2b] hover:bg-[#de491a] text-white px-8 py-5 text-base">
                  Click for Offer Details →
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
            Click me!
          </div>
        </div>
      </section>

      {/* Collections mosaic */}
      <section className="px-6 lg:px-20 relative">
        <div className=" cursor-pointer hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 bg-[#ff6a1a] text-white px-3 py-2 rounded-l-md font-semibold tracking-wider [writing-mode:vertical-rl]" onClick={() => setShowPromoBanner(true)}>
          UPTO ₹300 OFF
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-[420px] rounded-2xl overflow-hidden">
            <Image src="/w1.svg" alt="Long Sleeve T-Shirt" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex items-end">
              <div>
                <p className="text-white/80 text-xs mb-1">Women&apos;s Collections</p>
                <h3 className="text-white text-xl md:text-2xl font-semibold">Long Sleeve T-Shirt</h3>
                <Link href="/productlist" className="inline-block mt-3">
                  <span className="text-white text-xs underline">Explore Now →</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-[200px] rounded-2xl overflow-hidden">
              <Image src="/product.jpg" alt="Half Sleeve Shirt" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">Men&apos;s Collections</p>
                  <h4 className="text-white text-base font-semibold">Half Sleeve Shirt</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
            <div className="relative h-[200px] rounded-2xl overflow-hidden">
              <Image src="/w4.svg" alt="Polo T-Shirt" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">T-shirt Collections</p>
                  <h4 className="text-white text-base font-semibold">Polo T-Shirt</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
            <div className="relative h-[200px] md:h-[200px] col-span-2 rounded-2xl overflow-hidden">
              <Image src="/w3.svg" alt="Denim-Jacket" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">Denim Collections</p>
                  <h4 className="text-white text-lg font-semibold">Denim-Jacket</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand strip (logo grid on mobile) */}
      <section className="px-6 lg:px-20 mt-8">
        <div className="w-full rounded-xl bg-gray-100 px-4 py-3 grid grid-cols-3 gap-4 items-center justify-items-center sm:flex sm:justify-around">
          {["/adidas.svg", "/puma.svg", "/n.svg", "/gucci.svg", "/boss.svg"].map((src, idx) => (
            <div key={idx} className="h-6 opacity-70">
              <Image
                src={src || "/placeholder.svg"}
                alt={`brand-${idx}`}
                width={90}
                height={24}
                className="object-contain w-auto h-6"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Top Deals */}
      <section className="px-6 lg:px-20 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold">Top Deals</h3>
            <p className="text-sm text-gray-600">Effortless style, inspired by the future of fashion</p>
          </div>
          <Link href="/productlist">
            <Button variant="outline" className="rounded-full bg-transparent">
              See More →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topDeals.map((item) => {
            const accent = item.discount.includes("60")
            return (
              <Link key={item.id} href={`/productdetail/${item.productId}`}>
                <Card className="bg-transparent border-none shadow-none p-0">
                  <div className="relative h-60 md:h-64 lg:h-72 rounded-[18px] overflow-hidden bg-white">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    <div className="absolute top-3 left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                      {item.badge}
                    </div>
                  </div>
                  <CardContent className="px-1 pt-3 pb-0">
                    <p className="text-[13px] text-gray-700">{item.title}</p>
                    <p
                      className={`mt-1 text-[26px] leading-tight font-extrabold tracking-tight ${accent ? "text-[#ff5c39]" : "text-gray-900"}`}
                    >
                      {item.discount}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="px-6 lg:px-20 mt-10 mb-14">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold">Shop by Category</h3>
            <p className="text-sm text-gray-600">Style, inspired by the future of fashion</p>
          </div>
          <Link href="/productlist">
            <Button variant="outline" className="rounded-full bg-transparent">
              See More →
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((item) => {
            const accent = item.discount.includes("60")
            return (
              <Link key={item.id} href={`/productdetail/${item.productId}`}>
                <Card className="bg-transparent border-none shadow-none p-0">
                  <div className="relative h-60 md:h-64 lg:h-72 rounded-[18px] overflow-hidden bg-white">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    <div className="absolute top-3 left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                      {item.badge}
                    </div>
                  </div>
                  <CardContent className="px-1 pt-3 pb-0">
                    <p className="text-[13px] text-gray-700">{item.title}</p>
                    <p
                      className={`mt-1 text-[26px] leading-tight font-extrabold tracking-tight ${accent ? "text-[#ff5c39]" : "text-gray-900"}`}
                    >
                      {item.discount}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 py-8 bg-[#101820] text-white rounded-t-2xl mt-8">
        <h3 className="text-3xl font-serif mb-1">Why Choose Us</h3>
        <p className="text-xs text-gray-300 mb-4">Fashion You Can Feel Good About</p>
        <div className="space-y-3">
          {[
            {
              title: "Ethical Production",
              desc: "Our garments are made in fair-trade certified facilities for all involved.",
              icon: "/globe.svg",
            },
            {
              title: "Innovations",
              desc: "We're always seeking out new ways to improve our sustainability efforts.",
              icon: "/window.svg",
            },
            {
              title: "Quality You Can Trust",
              desc: "We take pride in producing high-quality, that stands the test of time.",
              icon: "/file.svg",
            },
            {
              title: "Sustainable Materials",
              desc: "We source eco-friendly fabrics, such as organic cotton and recycled.",
              icon: "/globe.svg",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white text-[#0f1520] rounded-xl p-4 flex gap-3 items-start">
              <Image src={f.icon || "/placeholder.svg"} alt={f.title} width={28} height={28} className="mt-1" />
              <div>
                <p className="font-semibold mb-1">{f.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
