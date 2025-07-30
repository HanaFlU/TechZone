import React from 'react';
import ProductSection from '../product/ProductSection';

const HomePageProductSections = ({
  featuredProducts,
  products,
  cpuProducts,
  monitorProducts,
  accessoriesProducts,
  loading,
  renderProductCard,
  handleViewAllFeatured,
  handleViewAllCPU,
  handleViewAllMonitor,
  handleViewAllAccessories
}) => {
  return (
    <>
      {/* Featured Products Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 shadow-lg border border-emerald-100">
        <ProductSection
          title="Sản phẩm nổi bật"
          products={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)}
          loading={loading}
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
          products={cpuProducts.slice(0, 8)}
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
          products={monitorProducts.slice(0, 8)}
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
          products={accessoriesProducts.slice(0, 8)}
          loading={loading}
          renderProduct={renderProductCard}
          onViewAll={handleViewAllAccessories}
          sectionStyle="mb-0"
          titleStyle="text-emerald-800"
          lineStyle="bg-emerald-400"
          buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white"
        />
      </div>
    </>
  );
};

export default HomePageProductSections; 