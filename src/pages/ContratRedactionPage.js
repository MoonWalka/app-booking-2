import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Button, Form } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, updateDoc, serverTimestamp } from '@/services/firebase-service';
import ContratModelsModal from '@/components/contrats/modals/ContratModelsModal';
import styles from './ContratRedactionPage.module.css';

/**
 * Page de rédaction du contrat
 */
const ContratRedactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateTabTitle, openTab } = useTabs();
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [hasSelectedModels, setHasSelectedModels] = useState(false);
  
  // États pour l'édition du contrat
  const [currentModel, setCurrentModel] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isContractFinished, setIsContractFinished] = useState(false);
  const [contractRef] = useState('1');

  // Mettre à jour le titre de l'onglet
  useEffect(() => {
    if (updateTabTitle) {
      updateTabTitle(`Rédaction contrat ${id || 'nouveau'}`);
    }
  }, [id, updateTabTitle]);

  // Vérifier si des modèles ont été choisis et ouvrir la modale si nécessaire
  useEffect(() => {
    // Simulation : vérifier si le projet a déjà des modèles associés
    // En réalité, il faudrait charger cette info depuis l'API
    const checkProjectModels = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const projectHasModels = false; // À remplacer par un appel API
      
      if (!projectHasModels) {
        setShowModelModal(true);
      } else {
        setHasSelectedModels(true);
      }
    };
    
    checkProjectModels();
  }, [id]);

  const handleModelsValidated = (models) => {
    setSelectedModels(models);
    setHasSelectedModels(true);
    // Ici on sauvegarderait les modèles sélectionnés en base
    console.log('Modèles sélectionnés:', models);
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
        console.log('Marquage du contrat comme rédigé pour concert ID:', id);
        
        // Mettre à jour le document du concert avec le statut contrat rédigé
        const concertRef = doc(db, 'concerts', id);
        await updateDoc(concertRef, {
          contratStatut: 'redige',
          contratDateRedaction: serverTimestamp(),
          contratContenu: editorContent,
          contratModeles: selectedModels.map(m => ({ id: m.id, nom: m.nom, type: m.type }))
        });
        
        console.log('Contrat marqué comme rédigé avec succès');
        
        // Optionnel : afficher une notification de succès
        // Vous pouvez ajouter un toast ou une alerte ici
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut du contrat:', error);
      // Optionnel : afficher une notification d'erreur
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
      <ContratModelsModal
        show={showModelModal}
        onHide={() => setShowModelModal(false)}
        onValidate={handleModelsValidated}
        selectedModels={selectedModels}
        required={!hasSelectedModels}
      />
    </Container>
  );
};

export default ContratRedactionPage;