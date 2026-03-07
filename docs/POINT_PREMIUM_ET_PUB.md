# Point : Mode Premium et publicités

## 1. État actuel du Premium

### 1.1 Côté interface (frontend)
- **Page Tarifs** (`/pricing`) : en place avec abonnements (mensuel 2,99 €, annuel 24,99 €) et services à la carte (PDF 0,99 €, thèmes 1,99 €).
- **PremiumPrompt** : modales (bienvenue, export PDF, taille arbre, offre limitée) qui redirigent vers `/pricing`.
- **AdsContext** : appelle `GET /stripe/subscription-status` pour savoir si l’utilisateur est premium et masquer les pubs.
- **Bouton Premium** : présent (ex. bandeau pub, profil) et renvoie vers la page tarifs.

### 1.2 Côté backend (payement / statut)
- **GET `/stripe/subscription-status`** : **implémenté**. Lit le document utilisateur en base et renvoie `is_premium`, `subscription_status`, `plan` (et `stripe_customer_id` si présent).
- **POST `/stripe/create-checkout-session`** : **implémenté**. Body : `plan` (`monthly` | `yearly`), `success_url`, `cancel_url`. Crée une session Stripe et renvoie `checkout_url`. Nécessite les variables d’env Stripe (voir [CONFIG_STRIPE_ET_ADMOB.md](./CONFIG_STRIPE_ET_ADMOB.md)).
- **POST `/stripe/webhook`** : **implémenté**. Sur `checkout.session.completed`, met à jour l’utilisateur (`is_premium`, `plan`, `stripe_customer_id`). Nécessite `STRIPE_WEBHOOK_SECRET` et configuration de l’URL dans le Dashboard Stripe.

**Conclusion** : les prestations Premium sont **définies**, le **paiement et le statut premium sont actifs** dès que Stripe est configuré (clés, prix, webhook). Voir [CONFIG_STRIPE_ET_ADMOB.md](./CONFIG_STRIPE_ET_ADMOB.md) pour la configuration.

---

## 2. Efficience des prestations proposées

| Prestation | Intérêt utilisateur | Potentiel conversion |
|------------|---------------------|------------------------|
| **Sans pub** | Fort (confort) | Élevé si la pub est visible / un peu intrusive |
| **Arbre illimité** | Moyen (limite actuelle à 10 en aperçu) | Correct pour utilisateurs actifs |
| **Collaborateurs illimités** | Moyen | Familles nombreuses / partage |
| **Export avancé (JSON, PDF)** | Fort pour archivage | Bon si export gratuit très limité |
| **Événements familiaux** | Bon (UX) | Complémentaire |
| **Support prioritaire** | Faible volume | Peu impactant au début |
| **Thèmes / services à la carte** | Bon pour personnalisation | Bon pour revenus additionnels |

Recommandation : garder l’offre actuelle, en mettant en avant **sans pub**, **arbre illimité** et **export** comme piliers. Les popups / interstitials (voir ci‑dessous) renforceront la valeur perçue du « sans pub ».

---

## 3. Publicités actuelles et revenus

### 3.1 Web (AdSense)
- **Bandeau** « Espace publicitaire » : **placeholder** (pas encore de bloc AdSense actif). Aucun revenu tant qu’AdSense n’est pas approuvé et les blocs intégrés.
- Un seul emplacement par page (bandeau bas) → revenus limités même après activation.

### 3.2 App native (AdMob)
- **Bannière** : IDs de production configurés (Android / iOS), mais dans l’app le bandeau affiché est un **placeholder** (« Espace publicitaire » + bouton Premium), pas une vraie bannière AdMob.
- **Interstitials** : 
  - Logique prévue (ex. `shouldShowInterstitial` tous les 5 actions, `onPageChange` dans `_layout`).
  - **IDs utilisés = IDs de test Google** (`ca-app-pub-3940256099942544/...`) → **aucun revenu**, et en prod il faudrait vos vrais IDs.
  - **Aucun appel à `showInterstitialAd`** dans le flux actuel : le compteur de pages change, mais aucune pub plein écran n’est affichée.

**Conclusion** : aujourd’hui **les publicités ne génèrent aucun revenu** (placeholders + interstitials non affichés et en test). Pour générer un revenu significatif côté Google (AdSense web + AdMob app) il faut :
1. Activer de vrais blocs AdSense sur le web et les afficher à la place du placeholder.
2. Afficher de vraies bannières AdMob dans l’app.
3. (Optionnel mais fort pour revenus) Afficher des **interstitials** (type « popup » plein écran) à des moments choisis (ex. changement d’onglet), avec **vos IDs de production** AdMob.

---

## 4. Faut-il prévoir des séquences type « popup » entre onglets pour pousser au Premium ?

### 4.1 Intérêt
- **Revenus** : les interstitials (plein écran) ont un CPM bien plus élevé que les bannières ; en les affichant à chaque X changements d’onglet, on peut augmenter le revenu par utilisateur gratuit.
- **Conversion Premium** : une pub plein écran à chaque changement d’onglet peut être perçue comme intrusive → forte incitation à passer Premium pour les supprimer, si l’offre « sans pub » est claire.

### 4.2 Risques
- **UX** : trop fréquent (ex. à chaque changement d’onglet) = mauvaise expérience, désinstallations, mauvais avis.
- **Politiques Google** : abus d’interstitials (trop rapprochés, obligatoires pour continuer) peut aller contre les règles AdMob et le classement Play Store.

### 4.3 Recommandation
- **Oui, prévoir des interstitials**, mais **régulés** :
  - Pas à **chaque** changement d’onglet : par exemple **1 interstitial tous les 3–4 changements d’onglet** (ou toutes les 2–3 minutes d’usage), avec **plafond** (ex. 1 pub / minute max).
  - Utiliser **vos IDs de production** AdMob (créer des unités « Interstitial » dans AdMob et remplacer les IDs de test dans `AdsContext` / module AdMob).
  - Implémenter l’appel à **`showInterstitialAd`** depuis le flux de navigation (ex. dans `_layout` après `onPageChange`, si `shouldShowInterstitial()` est vrai et utilisateur non premium).
- **Message clair** : « Passez en Premium pour naviguer sans interruption » (ou similaire) sur la page Tarifs et éventuellement sur un petit texte sous l’interstitial.

En résumé : **les publicités actuelles ne suffisent pas à générer un revenu significatif** (placeholders + pas d’interstitials en prod). **Prévoir des interstitials limités (ex. tous les 3–4 changements d’onglet)** est pertinent pour **augmenter les revenus** et **inciter au Premium**, à condition de rester raisonnable en fréquence et d’utiliser les bons IDs AdMob.

---

## 5. Actions prioritaires (résumé)

| Priorité | Action |
|----------|--------|
| 1 | **Configurer Stripe** : variables d’env (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`), créer produits/prix, configurer le webhook. Voir [CONFIG_STRIPE_ET_ADMOB.md](./CONFIG_STRIPE_ET_ADMOB.md). |
| 2 | Activer les vrais emplacements pub : AdSense sur le web, bannières AdMob dans l’app (remplacer les placeholders). |
| 3 | Créer des unités Interstitial dans AdMob, remplacer les IDs de test par les IDs de production dans `AdsContext.tsx`. Voir [CONFIG_STRIPE_ET_ADMOB.md](./CONFIG_STRIPE_ET_ADMOB.md). |
| 4 | (Optionnel) Brancher l’affichage des interstitielles AdMob natives sur la navigation (modale Premium déjà en place après 5 changements d’onglet). |

Document généré pour le projet AÏLA – aila.family.
