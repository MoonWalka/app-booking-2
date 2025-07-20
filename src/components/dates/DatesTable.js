// src/components/dates/DatesTable.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useEntreprise } from '@/context/EntrepriseContext';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import ListWithFilters from '@/components/ui/ListWithFilters';

/**
 * Dérive un code collaborateur à partir du nom de structure
 */
const deriveCollaboratorCode = (structureName) => {
  if (!structureName) return '-';
  
  // Extraire les initiales ou utiliser des codes connus
  const knownCodes = {
    'TourCraft': 'TC',
    'MusicCorp': 'MC',
    'Production Live': 'PL'
  };
  
  if (knownCodes[structureName]) {
    return knownCodes[structureName];
  }
  
  // Générer des initiales à partir du nom
  return structureName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
};

/**
 * Composant générique pour afficher les dates selon différentes configurations
 * Supporte les 3 vues : Tableau de bord, Liste des dates, Publication
 */
function DatesTable({
  config,
  userRole = 'viewer',
  onRowClick,
  onAction,
  headerActions,
  className
}) {
  const { currentEntreprise } = useEntreprise();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    if (!currentEntreprise?.id) {
      setLoading(false);
      return;
    }
      
    try {
        setLoading(true);
        setError(null);
        
        // Charger les dates depuis Firebase
        const datesQuery = query(
          collection(db, 'dates'),
          where('entrepriseId', '==', currentEntreprise.id),
          orderBy(config.sort?.field || 'date', config.sort?.direction || 'desc')
        );
        
        const datesSnapshot = await getDocs(datesQuery);
        
        // Charger les structures pour avoir les noms à jour
        const structureIds = [...new Set(datesSnapshot.docs.map(doc => doc.data().structureId).filter(id => id))];
        const structureNames = {};
        
        // Charger les noms de structures en parallèle
        if (structureIds.length > 0) {
          await Promise.all(structureIds.map(async (structureId) => {
            try {
              const structureDoc = await getDoc(doc(db, 'structures', structureId));
              if (structureDoc.exists()) {
                const structureData = structureDoc.data();
                structureNames[structureId] = structureData.raisonSociale || structureData.nom || 'Structure inconnue';
              }
            } catch (err) {
              console.warn(`Erreur lors du chargement de la structure ${structureId}:`, err);
            }
          }));
        }
        
        const datesData = datesSnapshot.docs.map(doc => {
          const date = { id: doc.id, ...doc.data() };
          
          // Debug temporaire
          console.log('[DatesTable] Date:', {
            id: doc.id,
            structureId: date.structureId,
            structureNom: date.structureNom,
            structureFromFirebase: structureNames[date.structureId]
          });
          
          // Toujours utiliser le nom dynamique de la structure
          // Pour les anciennes dates, on a le fallback sur date.structureNom
          const dynamicStructureName = date.structureId && structureNames[date.structureId] 
            ? structureNames[date.structureId] 
            : (date.structureNom || 'Structure inconnue'); // Fallback pour anciennes dates
          
          // Transformer les données Firebase pour correspondre aux configurations
          return {
            ...date,
            // Mapping Firebase → Configurations
            entreprise: dynamicStructureName || '-',
            artiste: date.artisteNom || date.titre || '-',
            lieu: date.lieuNom || '-',
            ville: date.lieuVille || '-', 
            organisateur: dynamicStructureName || date.contactNom || '-',
            dateDebut: date.date,
            dateFin: date.dateFin,
            salle: date.lieuNom || '-',
            codePostal: date.lieuCodePostal || '-',
            nbRepresentations: date.nbDates || 1,
            libelle: date.titre || '-',
            niv: date.niveau || '1',
            // Champs dérivés ou par défaut
            coll: deriveCollaboratorCode(dynamicStructureName),
            type: date.type || 'date',
            isPublic: date.isPublic || false,
            communicationStatus: date.communicationStatus || 'pending',
            projet: date.projet || date.formule || '-',
            dossier: date.dossier || '-',
            priseOption: date.priseOption || date.datePriseOption,
            contratPropose: date.contratPropose
          };
        });
        
        setData(datesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
        // Fallback sur les données de test en cas d'erreur
        setData(config.testData || []);
      } finally {
        setLoading(false);
      }
  }, [currentEntreprise?.id, config.sort, config.testData]);
    
  // Charger les données au montage et quand les dépendances changent
  useEffect(() => {
    loadData();
  }, [loadData]);
    
    // Écouter les événements de modification de structure
    useEffect(() => {
      const handleStructureModified = (event) => {
        console.log('[DatesTable] Structure modifiée, rechargement des données');
        loadData(); // Recharger pour avoir les noms à jour
      };
      
      // Écouter l'événement global
      window.addEventListener('structureModified', handleStructureModified);
      
      return () => {
        window.removeEventListener('structureModified', handleStructureModified);
      };
    }, [currentEntreprise?.id]);
  // Filtrer les colonnes selon le rôle utilisateur
  const getVisibleColumns = () => {
    if (!config.columns) return [];
    
    return config.columns.filter(column => {
      // Si la colonne a une restriction de rôle
      if (column.roles && Array.isArray(column.roles)) {
        return column.roles.includes(userRole);
      }
      // Si pas de restriction, la colonne est visible pour tous
      return true;
    });
  };

  // Filtrer les données selon la configuration
  const filterData = (data) => {
    if (!config.dataFilter) return data;
    return data.filter(config.dataFilter);
  };

  // Gérer les actions personnalisées
  const renderActions = (item) => {
    if (!config.actions || !onAction) return null;

    return (
      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
        {config.actions.map((action) => {
          // Vérifier si l'action est autorisée pour ce rôle
          if (action.roles && !action.roles.includes(userRole)) {
            return null;
          }

          // Vérifier si l'action est conditionnelle
          if (action.condition && !action.condition(item)) {
            return null;
          }

          return (
            <button
              key={action.id}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: action.color || '#007bff',
                color: 'white',
                fontSize: '12px',
                opacity: action.disabled ? 0.6 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAction(action.id, item);
              }}
              title={action.tooltip}
              disabled={action.disabled}
            >
              {action.icon && <i className={action.icon}></i>}
              {action.label && ` ${action.label}`}
            </button>
          );
        })}
      </div>
    );
  };

  // Gérer le clic sur une ligne
  const handleRowClick = (item) => {
    if (config.allowRowClick && onRowClick) {
      onRowClick(item);
    }
  };

  // Calculer les statistiques si configuré
  const calculateStats = (items) => {
    if (!config.stats) return [];
    
    return config.stats.map(statConfig => {
      let value = 0;
      let subtext = '';

      if (statConfig.calculate) {
        const result = statConfig.calculate(items);
        value = result.value || 0;
        subtext = result.subtext || '';
      } else if (statConfig.field) {
        value = items.filter(item => item[statConfig.field]).length;
      } else {
        value = items.length;
      }

      return {
        id: statConfig.id,
        label: statConfig.label,
        value: value,
        icon: statConfig.icon,
        variant: statConfig.variant || 'primary',
        subtext: subtext
      };
    });
  };

  const visibleColumns = getVisibleColumns();

  return (
    <div className={className}>
      <ListWithFilters
        entityType={config.entityType || 'dates'}
        title={config.title}
        columns={visibleColumns}
        filterOptions={config.filterOptions || []}
        sort={config.sort || { field: 'createdAt', direction: 'desc' }}
        actions={headerActions}
        onRowClick={config.allowRowClick ? handleRowClick : undefined}
        renderActions={config.actions ? renderActions : undefined}
        pageSize={config.pageSize || 20}
        showRefresh={config.showRefresh !== false}
        showStats={config.showStats === true}
        calculateStats={config.stats ? calculateStats : undefined}
        showAdvancedFilters={config.showAdvancedFilters === true}
        advancedFilterOptions={config.advancedFilterOptions || []}
        initialData={data}
        loading={loading}
        error={error}
        dataFilter={filterData}
        onRefresh={loadData}
      />
    </div>
  );
}

DatesTable.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    actions: PropTypes.array,
    filterOptions: PropTypes.array,
    advancedFilterOptions: PropTypes.array,
    sort: PropTypes.object,
    pageSize: PropTypes.number,
    showRefresh: PropTypes.bool,
    showStats: PropTypes.bool,
    showAdvancedFilters: PropTypes.bool,
    allowRowClick: PropTypes.bool,
    entityType: PropTypes.string,
    stats: PropTypes.array,
    dataFilter: PropTypes.func,
    testData: PropTypes.array
  }).isRequired,
  userRole: PropTypes.string,
  onRowClick: PropTypes.func,
  onAction: PropTypes.func,
  headerActions: PropTypes.node,
  className: PropTypes.string
};

export default DatesTable;