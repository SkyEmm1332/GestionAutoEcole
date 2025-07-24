const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/autoecole', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixDatabase() {
  try {
    console.log('=== CORRECTION DE LA BASE DE DONNÉES ===');
    
    // 1. Compter les cours existants
    const totalCourses = await Course.countDocuments();
    console.log(`Total cours dans la base: ${totalCourses}`);
    
    // 2. Compter les cours sans champ isDeleted
    const coursesWithoutIsDeleted = await Course.countDocuments({ isDeleted: { $exists: false } });
    console.log(`Cours sans champ isDeleted: ${coursesWithoutIsDeleted}`);
    
    // 3. Compter les cours avec isDeleted: true
    const deletedCourses = await Course.countDocuments({ isDeleted: true });
    console.log(`Cours supprimés: ${deletedCourses}`);
    
    // 4. Mettre à jour tous les cours qui n'ont pas le champ isDeleted
    if (coursesWithoutIsDeleted > 0) {
      console.log('Mise à jour des cours existants...');
      const result = await Course.updateMany(
        { isDeleted: { $exists: false } },
        { $set: { isDeleted: false } }
      );
      console.log(`${result.modifiedCount} cours mis à jour avec isDeleted: false`);
    }
    
    // 5. Vérifier le résultat
    const finalTotal = await Course.countDocuments();
    const finalActive = await Course.countDocuments({ isDeleted: false });
    const finalDeleted = await Course.countDocuments({ isDeleted: true });
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log(`Total cours: ${finalTotal}`);
    console.log(`Cours actifs (isDeleted: false): ${finalActive}`);
    console.log(`Cours supprimés (isDeleted: true): ${finalDeleted}`);
    
    // 6. Afficher quelques exemples
    const sampleCourses = await Course.find().limit(3);
    console.log('\nExemples de cours:');
    sampleCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - Type: ${course.type} - isDeleted: ${course.isDeleted}`);
    });
    
  } catch (error) {
    console.error('Erreur lors de la correction:', error);
  } finally {
    mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

fixDatabase(); 