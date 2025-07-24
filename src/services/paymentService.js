import api from './api';

export const paymentService = {
  // Récupérer tous les paiements
  getPayments: async () => {
    const response = await api.get('/payments');
    if (Array.isArray(response.data)) {
      return { payments: response.data };
    }
    return response.data;
  },

  // Récupérer les paiements d'un candidat
  getPaymentsByCandidate: async (candidateId) => {
    const response = await api.get(`/payments/candidate/${candidateId}`);
    return response.data;
  },

  // Ajouter un paiement
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Modifier un paiement
  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  // Supprimer un paiement
  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
}; 