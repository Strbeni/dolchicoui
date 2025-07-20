"use client";

import { Heart, MenuIcon, ShoppingCart, User } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  // navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchBar } from "./search-bar";
// import Men from "@/components/men"

export const Navbar5 = () => {
  // const [showMen, setShowMen] = useState(false)
  // const [showWomen, setShowWomen] = useState(false)
  // const [showKids, setShowKids] = useState(false)
  // const [home, setHome] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //       setUserMenuOpen(false)
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside)
  //   return () => document.removeEventListener("mousedown", handleClickOutside)
  // }, [])

  // const handleLogout = () => {
  //   localStorage.removeItem('isLoggedIn')
  //   setUserMenuOpen(false)
  //   router.push('/login')
  // }

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false); // update UI
    setUserMenuOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const men = [
    {
      title: 'Topwear',
      items: ['T-Shirts', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Sweaters', 'Jackets', 'Blazers & Coats', 'Suits', 'Rain Jackets'],
    },
    {
      title: 'Indian & Festive Wear',
      items: ['Kurtas & Kurta Sets', 'Sherwanis', 'Nehru Jackets', 'Dhotis'],
    },
    {
      title: 'Bottomwear',
      items: ['Jeans', 'Casual Trousers', 'Formal Trousers', 'Shorts', 'Track Pants & Joggers'],
    },
    {
      title: 'Innerwear & Sleepwear',
      items: ['Briefs & Trunks', 'Boxers', 'Vests', 'Sleepwear & Loungewear', 'Thermals'],
    },
    {
      title: 'Footwear',
      items: ['Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sneakers', 'Sandals & Floaters', 'Flip Flops', 'Socks'],
    },
    {
      title: 'Sports & Active Wear',
      items: ['Sports Shoes', 'Sports Sandals', 'Active T-Shirts', 'Track Pants & Shorts', 'Tracksuits', 'Jackets & Sweatshirts', 'Sports Accessories', 'Swimwear'],
    },
    {
      title: 'Gadgets',
      items: ['Smart Wearables', 'Fitness Gadgets', 'Headphones', 'Speakers'],
    },
    {
      title: 'Fashion Accessories',
      items: ['Wallets', 'Belts', 'Perfumes & Body Mists', 'Trimmers', 'Deodorants', 'Ties, Cufflinks & Pocket Squares', 'Accessory Gift Sets', 'Caps & Hats', 'Mufflers, Scarves & Gloves', 'Phone Cases', 'Rings & Wristwear', 'Helmets'],
    },
    {
      title: 'Bags & Backpacks',
      items: [],
    },
    {
      title: 'Luggages & Trolleys',
      items: [],
    },
  ]

  const women = [
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
        "Watches & Wearables",
      ],
    },
    {
      title: "Western Wear",
      items: [
        "Dresses",
        "Tops",
        "T-shirts",
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
        "Plus Size",
        "Maternity",
        "Sunglasses & Frames",
      ],
    },
    {
      title: "Footwear",
      items: [
        "Flats",
        "Casual Shoes",
        "Heels",
        "Boots",
        "Sports Shoes & Floaters",
      ],
    },
    {
      title: "Sports & Active Wear",
      items: [
        "Clothing",
        "Footwear",
        "Sports Accessories",
        "Sports Equipment",
      ],
    },
    {
      title: "Lingerie & Sleepwear",
      items: [
        "Bra",
        "Briefs",
        "Shapewear",
        "Sleepwear & Loungewear",
        "Swimwear",
        "Camisoles & Thermals",
      ],
    },
    {
      title: "Beauty & Personal Care",
      items: [
        "Makeup",
        "Skincare",
        "Premium Beauty",
        "Lipsticks",
        "Fragrances",
      ],
    },
    {
      title: "Gadgets",
      items: [
        "Smart Wearables",
        "Fitness Gadgets",
        "Headphones",
        "Speakers",
      ],
    },
    {
      title: "Jewellery",
      items: [
        "Fashion Jewellery",
        "Fine Jewellery",
        "Earrings",
      ],
    },
    {
      title: "Bags & Luggage",
      items: [
        "Backpacks",
        "Handbags, Bags & Wallets",
        "Luggages & Trolleys",
      ],
    },
  ]
  const kids = [
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
        "Skirts & shorts",
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
      items: [
        "Casual Shoes",
        "Flipflops",
        "Sports Shoes",
        "Flats",
        "Sandals",
        "Heels",
        "School Shoes",
        "Socks",
      ],
    },
    {
      title: "Toys & Games",
      items: [
        "Learning & Development",
        "Activity Toys",
        "Soft Toys",
        "Action Figure / Play set",
      ],
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
      ],
    },
    {
      title: "Infant Care",
      items: [
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
  const homes = [
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
      items: [
        "Floor Runners",
        "Carpets",
        "Floor Mats & Dhurries",
        "Door Mats",
      ],
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
      items: [
        "Floor Lamps",
        "Ceiling Lamps",
        "Table Lamps",
        "Wall Lamps",
        "Outdoor Lamps",
        "String Lights",
      ],
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
        "Furniture",
        "Home Gift Sets",
      ],
    },
    {
      title: "Kitchen & Table",
      items: [
        "Table Runners",
        "Dinnerware & Serveware",
        "Cups and Mugs",
        "Bakeware & Cookware",
        "Kitchen Storage & Tools",
        "Bar & Drinkware",
        "Table Covers & Furnishings",
      ],
    },
    {
      title: "Storage",
      items: [
        "Bins",
        "Hangers",
        "Organisers",
        "Hooks & Holders",
        "Laundry Bags",
      ],
    },
  ]

  return (
    <section className="py-4 px-4 lg:px-6 bg-white shadow-sm">
      <div className="container">
        <nav className="flex items-center justify-between">
          <a
             href="/home"
            className="flex items-center gap-2"
          >
            {/* <img
              src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
              className="max-h-8"
              alt="Shadcn UI Navbar"
            /> */}
            <span className="text-lg font-semibold tracking-tighter">
              DolchiCo
            </span>
          </a>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-red-600">
                  Men
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {men.map((men, index) => (
                      <NavigationMenuLink
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70 "
                      >
                        <div key={men.title} >
                          <p className="mb-1 font-semibold text-red-600">
                            {men.title}
                          </p>

                          <ul className="text-sm text-muted-foreground list-none space-y-1">
                            {men.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    ))}

                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-pink-600">
                  Women
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {women.map((category, index) => (
                      <NavigationMenuLink
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <div key={category.title}>
                          <p className="mb-1 font-semibold text-pink-600">
                            {category.title}
                          </p>
                          <ul className="text-sm text-muted-foreground list-none space-y-1">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-yellow-600">
                  Kids
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {kids.map((category, index) => (
                      <NavigationMenuLink
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <div key={category.title}>
                          <p className="mb-1 font-semibold text-yellow-600">
                            {category.title}
                          </p>
                          <ul className="text-sm text-muted-foreground list-none space-y-1">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-orange-600">
                  Home
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {homes.map((category, index) => (
                      <NavigationMenuLink
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <div key={category.title}>
                          <p className="mb-1 font-semibold text-orange-600">
                            {category.title}
                          </p>
                          <ul className="text-sm text-muted-foreground list-none space-y-1">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
          {/* <div className="hidden items-center gap-4 lg:flex">
            <Button variant="outline">Sign in</Button>
            <Button>Start for free</Button>
          </div> */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* <Search className="w-5 h-5 cursor-pointer" /> */}
            <div className="flex flex-col items-center justify-center ">
              <SearchBar
                onSearch={(query) => router.push(`/productlist?q=${encodeURIComponent(query)}`)}
              />

            </div>
            <div className="relative" ref={dropdownRef}>
              <User
                className="w-5 h-5 cursor-pointer"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              />
              {/* {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md text-sm z-50">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Go to Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/login');
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Login
                    </button>
                  )}
                </div>
              )}
               */}
              {userMenuOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md text-sm z-50"
                >
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Go to Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/login');
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>

            <Heart className="w-5 h-5 cursor-pointer" />
            <Link href="/cartpage">
              <ShoppingCart className="w-5 h-5 cursor-pointer" />
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <a
                    href="https://dolchico.com"
                    className="flex items-center gap-2"
                  >
                    {/* <img
                      src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg"
                      className="max-h-8"
                      alt="Shadcnblocks"
                    /> */}
                    <span className="text-lg font-semibold tracking-tighter">
                      DolchiCo
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Men
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {men.map((men, index) => (
                          <a
                            // href={men.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-muted/70"
                          >
                            <div key={men.title}>
                              <p className="mb-1 font-semibold text-foreground">
                                {men.title}
                              </p>
                              {/* <p className="text-sm text-muted-foreground">
                                {men.description}
                              </p> */}
                              <ul className="text-sm text-muted-foreground list-none space-y-1">
                                {men.items.map((item, itemIndex) => (
                                  <li key={itemIndex}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {/* <div className="flex flex-col gap-6"> */}
                  {/* <a href="#" className="font-medium">
                    Women
                  </a> */}
                  <Accordion type="single" collapsible className="mt-4 mb-2">
                    <AccordionItem value="solutions" className="border-none">
                      <AccordionTrigger className="text-base hover:no-underline">
                        Women
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid md:grid-cols-2">
                          {women.map((women, index) => (
                            <a
                              // href={men.href}
                              key={index}
                              className="rounded-md p-3 transition-colors hover:bg-muted/70"
                            >
                              <div key={women.title}>
                                <p className="mb-1 font-semibold text-foreground">
                                  {women.title}
                                </p>
                                {/* <p className="text-sm text-muted-foreground">
                                {men.description}
                              </p> */}
                                <ul className="text-sm text-muted-foreground list-none space-y-1">
                                  {women.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </a>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* <a href="#" className="font-medium">
                    Blog
                  </a> */}
                  <Accordion type="single" collapsible className="mt-4 mb-2">
                    <AccordionItem value="solutions" className="border-none">
                      <AccordionTrigger className="text-base hover:no-underline">
                        Kids
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid md:grid-cols-2">
                          {kids.map((kids, index) => (
                            <a
                              // href={men.href}
                              key={index}
                              className="rounded-md p-3 transition-colors hover:bg-muted/70"
                            >
                              <div key={kids.title}>
                                <p className="mb-1 font-semibold text-foreground">
                                  {kids.title}
                                </p>
                                {/* <p className="text-sm text-muted-foreground">
                                {men.description}
                              </p> */}
                                <ul className="text-sm text-muted-foreground list-none space-y-1">
                                  {kids.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </a>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* <a href="#" className="font-medium">
                    Pricing
                  </a> */}
                  <Accordion type="single" collapsible className="mt-4 mb-2">
                    <AccordionItem value="solutions" className="border-none">
                      <AccordionTrigger className="text-base hover:no-underline">
                        Homes
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid md:grid-cols-2">
                          {homes.map((homes, index) => (
                            <a
                              // href={men.href}
                              key={index}
                              className="rounded-md p-3 transition-colors hover:bg-muted/70"
                            >
                              <div key={homes.title}>
                                <p className="mb-1 font-semibold text-foreground">
                                  {homes.title}
                                </p>
                                {/* <p className="text-sm text-muted-foreground">
                                {men.description}
                              </p> */}
                                <ul className="text-sm text-muted-foreground list-none space-y-1">
                                  {homes.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </a>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                {/* </div> */}
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                    <Button variant="outline">Sign in</Button>
                  </Link>
                  {/* <Button>Start for free</Button> */}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};
