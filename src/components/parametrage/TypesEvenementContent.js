import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import useGenericEntityList from '@/hooks/generics/lists/useGenericEntityList';
import * as FirebaseService from '@/services/firebase-service';

const TypesEvenementContent = () => {
  const { currentOrganization } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', categorie: 'spectacle' });
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { items: typesEvenement, loading } = useGenericEntityList('typesEvenement', {
    sort: { field: 'nom', direction: 'asc' },
    refreshKey
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    
    try {
      if (editingId) {
        // Modification
        const typeRef = FirebaseService.doc(FirebaseService.db, 'typesEvenement', editingId);
        await FirebaseService.updateDoc(typeRef, {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Type d\'événement modifié avec succès');
      } else {
        // Création
        await FirebaseService.addDoc(FirebaseService.collection(FirebaseService.db, 'typesEvenement'), {
          nom: formData.nom,
          categorie: formData.categorie,
          organizationId: currentOrganization?.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success('Type d\'événement créé avec succès');
      }
      
      setFormData({ nom: '', categorie: 'spectacle' });
      setEditingId(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }, [formData, editingId, currentOrganization]);

  const handleEdit = useCallback((type) => {
    setEditingId(type.id);
    setFormData({
      nom: type.nom || '',
      categorie: type.categorie || 'spectacle'
    });
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) {
      return;
    }
    
    try {
      await FirebaseService.deleteDoc(FirebaseService.doc(FirebaseService.db, 'typesEvenement', id));
      toast.success('Type d\'événement supprimé avec succès');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, []);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setFormData({ nom: '', categorie: 'spectacle' });
  }, []);

  return (
    <>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {editingId ? 'Modifier le type' : 'Nouveau type d\'événement'}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Concert, Festival, Showcase..."
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Catégorie *</Form.Label>
                  <Form.Select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    required
                  >
                    <option value="spectacle">🎭 Spectacle</option>
                    <option value="autres">🌟 Autres</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    <i className={`bi ${editingId ? 'bi-save' : 'bi-plus'} me-1`}></i>
                    {editingId ? 'Modifier' : 'Créer'}
                  </Button>
                  {editingId && (
                    <Button variant="secondary" onClick={handleCancel}>
                      Annuler
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                (() => {
                  // Séparer les types par catégorie
                  const typesSpectacle = typesEvenement.filter(type => type.categorie === 'spectacle');
                  const typesAutres = typesEvenement.filter(type => type.categorie === 'autres');
                  
                  // Types prédéfinis
                  const spectaclePredefinis = [
                    'Animation scolaire', 'Ateliers', 'Concert', 'Conférence', 
                    'Déambulation', 'Filage', 'Répétition', 'Représentation', 'Résidence'
                  ];
                  const autresPredefinis = [
                    'Day off', 'Enregistrement', 'Indisponibilité', 'Lecture', 
                    'Prestation', 'Répétitions', 'Résidence', 'Vacances', 'Voyages'
                  ];
                  
                  return (
                    <div className="p-4">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card border-0 bg-light">
                            <div className="card-header bg-primary text-white d-flex align-items-center">
                              <i className="bi bi-masks-theater me-2"></i>
                              <h6 className="mb-0">🎭 SPECTACLE</h6>
                            </div>
                            <div className="card-body">
                              <ul className="list-unstyled mb-0">
                                {/* Types prédéfinis */}
                                {spectaclePredefinis.map((type, index) => (
                                  <li key={`predef-spectacle-${index}`} className="py-1 border-bottom border-light text-muted">
                                    • {type}
                                  </li>
                                ))}
                                {/* Types créés par l'utilisateur */}
                                {typesSpectacle.map((type) => (
                                  <li key={type.id} className="py-1 border-bottom border-light d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-primary">• {type.nom}</span>
                                    <div>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleEdit(type)}
                                        className="p-0 me-2"
                                        title="Modifier"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDelete(type.id)}
                                        className="p-0 text-danger"
                                        title="Supprimer"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card border-0 bg-light">
                            <div className="card-header bg-success text-white d-flex align-items-center">
                              <i className="bi bi-star me-2"></i>
                              <h6 className="mb-0">🌟 AUTRES</h6>
                            </div>
                            <div className="card-body">
                              <ul className="list-unstyled mb-0">
                                {/* Types prédéfinis */}
                                {autresPredefinis.map((type, index) => (
                                  <li key={`predef-autres-${index}`} className="py-1 border-bottom border-light text-muted">
                                    • {type}
                                  </li>
                                ))}
                                {/* Types créés par l'utilisateur */}
                                {typesAutres.map((type) => (
                                  <li key={type.id} className="py-1 border-bottom border-light d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success">• {type.nom}</span>
                                    <div>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleEdit(type)}
                                        className="p-0 me-2"
                                        title="Modifier"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDelete(type.id)}
                                        className="p-0 text-danger"
                                        title="Supprimer"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Utilisez le formulaire de gauche pour créer vos types d'événements personnalisés
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TypesEvenementContent;