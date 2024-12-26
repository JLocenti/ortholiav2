# Ortholia

## Configuration

### Variables d'environnement

Pour exécuter ce projet, vous devez créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Un fichier `.env.example` est fourni comme modèle. Copiez-le et remplissez-le avec vos propres valeurs :

```bash
cp .env.example .env
```

## Configuration de l'environnement

### Variables d'environnement

1. Copiez le fichier `.env.example` vers un nouveau fichier `.env` :
```bash
cp .env.example .env
```

2. Configurez les variables d'environnement dans le fichier `.env` :

#### Configuration Firebase Client
Ces variables sont nécessaires pour l'application principale :
- `VITE_FIREBASE_API_KEY`: Clé API Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Domaine d'authentification
- `VITE_FIREBASE_PROJECT_ID`: ID du projet
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket de stockage
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID de l'expéditeur
- `VITE_FIREBASE_APP_ID`: ID de l'application
- `VITE_FIREBASE_MEASUREMENT_ID`: ID de mesure (optionnel)

#### Configuration Firebase Admin SDK
Ces variables sont nécessaires pour les scripts d'administration :
- `FIREBASE_ADMIN_TYPE`: Type de compte (généralement "service_account")
- `FIREBASE_ADMIN_PROJECT_ID`: ID du projet
- `FIREBASE_ADMIN_PRIVATE_KEY_ID`: ID de la clé privée
- `FIREBASE_ADMIN_PRIVATE_KEY`: Clé privée complète
- `FIREBASE_ADMIN_CLIENT_EMAIL`: Email du client
- `FIREBASE_ADMIN_CLIENT_ID`: ID du client
- `FIREBASE_ADMIN_AUTH_URI`: URI d'authentification
- `FIREBASE_ADMIN_TOKEN_URI`: URI du token
- `FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL`: URL du certificat du fournisseur d'authentification
- `FIREBASE_ADMIN_CLIENT_CERT_URL`: URL du certificat client

### Sécurité

⚠️ **IMPORTANT** ⚠️

1. Ne versionnez JAMAIS les fichiers suivants :
   - `.env`
   - `service-account.json`
   - Tout fichier contenant des clés privées ou des informations d'identification

2. Utilisez toujours des variables d'environnement pour les informations sensibles.

3. Effectuez une rotation régulière des clés API et des informations d'identification.

4. En cas de compromission des clés :
   - Révoquez immédiatement les clés compromises dans la console Firebase
   - Générez de nouvelles clés
   - Mettez à jour le fichier `.env` avec les nouvelles clés

⚠️ Ne commettez jamais le fichier `.env` dans le dépôt Git.
