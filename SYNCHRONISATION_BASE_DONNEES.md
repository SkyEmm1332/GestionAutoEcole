# Guide de Synchronisation avec la Base de Données

## Vue d'ensemble

Le projet a été modifié pour synchroniser complètement avec la base de données MongoDB. Toutes les opérations de suppression et restauration sont maintenant synchronisées avec le backend.

## Fonctionnalités Synchronisées

### 1. Suppression de Cours (Soft Delete)
- ✅ Les cours sont marqués comme `isDeleted: true` dans la base de données
- ✅ Ils disparaissent de la liste principale et apparaissent dans l'onglet "Séance supprimée"
- ✅ Synchronisation immédiate avec le backend

### 2. Récupération de Cours
- ✅ Les cours supprimés peuvent être récupérés via le bouton "Récupérer"
- ✅ Ils sont marqués comme `isDeleted: false` dans la base de données
- ✅ Ils réapparaissent dans la liste principale

### 3. Gestion des Présences
- ✅ Les présences sont sauvegardées dans la base de données
- ✅ Synchronisation avec le backend pour chaque modification

## Configuration pour l'Hébergement

### 1. Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/autoecole

# Pour l'hébergement, utiliser une URL MongoDB Atlas ou similaire
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autoecole

# Port du serveur
PORT=5000

# Clé secrète pour JWT (si utilisé)
JWT_SECRET=votre_cle_secrete_ici
```

### 2. Mise à Jour de la Base de Données

Si vous avez des cours existants sans le champ `isDeleted`, exécutez le script de mise à jour :

```bash
node update_courses_isDeleted.js
```

### 3. Structure de la Base de Données

Le modèle Course inclut maintenant :

```javascript
{
  // ... autres champs
  isDeleted: {
    type: Boolean,
    default: false
  }
}
```

## Routes Backend Disponibles

### Cours Actifs
- `GET /api/courses` - Récupérer tous les cours actifs
- `POST /api/courses` - Créer un nouveau cours
- `PUT /api/courses/:id` - Modifier un cours
- `DELETE /api/courses/:id` - Supprimer un cours (soft delete)

### Cours Supprimés
- `GET /api/courses/deleted` - Récupérer les cours supprimés
- `PUT /api/courses/:id/restore` - Récupérer un cours supprimé

### Présences
- `PUT /api/courses/:id/attendance` - Marquer la présence d'un candidat

## Déploiement

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend
```bash
npm install
npm run build
```

### 3. Variables d'Environnement pour l'Hébergement

Assurez-vous que votre plateforme d'hébergement a accès aux variables d'environnement suivantes :

- `MONGODB_URI` : URL de votre base de données MongoDB
- `PORT` : Port du serveur (généralement 5000 ou défini par l'hébergeur)
- `NODE_ENV` : Environnement (production/development)

## Vérification de la Synchronisation

1. **Créer un cours** → Vérifier qu'il apparaît dans la base de données
2. **Supprimer un cours** → Vérifier que `isDeleted: true` dans la base
3. **Récupérer un cours** → Vérifier que `isDeleted: false` dans la base
4. **Marquer une présence** → Vérifier que l'attendance est sauvegardée

## Gestion des Erreurs

Le système gère automatiquement :
- ✅ Erreurs de connexion à la base de données
- ✅ Erreurs de validation des données
- ✅ Erreurs de synchronisation
- ✅ Messages d'erreur utilisateur appropriés

## Maintenance

### Sauvegarde de la Base de Données
```bash
# Sauvegarde complète
mongodump --uri="mongodb://localhost:27017/autoecole" --out=./backup

# Restauration
mongorestore --uri="mongodb://localhost:27017/autoecole" ./backup
```

### Nettoyage des Cours Supprimés
Pour supprimer définitivement les cours marqués comme supprimés :

```javascript
// Dans MongoDB Compass ou via script
db.courses.deleteMany({ isDeleted: true })
```

## Support

En cas de problème de synchronisation :
1. Vérifier la connexion à la base de données
2. Vérifier les logs du serveur backend
3. Vérifier les variables d'environnement
4. Redémarrer le serveur backend 