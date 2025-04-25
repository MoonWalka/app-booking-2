// src/components/structures/desktop/StructureDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { Button, Alert, Modal } from 'react-bootstrap';
import '../../../style/structuresList.css';

const StructureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loadingProgrammateurs, setLoadingProgrammateurs] = useState(false);

  // Chargement des données de la structure
  useEffect(() => {
    const fetchStructure = async () => {
      setLoading(true);
      try {
        const structureDoc = await getDoc(doc(db, 'structures', id));
        if (structureDoc.exists()) {
          setStructure({
            id: structureDoc.id,
            ...structureDoc.data()
          });
          
          // Charger les programmateurs associés
          if (structureDoc.data().programmateursAssocies?.length > 0) {
            fetchProgrammateurs(structureDoc.data().programmateursAssocies);
          }
        } else {
          setError('Structure non trouvée');
          navigate('/structures');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la structure:', error);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [id, navigate]);

  // Chargement des programmateurs associés
  const fetchProgrammateurs = async (programmateursIds) => {
    setLoadingProgrammateurs(true);
    try {
      const programmateursData = [];
      
      for (const progId of programmateursIds) {
        const progDoc = await getDoc(doc(db, 'programmateurs', progId));
        if (progDoc.exists()) {
          programmateursData.push({
            id: progDoc.id,
            ...progDoc.data()
          });
        }
      }
      
      setProgrammateurs(programmateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des programmateurs:', error);
    } finally {
      setLoadingProgrammateurs(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Vérifier s'il y a des associations avec des programmateurs
      if (structure.programmateursAssocies?.length > 0) {
        // Mise à jour des programmateurs pour retirer la référence à cette structure
        for (const progId of structure.programmateursAssocies) {
          const progRef = doc(db, 'programmateurs', progId);
          const progDoc = await getDoc(progRef);
          
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // Si le programmateur a une structureId correspondant à cette structure,
            // mettre à jour pour enlever cette référence
            if (progData.structureId === id) {
              await updateDoc(progRef, {
                structureId: null,
                structureNom: null,
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
      }
      
      // Supprimer la structure
      await deleteDoc(doc(db, 'structures', id));
      navigate('/structures');
    } catch (error) {
      console.error('Erreur lors de la suppression de la structure:', error);
      alert('Une erreur est survenue lors de la suppression');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Formatage des valeurs pour l'affichage
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'Non spécifié';
    }
    return value;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );
  }

  return (
    <div className="structure-details-container">
      <div className="details-header">
        <div className="header-title">
          <h2>
            <i className="bi bi-building me-2"></i>
            {structure.nom || structure.raisonSociale}
          </h2>
          {structure.type && (
            <span className={`badge bg-${getTypeColor(structure.type)} ms-2`}>
              {getTypeLabel(structure.type)}
            </span>
          )}
        </div>
        <div className="header-actions">
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => navigate(`/structures/${id}/edit`)}
          >
            <i className="bi bi-pencil me-2"></i>
            Modifier
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="details-content">
        <div className="details-card">
          <div className="card-header">
            <i className="bi bi-info-circle"></i>
            <h3>Informations de base</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Nom</div>
                  <div className="info-value">{formatValue(structure.nom)}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Raison sociale</div>
                  <div className="info-value">{formatValue(structure.raisonSociale)}</div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Type</div>
                  <div className="info-value">{structure.type ? getTypeLabel(structure.type) : 'Non spécifié'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">SIRET</div>
                  <div className="info-value">{formatValue(structure.siret)}</div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">TVA Intracommunautaire</div>
                  <div className="info-value">{formatValue(structure.tva)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Coordonnées</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="info-group">
                  <div className="info-label">Adresse</div>
                  <div className="info-value">{formatValue(structure.adresse)}</div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Code postal</div>
                  <div className="info-value">{formatValue(structure.codePostal)}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Ville</div>
                  <div className="info-value">{formatValue(structure.ville)}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Pays</div>
                  <div className="info-value">{formatValue(structure.pays)}</div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Téléphone</div>
                  <div className="info-value">
                    {structure.telephone ? (
                      <a href={`tel:${structure.telephone}`} className="contact-link">
                        <i className="bi bi-telephone me-1"></i>
                        {structure.telephone}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Email</div>
                  <div className="info-value">
                    {structure.email ? (
                      <a href={`mailto:${structure.email}`} className="contact-link">
                        <i className="bi bi-envelope me-1"></i>
                        {structure.email}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="info-group">
                  <div className="info-label">Site web</div>
                  <div className="info-value">
                    {structure.siteWeb ? (
                      <a href={structure.siteWeb} target="_blank" rel="noopener noreferrer" className="contact-link">
                        <i className="bi bi-globe me-1"></i>
                        {structure.siteWeb}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header">
            <i className="bi bi-person"></i>
            <h3>Contact principal</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Nom</div>
                  <div className="info-value">{formatValue(structure.contact?.nom)}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Fonction</div>
                  <div className="info-value">{formatValue(structure.contact?.fonction)}</div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Téléphone</div>
                  <div className="info-value">
                    {structure.contact?.telephone ? (
                      <a href={`tel:${structure.contact.telephone}`} className="contact-link">
                        <i className="bi bi-telephone me-1"></i>
                        {structure.contact.telephone}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-group">
                  <div className="info-label">Email</div>
                  <div className="info-value">
                    {structure.contact?.email ? (
                      <a href={`mailto:${structure.contact.email}`} className="contact-link">
                        <i className="bi bi-envelope me-1"></i>
                        {structure.contact.email}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header">
            <i className="bi bi-person-badge"></i>
            <h3>Programmateurs associés</h3>
          </div>
          <div className="card-body">
            {loadingProgrammateurs ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : programmateurs.length > 0 ? (
              <div className="programmateurs-list">
                {programmateurs.map(prog => (
                  <div key={prog.id} className="programmateur-card">
                    <div className="programmateur-info">
                      <h4 className="programmateur-name">
                        <i className="bi bi-person-badge me-2"></i>
                        <Link to={`/programmateurs/${prog.id}`}>{prog.nom}</Link>
                      </h4>
                      <div className="programmateur-details">
                        {prog.email && (
                          <div className="detail-item">
                            <i className="bi bi-envelope me-1"></i>
                            <a href={`mailto:${prog.email}`}>{prog.email}</a>
                          </div>
                        )}
                        {prog.telephone && (
                          <div className="detail-item">
                            <i className="bi bi-telephone me-1"></i>
                            <a href={`tel:${prog.telephone}`}>{prog.telephone}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Aucun programmateur n'est associé à cette structure.
              </div>
            )}
          </div>
        </div>

        {structure.notes && (
          <div className="details-card">
            <div className="card-header">
              <i className="bi bi-sticky"></i>
              <h3>Notes</h3>
            </div>
            <div className="card-body">
              <div className="notes-content">
                {structure.notes.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer cette structure ?</p>
          {structure.programmateursAssocies?.length > 0 && (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Cette structure est associée à {structure.programmateursAssocies.length} programmateur(s).
              La suppression retirera ces associations.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Fonction pour obtenir la couleur du badge selon le type de structure
const getTypeColor = (type) => {
  switch (type) {
    case 'association':
      return 'success';
    case 'entreprise':
      return 'primary';
    case 'administration':
      return 'info';
    case 'collectivite':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Fonction pour obtenir le libellé correspondant au type de structure
const getTypeLabel = (type) => {
  switch (type) {
    case 'association':
      return 'Association';
    case 'entreprise':
      return 'Entreprise';
    case 'administration':
      return 'Administration';
    case 'collectivite':
      return 'Collectivité';
    default:
      return 'Autre';
  }
};

export default StructureDetails;