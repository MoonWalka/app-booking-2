# 🧪 Test manuel de la chaîne complète

**Objectif :** Vérifier que toute la chaîne fonctionnelle fonctionne via l'interface.

## 📋 Étapes à suivre

### 1. **Créer une structure**
- Aller dans **Contacts** → **Nouveau contact**
- Choisir **Structure**
- Remplir :
  - Raison sociale : `Test Structure Chaîne`
  - Nom : `Test Structure`
  - Type : `association`
  - Email : `test@structure.fr`
  - Téléphone : `01 23 45 67 89`
  - Tags : `Diffuseur`, `Média`

### 2. **Créer une personne**
- Aller dans **Contacts** → **Nouveau contact**
- Choisir **Personne**
- Remplir :
  - Prénom : `Jean`
  - Nom : `Dupont`
  - Fonction : `Directeur`
  - Email : `jean.dupont@test.fr`
  - Mobile : `06 12 34 56 78`

### 3. **Associer personne à structure**
- Ouvrir la fiche de la **structure**
- Onglet **Personnes** → **Associer**
- Sélectionner **Jean Dupont**
- Valider l'association

### 4. **Créer une date/concert**
- Aller dans **Concerts** → **Nouveau concert**
- Remplir :
  - Artiste : `Groupe Test`
  - Structure : `Test Structure Chaîne`
  - Lieu : `Salle de Test`
  - Ville : `Paris`
  - Date début : `01/06/2025`
  - Formule : `Concert Test`
  - Montant : `5000`

### 5. **Vérifier l'affichage**
- Retourner dans la fiche **structure**
- Onglet **Dates** → Voir le concert
- **Vérifier les colonnes** : Niveau, Artiste, Projet, Lieu, etc.
- **Vérifier les icônes** : Toutes grises (à faire)

### 6. **Tester les actions** (optionnel)
- Cliquer sur l'icône **Devis** (grise)
- Cliquer sur l'icône **Pré-contrat** (grise)
- Cliquer sur l'icône **Confirmation** (jaune)
- Cliquer sur l'icône **Contrat** (grise)

## ✅ **Résultat attendu**

### **Dans l'onglet Dates de la structure :**
- ✅ Tableau avec **16 colonnes** identiques au tableau de bord
- ✅ Concert visible avec toutes les informations
- ✅ Icônes cliquables pour chaque statut
- ✅ Boutons **Modifier** et **Supprimer** dans Actions

### **Dans le tableau de bord :**
- ✅ Concert visible dans la liste générale
- ✅ Même ligne que dans la fiche structure
- ✅ Toutes les colonnes identiques

## 🎯 **Points à vérifier**

1. **Colonnes identiques** entre tableau de bord et onglet Dates
2. **Filtrage automatique** dans la fiche contact (seuls les concerts de cette structure)
3. **Pas de filtrage** dans le tableau de bord (tous les concerts)
4. **Actions fonctionnelles** sur les icônes
5. **Boutons d'actions** Modifier/Supprimer

## 📝 **Notes**

- Ce test valide l'harmonisation du tableau
- Plus simple et fiable qu'un script automatisé
- Permet de tester l'UX réelle
- Pas de problème de configuration Firebase