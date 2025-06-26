import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import contratService from '@/services/contratService';
import factureService from '@/services/factureService';
import Spinner from '@/components/common/Spinner';
import FactureEditor from '@/components/factures/FactureEditor';
import FacturePreview from '@/components/factures/FacturePreview';
import styles from './FactureGeneratorPage.module.css';

const FactureGeneratorPage = () => {
  const { concertId: concertIdFromParams } = useParams();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { getActiveTab, openTab } = useTabs();
  
  // Récupérer les paramètres depuis l'onglet actif
  const activeTab = getActiveTab && getActiveTab();
  const concertId = activeTab?.params?.concertId || concertIdFromParams;
  const contratId = activeTab?.params?.contratId;
  const fromContrat = activeTab?.params?.fromContrat || false;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concert, setConcert] = useState(null);
  const [contrat, setContrat] = useState(null);
  const [factures, setFactures] = useState([]);
  const [currentFactureIndex, setCurrentFactureIndex] = useState(0);
  const [editableData, setEditableData] = useState({});
  const [previewHtml, setPreviewHtml] = useState('');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      if (!user || !currentOrganization?.id || !concertId) {
        setLoading(false);
        setError('Données manquantes pour charger la facture');
        return;
      }

      try {
        setLoading(true);
        
        // Charger le concert
        const concertRef = doc(db, 'concerts', concertId);
        const concertSnap = await getDoc(concertRef);
        
        if (!concertSnap.exists()) {
          throw new Error('Concert introuvable');
        }
        
        const concertData = { id: concertSnap.id, ...concertSnap.data() };
        setConcert(concertData);
        
        // Charger le contrat si nécessaire
        if (fromContrat && concertId) {
          console.log('[FactureGeneratorPage] Chargement du contrat pour concert:', concertId);
          const contratData = await contratService.getContratByConcert(concertId);
          
          if (contratData) {
            console.log('[FactureGeneratorPage] === AUDIT CONTRAT CHARGÉ ===');
            console.log('[FactureGeneratorPage] Contrat complet:', contratData);
            console.log('[FactureGeneratorPage] Champs disponibles dans le contrat:', Object.keys(contratData));
            console.log('[FactureGeneratorPage] Contractant1 (Producteur/Tourneur):', contratData.contractant1);
            console.log('[FactureGeneratorPage] Contractant2 (Organisateur):', contratData.contractant2);
            console.log('[FactureGeneratorPage] Négociation:', contratData.negociation);
            console.log('[FactureGeneratorPage] Facturation:', contratData.facturation);
            console.log('[FactureGeneratorPage] Règlement:', contratData.reglement);
            console.log('[FactureGeneratorPage] Échéances:', contratData.echeances);
            console.log('[FactureGeneratorPage] Nombre d\'échéances:', contratData.echeances?.length || 0);
            
            if (contratData.echeances && contratData.echeances.length > 0) {
              contratData.echeances.forEach((ech, idx) => {
                console.log(`[FactureGeneratorPage] Échéance ${idx + 1}:`, {
                  nature: ech.nature,
                  montant: ech.montant,
                  date: ech.date,
                  modeReglement: ech.modeReglement
                });
              });
            }
            console.log('[FactureGeneratorPage] === FIN AUDIT CONTRAT ===');
            
            setContrat(contratData);
            
            // Générer les factures basées sur les échéances du contrat
            const generatedFactures = generateFacturesFromContrat(contratData, concertData);
            console.log('[FactureGeneratorPage] Factures générées:', generatedFactures);
            setFactures(generatedFactures);
            
            // Initialiser les données éditables avec la première facture
            if (generatedFactures.length > 0) {
              console.log('[FactureGeneratorPage] Première facture éditée:', generatedFactures[0]);
              setEditableData(generatedFactures[0]);
              generatePreview(generatedFactures[0]);
            }
          } else {
            console.log('[FactureGeneratorPage] Aucun contrat trouvé pour ce concert');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [user, currentOrganization?.id, concertId, contratId, fromContrat]);

  // Générer les factures à partir du contrat
  const generateFacturesFromContrat = (contratData, concertData) => {
    console.log('[generateFacturesFromContrat] === DÉBUT GÉNÉRATION FACTURES ===');
    console.log('[generateFacturesFromContrat] Données contrat reçues:', contratData);
    console.log('[generateFacturesFromContrat] TVA dans négociation:', contratData.negociation?.tauxTva);
    console.log('[generateFacturesFromContrat] TVA dans facturation:', contratData.facturation?.tauxTVA);
    console.log('[generateFacturesFromContrat] Échéances dans contrat:', contratData.echeances);
    
    const factures = [];
    
    // Données communes à toutes les factures
    const commonData = {
      // Informations du concert
      concertId: concertData.id,
      
      // Informations du destinataire (organisateur) - contractant2 dans le contrat
      structureId: contratData.structureId || concertData.structureId,
      structureNom: contratData.contractant2?.nom || contratData.structureNom || concertData.structureNom,
      structureAdresse: contratData.contractant2?.adresse || contratData.structureAdresse || concertData.structureAdresse,
      structureCodePostal: contratData.contractant2?.codePostal || contratData.structureCodePostal || concertData.structureCodePostal,
      structureVille: contratData.contractant2?.ville || contratData.structureVille || concertData.structureVille,
      structureTVA: contratData.contractant2?.numeroTVA,
      
      // Informations de l'émetteur (producteur/tourneur) - contractant1 dans le contrat
      organisationNom: contratData.contractant1?.nom || currentOrganization?.nom,
      organisationAdresse: contratData.contractant1?.adresse || currentOrganization?.adresse,
      organisationCodePostal: contratData.contractant1?.codePostal || currentOrganization?.codePostal,
      organisationVille: contratData.contractant1?.ville || currentOrganization?.ville,
      
      // Informations bancaires de l'émetteur
      coordonneesBancaires: contratData.contractant1?.coordonneesBancaires || contratData.coordonneesBancaires || currentOrganization.coordonneesBancaires,
      iban: contratData.contractant1?.iban || contratData.iban || currentOrganization.iban,
      bic: contratData.contractant1?.bic || contratData.bic || currentOrganization.bic,
      
      // Informations de paiement par défaut
      aLOrdreDe: contratData.contractant1?.nom || contratData.aLOrdreDe || currentOrganization?.nom,
      
      // TVA - Calculer depuis les prestations uniquement
      tauxTVA: (() => {
        console.log('[commonData] === RECHERCHE TAUX TVA DEPUIS PRESTATIONS ===');
        console.log('[commonData] Prestations disponibles:', contratData.prestations);
        
        if (!contratData.prestations || contratData.prestations.length === 0) {
          console.log('[commonData] Aucune prestation trouvée, taux par défaut: 0');
          return 0;
        }
        
        // Calculer le taux TVA moyen pondéré des prestations
        let totalHT = 0;
        let totalTVA = 0;
        
        contratData.prestations.forEach((prestation, index) => {
          const montantHT = parseFloat(prestation.montantHT) || 0;
          const tauxTva = parseFloat(prestation.tauxTva) || 0;
          const montantTVA = montantHT * (tauxTva / 100);
          
          console.log(`[commonData] Prestation ${index + 1}:`, {
            objet: prestation.objet,
            montantHT: montantHT,
            tauxTva: tauxTva,
            montantTVA: montantTVA
          });
          
          totalHT += montantHT;
          totalTVA += montantTVA;
        });
        
        // Calculer le taux moyen (si totalHT > 0)
        const tauxMoyen = totalHT > 0 ? (totalTVA / totalHT) * 100 : 0;
        
        console.log('[commonData] Calcul final:', {
          totalHT: totalHT,
          totalTVA: totalTVA,
          tauxMoyen: tauxMoyen
        });
        console.log('[commonData] Taux TVA final retenu:', tauxMoyen);
        console.log('[commonData] === FIN RECHERCHE TVA ===');
        
        return tauxMoyen;
      })(),
      numeroTVA: contratData.contractant1?.numeroTVA || contratData.numeroTVA || currentOrganization.numeroTVA,
      assujettissementTVA: contratData.contractant1?.assujettissementTVA || contratData.assujettissementTVA || currentOrganization.assujettissementTVA,
      
      // Autres données du contrat
      contratId: contratData.id,
      contratNumero: contratData.numero
    };
    
    if (!contratData.echeances || contratData.echeances.length === 0) {
      // Facture unique
      console.log('[generateFacturesFromContrat] Pas d\'échéances, création facture unique');
      console.log('[generateFacturesFromContrat] Montant net négociation:', contratData.negociation?.montantNet);
      
      factures.push({
        ...commonData,
        type: 'complete',
        reference: `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`,
        objet: `Prestation artistique - ${concertData.artisteNom || ''}`,
        montantHT: contratData.negociation?.montantNet || 0,
        tauxTVA: commonData.tauxTVA, // Utiliser la TVA du commonData
        echeance: new Date().toISOString().split('T')[0],
        modeReglement: 'Virement',
        delaiPaiement: contratData.delaiPaiement || '30 jours',
        // Information sur le mapping depuis les prestations
        prestationsInfo: contratData.prestations && contratData.prestations.length > 0 ? 
          `Calculé depuis ${contratData.prestations.length} prestation(s)` : null
      });
    } else {
      // Factures multiples selon les échéances
      console.log('[generateFacturesFromContrat] Création de factures selon échéances');
      
      // Récupérer le montant total de la prestation
      let montantTotalTTC = parseFloat(
        contratData.facturation?.montantTotalTTC || 
        contratData.negociation?.montantTTC || 
        contratData.montantTotalTTC ||
        0
      );
      
      // Si pas de montant total, calculer en additionnant les échéances
      if (montantTotalTTC === 0 && contratData.echeances && contratData.echeances.length > 0) {
        montantTotalTTC = contratData.echeances.reduce((total, ech) => {
          return total + parseFloat(ech.montantTTC || 0);
        }, 0);
        console.log('[generateFacturesFromContrat] Montant total calculé depuis les échéances:', montantTotalTTC);
      }
      
      console.log('[generateFacturesFromContrat] Montant total TTC final:', montantTotalTTC);
      
      contratData.echeances.forEach((echeance, index) => {
        console.log(`[generateFacturesFromContrat] Traitement échéance ${index + 1}:`, echeance);
        console.log(`[generateFacturesFromContrat] Structure complète de l'échéance ${index + 1}:`, JSON.stringify(echeance, null, 2));
        console.log(`[generateFacturesFromContrat] Champs disponibles:`, Object.keys(echeance));
        // Calculer la date d'échéance de paiement (date de l'échéance + délai de paiement)
        const dateEcheanceBase = echeance.date || echeance.dateEcheance || new Date().toISOString().split('T')[0];
        let dateEcheancePaiement = dateEcheanceBase;
        
        if (dateEcheanceBase && (echeance.delaiPaiement || contratData.delaiPaiement)) {
          const delaiJours = parseInt((echeance.delaiPaiement || contratData.delaiPaiement || '30').replace(/[^0-9]/g, '')) || 30;
          const dateBase = new Date(dateEcheanceBase);
          if (!isNaN(dateBase.getTime())) {
            dateBase.setDate(dateBase.getDate() + delaiJours);
            dateEcheancePaiement = dateBase.toISOString().split('T')[0];
          }
        }
        
        // Calculer le montant HT à partir du TTC si nécessaire
        let montantHT = 0;
        if (echeance.montant) {
          montantHT = parseFloat(echeance.montant);
        } else if (echeance.montantTTC) {
          // Calculer le HT à partir du TTC
          const tauxTVA = commonData.tauxTVA; // Utiliser la TVA du commonData
          const montantTTC = parseFloat(echeance.montantTTC);
          montantHT = tauxTVA > 0 ? montantTTC / (1 + tauxTVA / 100) : montantTTC;
        }
        
        console.log(`[generateFacturesFromContrat] Calcul montant HT pour échéance ${index + 1}:`, {
          montantTTC: echeance.montantTTC,
          tauxTVA: commonData.tauxTVA,
          montantHT: montantHT
        });
        
        const factureData = {
          ...commonData,
          type: echeance.nature?.toLowerCase() || 'complete',
          reference: `FAC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
          objet: `${echeance.nature || 'Facture'} - ${concertData.artisteNom || ''}`,
          montantHT: montantHT,
          montantTotalTTC: montantTotalTTC, // Passer le montant total de la prestation
          echeance: dateEcheancePaiement || echeance.dateEcheance,
          dateEcheanceContrat: echeance.date || echeance.dateEcheance, // Date originale de l'échéance dans le contrat
          modeReglement: echeance.modeReglement || echeance.modePaiement || 'Virement',
          delaiPaiement: echeance.delaiPaiement || contratData.delaiPaiement || '30 jours',
          conditionsPaiement: echeance.conditions || contratData.conditionsPaiement,
          echeanceData: echeance,
          // Passer toutes les infos de facturation
          facturation: contratData.facturation,
          reglement: contratData.reglement,
          // Information sur le mapping depuis les prestations
          prestationsInfo: contratData.prestations && contratData.prestations.length > 0 ? 
            `Calculé depuis ${contratData.prestations.length} prestation(s)` : null
        };
        
        console.log(`[generateFacturesFromContrat] Facture ${index + 1} créée:`, {
          type: factureData.type,
          montantHT: factureData.montantHT,
          tauxTVA: factureData.tauxTVA,
          reference: factureData.reference,
          montantTotalTTC: factureData.montantTotalTTC
        });
        console.log(`[generateFacturesFromContrat] TVA de la facture ${index + 1}:`, factureData.tauxTVA);
        
        factures.push(factureData);
      });
    }
    
    console.log('[generateFacturesFromContrat] === FIN GÉNÉRATION FACTURES ===');
    console.log('[generateFacturesFromContrat] Total factures générées:', factures.length);
    
    return factures;
  };

  // Générer l'aperçu HTML
  const generatePreview = async (factureData) => {
    try {
      // TODO: Utiliser factureService.generateFactureHtml quand disponible
      const html = generateFactureHtmlTemplate(factureData);
      setPreviewHtml(html);
    } catch (err) {
      console.error('Erreur lors de la génération de l\'aperçu:', err);
    }
  };

  // Fonction temporaire pour générer le HTML de la facture
  const generateFactureHtmlTemplate = (data) => {
    console.log('[generateFactureHtmlTemplate] === GÉNÉRATION HTML FACTURE ===');
    console.log('[generateFactureHtmlTemplate] Données reçues:', data);
    console.log('[generateFactureHtmlTemplate] Taux TVA dans data:', data.tauxTVA);
    
    const tauxTVA = parseFloat(data.tauxTVA || 0);
    const montantHT = parseFloat(data.montantHT || 0);
    const montantTVA = (montantHT * (tauxTVA / 100)).toFixed(2);
    const montantTTC = (montantHT + parseFloat(montantTVA)).toFixed(2);
    
    console.log('[generateFactureHtmlTemplate] Calculs:', {
      tauxTVA,
      montantHT,
      montantTVA,
      montantTTC
    });
    
    // Récupérer le montant total directement depuis les données
    const montantTotalTTC = parseFloat(data.montantTotalTTC || 0);
    const montantTotalHT = tauxTVA > 0 ? montantTotalTTC / (1 + tauxTVA / 100) : montantTotalTTC;
    const montantTotalTVA = (montantTotalTTC - montantTotalHT).toFixed(2);
    
    return `
      <div class="facture-container">
        <div class="header">
          <div class="diffuseur">
            <h3>${data.emetteurNom || data.organisationNom || currentOrganization?.nom || 'Organisation'}</h3>
            <p>${data.emetteurAdresse || data.organisationAdresse || currentOrganization?.adresse || ''}</p>
            <p>${data.emetteurVille || (data.organisationCodePostal && data.organisationVille ? `${data.organisationCodePostal} ${data.organisationVille}` : '') || (currentOrganization?.codePostal && currentOrganization?.ville ? `${currentOrganization.codePostal} ${currentOrganization.ville}` : '')}</p>
            ${data.numeroTVA ? `<p>N° TVA : ${data.numeroTVA}</p>` : ''}
          </div>
          <div class="client">
            <h3>${data.structureNom || 'Client'}</h3>
            <p>${data.structureAdresse || ''}</p>
            <p>${data.structureCodePostal || ''} ${data.structureVille || ''}</p>
            ${data.structureTVA ? `<p>N° TVA : ${data.structureTVA}</p>` : ''}
          </div>
        </div>
        
        <h1 class="titre-facture">FACTURE ${data.type === 'acompte' ? 'D\'ACOMPTE' : data.type === 'solde' ? 'DE SOLDE' : ''}</h1>
        
        <div class="info-ligne">
          <div><strong>Réf :</strong> ${data.reference || ''}</div>
          <div><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
          <div><strong>N° Contrat :</strong> ${data.contratNumero || ''}</div>
        </div>
        
        <div class="info-ligne">
          <div><strong>Objet :</strong> ${data.objet || ''}</div>
        </div>
        
        ${data.type === 'acompte' || data.type === 'solde' ? `
          <h3>Détail de la facturation</h3>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th class="montant">Montant HT</th>
                <th class="montant">TVA ${tauxTVA}%</th>
                <th class="montant">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Montant total de la prestation</td>
                <td class="montant">${parseFloat(montantTotalHT).toFixed(2)} €</td>
                <td class="montant">${montantTotalTVA} €</td>
                <td class="montant">${montantTotalTTC} €</td>
              </tr>
              ${data.type === 'solde' && data.montantAcompte ? `
                <tr>
                  <td>Acompte déjà versé</td>
                  <td class="montant">- ${parseFloat(data.montantAcompte).toFixed(2)} €</td>
                  <td class="montant"></td>
                  <td class="montant">- ${(parseFloat(data.montantAcompte) * (1 + tauxTVA / 100)).toFixed(2)} €</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        ` : `
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th class="montant">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prestation</td>
                <td class="montant">${montantHT.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        `}
        
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
          <h3 style="text-align: center; margin-bottom: 20px;">
            ${data.type === 'acompte' ? 'ACOMPTE À PAYER' : data.type === 'solde' ? 'SOLDE À PAYER' : 'MONTANT À PAYER'}
          </h3>
          <table style="margin: 0 auto; width: 400px;">
            <tr>
              <td><strong>Base HT</strong></td>
              <td class="montant"><strong>${montantHT.toFixed(2)} €</strong></td>
            </tr>
            <tr>
              <td><strong>TVA ${tauxTVA}%</strong></td>
              <td class="montant"><strong>${montantTVA} €</strong></td>
            </tr>
            <tr class="total" style="font-size: 1.2em; border-top: 2px solid #000;">
              <td><strong>${data.type === 'acompte' ? 'Acompte TTC' : data.type === 'solde' ? 'Solde TTC' : 'Total TTC'}</strong></td>
              <td class="montant"><strong>${montantTTC} €</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="coordonnees-bancaires">
          <h4>Modalités de paiement</h4>
          <p><strong>Échéance :</strong> ${data.echeance ? new Date(data.echeance).toLocaleDateString('fr-FR') : ''}</p>
          <p><strong>Mode de règlement :</strong> ${data.modeReglement || 'Virement'}</p>
          <p><strong>Délai de paiement :</strong> ${data.delaiPaiement || '30 jours'}</p>
          <p><strong>À l'ordre de :</strong> ${data.aLOrdreDe || currentOrganization?.nom || ''}</p>
          ${data.conditionsPaiement ? `<p><strong>Conditions :</strong> ${data.conditionsPaiement}</p>` : ''}
        </div>
        
        ${data.modeReglement === 'Virement' && (data.iban || data.coordonneesBancaires) ? `
          <div class="coordonnees-bancaires">
            <h4>Coordonnées bancaires</h4>
            ${data.iban ? `<p><strong>IBAN :</strong> ${data.iban}</p>` : ''}
            ${data.bic ? `<p><strong>BIC :</strong> ${data.bic}</p>` : ''}
            ${data.coordonneesBancaires ? `<p>${data.coordonneesBancaires}</p>` : ''}
          </div>
        ` : ''}
        
        ${data.assujettissementTVA === false ? `
          <div class="mentions-legales" style="margin-top: 20px; font-size: 10px; font-style: italic;">
            <p>TVA non applicable, art. 293 B du CGI</p>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Gérer les modifications
  const handleDataChange = (field, value) => {
    const updatedData = {
      ...editableData,
      [field]: value
    };
    setEditableData(updatedData);
    
    // Mettre à jour la facture dans le tableau
    const updatedFactures = [...factures];
    updatedFactures[currentFactureIndex] = updatedData;
    setFactures(updatedFactures);
    
    // Régénérer l'aperçu
    generatePreview(updatedData);
  };

  // Navigation entre factures
  const navigateToFacture = (index) => {
    if (index >= 0 && index < factures.length) {
      setCurrentFactureIndex(index);
      setEditableData(factures[index]);
      generatePreview(factures[index]);
    }
  };

  // Ouvrir le formulaire de contrat pour modification
  const handleModifyContract = () => {
    if (contratId) {
      openTab({
        id: `contrat-edit-${contratId}`,
        title: `Modifier contrat`,
        path: `/contrats/${contratId}/edit`,
        component: 'ContratGeneratorNew',
        params: { 
          contratId: contratId,
          mode: 'edit'
        },
        icon: 'bi-pencil'
      });
    }
  };

  // Sauvegarder toutes les factures
  const handleSaveFactures = async () => {
    try {
      // TODO: Implémenter la sauvegarde des factures
      console.log('Sauvegarde des factures:', factures);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <i className="bi bi-exclamation-triangle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header avec navigation et actions */}
      <div className={styles.header}>
        <div className={styles.navigation}>
          {factures.length > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => navigateToFacture(currentFactureIndex - 1)}
                disabled={currentFactureIndex === 0}
                className={styles.navButton}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className={styles.pageInfo}>
                Facture {currentFactureIndex + 1} / {factures.length}
              </span>
              <button 
                onClick={() => navigateToFacture(currentFactureIndex + 1)}
                disabled={currentFactureIndex === factures.length - 1}
                className={styles.navButton}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={handleModifyContract}
            className={styles.modifyButton}
          >
            <i className="bi bi-pencil"></i>
            Modifier le contrat
          </button>
          
          <button 
            onClick={handleSaveFactures}
            className={styles.saveButton}
          >
            <i className="bi bi-check-lg"></i>
            Valider et générer
          </button>
        </div>
      </div>

      {/* Zone principale avec éditeur et aperçu */}
      <div className={styles.mainContent}>
        {/* Partie gauche : Éditeur */}
        <div className={styles.editorSection}>
          <h3>Éditeur de facture</h3>
          <FactureEditor 
            data={editableData}
            onChange={handleDataChange}
          />
        </div>
        
        {/* Partie droite : Aperçu */}
        <div className={styles.previewSection}>
          <h3>Aperçu</h3>
          <FacturePreview 
            html={previewHtml}
          />
        </div>
      </div>
    </div>
  );
};

export default FactureGeneratorPage;