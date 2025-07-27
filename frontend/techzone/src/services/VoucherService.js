import createApiClient from "../utils/api";

class VoucherService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/vouchers`) {
        this.api = createApiClient(apiURL);
    }

    async applyVoucher(code, totalAmount, customerId) {
        try {
            const response = await this.api.post('/apply', {
                code,
                totalAmount,
                customerId,
            });
            return response.data;
        } catch (error) {
            console.error('VoucherService Error: Failed to apply voucher:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getAllVouchers(filters) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            console.log('VoucherService: Attempting to GET all vouchers with filters:', queryParams);
            const response = await this.api.get(`/?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('VoucherService Error: Failed to get all Vouchers:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async createVoucher(voucherData) {
        try {
            console.log('VoucherService: Attempting to POST to URL:', `${this.api.defaults.baseURL}`, 'with data:', voucherData);
            const response = await this.api.post('/', voucherData);
            return response.data;
        } catch (error) {
            console.error('VoucherService Error: Failed to create Voucher:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data) {
                console.error('VoucherService Error: Backend response data:', error.response.data);
            }
            throw error;
        }
    }

    async getVoucherById(voucherId) {
        try {
            const response = await this.api.get(`/${voucherId}`);
            return response.data;
        } catch (error) {
            console.error('VoucherService Error: Failed to get voucher by id:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateVoucher(voucherId, voucherData) {
        try {
            console.log(`VoucherService: Attempting to PUT voucher ${voucherId} with data:`, voucherData);
            const response = await this.api.put(`/${voucherId}`, voucherData);
            return response.data;
        } catch (error) {
            console.error(`VoucherService Error: Failed to update voucher ${voucherId}:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async deleteVoucher(voucherId) {
        try {
            console.log('VoucherService: Attempting to DELETE voucher with ID:', voucherId);
            const response = await this.api.delete(`/${voucherId}`);
            return response.data;
        } catch (error) {
            console.error('VoucherService Error: Failed to delete voucher with ID:', voucherId, error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new VoucherService();