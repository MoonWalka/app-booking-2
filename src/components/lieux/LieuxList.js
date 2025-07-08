// src/components/lieux/LieuxList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import AddButton from '@/components/ui/AddButton';
import { useLieuDelete } from '@/hooks/lieux';

/**
 * Liste unifiée des lieux utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 * Note: La version mobile précédente (390 lignes) était fonctionnelle mais complexe
 * Cette version unifiée simplifie l'architecture tout en conservant les fonctionnalités
 */
function LieuxList() {
  const navigate = useNavigate();
  const { currentEntreprise } = useEntreprise();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDeleteLieu } = useLieuDelete(onDeleteSuccess);

  // Chargement des données des lieux
  useEffect(() => {
    if (!currentEntreprise?.id) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'lieux'),
      where('entrepriseId', '==', currentEntreprise.id)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur chargement lieux:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentEntreprise?.id, refreshKey]);

  // Fonction de rafraîchissement
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fonction de calcul des statistiques pour les lieux
  const calculateStats = (items) => {
    const total = items.length;
    
    // Compter les lieux avec des concerts (approximation basée sur les données disponibles)
    const avecDates = items.filter(lieu => 
      lieu.concertsCount > 0 || lieu.lastDateDate || lieu.totalDates
    ).length;
    
    // Répartition par type
    const typeCount = items.reduce((acc, lieu) => {
      const type = lieu.type || 'non_defini';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const typePopulaire = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
    
    // Statut démarchage (basé sur des champs potentiels)
    const demarches = items.filter(lieu => 
      lieu.statut === 'contacte' || 
      lieu.dateContact || 
      lieu.formulaireEnvoye || 
      lieu.statut === 'en_cours' ||
      lieu.statut === 'valide'
    ).length;
    
    return [
      {
        id: 'total',
        label: 'Total Lieux',
        value: total,
        icon: 'bi bi-geo-alt',
        variant: 'primary'
      },
      {
        id: 'avec_concerts',
        label: 'Avec concerts',
        value: avecDates,
        icon: 'bi bi-music-note-beamed',
        variant: 'success',
        subtext: `${Math.round((avecDates / total) * 100) || 0}%`
      },
      {
        id: 'type_populaire',
        label: 'Type principal',
        value: typePopulaire ? typePopulaire[0] : 'N/A',
        icon: 'bi bi-building',
        variant: 'info',
        subtext: typePopulaire ? `${typePopulaire[1]} lieux` : ''
      },
      {
        id: 'demarches',
        label: 'Démarchés',
        value: demarches,
        icon: 'bi bi-envelope-check',
        variant: 'warning',
        subtext: `${Math.round((demarches / total) * 100) || 0}%`
      }
    ];
  };

  // Configuration des colonnes pour les lieux
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '30%',
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      sortable: true,
      width: '20%',
    },
    {
      id: 'adresse',
      label: 'Adresse',
      field: 'adresse',
      sortable: false,
      width: '25%',
      render: (lieu) => {
        if (!lieu.adresse) return '-';
        return lieu.adresse.length > 50 ? 
          `${lieu.adresse.substring(0, 50)}...` : 
          lieu.adresse;
      },
    },
    {
      id: 'capacite',
      label: 'Capacité',
      field: 'capacite',
      sortable: true,
      width: '15%',
      render: (lieu) => lieu.capacite ? `${lieu.capacite} pers.` : '-',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      sortable: true,
      width: '10%',
      render: (lieu) => {
        const types = {
          salle: 'Salle',
          festival: 'Festival',
          club: 'Club',
          plein_air: 'Plein air',
          autre: 'Autre',
        };
        return types[lieu.type] || lieu.type || '-';
      },
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou ville...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'salle', label: 'Salle' },
        { value: 'festival', label: 'Festival' },
        { value: 'club', label: 'Club' },
        { value: 'plein_air', label: 'Plein air' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];

  // Actions sur les lignes
  const renderActions = (lieu) => (
    <ActionButtons
      onView={() => navigate(`/lieux/${lieu.id}`)}
      onEdit={() => navigate(`/lieux/${lieu.id}/edit`)}
      onDelete={() => handleDeleteLieu(lieu.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/lieux/nouveau')}
      label="Nouveau lieu"
    />
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (lieu) => {
    navigate(`/lieux/${lieu.id}`);
  };

  return (
    <ListWithFilters
      key={refreshKey}
      entityType="lieux"
      title="Gestion des Lieux"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'nom', direction: 'asc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={renderActions}
      pageSize={20}
      showRefresh={true}
      showStats={true}
      calculateStats={calculateStats}
      // Données et état depuis le chargement local
      initialData={lieux}
      loading={loading}
      error={error}
      onRefresh={refreshData}
    />
  );
}

export default LieuxList;
