import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

function ProgrammateurForm() {
  const { concertId, token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 : Contact
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    
    // Étape 2 : Structure
    raisonSociale: '',
    typeStructure: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    siret: '',
    tvaIntra: '',
    
    // Étape 3 : Lieu
    nomLieu: '',
    adresseLieu: '',
    codePostalLieu: '',
    villeLieu: '',
    paysLieu: 'France',
    
    // Étape 4 : Paiement
    modePaiement: 'virement',
    iban: '',
    bic: '',
    titulaire: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formDoc, setFormDoc] = useState(null);
  const [concert, setConcert] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Vérifier si le token est valide
        const q = query(
          collection(db, 'formulaires'),
          where('concertId', '==', concertId),
          where('token', '==', token)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError("Ce lien de formulaire n'est pas valide.");
          setLoading(false);
          return;
        }
        
        // Récupérer le document du formulaire
        const formDoc = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
        
        setFormDoc(formDoc);
        
        // Vérifier si le formulaire a déjà été soumis
        if (formDoc.statut === 'soumis' || formDoc.statut === 'valide') {
          setSuccess(true);
          setLoading(false);
          return;
        }
        
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        
        if (concertDoc.exists()) {
          setConcert({
            id: concertDoc.id,
            ...concertDoc.data()
          });
        } else {
          setError("Ce concert n'existe pas.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la validation du token:", err);
        setError("Une erreur est survenue lors du chargement du formulaire.");
        setLoading(false);
      }
    };

    validateToken();
  }, [concertId, token]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation étape 1 : Contact
    if (step === 1) {
      if (!formData.nom) newErrors.nom = "Le nom est requis";
      if (!formData.prenom) newErrors.prenom = "Le prénom est requis";
      if (!formData.fonction) newErrors.fonction = "La fonction est requise";
      if (!formData.email) newErrors.email = "L'email est requis";
      if (!formData.telephone) newErrors.telephone = "Le téléphone est requis";
    }
    
    // Validation étape 2 : Structure
    if (step === 2) {
      if (!formData.raisonSociale) newErrors.raisonSociale = "La raison sociale est requise";
      if (!formData.typeStructure) newErrors.typeStructure = "Le type de structure est requis";
      if (!formData.adresse) newErrors.adresse = "L'adresse est requise";
      if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis";
      if (!formData.ville) newErrors.ville = "La ville est requise";
      if (!formData.pays) newErrors.pays = "Le pays est requis";
      if (!formData.siret) newErrors.siret = "Le SIRET est requis";
    }
    
    // Validation étape 3 : Lieu
    if (step === 3) {
      if (!formData.nomLieu) newErrors.nomLieu = "Le nom du lieu est requis";
      if (!formData.adresseLieu) newErrors.adresseLieu = "L'adresse du lieu est requise";
      if (!formData.codePostalLieu) newErrors.codePostalLieu = "Le code postal du lieu est requis";
      if (!formData.villeLieu) newErrors.villeLieu = "La ville du lieu est requise";
      if (!formData.paysLieu) newErrors.paysLieu = "Le pays du lieu est requis";
    }
    
    // Validation étape 4 : Paiement
    if (step === 4) {
      if (formData.modePaiement === 'virement') {
        if (!formData.iban) newErrors.iban = "L'IBAN est requis";
        if (!formData.bic) newErrors.bic = "Le BIC est requis";
        if (!formData.titulaire) newErrors.titulaire = "Le titulaire du compte est requis";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mettre à jour le document du formulaire avec les réponses
      await updateDoc(doc(db, 'formulaires', formDoc.id), {
        reponses: formData,
        statut: 'soumis',
        dateSoumission: new Date()
      });
      
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la soumission du formulaire:", err);
      setError("Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu de l'étape 1 : Contact
  const renderStep1 = () => (
    <div className="form-step">
      <h3>Informations du contact</h3>
      
      <div className="form-group">
        <label htmlFor="nom">Nom *</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className={errors.nom ? 'error' : ''}
        />
        {errors.nom && <div className="error-message">{errors.nom}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="prenom">Prénom *</label>
        <input
          type="text"
          id="prenom"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          className={errors.prenom ? 'error' : ''}
        />
        {errors.prenom && <div className="error-message">{errors.prenom}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="fonction">Fonction *</label>
        <input
          type="text"
          id="fonction"
          name="fonction"
          value={formData.fonction}
          onChange={handleChange}
          className={errors.fonction ? 'error' : ''}
        />
        {errors.fonction && <div className="error-message">{errors.fonction}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="telephone">Téléphone *</label>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          className={errors.telephone ? 'error' : ''}
        />
        {errors.telephone && <div className="error-message">{errors.telephone}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 2 : Structure
  const renderStep2 = () => (
    <div className="form-step">
      <h3>Structure juridique</h3>
      
      <div className="form-group">
        <label htmlFor="raisonSociale">Raison sociale *</label>
        <input
          type="text"
          id="raisonSociale"
          name="raisonSociale"
          value={formData.raisonSociale}
          onChange={handleChange}
          className={errors.raisonSociale ? 'error' : ''}
        />
        {errors.raisonSociale && <div className="error-message">{errors.raisonSociale}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="typeStructure">Type de structure *</label>
        <select
          id="typeStructure"
          name="typeStructure"
          value={formData.typeStructure}
          onChange={handleChange}
          className={errors.typeStructure ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          <option value="association">Association</option>
          <option value="mairie">Mairie / Collectivité</option>
          <option value="sarl">SARL</option>
          <option value="sas">SAS</option>
          <option value="eurl">EURL</option>
          <option value="autre">Autre</option>
        </select>
        {errors.typeStructure && <div className="error-message">{errors.typeStructure}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="adresse">Adresse *</label>
        <input
          type="text"
          id="adresse"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          className={errors.adresse ? 'error' : ''}
        />
        {errors.adresse && <div className="error-message">{errors.adresse}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="codePostal">Code postal *</label>
          <input
            type="text"
            id="codePostal"
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
            className={errors.codePostal ? 'error' : ''}
          />
          {errors.codePostal && <div className="error-message">{errors.codePostal}</div>}
        </div>
        
        <div className="form-group half">
          <label htmlFor="ville">Ville *</label>
          <input
            type="text"
            id="ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className={errors.ville ? 'error' : ''}
          />
          {errors.ville && <div className="error-message">{errors.ville}</div>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="pays">Pays *</label>
        <input
          type="text"
          id="pays"
          name="pays"
          value={formData.pays}
          onChange={handleChange}
          className={errors.pays ? 'error' : ''}
        />
        {errors.pays && <div className="error-message">{errors.pays}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="siret">SIRET *</label>
        <input
          type="text"
          id="siret"
          name="siret"
          value={formData.siret}
          onChange={handleChange}
          className={errors.siret ? 'error' : ''}
        />
        {errors.siret && <div className="error-message">{errors.siret}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="tvaIntra">N° TVA intracommunautaire (facultatif)</label>
        <input
          type="text"
          id="tvaIntra"
          name="tvaIntra"
          value={formData.tvaIntra}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 3 : Lieu
  const renderStep3 = () => (
    <div className="form-step">
      <h3>Lieu du concert</h3>
      
      <div className="form-group">
        <label htmlFor="nomLieu">Nom du lieu *</label>
        <input
          type="text"
          id="nomLieu"
          name="nomLieu"
          value={formData.nomLieu}
          onChange={handleChange}
          className={errors.nomLieu ? 'error' : ''}
        />
        {errors.nomLieu && <div className="error-message">{errors.nomLieu}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="adresseLieu">Adresse *</label>
        <input
          type="text"
          id="adresseLieu"
          name="adresseLieu"
          value={formData.adresseLieu}
          onChange={handleChange}
          className={errors.adresseLieu ? 'error' : ''}
        />
        {errors.adresseLieu && <div className="error-message">{errors.adresseLieu}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="codePostalLieu">Code postal *</label>
          <input
            type="text"
            id="codePostalLieu"
            name="codePostalLieu"
            value={formData.codePostalLieu}
            onChange={handleChange}
            className={errors.codePostalLieu ? 'error' : ''}
          />
          {errors.codePostalLieu && <div className="error-message">{errors.codePostalLieu}</div>}
        </div>
        
        <div className="form-group half">
          <label htmlFor="villeLieu">Ville *</label>
          <input
            type="text"
            id="villeLieu"
            name="villeLieu"
            value={formData.villeLieu}
            onChange={handleChange}
            className={errors.villeLieu ? 'error' : ''}
          />
          {errors.villeLieu && <div className="error-message">{errors.villeLieu}</div>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="paysLieu">Pays *</label>
        <input
          type="text"
          id="paysLieu"
          name="paysLieu"
          value={formData.paysLieu}
          onChange={handleChange}
          className={errors.paysLieu ? 'error' : ''}
        />
        {errors.paysLieu && <div className="error-message">{errors.paysLieu}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 4 : Paiement
  const renderStep4 = () => (
    <div className="form-step">
      <h3>Informations de paiement</h3>
      
      <div className="form-group">
        <label htmlFor="modePaiement">Mode de paiement *</label>
        <select
          id="modePaiement"
          name="modePaiement"
          value={formData.modePaiement}
          onChange={handleChange}
        >
          <option value="virement">Virement bancaire</option>
          <option value="cheque">Chèque</option>
        </select>
      </div>
      
      {formData.modePaiement === 'virement' && (
        <>
          <div className="form-group">
            <label htmlFor="iban">IBAN *</label>
            <input
              type="text"
              id="iban"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              className={errors.iban ? 'error' : ''}
            />
            {errors.iban && <div className="error-message">{errors.iban}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="bic">BIC *</label>
            <input
              type="text"
              id="bic"
              name="bic"
              value={formData.bic}
              onChange={handleChange}
              className={errors.bic ? 'error' : ''}
            />
            {errors.bic && <div className="error-message">{errors.bic}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="titulaire">Titulaire du compte *</label>
            <input
              type="text"
              id="titulaire"
              name="titulaire"
              value={formData.titulaire}
              onChange={handleChange}
              className={errors.titulaire ? 'error' : ''}
            />
            {errors.titulaire && <div className="error-message">{errors.titulaire}</div>}
          </div>
        </>
      )}
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Envoi en cours...' : 'Envoyer le formulaire'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Chargement du formulaire...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">✓</div>
        <h2>Formulaire envoyé avec succès</h2>
        <p>Merci d'avoir complété ce formulaire. Vos informations ont été enregistrées.</p>
        <p>Vous recevrez prochainement un contrat basé sur ces informations.</p>
      </div>
    );
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="programmateur-form">
      <h2>Formulaire Programmateur</h2>
      
      <div className="form-intro">
        <p>Merci de compléter ce formulaire pour finaliser les informations nécessaires à la contractualisation.</p>
        
        {concert && (
          <div className="concert-info">
            <p><strong>Concert du {formatDate(concert.date)}</strong></p>
            <p>Montant : {concert.montant} €</p>
          </div>
        )}
      </div>
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Contact</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Structure</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Lieu</div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Paiement</div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </form>
    </div>
  );
}

export default ProgrammateurForm;
