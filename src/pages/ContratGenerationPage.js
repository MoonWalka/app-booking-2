import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import { db } from '@/services/firebase-service';
import { doc, getDoc, collection, addDoc, serverTimestamp } from '@/services/firebase-service';
import '@styles/index.css';
import { formatDateFr } from '../utils/dateUtils';

const ContratGenerationPage = () => {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConcertData = async () => {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          const data = concertDoc.data();
          setConcert(data);
        } else {
          setError('Concert non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
        setError('Erreur lors de la récupération du concert');
      } finally {
        setLoading(false);
      }
    };

    fetchConcertData();
  }, [concertId]);

  // Fonction utilitaire pour formater les dates de manière sécurisée
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Non spécifiée';
    
    // Utiliser la fonction centralisée formatDateFr
    return formatDateFr(dateValue) || 'Non spécifiée';
  };

  const handleGenerateContrat = async () => {
    try {
      if (!selectedTemplate) {
        setError('Veuillez sélectionner un modèle de contrat');
        return;
      }
      
      // Récupérer le template sélectionné
      const templateDoc = await getDoc(doc(db, 'contratTemplates', selectedTemplate));
      if (!templateDoc.exists()) {
        setError('Modèle de contrat non trouvé');
        return;
      }
      
      // Variables simplifiées basées sur les données du concert
      const variables = {
        // Variables artiste
        artiste_nom: concert?.artisteNom || 'Non spécifié',
        artiste_genre: concert?.artisteGenre || 'Non spécifié',
        
        // Variables événement
        date_evenement: formatDate(concert?.date),
        concert_titre: concert?.titre || 'Concert',
        concert_date: formatDate(concert?.date),
        
        // Variables financières
        prix_vente: concert?.montant?.toString() || '0',
        prix_lettres: concert?.montantLettres || 'zéro euros',
        concert_montant: concert?.montant?.toString() || '0',
        
        // Variables par défaut
        lieu_nom: 'Non spécifié',
        lieu_adresse: 'Non spécifiée',
        programmateur_nom: 'Non spécifié',
        
        // Date actuelle
        date_jour: new Date().getDate().toString(),
        date_mois: (new Date().getMonth() + 1).toString(),
        date_annee: new Date().getFullYear().toString(),
        date_signature: new Date().toLocaleDateString('fr-FR')
      };
      
      // Créer le contrat dans Firestore
      const contratRef = await addDoc(collection(db, 'contrats'), {
        concertId,
        templateId: selectedTemplate,
        dateGeneration: serverTimestamp(),
        dateEnvoi: null,
        status: 'generated',
        pdfUrl: '', // À remplir après génération du PDF
        variables
      });
      
      // Rediriger vers la page du contrat généré
      navigate(`/contrats/${contratRef.id}`);
      
    } catch (err) {
      console.error('Erreur lors de la génération du contrat :', err);
      setError('Une erreur est survenue lors de la génération du contrat');
    }
  };

  if (loading) {
    return <div className="text-center my-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="contrat-generation">
      <h2>Génération de contrat</h2>
      <Card>
        <Card.Body>
          <Card.Title>Informations du concert</Card.Title>
          <p><strong>Date :</strong> {formatDate(concert?.date)}</p>
          <p><strong>Artiste :</strong> {concert?.artisteNom || 'Non spécifié'}</p>
          <p><strong>Titre :</strong> {concert?.titre || 'Non spécifié'}</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner un modèle de contrat</Form.Label>
            <Form.Select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Sélectionner un modèle</option>
              <option value="default">Modèle par défaut</option>
            </Form.Select>
          </Form.Group>
          
          <Button 
            variant="primary" 
            onClick={handleGenerateContrat}
            disabled={!selectedTemplate}
          >
            Générer le contrat
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ContratGenerationPage;