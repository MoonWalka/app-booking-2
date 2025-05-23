import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, getDoc, doc, query, collection, where, getDocs } from '@/firebaseInit';
import Button from '@ui/Button';
import styles from './ProgrammateurLieuxSection.module.css';
import Card from '../../../components/ui/Card';

/**
 * Composant pour afficher les lieux associés à un programmateur
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.programmateur - Données du programmateur
 * @param {Array} props.lieux - Lieux déjà chargés (optionnel, fournis par le parent)
 * @param {boolean} props.isEditing - Mode édition
 * @param {boolean} props.showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ProgrammateurLieuxSection = ({ programmateur, lieux: lieuxProp = [], isEditing = false, showCardWrapper = true }) => {
  const [loading, setLoading] = useState(true);
  const [localLieux, setLocalLieux] = useState([]);
  
  // LOGS DE DIAGNOSTIC: Vérifier si les props lieux sont reçues correctement
  useEffect(() => {
    console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Prop lieux reçue:`, {
      programmateur: programmateur?.id,
      lieuxPropPresent: lieuxProp !== undefined && lieuxProp !== null,
      lieuxPropLength: lieuxProp?.length || 0,
      lieuxPropIds: lieuxProp?.map(lieu => lieu.id || 'no-id') || []
    });
  }, [programmateur, lieuxProp]);
  
  // FIX: Stratégie robuste pour déterminer la source des lieux
  const hasValidLieuxInProp = Array.isArray(lieuxProp) && lieuxProp.length > 0;
  const hasValidLocalLieux = Array.isArray(localLieux) && localLieux.length > 0;
  const lieux = hasValidLieuxInProp ? lieuxProp : localLieux;
  const hasLieux = lieux?.length > 0;

  // LOGS DE DIAGNOSTIC: Vérifier quelle source de lieux est utilisée
  useEffect(() => {
    console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Source de lieux utilisée:`, {
      source: hasValidLieuxInProp ? 'lieuxProp' : 'localLieux',
      lieuxFinal: lieux?.length || 0,
      hasLieux,
      hasValidLieuxInProp,
      hasValidLocalLieux
    });
  }, [lieuxProp, localLieux, lieux, hasLieux, hasValidLieuxInProp, hasValidLocalLieux]);

  useEffect(() => {
    // FIX: Ne pas charger les lieux si lieuxProp est un tableau valide et non vide
    if (hasValidLieuxInProp) {
      console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Utilisation des lieux de la prop, pas de chargement local`);
      setLoading(false);
      return;
    }

    const loadLieux = async () => {
      setLoading(true);
      try {
        if (programmateur && programmateur.id) {
          console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Chargement local des lieux pour ${programmateur.id}`, {
            programmateur: programmateur
          });
          
          // Vérifier d'abord si le programmateur a des lieuxIds ou lieuxAssocies
          if (programmateur.lieuxIds?.length > 0 || programmateur.lieuxAssocies?.length > 0) {
            const lieuxIds = programmateur.lieuxIds || programmateur.lieuxAssocies || [];
            console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Trouvé ${lieuxIds.length} références de lieux directement dans le programmateur`);
            
            // Récupérer les détails complets pour chaque ID de lieu
            const lieuxPromises = lieuxIds.map(lieuId => {
              // Si c'est déjà un objet avec un ID, on utilise directement l'ID
              const id = typeof lieuId === 'object' ? lieuId.id : lieuId;
              return getDoc(doc(db, 'lieux', id))
                .then(docSnapshot => {
                  if (docSnapshot.exists()) {
                    return { id: docSnapshot.id, ...docSnapshot.data() };
                  }
                  return null;
                })
                .catch(err => {
                  console.error(`[ERROR] Erreur lors du chargement du lieu ${id}:`, err);
                  return null;
                });
            });
            
            const lieuxResults = await Promise.all(lieuxPromises);
            const newLieux = lieuxResults.filter(lieu => lieu !== null);
            
            console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - ${newLieux.length} lieux chargés depuis lieuxIds/lieuxAssocies pour ${programmateur.id}`, {
              lieuxIds: newLieux.map(lieu => lieu.id)
            });
            
            setLocalLieux(newLieux);
          } else {
            // Essayer plusieurs méthodes de requête si aucun lieuxIds n'est trouvé
            console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Aucun lieuxIds trouvé, recherche par référence inverse`);
            
            // Méthode 1: Chercher les lieux qui ont ce programmateur dans un tableau 'programmateurs'
            let lieuxQuery = query(
              collection(db, 'lieux'),
              where('programmateurs', 'array-contains', programmateur.id)
            );
            let querySnapshot = await getDocs(lieuxQuery);
            let newLieux = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Méthode 2: Si aucun résultat, chercher par programmateurId
            if (newLieux.length === 0) {
              console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - Aucun résultat avec 'programmateurs', essai avec 'programmateurId'`);
              lieuxQuery = query(
                collection(db, 'lieux'),
                where('programmateurId', '==', programmateur.id)
              );
              querySnapshot = await getDocs(lieuxQuery);
              newLieux = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            
            console.log(`[DIAGNOSTIC] ProgrammateurLieuxSection - ${newLieux.length} lieux chargés par requête inverse pour ${programmateur.id}`, {
              lieuxIds: newLieux.map(lieu => lieu.id),
              méthodeUtilisée: newLieux.length > 0 ? (querySnapshot.query._query.filters[0].field.segments[1] === 'programmateurs' ? 'array-contains' : 'programmateurId') : 'aucune'
            });
            
            setLocalLieux(newLieux);
          }
        }
      } catch (error) {
        console.error('[DIAGNOSTIC] ProgrammateurLieuxSection - Erreur lors du chargement des lieux:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLieux();
  }, [programmateur, lieuxProp]);

  // Contenu principal de la section
  const sectionContent = (
    <>
      {loading ? (
        <div className={styles.loadingContainer}>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Chargement des lieux...
        </div>
      ) : (
        <>
          {!hasLieux && (
            <div className={styles.infoMessage}>
              <i className="bi bi-info-circle me-2"></i>
              Aucun lieu associé à ce programmateur.
            </div>
          )}
          
          {hasLieux && (
            <div className={styles.lieuxList}>
              {lieux.map((lieu) => (
                <div key={lieu.id} className={styles.lieuItem}>
                  <div className={styles.lieuInfo}>
                    <Link to={`/lieux/${lieu.id}`} className={styles.lieuName}>
                      {lieu.nom}
                    </Link>
                    <div className={styles.lieuDetails}>
                      {lieu.type && (
                        <span className={styles.typeBadge}>{lieu.type}</span>
                      )}
                      {(lieu.ville || lieu.codePostal) && (
                        <span className={styles.lieuLocation}>
                          <i className="bi bi-geo-alt me-1"></i>
                          {lieu.ville && lieu.codePostal ? `${lieu.ville} (${lieu.codePostal})` : lieu.ville || lieu.codePostal}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.lieuActions}>
                    <Button as={Link} to={`/lieux/${lieu.id}`} variant="outline-primary" size="sm">
                      <i className="bi bi-eye me-1"></i>
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isEditing && (
            <div className={styles.addSection}>
              <Button 
                as={Link}
                to={`/lieux/nouveau?programmateur=${programmateur?.id}`} 
                variant="outline-success"
                size="sm"
              >
                <i className="bi bi-plus-lg me-1"></i>
                Ajouter un lieu
              </Button>
            </div>
          )}
        </>
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
      title="Lieux associés"
      icon={<i className="bi bi-geo-alt"></i>}
      className={styles.lieuxCard}
      headerActions={
        <span className={styles.badge}>{lieux.length}</span>
      }
    >
      {sectionContent}
    </Card>
  );
};

export default ProgrammateurLieuxSection;
