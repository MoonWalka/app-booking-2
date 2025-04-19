// src/components/common/steps/StepProgress.js
import React from 'react';
import '../../../style/stepNavigation.css';

const StepProgress = ({ currentStep, totalSteps, stepLabels = [] }) => {
  return (
    <div className="step-progress">
      <div className="step-progress-dots">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div 
            key={index} 
            className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            {index < currentStep ? (
              <i className="bi bi-check-lg"></i>
            ) : (
              <span>{index + 1}</span>
            )}
            {stepLabels[index] && (
              <span className="step-label">{stepLabels[index]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="step-progress-bar">
        <div 
          className="step-progress-fill" 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepProgress;
