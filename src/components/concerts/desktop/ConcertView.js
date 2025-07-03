// src/components/concerts/desktop/ConcertView.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useConcertDetails } from '@/hooks/concerts';
import { useConcertStatus } from '@/hooks/concerts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import StatutBadge from '@/components/ui/StatutBadge';
import EntityCard from '@/components/ui/EntityCard';
// import ConfirmationModal from '@/components/ui/ConfirmationModal'; // TODO: Ajouter modal de suppression
import ConcertLieuMap from './sections/ConcertLieuMap';
import styles from './ConcertView.module.css';

/**
 * Composant des détails d'un concert - Interface moderne et épurée
 * Utilise les vrais hooks Firebase du projet principal
 */
function ConcertView({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hooks Firebase existants
  // const detailsHook = useConcertDetails(id);
  const concertStatus = useConcertStatus();

  const {
    concert,
    lieu,
    contact,
    artiste,
    structure,
    loading,
    error,
    // handleDelete, // TODO: Utiliser pour modal de suppression
    formatDate,
    formatMontant
  } = null; // Remplacer les usages par null ou des placeholders si nécessaire.

  // Debug - Affichage des données reçues
  console.log('[ConcertView] Données reçues:', {
    concert: concert ? { id: concert.id, titre: concert.titre } : null,
    artiste: artiste ? { 
      id: artiste.id, 
      artisteId: artiste.artisteId, 
      nom: artiste.nom,
      allKeys: Object.keys(artiste)
    } : null,
    contact: contact ? { 
      id: contact.id, 
      contactId: contact.contactId, 
      nom: contact.nom, 
      prenom: contact.prenom,
      allKeys: Object.keys(contact)
    } : null,
    structure: structure ? { 
      id: structure.id, 
      structureId: structure.structureId, 
      nom: structure.nom,
      allKeys: Object.keys(structure)
    } : null,
    lieu: lieu ? { 
      id: lieu.id, 
      lieuId: lieu.lieuId, 
      nom: lieu.nom, 
      adresse: lieu.adresse,
      allKeys: Object.keys(lieu)
    } : null
  });

  // Formatage des données pour l'affichage
  const concertData = useMemo(() => {
    if (!concert) return null;

    const statusDetails = concertStatus?.getStatusDetails?.(concert.statut) || {};
    
    // Mapping de fallback pour les statuts
    const getStatusVariant = (statut) => {
      const statutMap = {
        'contact': 'secondary',
        'preaccord': 'warning', 
        'contrat': 'warning',
        'confirme': 'success',
        'annule': 'danger',
        'reporte': 'warning'
      };
      return statutMap[statut] || 'secondary';
    };

    const getStatusLabel = (statut) => {
      const labelMap = {
        'contact': 'Contact établi',
        'preaccord': 'Pré-accord',
        'contrat': 'Contrat signé', 
        'confirme': 'Confirmé',
        'annule': 'Annulé',
        'reporte': 'Reporté'
      };
      return labelMap[statut] || statut || 'En cours';
    };

    const currentStatut = concert.statut || concert.status || 'contact';
    
    console.log('[ConcertView] Statut concert:', {
      originalStatut: concert.statut,
      status: concert.status,
      statusDetails,
      computed: currentStatut
    });

    return {
      id: concert.id,
      titre: concert.titre || "Concert sans titre",
      dateCreation: concert.dateCreation ? formatDate(concert.dateCreation) : "Date inconnue",
      date: concert.date ? formatDate(concert.date) : "Date à définir",
      heure: concert.heure || "Heure à définir",
      prix: concert.montant ? formatMontant(concert.montant) : "Prix à définir",
      statut: {
        label: statusDetails.label || getStatusLabel(currentStatut),
        color: statusDetails.color || 'var(--tc-secondary)',
        variant: statusDetails.variant || getStatusVariant(currentStatut),
        raw: currentStatut
      },
      notes: concert.notes || ""
    };
  }, [concert, formatDate, formatMontant, concertStatus]);

  // Handlers
  const handleEdit = () => navigate(`/concerts/${id}/edit`);

  // const handleDeleteConcert = () => {
  //   if (handleDelete) {
  //     handleDelete();
  //   }
  // }; // TODO: Ajouter modal de confirmation

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId) => {
    console.log(`[ConcertView] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[ConcertView] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      artiste: `/artistes/${entityId}`,
      contact: `/contacts/${entityId}`,
      structure: `/structures/${entityId}`,
      lieu: `/lieux/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[ConcertView] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[ConcertView] Route inconnue pour ${entityType}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du concert..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message || error} />;
  }

  if (!concertData) {
    return <ErrorMessage message="Concert introuvable" />;
  }

  return (
    <div className={styles.concertDetails}>
      {/* Header avec FormHeader */}
      <FormHeader
        title={concertData.titre}
        subtitle={`Créé le ${concertData.dateCreation}`}
        icon={<i className="bi bi-music-note-beamed"></i>}
        roundedTop={true}
        actions={[
          <Button 
            key="edit"
            variant="primary" 
            onClick={handleEdit}
            icon={<i className="bi bi-pencil"></i>}
          >
            Modifier
          </Button>
        ]}
      />

      {/* Informations Générales */}
      <div className={styles.section}>
        <h2>Informations générales</h2>
        
        {/* Détails du concert */}
        <div className={styles.concertInfoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.label}>Date</p>
            <p className={styles.value}>{concertData.date}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Heure</p>
            <p className={styles.value}>{concertData.heure}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Prix</p>
            <p className={styles.value}>{concertData.prix}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Statut</p>
            <StatutBadge 
              status={concertData.statut.raw}
              entityType="concert"
              size="medium"
            />
          </div>
        </div>

        {/* Entités liées */}
        <div className={styles.entitiesSection}>
          <p className={styles.entitiesLabel}>Entités liées</p>
          <div className={styles.entitiesGrid}>
            
            {/* Artiste */}
            {artiste && (
              <EntityCard
                entityType="artiste"
                name={artiste.nom || 'Artiste'}
                subtitle="Artiste"
                onClick={() => {
                  console.log('[ConcertView] Clic sur artiste:', artiste);
                  const artisteId = artiste.id || artiste.artisteId;
                  console.log('[ConcertView] ID artiste trouvé:', artisteId);
                  navigateToEntity('artiste', artisteId);
                }}
              />
            )}

            {/* Contact/Organisateur */}
            {contact && (
              <EntityCard
                entityType="contact"
                name={contact.nom || contact.prenom || 'Contact'}
                subtitle="Organisateur"
                onClick={() => {
                  console.log('[ConcertView] Clic sur contact:', contact);
                  const contactId = contact.id || contact.contactId;
                  console.log('[ConcertView] ID contact trouvé:', contactId);
                  navigateToEntity('contact', contactId);
                }}
              />
            )}

            {/* Structure */}
            {structure && (
              <EntityCard
                entityType="structure"
                name={structure.nom || 'Structure'}
                subtitle="Structure"
                onClick={() => {
                  console.log('[ConcertView] Clic sur structure:', structure);
                  const structureId = structure.id || structure.structureId;
                  console.log('[ConcertView] ID structure trouvé:', structureId);
                  navigateToEntity('structure', structureId);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Section Lieu */}
      {lieu && (
        <div className={`${styles.section} ${styles.lieuSection}`}>
          <div className={styles.lieuHeader}>
            <div className={styles.lieuInfo}>
              <h2>Lieu</h2>
              <p className={styles.lieuSubtitle}>
                {lieu.nom || 'Lieu'}, {lieu.ville || lieu.adresse || ''}
              </p>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[ConcertView] Clic sur lieu détails:', lieu);
                const lieuId = lieu.id || lieu.lieuId;
                console.log('[ConcertView] ID lieu trouvé:', lieuId);
                navigateToEntity('lieu', lieuId);
              }}
              icon={<i className={styles.iconArrowRight}></i>}
              iconPosition="right"
            >
              Voir détails
            </Button>
          </div>
          
          {/* Carte interactive */}
          <ConcertLieuMap 
            lieu={lieu}
            onDirections={() => console.log('[ConcertView] Ouverture itinéraire')}
          />
        </div>
      )}

      {/* Notes */}
      {concertData.notes && (
        <div className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notesContent}>
            {concertData.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default ConcertView;