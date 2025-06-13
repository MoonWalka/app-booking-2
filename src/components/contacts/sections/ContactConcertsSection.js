import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContactConcertsSection.module.css';
import CardSection from '@/components/ui/CardSection';

/**
 * ContactConcertsSection - Section de gestion des concerts associés à un contact
 * Permet de rechercher, ajouter et supprimer des concerts
 */
const ContactConcertsSection = ({
  concertSearchTerm,
  setConcertSearchTerm,
  filteredConcertResults,
  isSearchingConcerts,
  concertsAssocies,
  loadingAssociations,
  handleSelectConcertFromSearch,
  handleRemoveConcert
}) => {
  const navigate = useNavigate();

  return (
    <CardSection
      title={`Concerts associés (${concertsAssocies.length})`}
      icon={<i className="bi bi-music-note"></i>}
      isEditing={true}
      className="concerts-section"
    >
      <div className={styles.sectionBody}>
        {/* Recherche de concerts */}
        <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher un concert à associer..."
              value={concertSearchTerm}
              onChange={(e) => setConcertSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={() => navigate('/concerts/nouveau')}
            >
              <i className="bi bi-plus"></i>
              Nouveau concert
            </button>
          </div>

          {/* Résultats de recherche de concerts */}
          {filteredConcertResults.length > 0 && (
            <div className={styles.searchResults}>
              {filteredConcertResults.map((concert) => (
                <div
                  key={concert.id}
                  className={styles.searchResultItem}
                  onClick={() => handleSelectConcertFromSearch(concert)}
                >
                  <div className={styles.concertTitle}>{concert.titre || 'Concert sans titre'}</div>
                  <div className={styles.concertDetails}>
                    {concert.date && <span><i className="bi bi-calendar"></i> {new Date(concert.date).toLocaleDateString('fr-FR')}</span>}
                    {concert.lieuNom && <span><i className="bi bi-geo-alt"></i> {concert.lieuNom}</span>}
                    {concert.artisteNom && <span><i className="bi bi-person"></i> {concert.artisteNom}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSearchingConcerts && (
            <div className={styles.alert}>
              <div className={styles.loadingSpinner}></div>
              Recherche de concerts en cours...
            </div>
          )}
        </div>

        {loadingAssociations ? (
          <div className={styles.alert}>
            <div className={styles.loadingSpinner}></div>
            Chargement des concerts associés...
          </div>
        ) : concertsAssocies.length > 0 ? (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Concert</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {concertsAssocies.map((concert) => (
                  <tr key={concert.id}>
                    <td>
                      <strong>{concert.titre || 'Concert sans titre'}</strong>
                      {concert.artisteNom && <div style={{ fontSize: '12px', color: '#666' }}>Artiste: {concert.artisteNom}</div>}
                    </td>
                    <td>
                      {concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : 'Non définie'}
                    </td>
                    <td>{concert.lieuNom || concert.lieu || 'Non défini'}</td>
                    <td>
                      <div className={`${styles.badge} ${concert.statut === 'confirme' ? styles.bgSuccess : styles.bgWarning}`}>
                        {concert.statut || 'En négociation'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                          onClick={() => navigate(`/concerts/${concert.id}`)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          <i className="bi bi-eye"></i>
                          Voir
                        </button>
                        <button
                          type="button"
                          className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                          onClick={() => handleRemoveConcert(concert.id)}
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
            Aucun concert associé pour le moment. Utilisez la recherche ci-dessus ou créez un nouveau concert.
          </div>
        )}
      </div>
    </CardSection>
  );
};

export default ContactConcertsSection;