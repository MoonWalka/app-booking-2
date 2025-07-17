#\!/bin/bash

# Fix ContactConcertsSection.js
sed -i '' 's/date\.id/concert.id/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null
sed -i '' 's/date\.titre/concert.titre/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null
sed -i '' 's/date\.date/concert.date/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null
sed -i '' 's/date\.dateConcert/concert.dateConcert/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null
sed -i '' 's/date\.lieu/concert.lieu/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null
sed -i '' 's/date\.statut/concert.statut/g' src/components/contacts/sections/ContactConcertsSection.js 2>/dev/null

# Fix contrats sections
for file in src/components/contrats/desktop/sections/*.js src/components/contrats/sections/*.js; do
  if [ -f "$file" ]; then
    # Replace date. with concert. when date is used as a parameter
    sed -i '' 's/(\([^)]*\)date\([^)]*\))/(\1concert\2)/g' "$file" 2>/dev/null
    sed -i '' 's/date\.id/concert.id/g' "$file" 2>/dev/null
    sed -i '' 's/date\.titre/concert.titre/g' "$file" 2>/dev/null
    sed -i '' 's/date\.date/concert.date/g' "$file" 2>/dev/null
  fi
done

# Fix LieuView mobile
sed -i '' 's/date\.id/concert.id/g' src/components/lieux/mobile/LieuView.js 2>/dev/null
sed -i '' 's/date\.titre/concert.titre/g' src/components/lieux/mobile/LieuView.js 2>/dev/null

# Fix services and utils
sed -i '' 's/date\.date/concert.date/g' src/services/brevoTemplateService.js 2>/dev/null
sed -i '' 's/date\.lieu/concert.lieu/g' src/services/brevoTemplateService.js 2>/dev/null
sed -i '' 's/date\.artiste/concert.artiste/g' src/services/brevoTemplateService.js 2>/dev/null

sed -i '' 's/date\.date/concert.date/g' src/utils/templateVariables.js 2>/dev/null
sed -i '' 's/date\.lieu/concert.lieu/g' src/utils/templateVariables.js 2>/dev/null
sed -i '' 's/date\.titre/concert.titre/g' src/utils/templateVariables.js 2>/dev/null

echo "Fixed date references in all files"
