import api from './api';

export const courseService = {
  // Récupérer tous les cours avec pagination et filtres
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Récupérer les cours supprimés
  getDeletedCourses: async (params = {}) => {
    try {
      console.log('=== DÉBOGAGE SERVICE - getDeletedCourses ===');
      console.log('URL appelée:', '/courses/deleted');
      console.log('Paramètres:', params);
      
      const response = await api.get('/courses/deleted', { params });
      
      console.log('Réponse reçue:', response);
      console.log('Données de la réponse:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== ERREUR SERVICE getDeletedCourses ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response);
      throw error;
    }
  },

  // Récupérer un cours par ID
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Créer un nouveau cours
  createCourse: async (courseData) => {
    try {
      console.log('=== DÉBOGAGE SERVICE - ENVOI DE DONNÉES ===');
      console.log('API URL:', api.defaults.baseURL);
      console.log('Course data to send:', courseData);
      
      const response = await api.post('/courses', courseData);
      console.log('=== DÉBOGAGE SERVICE - RÉPONSE RÉUSSIE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== DÉBOGAGE SERVICE - ERREUR ===');
      console.error('Error in createCourse:', error);
      console.error('Error config:', error.config);
      console.error('Error response:', error.response);
      
      // Vérifier si c'est un problème de connexion
      if (!error.response) {
        console.error('Pas de réponse du serveur - problème de connexion');
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      
      throw error;
    }
  },

  // Mettre à jour un cours
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Supprimer un cours (marquer comme supprimé)
  deleteCourse: async (id) => {
    try {
      console.log('=== DÉBOGAGE SERVICE - deleteCourse ===');
      console.log('ID du cours à supprimer:', id);
      console.log('URL appelée:', `/courses/${id}`);
      
      const response = await api.delete(`/courses/${id}`);
      
      console.log('Réponse de suppression:', response);
      console.log('Données de la réponse:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== ERREUR SERVICE deleteCourse ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response);
      throw error;
    }
  },

  // Récupérer un cours supprimé
  restoreCourse: async (id) => {
    try {
      console.log('=== DÉBOGAGE SERVICE - restoreCourse ===');
      console.log('ID du cours à restaurer:', id);
      console.log('URL appelée:', `/courses/${id}/restore`);
      
      const response = await api.put(`/courses/${id}/restore`);
      
      console.log('Réponse de restauration:', response);
      console.log('Données de la réponse:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== ERREUR SERVICE restoreCourse ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response);
      throw error;
    }
  },

  // Supprimer définitivement un cours
  permanentlyDeleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}/permanent`);
    return response.data;
  },

  // Inscrire un candidat à un cours
  enrollCandidate: async (courseId, candidateId) => {
    const response = await api.post(`/courses/${courseId}/enroll-candidate`, {
      candidateId
    });
    return response.data;
  },

  // Marquer la présence d'un candidat
  markAttendance: async (courseId, candidateId, attendanceData) => {
    const response = await api.put(`/courses/${courseId}/attendance`, {
      candidateId,
      ...attendanceData
    });
    return response.data;
  },

  // Récupérer les cours à venir
  getUpcomingCourses: async () => {
    const response = await api.get('/courses/upcoming/list');
    return response.data;
  },

  // Récupérer les cours par instructeur
  getCoursesByInstructor: async (instructorId) => {
    const response = await api.get(`/courses/instructor/${instructorId}`);
    return response.data;
  },

  // Filtrer les cours par type
  getCoursesByType: async (type) => {
    const response = await api.get('/courses', {
      params: { type }
    });
    return response.data;
  },

  // Filtrer les cours par statut
  getCoursesByStatus: async (status) => {
    const response = await api.get('/courses', {
      params: { status }
    });
    return response.data;
  }
}; 