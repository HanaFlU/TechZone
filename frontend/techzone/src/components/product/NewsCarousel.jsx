import React, { useRef } from 'react';

const NewsCarousel = ({
  products = [],
  loading = false,
  newsIndex = 0,
  setNewsIndex = () => {},
  itemsToShow = 3,
  renderProduct,
  maxNewsIndex,
}) => {
  const newsCarouselRef = useRef();
  const maxIndex =
    typeof maxNewsIndex === 'number'
      ? maxNewsIndex
      : Math.max(0, products.length - itemsToShow);

  const handleLeft = () => setNewsIndex(i => Math.max(0, i - 1));
  const handleRight = () => setNewsIndex(i => Math.min(maxIndex, i + 1));

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center flex-1">
          <span className="h-0.5 w-16 bg-gray-300 mr-4 hidden sm:inline-block"></span>
          <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">Tin tức</h2>
          <span className="h-0.5 w-16 bg-gray-300 ml-4 hidden sm:inline-block"></span>
        </div>
      </div>
      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : (
        <div className="flex items-center justify-center gap-6">
          <button
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow-sm hover:border-green-600 hover:bg-green-50 hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-50"
            onClick={handleLeft}
            disabled={newsIndex === 0}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="overflow-hidden w-[1080px]">
            <div
              ref={newsCarouselRef}
              className="flex gap-6"
              style={{
                transform: `translateX(-${newsIndex * (340 + 24)}px)`, // 340px width + 24px gap
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)'
              }}
            >
              {products.map(renderProduct)}
            </div>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow-sm hover:border-green-600 hover:bg-green-50 hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-50"
            onClick={handleRight}
            disabled={newsIndex === maxIndex}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default NewsCarousel; 