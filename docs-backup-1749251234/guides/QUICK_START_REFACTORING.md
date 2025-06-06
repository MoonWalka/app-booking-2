# 🚀 Guide Rapide - Refactoring Anti-Boucles TourCraft

## 📝 En 5 minutes

### 1. Comprendre le problème
- **Avant** : Les relations bidirectionnelles créent des boucles infinies
- **Après** : Chargement contrôlé avec profondeur limitée

### 2. Les 3 composants clés

```javascript
// 1️⃣ RelationCard - Pour afficher les relations
<RelationCard entity={artiste} type="artiste" />

// 2️⃣ useSafeRelations - Pour charger sans boucles
const { data, loading, error } = useSafeRelations('concert', id, 1);

// 3️⃣ RefactoringTestButton - Pour comparer les versions
// S'affiche automatiquement sur les pages de détails
```

### 3. Migrer un composant existant

```javascript
// 🔴 AVANT - Risque de boucles
const ConcertDetails = ({ id }) => {
  const { data: concert } = useConcertDetails(id);
  const { data: artistes } = useArtistesForConcert(concert?.artistesIds);
  const { data: lieu } = useLieuDetails(concert?.lieuId);
  
  return (
    <div>
      {artistes.map(a => <div onClick={() => nav(`/artistes/${a.id}`)}>{a.nom}</div>)}
    </div>
  );
};

// 🟢 APRÈS - Sans boucles
const ConcertDetailsRefactored = ({ id }) => {
  const { data: concert, loading } = useSafeRelations('concert', id, 1);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {concert.artistes?.map(a => <RelationCard key={a.id} entity={a} type="artiste" />)}
    </div>
  );
};
```

## ⚡ Commandes rapides

### Créer un nouveau composant refactorisé

1. **Copier le composant existant**
   ```bash
   cp src/components/artistes/ArtisteDetail.js src/components/artistes/ArtisteDetailRefactored.js
   ```

2. **Remplacer les imports**
   ```javascript
   import useSafeRelations from '../../hooks/common/useSafeRelations';
   import RelationCard from '../common/RelationCard';
   ```

3. **Ajouter la route dans la page parent**
   ```javascript
   // Dans ArtistesPage.js
   <Route path="/:id/refactored" element={<ArtisteDetailRefactored />} />
   ```

## 🔍 Vérifier que ça marche

1. **Aller sur la page de détails** (ex: `/concerts/123`)
2. **Cliquer sur le bouton bleu/vert** en bas à droite
3. **Ouvrir React DevTools** > Profiler
4. **Vérifier** : Pas de re-renders infinis ✅

## ⚠️ Erreurs fréquentes

| Erreur | Solution |
|--------|----------|
| Page blanche | Vérifier la route dans `XxxPage.js` |
| "Objects are not valid" | Passer des JSX, pas des objets |
| Import Card failed | `import Card from` (pas `import { Card }`) |
| Hook conditionally called | Mettre les hooks avant les returns |
| collection is not a function | Renommer variable `collection` → `collectionName` |
| Relations n'apparaissent pas | Utiliser `reverseField` pour relations inverses |

## 📊 Checklist migration

- [ ] Identifier les relations bidirectionnelles
- [ ] Créer `ComponentRefactored.js`
- [ ] Remplacer hooks par `useSafeRelations`
- [ ] Remplacer affichage par `RelationCard`
- [ ] Ajouter route `/refactored`
- [ ] Tester avec le bouton
- [ ] Mesurer les performances
- [ ] Remplacer l'ancienne version

## 💡 Tips

1. **Profondeur** : Commencer avec `depth=1`, augmenter si nécessaire
2. **Relations** : Utiliser `relationTypes` pour limiter ce qui est chargé
3. **Performance** : `maxRelationsPerType` limite le nombre d'items
4. **Debug** : Ajouter `console.log` dans le hook pour tracer

## 🎯 Exemple complet

```javascript
// src/components/lieux/LieuDetailsRefactored.js
import React from 'react';
import { useParams } from 'react-router-dom';
import useSafeRelations from '../../hooks/common/useSafeRelations';
import RelationCard from '../common/RelationCard';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

const LieuDetailsRefactored = () => {
  const { id } = useParams();
  
  const { data: lieu, loading, error } = useSafeRelations('lieu', id, 1, {
    includeRelations: true,
    relationTypes: ['concerts', 'programmateur'],
    maxRelationsPerType: 10
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Erreur : {error.message}</div>;
  if (!lieu) return <div>Lieu non trouvé</div>;
  
  return (
    <div className="page-container">
      <h1>{lieu.nom}</h1>
      
      <Card>
        <h3>Concerts ({lieu.concerts?.length || 0})</h3>
        <div className="relations-grid">
          {lieu.concerts?.map(concert => (
            <RelationCard key={concert.id} entity={concert} type="concert" />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LieuDetailsRefactored;
```

## 🚦 Go / No-Go

**GO ✅** si :
- Boucles infinies détectées
- Performance dégradée
- Relations complexes

**NO-GO ❌** si :
- Composant simple sans relations
- Deadline serrée
- Pas de tests possibles

## 📞 Besoin d'aide ?

1. Consulter `TROUBLESHOOTING_REFACTORING.md`
2. Voir exemples dans `ConcertDetailsRefactored.js`
3. Utiliser le mode debug du hook
4. Demander sur le canal d'équipe