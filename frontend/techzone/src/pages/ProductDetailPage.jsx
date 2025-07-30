import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import VoucherService from '../services/VoucherService';
import useNotification from '../hooks/useNotification';
import useAuthUser from '../hooks/useAuthUser';
import useAddToCart from '../hooks/useAddToCart';
import NotificationContainer from '../components/button/NotificationContainer';
import ProductReview from './ProductReview';
import ProductSpecifications from '../components/product/ProductSpecifications';


const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setShowLoginModal } = useContext(AuthContext);
  const { notifications, displayNotification, closeNotification } = useNotification();
  const { currentUserId } = useAuthUser();
  const { addToCart, addToCartAndBuyNow } = useAddToCart(displayNotification);
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product and categories first (required)
        const [productData, categoriesData] = await Promise.all([
          ProductService.getProductById(id),
          CategoryService.getCategories()
        ]);
        console.log('Fetched product:', productData);
        setProduct(productData);
        setCategories(categoriesData);
        const vouchersData = await VoucherService.getAllVouchers({ status: 'active' });
        setVouchers(vouchersData.vouchers || []);
        setError(null);
      } catch (err) {
        // More specific error messages
        if (err.response?.status === 404) {
          setError('Sản phẩm không tồn tại');
        } else if (err.response?.status === 500) {
          setError('Lỗi server, vui lòng thử lại sau');
        } else if (err.message === 'Network Error') {
          setError('Không thể kết nối đến server');
        } else {
          setError('Không thể tải thông tin sản phẩm');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const checkoutData = await addToCartAndBuyNow(product, quantity);
    if (checkoutData) {
      navigate('/order');
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

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      displayNotification('Đã sao chép mã voucher!', 'success');
    }).catch(() => {
      displayNotification('Không thể sao chép mã voucher', 'error');
    });
  };

  const formatVoucherType = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `Giảm ${voucher.discountValue}%`;
    } else if (voucher.discountType === 'fixed') {
      return `Giảm ${voucher.discountValue?.toLocaleString('vi-VN')}₫`;
    } else if (voucher.discountType === 'shipping') {
      return 'Miễn phí ship';
    }
    return 'Giảm giá';
  };

  const getVoucherColor = (index) => {
    const colors = [
      { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-600', hover: 'hover:text-purple-700' },
      { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: 'bg-blue-500', text: 'text-blue-600', hover: 'hover:text-blue-700' },
      { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-600', hover: 'hover:text-green-700' },
      { bg: 'from-orange-50 to-red-50', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-600', hover: 'hover:text-orange-700' },
      { bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', icon: 'bg-indigo-500', text: 'text-indigo-600', hover: 'hover:text-indigo-700' },
      { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', icon: 'bg-pink-500', text: 'text-pink-600', hover: 'hover:text-pink-700' }
    ];
    return colors[index % colors.length];
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
            className="bg-light-green text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 py-8 cursor-pointer-all">
      <NotificationContainer
        notifications={notifications}
        onClose={closeNotification}
      />
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
                {product.category?.slug || product.category?._id ? (
                  <button
                    onClick={() => {
                      if (product.category.slug) {
                        navigate(`/category/${product.category.slug}`);
                      } else if (product.category._id) {
                        // Fallback to using category ID if slug is missing
                        navigate(`/category/${product.category._id}`);
                      }
                    }}
                    className="ml-1 text-sm font-medium text-gray-500 md:ml-2 hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                  >
                    {product.category.name}
                  </button>
                ) : (
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {product.category?.name || 'Danh mục'}
                  </span>
                )}
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
              {product.category && (product.category.slug || product.category._id) && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Danh mục: </span>
                  <button
                    onClick={() => {
                      if (product.category.slug) {
                        navigate(`/category/${product.category.slug}`);
                      } else if (product.category._id) {
                        // Fallback to using category ID if slug is missing
                        navigate(`/category/${product.category._id}`);
                      }
                    }}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                  >
                    {product.category.name}
                  </button>
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
              <div className="flex space-x-3">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-light-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Mua ngay
                </button>
                                 <button
                   onClick={handleAddToCart}
                   disabled={product.stock === 0}
                   className="flex-1 bg-white text-light-green border-2 border-light-green py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700  hover:text-white disabled:bg-gray-400 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   Thêm vào giỏ hàng
                 </button>
              </div>

              {/* Voucher Display */}
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Vouchers khả dụng ({vouchers.length})
                </h3>
                {vouchers.length > 0 ? (
                  vouchers.slice(0, 4).map((voucher, index) => {
                    const colors = getVoucherColor(index);
                    
                    return (
                      <div key={voucher._id} className={`p-3 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-lg`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 ${colors.icon} rounded-full flex items-center justify-center`}>
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-900">
                                {voucher.discountType === 'percentage' ? 'Giảm giá %' :
                                 voucher.discountType === 'fixed' ? 'Giảm tiền mặt' :
                                 voucher.discountType === 'shipping' ? 'Miễn phí vận chuyển' : 'Giảm giá'}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {voucher.minimumOrderAmount ? `Từ ${voucher.minimumOrderAmount.toLocaleString('vi-VN')}₫` : 'Không giới hạn'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${colors.text}`}>{voucher.code}</div>
                            <div className="text-xs text-gray-500">{formatVoucherType(voucher)}</div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="text-gray-500">{voucher.description || 'Voucher giảm giá'}</span>
                            <button 
                              onClick={() => copyVoucherCode(voucher.code)}
                              className={`${colors.text} ${colors.hover} font-medium text-xs`}
                            >
                              Sao chép
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 text-center">Không có voucher khả dụng</p>
                  </div>
                )}
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
                  dangerouslySetInnerHTML={{ 
                    __html: product.description || ""
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