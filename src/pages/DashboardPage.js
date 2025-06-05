import React from 'react';
import RelancesTracker from '@/components/relances/RelancesTracker';
import styles from './Dashboard.module.css';

const DashboardPage = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Vue d'ensemble de votre activité</p>
      </div>

      {/* Section Relances - Maintenant en position principale */}
      <div className={styles.mainContent}>
        <RelancesTracker />
      </div>
    </div>
  );
};

export default DashboardPage;
