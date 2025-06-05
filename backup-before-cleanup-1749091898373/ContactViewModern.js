// src/components/contacts/desktop/ContactViewModern.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import EntityCard from '@/components/ui/EntityCard';
import Card from '@/components/ui/Card';
import styles from './ContactViewModern.module.css';

/**
 * Composant des détails d'un contact - Interface moderne et épurée
 * Utilise les vrais hooks Firebase du projet principal
 * Architecture identique à ConcertView et LieuView
 */
function ContactViewModern({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hooks Firebase existants - Version moderne
  const detailsHook = useContactDetailsModern(id);

  const {
    contact,
    structure,
    lieux,
    concerts,
    artistes,
    loading,
    error,
    // handleDelete, // TODO: Utiliser pour modal de suppression
  } = detailsHook || {};

  // Formater les entités liées pour l'affichage
  const structuresList = structure ? [structure] : [];
  const lieuxArray = lieux || [];
  const concertsArray = concerts || [];
  const artistesArray = artistes || [];

  // Debug - Affichage des données reçues
  console.log('[ContactViewModern] Données reçues:', {
    contact: contact ? { 
      id: contact.id, 
      nom: contact.nom,
      prenom: contact.prenom,
      structureId: contact.structureId,
      allFields: Object.keys(contact)
    } : null,
    structure: structure,
    lieuxCount: lieuxArray.length,
    concertsCount: concertsArray.length,
    artistesCount: artistesArray.length,
    lieuxData: lieuxArray,
    concertsData: concertsArray,
    artistesData: artistesArray
  });

  // Formatage des données pour l'affichage
  const contactData = useMemo(() => {
    if (!contact) return null;

    const formatDate = (value) => {
      if (!value) return "Date inconnue";
      try {
        return new Date(value).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      } catch {
        return "Date invalide";
      }
    };

    return {
      id: contact.id,
      nom: contact.nom || "Nom non renseigné",
      prenom: contact.prenom || "Prénom non renseigné",
      nomComplet: `${contact.prenom || ''} ${contact.nom || ''}`.trim() || 'Contact sans nom',
      dateCreation: contact.dateCreation ? formatDate(contact.dateCreation) : "Date inconnue",
      email: contact.email || "Email non renseigné",
      telephone: contact.telephone || "Téléphone non renseigné",
      fonction: contact.fonction || "Fonction non renseignée",
      adresse: contact.adresse || "Adresse non renseignée",
      ville: contact.ville || "Ville non renseignée",
      codePostal: contact.codePostal || "",
      notes: contact.notes || ""
    };
  }, [contact]);

  // Handlers
  const handleEdit = () => navigate(`/contacts/${id}/edit`);

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId) => {
    console.log(`[ContactViewModern] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[ContactViewModern] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      structure: `/structures/${entityId}`,
      lieu: `/lieux/${entityId}`,
      concert: `/concerts/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[ContactViewModern] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[ContactViewModern] Route inconnue pour ${entityType}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du contact..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message || error} />;
  }

  if (!contactData) {
    return <ErrorMessage message="Contact introuvable" />;
  }

  return (
    <div className={styles.contactDetails}>
      {/* Header avec FormHeader */}
      <FormHeader
        title={contactData.nomComplet}
        subtitle={`Créé le ${contactData.dateCreation}`}
        icon={<i className="bi bi-person"></i>}
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
        
        {/* Détails du contact */}
        <div className={styles.contactInfoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.label}>Email</p>
            <p className={styles.value}>{contactData.email}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Téléphone</p>
            <p className={styles.value}>{contactData.telephone}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Fonction</p>
            <p className={styles.value}>{contactData.fonction}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Adresse</p>
            <p className={styles.value}>
              {contactData.adresse}
              {contactData.ville && contactData.ville !== "Ville non renseignée" && (
                <><br />{contactData.ville} {contactData.codePostal}</>
              )}
            </p>
          </div>
        </div>

        {/* Entités liées */}
        {(structuresList.length > 0 || lieuxArray.length > 0 || concertsArray.length > 0 || artistesArray.length > 0) && (
          <div className={styles.entitiesSection}>
            <p className={styles.entitiesLabel}>Entités liées</p>
            <div className={styles.entitiesGrid}>
              
              {/* Structure */}
              {structuresList.slice(0, 3).map((structure) => (
                <EntityCard
                  key={structure.id}
                  entityType="structure"
                  name={structure.nom || 'Structure'}
                  subtitle="Structure"
                  onClick={() => {
                    console.log('[ContactViewModern] Clic sur structure:', structure);
                    const structureId = structure.id || structure.structureId;
                    console.log('[ContactViewModern] ID structure trouvé:', structureId);
                    navigateToEntity('structure', structureId);
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
                    console.log('[ContactViewModern] Clic sur artiste:', artiste);
                    const artisteId = artiste.id || artiste.artisteId;
                    console.log('[ContactViewModern] ID artiste trouvé:', artisteId);
                    navigateToEntity('artiste', artisteId);
                  }}
                />
              ))}

              {/* Lieux */}
              {lieuxArray.slice(0, 3).map((lieu) => (
                <EntityCard
                  key={lieu.id}
                  entityType="lieu"
                  name={lieu.nom || 'Lieu'}
                  subtitle={`Lieu (${lieuxArray.length})`}
                  onClick={() => {
                    console.log('[ContactViewModern] Clic sur lieu:', lieu);
                    const lieuId = lieu.id || lieu.lieuId;
                    console.log('[ContactViewModern] ID lieu trouvé:', lieuId);
                    navigateToEntity('lieu', lieuId);
                  }}
                />
              ))}

              {/* Concerts */}
              {concertsArray.slice(0, 3).map((concert) => (
                <EntityCard
                  key={concert.id}
                  entityType="concert"
                  name={concert.titre || 'Concert'}
                  subtitle={`Concert (${concertsArray.length})`}
                  onClick={() => {
                    console.log('[ContactViewModern] Clic sur concert:', concert);
                    const concertId = concert.id || concert.concertId;
                    console.log('[ContactViewModern] ID concert trouvé:', concertId);
                    navigateToEntity('concert', concertId);
                  }}
                />
              ))}
            </div>
            
            {/* Message si plus d'entités */}
            {(structuresList.length + artistesArray.length + lieuxArray.length + concertsArray.length) > 3 && (
              <p className={styles.moreEntities}>
                Et {(structuresList.length + artistesArray.length + lieuxArray.length + concertsArray.length) - 3} autres entités liées...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Historique des échanges - Card vide pour l'instant */}
      <Card className={styles.historySection}>
        <div className={styles.historyContent}>
          <h2>Historique des échanges</h2>
          <p className={styles.historyPlaceholder}>
            Cette section sera développée prochainement...
          </p>
        </div>
      </Card>

      {/* Notes */}
      {contactData.notes && (
        <div className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notesContent}>
            {contactData.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default ContactViewModern;