// src/components/contacts/ContactDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import NotFound from '@/components/common/NotFound';
import ContactView from '@/components/contacts/desktop/ContactView';
import { useContactDetails } from '@/hooks/contacts';

// Log après imports (pour respecter import/first)
console.log('[DEBUG][ContactDetails] APRES imports');

/**
 * Composant conteneur pour les détails d'un contact
 */
export default function ContactDetails() {
  const { id } = useParams();
  const {
    contact,
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
  } = useContactDetails(id);

  // Compteur de montages pour tracer le cycle de vie
  React.useEffect(() => {
    console.count('[MOUNT] ContactDetails mounted');
    return () => {
      console.count('[UNMOUNT] ContactDetails unmounted');
    };
  }, []);
  
  console.log('[TRACE-UNIQUE][ContactDetails] Entrée dans la fonction composant');

  // Log d'état pour diagnostic visuel

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!contact) return <NotFound message="Contact non trouvé" />;

  return (
    <ContactView
      contact={contact}
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
