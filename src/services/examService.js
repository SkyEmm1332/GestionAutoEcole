import api from './api';

export const examService = {
  // Récupérer tous les examens avec pagination et filtres
  getExams: async (params = {}) => {
    try {
      const response = await api.get('/exams', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Erreur API /exams:', error.response.data);
      } else {
        console.error('Erreur réseau ou inconnue /exams:', error);
      }
      throw error;
    }
  },

  // Récupérer un examen par ID
  getExam: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Créer un nouvel examen
  createExam: async (examData) => {
    try {
      const response = await api.post('/exams', examData);
      return response.data;
    } catch (error) {
      console.error('Erreur création examen:', error);
      throw error;
    }
  },

  // Mettre à jour un examen
  updateExam: async (id, examData) => {
    try {
      const response = await api.put(`/exams/${id}`, examData);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour examen:', error);
      throw error;
    }
  },

  // Supprimer un examen
  deleteExam: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  // Inscrire un candidat à un examen
  registerCandidate: async (examId, candidateId) => {
    const response = await api.post(`/exams/${examId}/register-candidate`, {
      candidateId
    });
    return response.data;
  },

  // Mettre à jour le résultat d'un candidat
  updateCandidateResult: async (examId, candidateId, resultData) => {
    const response = await api.put(`/exams/${examId}/candidate-result`, {
      candidateId,
      ...resultData
    });
    return response.data;
  },

  // Récupérer les examens à venir
  getUpcomingExams: async () => {
    const response = await api.get('/exams/upcoming/list');
    return response.data;
  },

  // Filtrer les examens par type
  getExamsByType: async (type) => {
    const response = await api.get('/exams', {
      params: { type }
    });
    return response.data;
  },

  // Filtrer les examens par statut
  getExamsByStatus: async (status) => {
    const response = await api.get('/exams', {
      params: { status }
    });
    return response.data;
  },

  // Filtrer les examens par date
  getExamsByDate: async (date) => {
    const response = await api.get('/exams', {
      params: { date }
    });
    return response.data;
  }
}; 