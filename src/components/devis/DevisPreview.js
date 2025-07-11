// src/components/devis/DevisPreview.js
import React from 'react';
import styles from './DevisPreview.module.css';

/**
 * Preview PDF du devis en temps réel
 */
function DevisPreview({ devisData }) {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={styles.devisPreview}>
      <div className={styles.page}>
        {/* En-tête */}
        <div className={styles.header}>
          <div className={styles.company}>
            <h1>DEVIS</h1>
            <div className={styles.devisNumber}>
              N° {devisData.numero || 'DEV-XXXX'}
            </div>
          </div>
          <div className={styles.logo}>
            {/* Emplacement logo entreprise */}
            <div className={styles.logoPlaceholder}>
              LOGO
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className={styles.infosGenerales}>
          <div className={styles.emetteur}>
            <h3>ÉMETTEUR</h3>
            <div className={styles.details}>
              <div>{devisData.emetteur || 'Nom de l\'émetteur'}</div>
              <div>{devisData.entrepriseNom || devisData.entreprise || 'Entreprise'}</div>
              <div>{devisData.entrepriseAdresse || 'Adresse émetteur'}</div>
              <div>{devisData.entrepriseEmail || 'Email'} • {devisData.entrepriseTelephone || 'Téléphone'}</div>
            </div>
          </div>

          <div className={styles.destinataire}>
            <h3>DESTINATAIRE</h3>
            <div className={styles.details}>
              <div><strong>{devisData.structureNom || 'Nom de la structure'}</strong></div>
              {devisData.contactNom && (
                <div>À l'attention de : {devisData.contactNom}</div>
              )}
              <div>Adresse du client</div>
              <div>Email • Téléphone</div>
            </div>
          </div>
        </div>

        {/* Événement */}
        {(devisData.artisteNom || devisData.dateEvenement || devisData.titreEvenement) && (
          <div className={styles.evenement}>
            <h3>ÉVÉNEMENT</h3>
            <div className={styles.details}>
              {devisData.artisteNom && (
                <div><strong>Artiste :</strong> {devisData.artisteNom}</div>
              )}
              {devisData.dateEvenement && (
                <div><strong>Date :</strong> {formatDate(devisData.dateEvenement)}</div>
              )}
              {devisData.titreEvenement && (
                <div><strong>Titre :</strong> {devisData.titreEvenement}</div>
              )}
            </div>
          </div>
        )}

        {/* Conditions financières */}
        <div className={styles.conditionsFinancieres}>
          <h3>CONDITIONS FINANCIÈRES</h3>
          
          <table className={styles.tableauObjets}>
            <thead>
              <tr>
                <th>Objet</th>
                <th>Qté</th>
                <th>Unité</th>
                <th>Prix unit. HT</th>
                <th>Montant HT</th>
                <th>TVA %</th>
                <th>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {devisData.lignesObjet.map((ligne) => {
                const montantTVA = ligne.montantHT * (ligne.tauxTVA / 100);
                const montantTTC = ligne.montantHT + montantTVA;
                
                return (
                  <tr key={ligne.id}>
                    <td>{ligne.objet || '-'}</td>
                    <td>{ligne.quantite}</td>
                    <td>{ligne.unite}</td>
                    <td>{formatCurrency(ligne.prixUnitaire)}</td>
                    <td>{formatCurrency(ligne.montantHT)}</td>
                    <td>{ligne.tauxTVA}%</td>
                    <td>{formatCurrency(montantTTC)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={styles.totalHT}>
                <td colSpan="6"><strong>Total HT</strong></td>
                <td><strong>{formatCurrency(devisData.montantHT)}</strong></td>
              </tr>
              <tr className={styles.totalTVA}>
                <td colSpan="6"><strong>Total TVA</strong></td>
                <td><strong>{formatCurrency(devisData.totalTVA)}</strong></td>
              </tr>
              <tr className={styles.totalTTC}>
                <td colSpan="6"><strong>Total TTC</strong></td>
                <td><strong>{formatCurrency(devisData.montantTTC)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Règlement */}
        {devisData.lignesReglement.length > 0 && (
          <div className={styles.reglement}>
            <h3>ÉCHÉANCIER DE RÈGLEMENT</h3>
            
            <table className={styles.tableauReglement}>
              <thead>
                <tr>
                  <th>Nature</th>
                  <th>Montant TTC</th>
                  <th>Date facturation</th>
                  <th>Date échéance</th>
                  <th>Mode de paiement</th>
                </tr>
              </thead>
              <tbody>
                {devisData.lignesReglement.map((ligne) => (
                  <tr key={ligne.id}>
                    <td>{ligne.nature}</td>
                    <td>{formatCurrency(ligne.montantTTC)}</td>
                    <td>{formatDate(ligne.dateFacturation)}</td>
                    <td>{formatDate(ligne.dateEcheance)}</td>
                    <td>{ligne.modePaiement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conditions particulières */}
        <div className={styles.conditions}>
          <div className={styles.conditionsRow}>
            {devisData.conditionsParticulieres && (
              <div className={styles.conditionsCol}>
                <h4>CONDITIONS PARTICULIÈRES</h4>
                <div className={styles.conditionsText}>
                  {devisData.conditionsParticulieres.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            )}

            {devisData.modalitesPaiement && (
              <div className={styles.conditionsCol}>
                <h4>MODALITÉS DE PAIEMENT</h4>
                <div className={styles.conditionsText}>
                  {devisData.modalitesPaiement.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className={styles.footer}>
          <div className={styles.signature}>
            <div className={styles.signatureBlock}>
              <div>Bon pour accord</div>
              <div>Date et signature du client</div>
              <div className={styles.signatureLine}></div>
            </div>
          </div>
          
          <div className={styles.infosLegales}>
            <div>Devis valable 30 jours</div>
            <div>TVA non applicable, art. 293 B du CGI</div>
            <div>Siret : XXXXX • APE : XXXXX</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevisPreview;