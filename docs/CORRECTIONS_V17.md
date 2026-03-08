# Corrections stables – Version 17 (2.0.1+17)

Ce document récapitule les corrections appliquées pour une mise en page et une stabilité stables et durables, livrées dans l’AAB **V17** (versionCode 17).

---

## 1. Présentation / mise en page (frontend – aila-family)

### Titre « Mon Arbre » affiché en entier
- **Fichier** : `frontend/app/(tabs)/tree.tsx`
- **Modifs** :
  - `headerTitleContainerNarrow` : `minWidth: 96` pour réserver la place du titre.
  - `headerTitleNarrow` : `fontSize: 17` sur écrans &lt; 440px.
  - Seuil de largeur : **440px** pour activer la mise en page étroite (plus de téléphones concernés).

### Boutons icônes décalés à droite (plus compacts)
- **Fichier** : `frontend/app/(tabs)/tree.tsx`
- Sur écrans **&lt; 420px** :
  - `headerButtonsMobile` : `gap: 4`, `marginLeft: 8`, `paddingLeft: 4`.
  - `helpButtonCompact` / `debugButtonCompact` : padding réduit, icônes 20px au lieu de 22.

### Moins d’espace sous la bande publicitaire
- **Fichier** : `frontend/app/(tabs)/_layout.tsx`
- Barre d’onglets Android : **height: 58**, **paddingBottom: 2** (au lieu de 62 / 4).
- **Fichier** : `frontend/src/components/AdBanner.tsx` – `marginBottom: 0` sur le conteneur mobile.

---

## 2. Popups de confirmation (frontend)

### Dialogue de confirmation stylé (thème sombre)
- **Composant** : `frontend/src/components/ConfirmDialog.tsx`
- Fond `#1A2F4A`, bordure dorée, boutons Annuler / Confirmer (variant `danger` pour les suppressions).

### Remplacement des `window.confirm` / `alert`
- **Fiche personne** : `frontend/app/person/[id].tsx` – suppression d’une personne via `ConfirmDialog` + messages succès/erreur avec `Alert.alert`.
- **Formulaire membre** : `frontend/app/add-person.tsx` – suppression d’un lien familial via `ConfirmDialog`.

### Traductions
- Clés ajoutées (fr / en) : `treeScreen.confirmDeletePersonWithName`, `treeScreen.deleteWarningLinks`, `personForm.confirmDeleteLink`.

---

## 3. Stabilité WebView (Flutter – aila_family_flutter)

### Fichier : `lib/main.dart`
- **Initialisation** : `WidgetsFlutterBinding.ensureInitialized()` au démarrage.
- **Délai avant chargement** : 400 ms avant de charger l’URL pour limiter les pages blanches en cas d’ouverture très rapide.
- **Gestion d’erreurs** : en cas d’échec de chargement, affichage d’un écran « Problème de chargement » avec bouton **Réessayer**.
- **Indicateur** : barre de progression en bas tant que la page n’est pas chargée.

---

## 4. Version Flutter V17

- **pubspec.yaml** : `version: 2.0.1+17`
- **android/app/build.gradle** : fallback `flutterVersionCode = '17'`, `flutterVersionName = '2.0.1'`

---

## Build AAB V17

Dans le projet Flutter :

```bash
cd c:\Users\pc\aila_family_flutter
flutter pub get
flutter build appbundle --release --android-skip-build-dependency-validation
```

Sortie : `build/app/outputs/bundle/release/app-release.aab`

**Important** : le site **www.aila.family** (frontend déployé sur Vercel) doit être à jour avec les corrections de mise en page et de popups pour que l’app Android (WebView) en bénéficie.
