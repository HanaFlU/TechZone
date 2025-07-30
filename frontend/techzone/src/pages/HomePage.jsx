import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import ReviewService from '../services/ReviewService';
import CategorySidebar from '../components/layout/user/CategorySidebar';
import ProductSection from '../components/product/ProductSection';
import ProductCard from '../components/product/ProductCard';
import NewsCarousel from '../components/product/NewsCarousel';
import useAuthUser from '../hooks/useAuthUser';
import useNotification from '../hooks/useNotification';
import CartService from '../services/CartService';
import NotificationContainer from '../components/button/NotificationContainer';
import useAddToCart from '../hooks/useAddToCart';

const mockNews = [
  {
    _id: 'news1',
    title: 'TechZone khai trương chi nhánh mới tại Hà Nội',
    image: '/TECHZONE-Logo.png',
    summary: 'Chúng tôi vừa khai trương chi nhánh mới với nhiều ưu đãi hấp dẫn.',
    date: '2024-06-01',
  },
  {
    _id: 'news2',
    title: 'Sự kiện giảm giá mùa hè lên đến 50%',
    image: '/BUILDPC-Banner.png',
    summary: 'Đừng bỏ lỡ cơ hội mua sắm các sản phẩm công nghệ với giá cực sốc!',
    date: '2024-06-10',
  },
  {
    _id: 'news3',
    title: 'TechZone hợp tác cùng Intel ra mắt CPU thế hệ mới',
    image: '/vite.svg',
    summary: 'Sản phẩm CPU Intel Gen mới đã có mặt tại TechZone.',
    date: '2024-06-15',
  },
  {
    _id: 'news4',
    title: 'Chương trình tri ân khách hàng thân thiết',
    image: '/LogoSingle.png',
    summary: 'Nhiều phần quà hấp dẫn dành cho khách hàng thân thiết của TechZone.',
    date: '2024-06-20',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const floatingMenuRef = useRef(null);
  const [newsIndex, setNewsIndex] = useState(0);
  const newsItemsToShow = 3;
  const { currentUserId } = useAuthUser();
  const { 
    notifications, 
    displayNotification, 
    closeNotification
  } = useNotification();
  const { addToCart } = useAddToCart();

  // Transfer guest cart when user logs in
  const transferGuestCartToUser = async () => {
    if (!currentUserId) return;
    
    try {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (guestCart.length === 0) return;

      // Convert guest cart format to match backend expectations
      const guestCartItems = guestCart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const result = await CartService.transferGuestCartToUser(currentUserId, guestCartItems);
      
      if (result.success) {
        displayNotification(result.message, 'success');
        
        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            displayNotification(warning, 'warning');
          });
        }
        
        // Clear guest cart after successful transfer
        localStorage.removeItem('guestCart');
        
        // Dispatch cart updated event
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Failed to transfer guest cart:', err);
      displayNotification('Không thể chuyển sản phẩm vào tài khoản!', 'error');
    }
  };

  useEffect(() => {
    ProductService.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    ReviewService.getProductsWithHighRatings(4, 4)
      .then(data => setFeaturedProducts(data))
      .catch(err => {
        console.error('Failed to fetch featured products:', err);
        // Fallback to regular products if featured products fetch fails
        setFeaturedProducts([]);
      })
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    CategoryService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      setSidebarHeight(sidebarRef.current.clientHeight);
    }
  }, [sidebarRef, hoveredCategory]);

  // Scroll detection to hide CategorySidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Hide CategorySidebar when scrolled past 200px (same threshold as navbar)
      setIsScrolled(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transfer guest cart when user logs in
  useEffect(() => {
    if (currentUserId) {
      transferGuestCartToUser();
    }
  }, [currentUserId]);

  // Separate main categories and subcategories from merged data
  const mainCategories = categories.filter(cat => !cat.parent);
  const subcategories = categories.filter(cat => cat.parent);

  // Group subcategories by parent _id
  const subcategoriesByParent = {};
  subcategories.forEach(subcat => {
    const parentId = typeof subcat.parent === 'object' ? subcat.parent.$oid || subcat.parent : subcat.parent || subcat.parent;
    if (!subcategoriesByParent[parentId]) {
      subcategoriesByParent[parentId] = [];
    }
    subcategoriesByParent[parentId].push(subcat);
  });

  const handleCategoryMouseEnter = (categoryId) => {
    setHoveredCategory(categoryId);
  };
  
  const handleCategoryMouseLeave = () => {
    const timer = setTimeout(() => {
      setHoveredCategory(null);
    }, 2000); // 2 second delay when leaving main category
  };
  
  const handleFloatingMenuMouseEnter = () => {
    // Keep the hovered category active
    if (hoveredCategory) {
      setHoveredCategory(hoveredCategory);
    }
  };
  
  const handleFloatingMenuMouseLeave = () => {
    const timer = setTimeout(() => {
      setHoveredCategory(null);
    }, 3000); // 3 second delay when leaving floating menu
  };
  const handleMainCategoryClick = (category) => {
    if (category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category._id) {
      navigate(`/category/${category._id}`);
    }
  };
  
  const handleGroupHeaderClick = (groupName) => {
    // Find the category by name and navigate to it
    const category = categories.find(cat => cat.name === groupName);
    if (category && category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category && category._id) {
      navigate(`/category/${category._id}`);
    }
  };
  
  const handleChildSubcategoryClick = (subcategoryId, subcategoryName) => {
    // Find the category by ID and navigate to it
    const category = categories.find(cat => cat._id === subcategoryId);
    if (category && category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category && category._id) {
      navigate(`/category/${category._id}`);
    }
  };



  // CPU subcategory IDs (Intel and AMD generations)
  const cpuCategoryIds = [
    "6881469f80cdfdd23e5e88d6", // Gen 12th
    "6881469f80cdfdd23e5e88d8", // Gen 13th
    "6881469f80cdfdd23e5e88da", // Gen 14th
    "6881469f80cdfdd23e5e88e1", // Ryzen 7000
    "6881469f80cdfdd23e5e88e2", // Ryzen 5000
    "6881469f80cdfdd23e5e88e3", // Ryzen 3000
  ];

  // Add to Cart handler
  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  // Navigation handlers for View All buttons
  const handleViewAllFeatured = () => {
    // Navigate to a special route that will show products with 4-5 star reviews
    navigate('/category/featured?rating=4-5');
  };

  const handleViewAllCPU = () => {
    // Find CPU category and navigate to it
    const cpuCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('cpu') || 
      cat.name.toLowerCase().includes('processor')
    );
    if (cpuCategory && cpuCategory.slug) {
      navigate(`/category/${cpuCategory.slug}`);
    } else {
      // Fallback to a general CPU category if not found
      navigate('/category/cpu');
    }
  };

  const handleViewAllMonitor = () => {
    // Find Monitor category and navigate to it
    const monitorCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('màn hình') || 
      cat.name.toLowerCase().includes('monitor')
    );
    if (monitorCategory && monitorCategory.slug) {
      navigate(`/category/${monitorCategory.slug}`);
    } else {
      // Fallback to a general monitor category if not found
      navigate('/category/monitor');
    }
  };

  const handleViewAllAccessories = () => {
    // Find Accessories category and navigate to it
    const accessoriesCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('phụ kiện') || 
      cat.name.toLowerCase().includes('accessories')
    );
    if (accessoriesCategory && accessoriesCategory.slug) {
      navigate(`/category/${accessoriesCategory.slug}`);
    } else {
      // Fallback to a general accessories category if not found
      navigate('/category/accessories');
    }
  };

  // ProductCard render function
  const renderProductCard = (product) => (
    <ProductCard
      key={product._id}
      product={product}
      onAddToCart={() => handleAddToCart(product)}
    />
  );

  // NewsCard render function for mock news
  const renderNewsCard = (news) => (
    <div key={news._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden w-[340px] flex-shrink-0">
      <div className="relative bg-white flex items-center justify-center" style={{height:208}}>
        <img src={news.image} alt={news.title} className="object-contain h-52 w-full" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs text-gray-500 mb-1">{news.date}</span>
                        <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
        }}>{news.title}</h3>
        <div className="text-sm text-gray-600 mb-2">{news.summary}</div>
                      </div>
                    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 cursor-pointer-all">
      <NotificationContainer
        notifications={notifications}
        onClose={closeNotification}
      />
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-0 pb-4 -mt-2">
          <div className="flex gap-8 mb-8 relative">
            {!isScrolled && (
              <div 
                ref={sidebarRef}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CategorySidebar
                  mainCategories={mainCategories}
                  subcategoriesByParent={subcategoriesByParent}
                  hoveredCategory={hoveredCategory}
                  setHoveredCategory={setHoveredCategory}
                  sidebarRef={sidebarRef}
                  sidebarHeight={sidebarHeight}
                  handleCategoryMouseEnter={handleCategoryMouseEnter}
                  handleCategoryMouseLeave={handleCategoryMouseLeave}
                  floatingMenuRef={floatingMenuRef}
                  handleFloatingMenuMouseEnter={handleFloatingMenuMouseEnter}
                  handleFloatingMenuMouseLeave={handleFloatingMenuMouseLeave}
                  handleMainCategoryClick={handleMainCategoryClick}
                  handleGroupHeaderClick={handleGroupHeaderClick}
                  handleChildSubcategoryClick={handleChildSubcategoryClick}
                />
              </div>
            )}
            {/* Banner/Ads Placeholder */}
            <div className="flex-1 mt-6">
              <div
                className="w-full bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl shadow flex items-center justify-center"
              >
                <img
                  src="/BUILDPC-Banner.png"
                  alt="TechZone Banner"
                  className="w-full h-auto object-cover rounded-2xl"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
          {/* Main Content Area: All Products Section */}
          <div className="w-full">
            {/* Featured Products Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 shadow-lg border border-emerald-100">
              <ProductSection
                title="Sản phẩm nổi bật"
                products={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)}
                loading={featuredLoading && loading}
                renderProduct={renderProductCard}
                onViewAll={handleViewAllFeatured}
                sectionStyle="mb-0"
                titleStyle="text-emerald-800"
                lineStyle="bg-emerald-400"
                buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
            </div>

            {/* CPU Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 shadow-lg border border-emerald-100">
              <ProductSection
                title="CPU"
                products={products.filter(product => {
                      if (!product.category) return false;
                      const catId = typeof product.category === 'object' ? product.category._id : product.category;
                      return cpuCategoryIds.includes(catId);
                }).slice(0, 8)}
                loading={loading}
                renderProduct={renderProductCard}
                onViewAll={handleViewAllCPU}
                sectionStyle="mb-0"
                titleStyle="text-emerald-800"
                lineStyle="bg-emerald-400"
                buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
            </div>

            {/* Monitor Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 shadow-lg border border-emerald-100">
              <ProductSection
                title="Màn hình"
                products={products.filter(product => (product.category && ['688122b612839dc4b8e5fe2a', '68814c9580cdfdd23e5e8c95', '68814c9580cdfdd23e5e8c94', '68814c9580cdfdd23e5e8c93'].includes(product.category._id))).slice(0, 8)}
                loading={loading}
                renderProduct={renderProductCard}
                onViewAll={handleViewAllMonitor}
                sectionStyle="mb-0"
                titleStyle="text-emerald-800"
                lineStyle="bg-emerald-400"
                buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
            </div>

            {/* Accessories Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 shadow-lg border border-emerald-100">
              <ProductSection
                title="Phụ kiện"
                products={products.filter(product => (product.category && product.category._id === '68814ff880cdfdd23e5e8d42')).slice(0, 8)}
                loading={loading}
                renderProduct={renderProductCard}
                onViewAll={handleViewAllAccessories}
                sectionStyle="mb-0"
                titleStyle="text-emerald-800"
                lineStyle="bg-emerald-400"
                buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
            </div>
            <NewsCarousel
              products={mockNews}
              loading={false}
              newsIndex={newsIndex}
              setNewsIndex={setNewsIndex}
              itemsToShow={newsItemsToShow}
              renderProduct={renderNewsCard}
              maxNewsIndex={mockNews.length - newsItemsToShow}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;