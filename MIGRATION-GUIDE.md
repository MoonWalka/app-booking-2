# 🚀 Guide de migration vers le modèle relationnel de contacts

Ce guide vous accompagne pour migrer de l'ancien système `contacts_unified` vers le nouveau modèle relationnel compatible Bob Booking.

## 📋 Prérequis

- [ ] Accès administrateur à la console Firebase
- [ ] Node.js installé pour exécuter les scripts
- [ ] Backup de vos données actuelles
- [ ] Variables d'environnement Firebase configurées

## 📅 Planning de migration recommandé

### Phase 1 : Préparation (1 jour)
1. **Setup Firestore** - Créer collections et index
2. **Test avec données fictives** - Valider le fonctionnement
3. **Formation équipe** - Présenter les nouvelles fonctionnalités

### Phase 2 : Migration (1 jour)
1. **Migration en mode maintenance** - Éviter les conflits
2. **Transfert des données** - Script automatisé
3. **Vérification intégrité** - Contrôles post-migration

### Phase 3 : Mise en production (2-3 jours)
1. **Activation progressive** - Composants par composants
2. **Formation utilisateurs** - Nouvelles fonctionnalités
3. **Monitoring** - Surveillance performances

## 🔧 Étape 1 : Configuration Firestore

### 1.1 Créer les collections et documents de test

```bash
# Depuis la racine du projet
cd scripts/setup
node setup-firestore-relational-contacts.js <email> <password> <organizationId>
```

### 1.2 Créer les index composites

Rendez-vous dans la [console Firestore](https://console.firebase.google.com) > Index composites et créez :

#### Collection `structures`
```
- organizationId (Ascending) + raisonSociale (Ascending)
- organizationId (Ascending) + isClient (Ascending) 
- organizationId (Ascending) + tags (Array-contains)
- organizationId (Ascending) + createdAt (Descending)
```

#### Collection `personnes`
```
- organizationId (Ascending) + email (Ascending)
- organizationId (Ascending) + nom (Ascending) + prenom (Ascending)
- organizationId (Ascending) + isPersonneLibre (Ascending)
- organizationId (Ascending) + tags (Array-contains)
```

#### Collection `liaisons`
```
- organizationId (Ascending) + structureId (Ascending) + personneId (Ascending)
- organizationId (Ascending) + actif (Ascending)
- organizationId (Ascending) + prioritaire (Ascending)
- structureId (Ascending) + actif (Ascending) + prioritaire (Descending)
- personneId (Ascending) + actif (Ascending) + dateDebut (Descending)
```

#### Collection `qualifications`
```
- organizationId (Ascending) + parentId (Ascending) + ordre (Ascending)
- organizationId (Ascending) + type (Ascending) + actif (Ascending)
```

### 1.3 Appliquer les règles de sécurité

Copiez les règles générées par le script dans la console Firestore > Rules.

## 🔄 Étape 2 : Migration des données

### 2.1 Backup de sécurité

```bash
# Exporter les données actuelles
firebase firestore:export gs://votre-bucket/backup-$(date +%Y%m%d)
```

### 2.2 Test de migration (mode simulation)

```bash
cd scripts/migration
node migrate-to-relational-contacts.js <email> <password> <orgId> --dry-run
```

Vérifiez le rapport généré et corrigez les erreurs éventuelles.

### 2.3 Migration réelle

⚠️ **Activez le mode maintenance** dans votre application avant de lancer la migration.

```bash
node migrate-to-relational-contacts.js <email> <password> <orgId>
```

### 2.4 Vérification post-migration

```bash
# Vérifier les statistiques
node verify-migration.js <orgId>
```

## 🧪 Étape 3 : Tests et validation

### 3.1 Tests fonctionnels

- [ ] Création d'une nouvelle structure
- [ ] Association d'une personne à une structure  
- [ ] Dissociation d'une personne
- [ ] Gestion des contacts prioritaires
- [ ] Recherche dans les contacts
- [ ] Import Excel d'un fichier test
- [ ] Export des contacts

### 3.2 Tests de performance

- [ ] Temps de chargement des listes
- [ ] Temps de recherche
- [ ] Réactivité de l'interface

## 🚀 Étape 4 : Activation progressive

### 4.1 Phase pilote (utilisateurs admin uniquement)

1. **Activer le nouveau composant** `ContactsListRelational` :
```javascript
// Dans votre router ou composant principal
const useNewContactsSystem = user.role === 'admin';

return useNewContactsSystem ? 
  <ContactsListRelational /> : 
  <ContactsList />;
```

2. **Initialiser les qualifications par défaut** :
```javascript
import qualificationsService from '@/services/contacts/qualificationsService';
await qualificationsService.initializeDefaultQualifications(orgId, userId);
```

### 4.2 Migration complète

Une fois les tests validés, remplacez progressivement :
- `ContactsList` → `ContactsListRelational`
- `useContactActions` → `useContactActionsRelational`
- `ContactViewTabs` → Version mise à jour avec statuts relationnels

## 📊 Étape 5 : Formation et documentation

### 5.1 Nouvelles fonctionnalités pour les utilisateurs

#### Statuts relationnels
- **Contact prioritaire** : Badge étoile, un seul par structure
- **Actif/Inactif** : Historique conservé, filtrage possible
- **Client** : Flag au niveau structure pour export commercial

#### Multi-appartenance
- Une personne peut appartenir à plusieurs structures
- Modification de l'email se propage partout
- Historique des associations conservé

#### Qualifications hiérarchiques
- **Diffuseur > Festival** au lieu de tags plats
- Recherche plus précise
- Statistiques par catégorie

### 5.2 Guide utilisateur

#### Créer une structure avec contacts
1. Cliquer "Nouvelle structure"
2. Remplir les informations
3. Ajouter des personnes directement ou associer existantes
4. Définir le contact prioritaire

#### Gérer les associations
1. Ouvrir une fiche structure
2. Cliquer "Associer une personne"
3. Rechercher ou créer la personne
4. Définir la fonction et les statuts

#### Utiliser l'import Excel
1. Télécharger le template via "Import > Télécharger template"
2. Remplir selon les instructions
3. Importer le fichier
4. Vérifier le rapport d'import

## 🔧 Étape 6 : Nettoyage post-migration

### 6.1 Supprimer les documents de test

```javascript
// Supprimer les documents créés par le script de setup
// qui commencent par "_TEST_"
```

### 6.2 Optimiser les performances

1. **Surveiller les requêtes** dans la console Firebase
2. **Ajuster les index** si nécessaire
3. **Nettoyer l'ancien code** progressivement

### 6.3 Détecter et fusionner les doublons

```javascript
import duplicatesService from '@/services/contacts/duplicatesService';

// Lancer la détection
await duplicatesService.runFullDuplicateDetection(orgId, userId);

// Traiter les doublons depuis l'interface admin
```

## 📈 Monitoring et maintenance

### Métriques à surveiller

- **Temps de réponse** des requêtes Firestore
- **Nombre de lectures** par utilisateur/jour
- **Erreurs** dans les logs
- **Satisfaction utilisateur** avec les nouvelles fonctionnalités

### Maintenance régulière

- **Hebdomadaire** : Vérifier les doublons détectés
- **Mensuelle** : Nettoyer les liaisons inactives anciennes
- **Trimestrielle** : Optimiser la taxonomie des qualifications

## 🚨 Plan de rollback

En cas de problème critique :

1. **Réactiver l'ancien système** :
```javascript
const useNewSystem = false; // Dans votre feature flag
```

2. **Restaurer depuis backup** :
```bash
firebase firestore:import gs://votre-bucket/backup-YYYYMMDD
```

3. **Investigations** :
- Analyser les logs d'erreur
- Identifier les problèmes de performance
- Recueillir les retours utilisateurs

## ✅ Checklist finale

### Avant la migration
- [ ] Backup effectué
- [ ] Index créés et validés
- [ ] Test de migration réussi
- [ ] Équipe formée
- [ ] Plan de rollback défini

### Après la migration
- [ ] Données migrées et vérifiées
- [ ] Tests fonctionnels OK
- [ ] Performances satisfaisantes
- [ ] Utilisateurs formés
- [ ] Monitoring en place

### Nettoyage
- [ ] Ancien code supprimé progressivement
- [ ] Documentation mise à jour
- [ ] Doublons traités
- [ ] Optimisations appliquées

---

## 🆘 Support et troubleshooting

### Problèmes courants

**Migration échoue avec des erreurs de validation**
- Vérifier les données sources dans `contacts_unified`
- Nettoyer les emails/téléphones invalides
- Relancer avec `--dry-run` pour identifier les problèmes

**Performances dégradées**
- Vérifier que tous les index sont créés
- Analyser les requêtes dans la console Firebase
- Optimiser les filtres de recherche

**Doublons non détectés**
- Ajuster les seuils de similarité
- Vérifier la normalisation des données
- Lancer manuellement la détection

### Contact support

Pour toute question technique :
1. Consulter les logs détaillés
2. Vérifier la documentation des services
3. Contacter l'équipe de développement

---

*Ce guide sera mis à jour en fonction des retours d'expérience de la migration.*