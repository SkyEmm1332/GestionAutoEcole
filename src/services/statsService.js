import api from './api';

export const statsService = {
  getDashboardStats: async (period = 'month', startDate, endDate, subPeriod) => {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (subPeriod) params.subPeriod = subPeriod;
    const response = await api.get('/stats/dashboard', { params });
    return response.data;
  },
}; 