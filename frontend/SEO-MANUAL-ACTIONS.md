# 📋 GUIDE SEO - Actions Manuelles

## 1️⃣ Soumettre le Sitemap à Google Search Console

### Prérequis
- Avoir accès à Google Search Console pour `aila.family`
- La propriété doit être vérifiée (déjà fait via `google672554d9d4721846.html`)

### Étapes

1. **Aller sur Google Search Console**
   - URL : https://search.google.com/search-console
   - Connectez-vous avec votre compte Google

2. **Sélectionner la propriété**
   - Cliquez sur `www.aila.family` dans la liste des propriétés

3. **Accéder aux Sitemaps**
   - Menu gauche → **"Sitemaps"** (sous "Indexation")

4. **Soumettre le sitemap**
   - Dans le champ "Ajouter un sitemap"
   - Entrez : `sitemap.xml`
   - Cliquez sur **"Envoyer"**

5. **Vérifier le statut**
   - Attendez quelques minutes
   - Le statut devrait passer à "Réussi"
   - Vérifiez le nombre d'URLs découvertes (devrait être ~17)

### URLs du Sitemap
```
https://www.aila.family/sitemap.xml
https://www.aila.family/sitemap-pages.xml
```

---

## 2️⃣ Tester avec PageSpeed Insights

### URL de test
```
https://pagespeed.web.dev/
```

### Pages à tester (priorité)

1. **Page d'accueil** (CRITIQUE)
   ```
   https://www.aila.family/
   ```

2. **Pages SEO principales**
   ```
   https://www.aila.family/arbre-genealogique-gratuit
   https://www.aila.family/retrouver-ancetres-gratuitement
   https://www.aila.family/genealogie-debutant-guide
   ```

3. **Pages de conversion**
   ```
   https://www.aila.family/login
   https://www.aila.family/register
   ```

### Métriques à surveiller

| Métrique | Cible | Description |
|----------|-------|-------------|
| **Performance** | > 90 | Score global (vert) |
| **LCP** | < 2.5s | Temps d'affichage du plus grand élément |
| **FID** | < 100ms | Délai d'interactivité |
| **CLS** | < 0.1 | Stabilité visuelle |
| **TTFB** | < 800ms | Temps de réponse serveur |

### Actions correctives courantes

**Si LCP > 2.5s :**
- Optimiser les images (WebP)
- Précharger les fonts
- Réduire le JavaScript

**Si CLS > 0.1 :**
- Définir les dimensions des images
- Éviter les éléments qui se déplacent

**Si TTFB > 800ms :**
- Problème de cold start Render
- Envisager upgrade vers Render Pro

---

## 3️⃣ Tester l'Indexation Google

### Rich Results Test
```
https://search.google.com/test/rich-results
```
- Entrez : `https://www.aila.family/`
- Vérifiez que les schemas JSON-LD sont détectés :
  - ✓ WebSite
  - ✓ SoftwareApplication
  - ✓ Organization
  - ✓ FAQPage

### Mobile-Friendly Test
```
https://search.google.com/test/mobile-friendly
```
- Entrez : `https://www.aila.family/`
- Devrait afficher "Page adaptée aux mobiles"

### URL Inspection (Search Console)
- Dans Search Console → "Inspection de l'URL"
- Entrez une URL à vérifier
- Cliquez "Demander une indexation" si nécessaire

---

## 4️⃣ Vérifier l'Image OG

### Facebook Sharing Debugger
```
https://developers.facebook.com/tools/debug/
```
- Entrez : `https://www.aila.family/`
- Vérifiez que l'image og-image.svg s'affiche
- Cliquez "Scrape Again" pour rafraîchir le cache

### Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```
- Entrez : `https://www.aila.family/`
- Vérifiez l'aperçu de la carte Twitter

### LinkedIn Post Inspector
```
https://www.linkedin.com/post-inspector/
```
- Entrez : `https://www.aila.family/`
- Vérifiez l'aperçu du partage

---

## 5️⃣ Checklist de Validation

### Après déploiement, vérifier :

- [ ] Sitemap soumis dans Search Console
- [ ] PageSpeed score > 80 sur mobile
- [ ] Rich Results détectés
- [ ] Image OG visible sur les réseaux sociaux
- [ ] Toutes les pages SEO accessibles (pas de 404)

### URLs à tester manuellement :

```bash
# Vérifier que les pages répondent
curl -I https://www.aila.family/
curl -I https://www.aila.family/sitemap.xml
curl -I https://www.aila.family/og-image.svg
curl -I https://www.aila.family/retrouver-ancetres-gratuitement
curl -I https://www.aila.family/genealogie-debutant-guide
curl -I https://www.aila.family/traditions-familiales
curl -I https://www.aila.family/preserver-histoire-famille
curl -I https://www.aila.family/organiser-cousinade
curl -I https://www.aila.family/ecrire-histoire-famille
```

---

## 📊 Rapport de Monitoring Hebdomadaire

### KPIs à suivre chaque semaine :

| Métrique | Source | Objectif |
|----------|--------|----------|
| Pages indexées | Search Console | Croissance |
| Impressions | Search Console | +10%/semaine |
| Clics | Search Console | +10%/semaine |
| Position moyenne | Search Console | < 20 |
| Performance mobile | PageSpeed | > 80 |

---

*Document créé le 12 janvier 2025*
*À mettre à jour après chaque déploiement majeur*
