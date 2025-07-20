# Système d'autocomplétion d'adresses

## Vue d'ensemble

L'application supporte deux providers d'autocomplétion d'adresses :
- **Google Places** (par défaut, recommandé)
- **LocationIQ** (fallback)

## Configuration

### Variables d'environnement

```bash
# Choisir le provider (optionnel)
REACT_APP_ADDRESS_PROVIDER=google  # ou 'locationiq'

# Clés API
REACT_APP_GOOGLE_PLACES_API_KEY=votre-clé-google  # ou utilise REACT_APP_FIREBASE_API_KEY
REACT_APP_LOCATIONIQ_API_KEY=votre-clé-locationiq
```

### Logique de sélection automatique

Si `REACT_APP_ADDRESS_PROVIDER` n'est pas défini, le système :
1. Utilise Google Places si une clé Google est disponible
2. Sinon, utilise LocationIQ si sa clé est disponible
3. Par défaut, tente Google Places

## Utilisation

### Import standard (recommandé)

```javascript
import AddressInput from '@/components/ui/AddressInputUnified';

// Utilise automatiquement le bon provider
<AddressInput
  label="Adresse"
  value={formData.adresse}
  onChange={(e) => handleChange('adresse', e.target.value)}
  onAddressSelected={handleAddressSelected}
/>
```

### Import explicite (si nécessaire)

```javascript
import { 
  AddressInputGoogle,      // Force Google Places
  AddressInputLocationIQ   // Force LocationIQ
} from '@/components/ui/AddressInputIndex';
```

## Basculer entre providers

### Méthode 1 : Variable d'environnement
```bash
# .env.local
REACT_APP_ADDRESS_PROVIDER=locationiq  # Pour revenir à LocationIQ
```

### Méthode 2 : Désactiver une clé API
Supprimez ou commentez la clé Google pour revenir automatiquement à LocationIQ :
```bash
# REACT_APP_GOOGLE_PLACES_API_KEY=xxx  # Commenté
REACT_APP_LOCATIONIQ_API_KEY=pk.xxx    # Actif
```

## Comparaison des providers

| Fonctionnalité | Google Places | LocationIQ |
|----------------|---------------|------------|
| Précision France | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Bâtiments publics | ✅ Excellent | ⚠️ Variable |
| Quota gratuit | 28,500/mois | 5,000/jour |
| Numéros de rue | ✅ Très bon | ⚠️ Parfois manquant |
| Codes postaux | ✅ Fiable | ✅ Fiable |

## Migration

### Fichiers déjà migrés
- ✅ `StructureCreationModal.js`
- ✅ `PersonneCreationModal.js`

### Format des données retournées

Les deux providers retournent le même format :
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

### "ApiNotActivatedMapError" avec Google
1. Activez "Maps JavaScript API" dans Google Cloud Console
2. Activez "Places API" dans Google Cloud Console
3. Vérifiez les restrictions de votre clé API

### Revenir rapidement à LocationIQ
```bash
REACT_APP_ADDRESS_PROVIDER=locationiq
```

### Tester les deux providers
Utilisez l'onglet "Outils" > "Test d'autocomplétion d'adresses"