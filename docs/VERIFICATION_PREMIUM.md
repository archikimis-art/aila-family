# Vérification du parcours Premium (Stripe)

Checklist pour valider que l’abonnement et le statut Premium fonctionnent de bout en bout.

## 1. Avant le test

- [ ] Les 4 variables Stripe sont définies sur Render : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`
- [ ] Le backend a été redéployé après modification des variables
- [ ] Tu es en **mode test** Stripe (ou en live si tu testes en production)

## 2. Test d’abonnement (web)

1. [ ] Va sur **https://www.aila.family** et connecte-toi (ou crée un compte test)
2. [ ] Ouvre la page **Tarifs** (`/pricing`)
3. [ ] Clique sur **« S’abonner »** (mensuel ou annuel)
4. [ ] Tu es redirigé vers **Stripe Checkout** (page de paiement)
5. [ ] Utilise une carte de test Stripe (ex. `4242 4242 4242 4242`, date future, CVC quelconque)
6. [ ] Valide le paiement
7. [ ] Tu es renvoyé sur aila.family (ex. Profil avec `?payment=success`)

## 3. Vérification du statut Premium

- [ ] Sur la page **Tarifs**, le statut affiche **« Vous êtes Premium »** (ou équivalent)
- [ ] Le **bandeau publicitaire** en bas des pages **ne s’affiche plus**
- [ ] La **modale « Offre limitée »** (après 5 changements d’onglet) **ne s’affiche plus**

## 4. Webhook Stripe

- [ ] Dans **Stripe Dashboard** → **Développeurs** → **Webhooks** → ouvre ton endpoint
- [ ] Vérifie que les événements **`checkout.session.completed`** sont envoyés et reçoivent un **statut 200** (pas d’erreur)

## 5. En cas de problème

- **Erreur « Paiement non configuré »** : `STRIPE_SECRET_KEY` manquant ou backend non redéployé
- **Erreur « Plan non configuré »** : `STRIPE_PRICE_MONTHLY` ou `STRIPE_PRICE_YEARLY` manquant ou incorrect (doivent être des ID `price_...`, pas `prod_...`)
- **L’utilisateur ne passe pas Premium après paiement** : vérifier le webhook (signing secret, URL), les logs du backend, et que le webhook met bien à jour l’utilisateur en base (champs `is_premium`, `plan`)

Document projet AÏLA – aila.family
