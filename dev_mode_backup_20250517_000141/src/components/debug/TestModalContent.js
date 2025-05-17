import React, { useEffect } from 'react';

const TestModalContent = ({ modalId, closeModal }) => {
  useEffect(() => {
    console.log(`[TestModalContent] MONTAGE modalId=${modalId}`);
    return () => {
      console.log(`[TestModalContent] DEMONTAGE modalId=${modalId}`);
    };
  }, [modalId]);

  return (
    <div>
      <h2>Test Modal Content</h2>
      <p>modalId: {modalId}</p>
      <button onClick={closeModal}>Fermer la modale</button>
    </div>
  );
};

export default TestModalContent;
