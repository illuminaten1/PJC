# Documentation

Guide d'utilisation de l'application de Protection Juridique Complémentaire

## Introduction

> **Bienvenue dans l'application de gestion de Protection Juridique Complémentaire**
> 
> Cette application permet la gestion des dossiers de protection juridique complémentaire pour les militaires ou leurs ayants-droits.

L'application offre une interface complète pour gérer l'ensemble du processus, depuis la création des dossiers jusqu'au suivi des paiements, en passant par la génération automatique de documents.

## Structure des données

L'application s'organise autour de trois entités principales qui forment une hiérarchie logique :

### 🗂️ Affaires
Regroupements des affaires par événement ou circonstance

*Exemple : "Accident de l'autoroute A13"*

### 🎖️ Militaires
Les militaires blessés ou décédés en service qui génèrent le droit à cette protection juridique complémentaire

### 👥 Bénéficiaires
Soit le militaire lui-même (s'il est blessé), soit ses ayants-droits (famille)

## Fonctionnalités principales

### Gestion hiérarchique
L'application permet de naviguer facilement entre les différents niveaux : affaires → militaires → bénéficiaires, tout en conservant les liens logiques entre ces entités.

### Suivi financier
Gestion complète des conventions d'honoraires et du suivi des paiements avec calcul automatique des ratios et des montants restants à payer.

### Génération de documents
Création automatique de documents personnalisés :

- Conventions d'honoraires
- Fiches de règlement
- Fiches de suivi

### Statistiques et tableaux de bord
Vue d'ensemble avec indicateurs clés de performance et analyses financières détaillées.

## Gestion des paramètres

> ⚠️ **Important :** Consultez cette documentation avant de modifier les circonstances ou les rédacteurs.

### Modification des circonstances
Pour modifier une circonstance existante :

1. Ajoutez d'abord la nouvelle circonstance **sans supprimer l'ancienne**
2. Modifiez les dossiers concernés pour qu'ils utilisent la nouvelle circonstance
3. Une fois tous les dossiers mis à jour, supprimez l'ancienne circonstance

> **Note :** La suppression d'une circonstance ne supprime pas la valeur dans les dossiers déjà créés.

### Modification des rédacteurs
Pour remplacer un rédacteur :

1. Ajoutez le nouveau rédacteur
2. Utilisez l'option **"Transférer un portefeuille"** pour réaffecter tous les dossiers
3. Supprimez l'ancien rédacteur une fois le transfert terminé

## Templates de documents

### Personnalisation des templates

> ⚠️ **Attention :** Ne modifiez jamais les variables entre accolades comme `{d.beneficiaire.nom}` - elles seront remplacées automatiquement par les données.

Processus de personnalisation :

1. **Téléchargez** le template existant pour voir sa structure
2. Utilisez LibreOffice ou Microsoft Word pour modifier le template (format DOCX)
3. Conservez toutes les variables de données intactes
4. **Uploadez** le template personnalisé
5. Testez la génération sur un dossier exemple

Vous pouvez toujours **restaurer** le template par défaut si nécessaire.

### Variables pour les conventions d'honoraires

#### 👤 Bénéficiaire
- `{d.beneficiaire.prenom}`
- `{d.beneficiaire.nom}`
- `{d.beneficiaire.qualite}`
- `{d.beneficiaire.numeroDecision}`
- `{d.beneficiaire.dateDecision}`

#### 🎖️ Militaire
- `{d.militaire.grade}`
- `{d.militaire.prenom}`
- `{d.militaire.nom}`
- `{d.militaire.unite}`

#### 📁 Affaire
- `{d.affaire.nom}`
- `{d.affaire.lieu}`
- `{d.affaire.dateFaits}`
- `{d.affaire.redacteur}`

#### ⚖️ Avocat
- `{d.avocat.prenom}`
- `{d.avocat.nom}`
- `{d.avocat.email}`

#### 📄 Convention
- `{d.convention.montant}`
- `{d.convention.pourcentageResultats}`

#### 📅 Autres
- `{d.dateDocument}`

### Variables pour les fiches de règlement

#### 💰 Paiement
- `{d.paiement.montant}`
- `{d.paiement.type}`
- `{d.paiement.date}`
- `{d.paiement.referencePiece}`
- `{d.paiement.qualiteDestinataire}`
- `{d.paiement.identiteDestinataire}`
- `{d.paiement.adresseDestinataire}`
- `{d.paiement.siretRidet}`
- `{d.paiement.titulaireCompte}`
- `{d.paiement.codeEtablissement}`
- `{d.paiement.codeGuichet}`
- `{d.paiement.numeroCompte}`
- `{d.paiement.cleVerification}`

#### 👤 Bénéficiaire
- `{d.beneficiaire.prenom}`
- `{d.beneficiaire.nom}`
- `{d.beneficiaire.qualite}`
- `{d.beneficiaire.numeroDecision}`
- `{d.beneficiaire.dateDecision}`

#### 🎖️ Militaire
- `{d.militaire.grade}`
- `{d.militaire.prenom}`
- `{d.militaire.nom}`
- `{d.militaire.unite}`

#### 📁 Affaire
- `{d.affaire.nom}`
- `{d.affaire.lieu}`
- `{d.affaire.dateFaits}`
- `{d.affaire.redacteur}`

#### 📅 Autres
- `{d.dateDocument}`