import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Button, Form } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, updateDoc, serverTimestamp } from '@/services/firebase-service';
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
  const id = activeTab?.params?.contratId || activeTab?.params?.originalConcertId || urlId;
  
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
        console.log('[ContratRedactionPage] Chargement du contrat pour concert:', id);
        const contrat = await contratService.getContratByConcert(id);
        
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
              setCurrentModel(contrat.contratModeles[0]);
            }
          }
          
          // Un contrat est terminé pour la rédaction seulement s'il a du contenu rédigé
          // Utiliser le nouveau système de statuts: draft, generated, finalized
          if (contrat.status === 'generated' || contrat.status === 'finalized' || contrat.contratContenu) {
            console.log('[ContratRedactionPage] Contrat marqué comme rédigé - status:', contrat.status, 'hasContent:', !!contrat.contratContenu);
            setIsContractFinished(true);
          } else {
            console.log('[ContratRedactionPage] Contrat non rédigé - peut être édité');
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
  }, [id, isReadOnly]);

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
  }, [loading, hasSelectedModels, isContractFinished, isReadOnly, getActiveTab]);

  const handleModelsValidated = async (models) => {
    setSelectedModels(models);
    setHasSelectedModels(true);
    console.log('[ContratRedactionPage] Modèles sélectionnés:', models);
    
    // Sauvegarder immédiatement les modèles sélectionnés
    if (id && contratData) {
      try {
        console.log('[ContratRedactionPage] Sauvegarde des modèles sélectionnés');
        const dataToUpdate = {
          contratModeles: models.map(m => ({ id: m.id, nom: m.nom, type: m.type })),
          updatedAt: serverTimestamp()
        };
        
        await contratService.saveContrat(id, dataToUpdate, contratData.organizationId);
        console.log('[ContratRedactionPage] Modèles sauvegardés avec succès');
      } catch (error) {
        console.error('[ContratRedactionPage] Erreur lors de la sauvegarde des modèles:', error);
      }
    }
  };

  // Gestion de la sélection d'un modèle dans le dropdown
  const handleModelSelection = (model) => {
    setCurrentModel(model);
    // Simuler l'injection du contenu du modèle avec variables fusionnées
    const modelContent = `
      <h2>CONTRAT DE ${model.type.toUpperCase()}</h2>
      <p><strong>Référence:</strong> ${contractRef}</p>
      <p><strong>Entre les soussignés:</strong></p>
      <p>D'une part, [ORGANISATEUR] ci-après dénommé "l'Organisateur"</p>
      <p>Et d'autre part, [ARTISTE] ci-après dénommé "l'Artiste"</p>
      
      <h3>Article 1 - Objet du contrat</h3>
      <p>Le présent contrat a pour objet la prestation artistique de [ARTISTE] lors de l'événement [TITRE_EVENEMENT] qui se déroulera le [DATE_EVENEMENT] à [LIEU_EVENEMENT].</p>
      
      <h3>Article 2 - Conditions techniques</h3>
      <p>L'organisateur s'engage à mettre à disposition de l'artiste tous les moyens techniques nécessaires à la bonne réalisation de la prestation.</p>
      
      <h3>Article 3 - Rémunération</h3>
      <p>En contrepartie de cette prestation, l'organisateur versera à l'artiste la somme de [MONTANT] euros.</p>
      
      <p><em>Modèle: ${model.nom}</em></p>
    `;
    setEditorContent(modelContent);
  };

  // Gestion de l'enregistrement et affichage
  const handleSaveAndPreview = () => {
    setPreviewContent(editorContent);
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
        console.log('[ContratRedactionPage] Marquage du contrat comme rédigé pour concert ID:', id);
        
        // Préparer les données à sauvegarder
        const dataToUpdate = {
          contratContenu: editorContent,
          contratModeles: selectedModels.map(m => ({ id: m.id, nom: m.nom, type: m.type })),
          contratDateRedaction: serverTimestamp(),
          status: 'generated', // Un contrat avec du contenu est au minimum généré
          updatedAt: serverTimestamp()
        };

        // Sauvegarder dans la collection contrats
        await contratService.saveContrat(id, dataToUpdate, contratData?.organizationId);
        
        // Mettre à jour le statut dans le concert
        const concertRef = doc(db, 'concerts', id);
        await updateDoc(concertRef, {
          contratId: id, // Référence au contrat
          contratStatus: 'generated', // Statut synchronisé avec la collection contrats
          updatedAt: serverTimestamp()
        });
        
        console.log('[ContratRedactionPage] Contrat marqué comme rédigé avec succès');
        
        // Recharger les données
        const updatedContrat = await contratService.getContratByConcert(id);
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
    // L'ID dans l'URL est déjà l'ID du concert original
    const concertId = id;
    
    console.log('handleFormMode - id from URL:', id);
    console.log('handleFormMode - concertId à utiliser:', concertId);
    
    if (!concertId) {
      console.error('Impossible de retrouver l\'ID du concert');
      return;
    }
    
    // Ouvrir la page de génération de contrat dans un nouvel onglet
    if (openTab) {
      openTab({
        id: `contrat-generation-${concertId}`,
        title: `Contrat (formulaire)`,
        path: `/contrats/generate/${concertId}`,
        component: 'ContratGenerationNewPage',
        params: { concertId: concertId }
      });
    } else {
      // Fallback vers navigation classique
      navigate(`/contrats/generate/${concertId}`);
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
              disabled={isContractFinished}
              className="me-2"
            >
              <i className="bi bi-save me-2"></i>
              Enregistrer et afficher
            </Button>
            
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
                  <div 
                    className={styles.previewDocument}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
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