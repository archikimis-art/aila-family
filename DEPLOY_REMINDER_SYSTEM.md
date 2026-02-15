# Guide de Déploiement - Système de Rappels AÏLA

## 📋 Résumé des modifications

### Backend (`server.py`)
Nouveaux endpoints ajoutés :
- `POST /api/reminders` - Créer un rappel (admin)
- `GET /api/reminders` - Lister les rappels
- `GET /api/reminders/user/{user_id}` - Rappels d'un utilisateur
- `PUT /api/reminders/{reminder_id}/read` - Marquer comme lu
- `GET /api/reminders/stats` - Statistiques
- `GET /api/reminders/templates` - Modèles prédéfinis
- `POST /api/reminders/family` - Envoyer rappel à un proche
- `GET /api/reminders/analyze-trees` - Analyser les arbres incomplets
- `POST /api/reminders/send-auto` - Envoyer des rappels automatiques
- `GET /api/reminders/family-history` - Historique des rappels familiaux

### Frontend
- `admin.tsx` - Onglet "Rappels" avec :
  - Statistiques des rappels
  - Bouton rappel manuel
  - Bouton rappels automatiques
  - Liste des arbres incomplets
  - Modèles de rappels
  - Historique des rappels récents
- `FamilyReminderButton.tsx` - Bouton pour relancer un proche
- `share.tsx` - Intégration du bouton de rappel

## 🚀 Étapes de déploiement

### 1. Déployer le Backend sur Render

Copiez le contenu de `/app/temp_aila/backend/server.py` vers votre dépôt GitHub ou directement sur Render.

```bash
# Si vous utilisez Git
git add backend/server.py
git commit -m "feat: Système de rappels complet"
git push origin main
```

### 2. Vérifier le déploiement

Après le déploiement, testez les endpoints :

```bash
# Tester les templates
curl https://aila-backend-hc1m.onrender.com/api/reminders/templates

# Tester les stats
curl https://aila-backend-hc1m.onrender.com/api/reminders/stats
```

### 3. Déployer le Frontend sur Vercel

Le frontend devrait se déployer automatiquement si vous avez configuré Vercel avec GitHub.

## ✅ Tests à effectuer

1. **Page Admin** (`/admin`)
   - Se connecter en admin
   - Aller sur l'onglet "Rappels"
   - Vérifier les stats (0 si premier déploiement)
   - Tester l'envoi d'un rappel manuel
   - Tester le bouton "Auto" pour les rappels automatiques

2. **Page Partage** (`/share`)
   - Inviter un collaborateur
   - Vérifier le bouton de rappel sur les invitations "pending"

## 📊 Collections MongoDB créées

- `reminders` - Rappels créés par les admins
- `user_reminders` - Rappels individuels par utilisateur
- `family_reminders` - Rappels envoyés aux proches

## 🔧 Configuration requise

Aucune nouvelle variable d'environnement requise. Le système utilise les collections MongoDB existantes.

## ⚠️ Note importante

L'envoi d'emails n'est pas encore implémenté. Les rappels sont actuellement stockés en base de données et affichés dans l'app. Pour ajouter l'envoi d'emails, vous devrez intégrer un service comme SendGrid ou Resend.
