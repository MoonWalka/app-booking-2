// src/components/common/steps/StepNavigation.js
import React, { useState } from 'react';
import Button from '@ui/Button';
import styles from './StepNavigation.module.css';

const StepNavigation = ({ 
  steps, 
  onComplete, 
  onCancel,
  initialStep = 0,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState(initialData);
  
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
    <div className={styles.stepNavigationContainer}>
      {/* Barre de progression */}
      <div className={styles.stepProgress}>
        <div className={styles.stepProgressDots}>
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
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
        <div className={styles.stepProgressBar}>
          <div 
            className={styles.stepProgressFill}
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Titre de l'étape */}
      <div className={styles.stepTitle}>{stepTitle}</div>
      
      {/* Contenu de l'étape */}
      <div className={styles.stepContent}>
        <CurrentStepComponent 
          data={stepData} 
          onNext={goToNextStep} 
          onBack={goToPreviousStep}
        />
      </div>
      
      {/* Boutons de navigation */}
      <div className={styles.stepButtons}>
        <Button 
          type="button" 
          variant="outline-secondary"
          onClick={goToPreviousStep}
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </Button>
        
        {/* Le bouton "Suivant" est généralement géré dans le composant d'étape lui-même */}
      </div>
    </div>
  );
};

export default StepNavigation;