# Firebase Enterprise Data Storage Paths

## Current Storage Locations

### 1. **Collaboration Config Path**
- Path: `collaborationConfig/{organizationId}`
- Used by: `CollaborationParametragePage`
- Contains: Enterprise config in `entreprise` field
- Note: Currently using mock data in `EntreprisesManager`

### 2. **Organization Settings Path**
- Path: `organizations/{organizationId}/settings/entreprise`
- Used by: `useEntrepriseForm` hook and `ParametresEntreprise` component
- Contains: Company details like name, address, SIRET, etc.
- This is the main path for enterprise data

### 3. **Organization Parameters Path**
- Path: `organizations/{organizationId}/parametres/settings`
- Used by: `ParametresContext`
- Contains: All app settings including `entreprise` section
- This is a backup/legacy path

### 4. **Incorrect Path in ContratGeneratorNew**
- Currently trying: `parametres/{orgId}`
- Should use: `organizations/{orgId}/settings/entreprise` OR `organizations/{orgId}/parametres/settings`

## Data Structure Example
```javascript
{
  nom: "Company Name",
  adresse: "123 Street",
  codePostal: "75001",
  ville: "Paris",
  telephone: "+33123456789",
  email: "contact@company.com",
  siteWeb: "https://company.com",
  siret: "12345678901234",
  codeAPE: "9001Z",
  // Banking info
  iban: "FR123456789",
  bic: "BNPAFRPP",
  banque: "BNP Paribas",
  // Additional fields
  representantLegal: "John Doe",
  qualiteRepresentant: "CEO",
  numeroTVAIntracommunautaire: "FR12345678901",
  licenceSpectacle: "1-123456"
}
```

## Fix Required
The `ContratGeneratorNew` component needs to be updated to fetch enterprise data from the correct path.