// src/components/common/steps/StepProgress.js
import React from 'react';
import styles from './StepProgress.module.css';

const StepProgress = ({ currentStep, totalSteps, stepLabels = [] }) => {
  return (
    <div className={styles.stepProgress}>
      <div className={styles.stepProgressDots}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <div 
            key={index} 
            className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
          >
            {index < currentStep ? (
              <i className="bi bi-check-lg"></i>
            ) : (
              <span>{index + 1}</span>
            )}
            {stepLabels[index] && (
              <span className={styles.stepLabel}>{stepLabels[index]}</span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.stepProgressBar}>
        <div 
          className={styles.stepProgressFill} 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepProgress;
