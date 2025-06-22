import React, { useState } from 'react';
import { useContactsRelational } from '@/hooks/contacts/useContactsRelational';
import { useTabs } from '@/context/TabsContext';
import { Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FiUser, FiUsers, FiMail, FiPhone, FiMapPin, FiStar, FiCheck, FiX } from 'react-icons/fi';
import './ContactsList.module.css';

/**
 * Composant de liste des contacts utilisant le nouveau modèle relationnel
 * Remplace progressivement ContactsList
 */
export function ContactsListRelational() {
  const { openContactTab } = useTabs();
  const {
    filteredData,
    statistics,
    loading,
    error,
    filters,
    setFilters,
    setPrioritaire
  } = useContactsRelational();

  const [expandedStructures, setExpandedStructures] = useState(new Set());

  // Gérer l'expansion/réduction des structures
  const toggleStructure = (structureId) => {
    const newExpanded = new Set(expandedStructures);
    if (newExpanded.has(structureId)) {
      newExpanded.delete(structureId);
    } else {
      newExpanded.add(structureId);
    }
    setExpandedStructures(newExpanded);
  };

  // Ouvrir une fiche contact
  const handleOpenContact = (contact, type) => {
    const name = type === 'structure' 
      ? contact.raisonSociale 
      : `${contact.prenom} ${contact.nom}`.trim();
    openContactTab(contact.id, name, type);
  };

  // Rendu d'une personne dans une structure
  const renderPersonneInStructure = (personne, structure) => (
    <div 
      key={personne.id} 
      className="personne-item d-flex align-items-center justify-content-between p-2 border-bottom"
    >
      <div className="d-flex align-items-center flex-grow-1">
        <FiUser className="me-2 text-muted" />
        <div 
          className="flex-grow-1 cursor-pointer"
          onClick={() => handleOpenContact(personne, 'personne')}
        >
          <div className="fw-semibold">
            {personne.prenom} {personne.nom}
            {personne.liaison.prioritaire && (
              <Badge bg="warning" className="ms-2" title="Contact prioritaire">
                <FiStar />
              </Badge>
            )}
            {personne.liaison.interesse && (
              <Badge bg="info" className="ms-2" title="Intéressé">
                <FiCheck />
              </Badge>
            )}
            {!personne.liaison.actif && (
              <Badge bg="secondary" className="ms-2" title="Inactif">
                <FiX />
              </Badge>
            )}
          </div>
          {personne.liaison.fonction && (
            <small className="text-muted">{personne.liaison.fonction}</small>
          )}
        </div>
      </div>
      
      <div className="d-flex align-items-center gap-2">
        {personne.email && (
          <a href={`mailto:${personne.email}`} onClick={e => e.stopPropagation()}>
            <FiMail className="text-muted" />
          </a>
        )}
        {personne.telephone && (
          <a href={`tel:${personne.telephone}`} onClick={e => e.stopPropagation()}>
            <FiPhone className="text-muted" />
          </a>
        )}
        
        {/* Actions rapides */}
        {personne.liaison.actif && !personne.liaison.prioritaire && (
          <Button
            size="sm"
            variant="outline-warning"
            title="Définir comme contact prioritaire"
            onClick={async (e) => {
              e.stopPropagation();
              await setPrioritaire(structure.id, personne.id);
            }}
          >
            <FiStar />
          </Button>
        )}
      </div>
    </div>
  );

  // Rendu d'une structure
  const renderStructure = (structure) => {
    const isExpanded = expandedStructures.has(structure.id);
    const activePersonnes = structure.personnes?.filter(p => p.liaison.actif) || [];
    const hasPersonnes = activePersonnes.length > 0;

    return (
      <div key={structure.id} className="structure-card mb-3 border rounded">
        <div 
          className="structure-header p-3 d-flex align-items-center justify-content-between cursor-pointer"
          onClick={() => hasPersonnes && toggleStructure(structure.id)}
        >
          <div className="d-flex align-items-center flex-grow-1">
            <FiUsers className="me-2 text-primary" />
            <div 
              className="flex-grow-1"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenContact(structure, 'structure');
              }}
            >
              <h6 className="mb-0">
                {structure.raisonSociale}
                {structure.isClient && (
                  <Badge bg="success" className="ms-2">Client</Badge>
                )}
              </h6>
              <div className="d-flex align-items-center gap-3 mt-1 small text-muted">
                {structure.ville && (
                  <span><FiMapPin className="me-1" />{structure.ville}</span>
                )}
                {structure.email && (
                  <span><FiMail className="me-1" />{structure.email}</span>
                )}
                {structure.telephone1 && (
                  <span><FiPhone className="me-1" />{structure.telephone1}</span>
                )}
              </div>
              {structure.tags?.length > 0 && (
                <div className="mt-1">
                  {structure.tags.map(tag => (
                    <Badge key={tag} bg="light" text="dark" className="me-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            {hasPersonnes && (
              <>
                <Badge bg="primary" className="me-2">
                  {activePersonnes.length} contact{activePersonnes.length > 1 ? 's' : ''}
                </Badge>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>
                  ▶
                </span>
              </>
            )}
          </div>
        </div>
        
        {isExpanded && hasPersonnes && (
          <div className="structure-personnes border-top">
            {activePersonnes.map(personne => renderPersonneInStructure(personne, structure))}
          </div>
        )}
      </div>
    );
  };

  // Rendu d'une personne libre
  const renderPersonneLibre = (personne) => (
    <div 
      key={personne.id} 
      className="personne-libre-card mb-3 border rounded p-3 cursor-pointer"
      onClick={() => handleOpenContact(personne, 'personne')}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center flex-grow-1">
          <FiUser className="me-2 text-secondary" />
          <div>
            <h6 className="mb-0">
              {personne.prenom} {personne.nom}
              <Badge bg="secondary" className="ms-2">Personne libre</Badge>
            </h6>
            <div className="d-flex align-items-center gap-3 mt-1 small text-muted">
              {personne.email && (
                <span><FiMail className="me-1" />{personne.email}</span>
              )}
              {personne.telephone && (
                <span><FiPhone className="me-1" />{personne.telephone}</span>
              )}
              {personne.ville && (
                <span><FiMapPin className="me-1" />{personne.ville}</span>
              )}
            </div>
            {personne.tags?.length > 0 && (
              <div className="mt-1">
                {personne.tags.map(tag => (
                  <Badge key={tag} bg="light" text="dark" className="me-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Filtres
  const renderFilters = () => (
    <div className="filters-section mb-4 p-3 bg-light rounded">
      <div className="row g-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>
        
        <div className="col-md-2">
          <select 
            className="form-select"
            value={filters.showClients === null ? '' : filters.showClients.toString()}
            onChange={(e) => setFilters({ 
              ...filters, 
              showClients: e.target.value === '' ? null : e.target.value === 'true' 
            })}
          >
            <option value="">Tous</option>
            <option value="true">Clients uniquement</option>
            <option value="false">Non-clients</option>
          </select>
        </div>
        
        <div className="col-md-2">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="showInactive"
              checked={filters.showInactive}
              onChange={(e) => setFilters({ ...filters, showInactive: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="showInactive">
              Afficher inactifs
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Statistiques
  const renderStatistics = () => (
    <div className="statistics-bar mb-3 p-2 bg-light rounded d-flex gap-3 small">
      <span><strong>{statistics.totalStructures}</strong> structures</span>
      <span><strong>{statistics.totalPersonnes}</strong> personnes</span>
      <span><strong>{statistics.liaisonsActives}</strong> liaisons actives</span>
      <span><strong>{statistics.personnesLibres}</strong> personnes libres</span>
      <span><strong>{statistics.clients}</strong> clients</span>
      <span><strong>{statistics.contactsPrioritaires}</strong> contacts prioritaires</span>
    </div>
  );

  // Rendu principal
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Chargement des contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="contacts-list-relational">
      {renderFilters()}
      {renderStatistics()}
      
      <div className="contacts-content">
        {filteredData.total === 0 ? (
          <div className="text-center p-5 text-muted">
            <FiUsers size={48} className="mb-3" />
            <p>Aucun contact trouvé</p>
          </div>
        ) : (
          <>
            {/* Structures */}
            {filteredData.structures.length > 0 && (
              <div className="structures-section mb-4">
                <h5 className="mb-3">
                  Structures ({filteredData.structures.length})
                </h5>
                {filteredData.structures.map(renderStructure)}
              </div>
            )}
            
            {/* Personnes libres */}
            {filteredData.personnesLibres.length > 0 && (
              <div className="personnes-libres-section">
                <h5 className="mb-3">
                  Personnes libres ({filteredData.personnesLibres.length})
                </h5>
                {filteredData.personnesLibres.map(renderPersonneLibre)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}