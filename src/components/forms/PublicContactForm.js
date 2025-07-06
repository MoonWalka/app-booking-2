import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import AddressInput from '@/components/ui/AddressInput';
import Card from '@/components/ui/Card';
import styles from '@/pages/FormResponsePage.module.css';

// Import conditionnel du bouton de test
let TestFormButton = null;
if (process.env.NODE_ENV === 'development') {
  TestFormButton = require('@/components/debug/TestFormButton').default;
}

const PublicContactForm = ({ 
  token, 
  dateId, 
  formLinkId, 
  onSubmitSuccess,
  contactEmail, // Email du contact passé si disponible
  programmateurEmail, // Rétrocompatibilité
  lieu // Données du lieu depuis le concert
}) => {
  const { currentOrganization } = useOrganization();
  
  // États du formulaire restructuré
  const [formData, setFormData] = useState({
    // Adresse du lieu (prioritaire) - pré-rempli si lieu disponible
    lieuNom: lieu?.nom || '',
    lieuAdresse: lieu?.adresse || '',
    lieuCodePostal: lieu?.codePostal || '',
    lieuVille: lieu?.ville || '',
    lieuPays: lieu?.pays || 'France',
    
    // Informations de la structure (optionnel)
    structureNom: '',
    structureSiret: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: '',
    structureNumeroIntracommunautaire: '',
    
    // Informations du signataire du contrat
    signataireNom: '',
    signatairePrenom: '',
    signataireFonction: '', // Qualité/fonction du signataire
    signataireEmail: contactEmail || programmateurEmail || '', // Prérempli si disponible
    signataireTelephone: '' // Facultatif
  });

  // États pour la recherche SIRET
  const [siretSearch, setSiretSearch] = useState('');
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretResults, setSiretResults] = useState([]);
  const [siretError, setSiretError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mettre à jour les données du lieu quand le prop lieu change
  useEffect(() => {
    if (lieu) {
      setFormData(prev => ({
        ...prev,
        lieuNom: lieu.nom || prev.lieuNom,
        lieuAdresse: lieu.adresse || prev.lieuAdresse,
        lieuCodePostal: lieu.codePostal || prev.lieuCodePostal,
        lieuVille: lieu.ville || prev.lieuVille,
        lieuPays: lieu.pays || prev.lieuPays || 'France'
      }));
    }
  }, [lieu]);

  // Charger les données existantes si le formulaire a déjà été soumis
  useEffect(() => {
    const loadExistingData = async () => {
      if (!formLinkId) return;

      try {
        // Récupérer les données du lien de formulaire
        const formLinkDoc = await getDoc(doc(db, 'formLinks', formLinkId));
        
        if (formLinkDoc.exists()) {
          const formLinkData = formLinkDoc.data();
          
          // Préremplir l'email si disponible dans les données du lien
          if (formLinkData.contactEmail || formLinkData.programmateurEmail) {
            setFormData(prev => ({
              ...prev,
              signataireEmail: prev.signataireEmail || formLinkData.contactEmail || formLinkData.programmateurEmail
            }));
          }
          
          // Si le formulaire a déjà été complété, récupérer les données
          if (formLinkData.completed && formLinkData.submissionId) {
            const submissionDoc = await getDoc(doc(db, 'formSubmissions', formLinkData.submissionId));
            
            if (submissionDoc.exists()) {
              const submissionData = submissionDoc.data();
              
              // Pré-remplir le formulaire avec les données existantes
              if (submissionData.lieuData || submissionData.signataireData || submissionData.structureData) {
                setFormData({
                  // Données du lieu
                  lieuNom: submissionData.lieuData?.nom || '',
                  lieuAdresse: submissionData.lieuData?.adresse || '',
                  lieuCodePostal: submissionData.lieuData?.codePostal || '',
                  lieuVille: submissionData.lieuData?.ville || '',
                  lieuPays: submissionData.lieuData?.pays || 'France',
                  
                  // Données de la structure
                  structureNom: submissionData.structureData?.nom || '',
                  structureSiret: submissionData.structureData?.siret || '',
                  structureAdresse: submissionData.structureData?.adresse || '',
                  structureCodePostal: submissionData.structureData?.codePostal || '',
                  structureVille: submissionData.structureData?.ville || '',
                  structureNumeroIntracommunautaire: submissionData.structureData?.numeroIntracommunautaire || '',
                  
                  // Données du signataire
                  signataireNom: submissionData.signataireData?.nom || '',
                  signatairePrenom: submissionData.signataireData?.prenom || '',
                  signataireFonction: submissionData.signataireData?.fonction || '',
                  signataireEmail: submissionData.signataireData?.email || formLinkData.contactEmail || formLinkData.programmateurEmail || '',
                  signataireTelephone: submissionData.signataireData?.telephone || ''
                });

                // Pré-remplir aussi le champ de recherche SIRET si disponible
                if (submissionData.structureData?.nom) {
                  setSiretSearch(submissionData.structureData.nom);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données existantes:', error);
      }
    };

    loadExistingData();
  }, [formLinkId]);

  // Gestion des changements de champ
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Callback pour quand une adresse est sélectionnée via l'autocomplétion
  const handleAddressSelected = (addressData) => {
    setFormData(prev => ({
      ...prev,
      lieuAdresse: addressData.adresse || '',
      lieuCodePostal: addressData.codePostal || '',
      lieuVille: addressData.ville || '',
      lieuPays: addressData.pays || 'France'
    }));
  };

  // Recherche automatique avec debounce
  const handleSiretInputChange = (e) => {
    const value = e.target.value;
    setSiretSearch(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.trim().length < 3) {
      setSiretResults([]);
      setShowDropdown(false);
      setSiretError('');
      return;
    }
    
    // Debounce search
    const timeout = setTimeout(() => {
      performSiretSearch(value.trim());
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Recherche SIRET via API
  const performSiretSearch = async (searchTerm) => {
    setSiretLoading(true);
    setSiretError('');
    setSiretResults([]);

    try {
      const apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=5`;

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Erreur de recherche');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSiretResults(data.results);
        setShowDropdown(true);
      } else {
        setSiretResults([]);
        setShowDropdown(false);
        setSiretError('Aucune entreprise trouvée');
      }

    } catch (error) {
      console.error('Erreur recherche SIRET:', error);
      setSiretError('Erreur lors de la recherche');
      setSiretResults([]);
      setShowDropdown(false);
    } finally {
      setSiretLoading(false);
    }
  };

  // Sélection d'une entreprise dans le dropdown
  const handleSelectEntreprise = (entreprise) => {
    const nom = entreprise.nom_complet || 
                entreprise.nom_raison_sociale ||
                entreprise.denomination ||
                `${entreprise.prenom || ''} ${entreprise.nom || ''}`.trim();

    // Utiliser les informations du siège pour l'adresse
    const siege = entreprise.siege || {};
    const numeroVoie = siege.numero_voie || '';
    const typeVoie = siege.type_voie || '';
    const libelleVoie = siege.libelle_voie || '';
    const adresse = `${numeroVoie} ${typeVoie} ${libelleVoie}`.trim();
    
    // Mettre à jour le formulaire avec les données sélectionnées
    setFormData(prev => ({
      ...prev,
      structureNom: nom,
      structureSiret: siege.siret || entreprise.siren,
      structureAdresse: adresse || siege.adresse || '',
      structureCodePostal: siege.code_postal || '',
      structureVille: siege.libelle_commune || '',
      structureNumeroIntracommunautaire: siege.numeroIntracommunautaire || ''
    }));

    // Mettre à jour le champ de recherche avec le nom sélectionné
    setSiretSearch(nom);
    
    // Fermer le dropdown
    setShowDropdown(false);
    setSiretResults([]);
    setSiretError('');
  };

  // Fermer le dropdown quand on clique ailleurs
  const handleInputBlur = () => {
    // Delay pour permettre le clic sur un élément du dropdown
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    // Validation adresse du lieu
    if (!formData.lieuNom.trim()) errors.push('Le nom du lieu est obligatoire');
    if (!formData.lieuAdresse.trim()) errors.push('L\'adresse du lieu est obligatoire');
    if (!formData.lieuCodePostal.trim()) errors.push('Le code postal du lieu est obligatoire');
    if (!formData.lieuVille.trim()) errors.push('La ville du lieu est obligatoire');
    
    // Validation structure (obligatoire)
    if (!formData.structureNom.trim()) errors.push('Le nom de la structure est obligatoire');
    if (!formData.structureAdresse.trim()) errors.push('L\'adresse de la structure est obligatoire');
    if (!formData.structureCodePostal.trim()) errors.push('Le code postal de la structure est obligatoire');
    if (!formData.structureVille.trim()) errors.push('La ville de la structure est obligatoire');
    
    // Validation signataire
    if (!formData.signataireNom.trim()) errors.push('Le nom du signataire est obligatoire');
    if (!formData.signatairePrenom.trim()) errors.push('Le prénom du signataire est obligatoire');
    if (!formData.signataireFonction.trim()) errors.push('La fonction du signataire est obligatoire');
    
    // Validation email si renseigné
    if (formData.signataireEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.signataireEmail)) {
        errors.push('Format d\'email invalide');
      }
    }

    return errors;
  };

  /**
   * Remplit le formulaire avec des données de test
   */
  const handleTestDataFill = (testData) => {
    if (!testData) return;
    
    setFormData({
      // Conserver les données du lieu déjà remplies
      lieuNom: formData.lieuNom,
      lieuAdresse: formData.lieuAdresse,
      lieuCodePostal: formData.lieuCodePostal,
      lieuVille: formData.lieuVille,
      lieuPays: formData.lieuPays || 'France',
      
      // Remplir avec les données de test
      structureNom: testData.structureRaisonSociale || testData.nom || '',
      structureSiret: testData.structureSiret || '',
      structureAdresse: testData.structureAdresse || '',
      structureCodePostal: testData.structureCodePostal || '',
      structureVille: testData.structureVille || '',
      structureNumeroIntracommunautaire: testData.structureNumeroTva || '',
      
      signataireNom: testData.personneNom || '',
      signatairePrenom: testData.personnePrenom || '',
      signataireFonction: testData.personneFonction || '',
      signataireEmail: testData.personneEmail || formData.signataireEmail || '',
      signataireTelephone: testData.personneTelephone || ''
    });
    
    // Remplir aussi le champ SIRET pour la recherche
    setSiretSearch(testData.structureSiret || '');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Créer la soumission de formulaire avec structure claire
      const submissionData = {
        // Métadonnées
        dateId,
        formLinkId,
        token,
        submittedAt: serverTimestamp(),
        status: 'pending',
        // ✅ FIX: Ajouter automatiquement l'organizationId
        ...(currentOrganization?.id && { organizationId: currentOrganization.id }),
        
        // DONNÉES DU LIEU (prioritaire)
        lieuData: {
          nom: formData.lieuNom,
          adresse: formData.lieuAdresse,
          codePostal: formData.lieuCodePostal,
          ville: formData.lieuVille,
          pays: formData.lieuPays
        },
        
        // DONNÉES DE LA STRUCTURE (obligatoire)
        structureData: {
          nom: formData.structureNom,
          siret: formData.structureSiret,
          adresse: formData.structureAdresse,
          codePostal: formData.structureCodePostal,
          ville: formData.structureVille,
          numeroIntracommunautaire: formData.structureNumeroIntracommunautaire
        },
        
        // DONNÉES DU SIGNATAIRE DU CONTRAT
        signataireData: {
          nom: formData.signataireNom,
          prenom: formData.signatairePrenom,
          fonction: formData.signataireFonction,
          email: formData.signataireEmail || null, // Facultatif
          telephone: formData.signataireTelephone || null // Facultatif
        },
        
        // Données brutes pour compatibilité
        rawData: formData
      };

      // Créer le document dans formSubmissions
      const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
      
      // Marquer le lien de formulaire comme complété
      if (formLinkId) {
        await updateDoc(doc(db, 'formLinks', formLinkId), {
          completed: true,
          completedAt: serverTimestamp(),
          submissionId: submissionRef.id
        });
      }

      // Mettre à jour le concert
      await updateDoc(doc(db, 'concerts', dateId), {
        lastFormSubmissionId: submissionRef.id,
        hasFormSubmission: true,
        updatedAt: serverTimestamp()
      });

      console.log('Formulaire soumis avec succès');
      
      // Callback de succès
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Bouton de test - visible uniquement en dev */}
      {TestFormButton && (
        <div className="text-end mb-3">
          <TestFormButton 
            onFormFill={handleTestDataFill}
            variant="outline-primary"
            size="sm"
          />
        </div>
      )}
      
      {/* Section Adresse du lieu */}
      <Card 
        title="Adresse du lieu de l'événement"
        icon={<i className="bi bi-geo-alt"></i>}
      >
          <p className={styles.formSubtitle}>
            Veuillez indiquer le nom et l'adresse exacte où se déroulera l'événement.
          </p>
          
          <div className={styles.formGroup}>
            <label htmlFor="lieuNom" className={styles.formLabel}>Nom du lieu *</label>
            <input
              type="text"
              id="lieuNom"
              name="lieuNom"
              className={styles.formControl}
              placeholder="Ex: Salle des fêtes, Théâtre municipal, Bar Le Central..."
              value={formData.lieuNom}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <AddressInput
              label="Adresse du lieu *"
              value={formData.lieuAdresse}
              onChange={(e) => setFormData(prev => ({ ...prev, lieuAdresse: e.target.value }))}
              onAddressSelected={handleAddressSelected}
              placeholder="Commencez à taper pour rechercher une adresse..."
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="lieuCodePostal" className={styles.formLabel}>Code postal *</label>
              <input
                type="text"
                id="lieuCodePostal"
                name="lieuCodePostal"
                className={styles.formControl}
                placeholder="75000"
                value={formData.lieuCodePostal}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lieuVille" className={styles.formLabel}>Ville *</label>
              <input
                type="text"
                id="lieuVille"
                name="lieuVille"
                className={styles.formControl}
                placeholder="Paris"
                value={formData.lieuVille}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
      </Card>

      {/* Section Recherche Structure */}
      <Card 
        title="Informations de votre structure"
        icon={<i className="bi bi-building"></i>}
      >
          <p className={styles.formSubtitle}>
            Recherchez votre entreprise/association par SIRET ou nom pour pré-remplir automatiquement, ou remplissez manuellement.
          </p>
          
          <div className={styles.formGroup}>
            <label htmlFor="siretSearch" className={styles.formLabel}>Recherche par SIRET ou nom</label>
            <input
              type="text"
              id="siretSearch"
              className={styles.formControl}
              placeholder="Numéro SIRET, nom ou raison sociale"
              value={siretSearch}
              onChange={handleSiretInputChange}
              onBlur={handleInputBlur}
            />
            {siretLoading && (
              <div className={styles.siretLoading} style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                <span className={styles.loadingSpinner}></span>
                Recherche en cours...
              </div>
            )}
          </div>

          {/* Menu déroulant des résultats */}
          {showDropdown && siretResults.length > 0 && (
            <div className={styles.siretResults} style={{ marginBottom: '20px' }}>
              {siretResults.map((entreprise) => (
                <div
                  key={entreprise.siren}
                  className={styles.siretResultItem}
                  onClick={() => handleSelectEntreprise(entreprise)}
                  style={{ cursor: 'pointer', padding: '12px', border: '1px solid #ddd', borderBottom: 'none', backgroundColor: '#f8f9fa' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {entreprise.nom_complet || entreprise.nom_raison_sociale || entreprise.denomination}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    SIRET: {entreprise.siege?.siret || entreprise.siren} | {entreprise.siege?.libelle_commune || ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message d'erreur */}
          {siretError && (
            <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '15px' }}>
              <i className="bi bi-exclamation-circle"></i> {siretError}
            </div>
          )}

          {/* Champs de structure (pré-remplis ou saisissables manuellement) */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="structureNom" className={styles.formLabel}>Nom / Raison sociale *</label>
              <input
                type="text"
                id="structureNom"
                name="structureNom"
                className={styles.formControl}
                placeholder="Nom de votre structure"
                value={formData.structureNom}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="structureSiret" className={styles.formLabel}>SIRET</label>
              <input
                type="text"
                id="structureSiret"
                name="structureSiret"
                className={styles.formControl}
                placeholder="14 chiffres"
                value={formData.structureSiret}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="structureNumeroIntracommunautaire" className={styles.formLabel}>N° TVA Intracommunautaire</label>
            <input
              type="text"
              id="structureNumeroIntracommunautaire"
              name="structureNumeroIntracommunautaire"
              className={styles.formControl}
              placeholder="Ex: FR12345678901"
              value={formData.structureNumeroIntracommunautaire}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="structureAdresse" className={styles.formLabel}>Adresse de la structure *</label>
            <input
              type="text"
              id="structureAdresse"
              name="structureAdresse"
              className={styles.formControl}
              placeholder="Adresse de votre structure"
              value={formData.structureAdresse}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="structureCodePostal" className={styles.formLabel}>Code postal *</label>
              <input
                type="text"
                id="structureCodePostal"
                name="structureCodePostal"
                className={styles.formControl}
                placeholder="75000"
                value={formData.structureCodePostal}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="structureVille" className={styles.formLabel}>Ville *</label>
              <input
                type="text"
                id="structureVille"
                name="structureVille"
                className={styles.formControl}
                placeholder="Ville"
                value={formData.structureVille}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
      </Card>

      {/* Section Informations du signataire du contrat */}
      <Card 
        title="Informations du signataire du contrat"
        icon={<i className="bi bi-person-check"></i>}
      >
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="signatairePrenom" className={styles.formLabel}>Prénom *</label>
              <input
                type="text"
                id="signatairePrenom"
                name="signatairePrenom"
                className={styles.formControl}
                placeholder="Prénom du signataire"
                value={formData.signatairePrenom}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signataireNom" className={styles.formLabel}>Nom *</label>
              <input
                type="text"
                id="signataireNom"
                name="signataireNom"
                className={styles.formControl}
                placeholder="Nom du signataire"
                value={formData.signataireNom}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signataireFonction" className={styles.formLabel}>Fonction / Qualité *</label>
            <input
              type="text"
              id="signataireFonction"
              name="signataireFonction"
              className={styles.formControl}
              placeholder="Ex: Directeur, Président, Responsable programmation..."
              value={formData.signataireFonction}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="signataireEmail" className={styles.formLabel}>
                Email {formData.signataireEmail && '(prérempli)'}
              </label>
              <input
                type="email"
                id="signataireEmail"
                name="signataireEmail"
                className={styles.formControl}
                placeholder="email@exemple.com"
                value={formData.signataireEmail}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signataireTelephone" className={styles.formLabel}>Téléphone</label>
              <input
                type="tel"
                id="signataireTelephone"
                name="signataireTelephone"
                className={styles.formControl}
                placeholder="06 12 34 56 78"
                value={formData.signataireTelephone}
                onChange={handleInputChange}
              />
            </div>
          </div>
      </Card>

      {/* Messages d'erreur */}
      {submitError && (
        <div className={styles.errorMessage}>
          <i className="bi bi-exclamation-circle"></i>
          {submitError}
        </div>
      )}

      {/* Bouton de soumission */}
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.tcBtn} ${styles.tcBtnPrimary}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.loadingSpinner}></span>
              Envoi en cours...
            </>
          ) : (
            <>
              <i className="bi bi-send"></i>
              Envoyer les informations
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PublicContactForm;

// Alias pour rétrocompatibilité
export const PublicProgrammateurForm = PublicContactForm; 