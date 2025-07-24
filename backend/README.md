# Backend API - Gestion Auto-École

## Description
API REST pour la gestion d'une auto-école avec MongoDB comme base de données.

## Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configuration de l'environnement :**
Créer un fichier `.env` à la racine du dossier backend avec :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auto-ecole
JWT_SECRET=ton_secret_jwt_super_securise
```

3. **Installer MongoDB :**
- Télécharger et installer MongoDB depuis [mongodb.com](https://www.mongodb.com/try/download/community)
- Ou utiliser MongoDB Atlas (cloud)

## Démarrage

**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

## Endpoints API

### Candidats
- `GET /api/candidates` - Liste des candidats
- `GET /api/candidates/:id` - Détails d'un candidat
- `POST /api/candidates` - Créer un candidat
- `PUT /api/candidates/:id` - Modifier un candidat
- `DELETE /api/candidates/:id` - Supprimer un candidat
- `GET /api/candidates/stats/overview` - Statistiques

### Instructeurs
- `GET /api/instructors` - Liste des instructeurs
- `GET /api/instructors/:id` - Détails d'un instructeur
- `POST /api/instructors` - Créer un instructeur
- `PUT /api/instructors/:id` - Modifier un instructeur
- `DELETE /api/instructors/:id` - Supprimer un instructeur
- `GET /api/instructors/stats/overview` - Statistiques

### Examens
- `GET /api/exams` - Liste des examens
- `GET /api/exams/:id` - Détails d'un examen
- `POST /api/exams` - Créer un examen
- `PUT /api/exams/:id` - Modifier un examen
- `DELETE /api/exams/:id` - Supprimer un examen
- `POST /api/exams/:id/register-candidate` - Inscrire un candidat
- `PUT /api/exams/:id/candidate-result` - Mettre à jour un résultat
- `GET /api/exams/upcoming/list` - Examens à venir

### Cours
- `GET /api/courses` - Liste des cours
- `GET /api/courses/:id` - Détails d'un cours
- `POST /api/courses` - Créer un cours
- `PUT /api/courses/:id` - Modifier un cours
- `DELETE /api/courses/:id` - Supprimer un cours
- `POST /api/courses/:id/enroll-candidate` - Inscrire un candidat
- `PUT /api/courses/:id/attendance` - Marquer la présence
- `GET /api/courses/upcoming/list` - Cours à venir

## Structure de la base de données

### Collections MongoDB :
- `candidates` - Informations des candidats
- `instructors` - Informations des instructeurs
- `exams` - Examens programmés
- `courses` - Cours théoriques et pratiques

## Technologies utilisées
- Node.js
- Express.js
- MongoDB avec Mongoose
- CORS pour les requêtes cross-origin 