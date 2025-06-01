import React from 'react';
import Card from '@/components/ui/Card';

/**
 * Composant de section repliable réutilisable
 * Migré vers le composant Card standardisé avec collapsible
 */
const CollapsibleSection = ({ title, isCollapsed, toggleCollapse, children }) => {
  return (
    <Card
      title={title}
      collapsible={true}
      defaultCollapsed={isCollapsed}
      onCollapseToggle={(collapsed) => {
        // Inverser la logique car le composant Card utilise collapsed tandis que l'ancien utilisait isCollapsed
        if (toggleCollapse) {
          toggleCollapse();
        }
      }}
    >
      {children}
    </Card>
  );
};

export default CollapsibleSection;