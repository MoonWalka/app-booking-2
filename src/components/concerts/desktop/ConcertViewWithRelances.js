// src/components/concerts/desktop/ConcertViewWithRelances.js
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConcertDetails } from '@/hooks/concerts';
import { useConcertStatus } from '@/hooks/concerts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import StatutBadge from '@/components/ui/StatutBadge';
import EntityCard from '@/components/ui/EntityCard';
import RelancesWidget from '@/components/relances/RelancesWidget';
import Modal from '@/components/common/Modal';
import useRelanceForm from '@/hooks/relances/useRelanceForm';
// import ConfirmationModal from '@/components/ui/ConfirmationModal'; // TODO: Ajouter modal de suppression
import ConcertLieuMap from './sections/ConcertLieuMap';
import styles from './ConcertView.module.css';

/**
 * Composant des détails d'un concert avec widget de relances intégré
 * Exemple d'intégration du système de relances dans une page existante
 */
function ConcertViewWithRelances({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;
  const [showRelanceModal, setShowRelanceModal] = useState(false);

  // Hooks Firebase existants
  const detailsHook = useConcertDetails(id);
  const concertStatus = useConcertStatus();
  const { formData, setFormData, saveRelance, resetForm } = useRelanceForm();

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
  } = detailsHook || {};

  // Debug - Affichage des données reçues
  console.log('[ConcertViewWithRelances] Données reçues:', {
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
      return labelMap[statut] || statut;
    };

    const statusVariant = statusDetails.variant || getStatusVariant(concert.statut);
    const statusLabel = statusDetails.label || getStatusLabel(concert.statut);

    return {
      titre: concert.titre || 'Sans titre',
      date: formatDate(concert.date) || 'Non définie',
      heure: concert.heure || 'Non définie',
      prix: formatMontant(concert.montantTotal) || 'Non défini',
      statut: {
        raw: concert.statut,
        variant: statusVariant,
        label: statusLabel
      },
      notes: concert.notes || ''
    };
  }, [concert, concertStatus, formatDate, formatMontant]);

  // Navigation vers les entités
  const navigateToEntity = (type, id) => {
    if (!id) {
      console.error('[ConcertViewWithRelances] ID manquant pour navigation:', type);
      return;
    }
    console.log('[ConcertViewWithRelances] Navigation vers:', type, id);
    const typeMap = {
      artiste: 'artistes',
      contact: 'contacts',
      lieu: 'lieux',
      structure: 'structures'
    };
    navigate(`/${typeMap[type]}/${id}`);
  };

  // Gérer l'ajout d'une relance pour ce concert
  const handleAddRelance = () => {
    resetForm();
    setFormData({
      ...formData,
      entityType: 'concert',
      entityId: id,
      entityName: concert?.titre || 'Concert'
    });
    setShowRelanceModal(true);
  };

  // Sauvegarder la relance
  const handleSaveRelance = async () => {
    try {
      await saveRelance();
      setShowRelanceModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la relance:', error);
    }
  };

  // Gestion des états de chargement et d'erreur
  if (loading) return <LoadingSpinner message="Chargement du concert..." />;
  if (error) return <ErrorMessage message={`Erreur lors du chargement : ${error.message}`} />;
  if (!concert) return <ErrorMessage message="Concert non trouvé" />;

  return (
    <div className={styles.concertDetailsContainer}>
      <FormHeader
        title={concertData.titre}
        subtitle={`Créé le ${formatDate(concert.dateCreation)}`}
        icon={<i className="bi bi-music-note-beamed"></i>}
        roundedTop={true}
        actions={[
          <Button 
            key="edit"
            variant="primary" 
            onClick={() => navigate(`/concerts/${id}/edit`)}
            icon={<i className="bi bi-pencil"></i>}
          >
            Modifier
          </Button>
        ]}
      />

      {/* Section principale avec 2 colonnes */}
      <div className={styles.mainContent}>
        {/* Colonne gauche : Informations du concert */}
        <div className={styles.leftColumn}>
          {/* Section Informations principales */}
          <div className={styles.section}>
            <h2>Informations générales</h2>
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
                      console.log('[ConcertViewWithRelances] Clic sur artiste:', artiste);
                      const artisteId = artiste.id || artiste.artisteId;
                      console.log('[ConcertViewWithRelances] ID artiste trouvé:', artisteId);
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
                      console.log('[ConcertViewWithRelances] Clic sur contact:', contact);
                      const contactId = contact.id || contact.contactId;
                      console.log('[ConcertViewWithRelances] ID contact trouvé:', contactId);
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
                      console.log('[ConcertViewWithRelances] Clic sur structure:', structure);
                      const structureId = structure.id || structure.structureId;
                      console.log('[ConcertViewWithRelances] ID structure trouvé:', structureId);
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
                    console.log('[ConcertViewWithRelances] Clic sur lieu détails:', lieu);
                    const lieuId = lieu.id || lieu.lieuId;
                    console.log('[ConcertViewWithRelances] ID lieu trouvé:', lieuId);
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
                onDirections={() => console.log('[ConcertViewWithRelances] Ouverture itinéraire')}
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

        {/* Colonne droite : Widget de relances */}
        <div className={styles.rightColumn}>
          <RelancesWidget
            entityType="concert"
            entityId={id}
            entityName={concertData.titre}
            showAddButton={true}
            onAddRelance={handleAddRelance}
            className={styles.relancesWidget}
          />
        </div>
      </div>

      {/* Modal d'ajout de relance */}
      {showRelanceModal && (
        <Modal
          isOpen={showRelanceModal}
          onClose={() => {
            setShowRelanceModal(false);
            resetForm();
          }}
          title="Nouvelle relance pour ce concert"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelance();
          }} className={styles.relanceForm}>
            <div className={styles.formGroup}>
              <label htmlFor="titre">Titre *</label>
              <input
                type="text"
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
                className={styles.formControl}
                placeholder="Ex: Confirmer la date avec l'artiste"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={styles.formControl}
                placeholder="Détails supplémentaires..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="dateEcheance">Date d'échéance *</label>
                <input
                  type="date"
                  id="dateEcheance"
                  value={formData.dateEcheance}
                  onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="priorite">Priorité *</label>
                <select
                  id="priorite"
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                  required
                  className={styles.formControl}
                >
                  <option value="">Sélectionner</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => {
                  setShowRelanceModal(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Créer la relance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ConcertViewWithRelances;