'use client';

import { Heart, Menu, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './search-bar';

/* -------------------------------------------------------------------------- */
/*  dummy data (unchanged)                                                    */
/* -------------------------------------------------------------------------- */
interface NavigationSection {
  title: string;
  items: string[];
}

const men: NavigationSection[] = [ /* … your men array … */ ];
const women: NavigationSection[] = [ /* … your women array … */ ];
const kids: NavigationSection[] = [ /* … your kids array … */ ];
const homes: NavigationSection[] = [ /* … your homes array … */ ];

/* -------------------------------------------------------------------------- */

export const Navbar5 = () => {
  const router = useRouter();

  /* ----------------------- auth / menu state ------------------------------ */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    router.push('/login');
  };

  /* close user dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* -------------------------- cart / wishlist ----------------------------- */
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  /* ------------------------------- JSX ------------------------------------ */
  return (
    <section className="py-4 px-4 lg:px-6 bg-white shadow-sm">
      <div className="container">
        <nav className="flex items-center justify-between">
          {/* Logo ------------------------------------------------------------ */}
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tighter">
              DolchiCo
            </span>
          </Link>

          {/* Desktop mega-menu --------------------------------------------- */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {/* ------------ Men ------------- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-red-600">
                  Men
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {men.map((section) => (
                      <NavigationMenuLink
                        key={section.title}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-1 font-semibold text-red-600">
                          {section.title}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ------------ Women ------------- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-pink-600">
                  Women
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {women.map((section) => (
                      <NavigationMenuLink
                        key={section.title}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-1 font-semibold text-pink-600">
                          {section.title}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ------------ Kids ------------- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-yellow-600">
                  Kids
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {kids.map((section) => (
                      <NavigationMenuLink
                        key={section.title}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-1 font-semibold text-yellow-600">
                          {section.title}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ------------ Home ------------- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="data-[state=open]:border-b-2 data-[state=open]:border-orange-600">
                  Home
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[900px] grid-cols-5 p-6">
                    {homes.map((section) => (
                      <NavigationMenuLink
                        key={section.title}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-1 font-semibold text-orange-600">
                          {section.title}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop – right-side icons ------------------------------------- */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <SearchBar
              onSearch={(q) =>
                router.push(`/productlist?q=${encodeURIComponent(q)}`)
              }
            />

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <User
                className="w-5 h-5 cursor-pointer"
                onClick={() => setUserMenuOpen((p) => !p)}
              />
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
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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

            {/* Wishlist */}
            <Link href="/wishlistpage" className="relative">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full text-xs px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cartpage" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* ---------------------------- Mobile sheet ---------------------- */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg font-semibold tracking-tighter">
                      DolchiCo
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Accordions */}
              {[
                { id: 'men', label: 'Men', data: men },
                { id: 'women', label: 'Women', data: women },
                { id: 'kids', label: 'Kids', data: kids },
                { id: 'home', label: 'Home', data: homes },
              ].map(({ id, label, data }) => (
                <Accordion key={id} type="single" collapsible className="mt-4">
                  <AccordionItem value={id} className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      {label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {data.map((section) => (
                          <div key={section.title}>
                            <p className="mb-1 font-semibold">
                              {section.title}
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {section.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}

              {/* Login / signup button */}
              {!isLoggedIn && (
                <div className="mt-6">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};
