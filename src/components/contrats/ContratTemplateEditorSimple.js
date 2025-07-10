// components/contrats/ContratTemplateEditorSimple.js
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '@/components/ui/Button';
import UserGuide from './desktop/sections/UserGuide';
import styles from './ContratTemplateEditorSimple.module.css';
// Import du module de tailles personnalisées
import { customSizeConfig } from './QuillCustomSizes';
// Import du module d'interligne - temporairement désactivé
// import { lineHeightConfig } from './QuillLineHeight';

/**
 * Éditeur de modèles de contrat simplifié
 * Interface épurée avec seulement :
 * - Header avec nom et type de modèle
 * - Grand éditeur de texte pour le contenu
 */
const ContratTemplateEditorSimple = ({ template, onSave, onClose, isModalContext }) => {
  const [name, setName] = useState(template?.name || '');
  const [templateType, setTemplateType] = useState(template?.templateType || 'cession');
  const [content, setContent] = useState(template?.bodyContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const editorRef = useRef();

  // Debug: Log template data au chargement
  console.log('🔄 ContratTemplateEditorSimple init:', {
    templateId: template?.id,
    templateName: template?.name,
    templateType: template?.templateType,
    bodyContentLength: template?.bodyContent?.length,
    isModalContext,
    hasTemplate: !!template
  });

  // Réinitialiser les champs quand un nouveau template est passé
  useEffect(() => {
    console.log('🔄 Template prop changed:', {
      templateId: template?.id,
      templateName: template?.name,
      bodyContentLength: template?.bodyContent?.length
    });
    
    setName(template?.name || '');
    setTemplateType(template?.templateType || 'cession');
    setContent(template?.bodyContent || '');
  }, [template]);

  // 🔧 PATCH IMPÉRATIF REACTQUILL - Solution éprouvée pour bug de synchronisation
  // Force la synchronisation du DOM Quill avec l'état React
  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      const editor = editorRef.current.getEditor();
      if (editor && content !== editor.root.innerHTML) {
        console.log('🔧 ReactQuill sync: forçage du contenu dans le DOM', {
          contentLength: content?.length,
          editorContentLength: editor.root.innerHTML?.length
        });
        editor.root.innerHTML = content || '';
      }
    }
  }, [content]);


  // Types de contrats disponibles
  const templateTypes = [
    { 
      value: 'cession', 
      label: 'Contrat de cession',
      description: 'Le plus courant - L\'organisateur achète un spectacle clé en main'
    },
    { 
      value: 'residence', 
      label: 'Contrat de résidence',
      description: 'Accueil de l\'artiste sur une période donnée avec accompagnement'
    },
    { 
      value: 'corealisation', 
      label: 'Contrat de coréalisation',
      description: 'Partage des risques et des recettes entre producteur et lieu'
    },
    { 
      value: 'coproduction', 
      label: 'Contrat de coproduction',
      description: 'Le lieu finance une partie de la création et devient coproducteur'
    },
    { 
      value: 'travail', 
      label: 'Contrat de travail (CDD d\'usage)',
      description: 'Embauche directe de l\'artiste via GUSO ou société de paie'
    },
    { 
      value: 'autre', 
      label: 'Autre type de contrat',
      description: 'Pour les cas particuliers non couverts'
    }
  ];

  // Configuration de l'éditeur Quill avec tailles personnalisées et nettoyage du collage
  const modules = {
    toolbar: [
      [{ 'size': customSizeConfig.sizes }], // Groupe avec les tailles personnalisées
      // [{ 'lineheight': lineHeightConfig.values }], // Interligne temporairement désactivé
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image'],
      ['blockquote', 'code-block']
    ],
    // clipboard: {
    //   // Clipboard matcher temporairement désactivé - causait des boucles infinies
    //   matchers: []
    // }
  };

  const formats = [
    'header', 'font', 'size', // 'lineheight', // Temporairement désactivé
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
        bodyContent: content,
        isDefault: template?.isDefault || false,
        // Métadonnées
        updatedAt: new Date().toISOString(),
        ...(template?.id ? {} : { createdAt: new Date().toISOString() })
      };

      console.log('💾 Sauvegarde du modèle:', {
        id: templateData.id,
        name: templateData.name,
        templateType: templateData.templateType,
        bodyContentLength: templateData.bodyContent.length,
        isModalContext,
        hasExistingTemplate: !!template?.id
      });

      await onSave(templateData);
      
      console.log('✅ Modèle sauvegardé avec succès');
      
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

  // Variables disponibles pour l'insertion - Liste mise à jour avec les nouvelles variables
  const variables = [
    // Variables Organisateur (Partie A du contrat - celui qui achète)
    { category: 'Organisateur', label: 'Raison sociale', value: 'organisateur_raison_sociale' },
    { category: 'Organisateur', label: 'Adresse', value: 'organisateur_adresse' },
    { category: 'Organisateur', label: 'Code postal', value: 'organisateur_code_postal' },
    { category: 'Organisateur', label: 'Ville', value: 'organisateur_ville' },
    { category: 'Organisateur', label: 'Pays', value: 'organisateur_pays' },
    { category: 'Organisateur', label: 'Téléphone', value: 'organisateur_telephone' },
    { category: 'Organisateur', label: 'Email', value: 'organisateur_email' },
    { category: 'Organisateur', label: 'SIRET', value: 'organisateur_siret' },
    { category: 'Organisateur', label: 'N° TVA Intracommunautaire', value: 'organisateur_numero_tva' },
    { category: 'Organisateur', label: 'Code APE', value: 'organisateur_code_ape' },
    { category: 'Organisateur', label: 'N° Licence', value: 'organisateur_numero_licence' },
    { category: 'Organisateur', label: 'Signataire', value: 'organisateur_signataire' },
    { category: 'Organisateur', label: 'Qualité du signataire', value: 'organisateur_qualite' },

    // Variables Producteur (Partie B du contrat - votre entreprise)
    { category: 'Producteur', label: 'Raison sociale', value: 'producteur_raison_sociale' },
    { category: 'Producteur', label: 'Adresse', value: 'producteur_adresse' },
    { category: 'Producteur', label: 'Code postal', value: 'producteur_code_postal' },
    { category: 'Producteur', label: 'Ville', value: 'producteur_ville' },
    { category: 'Producteur', label: 'Pays', value: 'producteur_pays' },
    { category: 'Producteur', label: 'Téléphone', value: 'producteur_telephone' },
    { category: 'Producteur', label: 'Email', value: 'producteur_email' },
    { category: 'Producteur', label: 'SIRET', value: 'producteur_siret' },
    { category: 'Producteur', label: 'N° TVA Intracommunautaire', value: 'producteur_numero_tva' },
    { category: 'Producteur', label: 'Code APE', value: 'producteur_code_ape' },
    { category: 'Producteur', label: 'N° Licence', value: 'producteur_numero_licence' },
    { category: 'Producteur', label: 'Signataire', value: 'producteur_signataire' },
    { category: 'Producteur', label: 'Qualité du signataire', value: 'producteur_qualite' },

    // Variables Prestations
    { category: 'Prestations', label: 'Total HT', value: 'total_ht' },
    { category: 'Prestations', label: 'Total TVA', value: 'total_tva' },
    { category: 'Prestations', label: 'Total TTC', value: 'total_ttc' },
    { category: 'Prestations', label: 'Total TTC (lettres)', value: 'total_ttc_lettres' },
    { category: 'Prestations', label: 'Première prestation - Description', value: 'prestation_1_description' },
    { category: 'Prestations', label: 'Première prestation - Montant HT', value: 'prestation_1_montant_ht' },
    { category: 'Prestations', label: 'Première prestation - TVA', value: 'prestation_1_tva' },
    { category: 'Prestations', label: 'Première prestation - Montant TTC', value: 'prestation_1_montant_ttc' },

    // Variables Représentations
    { category: 'Représentations', label: 'Date de début', value: 'representation_date_debut' },
    { category: 'Représentations', label: 'Date de fin', value: 'representation_date_fin' },
    { category: 'Représentations', label: 'Horaire de début', value: 'representation_horaire_debut' },
    { category: 'Représentations', label: 'Horaire de fin', value: 'representation_horaire_fin' },
    { category: 'Représentations', label: 'Nombre de représentations', value: 'representation_nombre' },
    { category: 'Représentations', label: 'Salle', value: 'representation_salle' },
    { category: 'Représentations', label: 'Type (payant/gratuit)', value: 'representation_type' },
    { category: 'Représentations', label: 'Nombre d\'invitations', value: 'representation_invitations' },

    // Variables Logistique
    { category: 'Logistique', label: 'Hébergement - Nombre total', value: 'hebergement_nombre_total' },
    { category: 'Logistique', label: 'Hébergement - Singles', value: 'hebergement_singles' },
    { category: 'Logistique', label: 'Hébergement - Doubles', value: 'hebergement_doubles' },
    { category: 'Logistique', label: 'Hébergement - Arrivée', value: 'hebergement_arrivee' },
    { category: 'Logistique', label: 'Hébergement - Départ', value: 'hebergement_depart' },
    { category: 'Logistique', label: 'Restauration - Nombre de repas', value: 'restauration_nombre' },
    { category: 'Logistique', label: 'Transport - Type', value: 'transport_type' },

    // Variables Règlement
    { category: 'Règlement', label: 'Première échéance - Nature', value: 'echeance_1_nature' },
    { category: 'Règlement', label: 'Première échéance - Date', value: 'echeance_1_date' },
    { category: 'Règlement', label: 'Première échéance - Montant', value: 'echeance_1_montant' },
    { category: 'Règlement', label: 'Mode de règlement', value: 'mode_reglement' },
    { category: 'Règlement', label: 'Délai de paiement', value: 'delai_paiement' },

    // Variables Entreprise (compatibilité)
    { category: 'Entreprise', label: 'Nom de l\'entreprise', value: 'nom_entreprise' },
    { category: 'Entreprise', label: 'Adresse de l\'entreprise', value: 'adresse_entreprise' },
    { category: 'Entreprise', label: 'SIRET de l\'entreprise', value: 'siret_entreprise' },
    { category: 'Entreprise', label: 'Téléphone de l\'entreprise', value: 'telephone_entreprise' },
    { category: 'Entreprise', label: 'Email de l\'entreprise', value: 'email_entreprise' },
    { category: 'Entreprise', label: 'Représentant de l\'entreprise', value: 'representant_entreprise' },
    { category: 'Entreprise', label: 'Fonction du représentant', value: 'fonction_representant' },

    // Variables contact (pour rétrocompatibilité)
    { category: 'Contact', label: 'Nom du contact', value: 'contact_nom' },
    { category: 'Contact', label: 'Prénom du contact', value: 'contact_prenom' },
    { category: 'Contact', label: 'Structure du contact', value: 'contact_structure' },
    { category: 'Contact', label: 'Email du contact', value: 'contact_email' },
    { category: 'Contact', label: 'Téléphone du contact', value: 'contact_telephone' },
    { category: 'Contact', label: 'Adresse du contact', value: 'contact_adresse' },
    { category: 'Contact', label: 'SIRET du contact', value: 'contact_siret' },
    { category: 'Contact', label: 'N° TVA du contact', value: 'contact_numero_intracommunautaire' },
    { category: 'Contact', label: 'Représentant légal', value: 'contact_representant' },
    { category: 'Contact', label: 'Qualité du représentant', value: 'contact_qualite_representant' },

    // Variables programmateur (rétrocompatibilité)
    { category: 'Programmateur', label: 'Nom du programmateur', value: 'programmateur_nom' },
    { category: 'Programmateur', label: 'Prénom du programmateur', value: 'programmateur_prenom' },
    { category: 'Programmateur', label: 'Structure du programmateur', value: 'programmateur_structure' },
    { category: 'Programmateur', label: 'Email du programmateur', value: 'programmateur_email' },
    { category: 'Programmateur', label: 'Téléphone du programmateur', value: 'programmateur_telephone' },
    { category: 'Programmateur', label: 'Adresse du programmateur', value: 'programmateur_adresse' },
    { category: 'Programmateur', label: 'SIRET du programmateur', value: 'programmateur_siret' },

    // Variables Structure
    { category: 'Structure', label: 'Nom de la structure', value: 'structure_nom' },
    { category: 'Structure', label: 'SIRET de la structure', value: 'structure_siret' },
    { category: 'Structure', label: 'Adresse de la structure', value: 'structure_adresse' },
    { category: 'Structure', label: 'Code postal de la structure', value: 'structure_code_postal' },
    { category: 'Structure', label: 'Ville de la structure', value: 'structure_ville' },
    { category: 'Structure', label: 'Email de la structure', value: 'structure_email' },
    { category: 'Structure', label: 'Téléphone de la structure', value: 'structure_telephone' },
    { category: 'Structure', label: 'Type de structure', value: 'structure_type' },

    // Variables Artiste
    { category: 'Artiste', label: 'Nom de l\'artiste', value: 'artiste_nom' },
    { category: 'Artiste', label: 'Genre musical', value: 'artiste_genre' },
    { category: 'Artiste', label: 'Contact de l\'artiste', value: 'artiste_contact' },
    { category: 'Artiste', label: 'Représentant de l\'artiste', value: 'artiste_representant' },
    { category: 'Artiste', label: 'Structure de l\'artiste', value: 'artiste_structure_nom' },
    { category: 'Artiste', label: 'SIRET structure artiste', value: 'artiste_structure_siret' },

    // Variables Date
    { category: 'Date', label: 'Titre de la date', value: 'date_titre' },
    { category: 'Date', label: 'Date de la date', value: 'date_date' },
    { category: 'Date', label: 'Heure de la date', value: 'date_heure' },
    { category: 'Date', label: 'Montant de la date', value: 'date_montant' },
    { category: 'Date', label: 'Montant en lettres', value: 'date_montant_lettres' },
    { category: 'Date', label: 'Type d\'événement', value: 'date_type' },

    // Variables Lieu
    { category: 'Lieu', label: 'Nom du lieu', value: 'lieu_nom' },
    { category: 'Lieu', label: 'Adresse du lieu', value: 'lieu_adresse' },
    { category: 'Lieu', label: 'Code postal du lieu', value: 'lieu_code_postal' },
    { category: 'Lieu', label: 'Ville du lieu', value: 'lieu_ville' },
    { category: 'Lieu', label: 'Capacité du lieu', value: 'lieu_capacite' },

    // Variables Dates
    { category: 'Dates', label: 'Jour actuel', value: 'date_jour' },
    { category: 'Dates', label: 'Mois actuel', value: 'date_mois' },
    { category: 'Dates', label: 'Année actuelle', value: 'date_annee' },
    { category: 'Dates', label: 'Date complète', value: 'date_complete' },
    { category: 'Dates', label: 'Date de signature', value: 'date_signature' },

    // Variables Signature
    { category: 'Signature', label: 'Lieu de signature', value: 'lieu_signature' },
    { category: 'Signature', label: 'Fonction programmateur', value: 'programmateur_fonction' },

    // Variables Spéciales
    { category: 'Spécial', label: 'Saut de page', value: 'SAUT_DE_PAGE' },
    { category: 'Spécial', label: 'Numéro de page', value: 'page' },
    { category: 'Spécial', label: 'Total pages', value: 'total' }
  ];

  // Insérer une variable dans l'éditeur
  const insertVariable = (variable) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      const range = editor.getSelection();
      const index = range ? range.index : editor.getLength();
      // Ajouter les accolades autour de la variable
      editor.insertText(index, `{${variable}}`);
    }
  };

  // Importer depuis un fichier
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 Import de fichier:', file.name, file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      console.log('📄 Contenu du fichier lu:', fileContent.substring(0, 200) + '...');

      if (editorRef.current) {
        const editor = editorRef.current.getEditor();
        
        // Pour les fichiers TXT et MD, on garde juste le texte brut
        if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          // Convertir le texte brut en HTML simple
          const htmlContent = fileContent
            .split('\n\n')
            .map(paragraph => {
              // Ignorer les paragraphes vides
              if (!paragraph.trim()) return '';
              // Remplacer les sauts de ligne simples par des <br>
              return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
            })
            .filter(p => p) // Enlever les paragraphes vides
            .join('');
          
          console.log('📝 HTML généré:', htmlContent.substring(0, 200) + '...');
          
          // Effacer le contenu actuel d'abord
          editor.setText('');
          
          // Utiliser l'API Quill pour insérer le HTML
          editor.clipboard.dangerouslyPasteHTML(0, htmlContent);
          
          // IMPORTANT: Forcer la mise à jour de l'état React
          setTimeout(() => {
            const newContent = editor.root.innerHTML;
            setContent(newContent);
            console.log('✅ État React mis à jour');
          }, 100);
          
          console.log('✅ Fichier importé avec succès (format texte)');
        } else {
          // Pour d'autres formats
          editor.setText('');
          editor.clipboard.dangerouslyPasteHTML(0, fileContent);
          
          setTimeout(() => {
            const newContent = editor.root.innerHTML;
            setContent(newContent);
          }, 100);
          
          console.log('✅ Fichier importé avec succès');
        }
      }
    };

    // Lire comme texte
    reader.readAsText(file, 'UTF-8');
    
    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
  };

  // Nettoyer l'interligne - Méthode plus robuste pour Google Docs
  const cleanLineHeight = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      
      console.log('🧹 Début du nettoyage de l\'interligne...');
      
      // Méthode plus propre : utiliser l'API Quill pour modifier le contenu
      const currentContents = editor.getContents();
      console.log('📄 Contenu actuel:', currentContents);
      
      // Obtenir tout le contenu HTML
      let htmlContent = editor.root.innerHTML;
      console.log('🔍 HTML avant nettoyage:', htmlContent.substring(0, 200) + '...');
      
      // Nettoyer avec des regex pour être plus précis
      htmlContent = htmlContent
        // Supprimer line-height inline
        .replace(/line-height:\s*[^;]*;?/gi, '')
        // Supprimer margin inline
        .replace(/margin(-top|-bottom|-left|-right)?:\s*[^;]*;?/gi, '')
        // Supprimer padding inline  
        .replace(/padding(-top|-bottom|-left|-right)?:\s*[^;]*;?/gi, '')
        // Nettoyer les attributs style vides
        .replace(/style\s*=\s*["'][\s]*["']/gi, '')
        .replace(/style\s*=\s*["'];*["']/gi, '')
        // Supprimer les spans vides de style
        .replace(/<span[^>]*style\s*=\s*["'][\s]*["'][^>]*>/gi, '<span>')
        .replace(/<span>([^<]*)<\/span>/gi, '$1');
      
      console.log('🔍 HTML après nettoyage:', htmlContent.substring(0, 200) + '...');
      
      // Utiliser l'API Quill pour remplacer le contenu
      editor.clipboard.dangerouslyPasteHTML(0, htmlContent);
      
      // Mettre à jour l'état React
      setContent(htmlContent);
      
      console.log('✅ Nettoyage terminé avec l\'API Quill');
    }
  };

  return (
    <div className={`${styles.container} ${isModalContext ? styles.modalContainer : ''}`}>
      {/* Header - Adapté selon le contexte */}
      {!isModalContext && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
            </h2>
            <div className={styles.headerActions}>
              <Button
                variant="outline"
                onClick={() => setShowGuide(!showGuide)}
                title={showGuide ? "Masquer l'aide" : "Afficher l'aide"}
              >
                <i className="bi bi-question-circle me-2"></i>
                {showGuide ? "Masquer l'aide" : "Aide"}
              </Button>
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
              {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
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
                variant="outline"
                size="sm"
                onClick={() => setShowGuide(!showGuide)}
                title={showGuide ? "Masquer l'aide" : "Afficher l'aide"}
              >
                <i className="bi bi-question-circle"></i>
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

      {/* Guide d'utilisation */}
      {showGuide && (
        <UserGuide onClose={() => setShowGuide(false)} />
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
                placeholder="Nom du modèle de contrat"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Type de contrat
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
                 'Le plus courant - L\'organisateur achète un spectacle clé en main'}
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
                {['Organisateur', 'Producteur', 'Prestations', 'Représentations', 'Logistique', 'Règlement', 'Entreprise', 'Contact', 'Programmateur', 'Structure', 'Artiste', 'Date', 'Lieu', 'Dates', 'Signature', 'Spécial'].map(category => (
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
                            {`{${variable.value}}`}
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
                onClick={cleanLineHeight}
                title="Corriger l'interligne après un copier-coller depuis Google Docs"
              >
                <i className="bi bi-magic"></i> Corriger l'interligne
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
              key={template?.id || 'new'} // Force remount when template changes
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Collez ou saisissez votre modèle de contrat ici..."
              className={styles.editor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ContratTemplateEditorSimple.propTypes = {
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

export default ContratTemplateEditorSimple;