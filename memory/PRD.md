# AÏLA - Product Requirements Document

## Project Overview
AÏLA est une application d'arbre généalogique familial qui connecte les familles. Le projet utilise React Native avec Expo pour le web, déployé sur Vercel.

## Architecture
- **Frontend**: `/app/temp_aila/frontend/` - React Native Expo (déployé sur Vercel)
- **Backend**: `/app/temp_aila/backend/server.py` - FastAPI (déployé sur Render)
- **Database**: MongoDB

## User's Preferred Language
French (Français)

---

## Completed Features

### 2026-02-02 - Audit i18n Approfondi ✅

**Fichiers fonctionnels traduits avec clés de traduction :**
- ✅ `admin.tsx` : Interface d'administration complète (statistiques, recherche, modals)
- ✅ `users-management.tsx` : Gestion des utilisateurs (promouvoir/rétrograder)
- ✅ `add-person.tsx` : Messages d'erreur, relations, sauvegarde
- ✅ `person/[id].tsx` : Page de détail personne, édition, suppression
- ✅ `(tabs)/chat.tsx` : Messages d'erreur et confirmation
- ✅ `(tabs)/profile.tsx` : Export, email, suppression de compte
- ✅ `(tabs)/share.tsx` : Boutons Annuler/Confirmer
- ✅ `(tabs)/tree.tsx` : Chargement, bouton Fermer
- ✅ `pricing.tsx` : Messages d'erreur d'achat
- ✅ `merge-trees.tsx` : Interface de fusion d'arbres
- ✅ `(auth)/login.tsx` : Messages d'erreur de connexion
- ✅ `(auth)/register.tsx` : Messages d'erreur d'inscription

**Sections ajoutées aux 6 fichiers de langue (en, fr, es, de, it, pt):**
- `admin` : 27 nouvelles clés
- `userManagement` : 10 nouvelles clés
- `deleteAccount` : 10 nouvelles clés
- `forgotPassword` : 3 nouvelles clés
- `resetPasswordPage` : 6 nouvelles clés
- `person` : 11 nouvelles clés
- `mergeTrees` : 11 nouvelles clés
- `errors` : 15 nouvelles clés
- `profile` : 18 nouvelles clés (export, email)

### 2026-02-02 - Audit i18n Complet ✅

**Pages fonctionnelles entièrement traduites (6 langues : fr, en, es, de, it, pt) :**
- ✅ `tree.tsx` : Boutons, états vides, alertes, guide d'utilisation, événements familiaux
- ✅ `members.tsx` : Titre, recherche, messages vides
- ✅ `add-person.tsx` : Formulaire complet (prénom, nom, genre, dates, lieu)
- ✅ `add-link.tsx` : Types de relation (Parent/Enfant/Époux/Frère)
- ✅ `share.tsx` : Onglets, modal d'invitation, rôles, statuts
- ✅ `profile.tsx` : Déjà traduit (session précédente)
- ✅ `chat.tsx` : Déjà traduit (session précédente)
- ✅ `index.tsx` : Page d'accueil (messages partage)
- ✅ `about.tsx` : Mission, fonctionnalités, contact
- ✅ `AdBanner.tsx` : "Espace publicitaire", "Premium"
- ✅ Navigation tabs (barre du bas)

**Sections de traduction ajoutées :**
- `tree` (guide complet + événements)
- `members`, `addPerson`, `addLink`
- `share`, `events`, `about`, `faq`
- `common` (boutons génériques)

### 2026-01-28 - Full Internationalization (i18n) Implementation (P0) ✅
- ✅ Ajouté `useTranslation` hook à **38 pages** de l'application
- ✅ Traduit community.tsx : formulaires, messages, catégories
- ✅ Traduit login.tsx et register.tsx : authentification complète
- ✅ Traduit profile.tsx : niveaux, badges, actions rapides
- ✅ Traduit challenges.tsx : catégories, badges, états complétés
- ✅ Traduit tabs/_layout.tsx : labels des onglets
- ✅ Traduit pricing, faq, about, et autres pages de contenu
- ✅ Toutes les pages utilisent maintenant les fichiers de traduction

### 2026-01-27 - Homepage Layout Fix (P0)
- ✅ Réduit la taille des composants `DailyChallengeBanner` et `SocialProofBanner`
- ✅ Déplacé les banners de gamification après la section "Découvrir AÏLA"
- ✅ Réorganisé les chips (Défis, Blog, Communauté, Pourquoi AÏLA en priorité)
- ✅ Ajouté une section secondaire pour les liens SEO (Ancêtres, Débutant, Traditions, Cousinade)

### Previous Session
- ✅ Internationalization (i18n) - 6 langues (fr, en, es, pt, de, it)
- ✅ Gamification system (challenges, badges, points)
- ✅ DailyChallengeBanner & SocialProofBanner components
- ✅ Challenges page (`challenges.tsx`)
- ✅ Profile page (`profile.tsx`)
- ✅ Confetti & success toast animations
- ✅ Sound effects (optional)
- ✅ Blog challenge CTAs
- ✅ Language selector component

---

## Pending Issues

### P1 - Backend Persistence Missing
- Community posts use AsyncStorage (not persisted to backend)
- Challenge progress uses AsyncStorage
- Blog comments use AsyncStorage
- **Action needed**: Connect to `https://aila-backend-hc1m.onrender.com` API

### P2 - Blog Admin Incomplete
- Admin page can list articles but cannot manage via backend
- **Action needed**: Connect adminblog.tsx to backend API endpoints

---

## Upcoming Tasks

### P1
- Implement immediate interaction on homepage (enter name to start tree without registration)
- Implement "pression sociale positive" feature (invite family members)

### P2
- Implement "Mode calme" option (reduce animations, disable sounds)

### Future
- Develop "Cousinade" mode as central convergence point
- Address strategic questions about user engagement

---

## Technical Notes

### Local Development
- `/app/frontend/` = React CRA project (runs via supervisor on localhost:3000)
- `/app/temp_aila/frontend/` = Expo project (deployed to Vercel)
- Changes to AÏLA must be made in `/app/temp_aila/frontend/`

### Credentials
- **Blog Admin**: `/adminblog`, password: `aila2025blog`, recovery: `AILA_RESET_2025`

---

## Key Files
- `/app/temp_aila/frontend/app/index.tsx` - Main homepage
- `/app/temp_aila/frontend/app/challenges.tsx` - Gamification page
- `/app/temp_aila/frontend/app/profile.tsx` - User profile
- `/app/temp_aila/frontend/src/components/DailyChallengeBanner.tsx`
- `/app/temp_aila/frontend/src/components/SocialProofBanner.tsx`
- `/app/temp_aila/frontend/src/i18n/` - Translation files
