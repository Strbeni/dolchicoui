"use client"
import { useCallback } from "react";
import { Heart, Menu, ShoppingCart, User } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "./search-bar"

/* -------------------------------------------------------------------------- */
/*  dummy data                                                                */
/* -------------------------------------------------------------------------- */
interface NavigationSection {
  title: string
  items: string[]
}

interface CartItem {
  id: number
  productId: number
  quantity: number
}

const accessories: NavigationSection[] = [
  {
    title: "Bags & Backpacks",
    items: ["Casual Bags", "Laptop Bags", "Travel Bags", "Backpacks", "Clutches & Handbags", "Wallets & Belts"],
  },
  {
    title: "Jewellery & Watches",
    items: [
      "Fashion Jewellery",
      "Fine Jewellery",
      "Earrings",
      "Smart Watches",
      "Analog Watches",
      "Digital Watches",
      "Fitness Bands",
    ],
  },
  {
    title: "Sunglasses & Frames",
    items: ["Sunglasses", "Eyeglasses", "Contact Lenses", "Eye Care"],
  },
  {
    title: "Fashion Accessories",
    items: [
      "Wallets",
      "Belts",
      "Perfumes & Body Mists",
      "Trimmers",
      "Deodorants",
      "Ties, Cufflinks & Pocket Squares",
      "Accessory Gift Sets",
      "Caps & Hats",
      "Mufflers, Scarves & Gloves",
      "Phone Cases",
      "Rings & Wrist wear",
      "Helmets",
    ],
  },
  {
    title: "Gadgets",
    items: ["Smart Wearables", "Fitness Gadgets", "Headphones", "Speakers"],
  },
]

const men: NavigationSection[] = [
  {
    title: "Topwear",
    items: [
      "T-Shirts",
      "Casual Shirts",
      "Formal Shirt",
      "Sweatshirts",
      "Sweaters",
      "Jackets",
      "Blazers & Coats",
      "Suits",
      "Rain Jackets",
    ],
  },
  {
    title: "Bottomwear",
    items: ["Jeans", "Casual Shirts", "Formal Shirt", "Shorts", "Track Pants & Joggers"],
  },
  {
    title: "Footwear",
    items: ["Casual Shoes", "Sport Shoes", "Formal Shoes", "Sneakers", "Sandals & Floaters", "Flip Flops", "Socks"],
  },
  {
    title: "Sport & Active Wear",
    items: [
      "Sport Shoes",
      "Sports Sandals",
      "Active T-Shirts",
      "Track Pants & Shorts",
      "Tracksuits",
      "Jackets & Sweatshirts",
      "Sports Accessories",
      "Swimwear",
    ],
  },
  {
    title: "Fashion Accessories",
    items: [
      "Wallets",
      "Belts",
      "Perfumes & Body Mists",
      "Trimmers",
      "Deodorants",
      "Ties, Cufflinks & Pocket Squares",
      "Accessory Gift Sets",
      "Caps & Hats",
      "Mufflers, Scarves & Gloves",
      "Phone Cases",
      "Rings & Wrist wear",
      "Helmets",
    ],
  },
  {
    title: "Innerwear & Sleepwear",
    items: ["Brief & Trunks", "Vests", "Sleepwear & Loungewear", "Thermals"],
  },
  {
    title: "Personal Care & Grooming",
    items: ["Shaving", "Beard Care", "Hair Care", "Skin Care", "Fragrances", "Oral Care", "Body Care", "Wellness"],
  },
  {
    title: "Sunglasses & Frames",
    items: ["Sunglasses", "Eyeglasses", "Contact Lenses", "Eye Care"],
  },
  {
    title: "Watches",
    items: ["Smart Watches", "Analog Watches", "Digital Watches", "Fitness Bands"],
  },
  {
    title: "Gadgets",
    items: ["Smart Wearables", "Fitness Gadgets", "Headphones", "Speakers"],
  },
  {
    title: "Indian & Festival Wear",
    items: ["Kurtas & Kurta Sets", "Sherwanis", "Nehru jackets", "Dhotis"],
  },
  {
    title: "Plus Size",
    items: ["Topwear", "Bottomwear", "Ethnic Wear", "Active Wear", "Innerwear & Sleepwear"],
  },
  {
    title: "Bags & Backpacks",
    items: ["Casual Bags", "Laptop Bags", "Travel Bags", "Backpacks", "Clutches & Handbags", "Wallets & Belts"],
  },
  {
    title: "Luggages & Trolleys",
    items: ["Luggage", "Trolleys", "Travel Accessories", "Gym Bags"],
  },
]

const women: NavigationSection[] = [
  {
    title: "Indian & Fusion Wear",
    items: [
      "Kurtas & Suits",
      "Kurtis, Tunics & Tops",
      "Sarees",
      "Ethnic Wear",
      "Leggings, Salwars & Churidars",
      "Skirts & Palazzos",
      "Dress Materials",
      "Lehenga Cholis",
      "Dupattas & Shawls",
      "Jackets",
      "Belts, Scarves & More",
    ],
  },
  {
    title: "Watches & Wearables",
    items: ["Smart Watches", "Analog Watches", "Digital Watches", "Fitness Bands"],
  },
  {
    title: "Western Wear",
    items: [
      "Dresses",
      "Tops",
      "Tshirts",
      "Jeans",
      "Trousers & Capris",
      "Shorts & Skirts",
      "Co-ords",
      "Playsuits",
      "Jumpsuits",
      "Shrugs",
      "Sweaters & Sweatshirts",
      "Jackets & Coats",
      "Blazers & Waistcoats",
    ],
  },
  {
    title: "Plus Size",
    items: ["Topwear", "Bottomwear", "Ethnic Wear", "Active Wear", "Innerwear & Sleepwear"],
  },
  {
    title: "Maternity",
    items: ["Dresses", "Tops", "Kurtas", "Bottomwear", "Sleepwear & Loungewear"],
  },
  {
    title: "Sunglasses & Frames",
    items: ["Sunglasses", "Eyeglasses", "Contact Lenses"],
  },
  {
    title: "Footwear",
    items: ["Flats", "Casual Shoes", "Heels", "Boots", "Sports Shoes & Floaters"],
  },
  {
    title: "Sports & Active Wear",
    items: ["Clothing", "Footwear", "Sports Accessories", "Sports Equipment"],
  },
  {
    title: "Lingerie & Sleepwear",
    items: ["Bra", "Briefs", "Shapewear", "Sleepwear & Loungewear", "Swimwear", "Camisoles & Thermals"],
  },
  {
    title: "Beauty & Personal Care",
    items: ["Makeup", "Skincare", "Premium Beauty", "Lipsticks", "Fragrances"],
  },
  {
    title: "Gadgets",
    items: ["Smart Wearables", "Fitness Gadgets", "Headphones", "Speakers"],
  },
  {
    title: "Jewellery",
    items: ["Fashion Jewellery", "Fine Jewellery", "Earrings"],
  },
  {
    title: "Bags & Backpacks",
    items: ["Backpacks", "Handbags, Bags & Wallets"],
  },
  {
    title: "Luggages & Trolleys",
    items: ["Luggages & Trolleys"],
  },
]

const kids: NavigationSection[] = [
  {
    title: "Boys Clothing",
    items: [
      "T-Shirts",
      "Shirts",
      "Shorts",
      "Jeans",
      "Trousers",
      "Clothing Sets",
      "Ethnic Wear",
      "Track Pants & Pyjamas",
      "Jacket, Sweater & Sweatshirts",
      "Party Wear",
      "Innerwear & Thermals",
      "Nightwear & Loungewear",
      "Value Packs",
    ],
  },
  {
    title: "Girls Clothing",
    items: [
      "Dresses",
      "Tops",
      "Tshirts",
      "Clothing Sets",
      "Lehenga choli",
      "Kurta Sets",
      "Party wear",
      "Dungarees & Jumpsuits",
      "Skirts & Shorts",
      "Tights & Leggings",
      "Jeans, Trousers & Capris",
      "Jacket, Sweater & Sweatshirts",
      "Innerwear & Thermals",
      "Nightwear & Loungewear",
      "Value Packs",
    ],
  },
  {
    title: "Footwear",
    items: ["Casual Shoes", "Flipflops", "Sports Shoes", "Flats", "Sandals", "Heels", "School Shoes", "Socks"],
  },
  {
    title: "Toys & Games",
    items: ["Learning & Development", "Activity Toys", "Soft Toys", "Action Figure / Play set"],
  },
  {
    title: "Infants",
    items: [
      "Bodysuits",
      "Rompers & Sleepsuits",
      "Clothing Sets",
      "Tshirts & Tops",
      "Dresses",
      "Bottom wear",
      "Winter Wear",
      "Innerwear & Sleepwear",
      "Infant Care",
      "Home & Bath",
      "Personal Care",
    ],
  },
  {
    title: "Kids Accessories",
    items: [
      "Bags & Backpacks",
      "Watches",
      "Jewellery & Hair accessory",
      "Sunglasses",
      "Masks & Protective Gears",
      "Caps & Hats",
    ],
  },
  {
    title: "Brands",
    items: [
      "H&M",
      "Max Kids",
      "Pantaloons",
      "United Colors Of Benetton Kids",
      "YK",
      "U.S. Polo Assn. Kids",
      "Mothercare",
      "HRX",
    ],
  },
]

const homes: NavigationSection[] = [
  {
    title: "Bed Linen & Furnishing",
    items: [
      "Bed Runners",
      "Mattress Protectors",
      "Bedsheets",
      "Bedding Sets",
      "Blankets, Quilts & Dohars",
      "Pillows & Pillow Covers",
      "Bed Covers",
      "Diwan Sets",
      "Chair Pads & Covers",
      "Sofa Covers",
    ],
  },
  {
    title: "Flooring",
    items: ["Floor Runners", "Carpets", "Floor Mats & Dhurries", "Door Mats"],
  },
  {
    title: "Bath",
    items: [
      "Bath Towels",
      "Hand & Face Towels",
      "Beach Towels",
      "Towels Set",
      "Bath Rugs",
      "Bath Robes",
      "Bathroom Accessories",
      "Shower Curtains",
    ],
  },
  {
    title: "Lamps & Lighting",
    items: ["Floor Lamps", "Ceiling Lamps", "Table Lamps", "Wall Lamps", "Outdoor Lamps", "String Lights"],
  },
  {
    title: "Home Décor",
    items: [
      "Plants & Planters",
      "Aromas & Candles",
      "Clocks",
      "Mirrors",
      "Wall Décor",
      "Festive Decor",
      "Pooja Essentials",
      "Wall Shelves",
      "Fountains",
      "Showpieces & Vases",
      "Ottoman",
      "Cushions & Cushion Covers",
      "Curtains",
    ],
  },
]

export const Navbar5 = () => {
  const router = useRouter()

  /* ----------------------- auth / menu state ------------------------------ */
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false)
  const desktopDropdownRef = useRef<HTMLDivElement | null>(null)
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  const mobileNavData = [
    { id: "men", label: "Men", data: men },
    { id: "women", label: "Women", data: women },
    { id: "kids", label: "Kids", data: kids },
    { id: "home", label: "Home", data: homes },
    { id: "accessories", label: "Accessories", data: accessories },
  ]

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

  const authHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const fetchWishlistCount = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlistCount(0)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/wishlist`, { headers: authHeaders() })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.wishlist)) {
        setWishlistCount(data.data.wishlist.length)
      }
    } catch (err) {
      console.error("Error fetching wishlist count:", err)
    }
  }, [isLoggedIn, API_BASE])

  const fetchCartCount = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(0)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, { headers: authHeaders() })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.items)) {
        // Calculate total quantity of all items in cart
        const totalQuantity = data.data.items.reduce((total: number, item: CartItem) => total + item.quantity, 0)
        setCartCount(totalQuantity)
      } else if (data.success && typeof data.data?.totalItems === "number") {
        setCartCount(data.data.totalItems)
      }
    } catch (err) {
      console.error("Error fetching cart count:", err)
    }
  }, [isLoggedIn, API_BASE])

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    const loggedIn = !!token
    setIsLoggedIn(loggedIn)

    if (loggedIn) {
      fetchWishlistCount()
      fetchCartCount()
    } else {
      setWishlistCount(0)
      setCartCount(0)
    }
  }, [fetchCartCount, fetchWishlistCount])

  useEffect(() => {
    if (!isLoggedIn) return

    const interval = setInterval(() => {
      fetchWishlistCount()
      fetchCartCount()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isLoggedIn, fetchCartCount, fetchWishlistCount])

  const handleLogout = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    setIsLoggedIn(false)
    setWishlistCount(0)
    setCartCount(0)
    setUserMenuOpen(false)
    router.push("/login")
  }

  /* close user dropdown when clicking outside - desktop */
  useEffect(() => {
    const handleClickOutsideDesktop = (e: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutsideDesktop)
    return () => document.removeEventListener("mousedown", handleClickOutsideDesktop)
  }, [])

  /* close user dropdown when clicking outside - mobile */
  useEffect(() => {
    const handleClickOutsideMobile = (e: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node))
        setMobileUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutsideMobile)
    return () => document.removeEventListener("mousedown", handleClickOutsideMobile)
  }, [])

  return (
    <section className="sticky md:border-b ">
      <div className="container px-4 lg:px-6">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Hidden on mobile, shown on desktop */}
          <Link href="/home" className="hidden lg:flex items-center gap-2 relative z-10">
            <span className="text-lg font-semibold tracking-tighter text-[#F3612A]">
              <svg width="92" height="30" viewBox="0 0 92 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.3504 16.3149L13.3912 5.04187C12.629 2.13841 10.0204 0.10241 7.01875 0.0683L1.86749 0.00976295C1.29709 0.00328112 0.665455 0.0456274 0.338511 0.513075C0.15227 0.779352 -5.26447e-05 1.17683 -6.10352e-05 1.76471C-6.97574e-05 2.37588 0.164562 2.78127 0.360788 3.04738C0.684271 3.48608 1.28397 3.52941 1.82903 3.52941H5.70276C7.51318 3.52941 9.09789 4.7454 9.56646 6.49413L12.2577 16.5378C13.4291 20.9096 17.3909 23.9496 21.9169 23.9496H29.6219C29.6219 23.9496 37.9413 23.9496 37.9413 14.874C37.9413 10.3884 36.2786 7.81183 34.5967 6.35302C32.6127 4.63216 29.8131 4.53781 27.1867 4.53781C22.2274 4.53781 18.601 9.21729 19.8387 14.0197L20.1692 15.3019C20.3911 16.163 21.1676 16.7647 22.0568 16.7647C23.3332 16.7647 24.2652 15.5584 23.943 14.3234L23.5485 12.8113C22.9224 10.4113 24.7335 8.06723 27.2138 8.06723H29.6219C29.6219 8.06723 34.2858 8.69748 34.2858 14.3697C34.2858 20.042 29.6219 20.2941 29.6219 20.2941H21.509C19.085 20.2941 16.9658 18.6595 16.3504 16.3149Z"
                  fill="#F3612A"
                />
                <ellipse cx="20.0421" cy="27.479" rx="2.52102" ry="2.52101" fill="#242D35" />
                <ellipse cx="29.8742" cy="27.479" rx="2.52102" ry="2.52101" fill="#242D35" />
                <path
                  d="M45.9504 10.4525C49.3991 10.4525 52.1954 13.248 52.1956 16.6966C52.1956 20.1453 49.3991 22.9417 45.9504 22.9417C42.5019 22.9416 39.7063 20.1452 39.7063 16.6966C39.7064 13.2481 42.502 10.4526 45.9504 10.4525ZM45.9504 12.9505C43.8815 12.9507 42.2045 14.6276 42.2043 16.6966C42.2043 18.7657 43.8814 20.4435 45.9504 20.4437C48.0197 20.4437 49.6975 18.7658 49.6975 16.6966C49.6973 14.6275 48.0196 12.9505 45.9504 12.9505Z"
                  fill="#F3612A"
                />
                <path
                  d="M68.8502 10.4525C70.8111 10.4528 72.56 11.3577 73.7047 12.7718C72.8941 13.0588 72.1992 13.59 71.7076 14.2767C71.0204 13.4657 69.9945 12.9507 68.8483 12.9505C66.7793 12.9507 65.1014 14.6276 65.1012 16.6966C65.1012 18.7657 66.7792 20.4435 68.8483 20.4437C69.9947 20.4435 71.0204 19.9279 71.7076 19.1165C72.1991 19.8033 72.8942 20.3333 73.7047 20.6204C72.5601 22.0352 70.8115 22.9414 68.8502 22.9417C65.4017 22.9415 62.6041 20.1452 62.6041 16.6966C62.6043 13.2481 65.4018 10.4527 68.8502 10.4525Z"
                  fill="#F3612A"
                />
                <path
                  d="M55.1933 10.8688H55.2325C55.9689 10.8688 56.5658 11.4658 56.5658 12.2021V18.2776C56.5658 19.014 57.1628 19.611 57.8992 19.611H60.937C61.6267 19.611 62.1858 20.1701 62.1858 20.8598C62.1858 21.5496 61.6267 22.1087 60.937 22.1087H55.1933C54.4569 22.1087 53.8599 21.5118 53.8599 20.7754V12.2021C53.8599 11.4658 54.4569 10.8688 55.1933 10.8688Z"
                  fill="#F3612A"
                />
                <path
                  d="M75.2991 20.7754V12.2021C75.2991 11.4658 75.8961 10.8688 76.6325 10.8688H76.6717C77.4081 10.8688 78.0051 11.4658 78.0051 12.2021V13.6984C78.0051 14.4348 78.602 15.0317 79.3384 15.0317H81.4591C82.1955 15.0317 82.7925 14.4348 82.7925 13.6984V12.2021C82.7925 11.4658 83.3894 10.8688 84.1258 10.8688H84.3732C85.1096 10.8688 85.7065 11.4657 85.7065 12.2021V20.7754C85.7065 21.5118 85.1096 22.1087 84.3732 22.1087H84.1258C83.3894 22.1087 82.7925 21.5118 82.7925 20.7754V18.8628C82.7925 18.1264 82.1955 17.5295 81.4591 17.5295H79.3384C78.602 17.5295 78.0051 18.1264 78.0051 18.8628V20.7754C78.0051 21.5118 77.4081 22.1087 76.6717 22.1087H76.6325C75.8961 22.1087 75.2991 21.5118 75.2991 20.7754Z"
                  fill="#F3612A"
                />
                <path
                  d="M88.2043 20.7754V12.2021C88.2043 11.4658 88.8013 10.8688 89.5376 10.8688H89.785C90.5214 10.8688 91.1184 11.4657 91.1184 12.2021V20.7754C91.1184 21.5118 90.5214 22.1087 89.785 22.1087H89.5376C88.8013 22.1087 88.2043 21.5118 88.2043 20.7754Z"
                  fill="#F3612A"
                />
              </svg>
            </span>
          </Link>

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Men */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  asChild
                  className="data-[state=open]:border-b-2 data-[state=open]:border-[#F3612A] text-[#242D35] hover:text-[#F3612A] text-sm font-semibold"
                >
                  <Link href="/men">MEN</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[1000px] bg-white">
                    <div className="flex flex-col">
                      {Array.from({ length: Math.ceil(men.length / 5) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 5
                        const rowSections = men.slice(startIdx, startIdx + 5)
                        return (
                          <div key={rowIndex} className={`flex px-8 py-4 ${rowIndex % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                            {rowSections.map((section) => (
                              <div key={section.title} className="w-1/5 pr-12 last:pr-0">
                                <Link
                                  href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                  className="block"
                                  legacyBehavior
                                >
                                  <p className="text-sm font-medium mb-1 text-[#F3612A] hover:text-[#1A1A1A] transition-colors duration-200">
                                    {section.title}
                                  </p>
                                </Link>
                                <ul className="mb-0">
                                  {section.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                        className="text-[#242D35] hover:text-[#1A1A1A] text-[13px] leading-5 block transition-colors duration-200"
                                        legacyBehavior
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Women */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  asChild
                  className="data-[state=open]:border-b-2 data-[state=open]:border-[#F3612A] text-[#242D35] hover:text-[#F3612A] text-sm font-semibold"
                >
                  <Link href="/women">WOMEN</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[1000px] bg-white">
                    <div className="flex flex-col">
                      {Array.from({ length: Math.ceil(women.length / 5) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 5
                        const rowSections = women.slice(startIdx, startIdx + 5)
                        return (
                          <div key={rowIndex} className={`flex px-8 py-4 ${rowIndex % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                            {rowSections.map((section) => (
                              <div key={section.title} className="w-1/5 pr-12 last:pr-0">
                                <Link
                                  href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                  className="block"
                                  legacyBehavior
                                >
                                  <p className="text-sm font-medium mb-1 text-[#F3612A] hover:text-[#1A1A1A] transition-colors duration-200">
                                    {section.title}
                                  </p>
                                </Link>
                                <ul className="mb-0">
                                  {section.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                        className="text-[#242D35] hover:text-[#1A1A1A] text-[13px] leading-5 block transition-colors duration-200"
                                        legacyBehavior
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Kids */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  asChild
                  className="data-[state=open]:border-b-2 data-[state=open]:border-[#F3612A] text-[#242D35] hover:text-[#F3612A] text-sm font-semibold"
                >
                  <Link href="/kids">KIDS</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[1000px] bg-white">
                    <div className="flex flex-col">
                      {Array.from({ length: Math.ceil(kids.length / 5) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 5
                        const rowSections = kids.slice(startIdx, startIdx + 5)
                        return (
                          <div key={rowIndex} className={`flex px-8 py-4 ${rowIndex % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                            {rowSections.map((section) => (
                              <div key={section.title} className="w-1/5 pr-12 last:pr-0">
                                <Link
                                  href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                  className="block"
                                  legacyBehavior
                                >
                                  <p className="text-sm font-medium mb-1 text-[#F3612A] hover:text-[#1A1A1A] transition-colors duration-200">
                                    {section.title}
                                  </p>
                                </Link>
                                <ul className="mb-0">
                                  {section.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                        className="text-[#242D35] hover:text-[#1A1A1A] text-[13px] leading-5 block transition-colors duration-200"
                                        legacyBehavior
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Accessories */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  asChild
                  className="data-[state=open]:border-b-2 data-[state=open]:border-[#F3612A] text-[#242D35] hover:text-[#F3612A] text-sm font-semibold"
                >
                  <Link href="/accessories">ACCESSORIES</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[1000px] bg-white">
                    <div className="flex flex-col">
                      {Array.from({ length: Math.ceil(accessories.length / 5) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 5
                        const rowSections = accessories.slice(startIdx, startIdx + 5)
                        return (
                          <div key={rowIndex} className={`flex px-8 py-4 ${rowIndex % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                            {rowSections.map((section) => (
                              <div key={section.title} className="w-1/5 pr-12 last:pr-0">
                                <Link
                                  href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                  className="block"
                                  legacyBehavior
                                >
                                  <p className="text-sm font-medium mb-1 text-[#F3612A] hover:text-[#1A1A1A] transition-colors duration-200">
                                    {section.title}
                                  </p>
                                </Link>
                                <ul className="mb-0">
                                  {section.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                        className="text-[#242D35] hover:text-[#1A1A1A] text-[13px] leading-5 block transition-colors duration-200"
                                        legacyBehavior
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  asChild
                  className="data-[state=open]:border-b-2 data-[state=open]:border-[#F3612A] text-[#242D35] hover:text-[#F3612A] text-sm font-semibold"
                >
                  <Link href="/home">HOME LIVING</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[1000px] bg-white">
                    <div className="flex flex-col">
                      {Array.from({ length: Math.ceil(homes.length / 5) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 5
                        const rowSections = homes.slice(startIdx, startIdx + 5)
                        return (
                          <div key={rowIndex} className={`flex px-8 py-4 ${rowIndex % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                            {rowSections.map((section) => (
                              <div key={section.title} className="w-1/5 pr-12 last:pr-0">
                                <Link
                                  href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                  className="block"
                                  legacyBehavior
                                >
                                  <p className="text-sm font-medium mb-1 text-[#F3612A] hover:text-[#1A1A1A] transition-colors duration-200">
                                    {section.title}
                                  </p>
                                </Link>
                                <ul className="mb-0">
                                  {section.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                        className="text-[#242D35] hover:text-[#1A1A1A] text-[13px] leading-5 block transition-colors duration-200"
                                        legacyBehavior
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop right-side icons */}
          <div className="hidden lg:flex items-center gap-4">
            <SearchBar
              onSearch={(q) => router.push(`/productlist?q=${encodeURIComponent(q)}`)}
              placeholder="Search for products..."
            />

            <div className="relative" ref={desktopDropdownRef}>
              <User className="w-5 h-5 cursor-pointer" onClick={() => setUserMenuOpen((p) => !p)} />
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md text-sm z-50">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile/orderHistory"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Order History
                      </Link>
                      <Link
                        href="/profile/paymentMethod"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Saved Payment Method
                      </Link>
                      <Link
                        href="/profile/addressBook"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Address Book
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
            <Link href="/wishlist" className="relative">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1 min-w-[18px] h-[18px] flex items-center justify-center">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cartpage" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 flex justify-between items-center lg:hidden z-50 mobile-navbar">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center w-12 relative">
                    <Menu className="w-6 h-6 text-gray-700" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="py-4">
                    {mobileNavData.map(({ id, label, data }) => (
                      <Accordion key={id} type="single" collapsible className="mb-4">
                        <AccordionItem value={id} className="border-b border-gray-200">
                          <AccordionTrigger className="text-base hover:no-underline py-3 text-gray-800">
                            {label}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              {data.map((section) => (
                                <div key={section.title} className="px-2">
                                  <Link
                                    href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}`}
                                    className="block text-[#F3612A] font-medium mb-2"
                                  >
                                    {section.title}
                                  </Link>
                                  <ul className="space-y-2 ml-4">
                                    {section.items.map((item) => (
                                      <li key={item}>
                                        <Link
                                          href={`/productlist?category=${encodeURIComponent(section.title.toLowerCase())}&subcategory=${encodeURIComponent(item.toLowerCase())}`}
                                          className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                          {item}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="text-sm font-medium text-[#F3612A]">
                <svg width="92" height="30" viewBox="0 0 92 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16.3504 16.3149L13.3912 5.04187C12.629 2.13841 10.0204 0.10241 7.01875 0.0683L1.86749 0.00976295C1.29709 0.00328112 0.665455 0.0456274 0.338511 0.513075C0.15227 0.779352 -5.26447e-05 1.17683 -6.10352e-05 1.76471C-6.97574e-05 2.37588 0.164562 2.78127 0.360788 3.04738C0.684271 3.48608 1.28397 3.52941 1.82903 3.52941H5.70276C7.51318 3.52941 9.09789 4.7454 9.56646 6.49413L12.2577 16.5378C13.4291 20.9096 17.3909 23.9496 21.9169 23.9496H29.6219C29.6219 23.9496 37.9413 23.9496 37.9413 14.874C37.9413 10.3884 36.2786 7.81183 34.5967 6.35302C32.6127 4.63216 29.8131 4.53781 27.1867 4.53781C22.2274 4.53781 18.601 9.21729 19.8387 14.0197L20.1692 15.3019C20.3911 16.163 21.1676 16.7647 22.0568 16.7647C23.3332 16.7647 24.2652 15.5584 23.943 14.3234L23.5485 12.8113C22.9224 10.4113 24.7335 8.06723 27.2138 8.06723H29.6219C29.6219 8.06723 34.2858 8.69748 34.2858 14.3697C34.2858 20.042 29.6219 20.2941 29.6219 20.2941H21.509C19.085 20.2941 16.9658 18.6595 16.3504 16.3149Z"
                    fill="#F3612A"
                  />
                  <ellipse cx="20.0421" cy="27.479" rx="2.52102" ry="2.52101" fill="#242D35" />
                  <ellipse cx="29.8742" cy="27.479" rx="2.52102" ry="2.52101" fill="#242D35" />
                  <path
                    d="M45.9504 10.4525C49.3991 10.4525 52.1954 13.248 52.1956 16.6966C52.1956 20.1453 49.3991 22.9417 45.9504 22.9417C42.5019 22.9416 39.7063 20.1452 39.7063 16.6966C39.7064 13.2481 42.502 10.4526 45.9504 10.4525ZM45.9504 12.9505C43.8815 12.9507 42.2045 14.6276 42.2043 16.6966C42.2043 18.7657 43.8814 20.4435 45.9504 20.4437C48.0197 20.4437 49.6975 18.7658 49.6975 16.6966C49.6973 14.6275 48.0196 12.9505 45.9504 12.9505Z"
                    fill="#F3612A"
                  />
                  <path
                    d="M68.8502 10.4525C70.8111 10.4528 72.56 11.3577 73.7047 12.7718C72.8941 13.0588 72.1992 13.59 71.7076 14.2767C71.0204 13.4657 69.9945 12.9507 68.8483 12.9505C66.7793 12.9507 65.1014 14.6276 65.1012 16.6966C65.1012 18.7657 66.7792 20.4435 68.8483 20.4437C69.9947 20.4435 71.0204 19.9279 71.7076 19.1165C72.1991 19.8033 72.8942 20.3333 73.7047 20.6204C72.5601 22.0352 70.8115 22.9414 68.8502 22.9417C65.4017 22.9415 62.6041 20.1452 62.6041 16.6966C62.6043 13.2481 65.4018 10.4527 68.8502 10.4525Z"
                    fill="#F3612A"
                  />
                  <path
                    d="M55.1933 10.8688H55.2325C55.9689 10.8688 56.5658 11.4658 56.5658 12.2021V18.2776C56.5658 19.014 57.1628 19.611 57.8992 19.611H60.937C61.6267 19.611 62.1858 20.1701 62.1858 20.8598C62.1858 21.5496 61.6267 22.1087 60.937 22.1087H55.1933C54.4569 22.1087 53.8599 21.5118 53.8599 20.7754V12.2021C53.8599 11.4658 54.4569 10.8688 55.1933 10.8688Z"
                    fill="#F3612A"
                  />
                  <path
                    d="M75.2991 20.7754V12.2021C75.2991 11.4658 75.8961 10.8688 76.6325 10.8688H76.6717C77.4081 10.8688 78.0051 11.4658 78.0051 12.2021V13.6984C78.0051 14.4348 78.602 15.0317 79.3384 15.0317H81.4591C82.1955 15.0317 82.7925 14.4348 82.7925 13.6984V12.2021C82.7925 11.4658 83.3894 10.8688 84.1258 10.8688H84.3732C85.1096 10.8688 85.7065 11.4657 85.7065 12.2021V20.7754C85.7065 21.5118 85.1096 22.1087 84.3732 22.1087H84.1258C83.3894 22.1087 82.7925 21.5118 82.7925 20.7754V18.8628C82.7925 18.1264 82.1955 17.5295 81.4591 17.5295H79.3384C78.602 17.5295 78.0051 18.1264 78.0051 18.8628V20.7754C78.0051 21.5118 77.4081 22.1087 76.6717 22.1087H76.6325C75.8961 22.1087 75.2991 21.5118 75.2991 20.7754Z"
                    fill="#F3612A"
                  />
                  <path
                    d="M88.2043 20.7754V12.2021C88.2043 11.4658 88.8013 10.8688 89.5376 10.8688H89.785C90.5214 10.8688 91.1184 11.4657 91.1184 12.2021V20.7754C91.1184 21.5118 90.5214 22.1087 89.785 22.1087H89.5376C88.8013 22.1087 88.2043 21.5118 88.2043 20.7754Z"
                    fill="#F3612A"
                  />
                </svg>
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => router.push("/wishlist")} className="flex flex-col items-center w-12 relative">
                <Heart className="w-6 h-6 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={() => router.push("/cartpage")} className="flex flex-col items-center w-12 relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              <div className="relative flex flex-col items-center w-12" ref={mobileDropdownRef}>
                <button className="flex flex-col items-center w-full" onClick={() => setMobileUserMenuOpen((p) => !p)}>
                  <User className="w-6 h-6 text-gray-700" />
                </button>

                {mobileUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md text-sm">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setMobileUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/profile/orderHistory"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setMobileUserMenuOpen(false)}
                        >
                          Order History
                        </Link>
                        <Link
                          href="/profile/paymentMethod"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setMobileUserMenuOpen(false)}
                        >
                          Saved Payment Method
                        </Link>
                        <Link
                          href="/profile/addressBook"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setMobileUserMenuOpen(false)}
                        >
                          Address Book
                        </Link>
                        <button onClick={handleLogout} className="block w-full text-red-400 text-left px-4 py-2 hover:bg-gray-100">
                          Logout
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          router.push("/login")
                          setMobileUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Login
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </section>
  )
}
