import React, { memo, useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import DateStatusBadge from './DateStatusBadge';
import DateActions from './DateActions';
import NiveauDisplay from '../NiveauDisplay';
import { formatDateFr } from '@/utils/dateUtils';
import styles from './DatesTable.module.css';

// Utilisation du mémoïsation pour éviter des rendus inutiles
const DatesTable = memo(({ 
  dates = [],
  selectedIds = new Set(),
  onSelectionChange,
  getStatusDetails,
  hasForm,
  hasUnvalidatedForm,
  hasContract,
  getContractStatus,
  datesWithContracts,
  isDatePassed,
  handleViewDate,
  handleEditDate,
  handleDeleteDate,
  handleViewStructure,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract,
  getContractButtonVariant,
  getContractTooltip
}) => {
  // Gestion du tri local (par défaut sur la date, décroissant)
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Mesurer le temps de rendu du tableau
  useEffect(() => {
    console.time('⏱️ Rendu DatesTable');
    
    return () => {
      console.timeEnd('⏱️ Rendu DatesTable');
    };
  }, []);

  // Fonction de tri
  const sortedDates = [...dates].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'date') {
      valA = new Date(a.date);
      valB = new Date(b.date);
    } else if (sortField === 'lieuNom') {
      valA = a.lieu?.nom || a.lieuNom || '';
      valB = b.lieu?.nom || b.lieuNom || '';
    } else if (sortField === 'contactNom') {
      valA = a.contact?.nom || a.contactNom || '';
      valB = b.contact?.nom || b.contactNom || '';
    }
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Colonnes du tableau
  const columns = [
    {
      label: '',
      key: 'selection',
      sortable: false,
      width: '50px',
      render: (row) => onSelectionChange ? (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedIds);
            if (e.target.checked) {
              newSelected.add(row.id);
            } else {
              newSelected.delete(row.id);
            }
            onSelectionChange(newSelected);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : null
    },
    {
      label: 'Entreprise',
      key: 'entreprise',
      sortable: true,
      render: (row) => {
        // L'entreprise qui a booké est maintenant enrichie dans les données
        if (row.entreprise?.diminutif) {
          return row.entreprise.diminutif;
        } else if (row.entreprise?.code) {
          return row.entreprise.code;
        } else if (row.entreprise?.nom) {
          return row.entreprise.nom;
        }
        
        // Fallback sur les anciennes propriétés au cas où
        return row.entrepriseNom || '—';
      }
    },
    {
      label: 'Collaborateur',
      key: 'collaborateur',
      sortable: true,
      render: (row) => {
        console.log('DEBUG DatesTable - row complète:', row);
        console.log('DEBUG DatesTable - row.collaborateur:', row.collaborateur);
        console.log('DEBUG DatesTable - row.collaborateurId:', row.collaborateurId);
        console.log('DEBUG DatesTable - row.createdByName:', row.createdByName);
        console.log('DEBUG DatesTable - row.createdByEmail:', row.createdByEmail);
        console.log('DEBUG DatesTable - row.collaborateurNom:', row.collaborateurNom);
        
        // Le collaborateur est l'utilisateur qui a créé la date
        // Pour l'instant, on affiche les données si elles existent
        if (row.createdByName) return row.createdByName;
        if (row.createdByEmail) return row.createdByEmail;
        if (row.collaborateurNom) return row.collaborateurNom;
        if (row.collaborateur?.nom) return row.collaborateur.nom;
        
        // Si on a un ID créateur mais pas le nom
        if (row.createdBy) return `User ${row.createdBy.substring(0, 6)}...`;
        
        return '—';
      }
    },
    {
      label: 'Niveau',
      key: 'niveau',
      sortable: true,
      render: (row) => <NiveauDisplay niveau={row.niveau || 'incomplete'} />
    },
    {
      label: 'Artiste',
      key: 'artisteNom',
      sortable: true,
      render: (row) => row.artisteNom || 'Non spécifié'
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (row) => row.formule || row.projet || row.projetNom || '—'
    },
    {
      label: 'Lieu',
      key: 'lieuNom',
      sortable: true,
      render: (row) => (
        <div>
          <span className={styles.locationName}>{row.libelle || row.titre || row.lieu?.nom || row.lieuNom || 'Non spécifié'}</span>
          {(row.lieu?.ville || row.lieuVille) && (
            <span className={styles.locationCity}>
              {row.lieu?.ville || row.lieuVille}
            </span>
          )}
        </div>
      )
    },
    {
      label: 'Organisateur',
      key: 'organisateur',
      sortable: true,
      render: (row) => row.organisateurNom || row.organisateur?.nom || row.structureNom || row.structure?.nom || '—'
    },
    {
      label: 'Dossier',
      key: 'dossier',
      sortable: true,
      render: (row) => row.dossier || row.numeroDossier || '—'
    },
    {
      label: "Prise d'option",
      key: 'priseOption',
      sortable: true,
      render: (row) => {
        if (!row.priseOption) return '—';
        const date = row.priseOption.toDate ? row.priseOption.toDate() : new Date(row.priseOption);
        return formatDateFr(date);
      }
    },
    {
      label: 'Contrat proposé',
      key: 'contrat',
      sortable: true,
      render: (row) => {
        const typeContrat = row.typeContrat || row.contratType || 'Aucun';
        return typeContrat;
      }
    },
    {
      label: 'Début',
      key: 'date',
      sortable: true,
      render: (row) => {
        if (!row.date) return '—';
        return formatDateFr(row.date);
      }
    },
    {
      label: 'Fin',
      key: 'dateFin',
      sortable: true,
      render: (row) => {
        if (!row.dateFin) return '—';
        return formatDateFr(row.dateFin);
      }
    },
    {
      label: 'Montant',
      key: 'montant',
      sortable: true,
      render: (row) => {
        const montant = row.montant || row.montantTotal || 0;
        return montant > 0 ? `${montant.toLocaleString('fr-FR')} €` : '—';
      }
    },
    {
      label: 'Nb. de dates',
      key: 'nbDates',
      sortable: true,
      render: (row) => row.nbDates || row.nombreDates || 1
    }
  ];

  // Gestion du tri
  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  // Actions par ligne
  const renderActions = (row) => (
    <DateActions
      date={row}
      hasForm={hasForm ? hasForm(row.id) : false}
      hasUnvalidatedForm={hasUnvalidatedForm ? hasUnvalidatedForm(row.id) : false}
      hasContract={hasContract ? hasContract(row.id) : false}
      contractStatus={getContractStatus ? getContractStatus(row.id) : null}
      contractData={datesWithContracts ? datesWithContracts[row.id] : null}
      getContractButtonVariant={getContractButtonVariant}
      getContractTooltip={getContractTooltip}
      handleViewDate={handleViewDate}
      handleEditDate={handleEditDate}
      handleDeleteDate={handleDeleteDate}
      handleViewStructure={handleViewStructure}
      handleSendForm={handleSendForm}
      handleViewForm={handleViewForm}
      handleGenerateContract={handleGenerateContract}
      handleViewContract={handleViewContract}
    />
  );

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        data={sortedDates}
        renderActions={renderActions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(row) => handleViewDate(row.id)}
      />
    </div>
  );
});

export default DatesTable;