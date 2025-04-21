# Architecture globale du projet "Protection Juridique Complémentaire"

L'application est une application web full-stack avec séparation claire entre frontend et backend. Elle est conçue pour gérer les dossiers de protection juridique pour des militaires ou leurs ayants-droits.

## Structure du projet

```
PJC/
├── backend/     # Code du serveur Express
│   ├── middleware/     # Middlewares Express
│   │   └── auth.js            # Middleware d'authentification JWT
│   ├── models/         # Modèles MongoDB
│   │   ├── affaire.js         # Modèle des affaires
│   │   ├── avocat.js          # Modèle des avocats (enrichi avec infos géographiques et contacts)
│   │   ├── beneficiaire.js    # Modèle des bénéficiaires
│   │   ├── fichier.js         # Modèle des fichiers (PDF, ODT, EML)
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
│   │   ├── fichiers.js        # Gestion des fichiers (upload, download, preview)
│   │   ├── militaires.js      # Gestion des militaires (avec populate avocats pour bénéficiaires)
│   │   ├── parametres.js      # Gestion des paramètres
│   │   ├── statistiques.js    # Calcul et fourniture des statistiques
│   │   ├── templates.js       # Gestion des templates
│   │   └── utilisateurs.js    # Gestion des utilisateurs (admin uniquement)
│   ├── scripts/        # Scripts utilitaires
│   │   └── init-admin.js      # Script pour initialiser le premier administrateur
│   ├── temp/           # Dossier temporaire
│   ├── templates/      # Templates pour les documents
│   ├── utils/          # Utilitaires
│   │   └── DocumentGenerator.js  # Génération de documents (PDFs, etc.)
│   ├── .env            # Variables d'environnement
│   ├── app.js          # Point d'entrée du serveur
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
        │   │   └── StatusTag.js        # Étiquette de statut
        │   ├── forms/      # Formulaires pour la création/édition
        │   │   ├── AffaireForm.js      # Formulaire des affaires
        │   │   ├── AvocatForm.js       # Formulaire des avocats (enrichi avec nouveaux champs)
        │   │   ├── BeneficiaireForm.js # Formulaire des bénéficiaires
        │   │   ├── ConventionForm.js   # Formulaire des conventions
        │   │   ├── MilitaireForm.js    # Formulaire des militaires
        │   │   ├── PaiementForm.js     # Formulaire des paiements (+ original)
        │   │   └── UtilisateurForm.js  # Formulaire de gestion des utilisateurs
        │   └── specific/   # Composants spécifiques à l'application
        │       ├── AffaireTree.js       # Arborescence des affaires
        │       ├── AvocatDetail.js      # Affichage détaillé d'un avocat (nouveau)
        │       ├── ConventionsTable.js  # Tableau des conventions
        │       ├── DashboardSummary.js  # Résumé du tableau de bord
        │       ├── DocumentsSection.js  # Gestion et prévisualisation des fichiers
        │       ├── PaiementsTable.js    # Tableau des paiements
        │       ├── StatistiquesBudget.js # Budget des statistiques
        │       └── UtilisateursTable.js  # Tableau des utilisateurs
        ├── contexts/   # Contextes React pour état global
        │   ├── AppContext.js     # Contexte global de l'application
        │   └── AuthContext.js    # Contexte d'authentification
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
        │   ├── Login.js             # Page de connexion
        │   ├── Militaires.js        # Page liste des militaires
        │   ├── NotFound.js          # Page 404
        │   ├── Parametres.js        # Page des paramètres (avec gestion des utilisateurs pour admin)
        │   └── Statistiques.js      # Page des statistiques
        ├── utils/      # Utilitaires frontend
        │   ├── api.js              # Client API (axios, avec nouvelles fonctions pour authentification)
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
- **Stockage de fichiers** : MongoDB GridFS
- **Génération de documents** : Carbone, libreoffice
- **Authentification** : JWT (JSON Web Token)

## Modèles de données

### Utilisateurs (nouveau)

Utilisateurs de l'application avec authentification

**Champs**:

- username (unique)
- password (stocké en clair pour simplicité)
- nom (nom complet)
- role (administrateur/redacteur)
- dateCreation
- dernierLogin
- actif (booléen)

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

### Bénéficiaires

Le militaire lui-même (si blessé) ou ses ayants-droits

**Champs**:

- prenom
- nom
- qualite (militaire/conjoint/enfant/parent)
- militaire
- numeroDecision (non unique)
- dateDecision (date associée au numéro de décision)
- avocats (optionnel)
- conventions
- paiements
- archive

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
- contentType (type MIME du fichier)
- size (taille en octets)
- uploadDate (date d'upload)
- beneficiaire (référence au bénéficiaire)
- description (description optionnelle)
- fileId (référence à l'ID stocké dans GridFS)

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
- codeEtablissement (5 chiffres)
- codeGuichet (5 chiffres)
- numeroCompte (11 caractères alphanumériques)
- cleVerification (2 chiffres)

### Paramètres

Configuration des listes utilisées dans l'application

**Types**:

- circonstances
- redacteurs
- templateConvention (modèle pour la génération de documents)

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
- **PUT /api/beneficiaires/:id/conventions/:conventionId** - Modifier une convention
- **POST /api/beneficiaires/:id/paiements** - Ajouter un paiement

### Fichiers (nouveau)

- **POST /api/fichiers/:beneficiaireId** - Télécharger un fichier pour un bénéficiaire
- **GET /api/fichiers/beneficiaire/:beneficiaireId** - Récupérer tous les fichiers d'un bénéficiaire
- **GET /api/fichiers/preview/:id** - Prévisualiser un fichier
- **GET /api/fichiers/download/:id** - Télécharger un fichier
- **DELETE /api/fichiers/:id** - Supprimer un fichier
- **PATCH /api/fichiers/:id/description** - Mettre à jour la description d'un fichier

### Militaires

- **GET /api/militaires** - Liste des militaires avec filtres
- **GET /api/militaires/:id** - Détails d'un militaire avec ses bénéficiaires et populate avocats
- **POST /api/militaires** - Créer un militaire
- **PUT /api/militaires/:id** - Modifier un militaire
- **DELETE /api/militaires/:id** - Supprimer un militaire (avec mot de passe)

### Documents

- **POST /api/documents/convention/:id/:conventionId** - Générer une convention
- **POST /api/documents/reglement/:id/:paiementId** - Générer un règlement
- **POST /api/documents/fiche-information** - Générer fiche d'information

### Templates

- **GET /api/templates** - Liste des templates
- **GET /api/templates/:id** - Détails d'un template
- **POST /api/templates** - Créer un template
- **PUT /api/templates/:id** - Modifier un template
- **DELETE /api/templates/:id** - Supprimer un template

### Statistiques

- **GET /api/statistiques** - Statistiques globales
- **GET /api/statistiques/annee/:annee** - Statistiques par année (utilise dateFaits)
- **GET /api/statistiques/affaire/:id** - Statistiques par affaire
- **GET /api/statistiques/militaire/:id** - Statistiques par militaire
- **GET /api/statistiques/budget/:annee** - Statistiques budgétaires par année

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