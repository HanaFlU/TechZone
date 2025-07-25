import createApiClient from "../utils/api";


class RoleService {
    constructor(apiURL = `${import.meta.env.VITE_API_URL}/roles`) {
        this.api = createApiClient(apiURL);
    }

    async getAllRoles() {
        try {
            const response = await this.api.get("/");
            return response.data;
        } catch (error) {
            console.error('RoleService Error: Failed to fetch roles:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getAllStaffRoles() {
        try {
            const response = await this.api.get("/staff");
            return response.data;
        } catch (error) {
            console.error('RoleService Error: Failed to fetch staff roles:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    // async getRoleById(roleId) {
    //     try {
    //         const response = await this.api.get(`/${roleId}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('RoleService Error: Failed to fetch role by ID:', error.response ? error.response.data : error.message);
    //         throw error;
    //     }
    // }
};

export default new RoleService();