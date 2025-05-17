import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import styles from './ProgrammateurStructuresSection.module.css';
import Card from '../../../components/ui/Card';

/**
 * Composant pour afficher la structure associée à un programmateur
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.programmateur - Données du programmateur avec structureCache et structureId
 * @param {Object} props.structure - Données complètes de la structure (optionnel, si fourni par le parent)
 * @param {boolean} props.showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ProgrammateurStructuresSection = ({ programmateur, structure: structureProp, showCardWrapper = true }) => {
  const [loading, setLoading] = useState(true);
  const [localStructure, setLocalStructure] = useState(null);

  // Si le parent a fourni la structure, on l'utilise directement
  const structure = structureProp || localStructure;
  
  // Données à afficher : priorité à la structure complète, puis au cache, puis valeurs par défaut
  const structureData = {
    id: structure?.id || programmateur?.structureId,
    raisonSociale: structure?.raisonSociale || programmateur?.structureCache?.raisonSociale || "Structure associée",
    type: structure?.type || programmateur?.structureCache?.type,
    ville: structure?.ville || programmateur?.structureCache?.ville
  };

  // Est-ce que nous avons une vraie structure (avec ID) ou juste des données en cache
  const hasRealStructure = !!programmateur?.structureId;

  useEffect(() => {
    // Si une structure est déjà fournie par le parent, on s'arrête là
    if (structureProp) {
      setLoading(false);
      return;
    }

    // Tenter de charger la structure à partir de structureId s'il existe
    const fetchStructure = async () => {
      setLoading(true);
      try {
        if (programmateur && programmateur.structureId) {
          const structureDoc = await getDoc(doc(db, 'structures', programmateur.structureId));
          if (structureDoc.exists()) {
            setLocalStructure({
              id: structureDoc.id,
              ...structureDoc.data()
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la structure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [programmateur, structureProp]);

  // Contenu principal de la section
  const sectionContent = (
    <>
      {loading ? (
        <div className={styles.loadingContainer}>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Chargement de la structure...
        </div>
      ) : (
        <div className={styles.structureItem}>
          <div className={styles.structureInfo}>
            {/* Utiliser Link seulement si on a un ID réel, sinon utiliser un span */}
            {hasRealStructure ? (
              <Link to={`/structures/${structureData.id}`} className={styles.structureName}>
                {structureData.raisonSociale}
              </Link>
            ) : (
              <span className={styles.structureName}>
                {structureData.raisonSociale}
              </span>
            )}
            <div className={styles.structureDetails}>
              {structureData.type && (
                <span className={styles.typeBadge}>{structureData.type}</span>
              )}
              {structureData.ville && (
                <span className={styles.structureLocation}>
                  <i className="bi bi-geo-alt me-1"></i>
                  {structureData.ville}
                </span>
              )}
            </div>
          </div>
          <div className={styles.structureActions}>
            {hasRealStructure ? (
              <Link to={`/structures/${structureData.id}`} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-eye me-1"></i>
                Voir
              </Link>
            ) : (
              <Link 
                to="/structures/nouvelle" 
                state={{ 
                  returnTo: `/programmateurs/${programmateur?.id}`,
                  programmateurId: programmateur?.id
                }}
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-plus-lg me-1"></i>
                Créer une structure
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Si on ne veut pas le wrapper de carte, on retourne directement le contenu
  if (!showCardWrapper) {
    return sectionContent;
  }

  // Utilisation du composant Card standardisé
  return (
    <Card
      title="Structure associée"
      icon={<i className="bi bi-building"></i>}
      className={styles.structureCard}
    >
      {sectionContent}
    </Card>
  );
};

export default ProgrammateurStructuresSection;