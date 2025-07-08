// src/components/contacts/ContactsList.js
import React, { useState, useMemo, useCallback } from 'react';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useTabs } from '@/context/TabsContext';
import { useContactsRelational } from '@/hooks/contacts/useContactsRelational';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteContactRelational } from '@/hooks/contacts';
import PersonneCreationModal from '@/components/contacts/modal/PersonneCreationModal';
import StructureCreationModal from '@/components/contacts/modal/StructureCreationModal';
import './ContactsList.module.css';

/**
 * Liste unifiée des contacts utilisant le modèle relationnel
 * MIGRATION: Maintenant utilise useContactsRelational au lieu de contacts_unified
 * Architecture Business-centrée avec affichage structures + personnes libres
 */
function ContactsList({ filterType = 'all' }) {
  const { currentEntreprise } = useEntreprise();
  const { openContactTab } = useTabs();
  
  // Utiliser le hook relationnel au lieu de l'ancienne approche
  const { 
    structures, 
    personnes, 
    liaisons, 
    loading, 
    error,
    getStructureWithPersonnes 
  } = useContactsRelational();
  
  // États pour la modal d'édition des personnes
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // États pour la modal d'édition des structures
  const [showEditStructureModal, setShowEditStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  
  // Callback après mise à jour du contact (personne)
  const handleContactUpdated = () => {
    setShowEditModal(false);
    setEditingContact(null);
    // Pas besoin de refresh avec le hook relationnel (temps réel)
  };

  // Callback après mise à jour de la structure
  const handleStructureUpdated = () => {
    setShowEditStructureModal(false);
    setEditingStructure(null);
    // Pas besoin de refresh avec le hook relationnel (temps réel)
  };
  
  // Callback après suppression réussie
  const onDeleteSuccess = useCallback((contactId, contactType) => {
    console.log('[ContactsList] Contact supprimé avec succès:', contactId, contactType);
    // Le hook relationnel se met à jour automatiquement via les listeners temps réel
    // Donc pas besoin de forcer un refresh manuel
  }, []);
  
  const { handleDeleteContact } = useDeleteContactRelational(onDeleteSuccess);

  // Transformer les données relationnelles en format compatible avec l'affichage
  const unifiedContacts = useMemo(() => {
    if (!currentEntreprise?.id) return [];
    
    const processedContacts = [];
    
    // Ajouter les structures avec leurs personnes
    structures.forEach(structure => {
      const structureWithPersonnes = getStructureWithPersonnes(structure.id);
      const personnesCount = structureWithPersonnes?.personnes?.filter(p => p.actif !== false).length || 0;
      
      // Ajouter la structure
      processedContacts.push({
        id: `${structure.id}_structure`,
        _originalId: structure.id,
        _viewType: 'structure',
        entityType: 'structure',
        nom: structure.raisonSociale || 'Structure sans nom',
        raisonSociale: structure.raisonSociale,
        displayName: structure.raisonSociale,
        type: structure.type,
        email: structure.email,
        telephone: structure.telephone1,
        ville: structure.ville,
        tags: structure.tags || [],
        isClient: structure.isClient,
        personnesCount,
        createdAt: structure.createdAt,
        updatedAt: structure.updatedAt,
        // Données complètes pour l'édition
        adresse: structure.adresse,
        codePostal: structure.codePostal,
        pays: structure.pays,
        telephone1: structure.telephone1,
        telephone2: structure.telephone2,
        siteWeb: structure.siteWeb,
        notes: structure.notes
      });
      
      // Ajouter les personnes de cette structure (si demandé)
      if (filterType === 'all' || filterType === 'personnes') {
        structureWithPersonnes?.personnes?.forEach(personne => {
          if (personne.actif !== false) { // Ne pas afficher les liaisons inactives
            processedContacts.push({
              id: `${personne.id}_in_${structure.id}`,
              _originalId: personne.id,
              _structureId: structure.id,
              _viewType: 'personne',
              entityType: 'personne',
              nom: personne.nom || '',
              prenom: personne.prenom || '',
              displayName: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
              email: personne.email,
              telephone: personne.telephone,
              ville: personne.ville,
              tags: personne.tags || [],
              fonction: personne.liaison?.fonction || '',
              prioritaire: personne.liaison?.prioritaire || false,
              interesse: personne.liaison?.interesse || false,
              structureName: structure.raisonSociale,
              createdAt: personne.createdAt,
              updatedAt: personne.updatedAt,
              // Données complètes pour l'édition
              adresse: personne.adresse,
              codePostal: personne.codePostal,
              pays: personne.pays,
              telephone2: personne.telephone2,
              notes: personne.notes
            });
          }
        });
      }
    });
    
    // Collecter les IDs des personnes déjà affichées avec des structures
    const personnesAvecStructure = new Set();
    liaisons
      .filter(l => l.actif && l.entrepriseId === currentEntreprise.id)
      .forEach(l => personnesAvecStructure.add(l.personneId));
    
    // Ajouter les personnes sans liaison active (anciennement "personnes libres")
    if (filterType === 'all' || filterType === 'personnes_libres') {
      personnes
        .filter(personne => !personnesAvecStructure.has(personne.id))
        .forEach(personne => {
          processedContacts.push({
            id: personne.id,
            _originalId: personne.id,
            _viewType: 'personne_libre',
            entityType: 'personne_libre',
            nom: personne.nom || '',
            prenom: personne.prenom || '',
            displayName: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
            email: personne.email,
            telephone: personne.telephone,
            ville: personne.ville,
            tags: personne.tags?.includes('indépendant') 
              ? personne.tags 
              : [...(personne.tags || []), 'indépendant'],
            createdAt: personne.createdAt,
            updatedAt: personne.updatedAt,
            // Données complètes pour l'édition
            adresse: personne.adresse,
            codePostal: personne.codePostal,
            pays: personne.pays,
            telephone2: personne.telephone2,
            notes: personne.notes
          });
        });
    }
    
    return processedContacts;
  }, [structures, personnes, currentEntreprise, filterType, getStructureWithPersonnes, liaisons]);

  // Fonction pour ouvrir la modal d'édition - gère personnes et structures
  const handleEditContact = (item) => {
    console.log('=== DEBUG CONTACT EDIT ===');
    console.log('[ContactsList] handleEditContact appelé avec:', item);
    console.log('[ContactsList] viewType:', item._viewType);
    console.log('[ContactsList] entityType:', item.entityType);
    
    // Si c'est une structure
    if (item._viewType === 'structure' || item.entityType === 'structure') {
      const editStructureData = {
        id: item._originalId,
        raisonSociale: item.raisonSociale || '',
        typeStructure: item.type || '',
        adresse: item.adresse || '',
        codePostal: item.codePostal || '',
        ville: item.ville || '',
        pays: item.pays || 'France',
        email: item.email || '',
        telephone1: item.telephone1 || '',
        telephone2: item.telephone2 || '',
        siteWeb: item.siteWeb || '',
        notes: item.notes || ''
      };
      
      console.log('[ContactsList] editStructureData préparé:', editStructureData);
      setEditingStructure(editStructureData);
      setShowEditStructureModal(true);
      return;
    }
    
    // Pour les personnes
    const editData = {
      id: item._originalId,
      prenom: item.prenom || '',
      nom: item.nom || '',
      adresse: item.adresse || '',
      codePostal: item.codePostal || '',
      ville: item.ville || '',
      pays: item.pays || 'France',
      mailDirect: item.email || '',
      telDirect: item.telephone || '',
      mobile: item.telephone2 || '',
      fonction: item.fonction || '',
      notes: item.notes || ''
    };
    
    console.log('[ContactsList] editData préparé:', editData);
    setEditingContact(editData);
    setShowEditModal(true);
  };

  // Configuration des colonnes simplifiée pour le modèle relationnel
  const columns = [
    {
      id: 'nom',
      label: 'Nom / Qualification',
      field: 'displayName',
      sortable: true,
      width: '25%',
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

        // Fonction ou type de structure - DÉSACTIVÉ
        let subInfo = '';
        // On n'affiche plus le type de structure ou "Sans structure"
        // if (item.entityType === 'structure') {
        //   subInfo = item.type || '';
        // } else {
        //   subInfo = item.fonction || (item._viewType === 'personne_libre' ? 'Sans structure' : '');
        // }

        return (
          <div className="d-flex align-items-center">
            <span 
              className={`badge bg-${variant} d-flex align-items-center justify-content-center me-2`} 
              style={{ fontSize: '0.8rem', minWidth: '24px', height: '24px' }}
              title={type === 'structure' ? 'Structure' : 'Personne'}
            >
              <i className={icon}></i>
            </span>
            <div>
              <div className="fw-bold">
                {item.displayName || 'Sans nom'}
              </div>
              {subInfo && (
                <small className="text-muted">{subInfo}</small>
              )}
              {item.prioritaire && (
                <span className="badge bg-warning ms-1" title="Contact prioritaire">
                  <i className="bi bi-star-fill"></i>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'contacts_lies',
      label: 'Contacts liés',
      sortable: false,
      width: '15%',
      render: (item) => {
        if (item.entityType === 'structure') {
          return (
            <div>
              {item.personnesCount > 0 ? (
                <span className="badge bg-light text-dark">
                  <i className="bi bi-people me-1"></i>
                  {item.personnesCount}
                </span>
              ) : (
                <span className="text-muted">-</span>
              )}
            </div>
          );
        } else if (item.structureName) {
          return (
            <div>
              <small className="text-muted text-truncate d-block" title={item.structureName}>
                <i className="bi bi-building me-1"></i>
                {item.structureName}
              </small>
            </div>
          );
        }
        return <span className="text-muted">-</span>;
      },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '20%',
      render: (item) => {
        const email = item.email?.trim();
        return email ? (
          <a href={`mailto:${email}`} className="text-decoration-none" title={email}>
            <span className="text-truncate d-block">{email}</span>
          </a>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: true,
      width: '15%',
      render: (item) => {
        const tel = item.telephone;
        return tel ? (
          <a href={`tel:${tel}`} className="text-decoration-none">
            <span className="text-truncate d-block">{tel}</span>
          </a>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      id: 'ville',
      label: 'Ville',
      sortable: true,
      width: '15%',
      render: (item) => {
        const ville = item.ville;
        const cp = item.codePostal;
        return (
          <div>
            {ville ? (
              <span className="text-truncate d-block">{ville}</span>
            ) : (
              <span className="text-muted">-</span>
            )}
            {cp && <small className="text-muted">{cp}</small>}
          </div>
        );
      },
    },
    {
      id: 'tags',
      label: 'Tags',
      sortable: false,
      width: '10%',
      render: (item) => {
        const tags = item.tags || [];
        return tags.length > 0 ? (
          <div>
            {tags.slice(0, 2).map((tag, index) => (
              <small key={index} className="badge bg-secondary me-1">
                {tag}
              </small>
            ))}
            {tags.length > 2 && (
              <small className="text-muted">+{tags.length - 2}</small>
            )}
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    }
  ];

  // Statistiques simplifiées pour le modèle relationnel
  const getStatistics = (items) => {
    const total = items.length;
    const structures = items.filter(item => item.entityType === 'structure').length;
    const personnes = items.filter(item => item.entityType === 'personne' || item.entityType === 'personne_libre').length;
    const personnesLibres = items.filter(item => item._viewType === 'personne_libre').length;
    const personnesEnStructure = personnes - personnesLibres;
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
        id: 'structures',
        label: 'Structures',
        value: structures,
        icon: 'bi bi-building',
        variant: 'info',
        subtext: `${Math.round((structures / total) * 100) || 0}%`
      },
      {
        id: 'personnes',
        label: 'Personnes',
        value: personnes,
        icon: 'bi bi-person',
        variant: 'success',
        subtext: `${personnesEnStructure} liées + ${personnesLibres} sans structure`
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

  // Actions sur les lignes
  const renderActions = (item) => {
    const contactId = item._originalId;
    const viewType = item._viewType;
    
    console.log('[ContactsList] renderActions - item:', item);
    console.log('[ContactsList] renderActions - contactId:', contactId);
    console.log('[ContactsList] renderActions - viewType:', viewType);
    
    return (
      <div className="d-flex gap-1 justify-content-end">
        {/* Visualiser fiche */}
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation();
            openContactTab(contactId, item.displayName, viewType);
          }}
          title="Visualiser la fiche"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-eye"></i>
        </button>
        
        {/* Éditer */}
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation();
            handleEditContact(item);
          }}
          title="Modifier"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-pencil"></i>
        </button>
        
        {/* Qualifier */}
        <button
          className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implémenter modal de qualification
            console.log('Qualifier:', item);
            alert('Fonctionnalité de qualification à implémenter');
          }}
          title="Qualifier ce contact"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-tags"></i>
        </button>
        
        {/* Supprimer */}
        <button
          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation();
            // Déterminer le type en fonction du viewType
            const contactType = viewType === 'structure' ? 'structure' : 'personne';
            handleDeleteContact(contactId, e, contactType);
          }}
          title="Supprimer"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    );
  };

  // Filtres simplifiés pour le modèle relationnel
  const getFilterOptions = () => [
    { value: 'all', label: 'Tous', icon: 'bi-list' },
    { value: 'structures', label: 'Structures', icon: 'bi-building' },
    { value: 'personnes', label: 'Personnes', icon: 'bi-person' },
    { value: 'personnes_libres', label: 'Sans structure', icon: 'bi-person-dash' },
    { value: 'avec_email', label: 'Avec email', icon: 'bi-envelope' },
    { value: 'avec_telephone', label: 'Avec téléphone', icon: 'bi-telephone' }
  ];

  // Logique de filtrage simplifiée
  const filterData = (items, filterValue, searchQuery) => {
    let filtered = items;

    // Filtrage par type
    switch (filterValue) {
      case 'structures':
        filtered = filtered.filter(item => item.entityType === 'structure');
        break;
      case 'personnes':
        filtered = filtered.filter(item => item.entityType === 'personne' || item.entityType === 'personne_libre');
        break;
      case 'personnes_libres':
        filtered = filtered.filter(item => item._viewType === 'personne_libre');
        break;
      case 'avec_email':
        filtered = filtered.filter(item => item.email);
        break;
      case 'avec_telephone':
        filtered = filtered.filter(item => item.telephone);
        break;
      default:
        break;
    }

    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.displayName?.toLowerCase().includes(query) ||
        item.nom?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.telephone?.includes(query) ||
        item.fonction?.toLowerCase().includes(query) ||
        item.structureName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des contacts relationnels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Erreur de chargement</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Recharger la page
        </button>
      </div>
    );
  }

  return (
    <div className="contacts-list-relational">
      <ListWithFilters
        initialData={unifiedContacts}
        loading={loading}
        error={error}
        onRefresh={() => window.location.reload()} // Simple reload pour le modèle relationnel
        columns={columns}
        getStatistics={getStatistics}
        renderActions={renderActions}
        onRowClick={(item) => {
          const contactId = item._originalId;
          const viewType = item._viewType;
          openContactTab(contactId, item.displayName, viewType);
        }}
        filterOptions={getFilterOptions()}
        filterData={filterData}
        searchPlaceholder="Rechercher dans structures et personnes..."
        emptyStateMessage="Aucun contact trouvé"
        emptyStateIcon="bi-people"
        showStats={true}
        title="Contacts (Modèle Relationnel)"
      />

      {/* Modal d'édition des personnes */}
      <PersonneCreationModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingContact(null);
        }}
        onCreated={handleContactUpdated}
        editMode={true}
        initialData={editingContact}
      />

      {/* Modal d'édition des structures */}
      <StructureCreationModal
        show={showEditStructureModal}
        onHide={() => {
          setShowEditStructureModal(false);
          setEditingStructure(null);
        }}
        onCreated={handleStructureUpdated}
        editMode={true}
        initialData={editingStructure}
      />
    </div>
  );
}

export default ContactsList;