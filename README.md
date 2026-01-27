# SyncPronote

Un service en arrière-plan qui synchronise votre emploi du temps Pronote sur Google Agenda. Celui-ci vous alerte aussi lorsqu'un cours est modifié ou annulé via [ntfy](https://ntfy.sh/) (optionnel).


## Installation

> Vous aurez besoin d'une version récente de [Node.js](https://nodejs.org/en/)
> Vous pouvez installer [pm2](https://www.npmjs.com/package/pm2) pour démarrer le service en arrière-plan
> Vous pouvez installer [ntfy](https://ntfy.sh/) pour recevoir des notifications lors de certaines actions apportées à l'EDT

1. Cloner le dépôt
```sh
git clone https://github.com/johan-perso/syncpronote.git
```

2. Installer les dépendances
```sh
cd syncpronote
npm install
# ou "pnpm install" si vous utilisez pnpm
```

3. Configurer le service
```sh
cd cli

node auth-pronote.js
# Suivez les instructions pour configurer l'accès à Pronote

node auth-google.js
# Suivez les instructions pour configurer l'accès à Google Calendar
# Important : un fichier `google-credentials.json` doit exister à la racine du projet, il doit correspondre au fichier JSON téléchargé sur le dashboard Google (détails d'authentification du client, choissisez "application de bureau")

mv .config/secrets.example.json .config/secrets.json
nano .config/secrets.json
# (!) Sur Docker, vous devrez créer un volume pour `.config/secrets.json` puisqu'il est modifiée automatiquement à chaque reconnexion à Pronote
# Ajouter une valeur `GOOGLE_CALENDAR_ID` avec l'identifiant de l'agenda Google qui contiendra les nouveaux événements (format similaire à celui d'une adresse mail)
# Vous pouvez ajouter `NTFY_URL` + `NTFY_TOPIC` et les réglages d'authentification facultatifs (`NTFY_USERNAME` + `NTFY_PASSWORD`) pour recevoir des notifications lors de la modification ou suppression d'un cours. Le topic utilisé sera `pronote`.
```

4. Lancer le service
```sh
npm start
# ou vous pouvez utiliser pm2 pour le lancer en arrière plan
pm2 start index.js --name "SyncPronote"
```


## Déploiement avec Dokploy (ou Docker)

Dokploy est une plateforme de déploiement qui facilite le déploiement d'applications conteneurisées. Voici comment déployer SyncPronote sur Dokploy :

### Prérequis

1. **Configurer les authentifications localement** (sur votre machine) :
```sh
cd cli

# Configurer Pronote
node auth-pronote.js

# Configurer Google Calendar
node auth-google.js
# Important : un fichier `google-credentials.json` doit exister à la racine du projet
```

Cela créera un fichier `.config/secrets.json` avec vos tokens d'authentification.

### Déploiement sur Dokploy

1. **Sur Dokploy, créer une nouvelle application Docker Compose**

2. **Configurer le repository Git** : pointez vers votre fork de ce dépôt

3. **Configurer les variables d'environnement** dans Dokploy avec les valeurs de votre fichier `.config/secrets.json` :
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `PRONOTE_ROOT_URL`
   - `PRONOTE_TOKEN`
   - `PRONOTE_ACCOUNT_KIND` (généralement `6` pour un compte étudiant)
   - `PRONOTE_USERNAME`
   - `PRONOTE_DEVICE_UUID`
   
   Optionnel (pour les notifications) :
   - `NTFY_URL` (par défaut : `https://ntfy.sh`)
   - `NTFY_TOPIC`
   - `NTFY_USERNAME` (si authentification requise)
   - `NTFY_PASSWORD` (si authentification requise)
   
   Optionnel (pour le monitoring) :
   - `UPTIME_PING_URL`

4. **Configurer un volume persistant** (important !) :
   - Créer un volume monté sur `/usr/src/app/.config`
   - Cela permettra au fichier `secrets.json` d'être mis à jour automatiquement à chaque reconnexion à Pronote

5. **Déployer** : Dokploy construira l'image Docker et lancera le conteneur

### Alternative : Docker Compose en local

```sh
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env

# Créer le répertoire de configuration
mkdir -p config

# Lancer le conteneur
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## Fonctionnement

Toutes les demies-heures (x:00 et x:30) entre 6h et 21h, les cours sur la semaine actuelle ainsi que les trois semaines à venir seront récupérés depuis Pronote et comparés aux entrées de l'agenda Google. Les événements manquants seront ajoutés, les cours modifiés seront mis à jour et les cours annulés seront supprimés.

> Seules les entrées considérées comme des cours peuvent être mises à jour ou supprimées. Les autres événements du calendrier ne seront pas touchés.


## Personnalisation (avancé)

Personnaliser les heures des cours :
> Le fichier `utils/custom-hours` permet de changer les heures de début et de fin des cours annoncées par Pronote. Vous devrez modifier les valeurs pour les faire correspondre à votre emploi du temps.

Personnaliser le nom des matières :
> Vous pouvez modifier le fichier `utils/classnames.js` pour personnaliser le nom affiché dans votre agenda pour chacune de vos matières. Certaines matières sont déjà préconfigurées et seront affichées dans votre agenda sans modification à effectuer.

## Licence

MIT © [Johan](https://johanstick.fr). [Soutenez ce projet](https://johanstick.fr/#donate) si vous souhaitez m'aider 💙