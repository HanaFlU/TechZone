import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const getProductImage = (product) => {
    const isGoogleImageLink = url => typeof url === 'string' && url.includes('google.com/imgres');
    let images = [];
    if (Array.isArray(product.images)) images = product.images;
    else if (typeof product.images === 'string') images = [product.images];
    images = images.filter(url => url && !isGoogleImageLink(url));
    return images[0] || '/default-product-image.svg';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative bg-white flex items-center justify-center" style={{height:208}}>
          <img src={getProductImage(product)} alt={product.name} className="object-contain h-52 w-full" />
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        {product.category && (product.category.slug || product.category._id) && (
          <button
            onClick={() => {
              if (product.category.slug) {
                navigate(`/category/${product.category.slug}`);
              } else if (product.category._id) {
                // Fallback to using category ID if slug is missing
                navigate(`/category/${product.category._id}`);
              }
            }}
            className="text-xs text-gray-500 mb-1 hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
          >
            {product.category.name || product.category}
          </button>
        )}
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden hover:text-emerald-600 transition-colors" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>{product.name}</h3>
        </Link>
        {product.specs && product.specs.length > 0 && (
          <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-x-2 gap-y-1 items-center">
            {product.specs.slice(0, 3).map((spec, index) => (
              <span key={index}><span className="font-medium">{spec.label}: {spec.value}</span></span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 mb-2">
          <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
        </div>
        <button
          className="mt-auto bg-light-green hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={() => onAddToCart(product)}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 