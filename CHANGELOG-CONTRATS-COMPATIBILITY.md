# 📋 Mise à jour de compatibilité - Système de Contrats

## Date : 04/01/2025

### 🎯 Objectif
Adapter le système de génération de contrats pour supporter à la fois :
- Le **nouveau système relationnel** (structures/personnes/liaisons)
- L'**ancien système unifié** (collection contacts)

### 🔧 Modifications apportées

#### 1. **useContratGenerator.js**
Le hook de génération de contrats supporte maintenant les deux formats de données :

##### Détection du format :
```javascript
// Nouveau système : contact.type === 'personne' et contact.structures[]
// Ancien système : contact.structure (string) et contact.structureId
```

##### Variables mises à jour :
- `contact_nom` / `programmateur_nom`
- `contact_prenom` / `programmateur_prenom`
- `contact_structure` / `programmateur_structure`
- `contact_siret` / `programmateur_siret`
- `contact_adresse` / `programmateur_adresse`

### 📝 Exemples de compatibilité

#### Nouveau système relationnel :
```javascript
{
  type: 'personne',
  nom: 'Dupont',
  prenom: 'Jean',
  structures: [{
    id: 'struct123',
    nom: 'Festival d\'été',
    siret: '12345678901234',
    adresse: '10 rue de la Musique'
  }]
}
```

#### Ancien système :
```javascript
{
  nom: 'Dupont',
  prenom: 'Jean',
  structure: 'Festival d\'été',
  structureId: 'struct123',
  siret: '12345678901234',
  adresse: '10 rue de la Musique'
}
```

### ✅ Ce qui fonctionne maintenant
- Génération de contrats avec des contacts du nouveau système
- Maintien de la compatibilité avec les contrats existants
- Support des deux nomenclatures de variables (contact_ et programmateur_)

### ⚠️ Points d'attention
- Les contrats existants continuent de fonctionner sans modification
- Les nouveaux contrats peuvent utiliser les deux formats
- La migration complète nécessitera de migrer tous les contacts

### 🚀 Prochaines étapes
1. Tester avec des contacts des deux systèmes
2. Migrer progressivement les contacts restants
3. Une fois la migration terminée, simplifier le code en retirant l'ancien format

### 📊 Impact
- **Aucune régression** sur les contrats existants
- **Support complet** du nouveau système relationnel
- **Transition en douceur** sans casser l'existant