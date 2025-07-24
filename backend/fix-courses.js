const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect('mongodb://localhost:27017/autoecole', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixCourses() {
  try {
    console.log('Mise à jour des cours existants...');
    
    const result = await Course.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );
    
    console.log(`${result.modifiedCount} cours mis à jour`);
    
    const totalCourses = await Course.countDocuments();
    const deletedCourses = await Course.countDocuments({ isDeleted: true });
    
    console.log(`Total cours: ${totalCourses}`);
    console.log(`Cours supprimés: ${deletedCourses}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixCourses(); 