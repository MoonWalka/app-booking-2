import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/programmateurForm.css';

const ProgrammateurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', id));
        if (progDoc.exists()) {
          setProgrammateur({
            id: progDoc.id,
            ...progDoc.data()
          });
        } else {
          console.error('Programmateur non trouvé');
          setError('Programmateur non trouvé');
          navigate('/programmateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du programmateur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        navigate('/programmateurs');
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  // Fonction pour basculer en mode édition
  const toggleEditMode = () => {
    if (isEditing) {
      // Si on quitte le mode édition, on revient à la vue détaillée
      setIsEditing(false);
    } else {
      // Si on veut éditer, on peut soit:
      // 1. Passer en mode édition dans ce composant
      setIsEditing(true);
      // 2. OU naviguer vers la page d'édition (ancienne approche)
      // navigate(`/programmateurs/edit/${id}`);
    }
  };

  // Fonction pour formater les données pour affichage
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-muted">Non spécifié</span>;
    }
    return value;
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (!programmateur) {
    return <div className="alert alert-warning my-5">Programmateur non trouvé</div>;
  }

  // Si on est en mode édition, on redirige vers le formulaire
  if (isEditing) {
    return (
      <iframe 
        src={`/programmateurs/edit/${id}`} 
        style={{width: '100%', height: 'calc(100vh - 100px)', border: 'none'}}
        title="Formulaire d'édition"
      />
    );
  }
  
  // Extraire les données de contact et structure de l'objet programmateur
  const extractData = () => {
    // Créer les objets contact et structure à partir des données du programmateur
    const contact = {
      nom: programmateur.nom?.split(' ')[0] || '',
      prenom: programmateur.prenom || (programmateur.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
      fonction: programmateur.fonction || '',
      email: programmateur.email || '',
      telephone: programmateur.telephone || ''
    };
    
    const structure = {
      raisonSociale: programmateur.structure || '',
      type: programmateur.structureType || '',
      adresse: programmateur.structureAdresse || '',
      codePostal: programmateur.structureCodePostal || '',
      ville: programmateur.structureVille || '',
      pays: programmateur.structurePays || 'France',
      siret: programmateur.siret || '',
      tva: programmateur.tva || ''
    };
    
    return { contact, structure };
  };
  
  const { contact, structure } = extractData();
  
  return (
    <div className="programmateur-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="modern-title">{programmateur.nom}</h2>
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate('/programmateurs')}>Programmateurs</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{programmateur.nom}</span>
          </div>
        </div>
        <div>
          <Link to="/programmateurs" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>
            Retour
          </Link>
          <button 
            onClick={toggleEditMode} 
            className="btn btn-outline-primary me-2"
          >
            <i className="bi bi-pencil me-1"></i>
            Modifier
          </button>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            <i className="bi bi-trash me-1"></i>
            Supprimer
          </button>
        </div>
      </div>

      {/* Section Informations du contact */}
      <div className="form-card">
        <div className="card-header">
          <i className="bi bi-person-vcard"></i>
          <h3>Informations du contact</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Nom</label>
                <p className="form-display">{formatValue(contact.nom)}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <p className="form-display">{formatValue(contact.prenom)}</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fonction</label>
            <p className="form-display">{formatValue(contact.fonction)}</p>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Email</label>
                <p className="form-display">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="email-link">
                      <i className="bi bi-envelope me-1"></i>
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted">Non spécifié</span>
                  )}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <p className="form-display">
                  {contact.telephone ? (
                    <a href={`tel:${contact.telephone}`} className="phone-link">
                      <i className="bi bi-telephone me-1"></i>
                      {contact.telephone}
                    </a>
                  ) : (
                    <span className="text-muted">Non spécifié</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Structure juridique */}
      <div className="form-card">
        <div className="card-header">
          <i className="bi bi-building"></i>
          <h3>Structure juridique</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-7">
              <div className="form-group">
                <label className="form-label">Raison sociale</label>
                <p className="form-display">{formatValue(structure.raisonSociale)}</p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="form-group">
                <label className="form-label">Type de structure</label>
                <p className="form-display">
                  {formatValue(structure.type ? (
                    structure.type === 'association' ? 'Association' :
                    structure.type === 'mairie' ? 'Mairie / Collectivité' :
                    structure.type === 'entreprise' ? 'Entreprise' :
                    structure.type === 'auto-entrepreneur' ? 'Auto-entrepreneur' :
                    structure.type
                  ) : '')}
                </p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse complète</label>
            <p className="form-display">{formatValue(structure.adresse)}</p>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Code postal</label>
                <p className="form-display">{formatValue(structure.codePostal)}</p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="form-group">
                <label className="form-label">Ville</label>
                <p className="form-display">{formatValue(structure.ville)}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Pays</label>
                <p className="form-display">{formatValue(structure.pays)}</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">SIRET</label>
                <p className="form-display">{formatValue(structure.siret)}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">N° TVA intracommunautaire</label>
                <p className="form-display">{formatValue(structure.tva)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Concerts associés */}
      <div className="form-card">
        <div className="card-header">
          <i className="bi bi-music-note-list"></i>
          <h3>Concerts associés</h3>
        </div>
        <div className="card-body">
          <div className="associated-concerts">
            <h4 className="mb-3 concerts-title">
              {programmateur.concertsAssocies?.length > 0 
                ? `Concerts associés (${programmateur.concertsAssocies.length})` 
                : 'Aucun concert associé'}
            </h4>
            
            {programmateur.concertsAssocies?.length > 0 ? (
              <div className="concert-list">
                {programmateur.concertsAssocies.map(concert => (
                  <div key={concert.id} className="concert-card">
                    <div className="concert-card-body">
                      <div className="concert-info">
                        <h5 className="concert-name">
                          <i className="bi bi-music-note me-2"></i>
                          <Link to={`/concerts/${concert.id}`}>{concert.titre}</Link>
                        </h5>
                        <div className="concert-details">
                          {concert.date && (
                            <span className="concert-detail">
                              <i className="bi bi-calendar-event"></i>
                              {typeof concert.date === 'object' && concert.date.seconds
                                ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR')
                                : concert.date}
                            </span>
                          )}
                          {concert.lieu && (
                            <span className="concert-detail">
                              <i className="bi bi-geo-alt"></i>
                              {concert.lieu}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Aucun concert n'est associé à ce programmateur.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammateurDetails;
