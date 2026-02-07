# AÏLA - Application Généalogique

## Description
Application React Native Expo déployée en web sur Vercel pour créer et gérer des arbres généalogiques familiaux.

## Stack Technique
- **Frontend**: React Native Expo (web export)
- **Backend**: Render (https://aila-backend-hc1m.onrender.com)
- **Hébergement**: Vercel (www.aila.family)
- **i18n**: i18next (6 langues: FR, EN, ES, DE, IT, PT)

## État actuel - 8 Décembre 2025

### ✅ Pages i18n Complétées

**Pages d'authentification:**
- ✅ login.tsx, register.tsx, forgot-password.tsx

**Pages principales:**
- ✅ **pricing.tsx (Premium)** - Entièrement traduit (hero, status, subscriptions, plans, features, services, coming soon, FAQ, alerts) - Commit `3ce489884`
- ✅ Homepage, FAQ, Privacy, Terms, About, Challenges, Pourquoi AÏLA
- ✅ Blog (5 articles), Community

**Pages SEO:**
- ✅ traditions-familiales, genealogie-debutant-guide, retrouver-ancetres-gratuitement, organiser-cousinade

**Onglets (tabs):**
- ✅ members.tsx - Traduit
- ✅ chat.tsx - Traduit (i18next)
- ✅ share.tsx - Traduit (i18next)
- ✅ tree.tsx - Messages principaux traduits (i18next)
- ✅ profile.tsx - Alertes principales traduites (export, delete, clear tree)
- ✅ add-person.tsx - Traduit
- ✅ add-link.tsx - Traduit

### ✅ Commits sur main (Session du 8 Décembre)
- `3ce489884` - feat(i18n): Complete translation of pricing.tsx page
  - Remplacement de tous les textes français en dur par des clés de traduction
  - Ajout de la section pricing complète aux 6 fichiers de langue (fr, en, de, es, it, pt)
  - Ajout des traductions FAQ
  - Correction de la section pricing dupliquée dans fr.json

### 🟡 Restant à traduire (priorité basse)
- Quelques alertes secondaires dans profile.tsx (sendByEmail, formats)
- Quelques composants mineurs

## Google Auth
- ✅ Fonctionne sur www.aila.family
- ⚠️ Les URLs preview Vercel génèrent une erreur "origin_mismatch" - C'est normal

## Problèmes Connus
1. **Messages Community**: Ne se mettent pas à jour au changement de langue (cache AsyncStorage)
2. **Drapeaux sélecteur de langue**: Non affichés
3. **Blog admin**: Fonctionnalité incomplète
4. **Persistance backend**: Manquante (tout en AsyncStorage)

## Prochaines Tâches (Priorité)
1. Corriger le cache des messages Community
2. Ajouter les drapeaux au sélecteur de langue
3. Audit final des fichiers pour textes non traduits restants

## Tâches Futures (Backlog)
- Implémenter persistance backend (remplacer AsyncStorage)
- Fonctionnalité "pression sociale positive"
- Option "Mode calme"
- Mode "Cousinade" complet

## Note Importante
Le projet AÏLA se trouve dans `/app/temp_aila/frontend/` et est déployé sur **Vercel** (www.aila.family).
L'App Preview Emergent (`react-langify.preview.emergentagent.com`) est un projet **différent** et non lié à AÏLA.
