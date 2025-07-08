import React, { useState } from 'react';
import { useContactFactures } from '@/hooks/contacts/useContactFactures';
import FacturesTableView from '@/components/factures/FacturesTableView';
import factureService from '@/services/factureService';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Tableau des factures associées à un contact ou une structure
 * Utilise maintenant FacturesTableView comme composant commun
 */
const ContactFacturesTable = ({ contactId, entityType = 'contact' }) => {
  const { factures, loading, error, refetch } = useContactFactures(contactId, entityType);
  const [localFactures, setLocalFactures] = useState([]);
  const { currentEntreprise } = useEntreprise();

  // Synchroniser les factures du hook avec l'état local
  React.useEffect(() => {
    setLocalFactures(factures);
  }, [factures]);

  const handleDelete = async (facture) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${facture.reference || facture.numeroFacture} ?`)) {
      try {
        await factureService.deleteFacture(facture.id, currentEntreprise.id);
        console.log('Facture supprimée avec succès:', facture.id);
        
        // Mettre à jour l'état local immédiatement pour une UX rapide
        setLocalFactures(prev => prev.filter(f => f.id !== facture.id));
        
        // Optionnel : refetch en arrière-plan pour garantir la cohérence
        // Sans bloquer l'interface utilisateur
        if (refetch) {
          setTimeout(() => refetch(), 1000);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la facture:', error);
        alert('Erreur lors de la suppression de la facture');
        // En cas d'erreur, recharger pour s'assurer de la cohérence
        if (refetch) refetch();
      }
    }
  };

  return (
    <FacturesTableView
      factures={localFactures}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      showSearch={false}
      showFilters={false}
      emptyMessage="Ce contact n'a pas encore de factures générées."
    />
  );
};

export default ContactFacturesTable;