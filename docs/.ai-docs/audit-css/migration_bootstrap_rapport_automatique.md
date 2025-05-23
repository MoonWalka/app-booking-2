# Rapport Automatique - Migration Bootstrap

**Généré le :** 2025-05-23 16:21:26  
**Par :** `tools/css/generate_migration_report.sh`

---

## 📊 **STATISTIQUES EN TEMPS RÉEL**

### Progression Globale
- **Usages Bootstrap restants** : 22
- **Fichiers avec Bootstrap** : 13
- **Usages composant Button** : 346
- **Progression estimée** : 70% (52/74)

### Analyse de l'État
🚀 **BON PROGRÈS !** Plus de 60% de migration accomplie.

---

## 📋 **FICHIERS AVEC USAGES BOOTSTRAP RESTANTS**

### Fichiers à traiter :
- `src//components/concerts/desktop/ConcertHeader.js` (6 usages)
- `src//components/contrats/desktop/sections/CollapsibleSection.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratDebugPanel.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratGenerationActions.js` (1 usages)
- `src//components/contrats/desktop/sections/ContratTemplateHeaderSection.js` (1 usages)
- `src//components/contrats/desktop/sections/UserGuide.js` (1 usages)
- `src//components/lieux/desktop/LieuFormOptimized.js` (2 usages)
- `src//components/lieux/desktop/sections/LieuxListEmptyState.js` (1 usages)
- `src//components/molecules/GenericList.js` (1 usages)
- `src//components/programmateurs/desktop/ProgrammateurConcertsSection.js` (2 usages)
- `src//components/programmateurs/desktop/ProgrammateurLieuxSection.js` (2 usages)
- `src//components/programmateurs/desktop/ProgrammateurStructuresSection.js` (2 usages)
- `src//components/structures/desktop/StructuresList.js` (1 usages)

### Détail des usages :
`src//components/molecules/GenericList.js:71:          <Link to={addButtonLink} className="btn btn-primary">`
`src//components/concerts/desktop/ConcertHeader.js:43:                  <span className="btn-text">Enregistrement...</span>`
`src//components/concerts/desktop/ConcertHeader.js:48:                  <span className="btn-text">Enregistrer</span>`
`src//components/concerts/desktop/ConcertHeader.js:59:              <span className="btn-text">Annuler</span>`
`src//components/concerts/desktop/ConcertHeader.js:68:              <span className="btn-text">Supprimer</span>`
`src//components/concerts/desktop/ConcertHeader.js:80:              <span className="btn-text">Retour</span>`
`src//components/concerts/desktop/ConcertHeader.js:89:              <span className="btn-text">Modifier</span>`
`src//components/structures/desktop/StructuresList.js:226:              <Link to="/structures/new" className="btn btn-primary">`
`src//components/lieux/desktop/sections/LieuxListEmptyState.js:20:              className="btn btn-link p-0 d-inline"`
`src//components/lieux/desktop/LieuFormOptimized.js:179:          className="btn-primary"`
`src//components/lieux/desktop/LieuFormOptimized.js:186:          className="btn-secondary"`
`src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:97:              <Link to={`/structures/${structureData.id}`} className="btn btn-sm btn-outline-primary">`
`src//components/programmateurs/desktop/ProgrammateurStructuresSection.js:108:                className="btn btn-sm btn-outline-primary"`
`src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:171:                    <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">`
`src//components/programmateurs/desktop/ProgrammateurLieuxSection.js:185:                className="btn btn-sm btn-outline-success"`
`src//components/programmateurs/desktop/ProgrammateurConcertsSection.js:68:                <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary">`
`src//components/programmateurs/desktop/ProgrammateurConcertsSection.js:82:            className="btn btn-sm btn-outline-success"`
`src//components/contrats/desktop/sections/ContratTemplateHeaderSection.js:66:                className="btn btn-sm btn-outline-danger"`
`src//components/contrats/desktop/sections/CollapsibleSection.js:13:          className="btn btn-sm btn-outline-secondary"`
`src//components/contrats/desktop/sections/ContratDebugPanel.js:39:              className="btn btn-sm btn-outline-secondary"`

---

## 🎯 **RECOMMANDATIONS D'ACTIONS**

### Phase d'Accélération ⚡
1. **Utiliser le script** `./tools/css/migrate_bootstrap_buttons.sh`
2. **Traiter les fichiers par priorité** (plus d'usages d'abord)
3. **Tester régulièrement** avec `npm run build`
4. **Documenter les cas particuliers**

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
