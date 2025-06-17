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
import { useDeleteStructure } from '@/hooks/structures';

/**
 * Liste unifiée des contacts et structures utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 * Affiche les personnes depuis la collection "contacts" et les structures depuis la collection "structures"
 * @param {string} filterType - Type de filtre: 'all' (défaut), 'structures', 'personnes'
 */
function ContactsList({ filterType = 'all' }) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { openContactTab, openStructureTab } = useTabs();
  const [unifiedContacts, setUnifiedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContact(onDeleteSuccess);
  const { handleDelete: handleDeleteStructure } = useDeleteStructure(onDeleteSuccess);

  // Chargement unifié des contacts (après migration, tout est dans contacts)
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    console.log('🔄 Chargement de tous les contacts...');
    
    // Rechercher dans les deux collections possibles
    console.log('🔍 Recherche contacts pour organisation:', currentOrganization.id);
    
    // D'abord essayer la collection globale
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribeContacts = onSnapshot(contactsQuery, 
      (snapshot) => {
        const allContacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📋 Contacts globaux trouvés: ${allContacts.length}`);
        console.log('🔍 Premier contact exemple:', allContacts[0]);
        
        // Si aucun contact dans la collection globale, essayer la collection organisationnelle
        if (allContacts.length === 0) {
          console.log('⚠️ Aucun contact dans collection globale, test collection org...');
          
          // Essayer la collection organisationnelle
          const orgContactsQuery = query(
            collection(db, `contacts_org_${currentOrganization.id}`)
          );
          
          onSnapshot(orgContactsQuery, (orgSnapshot) => {
            const orgContacts = orgSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            console.log(`📋 Contacts org trouvés: ${orgContacts.length}`);
            
            if (orgContacts.length > 0) {
              processContacts(orgContacts);
            } else {
              console.log('❌ Aucun contact trouvé dans aucune collection');
              setUnifiedContacts([]);
              setLoading(false);
            }
          });
          
          return;
        }
        
        processContacts(allContacts);
      },
      (err) => {
        console.error('Erreur chargement contacts:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    const processContacts = (allContacts) => {
        console.log(`📋 Traitement de ${allContacts.length} contacts`);
        
        // Détecter le type selon les nouvelles métadonnées
        const processedContacts = allContacts.map(contact => {
          const hasStructureData = contact.structureRaisonSociale?.trim();
          const hasPersonneData = contact.prenom?.trim() && contact.nom?.trim();
          
          let entityType, displayName;
          
          if (hasStructureData && !hasPersonneData) {
            // Contact de type structure pure
            entityType = 'structure';
            displayName = contact.structureRaisonSociale || 'Structure sans nom';
          } else if (hasPersonneData && !hasStructureData) {
            // Contact de type personne pure  
            entityType = 'personne';
            displayName = `${contact.prenom} ${contact.nom}`.trim();
          } else if (hasStructureData && hasPersonneData) {
            // Contact mixte (structure + personne)
            entityType = 'mixte';
            displayName = `${contact.prenom} ${contact.nom} (${contact.structureRaisonSociale})`.trim();
          } else {
            // Contact basique (ancien format)
            entityType = contact.type || 'personne';
            displayName = contact.nom || contact.email || 'Contact sans nom';
          }
          
          return {
            ...contact,
            entityType,
            displayName,
            // Préserver les champs pour compatibilité
            nom: contact.nom || contact.structureRaisonSociale,
            email: contact.email || contact.mailDirect || contact.structureEmail,
            telephone: contact.telephone || contact.telDirect || contact.structureTelephone1,
            _originalData: contact,
            _sourceCollection: 'contacts'
          };
        });
        
        console.log(`✅ Contacts traités: ${processedContacts.filter(c => c.entityType === 'personne').length} personnes + ${processedContacts.filter(c => c.entityType === 'structure').length} structures + ${processedContacts.filter(c => c.entityType === 'mixte').length} mixtes`);
        
        setUnifiedContacts(processedContacts);
        setLoading(false);
        setError(null);
    };

    return () => {
      unsubscribeContacts();
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
      width: '12%',
      render: (item) => {
        const type = item.entityType;
        
        let icon, label, variant;
        if (type === 'structure') {
          icon = 'bi bi-building';
          label = 'Structure';
          variant = 'info';
        } else if (type === 'mixte') {
          icon = 'bi bi-person-gear';
          label = 'Mixte';
          variant = 'warning';
        } else {
          icon = 'bi bi-person';
          label = 'Personne';
          variant = 'primary';
        }
        
        return (
          <span className={`badge bg-${variant} d-flex align-items-center gap-1`} style={{ fontSize: '0.75rem' }}>
            <i className={icon}></i>
            {label}
          </span>
        );
      },
    },
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
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
    if (item.entityType === 'structure') {
      return (
        <ActionButtons
          onView={() => openStructureTab(item.id, item.nom || item.raisonSociale || 'Structure')}
          onEdit={() => navigate(`/structures/${item.id}/edit`)}
          onDelete={() => handleDeleteStructure(item.id)}
        />
      );
    } else {
      return (
        <ActionButtons
          onView={() => openContactTab(item.id, `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Contact')}
          onEdit={() => navigate(`/contacts/${item.id}/edit`)}
          onDelete={() => handleDeleteContact(item.id)}
        />
      );
    }
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
    if (item.entityType === 'structure') {
      const structureName = item.nom || item.raisonSociale || 'Structure';
      openStructureTab(item.id, structureName);
    } else {
      const contactName = `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Contact';
      openContactTab(item.id, contactName);
    }
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
