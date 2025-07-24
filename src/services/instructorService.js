import api from './api';

export const instructorService = {
  // Récupérer tous les instructeurs avec pagination et filtres
  getInstructors: async (params = {}) => {
    const response = await api.get('/instructors', { params });
    return response.data;
  },

  // Récupérer un instructeur par ID
  getInstructor: async (id) => {
    const response = await api.get(`/instructors/${id}`);
    return response.data;
  },

  // Créer un nouvel instructeur
  createInstructor: async (instructorData) => {
    const response = await api.post('/instructors', instructorData);
    return response.data;
  },

  // Mettre à jour un instructeur
  updateInstructor: async (id, instructorData) => {
    const response = await api.put(`/instructors/${id}`, instructorData);
    return response.data;
  },

  // Supprimer un instructeur
  deleteInstructor: async (id) => {
    const response = await api.delete(`/instructors/${id}`);
    return response.data;
  },

  // Récupérer les statistiques des instructeurs
  getInstructorStats: async () => {
    const response = await api.get('/instructors/stats/overview');
    return response.data;
  },

  // Rechercher des instructeurs
  searchInstructors: async (searchTerm) => {
    const response = await api.get('/instructors', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Filtrer les instructeurs par statut
  getInstructorsByStatus: async (status) => {
    const response = await api.get('/instructors', {
      params: { status }
    });
    return response.data;
  }
}; 