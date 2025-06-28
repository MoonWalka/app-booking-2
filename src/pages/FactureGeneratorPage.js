import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useParametres } from '@/context/ParametresContext';
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
  const { parametres } = useParametres();
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
  const [entrepriseData, setEntrepriseData] = useState(null);

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
        
        // Charger les informations bancaires de l'entreprise
        let entrepriseInfo = null;
        try {
          const entrepriseRef = doc(db, 'organizations', currentOrganization.id, 'settings', 'entreprise');
          const entrepriseSnap = await getDoc(entrepriseRef);
          if (entrepriseSnap.exists()) {
            entrepriseInfo = entrepriseSnap.data();
            setEntrepriseData(entrepriseInfo);
            console.log('[FactureGeneratorPage] Informations bancaires entreprise chargées:', {
              iban: entrepriseInfo.iban,
              bic: entrepriseInfo.bic,
              banque: entrepriseInfo.banque,
              coordonneesBancaires: entrepriseInfo.coordonneesBancaires,
              ordre: entrepriseInfo.ordre
            });
            console.log('[FactureGeneratorPage] Toutes les données entreprise:', entrepriseInfo);
          }
        } catch (error) {
          console.error('[FactureGeneratorPage] Erreur chargement infos bancaires:', error);
        }
        
        // Charger le concert
        const concertRef = doc(db, 'concerts', concertId);
        const concertSnap = await getDoc(concertRef);
        
        if (!concertSnap.exists()) {
          throw new Error('Concert introuvable');
        }
        
        const concertData = { id: concertSnap.id, ...concertSnap.data() };
        setConcert(concertData);
        
        // Charger les données complètes de la structure si elle existe
        let structureData = null;
        if (concertData.structureId) {
          try {
            const structureRef = doc(db, 'structures', concertData.structureId);
            const structureSnap = await getDoc(structureRef);
            if (structureSnap.exists()) {
              structureData = structureSnap.data();
              console.log('[FactureGeneratorPage] Structure chargée:', structureData);
            }
          } catch (error) {
            console.error('[FactureGeneratorPage] Erreur chargement structure:', error);
          }
        }
        
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
            const generatedFactures = generateFacturesFromContrat(contratData, concertData, parametres, entrepriseInfo, currentOrganization, structureData);
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
  }, [user, currentOrganization?.id, concertId, contratId, fromContrat, parametres]);

  // Générer les factures à partir du contrat
  const generateFacturesFromContrat = (contratData, concertData, parametres, entrepriseData, currentOrganization, structureData) => {
    console.log('[generateFacturesFromContrat] === DÉBUT GÉNÉRATION FACTURES ===');
    console.log('[generateFacturesFromContrat] Données contrat reçues:', contratData);
    console.log('[generateFacturesFromContrat] Paramètres entreprise:', parametres?.entreprise);
    console.log('[generateFacturesFromContrat] Données bancaires entreprise:', entrepriseData);
    console.log('[generateFacturesFromContrat] IBAN depuis entrepriseData:', entrepriseData?.iban);
    console.log('[generateFacturesFromContrat] BIC depuis entrepriseData:', entrepriseData?.bic);
    console.log('[generateFacturesFromContrat] ORDRE depuis entrepriseData:', entrepriseData?.ordre);
    console.log('[generateFacturesFromContrat] Contractant2 (destinataire):', contratData.contractant2);
    console.log('[generateFacturesFromContrat] Structure depuis concert:', {
      structureNom: concertData.structureNom,
      structureAdresse: concertData.structureAdresse,
      structureCodePostal: concertData.structureCodePostal,
      structureVille: concertData.structureVille
    });
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
      structureNom: contratData.contractant2?.nom || structureData?.nom || contratData.structureNom || concertData.structureNom,
      structureAdresse: contratData.contractant2?.adresse || structureData?.adresse || contratData.structureAdresse || concertData.structureAdresse || '',
      structureCodePostal: contratData.contractant2?.codePostal || structureData?.codePostal || contratData.structureCodePostal || concertData.structureCodePostal || '',
      structureVille: contratData.contractant2?.ville || structureData?.ville || contratData.structureVille || concertData.structureVille || '',
      structureTVA: contratData.contractant2?.numeroTVA || structureData?.numeroTVA || '',
      
      // Informations de l'émetteur (producteur/tourneur) - contractant1 dans le contrat
      organisationNom: contratData.contractant1?.nom || entrepriseData?.nom || entrepriseData?.raisonSociale || currentOrganization?.nom,
      organisationAdresse: contratData.contractant1?.adresse || entrepriseData?.adresse || currentOrganization?.adresse,
      organisationCodePostal: contratData.contractant1?.codePostal || entrepriseData?.codePostal || currentOrganization?.codePostal,
      organisationVille: contratData.contractant1?.ville || entrepriseData?.ville || currentOrganization?.ville,
      
      // Champs émetteur pour FactureEditor
      emetteurNom: contratData.contractant1?.nom || entrepriseData?.nom || entrepriseData?.raisonSociale || currentOrganization?.nom,
      emetteurAdresse: contratData.contractant1?.adresse || entrepriseData?.adresse || currentOrganization?.adresse,
      emetteurVille: (contratData.contractant1?.codePostal && contratData.contractant1?.ville) ? 
        `${contratData.contractant1.codePostal} ${contratData.contractant1.ville}` :
        (entrepriseData?.codePostal && entrepriseData?.ville) ? 
        `${entrepriseData.codePostal} ${entrepriseData.ville}` :
        (currentOrganization?.codePostal && currentOrganization?.ville) ?
        `${currentOrganization.codePostal} ${currentOrganization.ville}` : '',
      
      // Informations bancaires de l'émetteur
      coordonneesBancaires: contratData.contractant1?.coordonneesBancaires || contratData.coordonneesBancaires || parametres?.entreprise?.coordonneesBancaires || currentOrganization.coordonneesBancaires,
      iban: contratData.contractant1?.iban || contratData.iban || parametres?.entreprise?.iban || currentOrganization.iban,
      bic: contratData.contractant1?.bic || contratData.bic || parametres?.entreprise?.bic || currentOrganization.bic,
      
      // Informations de paiement par défaut
      aLOrdreDe: entrepriseData?.ordre || entrepriseData?.nom || contratData.contractant1?.nom || contratData.aLOrdreDe || currentOrganization?.nom,
      
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
      numeroTVA: contratData.contractant1?.numeroTVA || entrepriseData?.tva || entrepriseData?.numeroTVA || contratData.numeroTVA || currentOrganization?.numeroTVA,
      assujettissementTVA: contratData.contractant1?.assujettissementTVA || entrepriseData?.assujettie || contratData.assujettissementTVA || currentOrganization?.assujettissementTVA,
      
      // Informations bancaires de l'entreprise
      iban: entrepriseData?.iban || parametres?.entreprise?.iban || '',
      bic: entrepriseData?.bic || parametres?.entreprise?.bic || '',
      banque: entrepriseData?.banque || parametres?.entreprise?.banque || '',
      coordonneesBancaires: entrepriseData?.coordonneesBancaires || parametres?.entreprise?.coordonneesBancaires || '',
      
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

  // Fonction pour convertir un nombre en lettres (simplifié)
  const numberToWords = (num) => {
    // Fonction simplifiée - peut être étendue
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const hundreds = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];
    
    if (num === 0) return 'zéro';
    
    let result = '';
    const intNum = Math.floor(num);
    
    if (intNum >= 1000) {
      result += Math.floor(intNum / 1000) === 1 ? 'mille ' : ones[Math.floor(intNum / 1000)] + ' mille ';
    }
    
    const remainder = intNum % 1000;
    if (remainder >= 100) {
      result += hundreds[Math.floor(remainder / 100)] + ' ';
    }
    
    const lastTwo = remainder % 100;
    if (lastTwo >= 20) {
      result += tens[Math.floor(lastTwo / 10)];
      if (lastTwo % 10 !== 0) {
        result += '-' + ones[lastTwo % 10];
      }
    } else if (lastTwo >= 10) {
      result += teens[lastTwo - 10];
    } else if (lastTwo > 0) {
      result += ones[lastTwo];
    }
    
    return result.trim();
  };

  // Fonction pour générer le HTML de la facture selon votre structure
  const generateFactureHtmlTemplate = (data) => {
    console.log('[generateFactureHtmlTemplate] === GÉNÉRATION HTML FACTURE ===');
    console.log('[generateFactureHtmlTemplate] Données reçues:', data);
    console.log('[generateFactureHtmlTemplate] Taux TVA dans data:', data.tauxTVA);
    
    const tauxTVA = parseFloat(data.tauxTVA || 0);
    const montantHT = parseFloat(data.montantHT || 0);
    const montantTVA = (montantHT * (tauxTVA / 100));
    const montantTTC = montantHT + montantTVA;
    
    // Récupérer le montant total de la prestation
    const montantTotalTTC = parseFloat(data.montantTotalTTC || 0);
    const montantTotalHT = tauxTVA > 0 ? montantTotalTTC / (1 + tauxTVA / 100) : montantTotalTTC;
    const montantTotalTVA = montantTotalTTC - montantTotalHT;
    
    console.log('[generateFactureHtmlTemplate] Calculs:', {
      tauxTVA,
      montantHT,
      montantTVA: montantTVA.toFixed(2),
      montantTTC: montantTTC.toFixed(2)
    });
    
    return `
      <div class="facture-container">
        <!-- En-tête avec coordonnées -->
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
        
        <!-- 1. EN-TÊTE -->
        <h1 class="titre-facture">FACTURE</h1>
        
        <div class="ref-objet">
          <p><strong>Réf. :</strong> ${data.reference || 'en attente'}</p>
          <p><strong>Objet :</strong> ${data.objet || '1 représentation du spectacle'}</p>
        </div>
        
        <!-- 2. TABLEAU PRINCIPAL -->
        <div class="tableau-principal">
          <div class="lignes-facturation">
            <table class="table-lignes">
              <tbody>
                <tr>
                  <td>Prestation artistique</td>
                  <td class="montant-ht">${montantTotalHT.toFixed(2).replace('.', ',')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-ht">
            <strong>TOTAL HT : ${montantTotalHT.toFixed(2).replace('.', ',')} EUR</strong>
          </div>
        </div>
        
        <!-- Layout en bas avec 4 sections -->
        <div class="bottom-layout">
          <!-- 3. SECTION TVA (en bas à gauche) -->
          <div class="section-tva">
            <h4>CALCUL TVA :</h4>
            <table class="table-tva">
              <thead>
                <tr>
                  <th>Taux</th>
                  <th>Base</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${tauxTVA.toFixed(1).replace('.', ',')}</td>
                  <td>${montantTotalHT.toFixed(2).replace('.', ',')}</td>
                  <td>${montantTotalTVA.toFixed(2).replace('.', ',')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 4. SECTION ACOMPTE À PAYER (en bas à droite) -->
          <div class="section-paiement">
            <div class="montants-paiement">
              <p>${data.type === 'acompte' ? 'ACOMPTE' : data.type === 'solde' ? 'SOLDE' : 'MONTANT'} HT : ${montantHT.toFixed(2).replace('.', ',')} EUR</p>
              <p>Montant TVA : ${montantTVA.toFixed(2).replace('.', ',')} EUR</p>
              <p class="montant-final"><strong>${data.type === 'acompte' ? 'ACOMPTE' : data.type === 'solde' ? 'SOLDE' : 'MONTANT'} À PAYER : ${montantTTC.toFixed(2).replace('.', ',')} EUR</strong></p>
              <p class="montant-lettres">${numberToWords(montantTTC)} EUR ***</p>
            </div>
          </div>
          
          <!-- 5. TABLEAU RÉCAPITULATIF (en bas à gauche) -->
          <div class="section-recapitulatif">
            <h4>RÉCAPITULATIF DE LA FACTURATION</h4>
            <table class="table-recapitulatif">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${data.type || 'facture'}</td>
                  <td>${data.echeance ? new Date(data.echeance).toLocaleDateString('fr-FR') : ''}</td>
                  <td>${montantTTC.toFixed(2).replace('.', ',')} EUR</td>
                </tr>
                ${data.type === 'acompte' || data.type === 'solde' ? `
                <tr style="font-size: 0.9em; color: #666;">
                  <td colspan="2">Montant total de la prestation TTC</td>
                  <td>${montantTotalTTC.toFixed(2).replace('.', ',')} EUR</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
          
          <!-- 6. ENCADRÉ MODALITÉS (en bas à droite) -->
          <div class="section-modalites">
            <div class="encadre-modalites">
              <p><strong>Échéance de règlement :</strong> le ${data.echeance ? new Date(data.echeance).toLocaleDateString('fr-FR') : ''}</p>
              <p><strong>Mode de règlement :</strong> ${data.modeReglement || 'Virement bancaire'}</p>
              <p><strong>à l'ordre de</strong> ${data.aLOrdreDe || currentOrganization?.nom || ''}</p>
            </div>
          </div>
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
          <div class="mentions-legales">
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

  // Fonction pour nettoyer les valeurs undefined
  const cleanUndefinedValues = (obj) => {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  };

  // Sauvegarder toutes les factures
  const handleSaveFactures = async () => {
    if (!user || !currentOrganization?.id) {
      setError('Impossible de sauvegarder : utilisateur ou organisation manquant');
      return;
    }

    try {
      console.log('[handleSaveFactures] Début sauvegarde des factures');
      
      // Sauvegarder chaque facture
      const savedFactureIds = [];
      for (let i = 0; i < factures.length; i++) {
        const facture = factures[i];
        
        // Générer le numéro de facture si nécessaire
        let numeroFacture = facture.reference;
        if (!numeroFacture || numeroFacture.includes('attente')) {
          numeroFacture = await factureService.generateNumeroFacture(currentOrganization.id);
        }
        
        // Préparer les données de la facture
        const factureData = {
          ...facture,
          numeroFacture: numeroFacture,
          reference: numeroFacture,
          status: 'draft', // Statut initial
          concertId: facture.concertId,
          contratId: contrat?.id,
          // Informations calculées
          montantHT: parseFloat(facture.montantHT) || 0,
          tauxTVA: parseFloat(facture.tauxTVA) || 0,
          montantTVA: (parseFloat(facture.montantHT) || 0) * ((parseFloat(facture.tauxTVA) || 0) / 100),
          montantTTC: (parseFloat(facture.montantHT) || 0) * (1 + (parseFloat(facture.tauxTVA) || 0) / 100),
          // Date de création
          dateFacture: new Date().toISOString().split('T')[0],
          // Échéance
          dateEcheance: facture.echeance || new Date().toISOString().split('T')[0]
        };
        
        // Nettoyer les valeurs undefined avant la sauvegarde
        const cleanedFactureData = cleanUndefinedValues(factureData);
        
        console.log(`[handleSaveFactures] Sauvegarde facture ${i + 1}:`, cleanedFactureData);
        
        const factureId = await factureService.createFacture(
          cleanedFactureData,
          currentOrganization.id,
          user.uid
        );
        
        savedFactureIds.push(factureId);
        console.log(`[handleSaveFactures] Facture ${i + 1} sauvegardée avec ID:`, factureId);
      }
      
      console.log('[handleSaveFactures] Toutes les factures ont été sauvegardées:', savedFactureIds);
      
      // Afficher un message de succès et fermer l'onglet
      alert(`${factures.length} facture${factures.length > 1 ? 's' : ''} générée${factures.length > 1 ? 's' : ''} avec succès !`);
      
      // TODO: Rediriger vers la liste des factures ou fermer l'onglet
      
    } catch (err) {
      console.error('[handleSaveFactures] Erreur lors de la sauvegarde:', err);
      setError(`Erreur lors de la sauvegarde : ${err.message}`);
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
    <div className={styles.container} style={{ backgroundColor: '#90EE90' }}>
      {/* FOND VERT POUR TEST - FactureGeneratorPage */}
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