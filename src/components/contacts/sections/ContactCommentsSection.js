import React from 'react';
import styles from '../ContactViewTabs.module.css';

/**
 * Section de gestion des commentaires d'un contact
 * Affiche la liste des commentaires avec possibilité de suppression
 */
function ContactCommentsSection({ commentaires = [], onDeleteComment }) {
  return (
    <div className={styles.commentsContent}>
      {commentaires.length > 0 ? (
        <div className={styles.commentsList}>
          {commentaires.map((commentaire) => (
            <div key={commentaire.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div className={styles.commentAuthor}>
                  <i className="bi bi-person-circle"></i>
                  <span>{commentaire.auteur}</span>
                  {commentaire.type === 'personne_comment' && commentaire.personneContext && (
                    <span className={styles.commentPersonContext}>
                      <i className="bi bi-person" style={{ marginLeft: '8px', color: '#6f42c1' }}></i>
                      <span style={{ color: '#6f42c1', fontSize: '0.85rem' }}>
                        {commentaire.personneContext.prenom} {commentaire.personneContext.nom}
                      </span>
                    </span>
                  )}
                </div>
                <div className={styles.commentDate}>
                  <i className="bi bi-calendar3"></i>
                  <span>
                    {commentaire.date?.toDate ? 
                      commentaire.date.toDate().toLocaleDateString('fr-FR') : 
                      new Date(commentaire.date).toLocaleDateString('fr-FR')
                    }
                  </span>
                  {commentaire.modifie && (
                    <i className="bi bi-pencil-fill" title="Modifié"></i>
                  )}
                  <button 
                    className={styles.deleteCommentButton}
                    onClick={() => onDeleteComment(commentaire)}
                    title="Supprimer ce commentaire"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
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
          <i className="bi bi-chat-quote" style={{ fontSize: '2rem', color: 'var(--tc-text-secondary)' }}></i>
          <p>Aucun commentaire</p>
          <small>Cliquez sur + pour ajouter votre premier commentaire</small>
        </div>
      )}
    </div>
  );
}

export default ContactCommentsSection;