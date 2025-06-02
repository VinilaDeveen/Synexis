import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/inquiry';

export const inquiryService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (inquiry) => axios.post(`${API_BASE_URL}`, inquiry),
  update: (id, inquiry) => axios.put(`${API_BASE_URL}/${id}`, inquiry),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getInquiryActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Inquiry/${id}`)
};