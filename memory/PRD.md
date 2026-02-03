# AÏLA - Application Généalogique

## Description
Application React Native Expo déployée en web sur Vercel pour créer et gérer des arbres généalogiques familiaux.

## Stack Technique
- **Frontend**: React Native Expo (web export)
- **Backend**: Render (https://aila-backend-hc1m.onrender.com)
- **Hébergement**: Vercel
- **i18n**: i18next (6 langues: FR, EN, ES, DE, IT, PT)

## État actuel - Janvier 2025

### ✅ Fonctionnalités i18n Complétées
- Homepage (footer, share, PWA prompts)
- DailyChallengeBanner + SocialProofBanner
- Challenges, Pourquoi AÏLA, About
- FAQ, Privacy, Terms
- **Blog** (5 articles complets traduits)
- **Community** (interface complète traduite)
- **Genealogie-debutant-guide** (page SEO traduite)

### 🟡 Pages SEO - Compatibilité Web OK, Traduction Partielle
- retrouver-ancetres-gratuitement.tsx (Pressable OK, texte FR)
- traditions-familiales.tsx (Pressable OK, texte FR)
- organiser-cousinade.tsx (Pressable OK, texte FR)

### ⏳ Backlog i18n (Prochaine session)
- Traduire retrouver-ancetres-gratuitement.tsx
- Traduire traditions-familiales.tsx
- Traduire organiser-cousinade.tsx
- Traduire traditions-familiales-creer.tsx
- Auditer et traduire pages admin

## Issues Connues
1. **Backend persistence** (P1): Données stockées localement via AsyncStorage
2. **Language selector flags** (P2): Drapeaux non affichés
3. **Blog admin** (P2): Fonctionnalité incomplète (dépend du backend)

## Tâches Futures
- Implémenter backend persistence (remplacer AsyncStorage)
- Feature "pression sociale positive" (inviter famille)
- Mode calme
- Mode Cousinade complet
- Publication Google Play Store

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| main | 2a28b01de | Production stable avec i18n |
| aila-stable | 2a28b01de | Backup identique à main |

## Règles de Développement
1. Utiliser `Pressable` au lieu de `TouchableOpacity` pour compatibilité web
2. Tester sur Vercel preview avant merge vers main
3. Une page/feature par branche pour éviter régressions
