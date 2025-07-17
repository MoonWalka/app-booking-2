#!/bin/bash

# Script pour corriger les erreurs "date is not defined"

echo "🔧 Correction des erreurs 'date is not defined'..."

# ArtisteView.js (desktop)
echo "📝 Correction de ArtisteView.js (desktop)..."
sed -i '' '372s/date\.id/dates\.id/g' src/components/artistes/desktop/ArtisteView.js

# ArtisteView.js (mobile)
echo "📝 Correction de ArtisteView.js (mobile)..."
sed -i '' '236s/date\./dates\./g' src/components/artistes/mobile/ArtisteView.js
sed -i '' '238s/date\.id/dates\.id/g' src/components/artistes/mobile/ArtisteView.js

# EchangeForm.js
echo "📝 Correction de EchangeForm.js..."
sed -i '' '160s/date\./dates\./g' src/components/contacts/EchangeForm.js

# ContactDatesSection.js
echo "📝 Correction de ContactDatesSection.js..."
sed -i '' '55s/date\./dates\./g' src/components/contacts/sections/ContactDatesSection.js
sed -i '' '97s/date\./dates\./g' src/components/contacts/sections/ContactDatesSection.js
sed -i '' '116s/date\.id/dates\.id/g' src/components/contacts/sections/ContactDatesSection.js
sed -i '' '125s/date\.id/dates\.id/g' src/components/contacts/sections/ContactDatesSection.js

# ContratActions.js
echo "📝 Correction de ContratActions.js..."
sed -i '' '118s/date\./dates\./g' src/components/contrats/sections/ContratActions.js

# LieuView.js (mobile)
echo "📝 Correction de LieuView.js (mobile)..."
sed -i '' '232s/date\./dates\./g' src/components/lieux/mobile/LieuView.js
sed -i '' '234s/date\.id/dates\.id/g' src/components/lieux/mobile/LieuView.js

# PreContratGenerator.js
echo "📝 Correction de PreContratGenerator.js..."
sed -i '' '123s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '128s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '248s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '251s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '503s/date/dates/g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '551s/date/dates/g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '619s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '621s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js
sed -i '' '623s/date\./dates\./g' src/components/precontrats/desktop/PreContratGenerator.js

echo "✅ Corrections terminées !"