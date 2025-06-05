/**
 * @fileoverview Badge affichant le statut des relances automatiques
 * Permet de voir rapidement l'état des tâches automatiques pour un concert
 * 
 * @author TourCraft Team
 * @since 2025
 */

import React, { useState, useEffect } from 'react';
import { RELANCE_TYPES } from '@/services/relancesAutomatiquesService';
import { useRelances } from '@/hooks/relances/useRelances';
import { useOrganization } from '@/context/OrganizationContext';
import Badge from '@/components/ui/Badge';
import styles from './RelancesAutomatiquesBadge.module.css';

/**
 * Badge affichant le nombre de relances automatiques actives
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.concertId - ID du concert
 * @param {string} [props.variant] - Style du badge ('compact', 'detailed')
 * @param {Function} [props.onClick] - Callback lors du clic
 * @returns {JSX.Element|null} Badge des relances automatiques
 */
const RelancesAutomatiquesBadge = ({ 
  concertId, 
  variant = 'compact', 
  onClick 
}) => {
  const { currentOrganization } = useOrganization();
  const { relances, loading } = useRelances({
    concertId,
    automatiquesUniquement: true,
    nonTerminees: true
  });
  
  const [relancesDetaillees, setRelancesDetaillees] = useState([]);
  
  useEffect(() => {
    if (!relances || loading) return;
    
    // Analyser les relances automatiques actives
    const relancesActives = relances.filter(r => 
      r.automatique && !r.terminee
    );
    
    // Grouper par type et ajouter les infos détaillées
    const relancesAvecDetails = relancesActives.map(relance => {
      const typeConfig = Object.values(RELANCE_TYPES).find(
        type => type.id === relance.type
      );
      
      return {
        ...relance,
        typeConfig: typeConfig || {
          nom: relance.nom,
          couleur: 'secondary',
          priorite: relance.priorite || 'moyenne'
        }
      };
    });
    
    // Trier par priorité (haute en premier)
    relancesAvecDetails.sort((a, b) => {
      const priorites = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
      return (priorites[b.typeConfig.priorite] || 1) - (priorites[a.typeConfig.priorite] || 1);
    });
    
    setRelancesDetaillees(relancesAvecDetails);
  }, [relances, loading]);
  
  if (!currentOrganization?.id || !concertId) {
    return null;
  }
  
  if (loading) {
    return (
      <div className={styles.loading}>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </div>
    );
  }
  
  if (relancesDetaillees.length === 0) {
    return variant === 'detailed' ? (
      <Badge variant="success" size="sm">
        <i className="bi bi-check-circle me-1"></i>
        Aucune tâche en attente
      </Badge>
    ) : null;
  }
  
  // Compter par priorité
  const parPriorite = relancesDetaillees.reduce((acc, relance) => {
    const prio = relance.typeConfig.priorite || 'moyenne';
    acc[prio] = (acc[prio] || 0) + 1;
    return acc;
  }, {});
  
  const nombreTotal = relancesDetaillees.length;
  const nombreHautePriorite = parPriorite.haute || 0;
  
  // Déterminer la couleur principale du badge
  let couleurBadge = 'secondary';
  if (nombreHautePriorite > 0) {
    couleurBadge = 'warning';
  } else if (nombreTotal > 0) {
    couleurBadge = 'info';
  }
  
  // Préparer le titre (tooltip)
  const taches = relancesDetaillees
    .map(r => `• ${r.typeConfig.nom}`)
    .join('\n');
  const titre = `Tâches automatiques en attente :\n${taches}`;
  
  if (variant === 'compact') {
    return (
      <Badge 
        variant={couleurBadge} 
        size="sm"
        className={styles.badgeCompact}
        title={titre}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <i className="bi bi-robot me-1"></i>
        {nombreTotal}
        {nombreHautePriorite > 0 && (
          <i className="bi bi-exclamation-triangle ms-1 text-warning"></i>
        )}
      </Badge>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <div className={styles.badgeDetaille}>
        <div className={styles.badgePrincipal}>
          <Badge 
            variant={couleurBadge}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            <i className="bi bi-robot me-2"></i>
            {nombreTotal} tâche{nombreTotal > 1 ? 's' : ''} automatique{nombreTotal > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className={styles.tachesListe}>
          {relancesDetaillees.slice(0, 3).map((relance, index) => (
            <div key={relance.id} className={styles.tacheItem}>
              <Badge 
                variant={relance.typeConfig.couleur || 'secondary'} 
                size="sm"
                className={styles.tacheBadge}
              >
                {relance.typeConfig.nom}
              </Badge>
              {relance.typeConfig.priorite === 'haute' && (
                <i className="bi bi-exclamation-circle text-warning ms-1" title="Priorité haute"></i>
              )}
            </div>
          ))}
          
          {relancesDetaillees.length > 3 && (
            <div className={styles.tacheItem}>
              <Badge variant="light" size="sm">
                +{relancesDetaillees.length - 3} autre{relancesDetaillees.length - 3 > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default RelancesAutomatiquesBadge;