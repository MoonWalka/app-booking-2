// src/components/contacts/desktop/ContactView.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSimpleContactDetails from '@/hooks/contacts/useSimpleContactDetails';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import EntityCard from '@/components/ui/EntityCard';
import HistoriqueEchanges from '../HistoriqueEchanges';
// import OrganizationIdTest from '@/debug/OrganizationIdTest';
import styles from './ContactView.module.css';

/**
 * Composant des détails d'un contact - Interface moderne et épurée
 * Aligné avec l'architecture de ConcertView et LieuView
 */
function ContactView({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hook Firebase simplifié
  const detailsHook = useSimpleContactDetails(id);

  const {
    contact,
    structure,
    lieux,
    concerts,
    artistes,
    loading,
    error
  } = detailsHook || {};

  // Debug - Affichage des données reçues
  console.log('[ContactView] Données reçues:', {
    contact: contact ? { 
      id: contact.id, 
      nom: contact.nom, 
      prenom: contact.prenom,
      email: contact.email,
      structureId: contact.structureId,
      // Afficher toutes les clés de l'objet contact pour déboguer
      allKeys: Object.keys(contact)
    } : null,
    structure: structure ? { 
      id: structure.id, 
      nom: structure.nom 
    } : null,
    lieuxCount: lieux?.length || 0,
    concertsCount: concerts?.length || 0
  });
  
  // Debug - Affichage complet du contact pour voir la structure
  if (contact) {
    console.log('[ContactView] Contact complet:', contact);
  }

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

    // Debug - Vérifier la valeur de l'email avant formatage
    console.log('[ContactView] Email du contact avant formatage:', {
      'contact.email': contact.email,
      'typeof contact.email': typeof contact.email,
      'email exists': !!contact.email
    });

    const formattedData = {
      id: contact.id,
      nom: contact.nom || "Nom non renseigné",
      prenom: contact.prenom || "Prénom non renseigné",
      nomComplet: `${contact.prenom || ''} ${contact.nom || ''}`.trim() || 'Contact sans nom',
      dateCreation: contact.dateCreation ? formatDate(contact.dateCreation) : "Date inconnue",
      email: contact.email || "Email non renseigné",
      telephone: contact.telephone || "Téléphone non renseigné",
      fonction: contact.fonction || "Fonction non renseignée",
      adresse: contact.adresse || "",
      ville: contact.ville || "",
      codePostal: contact.codePostal || "",
      adresseComplete: [contact.adresse, contact.codePostal, contact.ville]
        .filter(Boolean)
        .join(' ') || "Adresse non renseignée",
      notes: contact.notes || ""
    };
    
    // Debug - Vérifier la valeur après formatage
    console.log('[ContactView] ContactData formaté:', {
      email: formattedData.email,
      emailIsDefault: formattedData.email === "Email non renseigné"
    });
    
    return formattedData;
  }, [contact]);

  // Handlers
  const handleEdit = () => navigate(`/contacts/${id}/edit`);

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId) => {
    console.log(`[ContactView] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[ContactView] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      structure: `/structures/${entityId}`,
      lieu: `/lieux/${entityId}`,
      concert: `/concerts/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[ContactView] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[ContactView] Route inconnue pour ${entityType}`);
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
            <p className={styles.value}>{contactData.adresseComplete}</p>
          </div>
        </div>

        {/* Entités liées */}
        {(structure || lieux?.length > 0 || concerts?.length > 0 || artistes?.length > 0) && (
          <div className={styles.entitiesSection}>
            <p className={styles.entitiesLabel}>Entités liées</p>
            <div className={styles.entitiesGrid}>
              
              {/* Structure */}
              {structure && (
                <EntityCard
                  entityType="structure"
                  name={structure.nom || 'Structure'}
                  subtitle="Structure"
                  onClick={() => {
                    console.log('[ContactView] Clic sur structure:', structure);
                    navigateToEntity('structure', structure.id);
                  }}
                />
              )}
              
              {/* Premiers lieux */}
              {lieux?.slice(0, 2).map((lieu) => (
                <EntityCard
                  key={lieu.id}
                  entityType="lieu"
                  name={lieu.nom || 'Lieu'}
                  subtitle={`Lieu (${lieux.length})`}
                  onClick={() => navigateToEntity('lieu', lieu.id)}
                />
              ))}
              
              {/* Premiers concerts */}
              {concerts?.slice(0, 2).map((concert) => (
                <EntityCard
                  key={concert.id}
                  entityType="concert"
                  name={concert.titre || 'Concert'}
                  subtitle={`Concert (${concerts.length})`}
                  onClick={() => navigateToEntity('concert', concert.id)}
                />
              ))}
              
              {/* Premiers artistes */}
              {artistes?.slice(0, 2).map((artiste) => (
                <EntityCard
                  key={artiste.id}
                  entityType="artiste"
                  name={artiste.nom || 'Artiste'}
                  subtitle={`Artiste (${artistes.length})`}
                  onClick={() => navigateToEntity('artiste', artiste.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Notes */}
      {contactData.notes && (
        <div className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notesContent}>
            {contactData.notes}
          </p>
        </div>
      )}

      {/* Historique des échanges */}
      <HistoriqueEchanges contactId={id} concerts={concerts} />
    </div>
  );
}

export default ContactView;