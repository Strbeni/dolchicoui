

"use client"
import Link from 'next/link'
import { cn } from '@/lib/utils'

const menu = [
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

export default function Men({ show }: { show: boolean }) {
  return (
    <div
      className={cn(
        'absolute top-full left-1/2 -translate-x-1/2 w-screen z-50 transition-all duration-300 ease-in-out',
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 bg-white shadow-lg border-t border-gray-200 rounded-b-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-5">
          {menu.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h4 className="text-sm font-semibold mb-3 text-red-600 border-b border-gray-200 pb-1 uppercase">
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
