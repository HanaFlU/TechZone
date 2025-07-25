import { useCallback } from 'react';

export const useStockValidation = (displayNotification) => {
    const validateStockForAddToCart = useCallback((product, currentQuantity = 0) => {
        const newQuantity = currentQuantity + 1;
        
        if (newQuantity > product.stock) {
            const message = currentQuantity === 0 
                ? `Không thể thêm sản phẩm "${product.name}" do giới hạn tồn kho (${product.stock})`
                : `Không thể thêm sản phẩm "${product.name}". Số lượng trong giỏ hàng (${currentQuantity}) + 1 vượt quá tồn kho (${product.stock})`;
            
            displayNotification(message, 'warning');
            return false;
        }
        return true;
    }, [displayNotification]);

    const validateStockForQuantityUpdate = useCallback((product, newQuantity) => {
        if (newQuantity > product.stock) {
            displayNotification(
                `Không thể cập nhật số lượng. Số lượng yêu cầu (${newQuantity}) vượt quá tồn kho (${product.stock})`, 
                'warning'
            );
            return false;
        }
        return true;
    }, [displayNotification]);

    return {
        validateStockForAddToCart,
        validateStockForQuantityUpdate
    };
}; 