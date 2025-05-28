import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/estimation';

export const costEstimationService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getAllByInquiryId: (id) => axios.get(`${API_BASE_URL}/inquiry/${id}`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (estimationData) => axios.post(`${API_BASE_URL}`, estimationData),
  update: (id, estimationData) => axios.put(`${API_BASE_URL}/${id}`, estimationData),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getCostEstimationActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/CostEstimation/${id}`)
};