import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/activityLog';

export const recentActivityService = {
    getAllCategoryActivity : () => axios.get(`${API_BASE_URL}/Category`),
    getAllBrandActivity : () => axios.get(`${API_BASE_URL}/Brand`),
    getAllMaterialActivity : () => axios.get(`${API_BASE_URL}/Material`),
    getAllUnitActivity : () => axios.get(`${API_BASE_URL}/Unit`),
    getAllEmployeeActivity : () => axios.get(`${API_BASE_URL}/Employee`),
    getAllCustomerActivity : () => axios.get(`${API_BASE_URL}/Customer`),
    getAllInquiryActivity : () => axios.get(`${API_BASE_URL}/Inquiry`),
}