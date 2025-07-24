// Script de débogage pour tester la création de cours
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCourseCreation() {
  console.log('=== TEST DE CRÉATION DE COURS ===');
  
  // Test 1: Vérifier la connectivité
  try {
    console.log('1. Test de connectivité...');
    const healthCheck = await axios.get(`${API_BASE_URL}/courses`);
    console.log('✅ Serveur accessible');
    console.log('Status:', healthCheck.status);
  } catch (error) {
    console.error('❌ Serveur inaccessible');
    console.error('Error:', error.message);
    return;
  }
  
  // Test 2: Données de test minimales
  const testCourseData = {
    title: 'Test Cours Debug',
    type: 'pratique',
    instructor: '507f1f77bcf86cd799439011', // ID d'instructeur de test
    date: new Date().toISOString(),
    description: 'Cours de test pour débogage',
    location: 'Salle de test',
    enrolledStudents: []
  };
  
  console.log('\n2. Données de test:');
  console.log(JSON.stringify(testCourseData, null, 2));
  
  // Test 3: Création de cours
  try {
    console.log('\n3. Tentative de création...');
    const response = await axios.post(`${API_BASE_URL}/courses`, testCourseData);
    console.log('✅ Cours créé avec succès');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Erreur lors de la création');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Details:', error.response?.data);
  }
  
  // Test 4: Validation des champs obligatoires
  console.log('\n4. Test de validation des champs...');
  const requiredFields = ['title', 'type', 'instructor', 'date'];
  
  for (const field of requiredFields) {
    const invalidData = { ...testCourseData };
    delete invalidData[field];
    
    try {
      await axios.post(`${API_BASE_URL}/courses`, invalidData);
      console.log(`❌ Validation échouée pour ${field}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ Validation correcte pour ${field}`);
      } else {
        console.log(`❌ Erreur inattendue pour ${field}:`, error.response?.data);
      }
    }
  }
}

// Exécuter le test
testCourseCreation().catch(console.error); 