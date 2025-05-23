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
src//components/concerts/sections/ConcertFormHeader.js:3
src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:2
src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:2
src//components/programmateurs/desktop/ProgrammateurConcertsSection.js:2
src//components/programmateurs/desktop/ProgrammateurAddressSection.js:2
src//components/lieux/desktop/sections/LieuxTableRow.js:2
src//components/lieux/desktop/sections/LieuxResultsTable.js:2
src//components/structures/desktop/StructuresList.js:1
src//components/molecules/GenericList.js:1
src//components/lieux/desktop/sections/LieuxListHeader.js:1
## Checklist Migration par Fichier

### GenericList.js
**Chemin:** `src//components/molecules/GenericList.js`

**Usages Bootstrap détectés:**
-           <Link to={addButtonLink} className="btn btn-primary">

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

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

### LieuxTableRow.js
**Chemin:** `src//components/lieux/desktop/sections/LieuxTableRow.js`

**Usages Bootstrap détectés:**
-               className={`btn btn-secondary ${styles.actionButton}`}
-               className={`btn btn-outline-primary ${styles.actionButton}`}

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

- [ ] Import Button ajouté
- [ ] Usages Bootstrap remplacés
- [ ] Test de rendu OK

