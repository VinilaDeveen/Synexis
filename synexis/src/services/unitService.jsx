
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/unit';

export const unitService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getAllBaseUnits : () => axios.get(`${API_BASE_URL}/baseUnitDropDown`),
  getAllOtherUnits : (id) => axios.get(`${API_BASE_URL}/otherUnitDropDown/${id}`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (unit) => axios.post(`${API_BASE_URL}`, unit),
  update: (id, unit) => axios.put(`${API_BASE_URL}/${id}`, unit),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getUnitActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Unit/${id}`)
};