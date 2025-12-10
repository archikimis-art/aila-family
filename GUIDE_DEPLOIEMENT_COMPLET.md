# 🚀 Guide Complet de Déploiement AÏLA

## 📋 Vue d'ensemble

Vous allez déployer AÏLA sur :
- **Web** : Accessible via navigateur sur aila.family
- **Mobile iOS** : Via App Store (Apple)
- **Mobile Android** : Via Play Store (Google)

**Durée totale estimée** : 2-3 heures (première fois)

---

## ✅ Pré-requis (Vous les avez déjà !)

- ✅ Compte GitHub : archikimis-art
- ✅ Dépôt GitHub : https://github.com/archikimis-art/aila-family
- ✅ Compte MongoDB Atlas
- ✅ Compte Render (backend)
- ✅ Compte Vercel (frontend web)
- ✅ Domaine : aila.family

---

# PARTIE 1 : Pousser le Code sur GitHub

## Étape 1.1 : Préparer le Code

Le code est déjà prêt dans `/app`. Nous devons juste le pousser vers GitHub.

### Option A : Via l'Interface GitHub (RECOMMANDÉ - Plus Simple)

1. **Téléchargez tous les fichiers**
   - Allez dans `/app` sur votre ordinateur
   - Sélectionnez tout (sauf les dossiers cachés .git, node_modules)

2. **Allez sur votre dépôt GitHub**
   - Ouvrez : https://github.com/archikimis-art/aila-family
   - Cliquez sur **"Add file"** (en haut à droite)
   - Cliquez sur **"Upload files"**

3. **Glissez-déposez les fichiers**
   - Sélectionnez tous les dossiers et fichiers :
     - `backend/`
     - `frontend/`
     - `README.md`
     - `GUIDE_DEPLOIEMENT.md`
     - etc.
   - Glissez-les dans la zone de drop sur GitHub

4. **Commit les changements**
   - En bas de la page, ajoutez un message :
     ```
     Initial commit: AÏLA Family Tree Application
     ```
   - Cliquez sur **"Commit changes"**
   - ⏳ Attendez que l'upload se termine (2-5 minutes)

### Option B : Via Git en Ligne de Commande (Avancé)

```bash
# Si vous préférez utiliser Git CLI
cd /app
git init
git add .
git commit -m "Initial commit: AÏLA Application"
git remote add origin https://github.com/archikimis-art/aila-family.git
git push -u origin main
```

**⚠️ Note** : Vous devrez entrer votre nom d'utilisateur GitHub et un Personal Access Token (pas votre mot de passe).

---

# PARTIE 2 : Déployer le Backend sur Render

## Étape 2.1 : Se Connecter à Render

1. Allez sur https://render.com
2. Cliquez sur **"Sign In"** (ou "Dashboard" si déjà connecté)
3. Connectez-vous avec votre compte

## Étape 2.2 : Créer un Nouveau Web Service

1. Sur le Dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**

## Étape 2.3 : Connecter GitHub

1. Cliquez sur **"Connect GitHub"**
2. Une fenêtre s'ouvre → Autorisez Render à accéder à vos repos
3. Sélectionnez le dépôt **"aila-family"**
4. Cliquez sur **"Connect"**

## Étape 2.4 : Configurer le Service Backend

Remplissez le formulaire avec **EXACTEMENT** ces valeurs :

### Configuration Générale

| Champ | Valeur |
|-------|--------|
| **Name** | `aila-backend` |
| **Region** | `Frankfurt (EU Central)` (ou le plus proche de vous) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |

### Build & Start Commands

| Champ | Valeur |
|-------|--------|
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

## Étape 2.5 : Variables d'Environnement (CRITIQUE !)

Cliquez sur **"Advanced"** puis **"Add Environment Variable"**.

Ajoutez ces 2 variables **EXACTEMENT** :

### Variable 1 : MONGO_URL
```
Key:   MONGO_URL
Value: mongodb+srv://archikimis_db_user:Kimimongodb93%21@cluster0.44cpuiq.mongodb.net/?appName=Cluster0
```

### Variable 2 : JWT_SECRET
```
Key:   JWT_SECRET
Value: votre_cle_secrete_super_longue_et_aleatoire_123456789
```

**⚠️ IMPORTANT** : 
- Ne modifiez PAS l'URL MongoDB (le `%21` est important, c'est le `!` encodé)
- Changez le JWT_SECRET par une vraie clé aléatoire (minimum 32 caractères)

**Exemple de JWT_SECRET** :
```
a8f3d9b2c1e4f7g6h5i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4x3y2z1
```

## Étape 2.6 : Plan et Déploiement

1. **Instance Type** : Sélectionnez **"Free"** (0$/mois)
   - ⚠️ Le service s'endormira après 15 min d'inactivité
   - Il se réveillera au premier appel (délai : 30s)

2. Cliquez sur **"Create Web Service"**

3. ⏳ **Attendez 3-5 minutes**
   - Render va :
     - Cloner votre code
     - Installer les dépendances Python
     - Démarrer le serveur
   - Vous verrez les logs en temps réel

4. **Vérifiez le déploiement**
   - En haut, vous verrez un statut vert : **"Live"**
   - Votre URL backend sera :
     ```
     https://aila-backend-xxxx.onrender.com
     ```
   - **📝 NOTEZ CETTE URL** → Vous en aurez besoin pour le frontend !

## Étape 2.7 : Tester le Backend

1. Ouvrez un nouvel onglet de navigateur
2. Allez sur : `https://aila-backend-xxxx.onrender.com/api/health`
   (Remplacez `xxxx` par votre vrai domaine)

3. Vous devriez voir :
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-10T...",
     "database": "connected"
   }
   ```

✅ **Si vous voyez ça, le backend fonctionne !**

---

# PARTIE 3 : Déployer le Frontend sur Vercel

## Étape 3.1 : Se Connecter à Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Login"**
3. Connectez-vous avec votre compte

## Étape 3.2 : Importer le Projet

1. Sur le Dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Cliquez sur **"Import Git Repository"**
3. Si pas déjà fait, connectez GitHub
4. Sélectionnez le repo **"aila-family"**
5. Cliquez sur **"Import"**

## Étape 3.3 : Configurer le Projet

### Configuration Générale

| Champ | Valeur |
|-------|--------|
| **Project Name** | `aila-family` (ou `aila`) |
| **Framework Preset** | `Other` (ou `Vite`) |
| **Root Directory** | `frontend` |

### Build Settings

| Champ | Valeur |
|-------|--------|
| **Build Command** | `npx expo export -p web` |
| **Output Directory** | `dist` |
| **Install Command** | `yarn install` |

## Étape 3.4 : Variables d'Environnement (CRITIQUE !)

**Avant de déployer**, ajoutez cette variable :

1. Cliquez sur **"Environment Variables"**
2. Ajoutez :

```
Name:  EXPO_PUBLIC_BACKEND_URL
Value: https://aila-backend-xxxx.onrender.com
```

**⚠️ Remplacez `xxxx`** par l'URL RÉELLE de votre backend Render (étape 2.7) !

**Exemple** :
```
EXPO_PUBLIC_BACKEND_URL=https://aila-backend-abc123.onrender.com
```

## Étape 3.5 : Déployer !

1. Cliquez sur **"Deploy"**
2. ⏳ Attendez 2-5 minutes
   - Vercel va :
     - Installer les dépendances
     - Builder l'app Expo pour le web
     - Déployer sur leur CDN

3. **Une fois terminé**, vous verrez :
   - Un confetti 🎉
   - Votre URL : `https://aila-family-xxxxx.vercel.app`

## Étape 3.6 : Tester le Frontend

1. Cliquez sur **"Visit"** (ou ouvrez l'URL dans un nouvel onglet)
2. Vous devriez voir l'écran d'accueil AÏLA avec :
   - 🌿 La feuille dorée
   - Le slogan en italique
   - Les boutons "Mode Aperçu" et "Créer un compte"

✅ **Si vous voyez ça, le frontend fonctionne !**

## Étape 3.7 : Tester la Connexion Backend ↔ Frontend

1. Sur votre site, cliquez sur **"Mode Aperçu"**
2. Essayez d'ajouter une personne
3. Si ça marche → ✅ Tout est connecté !
4. Si erreur → Vérifiez la variable `EXPO_PUBLIC_BACKEND_URL`

---

# PARTIE 4 : Configurer le Domaine Personnalisé (aila.family)

## Étape 4.1 : Ajouter le Domaine dans Vercel

1. Dans Vercel, allez dans votre projet **aila-family**
2. Cliquez sur **"Settings"** (en haut)
3. Dans le menu gauche, cliquez sur **"Domains"**
4. Cliquez sur **"Add"**

5. Ajoutez **2 domaines** :
   - `aila.family`
   - `www.aila.family`

6. Cliquez sur **"Add"** pour chaque

## Étape 4.2 : Configurer les DNS

Vercel va vous donner des instructions. Vous devez modifier les DNS de votre domaine.

### Où configurer les DNS ?

Allez sur le site où vous avez acheté `aila.family` (ex: OVH, Gandi, Namecheap, etc.)

### Enregistrements DNS à Ajouter

Vercel vous donnera quelque chose comme :

**Pour le domaine racine (aila.family)** :
```
Type: A
Name: @
Value: 76.76.21.21
```

**Pour le sous-domaine www** :
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Étapes sur votre registrar DNS

1. Connectez-vous à votre compte (ex: OVH)
2. Allez dans "Gestion DNS" ou "Zone DNS"
3. Ajoutez les enregistrements ci-dessus
4. Sauvegardez
5. ⏳ Attendez 10-30 minutes (propagation DNS)

## Étape 4.3 : Vérifier

1. Après 30 minutes, allez sur https://aila.family
2. Vous devriez voir votre application ! 🎉

---

# PARTIE 5 : Déployer sur Mobile (iOS & Android)

## 🍎 iOS (Apple App Store)

### Étape 5.1 : Prérequis iOS

**Vous avez besoin de** :
- Un Mac (obligatoire pour construire l'app iOS)
- Un compte Apple Developer (99$/an)
- Xcode installé

### Étape 5.2 : Build iOS avec EAS (Expo Application Services)

1. **Installer EAS CLI** :
   ```bash
   npm install -g eas-cli
   ```

2. **Se connecter à Expo** :
   ```bash
   eas login
   ```
   (Créez un compte Expo si besoin : https://expo.dev)

3. **Configurer le projet** :
   ```bash
   cd /app/frontend
   eas build:configure
   ```

4. **Builder pour iOS** :
   ```bash
   eas build --platform ios
   ```
   - Choisissez "App Store" comme build type
   - Suivez les instructions pour le certificat Apple

5. **Soumettre à l'App Store** :
   ```bash
   eas submit --platform ios
   ```

### Étape 5.3 : Configuration App Store Connect

1. Allez sur https://appstoreconnect.apple.com
2. Créez une nouvelle app
3. Remplissez les métadonnées :
   - Nom : AÏLA
   - Catégorie : Lifestyle / Utilities
   - Description : L'arbre généalogique qui connecte votre famille
   - Screenshots : Prenez 3-5 captures d'écran de l'app
4. Soumettez pour révision (délai : 1-2 jours)

---

## 🤖 Android (Google Play Store)

### Étape 5.4 : Prérequis Android

**Vous avez besoin de** :
- Un compte Google Play Developer (25$ one-time)
- Android Studio (optionnel mais recommandé)

### Étape 5.5 : Build Android avec EAS

1. **Builder pour Android** :
   ```bash
   cd /app/frontend
   eas build --platform android
   ```
   - Choisissez "Production" comme build type
   - EAS va créer un fichier `.aab` (Android App Bundle)

2. **Télécharger le .aab** :
   - Une fois le build terminé, téléchargez le fichier

### Étape 5.6 : Configuration Google Play Console

1. Allez sur https://play.google.com/console
2. Créez une nouvelle application
3. Remplissez les informations :
   - Nom : AÏLA
   - Catégorie : Lifestyle
   - Description courte : L'arbre généalogique qui connecte votre famille
   - Description longue : (Décrivez toutes les fonctionnalités)

4. **Upload le .aab** :
   - Allez dans "Release" → "Production"
   - Uploadez le fichier `.aab`
   - Ajoutez les screenshots (4-8 images minimum)
   - Ajoutez une icône (512x512px)

5. **Soumettez pour révision** (délai : quelques heures)

---

# PARTIE 6 : Alternative Simple pour Mobile (PWA)

## 📱 Option Plus Simple : Progressive Web App (PWA)

Si vous voulez éviter les stores iOS/Android pour l'instant, vous pouvez transformer votre site web en PWA.

### Avantages :
- ✅ Pas de frais (0$)
- ✅ Pas de révision
- ✅ Installable sur mobile comme une vraie app
- ✅ Fonctionne offline
- ✅ Notifications push

### Comment faire :

Votre app Expo est déjà presque une PWA ! Il faut juste :

1. Ajouter un fichier `manifest.json` dans `/app/frontend/public/`
2. Ajouter un Service Worker
3. Redéployer sur Vercel

Les utilisateurs pourront alors :
- Sur iPhone : Safari → Partager → "Sur l'écran d'accueil"
- Sur Android : Chrome → Menu → "Ajouter à l'écran d'accueil"

**Voulez-vous que j'active la PWA ?** (20 minutes de configuration)

---

# 📊 Récapitulatif du Processus Complet

## ✅ Checklist de Déploiement

### Web (Obligatoire - 1h)
- [ ] Code poussé sur GitHub
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] Domaine aila.family configuré
- [ ] Test complet du site

### Mobile iOS (Optionnel - 2-3 jours)
- [ ] Compte Apple Developer (99$/an)
- [ ] Build avec EAS
- [ ] Soumission App Store
- [ ] Attente validation Apple

### Mobile Android (Optionnel - 1 jour)
- [ ] Compte Google Play (25$ one-time)
- [ ] Build avec EAS
- [ ] Upload Play Store
- [ ] Attente validation Google

### PWA (Alternative - 30 min)
- [ ] Configuration PWA
- [ ] Test installation mobile
- [ ] Utilisateurs peuvent installer

---

# 🆘 Aide et Dépannage

## Problème : Backend Render ne démarre pas

**Solutions** :
1. Vérifiez les logs dans Render → Logs
2. Vérifiez que `MONGO_URL` est correct
3. Vérifiez que `requirements.txt` est à jour

## Problème : Frontend ne se connecte pas au backend

**Solutions** :
1. Vérifiez `EXPO_PUBLIC_BACKEND_URL` dans Vercel
2. Assurez-vous qu'il commence par `https://`
3. Testez l'URL backend directement : `/api/health`

## Problème : Le domaine ne fonctionne pas

**Solutions** :
1. Attendez 30-60 minutes (propagation DNS)
2. Vérifiez les enregistrements DNS sur dnschecker.org
3. Assurez-vous d'avoir ajouté les 2 domaines (avec et sans www)

---

# 🎯 Recommandation Ordre de Déploiement

**Je vous conseille de faire dans cet ordre** :

### Phase 1 (Aujourd'hui - 1h)
1. ✅ Pousser le code sur GitHub
2. ✅ Déployer le backend sur Render
3. ✅ Déployer le frontend sur Vercel
4. ✅ Tester avec l'URL Vercel (.vercel.app)

### Phase 2 (Demain - 1h)
5. ✅ Configurer le domaine aila.family
6. ✅ Attendre la propagation DNS
7. ✅ Tester le site sur aila.family

### Phase 3 (Plus tard - optionnel)
8. 📱 Activer la PWA (si vous voulez une "vraie app" mobile simple)
9. 📱 OU Builder pour iOS/Android (si vous voulez être sur les stores)

---

# ❓ Vous Êtes Prêt ?

**Par où voulez-vous commencer ?**

**Option A** : Je vous guide pas à pas pour la Partie 1 (GitHub) maintenant
**Option B** : Je crée des scripts automatiques pour faciliter tout ça
**Option C** : Vous préférez faire vous-même avec ce guide

**Dites-moi ce que vous préférez !** 🚀
