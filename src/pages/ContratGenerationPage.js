import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import ContratGenerator from '../components/contrats/ContratGenerator';

const ContratGenerationPage = () => {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          setError('Concert non trouvé');
          setLoading(false);
          return;
        }
        
        const concertData = { id: concertDoc.id, ...concertDoc.data() };
        setConcert(concertData);
        
        // Récupérer les informations du programmateur
        if (concertData.programmateurId) {
          const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
          if (progDoc.exists()) {
            setProgrammateur({ id: progDoc.id, ...progDoc.data() });
          }
        }
        
        // Récupérer les informations du lieu
        if (concertData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        }
        
        // Récupérer les modèles de contrats disponibles
        const templatesSnapshot = await getDocs(collection(db, 'contratTemplates'));
        const templatesData = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTemplates(templatesData);
        
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données :', err);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [concertId]);

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
      
      const templateData = templateDoc.data();
      
      // Préparer les variables pour le contrat
      const variables = {
        nomProgrammateur: programmateur?.nom || 'Non spécifié',
        prenomProgrammateur: programmateur?.prenom || '',
        adresseProgrammateur: programmateur?.adresse || 'Non spécifiée',
        emailProgrammateur: programmateur?.email || 'Non spécifié',
        telephoneProgrammateur: programmateur?.telephone || 'Non spécifié',
        
        nomLieu: lieu?.nom || 'Non spécifié',
        adresseLieu: lieu?.adresse || 'Non spécifiée',
        capaciteLieu: lieu?.capacite || 'Non spécifiée',
        
        dateConcert: concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée',
        heureConcert: concert?.heure || 'Non spécifiée',
        // Ajoutez d'autres variables selon vos besoins
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
    return <div>Chargement en cours...</div>;
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
          <p><strong>Date :</strong> {concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
          <p><strong>Lieu :</strong> {lieu?.nom || 'Non spécifié'}</p>
          <p><strong>Programmateur :</strong> {programmateur?.nom || 'Non spécifié'}</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner un modèle de contrat</Form.Label>
            <Form.Select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.nom}
                </option>
              ))}
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