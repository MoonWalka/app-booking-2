// src/components/contacts/ContactsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { useDeleteContact } from '@/hooks/contacts';
// import { useDeleteStructure } from '@/hooks/structures';

/**
 * Liste unifiée des contacts et structures utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 * Affiche les personnes depuis la collection "contacts" et les structures depuis la collection "structures"
 * @param {string} filterType - Type de filtre: 'all' (défaut), 'structures', 'personnes'
 */
function ContactsList({ filterType = 'all' }) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { openContactTab } = useTabs();
  const [unifiedContacts, setUnifiedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContact(onDeleteSuccess);
  // const { handleDelete: handleDeleteStructure } = useDeleteStructure(onDeleteSuccess);

  // Chargement unifié des contacts ET structures (architecture Structure-centrée)
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    console.log('🔄 Chargement contacts + structures...');
    
    let allContactsData = [];
    let allStructuresData = [];
    let contactsLoaded = false;
    let structuresLoaded = false;
    
    const processUnifiedData = () => {
      if (contactsLoaded && structuresLoaded) {
        console.log(`📋 Traitement unifié: ${allContactsData.length} contacts + ${allStructuresData.length} structures`);
        processContactsAndStructures(allContactsData, allStructuresData);
      }
    };
    
    // Charger les contacts (personnes)
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('organizationId', '==', currentOrganization.id)
    );
    
    const unsubscribeContacts = onSnapshot(
      contactsQuery,
      (snapshot) => {
        allContactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          _sourceCollection: 'contacts'
        }));
        
        console.log(`📋 Contacts trouvés: ${allContactsData.length}`);
        contactsLoaded = true;
        processUnifiedData();
      },
      (err) => {
        console.error('Erreur chargement contacts:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    // Charger les structures
    const structuresQuery = query(
      collection(db, 'structures'),
      where('organizationId', '==', currentOrganization.id)
    );
    
    const unsubscribeStructures = onSnapshot(
      structuresQuery,
      (snapshot) => {
        allStructuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          _sourceCollection: 'structures'
        }));
        
        console.log(`📋 Structures trouvées: ${allStructuresData.length}`);
        structuresLoaded = true;
        processUnifiedData();
      },
      (err) => {
        console.error('Erreur chargement structures:', err);
        // Continuer même si pas de structures
        structuresLoaded = true;
        processUnifiedData();
      }
    );
    
    const processContactsAndStructures = (contacts, structures) => {
        console.log(`📋 Traitement unifié: ${contacts.length} contacts + ${structures.length} structures`);
        
        const processedContacts = [];
        
        // Traitement des contacts (personnes)
        contacts.forEach(contact => {
          const hasPersonneData = contact.prenom?.trim() && contact.nom?.trim();
          
          if (hasPersonneData) {
            // Contact = personne
            processedContacts.push({
              ...contact,
              _originalId: contact.id,
              _viewType: 'personne',
              entityType: 'personne',
              displayName: `${contact.prenom} ${contact.nom}`.trim(),
              nom: contact.nom,
              email: contact.mailDirect || contact.email || contact.structureEmail,
              telephone: contact.telDirect || contact.telephone || contact.structureTelephone1,
              _originalData: contact,
              _sourceCollection: 'contacts'
            });
          } else {
            // Contact basique (ancien format)
            const entityType = contact.type || 'personne';
            const displayName = contact.nom || contact.email || 'Contact sans nom';
            
            processedContacts.push({
              ...contact,
              _originalId: contact.id,
              _viewType: entityType,
              entityType,
              displayName,
              nom: contact.nom,
              email: contact.email || contact.mailDirect,
              telephone: contact.telephone || contact.telDirect,
              _originalData: contact,
              _sourceCollection: 'contacts'
            });
          }
        });
        
        // Traitement des structures
        structures.forEach(structure => {
          processedContacts.push({
            ...structure,
            _originalId: structure.id,
            _viewType: 'structure',
            entityType: 'structure',
            displayName: structure.raisonSociale || structure.nom || 'Structure sans nom',
            nom: structure.raisonSociale || structure.nom,
            email: structure.email,
            telephone: structure.telephone1 || structure.telephone,
            _originalData: structure,
            _sourceCollection: 'structures'
          });
        });
        
        console.log(`✅ Traitement terminé: ${processedContacts.filter(c => c.entityType === 'personne').length} personnes + ${processedContacts.filter(c => c.entityType === 'structure').length} structures`);
        
        setUnifiedContacts(processedContacts);
        setLoading(false);
        setError(null);
    };

    return () => {
      unsubscribeContacts();
      unsubscribeStructures();
    };
  }, [currentOrganization?.id, refreshKey]);

  // Fonction de rafraîchissement
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Configuration des colonnes pour la liste unifiée
  const columns = [
    {
      id: 'type',
      label: 'Type',
      field: 'entityType',
      sortable: true,
      width: '8%',
      render: (item) => {
        const type = item.entityType;
        
        let icon, variant;
        if (type === 'structure') {
          icon = 'bi bi-building';
          variant = 'info';
        } else {
          icon = 'bi bi-person';
          variant = 'primary';
        }
        
        return (
          <span 
            className={`badge bg-${variant} d-flex align-items-center justify-content-center`} 
            style={{ fontSize: '1rem', minWidth: '32px', height: '28px' }}
            title={type === 'structure' ? 'Structure' : 'Personne'}
          >
            <i className={icon}></i>
          </span>
        );
      },
    },
    {
      id: 'nom',
      label: 'Nom',
      field: 'displayName',
      sortable: true,
      width: '25%',
      render: (item) => {
        return item.displayName || 'Contact sans nom';
      },
    },
    {
      id: 'details',
      label: 'Détails',
      field: 'details',
      sortable: false,
      width: '20%',
      render: (item) => {
        if (item.entityType === 'structure') {
          // Pour les structures, afficher le type ou SIRET
          return item.type || item.siret || '—';
        }
        // Pour les personnes, afficher la fonction ou l'organisation
        return item.fonction || (item.structure?.nom) || '—';
      },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '20%',
      render: (item) => item.email || '—',
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: false,
      width: '15%',
      render: (item) => item.telephone || '—',
    },
    {
      id: 'createdAt',
      label: 'Créé le',
      field: 'createdAt',
      sortable: true,
      width: '8%',
      render: (item) => {
        if (item.createdAt?.toDate) {
          return item.createdAt.toDate().toLocaleDateString('fr-FR');
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
      field: 'displayName',
      type: 'text',
      placeholder: 'Nom, prénom, organisation...',
    },
    {
      id: 'entityType',
      label: 'Type d\'entité',
      field: 'entityType',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'personne', label: 'Personnes' },
        { value: 'structure', label: 'Structures' },
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
    const personnes = items.filter(p => p.entityType === 'personne').length;
    const structures = items.filter(p => p.entityType === 'structure').length;
    const avecEmail = items.filter(p => p.email).length;
    const avecTelephone = items.filter(p => p.telephone).length;
    
    return [
      {
        id: 'total',
        label: 'Total',
        value: total,
        icon: 'bi bi-people-fill',
        variant: 'primary'
      },
      {
        id: 'personnes',
        label: 'Personnes',
        value: personnes,
        icon: 'bi bi-person',
        variant: 'success',
        subtext: `${Math.round((personnes / total) * 100) || 0}%`
      },
      {
        id: 'structures',
        label: 'Structures',
        value: structures,
        icon: 'bi bi-building',
        variant: 'info',
        subtext: `${Math.round((structures / total) * 100) || 0}%`
      },
      {
        id: 'contact',
        label: 'Avec contact',
        value: `${avecEmail} / ${avecTelephone}`,
        icon: 'bi bi-envelope-at',
        variant: 'warning',
        subtext: 'Email / Tél.'
      }
    ];
  };

  // Actions sur les lignes (adaptées selon le type d'entité)
  const renderActions = (item) => {
    const contactId = item._originalId || item.id; // Utiliser l'ID original si dupliqué
    const viewType = item._viewType; // Type de vue pour les contacts dupliqués
    
    return (
      <ActionButtons
        onView={() => openContactTab(contactId, item.displayName, viewType)}
        onEdit={() => navigate(`/contacts/${contactId}/edit`)}
        onDelete={() => handleDeleteContact(contactId)}
      />
    );
  };

  // Actions de l'en-tête avec menu déroulant pour choisir le type
  const headerActions = (
    <div className="d-flex gap-2">
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-primary dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-plus-lg me-1"></i>
          Nouveau
        </button>
        <ul className="dropdown-menu">
          <li>
            <button
              className="dropdown-item d-flex align-items-center"
              onClick={() => navigate('/contacts/nouveau')}
            >
              <i className="bi bi-person me-2"></i>
              Nouvelle personne
            </button>
          </li>
          <li>
            <button
              className="dropdown-item d-flex align-items-center"
              onClick={() => navigate('/structures/nouveau')}
            >
              <i className="bi bi-building me-2"></i>
              Nouvelle structure
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  // Gestion du clic sur une ligne (adaptée selon le type d'entité)
  const handleRowClick = (item) => {
    const contactId = item._originalId || item.id; // Utiliser l'ID original si dupliqué
    const viewType = item._viewType; // Type de vue pour les contacts dupliqués
    console.log('🖱️ Clic sur contact:', item);
    console.log('🚀 Ouverture onglet contact:', contactId, item.displayName, 'viewType:', viewType);
    openContactTab(contactId, item.displayName, viewType);
  };

  return (
    <ListWithFilters
      key={refreshKey}
      entityType="contacts"
      title="Gestion des Contacts & Structures"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'displayName', direction: 'asc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={renderActions}
      pageSize={20}
      showRefresh={true}
      showStats={true}
      calculateStats={calculateStats}
      showAdvancedFilters={true}
      advancedFilterOptions={advancedFilterOptions}
      // Données et état depuis le chargement unifié
      initialData={unifiedContacts}
      loading={loading}
      error={error}
      onRefresh={refreshData}
    />
  );
}

export default ContactsList;
