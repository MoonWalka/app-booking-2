# Proposition de Corrections Suite à l'Audit des Pages - Janvier 2025

## Problèmes Identifiés et Solutions Proposées

### 1. 🔴 PROBLÈME CRITIQUE : Architecture Page Contrats

**Problème** : La page ContratDetailsPage gère directement les routes au lieu d'utiliser ContratsPage
```javascript
// Actuellement dans App.js
<Route path="/contrats/:id" element={<PrivateRoute><ContratDetailsPage /></PrivateRoute>} />
```

**Solution proposée** :
```javascript
// 1. Créer ContratsPage.js avec architecture standard
function ContratsPage() {
  return (
    <Routes>
      <Route path="/" element={<ContratsList />} />
      <Route path="/nouveau" element={<ContratForm />} />
      <Route path="/:id" element={<ContratDetails />} />
      <Route path="/:id/modifier" element={<ContratForm />} />
    </Routes>
  );
}

// 2. Modifier App.js
<Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
```

### 2. 🔴 PROBLÈME CRITIQUE : Structures de Données Imbriquées

**Problème** : ContactFormMaquette utilise des structures imbriquées
```javascript
// Actuellement
formData: {
  contact: { nom, prenom, email },
  structure: { raisonSociale, siret }
}
```

**Solution proposée** :
```javascript
// Structure plate recommandée
formData: {
  nom, prenom, email,
  structureRaisonSociale, structureSiret
}
```

### 3. 🟠 PROBLÈME : StructureForm n'utilise pas useStructureForm

**Problème** : Le formulaire gère manuellement 1256 lignes de logique

**Solution proposée** :
```javascript
// Remplacer la logique manuelle par :
const StructureForm = () => {
  const { id } = useParams();
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    // ... autres méthodes du hook
  } = useStructureForm(id || 'nouveau');
  
  // Composant simplifié à ~200 lignes
};
```

### 4. 🟠 PROBLÈME : Relations Bidirectionnelles Incomplètes

**État actuel** :
- ✅ Concerts → Artistes/Lieux/Contacts
- ✅ Lieux → Contacts  
- ✅ Contacts → Lieux/Structures (après correction)
- ❌ Structures → Contacts (manquant)
- ❌ Contrats → Concerts/Structures (manquant)

**Solution proposée** :

#### A. Corriger useStructureForm
```javascript
// Dans onSuccessCallback
if (savedData.contactsIds && savedData.contactsIds.length > 0) {
  for (const contactId of savedData.contactsIds) {
    await updateBidirectionalRelation({
      sourceType: 'structures',
      sourceId: savedData.id,
      targetType: 'contacts',
      targetId: contactId,
      relationName: 'contacts',
      action: 'add'
    });
  }
}
```

#### B. Créer useContratForm
```javascript
const useContratForm = (contratId) => {
  const formHook = useGenericEntityForm({
    entityType: 'contrats',
    entityId: contratId,
    // ...
  });
  
  const onSuccessCallback = async (savedData) => {
    // Gérer relation avec concert
    if (savedData.concertId) {
      await updateBidirectionalRelation({
        sourceType: 'contrats',
        sourceId: savedData.id,
        targetType: 'concerts',
        targetId: savedData.concertId,
        relationName: 'concert',
        action: 'add'
      });
    }
    
    // Gérer relation avec structure
    if (savedData.structureId) {
      await updateBidirectionalRelation({
        sourceType: 'contrats',
        sourceId: savedData.id,
        targetType: 'structures',
        targetId: savedData.structureId,
        relationName: 'structure',
        action: 'add'
      });
    }
  };
  
  return { ...formHook };
};
```

### 5. 🟡 PROBLÈME : Affichage des Relations dans les Vues

**Problème** : Certaines vues chargent les relations via des requêtes directes

**Solution proposée** :
1. Créer un hook générique `useEntityWithRelations`
2. L'utiliser dans toutes les vues de détails
3. Gérer le cache et l'optimisation

## Plan d'Implémentation

### Phase 1 (Immédiat)
1. ✅ Corriger useStructureForm pour les relations bidirectionnelles
2. ✅ Créer useContratForm avec gestion des relations
3. ✅ Refactoriser ContratsPage avec architecture standard

### Phase 2 (Court terme)
1. ⏳ Migrer StructureForm vers useStructureForm
2. ⏳ Éliminer les structures imbriquées dans ContactFormMaquette
3. ⏳ Créer ContratForm utilisant useContratForm

### Phase 3 (Moyen terme)
1. ⏳ Créer useEntityWithRelations générique
2. ⏳ Harmoniser toutes les vues de détails
3. ⏳ Documenter les patterns

## Impact Attendu

- **Relations bidirectionnelles** : 100% cohérentes
- **Réduction de code** : -70% dans les formulaires
- **Maintenabilité** : Architecture standardisée
- **Performance** : Moins de requêtes grâce au cache

---
*Proposition créée le 6 janvier 2025*