import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import DesktopForm from '../desktop/ConcertForm';
import MobileForm from '../mobile/ConcertForm';

const ConcertFormWrapper = (props) => {
  const responsive = useResponsive();
  const { id } = useParams();
  const location = useLocation();
  
  // Compteur de rendu du wrapper pour détecter les boucles potentielles
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  
  console.log(`[🔍 ConcertFormWrapper] RENDER #${renderCountRef.current} - id=${id}, path=${location.pathname}`, {
    isMobile: responsive.isMobile,
    time: new Date().toISOString().substr(11, 12)
  });
  
  // Log pour détecter si le wrapper est monté/démonté excessivement
  useEffect(() => {
    console.log(`[🔍 ConcertFormWrapper] MONTÉ pour id=${id}`);
    return () => {
      console.log(`[🔍 ConcertFormWrapper] DÉMONTÉ pour id=${id}`);
    };
  }, [id]);
  
  const FormComponent = responsive.isMobile ? MobileForm : DesktopForm;
  return <FormComponent {...props} />;
};

export default ConcertFormWrapper;