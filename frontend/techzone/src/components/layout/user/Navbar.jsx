import React, { useState } from 'react'
import UserMenu from '../user/UserMenu'
import { useNavigate } from 'react-router-dom';

const Navbar = ({onAccountClick, setAdminMode, searchValue, setSearchValue, products = []}) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();

  // Filter and sort products for dropdown
  const suggestions = searchValue
    ? products
        .filter(p => p.name && p.name.toLowerCase().includes(searchValue.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 6)
    : [];

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value)
  }

  const handleClearSearch = () => setSearchValue('');

  const handleSuggestionClick = (name) => {
    setSearchValue(name);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchValue)
  }

  const handleCartClick = () => {
    navigate('/cart');
  }

  return (
      <nav className='bg-dark-green text-white px-4 py-3 flex justify-between items-center' >
          <div className='flex items-center'>
            <img 
              src="/TECHZONE-Logo.png" 
              alt="TechZone Logo" 
              className="h-15 w-auto"
            />
          </div>
          
          {/* Search Bar */}
          <div className='flex-1 max-w-2xl mx-8'>
            <div className='relative flex items-center'>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-5 py-2 bg-white text-gray-900 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoComplete="off"
              />
              
              {/* Clear button (X) */}
              {searchValue && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-12 text-gray-500 hover:text-gray-700"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              
              {/* Search button */}
              <button
                onClick={handleSearch}
                className="absolute right-2 p-1 text-green-600 hover:text-green-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Dropdown suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {suggestions.map(product => (
                    <div
                      key={product._id}
                      className="px-4 py-2 cursor-pointer hover:bg-green-100 text-gray-900"
                      onClick={() => handleSuggestionClick(product.name)}
                    >
                      {product.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className='flex items-center space-x-4'>
            <UserMenu onClick={onAccountClick} setAdminMode={setAdminMode} />
            
            {/* Cart Icon */}
            <div className='relative'>
              <button
                onClick={handleCartClick}
                className="relative p-2 text-white hover:text-gray-200 transition-colors"
              >
                {/* Shopping Cart Icon */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M9 9H11L12.68 21.39C12.7719 21.8504 13.0219 22.264 13.3875 22.5583C13.7532 22.8526 14.2107 23.009 14.68 23H26.4C26.8693 23.009 27.3268 22.8526 27.6925 22.5583C28.0581 22.264 28.3081 21.8504 28.4 21.39L30 12H8M21 26C21.5523 26 22 25.5523 22 25C22 24.4477 21.5523 24 21 24C20.4477 24 20 24.4477 20 25C20 25.5523 20.4477 26 21 26ZM13 26C13.5523 26 14 25.5523 14 25C14 24.4477 13.5523 24 13 24C12.4477 24 12 24.4477 12 25C12 25.5523 12.4477 26 13 26Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {/* Cart Badge */}
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-medium">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
      </nav>
  )
}

export default Navbar