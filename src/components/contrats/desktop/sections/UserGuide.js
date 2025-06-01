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
        <p>Votre modèle de contrat contient le contenu principal du document :</p>
        <ul>
          <li><strong>Nom du modèle</strong> : Identifie votre modèle dans la liste</li>
          <li><strong>Type de contrat</strong> : Catégorise votre modèle selon son usage</li>
          <li><strong>Contenu</strong> : Le corps complet du contrat avec mise en forme</li>
        </ul>
      </div>
      
      <div className={styles.guideSection}>
        <h4>2. Types de contrat disponibles</h4>
        <p>Choisissez le type qui correspond le mieux à votre contrat :</p>
        <ul>
          <li><strong>Contrat de cession</strong> : Le plus courant - L'organisateur achète un spectacle clé en main</li>
          <li><strong>Contrat de résidence</strong> : Accueil de l'artiste sur une période donnée avec accompagnement</li>
          <li><strong>Contrat de coréalisation</strong> : Partage des risques et des recettes entre producteur et lieu</li>
          <li><strong>Contrat de coproduction</strong> : Le lieu finance une partie de la création et devient coproducteur</li>
          <li><strong>Contrat de travail (CDD d'usage)</strong> : Embauche directe de l'artiste via GUSO ou société de paie</li>
          <li><strong>Autre type de contrat</strong> : Pour les cas particuliers non couverts</li>
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
      
      <div className={styles.guideSection}>
        <h4>5. Importer un modèle existant</h4>
        <p>Vous pouvez importer un modèle depuis un fichier externe :</p>
        <ul>
          <li>Cliquez sur <strong>"Importer fichier"</strong> pour charger un fichier .txt, .md ou .rtf</li>
          <li>Le contenu sera automatiquement formaté et importé dans l'éditeur</li>
          <li>Utilisez <strong>"Corriger l'interligne"</strong> après un copier-coller depuis Google Docs pour nettoyer le formatage</li>
        </ul>
      </div>
      
      <div className={styles.guideSection}>
        <h4>6. Conseils pratiques</h4>
        <ul>
          <li>Sauvegardez régulièrement votre travail</li>
          <li>Testez votre modèle en générant un contrat de test</li>
          <li>Vérifiez que toutes les variables sont correctement orthographiées</li>
          <li>Utilisez la mise en forme (gras, italique) avec parcimonie pour une meilleure lisibilité</li>
        </ul>
      </div>
    </div>
  </div>
);

export default UserGuide;