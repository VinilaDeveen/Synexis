
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/category';

export const categoryService = {
  getAll: () => axios.get(`${API_BASE_URL}/table`),
  getAllDetails: () => axios.get(`${API_BASE_URL}`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (category) => axios.post(`${API_BASE_URL}`, category),
  update: (id, category) => axios.put(`${API_BASE_URL}/${id}`, category),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
};