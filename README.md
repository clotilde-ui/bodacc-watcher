# 📋 BODACC Watcher — Transferts de siège social

Veille automatique des entreprises privées ayant changé d'adresse, publiée au BODACC.  
Les données sont stockées dans une base [Turso](https://turso.tech) et l'interface est hébergée sur [Vercel](https://vercel.com).

---

## Ce que fait l'application

- **Récupère automatiquement** (du lundi au vendredi à 8h) les annonces BODACC des 7 derniers jours
- **Filtre** : uniquement les transferts de siège, secteur privé (SAS, SARL, SA…), France métropolitaine
- **Déduplique** : une entreprise ne sera jamais importée deux fois
- **Affiche** une interface pour consulter, filtrer et rechercher les entreprises
- **Permet** de lancer un import manuellement depuis l'interface
- **Conserve** l'historique de tous les imports (onglet "Historique")

---

## Installation pas à pas

> 💡 Vous n'avez pas besoin de savoir coder. Suivez chaque étape dans l'ordre.

### Étape 1 — Prérequis à installer sur votre ordinateur

1. **Node.js** : téléchargez et installez la version LTS depuis [nodejs.org](https://nodejs.org)
   - Pour vérifier que c'est installé : ouvrez un Terminal et tapez `node -v` → vous devez voir un numéro de version

2. **Git** : téléchargez depuis [git-scm.com](https://git-scm.com/downloads)

3. **Un éditeur de texte** (optionnel mais recommandé) : [Visual Studio Code](https://code.visualstudio.com)

---

### Étape 2 — Récupérer le projet

```bash
# Clonez le projet depuis GitHub
git clone https://github.com/VOTRE_NOM/bodacc-watcher.git

# Entrez dans le dossier
cd bodacc-watcher

# Installez les dépendances
npm install
```

---

### Étape 3 — Créer la base de données Turso

1. Créez un compte gratuit sur [turso.tech](https://turso.tech)

2. Installez la CLI Turso :
   ```bash
   # Sur Mac/Linux :
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Sur Windows : utilisez le lien dans la doc Turso
   ```

3. Connectez-vous et créez votre base :
   ```bash
   turso auth login
   turso db create bodacc-watcher
   ```

4. Récupérez vos identifiants de connexion :
   ```bash
   # L'URL de votre base
   turso db show bodacc-watcher --url
   
   # Votre token d'authentification
   turso db tokens create bodacc-watcher
   ```

   Notez ces deux valeurs, vous en aurez besoin à l'étape suivante.

---

### Étape 4 — Configurer les variables d'environnement

1. Dans le dossier du projet, copiez le fichier exemple :
   ```bash
   cp .env.local.example .env.local
   ```

2. Ouvrez `.env.local` avec votre éditeur et remplissez les valeurs :
   ```
   TURSO_DATABASE_URL=libsql://bodacc-watcher-VOTRE_NOM.turso.io
   TURSO_AUTH_TOKEN=eyJhb...votre_long_token
   CRON_SECRET=mettez-nimporte-quel-mot-de-passe-ici
   ```

---

### Étape 5 — Initialiser la base de données

```bash
node scripts/init-db.js
```

Vous devriez voir :
```
⏳ Création des tables...
✅ Base de données initialisée avec succès !
```

---

### Étape 6 — Tester en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.  
Cliquez sur **"Lancer un import"** pour tester que tout fonctionne.

---

### Étape 7 — Déployer sur Vercel

1. Poussez votre code sur GitHub :
   ```bash
   git add .
   git commit -m "Premier déploiement"
   git push
   ```

2. Créez un compte sur [vercel.com](https://vercel.com) (gratuit, connexion avec GitHub)

3. Cliquez sur **"Add New Project"** → importez votre dépôt GitHub

4. Dans la section **"Environment Variables"**, ajoutez vos 3 variables :
   - `TURSO_DATABASE_URL` → votre URL Turso
   - `TURSO_AUTH_TOKEN` → votre token Turso
   - `CRON_SECRET` → votre mot de passe secret

5. Cliquez sur **"Deploy"**

Votre application est en ligne ! 🎉  
Vercel exécutera automatiquement l'import du lundi au vendredi à 8h (heure UTC, soit 9h en France hiver / 10h en été).

---

## Structure du projet

```
bodacc-watcher/
├── app/
│   ├── page.jsx              ← Interface principale (tableau des entreprises)
│   ├── layout.jsx            ← Structure HTML globale
│   ├── globals.css           ← Styles globaux
│   └── api/
│       ├── companies/route.js  ← API : liste des entreprises avec filtres
│       ├── import/route.js     ← API : déclencher un import manuel
│       ├── logs/route.js       ← API : historique des imports
│       └── cron/route.js       ← API : point d'entrée du cron automatique
├── lib/
│   ├── db.js                 ← Connexion à la base Turso
│   └── bodacc.js             ← Logique d'import BODACC (filtres, déduplication)
├── scripts/
│   └── init-db.js            ← Script d'initialisation de la base (1 seule fois)
├── vercel.json               ← Configuration du cron Vercel (lun-ven 8h UTC)
├── .env.local.example        ← Modèle des variables d'environnement
└── .gitignore                ← Fichiers à ne pas envoyer sur GitHub
```

---

## Foire aux questions

**Q : Le fichier `.env.local` doit-il être sur GitHub ?**  
Non ! Il est dans `.gitignore`, il ne sera jamais envoyé. Vos identifiants restent sur votre machine et dans Vercel.

**Q : Combien ça coûte ?**  
- Vercel : gratuit pour un usage personnel
- Turso : gratuit jusqu'à 500 bases de données et 9 GB de stockage

**Q : Puis-je changer la fréquence du cron ?**  
Oui, modifiez `vercel.json`. La syntaxe est celle de cron Linux.  
Exemple : `"0 7 * * 1-5"` = tous les jours de semaine à 7h UTC.

**Q : Comment mettre à jour l'application après une modification ?**  
```bash
git add .
git commit -m "Description de ma modification"
git push
```
Vercel redéploie automatiquement.

---

## Données collectées

Chaque entreprise enregistrée contient :
- Date de parution au BODACC
- Dénomination sociale
- SIREN
- Forme juridique
- Capital social
- Activité
- Administration / dirigeants
- Descriptif de la modification
- Date d'effet
- Nouvelle adresse complète (CP, ville, département, région)
- Tribunal compétent
- Lien vers l'annonce officielle BODACC

Source : [BODACC Open Data](https://bodacc-datadila.opendatasoft.com) — données en licence ouverte.
