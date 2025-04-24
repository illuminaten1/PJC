#!/bin/bash
echo "Vérification de l'installation de LibreOffice..."

# Vérifier si LibreOffice est déjà installé
if command -v soffice >/dev/null 2>&1; then
    echo "✅ LibreOffice est déjà installé: $(which soffice)"
    soffice --version
else
    echo "⏳ Installation de LibreOffice en cours..."
    
    # Installer les dépendances requises si nécessaire
    apt-get update && apt-get install -y \
        libxinerama1 \
        libfontconfig1 \
        libdbus-glib-1-2 \
        libcairo2 \
        libcups2 \
        libglu1-mesa \
        libsm6
    
    # Aller dans le répertoire où se trouve le fichier tar.gz
    cd /app
    
    # Extraire LibreOffice
    echo "Extraction de LibreOffice..."
    tar -zxvf LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz
    
    # Trouver le répertoire extrait
    LIBREOFFICE_DIR=$(find . -maxdepth 1 -type d -name "LibreOffice*" | head -n 1)
    echo "Répertoire détecté: $LIBREOFFICE_DIR"
    
    # Installer les paquets .deb
    cd "$LIBREOFFICE_DIR/DEBS"
    echo "Installation des paquets .deb..."
    dpkg -i *.deb || apt-get -f install -y
    
    # Vérification de l'installation
    if command -v soffice >/dev/null 2>&1; then
        echo "✅ LibreOffice installé avec succès: $(which soffice)"
        soffice --version
    else
        echo "❌ L'installation de LibreOffice a échoué, recherche de soffice..."
        SOFFICE_PATH=$(find /opt -name soffice -type f 2>/dev/null | head -1)
        
        if [ -n "$SOFFICE_PATH" ]; then
            echo "✅ LibreOffice trouvé à: $SOFFICE_PATH"
            ln -sf $SOFFICE_PATH /usr/local/bin/soffice
        else
            echo "❌ LibreOffice introuvable!"
        fi
    fi
    
    # Nettoyer
    cd /app
    rm -rf "$LIBREOFFICE_DIR"
fi

# Définir le chemin vers LibreOffice pour Carbone.js
export LIBREOFFICE_PATH=$(which soffice)
echo "LibreOffice path: $LIBREOFFICE_PATH"

echo "Attente de la disponibilité de MongoDB..."
until nc -z mongodb 27017; do
  echo "En attente de MongoDB..."
  sleep 1
done
echo "MongoDB est disponible, initialisation de l'utilisateur admin..."

# Exécuter le script d'initialisation de l'utilisateur admin
node scripts/init-admin.js
echo "Initialisation de l'utilisateur admin terminée."

# Vérifier tous les chemins nécessaires
mkdir -p /app/templates
mkdir -p /app/temp
chmod -R 777 /app/templates
chmod -R 777 /app/temp

# Démarrage de l'application
echo "Démarrage du serveur Node.js"
node app.js