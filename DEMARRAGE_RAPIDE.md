# 🚀 Guide de Démarrage Rapide - Gestion Auto-École

## ⚡ Démarrage en 5 minutes

### 1. Installation MongoDB (si pas déjà fait)

**Option A : MongoDB local**
- Télécharger depuis [mongodb.com](https://www.mongodb.com/try/download/community)
- Installer et démarrer le service

**Option B : MongoDB Atlas (recommandé)**
- Aller sur [MongoDB Atlas](https://www.mongodb.com/atlas)
- Créer un compte gratuit
- Créer un cluster
- Copier l'URI de connexion

### 2. Configuration

1. **Créer le fichier `.env` dans le dossier `backend`** :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auto-ecole
# Ou pour Atlas : MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auto-ecole
JWT_SECRET=ton_secret_jwt_super_securise
```

### 3. Installation des dépendances

```bash
# Installer tout en une fois
npm run install-all
```

### 4. Démarrage

```bash
# Démarrer frontend + backend en même temps
npm run dev
```

Ou séparément :
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend  
npm start
```

### 5. Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## 🔧 Vérification

1. **Backend** : Visiter http://localhost:5000 → Message "API Auto-École Gestion"
2. **Frontend** : Visiter http://localhost:3000 → Interface de l'application

## 📊 Test de la base de données

L'application créera automatiquement les collections MongoDB :
- `candidates` - Candidats
- `instructors` - Instructeurs  
- `exams` - Examens
- `courses` - Cours

## 🆘 Problèmes courants

### "Erreur de connexion MongoDB"
- Vérifier que MongoDB est démarré
- Vérifier l'URI dans le fichier `.env`

### "Le serveur backend ne répond pas"
- Vérifier que le port 5000 est libre
- Vérifier les logs dans le terminal backend

### "Erreur CORS"
- Le backend est configuré pour accepter les requêtes depuis localhost:3000
- Vérifier que les deux serveurs sont démarrés

## 📝 Prochaines étapes

1. **Ajouter des données de test** via l'interface
2. **Explorer les fonctionnalités** :
   - Gestion des candidats
   - Programmation d'examens
   - Création de cours
3. **Personnaliser** selon vos besoins

## 🎯 Fonctionnalités disponibles

- ✅ Dashboard avec statistiques
- ✅ Gestion des candidats (CRUD)
- ✅ Gestion des instructeurs (CRUD)
- ✅ Programmation d'examens
- ✅ Gestion des cours
- ✅ Interface responsive
- ✅ Base de données MongoDB
- ✅ API REST complète 