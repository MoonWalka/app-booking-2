// src/components/structures/StructuresList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import AddButton from '@/components/ui/AddButton';
import { useDeleteStructure } from '@/hooks/structures';
import { useTabs } from '@/context/TabsContext';
import StructureCreationModal from '@/components/contacts/modal/StructureCreationModal';

/**
 * Liste unifiée des structures utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function StructuresList() {
  console.log('🏢 Main StructuresList component loaded');
  const navigate = useNavigate();
  const { openContactTab } = useTabs();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStructureModal, setShowStructureModal] = useState(false);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDelete } = useDeleteStructure(onDeleteSuccess);

  // Fonction de calcul des statistiques pour tous les contacts
  const calculateStats = (items) => {
    const total = items.length;
    
    // Répartition par type de contact
    const typeCount = items.reduce((acc, contact) => {
      const hasStructureData = contact.structureRaisonSociale?.trim();
      
      let type;
      if (hasStructureData) {
        type = 'structures';
      } else {
        type = 'personnes';
      }
      
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Contacts avec email
    const avecEmail = items.filter(contact => 
      contact.email || contact.mailDirect || contact.structureEmail
    ).length;
    
    return [
      {
        id: 'total',
        label: 'Total Contacts',
        value: total,
        icon: 'bi bi-people',
        variant: 'primary'
      },
      {
        id: 'structures',
        label: 'Structures',
        value: typeCount.structures || 0,
        icon: 'bi bi-building',
        variant: 'info'
      },
      {
        id: 'personnes',
        label: 'Personnes',
        value: typeCount.personnes || 0,
        icon: 'bi bi-person',
        variant: 'success'
      },
      {
        id: 'avec_email',
        label: 'Avec email',
        value: avecEmail,
        icon: 'bi bi-envelope',
        variant: 'secondary',
        subtext: `${Math.round((avecEmail / total) * 100) || 0}%`
      }
    ];
  };

  // Configuration des colonnes pour tous les contacts (avec détection du type)
  const columns = [
    {
      id: 'type',
      label: 'Type',
      field: 'entityType',
      sortable: true,
      width: '8%',
      render: (contact) => {
        // Détecter le type selon les nouvelles métadonnées
        const hasStructureData = contact.structureRaisonSociale?.trim();
        
        let type, icon, variant;
        if (hasStructureData) {
          type = 'Structure'; icon = 'bi bi-building'; variant = 'info';
        } else {
          type = 'Personne'; icon = 'bi bi-person'; variant = 'primary';
        }
        
        return (
          <span 
            className={`badge bg-${variant} d-flex align-items-center justify-content-center`} 
            style={{ fontSize: '1rem', minWidth: '32px', height: '28px' }}
            title={type}
          >
            <i className={icon}></i>
          </span>
        );
      },
    },
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '30%',
      render: (contact) => {
        const hasStructureData = contact.structureRaisonSociale?.trim();
        
        if (hasStructureData) {
          // Structure
          return contact.structureRaisonSociale || 'Structure sans nom';
        } else {
          // Personne
          return `${contact.prenom} ${contact.nom}`.trim() || contact.nom || contact.email || 'Contact sans nom';
        }
      },
    },
    {
      id: 'details',
      label: 'Détails',
      field: 'details',
      sortable: false,
      width: '20%',
      render: (contact) => {
        if (contact.structureRaisonSociale) {
          return contact.structureSiret || contact.structureId || 'Structure';
        }
        return contact.fonction || contact.structureNom || '—';
      },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '20%',
      render: (contact) => {
        return contact.email || contact.mailDirect || contact.structureEmail || '—';
      },
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: false,
      width: '18%',
      render: (contact) => {
        return contact.telephone || contact.telDirect || contact.structureTelephone1 || '—';
      },
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou raison sociale...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'association', label: 'Association' },
        { value: 'sas', label: 'SAS' },
        { value: 'sarl', label: 'SARL' },
        { value: 'eurl', label: 'EURL' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];

  // Actions sur les lignes (adaptées pour tous les contacts)
  const renderActions = (contact) => {
    const displayName = getContactDisplayName(contact);
    
    return (
      <ActionButtons
        onView={() => openContactTab(contact.id, displayName)}
        onEdit={() => navigate(`/contacts/${contact.id}/edit`)}
        onDelete={() => handleDelete(contact.id)}
      />
    );
  };
  
  // Fonction utilitaire pour obtenir le nom d'affichage
  const getContactDisplayName = (contact) => {
    const hasStructureData = contact.structureRaisonSociale?.trim();
    
    if (hasStructureData) {
      return contact.structureRaisonSociale || 'Structure';
    } else {
      return `${contact.prenom} ${contact.nom}`.trim() || contact.nom || contact.email || 'Contact';
    }
  };

  // Callback appelé après création réussie d'une structure
  const handleStructureCreated = (newStructure) => {
    console.log('Structure créée:', newStructure);
    setRefreshKey(prev => prev + 1); // Actualiser la liste
    // Optionnel : ouvrir l'onglet de la nouvelle structure
    openContactTab(newStructure.id, newStructure.structureRaisonSociale);
  };

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => setShowStructureModal(true)}
    >
      Nouvelle structure
    </AddButton>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (contact) => {
    console.log('🖱️ Clic sur contact:', contact);
    const displayName = getContactDisplayName(contact);
    console.log('🚀 Ouverture onglet contact:', contact.id, displayName);
    openContactTab(contact.id, displayName);
  };

  return (
    <>
      <ListWithFilters
        key={refreshKey}
        entityType="contacts"
        title="Tous les Contacts"
        columns={columns}
        filterOptions={filterOptions}
        sort={{ field: 'nom', direction: 'asc' }}
        actions={headerActions}
        onRowClick={handleRowClick}
        renderActions={renderActions}
        pageSize={20}
        showRefresh={true}
        showStats={true}
        calculateStats={calculateStats}
      />
      
      {/* Modal de création de structure */}
      <StructureCreationModal
        show={showStructureModal}
        onHide={() => setShowStructureModal(false)}
        onCreated={handleStructureCreated}
      />
    </>
  );
}

export default StructuresList;