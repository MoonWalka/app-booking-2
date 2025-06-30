# AUDIT - Système d'Affichage des Factures

## Résumé Exécutif

L'audit révèle plusieurs problèmes de mapping entre les propriétés sauvegardées par `FactureGeneratorPage` et celles attendues par `FacturesPage` et `ContratsTable`.

## 1. PROBLÈMES IDENTIFIÉS

### 1.1 Propriétés manquantes dans la sauvegarde

Les factures sont sauvegardées avec certaines propriétés mais `ContratsTable` en attend d'autres :

**Propriétés sauvegardées (FactureGeneratorPage):**
```javascript
{
  numeroFacture: string,
  reference: string,
  montantHT: number,
  tauxTVA: number,
  montantTVA: number,
  montantTTC: number,
  dateFacture: string,
  dateEcheance: string,
  status: 'draft',
  concertId: string,
  contratId: string,
  // + toutes les propriétés de facture (type, objet, etc.)
}
```

**Propriétés attendues (ContratsTable):**
```javascript
{
  ref: string,              // ❌ Utilise 'ref' au lieu de 'reference'
  destinataire: string,     // ❌ Manquant - devrait mapper structureNom
  emetteur: string,         // ❌ Manquant - devrait mapper organisationNom
  nature: string,           // ❌ Manquant - devrait mapper type
  projet: string,           // ❌ Manquant - pourrait mapper concert info
  dateEvenement: string,    // ❌ Manquant - date du concert
  montantTTC: number,       // ✅ OK
  devise: string,           // ❌ Manquant - défaut 'EUR'
  statut: string,           // ❌ Manquant - différent de 'status'
  etat: string,             // ❌ Manquant
  envoyee: boolean,         // ❌ Manquant
  payee: boolean,           // ❌ Manquant
  datePaiement: string,     // ❌ Manquant
  exportee: boolean,        // ❌ Manquant
  montantPaye: number,      // ❌ Manquant
}
```

### 1.2 Problème de collection Firebase

**FacturesPage** cherche dans la collection racine :
```javascript
collection(db, 'factures')
```

**FactureGeneratorPage** sauvegarde dans l'organisation :
```javascript
collection(db, 'organizations', organizationId, 'factures')
```

❌ **Les factures ne sont pas au même endroit !**

### 1.3 Mapping des statuts

ContratsTable utilise des badges pour afficher les statuts mais les valeurs ne correspondent pas :
- `statut`: 'payee', 'envoyee', 'en_attente'
- `etat`: 'validee', 'brouillon', 'annulee'

Mais FactureGeneratorPage sauvegarde seulement `status: 'draft'`.

## 2. SOLUTIONS RECOMMANDÉES

### 2.1 Corriger la collection dans FacturesPage

```javascript
// Remplacer dans FacturesPage.js ligne 24-27
const facturesQuery = query(
  collection(db, 'organizations', currentOrganization.id, 'factures'), 
  orderBy('dateFacture', 'desc')
);
```

### 2.2 Enrichir les données sauvegardées

Dans FactureGeneratorPage, ajouter les propriétés manquantes :

```javascript
const factureData = {
  // Existant
  ...facture,
  numeroFacture: numeroFacture,
  reference: numeroFacture,
  
  // À ajouter pour ContratsTable
  ref: numeroFacture,                          // Dupliquer pour compatibilité
  destinataire: factura.structureNom,          // Nom du client
  emetteur: factura.organisationNom,           // Nom de l'émetteur
  nature: factura.type || 'facture',           // Type de facture
  projet: factura.concertData?.nom || '',      // Nom du concert
  dateEvenement: factura.concertData?.date,    // Date du concert
  devise: 'EUR',                               // Devise par défaut
  statut: 'en_attente',                        // Statut de paiement
  etat: 'brouillon',                           // État de validation
  envoyee: false,                              // Facture envoyée
  payee: false,                                // Facture payée
  exportee: false,                             // Facture exportée
  montantPaye: 0,                              // Montant déjà payé
  
  // Conserver aussi les propriétés actuelles
  status: 'draft',
  montantHT: parseFloat(factura.montantHT) || 0,
  tauxTVA: parseFloat(factura.tauxTVA) || 0,
  montantTVA: (parseFloat(factura.montantHT) || 0) * ((parseFloat(factura.tauxTVA) || 0) / 100),
  montantTTC: (parseFloat(factura.montantHT) || 0) * (1 + (parseFloat(factura.tauxTVA) || 0) / 100),
  dateFacture: new Date().toISOString().split('T')[0],
  dateEcheance: factura.echeance || new Date().toISOString().split('T')[0]
};
```

### 2.3 Mapper les données lors de la récupération

Alternative : mapper les données dans FacturesPage après récupération :

```javascript
const facturesData = facturesSnapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Mapping pour ContratsTable
    ref: data.reference || data.numeroFacture || data.ref,
    destinataire: data.structureNom || data.destinataire,
    emetteur: data.organisationNom || data.emetteurNom || data.emetteur,
    nature: data.type || data.nature || 'facture',
    projet: data.objet || data.projet,
    dateEvenement: data.concertDate || data.dateEvenement,
    devise: data.devise || 'EUR',
    statut: data.payee ? 'payee' : data.envoyee ? 'envoyee' : 'en_attente',
    etat: data.status === 'draft' ? 'brouillon' : data.status === 'validated' ? 'validee' : data.etat || 'brouillon',
    montantPaye: data.montantPaye || 0
  };
});
```

## 3. TESTS À EFFECTUER

1. **Créer une nouvelle facture** depuis un contrat et vérifier qu'elle apparaît dans la liste
2. **Vérifier les propriétés** affichées dans le tableau
3. **Tester les filtres** de recherche sur ref, destinataire, projet
4. **Vérifier les statuts** et les badges
5. **Tester les boutons** Envoyée/Payée

## 4. PRIORITÉS

1. **URGENT** : Corriger le chemin de la collection (organizations/[id]/factures)
2. **IMPORTANT** : Ajouter les propriétés manquantes lors de la sauvegarde
3. **UTILE** : Harmoniser les noms de propriétés (ref vs reference, statut vs status)

## 5. IMPACT

Sans ces corrections :
- ❌ Les factures créées n'apparaissent pas dans la liste
- ❌ Les colonnes du tableau sont vides
- ❌ Les filtres ne fonctionnent pas
- ❌ Les statuts ne s'affichent pas correctement