"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const menu = [
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

export default function Kids({ show }: { show: boolean }) {
  return (
    <div
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 w-screen z-50 transition-all duration-300 ease-in-out",
        show ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 bg-white shadow-lg border-t border-gray-200 rounded-b-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-5">
          {menu.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h4 className="text-sm font-semibold mb-3 text-orange-600 border-b border-gray-200 pb-1 uppercase">
                  {section.title}
                </h4>
              )}
              {section.items.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        href="#"
                        className="hover:text-black hover:font-medium transition-all duration-200 block"
                        legacyBehavior>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic mt-2">Coming soon</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
