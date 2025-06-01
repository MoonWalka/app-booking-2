// src/components/contrats/QuillLineHeight.js

// Définir les valeurs d'interligne disponibles
const lineHeightValues = [
  '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', 
  '1.6', '1.8', '2.0', '2.2', '2.5', '3.0'
];

// Pour l'instant, on va juste exporter les valeurs
// L'enregistrement Parchment sera fait plus tard quand on aura résolu les problèmes d'import
console.log('📏 Module QuillLineHeight chargé avec', lineHeightValues.length, 'valeurs');

// Exporter la configuration pour usage dans les composants
export const lineHeightConfig = {
  values: lineHeightValues,
  toolbarConfig: [{ 'lineheight': lineHeightValues }]
};

export default lineHeightValues;