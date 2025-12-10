# AÏLA - Arbre Généalogique Familial

Application collaborative de création et gestion d'arbres généalogiques.

## 🌳 Fonctionnalités

- 👥 Création et gestion de membres de la famille
- 🔗 Relations familiales (Parent, Enfant, Époux/Épouse, Frère/Sœur)
- 📊 Visualisation d'arbre généalogique interactif
- 👁️ Mode aperçu sans inscription
- 🔐 Authentification sécurisée (JWT)
- 📱 Application mobile et web

## 🚀 Architecture

- **Frontend**: Expo (React Native)
- **Backend**: FastAPI (Python)
- **Base de données**: MongoDB
- **Déploiement**: 
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas

## 🛠️ Installation Locale

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

## 🌍 Variables d'Environnement

### Backend (.env)
```
MONGO_URL=<votre_url_mongodb>
JWT_SECRET=<votre_secret>
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=<url_backend>
```

## 📄 Licence

Propriétaire - AÏLA Family Tree App

---

Développé avec ❤️ pour préserver l'histoire familiale
