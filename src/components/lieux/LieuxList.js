import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { collection, getDocs, query, orderBy, limit, startAfter, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/lieuList.css';

const LieuxList = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    petiteJauge: false,
    moyenneJauge: false,
    grandeJauge: false,
    tresGrandeJauge: false,
    avecConcerts: false,
    sansConcerts: false
  });
  const [sortOption, setSortOption] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0,
    petiteJauge: 0,
    moyenneJauge: 0,
    grandeJauge: 0,
    tresGrandeJauge: 0
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const navigate = useNavigate();
  const pageSize = 12;

  // Fonction pour charger les lieux
  const fetchLieux = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLastVisible(null);
    }
    
    try {
      let q;
      if (reset || !lastVisible) {
        q = query(collection(db, 'lieux'), orderBy(sortOption, sortDirection), limit(pageSize));
      } else {
        q = query(collection(db, 'lieux'), orderBy(sortOption, sortDirection), startAfter(lastVisible), limit(pageSize));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!reset) return;
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length >= pageSize);
      }
      
      const fetchedLieux = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (reset) {
        setLieux(fetchedLieux);
      } else {
        setLieux(prevLieux => [...prevLieux, ...fetchedLieux]);
      }
      
      // Calculer les statistiques si c'est un chargement initial
      if (reset) {
        const allDataQuery = query(collection(db, 'lieux'));
        const allDataSnapshot = await getDocs(allDataQuery);
        
        let avecConcerts = 0;
        let sansConcerts = 0;
        let petiteJauge = 0;
        let moyenneJauge = 0;
        let grandeJauge = 0;
        let tresGrandeJauge = 0;
        
        allDataSnapshot.forEach(doc => {
          const lieuData = doc.data();
          
          // Comptage par concerts
          if (lieuData.concertsAssocies && lieuData.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
          
          // Comptage par jauge
          const jauge = lieuData.jauge || 0;
          if (jauge < 200) {
            petiteJauge++;
          } else if (jauge < 500) {
            moyenneJauge++;
          } else if (jauge < 1000) {
            grandeJauge++;
          } else {
            tresGrandeJauge++;
          }
        });
        
        setStats({
          total: allDataSnapshot.size,
          avecConcerts,
          sansConcerts,
          petiteJauge,
          moyenneJauge,
          grandeJauge,
          tresGrandeJauge
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLieux();
  }, [sortOption, sortDirection]);

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltreChange = (filtre) => {
    setFiltres(prev => ({
      ...prev,
      [filtre]: !prev[filtre]
    }));
  };

  const handleSortChange = (option) => {
    if (option === sortOption) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchLieux(false);
    }
  };

  const getNbConcerts = (lieu) => {
    if (!lieu.concertsAssocies) return 0;
    return lieu.concertsAssocies.length;
  };

  const getJaugeLabel = (jauge) => {
    if (!jauge) return 'Non spécifiée';
    if (jauge < 200) return 'Petite';
    if (jauge < 500) return 'Moyenne';
    if (jauge < 1000) return 'Grande';
    return 'Très grande';
  };

  const getJaugeColor = (jauge) => {
    if (!jauge) return 'secondary';
    if (jauge < 200) return 'info';
    if (jauge < 500) return 'success';
    if (jauge < 1000) return 'warning';
    return 'danger';
  };

  // Filtrer les lieux en fonction des critères
  const filteredLieux = lieux.filter(lieu => {
    // Filtre de recherche
    const matchesSearch = lieu.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lieu.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lieu.adresse?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtres de jauge
    const jauge = lieu.jauge || 0;
    const jaugeFilter = 
      (!filtres.petiteJauge && !filtres.moyenneJauge && !filtres.grandeJauge && !filtres.tresGrandeJauge) || // Aucun filtre actif
      (filtres.petiteJauge && jauge < 200) ||
      (filtres.moyenneJauge && jauge >= 200 && jauge < 500) ||
      (filtres.grandeJauge && jauge >= 500 && jauge < 1000) ||
      (filtres.tresGrandeJauge && jauge >= 1000);
    
    // Filtres de concerts
    const concertFilter = 
      (!filtres.avecConcerts && !filtres.sansConcerts) || // Aucun filtre actif
      (filtres.avecConcerts && lieu.concertsAssocies?.length > 0) ||
      (filtres.sansConcerts && (!lieu.concertsAssocies || lieu.concertsAssocies.length === 0));
    
    return matchesSearch && jaugeFilter && concertFilter;
  });

  return (
    <Container fluid className="py-4">
      {/* En-tête avec titre et bouton d'ajout */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Gestion des lieux
          </h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary"
            onClick={() => navigate('/lieux/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nouveau lieu
          </Button>
        </Col>
      </Row>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon">
                <i className="bi bi-geo-alt"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.total}</h3>
                <div className="stats-label">Total lieux</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon text-info">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.avecConcerts}</h3>
                <div className="stats-label">Avec concerts</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon text-warning">
                <i className="bi bi-calendar-x"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.sansConcerts}</h3>
                <div className="stats-label">Sans concerts</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon text-success">
                <i className="bi bi-people"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.total > 0 ? Math.round(lieux.reduce((acc, lieu) => acc + (lieu.jauge || 0), 0) / stats.total) : 0}</h3>
                <div className="stats-label">Jauge moyenne</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barre de recherche et filtres */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            {/* Barre de recherche */}
            <Col lg={6} className="mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom, ville ou adresse..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x-circle"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            {/* Options de tri */}
            <Col lg={6}>
              <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                <span className="me-2 d-none d-md-block">Trier par:</span>
                <Button 
                  variant={sortOption === 'nom' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleSortChange('nom')}
                >
                  Nom {sortOption === 'nom' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                  )}
                </Button>
                <Button 
                  variant={sortOption === 'ville' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleSortChange('ville')}
                >
                  Ville {sortOption === 'ville' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                  )}
                </Button>
                <Button 
                  variant={sortOption === 'jauge' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleSortChange('jauge')}
                >
                  Jauge {sortOption === 'jauge' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                  )}
                </Button>
                <Button 
                  variant={sortOption === 'updatedAt' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleSortChange('updatedAt')}
                >
                  Date {sortOption === 'updatedAt' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Filtres */}
          <div className="filters-row">
            <div className="filter-section">
              <span className="filter-label">Jauge:</span>
              <div className="filter-buttons">
                <Button 
                  variant={filtres.petiteJauge ? 'info' : 'outline-info'}
                  size="sm"
                  onClick={() => handleFiltreChange('petiteJauge')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.petiteJauge ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Petite (&lt;200)
                </Button>
                <Button 
                  variant={filtres.moyenneJauge ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => handleFiltreChange('moyenneJauge')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.moyenneJauge ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Moyenne (200-499)
                </Button>
                <Button 
                  variant={filtres.grandeJauge ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={() => handleFiltreChange('grandeJauge')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.grandeJauge ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Grande (500-999)
                </Button>
                <Button 
                  variant={filtres.tresGrandeJauge ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => handleFiltreChange('tresGrandeJauge')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.tresGrandeJauge ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Très grande (1000+)
                </Button>
              </div>
            </div>
            
            <div className="filter-section">
              <span className="filter-label">Statut:</span>
              <div className="filter-buttons">
                <Button 
                  variant={filtres.avecConcerts ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleFiltreChange('avecConcerts')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.avecConcerts ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Avec concerts
                </Button>
                <Button 
                  variant={filtres.sansConcerts ? 'secondary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleFiltreChange('sansConcerts')}
                  className="filter-btn"
                >
                  <i className={`bi ${filtres.sansConcerts ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  Sans concerts
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Affichage des lieux */}
      {loading && lieux.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des lieux...</p>
        </div>
      ) : filteredLieux.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-geo-alt-fill display-1 text-muted mb-3"></i>
            <h3>Aucun lieu trouvé</h3>
            {searchTerm || Object.values(filtres).some(v => v) ? (
              <p>Aucun résultat ne correspond à vos critères de recherche</p>
            ) : (
              <p>Vous n'avez pas encore ajouté de lieux</p>
            )}
            {Object.values(filtres).some(v => v) && (
              <Button
                variant="outline-secondary"
                className="mt-3 me-2"
                onClick={() => setFiltres({
                  petiteJauge: false,
                  moyenneJauge: false,
                  grandeJauge: false,
                  tresGrandeJauge: false,
                  avecConcerts: false,
                  sansConcerts: false
                })}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser les filtres
              </Button>
            )}
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => navigate('/lieux/nouveau')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un lieu
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} xl={4} className="g-4">
            {filteredLieux.map(lieu => (
              <Col key={lieu.id}>
                <Card 
                  className="lieu-card h-100"
                  onClick={() => navigate(`/lieux/${lieu.id}`)}
                >
                  <div className="lieu-map">
                    {lieu.coordonnees ? (
                      <div className="map-placeholder">
                        {/* Carte ou image de la carte à afficher ici */}
                        <img 
                          src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+f00(${lieu.coordonnees.lng},${lieu.coordonnees.lat})/${lieu.coordonnees.lng},${lieu.coordonnees.lat},13,0/300x200?access_token=YOUR_MAPBOX_TOKEN`} 
                          alt={`Carte de ${lieu.nom}`}
                          className="map-image"
                        />
                      </div>
                    ) : (
                      <div className="map-placeholder">
                        <i className="bi bi-map"></i>
                        <span>Pas de localisation</span>
                      </div>
                    )}
                    <div className="lieu-badges">
                      <Badge bg={getJaugeColor(lieu.jauge)}>
                        {lieu.jauge ? `${lieu.jauge} places` : 'Jauge non spécifiée'}
                      </Badge>
                      {getNbConcerts(lieu) > 0 && (
                        <Badge bg="primary">{getNbConcerts(lieu)} concert{getNbConcerts(lieu) > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="lieu-name">{lieu.nom}</Card.Title>
                    <div className="lieu-info">
                      {lieu.ville && (
                        <span className="info-item">
                          <i className="bi bi-geo-alt"></i>
                          {lieu.ville}
                          {lieu.codePostal && ` (${lieu.codePostal})`}
                        </span>
                      )}
                      <span className="info-item">
                        <i className="bi bi-people"></i>
                        {getJaugeLabel(lieu.jauge)}
                      </span>
                    </div>
                    {lieu.adresse && (
                      <p className="lieu-adresse">
                        {lieu.adresse}
                      </p>
                    )}
                  </Card.Body>
                  <Card.Footer className="lieu-actions">
                    <Link to={`/lieux/${lieu.id}`} className="btn btn-outline-primary btn-sm" onClick={(e) => e.stopPropagation()}>
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Link to={`/lieux/${lieu.id}/modifier`} className="btn btn-outline-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => handleDelete(lieu.id, e)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* Bouton pour charger plus */}
          {hasMore && (
            <div className="text-center mt-4">
              <Button 
                variant="outline-primary"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Charger plus de lieux
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default LieuxList;
