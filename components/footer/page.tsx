// components/footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#844416] text-white text-sm pt-10 pb-6 px-6 sm:px-10 lg:px-20 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo and Contact Info */}
        <div>
          <div className="text-3xl font-serif font-bold mb-4">DOLCHICO</div>
          <p className="mb-1"><span className="font-medium">WhatsApp</span> : +62 859 9999 999</p>
          <p className="mb-1"><span className="font-medium">Email</span> : hello@dolchico.com</p>
          <p>
            <span className="font-medium">Address</span> : Lorem ipsum street Block B Number 08,<br />
            Jakarta, Indonesia, 12345
          </p>
        </div>

        {/* Menu */}
        <div>
          <h3 className="font-semibold mb-3">Menu</h3>
          <ul className="space-y-1">
            <li>Sale</li>
            <li>New Arrivals</li>
            <li>Formal Men</li>
            <li>Formal Woman</li>
            <li>Casual Men</li>
            <li>Casual Woman</li>
          </ul>
        </div>

        {/* Get Help */}
        <div>
          <h3 className="font-semibold mb-3">Get Help</h3>
          <ul className="space-y-1">
            <li>FAQ</li>
            <li>Customer Service</li>
            <li>Refund and Return</li>
            <li>Terms and Conditions</li>
            <li>Shipping</li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold mb-3">Account</h3>
          <ul className="space-y-1">
            <li>My Account</li>
            <li>My Orders</li>
            <li>Vouchers and Discounts</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center mt-10 text-gray-200 text-xs">
        <p>All rights reserved</p>
        <p>Copyright 2025 By DolchiCo Fashion</p>
      </div>
    </footer>
  );
};

export default Footer;
