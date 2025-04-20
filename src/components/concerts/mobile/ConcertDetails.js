// src/components/concerts/mobile/ConcertDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Button, Modal, Badge } from 'react-bootstrap';
import FormGenerator from '../../forms/FormGenerator.js';
import '../../../style/concertDetails.css';
import '../../../style/concertDetailsMobile.css';
import { handleDelete } from './handlers/deleteHandler';


const ConcertDetailsMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [formData, setFormData] = useState(null);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        setLoading(true);
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          setConcert(concertData);
          
          // Récupérer les données du lieu
          if (concertData.lieuId) {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              setLieu({
                id: lieuDoc.id,
                ...lieuDoc.data()
              });
            }
          }
          
          // Récupérer les données du programmateur
          if (concertData.programmateurId) {
            const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
            if (progDoc.exists()) {
              setProgrammateur({
                id: progDoc.id,
                ...progDoc.data()
              });
            }
          }
          
          // Récupérer les données de l'artiste
          if (concertData.artisteId) {
            const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
            if (artisteDoc.exists()) {
              setArtiste({
                id: artisteDoc.id,
                ...artisteDoc.data()
              });
            }
          }
          
          // Vérifier si un formulaire existe
          if (concertData.formId) {
            const formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
            if (formDoc.exists()) {
              setFormData({
                id: formDoc.id,
                ...formDoc.data()
              });
            }
          }
        } else {
          navigate('/concerts');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConcert();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'concerts', id));
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      alert('Une erreur est survenue lors de la suppression du concert.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date
    try {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateValue;
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const getStatusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'contact': return 'info';
      case 'preaccord': return 'primary';
      case 'contrat': return 'success';
      case 'acompte': return 'warning';
      case 'solde': return 'secondary';
      case 'annule': return 'danger';
      default: return 'light';
    }
  };

  const handleFormGenerated = (formId, formUrl) => {
    setGeneratedFormLink(formUrl);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  if (loading) {
    return <div className="loading-container">Chargement du concert...</div>;
  }

  if (!concert) {
    return <div className="error-container">Concert non trouvé</div>;
  }

  return (
    <div className="concert-details-mobile">
      {/* En-tête avec actions */}
      <div className="mobile-header-bar">
        <button 
          className="back-button" 
          onClick={() => navigate('/concerts')}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="mobile-title-container">
          <h1>{concert.titre || `Concert du ${formatDate(concert.date)}`}</h1>
        </div>
        <div className="mobile-actions">
          <button 
            className="edit-button"
            onClick={() => navigate(`/concerts/${id}/edit`)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button 
            className="delete-button"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {/* Onglets pour la navigation mobile */}
      <div className="mobile-tabs">
        <button 
          className={`tab-button ${activeTab === 'infos' ? 'active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          <span>Infos</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'lieu' ? 'active' : ''}`}
          onClick={() => setActiveTab('lieu')}
        >
          <i className="bi bi-geo-alt"></i>
          <span>Lieu</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'programmateur' ? 'active' : ''}`}
          onClick={() => setActiveTab('programmateur')}
        >
          <i className="bi bi-person-badge"></i>
          <span>Prog.</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'artiste' ? 'active' : ''}`}
          onClick={() => setActiveTab('artiste')}
        >
          <i className="bi bi-music-note-beamed"></i>
          <span>Artiste</span>
        </button>
      </div>

      {/* Contenu de l'onglet sélectionné */}
      <div className="mobile-tab-content">
        {activeTab === 'infos' && (
          <div className="info-tab-content">
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{formatDate(concert.date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Montant:</span>
                <span className="info-value">{formatMontant(concert.montant)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Statut:</span>
                <span className="info-value">
                  <Badge bg={getStatusColor(concert.statut)}>
                    {concert.statut || 'Non défini'}
                  </Badge>
                </span>
              </div>
              {concert.notes && (
                <div className="info-item notes">
                  <span className="info-label">Notes:</span>
                  <p className="info-value notes-content">{concert.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lieu' && (
          <div className="lieu-tab-content">
            {lieu ? (
              <div className="lieu-card">
                <h3 className="lieu-name">{lieu.nom}</h3>
                
                {lieu.adresse && (
                  <div className="lieu-address">
                    <i className="bi bi-geo-alt"></i>
                    <div>
                      {lieu.adresse}<br />
                      {lieu.codePostal} {lieu.ville}
                    </div>
                  </div>
                )}
                
                {lieu.capacite && (
                  <div className="lieu-capacity">
                    <i className="bi bi-people"></i>
                    <span>Capacité: {lieu.capacite} personnes</span>
                  </div>
                )}
                
                {lieu.email && (
                  <div className="lieu-contact">
                    <i className="bi bi-envelope"></i>
                    <a href={`mailto:${lieu.email}`}>{lieu.email}</a>
                  </div>
                )}
                
                {lieu.telephone && (
                  <div className="lieu-contact">
                    <i className="bi bi-telephone"></i>
                    <a href={`tel:${lieu.telephone}`}>{lieu.telephone}</a>
                  </div>
                )}
                
                {/* Carte */}
                {lieu.adresse && lieu.ville && (
                  <div className="lieu-map">
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=15&output=embed`}
                      width="100%" 
                      height="200" 
                     
                     frameBorder="0"
                     style={{ borderRadius: '8px', border: '1px solid #dee2e6' }}
                     allowFullScreen=""
                     aria-hidden="false"
                     tabIndex="0"
                   ></iframe>
                 </div>
               )}
               
               <div className="lieu-actions">
                 <Link 
                   to={`/lieux/${lieu.id}`}
                   className="btn btn-outline-primary btn-sm"
                 >
                   <i className="bi bi-eye me-1"></i>
                   Voir les détails
                 </Link>
               </div>
             </div>
           ) : (
             <div className="empty-state">
               <i className="bi bi-geo-alt"></i>
               <p>Aucun lieu associé à ce concert</p>
             </div>
           )}
         </div>
       )}

       {activeTab === 'programmateur' && (
         <div className="programmateur-tab-content">
           {programmateur ? (
             <div className="programmateur-card">
               <h3 className="programmateur-name">{programmateur.nom}</h3>
               
               {programmateur.structure && (
                 <div className="programmateur-structure">
                   <i className="bi bi-building"></i>
                   <span>{programmateur.structure}</span>
                 </div>
               )}
               
               {programmateur.email && (
                 <div className="programmateur-contact">
                   <i className="bi bi-envelope"></i>
                   <a href={`mailto:${programmateur.email}`}>{programmateur.email}</a>
                 </div>
               )}
               
               {programmateur.telephone && (
                 <div className="programmateur-contact">
                   <i className="bi bi-telephone"></i>
                   <a href={`tel:${programmateur.telephone}`}>{programmateur.telephone}</a>
                 </div>
               )}
               
               {/* Formulaire */}
               <div className="form-section">
                 <h4>Formulaire</h4>
                 
                 {formData ? (
                   <div className="form-info">
                     <div className="form-status">
                       <Badge bg={formData.statut === 'valide' ? 'success' : 'warning'}>
                         {formData.statut === 'valide' ? 'Validé' : 'En attente'}
                       </Badge>
                     </div>
                     
                     <Link 
                       to={`/concerts/${id}/form`}
                       className="btn btn-outline-primary btn-sm mt-2"
                     >
                       <i className="bi bi-file-text me-1"></i>
                       Voir le formulaire
                     </Link>
                   </div>
                 ) : (
                   <div className="form-action">
                     <p>Aucun formulaire envoyé.</p>
                     <Button 
                       variant="primary" 
                       size="sm"
                       onClick={() => setShowFormGenerator(true)}
                     >
                       <i className="bi bi-envelope me-1"></i>
                       Envoyer un formulaire
                     </Button>
                   </div>
                 )}
               </div>
               
               <div className="programmateur-actions">
                 <Link 
                   to={`/programmateurs/${programmateur.id}`}
                   className="btn btn-outline-primary btn-sm"
                 >
                   <i className="bi bi-eye me-1"></i>
                   Voir les détails
                 </Link>
               </div>
             </div>
           ) : (
             <div className="empty-state">
               <i className="bi bi-person-badge"></i>
               <p>Aucun programmateur associé à ce concert</p>
             </div>
           )}
         </div>
       )}

       {activeTab === 'artiste' && (
         <div className="artiste-tab-content">
           {artiste ? (
             <div className="artiste-card">
               <h3 className="artiste-name">{artiste.nom}</h3>
               
               {artiste.genre && (
                 <div className="artiste-genre">
                   <i className="bi bi-music-note"></i>
                   <span>{artiste.genre}</span>
                 </div>
               )}
               
               {artiste.description && (
                 <div className="artiste-description">
                   <p>{artiste.description}</p>
                 </div>
               )}
               
               {artiste.contacts && (
                 <div className="artiste-contacts">
                   {artiste.contacts.email && (
                     <div className="artiste-contact">
                       <i className="bi bi-envelope"></i>
                       <a href={`mailto:${artiste.contacts.email}`}>{artiste.contacts.email}</a>
                     </div>
                   )}
                   
                   {artiste.contacts.telephone && (
                     <div className="artiste-contact">
                       <i className="bi bi-telephone"></i>
                       <a href={`tel:${artiste.contacts.telephone}`}>{artiste.contacts.telephone}</a>
                     </div>
                   )}
                 </div>
               )}
               
               <div className="artiste-actions">
                 <Link 
                   to={`/artistes/${artiste.id}`}
                   className="btn btn-outline-primary btn-sm"
                 >
                   <i className="bi bi-eye me-1"></i>
                   Voir les détails
                 </Link>
               </div>
             </div>
           ) : (
             <div className="empty-state">
               <i className="bi bi-music-note-beamed"></i>
               <p>Aucun artiste associé à ce concert</p>
             </div>
           )}
         </div>
       )}
     </div>

     {/* Modal de confirmation de suppression */}
     <Modal 
       show={showDeleteModal} 
       onHide={() => setShowDeleteModal(false)}
       centered
     >
       <Modal.Header closeButton>
         <Modal.Title>Confirmation de suppression</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         Êtes-vous sûr de vouloir supprimer ce concert ? Cette action est irréversible.
       </Modal.Body>
       <Modal.Footer>
         <Button 
           variant="secondary" 
           onClick={() => setShowDeleteModal(false)}
           disabled={deleting}
         >
           Annuler
         </Button>
         <Button 
           variant="danger" 
           onClick={handleDelete}
           disabled={deleting}
         >
           {deleting ? 'Suppression...' : 'Supprimer'}
         </Button>
       </Modal.Footer>
     </Modal>

     {/* Modal du générateur de formulaire */}
     <Modal 
       show={showFormGenerator} 
       onHide={() => {
         setShowFormGenerator(false);
         setGeneratedFormLink(null);
       }}
       centered
     >
       <Modal.Header closeButton>
         <Modal.Title>
           {generatedFormLink ? 'Formulaire généré' : 'Générer un formulaire'}
         </Modal.Title>
       </Modal.Header>
       <Modal.Body>
         {generatedFormLink ? (
           <div>
             <p>Voici le lien du formulaire à envoyer au programmateur :</p>
             <div className="input-group mb-3">
               <input
                 type="text"
                 className="form-control"
                 value={generatedFormLink}
                 readOnly
               />
               <Button 
                 variant="outline-primary"
                 onClick={() => copyToClipboard(generatedFormLink)}
               >
                 <i className="bi bi-clipboard"></i>
               </Button>
             </div>
             
             <div className="form-sharing-options mt-3">
               <p>Partager via :</p>
               <div className="d-flex gap-2">
                 <a 
                   href={`mailto:${programmateur?.email || ''}?subject=Formulaire pour le concert du ${formatDate(concert.date)}&body=Bonjour,%0D%0A%0D%0AVeuillez remplir le formulaire pour le concert prévu le ${formatDate(concert.date)} en cliquant sur ce lien : ${generatedFormLink}%0D%0A%0D%0AMerci.`} 
                   className="btn btn-outline-secondary"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <i className="bi bi-envelope me-1"></i>
                   Email
                 </a>
                 <a 
                   href={`https://wa.me/?text=Formulaire pour le concert du ${formatDate(concert.date)} : ${generatedFormLink}`} 
                   className="btn btn-outline-success"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <i className="bi bi-whatsapp me-1"></i>
                   WhatsApp
                 </a>
               </div>
             </div>
           </div>
         ) : (
           <FormGenerator
             concertId={id}
             programmateurId={concert.programmateurId}
             onFormGenerated={handleFormGenerated}
           />
         )}
       </Modal.Body>
       <Modal.Footer>
         <Button 
           variant="secondary" 
           onClick={() => {
             setShowFormGenerator(false);
             setGeneratedFormLink(null);
           }}
         >
           Fermer
         </Button>
         {generatedFormLink && (
           <Button 
             variant="primary" 
             onClick={() => {
               setGeneratedFormLink(null);
             }}
           >
             Générer un nouveau lien
           </Button>
         )}
       </Modal.Footer>
     </Modal>
   </div>
 );
};

export default ConcertDetailsMobile;
