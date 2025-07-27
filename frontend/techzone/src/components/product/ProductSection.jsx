import React from 'react';

const ProductSection = ({
  title,
  products = [],
  loading = false,
  renderProduct,
  onViewAll,
}) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center flex-1">
          <span className="h-0.5 w-16 bg-gray-300 mr-4 hidden sm:inline-block"></span>
          <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">{title}</h2>
          <span className="h-0.5 w-16 bg-gray-300 ml-4 hidden sm:inline-block"></span>
        </div>
        <button
          className="absolute right-0 top-0 bg-green-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
          style={{ minWidth: '110px' }}
          onClick={onViewAll}
        >
          View All
        </button>
      </div>
      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(renderProduct)}
        </div>
      )}
    </section>
  );
};

export default ProductSection; 