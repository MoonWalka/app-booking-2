#!/bin/bash

# Script de migration des imports Organisation vers Entreprise

echo "🔄 Début de la migration des imports..."

# Mise à jour des imports OrganizationContext vers EntrepriseContext
echo "📝 Mise à jour des imports OrganizationContext..."
find src -type f -name "*.js" -exec sed -i '' 's/OrganizationContext/EntrepriseContext/g' {} \;

# Mise à jour de useOrganization vers useEntreprise
echo "📝 Mise à jour de useOrganization vers useEntreprise..."
find src -type f -name "*.js" -exec sed -i '' 's/useOrganization/useEntreprise/g' {} \;

# Mise à jour des variables communes
echo "📝 Mise à jour des variables currentOrg vers currentEntreprise..."
find src -type f -name "*.js" -exec sed -i '' 's/currentOrg/currentEntreprise/g' {} \;

echo "📝 Mise à jour des variables userOrgs vers userEntreprises..."
find src -type f -name "*.js" -exec sed -i '' 's/userOrgs/userEntreprises/g' {} \;

echo "📝 Mise à jour de switchOrganization vers switchEntreprise..."
find src -type f -name "*.js" -exec sed -i '' 's/switchOrganization/switchEntreprise/g' {} \;

echo "📝 Mise à jour de refreshOrganizations vers refreshEntreprises..."
find src -type f -name "*.js" -exec sed -i '' 's/refreshOrganizations/refreshEntreprises/g' {} \;

echo "📝 Mise à jour de loadUserOrganizations vers loadUserEntreprises..."
find src -type f -name "*.js" -exec sed -i '' 's/loadUserOrganizations/loadUserEntreprises/g' {} \;

echo "📝 Mise à jour de hasOrganizations vers hasEntreprises..."
find src -type f -name "*.js" -exec sed -i '' 's/hasOrganizations/hasEntreprises/g' {} \;

# Correction des imports de firebase-service dans les fichiers spécifiques
echo "📝 Correction des imports dans OnboardingFlow.js..."
sed -i '' 's/createOrganization/createEntreprise/g' src/components/organization/OnboardingFlow.js
sed -i '' 's/joinOrganization/joinEntreprise/g' src/components/organization/OnboardingFlow.js

echo "📝 Correction des imports dans ParametresOrganisations.js..."
sed -i '' 's/getOrganizationMembers/getEntrepriseMembers/g' src/components/parametres/ParametresOrganisations.js
sed -i '' 's/leaveOrganization/leaveEntreprise/g' src/components/parametres/ParametresOrganisations.js

# Mise à jour des imports useMultiOrgQuery
echo "📝 Mise à jour des imports useMultiOrgQuery..."
find src -type f -name "*.js" -exec sed -i '' 's/useMultiOrgQuery/useMultiEntQuery/g' {} \;
find src -type f -name "*.js" -exec sed -i '' 's/useMultiOrgDocument/useMultiEntDocument/g' {} \;
find src -type f -name "*.js" -exec sed -i '' 's/useMultiOrgMutation/useMultiEntMutation/g' {} \;

# Mise à jour du nom du module dans les imports
find src -type f -name "*.js" -exec sed -i '' 's/hooks\/useMultiOrgQuery/hooks\/useMultiEntQuery/g' {} \;

# Mise à jour de OrganizationProvider vers EntrepriseProvider
echo "📝 Mise à jour de OrganizationProvider vers EntrepriseProvider..."
find src -type f -name "*.js" -exec sed -i '' 's/OrganizationProvider/EntrepriseProvider/g' {} \;

# Mise à jour de OrganizationSelector vers EntrepriseSelector
echo "📝 Mise à jour de OrganizationSelector vers EntrepriseSelector..."
find src -type f -name "*.js" -exec sed -i '' 's/OrganizationSelector/EntrepriseSelector/g' {} \;
find src -type f -name "*.js" -exec sed -i '' 's/organization\/OrganizationSelector/organization\/EntrepriseSelector/g' {} \;

echo "✅ Migration des imports terminée !"
echo "⚠️  Vérifiez que l'application compile correctement."