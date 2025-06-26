import { db, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from './firebase-service';
import { formatMontant, formatDate } from '@/utils/formatters';
import { toWords } from '@/utils/numberToWords';

/**
 * Service de gestion des factures
 */
class FactureService {
  constructor() {
    this.collectionName = 'factures';
    this.parametersCache = null;
  }

  /**
   * Modèle de facture par défaut
   */
  getDefaultTemplate() {
    return {
      id: 'system-default', // Ajouter un ID pour le template système
      name: 'Modèle Standard',
      templateType: 'service',
      isDefault: true,
      isSystemTemplate: true,
      content: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.4; position: relative; min-height: calc(297mm - 21.2mm); box-sizing: border-box;">
  <!-- Conteneur principal -->
  <div style="padding: 0; padding-bottom: 60px;">
    <!-- Date en haut de page -->
    <div style="text-align: right; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; color: #333;">Le {{date_facture}}</p>
    </div>

    <!-- Titre FACTURE centré -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #333; margin: 0; font-size: 32px; font-weight: bold;">FACTURE</h1>
      <p style="margin: 5px 0 0 0; font-size: 16px; color: #666;">N° {{numero_facture}}</p>
    </div>

    <!-- Deux blocs côte à côte : Émetteur et Destinataire -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px;">
      <!-- Bloc Émetteur (gauche) -->
      <div style="flex: 1;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 5px;">Émetteur</h3>
        <div style="font-size: 12px; color: #333; line-height: 1.6;">
          {{#if logo_entreprise}}
            <img src="{{logo_entreprise}}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;">
          {{/if}}
          <strong style="font-size: 14px;">{{nom_entreprise}}</strong><br>
          {{adresse_entreprise}}<br>
          {{ville_entreprise}}<br>
          {{#if siret_entreprise}}SIRET : {{siret_entreprise}}<br>{{/if}}
          {{#if numero_tva_entreprise}}TVA : {{numero_tva_entreprise}}<br>{{/if}}
          {{#if telephone_entreprise}}Tél : {{telephone_entreprise}}<br>{{/if}}
          {{#if email_entreprise}}Email : {{email_entreprise}}<br>{{/if}}
          {{#if site_web_entreprise}}Web : {{site_web_entreprise}}{{/if}}
        </div>
      </div>

      <!-- Bloc Destinataire (droite) -->
      <div style="flex: 1;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 5px;">Destinataire</h3>
        <div style="font-size: 12px; color: #333; line-height: 1.6;">
          <strong style="font-size: 14px;">{{nom_structure}}</strong><br>
          {{adresse_structure}}<br>
          {{ville_structure}}<br>
          {{#if siret_structure}}SIRET : {{siret_structure}}<br>{{/if}}
          {{#if tva_structure}}TVA : {{tva_structure}}<br>{{/if}}
          {{#if contact_nom}}<br><em>À l'attention de : {{contact_nom}}</em>{{/if}}
          {{#if contact_telephone}}<br>Tél : {{contact_telephone}}{{/if}}
          {{#if contact_email}}<br>Email : {{contact_email}}{{/if}}
        </div>
      </div>
    </div>

    <!-- Détails de la prestation -->
    <div style="margin-bottom: 20px;">
      <h3 style="color: #333; font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">DÉTAILS DE LA PRESTATION</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-size: 12px;">Description</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd; width: 120px; font-size: 12px;">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <strong style="font-size: 13px;">{{titre_concert}}</strong><br>
              <span style="color: #666; font-size: 11px; line-height: 1.3;">
                Artiste : {{artiste_nom}}<br>
                Date : {{date_concert}}<br>
                Lieu : {{lieu_nom}}, {{lieu_ville}}<br>
                {{#if mention_acompte}}{{mention_acompte}}{{/if}}
              </span>
            </td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px;">
              {{montant_concert}} €
            </td>
          </tr>
          {{lignes_supplementaires}}
          {{#if has_lignes_supplementaires}}
          <tr>
            <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 12px;">Sous-total :</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 13px;">{{montant_ht}} €</td>
          </tr>
          {{/if}}
        </tbody>
      </table>
    </div>

    <!-- Totaux et informations de paiement dans une même ligne -->
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
      <!-- Montant en lettres et conditions de paiement -->
      <div style="flex: 1;">
        <!-- Montant en lettres -->
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          <strong style="font-size: 12px;">Montant en lettres :</strong><br>
          <span style="font-size: 12px;">{{montant_lettres}}</span>
        </div>

        <!-- Conditions de paiement -->
        <div>
          <h4 style="color: #333; font-size: 13px; margin: 0 0 6px 0;">CONDITIONS DE PAIEMENT</h4>
          <p style="font-size: 11px; line-height: 1.4; color: #666; margin: 0;">
            {{#if date_echeance}}Date d'échéance : {{date_echeance}}<br>{{/if}}
            Mode de paiement : Virement bancaire<br>
            {{#if delai_paiement}}Délai de paiement : {{delai_paiement}} jours{{/if}}
          </p>
        </div>
      </div>

      <!-- Totaux à droite -->
      <div style="max-width: 280px; margin-left: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 8px; text-align: right; font-size: 12px;">Montant HT :</td>
            <td style="padding: 6px 8px; text-align: right; width: 100px; font-weight: bold; font-size: 12px;">{{montant_ht}} €</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; text-align: right; font-size: 12px;">TVA ({{taux_tva}}%) :</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: bold; font-size: 12px;">{{montant_tva}} €</td>
          </tr>
          <tr style="background-color: #333; color: white;">
            <td style="padding: 10px 8px; text-align: right; font-size: 15px; font-weight: bold;">TOTAL TTC :</td>
            <td style="padding: 10px 8px; text-align: right; font-size: 15px; font-weight: bold;">{{montant_ttc}} €</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Informations bancaires -->
    {{#if iban_entreprise}}
    <div style="background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
      <h4 style="color: #333; font-size: 13px; margin: 0 0 6px 0;">COORDONNÉES BANCAIRES</h4>
      <div style="font-size: 11px; line-height: 1.4;">
        {{#if banque_entreprise}}<strong>Banque :</strong> {{banque_entreprise}}<br>{{/if}}
        <strong>IBAN :</strong> {{iban_entreprise}}<br>
        {{#if bic_entreprise}}<strong>BIC :</strong> {{bic_entreprise}}{{/if}}
      </div>
    </div>
    {{/if}}

    <!-- Pied de page personnalisé -->
    {{#if show_pied_de_page}}
    {{#if texte_pied_de_page}}
    <div style="margin-top: 20px; padding: 12px; background-color: #f9f9f9; border-radius: 4px; text-align: center;">
      <p style="font-size: 12px; color: #333; margin: 0; line-height: 1.4;">{{texte_pied_de_page}}</p>
    </div>
    {{/if}}
    {{/if}}
  </div>

  <!-- Mentions légales - positionnement absolu en bas de page -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0;">
    <div style="padding: 12px 0; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center;">
      {{#if show_siret}}{{#if siret_entreprise}}<p style="margin: 0;">SIRET : {{siret_entreprise}} {{#if show_numero_tva}}{{#if numero_tva_entreprise}}- TVA : {{numero_tva_entreprise}}{{/if}}{{/if}}</p>{{/if}}{{/if}}
      {{#if mentions_legales}}<p style="margin: 6px 0 0 0;">{{mentions_legales}}</p>{{/if}}
    </div>
  </div>
</div>
      `
    };
  }

  /**
   * Générer un numéro de facture unique basé sur les paramètres configurés
   */
  async generateFactureNumber(organizationId) {
    try {
      // Charger les paramètres pour obtenir le format de numérotation
      const parameters = await this.loadFactureParameters(organizationId);
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      // Construire le numéro selon le format configuré
      let numeroBase = parameters.numeroFormat || 'YYYY-MM-XXXX';
      numeroBase = numeroBase
        .replace('YYYY', year)
        .replace('MM', month);
      
      // Déterminer le préfixe pour la recherche
      const searchPrefix = parameters.numeroPrefix + parameters.numeroSeparator + 
        numeroBase.replace('XXXX', '');

      // Récupérer la dernière facture avec ce préfixe
      const facturesRef = collection(db, 'organizations', organizationId, this.collectionName);
      const q = query(
        facturesRef,
        where('numeroFacture', '>=', searchPrefix),
        where('numeroFacture', '<', searchPrefix + '\uf8ff'),
        orderBy('numeroFacture', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      let nextNumber = 1;

      if (!snapshot.empty) {
        const lastFacture = snapshot.docs[0].data();
        // Extraire le numéro séquentiel de la dernière facture
        const parts = lastFacture.numeroFacture.split(parameters.numeroSeparator || '-');
        const lastNumberStr = parts[parts.length - 1];
        const lastNumber = parseInt(lastNumberStr) || 0;
        nextNumber = lastNumber + 1;
      }

      // Construire le numéro final
      const numeroFinal = numeroBase.replace('XXXX', String(nextNumber).padStart(4, '0'));
      return parameters.numeroPrefix + parameters.numeroSeparator + numeroFinal;
      
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de facture:', error);
      // Fallback avec timestamp
      return `FAC-${Date.now()}`;
    }
  }

  /**
   * Calculer les montants TVA
   */
  calculateTVA(montantHT, tauxTVA = 20) {
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;
    
    return {
      montantHT: montantHT,
      tauxTVA: tauxTVA,
      montantTVA: montantTVA,
      montantTTC: montantTTC
    };
  }

  /**
   * Charger les paramètres de facturation pour une organisation
   */
  async loadFactureParameters(organizationId) {
    if (this.parametersCache && this.parametersCache.organizationId === organizationId) {
      return this.parametersCache.parameters;
    }

    try {
      const parametersRef = doc(db, 'organizations', organizationId, 'settings', 'factureParameters');
      const parametersDoc = await getDoc(parametersRef);
      
      if (parametersDoc.exists()) {
        const parameters = parametersDoc.data().parameters || {};
        this.parametersCache = { organizationId, parameters };
        return parameters;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres de facturation:', error);
    }

    // Paramètres par défaut
    const defaultParameters = {
      numeroPrefix: 'FAC',
      numeroFormat: 'YYYY-MM-XXXX',
      numeroSeparator: '-',
      titreFacture: 'FACTURE',
      afficherTva: true,
      tauxTva: 20,
      mentionTva: 'TVA non applicable, article 293B du CGI',
      conditionsPaiement: 'Paiement à réception de facture',
      penalitesRetard: 'En cas de retard de paiement, des pénalités de retard sont exigibles (taux légal en vigueur).',
      escompte: 'Pas d\'escompte pour paiement anticipé',
      afficherNumeroTva: true,
      afficherSiret: true,
      afficherMentionsLegales: true,
      afficherIban: true,
      afficherBic: true,
      iban: '',
      bic: '',
      nomBanque: '',
      showLogo: true,
      logoUrl: '',
      afficherPiedDePage: true,
      textePiedDePage: '',
      couleurPrimaire: '#3b82f6',
      couleurSecondaire: '#1f2937'
    };

    this.parametersCache = { organizationId, parameters: defaultParameters };
    return defaultParameters;
  }

  /**
   * Préparer les variables pour une facture
   */
  async prepareFactureVariables(factureData, organizationId) {
    // Charger les paramètres
    const parameters = await this.loadFactureParameters(organizationId);
    
    // Charger les informations d'entreprise depuis l'organisation
    let entreprise = factureData.entreprise;
    try {
      const entrepriseRef = doc(db, 'organizations', organizationId, 'settings', 'entreprise');
      const entrepriseDoc = await getDoc(entrepriseRef);
      if (entrepriseDoc.exists()) {
        entreprise = entrepriseDoc.data();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations d\'entreprise:', error);
    }
    
    const {
      concert,
      structure,
      montantHT,
      montantAcompteADeduire, // Nouveau paramètre
      tauxTVA = parameters.tauxTva || 20,
      dateEcheance,
      lignesSupplementaires = []
    } = factureData;

    // Calculer les montants (s'assurer que montantHT est un nombre valide)
    const montantHTNum = parseFloat(montantHT) || 0;
    
    // Si on a un acompte à déduire, on l'ajoute comme ligne supplémentaire négative
    let lignesAvecAcompte = [...lignesSupplementaires];
    if (montantAcompteADeduire && montantAcompteADeduire > 0) {
      // Ajouter une ligne de déduction pour l'acompte
      const labelDeduction = factureData.typeFacture === 'solde' ? 'Acompte déjà versé' : `Reste à payer (${factureData.pourcentageAcompte}%)`;
      lignesAvecAcompte.push({
        description: labelDeduction,
        montant: -1 * (parseFloat(montantHTNum) - parseFloat(montantAcompteADeduire)),
        type: 'montant'
      });
    }
    
    // Calculer les montants finaux avec les lignes (incluant la déduction d'acompte)
    let montantHTFinal = montantHTNum;
    lignesAvecAcompte.forEach(ligne => {
      montantHTFinal += parseFloat(ligne.montant) || 0;
    });
    
    const { montantTVA, montantTTC } = this.calculateTVA(montantHTFinal, tauxTVA);

    // Générer le numéro de facture
    const numeroFacture = await this.generateFactureNumber(organizationId);
    
    // Calculer le montant du concert (sans les lignes supplémentaires)
    let montantConcert = factureData.montantTotal || parseFloat(factureData.montantHT) || 0;
    if (lignesSupplementaires && lignesSupplementaires.length > 0) {
      // Soustraire les montants supplémentaires pour obtenir le montant du concert seul
      const totalSupplements = lignesSupplementaires.reduce((sum, ligne) => sum + (parseFloat(ligne.montant) || 0), 0);
      montantConcert = montantConcert - totalSupplements;
    }
    
    // Générer le HTML des lignes supplémentaires (incluant l'acompte)
    let lignesSupplementairesHTML = '';
    if (lignesAvecAcompte && lignesAvecAcompte.length > 0) {
      lignesAvecAcompte.forEach(ligne => {
        if (ligne.description && ligne.montant) {
          // Ajouter le pourcentage dans la description si c'est une ligne de pourcentage
          let description = ligne.description;
          if (ligne.type === 'pourcentage' && ligne.pourcentage) {
            description += ` (${ligne.pourcentage}%)`;
          }
          
          lignesSupplementairesHTML += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <span style="font-size: 12px;">${description}</span>
            </td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-size: 13px;">
              ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(ligne.montant) || 0)} €
            </td>
          </tr>`;
        }
      });
    }

    // Préparer les variables
    const variables = {
      // Numéro et dates
      numero_facture: numeroFacture,
      date_facture: formatDate(new Date()),
      date_echeance: formatDate(dateEcheance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 jours par défaut

      // Entreprise (émetteur)
      nom_entreprise: entreprise?.nom || '',
      adresse_entreprise: entreprise?.adresse || '',
      ville_entreprise: `${entreprise?.codePostal || ''} ${entreprise?.ville || ''}`.trim(),
      siret_entreprise: entreprise?.siret || '',
      numero_tva_entreprise: entreprise?.numeroTVA || entreprise?.numeroIntracommunautaire || '',
      telephone_entreprise: entreprise?.telephone || '',
      email_entreprise: entreprise?.email || '',
      site_web_entreprise: entreprise?.siteWeb || '',
      logo_entreprise: parameters.showLogo && parameters.logoUrl ? parameters.logoUrl : (parameters.showLogo ? entreprise?.logo || '' : ''),
      iban_entreprise: parameters.iban || entreprise?.iban || '',
      bic_entreprise: parameters.bic || entreprise?.bic || '',
      banque_entreprise: parameters.nomBanque || entreprise?.banque || '',

      // Client (structure)
      nom_structure: structure?.nom || '',
      // Gérer les différents formats d'adresse possibles
      adresse_structure: (() => {
        // Priorité 1: adresse de facturation
        if (structure?.adresseFacturation) return structure.adresseFacturation;
        // Priorité 2: adresse dans adresseLieu (format actuel)
        if (structure?.adresseLieu?.adresse) return structure.adresseLieu.adresse;
        // Priorité 3: adresse comme objet
        if (structure?.adresse && typeof structure.adresse === 'object' && structure.adresse.adresse) {
          return structure.adresse.adresse;
        }
        // Priorité 4: adresse directe
        if (structure?.adresse && typeof structure.adresse === 'string') return structure.adresse;
        return '';
      })(),
      ville_structure: (() => {
        // Priorité 1: adresse de facturation
        if (structure?.adresseFacturation) {
          return `${structure.codePostalFacturation || ''} ${structure.villeFacturation || ''}`.trim();
        }
        // Priorité 2: adresse dans adresseLieu (format actuel)
        if (structure?.adresseLieu) {
          return `${structure.adresseLieu.codePostal || ''} ${structure.adresseLieu.ville || ''}`.trim();
        }
        // Priorité 3: adresse comme objet
        if (structure?.adresse && typeof structure.adresse === 'object') {
          return `${structure.adresse.codePostal || ''} ${structure.adresse.ville || ''}`.trim();
        }
        // Priorité 4: champs directs
        return `${structure?.codePostal || ''} ${structure?.ville || ''}`.trim();
      })(),
      siret_structure: structure?.siret || '',
      tva_structure: structure?.tva || structure?.numeroTVA || structure?.numeroIntracommunautaire || '',
      email_structure: structure?.email || '',
      telephone_structure: structure?.telephone || '',
      
      // Contact
      contact_nom: concert?.contactNom || '',
      contact_telephone: concert?.contactTelephone || '',
      contact_email: concert?.contactEmail || '',

      // Concert/Prestation
      titre_concert: concert?.nom || concert?.titre || '',
      date_concert: concert?.date ? formatDate(concert.date) : '',
      lieu_nom: concert?.lieuNom || '',
      lieu_ville: concert?.lieuVille || '',
      artiste_nom: concert?.artisteNom || '',
      description_prestation: `Prestation artistique - ${concert?.nom || concert?.titre || ''} le ${concert?.date ? formatDate(concert.date) : ''}`,
      mention_acompte: (() => {
        if (factureData.typeFacture === 'acompte') {
          return `Acompte de ${factureData.pourcentageAcompte}% sur un montant total de ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(factureData.montantTotal)} € HT`;
        } else if (factureData.typeFacture === 'solde') {
          return `Solde après acompte de ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(factureData.montantAcompte)} € HT`;
        }
        return '';
      })(),

      // Montants - Formatter sans le symbole € car il est déjà dans le template
      montant_concert: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montantConcert),
      montant_ht: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montantHTNum), // Toujours le montant total
      montant_ht_lettres: toWords(montantHTFinal), // Montant final à payer en lettres
      taux_tva: parameters.afficherTva ? tauxTVA : 0,
      montant_tva: parameters.afficherTva ? 
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montantTVA) : 
        '0,00',
      montant_ttc: parameters.afficherTva ? 
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montantTTC) : 
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montantHTFinal),
      montant_lettres: parameters.afficherTva ? toWords(Math.round(montantTTC)) : toWords(Math.round(montantHTFinal)),
      
      // Lignes supplémentaires
      lignes_supplementaires: lignesSupplementairesHTML,
      has_lignes_supplementaires: lignesAvecAcompte && lignesAvecAcompte.length > 0,

      // Paiement
      mode_paiement: 'Virement bancaire',
      delai_paiement: '30',
      
      // Mentions et paramètres personnalisés
      titre_facture: (() => {
        if (factureData.typeFacture === 'acompte') {
          return parameters.titreFacture ? `${parameters.titreFacture} D'ACOMPTE` : 'FACTURE D\'ACOMPTE';
        } else if (factureData.typeFacture === 'solde') {
          return parameters.titreFacture ? `${parameters.titreFacture} DE SOLDE` : 'FACTURE DE SOLDE';
        }
        return parameters.titreFacture || 'FACTURE';
      })(),
      mention_tva: parameters.mentionTva || (tauxTVA === 0 ? 'TVA non applicable, article 293B du CGI' : ''),
      conditions_paiement: parameters.conditionsPaiement || 'Paiement à 30 jours date de facture',
      penalites_retard: parameters.penalitesRetard || 'En cas de retard de paiement, des pénalités de retard sont exigibles (taux légal en vigueur).',
      escompte: parameters.escompte || 'Pas d\'escompte pour paiement anticipé',
      mentions_legales: parameters.afficherMentionsLegales ? (entreprise?.mentionsLegales || parameters.penalitesRetard) : '',
      
      // Options d'affichage
      show_logo: parameters.showLogo,
      show_tva: parameters.afficherTva,
      show_numero_tva: parameters.afficherNumeroTva,
      show_siret: parameters.afficherSiret,
      show_mentions_legales: parameters.afficherMentionsLegales,
      show_iban: parameters.afficherIban,
      show_bic: parameters.afficherBic,
      show_signature: parameters.afficherSignature,
      
      // Pied de page personnalisé
      show_pied_de_page: parameters.afficherPiedDePage,
      texte_pied_de_page: parameters.textePiedDePage || '',
      
      // Couleurs personnalisées
      couleur_primaire: parameters.couleurPrimaire || '#3b82f6',
      couleur_secondaire: parameters.couleurSecondaire || '#1f2937',

      // Tableau des lignes (pour facturation détaillée)
      TABLEAU_LIGNES: this.generateTableauLignes([{
        description: `Prestation artistique - ${concert?.nom || ''}`,
        quantite: 1,
        prixUnitaire: montantHTNum,
        total: montantHTNum
      }]),
      
      // Retourner aussi les montants calculés pour la sauvegarde
      montantTVA: montantTVA,
      montantTTC: montantTTC
    };

    return variables;
  }

  /**
   * Générer le tableau HTML des lignes de facture
   */
  generateTableauLignes(lignes) {
    let html = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Description</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">Quantité</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Prix unitaire HT</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Total HT</th>
          </tr>
        </thead>
        <tbody>
    `;

    lignes.forEach(ligne => {
      html += `
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">${ligne.description}</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">${ligne.quantite}</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatMontant(ligne.prixUnitaire)}</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatMontant(ligne.total)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Remplacer les variables dans le template
   */
  replaceVariables(template, variables) {
    let content = template;
    
    // Traiter les conditions Handlebars de manière récursive pour gérer les conditions imbriquées
    const processConditions = (text) => {
      let result = text;
      let hasChanges = true;
      
      // Répéter jusqu'à ce qu'il n'y ait plus de modifications (pour traiter les conditions imbriquées)
      while (hasChanges) {
        hasChanges = false;
        const before = result;
        
        // Traiter les conditions {{#if variable}} ... {{/if}}
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, innerContent) => {
          const value = variables[varName];
          if (value && value !== '' && value !== '0' && value !== false) {
            return innerContent;
          }
          return '';
        });
        
        hasChanges = (result !== before);
      }
      
      return result;
    };
    
    // Appliquer le traitement des conditions
    content = processConditions(content);
    
    // Remplacer les variables simples {{variable}}
    content = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || '';
    });
    
    // Pour la compatibilité, remplacer aussi les variables avec accolades simples {variable}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      content = content.replace(regex, variables[key] || '');
    });
    
    // Nettoyer les balises conditionnelles orphelines qui pourraient rester
    content = content.replace(/\{\{#if\s+\w+\}\}/g, '');
    content = content.replace(/\{\{\/if\}\}/g, '');
    
    // Gérer les sauts de page
    content = content.replace(/{SAUT_DE_PAGE}/g, '<div style="page-break-after: always;"></div>');
    
    return content;
  }

  /**
   * Créer une facture
   */
  async createFacture(factureData, organizationId, userId) {
    try {
      const facturesRef = collection(db, 'organizations', organizationId, this.collectionName);
      
      const newFacture = {
        ...factureData,
        createdAt: serverTimestamp(),
        createdBy: userId,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
        organizationId: organizationId
        // Le status est déjà inclus dans factureData
      };

      const docRef = await addDoc(facturesRef, newFacture);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une facture
   */
  async updateFacture(factureId, updates, organizationId, userId) {
    try {
      const factureRef = doc(db, 'organizations', organizationId, this.collectionName, factureId);
      
      await updateDoc(factureRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      throw error;
    }
  }

  /**
   * Récupérer une facture
   */
  async getFacture(factureId, organizationId) {
    try {
      const factureRef = doc(db, 'organizations', organizationId, this.collectionName, factureId);
      const factureDoc = await getDoc(factureRef);
      
      if (!factureDoc.exists()) {
        throw new Error('Facture introuvable');
      }
      
      return {
        id: factureDoc.id,
        ...factureDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture:', error);
      throw error;
    }
  }

  /**
   * Récupérer les templates de facture
   */
  async getFactureTemplates(organizationId) {
    try {
      const templatesRef = collection(db, 'organizations', organizationId, 'factureTemplates');
      const q = query(templatesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const templates = [];
      snapshot.forEach(doc => {
        templates.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return templates;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      throw error;
    }
  }

  /**
   * Récupérer le template par défaut ou le modèle système
   */
  async getDefaultTemplateOrSystem(organizationId) {
    try {
      // D'abord chercher un template utilisateur par défaut
      const templatesRef = collection(db, 'organizations', organizationId, 'factureTemplates');
      const q = query(templatesRef, where('isDefault', '==', true), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
      }
      
      // Si aucun template utilisateur, retourner le modèle système
      return this.getDefaultTemplate();
    } catch (error) {
      console.error('Erreur lors de la récupération du template par défaut:', error);
      // En cas d'erreur, retourner le modèle système
      return this.getDefaultTemplate();
    }
  }

  /**
   * Créer un template de facture
   */
  async createTemplate(templateData, organizationId, userId) {
    try {
      const templatesRef = collection(db, 'organizations', organizationId, 'factureTemplates');
      
      const newTemplate = {
        ...templateData,
        createdAt: serverTimestamp(),
        createdBy: userId,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
        organizationId: organizationId
      };

      const docRef = await addDoc(templatesRef, newTemplate);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw error;
    }
  }

  /**
   * Supprimer une facture
   */
  async deleteFacture(factureId, organizationId) {
    try {
      const factureRef = doc(db, 'organizations', organizationId, this.collectionName, factureId);
      await deleteDoc(factureRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      throw error;
    }
  }
}

// Export de l'instance unique
const factureService = new FactureService();
export default factureService;