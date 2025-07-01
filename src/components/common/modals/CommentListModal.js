import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { personnesService } from '@/services/contacts/personnesService';
import styles from './CommentListModal.module.css';

/**
 * Modal pour afficher la liste des commentaires d'une personne
 * avec possibilité d'ajouter un nouveau commentaire
 */
function CommentListModal({ 
  show, 
  onHide, 
  personneId, 
  personneNom, 
  onAddComment 
}) {
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les commentaires de la personne
  useEffect(() => {
    const loadCommentaires = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[CommentListModal] Chargement commentaires pour:', personneId);
        
        const result = await personnesService.getPersonne(personneId);
        
        if (result.success && result.data) {
          const data = result.data;
          const comments = data.commentaires || [];
          
          // Trier par date (plus récent en premier)
          const sortedComments = comments.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA;
          });
          
          setCommentaires(sortedComments);
          console.log('[CommentListModal] Commentaires chargés:', sortedComments.length);
        } else {
          console.warn('[CommentListModal] Personne non trouvée');
          setError('Fiche personne non trouvée');
        }
      } catch (err) {
        console.error('[CommentListModal] Erreur chargement commentaires:', err);
        setError('Erreur lors du chargement des commentaires');
      } finally {
        setLoading(false);
      }
    };

    if (show && personneId) {
      loadCommentaires();
    }
  }, [show, personneId]);

  const handleAddComment = () => {
    console.log('[CommentListModal] Ajout nouveau commentaire');
    
    // Fermer cette modal et ouvrir la modal de création
    onHide();
    
    // Délai pour éviter le conflit de modals
    setTimeout(() => {
      onAddComment();
    }, 100);
  };

  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-chat-quote me-2"></i>
          Commentaires - {personneNom}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2 text-muted">Chargement des commentaires...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : commentaires.length > 0 ? (
          <div className={styles.commentsList}>
            {commentaires.map((commentaire, index) => (
              <div key={commentaire.id || index} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAuthor}>
                    <i className="bi bi-person-circle text-primary"></i>
                    <span className="fw-medium">{commentaire.auteur}</span>
                  </div>
                  <div className={styles.commentDate}>
                    <i className="bi bi-calendar3 text-muted"></i>
                    <span className="text-muted small">
                      {formatDate(commentaire.date)}
                    </span>
                    {commentaire.modifie && (
                      <span className="badge bg-secondary ms-2" title="Commentaire modifié">
                        <i className="bi bi-pencil-fill"></i>
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.commentContent}>
                  {commentaire.contenu}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyComments}>
            <i className="bi bi-chat-quote" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <h5 className="text-muted mt-3">Aucun commentaire</h5>
            <p className="text-muted">
              Cette personne n'a pas encore de commentaires.
            </p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          <small className="text-muted">
            {commentaires.length > 0 && (
              <>
                <i className="bi bi-info-circle me-1"></i>
                {commentaires.length} commentaire{commentaires.length > 1 ? 's' : ''}
              </>
            )}
          </small>
        </div>
        <div>
          <Button variant="secondary" onClick={onHide} className="me-2">
            Fermer
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un commentaire
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CommentListModal;