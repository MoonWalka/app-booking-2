// src/components/concerts/PublicationsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/context/OrganizationContext';
import { collection, getDocs, query, where, orderBy } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import ListWithFilters from '@/components/ui/ListWithFilters';
import AddButton from '@/components/ui/AddButton';

/**
 * Liste des publications - Vue diffusion externe
 * Objectif : Valider et diffuser les dates annoncées au public
 * Utilisateurs : Communication / Presse / Web
 * Actions : Basculer visibilité publique, exporter, pousser vers réseaux
 */
function PublicationsList() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentOrg?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Même requête que TableauDeBordPage pour éviter les problèmes d'index
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', currentOrg.id),
          orderBy('date', 'desc') // Même ordre que TableauDeBordPage
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = concertsSnapshot.docs.map(doc => {
          const concert = { id: doc.id, ...doc.data() };
          
          // Mapping pour les colonnes de publication (sans montants)
          return {
            ...concert,
            artiste: concert.artisteNom || concert.titre || '-',
            projet: concert.projet || concert.formule || '-',
            libelle: concert.titre || '-',
            salle: concert.lieuNom || '-',
            ville: concert.lieuVille || '-',
            codePostal: concert.lieuCodePostal || '-',
            niv: concert.niveau || '1',
            coll: deriveCollaboratorCode(concert.structureNom),
            type: concert.type || 'concert',
            nbRepresentations: concert.nbDates || 1,
            isPublic: concert.isPublic || false,
            communicationStatus: concert.communicationStatus || 'pending'
          };
        });
        
        // Filtrer les dates annulées
        const publishableData = concertsData.filter(item => item.statut !== 'annule');
        
        setData(publishableData);
      } catch (err) {
        console.error('Erreur lors du chargement des publications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentOrg?.id]);

  // Helper pour dériver le code collaborateur
  const deriveCollaboratorCode = (structureName) => {
    if (!structureName) return '-';
    
    const knownCodes = {
      'TourCraft': 'TC',
      'MusicCorp': 'MC',
      'Production Live': 'PL'
    };
    
    if (knownCodes[structureName]) {
      return knownCodes[structureName];
    }
    
    return structureName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
  };

  // Configuration des colonnes pour publication (sans montants financiers)
  const columns = [
    {
      id: 'public',
      label: 'Public',
      field: 'isPublic',
      sortable: true,
      width: '6%',
      render: (item) => (
        <span style={{ 
          fontSize: '16px', 
          color: item.isPublic ? '#28a745' : '#6c757d' 
        }}>
          {item.isPublic ? '✓' : '✗'}
        </span>
      ),
    },
    {
      id: 'comm',
      label: 'Comm',
      field: 'communicationStatus',
      sortable: true,
      width: '6%',
      render: (item) => {
        const status = item.communicationStatus || 'pending';
        const colors = {
          'approved': '#28a745',
          'pending': '#ffc107', 
          'rejected': '#dc3545'
        };
        return (
          <span style={{ 
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors[status] || '#6c757d',
            display: 'inline-block'
          }} title={status} />
        );
      },
    },
    {
      id: 'coll',
      label: 'Coll.',
      field: 'coll',
      sortable: true,
      width: '5%',
      render: (item) => item.coll || '-',
    },
    {
      id: 'niv',
      label: 'Niv.',
      field: 'niv',
      sortable: true,
      width: '5%',
      render: (item) => item.niv || '-',
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artiste',
      sortable: true,
      width: '15%',
      render: (item) => item.artiste?.nom || item.artisteNom || '-',
    },
    {
      id: 'projet',
      label: 'Projet',
      field: 'projet',
      sortable: true,
      width: '12%',
      render: (item) => item.projet || '-',
    },
    {
      id: 'dateDebut',
      label: 'Début',
      field: 'date',
      sortable: true,
      width: '8%',
      render: (item) => {
        if (!item.date) return '-';
        const date = new Date(item.date);
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'libelle',
      label: 'Libellé',
      field: 'libelle',
      sortable: true,
      width: '15%',
      render: (item) => item.libelle || '-',
    },
    {
      id: 'salle',
      label: 'Salle',
      field: 'salle',
      sortable: true,
      width: '10%',
      render: (item) => item.salle || '-',
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      sortable: true,
      width: '8%',
      render: (item) => item.ville || '-',
    },
    {
      id: 'codePostal',
      label: 'CP',
      field: 'codePostal',
      sortable: true,
      width: '5%',
      render: (item) => item.codePostal || '-',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      sortable: true,
      width: '8%',
      render: (item) => item.type || '-',
    },
    {
      id: 'nbRepresentations',
      label: 'Nb. représentations',
      field: 'nbRepresentations',
      sortable: true,
      width: '7%',
      render: (item) => item.nbRepresentations || '1',
    }
  ];

  // Actions pour chaque ligne
  const renderActions = (item) => {
    const handleTogglePublic = (e) => {
      e.stopPropagation();
      console.log('Basculer visibilité publique pour:', item);
      // TODO: Implémenter la bascule de visibilité
    };

    const handleExport = (e) => {
      e.stopPropagation();
      console.log('Exporter pour diffusion:', item);
      // TODO: Implémenter l'export
    };

    const handlePushToSocial = (e) => {
      e.stopPropagation();
      console.log('Pousser vers réseaux sociaux:', item);
      // TODO: Implémenter le push réseaux sociaux
    };

    return (
      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
        <button 
          style={{
            padding: '4px 8px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            fontSize: '12px'
          }}
          onClick={handleTogglePublic}
          title="Basculer visibilité publique"
        >
          <i className="bi-eye"></i>
        </button>
        
        {item.isPublic && (
          <>
            <button 
              style={{
                padding: '4px 8px',
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#17a2b8',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={handleExport}
              title="Exporter pour diffusion"
            >
              <i className="bi-download"></i>
            </button>
            
            {item.communicationStatus === 'approved' && (
              <button 
                style={{
                  padding: '4px 8px',
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#e83e8c',
                  color: 'white',
                  fontSize: '12px'
                }}
                onClick={handlePushToSocial}
                title="Pousser vers réseaux sociaux"
              >
                <i className="bi-share"></i>
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/publications/nouveau')}
      label="Nouvelle publication"
    />
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (item) => {
    const title = item.libelle || item.projet || `Publication ${item.id}`;
    console.log('Ouvrir publication:', title);
  };

  // Calculer les statistiques
  const calculateStats = (items) => {
    const total = items.length;
    const publicCount = items.filter(item => item.isPublic).length;
    const approvedCount = items.filter(item => item.communicationStatus === 'approved').length;
    const pendingCount = items.filter(item => !item.isPublic || item.communicationStatus === 'pending').length;

    return [
      {
        id: 'total',
        label: 'Total dates',
        value: total,
        icon: 'bi bi-calendar-event',
        variant: 'primary'
      },
      {
        id: 'public',
        label: 'Publiques',
        value: publicCount,
        icon: 'bi bi-eye',
        variant: 'success',
        subtext: `${Math.round((publicCount / total) * 100) || 0}%`
      },
      {
        id: 'approved',
        label: 'Validées comm',
        value: approvedCount,
        icon: 'bi bi-check-circle',
        variant: 'info',
        subtext: `${Math.round((approvedCount / total) * 100) || 0}%`
      },
      {
        id: 'pending',
        label: 'En attente',
        value: pendingCount,
        icon: 'bi bi-clock',
        variant: 'warning'
      }
    ];
  };

  // Filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'artiste',
      type: 'text',
      placeholder: 'Artiste, lieu, libellé...',
    },
    {
      id: 'publicationStatus',
      label: 'Statut publication',
      field: 'isPublic',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'true', label: '✓ Publique' },
        { value: 'false', label: '✗ Privée' }
      ]
    },
    {
      id: 'communicationStatus',
      label: 'Validation comm',
      field: 'communicationStatus',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'approved', label: '🟢 Approuvé' },
        { value: 'pending', label: '🟡 En attente' },
        { value: 'rejected', label: '🔴 Refusé' }
      ]
    }
  ];

  return (
    <ListWithFilters
      entityType="publications"
      title="Publications"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'date', direction: 'asc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={renderActions}
      pageSize={20}
      showRefresh={true}
      showStats={true}
      calculateStats={calculateStats}
      showAdvancedFilters={true}
      initialData={data}
      loading={loading}
      error={error}
    />
  );
}

export default PublicationsList;