import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

const DebugButton = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999
    }}>
      <Button
        variant="danger"
        onClick={() => navigate('/debug-tools')}
        style={{
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        title="Outils de debug"
      >
        🔧
      </Button>
    </div>
  );
};

export default DebugButton;