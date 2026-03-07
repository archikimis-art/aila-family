# Configuration Stripe et AdMob (AÏLA)

## 1. Stripe (paiement Premium)

### 1.1 Variables d’environnement (backend)

À définir sur l’hébergeur du backend (ex. Render) ou dans un fichier `.env` local (voir `backend/.env.example`) :

| Variable | Description | Où la trouver |
|----------|-------------|----------------|
| `STRIPE_SECRET_KEY` | Clé secrète API Stripe | [Dashboard Stripe → Clés API](https://dashboard.stripe.com/apikeys) (clé secrète, ex. `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook | Après création du webhook (voir ci‑dessous) |
| `STRIPE_PRICE_MONTHLY` | ID du prix abonnement mensuel | Stripe Dashboard → Produits → créer produit → prix récurrent mensuel (ex. 2,99 €) → copier l’ID `price_xxx` |
| `STRIPE_PRICE_YEARLY` | ID du prix abonnement annuel | Idem, prix récurrent annuel (ex. 24,99 €) → `price_xxx` |

Sans `STRIPE_SECRET_KEY`, l’API renvoie 501 « Paiement non configuré ». Sans les prix, les plans `monthly` / `yearly` renvoient 400.

### 1.2 Créer les produits et prix dans Stripe

1. [Stripe Dashboard → Produits](https://dashboard.stripe.com/products)
2. Créer un produit « AÏLA Premium » (ou deux produits distincts).
3. Ajouter un **prix** mensuel (2,99 € / mois) et noter l’ID (`price_xxx`).
4. Ajouter un **prix** annuel (24,99 € / an) et noter l’ID (`price_xxx`).
5. Mettre ces IDs dans `STRIPE_PRICE_MONTHLY` et `STRIPE_PRICE_YEARLY`.

### 1.3 Webhook Stripe

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) → « Ajouter un endpoint ».
2. **URL** : `https://VOTRE-BACKEND.onrender.com/api/stripe/webhook` (remplacer par l’URL réelle de l’API).
3. Événements à écouter : **`checkout.session.completed`**.
4. Après création, révéler le **Signing secret** (`whsec_...`) et le mettre dans `STRIPE_WEBHOOK_SECRET`.

Le backend met à jour l’utilisateur (`is_premium`, `plan`, `stripe_customer_id`) à la réception de cet événement.

### 1.4 Comportement actuel

- **Plans gérés** : `monthly` et `yearly` uniquement. Les services à la carte (PDF, thèmes) envoient aussi `create-checkout-session` mais ne sont pas mappés côté backend → à étendre plus tard si besoin.
- **Page Pricing** : appelle `POST /api/stripe/create-checkout-session` avec `plan`, `success_url`, `cancel_url`, puis redirige vers `checkout_url` (web et app via `Linking.openURL`).

---

## 2. AdMob (publicités app)

### 2.0 AdSense (web – bannière)

Sur le **site web** (aila.family), la bannière en bas des pages utilise maintenant un **bloc AdSense réel** (script + `<ins>`). Par défaut le slot utilisé est **`auto`** (annonces automatiques). Pour utiliser une unité d’annonce précise : créer une unité « Display » dans [AdSense](https://www.google.com/adsense), récupérer l’ID du slot, puis définir la variable d’environnement **`EXPO_PUBLIC_ADSENSE_SLOT_BANNER`** (voir `frontend/.env.example`). Sans variable, le comportement reste « auto ».

### 2.1 Où sont les IDs AdMob (frontend)

- **Fichier** : `frontend/src/context/AdsContext.tsx`
- **Bannière** : `BANNER_AD_UNIT_ID` — déjà en IDs de **production** (AÏLA).
- **Interstitielle** : `INTERSTITIAL_AD_UNIT_ID` — actuellement en IDs de **test** Google (`ca-app-pub-3940256099942544/...`).

### 2.2 Passer les interstitielles en production

1. [AdMob](https://admob.google.com) → votre app → Unités de publicité → Créer une unité **Interstitielle** (par plateforme si besoin).
2. Récupérer les IDs (format `ca-app-pub-XXXXX/YYYYY`).
3. Définir les variables d’environnement (au build ou dans `.env` à la racine du frontend) :
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS`
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID`  
   Voir `frontend/.env.example`. Avec EAS Build : EAS → projet → Secrets, ou dans le fichier `eas.json` (env pour les builds).  
   Si ces variables ne sont pas définies, le code utilise les **IDs de test** Google (aucun revenu).

Les bannières utilisent déjà les IDs production ; seul l’interstitiel est configurable via env pour basculer en production sans toucher au code.

### 2.3 Comportement actuel

- **Modal Premium** : après 5 changements d’onglet/page, les utilisateurs non premium voient une modale « Offre limitée » (sans pub AdMob) qui pointe vers `/pricing`.
- **Interstitielles AdMob** (natif) : la logique `shouldShowInterstitial` / `onPageChange` existe ; si vous branchez l’appel à `showInterstitialAd` côté natif (ex. module Expo/AdMob), utiliser les mêmes IDs que dans `AdsContext` après les avoir passés en production.

---

## 3. Résumé

| Élément | Statut | Action |
|--------|--------|--------|
| Stripe checkout | Implémenté | Renseigner les 4 variables d’env + créer produits/prix + webhook |
| Stripe webhook | Implémenté | Ajouter l’URL dans le Dashboard Stripe |
| Page Pricing → Stripe | OK (web + app) | Aucune |
| AdMob bannière | IDs production | Aucune (ou activer l’affichage si encore placeholder) |
| AdMob interstitielle | IDs test par défaut | Créer unités dans AdMob, définir `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS` et `_ANDROID` (voir `frontend/.env.example`) |

Document projet AÏLA – aila.family.
