# AÏLA - Version Stable

## Version Actuelle (16 février 2026)

### Commit de référence
- **Hash complet**: `59a272fc7ce41058a844e20b7714eb368ac5b37a`
- **Hash court**: `59a272fc7`
- **Message**: fix: Add full button variant for ExcelImport in empty tree state
- **Date**: 2026-02-16 13:20:50 UTC

### Pour revenir à cette version
```bash
git checkout 59a272fc7ce41058a844e20b7714eb368ac5b37a
```

### URLs de Production
- **Frontend (Vercel)**: https://www.aila.family
- **Backend (Render)**: https://aila-backend-hc1m.onrender.com
- **Repository GitHub**: https://github.com/archikimis-art/aila-family

### Fonctionnalités validées dans cette version
- ✅ Authentification (email/password + Google OAuth)
- ✅ Création/modification/suppression de personnes
- ✅ Création/suppression de liens familiaux
- ✅ Affichage de l'arbre généalogique
- ✅ Export JSON / GEDCOM / GDPR
- ✅ Mode aperçu avec famille générique DUPONT
- ✅ Système de rappels admin (manuel + automatique)
- ✅ Collaboration et invitations
- ✅ Import Excel (bouton visible même avec arbre vide)
- ✅ Notifications et événements
- ✅ Panel d'administration complet

### Corrections majeures incluses
1. Bug "fantôme" - personnes sans ID corrigées
2. Mode aperçu - ne montre plus les données utilisateur réelles
3. Rappels admin - endpoints send-auto et analyze-trees fonctionnels
4. Import Excel - bouton visible dans l'état vide de l'arbre
5. Modals - se ferment correctement avec confirmation

### Base de données
- **MongoDB Atlas**: database `aila_db`
- **Collections**: users, persons, links, reminders, user_reminders, collaborators, etc.

---
*Dernière mise à jour: 16 février 2026*
