import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContactDatesSection.module.css';
import CardSection from '@/components/ui/CardSection';

/**
 * ContactDatesSection - Section de gestion des dates associés à un contact
 * Permet de rechercher, ajouter et supprimer des dates
 */
const ContactDatesSection = ({
  dateSearchTerm,
  setDateSearchTerm,
  filteredDateResults,
  isSearchingDates,
  datesAssocies,
  loadingAssociations,
  handleSelectDateFromSearch,
  handleRemoveDate
}) => {
  const navigate = useNavigate();

  return (
    <CardSection
      title={`Dates associés (${datesAssocies.length})`}
      icon={<i className="bi bi-music-note"></i>}
      isEditing={true}
      className="dates-section"
    >
      <div className={styles.sectionBody}>
        {/* Recherche de dates */}
        <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher un date à associer..."
              value={dateSearchTerm}
              onChange={(e) => setDateSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={() => navigate('/dates/nouveau')}
            >
              <i className="bi bi-plus"></i>
              Nouveau date
            </button>
          </div>

          {/* Résultats de recherche de dates */}
          {filteredDateResults.length > 0 && (
            <div className={styles.searchResults}>
              {filteredDateResults.map((date) => (
                <div
                  key={date.id}
                  className={styles.searchResultItem}
                  onClick={() => handleSelectDateFromSearch(date)}
                >
                  <div className={styles.dateTitle}>{date.titre || 'Date sans titre'}</div>
                  <div className={styles.dateDetails}>
                    {date.date && <span><i className="bi bi-calendar"></i> {new Date(date.date).toLocaleDateString('fr-FR')}</span>}
                    {date.lieuNom && <span><i className="bi bi-geo-alt"></i> {date.lieuNom}</span>}
                    {date.artisteNom && <span><i className="bi bi-person"></i> {date.artisteNom}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSearchingDates && (
            <div className={styles.alert}>
              <div className={styles.loadingSpinner}></div>
              Recherche de dates en cours...
            </div>
          )}
        </div>

        {loadingAssociations ? (
          <div className={styles.alert}>
            <div className={styles.loadingSpinner}></div>
            Chargement des dates associés...
          </div>
        ) : datesAssocies.length > 0 ? (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datesAssocies.map((date) => (
                  <tr key={date.id}>
                    <td>
                      <strong>{date.titre || 'Date sans titre'}</strong>
                      {date.artisteNom && <div style={{ fontSize: '12px', color: '#666' }}>Artiste: {date.artisteNom}</div>}
                    </td>
                    <td>
                      {date.date ? new Date(date.date).toLocaleDateString('fr-FR') : 'Non définie'}
                    </td>
                    <td>{date.lieuNom || date.lieu || 'Non défini'}</td>
                    <td>
                      <div className={`${styles.badge} ${date.statut === 'confirme' ? styles.bgSuccess : styles.bgWarning}`}>
                        {date.statut || 'En négociation'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                          onClick={() => navigate(`/dates/${date.id}`)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          <i className="bi bi-eye"></i>
                          Voir
                        </button>
                        <button
                          type="button"
                          className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                          onClick={() => handleRemoveDate(date.id)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          <i className="bi bi-trash"></i>
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.alert}>
            <i className="bi bi-info-circle"></i>
            Aucun date associé pour le moment. Utilisez la recherche ci-dessus ou créez un nouveau date.
          </div>
        )}
      </div>
    </CardSection>
  );
};

export default ContactDatesSection;