import React from 'react';
import PropTypes from 'prop-types';
import styles from './FlexContainer.module.css';

/**
 * FlexContainer - Composant standardisé TourCraft pour remplacer les classes d-flex Bootstrap
 * 
 * Ce composant offre une API simple et cohérente pour tous les layouts flexbox
 * en respectant les standards CSS TourCraft.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu du conteneur
 * @param {string} [props.direction='row'] - Direction du flex (row, column, row-reverse, column-reverse)
 * @param {string} [props.justify='flex-start'] - Justification (flex-start, center, flex-end, space-between, space-around, space-evenly)
 * @param {string} [props.align='stretch'] - Alignement (stretch, flex-start, center, flex-end, baseline)
 * @param {string} [props.wrap='nowrap'] - Comportement de retour à la ligne (nowrap, wrap, wrap-reverse)
 * @param {string} [props.gap='none'] - Espacement entre les éléments (none, xs, sm, md, lg, xl)
 * @param {boolean} [props.inline=false] - Utiliser display: inline-flex au lieu de flex
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {Object} [props.style={}] - Styles inline supplémentaires
 * @param {string} [props.as='div'] - Élément HTML à utiliser
 */
const FlexContainer = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 'none',
  inline = false,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) => {
  // Construction des classes CSS
  const containerClasses = [
    inline ? styles.inlineFlex : styles.flex,
    styles[`direction-${direction}`],
    styles[`justify-${justify}`],
    styles[`align-${align}`],
    styles[`wrap-${wrap}`],
    gap !== 'none' && styles[`gap-${gap}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={containerClasses}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

FlexContainer.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['row', 'column', 'row-reverse', 'column-reverse']),
  justify: PropTypes.oneOf([
    'flex-start', 'center', 'flex-end', 
    'space-between', 'space-around', 'space-evenly'
  ]),
  align: PropTypes.oneOf(['stretch', 'flex-start', 'center', 'flex-end', 'baseline']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
  gap: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  inline: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  as: PropTypes.elementType
};

export default FlexContainer; 