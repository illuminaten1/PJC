# Documentation

Guide d'utilisation de l'application de Protection Juridique Complémentaire

## Introduction

> **Bienvenue dans l'application de gestion de Protection Juridique Complémentaire**
> 
> Cette application web full-stack permet la gestion complète des dossiers de protection juridique complémentaire pour les militaires blessés ou décédés en service et leurs ayants-droits.

L'application offre une interface sécurisée avec authentification pour gérer l'ensemble du processus : création des dossiers, gestion des avocats, suivi des paiements, génération automatique de documents et analyse statistique.

## Authentification et utilisateurs

### Connexion
- **Connexion sécurisée** avec nom d'utilisateur et mot de passe
- **Tokens JWT** pour la sécurité des sessions
- **Rôles utilisateurs** : Administrateur et Rédacteur

### Compte administrateur par défaut
- **Username** : `admin`
- **Mot de passe initial** : `admin`
- ⚠️ **Important** : Changez ce mot de passe immédiatement après la première connexion

### Gestion des utilisateurs (Administrateurs uniquement)
- Création, modification et suppression d'utilisateurs
- Gestion des rôles et permissions
- Activation/désactivation des comptes

## Structure des données

L'application s'organise autour d'entités interconnectées :

### 🗂️ Affaires
Regroupements de cas par événement ou circonstance

**Informations principales** :
- Nom et description de l'affaire
- Lieu et date des faits
- Notes formatées (Markdown)
- Rédacteur assigné
- Statut archivé/actif

*Exemple : "Accident de l'autoroute A13"*

### 🎖️ Militaires
Les militaires blessés ou décédés en service

**Informations principales** :
- Grade, prénom, nom, unité
- Région et département
- Circonstances des blessures
- Nature des blessures et ITT
- Statut décédé/blessé

### 👥 Bénéficiaires
Le militaire lui-même (si blessé) ou ses ayants-droits

**Informations principales** :
- Prénom, nom, qualité (Militaire/Conjoint/Enfant/Parent/Autre)
- Numéro et date de décision
- Conventions d'honoraires associées
- Paiements effectués

### ⚖️ Avocats
Avocats désignés avec informations enrichies

**Informations principales** :
- Coordonnées complètes (nom, prénom, email, téléphones)
- Cabinet d'avocats et région d'exercice
- Spécialisation RPC (Protection Juridique Complémentaire)
- Villes d'intervention
- Adresse structurée et SIRET/RIDET

## Fonctionnalités principales

### 🏗️ Gestion hiérarchique
L'application permet de naviguer facilement entre les différents niveaux : **Affaires** → **Militaires** → **Bénéficiaires**, tout en conservant les liens logiques entre ces entités.

### 💰 Suivi financier
- Gestion complète des **conventions d'honoraires** avec avocat spécifique
- Suivi des **paiements** avec coordonnées bancaires complètes
- Calcul automatique des ratios et montants restants à payer
- Statistiques budgétaires par année

### 📄 Génération de documents
Création automatique de documents personnalisés au format PDF :
- **Conventions d'honoraires** (avec variables personnalisées)
- **Fiches de règlement** (avec coordonnées bancaires)
- **Synthèses d'affaires** (récapitulatifs complets)

### 📊 Statistiques et analyses
- **Dashboard** avec indicateurs clés de performance
- Analyses financières détaillées par année/affaire
- **Export Excel** des données avec filtres personnalisables
- Rapports budgétaires avancés

### 📁 Gestion de fichiers
- **Upload sécurisé** de fichiers (PDF, ODT, EML)
- **Prévisualisation intégrée** des documents PDF
- **Lecture des emails** EML avec pièces jointes
- Stockage avec MongoDB GridFS

### ⚖️ Gestion des avocats enrichie
- **Fiches complètes** avec cabinet, région, spécialisation RPC
- **Filtres avancés** par région, ville d'intervention
- **Recherche géographique** pour trouver des avocats par ville
- Interface de gestion des villes d'intervention

### 🔐 Sécurité et logs
- **Authentification JWT** sécurisée
- **Logs système** complets de toutes les actions
- **Rate limiting** (15 tentatives/15 minutes)
- **Headers sécurisés** avec Helmet (CSP, HSTS)
- **Validation stricte** de tous les inputs

## ⚙️ Administration et paramètres

### Paramètres système
L'application gère plusieurs types de paramètres configurables :
- **Circonstances** des blessures
- **Rédacteurs** et affectation des dossiers
- **Grades** militaires
- **Régions et départements** français
- **Templates** de documents personnalisables

### ⚠️ Modification des circonstances
**Procédure sécurisée** pour éviter la perte de données :

1. Ajoutez d'abord la nouvelle circonstance **sans supprimer l'ancienne**
2. Modifiez les dossiers concernés pour qu'ils utilisent la nouvelle circonstance
3. Une fois tous les dossiers mis à jour, supprimez l'ancienne circonstance

> **Note importante** : La suppression d'une circonstance ne supprime pas la valeur dans les dossiers déjà créés, mais empêche sa sélection pour de nouveaux dossiers.

### 👥 Transfert de portefeuille
**Fonctionnalité avancée** pour remplacer un rédacteur :

1. Ajoutez le nouveau rédacteur dans les paramètres
2. Utilisez l'option **"Transférer un portefeuille"** pour réaffecter automatiquement tous les dossiers
3. Vérifiez le **transfert** et consultez l'historique des transferts
4. Supprimez l'ancien rédacteur une fois le transfert terminé

### 🔍 Logs et traçabilité
Consultation des logs système (Administrateurs uniquement) :
- **Actions utilisateurs** avec horodatage précis
- **Connexions** et tentatives de connexion
- **Modifications** de données avec détails
- **Erreurs système** et diagnostics
- **Nettoyage automatique** des logs après 3 ans

## 📋 Templates de documents

### Types de templates disponibles
L'application propose trois types de templates personnalisables :
- **Convention d'honoraires** (format DOCX)
- **Fiche de règlement** (format DOCX) 
- **Synthèse d'affaire** (format DOCX)

### 🎨 Personnalisation des templates

> ⚠️ **Attention critique** : Ne modifiez jamais les variables entre accolades comme `{d.beneficiaire.nom}` - elles sont automatiquement remplacées par les données réelles lors de la génération.

**Processus de personnalisation sécurisée** :

1. **Téléchargez** le template existant depuis l'interface d'administration
2. Utilisez **LibreOffice** ou **Microsoft Word** pour modifier le template (format DOCX uniquement)
3. **Conservez absolument** toutes les variables de données intactes
4. Modifiez uniquement le **formatage, la mise en page et le texte fixe**
5. **Enregistrez impérativement au format .docx** (pas .odt même avec LibreOffice)
6. **Uploadez** le template personnalisé via l'interface
7. **Testez immédiatement** la génération sur un dossier exemple
8. En cas de problème, utilisez **"Restaurer le template par défaut"**

### 🔄 Gestion des versions
- **Status des templates** : Voir si un template est personnalisé ou par défaut
- **Téléchargement** : Récupérer le template actuel pour modification
- **Upload sécurisé** : Remplacement avec validation du format
- **Restauration** : Retour au template par défaut à tout moment

### 🔧 Variables disponibles pour les templates

Les variables suivantes sont automatiquement remplacées lors de la génération des documents :

#### Template : Convention d'honoraires

**👤 Bénéficiaire**
- `{d.beneficiaire.prenom}` - Prénom du bénéficiaire
- `{d.beneficiaire.nom}` - Nom de famille du bénéficiaire  
- `{d.beneficiaire.qualite}` - Qualité (Militaire/Conjoint/Enfant/Parent/Autre)
- `{d.beneficiaire.numeroDecision}` - Numéro de la décision administrative
- `{d.beneficiaire.dateDecision}` - Date de la décision

**🎖️ Militaire**
- `{d.militaire.grade}` - Grade militaire
- `{d.militaire.prenom}` - Prénom du militaire
- `{d.militaire.nom}` - Nom du militaire
- `{d.militaire.unite}` - Unité d'affectation

**📁 Affaire**
- `{d.affaire.nom}` - Nom de l'affaire
- `{d.affaire.lieu}` - Lieu des faits
- `{d.affaire.dateFaits}` - Date des faits (nouveau format)
- `{d.affaire.redacteur}` - Rédacteur responsable

**⚖️ Avocat** (nouvelle section enrichie)
- `{d.avocat.prenom}` - Prénom de l'avocat
- `{d.avocat.nom}` - Nom de l'avocat
- `{d.avocat.email}` - Email professionnel
- `{d.avocat.cabinet}` - Nom du cabinet d'avocats
- `{d.avocat.region}` - Région d'exercice
- `{d.avocat.adresse.numero}` - Numéro de l'adresse
- `{d.avocat.adresse.rue}` - Nom de la rue
- `{d.avocat.adresse.codePostal}` - Code postal
- `{d.avocat.adresse.ville}` - Ville

**📄 Convention**
- `{d.convention.montant}` - Montant de la convention
- `{d.convention.pourcentageResultats}` - Pourcentage sur résultats

**📅 Autres**
- `{d.dateDocument}` - Date de génération du document

#### Template : Fiche de règlement

**💰 Paiement** (section enrichie)
- `{d.paiement.montant}` - Montant du paiement
- `{d.paiement.type}` - Type de paiement
- `{d.paiement.date}` - Date du paiement
- `{d.paiement.referencePiece}` - Référence de la pièce justificative
- `{d.paiement.qualiteDestinataire}` - Qualité du destinataire
- `{d.paiement.identiteDestinataire}` - Identité du destinataire
- `{d.paiement.adresseDestinataire}` - Adresse complète du destinataire
- `{d.paiement.siretRidet}` - Numéro SIRET/RIDET
- `{d.paiement.titulaireCompte}` - Titulaire du compte bancaire
- `{d.paiement.codeEtablissement}` - Code établissement (5 chiffres)
- `{d.paiement.codeGuichet}` - Code guichet (5 chiffres)
- `{d.paiement.numeroCompte}` - Numéro de compte (11 caractères)
- `{d.paiement.cleVerification}` - Clé de vérification (2 chiffres)

*Toutes les autres variables (Bénéficiaire, Militaire, Affaire, Autres) sont identiques aux conventions d'honoraires*

#### Template : Synthèse d'affaire

*Variables spécifiques aux synthèses d'affaires avec données agrégées sur l'affaire complète*

> **💡 Conseil** : Copiez-collez ces variables directement dans vos templates pour éviter les erreurs de frappe.

## 💻 Technologies et architecture

### Stack technique
- **Frontend** : React 18, styled-components, react-router-dom, axios, Chart.js, react-markdown
- **Backend** : Node.js, Express.js, MongoDB avec Mongoose
- **Sécurité** : Helmet (CSP, HSTS), express-rate-limit, bcrypt, JWT
- **Documents** : Carbone + LibreOffice pour génération PDF
- **Stockage** : MongoDB GridFS pour les fichiers

### Architecture
- **Application full-stack** avec séparation frontend/backend
- **API RESTful** sécurisée avec authentification JWT
- **Base de données MongoDB** avec schémas stricts
- **Déploiement Docker** avec docker-compose
- **Logs centralisés** avec Winston

## 🔧 Bonnes pratiques d'utilisation

### Navigation efficace
1. **Dashboard** → Vue d'ensemble des KPI
2. **Affaires** → Gestion par événement/accident
3. **Militaires** → Détails des militaires concernés
4. **Bénéficiaires** → Suivi individuel avec conventions
5. **Avocats** → Base de données enrichie avec filtres géographiques

### Workflow recommandé
1. **Créer l'affaire** avec date des faits et description
2. **Ajouter les militaires** concernés avec leurs détails
3. **Créer les bénéficiaires** (militaire ou ayants-droits)
4. **Affecter des avocats** selon la géographie et la spécialisation
5. **Établir les conventions** avec montants et pourcentages
6. **Suivre les paiements** avec coordonnées bancaires complètes
7. **Générer les documents** personnalisés au format PDF

### Sécurité des données
- **Sauvegardez régulièrement** la base MongoDB
- **Changez les mots de passe** par défaut immédiatement
- **Surveillez les logs** pour détecter des activités suspectes
- **Limitez les accès** selon les rôles (Admin/Rédacteur)
- **Vérifiez les uploads** de fichiers et templates

### Performance
- **Archivez** les anciennes affaires pour optimiser les performances
- **Utilisez les filtres** pour limiter les résultats affichés
- **Nettoyez périodiquement** les logs anciens (nettoyage automatique après 3 ans)
- **Surveillez l'espace disque** pour les fichiers uploadés

## ❓ Support et maintenance

### En cas de problème
1. **Consultez les logs** système dans l'interface d'administration
2. **Vérifiez l'authentification** et les permissions utilisateur
3. **Testez sur un autre navigateur** ou en mode privé
4. **Redémarrez les services** Docker si nécessaire

### Maintenance préventive
- **Surveillez les logs** d'erreur régulièrement  
- **Mettez à jour** les mots de passe périodiquement
- **Sauvegardez** la base de données régulièrement
- **Testez la génération** de documents après modification des templates
- **Vérifiez l'espace disque** disponible

### Contact technique
Pour tout support technique ou développement d'évolutions, consultez la documentation technique dans le README du projet.

---

*Documentation mise à jour - Version application with React + MongoDB full-stack*