import { useState, useEffect } from 'react';

const useAuthUser = () => {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user._id) {
                    setCurrentUserId(user._id);
                } else {
                    console.error("useAuthUser Error: User ID not found in localStorage.");
                    setAuthError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
                }
            } catch (e) {
                console.error("useAuthUser Error: Failed to parse user from localStorage", e);
                setAuthError("Lỗi khi đọc thông tin người dùng. Vui lòng thử lại.");
            }
        } else {
            // Không có user trong localStorage, có thể chuyển hướng về trang đăng nhập hoặc hiển thị thông báo
            console.warn("useAuthUser Warning: No user found in localStorage.");
            setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.");
        }
        setIsAuthLoading(false);
    }, []);

    return { currentUserId, authError, isAuthLoading };
};

export default useAuthUser;