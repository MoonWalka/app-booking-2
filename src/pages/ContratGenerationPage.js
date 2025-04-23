import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import { db } from '@/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import ContratGenerator from '@/components/contrats/ContratGenerator.js';
import { PDFDownloadLink } from '@react-pdf/renderer';
import '@/style/contratGeneration.css';

// Imports modifiés de la branche refacto-structure-scriptshell - pour implémentation future
{/*
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import { db } from '@/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, serverTimestamp, orderBy, query, where } from '@/firebase';
import ContratGenerator from '@components/contrats/ContratGenerator.js';
import { PDFDownloadLink } from '@react-pdf/renderer';
import '@styles/index.css';
*/}
// Note: Les imports utilisent '@components', '@styles/index.css' au lieu de '@/components', '@/style/contratGeneration.css
// Les alias sont correctement configurés dans votre projet selon jsconfig.json et craco.config.js

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
        console.log("Données du concert récupérées:", concertData);
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
        console.log("Modèles de contrats récupérés:", templatesData);
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

  // Fonction utilitaire pour formater les dates de manière sécurisée
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Non spécifiée';
    
    try {
      // Vérifier si c'est un timestamp Firestore
      if (dateValue.seconds !== undefined) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
      } 
      // Si c'est un objet Date
      else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString('fr-FR');
      }
      // Si c'est une chaîne de date ou un timestamp
      else {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? 'Non spécifiée' : date.toLocaleDateString('fr-FR');
      }
    } catch (error) {
      console.error('Erreur de formatage de date:', error, dateValue);
      return 'Non spécifiée';
    }
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
      
      const templateData = templateDoc.data();
      console.log("Modèle sélectionné:", templateData);
      
      // Variables originales - actuellement utilisées
      const variables = {
        nomProgrammateur: programmateur?.nom || 'Non spécifié',
        prenomProgrammateur: programmateur?.prenom || '',
        adresseProgrammateur: programmateur?.adresse || 'Non spécifiée',
        emailProgrammateur: programmateur?.email || 'Non spécifié',
        telephoneProgrammateur: programmateur?.telephone || 'Non spécifié',
        
        nomLieu: lieu?.nom || 'Non spécifié',
        adresseLieu: lieu?.adresse || 'Non spécifiée',
        capaciteLieu: lieu?.capacite || 'Non spécifiée',
        
        dateConcert: formatDate(concert?.date),
        heureConcert: concert?.heure || 'Non spécifiée',
        // Ajoutez d'autres variables selon vos besoins
      };
      
      // Variables complètes de la branche refacto-structure-scriptshell - pour implémentation future
      {/*
      const variables = {
        // Variables programmateur
        raison_sociale: programmateur?.structure || 'Non spécifiée',
        siret: programmateur?.siret || 'Non spécifié',
        tva: programmateur?.tva || 'Non spécifiée',
        adresse_organisateur: programmateur?.structureAdresse ? 
          `${programmateur.structureAdresse}, ${programmateur.structureCodePostal || ''} ${programmateur.structureVille || ''}` : 
          'Non spécifiée',
        representant: programmateur ? `${programmateur.prenom || ''} ${programmateur.nom || ''}`.trim() : 'Non spécifié',
        qualite_representant: programmateur?.fonction || 'Non spécifiée',
        programmateur_nom: programmateur ? `${programmateur.prenom || ''} ${programmateur.nom || ''}`.trim() : 'Non spécifié',
        programmateur_structure: programmateur?.structure || 'Non spécifiée',
        programmateur_email: programmateur?.email || 'Non spécifié',
        
        // Variables artiste
        artiste_nom: concert?.artisteNom || 'Non spécifié',
        artiste_genre: concert?.artisteGenre || 'Non spécifié',
        
        // Variables événement
        date_evenement: formatDate(concert?.date),
        adresse_evenement: lieu?.adresse ? 
          `${lieu.adresse}, ${lieu.codePostal || ''} ${lieu.ville || ''}` :
          'Non spécifiée',
        concert_titre: concert?.titre || 'Concert',
        concert_date: formatDate(concert?.date),
        
        // Variables financières
        prix_vente: concert?.montant?.toString() || '0',
        prix_lettres: concert?.montantLettres || 'zéro euros',
        concert_montant: concert?.montant?.toString() || '0',
        
        // Variables lieu
        lieu_nom: lieu?.nom || 'Non spécifié',
        lieu_adresse: lieu?.adresse || 'Non spécifiée',
        lieu_code_postal: lieu?.codePostal || 'Non spécifié',
        lieu_ville: lieu?.ville || 'Non spécifiée',
        lieu_capacite: lieu?.capacite?.toString() || 'Non spécifiée',
        
        // Variables signature
        lieu_signature: programmateur?.structureVille || 'Paris',
        date_signature: new Date().toLocaleDateString('fr-FR'),
        
        // Date actuelle
        date_jour: new Date().getDate().toString(),
        date_mois: (new Date().getMonth() + 1).toString(),
        date_annee: new Date().getFullYear().toString()
      };
      */}
      // Note: La version refacto-structure-scriptshell contient beaucoup plus de variables pour le contrat,
      // notamment des informations détaillées sur le programmateur, l'artiste, le lieu et des variables de date formatées.
      
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
      
      console.log("Contrat créé avec l'ID:", contratRef.id);
      
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
          <p><strong>Lieu :</strong> {lieu?.nom || 'Non spécifié'}</p>
          <p><strong>Programmateur :</strong> {programmateur?.nom || 'Non spécifié'}</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner un modèle de contrat</Form.Label>
            <Form.Select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {templates.length === 0 ? (
                <option disabled>Aucun modèle disponible</option>
              ) : (
                templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {/* Utiliser template.name ou template.nom selon la structure de vos données */}
                    {template.name || template.nom || `Modèle ${template.id}`}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>
          
          <Button 
            variant="primary" 
            onClick={handleGenerateContrat}
            disabled={!selectedTemplate || templates.length === 0}
          >
            Générer le contrat
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ContratGenerationPage;
