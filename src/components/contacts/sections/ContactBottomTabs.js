import React from 'react';
import ContactDatesTable from '../ContactDatesTable';
import ContratsTableNew from '@/components/contrats/sections/ContratsTableNew';
import ContactFacturesTable from '../ContactFacturesTable';
import styles from '../ContactViewTabs.module.css';

/**
 * Gestion du contenu des onglets du bas
 * Affiche le contenu approprié selon l'onglet actif
 */
function ContactBottomTabs({ 
  activeTab, 
  contactId, 
  extractedData,
  datesData,
  openDateCreationTab 
}) {
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'historique':
        return (
          <div className={styles.tabContent}>
            <div className={`${styles.tabContentCentered} ${styles.constructionZone}`}>
              <i className="bi bi-clock-history" style={{ fontSize: '3rem', color: '#28a745' }}></i>
              <h3>Section Historique</h3>
              <p>En construction</p>
              <small>
                Cette section contiendra bientôt toutes les informations relatives à l'historique 
                de ce contact.
              </small>
            </div>
          </div>
        );

      case 'diffusion':
        return (
          <div className={styles.tabContent}>
            <div className={styles.metadataSection}>
              <h3><i className="bi bi-broadcast"></i> Informations de diffusion</h3>
              <div className={styles.metadataGrid}>
                {extractedData?.nomFestival && (
                  <div className={styles.metadataItem}>
                    <strong>Nom du festival:</strong>
                    <span>{extractedData.nomFestival}</span>
                  </div>
                )}
                {extractedData?.periodeFestivalMois && (
                  <div className={styles.metadataItem}>
                    <strong>Période (mois):</strong>
                    <span>{extractedData.periodeFestivalMois}</span>
                  </div>
                )}
                {extractedData?.periodeFestivalComplete && (
                  <div className={styles.metadataItem}>
                    <strong>Période complète:</strong>
                    <span>{extractedData.periodeFestivalComplete}</span>
                  </div>
                )}
                {extractedData?.bouclage && (
                  <div className={styles.metadataItem}>
                    <strong>Bouclage:</strong>
                    <span>{extractedData.bouclage}</span>
                  </div>
                )}
                {extractedData?.diffusionCommentaires1 && (
                  <div className={styles.metadataItem}>
                    <strong>Commentaires:</strong>
                    <span>{extractedData.diffusionCommentaires1}</span>
                  </div>
                )}
              </div>
              {!extractedData?.nomFestival && !extractedData?.periodeFestivalMois && (
                <div className={styles.emptyMessage}>
                  <i className="bi bi-broadcast" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <p>Aucune information de diffusion</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'salle':
        return (
          <div className={styles.tabContent}>
            <div className={styles.metadataSection}>
              <h3><i className="bi bi-building"></i> Informations de salle</h3>
              <div className={styles.metadataGrid}>
                {extractedData?.salleNom && (
                  <div className={styles.metadataItem}>
                    <strong>Nom de la salle:</strong>
                    <span>{extractedData.salleNom}</span>
                  </div>
                )}
                {(extractedData?.salleAdresse || extractedData?.salleVille) && (
                  <div className={styles.metadataItem}>
                    <strong>Adresse:</strong>
                    <span>
                      {[
                        extractedData.salleAdresse,
                        extractedData.salleSuiteAdresse,
                        extractedData.salleCodePostal,
                        extractedData.salleVille,
                        extractedData.salleDepartement,
                        extractedData.salleRegion,
                        extractedData.sallePays
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {extractedData?.salleTelephone && (
                  <div className={styles.metadataItem}>
                    <strong>Téléphone:</strong>
                    <span>{extractedData.salleTelephone}</span>
                  </div>
                )}
                {(extractedData?.salleJauge1 || extractedData?.salleJauge2 || extractedData?.salleJauge3) && (
                  <div className={styles.metadataItem}>
                    <strong>Jauges:</strong>
                    <span>
                      {[extractedData.salleJauge1, extractedData.salleJauge2, extractedData.salleJauge3]
                        .filter(Boolean)
                        .join(' / ')}
                    </span>
                  </div>
                )}
                {extractedData?.salleCommentaires && (
                  <div className={styles.metadataItem}>
                    <strong>Commentaires:</strong>
                    <span>{extractedData.salleCommentaires}</span>
                  </div>
                )}
              </div>
              {!extractedData?.salleNom && !extractedData?.salleAdresse && (
                <div className={styles.emptyMessage}>
                  <i className="bi bi-building" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <p>Aucune information de salle</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'dates':
        return (
          <div className={styles.tabContent}>
            <ContactDatesTable 
              contactId={contactId}
              concerts={datesData}
              onAddClick={() => {
                if (extractedData?.structureRaisonSociale) {
                  openDateCreationTab(extractedData.structureRaisonSociale);
                }
              }}
            />
          </div>
        );

      case 'contrats':
        return (
          <div className={styles.tabContent}>
            <ContratsTableNew 
              contrats={[]}
              onUpdateContrat={(contrat) => {
                console.log('Mise à jour contrat:', contrat);
              }}
            />
          </div>
        );

      case 'factures':
        return (
          <div className={styles.tabContent}>
            <ContactFacturesTable contactId={contactId} />
          </div>
        );

      default:
        return null;
    }
  };

  return renderTabContent();
}

export default ContactBottomTabs;