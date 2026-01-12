# 🔍 CHECKLIST SEO TECHNIQUE - AILA.FAMILY
## Application SPA/PWA - Audit & Optimisation

*Dernière mise à jour : Janvier 2025*
*Expert SEO : Analyse complète pour améliorer indexation, performance et visibilité*

---

## 📊 RÉSUMÉ EXÉCUTIF

| Catégorie | État Actuel | Priorité |
|-----------|-------------|----------|
| Indexation Google | ⚠️ Partiel | CRITIQUE |
| Temps de chargement | ⚠️ À optimiser | CRITIQUE |
| SEO Mobile | ✅ Bon | IMPORTANT |
| Rendu côté serveur | ❌ Absent (SPA) | CRITIQUE |
| Données structurées | ✅ Complet | OK |
| Maillage interne | ✅ Amélioré | OK |

---

## 🚨 CRITIQUE (À faire immédiatement)

### 1. PRÉ-RENDU / SSR (Server-Side Rendering)

**Problème actuel :**
- AILA est une SPA (Single Page Application) avec Expo Web
- Google voit une page vide au premier rendu avant l'exécution du JavaScript
- Les meta tags sont injectés dynamiquement (non visibles au crawl initial)

**Solutions recommandées :**

| Solution | Complexité | Impact SEO | Recommandation |
|----------|------------|------------|----------------|
| **Prerender.io** | Faible | ⭐⭐⭐⭐ | ✅ RECOMMANDÉ |
| **Next.js Migration** | Haute | ⭐⭐⭐⭐⭐ | Long terme |
| **Static Export Expo** | Moyenne | ⭐⭐⭐ | Alternative |

**Action immédiate :**
```bash
# Ajouter Prerender.io via Vercel
# vercel.json - ajouter middleware de prerendering
```

**Fichier à créer : `vercel.json` middleware**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": "(googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator)"
        }
      ],
      "destination": "https://service.prerender.io/https://www.aila.family/$1"
    }
  ]
}
```

---

### 2. META TAGS STATIQUES DANS HTML

**Problème actuel :**
- Les meta tags sont injectés via JavaScript (`_layout.tsx`)
- Google peut ne pas les voir au premier crawl

**Solution : Créer un fichier `index.html` statique**

**Fichier à créer/modifier : `/app/frontend/public/index.html`**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- META SEO CRITIQUES - STATIQUES -->
  <title>AILA Famille - Arbre Généalogique Gratuit | Application Généalogie</title>
  <meta name="description" content="AILA Famille : créez votre arbre généalogique gratuitement. Application famille pour visualiser et partager votre histoire familiale. Rejoignez la communauté AILA !">
  <meta name="keywords" content="AILA famille, arbre généalogique gratuit, application généalogie, arbre familial, généalogie en ligne">
  
  <!-- ROBOTS -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="googlebot" content="index, follow">
  
  <!-- CANONICAL -->
  <link rel="canonical" href="https://www.aila.family/">
  
  <!-- OPEN GRAPH -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.aila.family/">
  <meta property="og:title" content="AILA Famille - Arbre Généalogique Gratuit">
  <meta property="og:description" content="Créez et partagez votre arbre généalogique gratuitement.">
  <meta property="og:image" content="https://www.aila.family/og-image.jpg">
  <meta property="og:locale" content="fr_FR">
  
  <!-- TWITTER -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AILA Famille - Arbre Généalogique">
  <meta name="twitter:description" content="Créez votre arbre généalogique gratuitement.">
  <meta name="twitter:image" content="https://www.aila.family/og-image.jpg">
  
  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#D4AF37">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  
  <!-- PRECONNECT pour performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="dns-prefetch" href="https://aila-backend-hc1m.onrender.com">
  
  <!-- STRUCTURED DATA - JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AILA Famille",
    "url": "https://www.aila.family",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  }
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---

### 3. IMAGE OG (Open Graph) OPTIMISÉE

**Problème actuel :**
- `og:image` pointe vers un SVG (`/icons/icon.svg`)
- Les réseaux sociaux ne supportent pas bien les SVG

**Action :**
- [ ] Créer une image `/public/og-image.jpg` (1200x630px)
- [ ] Format : JPG ou PNG
- [ ] Taille max : 300 KB
- [ ] Contenu : Logo AILA + Texte accrocheur + Aperçu de l'arbre

---

### 4. CORE WEB VITALS (Performance)

**Métriques cibles Google :**

| Métrique | Cible | Impact |
|----------|-------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Critique |
| **FID** (First Input Delay) | < 100ms | Important |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Important |
| **TTFB** (Time to First Byte) | < 800ms | Critique |

**Actions d'optimisation :**

```typescript
// 1. Lazy loading des images
import { Image } from 'expo-image';
<Image 
  source={uri} 
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>

// 2. Code splitting des routes
// Déjà fait via expo-router ✅

// 3. Preload des fonts critiques
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

**Fichiers à optimiser :**
- [ ] Compresser toutes les images (WebP recommandé)
- [ ] Activer Gzip/Brotli sur Vercel (automatique)
- [ ] Minifier CSS/JS (automatique avec Metro)

---

## ⚠️ IMPORTANT (À faire cette semaine)

### 5. FICHIER SITEMAP DYNAMIQUE

**État actuel :** ✅ Bon (`/public/sitemap.xml`)

**Améliorations :**
- [ ] Ajouter `<lastmod>` dynamique basé sur les vraies dates de modification
- [ ] Créer un sitemap images séparé (`sitemap-images.xml`)
- [ ] Soumettre à Google Search Console ⬅️ **EN ATTENTE**

---

### 6. FICHIER ROBOTS.TXT

**État actuel :** ✅ Excellent (déjà optimisé)

**Vérification :**
- [x] Autorisation IA (GPTBot, Claude, etc.)
- [x] Sitemap référencé
- [x] Pages sensibles bloquées (/api/, /person/)

---

### 7. DONNÉES STRUCTURÉES (Schema.org)

**État actuel :** ✅ Complet

**Schemas présents :**
- [x] WebSite
- [x] SoftwareApplication
- [x] Organization
- [x] FAQPage
- [x] BreadcrumbList

**Amélioration suggérée :**
- [ ] Ajouter `HowTo` schema sur les pages guides
- [ ] Ajouter `Article` schema sur les pages blog/SEO

**Exemple pour page guide :**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment créer son arbre généalogique",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Créer un compte",
      "text": "Inscrivez-vous gratuitement sur AILA"
    }
  ]
}
```

---

### 8. SEO MOBILE

**État actuel :** ✅ Bon

**Vérifications :**
- [x] Viewport responsive (`meta viewport`)
- [x] Touch targets > 44px
- [x] Police lisible (16px min)
- [x] Pas de contenu horizontal scrollable

**Test recommandé :**
- [ ] Tester avec Google Mobile-Friendly Test
- [ ] Vérifier dans Search Console > Expérience mobile

---

### 9. HTTPS & SÉCURITÉ

**État actuel :** ✅ OK

- [x] HTTPS activé (Vercel)
- [x] Certificat SSL valide
- [x] Redirection HTTP → HTTPS

---

### 10. VITESSE BACKEND (TTFB)

**Problème identifié :**
- Backend sur Render Free Tier = Cold starts de 30-50s
- Impact négatif sur Core Web Vitals

**Solutions :**

| Solution | Coût | Impact |
|----------|------|--------|
| Upgrade Render Pro | $7/mois | ⭐⭐⭐⭐⭐ |
| Wake-up ping CRON | Gratuit | ⭐⭐⭐ |
| Edge caching | Variable | ⭐⭐⭐⭐ |

---

## 📝 OPTIONNEL (Nice to have)

### 11. INTERNATIONALISATION (i18n)

**État actuel :** Français uniquement

**Pour expansion future :**
- [ ] Ajouter hreflang pour EN, ES, DE
- [ ] Créer sous-domaines ou sous-dossiers (`/en/`, `/es/`)

```html
<link rel="alternate" hreflang="fr" href="https://www.aila.family/">
<link rel="alternate" hreflang="en" href="https://www.aila.family/en/">
<link rel="alternate" hreflang="x-default" href="https://www.aila.family/">
```

---

### 12. AMP (Accelerated Mobile Pages)

**Recommandation :** Non prioritaire pour une webapp
- AMP utile surtout pour les articles de blog statiques
- Peut être envisagé pour les pages SEO long-format

---

### 13. RICH SNIPPETS ADDITIONNELS

**Opportunités :**
- [ ] `Review` stars pour témoignages utilisateurs
- [ ] `Event` pour cousainades organisées
- [ ] `Person` pour membres de l'arbre (si public)

---

### 14. LIENS EXTERNES (Backlinks)

**Stratégie recommandée :**
- [ ] Soumettre aux annuaires généalogie
- [ ] Guest posts sur blogs famille/généalogie
- [ ] Partenariats avec associations généalogiques

---

## 📋 PLAN D'ACTION PRIORITAIRE

### Semaine 1 (CRITIQUE)
1. ⬜ Créer image OG optimisée (1200x630 JPG)
2. ⬜ Implémenter prerendering (Prerender.io ou Rendertron)
3. ⬜ Soumettre sitemap à Google Search Console

### Semaine 2 (IMPORTANT)
4. ⬜ Créer fichier index.html statique avec meta tags
5. ⬜ Optimiser images (conversion WebP)
6. ⬜ Ajouter schema HowTo sur pages guides

### Semaine 3 (OPTIMISATION)
7. ⬜ Test Mobile-Friendly Google
8. ⬜ Test PageSpeed Insights
9. ⬜ Corriger erreurs Core Web Vitals

### Mois 2+ (CROISSANCE)
10. ⬜ Créer contenu SEO additionnel (10 articles)
11. ⬜ Stratégie backlinks
12. ⬜ Monitoring Search Console régulier

---

## 🔧 OUTILS DE VÉRIFICATION

| Outil | URL | Usage |
|-------|-----|-------|
| Google Search Console | search.google.com/search-console | Indexation |
| PageSpeed Insights | pagespeed.web.dev | Performance |
| Mobile-Friendly Test | search.google.com/test/mobile-friendly | Mobile |
| Rich Results Test | search.google.com/test/rich-results | Schemas |
| GTmetrix | gtmetrix.com | Performance détaillée |
| Screaming Frog | screamingfrog.co.uk | Audit crawl |

---

## 📈 KPIs À SUIVRE

| Métrique | Outil | Fréquence |
|----------|-------|-----------|
| Pages indexées | Search Console | Hebdo |
| Impressions/Clics | Search Console | Quotidien |
| Position moyenne | Search Console | Hebdo |
| Core Web Vitals | PageSpeed | Mensuel |
| Trafic organique | Google Analytics | Quotidien |

---

*Document généré pour AILA.family - Application Expo/React Native*
*Audit réalisé le 12 janvier 2025*
