import { useCallback } from 'react';
import CartService from '../services/CartService';

export const useGuestCartTransfer = (currentUserId, displayNotification, setCartData, setSelectedItems) => {
    const transferGuestCartToUser = useCallback(async () => {
        if (!currentUserId) return;
        
        try {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            if (guestCart.length === 0) return;

            console.log('Starting guest cart transfer:', { guestCart, currentUserId });

            // Get current user's cart to check existing quantities
            let currentUserCart = [];
            let userCartData = null;
            try {
                userCartData = await CartService.getCartData(currentUserId);
                currentUserCart = userCartData?.items || [];
                console.log('Current user cart:', currentUserCart);
            } catch (err) {
                console.error('Failed to get user cart:', err);
                currentUserCart = [];
            }

            // Collect stock limit warnings
            const stockWarnings = [];

            // Process each guest cart item with stock limit checking
            for (const guestItem of guestCart) {
                try {
                    console.log('Processing guest item:', guestItem);
                    
                    // Find if user already has this product in cart
                    const existingItem = currentUserCart.find(item => 
                        item.product._id === guestItem.product._id
                    );
                    
                    const existingQuantity = existingItem ? existingItem.quantity : 0;
                    const guestQuantity = guestItem.quantity || 0;
                    const productStock = guestItem.product.stock || 0;
                    
                    console.log('Stock calculation:', {
                        existingQuantity,
                        guestQuantity,
                        productStock,
                        productName: guestItem.product.name
                    });
                    
                    // Calculate how much we can add (respecting stock limit)
                    const maxCanAdd = Math.max(0, productStock - existingQuantity);
                    const actualQuantityToAdd = Math.min(guestQuantity, maxCanAdd);
                    
                    console.log('=== PRODUCT TRANSFER DEBUG ===');
                    console.log('Product:', guestItem.product.name);
                    console.log('Guest quantity:', guestQuantity);
                    console.log('Existing quantity:', existingQuantity);
                    console.log('Product stock:', productStock);
                    console.log('Max can add:', maxCanAdd);
                    console.log('Actual quantity to add:', actualQuantityToAdd);
                    console.log('Will show warning:', actualQuantityToAdd < guestQuantity || actualQuantityToAdd === 0);
                    
                    if (actualQuantityToAdd > 0) {
                        if (existingItem && userCartData?._id) {
                            // Update existing item quantity
                            const newTotalQuantity = existingQuantity + actualQuantityToAdd;
                            console.log('Updating existing item:', { 
                                cartId: userCartData._id, 
                                productId: guestItem.product._id, 
                                newQuantity: newTotalQuantity 
                            });
                            
                            await CartService.updateCartItemQuantity(
                                userCartData._id, 
                                guestItem.product._id, 
                                newTotalQuantity
                            );
                            
                            // Update local cart data
                            existingItem.quantity = newTotalQuantity;
                        } else {
                            // Add new item
                            console.log('Adding new item:', { 
                                userId: currentUserId, 
                                productId: guestItem.product._id, 
                                quantity: actualQuantityToAdd 
                            });
                            
                            await CartService.addToCart(
                                currentUserId, 
                                guestItem.product._id, 
                                actualQuantityToAdd
                            );
                            
                            // Update local cart data
                            currentUserCart.push({
                                product: guestItem.product,
                                quantity: actualQuantityToAdd
                            });
                        }
                    } else {
                        console.log('No items added for this product');
                    }
                    
                    // Collect warning if we couldn't add the full quantity OR couldn't add any
                    if (actualQuantityToAdd < guestQuantity || actualQuantityToAdd === 0) {
                        const message = actualQuantityToAdd === 0 
                            ? `Sản phẩm "${guestItem.product.name}" không thể thêm do giới hạn tồn kho (${productStock})`
                            : `Sản phẩm "${guestItem.product.name}" chỉ có thể thêm ${actualQuantityToAdd}/${guestQuantity} do giới hạn tồn kho (${productStock})`;
                        console.log('Adding warning message:', message);
                        stockWarnings.push(message);
                    } else {
                        console.log('No warning needed for this product');
                    }
                    console.log('=== END PRODUCT DEBUG ===');
                    
                } catch (err) {
                    console.error('Failed to add item to user cart:', err);
                }
            }

            // Clear guest cart after successful transfer
            localStorage.removeItem('guestCart');
            console.log('Guest cart cleared from localStorage');
            
            // Refresh cart data (if setCartData is provided)
            if (setCartData) {
                console.log('Refreshing cart data...');
                const data = await CartService.getCartData(currentUserId);
                console.log('Refreshed cart data:', data);
                setCartData(data);
                
                // Initialize selectedItems (if setSelectedItems is provided)
                if (setSelectedItems) {
                    const initialSelected = {};
                    if (data && data.items) {
                        data.items.forEach(item => {
                            initialSelected[item.product._id] = true;
                        });
                    }
                    setSelectedItems(initialSelected);
                }
            }
            
            // Show success message and all warnings at the same time
            displayNotification('Đã chuyển sản phẩm từ giỏ hàng tạm thời vào tài khoản!', 'success');
            
            console.log('=== FINAL WARNINGS DEBUG ===');
            console.log('Total warnings collected:', stockWarnings.length);
            console.log('Warning messages:', stockWarnings);
            
            // Show all stock limit warnings immediately
            stockWarnings.forEach((warning) => {
                console.log('Showing warning:', warning);
                displayNotification(warning, 'warning');
            });
            
            console.log('=== END FINAL DEBUG ===');
            
            window.dispatchEvent(new Event('cartUpdated'));
            console.log('Guest cart transfer completed successfully');
        } catch (err) {
            console.error('Failed to transfer guest cart:', err);
            displayNotification('Không thể chuyển sản phẩm vào tài khoản!', 'error');
        }
    }, [currentUserId, displayNotification, setCartData, setSelectedItems]);

    return { transferGuestCartToUser };
}; 