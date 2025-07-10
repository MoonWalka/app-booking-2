import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Button, Form } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, updateDoc, serverTimestamp, getDoc } from '@/services/firebase-service';
import contratService from '@/services/contratService';
import ContratModelsModal from '@/components/contrats/modals/ContratModelsModal';
import styles from './ContratRedactionPage.module.css';

/**
 * Page de rédaction du contrat
 */
const ContratRedactionPage = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const { updateTabTitle, openTab, getActiveTab } = useTabs();
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [hasSelectedModels, setHasSelectedModels] = useState(false);
  
  // Récupérer l'ID depuis les params de l'onglet ou l'URL
  const activeTab = getActiveTab && getActiveTab();
  const id = activeTab?.params?.contratId || activeTab?.params?.originalDateId || urlId;
  
  // Log pour debug
  console.log('[ContratRedactionPage] ID final utilisé:', id);
  console.log('[ContratRedactionPage] ID depuis URL:', urlId);
  console.log('[ContratRedactionPage] ID depuis params:', activeTab?.params);
  
  // États pour l'édition du contrat
  const [currentModel, setCurrentModel] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isContractFinished, setIsContractFinished] = useState(false);
  const [contractRef] = useState('1');
  const [contratData, setContratData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Vérifier si on est en mode lecture seule (activeTab déjà déclaré plus haut)
  const isReadOnly = activeTab?.params?.readOnly || false;
  
  console.log('[ContratRedactionPage] Mode lecture seule:', isReadOnly);

  // Mettre à jour le titre de l'onglet
  useEffect(() => {
    if (updateTabTitle) {
      updateTabTitle(`Rédaction contrat ${id || 'nouveau'}`);
    }
  }, [id, updateTabTitle]);

  // Charger les données du contrat depuis la collection contrats
  useEffect(() => {
    const loadContratData = async () => {
      console.log('[ContratRedactionPage] === DÉBUT CHARGEMENT CONTRAT ===');
      console.log('[ContratRedactionPage] Variables d\'état initiales:', {
        id,
        isReadOnly,
        loading,
        hasSelectedModels,
        isContractFinished,
        showModelModal
      });
      
      if (!id) {
        console.log('[ContratRedactionPage] Pas d\'ID fourni, arrêt du chargement');
        setLoading(false);
        return;
      }

      try {
        console.log('[ContratRedactionPage] Début chargement - ID:', id);
        console.log('[ContratRedactionPage] Chargement du contrat pour date:', id);
        const contrat = await contratService.getContratByDate(id);
        
        if (contrat) {
          console.log('[ContratRedactionPage] Contrat trouvé:', contrat);
          console.log('[ContratRedactionPage] Contenu du contrat:', contrat.contratContenu ? 'Présent' : 'Absent');
          console.log('[ContratRedactionPage] Modèles du contrat:', contrat.contratModeles);
          console.log('[ContratRedactionPage] Statut du contrat:', contrat.status, '/ contratStatut:', contrat.contratStatut);
          setContratData(contrat);
          
          // Si le contrat a déjà du contenu rédigé, le charger
          if (contrat.contratContenu) {
            setEditorContent(contrat.contratContenu);
            setPreviewContent(contrat.contratContenu);
          }
          
          // Si le contrat a des modèles sélectionnés, les charger
          if (contrat.contratModeles && contrat.contratModeles.length > 0) {
            setSelectedModels(contrat.contratModeles);
            setHasSelectedModels(true);
            // Sélectionner automatiquement le premier modèle
            if (contrat.contratModeles[0]) {
              const firstModel = contrat.contratModeles[0];
              setCurrentModel(firstModel);
              
              // Charger automatiquement le contenu du premier modèle
              if (firstModel.bodyContent && !contrat.contratContenu) {
                console.log('[ContratRedactionPage] Chargement automatique du contenu du premier modèle');
                setEditorContent(firstModel.bodyContent);
              }
            }
          }
          
          // Un contrat est terminé pour la rédaction seulement s'il a du contenu rédigé
          // Utiliser le nouveau système de statuts: draft, generated, finalized
          // Pour les anciens contrats migrés, permettre de re-générer l'aperçu
          if (contrat.status === 'finalized') {
            console.log('[ContratRedactionPage] Contrat finalisé - status:', contrat.status);
            setIsContractFinished(true);
          } else {
            console.log('[ContratRedactionPage] Contrat en cours - peut être édité');
            setIsContractFinished(false);
          }
          
          // Si on est en mode lecture seule et qu'il y a du contenu, l'afficher directement
          if (isReadOnly && contrat.contratContenu) {
            console.log('[ContratRedactionPage] Mode lecture seule avec contenu - Affichage direct de l\'aperçu');
            setPreviewContent(contrat.contratContenu);
          } else if (isReadOnly && !contrat.contratContenu) {
            console.log('[ContratRedactionPage] Mode lecture seule SANS contenu - Problème !');
          }
        }
      } catch (error) {
        console.error('[ContratRedactionPage] Erreur lors du chargement:', error);
      } finally {
        console.log('[ContratRedactionPage] === FIN DU CHARGEMENT ===');
        console.log('[ContratRedactionPage] États finaux après chargement:', {
          hasSelectedModels,
          isContractFinished,
          isReadOnly
        });
        setLoading(false);
      }
    };

    loadContratData();
  }, [id, isReadOnly, hasSelectedModels, isContractFinished, loading, showModelModal]);

  // Vérifier si des modèles ont été choisis et ouvrir la modale si nécessaire
  useEffect(() => {
    console.log('[ContratRedactionPage] === VÉRIFICATION MODALE ===');
    console.log('[ContratRedactionPage] useEffect modale - Conditions:', {
      loading,
      hasSelectedModels,
      isContractFinished,
      isReadOnly,
      showModelModal
    });
    console.log('[ContratRedactionPage] Condition complète:', 
      `!loading(${!loading}) && !hasSelectedModels(${!hasSelectedModels}) && !isContractFinished(${!isContractFinished}) && !isReadOnly(${!isReadOnly})`
    );
    console.log('[ContratRedactionPage] Devrait ouvrir la modale ?', 
      !loading && !hasSelectedModels && !isContractFinished && !isReadOnly
    );
    
    if (!loading && !hasSelectedModels && !isContractFinished && !isReadOnly) {
      // Vérifier si on vient du générateur de contrat
      const activeTab = getActiveTab && getActiveTab();
      const fromGenerator = activeTab?.params?.fromGenerator;
      
      console.log('[ContratRedactionPage] Vérification des modèles, fromGenerator:', fromGenerator);
      console.log('[ContratRedactionPage] ✅ OUVERTURE DE LA MODALE');
      
      // Ouvrir la modale seulement si on n'a pas de modèles sélectionnés et qu'on n'est pas en lecture seule
      setShowModelModal(true);
    } else {
      console.log('[ContratRedactionPage] ❌ PAS D\'OUVERTURE DE MODALE');
      if (loading) console.log('   -> Raison: Encore en chargement');
      if (hasSelectedModels) console.log('   -> Raison: Des modèles sont déjà sélectionnés');
      if (isContractFinished) console.log('   -> Raison: Le contrat est déjà terminé');
      if (isReadOnly) console.log('   -> Raison: Mode lecture seule');
    }
  }, [loading, hasSelectedModels, isContractFinished, isReadOnly, getActiveTab, showModelModal]);

  const handleModelsValidated = async (models) => {
    setSelectedModels(models);
    setHasSelectedModels(true);
    console.log('[ContratRedactionPage] Modèles sélectionnés:', models);
    
    // Sauvegarder immédiatement les modèles sélectionnés
    if (id && contratData) {
      try {
        console.log('[ContratRedactionPage] Sauvegarde des modèles sélectionnés');
        const dataToUpdate = {
          contratModeles: models.map(m => ({ 
            id: m.id, 
            nom: m.nom, 
            type: m.type,
            bodyContent: m.bodyContent 
          })),
          updatedAt: serverTimestamp()
        };
        
        await contratService.saveContrat(id, dataToUpdate, contratData.entrepriseId);
        console.log('[ContratRedactionPage] Modèles sauvegardés avec succès');
      } catch (error) {
        console.error('[ContratRedactionPage] Erreur lors de la sauvegarde des modèles:', error);
      }
    }
  };

  // Gestion de la sélection d'un modèle dans le dropdown
  const handleModelSelection = (model) => {
    console.log('[ContratRedactionPage] handleModelSelection appelé avec:', model);
    setCurrentModel(model);
    
    // Utiliser le vrai contenu du modèle s'il existe
    if (model.bodyContent) {
      console.log('[ContratRedactionPage] Définition du contenu du modèle, length:', model.bodyContent.length);
      setEditorContent(model.bodyContent);
    } else {
      // Fallback si pas de contenu (ne devrait plus arriver avec les modèles Firebase)
      console.warn('Le modèle n\'a pas de bodyContent:', model);
      const modelContent = `
        <h2>CONTRAT DE ${model.type?.toUpperCase() || 'TYPE'}</h2>
        <p><strong>Référence:</strong> ${contractRef}</p>
        <p><em>Ce modèle n'a pas de contenu. Veuillez le configurer dans Admin > Paramétrage > Modèles de contrat.</em></p>
      `;
      setEditorContent(modelContent);
    }
  };

  // Gestion de l'enregistrement et affichage
  const handleSaveAndPreview = async () => {
    console.log('[ContratRedactionPage] handleSaveAndPreview appelé');
    console.log('[ContratRedactionPage] editorContent actuel:', editorContent);
    console.log('[ContratRedactionPage] editorContent length:', editorContent?.length || 0);
    console.log('[ContratRedactionPage] contratData:', contratData);
    
    // Récupérer les variables de contrat depuis le contratData sauvegardé
    if (contratData) {
      try {
        // Charger les données manquantes depuis Firebase
        let dataForReplacement = { ...contratData };
        
        // Charger les données de la date si nécessaire
        if (contratData.dateId && !contratData.date) {
          console.log('[ContratRedactionPage] Chargement des données de la date...');
          const dateDoc = await getDoc(doc(db, 'dates', contratData.dateId));
          if (dateDoc.exists()) {
            dataForReplacement.date = { id: dateDoc.id, ...dateDoc.data() };
            console.log('[ContratRedactionPage] Données de la date chargées:', dataForReplacement.date);
          }
        }
        
        // Charger les données de l'artiste si nécessaire
        if (contratData.artisteId && !contratData.artiste) {
          console.log('[ContratRedactionPage] Chargement des données de l\'artiste...');
          const artisteDoc = await getDoc(doc(db, 'artistes', contratData.artisteId));
          if (artisteDoc.exists()) {
            dataForReplacement.artiste = { id: artisteDoc.id, ...artisteDoc.data() };
            console.log('[ContratRedactionPage] Données artiste chargées:', dataForReplacement.artiste);
          }
        }
        
        // Charger les données du lieu si nécessaire
        if (contratData.lieuId && !contratData.lieu) {
          console.log('[ContratRedactionPage] Chargement des données du lieu...');
          const lieuDoc = await getDoc(doc(db, 'lieux', contratData.lieuId));
          if (lieuDoc.exists()) {
            dataForReplacement.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
            console.log('[ContratRedactionPage] Données lieu chargées:', dataForReplacement.lieu);
          }
        } else if (dataForReplacement.date && dataForReplacement.date.lieuId && !dataForReplacement.lieu) {
          // Si le lieu n'est pas dans le contrat mais dans la date
          console.log('[ContratRedactionPage] Chargement du lieu depuis la date...');
          const lieuDoc = await getDoc(doc(db, 'lieux', dataForReplacement.date.lieuId));
          if (lieuDoc.exists()) {
            dataForReplacement.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
            console.log('[ContratRedactionPage] Données lieu chargées depuis la date:', dataForReplacement.lieu);
          }
        }
        
        console.log('[ContratRedactionPage] Données du contrat disponibles pour remplacement:', {
          hasOrganisateur: !!dataForReplacement.organisateur,
          hasProducteur: !!dataForReplacement.producteur,
          hasPrestations: !!dataForReplacement.prestations,
          hasRepresentations: !!dataForReplacement.representations,
          hasLogistique: !!dataForReplacement.logistique,
          hasReglement: !!dataForReplacement.reglement,
          hasDate: !!dataForReplacement.date,
          hasArtiste: !!dataForReplacement.artiste,
          hasLieu: !!dataForReplacement.lieu
        });
        
        // Remplacer les variables dans le contenu
        let processedContent = editorContent;
        
        // Log pour voir quelles variables sont présentes dans le contenu
        const variablesInContent = [];
        const variableRegex = /{([^}]+)}/g;
        let match;
        while ((match = variableRegex.exec(editorContent)) !== null) {
          variablesInContent.push(match[1]);
        }
        console.log('[ContratRedactionPage] Variables trouvées dans le contenu:', variablesInContent);
        
        // Variables Organisateur (partie A)
        if (dataForReplacement.organisateur) {
          processedContent = processedContent
            .replace(/{organisateur_raison_sociale}/g, dataForReplacement.organisateur.raisonSociale || '')
            .replace(/{organisateur_adresse}/g, dataForReplacement.organisateur.adresse || '')
            .replace(/{organisateur_code_postal}/g, dataForReplacement.organisateur.codePostal || '')
            .replace(/{organisateur_ville}/g, dataForReplacement.organisateur.ville || '')
            .replace(/{organisateur_siret}/g, dataForReplacement.organisateur.siret || '')
            .replace(/{organisateur_numero_tva}/g, dataForReplacement.organisateur.numeroTva || '')
            .replace(/{organisateur_code_ape}/g, dataForReplacement.organisateur.codeApe || '')
            .replace(/{organisateur_numero_licence}/g, dataForReplacement.organisateur.numeroLicence || '')
            .replace(/{organisateur_telephone}/g, dataForReplacement.organisateur.telephone || '')
            .replace(/{organisateur_email}/g, dataForReplacement.organisateur.email || '')
            .replace(/{organisateur_site}/g, dataForReplacement.organisateur.site || '')
            .replace(/{organisateur_signataire}/g, dataForReplacement.organisateur.signataire || '')
            .replace(/{organisateur_qualite}/g, dataForReplacement.organisateur.qualite || '');
        }
        
        // Variables Producteur (partie B)
        if (dataForReplacement.producteur) {
          processedContent = processedContent
            .replace(/{producteur_raison_sociale}/g, dataForReplacement.producteur.raisonSociale || '')
            .replace(/{producteur_adresse}/g, dataForReplacement.producteur.adresse || '')
            .replace(/{producteur_code_postal}/g, dataForReplacement.producteur.codePostal || '')
            .replace(/{producteur_ville}/g, dataForReplacement.producteur.ville || '')
            .replace(/{producteur_siret}/g, dataForReplacement.producteur.siret || '')
            .replace(/{producteur_numero_tva}/g, dataForReplacement.producteur.numeroTva || '')
            .replace(/{producteur_code_ape}/g, dataForReplacement.producteur.codeApe || '')
            .replace(/{producteur_numero_licence}/g, dataForReplacement.producteur.numeroLicence || '')
            .replace(/{producteur_telephone}/g, dataForReplacement.producteur.telephone || '')
            .replace(/{producteur_email}/g, dataForReplacement.producteur.email || '')
            .replace(/{producteur_site}/g, dataForReplacement.producteur.site || '')
            .replace(/{producteur_signataire}/g, dataForReplacement.producteur.signataire || '')
            .replace(/{producteur_qualite}/g, dataForReplacement.producteur.qualite || '');
        }
        
        // Variables Prestations
        if (dataForReplacement.prestations) {
          processedContent = processedContent
            .replace(/{spectacle_nom}/g, dataForReplacement.prestations.nomSpectacle || '')
            .replace(/{plateau_duree}/g, dataForReplacement.prestations.dureePlateau || '')
            .replace(/{plateau_contenu}/g, dataForReplacement.prestations.contenuPlateau || '')
            .replace(/{intervenants}/g, dataForReplacement.prestations.intervenants || '')
            .replace(/{conditions_techniques}/g, dataForReplacement.prestations.conditionsTechniques || '')
            .replace(/{technique_fournie}/g, dataForReplacement.prestations.techniqueFournie || '')
            .replace(/{technique_demandee}/g, dataForReplacement.prestations.techniqueDemandee || '')
            .replace(/{dispositions_particulieres}/g, dataForReplacement.prestations.dispositionsParticulieres || '');
        }
        
        // Variables Représentations
        if (dataForReplacement.representations) {
          processedContent = processedContent
            .replace(/{representation_debut}/g, dataForReplacement.representations.debut || '')
            .replace(/{representation_fin}/g, dataForReplacement.representations.fin || '')
            .replace(/{representation_detail}/g, dataForReplacement.representations.representation || '')
            .replace(/{nombre_invitations}/g, dataForReplacement.representations.nbAdmins || '0')
            .replace(/{salle}/g, dataForReplacement.representations.salle || '')
            .replace(/{horaire_debut}/g, dataForReplacement.representations.horaireDebut || '')
            .replace(/{horaire_fin}/g, dataForReplacement.representations.horaireFin || '')
            .replace(/{nombre_representations}/g, dataForReplacement.representations.nbRepresentations || '1');
        }
        
        // Variables Logistique
        if (dataForReplacement.logistique) {
          processedContent = processedContent
            .replace(/{restauration}/g, dataForReplacement.logistique.restauration || '')
            .replace(/{hebergement}/g, dataForReplacement.logistique.hebergement || '')
            .replace(/{transports}/g, dataForReplacement.logistique.transports || '')
            .replace(/{catering}/g, dataForReplacement.logistique.catering || '')
            .replace(/{loges}/g, dataForReplacement.logistique.loges || '')
            .replace(/{parking}/g, dataForReplacement.logistique.parking || '')
            .replace(/{autres_logistique}/g, dataForReplacement.logistique.autres || '');
        }
        
        // Variables Règlement
        if (dataForReplacement.reglement) {
          const montantHT = parseFloat(dataForReplacement.reglement.montantHT) || 0;
          const montantTVA = parseFloat(dataForReplacement.reglement.montantTVA) || 0;
          const totalTTC = parseFloat(dataForReplacement.reglement.totalTTC) || 0;
          
          processedContent = processedContent
            .replace(/{montant_ht}/g, montantHT.toFixed(2).replace('.', ',') + ' €')
            .replace(/{taux_tva}/g, dataForReplacement.reglement.tauxTVA + '%' || '0%')
            .replace(/{montant_tva}/g, montantTVA.toFixed(2).replace('.', ',') + ' €')
            .replace(/{total_ttc}/g, totalTTC.toFixed(2).replace('.', ',') + ' €')
            .replace(/{total_ttc_lettres}/g, montantEnLettres(totalTTC))
            .replace(/{mode_reglement}/g, dataForReplacement.reglement.modeReglement || '')
            .replace(/{delai_reglement}/g, dataForReplacement.reglement.delaiReglement || '');
        }
        
        // === MAPPING DES VARIABLES ANCIENNES VERS NOUVELLES ===
        // Si le template utilise les anciennes variables mais qu'on a les nouvelles données
        
        // Variables structure (depuis organisateur si disponible)
        if (dataForReplacement.organisateur) {
          processedContent = processedContent
            .replace(/{structure_nom}/g, contratData.organisateur.raisonSociale || '')
            .replace(/{structure_siret}/g, contratData.organisateur.siret || '')
            .replace(/{structure_adresse}/g, contratData.organisateur.adresse || '')
            .replace(/{structure_code_postal}/g, contratData.organisateur.codePostal || '')
            .replace(/{structure_ville}/g, contratData.organisateur.ville || '')
            .replace(/{programmateur_numero_intracommunautaire}/g, contratData.organisateur.numeroTva || '')
            .replace(/{programmateur_representant}/g, contratData.organisateur.signataire || '')
            .replace(/{programmateur_qualite_representant}/g, contratData.organisateur.qualite || '');
        }
        
        // Variables date
        if (contratData.dateId || contratData.date) {
          console.log('[ContratRedactionPage] Données date:', {
            dateId: contratData.dateId,
            date: contratData.date
          });
          
          // Si on a les données de la date directement
          if (contratData.date) {
            const dateDate = contratData.date.date ? 
              new Date(contratData.date.date.seconds ? contratData.date.date.seconds * 1000 : contratData.date.date).toLocaleDateString('fr-FR') : 
              '';
            
            console.log('[ContratRedactionPage] Date de la date formatée:', dateDate);
            
            processedContent = processedContent
              .replace(/{date_date}/g, dateDate)
              .replace(/{date_titre}/g, contratData.date.titre || '')
              .replace(/{date_heure}/g, contratData.date.heure || '');
          }
        } else {
          console.log('[ContratRedactionPage] Pas de données de date disponibles');
        }
        
        // Variables artiste - Récupérer les données depuis le contrat
        if (contratData.artisteId || contratData.artiste) {
          console.log('[ContratRedactionPage] Données artiste:', {
            artisteId: contratData.artisteId,
            artiste: contratData.artiste
          });
          
          // Si on a les données de l'artiste directement
          if (contratData.artiste) {
            processedContent = processedContent
              .replace(/{artiste_nom}/g, contratData.artiste.nom || '')
              .replace(/{artiste_genre}/g, contratData.artiste.genre || '');
          }
        } else {
          console.log('[ContratRedactionPage] Pas de données artiste disponibles');
        }
        
        // Variables lieu
        if (contratData.lieuId || contratData.lieu) {
          console.log('[ContratRedactionPage] Données lieu:', {
            lieuId: contratData.lieuId,
            lieu: contratData.lieu
          });
          
          // Si on a les données du lieu directement
          if (contratData.lieu) {
            processedContent = processedContent
              .replace(/{lieu_nom}/g, contratData.lieu.nom || '')
              .replace(/{lieu_adresse}/g, contratData.lieu.adresse || '')
              .replace(/{lieu_code_postal}/g, contratData.lieu.codePostal || '')
              .replace(/{lieu_ville}/g, contratData.lieu.ville || '');
          } else {
            // Remplacer par des valeurs vides si pas de lieu
            processedContent = processedContent
              .replace(/{lieu_nom}/g, '')
              .replace(/{lieu_adresse}/g, '')
              .replace(/{lieu_code_postal}/g, '')
              .replace(/{lieu_ville}/g, '');
          }
        } else {
          console.log('[ContratRedactionPage] Pas de données lieu disponibles');
          // Remplacer par des valeurs vides
          processedContent = processedContent
            .replace(/{lieu_nom}/g, '')
            .replace(/{lieu_adresse}/g, '')
            .replace(/{lieu_code_postal}/g, '')
            .replace(/{lieu_ville}/g, '');
        }
        
        // Variables de date
        const today = new Date();
        const dateJour = today.getDate().toString().padStart(2, '0');
        const dateMois = (today.getMonth() + 1).toString().padStart(2, '0');
        const dateAnnee = today.getFullYear().toString();
        const dateComplete = today.toLocaleDateString('fr-FR');
        
        console.log('[ContratRedactionPage] Variables de date:', {
          date_jour: dateJour,
          date_mois: dateMois,
          date_annee: dateAnnee,
          date_complete: dateComplete
        });
        
        processedContent = processedContent
          .replace(/{date_jour}/g, dateJour)
          .replace(/{date_mois}/g, dateMois)
          .replace(/{date_annee}/g, dateAnnee)
          .replace(/{date_complete}/g, dateComplete);
        
        // Variables montant (depuis date ou contrat)
        if (contratData.montantTTC || contratData.totalTTC) {
          const montant = contratData.montantTTC || contratData.totalTTC || 0;
          processedContent = processedContent
            .replace(/{date_montant}/g, montant.toFixed(2).replace('.', ',') + ' €')
            .replace(/{date_montant_lettres}/g, montantEnLettres(montant));
        }
        
        // Variables montant depuis règlement ou prestations
        console.log('[ContratRedactionPage] Recherche des montants...');
        console.log('[ContratRedactionPage] contratData.reglement:', contratData.reglement);
        console.log('[ContratRedactionPage] contratData.prestations:', contratData.prestations);
        console.log('[ContratRedactionPage] contratData.negociation:', contratData.negociation);
        
        let totalTTCTrouve = 0;
        
        if (contratData.reglement && dataForReplacement.reglement.totalTTC) {
          totalTTCTrouve = parseFloat(dataForReplacement.reglement.totalTTC) || 0;
          console.log('[ContratRedactionPage] Total TTC depuis reglement:', totalTTCTrouve);
        } else if (contratData.prestations && Array.isArray(contratData.prestations) && dataForReplacement.prestations.length > 0) {
          // Calculer depuis les prestations
          totalTTCTrouve = dataForReplacement.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTTC) || 0), 0);
          console.log('[ContratRedactionPage] Total TTC calculé depuis prestations:', totalTTCTrouve);
        } else if (contratData.negociation && contratData.negociation.montantTTC) {
          // Utiliser le montant de la négociation
          totalTTCTrouve = parseFloat(contratData.negociation.montantTTC) || 0;
          console.log('[ContratRedactionPage] Total TTC depuis negociation:', totalTTCTrouve);
        } else if (contratData.montantTTC) {
          // Utiliser le montant direct du contrat
          totalTTCTrouve = parseFloat(contratData.montantTTC) || 0;
          console.log('[ContratRedactionPage] Total TTC depuis contrat:', totalTTCTrouve);
        } else if (contratData.date && contratData.date.montant) {
          // Utiliser le montant de la date
          totalTTCTrouve = parseFloat(contratData.date.montant) || 0;
          console.log('[ContratRedactionPage] Total TTC depuis date:', totalTTCTrouve);
        }
        
        if (totalTTCTrouve > 0) {
          processedContent = processedContent
            .replace(/{total_ttc}/g, totalTTCTrouve.toFixed(2).replace('.', ',') + ' €')
            .replace(/{total_ttc_lettres}/g, montantEnLettres(totalTTCTrouve))
            // Aussi remplacer date_montant si présent
            .replace(/{date_montant}/g, totalTTCTrouve.toFixed(2).replace('.', ',') + ' €')
            .replace(/{date_montant_lettres}/g, montantEnLettres(totalTTCTrouve));
        } else {
          console.log('[ContratRedactionPage] Aucun montant trouvé - Remplacer par 0');
          // Remplacer par 0 si aucun montant trouvé
          processedContent = processedContent
            .replace(/{total_ttc}/g, '0,00 €')
            .replace(/{total_ttc_lettres}/g, 'zéro euro')
            .replace(/{date_montant}/g, '0,00 €')
            .replace(/{date_montant_lettres}/g, 'zéro euro');
        }
        
        // Gérer les sauts de page
        processedContent = processedContent
          .replace(/{SAUT_DE_PAGE}/g, '<div style="page-break-after: always;"></div>');
        
        // Sauvegarder le contenu avec les variables remplacées
        const dataToUpdate = {
          contratContenu: processedContent,
          updatedAt: serverTimestamp()
        };
        
        await contratService.saveContrat(id, dataToUpdate, contratData?.entrepriseId);
        
        // Vérifier quelles variables n'ont pas été remplacées
        const variablesNonRemplacees = [];
        const variableRegexFinal = /{([^}]+)}/g;
        let matchFinal;
        while ((matchFinal = variableRegexFinal.exec(processedContent)) !== null) {
          variablesNonRemplacees.push(matchFinal[1]);
        }
        
        if (variablesNonRemplacees.length > 0) {
          console.log('[ContratRedactionPage] ⚠️ Variables NON remplacées:', variablesNonRemplacees);
        } else {
          console.log('[ContratRedactionPage] ✅ Toutes les variables ont été remplacées');
        }
        
        setPreviewContent(processedContent);
        console.log('[ContratRedactionPage] Variables remplacées et preview défini');
      } catch (error) {
        console.error('[ContratRedactionPage] Erreur lors du remplacement des variables:', error);
        // En cas d'erreur, afficher quand même le contenu non traité
        setPreviewContent(editorContent);
      }
    } else {
      // Si pas de contratData, afficher le contenu tel quel
      setPreviewContent(editorContent);
    }
  };
  
  // Fonction pour convertir un montant en lettres
  const montantEnLettres = (montant) => {
    if (!montant || isNaN(montant)) return 'zéro euro';
    
    const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const exceptions = {
      10: 'dix', 11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze',
      15: 'quinze', 16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf',
      71: 'soixante-et-onze', 91: 'quatre-vingt-onze'
    };
    
    const convertirNombreEnLettres = (nombre) => {
      if (nombre === 0) return 'zéro';
      if (nombre < 0) return 'moins ' + convertirNombreEnLettres(-nombre);
      
      if (nombre < 10) return unites[nombre];
      if (exceptions[nombre]) return exceptions[nombre];
      if (nombre < 20) return 'dix-' + unites[nombre - 10];
      if (nombre < 100) {
        const dizaine = Math.floor(nombre / 10);
        const unite = nombre % 10;
        if (unite === 0) return dizaines[dizaine];
        if (unite === 1 && (dizaine === 2 || dizaine === 3 || dizaine === 4 || dizaine === 5 || dizaine === 6)) {
          return dizaines[dizaine] + '-et-un';
        }
        return dizaines[dizaine] + '-' + unites[unite];
      }
      if (nombre < 1000) {
        const centaine = Math.floor(nombre / 100);
        const reste = nombre % 100;
        let resultat = '';
        if (centaine === 1) {
          resultat = 'cent';
        } else {
          resultat = unites[centaine] + ' cent';
          if (reste === 0) resultat += 's';
        }
        if (reste > 0) resultat += ' ' + convertirNombreEnLettres(reste);
        return resultat;
      }
      if (nombre < 1000000) {
        const milliers = Math.floor(nombre / 1000);
        const reste = nombre % 1000;
        let resultat = '';
        if (milliers === 1) {
          resultat = 'mille';
        } else {
          resultat = convertirNombreEnLettres(milliers) + ' mille';
        }
        if (reste > 0) resultat += ' ' + convertirNombreEnLettres(reste);
        return resultat;
      }
      
      return nombre.toString();
    };
    
    const partieEntiere = Math.floor(montant);
    const partieDecimale = Math.round((montant - partieEntiere) * 100);
    
    let resultat = convertirNombreEnLettres(partieEntiere) + ' euro';
    if (partieEntiere > 1) resultat += 's';
    
    if (partieDecimale > 0) {
      resultat += ' et ' + convertirNombreEnLettres(partieDecimale) + ' centime';
      if (partieDecimale > 1) resultat += 's';
    }
    
    return resultat.charAt(0).toUpperCase() + resultat.slice(1);
  };

  // Gestion du changement de modèle
  const handleChangeModel = () => {
    setShowModelModal(true);
  };

  // Terminer le contrat
  const handleFinishContract = async () => {
    try {
      setIsContractFinished(true);
      setPreviewContent(editorContent);
      
      // Marquer le contrat comme rédigé dans la base de données
      if (id) {
        console.log('[ContratRedactionPage] Marquage du contrat comme rédigé pour date ID:', id);
        
        // Préparer les données à sauvegarder
        const dataToUpdate = {
          contratContenu: editorContent,
          contratModeles: selectedModels.map(m => ({ id: m.id, nom: m.nom, type: m.type })),
          contratDateRedaction: serverTimestamp(),
          status: 'generated', // Un contrat avec du contenu est au minimum généré
          updatedAt: serverTimestamp()
        };

        // Sauvegarder dans la collection contrats
        await contratService.saveContrat(id, dataToUpdate, contratData?.entrepriseId);
        
        // Mettre à jour le statut dans la date
        const dateRef = doc(db, 'dates', id);
        await updateDoc(dateRef, {
          contratId: id, // Référence au contrat
          contratStatus: 'generated', // Statut synchronisé avec la collection contrats
          updatedAt: serverTimestamp()
        });
        
        console.log('[ContratRedactionPage] Contrat marqué comme rédigé avec succès');
        
        // Recharger les données
        const updatedContrat = await contratService.getContratByDate(id);
        if (updatedContrat) {
          setContratData(updatedContrat);
        }
      }
    } catch (error) {
      console.error('[ContratRedactionPage] Erreur lors de la sauvegarde du statut du contrat:', error);
    }
  };

  // Basculer vers le mode formulaire (page de génération de contrat)
  const handleFormMode = () => {
    // L'ID dans l'URL est déjà l'ID du date original
    const dateId = id;
    
    console.log('handleFormMode - id from URL:', id);
    console.log('handleFormMode - dateId à utiliser:', dateId);
    
    if (!dateId) {
      console.error('Impossible de retrouver l\'ID de la date');
      return;
    }
    
    // Ouvrir la page de génération de contrat dans un nouvel onglet
    if (openTab) {
      openTab({
        id: `contrat-generation-${dateId}`,
        title: `Contrat (formulaire)`,
        path: `/contrats/generate/${dateId}`,
        component: 'ContratGenerationNewPage',
        params: { dateId: dateId }
      });
    } else {
      // Fallback vers navigation classique
      navigate(`/contrats/generate/${dateId}`);
    }
  };
  
  // Regénérer l'aperçu avec les nouvelles variables
  const handleRegenerateWithVariables = async () => {
    console.log('[ContratRedactionPage] Regénération avec les nouvelles variables');
    
    // Recharger les données du contrat pour avoir les dernières valeurs
    if (id) {
      try {
        const freshContrat = await contratService.getContratByDate(id);
        if (freshContrat) {
          console.log('[ContratRedactionPage] Contrat rechargé:', freshContrat);
          
          // Charger les données complètes depuis Firebase si nécessaire
          const updatedContrat = { ...freshContrat };
          
          // Charger les données de la date
          if (freshContrat.dateId && !freshContrat.date) {
            console.log('[ContratRedactionPage] Chargement des données de la date...');
            const dateDoc = await getDoc(doc(db, 'dates', freshContrat.dateId));
            if (dateDoc.exists()) {
              updatedContrat.date = { id: dateDoc.id, ...dateDoc.data() };
              console.log('[ContratRedactionPage] Données de la date chargées:', updatedContrat.date);
            }
          }
          
          // Charger les données de l'artiste
          if (freshContrat.artisteId && !freshContrat.artiste) {
            console.log('[ContratRedactionPage] Chargement des données de l\'artiste...');
            const artisteDoc = await getDoc(doc(db, 'artistes', freshContrat.artisteId));
            if (artisteDoc.exists()) {
              updatedContrat.artiste = { id: artisteDoc.id, ...artisteDoc.data() };
              console.log('[ContratRedactionPage] Données artiste chargées:', updatedContrat.artiste);
            }
          }
          
          // Charger les données du lieu
          if (freshContrat.lieuId && !freshContrat.lieu) {
            console.log('[ContratRedactionPage] Chargement des données du lieu...');
            const lieuDoc = await getDoc(doc(db, 'lieux', freshContrat.lieuId));
            if (lieuDoc.exists()) {
              updatedContrat.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
              console.log('[ContratRedactionPage] Données lieu chargées:', updatedContrat.lieu);
            }
          } else if (updatedContrat.date && updatedContrat.date.lieuId) {
            // Si le lieu n'est pas dans le contrat mais dans la date
            console.log('[ContratRedactionPage] Chargement du lieu depuis la date...');
            const lieuDoc = await getDoc(doc(db, 'lieux', updatedContrat.date.lieuId));
            if (lieuDoc.exists()) {
              updatedContrat.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
              console.log('[ContratRedactionPage] Données lieu chargées depuis la date:', updatedContrat.lieu);
            }
          }
          
          setContratData(updatedContrat);
          
          // Si le contrat a du contenu, le recharger dans l'éditeur
          if (freshContrat.contratContenu) {
            setEditorContent(freshContrat.contratContenu);
          } else if (freshContrat.contratModeles && freshContrat.contratModeles[0] && freshContrat.contratModeles[0].bodyContent) {
            // Sinon utiliser le contenu du modèle
            setEditorContent(freshContrat.contratModeles[0].bodyContent);
          }
          
          // Attendre un peu pour que les states se mettent à jour
          setTimeout(() => {
            handleSaveAndPreview();
          }, 100);
        }
      } catch (error) {
        console.error('[ContratRedactionPage] Erreur lors du rechargement:', error);
      }
    }
  };

  console.log('[ContratRedactionPage] === DÉBUT DU RENDU ===');
  console.log('[ContratRedactionPage] États actuels:', {
    loading,
    hasSelectedModels,
    isContractFinished,
    isReadOnly,
    showModelModal,
    previewContent: !!previewContent,
    editorContent: !!editorContent
  });

  // Afficher un indicateur de chargement
  if (loading) {
    console.log('[ContratRedactionPage] Rendu: Affichage du spinner de chargement');
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement du contrat...</p>
        </div>
      </Container>
    );
  }

  // En mode lecture seule, afficher directement l'aperçu
  console.log('[ContratRedactionPage] Conditions de rendu - isReadOnly:', isReadOnly, 'previewContent:', !!previewContent);
  
  // Si on est en mode lecture seule mais qu'il n'y a pas de contenu, rediriger vers le formulaire
  if (isReadOnly && !previewContent && !loading) {
    console.log('[ContratRedactionPage] Mode lecture seule sans contenu - Redirection vers le formulaire');
    return (
      <Container fluid className="p-4">
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          Ce contrat n'a pas encore été rédigé. Redirection vers le formulaire...
        </Alert>
        {setTimeout(() => {
          handleFormMode();
        }, 1500)}
      </Container>
    );
  }
  
  if (isReadOnly && previewContent) {
    console.log('[ContratRedactionPage] Affichage de l\'aperçu en mode lecture seule');
    return (
      <Container fluid className="p-4">
        <div className={styles.editorLayout}>
          {/* Bandeau d'actions simplifié pour le mode lecture seule */}
          <div className={styles.actionBar}>
            <h5 className="mb-0 me-auto">
              <i className="bi bi-file-earmark-check-fill me-2"></i>
              Aperçu du contrat
            </h5>
            <Button
              variant="outline-secondary"
              onClick={handleFormMode}
              className="me-2"
            >
              <i className="bi bi-pencil me-2"></i>
              Modifier
            </Button>
            <Button
              variant="primary"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-2"></i>
              Imprimer
            </Button>
          </div>

          {/* Aperçu direct du contrat */}
          <div className={styles.previewContainer}>
            <div 
              className={styles.contractContent}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </div>
      </Container>
    );
  }

  console.log('[ContratRedactionPage] Rendu final - hasSelectedModels:', hasSelectedModels, 'showModelModal:', showModelModal);
  
  return (
    <Container fluid className="p-4">
      {/* Contenu principal - masqué si la modale est ouverte */}
      {hasSelectedModels ? (
        <div className={styles.editorLayout}>
          {/* 1. Bandeau d'actions fixe */}
          <div className={styles.actionBar}>
            <Button
              variant="outline-primary"
              onClick={handleChangeModel}
              disabled={isContractFinished}
              className="me-2"
            >
              <i className="bi bi-arrow-repeat me-2"></i>
              Changer le modèle de contrat
            </Button>
            
            <Button
              variant="outline-secondary"
              onClick={handleFormMode}
              disabled={isContractFinished}
              className="me-2"
            >
              <i className="bi bi-ui-checks me-2"></i>
              Mode formulaire
            </Button>
            
            <Button
              variant="success"
              onClick={handleSaveAndPreview}
              className="me-2"
            >
              <i className="bi bi-save me-2"></i>
              Enregistrer et afficher
            </Button>
            
            {/* Bouton pour regénérer avec les nouvelles variables si contrat existant */}
            {contratData && (contratData.organisateur || contratData.producteur) && (
              <Button
                variant="info"
                onClick={handleRegenerateWithVariables}
                className="me-2"
                title="Regénérer l'aperçu avec les nouvelles variables du formulaire"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Actualiser variables
              </Button>
            )}
            
            <Button
              variant="warning"
              onClick={handleFinishContract}
              disabled={isContractFinished}
            >
              <i className="bi bi-check-circle me-2"></i>
              {isContractFinished ? "Contrat terminé" : "Terminer le contrat"}
            </Button>
          </div>

          {/* 2. Contenu principal avec colonnes */}
          <div className={styles.editorContent}>
            {/* Colonne gauche - Zone d'édition (70%) */}
            <div className={styles.editorZone}>
              {/* Sélecteur de modèle */}
              <div className={styles.modelSelector}>
                <Form.Label>Modèle de contrat</Form.Label>
                <Form.Select
                  value={currentModel?.id || ''}
                  onChange={(e) => {
                    const model = selectedModels.find(m => m.id === parseInt(e.target.value));
                    if (model) handleModelSelection(model);
                  }}
                  disabled={isContractFinished}
                >
                  <option value="">Choisissez un modèle...</option>
                  {selectedModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.nom} ({model.type})
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Bandeau info si aucun modèle sélectionné */}
              {!currentModel && (
                <Alert variant="info" className={styles.infoAlert}>
                  <i className="bi bi-info-circle me-2"></i>
                  Contrat non rédigé, veuillez sélectionner un type
                </Alert>
              )}

              {/* Éditeur WYSIWYG */}
              {currentModel && (
                <div className={styles.editor}>
                  <div className={styles.editorHeader}>
                    <div className={styles.editorToolbar}>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-type-bold"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-type-italic"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-type-underline"></i>
                      </Button>
                      <div className={styles.separator}></div>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-list-ul"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-list-ol"></i>
                      </Button>
                      <div className={styles.separator}></div>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-text-left"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-text-center"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" disabled={isContractFinished}>
                        <i className="bi bi-text-right"></i>
                      </Button>
                    </div>
                    
                    <div className={styles.contractRef}>
                      <Form.Label className="small text-muted me-2">Réf.:</Form.Label>
                      <Form.Control
                        type="text"
                        value={contractRef}
                        size="sm"
                        style={{ width: '60px' }}
                        readOnly
                      />
                    </div>
                  </div>

                  <div 
                    className={styles.editorTextarea}
                    contentEditable={!isContractFinished}
                    dangerouslySetInnerHTML={{ __html: editorContent }}
                    onInput={(e) => setEditorContent(e.target.innerHTML)}
                  />
                </div>
              )}
            </div>

            {/* Colonne droite - Aperçu (30%) */}
            <div className={styles.previewZone}>
              <div className={styles.previewHeader}>
                <h6 className="mb-0">
                  <i className="bi bi-eye me-2"></i>
                  Aperçu
                </h6>
              </div>
              
              <div className={styles.previewContent}>
                {!currentModel ? (
                  <div className={styles.previewEmpty}>
                    <i className="bi bi-file-text fs-1 text-muted mb-3 d-block"></i>
                    <p className="text-muted mb-2">
                      Choisissez le modèle de contrat pour afficher l'aperçu
                    </p>
                    <small className="text-muted">
                      Cliquez sur "Enregistrer et afficher" pour mettre à jour l'aperçu
                    </small>
                  </div>
                ) : !previewContent ? (
                  <div className={styles.previewEmpty}>
                    <i className="bi bi-arrow-up-circle fs-1 text-muted mb-3 d-block"></i>
                    <p className="text-muted">
                      Cliquez sur "Enregistrer et afficher" pour voir l'aperçu
                    </p>
                  </div>
                ) : (
                  <div className={`${styles.previewDocument} ${styles.a4Preview}`} dangerouslySetInnerHTML={{ __html: previewContent }} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Row>
          <Col>
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-muted">Préparation de l'espace de rédaction...</p>
            </div>
          </Col>
        </Row>
      )}

      {/* Modale de sélection des modèles */}
      {console.log('[ContratRedactionPage] Rendu modale - show:', showModelModal, 'required:', !hasSelectedModels)}
      <ContratModelsModal
        show={showModelModal}
        onHide={() => {
          console.log('[ContratRedactionPage] Modale fermée par l\'utilisateur');
          setShowModelModal(false);
        }}
        onValidate={handleModelsValidated}
        selectedModels={selectedModels}
        required={!hasSelectedModels}
      />
    </Container>
  );
};

export default ContratRedactionPage;