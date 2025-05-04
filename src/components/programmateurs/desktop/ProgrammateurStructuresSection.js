import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import styles from './ProgrammateurStructuresSection.module.css';

/**
 * Composant pour afficher la structure associée à un programmateur
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.programmateur - Données du programmateur
 * @param {Object} props.structure - Données de la structure (optionnel, si fourni par le parent)
 */
const ProgrammateurStructuresSection = ({ programmateur, structure: structureProp }) => {
  const [loading, setLoading] = useState(true);
  const [localStructure, setLocalStructure] = useState(null);

  // Si le parent a fourni la structure, on l'utilise directement
  const structure = structureProp || localStructure;

  // DIAGNOSTIC: Créer une structure de test si aucune n'est disponible
  const mockStructure = {
    id: "structure-test-id",
    nom: "Structure de test",
    type: "Association",
    ville: "Paris",
  };

  // Utiliser une structure simulée pour s'assurer que l'interface utilisateur s'affiche
  const displayStructure = structure || mockStructure;

  console.log("[DIAGNOSTIC] ProgrammateurStructuresSection - programmateur:", programmateur);
  console.log("[DIAGNOSTIC] ProgrammateurStructuresSection - structureProp:", structureProp);
  console.log("[DIAGNOSTIC] ProgrammateurStructuresSection - localStructure:", localStructure);
  console.log("[DIAGNOSTIC] ProgrammateurStructuresSection - structureId:", programmateur?.structureId);
  console.log("[DIAGNOSTIC] ProgrammateurStructuresSection - displayStructure:", displayStructure);

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
          console.log(`[DIAGNOSTIC] Chargement de la structure ${programmateur.structureId}`);
          const structureDoc = await getDoc(doc(db, 'structures', programmateur.structureId));
          if (structureDoc.exists()) {
            setLocalStructure({
              id: structureDoc.id,
              ...structureDoc.data()
            });
            console.log(`[DIAGNOSTIC] Structure chargée avec succès:`, structureDoc.data());
          } else {
            console.warn(`[DIAGNOSTIC] La structure ${programmateur.structureId} n'existe pas`);
          }
        } else {
          console.log("[DIAGNOSTIC] Aucun structureId disponible");
        }
      } catch (error) {
        console.error('[DIAGNOSTIC] Erreur lors du chargement de la structure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [programmateur, structureProp]);

  // Utiliser la même structure de carte que les autres composants
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <i className="bi bi-building me-2"></i>
          Structure associée
        </h3>
      </div>
      
      <div className={styles.cardBody}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Chargement de la structure...
          </div>
        ) : (
          <div className={styles.structureItem}>
            <div className={styles.structureInfo}>
              {/* Utiliser Link seulement si on a un ID réel, sinon utiliser un span */}
              {displayStructure.id !== "structure-test-id" ? (
                <Link to={`/structures/${displayStructure.id}`} className={styles.structureName}>
                  {displayStructure.nom || displayStructure.raisonSociale || "Structure associée"}
                </Link>
              ) : (
                <span className={styles.structureName}>
                  {programmateur?.structure || "Structure associée"}
                </span>
              )}
              <div className={styles.structureDetails}>
                {displayStructure.type && (
                  <span className={styles.typeBadge}>{displayStructure.type}</span>
                )}
                {displayStructure.ville && (
                  <span className={styles.structureLocation}>
                    <i className="bi bi-geo-alt me-1"></i>
                    {displayStructure.ville}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.structureActions}>
              {displayStructure.id !== "structure-test-id" && (
                <Link to={`/structures/${displayStructure.id}`} className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-eye me-1"></i>
                  Voir
                </Link>
              )}
              {displayStructure.id === "structure-test-id" && (
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
      </div>
    </div>
  );
};

export default ProgrammateurStructuresSection;