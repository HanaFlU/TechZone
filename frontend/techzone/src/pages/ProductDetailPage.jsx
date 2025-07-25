import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import useNotification from '../hooks/useNotification';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { displayNotification } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await ProductService.getProductById(id);
        setProduct(productData);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (quantity < 1) {
      displayNotification('Số lượng phải lớn hơn 0', 'error');
      return;
    }

    if (!user) {
      // Guest user: add to localStorage
      try {
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existing = guestCart.find(item => item.product._id === product._id);
        
        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.push({ product, quantity });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        displayNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
        
        // Dispatch cart updated event
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        displayNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
        console.error('Error adding to guest cart:', err);
      }
      return;
    }

    // Authenticated user: use CartService
    try {
      setAddingToCart(true);
      await CartService.addToCart(user._id, product._id, quantity);
      displayNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
    } catch (err) {
      displayNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (quantity < 1) {
      displayNotification('Số lượng phải lớn hơn 0', 'error');
      return;
    }

    if (!user) {
      // Guest user: add to localStorage and navigate to cart
      try {
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existing = guestCart.find(item => item.product._id === product._id);
        
        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.push({ product, quantity });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        
        // Dispatch cart updated event
        window.dispatchEvent(new Event('cartUpdated'));
        
        navigate('/cart');
      } catch (err) {
        displayNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
        console.error('Error adding to guest cart:', err);
      }
      return;
    }

    // Authenticated user: use CartService
    try {
      setAddingToCart(true);
      await CartService.addToCart(user._id, product._id, quantity);
      navigate('/cart');
    } catch (err) {
      displayNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
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
              <div className="bg-white rounded-lg p-4 border border-gray-200">
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

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
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
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 border border-gray-300 rounded-lg text-center"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-sm text-gray-600">
                  {product.description}
                </div>
              </div>
            )}

            {/* Product Specifications */}
            {product.specs && product.specs.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                <div className="space-y-3">
                  {product.specs.map((spec, index) => (
                    <div key={index} className="flex border-b border-gray-100 pb-2">
                      <span className="w-1/3 text-sm font-medium text-gray-700">
                        {spec.label}
                      </span>
                      <span className="w-2/3 text-sm text-gray-600">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 