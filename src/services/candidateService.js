import api from './api';

export const candidateService = {
  // Récupérer tous les candidats avec pagination et filtres
  getCandidates: async (params = {}) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  // Récupérer un candidat par ID
  getCandidate: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  // Créer un nouveau candidat
  createCandidate: async (candidateData) => {
    const response = await api.post('/candidates', candidateData);
    return response.data;
  },

  // Mettre à jour un candidat
  updateCandidate: async (id, candidateData) => {
    const response = await api.put(`/candidates/${id}`, candidateData);
    return response.data;
  },

  // Supprimer un candidat
  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  // Récupérer les statistiques des candidats
  getCandidateStats: async () => {
    const response = await api.get('/candidates/stats/overview');
    return response.data;
  },

  // Rechercher des candidats
  searchCandidates: async (searchTerm) => {
    const response = await api.get('/candidates', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Filtrer les candidats par statut
  getCandidatesByStatus: async (status) => {
    const response = await api.get('/candidates', {
      params: { status }
    });
    return response.data;
  },

  // Récupérer toutes les catégories distinctes
  getCategories: async () => {
    const response = await api.get('/candidates/categories');
    return response.data;
  }
}; 