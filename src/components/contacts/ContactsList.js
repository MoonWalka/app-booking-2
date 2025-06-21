// src/components/contacts/ContactsListUnified.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteContact } from '@/hooks/contacts';
import PersonneCreationModal from '@/components/contacts/modal/PersonneCreationModal';
import StructureCreationModal from '@/components/contacts/modal/StructureCreationModal';
import { formatActivityTags, getPersonDisplayType } from '@/utils/contactUtils';
import styles from './ContactsList.module.css';

/**
 * Liste unifiée des contacts utilisant la collection contacts_unified
 * Architecture Business-centrée avec affichage structures + personnes
 * Compatible avec import/export XLS naturel
 */
function ContactsList({ filterType = 'all' }) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { openContactTab, openTab } = useTabs();
  const [unifiedContacts, setUnifiedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // États pour la modal d'édition des personnes
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // États pour la modal d'édition des structures
  const [showEditStructureModal, setShowEditStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  
  // Callback après suppression
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };


  // Callback après mise à jour du contact (personne)
  const handleContactUpdated = () => {
    setShowEditModal(false);
    setEditingContact(null);
    setRefreshKey(prev => prev + 1); // Rafraîchir la liste
  };

  // Callback après mise à jour de la structure
  const handleStructureUpdated = () => {
    setShowEditStructureModal(false);
    setEditingStructure(null);
    setRefreshKey(prev => prev + 1); // Rafraîchir la liste
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContact(onDeleteSuccess);

  // Fonction pour ouvrir la modal d'édition - gère personnes et structures
  const handleEditContact = (item) => {
    console.log('=== DEBUG CONTACT EDIT ===');
    console.log('[ContactsList] handleEditContact appelé avec:', item);
    console.log('[ContactsList] item keys:', Object.keys(item));
    console.log('[ContactsList] viewType:', item._viewType);
    console.log('[ContactsList] entityType:', item.entityType);
    
    // Si c'est une structure
    if (item._viewType === 'structure' || item.entityType === 'structure') {
      console.log('[ContactsList] Structure item complet:', item);
      console.log('[ContactsList] Clés disponibles:', Object.keys(item));
      
      // Essayer différentes sources pour la raison sociale
      const raisonSociale = item.structureRaisonSociale || 
                           item.raisonSociale || 
                           item.structureName || 
                           item.nom || 
                           item.displayName || 
                           '';
      
      console.log('[ContactsList] Raison sociale trouvée:', raisonSociale);
      
      const editStructureData = {
        id: item.id,
        raisonSociale: raisonSociale,
        typeStructure: item.structureType || item.typeStructure || '',
        adresse: item.structureAdresse || item.adresse || '',
        suiteAdresse: item.structureSuiteAdresse1 || item.suiteAdresse || '',
        codePostal: item.structureCodePostal || item.codePostal || '',
        ville: item.structureVille || item.ville || '',
        departement: item.structureDepartement || item.departement || '',
        region: item.structureRegion || item.region || '',
        pays: item.structurePays || item.pays || 'France',
        email: item.structureEmail || item.email || '',
        telephone1: item.structureTelephone1 || item.telephone || '',
        telephone2: item.structureTelephone2 || '',
        siteWeb: item.structureSiteWeb || '',
        siret: item.structureSiret || '',
        source: item.source || 'Prospection'
      };
      
      console.log('[ContactsList] editStructureData préparé:', editStructureData);
      setEditingStructure(editStructureData);
      setShowEditStructureModal(true);
      return;
    }
    
    // Pour les personnes, utiliser la même approche que ContactViewTabs
    const editData = {
      id: item.id,
      prenom: item.prenom || '',
      nom: item.nom || '',
      source: item.source || 'Prospection',
      adresse: item.adresse || '',
      suiteAdresse: item.suiteAdresse || '',
      codePostal: item.codePostal || '',
      ville: item.ville || '',
      departement: item.departement || '',
      region: item.region || '',
      pays: item.pays || 'France',
      mailDirect: item.mailDirect || item.email || '',
      mailPerso: item.mailPerso || '',
      telDirect: item.telDirect || item.telephone || '',
      telPerso: item.telPerso || '',
      mobile: item.mobile || '',
      fonction: item.fonction || ''
    };
    
    console.log('[ContactsList] editData préparé:', editData);
    setEditingContact(editData);
    setShowEditModal(true);
  };

  // Chargement de la collection unifiée
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    console.log('🔄 Chargement collection unifiée contacts_unified...');
    
    // Requête sur la collection unifiée
    const unifiedQuery = query(
      collection(db, 'contacts_unified'),
      where('organizationId', '==', currentOrganization.id)
    );
    
    const unsubscribeUnified = onSnapshot(
      unifiedQuery,
      (snapshot) => {
        const unifiedDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📋 Documents unifiés trouvés: ${unifiedDocs.length}`);
        processUnifiedDocuments(unifiedDocs);
      },
      (err) => {
        console.error('Erreur chargement documents unifiés:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    const processUnifiedDocuments = (unifiedDocs) => {
        console.log(`📋 Traitement de ${unifiedDocs.length} documents unifiés`);
        
        const processedContacts = [];
        
        unifiedDocs.forEach(doc => {
          if (doc.entityType === 'structure') {
            // Document structure avec personnes associées
            const structureDisplayName = doc.structure?.raisonSociale || doc.structure?.nom || 'Structure sans nom';
            const personnesCount = doc.personnes?.filter(p => p.prenom && p.nom).length || 0;
            
            // Ajouter la structure
            processedContacts.push({
              ...doc,
              id: `${doc.id}_structure`, // ID unique pour la structure
              _originalId: doc.id,
              _viewType: 'structure',
              entityType: 'structure',
              displayName: structureDisplayName,
              nom: structureDisplayName,
              email: doc.structure?.email?.trim() || '',
              telephone: doc.structure?.telephone1 || doc.structure?.telephone || '',
              subtext: `${personnesCount} personne${personnesCount > 1 ? 's' : ''}`,
              _sourceCollection: 'contacts_unified',
              _isStructureContainer: true,
              createdAt: doc.createdAt
            });
            
            // Ajouter les personnes associées
            doc.personnes?.forEach((personne, index) => {
              if (personne.prenom && personne.nom) {
                processedContacts.push({
                  ...doc,
                  id: `${doc.id}_personne_${index}`, // ID unique pour chaque personne
                  _originalId: doc.id,
                  _viewType: 'personne',
                  _personneIndex: index,
                  entityType: 'personne',
                  displayName: `${personne.prenom} ${personne.nom}`.trim(),
                  nom: personne.nom,
                  email: (personne.mailDirect?.trim() || personne.email?.trim() || ''),
                  telephone: personne.telephone || personne.telDirect || personne.mobile || '',
                  subtext: structureDisplayName,
                  _sourceCollection: 'contacts_unified',
                  _isPersonInStructure: true,
                  _structureName: structureDisplayName,
                  // Ajouter les données géographiques de la personne
                  codePostal: personne.codePostal || '',
                  ville: personne.ville || '',
                  pays: personne.pays || '',
                  createdAt: doc.createdAt
                });
              }
            });
            
          } else if (doc.entityType === 'personne_libre') {
            // Document personne libre
            const personne = doc.personne;
            processedContacts.push({
              ...doc,
              id: `${doc.id}_personne_libre`, // ID unique pour personne libre
              _originalId: doc.id,
              _viewType: 'personne',
              entityType: 'personne',
              displayName: `${personne?.prenom || ''} ${personne?.nom || ''}`.trim() || 'Personne sans nom',
              nom: personne?.nom || '',
              email: (personne?.mailDirect?.trim() || personne?.email?.trim() || ''),
              telephone: personne?.telephone || personne?.mobile || '',
              subtext: 'Personne libre',
              _sourceCollection: 'contacts_unified',
              _isPersonLibre: true,
              // Ajouter les données géographiques de la personne libre
              codePostal: personne?.codePostal || '',
              ville: personne?.ville || '',
              pays: personne?.pays || '',
              createdAt: doc.createdAt
            });
          }
        });
        
        const structures = processedContacts.filter(c => c.entityType === 'structure').length;
        const personnes = processedContacts.filter(c => c.entityType === 'personne').length;
        
        console.log(`✅ Traitement terminé: ${structures} structures + ${personnes} personnes = ${processedContacts.length} entrées`);
        
        setUnifiedContacts(processedContacts);
        setLoading(false);
        setError(null);
    };

    return () => {
      unsubscribeUnified();
    };
  }, [currentOrganization?.id, refreshKey]);

  // Fonction de rafraîchissement
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Configuration des colonnes pour l'affichage unifié
  const columns = [
    {
      id: 'nom',
      label: 'Nom / Qualification',
      field: 'displayName',
      sortable: true,
      width: '22%',
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

        // Déterminer la qualification/fonction
        let qualification = '';
        if (item.entityType === 'structure') {
          // Pour les structures, afficher les tags d'activité au lieu du type
          const tags = item.qualification?.tags || [];
          qualification = formatActivityTags(tags);
        } else {
          // Pour les personnes, afficher les tags d'activité, ou la fonction, ou "Indépendant"
          const tags = item.qualification?.tags || [];
          const activityDisplay = getPersonDisplayType({ tags });
          
          if (activityDisplay !== 'Indépendant') {
            qualification = activityDisplay; // Tags d'activité
          } else {
            const fonction = item._isPersonInStructure 
              ? item.personnes?.[item._personneIndex]?.fonction
              : item.personne?.fonction;
            qualification = fonction || 'Indépendant';
          }
        }

        return (
          <div className="d-flex align-items-center">
            <span 
              className={`badge bg-${variant} d-flex align-items-center justify-content-center me-2`} 
              style={{ fontSize: '0.8rem', minWidth: '24px', height: '24px' }}
              title={type === 'structure' ? 'Structure' : 'Personne'}
            >
              <i className={icon}></i>
            </span>
            <div className="d-flex align-items-center flex-nowrap">
              <span className="fw-bold text-truncate" style={{ maxWidth: '140px' }}>
                {item.displayName || 'Sans nom'}
              </span>
              {qualification && (
                <>
                  <span className="mx-2 text-muted">•</span>
                  <small className="text-muted text-truncate" style={{ maxWidth: '100px' }} title={qualification}>
                    {qualification}
                  </small>
                </>
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
      width: '14%',
      render: (item) => {
        return (
          <div className="w-100 d-flex justify-content-start">
            {item.entityType === 'structure' ? (
              // Pour les structures, afficher le nombre de personnes associées
              (() => {
                const personnesCount = item.personnes?.filter(p => p.prenom && p.nom).length || 0;
                return personnesCount > 0 ? (
                  <span className={styles.linkedContactsBadge}>
                    <i className="bi bi-people me-1"></i>
                    {personnesCount}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                );
              })()
            ) : (
              // Pour les personnes, afficher la structure associée si applicable
              item._structureName ? (
                <span className={`${styles.linkedStructureBadge} text-truncate`} style={{ maxWidth: '100%' }} title={item._structureName}>
                  <i className="bi bi-building me-1"></i>
                  {item._structureName}
                </span>
              ) : (
                <span className="text-muted">-</span>
              )
            )}
          </div>
        );
      },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '16%',
      render: (item) => {
        const email = item.email?.trim();
        return (
          <div className="w-100">
            {email ? (
              <a href={`mailto:${email}`} className="text-decoration-none" title={email}>
                <span className="text-truncate d-block">{email}</span>
              </a>
            ) : (
              <span className="text-muted">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: true,
      width: '10%',
      render: (item) => {
        const tel = item.telephone;
        return (
          <div className="w-100">
            {tel ? (
              <a href={`tel:${tel}`} className="text-decoration-none">
                <span className="text-truncate d-block">{tel}</span>
              </a>
            ) : (
              <span className="text-muted">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'codePostal',
      label: 'CP',
      sortable: true,
      width: '6%',
      render: (item) => {
        let cp = '';
        if (item.entityType === 'structure') {
          cp = item.structure?.codePostal || '';
        } else {
          // Pour les personnes, essayer d'extraire depuis les données directement
          cp = item.codePostal || '';
        }
        return cp ? (
          <span className="small">{cp}</span>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      id: 'ville',
      label: 'Ville',
      sortable: true,
      width: '10%',
      render: (item) => {
        let ville = '';
        if (item.entityType === 'structure') {
          ville = item.structure?.ville || '';
        } else {
          // Pour les personnes, essayer d'extraire depuis les données directement
          ville = item.ville || '';
        }
        return (
          <div className="w-100">
            {ville ? (
              <span className="small text-truncate d-block">{ville}</span>
            ) : (
              <span className="text-muted">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'pays',
      label: 'Pays',
      sortable: true,
      width: '6%',
      render: (item) => {
        let pays = '';
        if (item.entityType === 'structure') {
          pays = item.structure?.pays || '';
        } else {
          // Pour les personnes, essayer d'extraire depuis les données directement
          pays = item.pays || '';
        }
        return pays ? (
          <span className="small">{pays === 'France' ? 'FR' : pays}</span>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    }
  ];

  // Statistiques pour l'affichage unifié
  const getStatistics = (items) => {
    const total = items.length;
    const structures = items.filter(item => item.entityType === 'structure').length;
    const personnes = items.filter(item => item.entityType === 'personne').length;
    const personnesLibres = items.filter(item => item._isPersonLibre).length;
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
        subtext: `${personnesEnStructure} liées + ${personnesLibres} libres`
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
            handleDeleteContact(contactId);
          }}
          title="Supprimer"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    );
  };

  // Filtres avancés pour l'affichage unifié
  const getFilterOptions = () => [
    { value: 'all', label: 'Tous', icon: 'bi-list' },
    { value: 'structures', label: 'Structures', icon: 'bi-building' },
    { value: 'personnes', label: 'Personnes', icon: 'bi-person' },
    { value: 'personnes_libres', label: 'Personnes libres', icon: 'bi-person-dash' },
    { value: 'avec_email', label: 'Avec email', icon: 'bi-envelope' },
    { value: 'avec_telephone', label: 'Avec téléphone', icon: 'bi-telephone' }
  ];

  // Logique de filtrage unifié
  const filterData = (items, filterValue, searchQuery) => {
    let filtered = items;

    // Filtrage par type
    switch (filterValue) {
      case 'structures':
        filtered = filtered.filter(item => item.entityType === 'structure');
        break;
      case 'personnes':
        filtered = filtered.filter(item => item.entityType === 'personne');
        break;
      case 'personnes_libres':
        filtered = filtered.filter(item => item._isPersonLibre);
        break;
      case 'avec_email':
        filtered = filtered.filter(item => item.email);
        break;
      case 'avec_telephone':
        filtered = filtered.filter(item => item.telephone);
        break;
      default:
        // 'all' ou autres valeurs - pas de filtrage supplémentaire
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
        item.subtext?.toLowerCase().includes(query)
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
        <p className="mt-2">Chargement des contacts unifiés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Erreur de chargement</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={refreshData}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="contacts-list-unified">
      <ListWithFilters
        initialData={unifiedContacts}
        loading={loading}
        error={error}
        onRefresh={refreshData}
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
        refreshKey={refreshKey}
        showStats={true}
        title="Contacts Unifiés"
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