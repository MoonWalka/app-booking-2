# Rapport des Variables Non Standardisées dans le Code

## 1. STRUCTURES - Variables Problématiques

### Pattern `structure.nom` (devrait être `structure.raisonSociale`)

**Fichiers concernés :**

1. **src/services/factureService.js** (ligne 674)
   ```javascript
   structureName = factureData.structure.nom;
   ```

2. **src/hooks/contrats/contractVariables.js** (ligne 75)
   ```javascript
   'structure_nom': { label: 'Nom de la structure', category: 'structure', source: 'structure.nom' },
   ```

3. **src/components/structures/StructureViewTabs.js** (lignes 341-344)
   ```javascript
   if (structure.nom) {
     details.push({
       icon: 'bi bi-building',
       content: <strong>{structure.nom}</strong>,
   ```

4. **src/components/structures/desktop/StructureView.js** (ligne 89)
   ```javascript
   nom: structure.nom || "Structure sans nom",
   ```

5. **src/components/structures/desktop/StructuresList.js** (lignes 51, 281, 286)
   ```javascript
   structure.nom?.toLowerCase().includes(term)
   openStructureTab(structure.id, structure.nom || structure.raisonSociale || 'Structure');
   <strong>{structure.nom || structure.raisonSociale || 'Sans nom'}</strong>
   ```

6. **src/components/dates/desktop/DateStructureSection.js** (ligne 161)
   ```javascript
   <div>{structure.nom || structure.raisonSociale || 'Sans nom'}</div>
   ```

7. **src/hooks/forms/useValidationBatchActions.js** (ligne 64)
   ```javascript
   if (structure.nom) structureFields.nom = structure.nom;
   ```

8. **src/components/dates/desktop/DateView.js** (lignes 61, 262)
   ```javascript
   nom: structure.nom,
   name={structure.nom || 'Structure'}
   ```

9. **src/components/contrats/desktop/ContratGeneratorNew.js** (ligne 335)
   ```javascript
   raisonSociale: structure.nom || structure.structureRaisonSociale || '',
   ```

10. **src/components/contacts/desktop/ContactView.js** (lignes 49, 204)
    ```javascript
    nom: structure.nom
    name={structure.nom || 'Structure'}
    ```

11. **src/components/contacts/desktop/ContactForm.js** (ligne 84)
    ```javascript
    structureRaisonSociale: structure.nom || '',
    ```

### Pattern `structureData.nom` (devrait être `structureData.raisonSociale`)

**Fichiers concernés :**

1. **src/services/structureService.js** (lignes 52, 171)
   ```javascript
   nom: structureData.nom || `Structure ${structureId}`,
   structureNom: structureData.nom,
   ```

2. **src/utils/dataCompatibility.js** (ligne 40)
   ```javascript
   nom: structureData.raisonSociale || structureData.nom,
   ```

3. **src/hooks/forms/useValidationBatchActions.js** (ligne 273)
   ```javascript
   structureNom: structureData.nom,
   ```

4. **src/hooks/contacts/useContactContrats.js** (lignes 206-207)
   ```javascript
   raisonSociale: structureData.raisonSociale || structureData.nom,
   structureNom: structureData.nom,
   ```

5. **src/hooks/contrats/contractVariables.js** (lignes 189, 217, 244)
   ```javascript
   'structure_nom': structureData.nom || '',
   contact['contact_structure'] = structureData.nom || '';
   programmateur['programmateur_structure'] = structureData.nom || '';
   ```

6. **src/hooks/contrats/useContratGenerator.js** (lignes 452, 684, 688, 734, 737)
   ```javascript
   nom: structureData.nom,
   return structureData.nom || structureData.raisonSociale || 'Non spécifiée';
   return structureData.nom;
   ```

7. **src/pages/DateDetailsPage.js** (ligne 195)
   ```javascript
   dynamicStructureName = structureData.raisonSociale || structureData.nom || dynamicStructureName;
   ```

8. **src/pages/DateCreationPage.js** (lignes 177, 183)
   ```javascript
   nomFinal: structureData.raisonSociale || structureData.nom || structureData.structureRaisonSociale || 'Structure sans nom'
   structureData.nom ||
   ```

9. **src/components/dates/DatesTable.js** (ligne 83)
   ```javascript
   structureNames[structureId] = structureData.raisonSociale || structureData.nom || 'Structure inconnue';
   ```

10. **src/components/contacts/ContactViewTabs.js** (ligne 344)
    ```javascript
    structureName = structureData.raisonSociale || structureData.nom || 'Structure';
    ```

11. **src/components/forms/PublicContactForm.js** (ligne 133)
    ```javascript
    setSiretSearch(submissionData.structureData.nom);
    ```

12. **src/components/structures/desktop/StructureView.js** (ligne 159)
    ```javascript
    title={structureData.nom}
    ```

13. **src/components/forms/validation/ValidationSection.js** (ligne 176)
    ```javascript
    // Nouveau format : structureData.nom → raisonSociale
    ```

## 2. ARTISTES - Variables Problématiques

### Pattern `artiste.nom` (devrait être `artiste.artisteNom`)

**Fichiers concernés :**

1. **src/config/searchFieldsMapping.js** (ligne 194)
   ```javascript
   artisteNom: { path: 'artiste.nom', type: 'string', join: true }
   ```

2. **src/utils/diagnoseOrphanArtistes.js** (ligne 71)
   ```javascript
   console.log(`${index + 1}. ${artiste.nom} ${artiste.isPotentialDuplicate ? '(🔄 Doublon possible)' : ''}`);
   ```

3. **src/components/structures/desktop/StructureView.js** (ligne 308)
   ```javascript
   name={artiste.nom || 'Artiste'}
   ```

4. **src/utils/seedEmulator.js** (ligne 127)
   ```javascript
   console.log(`✅ Artiste ajouté: ${artiste.nom}`);
   ```

5. **src/utils/fixBidirectionalRelationsBrowser.js** (ligne 46)
   ```javascript
   console.log(`✅ Ajout du date "${date.titre}" à l'artiste "${artiste.nom}"`);
   ```

6. **src/components/collaboration/CollaborateursManager.js** (lignes 803, 837)
   ```javascript
   <td>{artiste.nom}</td>
   ```

7. **src/components/artistes/desktop/ArtisteView.js** (lignes 80, 115)
   ```javascript
   title={artiste.nom || 'Artiste'}
   alt={artiste.nom}
   ```

8. **src/pages/BookingParametragePage.js** (lignes 177, 202)
   ```javascript
   <h6 className="mb-0 small">{artiste.nom}</h6>
   <span className="ms-2">{artiste.nom || 'Non renseigné'}</span>
   ```

9. **src/components/collaboration/CollaborateursManagerFirebase.js** (lignes 1255, 1295)
   ```javascript
   <td>{artiste.nom}</td>
   ```

10. **src/utils/dataMapping/simpleDataMapper.js** (ligne 150)
    ```javascript
    variables['artiste_nom'] = data.artiste.nom || data.date?.artisteNom || '';
    ```

11. **src/hooks/contrats/usePdfPreview.js** (ligne 103)
    ```javascript
    const artisteClean = data.artiste.nom
    ```

12. **src/hooks/contrats/contractVariables.js** (ligne 85)
    ```javascript
    'artiste_nom': { label: 'Nom de l\'artiste', category: 'artiste', source: 'artiste.nom' },
    ```

13. **src/pages/ConfirmationPage.js** (lignes 174, 176)
    ```javascript
    } else if (dateData.artiste.nom) {
    artisteNom = dateData.artiste.nom;
    ```

14. **src/hooks/contrats/useContratGenerator.js** (ligne 44)
    ```javascript
    * @param {string} artiste.nom - Nom de l'artiste
    ```

15. **src/components/artistes/sections/ArtisteSearchBar.js** (lignes 72, 80)
    ```javascript
    <img src={artiste.photoPrincipale} alt={artiste.nom} className="img-fluid" />
    <div className="fw-bold text-truncate">{artiste.nom}</div>
    ```

16. **src/components/dates/desktop/DateView.js** (lignes 48, 232)
    ```javascript
    nom: artiste.nom,
    name={artiste.nom || 'Artiste'}
    ```

17. **src/components/dates/desktop/DateGeneralInfo.js** (ligne 136)
    ```javascript
    {artiste.nom}
    ```

18. **src/components/artistes/sections/ArtistesTable.js** (ligne 26)
    ```javascript
    {artiste.nom}
    ```

19. **src/components/precontrats/desktop/PreContratGenerator.js** (ligne 390)
    ```javascript
    artistes: prev.artistes?.length > 0 ? prev.artistes : [artiste.nom || '']
    ```

20. **src/pages/ProjetsPage.js** (lignes 142-143, 299)
    ```javascript
    const nomComplet = [artiste.prenom, artiste.nom].filter(Boolean).join(' ');
    return nomComplet || artiste.nom || id;
    <span>{projet.artiste.prenom} {projet.artiste.nom}</span>
    ```

21. **src/components/dates/desktop/DateArtistSection.js** (lignes 89, 142)
    ```javascript
    <div className={styles.artisteName}>{artiste.nom}</div>
    <div>{artiste.nom}</div>
    ```

22. **src/components/contacts/desktop/ContactView.js** (ligne 240)
    ```javascript
    name={artiste.nom || 'Artiste'}
    ```

23. **src/components/dates/sections/ArtisteSearchSectionWithFallback.js** (lignes 67, 93, 108)
    ```javascript
    artiste.nom?.toLowerCase().includes(term.toLowerCase())
    `L'artiste "${artiste.nom}" n'appartient à aucune entreprise.\n\n` +
    console.log(`✅ Artiste ${artiste.nom} associé à l'entreprise`);
    ```

24. **src/hooks/dates/useDateStatus.js** (ligne 160)
    ```javascript
    contextualMessage = `Contact établi${entity.artiste ? ` avec ${entity.artiste.nom}` : ''}`;
    ```

25. **src/components/contrats/desktop/sections/ContratGenerationActions.js** (ligne 134)
    ```javascript
    const artisteClean = artiste.nom
    ```

26. **src/pages/ContratRedactionPage.js** (lignes 775, 778)
    ```javascript
    .replace(/{artiste_nom}/g, contratData.artiste.nom || '')
    .replace(/\[artiste_nom\]/g, contratData.artiste.nom || '')
    ```

27. **src/hooks/dates/useDateForm.js** (ligne 351)
    ```javascript
    artisteNom: artiste.nom
    ```

28. **src/components/contrats/sections/ContratHeader.js** (ligne 24)
    ```javascript
    artiste?.nom && artiste.nom,
    ```

29. **src/components/pdf/ContratPDFWrapper.js** (ligne 1137)
    ```javascript
    Contrat pour {contratData.artiste.nom}
    ```

### Pattern `artisteData.nom` (devrait être `artisteData.artisteNom`)

**Fichiers concernés :**

1. **src/pages/DateCreationPage.js** (ligne 110)
   ```javascript
   const artisteNom = artisteData.nom || artisteData.nomArtiste || artisteData.artisteNom;
   ```

## 3. PROJETS - Variables Problématiques

### Pattern `projet.nom` (devrait être `projet.projetNom`)

**Fichiers concernés :**

1. **src/components/artistes/modal/ArtisteCreationModal.js** (lignes 57, 131, 132, 137, 270, 271)
   ```javascript
   nom: editArtiste.projet.nom || '',
   projets: formData.projet.nom ? [{
   nom: formData.projet.nom,
   projet: formData.projet.nom ? formData.projet : null,
   value={formData.projet.nom}
   onChange={(e) => handleInputChange('projet.nom', e.target.value)}
   ```

2. **src/pages/BookingParametragePage.js** (ligne 323)
   ```javascript
   <span className="ms-2">{artiste.projet.nom}</span>
   ```

3. **src/pages/ConfirmationPage.js** (ligne 210)
   ```javascript
   projetNom = typeof dateData.projet === 'string' ? dateData.projet : dateData.projet.nom || '';
   ```

4. **src/pages/DateCreationPage.js** (lignes 118, 132)
   ```javascript
   const projetNom = projet.nom || projet.projetNom || projet.titre;
   ```

5. **src/pages/ProjetsPage.js** (ligne 290)
   ```javascript
   <strong>{projet.intitule || projet.nom || 'Sans nom'}</strong>
   ```

## 4. MÉLANGES FRANÇAIS/ANGLAIS

### Variables anglaises trouvées :

1. **name** utilisé dans :
   - src/services/firebase-service.js (entreprise.name)
   - src/services/factureService.js (template.name)
   - src/services/searchService.js (saveSearch parameter)
   - src/services/dataService.js (mappings de compatibilité)

2. **firstName/lastName** utilisé dans :
   - src/services/dataService.js (ligne 67-68) - mappings de compatibilité :
     ```javascript
     nom: data.nom || data.name || data.lastName || '',
     prenom: data.prenom || data.firstName || '',
     ```

3. **email** - largement utilisé dans tout le code (acceptable car terme technique standard)

## RECOMMANDATIONS

### 1. Pour les structures :
- Remplacer tous les `structure.nom` par `structure.raisonSociale`
- Remplacer tous les `structureData.nom` par `structureData.raisonSociale`
- Conserver la compatibilité ascendante dans les mappings

### 2. Pour les artistes :
- Remplacer tous les `artiste.nom` par `artiste.artisteNom`
- Remplacer tous les `artisteData.nom` par `artisteData.artisteNom`

### 3. Pour les projets :
- Remplacer tous les `projet.nom` par `projet.projetNom`
- Standardiser sur `projetNom` ou `intitule`

### 4. Pour les variables anglaises :
- Les variables `name`, `firstName`, `lastName` dans dataService.js sont acceptables car utilisées uniquement pour la compatibilité
- L'utilisation de `name` pour les entreprises dans firebase-service.js pourrait être remplacée par `nom`
- `email` est acceptable comme terme technique standard

## PRIORITÉ DES CORRECTIONS

1. **HAUTE** : Structures avec `.nom` → `.raisonSociale` (impact sur la cohérence des données)
2. **HAUTE** : Artistes avec `.nom` → `.artisteNom` (impact sur l'affichage)
3. **MOYENNE** : Projets avec `.nom` → `.projetNom`
4. **BASSE** : Variables anglaises (sauf si utilisées pour compatibilité)