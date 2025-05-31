import React from 'react';
import PropTypes from 'prop-types';
import styles from './Layout.module.css';

/**
 * Composants de layout standardisés TourCraft
 * Remplacement des composants Bootstrap Container, Row, Col
 */

// Container
export const Container = ({ 
  fluid = false, 
  className = '', 
  children, 
  ...props 
}) => {
  const containerClass = [
    styles.container,
    fluid ? styles.containerFluid : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  fluid: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

// Row
export const Row = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  const rowClass = [
    styles.row,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClass} {...props}>
      {children}
    </div>
  );
};

Row.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

// Col
export const Col = ({ 
  xs, 
  sm, 
  md, 
  lg, 
  xl, 
  className = '', 
  children, 
  ...props 
}) => {
  const colClasses = [
    styles.col,
    xs && styles[`colXs${xs}`],
    sm && styles[`colSm${sm}`],
    md && styles[`colMd${md}`],
    lg && styles[`colLg${lg}`],
    xl && styles[`colXl${xl}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={colClasses} {...props}>
      {children}
    </div>
  );
};

Col.propTypes = {
  xs: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  md: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  xl: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  children: PropTypes.node
};

// Exports par défaut pour compatibilité
const Layout = { Container, Row, Col };
export default Layout;