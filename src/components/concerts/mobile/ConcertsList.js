// src/components/concerts/mobile/ConcertsList.js
import ConcertsListMain from '../ConcertsList';

/**
 * Version mobile de la liste des concerts
 * Utilise le composant principal qui est déjà responsive avec ListWithFilters
 */
const ConcertsList = (props) => {
  return <ConcertsListMain {...props} />;
};

export default ConcertsList;
