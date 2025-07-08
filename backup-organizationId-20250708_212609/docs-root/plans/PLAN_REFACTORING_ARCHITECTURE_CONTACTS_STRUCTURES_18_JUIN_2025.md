# Plan de Migration : Architecture Unifiée Contacts-Structures
## Migration vers modèle Business-centrée (Option 2)
**Date de création :** 18 juin 2025  
**Date de révision :** 18 juin 2025

---

## 📋 **Contexte et Objectifs**

### **Problématique actuelle**
Après notre première migration, nous avons :
- ✅ Collection `contacts` (6 personnes) ←→ Collection `structures` (6 structures)
- ❌ **Complexité relationnelle** : Requêtes multiples, maintenance bidirectionnelle
- ❌ **Incompatible avec l'import/export XLS** standard du secteur
- ❌ **Logique business dispersée** entre 2 collections

### **Objectif cible (Retour à la vision initiale)**
Migrer vers un **modèle Business-centrée unifié** inspiré du format XLS professionnel :
- **Document = Structure + Personnes associées** (comme une ligne XLS)
- **Logique business centrée sur la structure** (dates, contrats, négociations)
- **Import/export XLS naturel** (1 ligne = 1 document)
- **Personnes libres** dans des documents séparés

---

## 🏗️ **Architecture Cible Unifiée**

### **Nouveau modèle de données**

```javascript
// Collection: contacts_unified
// Document de type "structure" (entité business principale)
{
  id: "contact_festival_jazz",
  organizationId: "org_456",
  entityType: "structure",
  
  // === DONNÉES STRUCTURE (Entité business principale) ===
  structure: {
    raisonSociale: "Festival de Jazz Contemporain",
    nom: "Festival Jazz", // nom court
    adresse: "123 rue des Festivals",
    suiteAdresse: "",
    codePostal: "75001",
    ville: "Paris",
    departement: "Paris",
    region: "Île-de-France", 
    pays: "France",
    
    // Contact structure
    email: "contact@festivaljazz.com",
    telephone1: "01 23 45 67 89",
    telephone2: "",
    mobile: "06 12 34 56 78",
    fax: "",
    siteWeb: "https://festivaljazz.com",
    
    // Données légales
    siret: "12345678901234",
    tva: "FR12345678901",
    numeroIntracommunautaire: "FR12345678901",
    type: "association", // SARL, SAS, association, etc.
    
    // Métadonnées business
    commentaires1: "",
    commentaires2: "",
    commentaires3: "",
    commentaires4: "",
    commentaires5: "",
    commentaires6: "",
    
    // Données événement
    nomFestival: "Jazz Contemporain 2025",
    periodeFestivalMois: "Juillet",
    periodeFestivalComplete: "Du 15 au 25 juillet 2025",
    
    // Données salle
    salle: {
      nom: "Grand Théâtre",
      adresse: "Place de l'Opéra",
      codePostal: "75001", 
      ville: "Paris",
      departement: "Paris",
      region: "Île-de-France",
      pays: "France",
      telephone: "01 23 45 67 80",
      jauge1: "1200",
      jauge2: "800", 
      jauge3: "400",
      hauteur: "12m",
      profondeur: "20m",
      ouverture: "19h30"
    }
  },
  
  // === PERSONNES ASSOCIÉES (Max 3 comme standard XLS) ===
  personnes: [
    {
      civilite: "M.",
      prenom: "Jean",
      nom: "Dupont", 
      fonction: "Directeur artistique",
      email: "jean.dupont@festivaljazz.com",
      mailPerso: "jean.dupont.perso@gmail.com",
      telephone: "01 23 45 67 90",
      telDirect: "01 23 45 67 91",
      telPerso: "06 11 22 33 44",
      mobile: "06 12 34 56 79",
      fax: "",
      
      // Adresse (si différente de la structure)
      adresse: "",
      suiteAdresse: "",
      codePostal: "",
      ville: "",
      departement: "",
      region: "",
      pays: "France",
      
      // Commentaires
      commentaires1: "Contact principal",
      commentaires2: "",
      commentaires3: "",
      
      // Métadonnées diffusion
      diffusionCommentaires1: "",
      diffusionCommentaires2: "",
      diffusionCommentaires3: ""
    },
    {
      civilite: "Mme",
      prenom: "Marie",
      nom: "Martin",
      fonction: "Assistante de direction",
      email: "marie.martin@festivaljazz.com",
      // ... autres champs personne
    },
    {
      civilite: "",
      prenom: "",
      nom: "",
      fonction: "",
      // ... personne 3 vide (réservé pour croissance)
    }
  ],
  
  // === MÉTADONNÉES SYSTÈME ===
  statut: "actif", // actif, inactif, archivé
  client: false,
  source: "manuel", // manuel, import, api
  tags: ["festival", "jazz", "été"],
  
  // Relations business (IDs externes)
  concertsIds: ["concert_123", "concert_456"],
  lieuxIds: ["lieu_789"],
  artistesIds: ["artiste_101", "artiste_102"],
  
  // Métadonnées techniques
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "user_123",
  dateDerniereModif: timestamp,
  
  // Migration
  migrationVersion: "unified-v2",
  migratedFrom: ["contact_id", "structure_id"], // Traçabilité
  migrationNote: "Unifié depuis collections séparées"
}

// Document de type "personne_libre" (personne sans structure)
{
  id: "contact_personne_libre_123",
  organizationId: "org_456", 
  entityType: "personne_libre",
  
  // === DONNÉES PERSONNE PRINCIPALE ===
  personne: {
    civilite: "M.",
    prenom: "Pierre",
    nom: "Libre",
    fonction: "Consultant indépendant",
    email: "pierre.libre@gmail.com",
    telephone: "06 98 76 54 32",
    
    // Adresse personnelle
    adresse: "456 rue de la Liberté",
    codePostal: "69000",
    ville: "Lyon", 
    pays: "France",
    
    commentaires1: "Contact freelance"
  },
  
  // Pas de structure ni d'autres personnes
  structure: null,
  personnes: [],
  
  // Mêmes métadonnées système que structure
  statut: "actif",
  createdAt: timestamp,
  // ...
}
```

---

## 📋 **Plan d'Implémentation Unifié**

### **🎯 Phase 1 : Analyse et Préparation (1 jour)**

#### ✅ **Audit de l'architecture actuelle**
- [x] Analyser les 6 contacts + 6 structures existants
- [x] Valider les relations bidirectionnelles
- [x] Identifier les groupes structure-personnes
- [x] Vérifier l'intégrité des données

#### ✅ **Conception du modèle unifié**
- [ ] Définir le schéma `contacts_unified`
- [ ] Mapper les champs existants vers le nouveau format
- [ ] Concevoir la logique d'affichage ContactsList
- [ ] Planifier la migration des relations business

#### ✅ **Préparation technique**
- [ ] Créer le service `unifiedContactService.js`
- [ ] Développer le script de migration `migrate-to-unified.js`
- [ ] Préparer les hooks `useUnifiedContact.js`
- [ ] Backup des données actuelles

---

### **🔄 Phase 2 : Migration des Données (1 jour)**

#### ✅ **Script de consolidation**
```javascript
// migrate-to-unified.js
- [ ] Grouper contacts par structure (via structureId)
- [ ] Fusionner structure + personnes en document unifié
- [ ] Migrer contacts libres en documents personne_libre
- [ ] Préserver les relations business (concertsIds, etc.)
- [ ] Valider l'intégrité post-migration
```

#### ✅ **Structure cible de migration**
```
contacts (6) + structures (6) 
    ↓ CONSOLIDATION
contacts_unified (3-4 documents)
├─ Document Festival Jazz + 2 personnes
├─ Document Autre Structure + 1 personne  
├─ Document Personne Libre
└─ ...
```

#### ✅ **Validation de la migration**
- [ ] Vérifier que 0 donnée n'est perdue
- [ ] Valider les relations business
- [ ] Tester les cas edge (personnes sans structure)
- [ ] Créer un rapport de migration détaillé

---

### **⚙️ Phase 3 : Adaptation du Code (1-2 jours)**

#### ✅ **Services core**
- [ ] `unifiedContactService.js` - CRUD unifié
- [ ] `unifiedImportService.js` - Import XLS direct
- [ ] `unifiedExportService.js` - Export XLS standard
- [ ] `unifiedSearchService.js` - Recherche flexible

#### ✅ **Hooks React**
- [ ] `useUnifiedContact(id)` - Chargement unifié
- [ ] `useUnifiedContactsList()` - Liste avec expansion
- [ ] `useUnifiedContactSearch()` - Recherche avancée
- [ ] `useUnifiedContactForm()` - Formulaires adaptatifs

#### ✅ **Composants interface**
- [ ] `UnifiedContactsList` - Affichage structures + personnes
- [ ] `UnifiedContactDetails` - Vue détaillée adaptative
- [ ] `UnifiedContactForm` - Formulaire structure/personne
- [ ] `UnifiedContactSelector` - Sélecteur intelligent

---

### **🖥️ Phase 4 : Interface Utilisateur (1 jour)**

#### ✅ **ContactsList unifié**
```
📋 Tous les contacts
├─ 🏢 Festival Jazz (contact@festival.com) [2 personnes] ▼
│   ├─ 👤 Jean Dupont - Directeur (jean@festival.com)
│   └─ 👤 Marie Martin - Assistante (marie@festival.com)
├─ 🏢 Autre Structure (info@autre.com) [1 personne] ▼
│   └─ 👤 Sophie Durand - Manager (sophie@autre.com)
└─ 👤 Pierre Libre - Consultant (pierre@libre.com)
```

#### ✅ **Logique d'affichage**
- [ ] Mode compact : Structures seulement avec compteur
- [ ] Mode étendu : Structures + personnes visibles
- [ ] Mode liste plate : Toutes les entités au même niveau
- [ ] Filtrage intelligent par type, structure, personne

#### ✅ **Navigation et actions**
- [ ] Clic structure → Ouvre vue structure complète
- [ ] Clic personne → Ouvre vue personne dans contexte structure
- [ ] Actions contextuelles selon le type d'entité
- [ ] Recherche globale dans toutes les données

---

### **📤 Phase 5 : Import/Export XLS Naturel (1 jour)**

#### ✅ **Import XLS optimisé**
```javascript
// Format XLS standard secteur (115 colonnes)
// Ligne 1: Structure + Personne1 + Personne2 + Personne3 + Métadonnées
// ↓ DIRECT
// Document unifié complet
```

#### ✅ **Export XLS standard**
```javascript
// Document unifié
// ↓ EXPANSION
// Ligne XLS: Structure + toutes personnes + métadonnées
```

#### ✅ **Avantages de l'architecture unifiée**
- ✅ **Import direct** : 1 ligne XLS = 1 document
- ✅ **Export naturel** : 1 document = 1 ligne XLS  
- ✅ **Pas de JOIN** : Toutes les données dans un document
- ✅ **Cohérence garantie** : Structure et personnes atomiques

---

### **🧪 Phase 6 : Tests et Validation (1 jour)**

#### ✅ **Tests du modèle unifié**
- [ ] Test des documents structure + personnes
- [ ] Test des documents personne libre
- [ ] Test des cas edge (structure sans personne, etc.)
- [ ] Test des performances sur gros volumes

#### ✅ **Tests de l'interface**
- [ ] Navigation structure ↔ personne
- [ ] Affichage différentiel selon entityType
- [ ] Actions contextuelles
- [ ] Recherche et filtrage avancés

#### ✅ **Tests business**
- [ ] Import XLS → Documents unifiés
- [ ] Export documents → XLS standard
- [ ] Relations business préservées
- [ ] Intégrité des workflows métier

---

### **🚀 Phase 7 : Déploiement (1 jour)**

#### ✅ **Migration de production**
- [ ] Backup complet avant migration
- [ ] Exécution du script de consolidation
- [ ] Validation des résultats
- [ ] Nettoyage des anciennes collections

#### ✅ **Mise en service**
- [ ] Déploiement du nouveau code
- [ ] Test de l'interface unifiée
- [ ] Validation des imports/exports
- [ ] Formation utilisateur express

---

## 🔧 **Scripts de Migration**

### **Script principal : migrate-to-unified.js**
```javascript
#!/usr/bin/env node

async function migrateToUnified() {
  console.log('🔄 Migration vers architecture unifiée');
  
  // 1. Charger données actuelles
  const contacts = await loadContacts();        // 6 personnes
  const structures = await loadStructures();    // 6 structures
  
  // 2. Grouper par structure
  const groupedData = groupContactsByStructure(contacts, structures);
  
  // 3. Créer documents unifiés
  const unifiedDocs = [];
  
  for (const group of groupedData) {
    if (group.structure) {
      // Document structure + personnes
      unifiedDocs.push({
        id: `contact_${group.structure.id}`,
        entityType: 'structure',
        structure: group.structure,
        personnes: group.contacts.map(mapContactToPersonne),
        // ... métadonnées
      });
    } else {
      // Documents personne libre
      group.contacts.forEach(contact => {
        unifiedDocs.push({
          id: `contact_${contact.id}`,
          entityType: 'personne_libre', 
          personne: mapContactToPersonne(contact),
          structure: null,
          personnes: [],
          // ... métadonnées
        });
      });
    }
  }
  
  // 4. Sauvegarder dans contacts_unified
  await saveUnifiedContacts(unifiedDocs);
  
  // 5. Valider migration
  await validateMigration(unifiedDocs);
  
  console.log('✅ Migration vers architecture unifiée terminée');
}
```

---

## 📈 **Bénéfices de l'Architecture Unifiée**

### **Technique**
- ✅ **Simplicité** : Une seule collection à gérer
- ✅ **Performance** : Pas de JOIN, requêtes directes
- ✅ **Cohérence** : Données atomiques, pas de désync possible
- ✅ **Évolutivité** : Structure extensible facilement

### **Business** 
- ✅ **Import/Export XLS naturel** : Compatible secteur 
- ✅ **Logique centrée structure** : Workflow métier optimisé
- ✅ **Relations atomiques** : Structure + personnes indissociables
- ✅ **Recherche flexible** : Par structure ET par personne

### **Utilisateur**
- ✅ **Interface intuitive** : Structure + personnes visibles ensemble
- ✅ **Navigation fluide** : Contexte toujours préservé
- ✅ **Actions cohérentes** : Selon le type d'entité
- ✅ **Productivité** : Moins de clics, plus d'information

---

## 📅 **Planning Optimisé**

| Phase | Durée | Tâches clés |
|-------|-------|-------------|
| 1. Préparation | 1 jour | Conception + backup |
| 2. Migration données | 1 jour | Script consolidation |
| 3. Adaptation code | 1-2 jours | Services + hooks |
| 4. Interface UI | 1 jour | ContactsList unifié |
| 5. Import/Export | 1 jour | XLS naturel |
| 6. Tests | 1 jour | Validation complète |
| 7. Déploiement | 1 jour | Mise en production |

**Total estimé :** 7-8 jours (1.5 semaine)

---

## ⚠️ **Risques et Mitigation**

### **Risques identifiés**
1. **Perte de données** lors de la consolidation
   - *Mitigation* : Backup + validation exhaustive
   
2. **Performance** sur gros documents
   - *Mitigation* : Limitation 3 personnes/structure + indexation

3. **Complexité interface** structure vs personne
   - *Mitigation* : UX claire + tests utilisateur

### **Plan de rollback**
- Restauration collections actuelles depuis backup
- Réactivation ancien code via feature flag
- Script de reconversion si nécessaire

---

## 🎯 **Prochaines Étapes**

1. **Validation du plan** avec équipe/utilisateurs
2. **Préparation technique** (services, hooks)
3. **Développement script de migration**
4. **Tests sur données de dev**
5. **Migration production**

---

**État du plan :** 🟢 Finalisé - Prêt pour implémentation  
**Architecture cible :** Collection unifiée `contacts_unified`  
**Compatibilité :** Import/Export XLS standard secteur  
**Bénéfice principal :** Simplicité + Performance + Cohérence métier