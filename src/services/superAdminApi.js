import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/superadmin';

export const superAdminApi = {
  getDashboardStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard`);
    return response.data;
  },
  
  getBooths: async () => {
    const response = await axios.get(`${API_BASE_URL}/booths`);
    return response.data;
  },
  
  getSections: async (boothId = null) => {
    const response = await axios.get(`${API_BASE_URL}/sections`, { params: { boothId } });
    return response.data;
  },
  
  getVoters: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/voters`, { params: filters });
    return response.data;
  },
  
  getSchemes: async () => {
    const response = await axios.get(`${API_BASE_URL}/schemes`);
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics`);
    return response.data;
  },
  
  getSegmentationData: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.ageGroup) queryParams.append('ageGroup', params.ageGroup);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.occupation) queryParams.append('occupation', params.occupation);
    if (params.view) queryParams.append('view', params.view);
    
    const response = await axios.get(`${API_BASE_URL}/segmentation?${queryParams.toString()}`);
    return response.data;
  },

  getDashboardSegmentation: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.view) queryParams.append('view', params.view);
    if (params.partNumber) queryParams.append('partNumber', params.partNumber);
    if (params.acName) queryParams.append('acName', params.acName);
    const response = await axios.get(`${API_BASE_URL}/dashboard/segmentation?${queryParams.toString()}`);
    return response.data;
  }
};
