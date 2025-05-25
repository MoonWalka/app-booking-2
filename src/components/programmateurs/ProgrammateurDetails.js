// src/components/programmateurs/ProgrammateurDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import NotFound from '@/components/common/NotFound';
import ProgrammateurView from '@/components/programmateurs/desktop/ProgrammateurView';
import { useProgrammateurDetails } from '@/hooks/programmateurs';

// Log après imports (pour respecter import/first)
console.log('[DEBUG][ProgrammateurDetails] APRES imports');

/**
 * Composant conteneur pour les détails d'un programmateur
 */
export default function ProgrammateurDetails() {
  const { id } = useParams();
  const {
    programmateur,
    structure,
    loading,
    error,
    handleDelete,
    formatValue,
    lieux,
    concerts,
    loadingStructure,
    loadingLieux,
    loadingConcerts
  } = useProgrammateurDetails(id);

  // Compteur de montages pour tracer le cycle de vie
  React.useEffect(() => {
    console.count('[MOUNT] ProgrammateurDetails mounted');
    return () => {
      console.count('[UNMOUNT] ProgrammateurDetails unmounted');
    };
  }, []);
  
  console.log('[TRACE-UNIQUE][ProgrammateurDetails] Entrée dans la fonction composant');

  // Log d'état pour diagnostic visuel

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!programmateur) return <NotFound message="Programmateur non trouvé" />;

  return (
    <ProgrammateurView
      programmateur={programmateur}
      structure={structure}
      lieux={lieux}
      concerts={concerts}
      loading={loading}
      loadingStructure={loadingStructure}
      loadingLieux={loadingLieux}
      loadingConcerts={loadingConcerts}
      error={error}
      handleDelete={handleDelete}
      formatValue={formatValue}
    />
  );
}
