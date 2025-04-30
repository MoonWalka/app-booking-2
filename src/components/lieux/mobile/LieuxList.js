import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseInit';
import { Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';
import styles from './LieuxList.module.css';
import Spinner from '@/components/common/Spinner';

const LieuxListMobile = () => {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLieux, setFilteredLieux] = useState([]);

  // Charger les lieux
  useEffect(() => {
    const fetchLieux = async () => {
      try {
        setLoading(true);
        const lieuxRef = collection(db, 'lieux');
        const q = query(lieuxRef, orderBy('nom', 'asc'));
        const querySnapshot = await getDocs(q);

        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLieux(lieuxData);
        setFilteredLieux(lieuxData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  // Filtrer les lieux en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm) {
      const filtered = lieux.filter(lieu => 
        lieu.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.codePostal?.includes(searchTerm)
      );
      setFilteredLieux(filtered);
    } else {
      setFilteredLieux(lieux);
    }
  }, [searchTerm, lieux]);

  // Supprimer un lieu
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
        setFilteredLieux(filteredLieux.filter(lieu => lieu.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu.');
      }
    }
  };

  // Fonction pour obtenir la couleur de badge selon la jauge
  const getJaugeColor = (jauge) => {
    if (!jauge) return 'secondary';
    if (jauge < 200) return 'info';
    if (jauge < 500) return 'success';
    if (jauge < 1000) return 'warning';
    return 'danger';
  };
  
  // Fonction pour obtenir le label de jauge
  const getJaugeLabel = (jauge) => {
    if (!jauge) return 'Non spécifiée';
    if (jauge < 200) return 'Petite';
    if (jauge < 500) return 'Moyenne';
    if (jauge < 1000) return 'Grande';
    return 'Très grande';
  };

  if (loading) {
    return <Spinner message="Chargement des lieux..." contentOnly={true} />;
  }

  return (
    <div className={styles.mobileContainer}>
      {/* En-tête avec titre et bouton d'ajout */}
      <div className={`${styles.headerContainer} d-flex justify-content-between align-items-center mb-3`}>
        <h5 className={styles.modernTitle}>Lieux</h5>
        <Button 
          variant="primary"
          className={styles.modernAddBtn}
          onClick={() => navigate('/lieux/nouveau')}
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBar}>
          <InputGroup>
            <InputGroup.Text className={styles.inputGroupText}>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher un lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x"></i>
              </Button>
            )}
          </InputGroup>
          {searchTerm && (
            <div className={styles.resultsCount}>
              {filteredLieux.length} résultat{filteredLieux.length !== 1 ? 's' : ''} trouvé{filteredLieux.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Liste de lieux */}
      {filteredLieux.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="bi bi-geo-alt"></i>
          <p>{searchTerm ? "Aucun lieu ne correspond à votre recherche" : "Aucun lieu n'a été ajouté"}</p>
          <Button 
            variant="primary"
            className={styles.modernAddBtn}
            onClick={() => navigate('/lieux/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un lieu
          </Button>
        </div>
      ) : (
        <div className={styles.lieuCardsContainer}>
          {filteredLieux.map(lieu => (
            <Card 
              key={lieu.id}
              className={styles.lieuCard}
              onClick={() => navigate(`/lieux/${lieu.id}`)}
            >
              <div className={styles.lieuCardHeader}>
                <h6 className={styles.lieuCardTitle}>
                  <i className="bi bi-geo-alt text-primary me-2"></i>
                  {lieu.nom}
                </h6>
              </div>
              <Card.Body className={styles.lieuCardBody}>
                {lieu.adresse && (
                  <div className={styles.lieuInfoItem}>
                    <div className={styles.lieuInfoIcon}>
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className={styles.lieuInfoText}>
                      {lieu.adresse}<br />
                      {lieu.codePostal} {lieu.ville}
                    </div>
                  </div>
                )}
                {lieu.jauge && (
                  <div className={styles.lieuInfoItem}>
                    <div className={styles.lieuInfoIcon}>
                      <i className="bi bi-people"></i>
                    </div>
                    <div className={styles.lieuInfoText}>
                      <span className={`${styles.jaugeBadge} bg-${getJaugeColor(lieu.jauge)}`}>
                        {lieu.jauge} places <span className={styles.jaugeType}>({getJaugeLabel(lieu.jauge)})</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {lieu.email && (
                  <div className={styles.lieuInfoItem}>
                    <div className={styles.lieuInfoIcon}>
                      <i className="bi bi-envelope"></i>
                    </div>
                    <div className={styles.lieuInfoText}>
                      <a href={`mailto:${lieu.email}`} className={styles.lieuContactLink} onClick={(e) => e.stopPropagation()}>
                        {lieu.email}
                      </a>
                    </div>
                  </div>
                )}
                {lieu.telephone && (
                  <div className={styles.lieuInfoItem}>
                    <div className={styles.lieuInfoIcon}>
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div className={styles.lieuInfoText}>
                      <a href={`tel:${lieu.telephone}`} className={styles.lieuContactLink} onClick={(e) => e.stopPropagation()}>
                        {lieu.telephone}
                      </a>
                    </div>
                  </div>
                )}
                {lieu.concertsAssocies && lieu.concertsAssocies.length > 0 && (
                  <div className="mt-2">
                    <Badge bg="primary" className={styles.concertCount}>
                      <i className="bi bi-music-note-beamed me-1"></i>
                      {lieu.concertsAssocies.length} concert{lieu.concertsAssocies.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </Card.Body>
              <div className={styles.lieuCardActions}>
                <Link 
                  to={`/lieux/edit/${lieu.id}`}
                  className={`btn btn-outline-primary ${styles.lieuActionBtn}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-pencil"></i>
                </Link>
                <Button
                  variant="danger"
                  className={styles.lieuActionBtn}
                  onClick={(e) => handleDelete(lieu.id, e)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LieuxListMobile;
