import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { toast } from 'react-toastify';
import styles from './FestivalsDatesPage.module.css';

const FestivalsDatesPage = () => {
  const { currentEntreprise } = useEntreprise();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFestivals, setSelectedFestivals] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Noms des mois
  const months = ['JAN.', 'FÉV.', 'MARS', 'AVR.', 'MAI', 'JUIN', 
                  'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];

  // Charger tous les festivals de l'organisation
  useEffect(() => {
    if (!currentEntreprise?.id) {
      setLoading(false);
      return;
    }

    const festivalsQuery = query(
      collection(db, 'festivals'),
      where('organizationId', '==', currentEntreprise.id)
    );

    const unsubscribe = onSnapshot(
      festivalsQuery,
      (snapshot) => {
        const festivalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier par nom
        festivalsData.sort((a, b) => (a.titre || '').localeCompare(b.titre || ''));
        
        setFestivals(festivalsData);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur lors du chargement des festivals:', error);
        toast.error('Erreur lors du chargement des festivals');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentEntreprise?.id]);

  // Gestion de la sélection
  const handleSelectFestival = (festivalId) => {
    const newSelected = new Set(selectedFestivals);
    if (newSelected.has(festivalId)) {
      newSelected.delete(festivalId);
    } else {
      newSelected.add(festivalId);
    }
    setSelectedFestivals(newSelected);
    setSelectAll(newSelected.size === festivals.length && festivals.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFestivals(new Set());
    } else {
      setSelectedFestivals(new Set(festivals.map(f => f.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSaveSelection = () => {
    if (selectedFestivals.size === 0) {
      toast.warning('Aucun festival sélectionné');
      return;
    }
    
    // TODO: Implémenter la sauvegarde de la sélection
    toast.info(`${selectedFestivals.size} festival(s) sélectionné(s)`);
  };

  // Vérifier si une semaine est active pour un festival
  const isWeekActive = (festival, monthIndex, weekIndex) => {
    const weekId = `${monthIndex}-${weekIndex}`;
    return festival.semainesDiffusion?.includes(weekId) || false;
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dates des festivals</h1>
        <Button 
          variant="primary" 
          onClick={handleSaveSelection}
          disabled={selectedFestivals.size === 0}
        >
          <i className="bi bi-save me-2"></i>
          Enregistrer dans une sélection ({selectedFestivals.size})
        </Button>
      </div>

      {festivals.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-calendar2-week" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <p className="mt-3">Aucun festival enregistré</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.festivalsTable}>
            <thead>
              <tr>
                <th className={styles.fixedColumn}>
                  <Form.Check
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="me-2"
                  />
                </th>
                <th className={styles.nameColumn}>Nom du festival</th>
                {months.map((month, index) => (
                  <th key={index} className={styles.monthColumn}>
                    <div className={styles.monthHeader}>{month}</div>
                    <div className={styles.weekHeaders}>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {festivals.map((festival) => (
                <tr key={festival.id}>
                  <td className={styles.fixedColumn}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedFestivals.has(festival.id)}
                      onChange={() => handleSelectFestival(festival.id)}
                    />
                  </td>
                  <td className={styles.nameColumn}>
                    <div className={styles.festivalName}>
                      {festival.titre || 'Sans nom'}
                      {!festival.estActif && (
                        <span className={styles.inactiveBadge}>Inactif</span>
                      )}
                    </div>
                  </td>
                  {months.map((_, monthIndex) => (
                    <td key={monthIndex} className={styles.monthColumn}>
                      <div className={styles.weekCells}>
                        {[0, 1, 2, 3].map((weekIndex) => (
                          <div
                            key={weekIndex}
                            className={`${styles.weekCell} ${
                              isWeekActive(festival, monthIndex, weekIndex) ? styles.active : ''
                            }`}
                            title={isWeekActive(festival, monthIndex, weekIndex) ? 
                              `${festival.titre} - ${months[monthIndex]} semaine ${weekIndex + 1}` : 
                              ''
                            }
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
};

export default FestivalsDatesPage;