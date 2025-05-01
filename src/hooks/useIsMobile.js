// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

/**
 * @deprecated Use the isMobile property from useResponsive() from './common/useResponsive' instead
 */
export const useIsMobile = (breakpoint = 768) => {
  // TODO: Réactiver le mode mobile plus tard.
  // Pour l'instant, on retourne toujours false pour forcer l'affichage desktop
  return false;

  /* 
  // Si on veut réactiver le code normal plus tard:
  const { isMobile } = require('./common/useResponsive').default({ breakpoint });
  return isMobile;
  */
};