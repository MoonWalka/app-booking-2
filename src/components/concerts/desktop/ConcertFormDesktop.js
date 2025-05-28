import React, { useState, useCallback, useEffect, Profiler } from 'react';

const ConcertFormDesktop = ({ id = null, onClose, onSave, defaultView = 'form', isEmbedded = false }) => {
  // Compteur de rendus pour debug
  const [renderCount, setRenderCount] = useState(0);
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Fonction de callback pour le Profiler
  const onRenderCallback = (
    id, // l'identifiant "id" du Profiler dont l'arbre vient d'être mis à jour
    phase, // soit "mount" (si l'arbre vient d'être monté) soit "update" (s'il a été re-rendu)
    actualDuration, // temps passé à faire le rendu de la mise à jour
    baseDuration, // temps estimé pour faire le rendu de l'ensemble du sous-arbre sans mémoïsation
    startTime, // quand React a commencé à faire le rendu de cette mise à jour
    commitTime, // quand React a appliqué cette mise à jour
    interactions // l'ensemble des interactions liées à cette mise à jour
  ) => {
    console.log(`🎭 Profiler [${id}]:`, {
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      renderCount,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Profiler id="ConcertFormDesktop" onRender={onRenderCallback}>
      <div className="concert-form-desktop" style={{ backgroundColor: 'lightblue', padding: '10px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 1000 }}>
          Renders: {renderCount}
        </div>
        {/* ... existing code ... */}
      </div>
    </Profiler>
  );
};

export default ConcertFormDesktop; 