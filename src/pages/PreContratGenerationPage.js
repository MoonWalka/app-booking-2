import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTabs } from '@/context/TabsContext';
import { db } from '@/services/firebase-service';
import { doc, getDoc, collection, query, where, getDocs } from '@/services/firebase-service';
import PreContratGenerator from '@/components/precontrats/desktop/PreContratGenerator';
import '@styles/index.css';

const PreContratGenerationPage = ({ concertId: propConcertId }) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('[WORKFLOW_TEST] 3. Génération du pré-contrat - début du chargement');
      console.log('[PreContratGenerationPage] Chargement des données pour concertId:', concertId);
      
      try {
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          console.error('[PreContratGenerationPage] Concert non trouvé:', concertId);
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
        console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat');
        console.log('[PreContratGenerationPage] Concert data:', concertData);
        console.log('[PreContratGenerationPage] structureId:', concertData.structureId);
        
        let structureFound = false;
        
        if (concertData.structureId) {
          console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structureId trouvé:', concertData.structureId);
          const structureDoc = await getDoc(doc(db, 'structures', concertData.structureId));
          if (structureDoc.exists()) {
            const structureData = { id: structureDoc.id, ...structureDoc.data() };
            console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structure chargée:', structureData);
            console.log('[PreContratGenerationPage] Structure chargée:', structureData);
            setStructure(structureData);
            structureFound = true;
          } else {
            console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - structure non trouvée avec ID:', concertData.structureId);
            console.log('[PreContratGenerationPage] Structure non trouvée avec ID:', concertData.structureId);
          }
        } else {
          console.log('[WORKFLOW_TEST] 4. Chargement des données de structure - pas de structureId dans le concert');
          console.log('[PreContratGenerationPage] Pas de structureId dans le concert');
        }
        
        // Si pas de structure trouvée mais qu'on a des infos dans le concert
        if (!structureFound && concertData.structureRaisonSociale) {
          console.log('[PreContratGenerationPage] Utilisation des données structure du concert');
          
          // Essayer de charger depuis contacts_unified
          try {
            const contactsRef = collection(db, 'contacts_unified');
            const q = query(
              contactsRef,
              where('organizationId', '==', concertData.organizationId),
              where('entityType', '==', 'structure'),
              where('structureRaisonSociale', '==', concertData.structureRaisonSociale)
            );
            
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const contactDoc = querySnapshot.docs[0];
              const contactData = { id: contactDoc.id, ...contactDoc.data() };
              console.log('[PreContratGenerationPage] Structure trouvée dans contacts_unified:', contactData);
              
              // Extraire les données de la structure
              setStructure({
                id: contactDoc.id,
                raisonSociale: contactData.structureRaisonSociale || concertData.structureRaisonSociale,
                nom: contactData.structureRaisonSociale || concertData.structureNom,
                adresse: contactData.structureAdresse || '',
                suiteAdresse: contactData.structureSuiteAdresse1 || '',
                codePostal: contactData.structureCodePostal || '',
                ville: contactData.structureVille || '',
                departement: contactData.structureDepartement || '',
                region: contactData.structureRegion || '',
                pays: contactData.structurePays || 'France',
                telephone: contactData.structureTelephone1 || '',
                telephone1: contactData.structureTelephone1 || '',
                telephone2: contactData.structureTelephone2 || '',
                mobile: contactData.structureMobile || '',
                fax: contactData.structureFax || '',
                email: contactData.structureEmail || '',
                siteWeb: contactData.structureSiteWeb || '',
                siret: contactData.structureSiret || '',
                type: contactData.structureType || ''
              });
              structureFound = true;
            }
          } catch (error) {
            console.error('[PreContratGenerationPage] Erreur recherche dans contacts_unified:', error);
          }
          
          // Si toujours pas trouvé, utiliser les données minimales du concert
          if (!structureFound) {
            setStructure({
              raisonSociale: concertData.structureRaisonSociale,
              nom: concertData.structureNom || concertData.structureRaisonSociale,
              // Ajouter d'autres champs si disponibles dans concertData
              adresse: concertData.structureAdresse || '',
              ville: concertData.structureVille || '',
              codePostal: concertData.structureCodePostal || '',
              telephone: concertData.structureTelephone || '',
              email: concertData.structureEmail || ''
            });
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
      console.error('[PreContratGenerationPage] Aucun concertId disponible');
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