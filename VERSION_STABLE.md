# Version Stable - AÏLA Family Tree

## Dernière version stable fonctionnelle

| Élément | Valeur |
|---------|--------|
| **Commit** | `65c0978fa` |
| **Hash complet** | `65c0978fa85357844a3387ee22480f7989ebea60` |
| **Date** | 15 février 2026, 20:30 UTC |
| **Message** | fix: Don't show error popup for network/CORS errors when data is saved |

## Fonctionnalités incluses

- ✅ Authentification email/mot de passe
- ✅ Authentification Google OAuth
- ✅ Création/modification/suppression de personnes
- ✅ Création de liens de filiation (parent, enfant, conjoint, frère/sœur)
- ✅ Affichage de l'arbre généalogique
- ✅ Mode preview pour utilisateurs non connectés
- ✅ CORS configuré pour www.aila.family
- ✅ Gestion des erreurs réseau sans popup intempestif

## Commandes pour restaurer cette version

### Option 1 - Checkout (lecture seule)
```bash
git checkout 65c0978fa85357844a3387ee22480f7989ebea60
```

### Option 2 - Reset complet (écrase les modifications)
```bash
git reset --hard 65c0978fa
git push origin main --force
```

### Option 3 - Revert (crée un nouveau commit)
```bash
git revert --no-commit HEAD..65c0978fa
git commit -m "Revert to stable version 65c0978fa"
git push origin main
```

## Fichiers clés modifiés

| Fichier | Description |
|---------|-------------|
| `backend/server.py` | API FastAPI avec CORS + Google OAuth |
| `backend/requirements.txt` | Dépendances Python (inclut google-auth) |
| `frontend/app/add-link.tsx` | Formulaire de création de liens |
| `frontend/app/add-person.tsx` | Formulaire de création de personnes |

## Déploiements

| Service | Plateforme | URL |
|---------|------------|-----|
| Frontend | Vercel | https://www.aila.family |
| Backend | Render | https://aila-backend-hc1m.onrender.com |

## Configuration requise

### Backend (.env)
```
MONGO_URL=<votre_url_mongodb>
DB_NAME=aila
JWT_SECRET=<votre_secret_jwt>
```

### Frontend
- REACT_APP_BACKEND_URL configuré dans Vercel

## Historique des commits de cette session

```
65c0978fa fix: Don't show error popup for network/CORS errors when data is saved
313b83e41 fix: Add missing getRelationshipDescription function
bb97e05a3 fix: Add CORS middleware + Google OAuth endpoint properly
93bce64cd REVERT: Restore complete working version from 8fd658d3b - NO modifications
```

---

**Dernière mise à jour** : 15 février 2026
