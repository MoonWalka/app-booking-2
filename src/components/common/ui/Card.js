import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

/**
 * Composant Card standardisé
 * Un composant de carte modulaire avec des sous-composants pour l'en-tête, le corps, le pied, et les médias
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} [props.variant='default'] - La variante de la carte ('default', 'outlined', 'elevated')
 * @param {string} [props.elevation='medium'] - Le niveau d'élévation ('none', 'low', 'medium', 'high')
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @param {string} [props.id] - ID HTML pour le composant
 * @param {Object} [props.style] - Styles inline additionnels
 */
const Card = ({
  children,
  variant = 'default',
  elevation = 'medium',
  className = '',
  id,
  style = {},
  ...props
}) => {
  const cardClasses = [
    'tc-card',
    `tc-card--${variant}`,
    elevation !== 'none' && `tc-card--elevation-${elevation}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      id={id}
      className={cardClasses} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * En-tête de la carte
 */
const CardHeader = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  id,
  style = {},
  icon,
  ...props
}) => {
  const headerClasses = [
    'tc-card__header',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      id={id}
      className={headerClasses} 
      style={style}
      {...props}
    >
      <div className="tc-card__header-content">
        {icon && <div className="tc-card__header-icon">{icon}</div>}
        <div className="tc-card__header-titles">
          {title && (typeof title === 'string' ? <h3 className="tc-card__title">{title}</h3> : title)}
          {subtitle && (typeof subtitle === 'string' ? <p className="tc-card__subtitle">{subtitle}</p> : subtitle)}
        </div>
      </div>
      {action && <div className="tc-card__header-action">{action}</div>}
      {children}
    </div>
  );
};

/**
 * Corps de la carte
 */
const CardBody = ({
  children,
  className = '',
  id,
  style = {},
  ...props
}) => {
  const bodyClasses = [
    'tc-card__body',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      id={id}
      className={bodyClasses} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Pied de la carte
 */
const CardFooter = ({
  children,
  className = '',
  id,
  style = {},
  ...props
}) => {
  const footerClasses = [
    'tc-card__footer',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      id={id}
      className={footerClasses} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Section média de la carte (images, vidéos, etc.)
 */
const CardMedia = ({
  children,
  src,
  alt = '',
  top = false,
  className = '',
  id,
  style = {},
  ...props
}) => {
  const mediaClasses = [
    'tc-card__media',
    top ? 'tc-card__media--top' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      id={id}
      className={mediaClasses} 
      style={style}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="tc-card__media-img" />
      ) : (
        children
      )}
    </div>
  );
};

// PropTypes
Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  elevation: PropTypes.oneOf(['none', 'low', 'medium', 'high']),
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object
};

CardHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  action: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object,
  icon: PropTypes.node
};

CardBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object
};

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object
};

CardMedia.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  alt: PropTypes.string,
  top: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object
};

// Attacher les sous-composants à Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;

export default Card;