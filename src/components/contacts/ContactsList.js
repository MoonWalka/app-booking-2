// src/components/contacts/ContactsListUnified.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { useDeleteContact } from '@/hooks/contacts';

/**
 * Liste unifiée des contacts utilisant la collection contacts_unified
 * Architecture Business-centrée avec affichage structures + personnes
 * Compatible avec import/export XLS naturel
 */
function ContactsList({ filterType = 'all' }) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { openContactTab } = useTabs();
  const [unifiedContacts, setUnifiedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback après suppression
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContact(onDeleteSuccess);

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
              email: doc.structure?.email || '',
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
                  email: personne.email || personne.mailDirect || '',
                  telephone: personne.telephone || personne.telDirect || personne.mobile || '',
                  subtext: structureDisplayName,
                  _sourceCollection: 'contacts_unified',
                  _isPersonInStructure: true,
                  _structureName: structureDisplayName,
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
              email: personne?.email || '',
              telephone: personne?.telephone || personne?.mobile || '',
              subtext: 'Personne libre',
              _sourceCollection: 'contacts_unified',
              _isPersonLibre: true,
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
          variant = item._isPersonLibre ? 'warning' : 'primary';
        }
        
        return (
          <span 
            className={`badge bg-${variant} d-flex align-items-center justify-content-center`} 
            style={{ fontSize: '1rem', minWidth: '32px', height: '28px' }}
            title={type === 'structure' ? 'Structure' : (item._isPersonLibre ? 'Personne libre' : 'Personne')}
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
      render: (item) => (
        <div>
          <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
            {item.displayName || 'Sans nom'}
          </div>
          {item.subtext && (
            <small className="text-muted">{item.subtext}</small>
          )}
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Détails',
      sortable: false,
      width: '20%',
      render: (item) => {
        if (item.entityType === 'structure') {
          // Afficher SIRET ou type pour structure
          const siret = item.structure?.siret;
          const type = item.structure?.type;
          return (
            <div>
              {siret && <div className="small text-truncate">SIRET: {siret}</div>}
              {type && <div className="small text-muted">{type}</div>}
            </div>
          );
        } else {
          // Afficher fonction pour personne
          const fonction = item._isPersonInStructure 
            ? item.personnes?.[item._personneIndex]?.fonction
            : item.personne?.fonction;
          return fonction ? (
            <div className="small text-muted">{fonction}</div>
          ) : null;
        }
      },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '25%',
      render: (item) => {
        const email = item.email;
        return email ? (
          <a href={`mailto:${email}`} className="text-decoration-none text-truncate d-block" style={{ maxWidth: '200px' }}>
            {email}
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
            {tel}
          </a>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Créé le',
      field: 'createdAt',
      sortable: true,
      width: '12%',
      render: (item) => {
        const date = item.createdAt;
        if (!date) return <span className="text-muted">-</span>;
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return (
          <span className="small text-muted">
            {dateObj.toLocaleDateString('fr-FR')}
          </span>
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
      <ActionButtons
        onView={() => openContactTab(contactId, item.displayName, viewType)}
        onEdit={() => navigate(`/contacts/${contactId}/edit`)}
        onDelete={() => handleDeleteContact(contactId)}
      />
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
        filterOptions={getFilterOptions()}
        filterData={filterData}
        searchPlaceholder="Rechercher dans structures et personnes..."
        emptyStateMessage="Aucun contact trouvé"
        emptyStateIcon="bi-people"
        refreshKey={refreshKey}
        showStats={true}
        title="Contacts Unifiés"
      />
    </div>
  );
}

export default ContactsList;