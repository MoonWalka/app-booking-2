// src/pages/ContratDetailsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Badge } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FaDownload, FaEnvelope, FaFileSignature } from 'react-icons/fa';
import ContratPDF from '../components/contrats/ContratPDF';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

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
  const pdfViewerRef = useRef(null);

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

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement en cours...</span>
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
              <PDFDownloadLink
                document={
                  <ContratPDF 
                    template={template}
                    concertData={concert}
                    programmateurData={programmateur}
                    artisteData={artiste}
                    lieuData={lieu}
                    entrepriseInfo={entreprise}
                  />
                }
                fileName={`Contrat_${concert.titre || 'Concert'}_${new Date().toISOString().slice(0, 10)}.pdf`}
                className="btn btn-success"
              >
                {({ blob, url, loading, error }) => 
                  loading ? 
                    <span><i className="bi bi-hourglass me-1"></i> Préparation...</span> : 
                    <span><i className="bi bi-file-pdf me-1"></i> Télécharger PDF</span>
                }
              </PDFDownloadLink>
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
            
            <Button variant="outline-secondary" onClick={() => navigate(`/concerts/${concert?.id}`)}>
              <i className="bi bi-arrow-left me-1"></i> Retour au concert
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* PDF Viewer */}
      {showPdfViewer && template && concert && (
        <div ref={pdfViewerRef} className="pdf-viewer-container mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Aperçu du contrat</Card.Title>
              <div className="pdf-viewer">
                <PDFViewer width="100%" height={600}>
                  <ContratPDF 
                    template={template}
                    concertData={concert}
                    programmateurData={programmateur}
                    artisteData={artiste}
                    lieuData={lieu}
                    entrepriseInfo={entreprise}
                  />
                </PDFViewer>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      
      {/* Affichage des variables utilisées pour générer le contrat */}
      <Card>
        <Card.Body>
          <Card.Title>Variables du contrat</Card.Title>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(contrat?.variables, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ContratDetailsPage;
