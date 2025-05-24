
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/material';

export const materialService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getAllParentCategories: () => axios.get(`${API_BASE_URL}/parentCategoryDropDown`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (material) => axios.post(`${API_BASE_URL}`, material),
  update: (id, material) => axios.put(`${API_BASE_URL}/${id}`, material),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getMaterialActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Material/${id}`)
};