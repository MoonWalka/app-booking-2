import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from './CommentModal.module.css';

/**
 * Modal pour créer ou éditer un commentaire
 * @param {Object} props
 * @param {boolean} props.show - Afficher ou non la modal
 * @param {Function} props.onHide - Fonction de fermeture
 * @param {Function} props.onSave - Fonction de sauvegarde avec (contenu, id?)
 * @param {Object} props.comment - Commentaire à éditer (optionnel)
 * @param {string} props.title - Titre de la modal (optionnel)
 */
function CommentModal({ show, onHide, onSave, comment = null, title = null }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialiser le contenu si on édite un commentaire existant
  useEffect(() => {
    if (comment) {
      setContent(comment.contenu || '');
    } else {
      setContent('');
    }
  }, [comment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    setLoading(true);

    try {
      // Appeler la fonction de sauvegarde avec le contenu et l'ID si modification
      await onSave(content, comment?.id);
      
      // Réinitialiser et fermer
      setContent('');
      onHide();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du commentaire:', error);
      alert('Erreur lors de la sauvegarde du commentaire');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-chat-quote me-2"></i>
          {title || (comment ? 'Modifier le commentaire' : 'Nouveau commentaire')}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Commentaire</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre commentaire ici..."
              className={styles.textarea}
              autoFocus
              required
            />
            <Form.Text className="text-muted">
              Vous pouvez utiliser ce champ pour noter des informations importantes sur ce contact.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !content.trim()}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i>
                {comment ? 'Modifier' : 'Enregistrer'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CommentModal;