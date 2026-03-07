# Diagnostic « Pas de réponse du serveur » (paiement / backend)

## Cause identifiée

Le frontend (site sur Vercel : www.aila.family) appelait **directement** le backend Render (`https://aila-backend-hc1m.onrender.com`) depuis le **navigateur**. Cela provoquait :

1. **CORS** : le navigateur envoie une requête cross-origin ; si la réponse met trop de temps ou si l’origine n’est pas autorisée, l’erreur peut apparaître comme « pas de réponse ».
2. **Cold start Render** : au réveil du service (plan gratuit), la première requête peut dépasser le timeout du navigateur (même à 90 s).
3. **Timeout côté client** : les timeouts (axios) s’appliquent dans le navigateur ; un backend lent donne « pas de réponse ».

## Correction appliquée

En **production web** (domaine autre que localhost), le frontend n’appelle plus l’URL Render en direct. Il utilise des **URL relatives** `/api/...` :

- Requête du navigateur : `GET https://www.aila.family/api/health` (même origine que le site).
- **Vercel** (vercel.json) fait un **rewrite** : `/api/:path*` → `https://aila-backend-hc1m.onrender.com/api/:path*`.
- C’est donc le **serveur Vercel** qui appelle Render, pas le navigateur.

Effets :

- **Plus de CORS** : le navigateur ne parle qu’à www.aila.family.
- **Meilleure résilience au cold start** : le serveur Vercel peut attendre plus longtemps que le navigateur.
- L’indicateur « Connexion serveur » sur la page Tarifs et le paiement Stripe devraient fonctionner après déploiement.

## Fichiers modifiés

- `frontend/src/services/api.ts` : en production web, `getApiUrl()` retourne `''` pour forcer `baseURL: '/api'`.
- `frontend/app/pricing.tsx` : lien « Tester dans un nouvel onglet » en URL absolue quand l’URL de health est relative.

## Vérifications manuelles

1. **Backend accessible** : ouvrir  
   `https://aila-backend-hc1m.onrender.com/api/health`  
   → doit retourner du JSON `{"status":"healthy",...}`.

2. **Proxy Vercel** : après déploiement, ouvrir  
   `https://www.aila.family/api/health`  
   → même réponse (proxée par Vercel vers Render).

3. **Page Tarifs** : sur https://www.aila.family/pricing, l’indicateur doit afficher « Connexion serveur : OK » après quelques secondes, et le bouton « S’abonner » doit rediriger vers Stripe Checkout.

## Si le problème persiste

- Vérifier dans Vercel que le rewrite `/api/:path*` est bien actif (Dashboard → projet → Settings → Rewrites).
- Vérifier sur Render que le service est déployé et que les variables Stripe sont définies (voir `docs/CONFIG_STRIPE_ET_ADMOB.md`).
