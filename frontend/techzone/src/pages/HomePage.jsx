import React, { useEffect, useState, useRef } from 'react';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import CategorySidebar from '../components/layout/user/CategorySidebar';
import ProductSection from '../components/product/ProductSection';
import ProductCard from '../components/product/ProductCard';
import NewsCarousel from '../components/product/NewsCarousel';
import useAuthUser from '../hooks/useAuthUser';
import useNotification from '../hooks/useNotification';
import CartService from '../services/CartService';
import { useGuestCartTransfer } from '../hooks/useGuestCartTransfer';
import NotificationContainer from '../components/button/NotificationContainer';
import { useStockValidation } from '../hooks/useStockValidation';

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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const sidebarRef = useRef(null);
  const floatingMenuRef = useRef(null);
  const [newsIndex, setNewsIndex] = useState(0);
  const newsItemsToShow = 3;
  const newsProducts = products; // You can replace this with actual news data if available
  const maxNewsIndex = Math.max(0, newsProducts.length - newsItemsToShow);
  const { currentUserId } = useAuthUser();
  const { 
    notifications, 
    displayNotification, 
    closeNotification
  } = useNotification();
  const { transferGuestCartToUser } = useGuestCartTransfer(
    currentUserId, 
    displayNotification
  );
  const { validateStockForAddToCart } = useStockValidation(displayNotification);

  useEffect(() => {
    ProductService.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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

  const handleCategoryMouseEnter = (categoryId) => setHoveredCategory(categoryId);
  const handleCategoryMouseLeave = () => setHoveredCategory(null);
  const handleFloatingMenuMouseEnter = () => {};
  const handleFloatingMenuMouseLeave = () => setHoveredCategory(null);
  const handleGroupHeaderClick = (groupName) => {};
  const handleChildSubcategoryClick = (subcategoryId, subcategoryName) => {};



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
    console.log('handleAddToCart called with product:', product);
    console.log('Product stock:', product.stock);
    
    if (currentUserId) {
      // Logged-in user: use CartService
      try {
        // First, get current cart to check existing quantity
        let currentCart = [];
        try {
          const cartData = await CartService.getCartData(currentUserId);
          currentCart = cartData?.items || [];
          console.log('Current cart items:', currentCart);
        } catch (err) {
          console.error('Failed to get current cart:', err);
          currentCart = [];
        }

        // Find existing item in cart
        const existingItem = currentCart.find(item => item.product._id === product._id);
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        
        console.log('Stock validation:', {
          existingItem,
          currentQuantity,
          productStock: product.stock
        });

        // Validate stock using the hook
        if (!validateStockForAddToCart(product, currentQuantity)) {
          return;
        }

        await CartService.addToCart(currentUserId, product._id, 1);
        // Dispatch event to update navbar cart
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        if (err.response?.data?.message) {
          displayNotification(err.response.data.message, 'error');
        } else {
          displayNotification('Thêm vào giỏ hàng thất bại!', 'error');
        }
      }
    } else {
      // Guest: use localStorage
      let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existing = guestCart.find(item => item.productId === product._id);
      const currentQuantity = existing ? existing.quantity : 0;
      
      console.log('Guest cart validation:', {
        existing,
        currentQuantity,
        productStock: product.stock
      });

      // Validate stock using the hook
      if (!validateStockForAddToCart(product, currentQuantity)) {
        return;
      }

      if (existing) {
        existing.quantity += 1;
      } else {
        guestCart.push({ productId: product._id, quantity: 1, product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      // Dispatch event to update navbar cart
      window.dispatchEvent(new Event('cartUpdated'));
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NotificationContainer
        notifications={notifications}
        onClose={closeNotification}
      />
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-0 pb-4 -mt-2">
          <div className="flex gap-8 mb-8 relative">
            <div ref={sidebarRef}>
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
                handleGroupHeaderClick={handleGroupHeaderClick}
                handleChildSubcategoryClick={handleChildSubcategoryClick}
              />
            </div>
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
            <ProductSection
              title="Sản phẩm nổi bật"
              products={products.slice(0, 4)}
              loading={loading}
              renderProduct={renderProductCard}
            />
            <ProductSection
              title="CPU"
              products={products.filter(product => {
                    if (!product.category) return false;
                    const catId = typeof product.category === 'object' ? product.category._id : product.category;
                    return cpuCategoryIds.includes(catId);
              }).slice(0, 4)}
              loading={loading}
              renderProduct={renderProductCard}
            />
            <ProductSection
              title="Màn hình"
              products={products.filter(product => (product.category && ['688122b612839dc4b8e5fe2a', '68814c9580cdfdd23e5e8c95', '68814c9580cdfdd23e5e8c94', '68814c9580cdfdd23e5e8c93'].includes(product.category._id))).slice(0, 4)}
              loading={loading}
              renderProduct={renderProductCard}
            />
            <ProductSection
              title="Phụ kiện"
              products={products.filter(product => (product.category && product.category._id === '68814ff880cdfdd23e5e8d42')).slice(0, 4)}
              loading={loading}
              renderProduct={renderProductCard}
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