import React from 'react';
import styles from './ConcertStatusTabs.module.css';

const ConcertStatusTabs = ({ statusFilter, setStatusFilter, statusDetailsMap }) => {
  // Créez un tableau des onglets à afficher basé sur votre statusDetailsMap
  // ou utilisez une liste statique comme dans la maquette
  const tabs = [
    { id: 'all', label: 'Tous les concerts' },
    { id: 'contact-etabli', label: 'Contact établi' },
    { id: 'pre-accord', label: 'Pré-accord' },
    { id: 'contrat-signe', label: 'Contrat signé' },
    { id: 'acompte-facture', label: 'Acompte facturé' },
    { id: 'solde-facture', label: 'Soldé facturé' },
    { id: 'annule', label: 'Annulé' },
  ];

  return (
    <div className={styles.sectionNav}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`${styles.sectionNavLink} ${statusFilter === tab.id ? styles.active : ''}`}
          onClick={() => setStatusFilter(tab.id)}
        >
          {tab.label}
          {statusDetailsMap && statusDetailsMap[tab.id] && (
            <span className={styles.statusCount}>
              {statusDetailsMap[tab.id].count || 0}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ConcertStatusTabs;
