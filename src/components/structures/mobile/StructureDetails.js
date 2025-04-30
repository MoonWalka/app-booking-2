import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../../firebaseInit';
import { Button, Alert, Modal } from 'react-bootstrap';
import styles from './StructureDetails.module.css';

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
  const [activeTab, setActiveTab] = useState('infos');

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
          
          // Charger les programmateurs associés si nécessaire
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
        <div className={styles.spinner} role="status">
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
    <div className={styles.structureDetailMobile}>
      <div className={styles.structureDetailHeader}>
        <div className={styles.structureDetailTitle}>
          <i className="bi bi-building"></i>
          {structure.nom || structure.raisonSociale}
        </div>
        {structure.type && (
          <div className={styles.structureDetailSubtitle}>
            {getTypeLabel(structure.type)}
          </div>
        )}
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`btn ${activeTab === 'infos' ? 'btn-primary' : 'btn-outline-primary'} ${styles.tabButton}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          Infos
        </button>
        <button 
          className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline-primary'} ${styles.tabButton}`}
          onClick={() => setActiveTab('contact')}
        >
          <i className="bi bi-person"></i>
          Contact
        </button>
        <button 
          className={`btn ${activeTab === 'programmateurs' ? 'btn-primary' : 'btn-outline-primary'} ${styles.tabButton}`}
          onClick={() => setActiveTab('programmateurs')}
        >
          <i className="bi bi-person-badge"></i>
          Programmateurs
        </button>
      </div>

      {activeTab === 'infos' && (
        <>
          <div className={styles.structureDetailSection}>
            <h3><i className="bi bi-info-circle"></i> Informations de base</h3>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Nom</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.nom)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Raison sociale</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.raisonSociale)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Type</div>
              <div className={styles.structureDetailValue}>{structure.type ? getTypeLabel(structure.type) : 'Non spécifié'}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>SIRET</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.siret)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>TVA Intracommunautaire</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.tva)}</div>
            </div>
          </div>

          <div className={styles.structureDetailSection}>
            <h3><i className="bi bi-geo-alt"></i> Adresse</h3>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Adresse</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.adresse)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Code postal</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.codePostal)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Ville</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.ville)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Pays</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.pays)}</div>
            </div>
          </div>

          {structure.notes && (
            <div className={styles.structureDetailSection}>
              <h3><i className="bi bi-sticky"></i> Notes</h3>
              <div className={styles.structureDetailItem}>
                <div className={styles.structureDetailValue}>
                  {structure.notes.split('\n').map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'contact' && (
        <>
          <div className={styles.structureDetailSection}>
            <h3><i className="bi bi-telephone"></i> Coordonnées</h3>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Téléphone</div>
              <div className={styles.structureDetailValue}>
                {structure.telephone ? (
                  <a href={`tel:${structure.telephone}`}>
                    <i className="bi bi-telephone"></i>
                    {structure.telephone}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Email</div>
              <div className={styles.structureDetailValue}>
                {structure.email ? (
                  <a href={`mailto:${structure.email}`}>
                    <i className="bi bi-envelope"></i>
                    {structure.email}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Site web</div>
              <div className={styles.structureDetailValue}>
                {structure.siteWeb ? (
                  <a href={structure.siteWeb} target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-globe"></i>
                    {structure.siteWeb}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>

          <div className={styles.structureDetailSection}>
            <h3><i className="bi bi-person"></i> Contact principal</h3>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Nom</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.contact?.nom)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Fonction</div>
              <div className={styles.structureDetailValue}>{formatValue(structure.contact?.fonction)}</div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Téléphone</div>
              <div className={styles.structureDetailValue}>
                {structure.contact?.telephone ? (
                  <a href={`tel:${structure.contact.telephone}`}>
                    <i className="bi bi-telephone"></i>
                    {structure.contact.telephone}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
            
            <div className={styles.structureDetailItem}>
              <div className={styles.structureDetailLabel}>Email</div>
              <div className={styles.structureDetailValue}>
                {structure.contact?.email ? (
                  <a href={`mailto:${structure.contact.email}`}>
                    <i className="bi bi-envelope"></i>
                    {structure.contact.email}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'programmateurs' && (
        <div className={styles.structureDetailSection}>
          <h3><i className="bi bi-person-badge"></i> Programmateurs associés</h3>
          
          {loadingProgrammateurs ? (
            <div className="text-center p-3">
              <div className={styles.spinner} role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : programmateurs.length > 0 ? (
            <div className={styles.programmateursListMobile}>
              {programmateurs.map(prog => (
                <div key={prog.id} className={styles.associatedItem}>
                  <div className={styles.associatedItemInfo}>
                    <div className={styles.associatedItemName}>
                      <i className="bi bi-person-badge"></i>
                      {prog.nom}
                    </div>
                    <div className={styles.associatedItemDetails}>
                      {prog.email && (
                        <a href={`mailto:${prog.email}`}>
                          <i className="bi bi-envelope"></i>
                          {prog.email}
                        </a>
                      )}
                      {prog.telephone && (
                        <a href={`tel:${prog.telephone}`}>
                          <i className="bi bi-telephone"></i>
                          {prog.telephone}
                        </a>
                      )}
                    </div>
                  </div>
                  <Link 
                    to={`/programmateurs/${prog.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
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
      )}

      <div className={styles.structureActionsMobile}>
        <Button
          variant="outline-primary"
          className="flex-fill"
          onClick={() => navigate(`/structures/${id}/edit`)}
        >
          <i className="bi bi-pencil me-2"></i>
          Modifier
        </Button>
        <Button
          variant="outline-danger"
          className="flex-fill"
          onClick={() => setShowDeleteModal(true)}
        >
          <i className="bi bi-trash me-2"></i>
          Supprimer
        </Button>
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