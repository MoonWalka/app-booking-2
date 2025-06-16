import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Composant pour téléchargement direct du PDF existant
 * Route: /api/contrats/:contratId/download
 */
const ContratDownloadDirect = () => {
  const { contratId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const downloadExistingPdf = async () => {
      try {
        console.log('[ContratDownloadDirect] Récupération du contrat:', contratId);
        
        // Récupérer le document contrat depuis Firestore
        const contratDoc = await getDoc(doc(db, 'contrats', contratId));
        
        if (!contratDoc.exists()) {
          throw new Error('Contrat introuvable');
        }
        
        const contratData = contratDoc.data();
        console.log('[ContratDownloadDirect] Données contrat:', contratData);
        
        if (!contratData.pdfUrl) {
          throw new Error('Aucun PDF disponible pour ce contrat');
        }
        
        // Télécharger directement le PDF existant
        console.log('[ContratDownloadDirect] Téléchargement depuis:', contratData.pdfUrl);
        
        // Créer un lien temporaire pour forcer le téléchargement
        const link = document.createElement('a');
        link.href = contratData.pdfUrl;
        link.download = `Contrat_${contratId}.pdf`;
        link.target = '_blank';
        
        // Ajouter temporairement au DOM et cliquer
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        // Marquer comme succès
        setLoading(false);
        
        // Optionnel : fermer l'onglet après un délai
        setTimeout(() => {
          // window.close(); // Décommenter si vous voulez fermer l'onglet
        }, 2000);
        
      } catch (err) {
        console.error('[ContratDownloadDirect] Erreur:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    downloadExistingPdf();
  }, [contratId]);

  // État de chargement
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0d6efd',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>
          Téléchargement en cours...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ color: '#dc3545', textAlign: 'center' }}>
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <a 
            href={`/contrats/${contratId}`}
            style={{ 
              color: '#0d6efd', 
              textDecoration: 'none',
              border: '1px solid #0d6efd',
              padding: '8px 16px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '16px'
            }}
          >
            Voir le contrat
          </a>
        </div>
      </div>
    );
  }

  // État de succès
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ color: '#28a745', textAlign: 'center' }}>
        <h3>✅ Téléchargement réussi</h3>
        <p>Le contrat a été téléchargé avec succès.</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          Cette page peut être fermée.
        </p>
      </div>
    </div>
  );
};

export default ContratDownloadDirect;