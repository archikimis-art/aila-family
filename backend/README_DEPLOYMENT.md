# AÏLA Backend - Guide de Déploiement Production

## 🚀 Démarrage de l'Application

### Option 1: Utiliser le Point d'Entrée main.py (Recommandé pour Production)
```bash
python3 main.py
```

### Option 2: Utiliser Uvicorn directement
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --log-level info
```

### Option 3: Avec Gunicorn (Pour Production avec Workers)
```bash
gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## 📦 Variables d'Environnement

### Obligatoires en Production
```bash
# MongoDB Atlas Connection
export MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# Database Name (optionnel, défaut: aila_db)
export DB_NAME="aila_db"

# JWT Secret (CRITIQUE en production)
export JWT_SECRET="votre-secret-super-secure-minimum-32-caracteres"
```

### Optionnelles
```bash
# Port du serveur (défaut: 8001)
export PORT=8001

# Host binding (défaut: 0.0.0.0)
export HOST="0.0.0.0"

# Nombre de workers (défaut: 1)
export WORKERS=1
```

## 🏥 Health Checks

### Endpoint Principal
```bash
GET /health
```

**Réponse Succès:**
```json
{
  "status": "healthy",
  "service": "running",
  "database": "connected",
  "timestamp": "2025-12-09T23:34:14.558588"
}
```

### Endpoint API
```bash
GET /api/health
```

## 🐳 Configuration Kubernetes

### Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

### Secrets Configuration
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aila-secrets
type: Opaque
stringData:
  MONGO_URL: "mongodb+srv://user:pass@cluster.mongodb.net/aila_db"
  JWT_SECRET: "your-super-secure-jwt-secret-here"
```

### Deployment Configuration
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aila-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aila-backend
  template:
    metadata:
      labels:
        app: aila-backend
    spec:
      containers:
      - name: backend
        image: aila-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: aila-secrets
              key: MONGO_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: aila-secrets
              key: JWT_SECRET
        - name: DB_NAME
          value: "aila_db"
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
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🔍 Dépannage

### Problème: L'application ne démarre pas
**Vérifications:**
1. Le fichier `server.py` est-il présent?
2. Les dépendances sont-elles installées? (`pip install -r requirements.txt`)
3. Python 3.8+ est-il installé?
4. Les logs montrent-ils des erreurs d'import?

**Solution:**
```bash
# Vérifier les imports
python3 -c "import server"

# Vérifier les dépendances
pip list | grep -E "(fastapi|uvicorn|motor)"
```

### Problème: MongoDB ne se connecte pas
**Vérifications:**
1. `MONGO_URL` est-elle correctement configurée?
2. Le cluster MongoDB Atlas autorise-t-il les connexions depuis Kubernetes?
3. Les credentials sont-ils corrects?

**Solution:**
```bash
# Tester la connexion
python3 -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def test():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    await client.admin.command('ping')
    print('✓ MongoDB connection successful')

asyncio.run(test())
"
```

### Problème: Health check échoue
**Vérifications:**
1. Le serveur est-il démarré sur le bon port?
2. Le health check endpoint répond-il?

**Solution:**
```bash
# Tester localement
curl http://localhost:8001/health

# Tester dans le pod
kubectl exec -it <pod-name> -- curl http://localhost:8001/health
```

## 📊 Logs de Démarrage Normaux

Vous devriez voir ces logs lors d'un démarrage réussi:

```
2025-12-09 23:34:11 - __main__ - INFO - ================================================================================
2025-12-09 23:34:11 - __main__ - INFO - STARTING AÏLA BACKEND APPLICATION
2025-12-09 23:34:11 - __main__ - INFO - ================================================================================
2025-12-09 23:34:11 - __main__ - INFO - Importing server module...
2025-12-09 23:34:11 - server - INFO - ============================================================
2025-12-09 23:34:11 - server - INFO - AÏLA APPLICATION STARTING
2025-12-09 23:34:11 - server - INFO - ============================================================
2025-12-09 23:34:11 - server - INFO - ✓ Loaded environment variables from /app/backend/.env
2025-12-09 23:34:11 - server - INFO - Configuring MongoDB connection...
2025-12-09 23:34:11 - server - INFO - ✓ MONGO_URL configured (connecting to: ...)
2025-12-09 23:34:11 - server - INFO - Creating AsyncIOMotorClient...
2025-12-09 23:34:11 - server - INFO - ✓ MongoDB client configured for database: aila_db
2025-12-09 23:34:11 - __main__ - INFO - ✓ Server module imported successfully
2025-12-09 23:34:11 - __main__ - INFO - Importing uvicorn...
2025-12-09 23:34:11 - __main__ - INFO - ✓ Uvicorn imported successfully
2025-12-09 23:34:11 - __main__ - INFO - Configuration: host=0.0.0.0, port=8001, workers=1
2025-12-09 23:34:11 - __main__ - INFO - Starting uvicorn server...
INFO:     Started server process [3646]
INFO:     Waiting for application startup.
2025-12-09 23:34:11 - server - INFO - MongoDB connection successful
2025-12-09 23:34:11 - server - INFO - Database indexes created
INFO:     Application startup complete.
```

## ✅ Checklist Pré-Déploiement

- [ ] `MONGO_URL` configurée dans les secrets Kubernetes
- [ ] `JWT_SECRET` configurée dans les secrets Kubernetes  
- [ ] MongoDB Atlas autorise les IPs du cluster Kubernetes
- [ ] Health check endpoints testés (`/health` et `/api/health`)
- [ ] Logs de démarrage vérifiés (pas d'erreurs)
- [ ] Tests de connexion MongoDB réussis
- [ ] Resources CPU/Memory configurées dans le deployment
- [ ] Liveness et Readiness probes configurés

## 🔐 Sécurité

### Bonnes Pratiques
1. **Ne jamais** commiter `JWT_SECRET` ou `MONGO_URL` dans le code
2. **Toujours** utiliser des Kubernetes Secrets pour les credentials
3. **Activer** TLS/SSL pour MongoDB Atlas
4. **Limiter** les IPs autorisées dans MongoDB Atlas
5. **Utiliser** des mots de passe forts (32+ caractères)
6. **Rotate** régulièrement `JWT_SECRET`

## 📞 Support

En cas de problème persistant:
1. Vérifiez les logs: `kubectl logs -f <pod-name>`
2. Vérifiez les events: `kubectl describe pod <pod-name>`
3. Vérifiez la connectivité réseau vers MongoDB Atlas
4. Consultez la documentation MongoDB Atlas pour le troubleshooting
