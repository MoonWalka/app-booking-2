# Configuration de Google Places Autocomplete

## Pourquoi Google Places ?

LocationIQ peut parfois manquer de précision pour certaines adresses, notamment :
- Les petites communes
- Les adresses sans numéro de rue précis
- Les bâtiments publics (mairies, écoles, etc.)

Google Places offre une meilleure couverture et précision, avec 28,500 requêtes gratuites par mois.

## Configuration

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer la facturation (nécessaire même pour l'utilisation gratuite)

### 2. Activer les APIs nécessaires

Dans votre projet Google Cloud, activer :
- **Places API**
- **Maps JavaScript API**

### 3. Créer une clé API

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "+ CREATE CREDENTIALS" > "API key"
3. Restreindre la clé API :
   - **Application restrictions** : HTTP referrers (websites)
   - Ajouter vos domaines autorisés :
     - `http://localhost:3000/*` (développement)
     - `https://votre-domaine.com/*` (production)
   - **API restrictions** : Restreindre aux APIs sélectionnées
     - Places API
     - Maps JavaScript API

### 4. Ajouter la clé dans votre environnement

Dans votre fichier `.env.local` :
```
REACT_APP_GOOGLE_PLACES_API_KEY=votre-clé-api-ici
```

## Utilisation

### Option 1 : Remplacer globalement AddressInput

Dans `src/components/ui/AddressInput.js`, vous pouvez conditionner l'utilisation :

```javascript
// Au début du fichier
const useGooglePlaces = process.env.REACT_APP_GOOGLE_PLACES_API_KEY ? true : false;

// Puis utiliser conditionnellement
if (useGooglePlaces) {
  // Utiliser Google Places
} else {
  // Utiliser LocationIQ
}
```

### Option 2 : Utiliser directement AddressInputGoogle

```javascript
import AddressInputGoogle from '@/components/ui/AddressInputGoogle';

// Dans votre composant
<AddressInputGoogle
  label="Adresse"
  value={formData.adresse}
  onChange={(e) => handleInputChange('adresse', e.target.value)}
  onAddressSelected={handleAddressSelected}
  placeholder="Commencez à taper pour rechercher une adresse..."
/>
```

## Coûts

- **Gratuit** : 28,500 requêtes Autocomplete par mois
- **Au-delà** : $2.83 par 1000 requêtes

## Avantages

1. **Meilleure précision** : Reconnaissance des bâtiments publics, commerces, etc.
2. **Données plus complètes** : Numéros de rue, codes postaux corrects
3. **Support multilingue** : Résultats dans la langue configurée
4. **Session tokens** : Optimisation automatique des coûts (plusieurs frappes = 1 requête)

## Migration depuis LocationIQ

Le composant `AddressInputGoogle` est conçu pour être compatible avec l'interface existante. Il suffit de :

1. Remplacer l'import
2. S'assurer que `handleAddressSelected` reçoit les bonnes données :
   ```javascript
   {
     adresse: "123 Rue Example",
     codePostal: "75001",
     ville: "Paris",
     departement: "Paris",
     region: "Île-de-France",
     pays: "France",
     latitude: 48.856614,
     longitude: 2.3522219
   }
   ```

## Dépannage

### "API key not valid"
- Vérifier que l'API Places est bien activée
- Vérifier les restrictions de la clé
- Attendre quelques minutes après création

### "You have exceeded your request quota"
- Vérifier la console Google Cloud pour les quotas
- Considérer l'ajout d'une méthode de paiement

### Pas de résultats pour certaines adresses
- Essayer sans restriction de pays
- Vérifier le paramètre `types` (essayer `['geocode']` au lieu de `['address']`)