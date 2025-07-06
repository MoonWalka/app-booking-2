// src/components/lieux/desktop/LieuView.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLieuDetails } from '@/hooks/lieux';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import EntityCard from '@/components/ui/EntityCard';
// import ConfirmationModal from '@/components/ui/ConfirmationModal'; // TODO: Ajouter modal de suppression
import DateLieuMap from '../../dates/desktop/sections/DateLieuMap';
import styles from './LieuView.module.css';

/**
 * Composant des détails d'un lieu - Interface moderne et épurée
 * Utilise les vrais hooks Firebase du projet principal
 */
function LieuView({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hooks Firebase existants
  const detailsHook = useLieuDetails(id);

  const {
    lieu,
    loading,
    error,
    relatedData,
    // handleDelete, // TODO: Utiliser pour modal de suppression
    formatDate
  } = detailsHook || {};

  // Formater les entités liées pour l'affichage - CORRECTION: utiliser relatedData
  const contact = relatedData?.contact || null;
  const structure = relatedData?.structure || null;
  const concerts = relatedData?.concerts || [];
  const artistes = relatedData?.artistes || [];
  
  const contactsList = contact ? [contact] : [];
  const structuresList = structure ? [structure] : [];
  const concertsArray = concerts || [];
  const artistesArray = artistes || [];


  // Formatage des données pour l'affichage
  const lieuData = useMemo(() => {
    if (!lieu) return null;

    return {
      id: lieu.id,
      nom: lieu.nom || "Lieu sans nom",
      dateCreation: lieu.dateCreation ? formatDate(lieu.dateCreation) : "Date inconnue",
      adresse: lieu.adresse || "Adresse non renseignée",
      ville: lieu.ville || "Ville non renseignée",
      codePostal: lieu.codePostal || "",
      capacite: lieu.capacite ? `${lieu.capacite} personnes` : "Capacité non renseignée",
      typeAcoustique: lieu.typeAcoustique || "Non spécifié",
      equipements: lieu.equipements || "Non renseignés",
      notes: lieu.notes || ""
    };
  }, [lieu, formatDate]);

  // Handlers
  const handleEdit = () => navigate(`/lieux/${id}/edit`);

  // const handleDeleteLieu = () => {
  //   if (handleDelete) {
  //     handleDelete();
  //   }
  // }; // TODO: Ajouter modal de confirmation

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId) => {
    if (!entityId) {
      return;
    }
    
    const routes = {
      contact: `/contacts/${entityId}`,
      structure: `/structures/${entityId}`,
      concert: `/dates/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      navigate(routes[entityType]);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du lieu..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message || error} />;
  }

  if (!lieuData) {
    return <ErrorMessage message="Lieu introuvable" />;
  }

  return (
    <div className={styles.lieuDetails}>
      {/* Header avec FormHeader */}
      <FormHeader
        title={lieuData.nom}
        subtitle={`Créé le ${lieuData.dateCreation}`}
        icon={<i className="bi bi-geo-alt"></i>}
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
        
        {/* Détails du lieu */}
        <div className={styles.lieuInfoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.label}>Adresse</p>
            <p className={styles.value}>{lieuData.adresse}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Ville</p>
            <p className={styles.value}>{lieuData.ville} {lieuData.codePostal}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Capacité</p>
            <p className={styles.value}>{lieuData.capacite}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Type acoustique</p>
            <p className={styles.value}>{lieuData.typeAcoustique}</p>
          </div>
        </div>

        {/* Entités liées */}
        {(contactsList.length > 0 || structuresList.length > 0 || concertsArray.length > 0 || artistesArray.length > 0) && (
          <div className={styles.entitiesSection}>
            <p className={styles.entitiesLabel}>Entités liées</p>
            <div className={styles.entitiesGrid}>
              
              {/* Contacts */}
              {contactsList.slice(0, 3).map((contact) => (
                <EntityCard
                  key={contact.id}
                  entityType="contact"
                  name={contact.nom || contact.prenom || 'Contact'}
                  subtitle={`Contact (${contactsList.length})`}
                  onClick={() => {
                    const contactId = contact.id || contact.contactId;
                    navigateToEntity('contact', contactId);
                  }}
                />
              ))}

              {/* Structures */}
              {structuresList.slice(0, 3).map((structure) => (
                <EntityCard
                  key={structure.id}
                  entityType="structure"
                  name={structure.nom || 'Structure'}
                  subtitle={`Structure (${structuresList.length})`}
                  onClick={() => {
                    const structureId = structure.id || structure.structureId;
                    navigateToEntity('structure', structureId);
                  }}
                />
              ))}

              {/* Dates */}
              {concertsArray.slice(0, 3).map((dateItem) => (
                <EntityCard
                  key={dateItem.id}
                  entityType="concert"
                  name={dateItem.titre || 'Date'}
                  subtitle={`Date (${concertsArray.length})`}
                  onClick={() => {
                    const dateId = dateItem.id || dateItem.dateId;
                    navigateToEntity('concert', dateId);
                  }}
                />
              ))}

              {/* Artistes */}
              {artistesArray.slice(0, 3).map((artiste) => (
                <EntityCard
                  key={artiste.id}
                  entityType="artiste"
                  name={artiste.nom || 'Artiste'}
                  subtitle={`Artiste (${artistesArray.length})`}
                  onClick={() => {
                    const artisteId = artiste.id || artiste.artisteId;
                    navigateToEntity('artiste', artisteId);
                  }}
                />
              ))}
            </div>
            
            {/* Message si plus d'entités */}
            {(contactsList.length + structuresList.length + concertsArray.length + artistesArray.length) > 3 && (
              <p className={styles.moreEntities}>
                Et {(contactsList.length + structuresList.length + concertsArray.length + artistesArray.length) - 3} autres entités liées...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Section Adresse et Carte */}
      <div className={`${styles.section} ${styles.mapSection}`}>
        <div className={styles.mapHeader}>
          <div className={styles.mapInfo}>
            <h2>Adresse et localisation</h2>
            <p className={styles.mapSubtitle}>
              {lieuData.adresse}, {lieuData.ville} {lieuData.codePostal}
            </p>
          </div>
        </div>
        
        {/* Carte interactive */}
        <DateLieuMap 
          lieu={lieu}
          onDirections={() => {}}
        />
      </div>

      {/* Équipements */}
      {lieuData.equipements && lieuData.equipements !== "Non renseignés" && (
        <div className={styles.section}>
          <h2>Équipements</h2>
          <p className={styles.equipementsContent}>
            {lieuData.equipements}
          </p>
        </div>
      )}

      {/* Notes */}
      {lieuData.notes && (
        <div className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notesContent}>
            {lieuData.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default LieuView;