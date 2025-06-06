// components/contacts/EchangeItem.js
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { STATUTS_ECHANGES } from '@/services/historiqueEchangesService';
import classNames from 'classnames';
import styles from './EchangeItem.module.css';

/**
 * Composant pour afficher un échange individuel
 */
function EchangeItem({ echange, onEdit, onDelete, onMarkCompleted, onSetRappel }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRappelInput, setShowRappelInput] = useState(false);
  const [rappelDate, setRappelDate] = useState('');


  // Définir l'icône et la couleur selon le type d'échange
  const getTypeConfig = (type) => {
    switch (type) {
      case 'email':
        return { icon: 'bi-envelope-fill', color: '#0066cc' };
      case 'appel':
        return { icon: 'bi-telephone-fill', color: '#28a745' };
      case 'reunion':
        return { icon: 'bi-people-fill', color: '#6f42c1' };
      case 'sms':
        return { icon: 'bi-chat-dots-fill', color: '#17a2b8' };
      default:
        return { icon: 'bi-chat-left-dots-fill', color: '#6c757d' };
    }
  };

  const typeConfig = getTypeConfig(echange.type);

  // Handler pour définir un rappel
  const handleSetRappel = () => {
    if (rappelDate) {
      onSetRappel(new Date(rappelDate));
      setShowRappelInput(false);
      setRappelDate('');
    }
  };

  // Vérifier si le rappel est proche (dans les 24h)
  const isRappelProche = () => {
    if (!echange.rappel) return false;
    const rappel = new Date(echange.rappel);
    const now = new Date();
    const diff = rappel - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div className={classNames(styles.echangeItem, {
      [styles.rappelProche]: isRappelProche()
    })}>
      {/* Header de l'échange */}
      <div 
        className={styles.header}
        onClick={() => setShowDetails(!showDetails)}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.mainInfo}>
          <div className={styles.typeIconWrapper} style={{ backgroundColor: `${typeConfig.color}15` }}>
            <i className={`${typeConfig.icon} ${styles.typeIcon}`} style={{ color: typeConfig.color }}></i>
          </div>
          
          <div className={styles.info}>
            <div className={styles.topLine}>
              <span className={styles.date}>
                {echange.dateFormatted}
              </span>
              <span className={styles.separator}>•</span>
              <span className={styles.type}>{echange.typeLabel}</span>
              {echange.statut === STATUTS_ECHANGES.PLANIFIE && (
                <Badge variant="warning" size="sm">À faire</Badge>
              )}
              {isRappelProche() && (
                <Badge variant="danger" size="sm">
                  <i className="bi bi-bell-fill"></i>
                  Rappel urgent
                </Badge>
              )}
            </div>
            <h4 className={styles.sujet}>{echange.sujet}</h4>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            icon={<i className={`bi bi-chevron-${showDetails ? 'up' : 'down'}`}></i>}
          />
        </div>
      </div>

      {/* Détails de l'échange */}
      {showDetails && (
        <div className={styles.details}>
          {/* Infos supplémentaires */}
          <div className={styles.detailsInfo}>
            {echange.concertId && (
              <div className={styles.detailItem}>
                <i className="bi bi-music-note-beamed"></i>
                <span>Concert associé</span>
              </div>
            )}
            {echange.rappel && (
              <div className={styles.detailItem}>
                <i className="bi bi-bell"></i>
                <span>Rappel prévu le {echange.rappelFormatted}</span>
              </div>
            )}
          </div>

          {/* Contenu complet */}
          {echange.contenu && (
            <div className={styles.contenu}>
              <h5>Contenu de l'échange</h5>
              <p>{echange.contenu}</p>
            </div>
          )}

          {/* Formulaire de rappel */}
          {showRappelInput && (
            <div className={styles.rappelForm}>
              <label>Définir un rappel :</label>
              <div className={styles.rappelInput}>
                <input
                  type="datetime-local"
                  value={rappelDate}
                  onChange={(e) => setRappelDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className={styles.dateInput}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSetRappel}
                  disabled={!rappelDate}
                >
                  Valider
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRappelInput(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <div className={styles.actionsLeft}>
              {echange.statut === STATUTS_ECHANGES.PLANIFIE && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onMarkCompleted(echange.id)}
                  icon={<i className="bi bi-check-circle"></i>}
                >
                  Marquer comme effectué
                </Button>
              )}

              {!echange.rappel && !showRappelInput && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowRappelInput(true)}
                  icon={<i className="bi bi-bell"></i>}
                >
                  Ajouter un rappel
                </Button>
              )}
            </div>

            <div className={styles.actionsRight}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onEdit(echange)}
                icon={<i className="bi bi-pencil"></i>}
              >
                Modifier
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(echange.id)}
                icon={<i className="bi bi-trash"></i>}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EchangeItem;