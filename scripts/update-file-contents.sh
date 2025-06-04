#!/bin/bash

echo "🔄 Étape 3: Mise à jour du contenu des fichiers"
echo "=============================================="

# Fonction pour mettre à jour un fichier
update_file_content() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🔄 Mise à jour: $file"
        
        # Sauvegarde
        cp "$file" "$file.backup"
        
        # Remplacements des termes dans le contenu
        sed -i '' \
            -e 's/programmateur/contact/g' \
            -e 's/programmateurs/contacts/g' \
            -e 's/Programmateur/Contact/g' \
            -e 's/Programmateurs/Contacts/g' \
            -e 's/PROGRAMMATEUR/CONTACT/g' \
            -e 's/PROGRAMMATEURS/CONTACTS/g' \
            "$file"
            
        # Corrections spécifiques pour éviter les doublons
        sed -i '' \
            -e 's/ContactContact/Contact/g' \
            -e 's/contactscontacts/contacts/g' \
            -e 's/contactcontact/contact/g' \
            "$file"
            
        # Correction des imports/paths
        sed -i '' \
            -e 's/components\/programmateurs/components\/contacts/g' \
            -e 's/hooks\/programmateurs/hooks\/contacts/g' \
            -e 's/pages\/ProgrammateursPage/pages\/ContactsPage/g' \
            "$file"
            
        echo "✅ Mis à jour: $file"
    fi
}

# Mise à jour des fichiers dans le dossier contacts
echo "📁 Mise à jour des composants contacts..."
find src/components/contacts -name "*.js" -o -name "*.jsx" -o -name "*.css" | while read -r file; do
    update_file_content "$file"
done

# Mise à jour des hooks
echo "📁 Mise à jour des hooks contacts..."
find src/hooks/contacts -name "*.js" 2>/dev/null | while read -r file; do
    update_file_content "$file"
done

# Mise à jour des schémas
echo "📁 Mise à jour des schémas..."
if [ -f "src/schemas/ContactSchemas.js" ]; then
    update_file_content "src/schemas/ContactSchemas.js"
fi

# Mise à jour des styles
echo "📁 Mise à jour des styles..."
if [ -f "src/styles/pages/contacts.css" ]; then
    update_file_content "src/styles/pages/contacts.css"
fi

# Mise à jour du diagnostic
echo "📁 Mise à jour du diagnostic..."
if [ -f "src/utils/diagnostic/contactDiagnostic.js" ]; then
    update_file_content "src/utils/diagnostic/contactDiagnostic.js"
fi

# Mise à jour des pages principales
echo "📁 Mise à jour des pages..."
if [ -f "src/pages/ProgrammateursPage.js" ]; then
    update_file_content "src/pages/ProgrammateursPage.js"
fi

# Mise à jour des autres fichiers qui référencent programmateurs
echo "📁 Mise à jour des références croisées..."
grep -r "programmateurs" src --include="*.js" --include="*.jsx" -l | while read -r file; do
    if [[ "$file" != *".backup" ]]; then
        update_file_content "$file"
    fi
done

echo ""
echo "✅ Étape 3 terminée: Contenu des fichiers mis à jour"
echo ""
echo "📊 Vérification des occurrences restantes:"
echo "----------------------------------------"
remaining=$(grep -r "programmateur" src --include="*.js" --include="*.jsx" | grep -v ".backup" | wc -l)
echo "Occurrences 'programmateur' restantes: $remaining"

echo ""
echo "🎯 Prêt pour les tests et corrections"