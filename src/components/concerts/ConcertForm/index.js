import React from 'react';
import { useResponsive } from '@/hooks/common';
import DesktopForm from '../desktop/ConcertForm';
import MobileForm from '../mobile/ConcertForm';

const ConcertFormWrapper = (props) => {
  const responsive = useResponsive();
  const FormComponent = responsive.isMobile ? MobileForm : DesktopForm;
  return <FormComponent {...props} />;
};

export default ConcertFormWrapper;