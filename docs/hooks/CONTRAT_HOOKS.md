# Hooks pour la gestion des contrats

## Introduction

Les hooks de gestion des contrats de TourCraft permettent de manipuler les contrats, leur cycle de vie, leur génération et leur validation. Ces hooks servent d'interface entre les composants liés aux contrats et les services de stockage et de génération de documents.

## useContratGenerator

**But :** Gérer la génération de contrats à partir de templates

**Paramètres :**
- `concert: object` - L'objet concert
- `programmateur: object` - L'objet programmateur
- `artiste: object` - L'objet artiste
- `lieu: object` - L'objet lieu

**Dépendances :**
- Firebase (db et diverses fonctions Firestore)
- React (useState, useEffect)
- Services PDF (génération, sauvegarde)

**Fonctionnalités principales :**
- Chargement des templates de contrat
- Préparation des variables pour injection dans les templates
- Génération de PDF
- Sauvegarde des contrats générés
- Gestion des erreurs

**Retourne :**
```javascript
{
  templates,                    // Liste des templates disponibles
  selectedTemplateId,           // ID du template sélectionné
  selectedTemplate,             // Objet du template sélectionné
  loading,                      // État de chargement
  generatingPdf,                // Si un PDF est en cours de génération
  pdfUrl,                       // URL du PDF généré
  entrepriseInfo,               // Infos de l'entreprise pour le contrat
  contratId,                    // ID du contrat généré
  errorMessage,                 // Message d'erreur éventuel
  showErrorAlert,               // Afficher l'alerte d'erreur
  showSuccessAlert,             // Afficher l'alerte de succès
  showDebugInfo,                // Afficher les infos de debug
  validateDataBeforeGeneration, // Fonction de validation des données
  handleTemplateChange,         // Fonction de changement de template
  prepareContractVariables,     // Préparation des variables pour le template
  saveGeneratedContract,        // Sauvegarde du contrat généré
  toggleDebugInfo,              // Afficher/masquer les infos de debug
  resetAlerts,                  // Réinitialiser les alertes
  showSuccess,                  // Afficher un message de succès
  setPdfUrl                     // Définir l'URL du PDF
}
```

**Exemple d'utilisation :**

```jsx
import { useContratGenerator } from '../hooks/contrats/useContratGenerator';

function ContratGeneratorComponent({ concert, artiste, programmateur, lieu }) {
  const {
    templates,
    selectedTemplateId,
    loading,
    generatingPdf,
    pdfUrl,
    handleTemplateChange,
    validateDataBeforeGeneration,
    saveGeneratedContract
  } = useContratGenerator(concert, programmateur, artiste, lieu);

  const handleGenerate = async () => {
    if (validateDataBeforeGeneration()) {
      await saveGeneratedContract();
    }
  };

  return (
    <div className="contrat-generator">
      <h2>Générateur de contrat</h2>
      
      {loading ? (
        <LoadingSpinner message="Chargement des templates..." />
      ) : (
        <>
          <Select
            label="Template de contrat"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            options={templates.map(t => ({ value: t.id, label: t.nom }))}
          />
          
          <Button
            onClick={handleGenerate}
            loading={generatingPdf}
            disabled={!selectedTemplateId || generatingPdf}
          >
            Générer le contrat
          </Button>
          
          {pdfUrl && (
            <div className="pdf-preview">
              <PDFPreview url={pdfUrl} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## useContratTemplateEditor

**But :** Édition des templates de contrat

**Paramètres :**
- `id: string` - ID du template à éditer (optionnel, si absent -> nouveau template)

**Dépendances :**
- Firebase (Firestore)
- React (useState, useEffect, useCallback)
- Utils (validation, formatage)

**Fonctionnalités principales :**
- Chargement et sauvegarde des templates
- Édition interactive des différentes sections
- Prévisualisation des modifications
- Ajout et suppression de sections
- Gestion des variables disponibles

**Retourne :**
```javascript
{
  template,                 // Données du template
  loading,                  // État de chargement
  saving,                   // État de sauvegarde
  error,                    // Erreur éventuelle
  previewData,              // Données pour la prévisualisation
  selectedSection,          // Section actuellement sélectionnée
  handleSectionChange,      // Fonction de changement de section
  handleSectionContent,     // Fonction de modification du contenu d'une section
  handleTemplateNameChange, // Fonction de modification du nom du template
  handleAddSection,         // Fonction d'ajout de section
  handleRemoveSection,      // Fonction de suppression de section
  handleMoveSectionUp,      // Fonction de déplacement de section vers le haut
  handleMoveSectionDown,    // Fonction de déplacement de section vers le bas
  saveTemplate,             // Fonction de sauvegarde du template
  resetError,               // Fonction de réinitialisation de l'erreur
  validateTemplate,         // Fonction de validation du template
  availableVariables        // Variables disponibles pour le template
}
```

**Exemple d'utilisation :**

```jsx
import { useContratTemplateEditor } from '../hooks/contrats/useContratTemplateEditor';

function TemplateEditorPage({ templateId }) {
  const {
    template,
    loading,
    saving,
    error,
    previewData,
    selectedSection,
    handleSectionChange,
    handleSectionContent,
    handleTemplateNameChange,
    handleAddSection,
    handleRemoveSection,
    saveTemplate,
    availableVariables
  } = useContratTemplateEditor(templateId);

  if (loading) {
    return <LoadingSpinner message="Chargement du template..." />;
  }

  return (
    <div className="template-editor">
      <h1>Éditeur de template</h1>
      
      <TextField
        label="Nom du template"
        value={template.nom}
        onChange={(e) => handleTemplateNameChange(e.target.value)}
        fullWidth
      />
      
      <div className="template-editor-layout">
        <div className="sections-panel">
          <h2>Sections</h2>
          
          <ul className="sections-list">
            {template.sections.map((section, index) => (
              <li 
                key={index}
                className={selectedSection === index ? 'active' : ''}
                onClick={() => handleSectionChange(index)}
              >
                {section.titre || `Section ${index + 1}`}
              </li>
            ))}
          </ul>
          
          <Button
            onClick={handleAddSection}
            startIcon={<PlusIcon />}
          >
            Ajouter une section
          </Button>
        </div>
        
        <div className="content-editor">
          {selectedSection !== null && (
            <>
              <TextField
                label="Titre de la section"
                value={template.sections[selectedSection].titre}
                onChange={(e) => handleSectionContent(selectedSection, 'titre', e.target.value)}
                fullWidth
              />
              
              <RichTextEditor
                value={template.sections[selectedSection].contenu}
                onChange={(content) => handleSectionContent(selectedSection, 'contenu', content)}
                availableVariables={availableVariables}
              />
              
              <div className="section-actions">
                <Button
                  onClick={() => handleMoveSectionUp(selectedSection)}
                  disabled={selectedSection === 0}
                  variant="text"
                >
                  Monter
                </Button>
                <Button
                  onClick={() => handleMoveSectionDown(selectedSection)}
                  disabled={selectedSection === template.sections.length - 1}
                  variant="text"
                >
                  Descendre
                </Button>
                <Button
                  onClick={() => handleRemoveSection(selectedSection)}
                  variant="danger"
                >
                  Supprimer la section
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="preview-panel">
          <h2>Aperçu</h2>
          <ContratPreview template={template} previewData={previewData} />
        </div>
      </div>
      
      <div className="template-actions">
        <Button
          onClick={saveTemplate}
          loading={saving}
          variant="primary"
        >
          Enregistrer le template
        </Button>
      </div>
      
      {error && (
        <AlertMessage type="error" message={error} />
      )}
    </div>
  );
}
```

## usePdfPreview

**But :** Générer et afficher des prévisualisations de documents PDF

**Paramètres :**
- `htmlContent: string` - Contenu HTML à convertir en PDF (optionnel)
- `pdfUrl: string` - URL du PDF à afficher (optionnel)
- `options: object` - Options de mise en page et de style

**Dépendances :**
- React (useState, useEffect, useRef)
- Services PDF
- @react-pdf/renderer et react-pdf

**Fonctionnalités principales :**
- Conversion HTML vers PDF
- Prévisualisation de PDF
- Navigation dans les pages
- Zoom et rotation
- Téléchargement de PDF

**Retourne :**
```javascript
{
  loading,              // État de chargement
  error,                // Erreur éventuelle
  numPages,             // Nombre total de pages
  currentPage,          // Page actuelle
  scale,                // Échelle de zoom actuelle
  rotation,             // Rotation actuelle
  pdfDocument,          // Document PDF
  containerRef,         // Référence au conteneur
  handlePreviousPage,   // Aller à la page précédente
  handleNextPage,       // Aller à la page suivante
  handleZoomIn,         // Zoomer
  handleZoomOut,        // Dézoomer
  handleRotate,         // Rotation
  handleDownload,       // Télécharger le PDF
  resetView             // Réinitialiser la vue
}
```

**Exemple d'utilisation :**

```jsx
import { usePdfPreview } from '../hooks/contrats/usePdfPreview';

function PdfPreviewComponent({ pdfUrl }) {
  const {
    loading,
    error,
    numPages,
    currentPage,
    scale,
    containerRef,
    handlePreviousPage,
    handleNextPage,
    handleZoomIn,
    handleZoomOut,
    handleDownload
  } = usePdfPreview({ pdfUrl });

  return (
    <div className="pdf-preview-container">
      <div className="pdf-toolbar">
        <div className="pagination">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            variant="text"
          >
            Précédent
          </Button>
          <span>
            Page {currentPage} sur {numPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            variant="text"
          >
            Suivant
          </Button>
        </div>
        
        <div className="zoom-controls">
          <Button onClick={handleZoomOut} variant="text">-</Button>
          <span>{Math.round(scale * 100)}%</span>
          <Button onClick={handleZoomIn} variant="text">+</Button>
        </div>
        
        <Button onClick={handleDownload} variant="primary">
          Télécharger
        </Button>
      </div>
      
      <div className="pdf-viewer" ref={containerRef}>
        {loading ? (
          <LoadingSpinner message="Chargement du PDF..." />
        ) : error ? (
          <AlertMessage type="error" message={error} />
        ) : (
          <div className="pdf-content">
            {/* Le contenu PDF sera rendu ici par la bibliothèque react-pdf */}
          </div>
        )}
      </div>
    </div>
  );
}
```

## useContratDetails

**But :** Gérer les détails d'un contrat et son cycle de vie

**Paramètres :**
- `id: string` - ID du contrat à gérer

**Dépendances :**
- Firebase (Firestore)
- React (useState, useEffect, useCallback)
- Services (notifications, PDF)
- Hooks (useSignature, useActivity)

**Fonctionnalités principales :**
- Chargement des données du contrat
- Suivi du cycle de vie du contrat
- Gestion des signatures électroniques
- Historique des modifications
- Génération d'avenants
- Envoi par email

**Retourne :**
```javascript
{
  contrat,                  // Données du contrat
  loading,                  // État de chargement
  error,                    // Erreur éventuelle
  statusHistory,            // Historique des changements de statut
  concert,                  // Concert associé
  artiste,                  // Artiste associé
  programmateur,            // Programmateur associé
  lieu,                     // Lieu associé
  isEditing,                // Mode édition actif
  handleUpdateStatus,       // Mettre à jour le statut
  handleEditContrat,        // Modifier le contrat
  handleSaveChanges,        // Enregistrer les modifications
  handleCancelEdit,         // Annuler les modifications
  handleSendEmail,          // Envoyer le contrat par email
  handleDownloadPdf,        // Télécharger le PDF
  handleCreateAmendment,    // Créer un avenant
  signatures,               // État des signatures
  canSign,                  // Si l'utilisateur peut signer
  handleSignContract,       // Signer le contrat
  handleRequestSignature,   // Demander une signature
  isPending,                // Si une action est en cours
  isPdfAvailable            // Si le PDF est disponible
}
```

**Exemple d'utilisation :**

```jsx
import { useContratDetails } from '../hooks/contrats/useContratDetails';

function ContratDetailsPage({ contratId }) {
  const {
    contrat,
    loading,
    error,
    statusHistory,
    concert,
    artiste,
    programmateur,
    isEditing,
    handleUpdateStatus,
    handleEditContrat,
    handleSaveChanges,
    handleSendEmail,
    handleDownloadPdf,
    signatures,
    canSign,
    handleSignContract,
    handleRequestSignature,
    isPending,
    isPdfAvailable
  } = useContratDetails(contratId);

  if (loading) {
    return <LoadingSpinner message="Chargement du contrat..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="contrat-details">
      <PageHeader
        title={`Contrat ${contrat.reference}`}
        subtitle={concert?.titre}
        actions={
          <>
            <Button 
              onClick={handleDownloadPdf} 
              disabled={!isPdfAvailable}
            >
              Télécharger PDF
            </Button>
            
            <Button 
              onClick={handleSendEmail}
              disabled={!isPdfAvailable}
            >
              Envoyer par email
            </Button>
            
            {!isEditing ? (
              <Button onClick={handleEditContrat}>
                Modifier
              </Button>
            ) : (
              <>
                <Button onClick={handleCancelEdit} variant="text">
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  variant="primary"
                  loading={isPending}
                >
                  Enregistrer
                </Button>
              </>
            )}
          </>
        }
      />
      
      <Section title="Informations générales">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Statut</span>
            <span className="value">
              <StatusBadge status={contrat.statut} />
              {!isEditing ? (
                <Button 
                  variant="text" 
                  onClick={() => handleUpdateStatus()} 
                  size="small"
                >
                  Changer
                </Button>
              ) : (
                <StatusSelector 
                  value={contrat.statut}
                  onChange={(status) => handleUpdateStatus(status)}
                />
              )}
            </span>
          </div>
          
          <div className="info-item">
            <span className="label">Date de création</span>
            <span className="value">
              {formatDate(contrat.dateCreation)}
            </span>
          </div>
          
          <div className="info-item">
            <span className="label">Dernière modification</span>
            <span className="value">
              {formatDate(contrat.dateModification)}
            </span>
          </div>
        </div>
      </Section>
      
      <Section title="Parties concernées">
        {/* Affichage des parties concernées */}
      </Section>
      
      <Section title="Signatures">
        <div className="signatures-container">
          {signatures.map((sig, index) => (
            <div key={index} className="signature-item">
              <div className="signature-role">
                {sig.role}
              </div>
              <div className="signature-status">
                {sig.signedAt ? (
                  <>
                    <span className="signed">Signé</span>
                    <span className="date">
                      {formatDate(sig.signedAt)}
                    </span>
                  </>
                ) : (
                  <span className="pending">En attente</span>
                )}
              </div>
              {canSign && !sig.signedAt && (
                <Button onClick={() => handleSignContract(sig.role)}>
                  Signer
                </Button>
              )}
              {!sig.signedAt && !sig.requestSent && (
                <Button 
                  onClick={() => handleRequestSignature(sig.role)}
                  variant="text"
                >
                  Demander signature
                </Button>
              )}
            </div>
          ))}
        </div>
      </Section>
      
      <Section title="Historique">
        <div className="status-history">
          {statusHistory.map((item, index) => (
            <div key={index} className="history-item">
              <div className="status">
                <StatusBadge status={item.status} />
              </div>
              <div className="date">
                {formatDate(item.date)}
              </div>
              {item.user && (
                <div className="user">
                  par {item.user}
                </div>
              )}
              {item.comment && (
                <div className="comment">
                  {item.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
```

## Navigation
- [Vue d'ensemble des hooks](HOOKS.md)
- [Hooks communs](COMMON_HOOKS.md)
- [Hooks pour les concerts](CONCERT_HOOKS.md)
- [Retour à la documentation principale](../README.md)