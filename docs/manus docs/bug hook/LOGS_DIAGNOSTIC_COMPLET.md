# Ajout de logs de diagnostic complet (mai 2025)

## Objectif

Permettre une traçabilité fine de tout le cycle de vie et des flux de données lors de l'affichage de ProgrammateurDetails et de l'utilisation du hook useGenericEntityDetails, afin de diagnostiquer les blocages de chargement, les erreurs silencieuses ou les problèmes de données.

## Modifications apportées

### Dans ProgrammateurDetails.js
- Log à chaque rendu du composant (ID, détails du hook)
- Log si aucun ID n'est fourni
- Log lors de l'affichage du spinner (loading)
- Log lors de la détection d'une erreur (error)
- Log si aucune entité n'est trouvée (entity null)
- Log lors du montage/démontage et lors du changement d'ID

### Dans useGenericEntityDetails.js
- Log à chaque appel du hook (paramètres principaux)
- Log à chaque rendu du hook (ID, entity, loading, error)
- Log à chaque appel de fetchEntity (ID, type)
- Log lors de la réception d'un snapshot Firestore (onSnapshot)
- Log lors de la fin d'une requête getDoc (succès/échec)
- Log dans tous les catch d'erreur
- Log lors du chargement initial et lors de la réinitialisation des états

## Utilité
- Permet de vérifier si le composant reçoit bien un ID, si le hook est appelé avec les bons paramètres, si les requêtes partent et aboutissent, et si les états évoluent comme attendu.
- Permet de détecter rapidement si le problème vient du routing, du hook, de Firestore, ou d'une absence de données.

## Prochaine étape
- Observer la console lors de la navigation et du chargement de la page.
- Identifier précisément à quelle étape le flux se bloque ou échoue.
- Adapter la correction en fonction des logs observés.
