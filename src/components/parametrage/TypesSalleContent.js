import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import useGenericEntityList from '@/hooks/generics/lists/useGenericEntityList';
import * as FirebaseService from '@/services/firebase-service';

const TypesSalleContent = () => {
  const { currentEntreprise } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '' });
  const { items: typesSalle, loading, refetch } = useGenericEntityList('typesSalle', {
    sort: { field: 'nom', direction: 'asc' }
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    
    const dataToSave = {
      nom: formData.nom,
      entrepriseId: currentEntreprise?.id,
      createdAt: editingId ? undefined : new Date(),
      updatedAt: new Date()
    };
    
    try {
      if (editingId) {
        // Modification
        const typeRef = FirebaseService.doc(FirebaseService.db, 'typesSalle', editingId);
        await FirebaseService.updateDoc(typeRef, dataToSave);
        toast.success('Type de salle modifié avec succès');
      } else {
        // Création
        await FirebaseService.addDoc(FirebaseService.collection(FirebaseService.db, 'typesSalle'), dataToSave);
        toast.success('Type de salle créé avec succès');
      }
      
      setFormData({ nom: '' });
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }, [formData, editingId, currentEntreprise, refetch]);

  const handleEdit = useCallback((type) => {
    setEditingId(type.id);
    setFormData({
      nom: type.nom || ''
    });
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de salle ?')) {
      return;
    }
    
    try {
      await FirebaseService.deleteDoc(FirebaseService.doc(FirebaseService.db, 'typesSalle', id));
      toast.success('Type de salle supprimé avec succès');
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [refetch]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setFormData({ nom: '' });
  }, []);


  return (
    <>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {editingId ? 'Modifier le type' : 'Nouveau type de salle'}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Salle de spectacle, Club, Festival..."
                    required
                  />
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
              ) : typesSalle.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-building" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <p className="text-muted mt-3">Aucun type de salle créé</p>
                  <p className="text-muted small">Utilisez le formulaire de gauche pour créer votre premier type de salle</p>
                </div>
              ) : (
                <div className="p-4">
                  <h6 className="mb-3 text-muted">
                    <i className="bi bi-building me-2"></i>
                    Types de salle ({typesSalle.length})
                  </h6>
                  <div className="list-group">
                    {typesSalle.map(type => (
                      <div key={type.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="fw-medium">{type.nom}</span>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TypesSalleContent;