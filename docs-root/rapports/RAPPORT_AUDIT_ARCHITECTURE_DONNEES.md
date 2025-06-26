# RAPPORT D'AUDIT : ARCHITECTURE DES DONNÉES ET LOGIQUE DE FILTRAGE

**Date :** 21 juin 2025  
**Objectif :** Comprendre les relations entre entités et la logique de filtrage des concerts par contact  
**Branche :** nouvelle-interface  

---

## 🏗️ ARCHITECTURE DES COLLECTIONS FIREBASE

### Collections principales
- **`concerts`** : Collection principale des événements/dates
- **`contacts_unified`** : Collection unifiée des contacts (structures + personnes)
- **`lieux`** : Collection des salles/venues
- **`artistes`** : Collection des artistes

### Structure des documents

#### Collection `concerts`
```javascript
{
  id: "concert_id",
  organizationId: "org_id",          // Filtrage multi-organisation
  
  // CHAMPS DE LIAISON PRINCIPAUX
  structureNom: "Nom de structure",   // 🔑 CHAMP MAÎTRE pour filtrage
  structureId: "structure_id",        // Référence structure (optionnel)
  contactId: "contact_id",            // Contact principal (rétrocompatibilité)
  contactIds: ["contact1", "contact2"], // Multi-contacts (évolution future)
  contactNom: "Nom du contact",       // Cache du nom
  
  // Autres liaisons
  lieuId: "lieu_id",
  lieuNom: "Nom du lieu",
  artisteId: "artiste_id",
  artisteNom: "Nom de l'artiste",
  
  // Données du concert
  date: Timestamp,
  dateFin: Timestamp,
  montant: number,
  statut: "contact|option|confirme|annule",
  // ... autres champs
}
```

#### Collection `contacts_unified`
```javascript
{
  id: "contact_id",
  entityType: "structure|personne_libre",
  organizationId: "org_id",
  
  // Pour entityType: "structure"
  structure: {
    raisonSociale: "Raison sociale",  // 🔑 CHAMP MAÎTRE correspondant
    nom: "Nom commercial",
    email: "contact@structure.com",
    // ... autres champs structure
    salle: {
      nom: "Nom de la salle",
      // ... champs salle
    }
  },
  
  personnes: [                        // Personnes associées à la structure
    {
      prenom: "Prénom",
      nom: "Nom",
      fonction: "Fonction",
      email: "personne@email.com"
    }
  ],
  
  qualification: {
    tags: ["programmateur", "festival", "salle"]
  },
  
  // Pour entityType: "personne_libre"
  personne: {
    prenom: "Prénom",
    nom: "Nom",
    email: "email@personne.com"
  }
}
```

---

## 🔗 RELATIONS ET LIAISONS

### Liaison principale : Concert ↔ Contact
**Mécanisme actuel :** Chaîne de caractères via `structureNom`

```
concerts.structureNom === contacts_unified.structure.raisonSociale
```

### Schéma des relations
```
Contact (Structure)
├── structure.raisonSociale ─────┐
├── personnes[]                  │ (LIAISON PAR NOM)
└── qualification.tags           │
                                 ▼
Concert                          │
├── structureNom ────────────────┘
├── structureId (optionnel)
├── contactId (rétrocompatibilité)
├── lieuId → Lieu
└── artisteId → Artiste
```

---

## 📊 LOGIQUE DE FILTRAGE ACTUELLE

### 1. TableauDeBordPage.js (Toutes les dates)
```javascript
// Charge TOUTES les dates de l'organisation
const concertsQuery = query(
  collection(db, 'concerts'),
  where('organizationId', '==', currentOrg.id),
  orderBy('date', 'desc')
);
```
**Critère :** `organizationId` uniquement

### 2. ContactViewTabs.js (Dates du contact)
```javascript
// Filtre par nom de structure
const concertsQuery = query(
  collection(db, 'concerts'),
  where('organizationId', '==', organizationId),
  where('structureNom', '==', structureName)  // 🔑 FILTRAGE PRINCIPAL
);
```
**Critères :** `organizationId` + `structureNom`

**Source du structureName :**
```javascript
const structureName = useMemo(() => 
  extractedData?.structureRaisonSociale, 
  [extractedData?.structureRaisonSociale]
);
```

### 3. ContactBottomTabs.js (Affichage des dates)
```javascript
// Reçoit les données déjà filtrées
<ContactDatesTable 
  contactId={contactId}
  concerts={datesData}  // Déjà filtré par ContactViewTabs
  onAddClick={() => {
    if (extractedData?.structureRaisonSociale) {
      openDateCreationTab(extractedData.structureRaisonSociale);
    }
  }}
/>
```

---

## ⚙️ HOOKS ET SERVICES

### Hook principal : useUnifiedContact
- **Fonction :** Charge un contact depuis `contacts_unified`
- **Retour :** Contact avec `entityType` et données normalisées
- **Cache :** Désactivé (simple et direct)

### Hook concerts : useConcertDetails
- **Fonction :** Charge un concert avec ses relations
- **Relations :** `lieu`, `contacts`, `artiste`, `structure`
- **Logique :** Utilise `useGenericEntityDetails` avec configuration

### Configuration entités : entityConfigurations.js
- **Concert relations :**
  ```javascript
  contact: { 
    collection: 'contacts', 
    field: 'contactIds',     // Multi-contacts (évolution)
    isArray: true,
    displayName: 'Contacts',
    bidirectional: true,
    inverseField: 'concertsIds'
  }
  ```

---

## 🎯 DONNÉE MAÎTRE DE LIAISON

### Champ principal actuel
**`concerts.structureNom` ↔ `contacts_unified.structure.raisonSociale`**

### Avantages
- ✅ Simple à comprendre
- ✅ Lisible dans les requêtes
- ✅ Pas de jointures complexes

### Inconvénients
- ❌ Fragile si nom de structure change
- ❌ Duplication de données
- ❌ Pas de contrainte d'intégrité référentielle
- ❌ Sensible aux erreurs de saisie (casse, espaces)

---

## 🔍 ALTERNATIVES DE LIAISON

### Option A : Liaison par ID de structure
```javascript
// Dans concerts
{
  structureId: "contact_unified_id",  // ID Firebase stable
  structureNom: "Cache pour affichage"
}

// Requête modifiée
query(
  collection(db, 'concerts'),
  where('organizationId', '==', organizationId),
  where('structureId', '==', contactId)
);
```

### Option B : Liaison directe par contact
```javascript
// Dans concerts
{
  contactIds: ["contact1", "contact2"],  // Multi-contacts
  primaryContactId: "contact1"           // Contact principal
}

// Requête modifiée
query(
  collection(db, 'concerts'),
  where('organizationId', '==', organizationId),
  where('contactIds', 'array-contains', contactId)
);
```

### Option C : Table de jointure
```javascript
// Collection contact_concerts
{
  concertId: "concert_id",
  contactId: "contact_id",
  role: "programmateur|diffuseur|coproducteur",
  organizationId: "org_id"
}
```

---

## 🔧 ARCHITECTURE LOGIQUE MÉTIER

### Workflow actuel
1. **Utilisateur** ouvre un contact dans ContactViewTabs
2. **Hook** `useUnifiedContact` charge le contact depuis `contacts_unified`
3. **Extraction** de `structure.raisonSociale` vers `structureName`
4. **Requête** concerts filtrés par `organizationId` + `structureNom`
5. **Affichage** dans ContactBottomTabs → ContactDatesTable

### Points de filtrage
```
TableauDeBordPage ──┐
                    ├── organizationId ──→ TOUS les concerts
ContactViewTabs ────┘
                    └── organizationId + structureNom ──→ concerts du contact
```

---

## 🚨 PROBLÈMES IDENTIFIÉS

### 1. Fragilité des noms
- Si `structure.raisonSociale` change, la liaison se casse
- Sensibilité aux caractères spéciaux, espaces, casse

### 2. Duplication de données
- `structureNom` stocké dans chaque concert
- Risque d'incohérence si pas synchronisé

### 3. Performance
- Index Firebase nécessaire sur `organizationId + structureNom`
- Pas de contraintes d'intégrité

### 4. Évolutivité limitée
- Pas de support natif pour multi-contacts par concert
- Difficile d'ajouter des rôles (programmateur vs diffuseur)

---

## 💡 RECOMMANDATIONS

### Court terme (Migration sécurisée)
1. **Ajouter structureId** en parallèle de structureNom
2. **Migrer progressivement** vers la liaison par ID
3. **Garder structureNom** comme cache d'affichage

### Moyen terme (Architecture robuste)
1. **Implémenter contactIds** pour multi-contacts
2. **Ajouter rôles** dans les relations contact-concert
3. **Index composites** pour performance

### Long terme (Architecture avancée)
1. **Table de jointure** contact_concerts avec rôles
2. **Système de synchronisation** bidirectionnelle
3. **Contraintes d'intégrité** via Cloud Functions

---

## 📋 CRITÈRE DE FILTRAGE ACTUEL

**Pour afficher les dates d'un contact :**
```javascript
// Critère utilisé dans ContactViewTabs.js ligne 369
where('structureNom', '==', structureName)

// Où structureName provient de :
extractedData?.structureRaisonSociale
```

**Donc pour filtrer les concerts d'un contact, il faut :**
- `organizationId` (multi-tenant)
- `structureNom` = valeur exacte de `structure.raisonSociale` du contact

---

## 🎯 CONCLUSION

L'architecture actuelle utilise une **liaison par nom de structure** (`structureNom`) comme donnée maître pour filtrer les concerts par contact. Bien que fonctionnelle, cette approche présente des fragilités importantes.

**Le critère de filtrage exact est :**
```sql
WHERE organizationId = :orgId 
AND structureNom = :structure.raisonSociale
```

Pour implémenter une fonctionnalité de filtrage robuste, il est recommandé de migrer vers une liaison par ID tout en gardant la compatibilité avec le système actuel.