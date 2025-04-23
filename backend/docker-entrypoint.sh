#!/bin/bash
echo "Vérification de l'installation de LibreOffice..."
if command -v soffice >/dev/null 2>&1; then
    echo "✅ LibreOffice est correctement installé: $(which soffice)"
    soffice --version
else
    echo "❌ LibreOffice n'est pas installé ou n'est pas dans le PATH!"
fi

echo "Attente de la disponibilité de MongoDB..."
until nc -z mongodb 27017; do
  echo "En attente de MongoDB..."
  sleep 1
done
echo "MongoDB est disponible, démarrage du serveur Node.js"

# Vérifier tous les chemins nécessaires
mkdir -p /app/templates
mkdir -p /app/temp
chmod -R 777 /app/templates
chmod -R 777 /app/temp

# Définir le chemin vers LibreOffice
export LIBREOFFICE_PATH=$(which soffice)
echo "LibreOffice path: $LIBREOFFICE_PATH"

# Exécuter avec NODE_ENV défini
node app.js