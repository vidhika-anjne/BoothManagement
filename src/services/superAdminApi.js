import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/superadmin';

export const superAdminApi = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard`);
    return response.data;
  },

  // ── Booths / Sections / Voters / Schemes ──────────────────────────────────
  getBooths: async () => {
    const response = await axios.get(`${API_BASE_URL}/booths`);
    return response.data;
  },

  getSections: async (partId = null) => {
    const response = await axios.get(`${API_BASE_URL}/sections`, { params: { partId } });
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

  // ── Segmentation (hierarchical) ───────────────────────────────────────────
  /**
   * Fetches segmentation data.
   * All params optional:
   *   - no params   → All Delhi
   *   - ac = "Delhi Cantt" → real data
   *   - otherwise   → deterministic mock
   */
  getHierarchicalSegmentation: async (district, ac, partNumber) => {
    const params = {};
    if (district)   params.district   = district;
    if (ac)         params.ac         = ac;
    if (partNumber != null) params.partNumber = partNumber;
    const response = await axios.get(`${API_BASE_URL}/dashboard/segmentation`, { params });
    return response.data;
  },

  // ── Hierarchy dropdowns ───────────────────────────────────────────────────
  getDistricts: async () => {
    const response = await axios.get(`${API_BASE_URL}/segments/districts`);
    return response.data; // string[]
  },

  getAcs: async (district) => {
    const response = await axios.get(`${API_BASE_URL}/segments/acs`, { params: { district } });
    return response.data; // string[]
  },

  getParts: async (ac) => {
    const response = await axios.get(`${API_BASE_URL}/segments/parts`, { params: { ac } });
    return response.data; // { partNumber, partName }[]
  },

  // ── Legacy (kept for backward compat) ────────────────────────────────────
  getSegmentationData: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.ageGroup)   queryParams.append('ageGroup', params.ageGroup);
    if (params.gender)     queryParams.append('gender', params.gender);
    if (params.occupation) queryParams.append('occupation', params.occupation);
    if (params.view)       queryParams.append('view', params.view);
    const response = await axios.get(`${API_BASE_URL}/segmentation?${queryParams.toString()}`);
    return response.data;
  },

  getDashboardSegmentation: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.view)       queryParams.append('view', params.view);
    if (params.partNumber) queryParams.append('partNumber', params.partNumber);
    if (params.acName)     queryParams.append('acName', params.acName);
    const response = await axios.get(`${API_BASE_URL}/dashboard/segmentation?${queryParams.toString()}`);
    return response.data;
  },

  getVoterStats: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/voter-stats`, { params: filters });
    return response.data;
  },
};
