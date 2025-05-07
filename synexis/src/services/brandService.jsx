import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/brand';

export const brandService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getBrandIcon: (id) => axios.get(`${API_BASE_URL}/image/${id}`),
  getBrandList : () => axios.get(`${API_BASE_URL}/sideDrop`),
  //getAllDetails: () => axios.get(`${API_BASE_URL}`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (brand) => axios.post(`${API_BASE_URL}`, brand),
  update: (id, brand) => axios.put(`${API_BASE_URL}/${id}`, brand),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
};