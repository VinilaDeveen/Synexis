
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/synexis/category';

export const categoryService = {
  getAll: () => axios.get(`${API_BASE_URL}`),
  getAllParentCategories: () => axios.get(`${API_BASE_URL}/parentCategoryDropDown`),
  getParentCategoryDropDown: (searchterm) => axios.get(`${API_BASE_URL}/parentCategoryDropDown?searchParentCategory=${searchterm}`),
  getSubCategoryDropDown: (id, searchterm) => axios.get(`${API_BASE_URL}/subCategoryDropDown/${id}?searchSubCategory=${searchterm}`),
  getAllSubCategories: (id) => axios.get(`${API_BASE_URL}/subDropDown/${id}`),
  getSideDrop: () => axios.get(`${API_BASE_URL}/sideDrop`),
  getById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  create: (category) => axios.post(`${API_BASE_URL}`, category),
  update: (id, category) => axios.put(`${API_BASE_URL}/${id}`, category),
  delete: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getCategoryActivityLogs: (id) => axios.get(`http://localhost:8080/api/synexis/activityLog/Category/${id}`)
};