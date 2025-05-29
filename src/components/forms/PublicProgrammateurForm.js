import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import styles from '@/pages/FormResponsePage.module.css';

const PublicProgrammateurForm = ({ 
  token, 
  concertId, 
  formLinkId, 
  onSubmitSuccess 
}) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    // Contact personnel
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    
    // Structure (optionnel via SIRET)
    structureNom: '',
    structureSiret: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: ''
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

  // Gestion des changements de champ
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      structureVille: siege.libelle_commune || ''
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
    
    if (!formData.nom.trim()) errors.push('Le nom est obligatoire');
    if (!formData.prenom.trim()) errors.push('Le prénom est obligatoire');
    if (!formData.email.trim()) errors.push('L\'email est obligatoire');
    if (!formData.telephone.trim()) errors.push('Le téléphone est obligatoire');
    if (!formData.adresse.trim()) errors.push('L\'adresse est obligatoire');
    if (!formData.codePostal.trim()) errors.push('Le code postal est obligatoire');
    if (!formData.ville.trim()) errors.push('La ville est obligatoire');

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }

    return errors;
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
      // Créer la soumission de formulaire
      const submissionData = {
        // Métadonnées
        concertId,
        formLinkId,
        token,
        submittedAt: serverTimestamp(),
        status: 'pending',
        
        // Données du programmateur
        programmateurData: {
          contact: {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
            adresse: formData.adresse,
            codePostal: formData.codePostal,
            ville: formData.ville
          },
          structure: formData.structureNom ? {
            nom: formData.structureNom,
            siret: formData.structureSiret,
            adresse: formData.structureAdresse,
            codePostal: formData.structureCodePostal,
            ville: formData.structureVille
          } : null
        },
        
        // Données brutes complètes
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
      await updateDoc(doc(db, 'concerts', concertId), {
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
      {/* Outil de recherche SIRET */}
      <div className={styles.siretSection}>
        <h4>
          <i className="bi bi-building"></i>
          Recherche entreprise (optionnel)
        </h4>
        <p className={styles.formSubtitle}>
          Recherchez votre entreprise par SIRET ou raison sociale pour pré-remplir automatiquement les informations.
        </p>
        
        <div className={styles.siretSearchGroup}>
          <input
            type="text"
            className={`${styles.formControl} ${styles.siretInput}`}
            placeholder="Numéro SIRET ou raison sociale"
            value={siretSearch}
            onChange={handleSiretInputChange}
            onBlur={handleInputBlur}
          />
          {siretLoading && (
            <div className={styles.siretLoading}>
              <span className={styles.loadingSpinner}></span>
              Recherche...
            </div>
          )}
        </div>

        {/* Menu déroulant des résultats */}
        {showDropdown && siretResults.length > 0 && (
          <div className={styles.siretResults}>
            {siretResults.map((entreprise) => (
              <div
                key={entreprise.siren}
                className={styles.siretResultItem}
                onClick={() => handleSelectEntreprise(entreprise)}
              >
                <div className={styles.siretResultName}>
                  {entreprise.nom_complet || entreprise.nom_raison_sociale || entreprise.denomination}
                </div>
                <div className={styles.siretResultDetails}>
                  SIRET: {entreprise.siege?.siret || entreprise.siren} | {entreprise.siege?.libelle_commune || ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message d'erreur */}
        {siretError && (
          <div className={styles.siretError}>
            <i className="bi bi-exclamation-circle"></i>
            {siretError}
          </div>
        )}
      </div>

      {/* Informations personnelles */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="nom" className={styles.formLabel}>Nom *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            className={styles.formControl}
            placeholder="Votre nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="prenom" className={styles.formLabel}>Prénom *</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            className={styles.formControl}
            placeholder="Votre prénom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.formControl}
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="telephone" className={styles.formLabel}>Téléphone *</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            className={styles.formControl}
            placeholder="06 12 34 56 78"
            value={formData.telephone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="adresse" className={styles.formLabel}>Adresse *</label>
        <input
          type="text"
          id="adresse"
          name="adresse"
          className={styles.formControl}
          placeholder="Numéro et nom de rue"
          value={formData.adresse}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="codePostal" className={styles.formLabel}>Code postal *</label>
          <input
            type="text"
            id="codePostal"
            name="codePostal"
            className={styles.formControl}
            placeholder="75000"
            value={formData.codePostal}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="ville" className={styles.formLabel}>Ville *</label>
          <input
            type="text"
            id="ville"
            name="ville"
            className={styles.formControl}
            placeholder="Votre ville"
            value={formData.ville}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* Informations structure (si trouvées via SIRET) */}
      {formData.structureNom && (
        <>
          <h4 style={{ marginTop: 'var(--tc-space-6)', marginBottom: 'var(--tc-space-4)', color: 'var(--tc-color-primary)' }}>
            Informations de votre structure
          </h4>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="structureNom" className={styles.formLabel}>Nom de la structure</label>
              <input
                type="text"
                id="structureNom"
                name="structureNom"
                className={styles.formControl}
                value={formData.structureNom}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="structureSiret" className={styles.formLabel}>SIRET</label>
              <input
                type="text"
                id="structureSiret"
                name="structureSiret"
                className={styles.formControl}
                value={formData.structureSiret}
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="structureAdresse" className={styles.formLabel}>Adresse de la structure</label>
            <input
              type="text"
              id="structureAdresse"
              name="structureAdresse"
              className={styles.formControl}
              value={formData.structureAdresse}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="structureCodePostal" className={styles.formLabel}>Code postal</label>
              <input
                type="text"
                id="structureCodePostal"
                name="structureCodePostal"
                className={styles.formControl}
                value={formData.structureCodePostal}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="structureVille" className={styles.formLabel}>Ville</label>
              <input
                type="text"
                id="structureVille"
                name="structureVille"
                className={styles.formControl}
                value={formData.structureVille}
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </div>
        </>
      )}

      {/* Erreur de soumission */}
      {submitError && (
        <div className={`${styles.alertPanel} ${styles.alertDanger}`}>
          <p>
            <i className="bi bi-exclamation-triangle"></i>
            {submitError}
          </p>
        </div>
      )}

      {/* Bouton de soumission */}
      <div className={styles.submitSection}>
        <button
          type="submit"
          className={styles.btnPrimary}
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
              Envoyer le formulaire
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PublicProgrammateurForm; 