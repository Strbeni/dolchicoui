// components/footer.tsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#101820] text-white text-sm pt-12 pb-6 px-6 sm:px-10 lg:px-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand and Description */}
        <div>
          <div className="text-3xl font-bold mb-4 text-orange-400">DOLCHI</div>
          <p className="text-gray-300 leading-relaxed">
            We're always seeking out new ways to improve our sustainability
            efforts eco-friendly production processes.
          </p>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">About Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li>Our Story</li>
            <li>FAQ</li>
            <li>Sustainability</li>
            <li>Ethical Practices</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Shipping & Returns</li>
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Shop</h3>
          <ul className="space-y-2 text-gray-300">
            <li>Men's Collection</li>
            <li>Women's Collection</li>
            <li>Kid's Collection</li>
            <li>Accessories</li>
            <li>Size Guide</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
              <span className="mr-2">📍</span>
              <div>
                123 Fashion St., Suite 456
                <br />
                City, State, ZIP Code
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>+1 (123) 456-7890</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✉️</span>
              <span>support@fancy.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mt-12 mb-8">
        <h3 className="font-semibold mb-4 text-lg">Popular Searches</h3>
        <div className="flex flex-wrap gap-2 text-gray-300 text-xs">
          <span>Makeup</span> <span>|</span>
          <span>Sandals</span> <span>|</span>
          <span>T-shirts</span> <span>|</span>
          <span>Sarees</span> <span>|</span>
          <span>Jewellery</span> <span>|</span>
          <span>Ladies Watch</span> <span>|</span>
          <span>Handbags</span> <span>|</span>
          <span>Tops</span> <span>|</span>
          <span>Bikini</span> <span>|</span>
          <span>Night Dress</span> <span>|</span>
          <span>Lipstick</span> <span>|</span>
          <span>Rings</span> <span>|</span>
          <span>B</span> <span>|</span>
          <span>Bags</span> <span>|</span>
          <span>Sneakers</span> <span>|</span>
          <span>Sports Shoes</span> <span>|</span>
          <span>Lehenga</span> <span>|</span>
          <span>Jeans</span> <span>|</span>
          <span>Earrings</span> <span>|</span>
          <span>Kajal</span> <span>|</span>
          <span>Facewash</span> <span>|</span>
          <span>Sunscreen</span>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-600">
        <div className="text-gray-400 text-xs mb-4 sm:mb-0">
          © 2025 Dolchi . All rights reserved .
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <span className="text-white text-xs">f</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <span className="text-white text-xs">🐦</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <span className="text-white text-xs">📷</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <span className="text-white text-xs">in</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <span className="text-white text-xs">📸</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
