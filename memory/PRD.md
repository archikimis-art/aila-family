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
- **Genealogie-debutant-guide** (page SEO traduite)
- **Retrouver-ancetres-gratuitement** (page SEO traduite - 7 sections complètes)
- **Organiser-cousinade** (page SEO traduite)
- **traditions-familiales.tsx** (TRADUIT - 5 Février 2025)
- **✅ pricing.tsx** (Page Premium TRADUIT - 5 Février 2025)
  - Plans mensuel/annuel, services personnalisation, FAQ
- **✅ login.tsx** (Page connexion TRADUIT - 5 Février 2025)
  - Formulaire, erreurs, bouton Google, messages

### 🟡 Pages restantes à traduire
- register.tsx (inscription)
- forgot-password.tsx
- (tabs)/*.tsx (tree, members, chat, profile, share)
- profile.tsx (page profil principale)
- add-person.tsx
- autres pages SEO non traduitescd

## Issues Connues
1. **Google Auth origin_mismatch** (P1): L'URL Vercel doit être ajoutée dans Google Cloud Console
2. **Backend persistence** (P1): Données stockées localement via AsyncStorage
3. **Community messages cache** (P2): Messages démo ne se rafraîchissent pas au changement de langue
4. **Language selector flags** (P3): Drapeaux non affichés
5. **Blog admin** (P3): Fonctionnalité incomplète

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| i18n/seo-pages-complete | 38859e1bb | Avec Premium + login traduits |
| main | 64faa757a | Production stable précédente |

## Règles de Développement
1. Utiliser `Pressable` au lieu de `TouchableOpacity` pour compatibilité web
2. Tester sur Vercel preview avant merge vers main
3. Une page/feature par branche pour éviter régressions

## Google Auth Fix
L'erreur "origin_mismatch" nécessite d'ajouter le domaine dans Google Cloud Console:
1. APIs & Services > Credentials > OAuth 2.0 Client IDs
2. Ajouter le domaine de production dans "Authorized JavaScript origins"

## Prochaines Tâches (P0)
1. Traduire register.tsx
2. Traduire les onglets (tabs)
3. Merger vers main après validation
