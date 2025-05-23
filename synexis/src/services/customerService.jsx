import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/customer';

export const customerService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (employee) => axios.post(`${API_BASE_URL}`, employee),
  update: (id, employee) => axios.put(`${API_BASE_URL}/${id}`, employee),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getEmployeeActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Customer/${id}`)
};