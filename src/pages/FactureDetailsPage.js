import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useParametres } from '@/context/ParametresContext';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import factureService from '@/services/factureService';
import pdfService from '@/services/pdfService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/common/Spinner';
import styles from './ContratDetailsPage.module.css';

const FactureDetailsPage = () => {
  const { factureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { parametres } = useParametres();

  // Charger les détails de la facture
  useEffect(() => {
    const loadFacture = async () => {
      if (!user || !currentOrganization?.id || !factureId) {
        console.log('Missing required data:', { user: !!user, orgId: currentOrganization?.id, factureId });
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading facture:', factureId, 'from org:', currentOrganization.id);
        
        // Essayer plusieurs fois si nécessaire
        let attempts = 0;
        let factureData = null;
        
        while (attempts < 3 && !factureData) {
          try {
            factureData = await factureService.getFacture(factureId, currentOrganization.id);
            console.log('Facture loaded successfully:', factureData);
          } catch (err) {
            attempts++;
            console.log(`Tentative ${attempts}/3 échouée, erreur:`, err.message);
            if (attempts < 3) {
              // Attendre un peu avant de réessayer
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw err;
            }
          }
        }
        
        if (factureData) {
          setFacture(factureData);
        } else {
          throw new Error('Impossible de charger la facture après 3 tentatives');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la facture:', err);
        setError(err.message || 'Erreur lors du chargement de la facture');
      } finally {
        setLoading(false);
      }
    };

    loadFacture();
  }, [factureId, user, currentOrganization]);

  // Marquer comme payée
  const handleMarkAsPaid = async () => {
    if (!window.confirm('Marquer cette facture comme payée ?')) return;
    
    try {
      await factureService.updateFacture(
        factureId, 
        { status: 'paid', datePaiement: new Date() },
        currentOrganization.id,
        user.uid
      );
      
      // Recharger la facture
      const factureData = await factureService.getFacture(factureId, currentOrganization.id);
      setFacture(factureData);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour de la facture');
    }
  };

  // Marquer comme envoyée
  const handleMarkAsSent = async () => {
    if (!window.confirm('Marquer cette facture comme envoyée ?')) return;
    
    try {
      await factureService.updateFacture(
        factureId, 
        { status: 'sent', dateEnvoi: new Date() },
        currentOrganization.id,
        user.uid
      );
      
      // Recharger la facture
      const factureData = await factureService.getFacture(factureId, currentOrganization.id);
      setFacture(factureData);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour de la facture');
    }
  };

  // Supprimer la facture
  const handleDeleteFacture = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.')) return;
    
    try {
      await factureService.deleteFacture(factureId, currentOrganization.id);
      
      // Rediriger vers la liste des factures
      navigate('/factures');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  // Télécharger le PDF
  const handleDownloadPDF = async () => {
    if (!facture) return;
    
    setGenerating(true);
    
    try {
      // Charger les données nécessaires
      let concert = null;
      let structure = null;
      
      if (facture.concertId) {
        const concertDoc = await getDoc(doc(db, 'concerts', facture.concertId));
        if (concertDoc.exists()) {
          concert = { id: concertDoc.id, ...concertDoc.data() };
        }
      }
      
      if (facture.structureId) {
        const structureDoc = await getDoc(doc(db, 'structures', facture.structureId));
        if (structureDoc.exists()) {
          structure = { id: structureDoc.id, ...structureDoc.data() };
        }
      }
      
      // Charger le template
      const template = await factureService.getDefaultTemplateOrSystem(currentOrganization.id);
      
      // Préparer les variables
      const variables = await factureService.prepareFactureVariables({
        concert,
        structure,
        entreprise: parametres?.entreprise || {},
        montantHT: facture.montantHT,
        montantTotal: facture.montantTotal || facture.montantHT,
        tauxTVA: facture.tauxTVA,
        typeFacture: facture.typeFacture,
        pourcentageAcompte: facture.pourcentageAcompte,
        montantAcompte: facture.montantAcompte,
        lignesSupplementaires: facture.lignesSupplementaires || []
      }, currentOrganization.id);
      
      // Remplacer les variables dans le template
      const htmlContent = factureService.replaceVariables(
        template.content || template.bodyContent || '',
        variables
      );
      
      // Préparer le HTML complet
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture ${facture.numeroFacture}</title>
          <style>
            @page {
              size: A4;
              margin: 30px;
            }
            html, body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #333;
              font-size: 13px;
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
            }
            /* Conteneur principal avec contraintes A4 */
            .pdf-container {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
              box-sizing: border-box;
              overflow: hidden;
              position: relative;
            }
            /* Styles pour assurer la compatibilité avec l'aperçu */
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 6px;
              border: none;
            }
            /* Éviter les débordements */
            * {
              box-sizing: border-box;
            }
            .header {
              margin-bottom: 20px;
            }
            .invoice-details {
              margin-bottom: 15px;
            }
            .total-section {
              margin-top: 15px;
              text-align: right;
            }
            .footer {
              margin-top: 20px;
              font-size: 0.8em;
              color: #666;
            }
            /* Ajustements pour l'impression */
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }
              .pdf-container {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
      
      // Générer le PDF avec des options optimisées pour A4
      const pdfBlob = await pdfService.generatePdf(
        fullHtml,
        `Facture_${facture.numeroFacture}`,
        {
          format: 'A4',
          margin: {
            top: '30px',
            right: '30px',
            bottom: '30px',
            left: '30px'
          },
          printBackground: true,
          preferCSSPageSize: false
        }
      );
      
      // Télécharger le PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${facture.numeroFacture}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      alert('Erreur lors de la génération du PDF: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner />
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Erreur</h4>
        <p>{error || 'Facture introuvable'}</p>
        <hr />
        <button 
          className="btn btn-outline-danger"
          onClick={() => navigate(-1)}
        >
          Retour
        </button>
      </div>
    );
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'generated': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'sent': return 'Envoyée';
      case 'generated': return 'Générée';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Facture {facture.numeroFacture}</h2>
          <StatusBadge 
            status={facture.status} 
            variant={getStatusVariant(facture.status)}
          >
            {getStatusLabel(facture.status)}
          </StatusBadge>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </Button>
      </div>

      <div className={styles.content}>
        {/* Informations principales */}
        <Card className="mb-4">
          <h4>Informations de la facture</h4>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Numéro :</strong> {facture.numeroFacture}</p>
              <p><strong>Date de facture :</strong> {new Date(facture.dateFacture?.toDate ? facture.dateFacture.toDate() : facture.dateFacture).toLocaleDateString('fr-FR')}</p>
              <p><strong>Date d'échéance :</strong> {facture.dateEcheance ? new Date(facture.dateEcheance?.toDate ? facture.dateEcheance.toDate() : facture.dateEcheance).toLocaleDateString('fr-FR') : '-'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Montant HT :</strong> {facture.montantHT?.toFixed(2)} €</p>
              <p><strong>TVA ({facture.tauxTVA}%) :</strong> {facture.montantTVA?.toFixed(2)} €</p>
              <p><strong>Montant TTC :</strong> {facture.montantTTC?.toFixed(2)} €</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <h4>Actions</h4>
          <div className="d-flex gap-2">
            {facture.status === 'generated' && (
              <Button
                variant="info"
                onClick={handleMarkAsSent}
              >
                <i className="bi bi-send me-2"></i>
                Marquer comme envoyée
              </Button>
            )}
            
            {(facture.status === 'generated' || facture.status === 'sent') && (
              <Button
                variant="success"
                onClick={handleMarkAsPaid}
              >
                <i className="bi bi-check-circle me-2"></i>
                Marquer comme payée
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate(`/factures/generate/${facture.concertId}`)}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Régénérer
            </Button>
            
            <Button
              variant="primary"
              onClick={handleDownloadPDF}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Génération...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Télécharger PDF
                </>
              )}
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDeleteFacture}
            >
              <i className="bi bi-trash me-2"></i>
              Supprimer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FactureDetailsPage;