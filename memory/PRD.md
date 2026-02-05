# AÏLA - Application Généalogique

## Description
Application React Native Expo déployée en web sur Vercel pour créer et gérer des arbres généalogiques familiaux.

## Stack Technique
- **Frontend**: React Native Expo (web export)
- **Backend**: Render (https://aila-backend-hc1m.onrender.com)
- **Hébergement**: Vercel (www.aila.family)
- **i18n**: i18next (6 langues: FR, EN, ES, DE, IT, PT)

## État actuel - 5 Février 2025

### ✅ Pages i18n Complétées
**Pages d'authentification:**
- login.tsx, register.tsx, forgot-password.tsx

**Pages principales:**
- pricing.tsx (Premium)
- Homepage, FAQ, Privacy, Terms, About, Challenges, Pourquoi AÏLA
- Blog (5 articles), Community

**Pages SEO:**
- traditions-familiales, genealogie-debutant-guide, retrouver-ancetres-gratuitement, organiser-cousinade

**Onglets (tabs) - En cours:**
- ✅ members.tsx - Traduit
- 🟡 profile.tsx - Clés ajoutées, mise à jour TSX partielle
- 🔴 tree.tsx, chat.tsx, share.tsx - À traduire

### 🟡 Restant à traduire
- (tabs)/tree.tsx, chat.tsx, share.tsx
- add-person.tsx, add-link.tsx
- Finaliser profile.tsx

## Versions de Référence
| Branche | Commit | Description |
|---------|--------|-------------|
| i18n/seo-pages-complete | b246861c5 | Dernier commit |
| main | 64faa757a | Production stable |

## Google Auth
Fonctionne uniquement sur www.aila.family (les URLs preview Vercel ne fonctionnent pas)

## Prochaines Tâches
1. Finaliser profile.tsx
2. Traduire tree.tsx, chat.tsx, share.tsx
3. Merger vers main après validation
