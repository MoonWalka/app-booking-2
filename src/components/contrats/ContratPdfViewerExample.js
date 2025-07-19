import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import ContratPdfViewerEnhanced from './ContratPdfViewerEnhanced';
import ContratPdfViewerNative from './ContratPdfViewerNative';
import ContratPdfViewerWithControls from './ContratPdfViewerWithControls';

/**
 * Exemple d'utilisation du composant ContratPdfViewerEnhanced
 * Montre comment intégrer l'aperçu amélioré dans votre système existant
 */
function ContratPdfViewerExample() {
  const [showPdf, setShowPdf] = useState(false);
  const [message, setMessage] = useState('');

  // Exemple de contenu HTML pour l'aperçu
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 40px;
          color: #333;
        }
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #3498db;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h2 {
          color: #34495e;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .signature-block {
          display: flex;
          justify-content: space-between;
          margin-top: 80px;
        }
        .signature-box {
          width: 45%;
          text-align: center;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
          height: 40px;
        }
        @page {
          size: A4;
          margin: 2cm;
        }
        @media print {
          body {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>CONTRAT DE CESSION</h1>
      
      <div class="header">
        <div>
          <strong>ENTRE :</strong><br>
          L'ORGANISATEUR<br>
          Festival Example<br>
          123 rue de la Musique<br>
          75000 Paris
        </div>
        <div>
          <strong>ET :</strong><br>
          L'ARTISTE<br>
          Groupe Example<br>
          456 avenue du Rock<br>
          69000 Lyon
        </div>
      </div>

      <div class="section">
        <h2>Article 1 - OBJET</h2>
        <p>Le présent contrat a pour objet la cession du droit d'exploitation d'un spectacle.</p>
      </div>

      <div class="section">
        <h2>Article 2 - ENGAGEMENT</h2>
        <p>L'artiste s'engage à donner sa représentation le <strong>15 juillet 2024</strong> à <strong>21h00</strong>.</p>
      </div>

      <div class="section">
        <h2>Article 3 - CONDITIONS FINANCIÈRES</h2>
        <p>L'organisateur s'engage à verser à l'artiste la somme de <strong>5000 € TTC</strong>.</p>
      </div>

      <div class="section">
        <h2>Article 4 - CONDITIONS TECHNIQUES</h2>
        <p>L'organisateur s'engage à mettre à disposition le matériel technique selon la fiche technique fournie.</p>
      </div>

      <div class="signature-block">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>L'ORGANISATEUR<br>Fait à _________, le _________</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>L'ARTISTE<br>Fait à _________, le _________</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // URLs de PDF de test
  const pdfUrls = {
    // PDF de test Mozilla (fonctionne mieux avec CORS)
    mozilla: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    // Alternative : PDF de test Adobe
    adobe: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
    // PDF local si vous en avez un dans public/
    local: '/sample.pdf'
  };
  
  // Utiliser le PDF Mozilla par défaut
  const pdfUrl = pdfUrls.mozilla;

  // Gestionnaire de téléchargement
  const handleDownload = () => {
    setMessage('Génération du PDF en cours...');
    // Ici, vous appelleriez votre fonction Firebase pour générer le PDF
    setTimeout(() => {
      setMessage('PDF téléchargé avec succès !');
      setTimeout(() => setMessage(''), 3000);
    }, 2000);
  };

  // Gestionnaire d'impression
  const handlePrint = () => {
    setMessage('Préparation de l\'impression...');
    setTimeout(() => {
      setMessage('Document envoyé à l\'imprimante');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <h4>Démonstration de l'aperçu PDF amélioré</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant="info" dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={() => setShowPdf(!showPdf)}
              className="me-2"
            >
              {showPdf ? 'Afficher aperçu HTML' : 'Afficher aperçu PDF'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => window.location.reload()}
            >
              Rafraîchir
            </Button>
          </div>

          <Alert variant="info" className="mb-3">
            <strong>🍎 Sur Safari ?</strong> Les contrôles natifs sont cachés. Utilisez :
            <ul className="mb-0 mt-2">
              <li><strong>Cmd +/-</strong> pour zoomer</li>
              <li><strong>Survol en bas</strong> pour voir les contrôles</li>
              <li><strong>Clic droit</strong> pour plus d'options</li>
            </ul>
            Ou utilisez la version avec contrôles personnalisés ci-dessous 👇
          </Alert>

          <div style={{ height: '800px', backgroundColor: '#525659', padding: '10px', borderRadius: '8px' }}>
            <ContratPdfViewerNative
              pdfUrl={showPdf ? pdfUrl : null}
              htmlContent={!showPdf ? htmlContent : null}
              type={showPdf ? 'pdf' : 'html'}
              height="100%"
              title="Aperçu avec contrôles natifs"
            />
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5>🎆 Version avec contrôles personnalisés (fonctionne sur tous les navigateurs)</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="success" className="mb-3">
            <strong>✅ Exemple avec un contrat HTML local</strong>
            <p className="mb-0">Voici comment le composant fonctionne avec un vrai contrat. Les contrôles de zoom et d'impression sont fonctionnels !</p>
          </Alert>
          
          <div style={{ height: '700px' }}>
            <ContratPdfViewerWithControls
              pdfUrl="/sample-contract.html"
              height="100%"
            />
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5>Comment utiliser ces composants</h5>
        </Card.Header>
        <Card.Body>
          <pre className="bg-light p-3 rounded">
{`import ContratPdfViewerEnhanced from './ContratPdfViewerEnhanced';

// Dans votre composant de génération de contrat :
<ContratPdfViewerEnhanced
  pdfUrl={pdfUrl}              // URL du PDF généré
  htmlContent={htmlContent}    // Contenu HTML pour aperçu
  previewType="html"           // "html" ou "pdf"
  fileName="contrat-2024.pdf"  // Nom du fichier
  onDownload={handleDownload}  // Callback téléchargement
  onPrint={handlePrint}        // Callback impression
  height="750px"               // Hauteur du viewer
/>`}
          </pre>

          <h6 className="mt-3">Fonctionnalités incluses :</h6>
          <ul>
            <li>✅ Aperçu HTML instantané avec styles d'impression</li>
            <li>✅ Affichage PDF natif via balise object</li>
            <li>✅ Bouton d'impression directe (adapté au type d'aperçu)</li>
            <li>✅ Téléchargement du PDF sans regénération</li>
            <li>✅ Ouverture dans un nouvel onglet</li>
            <li>✅ Indicateurs de chargement et gestion d'erreurs</li>
            <li>✅ Interface responsive</li>
            <li>✅ Support du thème sombre</li>
          </ul>

          <h6 className="mt-3">Intégration avec votre système :</h6>
          <ol>
            <li>Remplacez l'iframe actuel par ce composant</li>
            <li>Passez l'URL du PDF généré par Puppeteer</li>
            <li>Utilisez les callbacks pour vos actions custom</li>
            <li>Le composant gère automatiquement l'impression et le téléchargement</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContratPdfViewerExample;