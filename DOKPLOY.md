# Guide de déploiement sur Dokploy

Ce guide vous explique comment déployer SyncPronote sur Dokploy étape par étape.

## Qu'est-ce que Dokploy ?

Dokploy est une plateforme de déploiement open-source similaire à Vercel ou Heroku, qui facilite le déploiement d'applications conteneurisées (Docker). Elle gère automatiquement la construction, le déploiement et l'exécution de vos applications.

## Prérequis

Avant de déployer sur Dokploy, vous devez :

1. **Avoir un compte Dokploy** avec une instance en cours d'exécution
2. **Configurer les authentifications** (Pronote et Google Calendar) localement sur votre machine

## Étape 1 : Configuration locale des authentifications

⚠️ **Important** : Cette étape doit être réalisée sur votre machine locale, **pas** sur Dokploy.

### 1.1 Cloner le projet

```bash
git clone https://github.com/Bulgus/syncpronote.git
cd syncpronote
npm install
```

### 1.2 Configurer Pronote

```bash
cd cli
node auth-pronote.js
```

Suivez les instructions interactives pour :
- Entrer l'URL de votre instance Pronote
- Saisir votre nom d'utilisateur
- Saisir votre mot de passe
- Sélectionner le type de compte (généralement "6" pour étudiant)

Cela génèrera un token d'authentification et un UUID d'appareil.

### 1.3 Configurer Google Calendar

#### a) Créer les identifiants Google

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet (ou sélectionnez-en un existant)
3. Activez l'API Google Calendar
4. Créez des identifiants OAuth 2.0 :
   - Type : Application de bureau
   - Téléchargez le fichier JSON
   - Renommez-le en `google-credentials.json`
   - Placez-le à la racine du projet

#### b) Authentifier l'application

```bash
cd cli
node auth-google.js
```

Suivez le lien qui s'affiche, autorisez l'application, et copiez le code de retour.

#### c) Obtenir l'ID du calendrier

1. Allez sur [Google Calendar](https://calendar.google.com/)
2. Créez un calendrier dédié (ou utilisez-en un existant)
3. Dans les paramètres du calendrier, trouvez l'**ID du calendrier** (format : `xxxxx@group.calendar.google.com`)

### 1.4 Récupérer les valeurs de configuration

Après ces étapes, un fichier `.config/secrets.json` a été créé. Ouvrez-le :

```bash
cat .config/secrets.json
```

Notez toutes les valeurs, vous en aurez besoin pour Dokploy.

## Étape 2 : Déploiement sur Dokploy

### 2.1 Créer une nouvelle application

1. Connectez-vous à votre instance Dokploy
2. Cliquez sur **"Create Application"** ou **"Nouvelle application"**
3. Choisissez le type : **"Docker Compose"**

### 2.2 Configurer le repository Git

1. **Repository URL** : `https://github.com/Bulgus/syncpronote.git`
   - Ou votre fork si vous en avez créé un
2. **Branch** : `main` (ou la branche de votre choix)
3. **Build Path** : laisser vide (utilise la racine du projet)

### 2.3 Configurer les variables d'environnement

Dans la section "Environment Variables", ajoutez toutes les valeurs récupérées à l'étape 1.4 :

#### Variables obligatoires :

```env
GOOGLE_CALENDAR_ID=votre-calendar-id@group.calendar.google.com
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_REFRESH_TOKEN=votre-refresh-token

PRONOTE_ROOT_URL=https://votre-instance.index-education.net/pronote
PRONOTE_TOKEN=votre-pronote-token
PRONOTE_ACCOUNT_KIND=6
PRONOTE_USERNAME=votre-username
PRONOTE_DEVICE_UUID=votre-device-uuid
```

#### Variables optionnelles (notifications) :

```env
NTFY_URL=https://ntfy.sh
NTFY_TOPIC=votre-topic-pronote
NTFY_USERNAME=votre-username-ntfy
NTFY_PASSWORD=votre-password-ntfy
```

#### Variables optionnelles (monitoring) :

```env
UPTIME_PING_URL=https://votre-url-uptime
```

### 2.4 Configurer les volumes (⚠️ IMPORTANT)

Le fichier `secrets.json` est **modifié automatiquement** à chaque reconnexion à Pronote (le token change). Il est donc **essentiel** de créer un volume persistant :

1. Dans la section "Volumes" ou "Persistent Storage"
2. Ajoutez un volume :
   - **Container Path** : `/usr/src/app/.config`
   - **Type** : Named Volume ou Bind Mount
   - Cela permettra de sauvegarder les mises à jour du token Pronote

### 2.5 Déployer

1. Vérifiez que tous les paramètres sont corrects
2. Cliquez sur **"Deploy"** ou **"Déployer"**
3. Dokploy va :
   - Cloner le repository
   - Construire l'image Docker
   - Lancer le conteneur avec les variables d'environnement

### 2.6 Vérifier le déploiement

1. Consultez les logs de l'application dans Dokploy
2. Vous devriez voir :
   ```
   Hello world! (debug from SyncPronote)
   Authentification à Google...
   Connecté à Google ! (XXXms)
   Authentification à Pronote...
   Connecté à Pronote en tant que VOTRE_NOM ! (XXXms)
   En attente de la prochaine vérification périodique...
   ```

## Étape 3 : Maintenance

### Redémarrer l'application

Si nécessaire, vous pouvez redémarrer l'application depuis le tableau de bord Dokploy.

### Voir les logs

Les logs sont accessibles directement dans l'interface Dokploy pour diagnostiquer d'éventuels problèmes.

### Mettre à jour

1. Pour mettre à jour vers la dernière version, déclenchez un nouveau déploiement depuis Dokploy
2. Dokploy récupérera automatiquement les dernières modifications du repository

### Token Pronote expiré

Le token Pronote est automatiquement renouvelé à chaque connexion et sauvegardé dans le fichier `secrets.json` (stocké dans le volume persistant). Normalement, vous n'avez rien à faire.

Si toutefois vous rencontrez des problèmes :
1. Relancez l'authentification Pronote localement (`node cli/auth-pronote.js`)
2. Mettez à jour la variable d'environnement `PRONOTE_TOKEN` dans Dokploy
3. Redémarrez l'application

## Dépannage

### L'application ne se connecte pas à Pronote

- Vérifiez que l'URL Pronote est correcte
- Vérifiez que le token n'a pas expiré
- Consultez les logs pour plus de détails

### L'application ne se connecte pas à Google Calendar

- Vérifiez que le `GOOGLE_REFRESH_TOKEN` est correct
- Vérifiez que l'API Google Calendar est activée
- Vérifiez que l'ID du calendrier est correct

### Les événements ne sont pas synchronisés

- Vérifiez les logs pour voir si des erreurs se produisent
- La synchronisation se fait toutes les 30 minutes entre 6h et 21h
- Attendez la prochaine fenêtre de synchronisation

### Le volume persistant ne fonctionne pas

- Vérifiez que le chemin du volume est bien `/usr/src/app/.config`
- Consultez les logs pour voir si le fichier secrets.json est bien créé/mis à jour

## Alternative : Docker Compose en local

Si vous préférez tester en local avant de déployer sur Dokploy :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos valeurs
nano .env

# Créer le répertoire de configuration
mkdir -p config

# Lancer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## Support

Pour toute question ou problème :
- Ouvrez une issue sur le [repository GitHub](https://github.com/Bulgus/syncpronote/issues)
- Consultez la documentation de [Dokploy](https://dokploy.com/docs)
