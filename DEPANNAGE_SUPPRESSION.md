# Guide de Dépannage - Problème de Suppression

## Problème
Les cours supprimés n'apparaissent pas dans l'onglet "Séance supprimée".

## Diagnostic

### 1. Vérifier les Logs Frontend
Ouvrez la console du navigateur (F12) et vérifiez :

```
=== SUPPRESSION DE COURS ===
Cours à supprimer: {object}
ID du cours: [ID]
=== DÉBOGAGE SERVICE - deleteCourse ===
ID du cours à supprimer: [ID]
URL appelée: /courses/[ID]
Réponse de suppression: {object}
Rafraîchissement des listes...
=== DÉBOGAGE - fetchDeletedCourses ===
Données reçues de getDeletedCourses: {object}
Cours pratiques supprimés filtrés: [array]
```

### 2. Vérifier les Logs Backend
Dans le terminal du serveur backend, vérifiez :

```
=== DÉBOGAGE BACKEND - SUPPRESSION DE COURS ===
ID du cours à supprimer: [ID]
Cours existant avant suppression: {object}
Cours après marquage comme supprimé: {object}
isDeleted value: true
Vérification après suppression: {object}
isDeleted après vérification: true
```

### 3. Vérifier la Route /deleted
```
=== DÉBOGAGE BACKEND - ROUTE /deleted APPELÉE ===
Query initiale: { isDeleted: true }
Total des cours avec isDeleted: true: [nombre]
Cours trouvés avec la query: [nombre]
Détails des cours trouvés:
Cours 1: { id: [ID], title: [titre], type: [type], isDeleted: true }
```

## Solutions

### A. Problème de Filtrage Frontend

Si les logs montrent que les cours sont bien supprimés mais n'apparaissent pas dans l'interface :

1. **Vérifier le filtre de type** :
```javascript
// Dans fetchDeletedCourses
const deletedPracticalCourses = (data.courses || []).filter((course: any) => course.type === 'pratique');
```

2. **Ajouter des logs de débogage** :
```javascript
console.log('Tous les cours supprimés:', data.courses);
console.log('Cours pratiques uniquement:', deletedPracticalCourses);
```

### B. Problème de Base de Données

Si les cours ne sont pas marqués comme supprimés :

1. **Vérifier le modèle Course** :
```javascript
// Dans backend/models/Course.js
isDeleted: {
  type: Boolean,
  default: false
}
```

2. **Vérifier manuellement dans MongoDB** :
```javascript
// Dans MongoDB Compass ou mongo shell
db.courses.find({ isDeleted: true })
db.courses.find({ type: "pratique", isDeleted: true })
```

### C. Problème de Synchronisation

Si les cours sont supprimés mais ne réapparaissent pas :

1. **Forcer le rafraîchissement** :
```javascript
// Dans handleConfirmDelete
await fetchCourses();
await fetchDeletedCourses();
```

2. **Vérifier les états React** :
```javascript
console.log('État des cours après suppression:', courses);
console.log('État des cours supprimés après suppression:', deletedCourses);
```

## Tests Manuels

### 1. Test de l'API Directement
```bash
# Supprimer un cours
curl -X DELETE http://localhost:5000/api/courses/[ID]

# Vérifier les cours supprimés
curl http://localhost:5000/api/courses/deleted

# Vérifier les cours actifs
curl http://localhost:5000/api/courses
```

### 2. Test de la Base de Données
```javascript
// Dans MongoDB Compass
// Vérifier tous les cours
db.courses.find({})

// Vérifier les cours supprimés
db.courses.find({ isDeleted: true })

// Vérifier les cours pratiques supprimés
db.courses.find({ type: "pratique", isDeleted: true })

// Marquer manuellement un cours comme supprimé
db.courses.updateOne(
  { _id: ObjectId("ID_DU_COURS") },
  { $set: { isDeleted: true } }
)
```

### 3. Test du Frontend
```javascript
// Dans la console du navigateur
// Vérifier l'état des cours
console.log('Cours actifs:', courses);
console.log('Cours supprimés:', deletedCourses);

// Forcer le rafraîchissement
fetchCourses();
fetchDeletedCourses();
```

## Solutions de Contournement

### 1. Rafraîchissement Manuel
Si le problème persiste, rafraîchissez manuellement la page après avoir supprimé un cours.

### 2. Modification Manuelle
Modifiez manuellement la base de données pour marquer les cours comme supprimés.

### 3. Reset des États
```javascript
// Dans la console du navigateur
// Réinitialiser les états
setCourses([]);
setDeletedCourses([]);
// Puis recharger
fetchCourses();
fetchDeletedCourses();
```

## Prévention

### 1. Vérifications Régulières
- Vérifiez régulièrement les logs du backend
- Surveillez les erreurs dans la console du navigateur
- Testez la fonctionnalité après chaque modification

### 2. Tests Automatisés
Créez des tests pour vérifier :
- La suppression fonctionne
- Les cours supprimés apparaissent dans la bonne liste
- La restauration fonctionne
- Les listes se rafraîchissent correctement

## Contact

Si le problème persiste :
1. Vérifiez que le backend est démarré
2. Vérifiez la connexion à MongoDB
3. Vérifiez les variables d'environnement
4. Redémarrez le serveur backend
5. Videz le cache du navigateur 