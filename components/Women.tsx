"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const menu = [
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

export default function Women({ show }: { show: boolean }) {
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
                <h4 className="text-sm font-semibold mb-3 text-pink-600 border-b border-gray-200 pb-1 uppercase">
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
