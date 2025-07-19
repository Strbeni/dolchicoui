'use client'
import { Navbar5 } from "./ui/navbar-5"

const Navbar = () => {
  return (
    <>
    <div className="relative z-50">
      
      <div className="bg-[#d65c2a] text-white text-sm text-center py-1">
        Discount 20% For New Member, <span className="font-semibold uppercase">Only For Today!!</span>
      </div>
      <Navbar5 />
    </div>
    </>
  )
}

export default Navbar
