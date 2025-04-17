import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
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
        // Utiliser la nouvelle collection 'contrats'
        const contratsQuery = query(
          collection(db, 'contrats'), 
          orderBy('createdAt', 'desc')
        );
        const contratsSnapshot = await getDocs(contratsQuery);
        
        const contratsList = [];
        
        for (const contratDoc of contratsSnapshot.docs) {
          const contratData = contratDoc.data();
          
          // Récupérer les données du concert associé directement par ID
          let concertData = null;
          if (contratData.concertId) {
            try {
              const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
              if (concertDoc.exists()) {
                concertData = { id: concertDoc.id, ...concertDoc.data() };
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du concert:', err);
            }
          }
          
          // Récupérer les données du modèle de contrat
          let templateData = null;
          if (contratData.templateId) {
            try {
              const templateDoc = await getDoc(doc(db, 'contratTemplates', contratData.templateId));
              if (templateDoc.exists()) {
                templateData = { id: templateDoc.id, ...templateDoc.data() };
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du modèle:', err);
            }
          }
          
          contratsList.push({
            id: contratDoc.id,
            ...contratData,
            concert: concertData,
            template: templateData
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'generated':
        return 'Généré';
      case 'sent':
        return 'Envoyé';
      case 'signed':
        return 'Signé';
      default:
        return 'Brouillon';
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
    <div className="contrats-list-container">
      <div className="contrats-header">
        <h2>Contrats générés</h2>
        <Link to="/parametres/contrats" className="btn btn-outline-primary">
          <i className="bi bi-gear me-2"></i>Gérer les modèles
        </Link>
      </div>
      
      <div className="contrats-grid">
        {contrats.map(contrat => (
          <div 
            key={contrat.id} 
            className={`contrat-card contrat-status-${contrat.status || 'generated'}`}
            onClick={() => navigate(`/contrats/${contrat.id}`)}
          >
            <div className="contrat-header">
              <h3>{contrat.concert?.titre || 'Contrat sans titre'}</h3>
              <span className={`status-badge status-${contrat.status || 'generated'}`}>
                {getStatusLabel(contrat.status)}
              </span>
            </div>
            <div className="contrat-info">
              <p>
                <i className="bi bi-calendar3 me-2"></i>
                {contrat.createdAt ? 
                  `Créé le ${new Date(contrat.createdAt.seconds * 1000).toLocaleDateString('fr-FR')}` :
                  'Date de création inconnue'
                }
              </p>
              {contrat.dateEnvoi && (
                <p>
                  <i className="bi bi-envelope me-2"></i>
                  Envoyé le {new Date(contrat.dateEnvoi.seconds * 1000).toLocaleDateString('fr-FR')}
                </p>
              )}
              {contrat.concert && (
                <p>
                  <i className="bi bi-music-note me-2"></i>
                  Concert: {contrat.concert.titre || 'Sans titre'}
                </p>
              )}
              {contrat.template && (
                <p>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Modèle: {contrat.template.name || 'Sans nom'}
                </p>
              )}
            </div>
            <div className="contrat-actions">
              {contrat.pdfUrl && (
                <a 
                  href={contrat.pdfUrl} 
                  className="btn btn-sm btn-outline-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-file-pdf me-1"></i> Voir PDF
                </a>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/contrats/${contrat.id}`);
                }}
              >
                <i className="bi bi-eye me-1"></i> Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContratsPage = () => {
  return (
    <div className="contrats-page-container">
      <Routes>
        <Route path="/" element={<GeneratedContratsList />} />
        <Route path="/templates" element={<ContratTemplatesPage />} />
        <Route path="/templates/:id" element={<ContratTemplatesEditPage />} />
        {/* Les routes pour /contrats/generate/:concertId et /contrats/:contratId 
            sont gérées au niveau de App.js */}
      </Routes>
    </div>
  );
};

export default ContratsPage;
