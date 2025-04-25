// Imports React
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Button, Form, InputGroup, Spinner, Card, Table, Badge } from 'react-bootstrap';
import '@styles/index.css';

// Constantes
const pageSize = 20; // Nombre d'artistes à charger par page

const ArtistesList = () => {
  // States
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
    event.preventDefault(); // Empêcher la navigation
    
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
    <div className="container-fluid py-4">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h1 className="mb-0">
            <i className="bi bi-music-note-list me-2"></i>
            Gestion des artistes
          </h1>
        </div>
        <div className="col-auto">
          <Button 
            variant="primary"
            onClick={() => navigate('/artistes/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nouvel artiste
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card stats-card h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.total}</h3>
                <div className="stats-label">Total artistes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stats-card h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon text-success">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.avecConcerts}</h3>
                <div className="stats-label">Avec concerts</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stats-card h-100">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon text-warning">
                <i className="bi bi-calendar-x"></i>
              </div>
              <div>
                <h3 className="stats-value mb-0">{stats.sansConcerts}</h3>
                <div className="stats-label">Sans concerts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-6" ref={searchInputRef} className="position-relative mb-3 mb-lg-0">
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
            </div>
            
            <div className="col-lg-6">
              <div className="row">
                <div className="col-xs-12 col-md-4 mb-2 mb-md-0">
                  <Form.Select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="tous">Tous les artistes</option>
                    <option value="avecConcerts">Avec concerts</option>
                    <option value="sansConcerts">Sans concerts</option>
                  </Form.Select>
                </div>
                <div className="col-xs-12 col-md-8">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          {/* Nouvelle liste des artistes en format tableau */}
          <Card className="artistes-list-container">
            <Table hover responsive className="artistes-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Artiste</th>
                  <th style={{ width: '15%' }}>Lieu</th>
                  <th style={{ width: '15%' }}>Cachet</th>
                  <th style={{ width: '15%' }}>Concerts</th>
                  <th style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtistes.map(artiste => (
                  <tr key={artiste.id} className={artiste.estGroupeFavori ? 'favorite-artiste-row' : ''}>
                    <td className="artiste-name-cell">
                      <Link to={`/artistes/${artiste.id}`} className="d-flex align-items-center text-decoration-none">
                        <div className="artiste-avatar me-3">
                          {artiste.photoPrincipale ? (
                            <img src={artiste.photoPrincipale} alt={artiste.nom} />
                          ) : (
                            <div className="placeholder-avatar">
                              <i className="bi bi-music-note"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold d-flex align-items-center">
                            {artiste.nom}
                            {artiste.estGroupeFavori && (
                              <i className="bi bi-star-fill text-warning ms-2"></i>
                            )}
                          </div>
                          {artiste.genre && <div className="small text-muted">{artiste.genre}</div>}
                        </div>
                      </Link>
                    </td>
                    <td>
                      {artiste.ville ? (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt text-muted me-2"></i>
                          {artiste.ville}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {artiste.cachetMoyen ? (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-cash text-muted me-2"></i>
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {getNbConcerts(artiste) > 0 ? (
                        <Badge bg="primary" className="px-2 py-1 d-inline-flex align-items-center">
                          <i className="bi bi-music-note-beamed me-1"></i>
                          {getNbConcerts(artiste)}
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="px-2 py-1">0</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Link to={`/artistes/${artiste.id}`} className="btn btn-outline-primary btn-sm action-button">
                          <i className="bi bi-eye me-1"></i>Voir
                        </Link>
                        <Link to={`/artistes/${artiste.id}/modifier`} className="btn btn-outline-secondary btn-sm action-button">
                          <i className="bi bi-pencil me-1"></i>Modifier
                        </Link>
                        <Button 
                          variant="outline-danger"
                          size="sm"
                          className="action-button"
                          onClick={(e) => handleDelete(artiste.id, e)}
                        >
                          <i className="bi bi-trash me-1"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          
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
    </div>
  );
};

export default ArtistesList;