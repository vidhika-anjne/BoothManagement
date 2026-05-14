import axios from 'axios';

const BASE = 'http://localhost:8081';

const api = axios.create({ baseURL: BASE, timeout: 10000 });

export const dashboardService = {
  getStats:           () => api.get('/api/dashboard/stats').then(r => r.data),
  getVoterSegments:   (filter) => api.get('/api/voters/segments', { params: { filter } }).then(r => r.data),
  getBoothParts:      () => api.get('/api/dashboard/booth-parts').then(r => r.data),
  getBoothPerformance:() => api.get('/api/booths/performance').then(r => r.data),
  getIssueDistribution:  (detailed = false) => api.get(`/api/issues/distribution${detailed ? '?detailed=true' : ''}`).then(r => r.data),
  submitFeedback:     (author, message, boothId) =>
    api.post('/api/feedback', { author, message, boothId }).then(r => r.data),
  getFeedback:        () => api.get('/api/feedback').then(r => r.data),
  deleteFeedback:     (id) => api.delete(`/api/feedback/${id}`).then(r => r.data),
  async login(email, password, boothId) {
    const res = await api.post('/api/auth/login', { email, password, boothId })
    return res.data
  },

  async getUserProfile() {
    const res = await api.get('/api/user/profile')
    return res.data
  },
};

export default dashboardService;
