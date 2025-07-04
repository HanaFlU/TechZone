import React, { useState } from 'react'

const CategorySidebar = () => {
  const [expandedCategory, setExpandedCategory] = useState(null)

  const categories = [
    {
      id: 1,
      name: "CPU (Bộ vi xử lý)",
      subcategories: ["Intel", "AMD"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 3V5H7V3H5V5H3V7H5V9H3V11H5V13H3V15H5V17H3V19H5V21H7V19H9V21H11V19H13V21H15V19H17V21H19V19H21V17H19V15H21V13H19V11H21V9H19V7H21V5H19V3H17V5H15V3H13V5H11V3H9ZM7 7H9V9H7V7ZM11 7H13V9H11V7ZM15 7H17V9H15V7ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 2,
      name: "Mainboard",
      subcategories: ["Intel Socket", "AMD Socket"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H9V9H7V7ZM11 7H13V9H11V7ZM15 7H17V9H15V7ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 3,
      name: "RAM",
      subcategories: ["DDR4", "DDR5"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 4,
      name: "GPU",
      subcategories: ["NVIDIA", "AMD", "Intel"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 16H3V4H21V16ZM21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2ZM7 6H9V8H7V6ZM11 6H13V8H11V6ZM15 6H17V8H15V6ZM7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 5,
      name: "Ổ cứng",
      subcategories: ["HDD", "SSD", "NVMe"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 6,
      name: "Màn hình",
      subcategories: ["Gaming", "Office", "Professional"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 16H3V4H21V16ZM21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 7,
      name: "Tản nhiệt",
      subcategories: ["Air Cooling", "Liquid Cooling"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 8,
      name: "Thiết bị ngoại vi",
      subcategories: ["Chuột", "Bàn phím", "Tai nghe"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM20 17H4V7H20V17ZM6 9H8V11H6V9ZM10 9H12V11H10V9ZM14 9H16V11H14V9ZM18 9H20V11H18V9ZM6 13H8V15H6V13ZM10 13H12V15H10V13ZM14 13H16V15H14V13ZM18 13H20V15H18V13Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 9,
      name: "Phụ kiện khác",
      subcategories: ["Cáp", "Adapter", "Bộ nguồn"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      )
    }
  ]

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="bg-green-600 rounded-t-2xl px-6 py-4">
        <div className="flex items-center space-x-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-white font-semibold text-lg">DANH MỤC SẢN PHẨM</h2>
        </div>
      </div>

      {/* Category List */}
      <div className="py-2">
        {categories.map((category, index) => {
          const isExpanded = expandedCategory === category.id
          return (
            <div key={category.id}>
              <div 
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">
                      {category.icon}
                    </div>
                    <div>
                      <div className={`font-medium ${isExpanded ? 'text-green-600' : 'text-gray-900'}`}>
                        {category.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-270 text-green-600' : ''}`}
                    >
                      <polygon points="7,10 12,15 17,10" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {index < categories.length - 1 && (
                <div className="mx-4 border-b border-gray-200"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const HomePage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null)

  const categories = [
    {
      id: 1,
      name: "CPU (Bộ vi xử lý)",
      subcategories: ["Intel", "AMD"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 3V5H7V3H5V5H3V7H5V9H3V11H5V13H3V15H5V17H3V19H5V21H7V19H9V21H11V19H13V21H15V19H17V21H19V19H21V17H19V15H21V13H19V11H21V9H19V7H21V5H19V3H17V5H15V3H13V5H11V3H9ZM7 7H9V9H7V7ZM11 7H13V9H11V7ZM15 7H17V9H15V7ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 2,
      name: "Mainboard",
      subcategories: ["Intel Socket", "AMD Socket"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H9V9H7V7ZM11 7H13V9H11V7ZM15 7H17V9H15V7ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 3,
      name: "RAM",
      subcategories: ["DDR4", "DDR5"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 4,
      name: "GPU",
      subcategories: ["NVIDIA", "AMD", "Intel"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 16H3V4H21V16ZM21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2ZM7 6H9V8H7V6ZM11 6H13V8H11V6ZM15 6H17V8H15V6ZM7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 5,
      name: "Ổ cứng",
      subcategories: ["HDD", "SSD", "NVMe"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 6,
      name: "Màn hình",
      subcategories: ["Gaming", "Office", "Professional"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 16H3V4H21V16ZM21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 7,
      name: "Tản nhiệt",
      subcategories: ["Air Cooling", "Liquid Cooling"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 8,
      name: "Thiết bị ngoại vi",
      subcategories: ["Chuột", "Bàn phím", "Tai nghe"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM20 17H4V7H20V17ZM6 9H8V11H6V9ZM10 9H12V11H10V9ZM14 9H16V11H14V9ZM18 9H20V11H18V9ZM6 13H8V15H6V13ZM10 13H12V15H10V13ZM14 13H16V15H14V13ZM18 13H20V15H18V13Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 9,
      name: "Phụ kiện khác",
      subcategories: ["Cáp", "Adapter", "Bộ nguồn"],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      )
    }
  ]

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const CategorySidebar = () => {
    return (
      <div className="w-80 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="bg-green-600 rounded-t-2xl px-6 py-4">
          <div className="flex items-center space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-white font-semibold text-lg">DANH MỤC SẢN PHẨM</h2>
          </div>
        </div>

        {/* Category List */}
        <div className="py-2">
          {categories.map((category, index) => {
            const isExpanded = expandedCategory === category.id
            return (
              <div key={category.id}>
                <div 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {category.icon}
                      </div>
                      <div>
                        <div className={`font-medium ${isExpanded ? 'text-green-600' : 'text-gray-900'}`}>
                          {category.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-270 text-green-600' : ''}`}
                      >
                        <polygon points="7,10 12,15 17,10" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {index < categories.length - 1 && (
                  <div className="mx-4 border-b border-gray-200"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const SubcategorySidebar = () => {
    if (!expandedCategory) return null

    const category = categories.find(cat => cat.id === expandedCategory)
    if (!category) return null

    return (
      <div className="w-64 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="bg-green-600 rounded-t-2xl px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-white">
              {category.icon}
            </div>
            <h2 className="text-white font-semibold text-lg">{category.name}</h2>
          </div>
        </div>

        {/* Subcategory List */}
        <div className="py-2">
          {category.subcategories.map((subcategory, index) => (
            <div key={index}>
              <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-gray-900 font-medium">{subcategory}</div>
              </div>
              {index < category.subcategories.length - 1 && (
                <div className="mx-4 border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-0 pb-4 -mt-2">
        <div className="flex gap-8">
          {/* Category Sidebar */}
          <CategorySidebar />
          
          {/* Subcategory Sidebar */}
          <SubcategorySidebar />
          
          {/* Main Content Area */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Trang chủ</h1>
            <p className="text-gray-600">Nội dung trang chủ sẽ được thêm vào đây.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage