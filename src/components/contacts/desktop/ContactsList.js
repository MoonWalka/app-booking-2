import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactSearch, useDeleteContactRelational } from '@/hooks/contacts';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/ui/Alert';
import styles from './ContactsList.module.css';
import Table from '@/components/ui/Table';
import ContactsListHeader from './sections/ContactsListHeader';
import ContactsStatsCards from './sections/ContactsStatsCards';
import ContactsListSearchFilter from './sections/ContactsListSearchFilter';
import ContactsListEmptyState from './sections/ContactsListEmptyState';

const ContactsList = () => {
  const navigate = useNavigate();
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
    setContacts
  } = useContactSearch();
  
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
        <>
          <span className={styles.contactName}>
            {row.nom}{row.prenom && ` ${row.prenom}`}
          </span>
          {row.fonction && <div className={styles.fonction}>{row.fonction}</div>}
        </>
      )
    },
    {
      label: 'Structure',
      key: 'structure',
      sortable: true,
      render: (row) => row.structure?.nom || <span className="text-muted">Non spécifiée</span>
    },
    {
      label: 'Email',
      key: 'email',
      sortable: true,
      render: (row) => row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span className="text-muted">Non spécifié</span>
    },
    {
      label: 'Téléphone',
      key: 'telephone',
      sortable: true,
      render: (row) => row.telephone ? <a href={`tel:${row.telephone}`}>{row.telephone}</a> : <span className="text-muted">Non spécifié</span>
    }
  ];

  // Actions par ligne
  const renderActions = (row) => (
    <div className={styles.actionButtons}>
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/contacts/${row.id}`);
        }}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/contacts/${row.id}/edit`);
        }}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
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

      {/* Table or empty state */}
      {filteredContacts.length > 0 ? (
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={filteredContacts}
            renderActions={renderActions}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSortClick}
            onRowClick={(id) => navigate(`/contacts/${id}`)}
          />
        </div>
      ) : (
        <ContactsListEmptyState 
          hasSearchQuery={searchTerm && typeof searchTerm === 'string' ? searchTerm.trim().length > 0 : false}
        />
      )}
    </div>
  );
};

export default ContactsList;
