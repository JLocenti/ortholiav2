#!/bin/bash

# Chemins des fichiers à nettoyer
FILES_TO_CLEAN=(
    "src/config/firebase.script.ts"
    "src/scripts/syncFieldsWithCategories.ts"
    "src/scripts/migratePractitioners.mjs"
    "src/scripts/createPractitionersCollection.js"
    "src/config/firebase.ts"
    "src/scripts/migrateFieldsFormat.js"
)

# Création d'une nouvelle branche temporaire
git checkout --orphan temp_branch

# Ajout de tous les fichiers du dernier commit
git add -A

# Commit des changements
git commit -m "Version propre sans clés API exposées"

# Suppression de la branche main
git branch -D main

# Renommage de la branche temporaire en main
git branch -m main

# Force push pour écraser l'historique
git push -f origin main

# Suppression des anciens tags
git tag | xargs git push --delete origin
git tag | xargs git tag -d

# Création d'un nouveau tag
git tag -a "V7.0.0" -m "Version sécurisée - Historique nettoyé"
git push origin "V7.0.0"
