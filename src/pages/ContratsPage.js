import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import ContratTemplatesPage from './contratTemplatesPage';
import ContratTemplatesEditPage from './contratTemplatesEditPage';
import '../style/contrats.css';

const GeneratedContratsList = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContrats = async () => {
      setLoading(true);
      try {
        const contratsQuery = query(
          collection(db, 'generatedContrats'), 
          orderBy('createdAt', 'desc')
        );
        const contratsSnapshot = await getDocs(contratsQuery);
        
        const contratsList = [];
        
        for (const contratDoc of contratsSnapshot.docs) {
          const contratData = contratDoc.data();
          
          // Récupérer les données du concert associé
          let concertData = null;
          if (contratData.concertId) {
            const concertSnapshot = await getDocs(query(
              collection(db, 'concerts'),
              where('id', '==', contratData.concertId)
            ));
            
            if (!concertSnapshot.empty) {
              concertData = concertSnapshot.docs[0].data();
            }
          }
          
          contratsList.push({
            id: contratDoc.id,
            ...contratData,
            concert: concertData
          });
        }
        
        setContrats(contratsList);
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContrats();
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
    <div className="contrats-list-container">
      <div className="contrats-header">
        <h2>Contrats générés</h2>
      </div>
      
      <div className="contrats-grid">
        {contrats.map(contrat => (
          <div key={contrat.id} className="contrat-card">
            <div className="contrat-header">
              <h3>{contrat.concert?.titre || 'Contrat sans titre'}</h3>
              <span className={`status-badge status-${contrat.status}`}>
                {contrat.status === 'draft' && 'Brouillon'}
                {contrat.status === 'sent' && 'Envoyé'}
                {contrat.status === 'signed' && 'Signé'}
              </span>
            </div>
            <div className="contrat-info">
              <p>
                <i className="bi bi-calendar3"></i>
                Créé le {new Date(contrat.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
              {contrat.concert && (
                <p>
                  <i className="bi bi-music-note"></i>
                  {contrat.concert.artisteNom}
                </p>
              )}
            </div>
            <div className="contrat-actions">
              <a 
                href={contrat.pdfUrl} 
                className="btn btn-sm btn-outline-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-file-pdf"></i> Voir PDF
              </a>
              {contrat.status === 'draft' && (
                <button className="btn btn-sm btn-outline-success">
                  <i className="bi bi-envelope"></i> Envoyer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContratsPage = () => {
  return (
    <Routes>
      <Route path="/" element={<GeneratedContratsList />} />
      <Route path="/templates" element={<ContratTemplatesPage />} />
      <Route path="/templates/:id" element={<ContratTemplatesEditPage />} />
    </Routes>
  );
};

export default ContratsPage;
