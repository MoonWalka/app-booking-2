#!/bin/bash

echo "🚀 Migration Phase 2: Programmateur → Contact"
echo "============================================="

# Étape 1: Renommer le dossier principal
echo "📁 Étape 1: Renommage du dossier principal..."
if [ -d "src/components/programmateurs" ]; then
    mv src/components/programmateurs src/components/contacts
    echo "✅ src/components/programmateurs → src/components/contacts"
else
    echo "⚠️  Dossier programmateurs déjà renommé"
fi

# Étape 2: Renommer tous les fichiers avec "programmateur" dans le nom
echo "📝 Étape 2: Renommage des fichiers..."

# Fonction pour renommer un fichier
rename_file() {
    local old_file="$1"
    local new_file=$(echo "$old_file" | sed 's/[Pp]rogrammateur/Contact/g')
    if [ "$old_file" != "$new_file" ] && [ -f "$old_file" ]; then
        mv "$old_file" "$new_file"
        echo "✅ $(basename "$old_file") → $(basename "$new_file")"
    fi
}

# Renommer les fichiers dans contacts/
find src/components/contacts -name "*rogrammateur*" -type f | while read -r file; do
    rename_file "$file"
done

# Renommer les fichiers de hooks
find src/hooks/programmateurs -name "*rogrammateur*" -type f 2>/dev/null | while read -r file; do
    rename_file "$file"
done

# Renommer le dossier de hooks
if [ -d "src/hooks/programmateurs" ]; then
    mv src/hooks/programmateurs src/hooks/contacts
    echo "✅ src/hooks/programmateurs → src/hooks/contacts"
fi

# Renommer d'autres fichiers isolés
if [ -f "src/schemas/ProgrammateurSchemas.js" ]; then
    mv src/schemas/ProgrammateurSchemas.js src/schemas/ContactSchemas.js
    echo "✅ ProgrammateurSchemas.js → ContactSchemas.js"
fi

# Renommer le fichier de styles
if [ -f "src/styles/pages/programmateurs.css" ]; then
    mv src/styles/pages/programmateurs.css src/styles/pages/contacts.css
    echo "✅ programmateurs.css → contacts.css"
fi

# Renommer le fichier de diagnostic
if [ -f "src/utils/diagnostic/programmateurDiagnostic.js" ]; then
    mv src/utils/diagnostic/programmateurDiagnostic.js src/utils/diagnostic/contactDiagnostic.js
    echo "✅ programmateurDiagnostic.js → contactDiagnostic.js"
fi

echo ""
echo "✅ Étape 2 terminée: Fichiers renommés"
echo ""

# Étape 3: Mettre à jour les imports et références
echo "🔄 Étape 3: Mise à jour du contenu des fichiers..."
echo "(Cette étape sera effectuée dans la suite du script)"

echo ""
echo "📊 Résumé des renommages effectués:"
echo "-----------------------------------"
find src/components/contacts -type f -name "Contact*" | wc -l | xargs echo "- Fichiers Contact* dans components/contacts:"
find src/hooks/contacts -type f -name "*contact*" 2>/dev/null | wc -l | xargs echo "- Fichiers hooks contacts:"
find src -name "Contact*" -type f | grep -v node_modules | wc -l | xargs echo "- Total fichiers Contact* dans src/:"

echo ""
echo "🎯 Prêt pour l'étape 3: Mise à jour du contenu"