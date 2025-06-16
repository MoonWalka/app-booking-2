import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContratDetails } from '@/hooks/contrats';
import { usePdfPreview } from '@/hooks/contrats';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper';

/**
 * Composant API pour le téléchargement direct de contrat PDF
 * Route: /api/contrats/:contratId/download
 */
const ContratDownloadAPI = () => {
  const { contratId } = useParams();
  
  // Hook pour récupérer les données du contrat
  const { 
    contrat, 
    concert, 
    template, 
    contact,
    lieu, 
    artiste, 
    structure,
    entreprise,
    loading, 
    error 
  } = useContratDetails(contratId);

  // Hook pour la génération PDF
  const { handleDownloadPdf } = usePdfPreview();

  useEffect(() => {
    // Déclencher le téléchargement automatique dès que les données sont chargées
    if (!loading && !error && contrat && concert && template) {
      console.log('[ContratDownloadAPI] Début téléchargement direct PDF');
      
      // Préparer les données pour le PDF - IMPORTANT: inclure le template !
      const pdfData = {
        contrat,
        concert,
        template,  // AJOUT CRUCIAL : le template doit être inclus
        contact,
        lieu,
        artiste,
        structure,
        entreprise
      };

      // Lancer le téléchargement immédiatement
      handleDownloadPdf(ContratPDFWrapper, pdfData)
        .then(() => {
          console.log('[ContratDownloadAPI] Téléchargement réussi');
          // Fermer l'onglet après téléchargement (optionnel)
          // window.close();
        })
        .catch((downloadError) => {
          console.error('[ContratDownloadAPI] Erreur téléchargement:', downloadError);
          // Rediriger vers la page du contrat en cas d'erreur
          window.location.href = `/contrats/${contratId}`;
        });
    }
  }, [loading, error, contrat, concert, template, contact, lieu, artiste, structure, entreprise, contratId, handleDownloadPdf]);

  // Affichage minimal pendant le chargement
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
          Préparation du téléchargement...
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

  // Affichage d'erreur
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
          <h3>Erreur</h3>
          <p>Impossible de télécharger le contrat.</p>
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

  // Contenu minimal - le téléchargement se fait automatiquement
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
        <h3>✅ Téléchargement en cours</h3>
        <p>Le téléchargement de votre contrat a commencé.</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Si le téléchargement ne commence pas automatiquement, 
          <a href={`/contrats/${contratId}`} style={{ color: '#0d6efd', marginLeft: '4px' }}>
            cliquez ici
          </a>
        </p>
      </div>
    </div>
  );
};

export default ContratDownloadAPI;