# Architecture globale du projet "Protection Juridique Complémentaire"

L'application est une application web full-stack avec séparation claire entre frontend et backend. Elle est conçue pour gérer les dossiers de protection juridique pour des militaires ou leurs ayants-droits.

## Structure du projet

```
PJC/
├── backend/     # Code du serveur Express
│   ├── middleware/     # Middlewares Express
│   │   ├── auth.js            # Middleware d'authentification JWT
│   │   └── validation.js      # Middlewares de validation express-validator
│   ├── models/         # Modèles MongoDB
│   │   ├── affaire.js         # Modèle des affaires
│   │   ├── avocat.js          # Modèle des avocats (enrichi avec infos géographiques et contacts)
│   │   ├── beneficiaire.js    # Modèle des bénéficiaires
│   │   ├── fichier.js         # Modèle des fichiers (PDF, ODT, EML)
│   │   ├── log.js             # Modèle des logs système et utilisateur
│   │   ├── militaire.js       # Modèle des militaires
│   │   ├── parametre.js       # Modèle des paramètres
│   │   ├── transfertHistorique.js # Modèle pour l'historique des transferts
│   │   └── utilisateur.js     # Modèle des utilisateurs (authentification)
│   ├── node_modules/   # Dépendances Node.js
│   ├── routes/         # Routes API
│   │   ├── affaires.js        # Gestion des affaires
│   │   ├── auth.js            # Authentification (login, logout, vérification)
│   │   ├── avocats.js         # Gestion des avocats avec nouvelles routes (utils/cabinets, utils/villes)
│   │   ├── beneficiaires.js   # Gestion des bénéficiaires (avec populate avocats)
│   │   ├── documents.js       # Génération de documents
│   │   ├── export.js          # Routes d'export Excel/PDF
│   │   ├── fichiers.js        # Gestion des fichiers (upload, download, preview)
│   │   ├── logs.js            # Consultation des logs système
│   │   ├── militaires.js      # Gestion des militaires (avec populate avocats pour bénéficiaires)
│   │   ├── parametres.js      # Gestion des paramètres
│   │   ├── statistiques.js    # Calcul et fourniture des statistiques
│   │   ├── templates.js       # Gestion des templates
│   │   └── utilisateurs.js    # Gestion des utilisateurs (admin uniquement)
│   ├── scripts/        # Scripts utilitaires
│   │   ├── init-admin.js      # Script pour initialiser le premier administrateur
│   │   ├── init-data.js       # Script d'initialisation des données de base
│   │   └── initRegionsDepartements.js # Script d'initialisation des régions/départements
│   ├── services/       # Services métier
│   │   └── logService.js      # Service de logging avec Winston
│   ├── temp/           # Dossier temporaire
│   ├── templates/      # Templates pour les documents
│   ├── utils/          # Utilitaires
│   │   ├── DocumentGenerator.js  # Génération de documents (PDFs, etc.)
│   │   └── errorHandler.js       # Gestionnaire d'erreurs centralisé
│   ├── .env            # Variables d'environnement (À CRÉER - voir section Configuration)
│   ├── app.js          # Point d'entrée du serveur
│   ├── Dockerfile      # Configuration Docker pour le backend
│   ├── docker-entrypoint.sh # Script d'entrée Docker
│   ├── package-lock.json  # Versions verrouillées des dépendances
│   └── package.json    # Dépendances du backend
└── client/      # Code de l'interface React
    ├── node_modules/   # Dépendances React
    ├── public/         # Fichiers statiques
    │   ├── favicon.ico          # Icône du site
    │   ├── favicon-save.ico     # Icône de sauvegarde
    │   ├── index.html           # HTML racine
    │   ├── logo192.png          # Logo (petit)
    │   ├── logo512.png          # Logo (grand)
    │   ├── manifest.json        # Manifeste pour PWA
    │   └── robots.txt           # Directives pour robots de recherche
    └── src/            # Code source React
        ├── components/ # Composants React
        │   ├── common/     # Composants génériques réutilisables
        │   │   ├── DataTable.js        # Tableau de données générique
        │   │   ├── ExpandableSection.js # Section dépliable
        │   │   ├── FormField.js        # Champ de formulaire (+ original)
        │   │   ├── HeaderComponents.js # Composants d'en-tête
        │   │   ├── MarkdownEditor.js   # Éditeur Markdown pour les notes
        │   │   ├── Modal.js            # Fenêtre modale (modifiée pour supporter le contenu d'en-tête)
        │   │   ├── PageHeader.js       # En-tête de page
        │   │   ├── StatusTag.js        # Étiquette de statut
        │   │   └── Toast.js            # Notifications toast
        │   ├── forms/      # Formulaires pour la création/édition
        │   │   ├── AffaireForm.js      # Formulaire des affaires
        │   │   ├── AvocatForm.js       # Formulaire des avocats (enrichi avec nouveaux champs)
        │   │   ├── BeneficiaireForm.js # Formulaire des bénéficiaires
        │   │   ├── ConventionForm.js   # Formulaire des conventions
        │   │   ├── MilitaireForm.js    # Formulaire des militaires
        │   │   ├── PaiementForm.js     # Formulaire des paiements (+ original)
        │   │   └── UtilisateurForm.js  # Formulaire de gestion des utilisateurs
        │   ├── parametres/  # Composants des onglets de paramètres
        │   │   ├── CirconstancesTab.js # Onglet gestion des circonstances
        │   │   ├── DepartementsTab.js  # Onglet gestion des départements
        │   │   ├── GradesTab.js        # Onglet gestion des grades
        │   │   ├── LogsTab.js          # Onglet consultation des logs
        │   │   ├── RedacteursTab.js    # Onglet gestion des rédacteurs
        │   │   ├── RegionsTab.js       # Onglet gestion des régions
        │   │   ├── SimpleListTab.js    # Composant générique pour listes simples
        │   │   ├── TemplatesTab.js     # Onglet gestion des templates
        │   │   ├── UtilisateursTab.js  # Onglet gestion des utilisateurs
        │   │   └── index.js            # Exports des composants parametres
        │   └── specific/   # Composants spécifiques à l'application
        │       ├── AffaireTree.js         # Arborescence des affaires
        │       ├── AvocatDetail.js        # Affichage détaillé d'un avocat (nouveau)
        │       ├── ConventionsTable.js    # Tableau des conventions
        │       ├── DashboardSummary.js    # Résumé du tableau de bord
        │       ├── DocumentsSection.js    # Gestion et prévisualisation des fichiers
        │       ├── EmailPreview.js        # Prévisualisation des emails EML
        │       ├── ExportModal.js         # Modal d'export Excel/PDF
        │       ├── PaiementsTable.js      # Tableau des paiements
        │       ├── StatistiquesBudget.js  # Budget des statistiques
        │       ├── SyntheseDropdownButton.js # Bouton dropdown pour synthèses
        │       └── UtilisateursTable.js   # Tableau des utilisateurs
        ├── contexts/   # Contextes React pour état global
        │   ├── AppContext.js     # Contexte global de l'application
        │   ├── AuthContext.js    # Contexte d'authentification
        │   └── ThemeContext.js   # Contexte de gestion des thèmes
        ├── layouts/    # Layouts principaux
        │   └── MainLayout.js     # Layout principal (enrichi avec déconnexion et info utilisateur)
        ├── pages/      # Pages principales
        │   ├── Affaires.js          # Page liste des affaires
        │   ├── Avocats.js           # Page liste des avocats (améliorée avec filtres et détails)
        │   ├── Beneficiaires.js     # Page liste des bénéficiaires
        │   ├── Dashboard.js         # Tableau de bord
        │   ├── DetailAffaire.js     # Page détails d'une affaire
        │   ├── DetailBeneficiaire.js # Page détails d'un bénéficiaire
        │   ├── DetailMilitaire.js   # Page détails d'un militaire
        │   ├── Documentation.js     # Page de documentation
        │   ├── Login.js             # Page de connexion
        │   ├── Militaires.js        # Page liste des militaires
        │   ├── NotFound.js          # Page 404
        │   ├── Parametres.js        # Page des paramètres (avec gestion des utilisateurs pour admin)
        │   └── Statistiques.js      # Page des statistiques
        ├── utils/      # Utilitaires frontend
        │   ├── api.js              # Client API (axios, avec nouvelles fonctions pour authentification)
        │   ├── exportUtils.js      # Utilitaires d'export Excel/PDF
        │   └── PrivateRoute.js     # Composant pour protéger les routes privées
        ├── App.css               # Styles CSS de l'application
        ├── App.js                # Composant racine (avec routes protégées)
        ├── App.test.js           # Tests du composant racine
        ├── index.css             # Styles CSS globaux
        ├── index.js              # Point d'entrée React
        ├── logo.svg              # Logo SVG
        ├── reportWebVitals.js    # Rapports de performance
        ├── setupTests.js         # Configuration des tests
        ├── package-lock.json     # Versions verrouillées des dépendances
        └── package.json.         # Dépendances du client

```

## Technologies utilisées

- **Frontend** : React, styled-components, react-router-dom, axios, Chart.js, react-markdown, react-simplemde-editor
- **Backend** : Node.js, Express.js, MongoDB/Mongoose
- **Sécurité** : Helmet (CSP, HSTS), express-rate-limit, express-validator, bcrypt
- **Authentification** : JWT (JSON Web Token)
- **Logging** : Winston, winston-mongodb
- **Stockage de fichiers** : MongoDB GridFS
- **Génération de documents** : Carbone, libreoffice

## ⚙️ Configuration et Déploiement

### Prérequis

- Docker et Docker Compose
- Node.js 20+ (pour développement local)
- MongoDB (si développement sans Docker)

### Configuration des Variables d'Environnement

**IMPORTANT** : Avant le premier déploiement, vous DEVEZ configurer les variables d'environnement :

1. **Copiez le fichier exemple** :
   ```bash
   cp .env.example .env
   ```

2. **Générez des secrets sécurisés** :
   ```bash
   # Générer JWT_SECRET (secret pour les tokens d'authentification)
   openssl rand -base64 48
   
   # Générer un mot de passe pour MongoDB
   openssl rand -base64 24
   ```

3. **Éditez le fichier .env** avec vos valeurs :
   ```env
   # Remplacez par votre secret JWT généré
   JWT_SECRET=votre_secret_jwt_genere_48_caracteres_minimum
   
   # Configurez MongoDB avec un mot de passe fort
   MONGODB_URI=mongodb://admin:votre_mot_de_passe_mongodb@mongodb:27017/protection-juridique?authSource=admin
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=votre_mot_de_passe_mongodb
   
   # Configuration application
   NODE_ENV=production
   PORT=5002
   ```

### Démarrage avec Docker

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### ⚠️ Sécurité - Premier Déploiement

1. **Changez le mot de passe administrateur par défaut** :
   - Username : `admin`
   - Mot de passe initial : `admin`
   - **CHANGEZ IMMÉDIATEMENT** ce mot de passe après la première connexion

2. **Vérifiez que le fichier .env n'est PAS commité** :
   ```bash
   git status  # .env ne doit PAS apparaître
   ```

3. **Variables sensibles** :
   - Tous les secrets sont dans .env (non versionné)
   - docker-compose.yml utilise des variables d'environnement
   - Aucun secret en dur dans le code source

4. **Mesures de sécurité actives** :
   - **Rate limiting** : 15 tentatives de connexion par utilisateur/15 minutes
   - **Validation stricte** : Tous les inputs sont validés avec express-validator
   - **Headers sécurisés** : Helmet avec CSP, HSTS, XSS protection
   - **Upload sécurisé** : Limites de taille (5-10MB) et types de fichiers autorisés
   - **Logging complet** : Toutes les actions utilisateur sont tracées
   - **Hachage bcrypt** : Mots de passe hachés avec salt (10 rounds)

## Modèles de données

### Utilisateurs (nouveau)

Utilisateurs de l'application avec authentification

**Champs**:

- username (unique)
- password (haché avec bcrypt + salt pour sécurité)
- nom (nom complet)
- role (administrateur/redacteur)
- dateCreation
- dernierLogin
- actif (booléen)
- passwordNeedsHash (flag technique pour migration des mots de passe)

### Affaires

Regroupements de cas (ex: accident de l'autoroute A13)

**Champs**:

- nom
- description
- lieu
- dateFaits (remplace anneeBudgetaire)
- notes (stockage de texte formaté en Markdown)
- archive
- redacteur
- dateCreation
- militaires (références aux militaires impliqués)

### Militaires

Les militaires blessés ou décédés en service

**Champs**:

- grade (liste prédéfinie)
- prenom
- nom
- unite
- region (liste prédéfinie)
- departement (liste prédéfinie)
- affaire
- circonstance
- natureDesBlessures
- itt
- decede (oui/non)
- archive
- dateCreation
- beneficiaires (références aux bénéficiaires liés)

### Bénéficiaires

Le militaire lui-même (si blessé) ou ses ayants-droits

**Champs**:

- prenom
- nom
- qualite (Militaire/Conjoint/Enfant/Parent/Autre)
- militaire
- numeroDecision (non unique)
- dateDecision (date associée au numéro de décision)
- avocats (optionnel)
- conventions
- paiements
- archive
- dateCreation

### Avocats

Avocats désignés pour les bénéficiaires

**Champs**:

- nom
- prenom
- email (obligatoire)
- specialisationRPC (booléen)
- cabinet (nom du cabinet d'avocats)
- region (région d'exercice, liste incluant toutes les régions françaises et Outre-mers)
- villesIntervention (tableau des villes où l'avocat intervient)
- adresse (objet structuré: numero, rue, codePostal, ville)
- telephonePublic1 (téléphone professionnel principal)
- telephonePublic2 (téléphone professionnel secondaire)
- telephonePrive (téléphone non communiqué aux clients)
- siretRidet (identifiant fiscal)
- commentaires (notes sur l'avocat)
- dateCreation

### Fichiers (nouveau)

Fichiers associés aux bénéficiaires (PDF, ODT, EML)

**Champs**:

- filename (nom du fichier dans GridFS)
- originalname (nom original du fichier)
- contentType (type MIME du fichier : application/pdf, application/vnd.oasis.opendocument.text, message/rfc822)
- size (taille en octets)
- uploadDate (date d'upload, par défaut Date.now)
- beneficiaire (référence au bénéficiaire, requis)
- description (description optionnelle, par défaut vide)
- fileId (référence à l'ID stocké dans GridFS, requis)

### Logs (nouveau)

Logs système et utilisateur avec expiration automatique

**Champs**:

- timestamp (date/heure, expire automatiquement après 3 ans)
- level (info/warn/error/debug)
- action (énumération des actions possibles : LOGIN_SUCCESS, USER_CREATE, AFFAIRE_VIEW, etc.)
- success (booléen)
- userId (ID de l'utilisateur)
- username (nom d'utilisateur)
- userRole (rôle utilisateur)
- method (méthode HTTP)
- url (URL de la requête)
- ipAddress (adresse IP)
- userAgent (navigateur)
- resourceType (type de ressource)
- resourceId (ID de la ressource)
- resourceName (nom de la ressource)
- details (détails supplémentaires)
- error (informations d'erreur si applicable)
- duration (durée de l'opération)

### Conventions

Sous-documents des bénéficiaires

**Champs**:

- montant
- pourcentageResultats
- dateEnvoiAvocat
- dateEnvoiBeneficiaire
- dateValidationFMG
- avocat (référence à un avocat spécifique)

### Paiements

Sous-documents des bénéficiaires

**Champs**:

- type
- montant
- date
- qualiteDestinataire (liste prédéfinie)
- identiteDestinataire
- referencePiece
- adresseDestinataire
- siretRidet
- titulaireCompte
- codeEtablissement (5 chiffres, validation conditionnelle)
- codeGuichet (5 chiffres, validation conditionnelle)  
- numeroCompte (11 caractères alphanumériques, validation conditionnelle)
- cleVerification (2 chiffres, validation conditionnelle)

### Paramètres

Configuration des listes utilisées dans l'application

**Champs**:

- type (énumération : circonstances, redacteurs, regions, departements, templateConvention, grades)
- valeurs (tableau de valeurs mixtes)
- derniereMiseAJour (date de dernière modification)

## Routes API principales

### Authentification (nouvelles routes)

- **POST /api/auth/login** - Connexion utilisateur
- **GET /api/auth/verify** - Vérifier la validité du token
- **POST /api/auth/init** - Initialiser le premier administrateur

### Utilisateurs (nouvelles routes)

- **GET /api/utilisateurs** - Liste des utilisateurs (admin uniquement)
- **GET /api/utilisateurs/:id** - Détails d'un utilisateur (admin uniquement)
- **POST /api/utilisateurs** - Créer un utilisateur (admin uniquement)
- **PUT /api/utilisateurs/:id** - Modifier un utilisateur (admin uniquement)
- **DELETE /api/utilisateurs/:id** - Supprimer un utilisateur (admin uniquement)
- **PATCH /api/utilisateurs/:id/password** - Changer le mot de passe (admin uniquement)
- **PATCH /api/utilisateurs/:id/toggle-actif** - Activer/désactiver un utilisateur (admin uniquement)

### Affaires

- **GET /api/affaires** - Liste des affaires avec filtres (dateFaits remplace anneeBudgetaire)
- **GET /api/affaires/:id** - Détails d'une affaire
- **GET /api/affaires/:id/arborescence** - Arborescence complète d'une affaire
- **POST /api/affaires** - Créer une affaire
- **PUT /api/affaires/:id** - Modifier une affaire
- **DELETE /api/affaires/:id** - Supprimer une affaire (avec mot de passe)
- **PATCH /api/affaires/:id/archive** - Archiver/désarchiver une affaire

### Avocats

- **GET /api/avocats** - Liste des avocats
- **GET /api/avocats/:id** - Détails d'un avocat
- **GET /api/avocats/utils/cabinets** - Liste des noms de cabinets (pour autocomplétion)
- **GET /api/avocats/utils/villes** - Liste des villes d'intervention (pour autocomplétion)
- **GET /api/avocats/search/ville/:ville** - Recherche des avocats par ville d'intervention
- **POST /api/avocats** - Créer un avocat
- **PUT /api/avocats/:id** - Modifier un avocat
- **DELETE /api/avocats/:id** - Supprimer un avocat (avec mot de passe)

### Bénéficiaires

- **GET /api/beneficiaires** - Liste des bénéficiaires avec filtres
- **GET /api/beneficiaires/:id** - Détails d'un bénéficiaire avec populate avocats
- **POST /api/beneficiaires** - Créer un bénéficiaire
- **PUT /api/beneficiaires/:id** - Modifier un bénéficiaire
- **DELETE /api/beneficiaires/:id** - Supprimer un bénéficiaire (avec mot de passe)
- **POST /api/beneficiaires/:id/conventions** - Ajouter une convention
- **PUT /api/beneficiaires/:id/conventions/:index** - Modifier une convention par index
- **DELETE /api/beneficiaires/:id/conventions/:index** - Supprimer une convention par index
- **POST /api/beneficiaires/:id/paiements** - Ajouter un paiement
- **PUT /api/beneficiaires/:id/paiements/:index** - Modifier un paiement par index
- **DELETE /api/beneficiaires/:id/paiements/:index** - Supprimer un paiement par index

### Fichiers (nouveau)

- **POST /api/fichiers/:beneficiaireId** - Télécharger un fichier pour un bénéficiaire
- **GET /api/fichiers/beneficiaire/:beneficiaireId** - Récupérer tous les fichiers d'un bénéficiaire
- **GET /api/fichiers/preview/:id** - Prévisualiser un fichier
- **GET /api/fichiers/preview-email/:id** - Prévisualiser un email EML avec pièces jointes
- **GET /api/fichiers/download/:id** - Télécharger un fichier
- **GET /api/fichiers/email-attachment/:fileId/:attachmentId** - Télécharger une pièce jointe d'email
- **DELETE /api/fichiers/:id** - Supprimer un fichier
- **PATCH /api/fichiers/:id/description** - Mettre à jour la description d'un fichier
- **GET /api/fichiers/clean-orphans** - Nettoyer les fichiers orphelins (admin)

### Militaires

- **GET /api/militaires** - Liste des militaires avec filtres
- **GET /api/militaires/:id** - Détails d'un militaire avec ses bénéficiaires et populate avocats
- **POST /api/militaires** - Créer un militaire
- **PUT /api/militaires/:id** - Modifier un militaire
- **DELETE /api/militaires/:id** - Supprimer un militaire (avec mot de passe)

### Documents

- **POST /api/documents/convention/:beneficiaireId/:conventionIndex** - Générer une convention
- **POST /api/documents/reglement/:beneficiaireId/:paiementIndex** - Générer un règlement
- **POST /api/documents/synthese-affaire/:id** - Générer synthèse d'affaire

### Templates

- **GET /api/templates/status** - Vérifier le statut des templates (personnalisé ou par défaut)
- **GET /api/templates/download/:templateType** - Télécharger un template
- **POST /api/templates/upload/:templateType** - Uploader un template personnalisé
- **POST /api/templates/restore/:templateType** - Restaurer le template par défaut

### Statistiques

- **GET /api/statistiques** - Statistiques globales
- **GET /api/statistiques/annee/:annee** - Statistiques par année (utilise dateFaits)
- **GET /api/statistiques/affaire/:id** - Statistiques par affaire
- **GET /api/statistiques/militaire/:id** - Statistiques par militaire
- **GET /api/statistiques/budget/:annee** - Statistiques budgétaires par année

### Export

- **GET /api/export/beneficiaires** - Export Excel des bénéficiaires avec filtres

### Logs (nouveau)

- **GET /api/logs** - Liste des logs système avec filtres
- **GET /api/logs/stats** - Statistiques des logs
- **GET /api/logs/actions** - Logs des actions utilisateur
- **GET /api/logs/users** - Logs filtrés par utilisateur
- **GET /api/logs/:id** - Détails d'un log spécifique
- **DELETE /api/logs/cleanup** - Nettoyage des anciens logs (admin)
- **POST /api/logs/cookie-consent** - Enregistrer consentement cookies

### Paramètres

- **GET /api/parametres** - Liste de tous les paramètres
- **GET /api/parametres/:type** - Paramètres par type (circonstances, redacteurs, etc.)
- **POST /api/parametres/:type** - Ajouter un paramètre
- **DELETE /api/parametres/:type/:index** - Supprimer un paramètre par index
- **PATCH /api/parametres/:type/reorder** - Réorganiser l'ordre des paramètres
- **POST /api/parametres/transfert-portefeuille** - Transférer un portefeuille d'affaires
- **GET /api/parametres/historique-transferts** - Historique des transferts de portefeuille

## Modifications et améliorations

### Système d'authentification (nouvelle fonctionnalité)

- **Modèle Utilisateur** - Création d'un schéma pour les utilisateurs
- **Middleware d'authentification JWT** - Vérification des tokens pour protéger les routes
- **Routes protégées** - Accès à certaines routes uniquement pour les utilisateurs connectés
- **Rôles d'utilisateurs** - Distinction entre administrateur et rédacteur
- **Gestion des utilisateurs** - Interface d'administration pour gérer les comptes
- **Sécurité** - Protection des fonctionnalités sensibles (gestion des utilisateurs)

### Gestion des fichiers (nouvelle fonctionnalité)

- **Stockage avec MongoDB GridFS** - Stockage de fichiers volumineux directement dans MongoDB
- **Upload de fichiers** - Support pour PDF, ODT et EML avec drag & drop
- **Prévisualisation intégrée** - Affichage des PDF directement dans l'application
- **Téléchargement de fichiers** - Accès direct aux fichiers stockés
- **Gestion des descriptions** - Possibilité d'ajouter et de modifier les descriptions des fichiers
- **Interface intuitive** - Interface d'upload et de gestion des fichiers par bénéficiaire

### Modifications des modèles de données

- **Affaire**:
    - Remplacement de anneeBudgetaire par dateFaits (Date)
    - Ajout de notes (texte formaté en Markdown)
- **Avocat**:
    - Ajout de specialisationRPC (booléen)
    - Ajout de cabinet (texte)
    - Ajout de region (texte)
    - Ajout de villesIntervention (tableau de chaînes)
    - Ajout d'adresse structurée (objet: numero, rue, codePostal, ville)
    - Ajout de téléphones (public1, public2, privé)
    - Ajout de siretRidet
    - Ajout de commentaires
- **Bénéficiaire**:
    - Modification de numeroDecision (non unique)
    - Ajout de dateDecision
- **Convention**:
    - Suppression de anneeBudgetaire et reference
    - Ajout de avocat (référence à un avocat spécifique)
- **Paiement**:
    - Suppression de anneePaiement et reference
    - Ajout des champs pour le destinataire et les coordonnées bancaires

### Améliorations de l'interface utilisateur

- **Authentification et autorisation**:
    - Page de connexion pour s'authentifier
    - Affichage du profil utilisateur dans l'en-tête
    - Bouton de déconnexion
    - Gestion des utilisateurs (admin uniquement)
    - Protection des routes selon le rôle
- **Gestion des notes**: Éditeur Markdown pour la prise de notes formatées dans les affaires
- **Affichage des spécialisations**: Badge RPC pour les avocats spécialisés
- **Dates et filtres**: Mise à jour des filtres pour utiliser dateFaits au lieu de anneeBudgetaire
- **Lien convention-avocat**: Sélection d'un avocat spécifique pour chaque convention
- **Formulaires améliorés**: Validation et mise en forme des champs à format spécifique (RIB, etc.)
- **Affichage des décisions**: Date de décision affichée à côté du numéro de décision
- **Page Avocats améliorée**:
    - Nouveau tableau avec plus d'informations (cabinet, région, ville, spécialisation)
    - Filtres avancés (par région, ville d'intervention, spécialisation)
    - Modal détaillé pour afficher l'ensemble des informations de l'avocat
    - Fonction de copie des coordonnées complètes pour faciliter la communication
    - Interface de gestion des villes d'intervention avec tags et autocomplétion
    - Formulaire organisé en sections pour une meilleure lisibilité
    - Affichage des villes d'intervention sous forme de tags dans le tableau principal

### Transfert de données

- Population correcte des avocats dans les requêtes de bénéficiaires
- Population des avocats lors de la récupération des militaires avec leurs bénéficiaires
- Adaptation des statistiques pour utiliser dateFaits au lieu de anneeBudgetaire
- Gestion améliorée des dates dans les requêtes API
- Nouvelles routes API pour l'autocomplétion des cabinets et villes d'intervention