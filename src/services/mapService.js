// src/services/mapService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8081/api/locations';

export const mapService = {
  fetchDistricts: async () => {
    const res = await axios.get(`${API_BASE}/districts`);
    return res.data.map(d => ({
      ...d,
      lng: 77.1025 + (Math.random() - 0.5) * 0.4,
      lat: 28.7041 + (Math.random() - 0.5) * 0.4
    }));
  },

  fetchAcs: async (district) => {
    const res = await axios.get(`${API_BASE}/districts/${district.districtId}/acs`);
    return res.data.map(ac => ({
      ...ac,
      lng: district.lng + (Math.random() - 0.5) * 0.1,
      lat: district.lat + (Math.random() - 0.5) * 0.1
    }));
  },

  fetchBooths: async (ac, districtId) => {
    const res = await axios.get(`${API_BASE}/acs/${ac.acNumber}/booths?districtId=${districtId}`);
    return res.data.map(b => ({
      ...b,
      lng: ac.lng + (Math.random() - 0.5) * 0.05,
      lat: ac.lat + (Math.random() - 0.5) * 0.05
    }));
  },

  fetchSections: async (partId) => {
    const res = await axios.get(`${API_BASE}/booths/${partId}/sections`);
    return res.data;
  }
};
