/**
 * Convertit un nombre en mots français
 */

const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

/**
 * Convertit un nombre (0-999) en mots
 * @param {number} num - Le nombre à convertir
 * @returns {string} Le nombre en mots
 */
function convertHundreds(num) {
  let result = '';
  
  // Centaines
  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += units[hundreds] + ' cent';
    }
    if (num % 100 === 0 && hundreds > 1) {
      result += 's';
    }
  }
  
  // Dizaines et unités
  const remainder = num % 100;
  if (remainder > 0) {
    if (result) result += ' ';
    
    if (remainder < 10) {
      result += units[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const tensDigit = Math.floor(remainder / 10);
      const unitsDigit = remainder % 10;
      
      if (tensDigit === 7 || tensDigit === 9) {
        // 70-79 et 90-99
        result += tens[tensDigit - 1];
        if (unitsDigit === 1 && tensDigit === 7) {
          result += ' et onze';
        } else if (unitsDigit === 1 && tensDigit === 9) {
          result += '-onze';
        } else {
          result += '-' + teens[unitsDigit];
        }
      } else {
        result += tens[tensDigit];
        if (unitsDigit === 1 && tensDigit !== 8) {
          result += ' et un';
        } else if (unitsDigit > 0) {
          result += '-' + units[unitsDigit];
        }
      }
    }
  }
  
  return result;
}

/**
 * Convertit un nombre en mots français
 * @param {number} num - Le nombre à convertir
 * @returns {string} Le nombre en mots
 */
export function numberToWords(num) {
  if (num === 0) return 'zéro';
  if (num < 0) return 'moins ' + numberToWords(-num);
  
  if (num < 1000) {
    return convertHundreds(num);
  }
  
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = '';
    
    if (thousands === 1) {
      result = 'mille';
    } else {
      result = convertHundreds(thousands) + ' mille';
    }
    
    if (remainder > 0) {
      result += ' ' + convertHundreds(remainder);
    }
    
    return result;
  }
  
  // Pour les nombres plus grands, retourner le nombre
  return num.toString();
}

/**
 * Convertit un montant en euros en mots
 * @param {number} amount - Le montant en euros
 * @returns {string} Le montant en mots
 */
export function amountToWords(amount) {
  const euros = Math.floor(amount);
  const cents = Math.round((amount - euros) * 100);
  
  let result = numberToWords(euros) + ' euro';
  if (euros > 1) result += 's';
  
  if (cents > 0) {
    result += ' et ' + numberToWords(cents) + ' centime';
    if (cents > 1) result += 's';
  }
  
  return result;
}

/**
 * Alias pour la compatibilité avec l'ancien code
 * @param {number} num - Le nombre à convertir
 * @returns {string} Le nombre en mots
 */
export function toWords(num) {
  return numberToWords(num);
}