# Guide de Dépannage - Restauration des Cours

## Problème
La fonctionnalité de restauration des cours depuis l'onglet "Séance supprimée" ne fonctionne pas correctement.

## Solutions

### 1. Vérification des Logs

#### Frontend (Console du navigateur)
Ouvrez la console du navigateur (F12) et vérifiez les logs :
```
=== RÉCUPÉRATION DE COURS ===
Cours à récupérer: {object}
=== DÉBOGAGE SERVICE - restoreCourse ===
ID du cours à restaurer: [ID]
URL appelée: /courses/[ID]/restore
```

#### Backend (Terminal du serveur)
Vérifiez les logs du serveur backend :
```
=== DÉBOGAGE BACKEND - RESTAURATION DE COURS ===
ID du cours à restaurer: [ID]
Cours après restauration: {object}
Cours restauré avec succès
```

### 2. Test de l'API

Exécutez le script de test pour vérifier l'API :
```bash
node test_restore.js
```

### 3. Vérifications Manuelles

#### A. Vérifier la Base de Données
```javascript
// Dans MongoDB Compass ou via mongo shell
// Vérifier les cours supprimés
db.courses.find({ isDeleted: true })

// Vérifier les cours actifs
db.courses.find({ isDeleted: { $ne: true } })

// Restaurer manuellement un cours
db.courses.updateOne(
  { _id: ObjectId("ID_DU_COURS") },
  { $set: { isDeleted: false } }
)
```

#### B. Tester l'API Directement
```bash
# Récupérer les cours supprimés
curl http://localhost:5000/api/courses/deleted

# Restaurer un cours
curl -X PUT http://localhost:5000/api/courses/[ID]/restore

# Vérifier les cours actifs
curl http://localhost:5000/api/courses
```

### 4. Problèmes Courants

#### A. Cours non trouvé (404)
- Vérifier que l'ID du cours existe dans la base
- Vérifier que le cours est bien marqué comme supprimé

#### B. Erreur 500
- Vérifier la connexion à MongoDB
- Vérifier les logs du serveur backend
- Redémarrer le serveur backend

#### C. Cours ne réapparaît pas dans la liste
- Vérifier que `fetchCourses()` et `fetchDeletedCourses()` sont appelés
- Vérifier les filtres dans le frontend
- Vérifier que le cours a bien `isDeleted: false` dans la base

### 5. Correction du Code

Si le problème persiste, vérifiez que :

1. **Le service frontend** appelle correctement l'API :
```javascript
restoreCourse: async (id) => {
  const response = await api.put(`/courses/${id}/restore`);
  return response.data;
}
```

2. **La route backend** fonctionne correctement :
```javascript
router.put('/:id/restore', async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );
  res.json({ message: 'Cours récupéré avec succès', course });
});
```

3. **Le composant frontend** rafraîchit les listes :
```javascript
const handleRestoreCourse = async (course) => {
  await courseService.restoreCourse(course._id);
  await fetchCourses();
  await fetchDeletedCourses();
};
```

### 6. Debugging Avancé

#### A. Ajouter des logs temporaires
```javascript
// Dans handleRestoreCourse
console.log('Cours avant restauration:', course);
console.log('Liste des cours avant:', courses);
console.log('Liste des supprimés avant:', deletedCourses);

// Après restauration
console.log('Liste des cours après:', courses);
console.log('Liste des supprimés après:', deletedCourses);
```

#### B. Vérifier les états React
```javascript
// Ajouter un useEffect pour surveiller les changements
useEffect(() => {
  console.log('Cours mis à jour:', courses);
}, [courses]);

useEffect(() => {
  console.log('Cours supprimés mis à jour:', deletedCourses);
}, [deletedCourses]);
```

### 7. Solution de Contournement

Si le problème persiste, vous pouvez temporairement :

1. **Rafraîchir manuellement** la page après avoir cliqué sur "Récupérer"
2. **Utiliser l'API directement** via Postman ou curl
3. **Modifier manuellement** la base de données

### 8. Contact

Si aucune solution ne fonctionne :
1. Vérifiez que le backend est démarré sur le port 5000
2. Vérifiez que MongoDB est connecté
3. Vérifiez les variables d'environnement
4. Redémarrez le serveur backend 