import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from '@/services/firebase-service';
import { getPreContratsByConcert } from '@/services/preContratService';
import ContratGeneratorNew from '@/components/contrats/desktop/ContratGeneratorNew';
import '@styles/index.css';

const ContratGenerationNewPage = ({ concertId: propConcertId }) => {
  const { concertId: paramsConcertId } = useParams();
  const { getActiveTab } = useTabs();
  
  // Récupérer concertId depuis plusieurs sources possibles
  const getConcertId = () => {
    if (propConcertId) return propConcertId;
    if (paramsConcertId) return paramsConcertId;
    
    // Si on est dans un onglet, récupérer depuis les params du tab
    const activeTab = getActiveTab();
    if (activeTab?.params?.concertId) return activeTab.params.concertId;
    
    return null;
  };
  
  const concertId = getConcertId();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [contact, setContact] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [structure, setStructure] = useState(null);
  const [preContratData, setPreContratData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('[ContratGenerationNewPage] Chargement des données pour concertId:', concertId);
      
      try {
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          console.error('[ContratGenerationNewPage] Concert non trouvé:', concertId);
          setError('Concert non trouvé');
          setLoading(false);
          return;
        }
        
        const concertData = { id: concertId, ...concertDoc.data() };
        setConcert(concertData);

        // Récupérer les données du contact si disponible
        if (concertData.contactId) {
          const contactDoc = await getDoc(doc(db, 'contacts', concertData.contactId));
          if (contactDoc.exists()) {
            setContact({ id: contactDoc.id, ...contactDoc.data() });
          }
        }

        // Récupérer les données de la structure si disponible
        if (concertData.structureId) {
          const structureDoc = await getDoc(doc(db, 'structures', concertData.structureId));
          if (structureDoc.exists()) {
            setStructure({ id: structureDoc.id, ...structureDoc.data() });
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (concertData.artisteId) {
          const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
          if (artisteDoc.exists()) {
            setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
          }
        } else if (concertData.artisteNom) {
          // Si pas d'artisteId, créer un objet artiste avec les données du concert
          setArtiste({
            nom: concertData.artisteNom,
            id: null
          });
        }

        // Récupérer les données du lieu si disponible
        if (concertData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        }

        // Récupérer les données du pré-contrat confirmé
        try {
          const preContrats = await getPreContratsByConcert(concertId);
          console.log('[ContratGenerationNewPage] Pré-contrats trouvés:', preContrats.length);
          
          // Chercher un pré-contrat confirmé
          const confirmedPreContrat = preContrats.find(pc => pc.confirmationValidee === true);
          
          if (confirmedPreContrat) {
            console.log('[ContratGenerationNewPage] Pré-contrat confirmé trouvé:', confirmedPreContrat);
            setPreContratData(confirmedPreContrat);
          } else {
            console.log('[ContratGenerationNewPage] Aucun pré-contrat confirmé trouvé');
          }
        } catch (error) {
          console.error('[ContratGenerationNewPage] Erreur lors de la récupération du pré-contrat:', error);
          // Ne pas bloquer si le pré-contrat n'est pas trouvé
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    if (concertId) {
      fetchData();
    } else {
      console.error('[ContratGenerationNewPage] Aucun concertId disponible');
      setError('Aucun concert spécifié');
      setLoading(false);
    }
  }, [concertId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(-1)}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ContratGeneratorNew 
        concertId={concertId}
        concert={concert}
        contact={contact}
        artiste={artiste}
        lieu={lieu}
        structure={structure}
        preContratData={preContratData}
      />
    </div>
  );
};

export default ContratGenerationNewPage;