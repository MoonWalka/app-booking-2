import React, { useState, useCallback } from 'react';
import { Modal, Form, Button, Nav, Tab, Row, Col } from 'react-bootstrap';
import { useEntreprise } from '@/context/EntrepriseContext';
import { db } from '@/services/firebase-service';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { GENRES_HIERARCHY } from '@/config/tagsHierarchy';
import styles from './FestivalCreationModal.module.css';

const FestivalCreationModal = ({ show, onHide, contactId, contactName }) => {
  const { currentEntreprise } = useEntreprise();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // État pour les données du festival
  const [festivalData, setFestivalData] = useState({
    // Informations générales
    titre: '',
    estActif: true,
    periode: '',
    programmateurId: '',
    bouclage: '',
    type: '',
    // Période de diffusion (52 semaines)
    semainesDiffusion: [],
    // Genres
    genres: [],
    // Commentaires
    commentaires: ''
  });

  // État pour gérer les catégories pliées/dépliées
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Générer la grille des semaines (12 mois x 5 semaines)
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Gestion du clic sur une semaine (identifiée par mois et semaine)
  const toggleWeek = useCallback((monthIndex, weekIndex) => {
    const weekId = `${monthIndex}-${weekIndex}`;
    setFestivalData(prev => ({
      ...prev,
      semainesDiffusion: prev.semainesDiffusion.includes(weekId)
        ? prev.semainesDiffusion.filter(w => w !== weekId)
        : [...prev.semainesDiffusion, weekId]
    }));
  }, []);


  // Gestion de la sélection des genres
  const toggleGenre = useCallback((genreId) => {
    setFestivalData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(g => g !== genreId)
        : [...prev.genres, genreId]
    }));
  }, []);

  // Gestion du pliage/dépliage des catégories
  const toggleExpanded = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Gestion des changements de champs
  const handleChange = useCallback((field, value) => {
    setFestivalData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Sauvegarde du festival
  const handleSave = async () => {
    if (!festivalData.titre.trim()) {
      toast.error('Le titre du festival est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const festivalDoc = {
        ...festivalData,
        contactId,
        contactName,
        entrepriseId: currentEntreprise.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('[FestivalCreationModal] Création du festival avec:', {
        contactId,
        contactName,
        entrepriseId: currentEntreprise.id,
        titre: festivalData.titre
      });

      const docRef = await addDoc(collection(db, 'festivals'), festivalDoc);
      console.log('[FestivalCreationModal] Festival créé avec ID:', docRef.id);
      toast.success('Festival créé avec succès');
      onHide();
    } catch (error) {
      console.error('Erreur lors de la création du festival:', error);
      toast.error('Erreur lors de la création du festival');
    } finally {
      setSaving(false);
    }
  };

  // Rendu du composant Genre avec ses enfants
  const renderGenreItem = (genre, level = 0) => {
    const hasChildren = genre.children && genre.children.length > 0;
    const isExpanded = expandedCategories.has(genre.id);
    
    return (
      <div key={genre.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="d-flex align-items-center">
          {hasChildren && (
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              onClick={() => toggleExpanded(genre.id)}
              style={{ minWidth: '20px' }}
            >
              <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            </Button>
          )}
          <Form.Check
            type="checkbox"
            id={`genre-${genre.id}`}
            label={genre.label}
            checked={festivalData.genres.includes(genre.id)}
            onChange={() => toggleGenre(genre.id)}
            className="mb-2"
            style={{ marginLeft: hasChildren ? 0 : '28px' }}
          />
        </div>
        {hasChildren && isExpanded && genre.children.map(child => renderGenreItem(child, level + 1))}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Nouveau festival</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="general">Informations générales</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="genre">Genre</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="commentaires">Commentaires</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Onglet Informations générales */}
            <Tab.Pane eventKey="general">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Titre *</Form.Label>
                      <Form.Control
                        type="text"
                        value={festivalData.titre}
                        onChange={(e) => handleChange('titre', e.target.value)}
                        placeholder="Nom du festival"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Est actif"
                        checked={festivalData.estActif}
                        onChange={(e) => handleChange('estActif', e.target.checked)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Période</Form.Label>
                      <Form.Control
                        type="text"
                        value={festivalData.periode}
                        onChange={(e) => handleChange('periode', e.target.value)}
                        placeholder="Ex: Juillet 2025"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        value={festivalData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="saison">Saison</option>
                        <option value="festival">Festival</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Programmateur</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={festivalData.programmateurId}
                          onChange={(e) => handleChange('programmateurId', e.target.value)}
                          className="flex-grow-1"
                        >
                          <option value="">Sélectionner un programmateur</option>
                          {/* TODO: Charger la liste des programmateurs */}
                        </Form.Select>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bouclage</Form.Label>
                      <Form.Select
                        value={festivalData.bouclage}
                        onChange={(e) => handleChange('bouclage', e.target.value)}
                      >
                        <option value="">Sélectionner</option>
                        <option value="janvier">Janvier</option>
                        <option value="fevrier">Février</option>
                        <option value="mars">Mars</option>
                        <option value="avril">Avril</option>
                        <option value="mai">Mai</option>
                        <option value="juin">Juin</option>
                        <option value="juillet">Juillet</option>
                        <option value="aout">Août</option>
                        <option value="septembre">Septembre</option>
                        <option value="octobre">Octobre</option>
                        <option value="novembre">Novembre</option>
                        <option value="decembre">Décembre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Grille de période de diffusion */}
                <div className="mt-4">
                  <h6>Période de diffusion</h6>
                  <div className={styles.periodGrid}>
                    <table className={styles.weeksTable}>
                      <tbody>
                        {months.map((monthName, monthIndex) => (
                          <tr key={monthIndex} className={styles.monthRow}>
                            <td className={styles.monthName}>{monthName}</td>
                            {[1, 2, 3, 4].map((weekNum) => {
                              const weekId = `${monthIndex}-${weekNum - 1}`;
                              return (
                                <td key={weekNum} className={styles.weekCellWrapper}>
                                  <div
                                    className={`${styles.weekCell} ${
                                      festivalData.semainesDiffusion.includes(weekId) ? styles.selected : ''
                                    }`}
                                    onClick={() => toggleWeek(monthIndex, weekNum - 1)}
                                    title={`${monthName} - Semaine ${weekNum}`}
                                  >
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Form>
            </Tab.Pane>

            {/* Onglet Genre */}
            <Tab.Pane eventKey="genre">
              <div className="p-3">
                {GENRES_HIERARCHY.map(genre => renderGenreItem(genre))}
              </div>
            </Tab.Pane>

            {/* Onglet Commentaires */}
            <Tab.Pane eventKey="commentaires">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={festivalData.commentaires}
                  onChange={(e) => handleChange('commentaires', e.target.value)}
                  placeholder="Ajoutez vos notes ou remarques internes..."
                />
              </Form.Group>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FestivalCreationModal;