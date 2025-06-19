# Spécification fonctionnelle — Gestion des dates  
*(à transmettre au développeur)*

## 1. Les trois vues et leur raison d’être

| Vue | Objectif métier | Utilisateurs | Informations clés affichées | Actions principales |
|-----|-----------------|--------------|----------------------------|---------------------|
| **Tableau&nbsp;de&nbsp;bord** | Piloter l’avancement administratif et financier d’un deal. | Booker·euse·s / Admin-Finance | Montant, type de contrat, icônes de statut (devis, contrat signé, facture, paiement, etc.). | Générer contrats, factures ; changer le statut d’option ; marquer « payé ». |
| **Liste&nbsp;des&nbsp;dates** | Accès universel à toutes les dates pour recherche rapide. | Tous rôles internes | Chronologie brute : artiste, lieu, dates début/fin, montant. | Aucune action directe ; point d’entrée vers les deux autres vues. |
| **Publication** | Valider et diffuser les dates annoncées au public. | Communication / Presse / Web | Date, ville, salle, type, libellé, indicateur « Public » ✓/✗ (aucun champ financier). | Basculer la visibilité publique ; exporter / pousser vers site & réseaux. |

> En résumé : **Tableau de bord = workflow interne**, **Liste des dates = répertoire**, **Publication = diffusion externe**.

---

## 2. Concept d’architecture

- **Source de données unique** : table `dates`.
- **Composant d’affichage commun** (ex. `DatesTable`) qui gère tri, pagination, sélection.
- **Configuration par vue** :  
  - *colonnes à afficher*  
  - *règles de filtrage* (ex. `isPublic == true` pour Publication)  
  - *raccourcis/actions* (boutons d’export, génération de documents, etc.)
- **Séparation de la logique métier** : aucune règle « fonctionnelle » n’est codée dans le composant générique ; chaque vue fournit ses propres paramètres.
- **Contrôle d’accès** : filtrage supplémentaire côté serveur ou via un guard rôle-based (ex. la vue Publication n’expose jamais les montants aux comptes « Com »).

---

## 3. Checklist de mise en œuvre

1. Définir clairement la structure du modèle `Date` (champs internes + champs publics).  
2. Créer le composant tableau générique + système de configuration.  
3. Configurer les vues :  
   - **bookingDashboardConfig** (Tableau de bord)  
   - **datesDirectoryConfig** (Liste des dates)  
   - **publicationConfig** (Publication)  
4. Mettre en place le flag `isPublic` et, si besoin, un workflow de validation.  
5. Implémenter le contrôle d’accès pour masquer les colonnes sensibles hors Tableau de bord.  
6. Prévoir un mécanisme simple pour ajouter une future vue (ex. Archives) via une nouvelle config.

---

## 4. Points ouverts

- Définition précise des rôles et de leur périmètre de visibilité.  
- Gestion des icônes de statut : mapping en base ou calcul côté client ?  
- Processus de publication (manuel, automatisé, ou mixte).  

---

**But recherché** : une architecture claire, DRY et évolutive où un seul composant sert trois métiers distincts, chacun configuré selon ses besoins sans duplication de code ni exposition involontaire de données sensibles.