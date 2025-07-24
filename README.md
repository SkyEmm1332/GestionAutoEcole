# Gestion Auto-École

Application complète de gestion d'auto-école avec interface React et API backend Node.js/MongoDB.

## 🚀 Fonctionnalités

- **Gestion des candidats** : Inscription, suivi, statuts
- **Gestion des instructeurs** : Profils, spécialisations, planning
- **Gestion des examens** : Programmation, résultats, inscriptions
- **Gestion des cours** : Théoriques et pratiques, présences
- **Tableau de bord** : Statistiques en temps réel
- **Interface moderne** : Material-UI, responsive design

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- MongoDB (local ou Atlas)
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd GestionAutoEcole
```

### 2. Installer les dépendances frontend
```bash
npm install
```

### 3. Installer les dépendances backend
```bash
cd backend
npm install
cd ..
```

### 4. Configuration de la base de données

#### Option A : MongoDB local
1. Télécharger et installer MongoDB depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Démarrer le service MongoDB

#### Option B : MongoDB Atlas (recommandé)
1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit
3. Obtenir l'URI de connexion

### 5. Configuration de l'environnement

Créer un fichier `.env` dans le dossier `backend` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auto-ecole
# ou pour Atlas :
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/auto-ecole
JWT_SECRET=ton_secret_jwt_super_securise
```

## 🚀 Démarrage

### 1. Démarrer le backend
```bash
cd backend
npm run dev
```
Le serveur API démarre sur `http://localhost:5000`

### 2. Démarrer le frontend
```bash
# Dans un nouveau terminal
npm start
```
L'application React démarre sur `http://localhost:3000`

## 📊 Structure de la base de données

### Collections MongoDB :

#### Candidats (`candidates`)
- Informations personnelles (nom, email, téléphone, etc.)
- Type de permis visé
- Statut (actif, inactif, diplômé, abandonné)
- Progression (examens théorique/pratique)
- Instructeur assigné
- Documents et notes

#### Instructeurs (`instructors`)
- Informations personnelles
- Numéro de licence
- Spécialisations (types de permis)
- Taux horaire
- Planning et disponibilités
- Statut (actif, inactif, vacances, maladie)

#### Examens (`exams`)
- Type (théorique ou pratique)
- Date et lieu
- Candidats inscrits
- Résultats et scores
- Instructeur responsable
- Coût et prérequis

#### Cours (`courses`)
- Type (théorique ou pratique)
- Titre et description
- Date, durée et lieu
- Instructeur
- Étudiants inscrits
- Présences et notes

## 🔧 API Endpoints

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

### Examens
- `GET /api/exams` - Liste des examens
- `POST /api/exams` - Créer un examen
- `POST /api/exams/:id/register-candidate` - Inscrire un candidat
- `PUT /api/exams/:id/candidate-result` - Mettre à jour un résultat
- `GET /api/exams/upcoming/list` - Examens à venir

### Cours
- `GET /api/courses` - Liste des cours
- `POST /api/courses` - Créer un cours
- `POST /api/courses/:id/enroll-candidate` - Inscrire un candidat
- `PUT /api/courses/:id/attendance` - Marquer la présence
- `GET /api/courses/upcoming/list` - Cours à venir

## 🎨 Technologies utilisées

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB avec Mongoose
- CORS
- bcryptjs (pour l'authentification future)
- jsonwebtoken (pour l'authentification future)

## 📁 Structure du projet

```
GestionAutoEcole/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── services/          # Services API
│   └── types/             # Types TypeScript
├── backend/               # API Node.js
│   ├── models/            # Modèles Mongoose
│   ├── routes/            # Routes API
│   └── server.js          # Serveur principal
├── public/                # Fichiers statiques
└── README.md
```

## 🔒 Sécurité

- Validation des données côté serveur
- Gestion des erreurs CORS
- Protection contre les injections MongoDB
- Validation des types avec Mongoose

## 🚀 Déploiement

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Heroku/Railway)
```bash
cd backend
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
1. Vérifier que MongoDB est démarré
2. Vérifier que le backend est accessible sur `http://localhost:5000`
3. Consulter les logs du serveur backend
4. Vérifier la console du navigateur pour les erreurs frontend
