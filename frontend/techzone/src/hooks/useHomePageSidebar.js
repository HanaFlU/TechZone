import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHomePageSidebar = (categories) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const floatingMenuRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current) {
      setSidebarHeight(sidebarRef.current.clientHeight);
    }
  }, [sidebarRef, hoveredCategory]);

  // Scroll detection to hide CategorySidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Hide CategorySidebar when scrolled past 200px (same threshold as navbar)
      setIsScrolled(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryMouseEnter = (categoryId) => {
    setHoveredCategory(categoryId);
  };
  
  const handleCategoryMouseLeave = () => {
    const timer = setTimeout(() => {
      setHoveredCategory(null);
    }, 2000); // 2 second delay when leaving main category
  };
  
  const handleFloatingMenuMouseEnter = () => {
    // Keep the hovered category active
    if (hoveredCategory) {
      setHoveredCategory(hoveredCategory);
    }
  };
  
  const handleFloatingMenuMouseLeave = () => {
    const timer = setTimeout(() => {
      setHoveredCategory(null);
    }, 3000); // 3 second delay when leaving floating menu
  };

  const handleMainCategoryClick = (category) => {
    if (category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category._id) {
      navigate(`/category/${category._id}`);
    }
  };
  
  const handleGroupHeaderClick = (groupName) => {
    // Find the category by name and navigate to it
    const category = categories.find(cat => cat.name === groupName);
    if (category && category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category && category._id) {
      navigate(`/category/${category._id}`);
    }
  };
  
  const handleChildSubcategoryClick = (subcategoryId, subcategoryName) => {
    // Find the category by ID and navigate to it
    const category = categories.find(cat => cat._id === subcategoryId);
    if (category && category.slug) {
      navigate(`/category/${category.slug}`);
    } else if (category && category._id) {
      navigate(`/category/${category._id}`);
    }
  };

  return {
    hoveredCategory,
    setHoveredCategory,
    sidebarHeight,
    isScrolled,
    sidebarRef,
    floatingMenuRef,
    handleCategoryMouseEnter,
    handleCategoryMouseLeave,
    handleFloatingMenuMouseEnter,
    handleFloatingMenuMouseLeave,
    handleMainCategoryClick,
    handleGroupHeaderClick,
    handleChildSubcategoryClick
  };
}; 