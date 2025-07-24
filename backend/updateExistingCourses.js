const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/autoecole', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateExistingCourses = async () => {
  try {
    console.log('=== MISE À JOUR DES COURS EXISTANTS ===');
    
    // Récupérer tous les cours qui n'ont pas le champ isDeleted
    const coursesWithoutIsDeleted = await Course.find({ isDeleted: { $exists: false } });
    console.log(`Cours trouvés sans champ isDeleted: ${coursesWithoutIsDeleted.length}`);
    
    if (coursesWithoutIsDeleted.length > 0) {
      // Mettre à jour tous ces cours pour ajouter isDeleted: false
      const result = await Course.updateMany(
        { isDeleted: { $exists: false } },
        { $set: { isDeleted: false } }
      );
      
      console.log('Résultat de la mise à jour:', result);
      console.log(`${result.modifiedCount} cours mis à jour`);
    } else {
      console.log('Tous les cours ont déjà le champ isDeleted');
    }
    
    // Vérifier le nombre total de cours
    const totalCourses = await Course.countDocuments();
    console.log(`Nombre total de cours: ${totalCourses}`);
    
    // Vérifier le nombre de cours supprimés
    const deletedCourses = await Course.countDocuments({ isDeleted: true });
    console.log(`Nombre de cours supprimés: ${deletedCourses}`);
    
    // Afficher quelques exemples de cours
    const sampleCourses = await Course.find().limit(5);
    console.log('Exemples de cours:', sampleCourses.map(c => ({
      id: c._id,
      title: c.title,
      type: c.type,
      isDeleted: c.isDeleted
    })));
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateExistingCourses(); 