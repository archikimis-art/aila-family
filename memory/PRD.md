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
