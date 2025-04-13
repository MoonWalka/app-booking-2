import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function ConcertForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'option',
    lieuId: '',
    lieuNom: '',
    programmateurId: '',
    programmateurNom: ''
  });
  const [errors, setErrors] = useState({});
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les lieux et programmateurs existants
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les lieux
        const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux([
          { id: 'new', nom: '+ Créer un nouveau lieu' },
          ...lieuxData
        ]);

        // Charger les programmateurs
        const programmateursSnapshot = await getDocs(collection(db, 'programmateurs'));
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs([
          { id: 'new', nom: '+ Créer un nouveau programmateur' },
          ...programmateursData
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Surveiller les changements dans formData pour mettre à jour les erreurs
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation étape 1
    if (step === 1) {
      if (!formData.date) newErrors.date = "La date est requise";
      if (!formData.montant) newErrors.montant = "Le montant est requis";
      if (!formData.statut) newErrors.statut = "Le statut est requis";
    }
    
    // Validation étape 2
    if (step === 2) {
      if (!formData.lieuId) newErrors.lieuId = "Le lieu est requis";
    }
    
    // Validation étape 3
    if (step === 3) {
      if (!formData.programmateurId) newErrors.programmateurId = "Le programmateur est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lieuId') {
      const selectedLieu = lieux.find(lieu => lieu.id === value);
      setFormData({
        ...formData,
        lieuId: value,
        lieuNom: selectedLieu ? selectedLieu.nom : ''
      });
    } else if (name === 'programmateurId') {
      const selectedProgrammateur = programmateurs.find(prog => prog.id === value);
      setFormData({
        ...formData,
        programmateurId: value,
        programmateurNom: selectedProgrammateur ? selectedProgrammateur.nom : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
    
    setLoading(true);
    
    try {
      // Ajouter le concert à Firestore
      const concertRef = await addDoc(collection(db, 'concerts'), {
        date: formData.date,
        montant: parseFloat(formData.montant),
        statut: formData.statut,
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        programmateurId: formData.programmateurId,
        programmateurNom: formData.programmateurNom,
        createdAt: new Date(),
        formulaireEnvoye: false
      });
      
      // Rediriger vers la page de détails du concert
      navigate(`/concerts/${concertRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du concert:", error);
      setErrors({ submit: "Erreur lors de la création du concert. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'étape 1 : Informations de base
  const renderStep1 = () => (
    <div className="form-step">
      <h3>Informations de base</h3>
      
      <div className="form-group">
        <label htmlFor="date">Date du concert *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'error' : ''}
        />
        {errors.date && <div className="error-message">{errors.date}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="montant">Montant (€) *</label>
        <input
          type="number"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          className={errors.montant ? 'error' : ''}
        />
        {errors.montant && <div className="error-message">{errors.montant}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="statut">Statut *</label>
        <select
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
          className={errors.statut ? 'error' : ''}
        >
          <option value="option">Option</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
        </select>
        {errors.statut && <div className="error-message">{errors.statut}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 2 : Choix du lieu
  const renderStep2 = () => (
    <div className="form-step">
      <h3>Lieu du concert</h3>
      
      <div className="form-group">
        <label htmlFor="lieuId">Sélectionner un lieu *</label>
        <select
          id="lieuId"
          name="lieuId"
          value={formData.lieuId}
          onChange={handleChange}
          className={errors.lieuId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {lieux.map(lieu => (
            <option key={lieu.id} value={lieu.id}>
              {lieu.nom}
            </option>
          ))}
        </select>
        {errors.lieuId && <div className="error-message">{errors.lieuId}</div>}
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

  // Rendu de l'étape 3 : Choix du programmateur
  const renderStep3 = () => (
    <div className="form-step">
      <h3>Programmateur</h3>
      
      <div className="form-group">
        <label htmlFor="programmateurId">Sélectionner un programmateur *</label>
        <select
          id="programmateurId"
          name="programmateurId"
          value={formData.programmateurId}
          onChange={handleChange}
          className={errors.programmateurId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {programmateurs.map(programmateur => (
            <option key={programmateur.id} value={programmateur.id}>
              {programmateur.nom}
            </option>
          ))}
        </select>
        {errors.programmateurId && <div className="error-message">{errors.programmateurId}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le concert'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="concert-form-container">
      <h2>Création d'un nouveau concert</h2>
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Informations</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Lieu</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Programmateur</div>
      </div>
      
      {errors.submit && <div className="error-message global">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </form>
    </div>
  );
}

export default ConcertForm;
