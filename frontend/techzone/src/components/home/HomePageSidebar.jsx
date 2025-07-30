import React from 'react';
import CategorySidebar from '../layout/user/CategorySidebar';

const HomePageSidebar = ({
  isScrolled,
  sidebarRef,
  hoveredCategory,
  setHoveredCategory,
  sidebarHeight,
  mainCategories,
  subcategoriesByParent,
  handleCategoryMouseEnter,
  handleCategoryMouseLeave,
  floatingMenuRef,
  handleFloatingMenuMouseEnter,
  handleFloatingMenuMouseLeave,
  handleMainCategoryClick,
  handleGroupHeaderClick,
  handleChildSubcategoryClick
}) => {
  if (isScrolled) return null;

  return (
    <div 
      ref={sidebarRef}
      onMouseLeave={() => setHoveredCategory(null)}
    >
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
        handleMainCategoryClick={handleMainCategoryClick}
        handleGroupHeaderClick={handleGroupHeaderClick}
        handleChildSubcategoryClick={handleChildSubcategoryClick}
      />
    </div>
  );
};

export default HomePageSidebar; 