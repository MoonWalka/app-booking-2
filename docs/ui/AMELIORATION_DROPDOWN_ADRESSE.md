# Amélioration du dropdown d'autocomplétion d'adresse

## Problème

Le dropdown d'autocomplétion d'adresse dans le formulaire public restait ouvert après la sélection d'une adresse, attendant un clic extérieur pour se fermer. Cela créait une mauvaise expérience utilisateur.

## Solution implémentée

### 1. Ajout d'un état de blocage temporaire

```javascript
const [isSelecting, setIsSelecting] = useState(false);
const blockTimeoutRef = useRef(null);
```

Un état `isSelecting` a été ajouté pour bloquer l'affichage du dropdown pendant 500ms après une sélection.

### 2. Gestion améliorée des événements

```javascript
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  handleSelect(suggestion);
}}
onMouseDown={(e) => {
  e.preventDefault(); // Empêche le blur de l'input
}}
```

- `preventDefault()` sur `mouseDown` empêche le blur de l'input qui pourrait interférer
- `stopPropagation()` sur `click` évite la propagation d'événements indésirables

### 3. Fermeture immédiate et blocage temporaire

```javascript
const handleSelect = (address) => {
  // Bloquer l'affichage des résultats pendant 500ms
  setIsSelecting(true);
  setShowResults(false);
  
  blockTimeoutRef.current = setTimeout(() => {
    setIsSelecting(false);
  }, 500);
  // ...
}
```

### 4. Condition d'affichage mise à jour

```javascript
{showResults && addressResults.length > 0 && !isSelecting && (
  <div className={styles.suggestions} ref={dropdownRef}>
```

Le dropdown ne s'affiche que si `isSelecting` est `false`.

## Résultat

- Le dropdown se ferme instantanément dès qu'une adresse est sélectionnée
- Aucune réouverture intempestive pendant 500ms après la sélection
- Expérience utilisateur fluide et intuitive

## Fichiers modifiés

- `/src/components/ui/AddressInput.js` : Logique de fermeture améliorée
- Pas de modification CSS nécessaire

## Tests recommandés

1. Taper une adresse dans le formulaire public
2. Cliquer sur une suggestion
3. Vérifier que le dropdown se ferme immédiatement
4. Vérifier que les champs sont bien remplis
5. Vérifier qu'aucun dropdown ne se rouvre après la sélection