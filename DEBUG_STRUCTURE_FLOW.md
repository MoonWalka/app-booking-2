# Débogage du Flow de Données - Structure

## Problème identifié
Quand l'utilisateur sélectionne une entreprise via la recherche SIRENE, les données ne s'affichent pas correctement et le bouton "changer" ne fonctionne pas.

## Flow de données corrigé

### 1. Sélection d'entreprise
```
CompanySearchSection (clic "Sélectionner") 
  → handleSelectCompany (ProgrammateurStructureSection)
  → companySearch.handleSelectCompany (useCompanySearch)
  → onCompanySelect callback (ProgrammateurForm)
  → handleStructureChange (useProgrammateurForm)
  → formHook.setFormData (mise à jour formData.structure)
```

### 2. Synchronisation de l'affichage
```
formData.structure mis à jour
  → useEffect dans ProgrammateurStructureSection
  → détection changement formData.structure
  → reconstruction selectedCompany depuis formData
  → setSelectedCompany + setInputMode('search')
  → CompanySearchSection affiche l'entreprise sélectionnée
  → StructureInfoSection affiche les champs remplis (en lecture seule)
```

### 3. Bouton "Changer"
```
Clic "Changer de structure" (CompanySearchSection)
  → handleSelectCompany(null) (ProgrammateurStructureSection)  
  → setSelectedCompany(null) + setInputMode('search')
  → onStructureChange(null) (efface formData.structure)
  → Retour à l'interface de recherche vide
```

## États gérés

### ProgrammateurStructureSection
- `inputMode`: 'search' | 'manual'
- `selectedCompany`: objet entreprise ou null

### Logique d'affichage
- Mode recherche + pas d'entreprise → interface recherche
- Mode recherche + entreprise sélectionnée → affichage entreprise + formulaire en lecture seule
- Mode manuel → formulaire éditable

## Logs de débogage temporaires
- `[DEBUG] handleStructureChange`: dans useProgrammateurForm
- `[DEBUG] ProgrammateurStructureSection`: synchronisation des données

À supprimer après validation du fix. 