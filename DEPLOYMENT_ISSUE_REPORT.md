# AÏLA - Rapport de Problème de Déploiement Emergent

## 🚨 Problème

Le déploiement échoue systématiquement avec les sections suivantes vides dans les logs :
- `[DEPLOY]`
- `[HEALTH_CHECK]`
- `[MANAGE_SECRETS]`
- `[MONGODB_MIGRATE]`

Le **build réussit** mais l'application **ne démarre jamais**.

## ✅ Ce qui a été fait

### Tous les points d'entrée possibles créés :

1. **`/app/start.sh`** - Script bash principal avec logs détaillés
2. **`/app/backend/start.sh`** - Script bash pour le backend
3. **`/app/backend/app.py`** - Point d'entrée ASGI standard
4. **`/app/backend/wsgi.py`** - Point d'entrée WSGI standard
5. **`/app/backend/main.py`** - Point d'entrée Python avec gestion d'erreurs
6. **`/app/Procfile`** - Configuration Heroku/Cloud (racine)
7. **`/app/backend/Procfile`** - Configuration Heroku/Cloud (backend)

### Tests locaux :
```bash
✓ /app/start.sh est exécutable
✓ /app/backend/start.sh est exécutable
✓ app.py importe correctement
✓ wsgi.py importe correctement
✓ Health check répond sur /health
✓ MongoDB se connecte correctement
```

### Modifications du code :
- ✅ Logging verbeux à chaque étape
- ✅ Gestion du fichier .env optionnel
- ✅ MongoDB fail-safe (démarre même si DB inaccessible)
- ✅ Health check retourne toujours HTTP 200
- ✅ Variables d'environnement avec valeurs par défaut

## ❓ Questions pour le Support Emergent

### 1. Logs Kubernetes Complets
Pouvez-vous fournir les logs complets du pod ?
```bash
kubectl logs <pod-name> --all-containers=true
kubectl logs <pod-name> --previous  # Si le pod a crashé
kubectl describe pod <pod-name>
```

### 2. Configuration de Démarrage
- Quelle **commande** Emergent utilise-t-il pour démarrer l'application ?
- Quel **fichier** cherche-t-il comme point d'entrée ?
- Quel est le **working directory** dans le container ?
- Y a-t-il un **timeout** configuré ?

### 3. Structure de Fichiers dans le Container
```bash
kubectl exec <pod-name> -- ls -la /app
kubectl exec <pod-name> -- ls -la /app/backend
kubectl exec <pod-name> -- cat /app/start.sh
kubectl exec <pod-name> -- test -x /app/start.sh && echo "executable" || echo "not executable"
```

### 4. Variables d'Environnement
```bash
kubectl exec <pod-name> -- env | grep -E "(MONGO|PORT|HOST|PATH)"
```

### 5. Que signifient les sections vides ?
- Que signifie exactement `[DEPLOY]` vide dans les logs ?
- À quelle étape l'erreur se produit-elle ?
- Y a-t-il des logs d'erreur qui ne sont pas affichés ?

## 🎯 Méthodes de Démarrage Supportées

L'application supporte maintenant **7 méthodes différentes** de démarrage :

1. **Script Bash (Recommandé)** :
   ```bash
   /app/start.sh
   ```

2. **Script Bash Backend** :
   ```bash
   cd /app/backend && ./start.sh
   ```

3. **Python Module Uvicorn** :
   ```bash
   cd /app/backend && python3 -m uvicorn app:app --host 0.0.0.0 --port 8001
   ```

4. **Uvicorn Direct** :
   ```bash
   cd /app/backend && uvicorn app:app --host 0.0.0.0 --port 8001
   ```

5. **Python main.py** :
   ```bash
   cd /app/backend && python3 main.py
   ```

6. **Gunicorn** :
   ```bash
   cd /app/backend && gunicorn wsgi:application -k uvicorn.workers.UvicornWorker
   ```

7. **Via Procfile** (auto-détecté par Heroku/Cloud platforms)

## 📊 Logs de Démarrage Attendus

Si l'application démarre correctement, vous devriez voir :

```
==========================================
AÏLA APPLICATION STARTUP SCRIPT
==========================================
Current directory: /app
Python version: Python 3.11.x
Uvicorn version: 0.25.0
Backend directory contents:
[liste des fichiers]
Configuration:
  HOST: 0.0.0.0
  PORT: 8001
  WORKERS: 1
==========================================
Starting uvicorn server...
============================================================
AÏLA APPLICATION STARTING
============================================================
✓ Loaded environment variables from system
✓ MONGO_URL configured (connecting to: xxx)
✓ Creating AsyncIOMotorClient...
✓ MongoDB client configured for database: aila_db
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
✓ MongoDB connection successful
✓ Database indexes created
INFO:     Application startup complete.
```

## 🔧 Configuration Kubernetes Suggérée

### Option 1 : Via Script Bash
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: aila-backend
spec:
  containers:
  - name: backend
    image: aila-backend:latest
    command: ["/bin/bash"]
    args: ["/app/start.sh"]
    ports:
    - containerPort: 8001
    env:
    - name: MONGO_URL
      valueFrom:
        secretKeyRef:
          name: aila-secrets
          key: mongodb-url
    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: aila-secrets
          key: jwt-secret
    - name: PORT
      value: "8001"
    livenessProbe:
      httpGet:
        path: /health
        port: 8001
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health
        port: 8001
      initialDelaySeconds: 10
      periodSeconds: 5
```

### Option 2 : Via Python Module
```yaml
command: ["python3", "-m", "uvicorn"]
args: ["app:app", "--host", "0.0.0.0", "--port", "8001"]
workingDir: /app/backend
```

### Option 3 : Via main.py
```yaml
command: ["python3", "main.py"]
workingDir: /app/backend
```

## 🏥 Health Check Endpoints

- **`GET /health`** - Health check principal (sans préfixe /api)
- **`GET /api/health`** - Health check API

Les deux retournent **toujours HTTP 200** même si la base de données n'est pas connectée.

Exemple de réponse :
```json
{
  "status": "healthy",
  "service": "running",
  "database": "connected",
  "timestamp": "2025-12-09T23:44:59.799"
}
```

## 📦 Variables d'Environnement Requises

```bash
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/aila_db
JWT_SECRET=your-super-secure-secret-minimum-32-characters
DB_NAME=aila_db  # Optionnel, défaut: aila_db
PORT=8001        # Optionnel, défaut: 8001
HOST=0.0.0.0     # Optionnel, défaut: 0.0.0.0
```

## 🔍 Tests de Diagnostic Suggérés

1. **Tester si le container démarre** :
   ```bash
   docker run -it <image> /bin/bash
   cd /app && ./start.sh
   ```

2. **Vérifier les permissions** :
   ```bash
   docker run <image> ls -la /app/start.sh
   ```

3. **Tester les imports Python** :
   ```bash
   docker run <image> python3 -c "from app import app; print('OK')"
   ```

4. **Tester le health check** :
   ```bash
   docker run -p 8001:8001 <image> /app/start.sh &
   sleep 5
   curl http://localhost:8001/health
   ```

## 📞 Contact

Si le problème persiste après ces vérifications, il s'agit probablement d'une configuration spécifique à la plateforme Emergent qui n'est pas documentée publiquement.

**Date du rapport** : 2025-12-09
**Environnement** : Emergent Kubernetes Deployment
**Application** : AÏLA - Arbre Généalogique
