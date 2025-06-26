import React from 'react';
import styles from './FactureEditor.module.css';

const FactureEditor = ({ data, onChange }) => {
  console.log('[FactureEditor] === DONNÉES REÇUES ===');
  console.log('[FactureEditor] Data complète:', data);
  console.log('[FactureEditor] Type:', data?.type);
  console.log('[FactureEditor] Montant HT:', data?.montantHT);
  console.log('[FactureEditor] Échéance:', data?.echeance);
  console.log('[FactureEditor] Mode règlement:', data?.modeReglement);
  console.log('[FactureEditor] === FIN DONNÉES ===');
  
  const handleFieldChange = (field, value) => {
    console.log(`[FactureEditor] Changement champ ${field}:`, value);
    onChange(field, value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const calculateTVA = () => {
    const montantHT = parseFloat(data.montantHT || 0);
    const tauxTVA = parseFloat(data.tauxTVA || 0); // Par défaut 0% au lieu de 20%
    return montantHT * (tauxTVA / 100);
  };

  const calculateTTC = () => {
    const montantHT = parseFloat(data.montantHT || 0);
    return montantHT + calculateTVA();
  };

  return (
    <div className={styles.editor}>
      {/* Section Informations générales */}
      <div className={styles.section}>
        <h4>Informations générales</h4>
        
        <div className={styles.twoColumns}>
          {/* Colonne Émetteur */}
          <div className={styles.column}>
            <h5>Émetteur (Producteur/Tourneur)</h5>
            
            <div className={styles.field}>
              <label htmlFor="emetteurNom">
                Nom
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="emetteurNom"
                type="text"
                value={data.emetteurNom || data.organisationNom || ''}
                onChange={(e) => handleFieldChange('emetteurNom', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="emetteurAdresse">
                Adresse
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="emetteurAdresse"
                type="text"
                value={data.emetteurAdresse || data.organisationAdresse || ''}
                onChange={(e) => handleFieldChange('emetteurAdresse', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="emetteurVille">
                Code postal et ville
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="emetteurVille"
                type="text"
                value={data.emetteurVille || (data.organisationCodePostal && data.organisationVille ? `${data.organisationCodePostal} ${data.organisationVille}` : '') || ''}
                onChange={(e) => handleFieldChange('emetteurVille', e.target.value)}
                className={styles.input}
              />
            </div>
            
            {data.numeroTVA && (
              <div className={styles.field}>
                <label htmlFor="emetteurTVA">
                  N° TVA
                  <span className={styles.editIndicator}></span>
                </label>
                <input
                  id="emetteurTVA"
                  type="text"
                  value={data.numeroTVA || ''}
                  onChange={(e) => handleFieldChange('numeroTVA', e.target.value)}
                  className={styles.input}
                />
              </div>
            )}
          </div>
          
          {/* Colonne Destinataire */}
          <div className={styles.column}>
            <h5>Destinataire (Organisateur)</h5>
            
            <div className={styles.field}>
              <label htmlFor="structureNom">
                Nom
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="structureNom"
                type="text"
                value={data.structureNom || ''}
                onChange={(e) => handleFieldChange('structureNom', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="structureAdresse">
                Adresse
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="structureAdresse"
                type="text"
                value={data.structureAdresse || ''}
                onChange={(e) => handleFieldChange('structureAdresse', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="structureVille">
                Code postal et ville
                <span className={styles.editIndicator}></span>
              </label>
              <input
                id="structureVille"
                type="text"
                value={(data.structureCodePostal && data.structureVille) ? `${data.structureCodePostal} ${data.structureVille}` : ''}
                onChange={(e) => handleFieldChange('structureVille', e.target.value)}
                className={styles.input}
              />
            </div>
            
            {data.structureTVA && (
              <div className={styles.field}>
                <label htmlFor="structureTVA">
                  N° TVA
                  <span className={styles.editIndicator}></span>
                </label>
                <input
                  id="structureTVA"
                  type="text"
                  value={data.structureTVA || ''}
                  onChange={(e) => handleFieldChange('structureTVA', e.target.value)}
                  className={styles.input}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Référence et Objet sur toute la largeur */}
        <div className={styles.fullWidth}>
          <div className={styles.field}>
            <label htmlFor="reference">
              Référence facture
              <span className={styles.editIndicator}></span>
            </label>
            <input
              id="reference"
              type="text"
              value={data.reference || ''}
              onChange={(e) => handleFieldChange('reference', e.target.value)}
              className={styles.input}
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="objet">
              Objet
              <span className={styles.editIndicator}></span>
            </label>
            <input
              id="objet"
              type="text"
              value={data.objet || ''}
              onChange={(e) => handleFieldChange('objet', e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Montants */}
      <div className={styles.section}>
        <h4>Montants</h4>
        
        {data.type === 'acompte' && (
          <div className={styles.field}>
            <label htmlFor="acompte">
              Acompte HT
              <span className={styles.editIndicator}></span>
            </label>
            <div className={styles.inputGroup}>
              <input
                id="acompte"
                type="number"
                value={data.montantHT || 0}
                onChange={(e) => handleFieldChange('montantHT', e.target.value)}
                className={styles.input}
                step="0.01"
              />
              <span className={styles.currency}>€</span>
            </div>
          </div>
        )}
        
        {data.type === 'solde' && (
          <div className={styles.field}>
            <label htmlFor="solde">
              Solde HT
              <span className={styles.editIndicator}></span>
            </label>
            <div className={styles.inputGroup}>
              <input
                id="solde"
                type="number"
                value={data.montantHT || 0}
                onChange={(e) => handleFieldChange('montantHT', e.target.value)}
                className={styles.input}
                step="0.01"
              />
              <span className={styles.currency}>€</span>
            </div>
          </div>
        )}
        
        {data.type === 'complete' && (
          <div className={styles.field}>
            <label htmlFor="montantHT">
              Montant HT
              <span className={styles.editIndicator}></span>
            </label>
            <div className={styles.inputGroup}>
              <input
                id="montantHT"
                type="number"
                value={data.montantHT || 0}
                onChange={(e) => handleFieldChange('montantHT', e.target.value)}
                className={styles.input}
                step="0.01"
              />
              <span className={styles.currency}>€</span>
            </div>
          </div>
        )}
        
        <div className={styles.field}>
          <label htmlFor="tauxTVA">
            Taux TVA
            <span className={styles.editIndicator}></span>
          </label>
          <div className={styles.inputGroup}>
            <select
              id="tauxTVA"
              value={data.tauxTVA || 0}
              onChange={(e) => handleFieldChange('tauxTVA', e.target.value)}
              className={styles.input}
            >
              <option value="0">0% (Exonéré)</option>
              <option value="2.1">2.1% (Taux super réduit)</option>
              <option value="5.5">5.5% (Taux réduit)</option>
              <option value="10">10% (Taux intermédiaire)</option>
              <option value="20">20% (Taux normal)</option>
            </select>
            <span className={styles.currency}>%</span>
          </div>
          {data.prestationsInfo && (
            <small className={styles.hint}>
              Calculé depuis les prestations du contrat
            </small>
          )}
        </div>
        
        {/* Calculs automatiques */}
        <div className={styles.calculations}>
          <div className={styles.calcRow}>
            <span>Montant TVA :</span>
            <span>{formatCurrency(calculateTVA())}</span>
          </div>
          <div className={styles.calcRow}>
            <span>Total TTC :</span>
            <span className={styles.total}>{formatCurrency(calculateTTC())}</span>
          </div>
        </div>
      </div>

      {/* Section Paiement */}
      <div className={styles.section}>
        <h4>Modalités de paiement</h4>
        
        <div className={styles.field}>
          <label htmlFor="echeance">
            Échéance de paiement
            <span className={styles.editIndicator}></span>
          </label>
          <input
            id="echeance"
            type="date"
            value={data.echeance || ''}
            onChange={(e) => handleFieldChange('echeance', e.target.value)}
            className={styles.input}
          />
          {data.dateEcheanceContrat && (
            <small className={styles.hint}>
              Date d'échéance du contrat : {new Date(data.dateEcheanceContrat).toLocaleDateString('fr-FR')}
            </small>
          )}
        </div>
        
        <div className={styles.field}>
          <label htmlFor="delaiPaiement">
            Délai de paiement
            <span className={styles.editIndicator}></span>
          </label>
          <input
            id="delaiPaiement"
            type="text"
            value={data.delaiPaiement || '30 jours'}
            onChange={(e) => handleFieldChange('delaiPaiement', e.target.value)}
            className={styles.input}
            placeholder="Ex: 30 jours, 45 jours..."
          />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="modeReglement">
            Mode de règlement
            <span className={styles.editIndicator}></span>
          </label>
          <select
            id="modeReglement"
            value={data.modeReglement || 'Virement'}
            onChange={(e) => handleFieldChange('modeReglement', e.target.value)}
            className={styles.input}
          >
            <option value="Virement">Virement</option>
            <option value="Chèque">Chèque</option>
            <option value="Espèces">Espèces</option>
            <option value="CB">Carte bancaire</option>
            <option value="Prélèvement">Prélèvement</option>
          </select>
        </div>
        
        <div className={styles.field}>
          <label htmlFor="aLOrdreDe">
            À l'ordre de
            <span className={styles.editIndicator}></span>
          </label>
          <input
            id="aLOrdreDe"
            type="text"
            value={data.aLOrdreDe || ''}
            onChange={(e) => handleFieldChange('aLOrdreDe', e.target.value)}
            className={styles.input}
          />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="conditionsPaiement">
            Conditions particulières
            <span className={styles.editIndicator}></span>
          </label>
          <textarea
            id="conditionsPaiement"
            value={data.conditionsPaiement || ''}
            onChange={(e) => handleFieldChange('conditionsPaiement', e.target.value)}
            className={styles.input}
            rows="3"
            placeholder="Conditions spécifiques de paiement..."
          />
        </div>
      </div>
      
      {/* Section Coordonnées bancaires (si virement) */}
      {data.modeReglement === 'Virement' && (
        <div className={styles.section}>
          <h4>Coordonnées bancaires</h4>
          
          <div className={styles.field}>
            <label htmlFor="iban">
              IBAN
              <span className={styles.editIndicator}></span>
            </label>
            <input
              id="iban"
              type="text"
              value={data.iban || ''}
              onChange={(e) => handleFieldChange('iban', e.target.value)}
              className={styles.input}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="bic">
              BIC
              <span className={styles.editIndicator}></span>
            </label>
            <input
              id="bic"
              type="text"
              value={data.bic || ''}
              onChange={(e) => handleFieldChange('bic', e.target.value)}
              className={styles.input}
              placeholder="XXXXXXXX"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="coordonneesBancaires">
              Autres informations bancaires
              <span className={styles.editIndicator}></span>
            </label>
            <textarea
              id="coordonneesBancaires"
              value={data.coordonneesBancaires || ''}
              onChange={(e) => handleFieldChange('coordonneesBancaires', e.target.value)}
              className={styles.input}
              rows="3"
              placeholder="Nom de la banque, adresse..."
            />
          </div>
        </div>
      )}

      {/* Section Échéances (si plusieurs) */}
      {data.echeances && data.echeances.length > 1 && (
        <div className={styles.section}>
          <h4>Échéances</h4>
          <div className={styles.echeancesTable}>
            <div className={styles.tableHeader}>
              <div>Nature</div>
              <div>Date</div>
              <div>Montant</div>
              <div>Mode</div>
            </div>
            {data.echeances.map((echeance, index) => (
              <div key={index} className={styles.tableRow}>
                <div>{echeance.nature}</div>
                <div>{new Date(echeance.date).toLocaleDateString('fr-FR')}</div>
                <div>{formatCurrency(echeance.montant)}</div>
                <div>{echeance.modeReglement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FactureEditor;