# 🚀 Guide de Déploiement AÏLA sur le Web

## Étape 1 : Pousser le Code vers GitHub ✅

### Option A : Via l'interface GitHub (PLUS SIMPLE)

1. **Téléchargez le projet en ZIP**
   - Je vais créer un fichier ZIP de votre projet

2. **Allez sur votre dépôt GitHub**
   - URL : https://github.com/archikimis-art/aila-family
   
3. **Uploadez les fichiers**
   - Cliquez sur "Add file" > "Upload files"
   - Glissez-déposez tous les fichiers du projet
   - Ajoutez un message de commit : "Upload AÏLA application"
   - Cliquez sur "Commit changes"

### Option B : Via Git CLI (plus technique)

```bash
# Depuis votre machine locale
git clone https://github.com/archikimis-art/aila-family.git
# Copiez tous les fichiers du projet dans ce dossier
cd aila-family
git add .
git commit -m "Initial commit: AÏLA Family Tree"
git push origin main
```

---

## Étape 2 : Déployer le Backend sur Render 🔧

### 2.1 Connexion à Render

1. Allez sur https://render.com
2. Connectez-vous avec votre compte

### 2.2 Créer un nouveau Web Service

1. Cliquez sur **"New +"** > **"Web Service"**
2. Connectez votre dépôt GitHub :
   - Cliquez sur **"Connect GitHub"**
   - Autorisez Render à accéder à votre compte
   - Sélectionnez le dépôt **"aila-family"**

### 2.3 Configuration du Service Backend

Remplissez les paramètres suivants :

- **Name**: `aila-backend` (ou votre choix)
- **Region**: Choisissez la plus proche (ex: Frankfurt pour l'Europe)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 2.4 Variables d'Environnement (IMPORTANT!)

Cliquez sur **"Advanced"** > **"Add Environment Variable"** et ajoutez :

| Clé | Valeur |
|-----|--------|
| `MONGO_URL` | `mongodb+srv://archikimis_db_user:Kimimongodb93%21@cluster0.44cpuiq.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `votre_cle_secrete_aleatoire_ici_changez_moi` |
| `PYTHON_VERSION` | `3.11.0` |

### 2.5 Plan et Déploiement

- **Instance Type**: Choisissez **"Free"** (gratuit, mais le service s'endort après inactivité)
- Cliquez sur **"Create Web Service"**

⏳ **Attendez 3-5 minutes** que le déploiement se termine.

### 2.6 Notez l'URL du Backend

Une fois déployé, vous verrez une URL comme :
```
https://aila-backend-xxxx.onrender.com
```

**⚠️ IMPORTANT** : Copiez cette URL, vous en aurez besoin pour le frontend !

---

## Étape 3 : Déployer le Frontend sur Vercel 🎨

### 3.1 Connexion à Vercel

1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte

### 3.2 Importer le Projet

1. Cliquez sur **"Add New..."** > **"Project"**
2. Cliquez sur **"Import Git Repository"**
3. Sélectionnez **"aila-family"** dans la liste

### 3.3 Configuration du Projet

- **Framework Preset**: `Vite` ou `Other`
- **Root Directory**: `frontend`
- **Build Command**: `npx expo export -p web`
- **Output Directory**: `dist`
- **Install Command**: `yarn install` ou `npm install`

### 3.4 Variables d'Environnement (CRUCIAL!)

Dans la section **"Environment Variables"**, ajoutez :

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_BACKEND_URL` | `https://aila-backend-xxxx.onrender.com` |

⚠️ **Remplacez** `https://aila-backend-xxxx.onrender.com` par l'URL réelle de votre backend Render (de l'Étape 2.6)

### 3.5 Déploiement

- Cliquez sur **"Deploy"**
- ⏳ Attendez 2-5 minutes

### 3.6 Votre URL Frontend

Vercel vous donnera une URL comme :
```
https://aila-family-xxxxx.vercel.app
```

---

## Étape 4 : Configurer le Domaine Personnalisé (aila.family) 🌐

### 4.1 Ajouter le Domaine dans Vercel

1. Dans votre projet Vercel, allez dans **"Settings"** > **"Domains"**
2. Cliquez sur **"Add"**
3. Entrez `aila.family` et `www.aila.family`
4. Cliquez sur **"Add"**

### 4.2 Configurer les DNS

Vercel vous donnera des instructions. Vous devrez ajouter des enregistrements DNS chez votre registrar de domaine :

**Type A Record** :
```
aila.family → 76.76.21.21
```

**Type CNAME Record** :
```
www.aila.family → cname.vercel-dns.com
```

⏳ **Attendez 10-30 minutes** pour la propagation DNS.

---

## ✅ Vérification Finale

### Backend
Testez : `https://aila-backend-xxxx.onrender.com/api/health`

Vous devriez voir :
```json
{"status":"healthy","timestamp":"...","database":"connected"}
```

### Frontend
Allez sur `https://aila.family` (ou votre URL Vercel)

Vous devriez voir l'application AÏLA fonctionner !

---

## 🔧 Dépannage

### Problème : Backend ne démarre pas sur Render
- Vérifiez que `MONGO_URL` est correct dans les variables d'environnement
- Regardez les logs dans Render : **"Logs"** en haut de la page

### Problème : Frontend ne peut pas se connecter au Backend
- Vérifiez que `EXPO_PUBLIC_BACKEND_URL` pointe bien vers l'URL Render
- Redéployez le frontend après avoir changé la variable

### Problème : Le domaine ne fonctionne pas
- Attendez plus longtemps (propagation DNS)
- Vérifiez vos enregistrements DNS
- Utilisez https://dnschecker.org pour vérifier

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des difficultés, notez :
- L'étape où vous êtes bloqué
- Le message d'erreur exact
- Des captures d'écran

Et je pourrai vous aider davantage !

---

**Bon déploiement ! 🚀**
