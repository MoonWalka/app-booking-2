import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AddButton.module.css';

/**
 * Composant bouton d'ajout standardisé pour TourCraft
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.to - URL de destination (pour Link)
 * @param {Function} props.onClick - Fonction de clic (pour button)
 * @param {string} props.children - Texte du bouton
 * @param {string} props.icon - Classe d'icône Bootstrap (défaut: "bi-plus-lg")
 * @param {string} props.variant - Variante de style (défaut: "primary")
 * @param {string} props.size - Taille du bouton (défaut: "base")
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {boolean} props.disabled - Bouton désactivé
 * @param {string} props.ariaLabel - Label d'accessibilité
 */
const AddButton = ({
  to,
  onClick,
  children,
  icon = "bi-plus-lg",
  variant = "primary",
  size = "base",
  className = "",
  disabled = false,
  ariaLabel,
  ...props
}) => {
  const buttonClasses = [
    styles.addButton,
    styles[`addButton--${variant}`],
    styles[`addButton--${size}`],
    disabled && styles['addButton--disabled'],
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <i className={icon} aria-hidden="true"></i>
      {children}
    </>
  );

  // Si 'to' est fourni, utiliser Link
  if (to && !disabled) {
    return (
      <Link 
        to={to}
        className={buttonClasses}
        aria-label={ariaLabel || children}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Sinon, utiliser button
  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children}
      {...props}
    >
      {content}
    </button>
  );
};

export default AddButton; 