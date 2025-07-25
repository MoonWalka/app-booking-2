import React, { useState, useEffect } from 'react';
import ContactDatesTable from '../ContactDatesTable';
import ContratsTableNew from '@/components/contrats/sections/ContratsTableNew';
import ContactFacturesTable from '../ContactFacturesTable';
import ContactFestivalsTable from '../ContactFestivalsTable';
import HistoriqueEchanges from '../HistoriqueEchanges';
import { useContactContrats } from '@/hooks/contacts/useContactContrats';
import { useTabs } from '@/context/TabsContext';
import styles from '../ContactViewTabs.module.css';

/**
 * Formate un numéro de téléphone avec des espaces
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
  }
  return phone;
};

/**
 * Composant pour afficher un numéro de téléphone avec toggle de formatage
 */
const PhoneDisplay = ({ phone }) => {
  const [isFormatted, setIsFormatted] = useState(() => {
    const saved = localStorage.getItem('phoneFormatPreference');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('phoneFormatPreference', isFormatted);
  }, [isFormatted]);

  if (!phone) return phone;

  const displayPhone = isFormatted ? formatPhoneNumber(phone) : phone;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span>{displayPhone}</span>
      <button
        onClick={() => setIsFormatted(!isFormatted)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#6c757d',
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#007bff'}
        onMouseLeave={(e) => e.target.style.color = '#6c757d'}
        title={isFormatted ? 'Afficher sans formatage' : 'Afficher avec formatage'}
      >
        <i className={isFormatted ? 'bi bi-dash-circle' : 'bi bi-plus-circle'}></i>
      </button>
    </span>
  );
};

/**
 * Gestion du contenu des onglets du bas
 * Affiche le contenu approprié selon l'onglet actif
 */
function ContactBottomTabs({ 
  activeTab, 
  contactId,
  viewType = 'contact',
  extractedData,
  datesData,
  openDateCreationTab,
  onDatesUpdate 
}) {
  // Hook pour récupérer les contrats du contact/structure
  console.log('[ContactBottomTabs] Appel du hook useContactContrats avec:', { contactId, viewType });
  const { contrats } = useContactContrats(contactId, viewType);
  
  // Hook pour la gestion des onglets (devis, factures, contrats)
  const { 
    openTab, 
    openDevisTab, 
    openNewDevisTab, 
    openContratTab 
  } = useTabs();

  // Helper pour les handlers de factures (garde la logique spécifique contact)
  const handleViewFacture = (factureId) => {
    openTab({
      id: `facture-${factureId}`,
      title: `Facture`,
      path: `/factures/${factureId}`,
      component: 'FactureGeneratorPage', // Remplacement de FactureDetailsPage
      params: { factureId },
      icon: 'bi-receipt'
    });
  };

  const handleGenerateFacture = (dateId, contratId) => {
    const structureName = extractedData?.structureRaisonSociale || extractedData?.structureNom || 'Structure';
    openTab({
      id: `facture-generate-${dateId}`,
      title: `Nouvelle facture - ${structureName}`,
      path: `/factures/generate/${dateId}?fromContrat=true`,
      component: 'FactureGeneratorPage',
      params: { dateId, fromContrat: true, contratId },
      icon: 'bi-receipt'
    });
  };

  const renderTabContent = () => {
    console.log('[ContactBottomTabs] Onglet actif:', activeTab, 'Nombre de contrats:', contrats.length);
    
    switch (activeTab) {
      case 'historique':
        return (
          <div className={styles.tabContent}>
            <HistoriqueEchanges 
              contactId={contactId}
              dates={datesData}
            />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3><i className="bi bi-building"></i> Informations de salle</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (openTab) {
                      openTab({
                        id: 'gerer-salles',
                        title: 'Gérer les salles',
                        path: '/salles',
                        component: 'SallesPage',
                        icon: 'bi-building'
                      });
                    }
                  }}
                >
                  <i className="bi bi-gear me-2"></i>
                  Gérer les salles
                </button>
              </div>
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
                    <span><PhoneDisplay phone={extractedData.salleTelephone} /></span>
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

      case 'festival':
        return (
          <div className={styles.tabContent}>
            <ContactFestivalsTable 
              contactId={contactId}
              contactName={extractedData?.structureRaisonSociale || extractedData?.structureNom || 'Diffuseur'}
            />
          </div>
        );

      case 'dates':
        return (
          <div className={styles.tabContent}>
            <ContactDatesTable 
              contactId={contactId}
              dates={datesData}
              onAddClick={() => {
                if (extractedData?.structureRaisonSociale || extractedData?.id) {
                  openDateCreationTab({
                    structureId: extractedData.id || contactId,
                    structureName: extractedData.structureRaisonSociale || extractedData.structureNom
                  });
                }
              }}
              onDeleteSuccess={() => {
                // Recharger les dates après suppression
                if (onDatesUpdate) {
                  onDatesUpdate();
                }
              }}
            />
          </div>
        );

      case 'contrats':
        return (
          <div className={styles.tabContent}>
            <ContratsTableNew 
              contrats={contrats}
              onUpdateContrat={(contrat) => {
                console.log('Mise à jour contrat:', contrat);
                // TODO: Implémenter la mise à jour du contrat dans Firebase
              }}
              // Utilisation directe des fonctions du contexte (comme l'onglet dates)
              openDevisTab={openDevisTab}
              openNewDevisTab={openNewDevisTab}
              openContratTab={openContratTab}
              handleViewFacture={handleViewFacture}
              handleGenerateFacture={handleGenerateFacture}
              // Helper pour les noms de structure
              getStructureName={() => extractedData?.structureRaisonSociale || extractedData?.structureNom || 'Structure'}
            />
          </div>
        );

      case 'factures':
        return (
          <div className={styles.tabContent}>
            <ContactFacturesTable 
              contactId={contactId} 
              entityType={viewType}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return renderTabContent();
}

export default ContactBottomTabs;