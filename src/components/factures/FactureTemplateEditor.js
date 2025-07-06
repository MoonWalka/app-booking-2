// components/factures/FactureTemplateEditor.js
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '@/components/ui/Button';
import styles from './FactureTemplateEditor.module.css';
// Import du module de tailles personnalisées
import { customSizeConfig } from '../contrats/QuillCustomSizes';
import factureService from '@/services/factureService';

/**
 * Éditeur de modèles de facture
 * Interface pour créer et éditer des modèles de facture avec variables
 */
const FactureTemplateEditor = ({ template, onSave, onClose, isModalContext }) => {
  const [name, setName] = useState(template?.name || '');
  const [templateType, setTemplateType] = useState(template?.templateType || 'service');
  const [content, setContent] = useState(template?.bodyContent || template?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  
  const editorRef = useRef();

  // Réinitialiser les champs quand un nouveau template est passé
  useEffect(() => {
    setName(template?.name || '');
    setTemplateType(template?.templateType || 'service');
    setContent(template?.bodyContent || template?.content || '');
  }, [template]);

  // Force la synchronisation du DOM Quill avec l'état React
  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      const editor = editorRef.current.getEditor();
      if (editor && content !== editor.root.innerHTML) {
        editor.root.innerHTML = content || '';
      }
    }
  }, [content]);


  // Types de factures disponibles
  const templateTypes = [
    { 
      value: 'service', 
      label: 'Facture de prestation',
      description: 'Facture standard pour une prestation de service'
    },
    { 
      value: 'acompte', 
      label: 'Facture d\'acompte',
      description: 'Facture d\'acompte sur une prestation à venir'
    },
    { 
      value: 'avoir', 
      label: 'Facture d\'avoir',
      description: 'Facture d\'avoir pour annulation ou remboursement'
    },
    { 
      value: 'proforma', 
      label: 'Facture pro forma',
      description: 'Facture prévisionnelle non comptabilisée'
    }
  ];

  // Configuration de l'éditeur Quill
  const modules = {
    toolbar: [
      [{ 'size': customSizeConfig.sizes }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image'],
      ['blockquote', 'code-block']
    ]
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'script', 'direction', 'code-block'
  ];

  // Sauvegarde du modèle
  const handleSave = async () => {
    if (!name.trim()) {
      alert('Veuillez saisir un nom pour le modèle');
      return;
    }

    if (!content.trim()) {
      alert('Veuillez saisir un contenu pour le modèle');
      return;
    }

    setIsSaving(true);
    
    try {
      const templateData = {
        // Conserver l'ID si on modifie un modèle existant
        ...(template?.id ? { id: template.id } : {}),
        name: name.trim(),
        templateType,
        content: content, // Utiliser 'content' pour être cohérent avec le modèle standard
        bodyContent: content, // Garder aussi bodyContent pour la compatibilité
        isDefault: template?.isDefault || false,
        // Métadonnées
        updatedAt: new Date().toISOString(),
        ...(template?.id ? {} : { createdAt: new Date().toISOString() })
      };

      await onSave(templateData);
      
      // En mode page seulement, fermer automatiquement
      if (!isModalContext && onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du modèle');
    } finally {
      setIsSaving(false);
    }
  };

  // Variables disponibles pour l'insertion - Adaptées pour les factures
  const variables = [
    // Variables Entreprise (émetteur)
    { category: 'Entreprise', label: 'Nom de l\'entreprise', value: '{nom_entreprise}' },
    { category: 'Entreprise', label: 'Adresse de l\'entreprise', value: '{adresse_entreprise}' },
    { category: 'Entreprise', label: 'Ville de l\'entreprise', value: '{ville_entreprise}' },
    { category: 'Entreprise', label: 'Logo de l\'entreprise', value: '{logo_entreprise}' },
    { category: 'Entreprise', label: 'SIRET de l\'entreprise', value: '{siret_entreprise}' },
    { category: 'Entreprise', label: 'N° TVA intracommunautaire', value: '{numero_tva_entreprise}' },
    { category: 'Entreprise', label: 'Téléphone de l\'entreprise', value: '{telephone_entreprise}' },
    { category: 'Entreprise', label: 'Email de l\'entreprise', value: '{email_entreprise}' },
    { category: 'Entreprise', label: 'Site web de l\'entreprise', value: '{site_web_entreprise}' },
    { category: 'Entreprise', label: 'IBAN de l\'entreprise', value: '{iban_entreprise}' },
    { category: 'Entreprise', label: 'BIC de l\'entreprise', value: '{bic_entreprise}' },
    { category: 'Entreprise', label: 'Banque de l\'entreprise', value: '{banque_entreprise}' },

    // Variables Client (structure)
    { category: 'Client', label: 'Nom du client', value: '{nom_structure}' },
    { category: 'Client', label: 'Adresse du client', value: '{adresse_structure}' },
    { category: 'Client', label: 'Ville du client', value: '{ville_structure}' },
    { category: 'Client', label: 'SIRET du client', value: '{siret_structure}' },
    { category: 'Client', label: 'N° TVA du client', value: '{tva_structure}' },
    { category: 'Client', label: 'Email du client', value: '{email_structure}' },
    { category: 'Client', label: 'Téléphone du client', value: '{telephone_structure}' },
    { category: 'Client', label: 'Contact - Nom', value: '{contact_nom}' },
    { category: 'Client', label: 'Contact - Téléphone', value: '{contact_telephone}' },
    { category: 'Client', label: 'Contact - Email', value: '{contact_email}' },

    // Variables Facture
    { category: 'Facture', label: 'Numéro de facture', value: '{numero_facture}' },
    { category: 'Facture', label: 'Date de facture', value: '{date_facture}' },
    { category: 'Facture', label: 'Date d\'échéance', value: '{date_echeance}' },
    { category: 'Facture', label: 'Référence devis', value: '{reference_devis}' },
    { category: 'Facture', label: 'Référence bon de commande', value: '{reference_commande}' },

    // Variables Date/Prestation
    { category: 'Prestation', label: 'Titre du concert', value: '{titre_date}' },
    { category: 'Prestation', label: 'Date du concert', value: '{date_date}' },
    { category: 'Prestation', label: 'Lieu du concert', value: '{lieu_nom}' },
    { category: 'Prestation', label: 'Ville du lieu', value: '{lieu_ville}' },
    { category: 'Prestation', label: 'Artiste', value: '{artiste_nom}' },
    { category: 'Prestation', label: 'Description prestation', value: '{description_prestation}' },

    // Variables Financières
    { category: 'Montants', label: 'Montant HT', value: '{montant_ht}' },
    { category: 'Montants', label: 'Montant HT (lettres)', value: '{montant_ht_lettres}' },
    { category: 'Montants', label: 'Taux TVA', value: '{taux_tva}' },
    { category: 'Montants', label: 'Montant TVA', value: '{montant_tva}' },
    { category: 'Montants', label: 'Montant TTC', value: '{montant_ttc}' },
    { category: 'Montants', label: 'Montant en lettres', value: '{montant_lettres}' },
    { category: 'Montants', label: 'Acompte versé', value: '{acompte_verse}' },
    { category: 'Montants', label: 'Reste à payer', value: '{reste_a_payer}' },

    // Variables Tableau de lignes
    { category: 'Tableau', label: 'Tableau des lignes', value: '{TABLEAU_LIGNES}' },
    { category: 'Tableau', label: 'Ligne de produit', value: '{LIGNE_PRODUIT}' },

    // Variables Paiement
    { category: 'Paiement', label: 'Mode de paiement', value: '{mode_paiement}' },
    { category: 'Paiement', label: 'Délai de paiement', value: '{delai_paiement}' },
    { category: 'Paiement', label: 'Conditions de paiement', value: '{conditions_paiement}' },
    { category: 'Paiement', label: 'Pénalités de retard', value: '{penalites_retard}' },

    // Variables Spéciales
    { category: 'Spécial', label: 'Saut de page', value: '{SAUT_DE_PAGE}' },
    { category: 'Spécial', label: 'Numéro de page', value: '{page}' },
    { category: 'Spécial', label: 'Total pages', value: '{total}' },
    { category: 'Spécial', label: 'Mention légale TVA', value: '{mention_tva}' },
    { category: 'Spécial', label: 'Mentions légales', value: '{mentions_legales}' }
  ];

  // Insérer une variable dans l'éditeur
  const insertVariable = (variable) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      const range = editor.getSelection();
      const index = range ? range.index : editor.getLength();
      editor.insertText(index, variable);
    }
  };

  // Charger le modèle standard
  const loadStandardTemplate = () => {
    const standardTemplate = factureService.getDefaultTemplate();
    
    // Demander confirmation si du contenu existe déjà
    if (content && content.trim() !== '' && content !== '<p><br></p>') {
      if (!window.confirm('Voulez-vous remplacer le contenu actuel par le modèle standard ? Cette action ne peut pas être annulée.')) {
        return;
      }
    }
    
    // Charger le contenu du modèle standard
    setContent(standardTemplate.content);
    
    // Si le nom est vide, suggérer un nom
    if (!name.trim()) {
      setName('Mon modèle personnalisé');
    }
    
    // Mettre à jour le type si nécessaire
    if (!templateType) {
      setTemplateType(standardTemplate.templateType);
    }
  };

  // Importer depuis un fichier
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;

      if (editorRef.current) {
        const editor = editorRef.current.getEditor();
        
        // Pour les fichiers TXT et MD, on garde juste le texte brut
        if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          // Convertir le texte brut en HTML simple
          const htmlContent = fileContent
            .split('\n\n')
            .map(paragraph => {
              if (!paragraph.trim()) return '';
              return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
            })
            .filter(p => p)
            .join('');
          
          editor.setText('');
          editor.clipboard.dangerouslyPasteHTML(0, htmlContent);
          
          setTimeout(() => {
            const newContent = editor.root.innerHTML;
            setContent(newContent);
          }, 100);
        } else {
          editor.setText('');
          editor.clipboard.dangerouslyPasteHTML(0, fileContent);
          
          setTimeout(() => {
            const newContent = editor.root.innerHTML;
            setContent(newContent);
          }, 100);
        }
      }
    };

    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  return (
    <div className={`${styles.container} ${isModalContext ? styles.modalContainer : ''}`}>
      {/* Header - Adapté selon le contexte */}
      {!isModalContext && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              {template?.id ? 'Modifier le modèle de facture' : 'Créer un nouveau modèle de facture'}
            </h2>
            <div className={styles.headerActions}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !content.trim()}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header compact pour la modale */}
      {isModalContext && (
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>
              {template?.id ? 'Modifier le modèle de facture' : 'Créer un nouveau modèle de facture'}
            </h3>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !content.trim()}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <div className={styles.form}>
        {/* Informations du modèle */}
        <div className={styles.formSection}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nom du modèle *
              </label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du modèle de facture"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Type de facture
              </label>
              <select
                className={styles.select}
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                title={templateTypes.find(type => type.value === templateType)?.description}
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value} title={type.description}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className={styles.typeDescription}>
                {templateTypes.find(type => type.value === templateType)?.description || 
                 'Facture standard pour une prestation de service'}
              </div>
            </div>
          </div>
        </div>

        {/* Variables disponibles */}
        <div className={styles.variablesSection}>
          <div className={styles.variablesToggle}>
            <button
              className={styles.variablesToggleButton}
              onClick={() => setShowVariables(!showVariables)}
              type="button"
            >
              <i className={`bi bi-${showVariables ? 'chevron-up' : 'chevron-down'}`}></i>
              <span className={styles.variablesTitle}>
                Variables disponibles ({variables.length})
              </span>
              <span className={styles.variablesHint}>
                {showVariables ? 'Masquer' : 'Afficher'}
              </span>
            </button>
          </div>
          
          {showVariables && (
            <div className={styles.variablesContent}>
              <div className={styles.variablesCategories}>
                {['Entreprise', 'Client', 'Facture', 'Prestation', 'Montants', 'Tableau', 'Paiement', 'Spécial'].map(category => (
                  <div key={category} className={styles.variableCategory}>
                    <h4 className={styles.categoryTitle}>{category}</h4>
                    <div className={styles.variablesList}>
                      {variables
                        .filter(variable => variable.category === category)
                        .map((variable, index) => (
                          <button
                            key={index}
                            className={styles.variableButton}
                            onClick={() => insertVariable(variable.value)}
                            title={`Insérer ${variable.label}`}
                            type="button"
                          >
                            {variable.value}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Éditeur de contenu */}
        <div className={styles.editorSection}>
          <div className={styles.editorHeader}>
            <label className={styles.label}>
              Contenu du modèle *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={styles.cleanButton}
                onClick={loadStandardTemplate}
                title="Utiliser le modèle standard"
              >
                <i className="bi bi-file-earmark-check"></i> Modèle standard
              </button>
              <input
                type="file"
                id="importFile"
                accept=".txt,.md,.rtf"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
              <button
                type="button"
                className={styles.cleanButton}
                onClick={() => document.getElementById('importFile').click()}
                title="Importer depuis un fichier (TXT, MD, RTF)"
              >
                <i className="bi bi-file-earmark-text"></i> Importer fichier
              </button>
            </div>
          </div>
          <div className={`${styles.editorContainer} tc-quill-editor-wrapper`}>
            <ReactQuill
              ref={editorRef}
              key={template?.id || 'new'}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Collez ou saisissez votre modèle de facture ici..."
              className={styles.editor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

FactureTemplateEditor.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    templateType: PropTypes.string,
    bodyContent: PropTypes.string,
    isDefault: PropTypes.bool
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isModalContext: PropTypes.bool
};

export default FactureTemplateEditor;