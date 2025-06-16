// src/components/contacts/ContactsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import AddButton from '@/components/ui/AddButton';
import { useDeleteContact } from '@/hooks/contacts';
import { mapTerm } from '@/utils/terminologyMapping';

/**
 * Liste unifiée des contacts utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function ContactsList() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { openContactTab } = useTabs();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDelete } = useDeleteContact(onDeleteSuccess);

  // Chargement des données des contacts
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'contacts'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur chargement contacts:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrganization?.id, refreshKey]);

  // Fonction de rafraîchissement
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Configuration des colonnes pour les contacts
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '20%',
    },
    {
      id: 'prenom',
      label: 'Prénom',
      field: 'prenom',
      sortable: true,
      width: '20%',
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '25%',
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: false,
      width: '15%',
      render: (contact) => contact.telephone || '—',
    },
    {
      id: 'createdAt',
      label: 'Créé le',
      field: 'createdAt',
      sortable: true,
      width: '20%',
      render: (contact) => {
        if (contact.createdAt?.toDate) {
          return contact.createdAt.toDate().toLocaleDateString('fr-FR');
        }
        return '-';
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
      placeholder: 'Nom ou organisation...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'festival', label: 'Festival' },
        { value: 'salle', label: 'Salle' },
        { value: 'producteur', label: 'Producteur' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];
  
  // Configuration des filtres avancés
  const advancedFilterOptions = [
    {
      id: 'actif',
      label: 'Statut d\'activité',
      field: 'actif',
      type: 'select',
      options: [
        { value: 'true', label: 'Actifs' },
        { value: 'false', label: 'Inactifs' }
      ]
    },
    {
      id: 'hasEmail',
      label: 'Contact email',
      field: 'email',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec email' },
        { value: 'false', label: 'Sans email' }
      ]
    },
    {
      id: 'hasTelephone',
      label: 'Contact téléphone',
      field: 'telephone',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec téléphone' },
        { value: 'false', label: 'Sans téléphone' }
      ]
    },
    {
      id: 'fonction',
      label: 'Fonction',
      field: 'fonction',
      type: 'text',
      placeholder: 'Ex: Directeur, Manager...'
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'contact.ville',
      type: 'text',
      placeholder: 'Ville de résidence'
    }
  ];
  
  // Fonction de calcul des statistiques
  const calculateStats = (items) => {
    const total = items.length;
    const actifs = items.filter(p => p.actif !== false).length;
    const inactifs = items.filter(p => p.actif === false).length;
    const avecEmail = items.filter(p => p.email).length;
    const avecTelephone = items.filter(p => p.telephone).length;
    
    return [
      {
        id: 'total',
        label: mapTerm('Contacts'),
        value: total,
        icon: 'bi bi-people',
        variant: 'primary'
      },
      {
        id: 'actifs',
        label: 'Actifs',
        value: actifs,
        icon: 'bi bi-person-check',
        variant: 'success',
        subtext: `${Math.round((actifs / total) * 100) || 0}%`
      },
      {
        id: 'inactifs',
        label: 'Inactifs',
        value: inactifs,
        icon: 'bi bi-person-x',
        variant: 'warning',
        subtext: `${Math.round((inactifs / total) * 100) || 0}%`
      },
      {
        id: 'contact',
        label: 'Avec contact',
        value: `${avecEmail} / ${avecTelephone}`,
        icon: 'bi bi-envelope-at',
        variant: 'info',
        subtext: 'Email / Tél.'
      }
    ];
  };

  // Actions sur les lignes
  const renderActions = (contact) => (
    <ActionButtons
      onView={() => openContactTab(contact.id, `${contact.prenom || ''} ${contact.nom || ''}`.trim() || 'Contact')}
      onEdit={() => navigate(`/contacts/${contact.id}/edit`)}
      onDelete={() => handleDelete(contact.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/contacts/nouveau')}
      label={mapTerm("Nouveau contact")}
    />
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (contact) => {
    const contactName = `${contact.prenom || ''} ${contact.nom || ''}`.trim() || 'Contact';
    openContactTab(contact.id, contactName);
  };

  return (
    <ListWithFilters
      key={refreshKey}
      entityType="contacts"
      title={mapTerm("Gestion des Contacts")}
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
      showAdvancedFilters={true}
      advancedFilterOptions={advancedFilterOptions}
      // Données et état depuis le chargement local
      initialData={contacts}
      loading={loading}
      error={error}
      onRefresh={refreshData}
    />
  );
}

export default ContactsList;
