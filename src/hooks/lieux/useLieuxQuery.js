/**
 * @fileoverview Hook de requête et gestion des données de lieux
 * Récupère la liste complète des lieux avec calcul automatique des statistiques
 * et gestion des états de chargement et d'erreur.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, db, where } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook de requête pour la récupération et gestion des données de lieux
 * 
 * Ce hook récupère la liste complète des lieux depuis Firestore, calcule automatiquement
 * des statistiques détaillées et fournit une interface simple pour la gestion des lieux.
 * 
 * @description
 * Fonctionnalités principales :
 * - Récupération de tous les lieux triés par nom
 * - Calcul automatique des statistiques de lieux
 * - Comptage par type de lieu (festival, salle, bar, plateau)
 * - Analyse des associations avec les concerts
 * - Gestion des états de chargement et d'erreur
 * - Interface de mise à jour des données
 * 
 * @returns {Object} État et données des lieux avec statistiques
 * @returns {Array} returns.lieux - Liste complète des lieux triés par nom
 * @returns {boolean} returns.loading - État de chargement des données
 * @returns {string|null} returns.error - Message d'erreur éventuel
 * @returns {Object} returns.stats - Statistiques détaillées des lieux
 * @returns {number} returns.stats.total - Nombre total de lieux
 * @returns {number} returns.stats.avecDates - Lieux avec concerts associés
 * @returns {number} returns.stats.sansDates - Lieux sans concerts associés
 * @returns {number} returns.stats.festivals - Nombre de festivals
 * @returns {number} returns.stats.salles - Nombre de salles
 * @returns {number} returns.stats.bars - Nombre de bars
 * @returns {number} returns.stats.plateaux - Nombre de plateaux
 * @returns {Function} returns.setLieux - Fonction pour mettre à jour la liste des lieux
 * 
 * @example
 * ```javascript
 * const { lieux, loading, error, stats, setLieux } = useLieuxQuery();
 * 
 * if (loading) return <div>Chargement des lieux...</div>;
 * if (error) return <div>Erreur: {error}</div>;
 * 
 * return (
 *   <div>
 *     <h2>Lieux ({stats.total})</h2>
 *     <p>Festivals: {stats.festivals}, Salles: {stats.salles}</p>
 *     <p>Avec concerts: {stats.avecDates}</p>
 *     
 *     {lieux.map(lieu => (
 *       <div key={lieu.id}>
 *         <h3>{lieu.nom}</h3>
 *         <p>Type: {lieu.type}</p>
 *         <p>Capacité: {lieu.capacite}</p>
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 * 
 * @dependencies
 * - Firebase Firestore (collection: lieux)
 * - React hooks (useState, useEffect)
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @migrationCandidate useGenericEntityList - Candidat pour généralisation
 * 
 * @workflow
 * 1. Initialisation des états (lieux, loading, error, stats)
 * 2. Requête Firestore avec tri par nom
 * 3. Transformation des données avec ajout des IDs
 * 4. Calcul des statistiques par type et associations
 * 5. Mise à jour des états avec les résultats
 * 6. Gestion des erreurs et finalisation du chargement
 * 
 * @statistics
 * - Total des lieux
 * - Répartition par type (festival, salle, bar, plateau)
 * - Analyse des associations avec concerts
 * - Lieux avec/sans concerts associés
 * 
 * @errorHandling
 * - Erreur de requête : "Impossible de charger les lieux. Veuillez réessayer."
 * - Logging automatique des erreurs dans la console
 * 
 * @performance
 * - Requête unique au montage du composant
 * - Tri côté serveur pour optimiser les performances
 * - Calcul des statistiques en une seule passe
 * 
 * @usedBy LieuxList, LieuxDashboard, LieuxStats, DateForm
 */

const useLieuxQuery = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avecDates: 0,
    sansDates: 0,
    festivals: 0,
    salles: 0,
    bars: 0,
    plateaux: 0
  });
  
  const { currentOrganization } = useOrganization();

  // Fetch lieux data from Firestore
  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        // Vérifier qu'on a une organisation
        if (!currentOrganization?.id) {
          console.warn('⚠️ Pas d\'organisation sélectionnée pour les lieux');
          setLieux([]);
          setLoading(false);
          return;
        }
        
        const q = query(
          collection(db, 'lieux'),
          where('organizationId', '==', currentOrganization.id),
          orderBy('nom')
        );
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate stats
        let avecDates = 0;
        let sansDates = 0;
        let festivals = 0;
        let salles = 0;
        let bars = 0;
        let plateaux = 0;
        
        lieuxData.forEach(lieu => {
          if (lieu.concertsAssocies && lieu.concertsAssocies.length > 0) {
            avecDates++;
          } else {
            sansDates++;
          }
          
          // Count venue types
          if (lieu.type === 'festival') festivals++;
          else if (lieu.type === 'salle') salles++;
          else if (lieu.type === 'bar') bars++;
          else if (lieu.type === 'plateau') plateaux++;
        });
        
        setStats({
          total: lieuxData.length,
          avecDates,
          sansDates,
          festivals,
          salles,
          bars,
          plateaux
        });
        
        setLieux(lieuxData);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
        setError('Impossible de charger les lieux. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, [currentOrganization]);

  return {
    lieux,
    loading,
    error,
    stats,
    setLieux
  };
};

export default useLieuxQuery;