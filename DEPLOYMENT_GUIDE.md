# 🚀 Guide de Déploiement AÏLA - aila.family

## 📋 Informations de Configuration

### Vos Identifiants :
- **GitHub Username** : archikimis-art
- **Domaine Principal** : aila.family
- **MongoDB URL** : `mongodb+srv://archikimis_db_user:Kimimongodb93%21@cluster0.44cpuiq.mongodb.net/?appName=Cluster0`
- **JWT Secret** : `aila-jwt-secret-2025-super-secure-key-production`

---

## 🎯 ÉTAPE 1 : Créer le Repository GitHub (5 min)

### A. Créer un nouveau repository

1. Allez sur : https://github.com/new
2. Remplissez :
   - **Repository name** : `aila-family-tree`
   - **Description** : `AÏLA - Application de généalogie collaborative`
   - **Visibility** : Public ✅
   - **Initialize with README** : NON (ne cochez pas)
3. Cliquez sur "Create repository"

### B. Pousser le code (à faire depuis l'environnement Emergent)

**Instructions pour l'agent/développeur :**
```bash
cd /app
git init
git add .
git commit -m "Initial commit - AÏLA application"
git branch -M main
git remote add origin https://github.com/archikimis-art/aila-family-tree.git
git push -u origin main
```

---

## 🎯 ÉTAPE 2 : Déployer le Backend sur Render (10 min)

### A. Créer un Web Service

1. Allez sur : https://dashboard.render.com
2. Cliquez sur "New +" en haut à droite
3. Sélectionnez "Web Service"

### B. Connecter le Repository

1. Cliquez sur "Connect a repository"
2. Autorisez l'accès à GitHub si demandé
3. Cherchez et sélectionnez : `archikimis-art/aila-family-tree`
4. Cliquez sur "Connect"

### C. Configurer le Service

**Name:**
```
aila-backend
```

**Region:**
```
Frankfurt (EU Central) - Recommandé pour la France
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn app:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Free
```

### D. Variables d'Environnement

Cliquez sur "Advanced" puis ajoutez ces variables :

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://archikimis_db_user:Kimimongodb93%21@cluster0.44cpuiq.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `aila-jwt-secret-2025-super-secure-key-production` |
| `DB_NAME` | `aila_db` |
| `PORT` | `8001` |

### E. Créer le Service

1. Cliquez sur "Create Web Service" en bas
2. Attendez que le déploiement se termine (5-10 min)
3. Notez votre URL Render : `https://aila-backend.onrender.com`

---

## 🎯 ÉTAPE 3 : Déployer le Frontend sur Vercel (10 min)

### A. Importer le Projet

1. Allez sur : https://vercel.com/new
2. Cliquez sur "Import Git Repository"
3. Sélectionnez `archikimis-art/aila-family-tree`
4. Cliquez sur "Import"

### B. Configurer le Projet

**Project Name:**
```
aila-family
```

**Framework Preset:**
```
Other (ou Expo si disponible)
```

**Root Directory:**
```
frontend
```

**Build Command:**
```
npx expo export -p web
```

**Output Directory:**
```
dist
```

**Install Command:**
```
yarn install
```

### C. Variables d'Environnement

Ajoutez cette variable :

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_API_URL` | `https://aila-backend.onrender.com` |

### D. Déployer

1. Cliquez sur "Deploy"
2. Attendez la fin du déploiement (3-5 min)
3. Notez votre URL Vercel : `https://aila-family.vercel.app`

---

## 🎯 ÉTAPE 4 : Configuration DNS sur domaine.fr (15 min)

### A. Se Connecter

1. Allez sur : https://www.domaine.fr
2. Connectez-vous
3. Cliquez sur "Mes domaines"
4. Sélectionnez `aila.family`
5. Cliquez sur "Gérer la zone DNS" ou "DNS"

### B. Ajouter les Enregistrements DNS

#### Pour le Frontend (Vercel)

**Enregistrement 1 : A Record**
```
Type: A
Nom: @
Valeur: 76.76.21.21
TTL: 3600
```

**Enregistrement 2 : CNAME**
```
Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
TTL: 3600
```

#### Pour le Backend (Render)

**Enregistrement 3 : CNAME**
```
Type: CNAME
Nom: api
Valeur: aila-backend.onrender.com
TTL: 3600
```

### C. Configurer les Domaines Personnalisés

#### Sur Vercel :
1. Allez dans votre projet sur Vercel
2. Onglet "Settings" → "Domains"
3. Ajoutez : `aila.family`
4. Ajoutez : `www.aila.family`
5. Vercel vérifiera automatiquement les DNS

#### Sur Render :
1. Allez dans votre service sur Render
2. Onglet "Settings"
3. Section "Custom Domain"
4. Ajoutez : `api.aila.family`
5. Render vérifiera automatiquement les DNS

### D. Attendre la Propagation

- Temps d'attente : 5 minutes à 48 heures (généralement 30 min)
- Vérifiez sur : https://dnschecker.org

---

## 🎯 ÉTAPE 5 : Tests Finaux (20 min)

### A. Vérifier le Backend

Ouvrez dans votre navigateur :
```
https://api.aila.family/health
```

Résultat attendu :
```json
{
  "status": "healthy",
  "service": "running",
  "database": "connected"
}
```

### B. Vérifier le Frontend

Ouvrez dans votre navigateur :
```
https://aila.family
```

Vous devriez voir la page d'accueil AÏLA.

### C. Tester le Flux Complet

1. **Inscription** : Créez un compte
2. **Connexion** : Connectez-vous
3. **Ajouter un membre** : Ajoutez une personne à l'arbre
4. **Créer un lien** : Créez un lien familial
5. **Mode aperçu** : Testez sans compte

---

## ✅ Checklist de Déploiement

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] DNS configurés sur domaine.fr
- [ ] Domaines personnalisés ajoutés (Vercel + Render)
- [ ] Backend accessible sur api.aila.family
- [ ] Frontend accessible sur aila.family
- [ ] Tests d'inscription/connexion réussis
- [ ] Tests d'ajout de membres réussis

---

## 🆘 Dépannage

### Backend ne démarre pas sur Render

**Vérifiez :**
- Les variables d'environnement sont bien configurées
- La commande de démarrage est correcte
- Les logs Render pour voir les erreurs

### Frontend ne s'affiche pas sur Vercel

**Vérifiez :**
- La variable `EXPO_PUBLIC_API_URL` est configurée
- Le build a réussi
- Les logs Vercel pour voir les erreurs

### DNS ne se propage pas

**Vérifiez :**
- Les enregistrements DNS sont corrects
- Attendez au moins 30 minutes
- Testez avec : https://dnschecker.org

### "CORS Error" dans le navigateur

**Solution :**
Le backend doit autoriser le domaine frontend dans les CORS.
C'est déjà configuré dans le code.

---

## 📊 URLs Importantes

- **Application** : https://aila.family
- **API** : https://api.aila.family
- **Backend Dashboard** : https://dashboard.render.com
- **Frontend Dashboard** : https://vercel.com/dashboard
- **MongoDB** : https://cloud.mongodb.com
- **DNS** : https://www.domaine.fr

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre application AÏLA sera accessible publiquement sur **https://aila.family** !

Vous pourrez :
- Partager le lien avec votre famille
- Créer vos arbres généalogiques
- Collaborer avec d'autres utilisateurs
- Accéder depuis n'importe quel appareil (ordinateur, mobile, tablette)

**Bienvenue dans le monde de AÏLA ! 🌳👨‍👩‍👧‍👦**
