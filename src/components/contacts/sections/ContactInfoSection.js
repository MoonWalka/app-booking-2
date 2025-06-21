import React from 'react';
import styles from '../ContactViewTabs.module.css';

/**
 * Section d'affichage des informations générales d'un contact
 * Gère l'affichage pour les structures et les personnes libres
 */
function ContactInfoSection({ data, entityType, isStructure }) {
  if (!data) return null;

  return (
    <div className={styles.contactInfoCard}>
      {isStructure ? (
        // Affichage Structure - Tous les champs
        <div className={styles.infoBlock}>
          <div className={styles.infoLine}>
            <span className={styles.label}>Email :</span>
            <span className={styles.value}>
              {data.structureEmail || <span className={styles.emptyValue}>Non renseigné</span>}
            </span>
          </div>
          
          <div className={styles.infoLine}>
            <span className={styles.label}>Téléphone :</span>
            <span className={styles.value}>
              {data.structureTelephone1 || <span className={styles.emptyValue}>Non renseigné</span>}
            </span>
          </div>
          
          {data.structureTelephone2 && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Téléphone 2 :</span>
              <span className={styles.value}>{data.structureTelephone2}</span>
            </div>
          )}
          
          <div className={styles.infoLine}>
            <span className={styles.label}>Adresse :</span>
            <span className={styles.value}>
              {(() => {
                const adresse = [
                  data.structureAdresse,
                  data.structureSuiteAdresse1,
                  data.structureCodePostal,
                  data.structureVille,
                  data.structureDepartement,
                  data.structureRegion,
                  data.structurePays
                ].filter(Boolean).join(', ');
                return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
              })()}
            </span>
          </div>
          
          {data.structureSiteWeb && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Site web :</span>
              <span className={styles.value}>{data.structureSiteWeb}</span>
            </div>
          )}
          
          {data.structureSiret && (
            <div className={styles.infoLine}>
              <span className={styles.label}>SIRET :</span>
              <span className={styles.value}>{data.structureSiret}</span>
            </div>
          )}
        </div>
      ) : (
        // Affichage Personne - Tous les champs
        <div className={styles.infoBlock}>
          <div className={styles.infoLine}>
            <span className={styles.label}>Email direct :</span>
            <span className={styles.value}>
              {data.mailDirect || <span className={styles.emptyValue}>Non renseigné</span>}
            </span>
          </div>
          
          {data.mailPerso && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Email personnel :</span>
              <span className={styles.value}>{data.mailPerso}</span>
            </div>
          )}
          
          <div className={styles.infoLine}>
            <span className={styles.label}>Téléphone direct :</span>
            <span className={styles.value}>
              {data.telDirect || <span className={styles.emptyValue}>Non renseigné</span>}
            </span>
          </div>
          
          {data.mobile && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Mobile :</span>
              <span className={styles.value}>{data.mobile}</span>
            </div>
          )}
          
          {data.telPerso && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Téléphone personnel :</span>
              <span className={styles.value}>{data.telPerso}</span>
            </div>
          )}
          
          <div className={styles.infoLine}>
            <span className={styles.label}>Adresse :</span>
            <span className={styles.value}>
              {(() => {
                const adresse = [
                  data.adresse,
                  data.suiteAdresse,
                  data.codePostal,
                  data.ville,
                  data.departement,
                  data.region,
                  data.pays
                ].filter(Boolean).join(', ');
                return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactInfoSection;