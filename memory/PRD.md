# AÏLA - Application Généalogique

## Description
Application React Native Expo déployée en web sur Vercel pour créer et gérer des arbres généalogiques familiaux.

## Stack Technique
- **Frontend**: React Native Expo (web export)
- **Backend**: Render (https://aila-backend-hc1m.onrender.com)
- **Hébergement**: Vercel (www.aila.family)
- **i18n**: i18next (6 langues: FR, EN, ES, DE, IT, PT)

## État actuel - 6 Décembre 2025

### ✅ Pages i18n Complétées
**Pages d'authentification:**
- login.tsx, register.tsx, forgot-password.tsx

**Pages principales:**
- pricing.tsx (Premium)
- Homepage, FAQ, Privacy, Terms, About, Challenges, Pourquoi AÏLA
- Blog (5 articles), Community

**Pages SEO:**
- traditions-familiales, genealogie-debutant-guide, retrouver-ancetres-gratuitement, organiser-cousinade

**Onglets (tabs):**
- ✅ members.tsx - Traduit
- ✅ chat.tsx - Traduit (i18next)
- ✅ share.tsx - Traduit (i18next)
- ✅ tree.tsx - Messages principaux traduits (i18next)
- 🟡 profile.tsx - Clés ajoutées, mise à jour TSX partielle

### ✅ Fusion vers main effectuée
Tous les fichiers traduits ont été fusionnés vers la branche `main` le 6 Décembre 2025:
- Fichiers d'authentification (login, register, forgot-password)
- Fichiers des onglets (members, profile, tree, chat, share)
- Pages pricing et traditions-familiales
- 6 fichiers de traduction JSON mis à jour

### 🟡 Restant à traduire
- Finaliser profile.tsx (fichier volumineux +1000 lignes)
- add-person.tsx, add-link.tsx
- Quelques composants mineurs

## Google Auth
- ✅ Fonctionne sur www.aila.family
- ⚠️ Les URLs preview Vercel génèrent une erreur "origin_mismatch" - C'est normal, tester uniquement sur le domaine de production

## Problèmes Connus
1. **Messages Community**: Ne se mettent pas à jour au changement de langue (cache AsyncStorage)
2. **Drapeaux sélecteur de langue**: Non affichés
3. **Blog admin**: Fonctionnalité incomplète
4. **Persistance backend**: Manquante (tout en AsyncStorage)

## Prochaines Tâches (Priorité)
1. Finaliser profile.tsx
2. Traduire add-person.tsx, add-link.tsx
3. Corriger le cache des messages Community
4. Ajouter les drapeaux au sélecteur de langue

## Tâches Futures (Backlog)
- Implémenter persistance backend (remplacer AsyncStorage)
- Fonctionnalité "pression sociale positive"
- Option "Mode calme"
- Mode "Cousinade" complet

## Versions de Référence
| Branche | Description |
|---------|-------------|
| main | Production - Contient toutes les traductions fusionnées |
| i18n/seo-pages-complete | Ancienne branche feature (obsolète) |
