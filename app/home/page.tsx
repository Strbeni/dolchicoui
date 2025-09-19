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
          "name": "T-Shirt",
          "icon": "https://example.com/icons/tshirt.png",
          "grouping": "Topwear"
        },
        {
          "name": "Pant",
          "icon": "https://example.com/icons/pant.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Trouser",
          "icon": "https://example.com/icons/trouser.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Shirt",
          "icon": "https://example.com/icons/shirt.png",
          "grouping": "Topwear"
        },
        {
          "name": "Jeans",
          "icon": "https://example.com/icons/jeans.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Jacket",
          "icon": "https://example.com/icons/jacket.png",
          "grouping": "Outerwear"
        },
        {
          "name": "Sweater",
          "icon": "https://example.com/icons/sweater.png",
          "grouping": "Topwear"
        },
        {
          "name": "Shorts",
          "icon": "https://example.com/icons/shorts.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Hoodie",
          "icon": "https://example.com/icons/hoodie.png",
          "grouping": "Topwear"
        },
        {
          "name": "Blazer",
          "icon": "https://example.com/icons/blazer.png",
          "grouping": "Outerwear"
        }
      ],
      "offers": [
        {
          "name": "10-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 5000,
              "price_above": 200,
              "min_discount": 10,
              "max_discount": 60,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Navratri", "BestSeller", "HotDeal"],
              "subCategoriesName": "T-Shirt"
            }
          ]
        },
        {
          "name": "40-50% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 50000,
              "price_above": 200,
              "min_discount": 40,
              "max_discount": 50,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Trending", "NewArrival"],
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
              "price_below": 80220,
              "price_above": 300,
              "min_discount": 30,
              "max_discount": 40,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Limited", "Fun"],
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
          "grouping": "Ethnic"
        },
        {
          "name": "Pant",
          "icon": "https://example.com/icons/women-pant.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Plazo",
          "icon": "https://example.com/icons/plazo.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Saree",
          "icon": "https://example.com/icons/saree.png",
          "grouping": "Ethnic"
        },
        {
          "name": "Dress",
          "icon": "https://example.com/icons/dress.png",
          "grouping": "Dresses"
        },
        {
          "name": "Top",
          "icon": "https://example.com/icons/top.png",
          "grouping": "Topwear"
        },
        {
          "name": "Skirt",
          "icon": "https://example.com/icons/skirt.png",
          "grouping": "Bottomwear"
        },
        {
          "name": "Blouse",
          "icon": "https://example.com/icons/blouse.png",
          "grouping": "Ethnic"
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 50000,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Navratri", "Garbha", "KidsSpecial"],
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
              "price_below": 54500,
              "price_above": 600,
              "min_discount": 45,
              "max_discount": 55,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["NewArrival", "Trending"],
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
              "price_below": 54400,
              "price_above": 600,
              "min_discount": 35,
              "max_discount": 45,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["HotDeal", "BestSeller"],
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
          "grouping": "Kidswear"
        },
        {
          "name": "Girls",
          "icon": "https://example.com/icons/girls.png",
          "grouping": "Kidswear"
        },
        {
          "name": "Two Year Old",
          "icon": "https://example.com/icons/two-year-old.png",
          "grouping": "Infantwear"
        },
        {
          "name": "Five Year Old",
          "icon": "https://example.com/icons/five-year-old.png",
          "grouping": "Kidswear"
        },
        {
          "name": "Teen Boys",
          "icon": "https://example.com/icons/teen-boys.png",
          "grouping": "Teenwear"
        },
        {
          "name": "Teen Girls",
          "icon": "https://example.com/icons/teen-girls.png",
          "grouping": "Teenwear"
        },
        {
          "name": "Baby Rompers",
          "icon": "https://example.com/icons/baby-rompers.png",
          "grouping": "Infantwear"
        },
        {
          "name": "Kids Party Wear",
          "icon": "https://example.com/icons/kids-party.png",
          "grouping": "Party Wear"
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 5013130,
              "price_above": 600,
              "min_discount": 10,
              "max_discount": 60,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["KidsSpecial", "Fun", "Navratri"],
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
              "price_below": 506460,
              "price_above": 600,
              "min_discount": 40,
              "max_discount": 50,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["BestSeller", "Limited"],
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
              "price_below": 56546500,
              "price_above": 600,
              "min_discount": 30,
              "max_discount": 40,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Garbha", "NewArrival"],
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
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Clutcher",
          "icon": "https://example.com/icons/clutcher.png",
          "grouping": "Hair Accessories"
        },
        {
          "name": "Bands",
          "icon": "https://example.com/icons/bands.png",
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Belts",
          "icon": "https://example.com/icons/belts.png",
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Sunglasses",
          "icon": "https://example.com/icons/sunglasses.png",
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Jewelry",
          "icon": "https://example.com/icons/jewelry.png",
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Scarves",
          "icon": "https://example.com/icons/scarves.png",
          "grouping": "Fashion Accessories"
        },
        {
          "name": "Hats",
          "icon": "https://example.com/icons/hats.png",
          "grouping": "Fashion Accessories"
        }
      ],
      "offers": [
        {
          "name": "50-60% Discount",
          "icon": "https://example.com/icons/discount.png",
          "grouping": "Offers",
          "offerType": [
            {
              "price_below": 501650,
              "price_above": 65465600,
              "min_discount": 10,
              "max_discount": 60,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["HotDeal", "Trending", "BestSeller"],
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
              "price_below": 55565600,
              "price_above": 6044440,
              "min_discount": 40,
              "max_discount": 50,
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["NewArrival", "Fun"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Limited", "Navratri"],
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
          "grouping": "Home Essentials"
        },
        {
          "name": "Pillow",
          "icon": "https://example.com/icons/pillow.png",
          "grouping": "Home Essentials"
        },
        {
          "name": "Bedsheet",
          "icon": "https://example.com/icons/bedsheet.png",
          "grouping": "Home Essentials"
        },
        {
          "name": "Towels",
          "icon": "https://example.com/icons/towels.png",
          "grouping": "Home Essentials"
        },
        {
          "name": "Cushions",
          "icon": "https://example.com/icons/cushions.png",
          "grouping": "Home Decor"
        },
        {
          "name": "Table Linen",
          "icon": "https://example.com/icons/table-linen.png",
          "grouping": "Home Essentials"
        },
        {
          "name": "Wall Art",
          "icon": "https://example.com/icons/wall-art.png",
          "grouping": "Home Decor"
        },
        {
          "name": "Vases",
          "icon": "https://example.com/icons/vases.png",
          "grouping": "Home Decor"
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Garbha", "BestSeller", "KidsSpecial"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Trending", "HotDeal"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["NewArrival", "Fun"],
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
          "grouping": "Casual"
        },
        {
          "name": "Boots",
          "icon": "https://example.com/icons/boots.png",
          "grouping": "Casual"
        },
        {
          "name": "Sandals",
          "icon": "https://example.com/icons/sandals.png",
          "grouping": "Casual"
        },
        {
          "name": "Formal Shoes",
          "icon": "https://example.com/icons/formal-shoes.png",
          "grouping": "Formal"
        },
        {
          "name": "Sports Shoes",
          "icon": "https://example.com/icons/sports-shoes.png",
          "grouping": "Sports"
        },
        {
          "name": "Heels",
          "icon": "https://example.com/icons/heels.png",
          "grouping": "Formal"
        },
        {
          "name": "Flip Flops",
          "icon": "https://example.com/icons/flip-flops.png",
          "grouping": "Casual"
        },
        {
          "name": "Loafers",
          "icon": "https://example.com/icons/loafers.png",
          "grouping": "Casual"
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Navratri", "BestSeller", "Limited"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["HotDeal", "Fun"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Garbha", "NewArrival"],
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
          "grouping": "Cosmetics"
        },
        {
          "name": "Skincare",
          "icon": "https://example.com/icons/skincare.png",
          "grouping": "Cosmetics"
        },
        {
          "name": "Hair Care",
          "icon": "https://example.com/icons/hair-care.png",
          "grouping": "Cosmetics"
        },
        {
          "name": "Fragrances",
          "icon": "https://example.com/icons/fragrances.png",
          "grouping": "Cosmetics"
        },
        {
          "name": "Nail Care",
          "icon": "https://example.com/icons/nail-care.png",
          "grouping": "Cosmetics"
        },
        {
          "name": "Bath & Body",
          "icon": "https://example.com/icons/bath-body.png",
          "grouping": "Cosmetics"
        },
        {
          "name": "Tools & Brushes",
          "icon": "https://example.com/icons/tools-brushes.png",
          "grouping": "Accessories"
        },
        {
          "name": "Men's Grooming",
          "icon": "https://example.com/icons/mens-grooming.png",
          "grouping": "Cosmetics"
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Navratri", "KidsSpecial", "Trending"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["BestSeller", "HotDeal"],
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
              "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Limited", "Fun"],
              "subCategoriesName": "Fragrances"
            }
          ]
        }
      ]
    }
  ]
}

const apiData2 = {
  "products": [
    {
      "id": 31,
      "name": "Men's Classic White T-Shirt",
      "description": "A timeless and versatile 100% cotton white t-shirt, perfect for any wardrobe. A staple for every man.",
      "price": 1499,
      "discountedPrice": 749,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660142393",
      "createdAt": "2025-08-31T17:09:02.395Z",
      "updatedAt": "2025-08-31T17:09:02.395Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["T-Shirt", "Casual", "Everyday Wear", "Classic", "Navratri"],
      "brand": "UrbanThread",
      "color": "White"
    },
    {
      "id": 32,
      "name": "Men's Black Graphic Tee",
      "description": "A comfortable black t-shirt with a minimalist graphic print. Made with soft, breathable cotton.",
      "price": 1799,
      "discountedPrice": 899,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1503341504253-dff489862571?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVuJTIwdCUyMHNoaXJ0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1503341338985-c0477be52513?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1lbiUyMHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660143100",
      "createdAt": "2025-08-31T17:09:03.101Z",
      "updatedAt": "2025-08-31T17:09:03.101Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Graphic Tee", "Casual", "Streetwear", "Minimalist"],
      "brand": "TrendVibe",
      "color": "Black"
    },
    {
      "id": 33,
      "name": "Men's Formal Oxford Shirt",
      "description": "A crisp, slim-fit formal dress shirt made from wrinkle-resistant cotton. Perfect for the office or formal events.",
      "price": 2599,
      "discountedPrice": 1299,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1603252109612-24fa63c053c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lbiUyMHNoaXJ0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1598554747448-3693c35467e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lbiUyMHNoaXJ0fGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660143508",
      "createdAt": "2025-08-31T17:09:03.509Z",
      "updatedAt": "2025-08-31T17:09:03.509Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Formal Shirt", "Office Wear", "Slim Fit", "Professional"],
      "brand": "ClassyFit",
      "color": "White"
    },
    {
      "id": 34,
      "name": "Men's Classic Polo",
      "description": "A classic polo shirt made from breathable pique cotton. A smart-casual essential.",
      "price": 1999,
      "discountedPrice": 999,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1622519360341-35b88849b20d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9sbyUyMHNoaXJ0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1554972302-389547563458?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvbG8lMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660143918",
      "createdAt": "2025-08-31T17:09:03.919Z",
      "updatedAt": "2025-08-31T17:09:03.919Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Polo Shirt", "Smart Casual", "Breathable", "Classic"],
      "brand": "SportyChic",
      "color": "Navy Blue"
    },
    {
      "id": 35,
      "name": "Men's Plaid Flannel Shirt",
      "description": "A soft and warm flannel shirt with a classic plaid pattern. Perfect for layering.",
      "price": 2899,
      "discountedPrice": 1449,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zmxhbm5lbCUyMHNoaXJ0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1587579732858-696a66708767?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Zmxhbm5lbCUyMHNoaXJ0fGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660144234",
      "createdAt": "2025-08-31T17:09:04.235Z",
      "updatedAt": "2025-08-31T17:09:04.235Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Flannel Shirt", "Plaid", "Casual", "Layering"],
      "brand": "RusticWear",
      "color": "Red/Black"
    },
    {
      "id": 36,
      "name": "Men's Crewneck Sweatshirt",
      "description": "A comfortable crewneck sweatshirt featuring a unique graphic print. Made from a soft cotton blend.",
      "price": 3199,
      "discountedPrice": 1599,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1614252366333-c24cca63c2cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHN3ZWF0c2hpcnR8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660144635",
      "createdAt": "2025-08-31T17:09:04.636Z",
      "updatedAt": "2025-08-31T17:09:04.636Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Sweatshirt", "Graphic Print", "Casual", "Cozy"],
      "brand": "CoolVibe",
      "color": "Grey"
    },
    {
      "id": 37,
      "name": "Men's Textured Pullover Sweater",
      "description": "A sophisticated pullover sweater with a unique textured knit. Ideal for smart-casual looks.",
      "price": 3599,
      "discountedPrice": 1799,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1610384104075-e8391c0598b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVucyUyMHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1619208983086-07b97c0f1627?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1lbnMlMjBzd2VhdGVyfGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["M", "L", "XL"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660145042",
      "createdAt": "2025-08-31T17:09:05.043Z",
      "updatedAt": "2025-08-31T17:09:05.043Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Sweater", "Textured Knit", "Smart Casual", "Sophisticated"],
      "brand": "ElegantKnit",
      "color": "Charcoal"
    },
    {
      "id": 38,
      "name": "Men's Henley Long Sleeve",
      "description": "A versatile long-sleeve Henley shirt with a three-button placket. Great for layering or wearing on its own.",
      "price": 2299,
      "discountedPrice": 1149,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1512435288292-a7d5392527b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGVubGV5JTIwc2hpcnR8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1627225793944-383791a9b2b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVubGV5JTIwc2hpcnR8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660145448",
      "createdAt": "2025-08-31T17:09:05.449Z",
      "updatedAt": "2025-08-31T17:09:05.449Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Henley Shirt", "Long Sleeve", "Casual", "Layering"],
      "brand": "UrbanThread",
      "color": "Olive Green"
    },
    {
      "id": 39,
      "name": "Men's Slim-Fit Chinos",
      "description": "Versatile slim-fit chinos crafted from comfortable stretch cotton twill.",
      "price": 3499,
      "discountedPrice": 1749,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbm9zfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbm9zfGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Bottomwear",
      "sizes": ["30", "32", "34", "36"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660145785",
      "createdAt": "2025-08-31T17:09:05.786Z",
      "updatedAt": "2025-08-31T17:09:05.786Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Chinos", "Slim Fit", "Smart Casual", "Versatile"],
      "brand": "ClassyFit",
      "color": "Khaki"
    },
    {
      "id": 40,
      "name": "Men's Performance Joggers",
      "description": "Lightweight and flexible performance joggers designed for comfort and athletics. Features zip pockets.",
      "price": 2999,
      "discountedPrice": 1499,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1563319251-83c9c2f04368?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvZ2dlcnN8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8am9nZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Men",
      "subCategory": "Bottomwear",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660146250",
      "createdAt": "2025-08-31T17:09:06.251Z",
      "updatedAt": "2025-08-31T17:09:06.251Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Joggers", "Athleisure", "Performance", "Casual"],
      "brand": "ActivePulse",
      "color": "Black"
    },
    {
      "id": 41,
      "name": "Men's Cargo Shorts",
      "description": "Durable and practical cargo shorts with multiple pockets for functionality. Perfect for outdoor activities.",
      "price": 2199,
      "discountedPrice": 1099,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1603344287439-447a19c72c1c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyZ28lMjBzaG9ydHN8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1591130901961-369420650989?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyZ28lMjBzaG9ydHN8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Men",
      "subCategory": "Bottomwear",
      "sizes": ["30", "32", "34", "36"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660146566",
      "createdAt": "2025-08-31T17:09:06.567Z",
      "updatedAt": "2025-08-31T17:09:06.567Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Cargo Shorts", "Outdoor", "Casual", "Functional"],
      "brand": "AdventureGear",
      "color": "Olive Green"
    },
    {
      "id": 42,
      "name": "Men's Classic Denim Jeans",
      "description": "Classic straight-fit denim jeans made with durable, high-quality fabric. A wardrobe must-have.",
      "price": 4299,
      "discountedPrice": 2149,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1602293589914-9FF05f8b2ca4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amVhbnN8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8amVhbnN8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Men",
      "subCategory": "Bottomwear",
      "sizes": ["30", "32", "34", "36", "38"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660146885",
      "createdAt": "2025-08-31T17:09:06.885Z",
      "updatedAt": "2025-08-31T17:09:06.885Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Jeans", "Denim", "Classic", "Casual"],
      "brand": "DenimCraft",
      "color": "Blue"
    },
    {
      "id": 43,
      "name": "Men's Classic Denim Jacket",
      "description": "A rugged and timeless denim jacket, perfect for layering in any season. Features chest pockets and button closure.",
      "price": 4599,
      "discountedPrice": 2299,
      "grouping": "Jackets",
      "image": [
        "https://images.unsplash.com/photo-1604176354204-926873782855?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Men",
      "subCategory": "Jackets",
      "sizes": ["M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660147210",
      "createdAt": "2025-08-31T17:09:07.211Z",
      "updatedAt": "2025-08-31T17:09:07.211Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Denim Jacket", "Casual", "Layering", "Classic"],
      "brand": "DenimCraft",
      "color": "Blue"
    },
    {
      "id": 44,
      "name": "Men's Leather Biker Jacket",
      "description": "A classic biker jacket made from genuine leather with durable metal hardware and an asymmetrical zip.",
      "price": 12999,
      "discountedPrice": 6499,
      "grouping": "Jackets",
      "image": [
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Men",
      "subCategory": "Jackets",
      "sizes": ["M", "L", "XL"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660147562",
      "createdAt": "2025-08-31T17:09:07.563Z",
      "updatedAt": "2025-08-31T17:09:07.563Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Leather Jacket", "Biker", "Statement Piece", "Bold"],
      "brand": "RogueWear",
      "color": "Black"
    },
    {
      "id": 45,
      "name": "Men's Lightweight Bomber Jacket",
      "description": "A stylish and lightweight bomber jacket, perfect for transitional weather. Features ribbed cuffs and hem.",
      "price": 5299,
      "discountedPrice": 2649,
      "grouping": "Jackets",
      "image": [
        "https://images.unsplash.com/photo-1591852801-757c3905080b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1517616179509-db7c1514a7db?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww"
      ],
      "category": "Men",
      "subCategory": "Jackets",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660147888",
      "createdAt": "2025-08-31T17:09:07.889Z",
      "updatedAt": "2025-08-31T17:09:07.889Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Bomber Jacket", "Casual", "Transitional", "Lightweight"],
      "brand": "UrbanThread",
      "color": "Navy Blue"
    },
    {
      "id": 46,
      "name": "Women's Ribbed Knit Sweater",
      "description": "A chic and comfortable ribbed knit sweater with classic crewneck design. Perfect for a cozy yet stylish look.",
      "price": 3299,
      "discountedPrice": 1649,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1519409393393-214e2a8298a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdvbWVucyUyMHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW5zJTIwc3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Women",
      "subCategory": "Topwear",
      "sizes": ["XS", "S", "M"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660148214",
      "createdAt": "2025-08-31T17:09:08.215Z",
      "updatedAt": "2025-08-31T17:09:08.215Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Sweater", "Ribbed Knit", "Cozy", "Chic"],
      "brand": "ElegantKnit",
      "color": "Beige"
    },
    {
      "id": 47,
      "name": "Women's Silk Satin Cami",
      "description": "A luxurious and versatile satin camisole top that can be dressed up or down. Features adjustable straps.",
      "price": 1899,
      "discountedPrice": 949,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjB0b3B8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1579744415849-c451b6a15e61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2F0aW4lMjB0b3B8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Topwear",
      "sizes": ["XS", "S", "M"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660148638",
      "createdAt": "2025-08-31T17:09:08.639Z",
      "updatedAt": "2025-08-31T17:09:08.639Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Cami Top", "Satin", "Luxurious", "Versatile"],
      "brand": "SilkVogue",
      "color": "Champagne"
    },
    {
      "id": 48,
      "name": "Women's Off-Shoulder Blouse",
      "description": "A trendy and feminine off-shoulder top made from lightweight, breathable fabric.",
      "price": 2299,
      "discountedPrice": 1149,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1525399938183-5838d7a12391?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2ZmJTIwc2hvdWxkZXIlMjB0b3B8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1563178406-41fb3927b944?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8b2ZmJTIwc2hvdWxkZXIlMjB0b3B8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660149060",
      "createdAt": "2025-08-31T17:09:09.060Z",
      "updatedAt": "2025-08-31T17:09:09.060Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Off-Shoulder", "Blouse", "Feminine", "Trendy"],
      "brand": "ChicAura",
      "color": "White"
    },
    {
      "id": 49,
      "name": "Women's Oversized Graphic T-Shirt",
      "description": "A cool and casual oversized t-shirt with a vintage-inspired graphic. Perfect for a relaxed fit.",
      "price": 1999,
      "discountedPrice": 999,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1554412933-574a44333519?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBncmFwaGljJTIwdGVlfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1581368135215-09b9d12e88a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjBncmFwaGljJTIwdGVlfGVufDB8fDB8fHww"
      ],
      "category": "Women",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660149373",
      "createdAt": "2025-08-31T17:09:09.374Z",
      "updatedAt": "2025-08-31T17:09:09.374Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Graphic Tee", "Oversized", "Casual", "Vintage"],
      "brand": "TrendVibe",
      "color": "Black"
    },
    {
      "id": 50,
      "name": "Women's Classic V-Neck Tee",
      "description": "A soft, everyday v-neck t-shirt made from a premium cotton-modal blend for a flattering drape.",
      "price": 1299,
      "discountedPrice": 649,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1622442442344-35b88849b20d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29tZW4lMjB2JTIwbmVjayUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1589109736809-399a9108c90b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjB2JTIwbmVjayUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Women",
      "subCategory": "Topwear",
      "sizes": ["XS", "S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660149689",
      "createdAt": "2025-08-31T17:09:09.690Z",
      "updatedAt": "2025-08-31T17:09:09.690Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["V-Neck Tee", "Casual", "Everyday Wear", "Soft"],
      "brand": "UrbanThread",
      "color": "White"
    },
    {
      "id": 51,
      "name": "Women's High-Rise Skinny Jeans",
      "description": "Flattering high-rise skinny jeans made with stretch denim for ultimate comfort and style.",
      "price": 3999,
      "discountedPrice": 1999,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8am9nZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpbm55JTIwamVhbnN8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Bottomwear",
      "sizes": ["XS", "S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660150041",
      "createdAt": "2025-08-31T17:09:10.042Z",
      "updatedAt": "2025-08-31T17:09:10.042Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Skinny Jeans", "High-Rise", "Stretch", "Casual"],
      "brand": "DenimCraft",
      "color": "Dark Blue"
    },
    {
      "id": 52,
      "name": "Women's Pleated Midi Skirt",
      "description": "An elegant and versatile pleated midi skirt that flows beautifully with every step.",
      "price": 3799,
      "discountedPrice": 1899,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpcnR8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1583496661160-fb5886a13d74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpcnR8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Bottomwear",
      "sizes": ["S", "M", "L"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660150393",
      "createdAt": "2025-08-31T17:09:10.394Z",
      "updatedAt": "2025-08-31T17:09:10.394Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Midi Skirt", "Pleated", "Elegant", "Versatile"],
      "brand": "ChicAura",
      "color": "Navy Blue"
    },
    {
      "id": 53,
      "name": "Women's Athleisure Leggings",
      "description": "High-waisted, squat-proof leggings designed for performance and style. Features a convenient side pocket.",
      "price": 2499,
      "discountedPrice": 1249,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVnZ2luZ3N8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1506629905607-bb5e3c1e3b8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVnZ2luZ3N8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Bottomwear",
      "sizes": ["XS", "S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660150744",
      "createdAt": "2025-08-31T17:09:10.745Z",
      "updatedAt": "2025-08-31T17:09:10.745Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Leggings", "Athleisure", "High-Waisted", "Performance"],
      "brand": "ActivePulse",
      "color": "Black"
    },
    {
      "id": 54,
      "name": "Women's Wide-Leg Trousers",
      "description": "Effortlessly chic wide-leg trousers that offer both comfort and style. Made from a flowy, lightweight material.",
      "price": 4299,
      "discountedPrice": 2149,
      "grouping": "Bottomwear",
      "image": [
        "https://images.unsplash.com/photo-1594611545628-3b9518a2879f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lkZSUyMGxlZyUyMHRyb3VzZXJzfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1529391409740-59f2618d3d52?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2lkZSUyMGxlZyUyMHRyb3VzZXJzfGVufDB8fDB8fHww"
      ],
      "category": "Women",
      "subCategory": "Bottomwear",
      "sizes": ["S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660151097",
      "createdAt": "2025-08-31T17:09:11.097Z",
      "updatedAt": "2025-08-31T17:09:11.097Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Wide-Leg Trousers", "Chic", "Flowy", "Smart Casual"],
      "brand": "ChicAura",
      "color": "Black"
    },
    {
      "id": 55,
      "name": "Women's Floral Maxi Dress",
      "description": "An elegant floral maxi dress with a flowing silhouette, perfect for summer occasions and beach vacations.",
      "price": 5999,
      "discountedPrice": 2999,
      "grouping": "Dresses",
      "image": [
        "https://images.unsplash.com/photo-1572804013427-4d7ca7268211?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJlc3N8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRyZXNzfGVufDB8fDB8fHww"
      ],
      "category": "Women",
      "subCategory": "Dresses",
      "sizes": ["S", "M", "L"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660151448",
      "createdAt": "2025-08-31T17:09:11.449Z",
      "updatedAt": "2025-08-31T17:09:11.449Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Maxi Dress", "Floral", "Summer", "Elegant"],
      "brand": "BloomVogue",
      "color": "Multicolor"
    },
    {
      "id": 56,
      "name": "Women's Little Black Dress",
      "description": "A stunning and form-fitting bodycon dress for a night out. The quintessential little black dress.",
      "price": 4999,
      "discountedPrice": 2499,
      "grouping": "Dresses",
      "image": [
        "https://images.unsplash.com/photo-1595777457587-43798a6f3152?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjBkcmVzc3xlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1597096051989-3d4c38210e74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxhY2slMjBkcmVzc3xlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Women",
      "subCategory": "Dresses",
      "sizes": ["XS", "S", "M"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660151761",
      "createdAt": "2025-08-31T17:09:11.762Z",
      "updatedAt": "2025-08-31T17:09:11.762Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Bodycon Dress", "Party Wear", "Classic", "Bold"],
      "brand": "ChicAura",
      "color": "Black"
    },
    {
      "id": 57,
      "name": "Women's Stylish Jumpsuit",
      "description": "A stylish and comfortable one-piece jumpsuit perfect for any occasion, from casual outings to evening events.",
      "price": 5499,
      "discountedPrice": 2749,
      "grouping": "Dresses",
      "image": [
        "https://images.unsplash.com/photo-1574695333990-5a34a8e35a11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8anVtcHN1aXR8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1596958414436-3b89b88496ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8anVtcHN1aXR8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Dresses",
      "sizes": ["S", "M", "L"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660152073",
      "createdAt": "2025-08-31T17:09:12.074Z",
      "updatedAt": "2025-08-31T17:09:12.074Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Jumpsuit", "Versatile", "Casual", "Evening Wear"],
      "brand": "TrendVibe",
      "color": "Navy Blue"
    },
    {
      "id": 58,
      "name": "Women's Classic Trench Coat",
      "description": "A sophisticated and timeless double-breasted trench coat for a polished look. Water-resistant fabric.",
      "price": 8999,
      "discountedPrice": 4499,
      "grouping": "Jackets",
      "image": [
        "https://images.unsplash.com/photo-1616852367931-a83d472a74d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJlbmNoJTIwY29hdHxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJlbmNoJTIwY29hdHxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Women",
      "subCategory": "Jackets",
      "sizes": ["S", "M", "L"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660152414",
      "createdAt": "2025-08-31T17:09:12.415Z",
      "updatedAt": "2025-08-31T17:09:12.415Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Trench Coat", "Double-Breasted", "Sophisticated", "Water-Resistant"],
      "brand": "ClassyFit",
      "color": "Beige"
    },
    {
      "id": 59,
      "name": "Women's Cropped Denim Jacket",
      "description": "A modern cropped denim jacket perfect for layering over dresses or tops. A trendy twist on a classic.",
      "price": 4799,
      "discountedPrice": 2399,
      "grouping": "Jackets",
      "image": [
        "https://images.unsplash.com/photo-1606760227091-3ddc9ac882b4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHBlZCUyMGRlbmltJTIwamFja2V0fGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1595950653106-6c986e588e2f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Women",
      "subCategory": "Jackets",
      "sizes": ["XS", "S", "M"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660152826",
      "createdAt": "2025-08-31T17:09:12.827Z",
      "updatedAt": "2025-08-31T17:09:12.827Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Denim Jacket", "Cropped", "Trendy", "Layering"],
      "brand": "DenimCraft",
      "color": "Blue"
    },
    {
      "id": 60,
      "name": "Unisex Oversized Hoodie",
      "description": "A cozy and stylish oversized hoodie made from a premium fleece blend. Perfect for a relaxed, comfortable fit.",
      "price": 4999,
      "discountedPrice": 2499,
      "grouping": "Topwear",
      "image": [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG9vZGllfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHxlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Unisex",
      "subCategory": "Topwear",
      "sizes": ["M", "L", "XL", "XXL"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660153850",
      "createdAt": "2025-08-31T17:09:13.850Z",
      "updatedAt": "2025-08-31T17:09:13.850Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Hoodie", "Oversized", "Cozy", "Casual"],
      "brand": "CoolVibe",
      "color": "Grey"
    },
    {
      "id": 61,
      "name": "Unisex Classic Beanie",
      "description": "A soft, warm, and stylish ribbed beanie hat perfect for cold weather. Made from 100% acrylic yarn.",
      "price": 999,
      "discountedPrice": 499,
      "grouping": "Accessories",
      "image": [
        "https://images.unsplash.com/photo-1575428652377-a3d80e281498?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhbmllfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhbmllfGVufDB8fDB8fHww"
      ],
      "category": "Unisex",
      "subCategory": "Accessories",
      "sizes": ["One Size"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660154259",
      "createdAt": "2025-08-31T17:09:14.260Z",
      "updatedAt": "2025-08-31T17:09:14.260Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Beanie", "Winter", "Casual", "Warm"],
      "brand": "UrbanThread",
      "color": "Black"
    },
    {
      "id": 62,
      "name": "Unisex Low-Top Sneakers",
      "description": "Versatile and comfortable low-top sneakers that complement any casual outfit. Features a durable canvas upper.",
      "price": 3499,
      "discountedPrice": 1749,
      "grouping": "Footwear",
      "image": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1595950653106-6c986e588e2f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D"
      ],
      "category": "Unisex",
      "subCategory": "Footwear",
      "sizes": ["7", "8", "9", "10", "11"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660154669",
      "createdAt": "2025-08-31T17:09:14.670Z",
      "updatedAt": "2025-08-31T17:09:14.670Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Sneakers", "Low-Top", "Casual", "Versatile"],
      "brand": "StepVibe",
      "color": "White"
    },
    {
      "id": 63,
      "name": "Unisex Canvas Tote Bag",
      "description": "A durable and spacious canvas tote bag for everyday use. Features an internal pocket for small items.",
      "price": 1599,
      "discountedPrice": 799,
      "grouping": "Accessories",
      "image": [
        "https://images.unsplash.com/photo-1544813545-169b433b7d76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dG90ZSUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1572196289918-f8a84a3234a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dG90ZSUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Unisex",
      "subCategory": "Accessories",
      "sizes": ["One Size"],
      "bestseller": false,
      "isActive": true,
      "stock": 100,
      "date": "1756660155076",
      "createdAt": "2025-08-31T17:09:15.077Z",
      "updatedAt": "2025-08-31T17:09:15.077Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Tote Bag", "Canvas", "Everyday Use", "Functional"],
      "brand": "EcoCarry",
      "color": "Natural"
    },
    {
      "id": 64,
      "name": "Unisex Aviator Sunglasses",
      "description": "Classic aviator sunglasses with polarized lenses for 100% UV protection. Timeless style.",
      "price": 2499,
      "discountedPrice": 1249,
      "grouping": "Accessories",
      "image": [
        "https://images.unsplash.com/photo-1577803645773-f92475de7001?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D"
      ],
      "category": "Unisex",
      "subCategory": "Accessories",
      "sizes": ["One Size"],
      "bestseller": true,
      "isActive": true,
      "stock": 100,
      "date": "1756660155389",
      "createdAt": "2025-08-31T17:09:15.389Z",
      "updatedAt": "2025-08-31T17:09:15.389Z",
      "ageGroupStart": 15,
              "ageGroupEnd": 25,
              "tags": ["Sunglasses", "Aviator", "Classic", "Polarized"],
      "brand": "SunVibe",
      "color": "Silver/Black"
    }
  ]
}

const availableTopDealImages = ["/w1.svg", "/w2.svg", "/w3.svg", "/w4.svg", "/product.jpg", "/casual.jpg", "/formal-men.jpg"]
const availableCategoryImages = ["/h1.svg", "/h2.svg", "/h3.svg", "/h4.svg", "/w1.svg", "/w2.svg", "/w3.svg", "/w4.svg"]

// Handle offer click to store offerType in sessionStorage
const handleOfferClick = (offerType) => {
  sessionStorage.setItem('currentOfferTypeFilters', JSON.stringify(offerType));
};

// Top Deals - show ONLY products with offers OR tags
const topDealsByCategory = apiData.categories
  .map((cat, catIndex) => ({
    categoryName: cat.name,
    offers: cat.offers
      .flatMap((offer, offerIndex) => {
        const matchingSubCategory = cat.subCategories.find(
          (sub) => sub.name === offer.offerType?.[0]?.subCategoriesName
        );

        if (matchingSubCategory) {
          return [
            {
              id: `${cat.name}-${matchingSubCategory.name}-${offerIndex}`,
              productId: catIndex * 10 + offerIndex + 1,
              title: matchingSubCategory.name, // Subcategory to show and pass in URL
              image:
                availableTopDealImages[(catIndex + offerIndex) % availableTopDealImages.length] ||
                '/placeholder.svg',
              badge: offer.offerType?.[0]?.tags?.[0] || null, // First tag only
              offerType: offer.offerType, // Full offerType for sessionStorage
            },
          ];
        }
        return [];
      })
      .filter((item) => item.badge), // Only include items with a valid tag
  }))
  .filter((categoryGroup) => categoryGroup.offers.length > 0);
const categoriesByCategory = apiData.categories.map((cat, catIndex) => ({
  categoryName: cat.name,
  subCategories: cat.subCategories.map((sub, subIndex) => ({
    id: `${cat.name}-${sub.name}-${subIndex}`,
    productId: catIndex * 10 + subIndex + 1,
    title: sub.name,
    image: availableCategoryImages[(catIndex * 3 + subIndex) % availableCategoryImages.length],
    badge: null, // No badges in Shop by Category - keep it clean
    discount: "" // No discount display in Shop by Category
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

const getOfferTags = (offer) => {
  if (!offer.offerType || !Array.isArray(offer.offerType)) return '';
  const allTags = offer.offerType.flatMap(type => type.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.join(',');
};


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
      <div className="hidden md:block">
        {/* Desktop Hero - keep as is */}
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

      {/* Mobile-optimized content for ALL tab */}
      <div className="block sm:hidden">
        {/* Compact Mobile Hero Carousel */}
        <div className="relative h-[280px] mx-4 mb-4 rounded-2xl overflow-hidden">
          <Image
            src={heroSlides[currentSlide].image || "/placeholder.svg"}
            alt="Hero"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-xl font-bold mb-1">{heroSlides[currentSlide].title}</h1>
            <p className="text-sm mb-3 opacity-90">{heroSlides[currentSlide].subtitle}</p>
            <Button className="bg-[#f05a2b] hover:bg-[#de491a] text-white rounded-full px-4 py-2 text-sm">
              {heroSlides[currentSlide].buttonText} →
            </Button>
          </div>
        </div>

        {/* Compact Pagination Dots */}
        <div className="flex justify-center space-x-2 py-2 mb-4">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? "bg-[#f05a2b]" : "bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Promotional banner modal */}
      <PromotionalBanner isOpen={showPromoBanner} onClose={() => setShowPromoBanner(false)} />

      {/* ₹300 OFF banner - compact mobile version */}
      <section className="px-4 md:px-6 lg:px-20 mb-4">
        <div
          className="relative h-[180px] sm:h-[260px] md:h-[360px] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          onClick={() => setShowPromoBanner(true)}
        >
          <Image src="/casual.jpg" alt="Flat 300 OFF" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-4 sm:px-8 max-w-xl text-white">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-serif font-semibold leading-tight">
                Flat ₹300 OFF - on your first purchase
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-200">
                Discover fashion that reflects your value style.
              </p>
              <div className="mt-3 sm:mt-5">
                <Button className="w-full sm:w-auto rounded-full bg-[#f05a2b] hover:bg-[#de491a] text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                  Click for Offer →
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 text-white text-xs">
            Click me!
          </div>
        </div>
      </section>

      {/* Collections mosaic - simplified for mobile */}
      <section className="px-4 sm:px-6 lg:px-20 relative mb-4">
        <div
          className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 bg-[#ff6a1a] text-white px-3 py-2 rounded-l-md font-semibold tracking-wider [writing-mode:vertical-rl]"
          onClick={() => setShowPromoBanner(true)}
        >
          UPTO ₹300 OFF
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative h-[160px] sm:h-[200px] rounded-2xl overflow-hidden">
            <Image src="/w1.svg" alt="Long Sleeve T-Shirt" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-6 flex items-end">
              <div>
                <p className="text-white/80 text-xs mb-1">Women&apos;s Collections</p>
                <h3 className="text-white text-lg sm:text-xl font-semibold">Long Sleeve T-Shirt</h3>
                <Link href="/productlist" className="inline-block mt-2">
                  <span className="text-white text-xs underline">Explore Now →</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative h-[120px] sm:h-[150px] rounded-2xl overflow-hidden">
              <Image src="/product.jpg" alt="Half Sleeve Shirt" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">Men&apos;s Collections</p>
                  <h4 className="text-white text-sm sm:text-base font-semibold">Half Sleeve Shirt</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
            <div className="relative h-[120px] sm:h-[150px] rounded-2xl overflow-hidden">
              <Image src="/w4.svg" alt="Polo T-Shirt" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">T-shirt Collections</p>
                  <h4 className="text-white text-sm sm:text-base font-semibold">Polo T-Shirt</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
            <div className="relative h-[120px] sm:h-[150px] col-span-2 rounded-2xl overflow-hidden">
              <Image src="/w3.svg" alt="Denim-Jacket" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-4 flex items-end">
                <div>
                  <p className="text-white/80 text-[10px]">Denim Collections</p>
                  <h4 className="text-white text-base sm:text-lg font-semibold">Denim-Jacket</h4>
                  <span className="text-white text-[10px] underline">Explore Now →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand strip - compact mobile version */}
      <section className="px-4 sm:px-6 lg:px-20 mt-4 mb-4">
        <div className="w-full rounded-lg bg-gray-100 px-3 py-2 grid grid-cols-3 gap-2 items-center justify-items-center sm:flex sm:justify-around">
          {["/adidas.svg", "/puma.svg", "/n.svg"].map((src, idx) => (
            <div key={idx} className="h-5 opacity-70">
              <Image
                src={src || "/placeholder.svg"}
                alt={`brand-${idx}`}
                width={60}
                height={20}
                className="object-contain w-auto h-5"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Top Deals - limited to 3 per category for mobile */}
<section className="px-4 sm:px-6 lg:px-20 mt-8 mb-4">
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-semibold">Top Deals</h3>
        <p className="text-sm text-gray-600">Effortless style, inspired by the future of fashion</p>
      </div>

      <div className="space-y-6">
        {topDealsByCategory.slice(0, 3).map((categoryGroup) => {
          const isExpanded = expandedCategories.has(categoryGroup.categoryName);
          const displayedOffers = isExpanded ? categoryGroup.offers : categoryGroup.offers.slice(0, 3);
          const hasMore = categoryGroup.offers.length > 3;

          return (
            <div key={categoryGroup.categoryName}>
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">
                {categoryGroup.categoryName}
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {displayedOffers.map((item) => (
                  <Link
                    key={item.id}
                    href={{
                      pathname: '/productlist',
                      query: {
                        category: categoryGroup.categoryName,
                        subCategory: item.title,
                        offerTag: item.badge || '', // First tag only
                      },
                    }}
                    onClick={() => handleOfferClick(item.offerType)}
                  >
                    <Card className="bg-transparent border-none shadow-none p-0 hover:shadow-lg transition-shadow duration-300">
                      <div className="relative h-32 sm:h-36 md:h-36 lg:h-40 xl:h-44 rounded-lg md:rounded-[18px] overflow-hidden bg-white">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                        {item.badge && (
                          <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-2 md:px-3 py-1 rounded-md">
                            {item.badge}
                          </div>
                        )}
                      </div>
                      <CardContent className="px-2 pt-3 pb-2 md:px-2 md:pt-3 md:pb-2">
                        <p className="text-xs md:text-sm text-gray-700 font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Special Offer</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent hover:bg-gray-50"
                    onClick={() => {
                      setExpandedCategories((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(categoryGroup.categoryName)) {
                          newSet.delete(categoryGroup.categoryName);
                        } else {
                          newSet.add(categoryGroup.categoryName);
                        }
                        return newSet;
                      });
                    }}
                  >
                    {isExpanded ? 'See Less' : 'See More'} →
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

      {/* Shop by Category - limited for mobile */}
      <section className="px-4 sm:px-6 lg:px-20 mt-8 mb-8">
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-semibold">Shop by Category</h3>
          <p className="text-sm text-gray-600">Style, inspired by the future of fashion</p>
        </div>
        <div className="space-y-6">
          {categoriesByCategory.slice(0, 5).map((categoryGroup) => { // Show first 5 categories
            const isExpanded = expandedCategories.has(categoryGroup.categoryName)
            const displayedSubCategories = isExpanded ? categoryGroup.subCategories : categoryGroup.subCategories.slice(0, 6) // Show 6 initially, all when expanded
            const hasMore = categoryGroup.subCategories.length > 6

            return (
              <div key={categoryGroup.categoryName}>
                <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">{categoryGroup.categoryName}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {displayedSubCategories.map((item) => {
                    return (
                      <Link key={item.id} href={`/productlist?category=${encodeURIComponent(categoryGroup.categoryName)}&subcategory=${encodeURIComponent(item.title)}`}>
                        <Card className="bg-transparent border-none shadow-none p-0 hover:shadow-lg transition-shadow duration-300">
                          <div className="relative h-24 sm:h-28 md:h-36 lg:h-40 xl:h-44 rounded-lg md:rounded-[18px] overflow-hidden bg-white">
                            <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            {item.badge && (
                              <div className="absolute top-3 left-3 bg-[#ff7a2a] text-white text-xs font-semibold px-3 py-1 rounded-md">
                                {item.badge}
                              </div>
                            )}
                          </div>
                          <CardContent className="px-1 md:px-2 pt-2 pb-1 md:pt-3 md:pb-2">
                            <p className="text-xs md:text-sm text-gray-700 font-medium text-center truncate">{item.title}</p>
                            
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

      {/* Why Choose Us - compact mobile version
      <section className="px-4 py-6 bg-[#101820] text-white rounded-t-2xl mt-4">
        <h3 className="text-2xl font-serif mb-1">Why Choose Us</h3>
        <p className="text-xs text-gray-300 mb-4">Fashion You Can Feel Good About</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              title: "Ethical Production",
              desc: "Fair-trade certified facilities",
              icon: "/globe.svg",
            },
            {
              title: "Quality You Can Trust",
              desc: "High-quality, long-lasting",
              icon: "/file.svg",
            },
            {
              title: "Sustainable Materials",
              desc: "Eco-friendly fabrics",
              icon: "/globe.svg",
            },
            {
              title: "Innovations",
              desc: "Always improving sustainability",
              icon: "/window.svg",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white text-[#0f1520] rounded-lg p-3 flex gap-2 items-start">
              <Image src={f.icon || "/placeholder.svg"} alt={f.title} width={20} height={20} className="mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-0.5">{f.title}</p>
                <p className="text-xs text-gray-600 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}
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
          </>
        )}
      </div>

      {renderTabContent()}
    </div>
  )
}
