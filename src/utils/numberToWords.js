/**
 * Convertir un nombre en lettres (français)
 * Utilisé pour les montants dans les factures
 */

const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

/**
 * Convertir un nombre entre 0 et 99 en lettres
 */
function convertTens(num) {
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  
  const ten = Math.floor(num / 10);
  const unit = num % 10;
  
  if (ten === 7 || ten === 9) {
    // 70-79 et 90-99
    return tens[ten - 1] + (unit === 0 ? '-dix' : '-' + teens[unit]);
  }
  
  if (ten === 8 && unit === 0) {
    return 'quatre-vingts'; // 80 prend un 's'
  }
  
  if (unit === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
    return tens[ten] + '-et-un';
  }
  
  return tens[ten] + (unit > 0 ? '-' + units[unit] : '');
}

/**
 * Convertir un nombre entre 0 et 999 en lettres
 */
function convertHundreds(num) {
  if (num < 100) return convertTens(num);
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  let result = '';
  if (hundred === 1) {
    result = 'cent';
  } else {
    result = units[hundred] + '-cent';
    if (remainder === 0) result += 's'; // cents prend un 's' au pluriel
  }
  
  if (remainder > 0) {
    result += '-' + convertTens(remainder);
  }
  
  return result;
}

/**
 * Convertir un nombre entier en lettres
 */
function convertInteger(num) {
  if (num === 0) return 'zéro';
  
  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;
  
  let result = [];
  
  if (billion > 0) {
    result.push(billion === 1 ? 'un-milliard' : convertHundreds(billion) + '-milliards');
  }
  
  if (million > 0) {
    result.push(million === 1 ? 'un-million' : convertHundreds(million) + '-millions');
  }
  
  if (thousand > 0) {
    if (thousand === 1) {
      result.push('mille');
    } else {
      result.push(convertHundreds(thousand) + '-mille');
    }
  }
  
  if (remainder > 0) {
    result.push(convertHundreds(remainder));
  }
  
  return result.join('-');
}

/**
 * Convertir un montant en euros en lettres
 * @param {number} amount - Le montant à convertir
 * @returns {string} - Le montant en lettres
 */
export function toWords(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '';
  }
  
  // Arrondir à 2 décimales
  amount = Math.round(amount * 100) / 100;
  
  const euros = Math.floor(amount);
  const cents = Math.round((amount - euros) * 100);
  
  let result = convertInteger(euros) + ' euro';
  if (euros > 1) result += 's';
  
  if (cents > 0) {
    result += ' et ' + convertInteger(cents) + ' centime';
    if (cents > 1) result += 's';
  }
  
  // Mettre la première lettre en majuscule
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Export par défaut pour compatibilité
export default toWords;