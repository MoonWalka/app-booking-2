import React, { useState, useEffect } from 'react';
import { useTabs } from '@/context/TabsContext';
import { useNavigate } from 'react-router-dom';
import styles from '@/components/contacts/desktop/ContactsList.module.css';

/**
 * Page pour afficher les résultats d'une recherche sauvegardée
 * Affiche directement la liste des contacts sans l'interface de recherche
 */
const SavedSearchResultsPage = ({ savedSearch }) => {
  const { openContactTab, openStructureTab } = useTabs();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (savedSearch && savedSearch.results) {
      // Combiner structures et personnes
      const combinedContacts = [];
      
      // Ajouter les structures
      if (savedSearch.results.structures) {
        savedSearch.results.structures.forEach(s => {
          combinedContacts.push({
            ...s,
            _type: 'structure',
            displayName: s.raisonSociale || s.nom || 'Structure sans nom'
          });
        });
      }
      
      // Ajouter les personnes
      if (savedSearch.results.personnes) {
        savedSearch.results.personnes.forEach(p => {
          combinedContacts.push({
            ...p,
            _type: 'personne',
            displayName: `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Personne sans nom'
          });
        });
      }
      
      setContacts(combinedContacts);
    }
  }, [savedSearch]);

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
    if (contact._type === 'structure') {
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
            <i className="bi bi-search me-2"></i>
            {savedSearch?.name || 'Recherche sauvegardée'}
          </h1>
          <p className={styles.subtitle}>
            {savedSearch?.description || 'Résultats de la recherche'}
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
                  key={`${contact._type}-${contact.id}`}
                  onClick={() => handleRowClick(contact)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className={`badge ${contact._type === 'structure' ? 'bg-primary' : 'bg-info'}`}>
                      <i className={`bi ${contact._type === 'structure' ? 'bi-building' : 'bi-person'} me-1`}></i>
                      {contact._type === 'structure' ? 'Structure' : 'Personne'}
                    </span>
                  </td>
                  <td>
                    <strong>{contact.displayName}</strong>
                    {contact._type === 'personne' && contact.fonction && (
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
              : 'Aucun résultat dans cette recherche sauvegardée'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedSearchResultsPage;