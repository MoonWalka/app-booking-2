// src/components/contrats/QuillCustomSizes.js
import { Quill } from 'react-quill';

// Obtenir la classe Size de Quill
const Size = Quill.import('attributors/style/size');

// Définir nos tailles personnalisées
const customSizes = [
  '8pt', '9pt', '10pt', '11pt', '12pt', '14pt', 
  '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', 
  '36pt', '48pt', '72pt', '96pt'
];

// Configurer les tailles autorisées
Size.whitelist = customSizes;

// Enregistrer la classe Size modifiée
Quill.register(Size, true);

// Exporter la configuration pour usage dans les composants
export const customSizeConfig = {
  sizes: customSizes,
  toolbarConfig: [{ 'size': customSizes }]
};

export default customSizes;