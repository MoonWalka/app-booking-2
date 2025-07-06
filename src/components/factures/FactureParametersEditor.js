// components/factures/FactureParametersEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import styles from './FactureParametersEditor.module.css';
import factureService from '@/services/factureService';

/**
 * Éditeur de paramètres pour le modèle standard de facture
 * Permet de configurer les éléments personnalisables sans modifier le template
 */
const FactureParametersEditor = ({ parameters, onSave, onClose, isModalContext }) => {
  // État local pour les paramètres
  const [config, setConfig] = useState({
    // Informations entreprise
    showLogo: true,
    logoUrl: '',
    
    // Format du numéro de facture
    numeroPrefix: 'FAC',
    numeroFormat: 'YYYY-MM-XXXX', // YYYY=année, MM=mois, XXXX=numéro séquentiel
    numeroSeparator: '-',
    
    // Mentions et textes personnalisables
    titreFacture: 'FACTURE',
    mentionTva: 'TVA non applicable, article 293B du CGI',
    conditionsPaiement: 'Paiement à réception de facture',
    penalitesRetard: 'En cas de retard de paiement, des pénalités de retard sont exigibles (taux légal en vigueur).',
    escompte: 'Pas d\'escompte pour paiement anticipé',
    
    // Options d'affichage
    afficherTva: true,
    tauxTva: 20,
    afficherNumeroTva: true,
    afficherMentionsLegales: true,
    afficherSignature: false,
    
    // Coordonnées bancaires
    afficherIban: true,
    afficherBic: true,
    iban: '',
    bic: '',
    nomBanque: '',
    
    // Mise en page
    couleurPrimaire: '#3b82f6',
    couleurSecondaire: '#1f2937',
    
    // Pied de page
    afficherPiedDePage: true,
    textePiedDePage: '',
    
    ...parameters // Fusionner avec les paramètres existants
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Générer un exemple de numéro selon le format
  const generateExampleNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    let numeroBase = config.numeroFormat
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('XXXX', '0001');
    
    return config.numeroPrefix + config.numeroSeparator + numeroBase;
  }, [config.numeroFormat, config.numeroSeparator, config.numeroPrefix]);

  // Générer l'aperçu en temps réel
  useEffect(() => {
    const generatePreview = () => {
      const template = factureService.getDefaultTemplate();
      const exampleData = {
        // Données d'exemple pour l'aperçu
        nom_entreprise: 'Mon Entreprise SARL',
        adresse_entreprise: '123 rue de la Musique',
        ville_entreprise: '75001 Paris',
        siret_entreprise: '123 456 789 00012',
        numero_tva_entreprise: 'FR12345678901',
        telephone_entreprise: '01 23 45 67 89',
        email_entreprise: 'contact@monentreprise.fr',
        
        nom_structure: 'Salle de Date XYZ',
        adresse_structure: '456 avenue du Spectacle',
        ville_structure: '69000 Lyon',
        siret_structure: '987 654 321 00098',
        tva_structure: 'FR98765432109',
        email_structure: 'contact@sallededate.fr',
        telephone_structure: '04 78 90 12 34',
        
        numero_facture: generateExampleNumber(),
        date_facture: new Date().toLocaleDateString('fr-FR'),
        
        // Contact
        contact_nom: 'Jean Dupont',
        contact_telephone: '06 12 34 56 78',
        contact_email: 'jean.dupont@sallededate.fr',
        
        titre_date: 'Date de Jazz',
        date_date: '15/02/2025',
        lieu_nom: 'Théâtre Municipal',
        lieu_ville: 'Lyon',
        artiste_nom: 'Trio Jazz Fusion',
        montant_ht: '2 500,00',
        taux_tva: config.tauxTva,
        montant_tva: config.afficherTva ? (2500 * config.tauxTva / 100).toFixed(2).replace('.', ',') : '0,00',
        montant_ttc: config.afficherTva ? (2500 * (1 + config.tauxTva / 100)).toFixed(2).replace('.', ',') : '2 500,00',
        montant_lettres: config.afficherTva 
          ? `deux mille six cents euros` 
          : `deux mille cinq cents euros`,
        
        // Informations bancaires - utiliser les paramètres configurés
        iban_entreprise: config.iban || 'FR76 1234 5678 9012 3456 7890 123',
        bic_entreprise: config.bic || 'BNPAFRPPXXX',
        banque_entreprise: config.nomBanque || 'BNP Paribas',
        
        // Dates
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        delai_paiement: '30',
        
        // Mentions légales
        mentions_legales: 'Capital social : 10 000 € - RCS Paris B 123 456 789',
        
        // Intégrer les paramètres configurables
        titre_facture: config.titreFacture,
        mention_tva: config.mentionTva,
        conditions_paiement: config.conditionsPaiement,
        penalites_retard: config.penalitesRetard,
        escompte: config.escompte,
        couleur_primaire: config.couleurPrimaire,
        couleur_secondaire: config.couleurSecondaire,
        logo_url: config.logoUrl,
        show_logo: config.showLogo,
        show_tva: config.afficherTva,
        show_numero_tva: config.afficherNumeroTva,
        show_mentions_legales: config.afficherMentionsLegales,
        show_iban: config.afficherIban,
        show_bic: config.afficherBic,
        show_signature: config.afficherSignature,
        
        // Pied de page
        show_pied_de_page: config.afficherPiedDePage,
        texte_pied_de_page: config.textePiedDePage
      };
      
      // Appliquer les variables au template
      let content = factureService.replaceVariables(template.content, exampleData);
      
      // Appliquer les personnalisations CSS
      content = `
        <style>
          .invoice-header { background-color: ${config.couleurPrimaire}10; border-color: ${config.couleurPrimaire}; }
          .invoice-title { color: ${config.couleurPrimaire}; }
          h1, h2, h3 { color: ${config.couleurSecondaire}; }
          .table-header { background-color: ${config.couleurPrimaire}; }
        </style>
        ${content}
      `;
      
      setPreviewContent(content);
    };
    
    generatePreview();
  }, [config, generateExampleNumber]);

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave({
        type: 'factureParameters',
        parameters: config,
        updatedAt: new Date().toISOString()
      });
      
      if (!isModalContext && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${styles.container} ${isModalContext ? styles.modalContainer : ''}`}>
      {/* Header compact pour la modale */}
      {isModalContext && (
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>
              Paramètres de facturation
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
                onClick={() => setShowPreview(!showPreview)}
                title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
              >
                <i className={`bi bi-${showPreview ? 'eye-slash' : 'eye'}`}></i>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Panneau de configuration */}
        <div className={styles.configPanel}>
          <div className={styles.form}>
            {/* Section Format de numérotation */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-hash me-2"></i>
                Format de numérotation
              </h4>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Préfixe</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.numeroPrefix}
                  onChange={(e) => setConfig({...config, numeroPrefix: e.target.value})}
                  placeholder="FAC"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Format</label>
                <select
                  className={styles.select}
                  value={config.numeroFormat}
                  onChange={(e) => setConfig({...config, numeroFormat: e.target.value})}
                >
                  <option value="YYYY-MM-XXXX">Année-Mois-Numéro (2025-01-0001)</option>
                  <option value="YYYY-XXXX">Année-Numéro (2025-0001)</option>
                  <option value="XXXX">Numéro simple (0001)</option>
                  <option value="YYYY/MM/XXXX">Année/Mois/Numéro (2025/01/0001)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Séparateur</label>
                <select
                  className={styles.select}
                  value={config.numeroSeparator}
                  onChange={(e) => setConfig({...config, numeroSeparator: e.target.value})}
                >
                  <option value="-">Tiret (-)</option>
                  <option value="/">Slash (/)</option>
                  <option value="_">Underscore (_)</option>
                  <option value="">Aucun</option>
                </select>
              </div>

              <div className={styles.exampleBox}>
                <span className={styles.exampleLabel}>Exemple :</span>
                <span className={styles.exampleValue}>
                  {generateExampleNumber()}
                </span>
              </div>
            </div>

            {/* Section Informations de facturation */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-card-text me-2"></i>
                Informations de facturation
              </h4>

              <div className={styles.formGroup}>
                <label className={styles.label}>Titre du document</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.titreFacture}
                  onChange={(e) => setConfig({...config, titreFacture: e.target.value})}
                  placeholder="FACTURE"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    checked={config.afficherTva}
                    onChange={(e) => setConfig({...config, afficherTva: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher la TVA
                </label>
              </div>

              {config.afficherTva && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Taux de TVA par défaut (%)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={config.tauxTva}
                    onChange={(e) => setConfig({...config, tauxTva: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Mention TVA</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.mentionTva}
                  onChange={(e) => setConfig({...config, mentionTva: e.target.value})}
                  placeholder="TVA non applicable, article 293B du CGI"
                />
              </div>
            </div>

            {/* Section Conditions de paiement */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-credit-card me-2"></i>
                Conditions de paiement
              </h4>

              <div className={styles.formGroup}>
                <label className={styles.label}>Conditions de paiement</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.conditionsPaiement}
                  onChange={(e) => setConfig({...config, conditionsPaiement: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pénalités de retard</label>
                <textarea
                  className={styles.textarea}
                  value={config.penalitesRetard}
                  onChange={(e) => setConfig({...config, penalitesRetard: e.target.value})}
                  rows="2"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Escompte</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.escompte}
                  onChange={(e) => setConfig({...config, escompte: e.target.value})}
                />
              </div>
            </div>

            {/* Section Informations bancaires */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-bank me-2"></i>
                Informations bancaires
              </h4>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nom de la banque</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.nomBanque}
                  onChange={(e) => setConfig({...config, nomBanque: e.target.value})}
                  placeholder="Ex: BNP Paribas"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>IBAN</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.iban}
                  onChange={(e) => setConfig({...config, iban: e.target.value})}
                  placeholder="Ex: FR76 1234 5678 9012 3456 7890 123"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>BIC</label>
                <input
                  type="text"
                  className={styles.input}
                  value={config.bic}
                  onChange={(e) => setConfig({...config, bic: e.target.value})}
                  placeholder="Ex: BNPAFRPPXXX"
                />
              </div>
            </div>

            {/* Section Options d'affichage */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-toggle-on me-2"></i>
                Options d'affichage
              </h4>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) => setConfig({...config, showLogo: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher le logo de l'entreprise
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.afficherNumeroTva}
                    onChange={(e) => setConfig({...config, afficherNumeroTva: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher le numéro de TVA intracommunautaire
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.afficherIban}
                    onChange={(e) => setConfig({...config, afficherIban: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher l'IBAN
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.afficherBic}
                    onChange={(e) => setConfig({...config, afficherBic: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher le BIC
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.afficherMentionsLegales}
                    onChange={(e) => setConfig({...config, afficherMentionsLegales: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher les mentions légales
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.afficherSignature}
                    onChange={(e) => setConfig({...config, afficherSignature: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Espace pour signature
                </label>
              </div>
            </div>

            {/* Section Personnalisation visuelle */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-palette me-2"></i>
                Personnalisation visuelle
              </h4>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Couleur primaire</label>
                  <div className={styles.colorInputWrapper}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={config.couleurPrimaire}
                      onChange={(e) => setConfig({...config, couleurPrimaire: e.target.value})}
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={config.couleurPrimaire}
                      onChange={(e) => setConfig({...config, couleurPrimaire: e.target.value})}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Couleur secondaire</label>
                  <div className={styles.colorInputWrapper}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={config.couleurSecondaire}
                      onChange={(e) => setConfig({...config, couleurSecondaire: e.target.value})}
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={config.couleurSecondaire}
                      onChange={(e) => setConfig({...config, couleurSecondaire: e.target.value})}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>URL du logo (optionnel)</label>
                <input
                  type="url"
                  className={styles.input}
                  value={config.logoUrl}
                  onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                  placeholder="https://exemple.com/logo.png"
                />
                <div className={styles.formHelp}>
                  <i className="bi bi-info-circle me-1"></i>
                  Pour l'instant, utilisez un lien vers votre logo hébergé en ligne. 
                  Une fonction d'upload sera bientôt disponible dans les paramètres de l'organisation.
                </div>
              </div>
            </div>

            {/* Section Pied de page */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-file-text me-2"></i>
                Pied de page
              </h4>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    checked={config.afficherPiedDePage}
                    onChange={(e) => setConfig({...config, afficherPiedDePage: e.target.checked})}
                    className={styles.checkbox}
                  />
                  Afficher un pied de page personnalisé
                </label>
              </div>

              {config.afficherPiedDePage && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Texte du pied de page</label>
                  <textarea
                    className={styles.textarea}
                    value={config.textePiedDePage}
                    onChange={(e) => setConfig({...config, textePiedDePage: e.target.value})}
                    placeholder="Ex: Merci de votre confiance. N'hésitez pas à nous contacter pour toute question."
                    rows="3"
                  />
                  <div className={styles.formHelp}>
                    <i className="bi bi-info-circle me-1"></i>
                    Ce texte apparaîtra en bas de chaque facture, au-dessus des mentions légales.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panneau d'aperçu */}
        {showPreview && (
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>
                <i className="bi bi-eye me-2"></i>
                Aperçu du modèle
              </h3>
            </div>
            <div className={styles.previewContent}>
              <div 
                className={styles.previewDocument}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FactureParametersEditor.propTypes = {
  parameters: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isModalContext: PropTypes.bool
};

export default FactureParametersEditor;