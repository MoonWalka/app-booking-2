import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db, query, where, collection, getDocs, doc, getDoc } from '@/services/firebase-service';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './ContactLieuxSection.module.css';

/**
 * Composant pour afficher les lieux associés à un contact
 * Version corrigée anti-boucles infinies
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.contact - Données du contact
 * @param {Array} props.lieux - Lieux déjà chargés (optionnel, fournis par le parent)
 * @param {boolean} props.isEditing - Mode édition
 * @param {boolean} props.showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ContactLieuxSection = ({ 
  contact, 
  lieux: lieuxProp = [], 
  isEditMode = false,
  formData = {},
  onChange = () => {},
  showCardWrapper = true 
}) => {
  // 🔒 PROTECTION ANTI-BOUCLES: Références stables
  const renderCountRef = useRef(0);
  const lastContactIdRef = useRef(null);
  const loadingStartedRef = useRef(false);
  const lieuxPropRef = useRef(lieuxProp);
  const contactRef = useRef(contact);
  
  // ✅ STABILISATION: Mettre à jour les références sans déclencher de re-render
  useEffect(() => {
    lieuxPropRef.current = lieuxProp;
  }, [lieuxProp]);
  
  useEffect(() => {
    contactRef.current = contact;
  }, [contact]);
  
  const isEditing = isEditMode;
  const [loading, setLoading] = useState(true);
  const [localLieux, setLocalLieux] = useState([]);
  
  // ✅ STABILISATION: Logique simple et directe pour éviter les boucles - DÉFINI AVANT useEffect
  const hasValidLieuxInProp = lieuxProp && Array.isArray(lieuxProp) && lieuxProp.length > 0;
  
  // ✅ STABILISATION: Source de lieux avec logique directe - DÉFINI AVANT useEffect
  const lieux = hasValidLieuxInProp ? lieuxProp : localLieux;
  
  const hasLieux = lieux && lieux.length > 0; // ✅ Simplifié pour éviter useMemo problématique
  
  // ✅ OPTIMISATION: Logs de diagnostic seulement si changement réel
  useEffect(() => {
    renderCountRef.current++;
    const contactId = contact?.id;
    const currentLieuxProp = lieuxPropRef.current;
    
    // Log seulement si l'ID a vraiment changé
    if (contactId !== lastContactIdRef.current) {
      console.log(`[DIAGNOSTIC] ContactLieuxSection - Nouveau contact #${renderCountRef.current}:`, {
        contact: contactId,
        lieuxPropPresent: currentLieuxProp !== undefined && currentLieuxProp !== null,
        lieuxPropLength: currentLieuxProp?.length || 0,
        lieuxPropIds: currentLieuxProp?.map(lieu => lieu.id || 'no-id') || []
      });
      lastContactIdRef.current = contactId;
    }
    
    // Log every render for debugging
    console.log(`[DEBUG] ContactLieuxSection - Current props:`, {
      lieuxProp,
      lieuxPropLength: lieuxProp?.length,
      localLieux,
      localLieuxLength: localLieux?.length,
      hasValidLieuxInProp,
      finalLieux: lieux,
      finalLieuxLength: lieux?.length
    });
  }, [contact?.id, lieuxProp, localLieux, hasValidLieuxInProp, lieux]); // ✅ Dépendance stable, lieuxProp via ref

  // ✅ STABILISATION: Function de chargement stable
  const loadLieux = useCallback(async (contactData) => {
    if (!contactData?.id || loadingStartedRef.current) return;
    
    loadingStartedRef.current = true;
    setLoading(true);
    
    try {
      console.log(`[DIAGNOSTIC] ContactLieuxSection - Chargement local des lieux pour ${contactData.id}`);
      
      // Vérifier d'abord si le contact a des lieuxIds ou lieuxAssocies
      if (contactData.lieuxIds?.length > 0 || contactData.lieuxAssocies?.length > 0) {
        const lieuxIds = contactData.lieuxIds || contactData.lieuxAssocies || [];
        
        // Récupérer les détails complets pour chaque ID de lieu
        const lieuxPromises = lieuxIds.map(lieuId => {
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
        
        console.log(`[DIAGNOSTIC] ContactLieuxSection - ${newLieux.length} lieux chargés depuis lieuxIds/lieuxAssocies pour ${contactData.id}`, {
          lieuxIds: newLieux.map(lieu => lieu.id)
        });
        
        setLocalLieux(newLieux);
      } else {
        // Méthodes de requête alternatives
        let lieuxQuery = query(
          collection(db, 'lieux'),
          where('contacts', 'array-contains', contactData.id)
        );
        let querySnapshot = await getDocs(lieuxQuery);
        let newLieux = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (newLieux.length === 0) {
          lieuxQuery = query(
            collection(db, 'lieux'),
            where('contactId', '==', contactData.id)
          );
          querySnapshot = await getDocs(lieuxQuery);
          newLieux = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        setLocalLieux(newLieux);
      }
    } catch (error) {
      console.error('[ERROR] ContactLieuxSection - Erreur lors du chargement des lieux:', error);
    } finally {
      setLoading(false);
      loadingStartedRef.current = false;
    }
  }, []); // ✅ Fonction stable sans dépendances

  // ✅ EFFET ULTRA-OPTIMISÉ: Conditions strictes pour éviter la boucle
  useEffect(() => {
    // 🔒 PROTECTION: Si lieuxProp est valide, pas de chargement
    if (hasValidLieuxInProp) {
      setLoading(false);
      loadingStartedRef.current = false;
      return;
    }

    // 🔒 PROTECTION: Charger seulement si contact valide et pas déjà en cours
    const currentContact = contactRef.current;
    if (currentContact?.id && !loadingStartedRef.current) {
      loadLieux(currentContact);
    }
  }, [contact?.id, hasValidLieuxInProp, loadLieux]); // ✅ Dépendances minimales et stables

  // ✅ RÉINITIALISATION: Reset loading flag si contact change
  useEffect(() => {
    loadingStartedRef.current = false;
  }, [contact?.id]);

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
              Aucun lieu associé à ce contact.
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
                to={`/lieux/nouveau?contact=${contact?.id}`} 
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

export default ContactLieuxSection;
