import React, { useState, useMemo } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { GENRES_HIERARCHY } from '@/config/tagsHierarchy';
import styles from './FestivalsTableView.module.css';

/**
 * Composant pour afficher un tableau des festivals
 */
const FestivalsTableView = ({ 
  festivals = [], 
  onEdit,
  onDelete,
  loading = false 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deletingId, setDeletingId] = useState(null);

  // Fonction pour obtenir le label d'un genre à partir de son ID
  const getGenreLabel = (genreId) => {
    const findGenre = (items) => {
      for (const item of items) {
        if (item.id === genreId) return item.label;
        if (item.children) {
          const found = findGenre(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findGenre(GENRES_HIERARCHY) || genreId;
  };

  // Fonction pour formater les genres
  const formatGenres = (genreIds = []) => {
    if (!genreIds.length) return '-';
    const labels = genreIds.map(id => getGenreLabel(id));
    if (labels.length <= 2) return labels.join(', ');
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
  };

  // Fonction pour extraire le mois principal de diffusion
  const getPeriodePrincipale = (semainesDiffusion = []) => {
    if (!semainesDiffusion.length) return '-';
    
    // Compter les semaines par mois
    const moisCount = {};
    semainesDiffusion.forEach(weekId => {
      const [monthIndex] = weekId.split('-');
      moisCount[monthIndex] = (moisCount[monthIndex] || 0) + 1;
    });

    // Trouver le mois avec le plus de semaines
    const moisPrincipal = Object.entries(moisCount).reduce((max, [mois, count]) => 
      count > (max.count || 0) ? { mois, count } : max
    , {});

    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    return moisPrincipal.mois ? moisNoms[parseInt(moisPrincipal.mois)] : '-';
  };

  // Fonction de tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Données triées
  const sortedFestivals = useMemo(() => {
    if (!sortConfig.key) return festivals;

    return [...festivals].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Gestion spéciale pour certaines colonnes
      if (sortConfig.key === 'periodePrincipale') {
        aValue = getPeriodePrincipale(a.semainesDiffusion);
        bValue = getPeriodePrincipale(b.semainesDiffusion);
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [festivals, sortConfig]);

  // Fonction pour supprimer un festival
  const handleDelete = async (festival) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le festival "${festival.titre}" ?`)) {
      return;
    }

    setDeletingId(festival.id);
    try {
      await deleteDoc(doc(db, 'festivals', festival.id));
      toast.success('Festival supprimé avec succès');
      if (onDelete) onDelete(festival);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du festival');
    } finally {
      setDeletingId(null);
    }
  };

  // Icône de tri
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <i className="bi bi-chevron-expand text-muted ms-1" style={{ fontSize: '0.8rem' }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-chevron-up ms-1" />
      : <i className="bi bi-chevron-down ms-1" />;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!festivals.length) {
    return (
      <div className={styles.emptyMessage}>
        <i className="bi bi-calendar2-week" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
        <p>Aucun festival enregistré</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <Table responsive hover className={styles.festivalsTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('titre')} style={{ cursor: 'pointer' }}>
              Titre {getSortIcon('titre')}
            </th>
            <th onClick={() => handleSort('estActif')} style={{ cursor: 'pointer' }}>
              Est actif {getSortIcon('estActif')}
            </th>
            <th onClick={() => handleSort('programmateurId')} style={{ cursor: 'pointer' }}>
              Programmateur {getSortIcon('programmateurId')}
            </th>
            <th onClick={() => handleSort('periodePrincipale')} style={{ cursor: 'pointer' }}>
              Période {getSortIcon('periodePrincipale')}
            </th>
            <th onClick={() => handleSort('bouclage')} style={{ cursor: 'pointer' }}>
              Bouclage {getSortIcon('bouclage')}
            </th>
            <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
              Type {getSortIcon('type')}
            </th>
            <th>Genres</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedFestivals.map((festival) => (
            <tr key={festival.id}>
              <td className="fw-medium">{festival.titre || '-'}</td>
              <td>
                {festival.estActif ? (
                  <Badge bg="success">Oui</Badge>
                ) : (
                  <Badge bg="secondary">Non</Badge>
                )}
              </td>
              <td>{festival.programmateurNom || '-'}</td>
              <td>{getPeriodePrincipale(festival.semainesDiffusion)}</td>
              <td>{festival.bouclage ? festival.bouclage.charAt(0).toUpperCase() + festival.bouclage.slice(1) : '-'}</td>
              <td>
                <Badge bg="info">
                  {festival.type === 'saison' ? 'Saison' : 'Festival'}
                </Badge>
              </td>
              <td>
                <span className={styles.genresCell} title={festival.genres?.map(g => getGenreLabel(g)).join(', ')}>
                  {formatGenres(festival.genres)}
                </span>
              </td>
              <td className="text-end">
                <Button
                  variant="link"
                  size="sm"
                  className="p-1 me-2"
                  onClick={() => onEdit && onEdit(festival)}
                  title="Modifier"
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="p-1 text-danger"
                  onClick={() => handleDelete(festival)}
                  disabled={deletingId === festival.id}
                  title="Supprimer"
                >
                  {deletingId === festival.id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-trash"></i>
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FestivalsTableView;