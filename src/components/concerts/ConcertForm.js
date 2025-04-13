import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConcertForm = ({ onCancel, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    lieu: '',
    programmateur: '',
    montant: '',
    statut: 'Contact établi'
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  // Effet pour déboguer les changements de formData
  useEffect(() => {
    console.log('État actuel du formulaire:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Modification de ${name} avec la valeur: ${value}`);
    
    // Mise à jour de l'état avec la nouvelle valeur
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.montant) newErrors.montant = 'Le montant est requis';
    if (!formData.statut) newErrors.statut = 'Le statut est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.lieu) newErrors.lieu = 'Le lieu est requis';
    
    setErrors(newErrors);
    console.log('Validation étape 2:', newErrors, formData.lieu);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.programmateur) newErrors.programmateur = 'Le programmateur est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 3 && validateStep3()) {
      // Simuler l'enregistrement du concert
      console.log('Concert créé:', formData);
      
      // Afficher un message de succès
      alert('Concert créé avec succès! Un formulaire a été envoyé au programmateur.');
      
      // Rediriger vers la liste des concerts
      navigate('/concerts');
    }
  };

  return (
    <div className="concert-form-container">
      <h2>Création d'un concert - Étape {step}/3</h2>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h3>Informations de base</h3>
            
            <div className="form-group">
              <label>Date du concert:</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
            
            <div className="form-group">
              <label>Montant (€):</label>
              <input 
                type="number" 
                name="montant" 
                value={formData.montant} 
                onChange={handleChange}
                className={errors.montant ? 'error' : ''}
              />
              {errors.montant && <span className="error-message">{errors.montant}</span>}
            </div>
            
            <div className="form-group">
              <label>Statut:</label>
              <select 
                name="statut" 
                value={formData.statut} 
                onChange={handleChange}
                className={errors.statut ? 'error' : ''}
              >
                <option value="Contact établi">Contact établi</option>
                <option value="Pré-accord">Pré-accord</option>
                <option value="Contrat signé">Contrat signé</option>
                <option value="Acompte facturé">Acompte facturé</option>
                <option value="Solde facturé">Solde facturé</option>
              </select>
              {errors.statut && <span className="error-message">{errors.statut}</span>}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            <h3>Choix du lieu</h3>
            
            <div className="form-group">
              <label>Lieu:</label>
              <select 
                name="lieu" 
                value={formData.lieu} 
                onChange={handleChange}
                className={errors.lieu ? 'error' : ''}
              >
                <option value="">Sélectionner un lieu</option>
                <option value="Salle de Concert Exemple #1">Salle de Concert Exemple #1</option>
                <option value="Théâtre Exemple #2">Théâtre Exemple #2</option>
                <option value="nouveau">+ Créer un nouveau lieu</option>
              </select>
              {errors.lieu && <span className="error-message">{errors.lieu}</span>}
            </div>
            
            {formData.lieu === 'nouveau' && (
              <div className="form-group">
                <label>Nom du nouveau lieu:</label>
                <input 
                  type="text" 
                  name="nouveauLieu" 
                  onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                />
              </div>
            )}
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <h3>Choix du programmateur</h3>
            
            <div className="form-group">
              <label>Programmateur:</label>
              <select 
                name="programmateur" 
                value={formData.programmateur} 
                onChange={handleChange}
                className={errors.programmateur ? 'error' : ''}
              >
                <option value="">Sélectionner un programmateur</option>
                <option value="Programmateur Exemple #1">Programmateur Exemple #1</option>
                <option value="Programmateur Exemple #2">Programmateur Exemple #2</option>
                <option value="nouveau">+ Créer un nouveau programmateur</option>
              </select>
              {errors.programmateur && <span className="error-message">{errors.programmateur}</span>}
            </div>
            
            {formData.programmateur === 'nouveau' && (
              <div className="form-group">
                <label>Nom du nouveau programmateur:</label>
                <input 
                  type="text" 
                  name="nouveauProgrammateur" 
                  onChange={(e) => setFormData({...formData, programmateur: e.target.value})}
                />
              </div>
            )}
            
            <div className="form-summary">
              <h4>Résumé du concert</h4>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Lieu:</strong> {formData.lieu}</p>
              <p><strong>Programmateur:</strong> {formData.programmateur}</p>
              <p><strong>Montant:</strong> {formData.montant} €</p>
              <p><strong>Statut:</strong> {formData.statut}</p>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Annuler
          </button>
          
          {step > 1 && (
            <button type="button" onClick={handlePrevStep} className="btn-prev">
              Précédent
            </button>
          )}
          
          {step < 3 ? (
            <button type="button" onClick={handleNextStep} className="btn-next">
              Suivant
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              Créer le concert
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConcertForm;
