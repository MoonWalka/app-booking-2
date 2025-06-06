# Utilitaires

## Introduction

Les utilitaires dans TourCraft sont des fonctions réutilisables qui fournissent des fonctionnalités communes à travers l'application. Ces fonctions ne sont pas liées à un domaine fonctionnel spécifique et peuvent être utilisées par n'importe quel composant ou hook.

## Formatters (utils/formatters.js)

**But :** Fournir des fonctions de formatage pour les dates, montants, et autres types de données.

### formatDate(date, format)

**Description :** Formate une date selon le format spécifié.

**Paramètres :**
- `date` : Date à formater (Date ou timestamp)
- `format` : Format de sortie (optionnel, par défaut 'DD/MM/YYYY')

**Retour :** Chaîne de caractères représentant la date formatée

**Exemple d'utilisation :**
```javascript
import { formatDate } from '../utils/formatters';

// Formater une date
const dateStr = formatDate(new Date(), 'DD/MM/YYYY');
console.log(dateStr); // Exemple: "01/05/2023"

// Formater une date avec heure
const dateTimeStr = formatDate(new Date(), 'DD/MM/YYYY HH:mm');
console.log(dateTimeStr); // Exemple: "01/05/2023 14:30"
```

### formatMontant(amount, currency)

**Description :** Formate un montant monétaire avec séparateurs de milliers et symbole de devise.

**Paramètres :**
- `amount` : Montant à formater (nombre)
- `currency` : Devise (optionnel, par défaut '€')

**Retour :** Chaîne de caractères représentant le montant formaté

**Exemple d'utilisation :**
```javascript
import { formatMontant } from '../utils/formatters';

// Formater un montant en euros
const montant = formatMontant(1500);
console.log(montant); // "1 500,00 €"

// Formater un montant en dollars
const montantUSD = formatMontant(1500, '$');
console.log(montantUSD); // "1,500.00 $"
```

### isDatePassed(date)

**Description :** Vérifie si une date est dans le passé.

**Paramètres :**
- `date` : Date à vérifier (Date ou timestamp)

**Retour :** Boolean indiquant si la date est dans le passé

**Exemple d'utilisation :**
```javascript
import { isDatePassed } from '../utils/formatters';

// Vérifier si un concert est passé
const isPast = isDatePassed(concert.date);
if (isPast) {
  console.log('Ce concert est déjà passé');
}
```

### copyToClipboard(text)

**Description :** Copie un texte dans le presse-papier.

**Paramètres :**
- `text` : Texte à copier

**Retour :** Promise résolue si la copie a réussi, rejetée sinon

**Exemple d'utilisation :**
```javascript
import { copyToClipboard } from '../utils/formatters';

// Copier un lien
async function copyLink(url) {
  try {
    await copyToClipboard(url);
    alert('Lien copié dans le presse-papier !');
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    alert('Impossible de copier le lien');
  }
}
```

### getCacheKey(id, prefix)

**Description :** Génère une clé de cache unique basée sur un identifiant et un préfixe optionnel.

**Paramètres :**
- `id` : Identifiant de base
- `prefix` : Préfixe optionnel (par défaut: '')

**Retour :** Chaîne de caractères représentant la clé de cache

**Exemple d'utilisation :**
```javascript
import { getCacheKey } from '../utils/formatters';

// Générer une clé de cache pour un concert
const cacheKey = getCacheKey(concertId, 'concert');
localStorage.setItem(cacheKey, JSON.stringify(concertData));
```

## Validators (utils/validators.js)

**But :** Fournir des fonctions de validation pour les entrées utilisateur et les formulaires.

### validateEmail(email)

**Description :** Valide une adresse email.

**Paramètres :**
- `email` : Adresse email à valider

**Retour :** Objet `{ isValid, message }` où `isValid` est un booléen et `message` est le message d'erreur si invalide

**Exemple d'utilisation :**
```javascript
import { validateEmail } from '../utils/validators';

function handleEmailChange(email) {
  const validation = validateEmail(email);
  if (!validation.isValid) {
    setEmailError(validation.message);
  } else {
    setEmailError('');
  }
}
```

### validatePhone(phone)

**Description :** Valide un numéro de téléphone (formats français).

**Paramètres :**
- `phone` : Numéro de téléphone à valider

**Retour :** Objet `{ isValid, message }` où `isValid` est un booléen et `message` est le message d'erreur si invalide

**Exemple d'utilisation :**
```javascript
import { validatePhone } from '../utils/validators';

function handlePhoneChange(phone) {
  const validation = validatePhone(phone);
  if (!validation.isValid) {
    setPhoneError(validation.message);
  } else {
    setPhoneError('');
  }
}
```

### validateRequired(value, fieldName)

**Description :** Vérifie qu'une valeur est présente et non vide.

**Paramètres :**
- `value` : Valeur à vérifier
- `fieldName` : Nom du champ pour le message d'erreur

**Retour :** Objet `{ isValid, message }` où `isValid` est un booléen et `message` est le message d'erreur si invalide

**Exemple d'utilisation :**
```javascript
import { validateRequired } from '../utils/validators';

function validateForm(data) {
  const nameValidation = validateRequired(data.name, 'Nom');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Autres validations...
  return { isValid: true };
}
```

### validatePostalCode(code)

**Description :** Valide un code postal français.

**Paramètres :**
- `code` : Code postal à valider

**Retour :** Objet `{ isValid, message }` où `isValid` est un booléen et `message` est le message d'erreur si invalide

**Exemple d'utilisation :**
```javascript
import { validatePostalCode } from '../utils/validators';

function handlePostalCodeChange(code) {
  const validation = validatePostalCode(code);
  if (!validation.isValid) {
    setPostalCodeError(validation.message);
  } else {
    setPostalCodeError('');
  }
}
```

## API Helpers (utils/apiHelpers.js)

**But :** Faciliter les interactions avec les APIs externes.

### handleApiError(error)

**Description :** Traite une erreur d'API et retourne un message approprié.

**Paramètres :**
- `error` : Objet d'erreur

**Retour :** Message d'erreur formaté

**Exemple d'utilisation :**
```javascript
import { handleApiError } from '../utils/apiHelpers';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('Erreur API:', errorMessage);
    throw new Error(errorMessage);
  }
}
```

### buildQueryParams(params)

**Description :** Construit une chaîne de paramètres de requête à partir d'un objet.

**Paramètres :**
- `params` : Objet contenant les paramètres

**Retour :** Chaîne de paramètres de requête URL

**Exemple d'utilisation :**
```javascript
import { buildQueryParams } from '../utils/apiHelpers';

function fetchFilteredData(filters) {
  const queryParams = buildQueryParams({
    search: filters.searchTerm,
    category: filters.category,
    page: filters.page,
    limit: filters.limit
  });
  
  return fetch(`/api/data?${queryParams}`).then(res => res.json());
}
```

## DOM Utilities (utils/domUtils.js)

**But :** Fournir des utilitaires pour manipuler le DOM ou obtenir des informations sur la fenêtre.

### getViewportDimensions()

**Description :** Obtient les dimensions actuelles de la fenêtre (viewport).

**Paramètres :** Aucun

**Retour :** Objet `{ width, height }` contenant les dimensions du viewport

**Exemple d'utilisation :**
```javascript
import { getViewportDimensions } from '../utils/domUtils';

function adjustLayoutForViewport() {
  const { width, height } = getViewportDimensions();
  if (width < 768) {
    // Ajuster pour mobile
  } else if (width < 1024) {
    // Ajuster pour tablette
  } else {
    // Ajuster pour desktop
  }
}
```

### scrollToElement(elementId, offset)

**Description :** Fait défiler la page jusqu'à un élément spécifique.

**Paramètres :**
- `elementId` : ID de l'élément cible
- `offset` : Décalage optionnel en pixels (par défaut: 0)

**Retour :** Aucun

**Exemple d'utilisation :**
```javascript
import { scrollToElement } from '../utils/domUtils';

// Défiler jusqu'à la section "details"
function scrollToDetails() {
  scrollToElement('details-section', 50); // 50px de décalage du haut
}
```

## Sécurité (utils/securityUtils.js)

**But :** Fournir des fonctions liées à la sécurité.

### sanitizeInput(input)

**Description :** Nettoie une entrée utilisateur pour prévenir les attaques XSS.

**Paramètres :**
- `input` : Chaîne à nettoyer

**Retour :** Chaîne nettoyée

**Exemple d'utilisation :**
```javascript
import { sanitizeInput } from '../utils/securityUtils';

function handleUserComment(comment) {
  const sanitizedComment = sanitizeInput(comment);
  saveCommentToDatabase(sanitizedComment);
}
```

### generateUniqueId(prefix)

**Description :** Génère un identifiant unique (utile pour les clés React ou identifiants temporaires).

**Paramètres :**
- `prefix` : Préfixe optionnel

**Retour :** Chaîne d'identifiant unique

**Exemple d'utilisation :**
```javascript
import { generateUniqueId } from '../utils/securityUtils';

function createNewItem() {
  return {
    id: generateUniqueId('item'),
    createdAt: new Date(),
    // autres propriétés...
  };
}
```

## Manipulation de fichiers (utils/fileUtils.js)

**But :** Fournir des utilitaires pour manipuler des fichiers.

### getFileExtension(filename)

**Description :** Extrait l'extension d'un nom de fichier.

**Paramètres :**
- `filename` : Nom du fichier

**Retour :** Extension du fichier

**Exemple d'utilisation :**
```javascript
import { getFileExtension } from '../utils/fileUtils';

function validateFileType(file) {
  const extension = getFileExtension(file.name).toLowerCase();
  const allowedExtensions = ['jpg', 'png', 'pdf'];
  return allowedExtensions.includes(extension);
}
```

### formatBytes(bytes, decimals)

**Description :** Formate une taille de fichier en octets en une représentation lisible.

**Paramètres :**
- `bytes` : Taille en octets
- `decimals` : Nombre de décimales (par défaut: 2)

**Retour :** Chaîne formatée (ex: "1.23 MB")

**Exemple d'utilisation :**
```javascript
import { formatBytes } from '../utils/fileUtils';

function displayFileInfo(file) {
  return {
    name: file.name,
    size: formatBytes(file.size),
    type: file.type
  };
}
```

## Navigation

- [Retour à la documentation principale](../README.md)
- [Documentation des hooks communs](../hooks/COMMON_HOOKS.md)
- [Documentation des composants](../components/COMPONENTS.md)
- [Documentation des services](../services/SERVICES.md)