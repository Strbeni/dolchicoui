"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const menu = [
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

export default function Home({ show }: { show: boolean }) {
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
                <h4 className="text-sm font-semibold mb-3 text-yellow-600 border-b border-gray-200 pb-1 uppercase">
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
                      >
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
