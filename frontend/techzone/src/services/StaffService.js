import createApiClient from "../utils/api";

class StaffService {

    constructor(apiURL = `${import.meta.env.VITE_API_URL}/staffs`) {
        this.api = createApiClient(apiURL);
    }
    async getAllStaffs() {
        try {
            const response = await this.api.get(`/`);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to fetch all staffs:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async addStaff(staffData) {
        try {
            console.log('StaffService: Adding new staff with data:', staffData);
            const response = await this.api.post('/', staffData);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to add staff:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async updateStaff(staffId, staffData) {
        try {
            const response = await this.api.put(`/${staffId}`, staffData);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to update staff:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async deleteStaff(staffId) {
        try {
            const response = await this.api.delete(`/${staffId}`);
            return response.data;
        } catch (error) {
            console.error('StaffService Error: Failed to delete staff:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

export default new StaffService();