'use client'

// import { useState, useEffect, useRef } from "react"
// import { Search, User, ShoppingCart, Heart } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import Men from "./men"
// import Women from "./Women"
// import Kids from "./kids"
// import Home from "./home"
import { Navbar5 } from "./ui/navbar-5"

const Navbar = () => {
  // const [showMen, setShowMen] = useState(false)
  // const [showWomen, setShowWomen] = useState(false)
  // const [showKids, setShowKids] = useState(false)
  // const [home, setHome] = useState(false)
  // const [userMenuOpen, setUserMenuOpen] = useState(false)
  // const dropdownRef = useRef<HTMLDivElement | null>(null)
  // const router = useRouter()

  // Simulated login check (replace this with your auth logic)
  // const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'

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

  return (
    <>
    <div className="relative z-50">
      
      <div className="bg-[#d65c2a] text-white text-sm text-center py-1">
        Discount 20% For New Member, <span className="font-semibold uppercase">Only For Today!!</span>
      </div>
      
      <Navbar5 />

      {/* <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        
        <div className="text-xl font-bold tracking-wide">
          <span className="text-[#2f2f2f]">DolchiCo</span><span className="text-green-600">●</span>
          <p className="text-xs font-normal text-gray-500 -mt-1">women clothing</p>
        </div>

       
        <div className="relative flex gap-8 text-sm font-medium">
          <div className="relative group"
            onMouseEnter={() => setShowMen(true)}
            onMouseLeave={() => setShowMen(false)}
          >
            <button className="hover:text-[#d67667]">Men</button>
            <Men show={showMen} />
          </div>
          <div className="relative group"
            onMouseEnter={() => setShowWomen(true)}
            onMouseLeave={() => setShowWomen(false)}
          >
            <button className="hover:text-[#e679e2]">Women</button>
            <Women show={showWomen} />
          </div>
          <div className="relative group"
            onMouseEnter={() => setShowKids(true)}
            onMouseLeave={() => setShowKids(false)}
          >
            <button className="hover:text-[#d65c2a]">Kids</button>
            <Kids show={showKids} />
          </div>
          <button>Accesories</button>
          <div className="relative group"
            onMouseEnter={() => setHome(true)}
            onMouseLeave={() => setHome(false)}
          >
            <button className="hover:text-[#e1df6d]">Home</button>
            <Home show={home} />
          </div>
        </div>

       
        <div className="flex items-center gap-4 relative">
          <Search className="w-5 h-5 cursor-pointer" />
          
        
          <div className="relative" ref={dropdownRef}>
            <User
              className="w-5 h-5 cursor-pointer"
              onClick={() => setUserMenuOpen((prev) => !prev)}
            />
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md text-sm z-50">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        router.push('/profile')
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
                      setUserMenuOpen(false)
                      router.push('/login')
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
      </nav> */}
    </div>
    </>
  )
}

export default Navbar
