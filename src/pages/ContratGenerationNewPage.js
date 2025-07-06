import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from '@/services/firebase-service';
import { getPreContratsByDate } from '@/services/preContratService';
import ContratGeneratorNew from '@/components/contrats/desktop/ContratGeneratorNew';
import '@styles/index.css';

const ContratGenerationNewPage = ({ dateId: propDateId }) => {
  const { dateId: paramsDateId } = useParams();
  const { getActiveTab } = useTabs();
  
  // Récupérer dateId depuis plusieurs sources possibles
  const getDateId = () => {
    if (propDateId) return propDateId;
    if (paramsDateId) return paramsDateId;
    
    // Si on est dans un onglet, récupérer depuis les params du tab
    const activeTab = getActiveTab();
    if (activeTab?.params?.dateId) return activeTab.params.dateId;
    
    return null;
  };
  
  const dateId = getDateId();
  const navigate = useNavigate();
  const [concert, setDate] = useState(null);
  const [contact, setContact] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [structure, setStructure] = useState(null);
  const [preContratData, setPreContratData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('[ContratGenerationNewPage] Chargement des données pour dateId:', dateId);
      
      try {
        // Récupérer les données du concert
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (!dateDoc.exists()) {
          console.error('[ContratGenerationNewPage] Date non trouvé:', dateId);
          setError('Date non trouvé');
          setLoading(false);
          return;
        }
        
        const dateData = { id: dateId, ...dateDoc.data() };
        setDate(dateData);

        // Récupérer les données du contact si disponible
        if (dateData.contactId) {
          const contactDoc = await getDoc(doc(db, 'contacts', dateData.contactId));
          if (contactDoc.exists()) {
            setContact({ id: contactDoc.id, ...contactDoc.data() });
          }
        }

        // Récupérer les données de la structure si disponible
        if (dateData.structureId) {
          const structureDoc = await getDoc(doc(db, 'structures', dateData.structureId));
          if (structureDoc.exists()) {
            setStructure({ id: structureDoc.id, ...structureDoc.data() });
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (dateData.artisteId) {
          const artisteDoc = await getDoc(doc(db, 'artistes', dateData.artisteId));
          if (artisteDoc.exists()) {
            setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
          }
        } else if (dateData.artisteNom) {
          // Si pas d'artisteId, créer un objet artiste avec les données du concert
          setArtiste({
            nom: dateData.artisteNom,
            id: null
          });
        }

        // Récupérer les données du lieu si disponible
        if (dateData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        }

        // Récupérer les données du pré-contrat confirmé
        try {
          const preContrats = await getPreContratsByDate(dateId);
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

    if (dateId) {
      fetchData();
    } else {
      console.error('[ContratGenerationNewPage] Aucun dateId disponible');
      setError('Aucun date spécifié');
      setLoading(false);
    }
  }, [dateId]);

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
        dateId={dateId}
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