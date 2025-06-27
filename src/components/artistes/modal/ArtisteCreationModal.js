// src/components/artistes/modal/ArtisteCreationModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Modal de création/édition d'un artiste
 * Avec les métadonnées simplifiées demandées
 */
function ArtisteCreationModal({ show, onHide, onCreated, editArtiste = null }) {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    codeAnalytique: '',
    libelleAnalytique: '',
    actif: true,
    auCatalogue: true,
    projet: {
      nom: '',
      code: ''
    }
  });

  // Charger les données de l'artiste en mode édition
  useEffect(() => {
    if (editArtiste) {
      // Gérer les deux formats : projets (array) et projet (objet)
      let projetData = { nom: '', code: '' };
      
      if (editArtiste.projets && editArtiste.projets.length > 0) {
        // Nouveau format : prendre le premier projet de l'array
        projetData = {
          nom: editArtiste.projets[0].nom || '',
          code: editArtiste.projets[0].code || ''
        };
      } else if (editArtiste.projet) {
        // Ancien format : utiliser l'objet projet
        projetData = {
          nom: editArtiste.projet.nom || '',
          code: editArtiste.projet.code || ''
        };
      }
      
      setFormData({
        nom: editArtiste.nom || '',
        code: editArtiste.code || '',
        codeAnalytique: editArtiste.codeAnalytique || '',
        libelleAnalytique: editArtiste.libelleAnalytique || '',
        actif: editArtiste.actif !== false, // Par défaut true si non défini
        auCatalogue: editArtiste.auCatalogue !== false, // Par défaut true si non défini
        projet: projetData
      });
    } else {
      // Réinitialiser en mode création
      setFormData({
        nom: '',
        code: '',
        codeAnalytique: '',
        libelleAnalytique: '',
        actif: true,
        auCatalogue: true,
        projet: {
          nom: '',
          code: ''
        }
      });
    }
  }, [editArtiste, show]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('projet.')) {
      const projetField = field.replace('projet.', '');
      setFormData(prev => ({
        ...prev,
        projet: {
          ...prev.projet,
          [projetField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('Le nom est obligatoire');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      // Convertir le projet unique en array de projets
      const artisteData = {
        nom: formData.nom,
        code: formData.code,
        codeAnalytique: formData.codeAnalytique,
        libelleAnalytique: formData.libelleAnalytique,
        actif: formData.actif,
        auCatalogue: formData.auCatalogue,
        // Stocker les projets en tant qu'array
        projets: formData.projet.nom ? [{
          nom: formData.projet.nom,
          code: formData.projet.code,
          id: Date.now().toString() // ID temporaire
        }] : [],
        // Garder aussi projet pour compatibilité temporaire
        projet: formData.projet.nom ? formData.projet : null,
        organizationId: currentOrganization.id,
        updatedAt: serverTimestamp(),
        status: formData.actif ? 'active' : 'inactive'
      };

      if (editArtiste) {
        // Mode édition - mettre à jour l'artiste existant
        const artisteRef = doc(db, 'artistes', editArtiste.id);
        await updateDoc(artisteRef, artisteData);
        
        console.log('Artiste mis à jour avec ID:', editArtiste.id);
        
        // Callback pour notifier la modification
        if (onCreated) {
          onCreated({
            id: editArtiste.id,
            ...artisteData
          });
        }
      } else {
        // Mode création - créer un nouvel artiste
        artisteData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'artistes'), artisteData);
        
        console.log('Artiste créé avec ID:', docRef.id);
        
        // Callback pour notifier la création
        if (onCreated) {
          onCreated({
            id: docRef.id,
            ...artisteData
          });
        }
      }

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error(`Erreur lors de ${editArtiste ? 'la modification' : 'la création'} de l'artiste:`, error);
      alert(`Erreur lors de ${editArtiste ? 'la modification' : 'la création'} de l'artiste`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-music-note-beamed me-2"></i>
          {editArtiste ? 'Modifier l\'Artiste' : 'Nouvel Artiste'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-12 mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de l'artiste"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Code artiste"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <Form.Label>Code analytique</Form.Label>
              <Form.Control
                type="text"
                placeholder="Code analytique"
                value={formData.codeAnalytique}
                onChange={(e) => handleInputChange('codeAnalytique', e.target.value)}
              />
            </div>
            
            <div className="col-12 mb-3">
              <Form.Label>Libellé analytique</Form.Label>
              <Form.Control
                type="text"
                placeholder="Libellé analytique"
                value={formData.libelleAnalytique}
                onChange={(e) => handleInputChange('libelleAnalytique', e.target.value)}
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <Form.Check
                type="checkbox"
                id="actif-checkbox"
                label="Actif"
                checked={formData.actif}
                onChange={(e) => handleInputChange('actif', e.target.checked)}
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <Form.Check
                type="checkbox"
                id="catalogue-checkbox"
                label="Au catalogue"
                checked={formData.auCatalogue}
                onChange={(e) => handleInputChange('auCatalogue', e.target.checked)}
              />
            </div>
          </div>
          
          {/* Section Projet */}
          <hr className="my-4" />
          <h6 className="mb-3">
            <i className="bi bi-folder me-2"></i>
            Projet
          </h6>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label>Nom du projet</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom du projet"
                value={formData.projet.nom}
                onChange={(e) => handleInputChange('projet.nom', e.target.value)}
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <Form.Label>Code du projet</Form.Label>
              <Form.Control
                type="text"
                placeholder="Code du projet"
                value={formData.projet.code}
                onChange={(e) => handleInputChange('projet.code', e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Création...
              </>
            ) : (
              <>
                <i className={`bi ${editArtiste ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                {editArtiste ? 'Modifier l\'artiste' : 'Créer l\'artiste'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ArtisteCreationModal;