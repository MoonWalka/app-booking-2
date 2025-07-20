# DEBUG - Vérifications des permissions Admin

## Étapes pour diagnostiquer le problème :

### 1. Dans Firebase Console, vérifier ces collections :

#### A. `entreprises/{votre-entreprise-id}/members`
Cherchez votre utilisateur et vérifiez :
- Votre UID existe-t-il ?
- Quel est votre `role` ? (devrait être `owner` ou `admin`)

#### B. `collaborationConfig/{votre-entreprise-id}`
Vérifiez le document :
- Dans `collaborateurs`, trouvez votre utilisateur par son `id` (votre UID)
- Vérifiez le champ `groupes` - contient-il `['admin']` ?

#### C. `entreprises/{votre-entreprise-id}/groupesPermissions/admin`
Vérifiez que le document existe et contient :
```json
{
  "nom": "Administrateur",
  "permissions": {
    "dates": { "creer": true, "modifier": true, "voir": true, "supprimer": true },
    "contrats": { "creer": true, "modifier": true, "voir": true, "supprimer": true },
    "parametrage": { "modifier": true, "voir": true }
    // ... toutes les permissions à true
  }
}
```

### 2. Si une de ces données manque :

#### Cas 1 : Vous n'êtes pas dans `members`
- L'entreprise n'a pas été créée correctement
- Solution : Recréer l'entreprise

#### Cas 2 : Vous êtes dans `members` mais pas dans `collaborationConfig`
- Le système d'auto-ajout n'a pas fonctionné
- Solution : Aller sur la page Paramètres > Collaboration pour déclencher l'auto-ajout

#### Cas 3 : Vous êtes dans `collaborationConfig` mais pas dans le groupe `admin`
- Problème lors de l'auto-ajout
- Solution : Modifier manuellement dans Firebase pour ajouter `groupes: ['admin']`

#### Cas 4 : Le groupe `admin` n'existe pas dans `groupesPermissions`
- Les groupes par défaut n'ont pas été créés
- Solution : Aller sur la page Gestion des groupes pour déclencher la création automatique

### 3. Solution rapide si tout échoue :

Dans Firebase Console, ajoutez manuellement :

1. Dans `collaborationConfig/{entreprise-id}`, trouvez votre utilisateur et définissez :
```json
{
  "groupes": ["admin"]
}
```

2. Si le groupe `admin` n'existe pas dans `groupesPermissions`, créez-le avec toutes les permissions à `true`.