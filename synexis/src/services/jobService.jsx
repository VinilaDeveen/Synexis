import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/job';

export const jobService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (job) => axios.post(`${API_BASE_URL}`, job),
  update: (id, job) => axios.put(`${API_BASE_URL}/${id}`, job),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getJobActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Job/${id}`)
};