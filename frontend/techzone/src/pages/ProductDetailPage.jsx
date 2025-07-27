import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import CategoryService from '../services/CategoryService';
import useNotification from '../hooks/useNotification';
import useAuthUser from '../hooks/useAuthUser';
import { useStockValidation } from '../hooks/useStockValidation';
import ProductReview from './ProductReview';
import ProductSpecifications from '../components/product/ProductSpecifications';
import { formatDescriptionWithCategories } from '../utils/textHighlighter';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setShowLoginModal } = useContext(AuthContext);
  const { displayNotification } = useNotification();
  const { currentUserId } = useAuthUser();
  const { validateStockForAddToCart } = useStockValidation(displayNotification);
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product and categories in parallel
        const [productData, categoriesData] = await Promise.all([
          ProductService.getProductById(id),
          CategoryService.getCategories()
        ]);
        
        setProduct(productData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddToCart = async () => {
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

        await CartService.addToCart(currentUserId, product._id, quantity);
        displayNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
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
        existing.quantity += quantity;
      } else {
        guestCart.push({ productId: product._id, quantity: quantity, product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      displayNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
      // Dispatch event to update navbar cart
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleBuyNow = async () => {
    if (quantity < 1) {
      displayNotification('Số lượng phải lớn hơn 0', 'error');
      return;
    }

    if (!currentUserId) {
      // Guest user: show login modal
      setShowLoginModal(true);
      return;
    }

    // Logged-in user: validate stock and create order data directly
    try {
      // Validate stock for the selected quantity
      if (quantity > product.stock) {
        displayNotification(`Không đủ số lượng sản phẩm "${product.name}". Chỉ còn ${product.stock} sản phẩm trong kho.`, 'warning');
        return;
      }

      // Get customer ID from cart data (needed for order page)
      let customerId = null;
      try {
        const cartData = await CartService.getCartData(currentUserId);
        customerId = cartData?.customer;
      } catch (err) {
        console.error('Failed to get customer ID:', err);
        displayNotification('Không thể lấy thông tin khách hàng', 'error');
        return;
      }

      if (!customerId) {
        displayNotification('Không tìm thấy thông tin khách hàng', 'error');
        return;
      }

      // Create order data directly (without adding to cart)
      const orderItem = {
        product: product,
        quantity: quantity
      };

      const checkoutData = {
        customer: customerId,
        items: [orderItem]
      };

      // Store in localStorage for order page
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      console.log('Created checkout data for direct order:', checkoutData);

      // Redirect to order page
      navigate('/order');
    } catch (err) {
      if (err.response?.data?.message) {
        displayNotification(err.response.data.message, 'error');
      } else {
        displayNotification('Không thể tạo đơn hàng', 'error');
      }
      console.error('Error creating order:', err);
    }
  };

  const getProductImages = (product) => {
    if (!product || !product.images) return [];
    const isGoogleImageLink = url => typeof url === 'string' && url.includes('google.com/imgres');
    let images = Array.isArray(product.images) ? product.images : [product.images];
    return images.filter(url => url && !isGoogleImageLink(url));
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + '₫';
  };

  const getDiscountedPrice = (product) => {
    if (!product.saleEvent) return product.price;
    const discount = product.saleEvent.discountPercentage || 0;
    return product.price * (1 - discount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-4">{error || 'Sản phẩm không tồn tại'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.saleEvent && product.saleEvent.discountPercentage > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
              >
                Trang chủ
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.category?.name || 'Danh mục'}
                </span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Product Section - Single Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-lg p-4">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                  <img
                    src={images[selectedImage] || '/default-product-image.svg'}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border-2 ${
                          selectedImage === index ? 'border-emerald-600' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-20 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-4">
              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Category */}
              {product.category && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Danh mục: </span>
                  <span className="text-sm font-medium text-emerald-600">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-emerald-600">
                        {formatPrice(discountedPrice)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        -{product.saleEvent.discountPercentage}%
                      </span>
                    </div>
                    {product.saleEvent.name && (
                      <div className="text-sm text-gray-600">
                        Khuyến mãi: {product.saleEvent.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">
                      Còn hàng ({product.stock} sản phẩm)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Hết hàng</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={product.stock === 0}
                    className="w-20 h-10 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Mua ngay
                </button>
              </div>

              {/* Voucher Display */}
              <div className="mt-6 space-y-2">
                {/* Voucher 1 - Percentage Discount */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">Giảm giá %</h4>
                        <p className="text-xs text-gray-600">Từ 500K</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-600">GIAM15</div>
                      <div className="text-xs text-gray-500">Giảm 15%</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>31/12/2024</span>
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-xs">
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voucher 2 - Fixed Amount */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">Giảm tiền mặt</h4>
                        <p className="text-xs text-gray-600">Từ 1M</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">GIAM100K</div>
                      <div className="text-xs text-gray-500">Giảm 100K</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>15/01/2025</span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voucher 3 - Free Shipping */}
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">Miễn phí vận chuyển</h4>
                        <p className="text-xs text-gray-600">Từ 200K</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">FREESHIP</div>
                      <div className="text-xs text-gray-500">Miễn phí ship</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>28/02/2025</span>
                      <button className="text-green-600 hover:text-green-700 font-medium text-xs">
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voucher 4 - New User */}
                <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">Khách hàng mới</h4>
                        <p className="text-xs text-gray-600">Lần mua đầu tiên</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600">NEWUSER</div>
                      <div className="text-xs text-gray-500">Giảm 200K</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>31/03/2025</span>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-xs">
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Specifications - Parallel Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Product Description */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Mô tả sản phẩm</h3>
            </div>
            <div className="p-8">
              {product.description && product.description.trim() !== "" ? (
                <div 
                  className="prose prose-lg text-gray-700 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ 
                    __html: formatDescriptionWithCategories(product.description, categories) 
                  }}
                />
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Sản phẩm này đang cập nhật thông tin
                </div>
              )}
            </div>
          </div>

          {/* Product Specifications */}
          <div className="lg:col-span-1">
            <ProductSpecifications specs={product.specs} />
          </div>
        </div>
       
        {/* Product Review Component */}
        <ProductReview productId={id} />

      </div>
    </div>
  );
};
export default ProductDetailPage;