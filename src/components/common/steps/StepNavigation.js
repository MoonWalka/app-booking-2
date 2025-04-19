// src/components/common/StepNavigation.js
import React, { useState } from 'react';
import '../../../style/stepNavigation.css';

const StepNavigation = ({ 
  steps, 
  onComplete, 
  onCancel,
  initialStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState({});
  
  const goToNextStep = (data = {}) => {
    // Fusionner les nouvelles données avec les données existantes
    const updatedData = { ...stepData, ...data };
    setStepData(updatedData);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Dernière étape terminée, appeler le callback de complétion
      onComplete && onComplete(updatedData);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  const stepTitle = steps[currentStep].title || `Étape ${currentStep + 1}`;
  
  return (
    <div className="step-navigation-container">
      {/* Barre de progression */}
      <div className="step-progress">
        <div className="step-progress-dots">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => index < currentStep && setCurrentStep(index)}
            >
              {index < currentStep ? (
                <i className="bi bi-check-lg"></i>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="step-progress-bar">
          <div 
            className="step-progress-fill" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Titre de l'étape */}
      <div className="step-title">{stepTitle}</div>
      
      {/* Contenu de l'étape */}
      <div className="step-content">
        <CurrentStepComponent 
          data={stepData} 
          onNext={goToNextStep} 
          onBack={goToPreviousStep}
        />
      </div>
      
      {/* Boutons de navigation */}
      <div className="step-buttons">
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={goToPreviousStep}
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>
        
        {/* Le bouton "Suivant" est généralement géré dans le composant d'étape lui-même */}
      </div>
    </div>
  );
};

export default StepNavigation;