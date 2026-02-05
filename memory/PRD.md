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
- **✅ traditions-familiales.tsx** (TRADUIT - 5 Février 2025)
  - 6 sections complètes : Pourquoi les traditions, Quotidien, Fêtes, Culinaires, Vacances, Créer ses traditions
  - Toutes les traductions en FR, EN, ES, DE, IT, PT

### 🟡 Pages SEO Restantes
- traditions-familiales-creer.tsx (à traduire)
- Autres éléments d'interface (boutons, textes) à auditer

## Issues Connues
1. **Backend persistence** (P1): Données stockées localement via AsyncStorage
2. **Community messages cache** (P2): Messages démo ne se rafraîchissent pas au changement de langue
3. **Language selector flags** (P3): Drapeaux non affichés
4. **Blog admin** (P3): Fonctionnalité incomplète

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| i18n/seo-pages-complete | 230d31eb9 | Avec traditions-familiales traduit (dernière version) |
| main | 64faa757a | Production stable précédente |
| aila-stable | 2a28b01de | Backup précédent |

## Règles de Développement
1. Utiliser `Pressable` au lieu de `TouchableOpacity` pour compatibilité web
2. Tester sur Vercel preview avant merge vers main
3. Une page/feature par branche pour éviter régressions

## Prochaines Tâches (P0)
1. Valider sur Vercel preview la page traditions-familiales
2. Merger vers main après validation
3. Auditer et traduire les éléments d'interface restants (boutons, textes)
