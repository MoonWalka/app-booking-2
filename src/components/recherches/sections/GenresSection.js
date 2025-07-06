import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import styles from './Sections.module.css';

/**
 * Section Genres pour la recherche multi-critères
 */
const GenresSection = ({ onCriteriaChange }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Liste complète des genres musicaux
  const genresDisponibles = [
    { id: 'rock', label: 'Rock' },
    { id: 'rock-alternatif', label: 'Rock alternatif' },
    { id: 'rock-progressif', label: 'Rock progressif' },
    { id: 'hard-rock', label: 'Hard rock' },
    { id: 'punk', label: 'Punk' },
    { id: 'metal', label: 'Metal' },
    { id: 'pop', label: 'Pop' },
    { id: 'pop-rock', label: 'Pop rock' },
    { id: 'electro-pop', label: 'Electro pop' },
    { id: 'indie-pop', label: 'Indie pop' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'jazz-fusion', label: 'Jazz fusion' },
    { id: 'jazz-manouche', label: 'Jazz manouche' },
    { id: 'blues', label: 'Blues' },
    { id: 'blues-rock', label: 'Blues rock' },
    { id: 'folk', label: 'Folk' },
    { id: 'chanson', label: 'Chanson' },
    { id: 'chanson-francaise', label: 'Chanson française' },
    { id: 'variete', label: 'Variété' },
    { id: 'hip-hop', label: 'Hip-hop' },
    { id: 'rap', label: 'Rap' },
    { id: 'trap', label: 'Trap' },
    { id: 'rnb', label: 'R&B' },
    { id: 'soul', label: 'Soul' },
    { id: 'funk', label: 'Funk' },
    { id: 'reggae', label: 'Reggae' },
    { id: 'dub', label: 'Dub' },
    { id: 'ska', label: 'Ska' },
    { id: 'electro', label: 'Électro' },
    { id: 'techno', label: 'Techno' },
    { id: 'house', label: 'House' },
    { id: 'drum-and-bass', label: 'Drum and bass' },
    { id: 'dubstep', label: 'Dubstep' },
    { id: 'ambient', label: 'Ambient' },
    { id: 'experimental', label: 'Expérimental' },
    { id: 'musique-du-monde', label: 'Musique du monde' },
    { id: 'musique-africaine', label: 'Musique africaine' },
    { id: 'musique-latine', label: 'Musique latine' },
    { id: 'salsa', label: 'Salsa' },
    { id: 'flamenco', label: 'Flamenco' },
    { id: 'musique-orientale', label: 'Musique orientale' },
    { id: 'musique-classique', label: 'Musique classique' },
    { id: 'musique-contemporaine', label: 'Musique contemporaine' },
    { id: 'musique-traditionnelle', label: 'Musique traditionnelle' },
    { id: 'musique-bretonne', label: 'Musique bretonne' },
    { id: 'musique-celtique', label: 'Musique celtique' },
    { id: 'country', label: 'Country' },
    { id: 'bluegrass', label: 'Bluegrass' },
    { id: 'indie', label: 'Indie' },
    { id: 'indie-rock', label: 'Indie rock' },
    { id: 'post-rock', label: 'Post-rock' },
    { id: 'shoegaze', label: 'Shoegaze' },
    { id: 'noise', label: 'Noise' },
    { id: 'musique-enfants', label: 'Musique pour enfants' },
    { id: 'spoken-word', label: 'Spoken word' },
    { id: 'slam', label: 'Slam' },
    { id: 'autres', label: 'Autres' }
  ];

  // Filtrer les genres selon la recherche
  const genresFiltres = genresDisponibles.filter(genre =>
    genre.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenreToggle = (genreId) => {
    const newSelected = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    
    setSelectedGenres(newSelected);
    
    // Notifier le parent
    if (newSelected.length > 0) {
      const selectedLabels = newSelected.map(id => {
        const genre = genresDisponibles.find(g => g.id === id);
        return genre ? genre.label : id;
      });
      
      onCriteriaChange({
        id: `genres_${Date.now()}`,
        field: 'Genres',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedGenres.length === genresFiltres.length) {
      // Tout désélectionner
      setSelectedGenres([]);
    } else {
      // Tout sélectionner (seulement les genres filtrés)
      const allIds = genresFiltres.map(g => g.id);
      setSelectedGenres(allIds);
      
      // Notifier le parent
      const selectedLabels = genresFiltres.map(g => g.label);
      onCriteriaChange({
        id: `genres_${Date.now()}`,
        field: 'Genres',
        operator: 'parmi',
        value: selectedLabels.join(', ')
      });
    }
  };

  const allSelected = genresFiltres.length > 0 && 
    genresFiltres.every(g => selectedGenres.includes(g.id));
  const someSelected = genresFiltres.some(g => selectedGenres.includes(g.id)) && !allSelected;

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-music-note-list me-2"></i>
        Genres
      </h4>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-filter me-2"></i>
            Filtres disponibles
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Label className="fw-bold">Genres</Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Filtre : parmi les genres sélectionnés
          </Form.Text>

          {/* Barre de recherche */}
          <Form.Control 
            type="text"
            placeholder="Rechercher un genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {/* Résumé des sélections */}
          {selectedGenres.length > 0 && (
            <div className="alert alert-info mb-3">
              <small>
                <i className="bi bi-check2-circle me-2"></i>
                {selectedGenres.length} genre(s) sélectionné(s)
              </small>
            </div>
          )}

          {/* Sélectionner tout */}
          <div className="mb-3">
            <Form.Check 
              type="checkbox"
              id="select-all-genres"
              label={<strong>Tout sélectionner ({genresFiltres.length})</strong>}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
          </div>

          <hr className="my-2" />

          {/* Liste des genres */}
          <div 
            className="border rounded p-3" 
            style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              backgroundColor: 'var(--bs-gray-50)'
            }}
          >
            {genresFiltres.length === 0 ? (
              <p className="text-muted text-center mb-0">
                Aucun genre ne correspond à votre recherche
              </p>
            ) : (
              <Row>
                {genresFiltres.map(genre => (
                  <Col md={6} lg={4} key={genre.id} className="mb-2">
                    <Form.Check 
                      type="checkbox"
                      id={`genre-${genre.id}`}
                      label={genre.label}
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GenresSection;