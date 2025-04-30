// src/pages/ContratDetailsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Badge, Nav } from 'react-bootstrap';
import { db } from '@/firebaseInit';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

import { FaDownload, FaEnvelope, FaFileSignature } from 'react-icons/fa';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper.js';
import { PDFViewer } from '@react-pdf/renderer';
import '@/styles/index.css';

// Note: Les imports sont standardisés en utilisant le format @/components/ et @/styles/

const ContratDetailsPage = () => {
  const { contratId } = useParams();
  const navigate = useNavigate();
  const [contrat, setContrat] = useState(null);
  const [concert, setConcert] = useState(null);
  const [template, setTemplate] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showVariables, setShowVariables] = useState(false); // false pour que la carte soit pliée par défaut
  const pdfViewerRef = useRef(null);

  // États pour gérer les différents types d'aperçus
  const [previewType, setPreviewType] = useState('html'); // 'html', 'react-pdf' ou 'pdf'
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isGeneratingPdfPreview, setIsGeneratingPdfPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du contrat
        const contratDoc = await getDoc(doc(db, 'contrats', contratId));
        if (!contratDoc.exists()) {
          setError('Contrat non trouvé');
          setLoading(false);
          return;
        }
        
        const contratData = { id: contratDoc.id, ...contratDoc.data() };
        setContrat(contratData);
        
        // Récupérer les informations du concert associé
        if (contratData.concertId) {
          const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
          if (concertDoc.exists()) {
            const concertData = { id: concertDoc.id, ...concertDoc.data() };
            setConcert(concertData);
            
            // Récupérer le programmateur
            if (concertData.programmateurId) {
              const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (progDoc.exists()) {
                setProgrammateur({ id: progDoc.id, ...progDoc.data() });
              }
            }
            
            // Récupérer le lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
              }
            }
            
            // Si artiste existe, récupérer les données
            if (concertData.artisteId) {
              const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
              if (artisteDoc.exists()) {
                setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
              }
            }
          }
        }
        
        // Récupérer les informations du template utilisé
        if (contratData.templateId) {
          const templateDoc = await getDoc(doc(db, 'contratTemplates', contratData.templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
          }
        }
        
        // Récupérer les informations de l'entreprise
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (entrepriseDoc.exists()) {
          setEntreprise(entrepriseDoc.data());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données :', err);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contratId]);

  const handleSendContrat = async () => {
    try {
      // Mettre à jour le statut du contrat
      await updateDoc(doc(db, 'contrats', contratId), {
        status: 'sent',
        dateEnvoi: Timestamp.now()
      });
      
      // Mettre à jour l'état local
      setContrat(prev => ({
        ...prev,
        status: 'sent',
        dateEnvoi: Timestamp.now()
      }));
      
      // Ici, vous pourriez implémenter l'envoi réel du contrat par email
      alert('Le contrat a été marqué comme envoyé');
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du contrat :', err);
      setError('Une erreur est survenue lors de l\'envoi du contrat');
    }
  };

  const handleMarkAsSigned = async () => {
    try {
      // Mettre à jour le statut du contrat
      await updateDoc(doc(db, 'contrats', contratId), {
        status: 'signed'
      });
      
      // Mettre à jour l'état local
      setContrat(prev => ({
        ...prev,
        status: 'signed'
      }));
      
      alert('Le contrat a été marqué comme signé');
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut du contrat :', err);
      setError('Une erreur est survenue lors de la mise à jour du statut du contrat');
    }
  };

  const handleDeleteContrat = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.')) {
      try {
        // Supprimer le contrat de la base de données
        await deleteDoc(doc(db, 'contrats', contratId));
        
        // Afficher un message de confirmation
        alert('Le contrat a été supprimé avec succès');
        
        // Rediriger vers la liste des contrats
        navigate('/contrats');
      } catch (err) {
        console.error('Erreur lors de la suppression du contrat :', err);
        setError('Une erreur est survenue lors de la suppression du contrat');
      }
    }
  };
  

  const getStatusBadge = () => {
    if (!contrat) return null;
    
    switch (contrat.status) {
      case 'signed':
        return <Badge bg="success">Signé</Badge>;
      case 'sent':
        return <Badge bg="info">Envoyé</Badge>;
      case 'generated':
        return <Badge bg="warning">Généré</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
    
    if (!showPdfViewer && pdfViewerRef.current) {
      pdfViewerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fonction pour générer l'aperçu PDF exact via Puppeteer
  const generatePDFPreview = async () => {
    if (!template || !concert) {
      alert('Données insuffisantes pour générer l\'aperçu PDF');
      return;
    }

    setIsGeneratingPdfPreview(true);
    try {
      // Préparer les données pour l'aperçu
      const data = {
        template,
        contratData: contrat,
        concertData: concert,
        programmateurData: programmateur,
        artisteData: artiste,
        lieuData: lieu,
        entrepriseInfo: entreprise
      };
      
      // Utiliser la nouvelle méthode ajoutée au ContratPDFWrapper pour générer un aperçu PDF
      // Passons un titre vide pour ne pas ajouter "Contrat - [titre du concert]" dans l'aperçu
      const url = await ContratPDFWrapper.generatePDFPreview(data, "");
      setPdfPreviewUrl(url);
      setPreviewType('pdf');
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu PDF:', error);
      alert(`Erreur lors de la génération de l'aperçu PDF: ${error.message}`);
    } finally {
      setIsGeneratingPdfPreview(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (!template || !concert) {
        alert('Données insuffisantes pour générer le PDF');
        return;
      }

      // Afficher l'indicateur de chargement
      setLoading(true);
      
      // Générer un titre pour le PDF
      const pdfTitle = `Contrat_${concert.titre || 'Concert'}_${new Date().toISOString().slice(0, 10)}`;
      
      try {
        // Préparer les données à passer à la méthode statique
        const data = {
          template,
          contratData: contrat,
          concertData: concert,
          programmateurData: programmateur,
          artisteData: artiste,
          lieuData: lieu,
          entrepriseInfo: entreprise
        };
        
        // Appeler la méthode statique du wrapper pour générer le PDF avec Puppeteer
        await ContratPDFWrapper.generatePuppeteerPdf(pdfTitle, data);
        // Le téléchargement est géré automatiquement par le service
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert(`Erreur lors de la génération du PDF: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du contrat...</span>
          </div>
          <p className="mt-2">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="contrat-details">
      <h2>
        Détails du contrat {getStatusBadge()}
      </h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Informations du contrat</Card.Title>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Modèle utilisé :</strong> {template?.name || 'Non spécifié'}</p>
              <p><strong>Date de génération :</strong> {contrat?.dateGeneration ? new Date(contrat.dateGeneration.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
              {contrat?.dateEnvoi && (
                <p><strong>Date d'envoi :</strong> {new Date(contrat.dateEnvoi.seconds * 1000).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
            
            <div className="col-md-6">
              <h5>Informations du concert</h5>
              <p><strong>Date :</strong> {concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
              <p><strong>Lieu :</strong> {concert?.lieuNom || 'Non spécifié'}</p>
              <p><strong>Programmateur :</strong> {concert?.programmateurNom || 'Non spécifié'}</p>
            </div>
          </div>
          
          <div className="d-flex gap-2 mt-4">
            <Button 
              variant="primary" 
              onClick={togglePdfViewer}
            >
              <i className="bi bi-eye me-1"></i> {showPdfViewer ? 'Masquer l\'aperçu' : 'Afficher le contrat'}
            </Button>
            
            {template && concert && (
              <Button
                variant="success"
                onClick={handleDownloadPdf}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Préparation...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-pdf me-1"></i> Télécharger PDF
                  </>
                )}
              </Button>
            )}
            
            {contrat?.status === 'generated' && (
              <Button variant="info" onClick={handleSendContrat}>
                <FaEnvelope className="me-1" /> Marquer comme envoyé
              </Button>
            )}
            
            {contrat?.status === 'sent' && (
              <Button variant="success" onClick={handleMarkAsSigned}>
                <FaFileSignature className="me-1" /> Marquer comme signé
              </Button>
            )}
            
            {/* Nouveau bouton Supprimer */}
  <Button 
    variant="danger" 
    onClick={handleDeleteContrat}
  >
    <i className="bi bi-trash me-1"></i> Supprimer
  </Button>
  
  {/* Bouton de retour modifié */}
  <Button 
    variant="outline-secondary" 
    onClick={() => navigate('/contrats')}
  >
    <i className="bi bi-arrow-left me-1"></i> Retour aux contrats
  </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* PDF Viewer avec options d'aperçu améliorées */}
      {showPdfViewer && template && concert && (
        <div ref={pdfViewerRef} className="pdf-viewer-container mb-4">
          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Aperçu du contrat</Card.Title>
              
              {/* Onglets pour les différents types d'aperçu */}
              <Nav 
                variant="tabs" 
                className="mb-3"
                activeKey={previewType}
                onSelect={(k) => setPreviewType(k)}
              >
                <Nav.Item>
                  <Nav.Link eventKey="html" className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-code me-2"></i>
                    Aperçu HTML
                    <span className="badge bg-success ms-2" style={{ fontSize: '0.7em' }}>Recommandé</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="react-pdf" className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Aperçu simple
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="pdf" 
                    className="d-flex align-items-center"
                    onClick={() => {
                      if (previewType !== 'pdf' && !pdfPreviewUrl) {
                        generatePDFPreview();
                      }
                    }}
                    disabled={isGeneratingPdfPreview}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    {isGeneratingPdfPreview ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        Aperçu PDF exact
                        {pdfPreviewUrl && <span className="badge bg-info ms-2" style={{ fontSize: '0.7em' }}>Prêt</span>}
                      </>
                    )}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <div className="preview-content mt-3">
                {previewType === 'html' && (
                  <div className="html-preview">
                    <ContratPDFWrapper.HTMLPreview 
                      data={{
                        template,
                        contratData: contrat,
                        concertData: concert,
                        programmateurData: programmateur,
                        artisteData: artiste,
                        lieuData: lieu,
                        entrepriseInfo: entreprise
                      }}
                      title={`Contrat - ${concert.titre || 'Concert'}`}
                    />
                  </div>
                )}
                
                {previewType === 'react-pdf' && (
                  <div className="react-pdf-preview">
                    <div className="alert alert-warning mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Cet aperçu est simplifié. La mise en page peut différer du résultat final.
                    </div>
                    <PDFViewer width="100%" height={550}>
                      <ContratPDFWrapper 
                        template={template}
                        contratData={contrat}
                        concertData={concert}
                        programmateurData={programmateur}
                        artisteData={artiste}
                        lieuData={lieu}
                        entrepriseInfo={entreprise}
                      />
                    </PDFViewer>
                  </div>
                )}
                
                {previewType === 'pdf' && (
                  <div className="pdf-exact-preview">
                    {isGeneratingPdfPreview ? (
                      <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Génération de l'aperçu PDF...</span>
                        </div>
                        <p className="mt-3">Génération de l'aperçu PDF en cours...</p>
                        <p className="text-muted small">Cela peut prendre quelques secondes</p>
                      </div>
                    ) : pdfPreviewUrl ? (
                      <div className="pdf-container">
                        <div className="alert alert-success mb-3">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Cet aperçu est identique au PDF qui sera téléchargé.
                        </div>
                        <iframe 
                          src={pdfPreviewUrl} 
                          width="100%" 
                          height={550} 
                          title="Aperçu PDF"
                          style={{ border: '1px solid #ddd' }}
                        />
                      </div>
                    ) : (
                      <div className="text-center p-5">
                        <button 
                          className="tc-btn-primary" 
                          onClick={generatePDFPreview}
                          disabled={isGeneratingPdfPreview}
                        >
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          Générer l'aperçu PDF exact
                        </button>
                        <p className="text-muted mt-3">
                          L'aperçu PDF utilise le même moteur de rendu que le PDF final
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      
     {/* Affichage des variables utilisées pour générer le contrat - Version avec collapse */}
<Card className="contract-variables-card mt-4">
  <Card.Header 
    className="d-flex align-items-center cursor-pointer"
    onClick={() => setShowVariables(!showVariables)}
  >
    <i className="bi bi-braces me-2 text-primary"></i>
    <h5 className="mb-0">Variables du contrat</h5>
    <div className="ms-auto d-flex align-items-center">
      {showVariables && (
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="me-2"
          onClick={(e) => {
            e.stopPropagation(); // Empêcher le toggle du collapse
            navigator.clipboard.writeText(JSON.stringify(contrat?.variables, null, 2));
            // Notification que vous pourriez remplacer par un toast
            alert('Variables copiées dans le presse-papier');
          }}
        >
          <i className="bi bi-clipboard me-1"></i> Copier
        </Button>
      )}
      <i className={`bi bi-chevron-${showVariables ? 'up' : 'down'} transition-icon`}></i>
    </div>
  </Card.Header>
  
  <div className={`collapse ${showVariables ? 'show' : ''}`}>
    <Card.Body>
      <div className="mb-2 text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Ces variables ont été utilisées pour générer le contrat à partir du modèle.
      </div>
      {contrat?.variables ? (
        <div className="variables-container">
          {Object.entries(contrat.variables).map(([key, value]) => (
            <div key={key} className="variable-item">
              <div className="variable-name">
                <code>{'{' + key + '}'}</code>
              </div>
              <div className="variable-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 text-muted">
          <i className="bi bi-exclamation-circle fs-4 d-block mb-2"></i>
          Aucune variable disponible pour ce contrat
        </div>
      )}
    </Card.Body>
  </div>
</Card>

    </div>
  );
};

export default ContratDetailsPage;
