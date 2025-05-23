# Rapport Automatique - Migration Bootstrap

**Généré le :** 2025-05-23 16:14:25  
**Par :** `tools/css/generate_migration_report.sh`

---

## 📊 **STATISTIQUES EN TEMPS RÉEL**

### Progression Globale
- **Usages Bootstrap restants** : 31
- **Fichiers avec Bootstrap** : 20
- **Usages composant Button** : 329
- **Progression estimée** : 58% (43/74)

### Analyse de l'État
⚡ **PROGRÈS CORRECT** Plus de 40% de migration accomplie.

---

## 📋 **FICHIERS AVEC USAGES BOOTSTRAP RESTANTS**

### Fichiers à traiter :
- `src//components/common/layout/DesktopLayout.js` (1 usages)
- `src//components/common/layout/MobileLayout.js` (1 usages)
- `src//components/common/steps/StepNavigation.js` (1 usages)
- `src//components/concerts/desktop/ConcertHeader.js` (6 usages)
- `src//components/concerts/desktop/DeleteConcertModal.js` (1 usages)
- `src//components/concerts/sections/DeleteConfirmModal.js` (2 usages)
- `src//components/contrats/desktop/sections/CollapsibleSection.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratDebugPanel.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratGenerationActions.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratTemplateHeaderSection.js` (1 usages)
- `src//components/contrats/desktop/sections/UserGuide.js` (1 usages)
- `src//components/exemples/ArtisteFormExemple.js` (1 usages)
- `src//components/lieux/desktop/LieuFormOptimized.js` (2 usages)
- `src//components/lieux/desktop/sections/LieuxListEmptyState.js` (1 usages)
- `src//components/molecules/GenericList.js` (1 usages)
- `src//components/programmateurs/desktop/ProgrammateurAddressSection.js` (2 usages)
- `src//components/programmateurs/desktop/ProgrammateurConcertsSection.js` (2 usages)
- `src//components/programmateurs/desktop/ProgrammateurLieuxSection.js` (2 usages)
- `src//components/programmateurs/desktop/ProgrammateurStructuresSection.js` (2 usages)
- `src//components/structures/desktop/StructuresList.js` (1 usages)

### Détail des usages :
`src//components/molecules/GenericList.js:71:          <Link to={addButtonLink} className="btn btn-primary">`
`src//components/concerts/sections/DeleteConfirmModal.js:39:            className="btn btn-outline-secondary"`
`src//components/concerts/sections/DeleteConfirmModal.js:47:            className="btn btn-danger"`
`src//components/concerts/desktop/ConcertHeader.js:43:                  <span className="btn-text">Enregistrement...</span>`
`src//components/concerts/desktop/ConcertHeader.js:48:                  <span className="btn-text">Enregistrer</span>`
`src//components/concerts/desktop/ConcertHeader.js:59:              <span className="btn-text">Annuler</span>`
`src//components/concerts/desktop/ConcertHeader.js:68:              <span className="btn-text">Supprimer</span>`
`src//components/concerts/desktop/ConcertHeader.js:80:              <span className="btn-text">Retour</span>`
`src//components/concerts/desktop/ConcertHeader.js:89:              <span className="btn-text">Modifier</span>`
`src//components/concerts/desktop/DeleteConcertModal.js:39:            className="btn btn-danger"`
`src//components/structures/desktop/StructuresList.js:226:              <Link to="/structures/new" className="btn btn-primary">`
`src//components/exemples/ArtisteFormExemple.js:227:                      className="btn btn-sm btn-outline-danger"`
`src//components/lieux/desktop/sections/LieuxListEmptyState.js:20:              className="btn btn-link p-0 d-inline"`
`src//components/lieux/desktop/LieuFormOptimized.js:179:          className="btn-primary"`
`src//components/lieux/desktop/LieuFormOptimized.js:186:          className="btn-secondary"`
`src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:97:              <Link to={`/structures/${structureData.id}`} className="btn btn-sm btn-outline-primary">`
`src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:108:                className="btn btn-sm btn-outline-primary"`
`src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:171:                    <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">`
`src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:185:                className="btn btn-sm btn-outline-success"`
`src//components/programmateurs/desktop/ProgrammateurConcertsSection.js:68:                <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary">`

---

## 🎯 **RECOMMANDATIONS D'ACTIONS**

### Phase de Progression 🚀
1. **Exécuter l'analyse** `./tools/css/migrate_bootstrap_buttons.sh`
2. **Migrer 5-10 fichiers par session**
3. **Prioriser les fichiers** avec le plus d'usages
4. **Maintenir la documentation** à jour

---

## 🛠️ **OUTILS DISPONIBLES**

### Scripts de Migration
- `tools/css/migrate_bootstrap_buttons.sh` - Analyse et guide
- `tools/css/generate_migration_report.sh` - Ce rapport
- `tools/css/cleanup_css_fallbacks.sh` - Nettoyage fallbacks

### Documentation
- `docs/.ai-docs/audit-css/migration_bootstrap_rapport_etapes_1_2_3.md` - Rapport détaillé
- `docs/.ai-docs/audit complex/recommendations_progress_report.md` - Vue globale

### Composant Cible
```jsx
import Button from '@ui/Button';

<Button variant="primary" size="sm" onClick={handleClick}>
  Mon Bouton
</Button>
```

---

**Rapport généré automatiquement** - Exécuter à nouveau pour mise à jour
