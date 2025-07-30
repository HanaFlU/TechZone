import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import useNotification from '../hooks/useNotification';
import useAddToCart from '../hooks/useAddToCart';
import { useHomePageCategories } from '../hooks/useHomePageCategories';
import { useHomePageProducts } from '../hooks/useHomePageProducts';
import { useHomePageSidebar } from '../hooks/useHomePageSidebar';
import CartService from '../services/CartService';
import NotificationContainer from '../components/button/NotificationContainer';
import ProductCard from '../components/product/ProductCard';
import HomePageSidebar from '../components/home/HomePageSidebar';
import HomePageProductSections from '../components/home/HomePageProductSections';
import NewsCarousel from '../components/product/NewsCarousel';
import { mockNews } from '../constants/mockData';

const HomePage = () => {
  const navigate = useNavigate();
  const [newsIndex, setNewsIndex] = useState(0);
  const newsItemsToShow = 3;
  const { currentUserId } = useAuthUser();
  const { 
    notifications, 
    displayNotification, 
    closeNotification
  } = useNotification();
  const { addToCart } = useAddToCart(displayNotification);

  // Custom hooks
  const { categories, mainCategories, subcategoriesByParent } = useHomePageCategories();
  const { 
    products, 
    featuredProducts, 
    loading, 
    featuredLoading,
    cpuProducts, 
    monitorProducts, 
    accessoriesProducts 
  } = useHomePageProducts(categories);
  const sidebarProps = useHomePageSidebar(categories);

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

  // Transfer guest cart when user logs in
  useEffect(() => {
    if (currentUserId) {
      transferGuestCartToUser();
    }
  }, [currentUserId]);

  // Navigation handlers for View All buttons
  const handleViewAllFeatured = () => {
    navigate('/category/featured?rating=4-5');
  };

  const handleViewAllCPU = () => {
    const cpuCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('cpu') || 
      cat.name.toLowerCase().includes('processor')
    );
    if (cpuCategory && cpuCategory.slug) {
      navigate(`/category/${cpuCategory.slug}`);
    } else {
      navigate('/category/cpu');
    }
  };

  const handleViewAllMonitor = () => {
    const monitorCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('màn hình') || 
      cat.name.toLowerCase().includes('monitor')
    );
    if (monitorCategory && monitorCategory.slug) {
      navigate(`/category/${monitorCategory.slug}`);
    } else {
      navigate('/category/monitor');
    }
  };

  const handleViewAllAccessories = () => {
    const accessoriesCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('phụ kiện') || 
      cat.name.toLowerCase().includes('accessories')
    );
    if (accessoriesCategory && accessoriesCategory.slug) {
      navigate(`/category/${accessoriesCategory.slug}`);
    } else {
      navigate('/category/accessories');
    }
  };

  // Add to Cart handler
  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
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
            <HomePageSidebar
              {...sidebarProps}
              mainCategories={mainCategories}
              subcategoriesByParent={subcategoriesByParent}
            />
            {/* Banner/Ads Placeholder */}
            <div className="flex-1 mt-6">
              <div className="w-full bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl shadow flex items-center justify-center">
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
            <HomePageProductSections
              featuredProducts={featuredProducts}
              products={products}
              cpuProducts={cpuProducts}
              monitorProducts={monitorProducts}
              accessoriesProducts={accessoriesProducts}
              loading={loading}
              renderProductCard={renderProductCard}
              handleViewAllFeatured={handleViewAllFeatured}
              handleViewAllCPU={handleViewAllCPU}
              handleViewAllMonitor={handleViewAllMonitor}
              handleViewAllAccessories={handleViewAllAccessories}
            />
            
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