"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, Grid3X3 } from "lucide-react"
import PromotionalBanner from "@/components/promotional-banner"
import KidsSection from "@/components/kids-section"
import MenSection from "@/components/men-section"
import WomenSection from "@/components/women-section"

const apiData = {
  "categories": [
    {
      "name": "Men",
      "subCategories": [
        {
          "name": "TShirt",
          "icon": "https://example.com/icons/tshirt.png",
          "grouping": "Topwear",
          "originalPrice": 1299,
          "discountedPrice": 649
        },
        {
          "name": "Pant",
          "icon": "https://example.com/icons/pant.png",
          "grouping": "Bottomwear",
          "originalPrice": 1899,
          "discountedPrice": 949
        },
        {
          "name": "Trouser",
          "icon": "https://example.com/icons/trouser.png",
          "grouping": "Bottomwear",
          "originalPrice": 1599,
          "discountedPrice": 799
        },
        {
          "name": "Shirt",
          "icon": "https://example.com/icons/shirt.png",
          "grouping": "Topwear",
          "originalPrice": 2199,
          "discountedPrice": 1099
        },
        {
          "name": "Jeans",
          "icon": "https://example.com/icons/jeans.png",
          "grouping": "Bottomwear",
          "originalPrice": 2499,
          "discountedPrice": 1249
        },
        {
          "name": "Jacket",
          "icon": "https://example.com/icons/jacket.png",
          "grouping": "Outerwear",
          "originalPrice": 3999,
          "discountedPrice": 1999
        },
        {
          "name": "Sweater",
          "icon": "https://example.com/icons/sweater.png",
          "grouping": "Topwear",
          "originalPrice": 1799,
          "discountedPrice": 899
        },
        {
          "name": "Shorts",
          "icon": "https://example.com/icons/shorts.png",
          "grouping": "Bottomwear",
          "originalPrice": 999,
          "discountedPrice": 499
        },
        {
          "name": "Hoodie",
          "icon": "https://example.com/icons/hoodie.png",
          "grouping": "Topwear",
          "originalPrice": 2299,
          "discountedPrice": 1149
        },
        {
          "name": "Blazer",
          "icon": "https://example.com/icons/blazer.png",
          "grouping": "Outerwear",
          "originalPrice": 4599,
          "discountedPrice": 2299
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "TShirt"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "tags": ["Trending", "HotDeal"],
              "subCategoriesName": "Jacket"
            }
          ]
        },
        {
          "name": "30-40% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 30,
              "max_discount": 40,
              "tags": ["NewArrival", "Limited"],
              "subCategoriesName": "Sweater"
            }
          ]
        }
      ]
    },
    {
      "name": "Women",
      "subCategories": [
        {
          "name": "Kurta",
          "icon": "https://example.com/icons/kurta.png",
          "grouping": "Ethnic",
          "originalPrice": 1899,
          "discountedPrice": 949
        },
        {
          "name": "Pant",
          "icon": "https://example.com/icons/women-pant.png",
          "grouping": "Bottomwear",
          "originalPrice": 1599,
          "discountedPrice": 799
        },
        {
          "name": "Plazo",
          "icon": "https://example.com/icons/plazo.png",
          "grouping": "Bottomwear",
          "originalPrice": 1299,
          "discountedPrice": 649
        },
        {
          "name": "Saree",
          "icon": "https://example.com/icons/saree.png",
          "grouping": "Ethnic",
          "originalPrice": 3499,
          "discountedPrice": 1749
        },
        {
          "name": "Dress",
          "icon": "https://example.com/icons/dress.png",
          "grouping": "Dresses",
          "originalPrice": 2299,
          "discountedPrice": 1149
        },
        {
          "name": "Top",
          "icon": "https://example.com/icons/top.png",
          "grouping": "Topwear",
          "originalPrice": 999,
          "discountedPrice": 499
        },
        {
          "name": "Skirt",
          "icon": "https://example.com/icons/skirt.png",
          "grouping": "Bottomwear",
          "originalPrice": 1399,
          "discountedPrice": 699
        },
        {
          "name": "Blouse",
          "icon": "https://example.com/icons/blouse.png",
          "grouping": "Ethnic",
          "originalPrice": 899,
          "discountedPrice": 449
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Kurta"
            }
          ]
        },
        {
          "name": "45-55% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 45,
              "max_discount": 55,
              "tags": ["Festival", "Exclusive"],
              "subCategoriesName": "Saree"
            }
          ]
        },
        {
          "name": "35-45% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 35,
              "max_discount": 45,
              "tags": ["Trending", "Popular"],
              "subCategoriesName": "Dress"
            }
          ]
        }
      ]
    },
    {
      "name": "Kids",
      "subCategories": [
        {
          "name": "Boys",
          "icon": "https://example.com/icons/boys.png",
          "grouping": "Kidswear",
          "originalPrice": 899,
          "discountedPrice": 449
        },
        {
          "name": "Girls",
          "icon": "https://example.com/icons/girls.png",
          "grouping": "Kidswear",
          "originalPrice": 799,
          "discountedPrice": 399
        },
        {
          "name": "Two Year Old",
          "icon": "https://example.com/icons/two-year-old.png",
          "grouping": "Infantwear",
          "originalPrice": 599,
          "discountedPrice": 299
        },
        {
          "name": "Five Year Old",
          "icon": "https://example.com/icons/five-year-old.png",
          "grouping": "Kidswear",
          "originalPrice": 699,
          "discountedPrice": 349
        },
        {
          "name": "Teen Boys",
          "icon": "https://example.com/icons/teen-boys.png",
          "grouping": "Teenwear",
          "originalPrice": 1199,
          "discountedPrice": 599
        },
        {
          "name": "Teen Girls",
          "icon": "https://example.com/icons/teen-girls.png",
          "grouping": "Teenwear",
          "originalPrice": 1099,
          "discountedPrice": 549
        },
        {
          "name": "Baby Rompers",
          "icon": "https://example.com/icons/baby-rompers.png",
          "grouping": "Infantwear",
          "originalPrice": 499,
          "discountedPrice": 249
        },
        {
          "name": "Kids Party Wear",
          "icon": "https://example.com/icons/kids-party.png",
          "grouping": "Party Wear",
          "originalPrice": 1599,
          "discountedPrice": 799
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Boys"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "tags": ["KidsSpecial", "Fun"],
              "subCategoriesName": "Teen Boys"
            }
          ]
        },
        {
          "name": "30-40% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 30,
              "max_discount": 40,
              "tags": ["PartyWear", "Cute"],
              "subCategoriesName": "Kids Party Wear"
            }
          ]
        }
      ]
    },
    {
      "name": "Accessories",
      "subCategories": [
        {
          "name": "Watches",
          "icon": "https://example.com/icons/watch.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 2999,
          "discountedPrice": 1499
        },
        {
          "name": "Clutcher",
          "icon": "https://example.com/icons/clutcher.png",
          "grouping": "Hair Accessories",
          "originalPrice": 799,
          "discountedPrice": 399
        },
        {
          "name": "Bands",
          "icon": "https://example.com/icons/bands.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 299,
          "discountedPrice": 149
        },
        {
          "name": "Belts",
          "icon": "https://example.com/icons/belts.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 599,
          "discountedPrice": 299
        },
        {
          "name": "Sunglasses",
          "icon": "https://example.com/icons/sunglasses.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 1499,
          "discountedPrice": 749
        },
        {
          "name": "Jewelry",
          "icon": "https://example.com/icons/jewelry.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 1999,
          "discountedPrice": 999
        },
        {
          "name": "Scarves",
          "icon": "https://example.com/icons/scarves.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 899,
          "discountedPrice": 449
        },
        {
          "name": "Hats",
          "icon": "https://example.com/icons/hats.png",
          "grouping": "Fashion Accessories",
          "originalPrice": 699,
          "discountedPrice": 349
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Watches"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "tags": ["Luxury", "Premium"],
              "subCategoriesName": "Jewelry"
            }
          ]
        },
        {
          "name": "35-45% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 35,
              "max_discount": 45,
              "tags": ["Fashion", "Style"],
              "subCategoriesName": "Sunglasses"
            }
          ]
        }
      ]
    },
    {
      "name": "HomeLiving",
      "subCategories": [
        {
          "name": "Curtain",
          "icon": "https://example.com/icons/curtain.png",
          "grouping": "Home Essentials",
          "originalPrice": 2499,
          "discountedPrice": 1249
        },
        {
          "name": "Pillow",
          "icon": "https://example.com/icons/pillow.png",
          "grouping": "Home Essentials",
          "originalPrice": 899,
          "discountedPrice": 449
        },
        {
          "name": "Bedsheet",
          "icon": "https://example.com/icons/bedsheet.png",
          "grouping": "Home Essentials",
          "originalPrice": 1899,
          "discountedPrice": 949
        },
        {
          "name": "Towels",
          "icon": "https://example.com/icons/towels.png",
          "grouping": "Home Essentials",
          "originalPrice": 1299,
          "discountedPrice": 649
        },
        {
          "name": "Cushions",
          "icon": "https://example.com/icons/cushions.png",
          "grouping": "Home Decor",
          "originalPrice": 799,
          "discountedPrice": 399
        },
        {
          "name": "Table Linen",
          "icon": "https://example.com/icons/table-linen.png",
          "grouping": "Home Essentials",
          "originalPrice": 1599,
          "discountedPrice": 799
        },
        {
          "name": "Wall Art",
          "icon": "https://example.com/icons/wall-art.png",
          "grouping": "Home Decor",
          "originalPrice": 2999,
          "discountedPrice": 1499
        },
        {
          "name": "Vases",
          "icon": "https://example.com/icons/vases.png",
          "grouping": "Home Decor",
          "originalPrice": 1199,
          "discountedPrice": 599
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Curtain"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "tags": ["HomeDecor", "Beautiful"],
              "subCategoriesName": "Wall Art"
            }
          ]
        },
        {
          "name": "30-40% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 30,
              "max_discount": 40,
              "tags": ["Comfort", "Essential"],
              "subCategoriesName": "Cushions"
            }
          ]
        }
      ]
    },
    {
      "name": "Footwear",
      "subCategories": [
        {
          "name": "Sneakers",
          "icon": "https://example.com/icons/sneakers.png",
          "grouping": "Casual",
          "originalPrice": 3499,
          "discountedPrice": 1749
        },
        {
          "name": "Boots",
          "icon": "https://example.com/icons/boots.png",
          "grouping": "Casual",
          "originalPrice": 4299,
          "discountedPrice": 2149
        },
        {
          "name": "Sandals",
          "icon": "https://example.com/icons/sandals.png",
          "grouping": "Casual",
          "originalPrice": 1499,
          "discountedPrice": 749
        },
        {
          "name": "Formal Shoes",
          "icon": "https://example.com/icons/formal-shoes.png",
          "grouping": "Formal",
          "originalPrice": 3999,
          "discountedPrice": 1999
        },
        {
          "name": "Sports Shoes",
          "icon": "https://example.com/icons/sports-shoes.png",
          "grouping": "Sports",
          "originalPrice": 2999,
          "discountedPrice": 1499
        },
        {
          "name": "Heels",
          "icon": "https://example.com/icons/heels.png",
          "grouping": "Formal",
          "originalPrice": 2499,
          "discountedPrice": 1249
        },
        {
          "name": "Flip Flops",
          "icon": "https://example.com/icons/flip-flops.png",
          "grouping": "Casual",
          "originalPrice": 499,
          "discountedPrice": 249
        },
        {
          "name": "Loafers",
          "icon": "https://example.com/icons/loafers.png",
          "grouping": "Casual",
          "originalPrice": 3199,
          "discountedPrice": 1599
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Sneakers"
            }
          ]
        },
        {
          "name": "45-55% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 45,
              "max_discount": 55,
              "tags": ["Sports", "Comfort"],
              "subCategoriesName": "Sports Shoes"
            }
          ]
        },
        {
          "name": "35-45% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 35,
              "max_discount": 45,
              "tags": ["Casual", "Trendy"],
              "subCategoriesName": "Boots"
            }
          ]
        }
      ]
    },
    {
      "name": "Beauty",
      "subCategories": [
        {
          "name": "Makeup",
          "icon": "https://example.com/icons/makeup.png",
          "grouping": "Cosmetics",
          "originalPrice": 1999,
          "discountedPrice": 999
        },
        {
          "name": "Skincare",
          "icon": "https://example.com/icons/skincare.png",
          "grouping": "Cosmetics",
          "originalPrice": 2499,
          "discountedPrice": 1249
        },
        {
          "name": "Hair Care",
          "icon": "https://example.com/icons/hair-care.png",
          "grouping": "Cosmetics",
          "originalPrice": 1499,
          "discountedPrice": 749
        },
        {
          "name": "Fragrances",
          "icon": "https://example.com/icons/fragrances.png",
          "grouping": "Cosmetics",
          "originalPrice": 2999,
          "discountedPrice": 1499
        },
        {
          "name": "Nail Care",
          "icon": "https://example.com/icons/nail-care.png",
          "grouping": "Cosmetics",
          "originalPrice": 799,
          "discountedPrice": 399
        },
        {
          "name": "Bath & Body",
          "icon": "https://example.com/icons/bath-body.png",
          "grouping": "Cosmetics",
          "originalPrice": 1299,
          "discountedPrice": 649
        },
        {
          "name": "Tools & Brushes",
          "icon": "https://example.com/icons/tools-brushes.png",
          "grouping": "Accessories",
          "originalPrice": 999,
          "discountedPrice": 499
        },
        {
          "name": "Men's Grooming",
          "icon": "https://example.com/icons/mens-grooming.png",
          "grouping": "Cosmetics",
          "originalPrice": 1799,
          "discountedPrice": 899
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "tags": ["Navratri", "Garbha", "BestSeller"],
              "subCategoriesName": "Makeup"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "tags": ["Skincare", "Glow"],
              "subCategoriesName": "Skincare"
            }
          ]
        },
        {
          "name": "35-45% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 500,
              "price_above": 600,
              "min_discount": 35,
              "max_discount": 45,
              "tags": ["Fragrance", "Luxury"],
              "subCategoriesName": "Fragrances"
            }
          ]
        }
      ]
    }
  ]
}

const availableTopDealImages = ["/w1.svg", "/w2.svg", "/w3.svg", "/w4.svg", "/product.jpg", "/casual.jpg", "/formal-men.jpg"]
const availableCategoryImages = ["/h1.svg", "/h2.svg", "/h3.svg", "/h4.svg", "/w1.svg", "/w2.svg", "/w3.svg", "/w4.svg"]

// Top Deals - show ONLY products with offers OR tags
const topDealsByCategory = apiData.categories.map((cat, catIndex) => ({
  categoryName: cat.name,
  offers: cat.offers.flatMap((offer, offerIndex) => {
    // Find the subcategory that matches this offer
    const matchingSubCategory = cat.subCategories.find(
      sub => sub.name === offer.offerType[0]?.subCategoriesName
    )

    if (matchingSubCategory) {
      const discountPercent = Math.round(((matchingSubCategory.originalPrice - matchingSubCategory.discountedPrice) / matchingSubCategory.originalPrice) * 100)
      return [{
        id: `${cat.name}-${matchingSubCategory.name}-${offerIndex}`,
        productId: catIndex * 10 + offerIndex + 1,
        title: matchingSubCategory.name,
        image: availableTopDealImages[(catIndex + offerIndex) % availableTopDealImages.length],
        badge: offer.offerType[0]?.tags[0] || null,
        discount: `${discountPercent}% OFF`,
        originalPrice: matchingSubCategory.originalPrice,
        discountedPrice: matchingSubCategory.discountedPrice
      }]
    }
    return []
  })
})).filter(categoryGroup => categoryGroup.offers.length > 0) // Only show categories that have offers

const categoriesByCategory = apiData.categories.map((cat, catIndex) => ({
  categoryName: cat.name,
  subCategories: cat.subCategories.map((sub, subIndex) => ({
    id: `${cat.name}-${sub.name}-${subIndex}`,
    productId: catIndex * 10 + subIndex + 1,
    title: sub.name,
    image: availableCategoryImages[(catIndex * 3 + subIndex) % availableCategoryImages.length],
    badge: null, // No badges in Shop by Category - keep it clean
    discount: "", // No discount display in Shop by Category
    originalPrice: sub.originalPrice,
    discountedPrice: sub.discountedPrice
  }))
}))

export default function Home() {
  const [activeTab, setActiveTab] = useState("All")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPromoBanner, setShowPromoBanner] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Kids":
        return <KidsSection />
      case "Men":
        return <MenSection />
      case "Women":
        return <WomenSection />
      case "All":
      default:
        return renderAllContent()
    }
  }

  const renderAllContent = () => (
    <>
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
        <div
          className=" cursor-pointer hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 bg-[#ff6a1a] text-white px-3 py-2 rounded-l-md font-semibold tracking-wider [writing-mode:vertical-rl]"
          onClick={() => setShowPromoBanner(true)}
        >
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
      <section className="px-6 lg:px-20 mt-16">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Top Deals</h3>
          <p className="text-sm text-gray-600">Effortless style, inspired by the future of fashion</p>
        </div>

        <div className="space-y-8">
          {topDealsByCategory.map((categoryGroup) => {
            const isExpanded = expandedCategories.has(categoryGroup.categoryName)
            const displayedOffers = isExpanded ? categoryGroup.offers : categoryGroup.offers.slice(0, 6)
            const hasMore = categoryGroup.offers.length > 6

            return (
              <div key={categoryGroup.categoryName}>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">{categoryGroup.categoryName}</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayedOffers.map((item) => {
                    const accent = item.discount.includes("60")
                    return (
                      <Link key={item.id} href={`/productdetail/${item.productId}`}>
                        <Card className="bg-transparent border-none shadow-none p-0 hover:shadow-lg transition-shadow duration-300">
                          <div className="relative h-52 md:h-56 lg:h-60 rounded-[18px] overflow-hidden bg-white">
                            <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            {item.badge && (
                              <div className="absolute top-3 left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                                {item.badge}
                              </div>
                            )}
                          </div>
                          <CardContent className="px-2 pt-4 pb-2">
                            <p className="text-sm text-gray-700 font-medium">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Special Offer</p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className={`text-xl leading-tight font-extrabold tracking-tight ${item.discount.includes("60") ? "text-[#ff5c39]" : "text-gray-900"}`}>
                                ₹{item.discountedPrice}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </p>
                            </div>
                            <p className={`mt-1 text-sm font-semibold ${item.discount.includes("60") ? "text-[#ff5c39]" : "text-gray-700"}`}>
                              {item.discount}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      className="rounded-full bg-transparent hover:bg-gray-50"
                      onClick={() => {
                        setExpandedCategories(prev => {
                          const newSet = new Set(prev)
                          if (newSet.has(categoryGroup.categoryName)) {
                            newSet.delete(categoryGroup.categoryName)
                          } else {
                            newSet.add(categoryGroup.categoryName)
                          }
                          return newSet
                        })
                      }}
                    >
                      {isExpanded ? 'See Less' : 'See More'} →
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="px-6 lg:px-20 mt-16 mb-20">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Shop by Category</h3>
          <p className="text-sm text-gray-600">Style, inspired by the future of fashion</p>
        </div>
        <div className="space-y-8">
          {categoriesByCategory.map((categoryGroup) => {
            const isExpanded = expandedCategories.has(categoryGroup.categoryName)
            const displayedSubCategories = isExpanded ? categoryGroup.subCategories : categoryGroup.subCategories.slice(0, 6)
            const hasMore = categoryGroup.subCategories.length > 6

            return (
              <div key={categoryGroup.categoryName}>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">{categoryGroup.categoryName}</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayedSubCategories.map((item) => {
                    const accent = item.discount.includes("60")
                    return (
                      <Link key={item.id} href={`/productdetail/${item.productId}`}>
                        <Card className="bg-transparent border-none shadow-none p-0 hover:shadow-lg transition-shadow duration-300">
                          <div className="relative h-52 md:h-56 lg:h-60 rounded-[18px] overflow-hidden bg-white">
                            <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            {item.badge && (
                              <div className="absolute top-3 left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                                {item.badge}
                              </div>
                            )}
                          </div>
                          <CardContent className="px-2 pt-4 pb-2">
                            <p className="text-sm text-gray-700 font-medium">{item.title}</p>
                            <div className="mt-2">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{item.discountedPrice}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      className="rounded-full bg-transparent hover:bg-gray-50"
                      onClick={() => {
                        setExpandedCategories(prev => {
                          const newSet = new Set(prev)
                          if (newSet.has(categoryGroup.categoryName)) {
                            newSet.delete(categoryGroup.categoryName)
                          } else {
                            newSet.add(categoryGroup.categoryName)
                          }
                          return newSet
                        })
                      }}
                    >
                      {isExpanded ? 'See Less' : 'See More'} →
                    </Button>
                  </div>
                )}
              </div>
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
    </>
  )

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
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === tab
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

        {activeTab === "All" && (
          <>
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
              <Image
                src={heroSlides[currentSlide].image || "/placeholder.svg"}
                alt="Hero"
                fill
                className="object-cover"
              />
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
                  className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? "bg-[#f05a2b]" : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {renderTabContent()}
    </div>
  )
}
