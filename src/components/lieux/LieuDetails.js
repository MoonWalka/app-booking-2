import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Badge from 'react-bootstrap/Badge';
import '../../style/lieuDetails.css'; // Nouveau fichier CSS pour les styles

const LieuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieu = async () => {
      setLoading(true);
      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', id));
        if (lieuDoc.exists()) {
          setLieu({
            id: lieuDoc.id,
            ...lieuDoc.data()
          });
        } else {
          console.error('Lieu non trouvé');
          navigate('/lieux');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du lieu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieu();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        navigate('/lieux');
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  // Composant pour afficher un badge de type
  const TypeBadge = ({ type }) => {
    if (!type) return null;
    
    let variant = 'secondary';
    
    switch (type.toLowerCase()) {
      case 'bar':
        variant = 'info';
        break;
      case 'festival':
        variant = 'danger';
        break;
      case 'salle':
        variant = 'success';
        break;
      case 'plateau':
        variant = 'warning';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant} className="type-badge">{type}</Badge>;
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement du lieu...</div>;
  }

  if (!lieu) {
    return (
      <div className="lieu-details-container">
        <div className="alert alert-danger modern-alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Lieu non trouvé
        </div>
        <div className="text-center mt-4">
          <Link to="/lieux" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Retour à la liste des lieux
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lieu-details-container">
      <div className="details-header-container">
        <div className="title-container">
          <div className="breadcrumb-container mb-2">
            <span className="breadcrumb-item" onClick={() => navigate('/lieux')}>Lieux</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{lieu.nom}</span>
          </div>
          <h2 className="modern-title">
            {lieu.nom}
            {lieu.type && <TypeBadge type={lieu.type} />}
          </h2>
        </div>
        <div className="action-buttons">
          <Link to="/lieux" className="btn btn-outline-secondary action-btn">
            <i className="bi bi-arrow-left"></i>
            <span className="btn-text">Retour</span>
          </Link>
          <Link to={`/lieux/edit/${id}`} className="btn btn-outline-primary action-btn">
            <i className="bi bi-pencil"></i>
            <span className="btn-text">Modifier</span>
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger action-btn">
            <i className="bi bi-trash"></i>
            <span className="btn-text">Supprimer</span>
          </button>
        </div>
      </div>

      <div className="row details-content">
        <div className="col-md-8">
          <div className="detail-card">
            <div className="card-header">
              <i className="bi bi-building"></i>
              <h3>Informations générales</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <div className="info-label">
                  <i className="bi bi-geo-alt text-primary"></i>
                  Adresse
                </div>
                <div className="info-value">{lieu.adresse}</div>
              </div>
              
              <div className="info-group">
                <div className="info-row">
                  <div className="info-label">Code postal</div>
                  <div className="info-value">{lieu.codePostal}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Ville</div>
                  <div className="info-value">{lieu.ville}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Pays</div>
                  <div className="info-value">{lieu.pays}</div>
                </div>
              </div>
              
              {lieu.capacite && (
                <div className="info-row">
                  <div className="info-label">
                    <i className="bi bi-people text-primary"></i>
                    Capacité
                  </div>
                  <div className="info-value highlight">
                    {lieu.capacite} personnes
                  </div>
                </div>
              )}
            </div>
          </div>

          {lieu.contact && (lieu.contact.nom || lieu.contact.telephone || lieu.contact.email) && (
            <div className="detail-card">
              <div className="card-header">
                <i className="bi bi-person-lines-fill"></i>
                <h3>Contact</h3>
              </div>
              <div className="card-body">
                {lieu.contact.nom && (
                  <div className="info-row">
                    <div className="info-label">
                      <i className="bi bi-person text-primary"></i>
                      Personne à contacter
                    </div>
                    <div className="info-value">{lieu.contact.nom}</div>
                  </div>
                )}
                {lieu.contact.telephone && (
                  <div className="info-row">
                    <div className="info-label">
                      <i className="bi bi-telephone text-primary"></i>
                      Téléphone
                    </div>
                    <div className="info-value">
                      <a href={`tel:${lieu.contact.telephone}`} className="contact-link">
                        {lieu.contact.telephone}
                      </a>
                    </div>
                  </div>
                )}
                {lieu.contact.email && (
                  <div className="info-row">
                    <div className="info-label">
                      <i className="bi bi-envelope text-primary"></i>
                      Email
                    </div>
                    <div className="info-value">
                      <a href={`mailto:${lieu.contact.email}`} className="contact-link">
                        {lieu.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          <div className="detail-card summary-card">
            <div className="card-header">
              <i className="bi bi-info-circle"></i>
              <h3>Résumé</h3>
            </div>
            <div className="card-body">
              <div className="summary-item">
                <div className="summary-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className="summary-details">
                  <div className="summary-label">Créé le</div>
                  <div className="summary-value">
                    {lieu.createdAt ? new Date(lieu.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Non disponible'}
                  </div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <div className="summary-details">
                  <div className="summary-label">Dernière modification</div>
                  <div className="summary-value">
                    {lieu.updatedAt ? new Date(lieu.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Non disponible'}
                  </div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">
                  <i className="bi bi-geo"></i>
                </div>
                <div className="summary-details">
                  <div className="summary-label">Localisation</div>
                  <div className="summary-value">
                    {lieu.ville}, {lieu.pays}
                  </div>
                </div>
              </div>
              
              {lieu.type && (
                <div className="summary-item">
                  <div className="summary-icon">
                    <i className="bi bi-tag"></i>
                  </div>
                  <div className="summary-details">
                    <div className="summary-label">Type</div>
                    <div className="summary-value">
                      <TypeBadge type={lieu.type} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="card-footer">
              <a 
                href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}, ${lieu.pays}`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm w-100"
              >
                <i className="bi bi-map me-2"></i>
                Voir sur Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuDetails;
