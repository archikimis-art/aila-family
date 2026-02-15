# 🔗 STRATÉGIE DE MAILLAGE INTERNE SEO - AILA.FAMILY

## 📊 Analyse de l'Architecture Actuelle

### Pages existantes (26 pages)
- **Pages Produit** : index, pricing, download, about, faq
- **Pages SEO/Contenu** : 12 articles guides
- **Pages Légales** : privacy, terms
- **Pages App** : login, register, tree, admin, etc.

---

## 🏗️ ARCHITECTURE EN SILOS THÉMATIQUES

### Schéma Global

```
                           ┌─────────────────────┐
                           │     PAGE D'ACCUEIL  │
                           │    (index.tsx)      │
                           │   Autorité max      │
                           └──────────┬──────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐          ┌───────────────────┐          ┌───────────────┐
│  SILO 1       │          │    SILO 2         │          │   SILO 3      │
│  GÉNÉALOGIE   │          │    VIE FAMILLE    │          │   PRODUIT     │
│  (Guide)      │          │    (Lifestyle)    │          │   (Conversion)│
└───────┬───────┘          └─────────┬─────────┘          └───────┬───────┘
        │                            │                            │
   ┌────┴────┐                 ┌─────┴─────┐                ┌─────┴─────┐
   │ PILIER  │                 │  PILIER   │                │  PILIER   │
   │ Arbre   │                 │ Traditions│                │ App AILA  │
   │ Gratuit │                 │ Familiales│                │ Download  │
   └────┬────┘                 └─────┬─────┘                └─────┬─────┘
        │                            │                            │
   ┌────┴────────────┐         ┌─────┴─────────┐           ┌──────┴──────┐
   │                 │         │               │           │             │
   ▼                 ▼         ▼               ▼           ▼             ▼
┌──────┐       ┌──────┐   ┌──────┐       ┌──────┐    ┌──────┐      ┌──────┐
│Retrou│       │Généa │   │Organ.│       │Ecrire│    │Pricing│     │ FAQ  │
│ver   │       │Début.│   │Cousi.│       │Hist. │    │       │     │      │
│Ancêt.│       │Guide │   │nade  │       │Fam.  │    │       │     │      │
└──────┘       └──────┘   └──────┘       └──────┘    └──────┘      └──────┘
```

---

## 📚 DÉTAIL DES 3 SILOS

### 🌳 SILO 1 : GÉNÉALOGIE (Recherche & Création)

**Page Pilier** : `/arbre-genealogique-gratuit`
- Thème : Comment créer et développer son arbre généalogique
- Objectif : Capturer le trafic "arbre généalogique"

**Pages Satellites** :

| Page | Mot-clé cible | Lien vers Pilier |
|------|---------------|------------------|
| `/retrouver-ancetres-gratuitement` | retrouver ancêtres gratuit | Oui |
| `/genealogie-debutant-guide` | généalogie débutant | Oui |
| `/questions-grands-parents` | questions grands-parents | Oui |
| `/arbre-genealogique-famille-recomposee` | arbre famille recomposée | Oui |

**Liens internes recommandés** :

```
arbre-genealogique-gratuit
    ├── → retrouver-ancetres-gratuitement (lien contextuel)
    ├── → genealogie-debutant-guide (lien "Pour commencer")
    ├── → questions-grands-parents (lien "Ressources")
    └── → arbre-genealogique-famille-recomposee (lien "Cas particuliers")

retrouver-ancetres-gratuitement
    ├── → arbre-genealogique-gratuit (lien retour pilier)
    ├── → genealogie-debutant-guide (lien latéral)
    └── → preserver-histoire-famille (lien vers Silo 2)
```

---

### 👨‍👩‍👧‍👦 SILO 2 : VIE DE FAMILLE (Lifestyle & Souvenirs)

**Page Pilier** : `/traditions-familiales`
- Thème : Créer et maintenir des liens familiaux
- Objectif : Capturer le trafic "famille", "souvenirs", "réunions"

**Pages Satellites** :

| Page | Mot-clé cible | Lien vers Pilier |
|------|---------------|------------------|
| `/organiser-cousinade` | organiser cousinade | Oui |
| `/ecrire-histoire-famille` | écrire histoire famille | Oui |
| `/preserver-histoire-famille` | préserver souvenirs famille | Oui |
| `/rappel-anniversaires-famille` | rappel anniversaires | Oui |

**Liens internes recommandés** :

```
traditions-familiales
    ├── → organiser-cousinade (lien "Réunions")
    ├── → ecrire-histoire-famille (lien "Transmission")
    ├── → preserver-histoire-famille (lien "Conservation")
    └── → rappel-anniversaires-famille (lien "Organisation")

organiser-cousinade
    ├── → traditions-familiales (lien retour pilier)
    ├── → arbre-genealogique-gratuit (lien vers Silo 1)
    └── → download (lien CTA produit)
```

---

### 📱 SILO 3 : PRODUIT AILA (Conversion)

**Page Pilier** : `/application-genealogie` ou `/download`
- Thème : L'application AILA et ses fonctionnalités
- Objectif : Convertir les visiteurs en utilisateurs

**Pages Satellites** :

| Page | Objectif | Lien vers Pilier |
|------|----------|------------------|
| `/pricing` | Conversion Premium | Oui |
| `/faq` | Réassurance | Oui |
| `/about` | Confiance | Oui |
| `/blog` | Hub de contenu | Oui |

---

## 🎯 ANCRES OPTIMISÉES PAR SILO

### Silo 1 - Généalogie

| De | Vers | Ancre optimisée |
|----|------|-----------------|
| index | arbre-genealogique-gratuit | "créer votre arbre généalogique gratuitement" |
| blog | retrouver-ancetres-gratuitement | "comment retrouver ses ancêtres" |
| genealogie-debutant | arbre-genealogique-gratuit | "créer un arbre généalogique en ligne" |
| retrouver-ancetres | genealogie-debutant-guide | "guide pour débutants en généalogie" |
| faq | arbre-genealogique-gratuit | "arbre généalogique gratuit" |
| questions-grands-parents | preserver-histoire-famille | "préserver l'histoire familiale" |

### Silo 2 - Vie de Famille

| De | Vers | Ancre optimisée |
|----|------|-----------------|
| index | traditions-familiales | "idées de traditions familiales" |
| blog | organiser-cousinade | "organiser une réunion de famille réussie" |
| traditions-familiales | ecrire-histoire-famille | "écrire l'histoire de sa famille" |
| organiser-cousinade | traditions-familiales | "créer des traditions familiales" |
| preserver-histoire | rappel-anniversaires-famille | "ne jamais oublier un anniversaire" |

### Silo 3 - Produit

| De | Vers | Ancre optimisée |
|----|------|-----------------|
| Toutes pages SEO | register | "créer mon arbre gratuit" |
| Toutes pages SEO | download | "télécharger l'application AILA" |
| pricing | faq | "questions fréquentes" |
| about | pricing | "voir nos offres" |
| faq | application-genealogie | "découvrir l'application" |

---

## 📋 PAGES PILIERS RECOMMANDÉES

### Pilier Principal (Autorité Maximale)

```
/arbre-genealogique-gratuit
```
- **Longueur** : 3000+ mots
- **Structure** : H1 > H2 > H3 hiérarchique
- **Contenu** : Guide ultime + FAQ intégrée + CTA
- **Liens sortants** : Vers toutes pages Silo 1
- **Liens entrants** : Depuis index, blog, toutes pages SEO

### Piliers Secondaires

| Page | Silo | Mots | Priorité |
|------|------|------|----------|
| `/traditions-familiales` | Vie Famille | 2500+ | ⭐⭐⭐⭐ |
| `/application-genealogie` | Produit | 2000+ | ⭐⭐⭐⭐ |
| `/retrouver-ancetres-gratuitement` | Généalogie | 2500+ | ⭐⭐⭐ |
| `/blog` | Hub | Variable | ⭐⭐⭐ |

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### 1. Composant de Liens Contextuels

```tsx
// RelatedArticles.tsx
const relatedBySilo = {
  genealogie: [
    { url: '/arbre-genealogique-gratuit', title: 'Créer son arbre gratuitement' },
    { url: '/retrouver-ancetres-gratuitement', title: 'Retrouver ses ancêtres' },
    { url: '/genealogie-debutant-guide', title: 'Guide débutant' },
  ],
  famille: [
    { url: '/traditions-familiales', title: 'Traditions familiales' },
    { url: '/organiser-cousinade', title: 'Organiser une cousinade' },
    { url: '/ecrire-histoire-famille', title: 'Écrire son histoire' },
  ],
};
```

### 2. Breadcrumbs Optimisés

```
Accueil > Généalogie > Retrouver ses ancêtres gratuitement
Accueil > Famille > Organiser une cousinade
Accueil > Application > Tarifs
```

### 3. Footer SEO Global

```tsx
<footer>
  <section title="Généalogie">
    <a href="/arbre-genealogique-gratuit">Arbre généalogique gratuit</a>
    <a href="/retrouver-ancetres-gratuitement">Retrouver ses ancêtres</a>
    ...
  </section>
  <section title="Famille">
    <a href="/traditions-familiales">Traditions familiales</a>
    ...
  </section>
</footer>
```

---

## 📊 MATRICE DE MAILLAGE RECOMMANDÉE

```
                    LIENS VERS →
                    
    ↓ DEPUIS        Index  Arbre  Retrou  Généa   Tradi  Organ  Écrire  Down  Pricing
    ─────────────────────────────────────────────────────────────────────────────────
    Index            -      ✅     ✅      ✅      ✅     ✅     ✅      ✅    ✅
    Arbre Gratuit   ✅      -      ✅      ✅      ⬜     ⬜     ⬜      ✅    ✅
    Retrouver       ✅     ✅      -       ✅      ⬜     ⬜     ✅      ✅    ⬜
    Généalogie Déb. ✅     ✅     ✅       -       ⬜     ⬜     ⬜      ✅    ⬜
    Traditions      ✅     ⬜      ⬜      ⬜       -     ✅     ✅      ✅    ✅
    Cousinade       ✅     ✅      ⬜      ⬜      ✅      -     ✅      ✅    ⬜
    Écrire Histoire ✅     ✅      ⬜      ⬜      ✅     ✅      -      ✅    ⬜
    Blog            ✅     ✅     ✅      ✅      ✅     ✅     ✅      ✅    ✅
    FAQ             ✅     ✅      ⬜      ⬜      ⬜     ⬜     ⬜      ✅    ✅
    
✅ = Lien recommandé  |  ⬜ = Optionnel/Non prioritaire
```

---

## 🎯 PLAN D'ACTION

### Phase 1 - Fondations (Semaine 1)
1. ✅ Créer le composant `SEOFooter` avec liens silos → **FAIT**
2. ⬜ Ajouter breadcrumbs sur toutes les pages SEO
3. ⬜ Enrichir la page pilier `/arbre-genealogique-gratuit`

### Phase 2 - Liens Contextuels (Semaine 2)
4. ⬜ Ajouter section "Articles liés" sur chaque page
5. ⬜ Créer des CTAs internes dans le contenu
6. ⬜ Optimiser les ancres existantes

### Phase 3 - Hub & Optimisation (Semaine 3)
7. ⬜ Restructurer `/blog` comme hub central
8. ⬜ Ajouter fil d'Ariane (breadcrumbs)
9. ⬜ Créer sitemap HTML pour utilisateurs

---

## 📈 KPIs À SUIVRE

| Métrique | Objectif | Outil |
|----------|----------|-------|
| Pages/Session | > 2.5 | Google Analytics |
| Taux de rebond | < 60% | Google Analytics |
| Liens internes cliqués | +20%/mois | Événements GA |
| Pages indexées | 100% | Search Console |
| Profondeur de crawl | < 3 clics | Screaming Frog |

---

*Document créé le 12 janvier 2025*
*Stratégie SEO pour AILA.family*
