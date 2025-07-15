import React, { useState, useEffect } from 'react';
import { useTabs } from '@/context/TabsContext';
import { useNavigate } from 'react-router-dom';
import styles from '@/components/contacts/desktop/ContactsList.module.css';

/**
 * Page pour afficher les résultats d'une sélection sauvegardée
 * Affiche directement la liste des contacts sélectionnés
 */
const SavedSelectionResultsPage = ({ savedSelection }) => {
  const { openContactTab, openStructureTab } = useTabs();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (savedSelection && savedSelection.contacts) {
      // Utiliser directement les contacts de la sélection
      const combinedContacts = savedSelection.contacts.map(c => ({
        ...c,
        displayName: c.type === 'structure' 
          ? (c.nom || 'Structure sans nom')
          : `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Personne sans nom'
      }));
      
      setContacts(combinedContacts);
    }
  }, [savedSelection]);

  // Filtrage par terme de recherche
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const displayName = contact.displayName.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    const ville = (contact.ville || '').toLowerCase();
    
    return displayName.includes(searchLower) || 
           email.includes(searchLower) || 
           ville.includes(searchLower);
  });

  // Tri
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    
    if (sortField === 'nom') {
      aValue = a.displayName;
      bValue = b.displayName;
    }
    
    const comparison = aValue.toString().localeCompare(bValue.toString());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (contact) => {
    if (contact.type === 'structure') {
      openStructureTab(contact.id, contact.displayName);
    } else {
      openContactTab(contact.id, contact.displayName);
    }
  };

  return (
    <div className={styles.contactsListContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-check2-square me-2"></i>
            {savedSelection?.nom || 'Sélection sauvegardée'}
          </h1>
          <p className={styles.subtitle}>
            {savedSelection?.description || `${contacts.length} contact(s) sélectionné(s)`}
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className={styles.searchControls}>
        <div className={styles.searchWrapper}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filtrer les résultats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className={styles.clearButton}
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        <div className={styles.searchInfo}>
          {sortedContacts.length} résultat{sortedContacts.length > 1 ? 's' : ''}
          {searchTerm && ` sur ${contacts.length} total`}
        </div>
      </div>

      {/* Table des résultats */}
      {sortedContacts.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Type</th>
                <th onClick={() => handleSort('nom')} style={{ cursor: 'pointer' }}>
                  Nom
                  {sortField === 'nom' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email
                  {sortField === 'email' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('telephone')} style={{ cursor: 'pointer' }}>
                  Téléphone
                  {sortField === 'telephone' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('ville')} style={{ cursor: 'pointer' }}>
                  Ville
                  {sortField === 'ville' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.map((contact) => (
                <tr 
                  key={`${contact.type}-${contact.id}`}
                  onClick={() => handleRowClick(contact)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className={`badge ${contact.type === 'structure' ? 'bg-primary' : 'bg-info'}`}>
                      <i className={`bi ${contact.type === 'structure' ? 'bi-building' : 'bi-person'} me-1`}></i>
                      {contact.type === 'structure' ? 'Structure' : 'Personne'}
                    </span>
                  </td>
                  <td>
                    <strong>{contact.displayName}</strong>
                    {contact.type === 'personne' && contact.fonction && (
                      <small className="d-block text-muted">{contact.fonction}</small>
                    )}
                  </td>
                  <td>{contact.email || '-'}</td>
                  <td>{contact.telephone || '-'}</td>
                  <td>{contact.ville || '-'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleRowClick(contact)}
                      title="Voir la fiche"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
          <p className="text-muted">
            {searchTerm 
              ? 'Aucun résultat ne correspond à votre filtre'
              : 'Aucun contact dans cette sélection'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedSelectionResultsPage;