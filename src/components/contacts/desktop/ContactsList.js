import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactSearch, useDeleteContactRelational } from '@/hooks/contacts';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/ui/Alert';
import usePermissions from '@/hooks/usePermissions';
import styles from './ContactsList.module.css';
import Table from '@/components/ui/Table';
import ContactsListHeader from './sections/ContactsListHeader';
import ContactsStatsCards from './sections/ContactsStatsCards';
import ContactsListSearchFilter from './sections/ContactsListSearchFilter';
import ContactsListEmptyState from './sections/ContactsListEmptyState';
import ContactsToolbar from './ContactsToolbar';
import ContactsMap from './ContactsMap';

const ContactsList = () => {
  const navigate = useNavigate();
  const { openContactTab } = useTabs();
  const { openPersonneModal, openStructureModal } = useContactModals();
  const { canEdit, canDelete } = usePermissions();
  const {
    contacts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    searchFilters,
    setSearchFilters,
    handleSearch,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setContacts,
    structures,
    personnes,
    liaisons
  } = useContactSearch();

  // États pour la toolbar
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  const [showPersonnesOnly, setShowPersonnesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const { 
    handleDelete: handleDeleteContact,
    isDeleting
  } = useDeleteContactRelational((deletedId) => {
    // Supprimer le contact de la liste locale
    setContacts(prevContacts => 
      prevContacts.filter(p => p.id !== deletedId)
    );
  });
  
  const searchInputRef = React.useRef(null);

  // Filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Gestion des filtres avancés avec le hook sophistiqué
  const handleAdvancedFilterChange = (filterType, value) => {
    const newFilters = {
      ...searchFilters,
      [filterType]: value
    };
    setSearchFilters(newFilters);
    handleSearch(searchTerm, newFilters);
  };

  // Reset des filtres avancés
  const handleResetAdvancedFilters = () => {
    setSearchFilters({});
    handleSearch(searchTerm, {});
  };

  // Vérifier si des filtres avancés sont actifs
  const hasActiveAdvancedFilters = () => {
    return Object.keys(searchFilters).some(key => 
      searchFilters[key] && searchFilters[key] !== '' && searchFilters[key] !== 'all'
    );
  };

  // Calculer le nombre de filtres avancés actifs
  const activeFiltersCount = () => {
    return Object.keys(searchFilters).filter(key => searchFilters[key] && searchFilters[key] !== '' && searchFilters[key] !== 'all').length;
  };

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    handleSearch(searchTerm, searchFilters);
  };

  // Fonction pour ouvrir la modal d'édition
  const handleEditContact = (contact) => {
    console.log('🔍 [ContactsList] handleEditContact - contact reçu:', contact);
    console.log('🔍 [ContactsList] Type de contact:', contact.type || contact.entityType);
    console.log('🔍 [ContactsList] Clés du contact:', Object.keys(contact));
    console.log('🔍 [ContactsList] Nombre de structures disponibles:', structures?.length);
    console.log('🔍 [ContactsList] Nombre de personnes disponibles:', personnes?.length);
    
    // Utiliser entityType si type n'est pas défini (données transformées)
    const contactType = contact.type || contact.entityType;
    
    if (contactType === 'structure') {
      // Pour les structures, on doit récupérer l'objet structure complet
      const structureComplete = structures.find(s => s.id === contact.id);
      console.log('🔍 [ContactsList] Structure complète pour édition:', structureComplete);
      console.log('🔍 [ContactsList] Données passées à la modal:', {
        editMode: true,
        initialData: structureComplete || contact
      });
      
      openStructureModal({
        editMode: true,
        initialData: structureComplete || contact
      });
    } else if (contactType === 'personne') {
      // Pour les personnes, on doit récupérer l'objet personne complet
      const personneComplete = personnes.find(p => p.id === contact.id);
      console.log('🔍 [ContactsList] Personne complète pour édition:', personneComplete);
      
      openPersonneModal({
        editMode: true,
        initialData: personneComplete || contact
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Définition des colonnes pour le composant Table commun
  const columns = [
    {
      label: 'Nom',
      key: 'nom',
      sortable: true,
      render: (row) => (
        <div className={styles.contactNameWrapper}>
          <span className={styles.typeIcon} title={row.entityType === 'structure' ? 'Structure' : 'Personne'}>
            <i className={`bi ${row.entityType === 'structure' ? 'bi-building' : 'bi-person'}`}></i>
          </span>
          <div>
            <span className={styles.contactName}>
              {row.nom}{row.prenom && ` ${row.prenom}`}
            </span>
            {row.fonction && <div className={styles.fonction}>{row.fonction}</div>}
          </div>
        </div>
      )
    },
    {
      label: 'Contacts liés',
      key: 'contactsLies',
      sortable: false,
      render: (row) => {
        // Pour les structures, on affiche les personnes liées
        if (row.entityType === 'structure') {
          const personnesLiees = personnes.filter(p => 
            liaisons.some(l => l.structureId === row.id && l.personneId === p.id && l.actif !== false)
          );
          if (personnesLiees.length > 0) {
            return (
              <div className={styles.contactsLies}>
                {personnesLiees.slice(0, 2).map(p => (
                  <div key={p.id} className={styles.contactLie}>
                    {p.prenom} {p.nom}
                  </div>
                ))}
                {personnesLiees.length > 2 && (
                  <span className={styles.moreContacts}>+{personnesLiees.length - 2} autres</span>
                )}
              </div>
            );
          }
        }
        // Pour les personnes, on affiche les structures liées
        else if (row.structures && row.structures.length > 0) {
          return (
            <div className={styles.contactsLies}>
              {row.structures.slice(0, 2).map(s => (
                <div key={s.id} className={styles.contactLie}>
                  {s.raisonSociale}
                  {s.fonction && <span className={styles.fonctionLie}> ({s.fonction})</span>}
                </div>
              ))}
              {row.structures.length > 2 && (
                <span className={styles.moreContacts}>+{row.structures.length - 2} autres</span>
              )}
            </div>
          );
        }
        return <span className="text-muted">-</span>;
      }
    },
    {
      label: 'Email',
      key: 'email',
      sortable: true,
      render: (row) => row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span className="text-muted">-</span>
    },
    {
      label: 'Téléphone',
      key: 'telephone',
      sortable: true,
      render: (row) => row.telephone ? <a href={`tel:${row.telephone}`}>{row.telephone}</a> : <span className="text-muted">-</span>
    },
    {
      label: 'Site internet',
      key: 'siteWeb',
      sortable: false,
      render: (row) => {
        // Pour les structures, on peut avoir le siteWeb
        const siteWeb = row.structure?.siteWeb || row.siteWeb;
        return siteWeb ? (
          <a href={siteWeb.startsWith('http') ? siteWeb : `https://${siteWeb}`} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-globe"></i>
          </a>
        ) : <span className="text-muted">-</span>;
      }
    },
    {
      label: 'CP',
      key: 'codePostal',
      sortable: true,
      render: (row) => row.codePostal || row.structure?.codePostal || <span className="text-muted">-</span>
    },
    {
      label: 'Ville',
      key: 'ville',
      sortable: true,
      render: (row) => row.ville || <span className="text-muted">-</span>
    },
    {
      label: 'Pays',
      key: 'pays',
      sortable: true,
      render: (row) => row.pays || row.structure?.pays || <span className="text-muted">-</span>
    }
  ];

  // Actions par ligne
  const renderActions = (row) => (
    <div className={styles.actionButtons}>
      {canEdit('contacts') && (
        <button 
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            handleEditContact(row);
          }}
          title="Modifier"
        >
          <i className="bi bi-pencil"></i>
        </button>
      )}
      {canDelete('contacts') && (
        <button 
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteContact(row.id);
          }} 
          disabled={isDeleting}
          title="Supprimer"
        >
          <i className="bi bi-trash"></i>
        </button>
      )}
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          openContactTab(row.id, row.displayName || row.nom || 'Contact');
        }}
        title="Visualiser"
      >
        <i className="bi bi-eye"></i>
      </button>
      {canEdit('contacts') && (
        <button 
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/contacts/${row.id}/qualify`);
          }}
          title="Qualifier"
        >
          <i className="bi bi-tags"></i>
        </button>
      )}
    </div>
  );

  // Stats réelles
  const stats = {
    total: contacts.length,
    actifs: contacts.filter(p => p.actif !== false).length,
    inactifs: contacts.filter(p => p.actif === false).length,
  };

  // Filtrage et tri harmonisés - CORRIGÉ avec vérifications de sécurité
  const filteredContacts = contacts
    .filter(p => {
      // Vérifier que l'objet contact est valide
      if (!p || typeof p !== 'object') return false;
      
      // Filtrer par type si le mode "personnes seulement" est activé
      if (showPersonnesOnly && p.type !== 'personne') return false;
      
      // Filtrage par terme de recherche
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      const nomComplet = `${p.nom || ''} ${p.prenom || ''}`.toLowerCase();
      
      return nomComplet.includes(searchTermLower);
    })
    .sort((a, b) => {
      // Vérifications de sécurité pour le tri
      if (!a || !b) return 0;
      
      if (sortField === 'nom') {
        const nomA = a.nom || '';
        const nomB = b.nom || '';
        
        return sortDirection === 'asc' 
          ? nomA.localeCompare(nomB)
          : nomB.localeCompare(nomA);
      }
      
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  if (loading) {
    return <Spinner message="Chargement des contacts..." contentOnly={true} />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        Erreur: {error instanceof Error ? error.message : String(error)}
      </Alert>
    );
  }

  return (
    <div className={styles.contactsListContainer}>
      {/* Title and Add button */}
      <ContactsListHeader />

      {/* Stats cards (placeholder) */}
      {stats && <ContactsStatsCards stats={stats} />}

      {/* Search and filter controls avec filtres avancés sophistiqués */}
      <ContactsListSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCount={filteredContacts.length}
        totalCount={contacts.length}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
        handleResetAdvancedFilters={handleResetAdvancedFilters}
        activeFiltersCount={activeFiltersCount()}
      />
      
      {/* Panel des filtres avancés */}
      {showAdvancedFilters && (
        <div className={styles.advancedFiltersPanel}>
          <div className={styles.filtersGrid}>
            {/* Filtre par statut d'activité */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Statut d'activité</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.actif || 'all'}
                onChange={(e) => handleAdvancedFilterChange('actif', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </div>
            
            {/* Filtre par présence d'email */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Contact email</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.hasEmail || 'all'}
                onChange={(e) => handleAdvancedFilterChange('hasEmail', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Avec email</option>
                <option value="false">Sans email</option>
              </select>
            </div>
            
            {/* Filtre par présence de téléphone */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Contact téléphone</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.hasTelephone || 'all'}
                onChange={(e) => handleAdvancedFilterChange('hasTelephone', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Avec téléphone</option>
                <option value="false">Sans téléphone</option>
              </select>
            </div>
            
            {/* Filtre par fonction */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Fonction</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Ex: Directeur, Manager..."
                value={searchFilters.fonction || ''}
                onChange={(e) => handleAdvancedFilterChange('fonction', e.target.value)}
              />
            </div>
            
            {/* Filtre par ville */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ville</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Ex: Paris, Lyon..."
                value={searchFilters.ville || ''}
                onChange={(e) => handleAdvancedFilterChange('ville', e.target.value)}
              />
            </div>
            
            {/* Filtre par date de création */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Créé après</label>
              <input
                type="date"
                className={styles.filterInput}
                value={searchFilters.dateCreationApres || ''}
                onChange={(e) => handleAdvancedFilterChange('dateCreationApres', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <ContactsToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        showPersonnesOnly={showPersonnesOnly}
        setShowPersonnesOnly={setShowPersonnesOnly}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={filteredContacts.length}
        onRefresh={handleRefresh}
      />

      {/* Table or map view */}
      {filteredContacts.length > 0 ? (
        viewMode === 'map' ? (
          <ContactsMap 
            contacts={filteredContacts}
            onContactClick={(contact) => openContactTab(contact.id, contact.displayName || contact.nom || 'Contact')}
          />
        ) : (
          <div className={styles.tableContainer}>
            <Table
              columns={columns}
              data={paginatedContacts}
              renderActions={renderActions}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSortClick}
              onRowClick={(row) => openContactTab(row.id, row.displayName || row.nom || 'Contact')}
            />
          </div>
        )
      ) : (
        <ContactsListEmptyState 
          hasSearchQuery={searchTerm && typeof searchTerm === 'string' ? searchTerm.trim().length > 0 : false}
        />
      )}
    </div>
  );
};

export default ContactsList;
