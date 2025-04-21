// Imports React
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Imports Firebase
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  limit, 
  startAfter 
} from 'firebase/firestore';

// Imports internes
import { db } from '../../../firebase';

// Imports Bootstrap
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Spinner 
} from 'react-bootstrap';

// Styles
import '../../../style/artistesList.css';

const ArtistesList = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const pageSize = 12; // Nombre d'artistes à charger par page

  // Fonction pour charger les artistes
  const fetchArtistes = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLastVisible(null);
    }
    
    try {
      let q;
      if (reset || !lastVisible) {
        // Première charge ou réinitialisation
        q = query(collection(db, 'artistes'), orderBy(sortBy, sortDirection), limit(pageSize));
      } else {
        // Chargement de page supplémentaire
        q = query(collection(db, 'artistes'), orderBy(sortBy, sortDirection), startAfter(lastVisible), limit(pageSize));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!reset) return; // Ne rien faire s'il n'y a pas de résultats supplémentaires
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length >= pageSize);
      }
      
      const fetchedArtistes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (reset) {
        setArtistes(fetchedArtistes);
      } else {
        setArtistes(prevArtistes => [...prevArtistes, ...fetchedArtistes]);
      }
      
      // Calculer les statistiques si c'est un chargement initial
      if (reset) {
        const allDataQuery = query(collection(db, 'artistes'));
        const allDataSnapshot = await getDocs(allDataQuery);
        
        let avecConcerts = 0;
        let sansConcerts = 0;
        
        allDataSnapshot.forEach(doc => {
          const artisteData = doc.data();
          if (artisteData.concertsAssocies && artisteData.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
        });
        
        setStats({
          total: allDataSnapshot.size,
          avecConcerts,
          sansConcerts
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des artistes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchArtistes();
  }, [sortBy, sortDirection]);

  // Gestion de la fermeture du dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id, event) => {
    event.stopPropagation(); // Empêcher la propagation de l'événement
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteDoc(doc(db, 'artistes', id));
        setArtistes(artistes.filter(artiste => artiste.id !== id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'artiste:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const handleCreateArtiste = () => {
    // Rediriger vers le formulaire d'ajout et pré-remplir le nom
    navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`);
  };

  const handleSortChange = (field) => {
    if (field === sortBy) {
      // Si on clique sur le même champ, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, changer le champ et mettre en ordre ascendant par défaut
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchArtistes(false);
    }
  };

  const filteredArtistes = artistes.filter(artiste => {
    // Appliquer filtre de recherche
    const matchesSearch = artiste.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Appliquer filtres spécifiques si nécessaire
    if (filter === 'tous') return matchesSearch;
    if (filter === 'avecConcerts') return matchesSearch && artiste.concertsAssocies?.length > 0;
    if (filter === 'sansConcerts') return matchesSearch && (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0);
    
    return matchesSearch;
  });

  // Déterminer si aucun résultat ne correspond à la recherche
  const noResults = searchTerm.length > 0 && filteredArtistes.length === 0;

  const getNbConcerts = (artiste) => {
    if (!artiste.concertsAssocies) return 0;
    return artiste.concertsAssocies.length;
  };

  return (
    <Container fluid className="py-4">
      {/* En-tête avec titre et bouton d'ajout */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">
            <i className="bi bi-music-note-list me-2"></i>
            Gestion des artistes
          </h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary"
            onClick={() => navigate('/artistes/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nouvel artiste
          </Button>
        </Col>
      </Row>

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.total}</h3>
                <div className="stats-label">Total artistes</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stats-icon text-success">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.avecConcerts}</h3>
                <div className="stats-label">Avec concerts</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
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
      </Row>

      {/* Barre de recherche et filtres */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col lg={6} ref={searchInputRef} className="position-relative mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un artiste..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(searchTerm.length > 0)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setShowDropdown(false);
                    }}
                  >
                    <i className="bi bi-x-circle"></i>
                  </Button>
                )}
              </InputGroup>
              
              {/* Dropdown qui apparaît lors de la recherche */}
              {showDropdown && (
                <div className="search-results-dropdown">
                  {noResults ? (
                    <div className="search-create-item p-3" onClick={handleCreateArtiste}>
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>
                        Créer l'artiste "<strong>{searchTerm}</strong>"
                      </span>
                    </div>
                  ) : (
                    filteredArtistes.slice(0, 5).map(artiste => (
                      <Link to={`/artistes/${artiste.id}`} key={artiste.id} className="search-result-item">
                        <div className="search-result-avatar">
                          {artiste.photoPrincipale ? (
                            <img src={artiste.photoPrincipale} alt={artiste.nom} />
                          ) : (
                            <div className="placeholder-avatar">
                              <i className="bi bi-music-note"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold">{artiste.nom}</div>
                          {artiste.genre && <div className="small text-muted">{artiste.genre}</div>}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </Col>
            
            <Col lg={6}>
              <Row>
                <Col xs={12} md={4} className="mb-2 mb-md-0">
                  <Form.Select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="tous">Tous les artistes</option>
                    <option value="avecConcerts">Avec concerts</option>
                    <option value="sansConcerts">Sans concerts</option>
                  </Form.Select>
                </Col>
                <Col xs={12} md={8}>
                  <div className="d-flex align-items-center h-100">
                    <span className="me-2 d-none d-md-block">Trier par:</span>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button 
                        variant={sortBy === 'nom' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleSortChange('nom')}
                      >
                        Nom {sortBy === 'nom' && (
                          <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                        )}
                      </Button>
                      <Button 
                        variant={sortBy === 'createdAt' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Date {sortBy === 'createdAt' && (
                          <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                        )}
                      </Button>
                      <Button 
                        variant={sortBy === 'cachetMoyen' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleSortChange('cachetMoyen')}
                      >
                        Cachet {sortBy === 'cachetMoyen' && (
                          <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                        )}
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* État de chargement initial */}
      {loading && artistes.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des artistes...</p>
        </div>
      ) : filteredArtistes.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-music-note-list display-1 text-muted mb-3"></i>
            <h3>Aucun artiste trouvé</h3>
            {searchTerm ? (
              <p>Aucun résultat pour la recherche "{searchTerm}"</p>
            ) : (
              <p>Vous n'avez pas encore ajouté d'artistes</p>
            )}
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => navigate('/artistes/nouveau')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un artiste
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Liste des artistes en grille */}
          <Row xs={1} sm={2} md={3} xl={4} className="g-4">
            {filteredArtistes.map(artiste => (
              <Col key={artiste.id}>
                <Card 
                  className="artiste-card h-100"
                  onClick={() => navigate(`/artistes/${artiste.id}`)}
                >
                  <div className="artiste-photo">
                    {artiste.photoPrincipale ? (
                      <img src={artiste.photoPrincipale} alt={artiste.nom} />
                    ) : (
                      <div className="placeholder-photo">
                        <i className="bi bi-music-note"></i>
                      </div>
                    )}
                    <div className="artiste-badges">
                      {getNbConcerts(artiste) > 0 && (
                        <Badge bg="primary">{getNbConcerts(artiste)} concert{getNbConcerts(artiste) > 1 ? 's' : ''}</Badge>
                      )}
                      {artiste.estGroupeFavori && (
                        <Badge bg="warning"><i className="bi bi-star-fill me-1"></i>Favori</Badge>
                      )}
                    </div>
                  </div>
                  <div className="artiste-content">
                    <h3 className="artiste-name">{artiste.nom}</h3>
                    {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
                    <div className="artiste-info">
                      {artiste.cachetMoyen && (
                        <span className="info-item">
                          <i className="bi bi-cash"></i>
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                        </span>
                      )}
                      {artiste.ville && (
                        <span className="info-item">
                          <i className="bi bi-geo-alt"></i>
                          {artiste.ville}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="artiste-actions">
                    <Link to={`/artistes/${artiste.id}`} className="btn btn-outline-primary btn-sm" onClick={(e) => e.stopPropagation()}>
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Link to={`/artistes/${artiste.id}/modifier`} className="btn btn-outline-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => handleDelete(artiste.id, e)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* Bouton pour charger plus */}
          {hasMore && !searchTerm && (
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
                    Charger plus d'artistes
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

export default ArtistesList;