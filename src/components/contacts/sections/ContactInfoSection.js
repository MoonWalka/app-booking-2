import React, { useState, useEffect } from 'react';
import styles from '../ContactViewTabs.module.css';

/**
 * Formate un numéro de téléphone avec des espaces
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  // Formater par groupes de 2 chiffres (format français)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  // Format international
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
  }
  return phone;
};

/**
 * Composant pour afficher un numéro de téléphone avec toggle de formatage
 */
const PhoneDisplay = ({ phone, label }) => {
  const [isFormatted, setIsFormatted] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const saved = localStorage.getItem('phoneFormatPreference');
    return saved === 'true';
  });

  useEffect(() => {
    // Sauvegarder la préférence
    localStorage.setItem('phoneFormatPreference', isFormatted);
  }, [isFormatted]);

  if (!phone) {
    return <span className={styles.emptyValue}>Non renseigné</span>;
  }

  const displayPhone = isFormatted ? formatPhoneNumber(phone) : phone;

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
 * Section d'affichage des informations générales d'un contact
 * Gère l'affichage pour les structures et les personnes libres
 */
const ContactInfoSection = React.memo(({ data, entityType, isStructure }) => {
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
              <PhoneDisplay phone={data.structureTelephone1} label="Téléphone" />
            </span>
          </div>
          
          {data.structureTelephone2 && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Téléphone 2 :</span>
              <span className={styles.value}>
                <PhoneDisplay phone={data.structureTelephone2} label="Téléphone 2" />
              </span>
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
              <span className={styles.value}>
                <a 
                  href={data.structureSiteWeb.startsWith('http') ? data.structureSiteWeb : `https://${data.structureSiteWeb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {data.structureSiteWeb}
                </a>
              </span>
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
              <PhoneDisplay phone={data.telDirect} label="Téléphone direct" />
            </span>
          </div>
          
          {data.mobile && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Mobile :</span>
              <span className={styles.value}>
                <PhoneDisplay phone={data.mobile} label="Mobile" />
              </span>
            </div>
          )}
          
          {data.telPerso && (
            <div className={styles.infoLine}>
              <span className={styles.label}>Téléphone personnel :</span>
              <span className={styles.value}>
                <PhoneDisplay phone={data.telPerso} label="Téléphone personnel" />
              </span>
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
});

ContactInfoSection.displayName = 'ContactInfoSection';

export default ContactInfoSection;