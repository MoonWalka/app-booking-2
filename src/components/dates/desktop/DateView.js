// src/components/dates/desktop/DateView.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useDateDetails } from '@/hooks/dates';
import { useDateStatus } from '@/hooks/dates';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import StatutBadge from '@/components/ui/StatutBadge';
import EntityCard from '@/components/ui/EntityCard';
// import ConfirmationModal from '@/components/ui/ConfirmationModal'; // TODO: Ajouter modal de suppression
import DateLieuMap from './sections/DateLieuMap';
import styles from './DateView.module.css';

/**
 * Composant des détails d'un date - Interface moderne et épurée
 * Utilise les vrais hooks Firebase du projet principal
 */
function DateView({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hooks Firebase existants
  // const detailsHook = useDateDetails(id);
  const dateStatus = useDateStatus();

  const {
    date,
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
  console.log('[DateView] Données reçues:', {
    date: date ? { id: date.id, titre: date.titre } : null,
    artiste: artiste ? { 
      id: artiste.id, 
      artisteId: artiste.artisteId, 
      artisteNom: artiste.artisteNom,
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
      nom: structure.raisonSociale,
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
  const dateData = useMemo(() => {
    if (!date) return null;

    const statusDetails = dateStatus?.getStatusDetails?.(date.statut) || {};
    
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

    const currentStatut = date.statut || date.status || 'contact';
    
    console.log('[DateView] Statut date:', {
      originalStatut: date.statut,
      status: date.status,
      statusDetails,
      computed: currentStatut
    });

    return {
      id: date.id,
      titre: date.titre || "Date sans titre",
      dateCreation: date.dateCreation ? formatDate(date.dateCreation) : "Date inconnue",
      date: date.date ? formatDate(date.date) : "Date à définir",
      heure: date.heure || "Heure à définir",
      prix: date.montant ? formatMontant(date.montant) : "Prix à définir",
      statut: {
        label: statusDetails.label || getStatusLabel(currentStatut),
        color: statusDetails.color || 'var(--tc-secondary)',
        variant: statusDetails.variant || getStatusVariant(currentStatut),
        raw: currentStatut
      },
      notes: date.notes || ""
    };
  }, [date, formatDate, formatMontant, dateStatus]);

  // Handlers
  const handleEdit = () => navigate(`/dates/${id}/edit`);

  // const handleDeleteDate = () => {
  //   if (handleDelete) {
  //     handleDelete();
  //   }
  // }; // TODO: Ajouter modal de confirmation

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId) => {
    console.log(`[DateView] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[DateView] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      artiste: `/artistes/${entityId}`,
      contact: `/contacts/${entityId}`,
      structure: `/structures/${entityId}`,
      lieu: `/lieux/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[DateView] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[DateView] Route inconnue pour ${entityType}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du date..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message || error} />;
  }

  if (!dateData) {
    return <ErrorMessage message="Date introuvable" />;
  }

  return (
    <div className={styles.dateDetails}>
      {/* Header avec FormHeader */}
      <FormHeader
        title={dateData.titre}
        subtitle={`Créé le ${dateData.dateCreation}`}
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
        
        {/* Détails du date */}
        <div className={styles.dateInfoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.label}>Date</p>
            <p className={styles.value}>{dateData.date}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Heure</p>
            <p className={styles.value}>{dateData.heure}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Prix</p>
            <p className={styles.value}>{dateData.prix}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Statut</p>
            <StatutBadge 
              status={dateData.statut.raw}
              entityType="date"
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
                name={artiste.artisteNom || 'Artiste'}
                subtitle="Artiste"
                onClick={() => {
                  console.log('[DateView] Clic sur artiste:', artiste);
                  const artisteId = artiste.id || artiste.artisteId;
                  console.log('[DateView] ID artiste trouvé:', artisteId);
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
                  console.log('[DateView] Clic sur contact:', contact);
                  const contactId = contact.id || contact.contactId;
                  console.log('[DateView] ID contact trouvé:', contactId);
                  navigateToEntity('contact', contactId);
                }}
              />
            )}

            {/* Structure */}
            {structure && (
              <EntityCard
                entityType="structure"
                name={structure.raisonSociale || 'Structure'}
                subtitle="Structure"
                onClick={() => {
                  console.log('[DateView] Clic sur structure:', structure);
                  const structureId = structure.id || structure.structureId;
                  console.log('[DateView] ID structure trouvé:', structureId);
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
                console.log('[DateView] Clic sur lieu détails:', lieu);
                const lieuId = lieu.id || lieu.lieuId;
                console.log('[DateView] ID lieu trouvé:', lieuId);
                navigateToEntity('lieu', lieuId);
              }}
              icon={<i className={styles.iconArrowRight}></i>}
              iconPosition="right"
            >
              Voir détails
            </Button>
          </div>
          
          {/* Carte interactive */}
          <DateLieuMap 
            lieu={lieu}
            onDirections={() => console.log('[DateView] Ouverture itinéraire')}
          />
        </div>
      )}

      {/* Notes */}
      {dateData.notes && (
        <div className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notesContent}>
            {dateData.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default DateView;