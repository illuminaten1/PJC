#!/bin/bash
echo "Vérification de l'installation de LibreOffice..."
if command -v soffice >/dev/null 2>&1; then
    echo "✅ LibreOffice est correctement installé: $(which soffice)"
    # Tester si LibreOffice fonctionne correctement
    soffice --version || echo "⚠️ LibreOffice est installé mais ne démarre pas correctement"
else
    echo "❌ LibreOffice n'est pas installé ou n'est pas dans le PATH!"
    # Rechercher LibreOffice dans les emplacements courants
    SOFFICE_PATH=$(find /opt -name soffice -type f 2>/dev/null | head -1)
    if [ -n "$SOFFICE_PATH" ]; then
        echo "✅ LibreOffice trouvé à: $SOFFICE_PATH"
        ln -sf $SOFFICE_PATH /usr/local/bin/soffice
        echo "Lien symbolique créé vers $SOFFICE_PATH"
    fi
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

# Initialisation des données fictives si nécessaire
echo "Vérification et initialisation des données..."
node scripts/init-data.js
echo "Vérification et initialisation des données terminées."

# Démarrage de l'application
echo "Démarrage du serveur Node.js"
node app.js