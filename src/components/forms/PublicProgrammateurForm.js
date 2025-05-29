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
  const [siretResults, setSiretResults] = useState(null);
  const [siretError, setSiretError] = useState('');

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

  // Recherche SIRET via API
  const handleSiretSearch = async () => {
    if (!siretSearch.trim()) {
      setSiretError('Veuillez saisir un numéro SIRET ou une raison sociale');
      return;
    }

    setSiretLoading(true);
    setSiretError('');
    setSiretResults(null);

    try {
      // Déterminer si c'est un SIRET (14 chiffres) ou une raison sociale
      const isSiret = /^\d{14}$/.test(siretSearch.replace(/\s/g, ''));
      
      let apiUrl;
      if (isSiret) {
        // Recherche par SIRET
        apiUrl = `https://entreprise.data.gouv.fr/api/sirene/v1/siret/${siretSearch.replace(/\s/g, '')}`;
      } else {
        // Recherche par nom (utiliser l'API de recherche)
        apiUrl = `https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${encodeURIComponent(siretSearch)}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Entreprise non trouvée');
      }

      const data = await response.json();
      
      let entreprise;
      if (isSiret) {
        entreprise = data.etablissement || data;
      } else {
        // Prendre le premier résultat de la recherche textuelle
        entreprise = data.etablissements?.[0] || data.etablissement;
      }

      if (!entreprise) {
        throw new Error('Aucune entreprise trouvée');
      }

      // Extraire les informations utiles
      const nom = entreprise.unite_legale?.denomination || 
                  entreprise.denomination_usuelle_etablissement ||
                  `${entreprise.unite_legale?.prenom_1 || ''} ${entreprise.unite_legale?.nom || ''}`.trim();

      const adresse = `${entreprise.numero_voie_etablissement || ''} ${entreprise.type_voie_etablissement || ''} ${entreprise.libelle_voie_etablissement || ''}`.trim();
      
      // Mettre à jour le formulaire avec les données trouvées
      setFormData(prev => ({
        ...prev,
        structureNom: nom,
        structureSiret: entreprise.siret,
        structureAdresse: adresse,
        structureCodePostal: entreprise.code_postal_etablissement || '',
        structureVille: entreprise.libelle_commune_etablissement || ''
      }));

      setSiretResults({
        success: true,
        message: `Entreprise trouvée : ${nom}`,
        data: entreprise
      });

    } catch (error) {
      console.error('Erreur recherche SIRET:', error);
      setSiretError(error.message || 'Erreur lors de la recherche');
      setSiretResults({
        success: false,
        message: 'Entreprise non trouvée. Vous pouvez continuer en remplissant manuellement.'
      });
    } finally {
      setSiretLoading(false);
    }
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
            onChange={(e) => setSiretSearch(e.target.value)}
          />
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleSiretSearch}
            disabled={siretLoading}
          >
            {siretLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Recherche...
              </>
            ) : (
              <>
                <i className="bi bi-search"></i>
                Rechercher
              </>
            )}
          </button>
        </div>

        {/* Résultats de la recherche SIRET */}
        {siretResults && (
          <div className={`${styles.siretResults} ${siretResults.success ? styles.siretSuccess : ''}`}>
            <i className={`bi bi-${siretResults.success ? 'check-circle' : 'info-circle'}`}></i>
            {siretResults.message}
          </div>
        )}

        {siretError && (
          <div className={`${styles.siretResults} ${styles.siretError}`}>
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