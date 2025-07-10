// src/components/structures/desktop/StructureView.js
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructureDetails } from '@/hooks/structures';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import FormHeader from '@/components/ui/FormHeader';
import EntityCard from '@/components/ui/EntityCard';
import Card from '@/components/ui/Card';
// import ConfirmationModal from '@/components/ui/ConfirmationModal'; // TODO: Ajouter modal de suppression
import styles from './StructureView.module.css';

/**
 * Composant des détails d'une structure - Interface moderne et épurée
 * Utilise les vrais hooks Firebase du projet principal
 */
function StructureView({ id: propId }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const id = propId || urlId;

  // Hooks Firebase existants
  const detailsHook = useStructureDetails(id);

  const {
    structure,
    loading,
    error,
    relatedData,
    // handleDelete, // TODO: Utiliser pour modal de suppression
    formatValue
  } = detailsHook || {};

  // Formater les entités liées pour l'affichage - CORRECTION: utiliser relatedData
  const contacts = relatedData?.contacts || [];
  const dates = relatedData?.concerts || [];
  const lieux = relatedData?.lieux || [];
  const artistes = relatedData?.artistes || [];
  
  const contactsList = contacts || [];
  const datesList = dates || [];
  const lieuxList = lieux || [];
  const artistesList = artistes || [];

  // Formatage des données pour l'affichage
  const structureData = useMemo(() => {
    if (!structure) return null;

    const getTypeLabel = (type) => {
      const typeMap = {
        'association': 'Association',
        'festival': 'Festival',
        'salle': 'Salle de spectacle',
        'label': 'Label',
        'producteur': 'Producteur',
        'collectivite': 'Collectivité',
        'entreprise': 'Entreprise',
        'autre': 'Autre'
      };
      return typeMap[type] || 'Non spécifié';
    };

    // Gérer l'adresse qui peut être un objet ou une string
    const formatAdresse = (adresseData) => {
      if (!adresseData) return "Adresse non renseignée";
      
      if (typeof adresseData === 'string') {
        return adresseData;
      }
      
      if (typeof adresseData === 'object') {
        const parts = [
          adresseData.adresse || adresseData.rue,
          adresseData.codePostal,
          adresseData.ville,
          adresseData.pays
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join(', ') : "Adresse non renseignée";
      }
      
      return "Adresse non renseignée";
    };

    return {
      id: structure.id,
      nom: structure.nom || "Structure sans nom",
      raisonSociale: structure.raisonSociale || "",
      type: getTypeLabel(structure.type),
      dateCreation: structure.createdAt ? formatValue('createdAt', structure.createdAt) : "Date inconnue",
      
      // Adresse complète
      adresse: formatAdresse(structure.adresse || structure.adresseLieu),
      ville: structure.ville || (structure.adresse?.ville) || (structure.adresseLieu?.ville) || "Ville non renseignée",
      codePostal: structure.codePostal || (structure.adresse?.codePostal) || (structure.adresseLieu?.codePostal) || "",
      pays: structure.pays || (structure.adresse?.pays) || (structure.adresseLieu?.pays) || "France",
      
      // Coordonnées
      email: structure.email || "",
      telephone: structure.telephone || "",
      siteWeb: structure.siteWeb || "",
      
      // Informations légales
      numeroSiret: structure.siret || structure.numeroSiret || "",
      numeroTVA: structure.tva || structure.numeroIntracommunautaire || "",
      
      // Contenus
      description: structure.description || "",
      presentation: structure.presentation || "",
      notes: structure.notes || ""
    };
  }, [structure, formatValue]);

  // Handlers
  const handleEdit = () => navigate(`/structures/${id}/edit`);

  // const handleDeleteStructure = () => {
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
      date: `/dates/${entityId}`,
      lieu: `/lieux/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      navigate(routes[entityType]);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la structure..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message || error} />;
  }

  if (!structureData) {
    return <ErrorMessage message="Structure introuvable" />;
  }

  return (
    <div className={styles.structureDetails}>
      {/* Header avec FormHeader */}
      <FormHeader
        title={structureData.nom}
        subtitle={`${structureData.type} • Créé le ${structureData.dateCreation}`}
        icon={<i className="bi bi-building"></i>}
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

      {/* Informations de la Structure */}
      <div className={styles.section}>
        <h2>Informations de la structure</h2>
        
        {/* Grille d'informations unifiée */}
        <div className={styles.structureInfoGrid}>
          {/* Informations de base */}
          <div className={styles.infoItem}>
            <p className={styles.label}>Type</p>
            <p className={styles.value}>{structureData.type}</p>
          </div>
          
          {structureData.raisonSociale && (
            <div className={styles.infoItem}>
              <p className={styles.label}>Raison sociale</p>
              <p className={styles.value}>{structureData.raisonSociale}</p>
            </div>
          )}

          {/* Informations légales */}
          {structureData.numeroSiret && (
            <div className={styles.infoItem}>
              <p className={styles.label}>N° SIRET</p>
              <p className={styles.value}>{structureData.numeroSiret}</p>
            </div>
          )}
          
          {structureData.numeroTVA && (
            <div className={styles.infoItem}>
              <p className={styles.label}>N° TVA Intracommunautaire</p>
              <p className={styles.value}>{structureData.numeroTVA}</p>
            </div>
          )}

          {/* Coordonnées */}
          <div className={styles.infoItem}>
            <p className={styles.label}>Email</p>
            <p className={styles.value}>
              {structureData.email ? (
                <a href={`mailto:${structureData.email}`} className={styles.emailLink}>
                  {structureData.email}
                </a>
              ) : (
                "Email non renseigné"
              )}
            </p>
          </div>
          
          <div className={styles.infoItem}>
            <p className={styles.label}>Téléphone</p>
            <p className={styles.value}>
              {structureData.telephone ? (
                <a href={`tel:${structureData.telephone}`} className={styles.phoneLink}>
                  {structureData.telephone}
                </a>
              ) : (
                "Téléphone non renseigné"
              )}
            </p>
          </div>
          
          <div className={styles.infoItem}>
            <p className={styles.label}>Site web</p>
            <p className={styles.value}>
              {structureData.siteWeb ? (
                <a href={structureData.siteWeb} target="_blank" rel="noopener noreferrer" className={styles.webLink}>
                  {structureData.siteWeb}
                </a>
              ) : (
                "Site web non renseigné"
              )}
            </p>
          </div>

          {/* Adresse */}
          <div className={styles.infoItem}>
            <p className={styles.label}>Adresse</p>
            <p className={styles.value}>{structureData.adresse}</p>
          </div>
          
          <div className={styles.infoItem}>
            <p className={styles.label}>Ville</p>
            <p className={styles.value}>{structureData.ville} {structureData.codePostal}</p>
          </div>
          
          {structureData.pays !== "France" && (
            <div className={styles.infoItem}>
              <p className={styles.label}>Pays</p>
              <p className={styles.value}>{structureData.pays}</p>
            </div>
          )}
        </div>
      </div>

      {/* Entités liées */}
      {(contactsList.length > 0 || datesList.length > 0 || lieuxList.length > 0 || artistesList.length > 0) && (
        <div className={styles.section}>
          <h2>Entités liées</h2>
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

            {/* Dates */}
            {datesList.slice(0, 3).map((dateItem) => (
              <EntityCard
                key={dateItem.id}
                entityType="date"
                name={dateItem.titre || 'Date'}
                subtitle={`Date (${datesList.length})`}
                onClick={() => {
                  const dateId = dateItem.id || dateItem.dateId;
                  navigateToEntity('date', dateId);
                }}
              />
            ))}

            {/* Artistes */}
            {artistesList.slice(0, 3).map((artiste) => (
              <EntityCard
                key={artiste.id}
                entityType="artiste"
                name={artiste.nom || 'Artiste'}
                subtitle={`Artiste (${artistesList.length})`}
                onClick={() => {
                  const artisteId = artiste.id || artiste.artisteId;
                  navigateToEntity('artiste', artisteId);
                }}
              />
            ))}

            {/* Lieux */}
            {lieuxList.slice(0, 3).map((lieu) => (
              <EntityCard
                key={lieu.id}
                entityType="lieu"
                name={lieu.nom || 'Lieu'}
                subtitle={`Lieu (${lieuxList.length})`}
                onClick={() => {
                  const lieuId = lieu.id || lieu.lieuId;
                  navigateToEntity('lieu', lieuId);
                }}
              />
            ))}
          </div>
          
          {/* Message si plus d'entités */}
          {(contactsList.length + datesList.length + lieuxList.length + artistesList.length) > 3 && (
            <p className={styles.moreEntities}>
              Et {(contactsList.length + datesList.length + lieuxList.length + artistesList.length) - 3} autres entités liées...
            </p>
          )}
        </div>
      )}

      {/* Présentation/Description */}
      {(structureData.presentation || structureData.description) && (
        <div className={styles.section}>
          <h2>{structureData.presentation ? 'Présentation' : 'Description'}</h2>
          <p className={styles.descriptionContent}>
            {structureData.presentation || structureData.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {structureData.notes && (
        <div className={styles.section}>
          <h2>Notes internes</h2>
          <p className={styles.notesContent}>
            {structureData.notes}
          </p>
        </div>
      )}

      {/* Section Historique - utilise le composant Card */}
      <Card className={styles.historySection}>
        <h2>Historique</h2>
        <div className={styles.historyGrid}>
          <div className={styles.historyItem}>
            <span className={styles.historyLabel}>Créé le</span>
            <span className={styles.historyValue}>{structureData.dateCreation}</span>
          </div>
          <div className={styles.historyItem}>
            <span className={styles.historyLabel}>Contacts associés</span>
            <span className={styles.historyValue}>{contactsList.length}</span>
          </div>
          <div className={styles.historyItem}>
            <span className={styles.historyLabel}>Dates organisés</span>
            <span className={styles.historyValue}>{datesList.length}</span>
          </div>
          <div className={styles.historyItem}>
            <span className={styles.historyLabel}>Lieux liés</span>
            <span className={styles.historyValue}>{lieuxList.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default StructureView;