# Audit: Pre-Contract to Contract Field Mapping

## Summary of Findings

### Current Data Flow

1. **Pre-Contract Generation** (`PreContratGenerationPage.js`)
   - Loads concert, contact, structure, artist, and venue data
   - Passes data to `PreContratGenerator` component
   - Structure data is loaded from `structures` collection or concert fields

2. **Pre-Contract Confirmation** (`ConfirmationPage.js`)
   - Loads pre-contract with `publicFormData` (data from organizer)
   - Allows editing "Mes infos" (left column) while showing organizer data (right column)
   - On validation, saves merged data with:
     - `confirmationValidee: true`
     - `confirmationDate: new Date()`
     - `publicFormValidated: true`
   - Updates pre-contract document with confirmed data

3. **Contract Generation** (`ContratGenerationPage.js`)
   - **ISSUE**: Only loads concert, contact, artist, and venue data
   - **DOES NOT** load confirmed pre-contract data
   - **DOES NOT** use confirmed fields like `raisonSociale`, negotiation data, etc.

### Critical Missing Link

The contract generation page is NOT retrieving the confirmed pre-contract data. It only fetches:
- Concert data from `concerts` collection
- Contact data from `contacts` collection  
- Artist data from `artistes` collection
- Venue data from `lieux` collection

But it **DOES NOT** fetch:
- Pre-contract data from `preContrats` collection
- Confirmed data with `confirmationValidee: true`
- Updated fields like `raisonSociale`, `montantHT`, address details, signatory info

### Field Mapping Issues

1. **Structure/Organization Fields**
   - `raisonSociale` - NOT passed to contract (exists in confirmed pre-contract)
   - `siret` - Only from contact/structure, not from confirmed data
   - Address fields - Only from contact/structure, not from confirmed data
   - `numeroTvaInternational` - NOT mapped
   - Signatory info (`nomSignataire`, `qualiteSignataire`) - NOT mapped

2. **Negotiation Data**
   - `montantHT` (cachet) - Uses concert.montant, not confirmed pre-contract data
   - `acompte` - NOT mapped
   - `frais` - NOT mapped
   - `contratPropose` (type of contract) - NOT mapped
   - `devise` - NOT mapped
   - `moyenPaiement` - NOT mapped

3. **Contact/Communication Fields**
   - Responsible person fields - NOT mapped
   - Phone/email fields - Only basic contact info used
   - Regie/Promo contact info - NOT mapped

4. **Event Details**
   - Number of representations - NOT mapped
   - Schedule details - Only basic time used
   - Venue capacity - From venue entity only
   - Festival info - NOT mapped

### Recommended Solution

The `ContratGenerationPage` needs to:

1. Fetch the confirmed pre-contract data:
```javascript
// Add to ContratGenerationPage useEffect
const preContrats = await getPreContratsByConcert(concertId);
const confirmedPreContrat = preContrats
  .filter(pc => pc.confirmationValidee)
  .sort((a, b) => (b.confirmationDate?.toDate() || 0) - (a.confirmationDate?.toDate() || 0))[0];
```

2. Pass confirmed data to ContratGenerator:
```javascript
<ContratGenerator 
  concert={concert}
  contact={contact}
  artiste={artiste}
  lieu={lieu}
  preContrat={confirmedPreContrat} // Add this
/>
```

3. Update `useContratGenerator` hook to use pre-contract data when available:
- Use `preContrat.raisonSociale` instead of `contact.structure`
- Use `preContrat.montantHT` instead of `concert.montant`
- Map all confirmed fields to contract variables

### Impact

Without this link, contracts are generated with:
- Original data instead of validated/confirmed data
- Missing important fields that were confirmed
- Potential legal/business issues due to incorrect information

This is a **CRITICAL** issue that needs immediate attention.