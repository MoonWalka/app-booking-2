import { Quill } from 'react-quill';

// Créer un module personnalisé pour le bouton saut de page
const PageBreakBlot = Quill.import('blots/block');

class PageBreakClass extends PageBreakBlot {
  static create() {
    const node = super.create();
    node.setAttribute('class', 'page-break');
    node.setAttribute('data-page-break', 'true');
    node.innerHTML = '<span style="color: #0066cc; font-size: 12px; font-style: italic;">📄 Saut de page</span>';
    return node;
  }
  
  static formats() {
    return true;
  }
}

PageBreakClass.blotName = 'pagebreak';
PageBreakClass.tagName = 'div';

// Enregistrer le blot personnalisé
Quill.register(PageBreakClass);

// Fonction pour insérer un saut de page
const insertPageBreak = (quillInstance) => {
  const range = quillInstance.getSelection(true);
  const position = range ? range.index : quillInstance.getLength();
  
  // Insérer le marqueur de saut de page visible
  quillInstance.insertEmbed(position, 'pagebreak', true);
  
  // Placer le curseur après le saut de page
  quillInstance.setSelection(position + 1);
};

// Configuration de la barre d'outils avec bouton saut de page
const createToolbarWithPageBreak = (isCompact = false) => {
  if (isCompact) {
    // Version compacte pour les sections
    return [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['pagebreak'], // Notre bouton personnalisé
      ['clean']
    ];
  } else {
    // Version complète pour la modale fullscreen
    return [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['pagebreak'], // Notre bouton personnalisé
      ['link', 'clean']
    ];
  }
};

// Module personnalisé pour la barre d'outils
const ToolbarModule = {
  toolbar: {
    container: createToolbarWithPageBreak(false), // Configuration par défaut
    handlers: {
      'pagebreak': function() {
        insertPageBreak(this.quill);
      }
    }
  }
};

// Module compact pour les sections
const CompactToolbarModule = {
  toolbar: {
    container: createToolbarWithPageBreak(true),
    handlers: {
      'pagebreak': function() {
        insertPageBreak(this.quill);
      }
    }
  }
};

export { 
  ToolbarModule, 
  CompactToolbarModule, 
  createToolbarWithPageBreak, 
  insertPageBreak 
}; 