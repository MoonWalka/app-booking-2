# 📊 MAPPING VALIDATION FORMULAIRE → ENTITÉS V2

**Date de mise à jour :** 29 mai 2025  
**Statut :** ✅ **MAPPING CORRIGÉ ET OPTIMISÉ**

---

## 🎯 **OBJECTIF DE LA CORRECTION**

Corriger le mapping depuis la validation du formulaire vers les bonnes entités de données selon les règles métier :
- **Contact** → Programmateur *(bientôt renommé "contact")*
- **Structure** → Entité Structure séparée (module structures)
- **Lieu** → Entité Lieu (création/mise à jour automatique)

---

## 📋 **MAPPING DÉTAILLÉ**

### **1. 👤 INFORMATIONS DE CONTACT → PROGRAMMATEUR**

```javascript
// Champs validés : contact.*
validatedFields = {
  'contact.nom': 'Dupont',
  'contact.prenom': 'Jean', 
  'contact.email': 'jean.dupont@example.com',
  'contact.telephone': '06 12 34 56 78',
  'contact.adresse': '123 rue de la Paix',
  'contact.codePostal': '75001',
  'contact.ville': 'Paris'
}

// ⬇️ MAPPING VERS : Collection 'programmateurs'
{
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com', 
  telephone: '06 12 34 56 78',
  adresse: '123 rue de la Paix',
  codePostal: '75001',
  ville: 'Paris',
  structureId: 'ID_STRUCTURE_ASSOCIEE', // Référence vers structure
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Logique :**
- ✅ **Si programmateur existe** → Mise à jour avec données contact uniquement
- ✅ **Si programmateur n'existe pas** → Création automatique avec données contact

### **2. 🏢 INFORMATIONS DE STRUCTURE → ENTITÉ STRUCTURE**

```javascript
// Champs validés : structure.*
validatedFields = {
  'structure.raisonSociale': 'SOCIÉTÉ NATIONALE SNCF',
  'structure.type': 'entreprise',
  'structure.siret': '55204944776279',
  'structure.adresse': '2 PLACE AUX ETOILES',
  'structure.codePostal': '93210',
  'structure.ville': 'LA PLAINE ST DENIS',
  'structure.tva': 'FR123456789'
}

// ⬇️ MAPPING VERS : Collection 'structures'
{
  nom: 'SOCIÉTÉ NATIONALE SNCF',
  type: 'entreprise',
  siret: '55204944776279',
  adresse: {
    adresse: '2 PLACE AUX ETOILES',
    codePostal: '93210', 
    ville: 'LA PLAINE ST DENIS',
    pays: 'France'
  },
  tva: 'FR123456789',
  programmateursAssocies: [
    {
      id: 'PROGRAMMATEUR_ID',
      nom: 'Jean Dupont',
      dateAssociation: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Logique :**
- ✅ **Si structure avec SIRET existe** → Mise à jour structure existante
- ✅ **Si structure n'existe pas + SIRET fourni** → Création avec SIRET comme ID
- ✅ **Si structure n'existe pas + pas de SIRET** → Création avec ID automatique
- ✅ **Association bidirectionnelle** : Structure ↔ Programmateur

### **3. 📍 INFORMATIONS DE LIEU → ENTITÉ LIEU**

```javascript
// Champs validés : lieu.*
validatedFields = {
  'lieu.nom': 'Salle Pleyel',
  'lieu.adresse': '252 Rue du Faubourg Saint-Honoré',
  'lieu.codePostal': '75008',
  'lieu.ville': 'Paris',
  'lieu.capacite': '2000'
}

// ⬇️ MAPPING VERS : Collection 'lieux'
{
  nom: 'Salle Pleyel',
  adresse: '252 Rue du Faubourg Saint-Honoré',
  codePostal: '75008',
  ville: 'Paris',
  capacite: 2000,
  programmateursAssocies: [
    {
      id: 'PROGRAMMATEUR_ID',
      nom: 'Jean Dupont',
      dateAssociation: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Logique :**
- ✅ **Si lieu associé au concert** → Mise à jour lieu existant
- ✅ **Si pas de lieu associé + données complètes** → Création automatique nouveau lieu
- ✅ **Association** : Ajout programmateur à la liste des programmateurs associés

---

## 🔄 **ASSOCIATIONS BIDIRECTIONNELLES**

### **Programmateur ↔ Structure**
```javascript
// Dans programmateurs collection
{
  structureId: 'STRUCTURE_ID',
  structureNom: 'SOCIÉTÉ NATIONALE SNCF'
}

// Dans structures collection  
{
  programmateursAssocies: [
    { id: 'PROGRAMMATEUR_ID', nom: 'Jean Dupont', dateAssociation: Timestamp }
  ]
}
```

### **Lieu ↔ Programmateur**
```javascript
// Dans lieux collection
{
  programmateursAssocies: [
    { id: 'PROGRAMMATEUR_ID', nom: 'Jean Dupont', dateAssociation: Timestamp }
  ]
}
```

---

## 📊 **MISE À JOUR DU CONCERT**

```javascript
// Concert mis à jour avec toutes les références
{
  // Références aux entités
  programmateurId: 'PROGRAMMATEUR_ID',
  structureId: 'STRUCTURE_ID',
  lieuId: 'LIEU_ID',
  
  // Champs dénormalisés pour affichage rapide
  programmateurNom: 'Dupont',
  programmateurPrenom: 'Jean',
  programmateurEmail: 'jean.dupont@example.com',
  
  structureRaisonSociale: 'SOCIÉTÉ NATIONALE SNCF',
  structureSiret: '55204944776279',
  
  lieuNom: 'Salle Pleyel',
  lieuVille: 'Paris',
  
  // Métadonnées validation
  formValidated: true,
  formSubmissionId: 'FORM_SUBMISSION_ID',
  formValidatedAt: Timestamp
}
```

---

## 🛠️ **LOGIQUE TECHNIQUE**

### **1. Séparation des Champs**
```javascript
const contactFields = {}; // contact.*
const structureFields = {}; // structure.*  
const lieuFields = {}; // lieu.*

Object.entries(validatedFields).forEach(([fieldPath, value]) => {
  const [category, field] = fieldPath.split('.');
  
  if (category === 'contact') contactFields[field] = value;
  else if (category === 'structure') structureFields[field] = value;
  else if (category === 'lieu') lieuFields[field] = value;
});
```

### **2. Traitement Séquentiel**
1. **Contact** → Création/mise à jour programmateur
2. **Structure** → Création/mise à jour structure + association avec programmateur
3. **Lieu** → Création/mise à jour lieu + association avec programmateur
4. **Concert** → Mise à jour avec toutes les références

### **3. Gestion des Services**
```javascript
import { ensureStructureEntity } from '@/services/structureService';

// Utilisation du service structures pour créer/mettre à jour
await ensureStructureEntity(structureId, structureData);
```

---

## ✅ **AVANTAGES DU NOUVEAU MAPPING**

### **📈 Architecture Modulaire**
- **Entités séparées** : Contact, Structure, Lieu ont leurs propres collections
- **Références cohérentes** : Chaque concert référence ses entités associées
- **Services dédiés** : Chaque entité a son service (structureService, etc.)

### **🔗 Associations Bidirectionnelles**
- **Structure ↔ Programmateur** : Synchronisation automatique
- **Lieu ↔ Programmateur** : Historique des associations
- **Pas de duplication** : Une seule source de vérité par entité

### **⚡ Performance**
- **Dénormalisation selective** : Champs rapides dans concert
- **Lazy loading** : Détails chargés à la demande
- **Cache efficace** : Entités séparées = cache granulaire

### **🧪 Maintenabilité**
- **Responsabilités claires** : Chaque service gère son domaine
- **Evolution facile** : Ajout de champs sans impact sur autres entités
- **Tests isolés** : Chaque mapping testable indépendamment

---

## 🎯 **RÉSULTAT FINAL**

```
📊 FORMULAIRE VALIDÉ
          ⬇️
┌─────────────────────────────────────┐
│        RÉPARTITION DONNÉES         │
├─────────────────────────────────────┤
│ contact.* → 👤 PROGRAMMATEUR       │
│ structure.* → 🏢 STRUCTURE         │
│ lieu.* → 📍 LIEU                   │
└─────────────────────────────────────┘
          ⬇️
┌─────────────────────────────────────┐
│         🎵 CONCERT MIS À JOUR       │
│                                     │
│ ✅ programmateurId: REF             │
│ ✅ structureId: REF                 │ 
│ ✅ lieuId: REF                      │
│ ✅ Champs dénormalisés              │
└─────────────────────────────────────┘
```

**🚀 Les données du formulaire sont maintenant correctement distribuées vers leurs entités respectives avec un mapping cohérent et performant !**

---

*Mapping corrigé par l'équipe technique TourCraft*  
*Date : 29 mai 2025*  
*Statut : ✅ **ARCHITECTURE MODULAIRE IMPLÉMENTÉE*** 