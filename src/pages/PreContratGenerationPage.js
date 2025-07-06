import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, getDoc, collection, query, where, getDocs } from '@/services/firebase-service';
import PreContratGenerator from '@/components/precontrats/desktop/PreContratGenerator';
import '@styles/index.css';

const PreContratGenerationPage = ({ dateId: propDateId }) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('[WORKFLOW_TEST] 3. Génération du pré-contrat - début du chargement');
      console.log('[PreContratGenerationPage] Chargement des données pour dateId:', dateId);
      
      try {
        // Récupérer les données du concert
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (!dateDoc.exists()) {
          console.error('[PreContratGenerationPage] Date non trouvé:', dateId);
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
        console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat');
        console.log('[PreContratGenerationPage] Date data:', dateData);
        console.log('[PreContratGenerationPage] structureId:', dateData.structureId);
        
        let structureFound = false;
        
        if (dateData.structureId) {
          console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structureId trouvé:', dateData.structureId);
          
          // Chercher dans la collection structures (nouveau système)
          const structureDoc = await getDoc(doc(db, 'structures', dateData.structureId));
          if (structureDoc.exists()) {
            const structureData = { id: structureDoc.id, ...structureDoc.data() };
            console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structure chargée:', structureData);
            console.log('[PreContratGenerationPage] Structure chargée:', structureData);
            setStructure(structureData);
            structureFound = true;
          } else {
            console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structure non trouvée avec ID:', dateData.structureId);
            console.log('[PreContratGenerationPage] Structure non trouvée avec ID:', dateData.structureId);
          }
        } else {
          console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - pas de structureId dans le concert');
          console.log('[PreContratGenerationPage] Pas de structureId dans le concert');
        }
        
        // Si pas de structure trouvée mais qu'on a des infos dans le concert
        if (!structureFound && dateData.structureRaisonSociale) {
          console.log('[PreContratGenerationPage] Utilisation des données structure du concert');
          
          // Essayer de charger depuis structures (nouveau système)
          try {
            const structuresRef = collection(db, 'structures');
            const q = query(
              structuresRef,
              where('organizationId', '==', dateData.organizationId),
              where('raisonSociale', '==', dateData.structureRaisonSociale)
            );
            
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const structureDoc = querySnapshot.docs[0];
              const structureData = { id: structureDoc.id, ...structureDoc.data() };
              console.log('[PreContratGenerationPage] Structure trouvée par raison sociale:', structureData);
              setStructure(structureData);
              structureFound = true;
            }
          } catch (error) {
            console.error('[PreContratGenerationPage] Erreur recherche dans structures:', error);
          }
          
          // Si toujours pas trouvé, utiliser les données minimales du concert
          if (!structureFound) {
            setStructure({
              raisonSociale: dateData.structureRaisonSociale,
              nom: dateData.structureNom || dateData.structureRaisonSociale,
              // Ajouter d'autres champs si disponibles dans dateData
              adresse: dateData.structureAdresse || '',
              ville: dateData.structureVille || '',
              codePostal: dateData.structureCodePostal || '',
              telephone: dateData.structureTelephone || '',
              email: dateData.structureEmail || ''
            });
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
      console.error('[PreContratGenerationPage] Aucun dateId disponible');
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

  console.log('[WORKFLOW_TEST] 3. Génération du pré-contrat - passage des données au composant PreContratGenerator', {
    concert: concert?.id,
    structure: structure?.id || 'aucune',
    structureData: structure
  });
  
  return (
    <div className="container-fluid">
      <PreContratGenerator 
        concert={concert}
        contact={contact}
        artiste={artiste}
        lieu={lieu}
        structure={structure}
      />
    </div>
  );
};

export default PreContratGenerationPage;