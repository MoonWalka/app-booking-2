import React, { useState, useRef, useEffect } from 'react';
import styles from '../ContactViewTabs.module.css';

/**
 * Section de gestion des commentaires d'un contact
 * Affiche la liste des commentaires avec possibilité de suppression et modification
 */
const ContactCommentsSection = React.memo(({ commentaires = [], onDeleteComment, onEditComment }) => {
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [shouldShowToggleMap, setShouldShowToggleMap] = useState(new Map());
  const commentRefs = useRef(new Map());

  const toggleExpanded = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Vérifier si un commentaire dépasse 2 lignes après le rendu
  useEffect(() => {
    const newMap = new Map();
    commentRefs.current.forEach((ref, commentId) => {
      if (ref) {
        const lineHeight = parseInt(window.getComputedStyle(ref).lineHeight);
        const height = ref.scrollHeight;
        const lines = Math.ceil(height / lineHeight);
        const shouldShow = lines > 2;
        newMap.set(commentId, shouldShow);
        console.log('[ContactCommentsSection] Mesure:', { 
          commentId, 
          height, 
          lineHeight, 
          lines, 
          shouldShow,
          text: ref.textContent?.substring(0, 30) + '...'
        });
      }
    });
    setShouldShowToggleMap(newMap);
  }, [commentaires]);

  return (
    <div className={styles.commentsContent}>
      {commentaires.length > 0 ? (
        <div className={styles.commentsList}>
          {commentaires.map((commentaire, index) => (
            <div key={commentaire.id || `${commentaire.auteur}-${index}`} className={styles.commentItem}>
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
                    className={styles.editCommentButton}
                    onClick={() => onEditComment && onEditComment(commentaire)}
                    title="Modifier ce commentaire"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
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
                <div 
                  ref={(el) => {
                    const commentId = commentaire.id || `${commentaire.auteur}-${index}`;
                    if (el) {
                      commentRefs.current.set(commentId, el);
                    } else {
                      commentRefs.current.delete(commentId);
                    }
                  }}
                  className={expandedComments.has(commentaire.id || `${commentaire.auteur}-${index}`) ? styles.commentContentExpanded : styles.commentContentCollapsed}
                >
                  {commentaire.contenu}
                </div>
                {shouldShowToggleMap.get(commentaire.id || `${commentaire.auteur}-${index}`) && (
                  <button 
                    className={styles.toggleCommentButton}
                    onClick={() => toggleExpanded(commentaire.id || `${commentaire.auteur}-${index}`)}
                  >
                    {expandedComments.has(commentaire.id || `${commentaire.auteur}-${index}`) ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
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
});

ContactCommentsSection.displayName = 'ContactCommentsSection';

export default ContactCommentsSection;