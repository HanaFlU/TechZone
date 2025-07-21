import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/shipping-rate`;

const ShippingService = {
    async getShippingFee(orderValue) {
        const res = await axios.get(`${API_URL}/get-fee`, { params: { orderValue } });
        return res.data.shippingFee;
    }
};

export default ShippingService;