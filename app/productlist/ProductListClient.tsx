"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Heart,
  ChevronDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
  selectIsInWishlist,
} from "@/lib/store/wishlistSlice";
import { useNavbarCounts } from "@/contexts/NavbarCountsContext";
import { useLoading } from "@/contexts/LoadingContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discountPercent?: number;
  ageGroupStart?: number;
  ageGroupEnd?: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  color: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew: boolean;
  badge?: string;
  tags: string[];
  isActive: boolean;
  brand: string;
  bestseller?: boolean;
  grouping?: string;
}

interface OfferType {
  price_below?: number;
  price_above?: number;
  min_discount?: number;
  max_discount?: number;
  tags?: string[];
  subCategoriesName?: string;
  ageGroupStart?: number;
  ageGroupEnd?: number;
}

interface WishlistEntry {
  productId: number;
}

interface ProductListClientProps {
  category?: "Men" | "Women" | "Kids" | "Home" | "Accessories" | "All";
  searchParams?: { [key: string]: string | string[] | undefined };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com";

const authHeaders = () => {
  if (typeof window === "undefined")
    return { "Content-Type": "application/json" };
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const showToast = (msg: string, success = true) => {
  if (typeof window === "undefined") return;
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
    success ? "bg-green-600" : "bg-red-600"
  }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

export default function ProductListClient({
  category,
  searchParams,
}: ProductListClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Extract category and filters from search parameters or props
  const activeCategory = (searchParams?.category as string) || category || "All";
  const subCategory = (searchParams?.subCategory as string) || (searchParams?.subcategory as string) || "";
  const offerTag = (searchParams?.offerTag as string) || "";
  const initialOffer = searchParams?.offer as string;
  const initialPriceMin = searchParams?.priceMin as string;
  const initialPriceMax = searchParams?.priceMax as string;
  const initialSizes = searchParams?.sizes
    ? Array.isArray(searchParams.sizes)
      ? searchParams.sizes
      : [searchParams.sizes]
    : [];
  const initialColors = searchParams?.colors
    ? Array.isArray(searchParams.colors)
      ? searchParams.colors
      : [searchParams.colors]
    : [];
  const initialBrands = searchParams?.brands
    ? Array.isArray(searchParams.brands)
      ? searchParams.brands
      : [searchParams.brands]
    : [];
  const initialSort = (searchParams?.sort as string) || "Newest";

  // Context for refreshing navbar counts
  const { refreshWishlistCount, refreshCartCount } = useNavbarCounts();

  // Global loading context
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(initialPriceMin || "");
  const [maxPrice, setMaxPrice] = useState(initialPriceMax || "");
  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState(initialSort);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [apiWishlistItems, setApiWishlistItems] = useState<Set<number>>(
    new Set()
  );
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilterSection, setExpandedFilterSection] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Cart count state
  const [cartCount, setCartCount] = useState<number>(0);

  // Determine authentication status
  const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  };

  // Get wishlist items based on authentication status
const wishlistItemsFromStore = useAppSelector(selectWishlistItems).map((item) => item.id);

const wishlistItems = isAuthenticated()
  ? apiWishlistItems
  : new Set(wishlistItemsFromStore);


  // Function to update URL with current filters
  const updateURLParams = (
    newParams: Record<string, string | string[] | null>
  ) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    Object.keys(newParams).forEach((key) => {
      searchParams.delete(key);
    });

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach((v) => searchParams.append(key, v));
          }
        } else {
          searchParams.set(key, value);
        }
      }
    });

    const newUrl = `${url.pathname}?${searchParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  // Function to build API query parameters
  const buildAPIQueryString = () => {
    const params = new URLSearchParams();

    if (activeCategory && activeCategory !== "All") {
      params.set("category", activeCategory);
    }

    if (minPrice) params.set("priceMin", minPrice);
    if (maxPrice) params.set("priceMax", maxPrice);

    if (selectedSizes.length > 0) {
      selectedSizes.forEach((size) => params.append("sizes", size));
    }

    if (selectedBrands.length > 0) {
      selectedBrands.forEach((brand) => params.append("brands", brand));
    }

    if (initialOffer) {
      params.set("offer", initialOffer);
    }

    if (selectedCategories.includes("Hot Deals")) {
      params.set("bestseller", "true");
    }

    const searchQuery = searchParams?.q as string;
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    let apiSortBy = "createdAt";
    let apiSortOrder = "desc";

    switch (sortBy) {
      case "Sort: Price Low to High":
        apiSortBy = "price";
        apiSortOrder = "asc";
        break;
      case "Sort: Price High to Low":
        apiSortBy = "price";
        apiSortOrder = "desc";
        break;
      case "Sort: Most Popular":
        apiSortBy = "rating";
        apiSortOrder = "desc";
        break;
      case "Sort: Newest":
      default:
        apiSortBy = "createdAt";
        apiSortOrder = "desc";
        break;
    }

    params.set("sortBy", apiSortBy);
    params.set("sortOrder", apiSortOrder);

    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    return params.toString();
  };

  // Function to get offer details from session storage
  const getOfferDetails = () => {
    if (typeof window === "undefined") return null;
    const offerData = sessionStorage.getItem("offer");
    if (!offerData) return null;
    try {
      const parsed = JSON.parse(offerData);
      return parsed.offerType && parsed.offerType.length > 0 ? parsed : null;
    } catch (e) {
      console.error("Error parsing offer from sessionStorage:", e);
      return null;
    }
  };

  // Save offer to session storage when offerTag is present
  useEffect(() => {
    if (offerTag && typeof window !== "undefined") {
      const existingOffer = sessionStorage.getItem("offer");
      if (!existingOffer) {
        // Assuming the offer data is passed or available; here we use the provided example
        const offerData = {
          name: "10-60% Discount",
          icon: "https://example.com/icons/discount.png",
          grouping: "Offers",
          offerType: [
            {
              price_below: 5000,
              price_above: 200,
              min_discount: 10,
              max_discount: 60,
              ageGroupStart: 15,
              ageGroupEnd: 25,
              tags: ["Navratri", "BestSeller", "HotDeal"],
              subCategoriesName: "T-Shirt",
            },
          ],
        };
        sessionStorage.setItem("offer", JSON.stringify(offerData));
      }
    }
  }, [offerTag]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const queryString = buildAPIQueryString();
        const apiUrl = `${API_BASE}/api/product/list${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(apiUrl, { headers: authHeaders() });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

const data = {
          success: true,
          products: [
            {
              id: 31,
              name: "Men's Classic White T-Shirt",
              description:
                "A timeless and versatile 100% cotton white t-shirt, perfect for any wardrobe. A staple for every man.",
              price: 1499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "T-Shirt",
              sizes: ["S", "M", "L", "XL", "XXL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660142393",
              createdAt: "2025-08-31T17:09:02.395Z",
              updatedAt: "2025-08-31T17:09:02.395Z",
              tags: ["Navratri", "Trending", "HotDeal"],
              brand: "UrbanThread",
              color: ["White", "Green", "Blue"],
            },
            {
              id: 32,
              name: "Men's Black Graphic Tee",
              description:
                "A comfortable black t-shirt with a minimalist graphic print. Made with soft, breathable cotton.",
              price: 1799,
              discountedPrice: 1299,
              discountPercent: 10,
              ageGroupStart: 15,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1503341504253-dff489862571?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVuJTIwdCUyMHNoaXJ0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1503341338985-c0477be52513?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1lbiUyMHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "T-Shirt",
              sizes: ["S", "M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660143100",
              createdAt: "2025-08-31T17:09:03.101Z",
              updatedAt: "2025-08-31T17:09:03.101Z",
              tags: ["NewArrival"],
              brand: "TrendVibe",
              color: ["Black"],
            },
            {
              id: 33,
              name: "Men's Formal Oxford Shirt",
              description:
                "A crisp, slim-fit formal dress shirt made from wrinkle-resistant cotton. Perfect for the office or formal events.",
              price: 2599,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1603252109612-24fa63c053c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lbiUyMHNoaXJ0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1598554747448-3693c35467e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lbiUyMHNoaXJ0fGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Shirt",
              sizes: ["M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660143508",
              createdAt: "2025-08-31T17:09:03.509Z",
              updatedAt: "2025-08-31T17:09:03.509Z",
              tags: ["HotDeal", "Limited"],
              brand: "ClassyFit",
              color: ["White"],
            },
            {
              id: 34,
              name: "Men's Classic Polo",
              description:
                "A classic polo shirt made from breathable pique cotton. A smart-casual essential.",
              price: 1999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1622519360341-35b88849b20d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9sbyUyMHNoaXJ0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1554972302-389547563458?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvbG8lMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Polo Shirt",
              sizes: ["S", "M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660143918",
              createdAt: "2025-08-31T17:09:03.919Z",
              updatedAt: "2025-08-31T17:09:03.919Z",
              tags: ["Trending", "NewArrival"],
              brand: "SportyChic",
              color: "Navy Blue",
            },
            {
              id: 35,
              name: "Men's Plaid Flannel Shirt",
              description:
                "A soft and warm flannel shirt with a classic plaid pattern. Perfect for layering.",
              price: 2899,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zmxhbm5lbCUyMHNoaXJ0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1587579732858-696a66708767?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Zmxhbm5lbCUyMHNoaXJ0fGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Shirt",
              sizes: ["M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660144234",
              createdAt: "2025-08-31T17:09:04.235Z",
              updatedAt: "2025-08-31T17:09:04.235Z",
              tags: [],
              brand: "RusticWear",
              color: "Red/Black",
            },
            {
              id: 36,
              name: "Men's Crewneck Sweatshirt",
              description:
                "A comfortable crewneck sweatshirt featuring a unique graphic print. Made from a soft cotton blend.",
              price: 3199,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1614252366333-c24cca63c2cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHN3ZWF0c2hpcnR8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Sweatshirt",
              sizes: ["S", "M", "L"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660144635",
              createdAt: "2025-08-31T17:09:04.636Z",
              updatedAt: "2025-08-31T17:09:04.636Z",
              tags: ["Navratri"],
              brand: "CoolVibe",
              color: "Grey",
            },
            {
              id: 37,
              name: "Men's Textured Pullover Sweater",
              description:
                "A sophisticated pullover sweater with a unique textured knit. Ideal for smart-casual looks.",
              price: 3599,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1610384104075-e8391c0598b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVucyUyMHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1619208983086-07b97c0f1627?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1lbnMlMjBzd2VhdGVyfGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Sweater",
              sizes: ["M", "L", "XL"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660145042",
              createdAt: "2025-08-31T17:09:05.043Z",
              updatedAt: "2025-08-31T17:09:05.043Z",
              tags: ["Limited", "HotDeal"],
              brand: "ElegantKnit",
              color: "Charcoal",
            },
            {
              id: 38,
              name: "Men's Henley Long Sleeve",
              description:
                "A versatile long-sleeve Henley shirt with a three-button placket. Great for layering or wearing on its own.",
              price: 2299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1512435288292-a7d5392527b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGVubGV5JTIwc2hpcnR8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1627225793944-383791a9b2b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVubGV5JTIwc2hpcnR8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Men",
              grouping: "Topwear",
              subcategory: "Shirt",
              sizes: ["S", "M", "L", "XL"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660145448",
              createdAt: "2025-08-31T17:09:05.449Z",
              updatedAt: "2025-08-31T17:09:05.449Z",
              tags: ["Trending"],
              brand: "UrbanThread",
              color: "Olive Green",
            },
            {
              id: 39,
              name: "Men's Slim-Fit Chinos",
              description:
                "Versatile slim-fit chinos crafted from comfortable stretch cotton twill.",
              price: 3499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbm9zfGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbm9zfGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Bottomwear",
              subcategory: "Trousers",
              sizes: ["30", "32", "34", "36"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660145785",
              createdAt: "2025-08-31T17:09:05.786Z",
              updatedAt: "2025-08-31T17:09:05.786Z",
              tags: ["Navratri", "HotDeal"],
              brand: "ClassyFit",
              color: "Khaki",
            },
            {
              id: 40,
              name: "Men's Performance Joggers",
              description:
                "Lightweight and flexible performance joggers designed for comfort and athletics. Features zip pockets.",
              price: 2999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1563319251-83c9c2f04368?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvZ2dlcnN8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8am9nZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Men",
              grouping: "Bottomwear",
              subcategory: "Joggers",
              sizes: ["S", "M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660146250",
              createdAt: "2025-08-31T17:09:06.251Z",
              updatedAt: "2025-08-31T17:09:06.251Z",
              tags: ["NewArrival", "Limited"],
              brand: "ActivePulse",
              color: "Black",
            },
            {
              id: 41,
              name: "Men's Cargo Shorts",
              description:
                "Durable and practical cargo shorts with multiple pockets for functionality. Perfect for outdoor activities.",
              price: 2199,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1603344287439-447a19c72c1c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyZ28lMjBzaG9ydHN8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1591130901961-369420650989?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyZ28lMjBzaG9ydHN8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Men",
              grouping: "Bottomwear",
              subcategory: "Shorts",
              sizes: ["30", "32", "34", "36"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660146566",
              createdAt: "2025-08-31T17:09:06.567Z",
              updatedAt: "2025-08-31T17:09:06.567Z",
              tags: [],
              brand: "AdventureGear",
              color: "Olive Green",
            },
            {
              id: 42,
              name: "Men's Classic Denim Jeans",
              description:
                "Classic straight-fit denim jeans made with durable, high-quality fabric. A wardrobe must-have.",
              price: 4299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1602293589914-9FF05f8b2ca4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amVhbnN8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8amVhbnN8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Men",
              grouping: "Bottomwear",
              subcategory: "Jeans",
              sizes: ["30", "32", "34", "36", "38"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660146885",
              createdAt: "2025-08-31T17:09:06.885Z",
              updatedAt: "2025-08-31T17:09:06.885Z",
              tags: ["Navratri", "Trending", "NewArrival"],
              brand: "DenimCraft",
              color: "Blue",
            },
            {
              id: 43,
              name: "Men's Classic Denim Jacket",
              description:
                "A rugged and timeless denim jacket, perfect for layering in any season. Features chest pockets and button closure.",
              price: 4599,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1604176354204-926873782855?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Men",
              grouping: "Jackets",
              subcategory: "Jacket",
              sizes: ["M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660147210",
              createdAt: "2025-08-31T17:09:07.211Z",
              updatedAt: "2025-08-31T17:09:07.211Z",
              tags: ["HotDeal"],
              brand: "DenimCraft",
              color: "Blue",
            },
            {
              id: 44,
              name: "Men's Leather Biker Jacket",
              description:
                "A classic biker jacket made from genuine leather with durable metal hardware and an asymmetrical zip.",
              price: 12999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Men",
              grouping: "Jackets",
              subcategory: "Jacket",
              sizes: ["M", "L", "XL"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660147562",
              createdAt: "2025-08-31T17:09:07.563Z",
              updatedAt: "2025-08-31T17:09:07.563Z",
              tags: ["Limited", "Trending"],
              brand: "RogueWear",
              color: "Black",
            },
            {
              id: 45,
              name: "Men's Lightweight Bomber Jacket",
              description:
                "A stylish and lightweight bomber jacket, perfect for transitional weather. Features ribbed cuffs and hem.",
              price: 5299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1591852801-757c3905080b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1517616179509-db7c1514a7db?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww",
              ],
              category: "Men",
              grouping: "Jackets",
              subcategory: "Jacket",
              sizes: ["S", "M", "L", "XL"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660147888",
              createdAt: "2025-08-31T17:09:07.889Z",
              updatedAt: "2025-08-31T17:09:07.889Z",
              tags: ["Navratri", "NewArrival", "HotDeal"],
              brand: "UrbanThread",
              color: "Navy Blue",
            },
            {
              id: 46,
              name: "Women's Ribbed Knit Sweater",
              description:
                "A chic and comfortable ribbed knit sweater with classic crewneck design. Perfect for a cozy yet stylish look.",
              price: 3299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1519409393393-214e2a8298a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdvbWVucyUyMHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW5zJTIwc3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Women",
              grouping: "Topwear",
              subcategory: "Sweater",
              sizes: ["XS", "S", "M"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660148214",
              createdAt: "2025-08-31T17:09:08.215Z",
              updatedAt: "2025-08-31T17:09:08.215Z",
              tags: ["Trending"],
              brand: "ElegantKnit",
              color: "Beige",
            },
            {
              id: 47,
              name: "Women's Silk Satin Cami",
              description:
                "A luxurious and versatile satin camisole top that can be dressed up or down. Features adjustable straps.",
              price: 1899,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjB0b3B8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1579744415849-c451b6a15e61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2F0aW4lMjB0b3B8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Topwear",
              subcategory: "Cami Top",
              sizes: ["XS", "S", "M"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660148638",
              createdAt: "2025-08-31T17:09:08.639Z",
              updatedAt: "2025-08-31T17:09:08.639Z",
              tags: ["Navratri", "HotDeal", "Limited"],
              brand: "SilkVogue",
              color: "Champagne",
            },
            {
              id: 48,
              name: "Women's Off-Shoulder Blouse",
              description:
                "A trendy and feminine off-shoulder top made from lightweight, breathable fabric.",
              price: 2299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1525399938183-5838d7a12391?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2ZmJTIwc2hvdWxkZXIlMjB0b3B8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1563178406-41fb3927b944?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8b2ZmJTIwc2hvdWxkZXIlMjB0b3B8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Topwear",
              subcategory: "Blouse",
              sizes: ["S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660149060",
              createdAt: "2025-08-31T17:09:09.060Z",
              updatedAt: "2025-08-31T17:09:09.060Z",
              tags: ["NewArrival"],
              brand: "ChicAura",
              color: "White",
            },
            {
              id: 49,
              name: "Women's Oversized Graphic T-Shirt",
              description:
                "A cool and casual oversized t-shirt with a vintage-inspired graphic. Perfect for a relaxed fit.",
              price: 1999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1554412933-574a44333519?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBncmFwaGljJTIwdGVlfGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1581368135215-09b9d12e88a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjBncmFwaGljJTIwdGVlfGVufDB8fDB8fHww",
              ],
              category: "Women",
              grouping: "Topwear",
              subcategory: "T-Shirt",
              sizes: ["S", "M", "L", "XL"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660149373",
              createdAt: "2025-08-31T17:09:09.374Z",
              updatedAt: "2025-08-31T17:09:09.374Z",
              tags: [],
              brand: "TrendVibe",
              color: "Black",
            },
            {
              id: 50,
              name: "Women's Classic V-Neck Tee",
              description:
                "A soft, everyday v-neck t-shirt made from a premium cotton-modal blend for a flattering drape.",
              price: 1299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1622442442344-35b88849b20d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29tZW4lMjB2JTIwbmVjayUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1589109736809-399a9108c90b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjB2JTIwbmVjayUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Women",
              grouping: "Topwear",
              subcategory: "Kurta",
              sizes: ["XS", "S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660149689",
              createdAt: "2025-08-31T17:09:09.690Z",
              updatedAt: "2025-08-31T17:09:09.690Z",
              tags: ["Navratri", "Trending"],
              brand: "UrbanThread",
              color: "White",
            },
            {
              id: 51,
              name: "Women's High-Rise Skinny Jeans",
              description:
                "Flattering high-rise skinny jeans made with stretch denim for ultimate comfort and style.",
              price: 3999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8am9nZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpbm55JTIwamVhbnN8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Bottomwear",
              subcategory: "Jeans",
              sizes: ["XS", "S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660150041",
              createdAt: "2025-08-31T17:09:10.042Z",
              updatedAt: "2025-08-31T17:09:10.042Z",
              tags: ["HotDeal", "NewArrival", "Limited"],
              brand: "DenimCraft",
              color: "Dark Blue",
            },
            {
              id: 52,
              name: "Women's Pleated Midi Skirt",
              description:
                "An elegant and versatile pleated midi skirt that flows beautifully with every step.",
              price: 3799,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpcnR8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1583496661160-fb5886a13d74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpcnR8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Bottomwear",
              subcategory: "Skirt",
              sizes: ["S", "M", "L"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660150393",
              createdAt: "2025-08-31T17:09:10.394Z",
              updatedAt: "2025-08-31T17:09:10.394Z",
              tags: ["Navratri"],
              brand: "ChicAura",
              color: "Navy Blue",
            },
            {
              id: 53,
              name: "Women's Athleisure Leggings",
              description:
                "High-waisted, squat-proof leggings designed for performance and style. Features a convenient side pocket.",
              price: 2499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVnZ2luZ3N8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1506629905607-bb5e3c1e3b8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVnZ2luZ3N8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Bottomwear",
              subcategory: "Leggings",
              sizes: ["XS", "S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660150744",
              createdAt: "2025-08-31T17:09:10.745Z",
              updatedAt: "2025-08-31T17:09:10.745Z",
              tags: ["Trending", "HotDeal"],
              brand: "ActivePulse",
              color: "Black",
            },
            {
              id: 54,
              name: "Women's Wide-Leg Trousers",
              description:
                "Effortlessly chic wide-leg trousers that offer both comfort and style. Made from a flowy, lightweight material.",
              price: 4299,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1594611545628-3b9518a2879f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lkZSUyMGxlZyUyMHRyb3VzZXJzfGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1529391409740-59f2618d3d52?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2lkZSUyMGxlZyUyMHRyb3VzZXJzfGVufDB8fDB8fHww",
              ],
              category: "Women",
              grouping: "Bottomwear",
              subcategory: "Trousers",
              sizes: ["S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660151097",
              createdAt: "2025-08-31T17:09:11.097Z",
              updatedAt: "2025-08-31T17:09:11.097Z",
              tags: ["NewArrival", "Limited"],
              brand: "ChicAura",
              color: "Black",
            },
            {
              id: 55,
              name: "Women's Floral Maxi Dress",
              description:
                "An elegant floral maxi dress with a flowing silhouette, perfect for summer occasions and beach vacations.",
              price: 5999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1572804013427-4d7ca7268211?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJlc3N8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRyZXNzfGVufDB8fDB8fHww",
              ],
              category: "Women",
              grouping: "Dresses",
              subcategory: "Dress",
              sizes: ["S", "M", "L"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660151448",
              createdAt: "2025-08-31T17:09:11.449Z",
              updatedAt: "2025-08-31T17:09:11.449Z",
              tags: [],
              brand: "BloomVogue",
              color: "Multicolor",
            },
            {
              id: 56,
              name: "Women's Little Black Dress",
              description:
                "A stunning and form-fitting bodycon dress for a night out. The quintessential little black dress.",
              price: 4999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1595777457587-43798a6f3152?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjBkcmVzc3xlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1597096051989-3d4c38210e74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxhY2slMjBkcmVzc3xlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Women",
              grouping: "Dresses",
              subcategory: "Dress",
              sizes: ["XS", "S", "M"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660151761",
              createdAt: "2025-08-31T17:09:11.762Z",
              updatedAt: "2025-08-31T17:09:11.762Z",
              tags: ["Navratri", "Trending", "HotDeal"],
              brand: "ChicAura",
              color: "Black",
            },
            {
              id: 57,
              name: "Women's Stylish Jumpsuit",
              description:
                "A stylish and comfortable one-piece jumpsuit perfect for any occasion, from casual outings to evening events.",
              price: 5499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1574695333990-5a34a8e35a11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8anVtcHN1aXR8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1596958414436-3b89b88496ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8anVtcHN1aXR8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Dresses",
              subcategory: "Jumpsuit",
              sizes: ["S", "M", "L"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660152073",
              createdAt: "2025-08-31T17:09:12.074Z",
              updatedAt: "2025-08-31T17:09:12.074Z",
              tags: ["NewArrival"],
              brand: "TrendVibe",
              color: "Navy Blue",
            },
            {
              id: 58,
              name: "Women's Classic Trench Coat",
              description:
                "A sophisticated and timeless double-breasted trench coat for a polished look. Water-resistant fabric.",
              price: 8999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1616852367931-a83d472a74d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJlbmNoJTIwY29hdHxlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJlbmNoJTIwY29hdHxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Women",
              grouping: "Jackets",
              subcategory: "Coat",
              sizes: ["S", "M", "L"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660152414",
              createdAt: "2025-08-31T17:09:12.415Z",
              updatedAt: "2025-08-31T17:09:12.415Z",
              tags: ["HotDeal", "Limited"],
              brand: "ClassyFit",
              color: "Beige",
            },
            {
              id: 59,
              name: "Women's Cropped Denim Jacket",
              description:
                "A modern cropped denim jacket perfect for layering over dresses or tops. A trendy twist on a classic.",
              price: 4799,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1606760227091-3ddc9ac882b4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHBlZCUyMGRlbmltJTIwamFja2V0fGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1595950653106-6c986e588e2f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Women",
              grouping: "Jackets",
              subcategory: "Jacket",
              sizes: ["XS", "S", "M"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660152826",
              createdAt: "2025-08-31T17:09:12.827Z",
              updatedAt: "2025-08-31T17:09:12.827Z",
              tags: ["Trending", "NewArrival"],
              brand: "DenimCraft",
              color: "Blue",
            },
            {
              id: 60,
              name: "Unisex Oversized Hoodie",
              description:
                "A cozy and stylish oversized hoodie made from a premium fleece blend. Perfect for a relaxed, comfortable fit.",
              price: 4999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG9vZGllfGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Unisex",
              grouping: "Topwear",
              subcategory: "Hoodie",
              sizes: ["M", "L", "XL", "XXL"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660153850",
              createdAt: "2025-08-31T17:09:13.850Z",
              updatedAt: "2025-08-31T17:09:13.850Z",
              tags: [],
              brand: "CoolVibe",
              color: "Grey",
            },
            {
              id: 61,
              name: "Unisex Classic Beanie",
              description:
                "A soft, warm, and stylish ribbed beanie hat perfect for cold weather. Made from 100% acrylic yarn.",
              price: 999,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1575428652377-a3d80e281498?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhbmllfGVufDB8fDB8fHww",
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhbmllfGVufDB8fDB8fHww",
              ],
              category: "Unisex",
              grouping: "Accessories",
              subcategory: "Beanie",
              sizes: ["One Size"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660154259",
              createdAt: "2025-08-31T17:09:14.260Z",
              updatedAt: "2025-08-31T17:09:14.260Z",
              tags: ["Navratri", "HotDeal"],
              brand: "UrbanThread",
              color: "Black",
            },
            {
              id: 62,
              name: "Unisex Low-Top Sneakers",
              description:
                "Versatile and comfortable low-top sneakers that complement any casual outfit. Features a durable canvas upper.",
              price: 3499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1595950653106-6c986e588e2f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D",
              ],
              category: "Unisex",
              grouping: "Footwear",
              subcategory: "Sneakers",
              sizes: ["7", "8", "9", "10", "11"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660154669",
              createdAt: "2025-08-31T17:09:14.670Z",
              updatedAt: "2025-08-31T17:09:14.670Z",
              tags: ["Trending", "NewArrival", "Limited"],
              brand: "StepVibe",
              color: "White",
            },
            {
              id: 63,
              name: "Unisex Canvas Tote Bag",
              description:
                "A durable and spacious canvas tote bag for everyday use. Features an internal pocket for small items.",
              price: 1599,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1544813545-169b433b7d76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dG90ZSUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1572196289918-f8a84a3234a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dG90ZSUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Unisex",
              grouping: "Accessories",
              subcategory: "Tote Bag",
              sizes: ["One Size"],
              bestseller: false,
              isActive: true,
              stock: 100,
              date: "1756660155076",
              createdAt: "2025-08-31T17:09:15.077Z",
              updatedAt: "2025-08-31T17:09:15.077Z",
              tags: [],
              brand: "EcoCarry",
              color: "Natural",
            },
            {
              id: 64,
              name: "Unisex Aviator Sunglasses",
              description:
                "Classic aviator sunglasses with polarized lenses for 100% UV protection. Timeless style.",
              price: 2499,
              discountedPrice: 1299,
              discountPercent: 14,
              ageGroupStart: 0,
              ageGroupEnd: 25,
              image: [
                "https://images.unsplash.com/photo-1577803645773-f92475de7001?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D",
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D",
              ],
              category: "Unisex",
              grouping: "Accessories",
              subcategory: "Sunglasses",
              sizes: ["One Size"],
              bestseller: true,
              isActive: true,
              stock: 100,
              date: "1756660155389",
              createdAt: "2025-08-31T17:09:15.389Z",
              updatedAt: "2025-08-31T17:09:15.389Z",
              tags: ["Navratri", "HotDeal", "Trending"],
              brand: "SunVibe",
              color: ["Silver", "Black"],
            },
          ],
        };

        if (data.success && Array.isArray(data.products)) {
          const transformedProducts: Product[] = data.products.map((product: any, index: number) => ({
            id: product.id || index + 1,
            name: product.name || "Product",
            description: product.description || "",
            price: product.price || 0,
            discountedPrice: product.discountedPrice,
            discountPercent: product.discountPercent,
            ageGroupStart: product.ageGroupStart,
            ageGroupEnd: product.ageGroupEnd,
            image: Array.isArray(product.image) ? product.image : ["/images/placeholder.png"],
            category: product.category || "Men",
            subCategory: product.subcategory || product.subCategory || "Topwear",
            sizes: Array.isArray(product.sizes) ? product.sizes : ["S", "M", "L", "XL"],
            color: Array.isArray(product.color) ? product.color.join(",") : product.color || "Unknown",
            stock: product.stock || 10,
            rating: product.rating || 5.0,
            reviews: product.reviews || 10,
            isNew: false,
            badge: product.bestseller ? "Bestseller" : undefined,
            tags: product.tags || [],
            isActive: product.isActive !== undefined ? product.isActive : true,
            brand: product.brand || "Unknown",
            bestseller: product.bestseller || false,
          }));

          const activeCat = activeCategory;
          const subCat = subCategory;
          const offerDetails = getOfferDetails();
          const offerType = offerDetails?.offerType || [];

          console.log("ActiveCategory:", activeCat);
          console.log("SubCategory:", subCat);
          console.log("OfferTag:", offerTag);
          console.log("OfferType:", JSON.stringify(offerType, null, 2));
          console.log("Products count before filter:", transformedProducts.length);

          const filtered = transformedProducts.filter((product) => {
            const matchCategory = activeCat && activeCat !== "All" ? product.category.toLowerCase() === activeCat.toLowerCase() : true;
            const matchSubCategory = subCat ? product.subCategory.toLowerCase() === subCat.toLowerCase() : true;

            let matchTags = true;
            let matchOfferType = true;

            if (offerTag && offerType.length > 0 && offerType[0]) {
              const offerTypeTags = offerType[0]?.tags || [];
              matchTags =
                product.tags.some((tag) =>
                  [...(offerTag ? [offerTag] : []), ...offerTypeTags].some((t) => t && tag.toLowerCase() === t.toLowerCase())
                ) ||
                (offerType[0]?.subCategoriesName &&
                  product.subCategory.toLowerCase() === offerType[0].subCategoriesName.toLowerCase());

              const { price_below, price_above, min_discount, max_discount, ageGroupStart, ageGroupEnd } = offerType[0];

              if (price_below !== undefined && price_above !== undefined && price_above > price_below) {
                console.warn("Invalid price range: price_above > price_below, bypassing price filter.");
                matchOfferType = true;
              } else {
                const priceCheck =
                  (price_below === undefined || (product.discountedPrice !== undefined && product.discountedPrice <= price_below)) &&
                  (price_above === undefined || (product.discountedPrice !== undefined && product.discountedPrice >= price_above));
                matchOfferType = priceCheck;
              }

              if (min_discount !== undefined && max_discount !== undefined && product.discountPercent !== undefined) {
                matchOfferType =
                  matchOfferType &&
                  product.discountPercent >= min_discount &&
                  product.discountPercent <= max_discount;
              }

              if (
                ageGroupStart !== undefined &&
                ageGroupEnd !== undefined &&
                product.ageGroupStart !== undefined &&
                product.ageGroupEnd !== undefined
              ) {
                matchOfferType =
                  matchOfferType &&
                  product.ageGroupStart <= ageGroupEnd &&
                  product.ageGroupEnd >= ageGroupStart;
              }

              console.log(`Product ${product.id} - OfferType check:`, {
                price_below,
                price_above,
                min_discount,
                max_discount,
                ageGroupStart,
                ageGroupEnd,
                productDiscountedPrice: product.discountedPrice,
                productDiscountPercent: product.discountPercent,
                productAgeGroupStart: product.ageGroupStart,
                productAgeGroupEnd: product.ageGroupEnd,
              });
            }

            console.log(
              `Product ${product.id} - matchCategory: ${matchCategory}, matchSubCategory: ${matchSubCategory}, matchTags: ${matchTags}, matchOfferType: ${matchOfferType}`
            );

            return matchCategory && matchSubCategory && matchTags && matchOfferType && product.isActive && product.stock > 0;
          });

          let prioritized: Product[] = [];
          let others: Product[] = [];

          if (offerTag) {
            const primaryTag = offerType[0]?.tags?.[0]?.toLowerCase();
            prioritized = filtered.filter((product) =>
              primaryTag ? product.tags.some((tag) => tag.toLowerCase() === primaryTag) : false
            );

            others = filtered.filter((product) => {
              const matchesOtherTags =
                offerType[0]?.tags?.slice(1).some((tag) => product.tags.includes(tag)) || false;
              const matchesSubCat = offerType[0]?.subCategoriesName
                ? product.subCategory.toLowerCase() === offerType[0].subCategoriesName.toLowerCase()
                : false;
              const matchesGrouping = product.grouping?.toLowerCase() === "topwear";
              return matchesOtherTags || matchesSubCat || matchesGrouping;
            });
          } else {
            prioritized = filtered.filter((product) => product.badge === "Bestseller");
            others = filtered.filter((product) => product.badge !== "Bestseller");
          }

          console.log("Prioritized products:", prioritized);
          console.log("Other products:", others);

          const finalProducts = [
            ...prioritized,
            ...others.filter((p) => !prioritized.some((pp) => pp.id === p.id)),
          ];
          setProducts(finalProducts);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error("[v0] Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchParams,
    activeCategory,
    minPrice,
    maxPrice,
    selectedSizes,
    selectedBrands,
    selectedCategories,
    sortBy,
    currentPage,
    initialOffer,
  ]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/wishlist`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.wishlist)) {
          const wishlistProductIds = new Set<number>(
            (data.data.wishlist as WishlistEntry[]).map(
              (item) => item.productId
            )
          );
          setApiWishlistItems(wishlistProductIds);
        }
      } catch (err) {
        console.error("[v0] Error fetching wishlist:", err);
      }
    };

    const fetchCartCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cart`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items)) {
          setCartCount(data.data.items.length);
        } else if (data.success && typeof data.data?.totalItems === "number") {
          setCartCount(data.data.totalItems);
        }
      } catch (err) {
        console.error("[v0] Error fetching cart count:", err);
      }
    };

    fetchWishlistStatus();
    fetchCartCount();
  }, []);

  const colorOptions = [
    { name: "Red", hex: "#ef4444" },
    { name: "Orange", hex: "#f97316" },
    { name: "Green", hex: "#22c55e" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Magenta", hex: "#d946ef" },
    { name: "Black", hex: "#000000" },
  ];

  const categoryOptions = [
    { name: "New", count: 5 },
    { name: "Trending", count: 8 },
    { name: "Hot Deals", count: 3 },
  ];

  const priceRangeOptions = ["₹0 - ₹15", "₹16 - ₹30", "₹31 - ₹45", "₹46 - ₹60"];

  const brandOptions = [
    { name: "Antise", count: 12 },
    { name: "Apple", count: 8 },
    { name: "Boat", count: 15 },
    { name: "Bergamot", count: 6 },
    { name: "Lemon", count: 4 },
  ];

  const handleSizeFilter = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    updateURLParams({ sizes: newSizes });
  };

  const handleColorFilter = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    updateURLParams({ colors: newColors });
  };

  const handleCategoryFilter = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    updateURLParams({ category: newCategories });
  };

  const handleBrandFilter = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    updateURLParams({ brands: newBrands });
  };

  const handlePriceRangeFilter = (range: string) => {
    const newRanges = priceRanges.includes(range)
      ? priceRanges.filter((r) => r !== range)
      : [...priceRanges, range];
    setPriceRanges(newRanges);
    updateURLParams({ priceRanges: newRanges });
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    updateURLParams({ priceMin: value || null });
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    updateURLParams({ priceMax: value || null });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURLParams({ sort: value });
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      showToast("Product is out of stock", false);
      return;
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      showToast("Please login to add items to cart", false);
      router.push("/login");
      return;
    }

    setAddingToCart(product.id);
    setLoadingMessage("Adding to cart...");
    setGlobalLoading(true);
    console.log(
      "[v0] Adding to cart - Product ID:",
      product.id,
      "Stock:",
      product.stock
    );

    try {
      const requestBody = {
        productId: product.id,
        size: product.sizes[0] || "M",
        quantity: 1,
      };

      const response = await fetch(`${API_BASE}/api/cart/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log("[v0] Cart response status:", response.status);
      console.log(
        "[v0] Cart response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[v0] Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      console.log("[v0] Cart response data:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to add to cart");
      }

      setAddedToCart(product.id);
      showToast("Added to cart successfully!");
      setTimeout(() => setAddedToCart(null), 2000);

      refreshCartCount();
    } catch (error) {
      console.error("[v0] Add to cart error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      showToast(errorMessage, false);
    } finally {
      setAddingToCart(null);
      setGlobalLoading(false);
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    const isAuth = isAuthenticated();
    const isInWishlist = wishlistItems.has(product.id);
    setAddingToWishlist(product.id);

    try {
      if (isAuth) {
        setLoadingMessage(
          isInWishlist ? "Removing from wishlist..." : "Adding to wishlist..."
        );
        setGlobalLoading(true);

        if (isInWishlist) {
          const response = await fetch(
            `${API_BASE}/api/user/wishlist/${product.id}`,
            {
              method: "DELETE",
              headers: authHeaders(),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to remove from wishlist"
            );
          }

          setApiWishlistItems((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          showToast("Removed from wishlist!");
          refreshWishlistCount();
        } else {
          const response = await fetch(`${API_BASE}/api/user/wishlist`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ productId: product.id }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add to wishlist");
          }

          setApiWishlistItems((prev) => new Set([...prev, product.id]));
          showToast("Added to wishlist!");
          refreshWishlistCount();
        }
      } else {
        if (isInWishlist) {
          dispatch(removeFromWishlist(product.id));
          showToast("Removed from wishlist!");
        } else {
          dispatch(
            addToWishlist({
              ...product,
              bestseller: product.badge === "bestseller" || false,
              createdAt: new Date().toISOString(),
            })
          );
          showToast("Added to wishlist!");
        }
      }
    } catch (error) {
      console.error("[v0] Wishlist toggle error:", error);
      showToast(
        error instanceof Error ? error.message : "Wishlist operation failed",
        false
      );
    } finally {
      if (isAuth) {
        setGlobalLoading(false);
      }
      setAddingToWishlist(null);
    }
  };

  const filteredBrands = brandOptions.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => selectedSizes.includes(size))
      );
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(
        (product) => product.color && selectedColors.includes(product.color)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        if (selectedCategories.includes("New") && product.isNew) return true;
        if (
          selectedCategories.includes("Trending") &&
          product.rating &&
          product.rating >= 4.5
        )
          return true;
        if (
          selectedCategories.includes("Hot Deals") &&
          product.badge === "Bestseller"
        )
          return true;
        return false;
      });
    }

    if (priceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        return priceRanges.some((range) => {
          const [min, max] = range
            .replace("₹", "")
            .split(" - ")
            .map((p) => Number.parseInt(p));
          return product.price >= min && product.price <= max;
        });
      });
    }

    const minPriceNum = minPrice ? Number.parseInt(minPrice) : 0;
    const maxPriceNum = maxPrice
      ? Number.parseInt(maxPrice)
      : Number.POSITIVE_INFINITY;
    if (minPrice || maxPrice) {
      filtered = filtered.filter(
        (product) =>
          product.price >= minPriceNum && product.price <= maxPriceNum
      );
    }

    switch (sortBy) {
      case "Sort: Price Low to High":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Sort: Price High to Low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Sort: Most Popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "Sort: Newest":
      default:
        break;
    }

    return filtered;
  }, [
    products,
    selectedSizes,
    selectedColors,
    selectedCategories,
    selectedBrands,
    priceRanges,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSizes,
    selectedColors,
    selectedCategories,
    selectedBrands,
    priceRanges,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterSectionToggle = (section: string) => {
    setExpandedFilterSection(
      expandedFilterSection === section ? null : section
    );
  };

  // Determine breadcrumb text
  const getBreadcrumbText = () => {
    if (offerTag) {
      const offerDetails = getOfferDetails();
      return offerDetails?.name || "Products";
    }
    return activeCategory === "All" ? "Products" : activeCategory;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
        <div className="flex items-center text-xs md:text-sm text-gray-600 space-x-1 md:space-x-2">
          <Link href="/" className="hover:text-black truncate">
            Home
          </Link>
          <span>›</span>
          <Link
            href={`/productlist?category=${activeCategory.toLowerCase()}`}
            className="hover:text-black truncate"
          >
            {activeCategory === "All" ? "Products" : activeCategory}
          </Link>
          {offerTag && (
            <>
              <span>›</span>
              <span className="text-black truncate">{getBreadcrumbText()}</span>
            </>
          )}
        </div>
      </div>
      <div className="md:hidden px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h1>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {filteredAndSortedProducts.length} Items
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 bg-white"
          >
            <option>Sort: Newest</option>
            <option>Sort: Price Low to High</option>
            <option>Sort: Price High to Low</option>
            <option>Sort: Most Popular</option>
          </select>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded text-sm bg-white min-w-fit"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="hidden md:block w-64 border-r border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold">Filters</h2>

          {/* Size Filter */}
          <div>
            <h3 className="font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeFilter(size)}
                  className={`px-3 py-1 border text-sm transition-colors ${
                    selectedSizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Color
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorFilter(color.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColors.includes(color.name)
                      ? "border-black scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Category
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label
                  key={category.name}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryFilter(category.name)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    ({category.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Price
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-3">
              <div className="flex space-x-2 flex-col">
                <input
                  type="text"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="space-y-2">
                {priceRangeOptions.map((range) => (
                  <label
                    key={range}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={priceRanges.includes(range)}
                      onChange={() => handlePriceRangeFilter(range)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="font-medium mb-3 flex items-center justify-between">
              Brand
              <ChevronDown className="w-4 h-4" />
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filteredBrands.map((brand) => (
                  <label
                    key={brand.name}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => handleBrandFilter(brand.name)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{brand.name}</span>
                    <span className="text-xs text-gray-500">
                      ({brand.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 bg-white z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="mr-3"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Product Search */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("product")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Product</span>
                  </button>
                  {expandedFilterSection === "product" && (
                    <div className="px-4 pb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search Product..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("brand")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Brand</span>
                  </button>
                  {expandedFilterSection === "brand" && (
                    <div className="px-4 pb-4 space-y-3">
                      {filteredBrands.map((brand) => (
                        <label
                          key={brand.name}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => handleBrandFilter(brand.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {brand.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("size")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Size</span>
                  </button>
                  {expandedFilterSection === "size" && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {["S", "M", "L", "XL"].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeFilter(size)}
                            className={`px-4 py-2 border text-sm rounded transition-colors min-w-[48px] ${
                              selectedSizes.includes(size)
                                ? "bg-black text-white border-black"
                                : "border-gray-300 hover:border-black"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("color")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Color</span>
                  </button>
                  {expandedFilterSection === "color" && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => handleColorFilter(color.name)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              selectedColors.includes(color.name)
                                ? "border-black scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("category")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Category</span>
                  </button>
                  {expandedFilterSection === "category" && (
                    <div className="px-4 pb-4 space-y-3">
                      {categoryOptions.map((category) => (
                        <label
                          key={category.name}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => handleCategoryFilter(category.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => handleFilterSectionToggle("price")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">Price</span>
                  </button>
                  {expandedFilterSection === "price" && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Minimum"
                          value={minPrice}
                          onChange={(e) => handleMinPriceChange(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Maximum"
                          value={maxPrice}
                          onChange={(e) => handleMaxPriceChange(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        {priceRangeOptions.map((range) => (
                          <label
                            key={range}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={priceRanges.includes(range)}
                              onChange={() => handlePriceRangeFilter(range)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">
                              {range}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section with Product Count and Done Button */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredAndSortedProducts.length} Product Found
                  </span>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <span>Done</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-3 md:p-6">
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
              >
                <option>Sort: Newest</option>
                <option>Sort: Price Low to High</option>
                <option>Sort: Price High to Low</option>
                <option>Sort: Most Popular</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredAndSortedProducts.length} items
              </span>
              {totalPages > 1 && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                API connection issue: {error}. Showing sample data.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/productdetail/${product.id}`)}
              >
                <div className="relative mb-2 md:mb-3">
                  {product.badge && (
                    <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-orange-500 text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded z-10">
                      {product.badge}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(product);
                    }}
                    disabled={addingToWishlist === product.id}
                    className={`absolute top-1 md:top-2 right-1 md:right-2 p-1 md:p-1.5 rounded-full transition-colors z-10 ${
                      wishlistItems.has(product.id)
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill={
                        wishlistItems.has(product.id) ? "currentColor" : "none"
                      }
                    />
                  </button>

                  <div className="aspect-[4/5] bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={product.image[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={375}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-xs">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 hidden md:inline">
                        ({product.reviews})
                      </span>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        product.stock > 0
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="font-semibold text-base md:text-lg">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="text-sm text-red-500 font-medium">{product.discount}% OFF</span>
                      </>
                    )}
                  </div> */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={addingToCart === product.id || product.stock <= 0}
                    className={`w-full py-2 md:py-2.5 text-sm font-medium rounded transition-colors flex items-center hover:cursor-pointer justify-center space-x-2 ${
                      product.stock <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-black disabled:opacity-50"
                    }`}
                  >
                    {addingToCart === product.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : addedToCart === product.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </>
                    ) : product.stock <= 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <span>+ Add To Cart</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 md:mt-12">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded transition-colors ${
                          currentPage === pageNum
                            ? "bg-black text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedProducts.length
                )}{" "}
                of {filteredAndSortedProducts.length} products
              </div>
            </div>
          )}

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found matching your filters.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
