import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CartService from '../services/CartService';
import useNotification from './useNotification';
import useAuthUser from './useAuthUser';
import { useStockValidation } from './useStockValidation';

const useAddToCart = (displayNotificationFromParent = null) => {
  const { setShowLoginModal } = useContext(AuthContext);
  const { displayNotification: localDisplayNotification } = useNotification();
  const { currentUserId } = useAuthUser();
  
  // Use parent's displayNotification if provided, otherwise use local one
  const displayNotification = displayNotificationFromParent || localDisplayNotification;
  const { validateStockForAddToCart } = useStockValidation(displayNotification);

  const addToCart = async (product, quantity = 1) => {
    console.log('addToCart called with product:', product);
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

        // Use the existing stock validation hook
        if (!validateStockForAddToCart(product, currentQuantity)) {
          return false;
        }

        await CartService.addToCart(currentUserId, product._id, quantity);
        // Dispatch event to update navbar cart
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      } catch (err) {
        if (err.response?.data?.message) {
          displayNotification(err.response.data.message, 'error');
        } else {
          displayNotification('Thêm vào giỏ hàng thất bại!', 'error');
        }
        return false;
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

      // Use the existing stock validation hook
      if (!validateStockForAddToCart(product, currentQuantity)) {
        return false;
      }

      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ productId: product._id, quantity: quantity, product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      // Dispatch event to update navbar cart
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    }
  };

  const addToCartAndBuyNow = async (product, quantity = 1) => {
    if (quantity < 1) {
      displayNotification('Số lượng phải lớn hơn 0', 'error');
      return false;
    }

    if (!currentUserId) {
      // Guest user: show login modal
      setShowLoginModal(true);
      return false;
    }

    // Logged-in user: validate stock and create order data directly
    try {
      // Validate stock for the selected quantity
      if (quantity > product.stock) {
        displayNotification(`Không đủ số lượng sản phẩm "${product.name}". Chỉ còn ${product.stock} sản phẩm trong kho.`, 'warning');
        return false;
      }

      // Get customer ID from cart data (needed for order page)
      let customerId = null;
      try {
        const cartData = await CartService.getCartData(currentUserId);
        customerId = cartData?.customer;
      } catch (err) {
        console.error('Failed to get customer ID:', err);
        displayNotification('Không thể lấy thông tin khách hàng', 'error');
        return false;
      }

      if (!customerId) {
        displayNotification('Không tìm thấy thông tin khách hàng', 'error');
        return false;
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

      return checkoutData;
    } catch (err) {
      if (err.response?.data?.message) {
        displayNotification(err.response.data.message, 'error');
      } else {
        displayNotification('Không thể tạo đơn hàng', 'error');
      }
      console.error('Error creating order:', err);
      return false;
    }
  };

  return {
    addToCart,
    addToCartAndBuyNow,
    currentUserId
  };
};

export default useAddToCart;