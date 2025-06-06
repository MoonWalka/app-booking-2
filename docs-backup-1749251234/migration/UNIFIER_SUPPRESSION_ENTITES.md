# Unification de la logique de suppression des entités avec une modale commune

## Objectif

**Unifier la gestion de la confirmation de suppression pour toutes les entités (lieux, concerts, etc.) à l'aide d'une modale commune et générique.**

---

## Pourquoi faire cette évolution ?

- **Cohérence UX/UI** : même expérience utilisateur sur toutes les suppressions.
- **Maintenance simplifiée** : un seul composant à faire évoluer en cas de besoin.
- **Réduction du code dupliqué** : moins de bugs, moins de tests à maintenir.
- **Facilité d'ajout de nouvelles entités** : la suppression sera déjà standardisée.

---

## Ce qu'il faut faire

1. **Analyser la modale commune existante** (`src/components/common/Modal.js`) :
   - Vérifier qu'elle accepte des enfants (`children`) pour personnaliser le contenu.
   - Vérifier qu'on peut passer des callbacks pour les actions (fermeture, confirmation, etc.).
   - Vérifier qu'elle gère bien l'état ouvert/fermé via une prop (`show`).
   - Ajouter des props si besoin (titre, message, boutons personnalisés).

2. **Remplacer les modales spécifiques** (`DeleteLieuModal`, `DeleteConcertModal`, etc.) :
   - Utiliser la modale commune dans tous les composants d'édition/suppression d'entités.
   - Passer le bon contenu et les bons callbacks à la modale commune.
   - Supprimer les anciennes modales spécifiques une fois la migration terminée.

3. **Tester tous les cas d'usage** :
   - Suppression d'un lieu, d'un concert, etc.
   - Vérifier que la modale s'affiche bien, que les callbacks fonctionnent, et que l'UX est cohérente.

---

## Points de vigilance

- Certaines suppressions pourraient nécessiter des comportements particuliers (ex : double confirmation, affichage d'impacts). Adapter la modale commune si besoin.
- Bien documenter les props de la modale commune pour faciliter son usage futur.
- Prévoir une phase de tests utilisateurs pour valider la nouvelle expérience.

---

## Exemple d'utilisation future

```jsx
<Modal
  show={showDeleteModal}
  onClose={handleCancelDelete}
  title="Confirmation de suppression"
>
  <p>Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
  <Button onClick={handleCancelDelete}>Annuler</Button>
  <Button onClick={handleConfirmDelete} variant="danger">Supprimer</Button>
</Modal>
```

---

## Conclusion

**Unifier la logique de suppression avec une modale commune est une évolution structurante pour le projet.**

- Plus de cohérence
- Moins de bugs
- Maintenance facilitée

➡️ **À planifier lors d'une prochaine refonte ou évolution majeure.** 