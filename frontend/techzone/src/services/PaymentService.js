import createApiClient from "../utils/api";

class PaymentService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/payments`) {
        this.api = createApiClient(apiURL);
    }
    async createStripePaymentIntent(payload) {
        try {
            const response = await this.api.post(`/stripe/create-intent`, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating Stripe PaymentIntent:', error.response?.data || error.message);
            throw error;
        }
    }
}
export default new PaymentService();
