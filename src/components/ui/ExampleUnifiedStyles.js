import React from 'react';
import styles from './ExampleUnifiedStyles.module.css';

/**
 * Composant exemple montrant l'utilisation du système de design unifié
 * À utiliser comme référence pour la migration des autres composants
 */
const ExampleUnifiedStyles = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Exemple de Design Unifié</h1>
      
      {/* Boutons standardisés */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Boutons</h2>
        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.buttonPrimary}`}>
            Primaire
          </button>
          <button className={`${styles.button} ${styles.buttonSecondary}`}>
            Secondaire
          </button>
          <button className={`${styles.button} ${styles.buttonDanger}`}>
            Danger
          </button>
        </div>
      </section>

      {/* Cards standardisées */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cards</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Card Title</h3>
            <p className={styles.cardText}>
              Contenu de la card utilisant les variables CSS unifiées.
            </p>
          </div>
        </div>
      </section>

      {/* Formulaires standardisés */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Formulaires</h2>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nom</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Entrez votre nom"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              className={styles.input}
              placeholder="email@exemple.com"
            />
          </div>
        </form>
      </section>

      {/* États et alertes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Alertes</h2>
        <div className={styles.alert}>Message d'information</div>
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          Succès !
        </div>
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          Erreur !
        </div>
      </section>
    </div>
  );
};

export default ExampleUnifiedStyles;