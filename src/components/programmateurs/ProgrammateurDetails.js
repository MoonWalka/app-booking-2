// src/components/programmateurs/ProgrammateurDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import NotFound from '@/components/common/NotFound';
import ProgrammateurView from '@/components/programmateurs/desktop/ProgrammateurView';
import { useDeleteProgrammateur } from '@/hooks/programmateurs';
import { useProgrammateurDetails } from '@/hooks/programmateurs';

// Log après imports (pour respecter import/first)
console.log('[DEBUG][ProgrammateurDetails] APRES imports');
console.log('[TEST-TRACE-UNIQUE][ProgrammateurDetails] Ce fichier est bien exécuté !');

/**
 * Composant conteneur pour les détails d'un programmateur
 * Version simplifiée avec structure optimisée et logs réduits
 */
export default function ProgrammateurDetails() {
  const { id } = useParams();
  const { programmateur, structure, loading, error, handleDelete, formatValue } = useProgrammateurDetails(id);

  // Compteur de montages pour tracer le cycle de vie
  React.useEffect(() => {
    console.count('[MOUNT] ProgrammateurDetails mounted');
    return () => {
      console.count('[UNMOUNT] ProgrammateurDetails unmounted');
    };
  }, []);
  
  console.log('[TRACE-UNIQUE][ProgrammateurDetails] Entrée dans la fonction composant');

  // Log d'état pour diagnostic visuel
  console.log('[DEBUG][ProgrammateurDetails] State:', { loading, error, programmateur });

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <ProgrammateurView
      programmateur={programmateur}
      structure={structure}
      loading={loading}
      error={error}
      handleDelete={handleDelete}
      formatValue={formatValue}
    />
  );
}
