import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConcertView.module.css';
import ConcertInfoSection from '@/components/concerts/ConcertInfoSection';
import ConcertLieuMap from '@/components/concerts/ConcertLieuMap';
import ContratCard from '@/components/contrats/ContratCard';
import EntityCard from '@/components/ui/EntityCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatMontant } from '@/utils/formatters';
import RelancesWidget from '@/components/relances/RelancesWidget';
import { debugLog } from '@/utils/logUtils';

/**
 * Version améliorée de ConcertViewWithRelances qui affiche tous les contacts avec leurs rôles
 */
const ConcertViewWithRelancesWithRoles = ({ 
  concert, 
  entity,
  contractId,
  factureId,
  lieu, 
  artiste, 
  contact,
  structure,
  onEdit,
  concertStatus,
  navigateToEntity,
  // Nouvelles props pour les contacts avec rôles
  allContacts = [],
  getRoleLabel,
  showActions = true
}) => {
  const navigate = useNavigate();
  const [isContratCardOpen, setIsContratCardOpen] = useState(false);

  useEffect(() => {
    console.log('[ConcertViewWithRelancesWithRoles] Props reçues:', {
      concert: concert ? 'Présent' : 'Absent',
      entity: entity ? 'Présent' : 'Absent',
      contractId: contractId || 'Absent',
      factureId: factureId || 'Absent',
      lieu: lieu ? 'Présent' : 'Absent',
      artiste: artiste ? 'Présent' : 'Absent',
      contact: contact ? 'Présent' : 'Absent',
      structure: structure ? 'Présent' : 'Absent',
      allContacts: allContacts?.length || 0,
      showActions
    });
  }, [concert, entity, contractId, factureId, lieu, artiste, contact, structure, allContacts, showActions]);

  const handleGenerateContrat = useCallback(() => {
    const concertId = concert?.id || entity?.id;
    console.log('[ConcertViewWithRelancesWithRoles] Génération contrat pour concert:', concertId);
    if (concertId) {
      navigate(`/concerts/${concertId}/contrat/generer`);
    }
  }, [concert?.id, entity?.id, navigate]);

  const handleGenerateFacture = useCallback(() => {
    const concertId = concert?.id || entity?.id;
    console.log('[ConcertViewWithRelancesWithRoles] Génération facture pour concert:', concertId);
    if (concertId) {
      navigate(`/concerts/${concertId}/facture/generer`);
    }
  }, [concert?.id, entity?.id, navigate]);

  // Utiliser entity comme fallback si concert n'est pas fourni
  const concertData = concert || entity;
  if (!concertData) {
    debugLog('[ConcertViewWithRelancesWithRoles] Aucune donnée de concert', 'error', 'ConcertViewWithRelancesWithRoles');
    return <div>Aucune donnée de concert disponible</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        {/* Informations principales */}
        <ConcertInfoSection
          entity={concertData}
          artiste={artiste}
          showEditButton={showActions}
          onEdit={onEdit}
        />

        {/* Carte du lieu */}
        {lieu && lieu.adresse && (
          <Card className={styles.mapCard}>
            <ConcertLieuMap lieu={lieu} />
          </Card>
        )}

        {/* Informations financières */}
        <Card className={styles.financialCard}>
          <div className={styles.financialInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Montant</span>
              <span className={styles.value}>{formatMontant(concertData.montant)}</span>
            </div>
            {concertData.montantTTC && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Montant TTC</span>
                <span className={styles.value}>{formatMontant(concertData.montantTTC)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Documents */}
        {showActions && (
          <Card className={styles.documentsCard}>
            <h3>Documents</h3>
            <div className={styles.documentsGrid}>
              {!contractId ? (
                <Button 
                  onClick={handleGenerateContrat}
                  variant="outline"
                  fullWidth
                >
                  <i className="bi bi-file-earmark-text"></i>
                  Générer le contrat
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(`/contrats/${contractId}`)}
                  variant="outline"
                  fullWidth
                >
                  <i className="bi bi-file-earmark-check"></i>
                  Voir le contrat
                </Button>
              )}

              {!factureId ? (
                <Button 
                  onClick={handleGenerateFacture}
                  variant="outline"
                  fullWidth
                  disabled={!contractId}
                >
                  <i className="bi bi-receipt"></i>
                  Générer la facture
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(`/factures/${factureId}`)}
                  variant="outline"
                  fullWidth
                >
                  <i className="bi bi-receipt"></i>
                  Voir la facture
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className={styles.rightColumn}>
        {/* Widget des relances automatiques */}
        {showActions && (
          <RelancesWidget
            entity={concertData}
            entityType="concert"
            status={concertStatus}
          />
        )}

        {/* Statut */}
        <Card className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <h3>Statut</h3>
            <Badge variant={
              concertData.statut === 'Confirmé' ? 'success' :
              concertData.statut === 'En attente' ? 'warning' :
              concertData.statut === 'Annulé' ? 'danger' :
              'secondary'
            }>
              {concertData.statut || 'Non défini'}
            </Badge>
          </div>
          {concertData.notes && (
            <div className={styles.notes}>
              <p>{concertData.notes}</p>
            </div>
          )}
        </Card>

        {/* Carte du contrat (si existe) */}
        {contractId && (
          <div className={styles.contratSection}>
            <ContratCard 
              contratId={contractId}
              concertId={concertData.id}
              isOpen={isContratCardOpen}
              onToggle={() => setIsContratCardOpen(!isContratCardOpen)}
            />
          </div>
        )}

        {/* Entités associées */}
        <Card className={styles.entitiesCard}>
          <h3>Entités associées</h3>
          <div className={styles.entitiesList}>
            
            {/* Tous les contacts avec leurs rôles */}
            {allContacts.length > 0 && (
              <div className={styles.contactsSection}>
                <p className={styles.entitiesLabel}>Contacts</p>
                <div className={styles.entitiesGrid}>
                  {allContacts.map((contactItem) => (
                    <EntityCard
                      key={contactItem.id}
                      entityType="contact"
                      name={contactItem.nom || contactItem.prenom || 'Contact'}
                      subtitle={getRoleLabel ? getRoleLabel(contactItem.role) : contactItem.role}
                      badge={contactItem.isPrincipal ? 'Principal' : null}
                      badgeVariant="primary"
                      onClick={() => {
                        console.log('[ConcertViewWithRelancesWithRoles] Clic sur contact:', contactItem);
                        navigateToEntity('contact', contactItem.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback : afficher le contact unique s'il n'y a pas de contacts multiples */}
            {allContacts.length === 0 && contact && (
              <div className={styles.contactsSection}>
                <p className={styles.entitiesLabel}>Contact</p>
                <EntityCard
                  entityType="contact"
                  name={contact.nom || contact.prenom || 'Contact'}
                  subtitle="Organisateur"
                  onClick={() => {
                    console.log('[ConcertViewWithRelancesWithRoles] Clic sur contact:', contact);
                    const contactId = contact.id || contact.contactId;
                    navigateToEntity('contact', contactId);
                  }}
                />
              </div>
            )}

            {/* Lieu */}
            {lieu && (
              <div className={styles.lieuSection}>
                <p className={styles.entitiesLabel}>Lieu</p>
                <EntityCard
                  entityType="lieu"
                  name={lieu.nom || 'Lieu'}
                  subtitle={lieu.ville || 'Ville non spécifiée'}
                  onClick={() => {
                    console.log('[ConcertViewWithRelancesWithRoles] Clic sur lieu:', lieu);
                    const lieuId = lieu.id || lieu.lieuId;
                    navigateToEntity('lieu', lieuId);
                  }}
                />
              </div>
            )}

            {/* Artiste */}
            {artiste && (
              <div className={styles.artisteSection}>
                <p className={styles.entitiesLabel}>Artiste</p>
                <EntityCard
                  entityType="artiste"
                  name={artiste.nom || 'Artiste'}
                  subtitle={artiste.genre || 'Genre non spécifié'}
                  onClick={() => {
                    console.log('[ConcertViewWithRelancesWithRoles] Clic sur artiste:', artiste);
                    const artisteId = artiste.id || artiste.artisteId;
                    navigateToEntity('artiste', artisteId);
                  }}
                />
              </div>
            )}

            {/* Structure */}
            {structure && (
              <div className={styles.structureSection}>
                <p className={styles.entitiesLabel}>Structure</p>
                <EntityCard
                  entityType="structure"
                  name={structure.nom || 'Structure'}
                  subtitle={structure.type || 'Type non spécifié'}
                  onClick={() => {
                    console.log('[ConcertViewWithRelancesWithRoles] Clic sur structure:', structure);
                    const structureId = structure.id || structure.structureId;
                    navigateToEntity('structure', structureId);
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConcertViewWithRelancesWithRoles;