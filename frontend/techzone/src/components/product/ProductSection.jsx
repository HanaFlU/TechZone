import React from 'react';

const ProductSection = ({
  title,
  products = [],
  loading = false,
  renderProduct,
  onViewAll,
  sectionStyle = "mb-12",
  titleStyle = "text-gray-900",
  lineStyle = "bg-gray-300",
  buttonStyle = "bg-green-600 hover:bg-emerald-700 text-white",
}) => {
  return (
    <section className={sectionStyle}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center flex-1">
          <h2 className={`text-2xl font-bold ${titleStyle} mr-4`}>{title}</h2>
          <div className="flex-1 h-1 bg-green-700 mr-4"></div>
        </div>
        <button
          className={`${buttonStyle} font-semibold py-2 px-4 rounded-lg shadow transition-colors`}
          style={{ minWidth: '110px' }}
          onClick={onViewAll}
        >
          Xem tất cả
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