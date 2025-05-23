import React from 'react';
import Button from '@ui/Button';
import styles from './UserGuide.module.css';

/**
 * Composant du guide d'utilisation pour l'éditeur de modèle
 */
const UserGuide = ({ onClose }) => (
  <div className={styles.userGuide}>
    <div className={styles.guideHeader}>
      <h3 className={styles.guideTitle}>Mode d'emploi de l'éditeur de modèles de contrat</h3>
      <Button 
        variant="outline-secondary"
        size="sm"
        onClick={onClose}
      >
        <i className="bi bi-x-lg"></i>
      </Button>
    </div>
    
    <div className={styles.guideContent}>
      <div className={styles.guideSection}>
        <h4>1. Structure du modèle</h4>
        <p>Votre modèle de contrat est divisé en trois parties principales :</p>
        <ul>
          <li><strong>En-tête</strong> : Apparaît en haut de chaque page</li>
          <li><strong>Corps</strong> : Contenu principal du contrat</li>
          <li><strong>Pied de page</strong> : Apparaît en bas de chaque page</li>
        </ul>
      </div>
      
      <div className={styles.guideSection}>
        <h4>2. Type de modèle</h4>
        <p>Choisissez le type qui correspond le mieux à votre contrat :</p>
        <ul>
          <li><strong>Session standard</strong> : Pour un concert unique</li>
          <li><strong>Co-réalisation</strong> : Partage des recettes</li>
          <li><strong>Dates multiples</strong> : Plusieurs représentations</li>
          <li><strong>Résidence artistique</strong> : Pour les résidences</li>
          <li><strong>Atelier / Workshop</strong> : Pour les activités pédagogiques</li>
        </ul>
      </div>
      
      <div className={styles.guideSection}>
        <h4>3. Utiliser les variables</h4>
        <p>Les variables sont remplacées par les vraies données lors de la génération du contrat :</p>
        <ul>
          <li>Cliquez sur une variable dans la liste pour l'insérer à l'endroit du curseur</li>
          <li>Les variables sont indiquées entre accolades, par exemple {'{programmateur_nom}'}</li>
          <li>Lors de la génération, {'{programmateur_nom}'} sera remplacé par le nom du programmateur</li>
        </ul>
      </div>
      
      <div className={styles.guideSection}>
        <h4>4. Gestion des sauts de page</h4>
        <p>Pour éviter qu'un article soit coupé entre deux pages :</p>
        <ul>
          <li>Insérez la balise <strong>[SAUT_DE_PAGE]</strong> là où vous voulez forcer un saut de page</li>
          <li>Placez les sauts de page entre vos articles ou sections principales</li>
          <li>Vérifiez le rendu dans l'aperçu avant de finaliser votre modèle</li>
        </ul>
        <p><strong>Astuce</strong> : Dans l'aperçu, les sauts de page sont représentés par une ligne pointillée.</p>
      </div>
    </div>
  </div>
);

export default UserGuide;