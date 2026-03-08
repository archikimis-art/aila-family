# AÏLA - Version Stable

## Version actuelle : 2.0.0 (8 mars 2026)

### Commit de référence
- **Hash complet**: `10050073f8b77efb2e7eb0fe39ca4a2ec39b6862`
- **Hash court**: `10050073f`
- **Message**: fix(pricing): ajout openCheckoutUrl manquant pour redirection Stripe
- **Date**: 2026-03-08

### Tag Git
```bash
git checkout v2.0.0
# ou
git checkout 10050073f
```

### URLs de production
- **Frontend (Vercel)**: https://www.aila.family
- **Backend (Render)**: https://aila-backend-hc1m.onrender.com
- **Repository GitHub**: https://github.com/archikimis-art/aila-family

### Fonctionnalités validées (v2.0.0)
- ✅ Tout de la v1.0 (auth, arbre, export, mode aperçu, collaboration, admin…)
- ✅ **Paiement Stripe** : abonnements Premium (mensuel 2,99 € / annuel 24,99 €), checkout opérationnel
- ✅ **Sécurité mode Aperçu** : onglets Liens et Profil n’affichent plus les données utilisateur réelles
- ✅ **Proxy API Vercel** : appels /api via même origine (pas de CORS), timeouts adaptés au cold start Render
- ✅ Bouton « Lien » fonctionnel en mode Aperçu (PreviewContext + AsyncStorage)
- ✅ Indicateur connexion backend sur la page Tarifs

### Build Android (AAB) pour Google Play
L’app est en **Expo / React Native** (pas Flutter). Pour générer l’AAB :

```bash
cd frontend
npx eas-cli build --platform android --profile production
```

- Connexion EAS : `eas login` si besoin.
- Le profil `production` dans `eas.json` produit un **app-bundle** (AAB).
- Après le build, télécharger l’AAB depuis [expo.dev](https://expo.dev) → projet → Builds, puis l’uploader dans Google Play Console.

### Versions
- **App** : 2.0.0 (Expo `app.json`)
- **Android versionCode** : 12

---
*Dernière mise à jour : 8 mars 2026*
