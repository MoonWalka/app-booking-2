// src/components/concerts/DatesList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import { useOrganization } from '@/context/OrganizationContext';
import { collection, getDocs, query, where, orderBy } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import ListWithFilters from '@/components/ui/ListWithFilters';
import AddButton from '@/components/ui/AddButton';

/**
 * Liste des dates - Vue répertoire universel
 * Objectif : Accès universel pour recherche rapide
 * Utilisateurs : Tous rôles internes
 * Actions : Point d'entrée vers autres vues
 */
function DatesList() {
  const navigate = useNavigate();
  const { openConcertTab } = useTabs();
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
          
          // Mapping simple pour les colonnes affichées
          return {
            ...concert,
            entreprise: concert.structureNom || '-',
            artiste: concert.artisteNom || concert.titre || '-',
            lieu: concert.lieuNom || '-',
            ville: concert.lieuVille || '-',
            organisateur: concert.contactNom || '-',
            projet: concert.projet || concert.formule || '-',
            dossier: concert.dossier || '-',
            niv: concert.niveau || '1',
            coll: deriveCollaboratorCode(concert.structureNom)
          };
        });
        
        setData(concertsData);
      } catch (err) {
        console.error('Erreur lors du chargement des dates:', err);
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

  // Configuration des colonnes
  const columns = [
    {
      id: 'entreprise',
      label: 'Entreprise',
      field: 'entreprise',
      sortable: true,
      width: '8%',
      render: (item) => item.entreprise || '-',
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
      render: (item) => item.artiste || '-',
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
      id: 'lieu',
      label: 'Lieu',
      field: 'lieu',
      sortable: true,
      width: '12%',
      render: (item) => item.lieu || '-',
    },
    {
      id: 'organisateur',
      label: 'Organisateur',
      field: 'organisateur',
      sortable: true,
      width: '10%',
      render: (item) => item.organisateur || '-',
    },
    {
      id: 'dossier',
      label: 'Dossier',
      field: 'dossier',
      sortable: true,
      width: '8%',
      render: (item) => item.dossier || '-',
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
      id: 'dateFin',
      label: 'Fin',
      field: 'dateFin',
      sortable: true,
      width: '8%',
      render: (item) => {
        if (!item.dateFin) return '-';
        const date = new Date(item.dateFin);
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'montant',
      label: 'Montant',
      field: 'montant',
      sortable: true,
      width: '9%',
      render: (item) => {
        if (!item.montant) return '-';
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR' 
        }).format(item.montant);
      },
    }
  ];

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/concerts/nouveau')}
      label="Nouvelle date"
    />
  );

  // Gestion du clic sur une ligne - point d'entrée vers autres vues
  const handleRowClick = (item) => {
    const title = item.projet || `Date du ${item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}`;
    openConcertTab(item.id, title);
  };

  // Filtres pour recherche rapide
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'artiste',
      type: 'text',
      placeholder: 'Artiste, lieu, projet...',
    },
    {
      id: 'periode',
      label: 'Période',
      field: 'periode',
      type: 'select',
      placeholder: 'Toutes les périodes',
      options: [
        { value: 'past', label: 'Passées' },
        { value: 'current', label: 'En cours' },
        { value: 'upcoming', label: 'À venir' },
        { value: 'thismonth', label: 'Ce mois' },
        { value: 'nextmonth', label: 'Mois prochain' }
      ]
    }
  ];

  return (
    <ListWithFilters
      entityType="dates"
      title="Liste des dates"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'date', direction: 'desc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={null} // Pas d'actions directes
      pageSize={50}
      showRefresh={true}
      showStats={false}
      showAdvancedFilters={true}
      initialData={data}
      loading={loading}
      error={error}
    />
  );
}

export default DatesList;