# 📱 Guide de Publication AÏLA - App Stores

## 🎯 Prérequis

### Comptes requis :
- [ ] **Compte Expo** : https://expo.dev (gratuit)
- [ ] **Google Play Console** : https://play.google.com/console (25$ une fois)
- [ ] **Apple Developer Program** : https://developer.apple.com (99$/an)

---

## 📋 Étape 1 : Configuration Expo/EAS

### 1.1 Installer EAS CLI
```bash
npm install -g eas-cli
```

### 1.2 Se connecter à Expo
```bash
eas login
```

### 1.3 Configurer le projet
```bash
cd /app/frontend
eas build:configure
```

---

## 🤖 Étape 2 : Build Android

### 2.1 Créer le fichier AAB (pour Google Play)
```bash
eas build --platform android --profile production
```

### 2.2 Télécharger le fichier AAB
Après le build, téléchargez le fichier .aab depuis le dashboard Expo.

---

## 🍎 Étape 3 : Build iOS

### 3.1 Prérequis Apple
- Apple ID avec Apple Developer Program actif
- Certificats et profils de provisioning (EAS les gère automatiquement)

### 3.2 Créer le fichier IPA
```bash
eas build --platform ios --profile production
```

---

## 📤 Étape 4 : Publication Google Play Store

### 4.1 Créer l'application dans Google Play Console
1. Aller sur https://play.google.com/console
2. Créer une nouvelle application
3. Remplir les informations de base

### 4.2 Informations requises

**Nom de l'application :** AÏLA - Arbre Généalogique Familial

**Description courte (80 caractères max) :**
```
Créez et partagez votre arbre généalogique gratuitement avec votre famille.
```

**Description complète (4000 caractères max) :**
```
🌳 AÏLA - L'application d'arbre généalogique qui connecte votre famille

Découvrez AÏLA, l'application gratuite pour créer, visualiser et partager votre arbre généalogique familial. Préservez votre histoire familiale et connectez-vous avec vos proches comme jamais auparavant.

✨ FONCTIONNALITÉS PRINCIPALES :

📊 Créez votre arbre généalogique
• Ajoutez facilement vos ancêtres et descendants
• Visualisez votre arbre de manière interactive
• Naviguez entre les générations d'un simple geste

👨‍👩‍👧‍👦 Collaborez en famille
• Invitez vos proches à enrichir l'arbre ensemble
• Chacun peut ajouter des informations et des souvenirs
• Notifications en temps réel des modifications

📅 Ne manquez plus aucune date
• Rappels automatiques des anniversaires
• Calendrier des événements familiaux
• Notifications personnalisées

💬 Discutez en famille
• Chat intégré pour échanger avec vos proches
• Partagez des photos et des souvenirs
• Restez connectés où que vous soyez

🔒 Vos données sont protégées
• Conformité RGPD
• Données chiffrées et sécurisées
• Contrôle total sur vos informations

📤 Exportez vos données
• Format GEDCOM compatible
• Sauvegardez votre travail
• Importez dans d'autres logiciels

🎁 GRATUIT ET SANS ENGAGEMENT
Créez votre arbre généalogique gratuitement. Une version Premium est disponible pour les utilisateurs qui souhaitent des fonctionnalités avancées et une expérience sans publicité.

Rejoignez des milliers de familles qui utilisent AÏLA pour préserver leur histoire. Téléchargez maintenant et commencez votre voyage généalogique !

🌐 Site web : www.aila.family
📧 Support : contact@aila.family
```

### 4.3 Catégorie
- **Catégorie principale :** Style de vie
- **Tags :** Généalogie, Famille, Arbre généalogique

### 4.4 Classification du contenu
- **Audience :** Tout public (PEGI 3 / Everyone)
- **Contenu :** Aucun contenu sensible

### 4.5 Assets graphiques requis

| Asset | Dimensions | Format |
|-------|------------|--------|
| Icône | 512 x 512 px | PNG |
| Feature Graphic | 1024 x 500 px | PNG/JPG |
| Screenshots téléphone | 1080 x 1920 px | PNG/JPG |
| Screenshots tablette | 1200 x 1920 px | PNG/JPG |

**Nombre de screenshots :** Minimum 2, recommandé 4-8

---

## 📤 Étape 5 : Publication Apple App Store

### 5.1 Créer l'application dans App Store Connect
1. Aller sur https://appstoreconnect.apple.com
2. Mes apps → Nouvelle application
3. Remplir les informations

### 5.2 Informations requises

**Nom :** AÏLA - Arbre Généalogique
**Sous-titre :** Créez votre histoire familiale
**Catégorie :** Style de vie

**Mots-clés (100 caractères max) :**
```
arbre généalogique,famille,généalogie,ancêtres,histoire familiale,AILA,gratuit
```

### 5.3 Texte promotionnel (170 caractères) :
```
Créez et partagez votre arbre généalogique gratuitement. Collaborez avec votre famille et préservez votre histoire pour les générations futures.
```

### 5.4 Assets requis

| Asset | Dimensions | Format |
|-------|------------|--------|
| Icône | 1024 x 1024 px | PNG |
| Screenshots iPhone 6.5" | 1284 x 2778 px | PNG/JPG |
| Screenshots iPhone 5.5" | 1242 x 2208 px | PNG/JPG |
| Screenshots iPad Pro 12.9" | 2048 x 2732 px | PNG/JPG |

---

## 📊 Étape 6 : Configuration AdMob Post-Publication

### 6.1 Associer l'app au store
1. AdMob → Applications → AILA
2. Cliquer sur "Associer à un magasin d'applications"
3. Rechercher "AÏLA" sur le store
4. Confirmer l'association

### 6.2 Activer les publicités
Les publicités commenceront à s'afficher après :
- Publication sur le store
- Association dans AdMob
- Validation par Google (24-48h)

---

## ✅ Checklist finale

### Avant de soumettre :
- [ ] Version de l'app mise à jour (1.0.0)
- [ ] Icône de haute qualité
- [ ] Screenshots représentatifs
- [ ] Description complète et attractive
- [ ] Politique de confidentialité accessible
- [ ] Test de l'app sur appareil réel
- [ ] Vérification des permissions

### Après publication :
- [ ] Associer l'app dans AdMob
- [ ] Configurer Google Analytics
- [ ] Surveiller les crashs et avis
- [ ] Répondre aux commentaires utilisateurs

---

## 🆘 Support

Pour toute question :
- Documentation Expo : https://docs.expo.dev
- Documentation EAS : https://docs.expo.dev/build/introduction/
- Support Apple : https://developer.apple.com/support/
- Support Google Play : https://support.google.com/googleplay/android-developer
