import React from 'react';
import Button from './ui/Button';

const TestButtons = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bouton de test</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Button 
          variant="outline-primary" 
          size="sm"
        >
          Test TourCraft Button
        </Button>

        <Button 
          variant="primary" 
          size="sm"
        >
          Primary Button
        </Button>

        <Button 
          variant="secondary" 
          size="sm"
        >
          Secondary Button
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Button 
          variant="outline-primary" 
          size="sm" 
          icon={<i className="bi bi-plus"></i>}
        >
          With Left Icon
        </Button>

        <Button 
          variant="outline-secondary" 
          size="sm" 
          icon={<i className="bi bi-arrow-right"></i>}
          iconPosition="right"
        >
          With Right Icon
        </Button>

        <Button 
          variant="primary" 
          size="sm" 
          icon={<i className="bi bi-gear"></i>}
          iconOnly={true}
          tooltip="Settings"
        />
      </div>
    </div>
  );
};

export default TestButtons;