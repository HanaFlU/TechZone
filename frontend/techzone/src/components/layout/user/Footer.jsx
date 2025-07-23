import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#124230] border-t border-gray-200 text-white mt-12">
      <div className="max-w-screen-xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8 md:gap-0 justify-between">
        {/* Left: Logo and Socials */}
        <div className="flex flex-col items-start md:w-1/4">
          <img src="/TECHZONE-Logo.png" alt="TechZone Logo" className="h-16 w-auto mb-4" />
        </div>
        {/* Center: Navigation Columns */}
        <div className="flex flex-col md:flex-row md:w-2/4 gap-8">
          {/* Thông tin cửa hàng column */}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-lg font-semibold mb-2">Thông tin cửa hàng</h3>
            <a href="#" className="hover:text-emerald-300">Giới thiệu</a>
            <a href="#" className="hover:text-emerald-300">Liên hệ</a>
            <a href="#" className="hover:text-emerald-300">Hỏi đáp</a>
            <a href="#" className="hover:text-emerald-300">Tin tức</a>
          </div>
          {/* Chính sách mua hàng column */}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-lg font-semibold mb-2">Chính sách mua hàng</h3>
            <a href="#" className="hover:text-emerald-300">Chính sách trả góp</a>
            <a href="#" className="hover:text-emerald-300">Chính sách bảo hành</a>
            <a href="#" className="hover:text-emerald-300">Chính sách giao hàng</a>
            <a href="#" className="hover:text-emerald-300">Chính sách thanh toán</a>
          </div>
        </div>
        {/* Right: Payment Methods */}
        <div className="flex flex-col md:w-1/4 gap-2">
          <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
          <a href="#" className="hover:text-emerald-300">QR Code</a>
          <a href="#" className="hover:text-emerald-300">Tiền mặt</a>
          <a href="#" className="hover:text-emerald-300">Trả góp</a>
          <a href="#" className="hover:text-emerald-300">Internet Banking</a>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center text-xs text-gray-300 py-4 bg-[#124230]">
        © 2025 TechZone™. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;