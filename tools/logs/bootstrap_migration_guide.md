# Guide Migration Bootstrap → Composants

## Mappings Recommandés

### Boutons Primaires
```jsx
// ❌ AVANT
<button className="btn btn-primary">Action</button>

// ✅ APRÈS  
<Button variant="primary">Action</Button>
```

### Boutons Secondaires
```jsx
// ❌ AVANT
<button className="btn btn-secondary">Action</button>

// ✅ APRÈS
<Button variant="secondary">Action</Button>
```

### Boutons Outline
```jsx
// ❌ AVANT  
<button className="btn btn-outline-primary">Action</button>

// ✅ APRÈS
<Button variant="outline-primary">Action</Button>
```

### Boutons Petits
```jsx
// ❌ AVANT
<button className="btn btn-sm btn-primary">Action</button>

// ✅ APRÈS
<Button size="sm" variant="primary">Action</Button>
```

### Boutons Danger
```jsx
// ❌ AVANT
<button className="btn btn-danger">Supprimer</button>

// ✅ APRÈS  
<Button variant="danger">Supprimer</Button>
```

## Import Nécessaire

Ajouter en haut de chaque fichier migré :
```jsx
import Button from '@ui/Button';
```

## Fichiers Prioritaires (Plus d'usages)

🎯 FICHIERS PRIORITAIRES (plus d'usages):
src//components/lieux/desktop/sections/LieuxTableRow.js:3
src//components/lieux/desktop/sections/LieuxResultsTable.js:3
src//components/lieux/desktop/sections/LieuConcertsSection.js:3
src//components/forms/FormGenerator.js:3
src//components/contrats/desktop/sections/ContratGenerationActions.js:3
src//components/contrats/desktop/ContratTemplateEditor.js:3
src//components/concerts/sections/ConcertFormHeader.js:3
src//components/concerts/sections/ConcertFormActions.js:3
src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:2
src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:2
## Checklist Migration par Fichier

### GenericList.js
**Chemin:** `src//components/molecules/GenericList.js`

**Usages Bootstrap détectés:**
-           <Link to={addButtonLink} className="btn btn-primary">

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ConcertFormActions.js
**Chemin:** `src//components/concerts/sections/ConcertFormActions.js`

**Usages Bootstrap détectés:**
-           className={`btn btn-outline-secondary ${styles.actionButton}`}
-             className={`btn btn-outline-danger ${styles.actionButton}`}
-             className="btn btn-primary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### SearchDropdown.js
**Chemin:** `src//components/concerts/sections/SearchDropdown.js`

**Usages Bootstrap détectés:**
-           className={`btn btn-outline-secondary ${styles.createButton}`}
-                 className="btn btn-sm btn-primary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### DeleteConfirmModal.js
**Chemin:** `src//components/concerts/sections/DeleteConfirmModal.js`

**Usages Bootstrap détectés:**
-             className="btn btn-outline-secondary"
-             className="btn btn-danger"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### SelectedEntityCard.js
**Chemin:** `src//components/concerts/sections/SelectedEntityCard.js`

**Usages Bootstrap détectés:**
-             className={`btn btn-sm btn-outline-secondary ${styles.editButton}`}

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ConcertFormHeader.js
**Chemin:** `src//components/concerts/sections/ConcertFormHeader.js`

**Usages Bootstrap détectés:**
-           className={`btn btn-outline-secondary ${styles.actionBtn}`}
-             className={`btn btn-outline-danger ${styles.actionBtn}`}
-           className={`btn btn-primary ${styles.actionBtn}`}

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### DeleteConcertModal.js
**Chemin:** `src//components/concerts/desktop/DeleteConcertModal.js`

**Usages Bootstrap détectés:**
-             className="btn btn-danger"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### FormGenerator.js
**Chemin:** `src//components/forms/FormGenerator.js`

**Usages Bootstrap détectés:**
-             className="btn btn-primary"
-               className="btn btn-outline-secondary"
-               className="btn btn-outline-primary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### FormValidationInterface.js
**Chemin:** `src//components/forms/validation/FormValidationInterface.js`

**Usages Bootstrap détectés:**
-           className="btn btn-primary mt-3" 
-           className="btn btn-primary mt-3" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### FormValidationInterfaceNew.js
**Chemin:** `src//components/forms/validation/FormValidationInterfaceNew.js`

**Usages Bootstrap détectés:**
-           className="btn btn-primary mt-3" 
-           className="btn btn-primary mt-3" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### StructuresList.js
**Chemin:** `src//components/structures/desktop/StructuresList.js`

**Usages Bootstrap détectés:**
-               <Link to="/structures/new" className="btn btn-primary">

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ArtisteFormExemple.js
**Chemin:** `src//components/exemples/ArtisteFormExemple.js`

**Usages Bootstrap détectés:**
-                       className="btn btn-sm btn-outline-danger"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuStructuresSection.js
**Chemin:** `src//components/lieux/desktop/sections/LieuStructuresSection.js`

**Usages Bootstrap détectés:**
-               className="btn btn-sm btn-outline-primary"
-                     className="btn btn-sm btn-outline-danger ms-2"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuConcertsSection.js
**Chemin:** `src//components/lieux/desktop/sections/LieuConcertsSection.js`

**Usages Bootstrap détectés:**
-               className="btn btn-sm btn-outline-secondary"
-               className="btn btn-sm btn-outline-primary"
-                 className="btn btn-link" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuOrganizerSection.js
**Chemin:** `src//components/lieux/desktop/sections/LieuOrganizerSection.js`

**Usages Bootstrap détectés:**
-                     className="btn btn-outline-secondary"
-                     className="btn btn-sm btn-outline-danger" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuxListHeader.js
**Chemin:** `src//components/lieux/desktop/sections/LieuxListHeader.js`

**Usages Bootstrap détectés:**
-         className={`btn btn-primary d-flex align-items-center gap-2 ${styles.addButton}`}

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuxListEmptyState.js
**Chemin:** `src//components/lieux/desktop/sections/LieuxListEmptyState.js`

**Usages Bootstrap détectés:**
-               className="btn btn-link p-0 d-inline"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuxResultsTable.js
**Chemin:** `src//components/lieux/desktop/sections/LieuxResultsTable.js`

**Usages Bootstrap détectés:**
-       <a className={`btn btn-secondary ${styles.actionButton}`} href={`/lieux/${lieu.id}`} title="Voir">
-       <a className={`btn btn-outline-primary ${styles.actionButton}`} href={`/lieux/edit/${lieu.id}`} title="Éditer">
-       <button className={`btn btn-danger ${styles.actionButton}`} onClick={() => onDeleteLieu(lieu.id)} title="Supprimer">

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuxTableRow.js
**Chemin:** `src//components/lieux/desktop/sections/LieuxTableRow.js`

**Usages Bootstrap détectés:**
-               className={`btn btn-secondary ${styles.actionButton}`}
-               className={`btn btn-outline-primary ${styles.actionButton}`}
-               className={`btn btn-danger ${styles.actionButton}`}

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ProgrammateurStructuresSection.js
**Chemin:** `src//components/programmateurs/desktop/ProgrammateurStructuresSection.js`

**Usages Bootstrap détectés:**
-               <Link to={`/structures/${structureData.id}`} className="btn btn-sm btn-outline-primary">
-                 className="btn btn-sm btn-outline-primary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ProgrammateurLieuxSection.js
**Chemin:** `src//components/programmateurs/desktop/ProgrammateurLieuxSection.js`

**Usages Bootstrap détectés:**
-                     <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">
-                 className="btn btn-sm btn-outline-success"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### DeleteProgrammateurModal.js
**Chemin:** `src//components/programmateurs/desktop/DeleteProgrammateurModal.js`

**Usages Bootstrap détectés:**
-                 className="btn btn-secondary" 
-                 className="btn btn-danger" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ProgrammateurConcertsSection.js
**Chemin:** `src//components/programmateurs/desktop/ProgrammateurConcertsSection.js`

**Usages Bootstrap détectés:**
-                 <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary">
-             className="btn btn-sm btn-outline-success"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ProgrammateurAddressSection.js
**Chemin:** `src//components/programmateurs/desktop/ProgrammateurAddressSection.js`

**Usages Bootstrap détectés:**
-                 className="btn btn-outline-secondary"
-               className="btn btn-sm btn-outline-secondary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### DesktopLayout.js
**Chemin:** `src//components/common/layout/DesktopLayout.js`

**Usages Bootstrap détectés:**
-               <button onClick={handleLogout} className="btn btn-sm btn-outline-light">

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### MobileLayout.js
**Chemin:** `src//components/common/layout/MobileLayout.js`

**Usages Bootstrap détectés:**
-               <button onClick={handleLogout} className="btn btn-sm btn-outline-light">

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### StepNavigation.js
**Chemin:** `src//components/common/steps/StepNavigation.js`

**Usages Bootstrap détectés:**
-           className="btn btn-outline-secondary" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ContratTemplateEditor.js
**Chemin:** `src//components/contrats/desktop/ContratTemplateEditor.js`

**Usages Bootstrap détectés:**
-               className="btn btn-outline-secondary" 
-               className="btn btn-outline-primary" 
-               className="btn btn-primary" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ContratTemplateHeaderSection.js
**Chemin:** `src//components/contrats/desktop/sections/ContratTemplateHeaderSection.js`

**Usages Bootstrap détectés:**
-                 className="btn btn-sm btn-outline-danger"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### CollapsibleSection.js
**Chemin:** `src//components/contrats/desktop/sections/CollapsibleSection.js`

**Usages Bootstrap détectés:**
-           className="btn btn-sm btn-outline-secondary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ContratDebugPanel.js
**Chemin:** `src//components/contrats/desktop/sections/ContratDebugPanel.js`

**Usages Bootstrap détectés:**
-               className="btn btn-sm btn-outline-secondary"

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### UserGuide.js
**Chemin:** `src//components/contrats/desktop/sections/UserGuide.js`

**Usages Bootstrap détectés:**
-         className="btn btn-sm btn-outline-secondary" 

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### ContratGenerationActions.js
**Chemin:** `src//components/contrats/desktop/sections/ContratGenerationActions.js`

**Usages Bootstrap détectés:**
-             className="btn btn-primary"
-                   <button className="btn btn-danger" disabled>
-           <button className="btn btn-warning" disabled>

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

