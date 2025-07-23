import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/shipping-rate`;

const ShippingService = {
    // async getShippingFee(orderValue) {
    //     const res = await axios.get(`${API_URL}/get-fee`, { params: { orderValue } });

    //     return res.data.shippingFee;
    // }
    async getShippingFee(orderValue, token) {
        // Kiểm tra xem token có tồn tại không
        if (!token) {
            console.error("Authentication token is missing for shipping fee request.");
            throw new Error("Authentication token is required.");
        }

        try {
            const res = await axios.get(`${API_URL}/get-fee`, {
                params: { orderValue },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.data.shippingFee;
        } catch (error) {
            if (error.response) {
                // Server trả về lỗi (e.g., 401, 403, 404, 500)
                console.error("Lỗi phản hồi từ API phí ship:", error.response.status, error.response.data);
                if (error.response.status === 401) {
                    throw new Error(error.response.data.message || `Lỗi ${error.response.status} khi lấy phí ship.`);
                } else if (error.request) {
                    console.error("Không nhận được phản hồi từ server khi lấy phí ship:", error.request);
                    throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
                } else {
                    console.error("Lỗi khi thiết lập yêu cầu phí ship:", error.message);
                    throw new Error("Lỗi không xác định khi yêu cầu phí ship.");
                }
            }
        }
    }
};

export default ShippingService;