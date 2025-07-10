import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import './RelationCard.module.css';

/**
 * Composant générique pour afficher une relation sous forme de carte
 * Conçu pour éviter les boucles infinies en limitant l'affichage aux données essentielles
 * 
 * @param {Object} entity - L'entité à afficher
 * @param {string} type - Le type d'entité (artiste, lieu, contact, etc.)
 * @param {Function} onClick - Fonction appelée au clic (optionnelle)
 * @param {boolean} showBadge - Afficher le badge de type (par défaut: true)
 * @param {string} className - Classes CSS additionnelles
 */
const RelationCard = ({ 
  entity, 
  type, 
  onClick, 
  showBadge = true, 
  className = '' 
}) => {
  const navigate = useNavigate();
  
  if (!entity) return null;
  
  // Extraire les informations principales selon le type
  const getDisplayInfo = () => {
    switch (type) {
      case 'artiste':
        return {
          title: entity.nom || 'Artiste sans nom',
          subtitle: entity.style || '',
          icon: 'bi-music-note-beamed'
        };
      
      case 'lieu':
        return {
          title: entity.nom || 'Lieu sans nom',
          subtitle: entity.ville || entity.adresse?.ville || '',
          icon: 'bi-geo-alt'
        };
      
      case 'contact':
        return {
          title: entity.nom || 'Contact sans nom',
          subtitle: entity.structure?.nom || entity.email || '',
          icon: 'bi-person'
        };
      
      case 'structure':
        return {
          title: entity.nom || 'Structure sans nom',
          subtitle: entity.type || '',
          icon: 'bi-building'
        };
      
      case 'date':
        return {
          title: entity.titre || 'Date sans titre',
          subtitle: entity.date ? new Date(entity.date).toLocaleDateString('fr-FR') : '',
          icon: 'bi-calendar-event'
        };
      
      default:
        return {
          title: entity.nom || entity.titre || 'Sans nom',
          subtitle: '',
          icon: 'bi-card-text'
        };
    }
  };
  
  const { title, subtitle, icon } = getDisplayInfo();
  
  const handleClick = () => {
    if (onClick) {
      onClick(entity.id);
    } else {
      // Navigation par défaut si pas de onClick fourni
      const routes = {
        artiste: '/artistes',
        lieu: '/lieux',
        contact: '/contacts',
        structure: '/structures',
        date: '/dates'
      };
      
      const basePath = routes[type] || '';
      if (basePath && entity.id) {
        navigate(`${basePath}/${entity.id}`);
      }
    }
  };
  
  return (
    <Card 
      className={`relation-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relation-card__content">
        <div className="relation-card__icon">
          <i className={`bi ${icon}`}></i>
        </div>
        
        <div className="relation-card__info">
          <h4 className="relation-card__title">{title}</h4>
          {subtitle && (
            <p className="relation-card__subtitle">{subtitle}</p>
          )}
        </div>
        
        {showBadge && (
          <div className="relation-card__badge">
            <Badge variant="info" size="small">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RelationCard;