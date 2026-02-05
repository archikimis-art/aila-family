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

### 🟡 Pages SEO Restantes
- traditions-familiales.tsx (à traduire - 500 lignes)
- traditions-familiales-creer.tsx (à traduire)

## Issues Connues
1. **Backend persistence** (P1): Données stockées localement via AsyncStorage
2. **Language selector flags** (P2): Drapeaux non affichés
3. **Blog admin** (P2): Fonctionnalité incomplète

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| main | e51047b5f | Production avec pages SEO traduites |
| aila-stable | 2a28b01de | Backup précédent |
| i18n/seo-pages-complete | e51047b5f | Identique à main |

## Règles de Développement
1. Utiliser `Pressable` au lieu de `TouchableOpacity` pour compatibilité web
2. Tester sur Vercel preview avant merge vers main
3. Une page/feature par branche pour éviter régressions
