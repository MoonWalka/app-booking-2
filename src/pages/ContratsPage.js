// src/pages/ContratsPage.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, Badge, Tabs, Tab } from 'react-bootstrap';
import ContratTemplatesPage from './contratTemplatesPage.js';
import ContratTemplatesEditPage from './contratTemplatesEditPage.js';
import ContratGenerationPage from './ContratGenerationPage.js';
import ContratDetailsPage from './ContratDetailsPage.js';
import '../style/contrats.css';


const ContratsTab = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContrats = async () => {
      setLoading(true);
      try {
        const contratsQuery = query(
          collection(db, 'contrats'), 
          orderBy('dateGeneration', 'desc')
        );
        const contratsSnapshot = await getDocs(contratsQuery);
        
        const contratsPromises = contratsSnapshot.docs.map(async (doc) => {
          const contratData = doc.data();
          
          // Récupérer les données du concert associé
          let concertData = null;
          if (contratData.concertId) {
            try {
              const concertDoc = await getDocs(query(
                collection(db, 'concerts'),
                where('__name__', '==', contratData.concertId)
              ));
              
              if (!concertDoc.empty) {
                concertData = {
                  id: concertDoc.docs[0].id,
                  ...concertDoc.docs[0].data()
                };
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du concert:', err);
            }
          }
          
          return {
            id: doc.id,
            ...contratData,
            concert: concertData
          };
        });
        
        const contratsWithData = await Promise.all(contratsPromises);
        setContrats(contratsWithData);
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContrats();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    try {
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
      }
      
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
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
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (contrats.length === 0) {
    return (
      <div className="no-contrats-message">
        <i className="bi bi-file-earmark-text"></i>
        <p>Aucun contrat n'a été généré.</p>
        <p className="text-muted">
          Rendez-vous sur la page de détail d'un concert pour générer un contrat.
        </p>
      </div>
    );
  }

  return (
    <div className="contrats-tab">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des contrats</h2>
      </div>
      
      <div className="table-responsive">
        <Table hover className="contrats-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Concert</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contrats.map(contrat => (
              <tr key={contrat.id} onClick={() => navigate(`/contrats/${contrat.id}`)}>
                <td>{formatDate(contrat.dateGeneration)}</td>
                <td>{contrat.concert?.titre || 'N/A'}</td>
                <td>{contrat.concert?.lieuNom || 'N/A'}</td>
                <td>{contrat.concert?.programmateurNom || 'N/A'}</td>
                <td>{getStatusBadge(contrat.status)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contrats/${contrat.id}`);
                      }}
                    >
                      <i className="bi bi-eye"></i> Voir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const ConcertsTab = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const concertsQuery = query(
          collection(db, 'concerts'),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(concertsQuery);
        const concertsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConcerts(concertsList);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des concerts:', error);
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    try {
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
      }
      
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="concerts-tab">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Concerts disponibles pour génération de contrats</h2>
      </div>
      
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Titre</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map(concert => (
              <tr key={concert.id}>
                <td>{formatDate(concert.date)}</td>
                <td>{concert.titre || 'N/A'}</td>
                <td>{concert.lieuNom || 'N/A'}</td>
                <td>{concert.programmateurNom || 'N/A'}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/contrats/generate/${concert.id}`)}
                  >
                    <i className="bi bi-file-earmark-plus"></i> Générer un contrat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const LieuxProgrammateursTab = () => {
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les lieux
        const lieuxQuery = query(
          collection(db, 'lieux'),
          orderBy('nom', 'asc')
        );
        const lieuxSnapshot = await getDocs(lieuxQuery);
        const lieuxList = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxList);
        
        // Récupérer les programmateurs
        const programmateurQuery = query(
          collection(db, 'programmateurs'),
          orderBy('nom', 'asc')
        );
        const programmateursSnapshot = await getDocs(programmateurQuery);
        const programmateursList = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursList);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lieux-programmateurs-tab">
      <div className="row">
        <div className="col-md-6">
          <h3>Lieux</h3>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Capacité</th>
                </tr>
              </thead>
              <tbody>
                {lieux.map(lieu => (
                  <tr key={lieu.id}>
                    <td>{lieu.nom}</td>
                    <td>{lieu.ville}</td>
                    <td>{lieu.capacite || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        
        <div className="col-md-6">
          <h3>Programmateurs</h3>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Structure</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {programmateurs.map(prog => (
                  <tr key={prog.id}>
                    <td>{prog.prenom} {prog.nom}</td>
                    <td>{prog.structure || 'N/A'}</td>
                    <td>{prog.email || prog.telephone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContratsPage = () => {
  const [key, setKey] = useState('contrats');

  return (
    <div className="contrats-page-container">
      <Tabs
        id="contrats-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-4"
      >
        <Tab eventKey="contrats" title="Contrats">
          <ContratsTab />
        </Tab>
        <Tab eventKey="concerts" title="Concerts">
          <ConcertsTab />
        </Tab>
        <Tab eventKey="lieux-programmateurs" title="Lieux & Programmateurs">
          <LieuxProgrammateursTab />
        </Tab>
      </Tabs>

      <Routes>
        <Route path="/templates" element={<ContratTemplatesPage />} />
        <Route path="/templates/:id" element={<ContratTemplatesEditPage />} />
      </Routes>
    </div>
  );
};

export default ContratsPage;
