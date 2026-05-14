import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/voters';

// No changes needed to the axios wrapper logic.
export const voterService = {
  getVoters: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching voters:', error);
      throw error;
    }
  },

  getVoterStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voter stats:', error);
      throw error;
    }
  },

  addVoter: async (voterData) => {
    try {
      const response = await axios.post(API_BASE_URL, voterData);
      return response.data;
    } catch (error) {
      console.error('Error adding voter:', error);
      throw error;
    }
  },

  getExportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/export${query ? `?${query}` : ''}`;
  },

  downloadExport: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  },

  deleteVoter: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting voter:', error);
      throw error;
    }
  }
};
