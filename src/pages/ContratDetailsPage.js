// src/pages/ContratDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Badge } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FaDownload, FaEnvelope, FaFileSignature } from 'react-icons/fa';

const ContratDetailsPage = () => {
  const { contratId } = useParams();
  const navigate = useNavigate();
  const [contrat, setContrat] = useState(null);
  const [concert, setConcert] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            setConcert({ id: concertDoc.id, ...concertDoc.data() });
          }
        }
        
        // Récupérer les informations du template utilisé
        if (contratData.templateId) {
          const templateDoc = await getDoc(doc(db, 'contratTemplates', contratData.templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
          }
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

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="contrat-details">
      <h2>Détails du contrat {getStatusBadge()}</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Informations du contrat</Card.Title>
          <p><strong>Modèle utilisé :</strong> {template?.nom || 'Non spécifié'}</p>
          <p><strong>Date de génération :</strong> {contrat?.dateGeneration ? new Date(contrat.dateGeneration.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
          {contrat?.dateEnvoi && (
            <p><strong>Date d'envoi :</strong> {new Date(contrat.dateEnvoi.seconds * 1000).toLocaleDateString('fr-FR')}</p>
          )}
          
          <div className="mt-3 mb-3">
            <h5>Informations du concert</h5>
            <p><strong>Date :</strong> {concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
            <p><strong>Lieu :</strong> {concert?.lieuNom || 'Non spécifié'}</p>
            <p><strong>Programmateur :</strong> {concert?.programmateurNom || 'Non spécifié'}</p>
          </div>
          
          <div className="d-flex gap-2">
            {contrat?.pdfUrl && (
              <Button variant="primary" href={contrat.pdfUrl} target="_blank">
                <FaDownload /> Télécharger le PDF
              </Button>
            )}
            
            {contrat?.status === 'generated' && (
              <Button variant="success" onClick={handleSendContrat}>
                <FaEnvelope /> Marquer comme envoyé
              </Button>
            )}
            
            {contrat?.status === 'sent' && (
              <Button variant="info" onClick={handleMarkAsSigned}>
                <FaFileSignature /> Marquer comme signé
              </Button>
            )}
            
            <Button variant="outline-secondary" onClick={() => navigate(`/concerts/${concert?.id}`)}>
              Retour au concert
            </Button>
          </div>
        </Card.Body>
      </Card>
      
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