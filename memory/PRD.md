# AÏLA - Application Généalogique

## Description
Application React Native Expo déployée en web sur Vercel pour créer et gérer des arbres généalogiques familiaux.

## Stack Technique
- **Frontend**: React Native Expo (web export)
- **Backend**: Render (https://aila-backend-hc1m.onrender.com)
- **Hébergement**: Vercel
- **i18n**: i18next (6 langues: FR, EN, ES, DE, IT, PT)

## État actuel - Février 2025

### ✅ Fonctionnalités i18n Complétées
- Homepage (footer, share, PWA prompts)
- DailyChallengeBanner + SocialProofBanner
- Challenges, Pourquoi AÏLA, About
- FAQ, Privacy, Terms
- **Blog** (5 articles complets traduits)
- **Community** (interface complète traduite)
- **Pages SEO** : genealogie-debutant-guide, retrouver-ancetres-gratuitement, organiser-cousinade, traditions-familiales
- **✅ pricing.tsx** (Page Premium - 5 Février 2025)
- **✅ login.tsx** (Page connexion - 5 Février 2025)
- **✅ register.tsx** (Page inscription - 5 Février 2025)
- **✅ forgot-password.tsx** (Page mot de passe oublié - 5 Février 2025)

### 🟡 Pages restantes à traduire
- (tabs)/*.tsx (tree, members, chat, profile, share)
- profile.tsx (page profil principale)
- add-person.tsx, add-link.tsx
- Autres pages SEO non traduites

## Issues Connues
1. **Google Auth** : Fonctionne uniquement sur www.aila.family (les URLs preview Vercel ne marchent pas)
2. **Backend persistence** (P1): Données stockées via AsyncStorage
3. **Community messages cache** (P2): Messages démo ne se rafraîchissent pas au changement de langue
4. **Language selector flags** (P3): Drapeaux non affichés

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| i18n/seo-pages-complete | 251d9fe74 | Auth pages traduites |
| main | 64faa757a | Production stable |

## Règles de Développement
1. Utiliser `Pressable` au lieu de `TouchableOpacity` pour compatibilité web
2. Tester sur Vercel preview avant merge vers main

## Prochaines Tâches
1. Traduire les onglets (tabs)
2. Merger vers main après validation utilisateur
