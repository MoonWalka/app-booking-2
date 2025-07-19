import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import ContratPdfViewerNative from './ContratPdfViewerNative';
import ContratPdfViewerSimple from './ContratPdfViewerSimple';

/**
 * Page de comparaison des différents viewers PDF
 */
function ContratPdfViewerComparison() {
  const [showRealPdf, setShowRealPdf] = useState(true);
  
  // URLs de PDF de test
  const pdfUrls = {
    // PDF de test multi-pages pour voir les contrôles de navigation
    multiPage: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    // Alternative : un PDF réel si vous avez une URL Firebase
    firebase: null // Remplacez par votre URL Firebase si disponible
  };

  const currentPdfUrl = pdfUrls.multiPage;

  // Contenu HTML pour l'aperçu
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        h1 { color: #333; text-align: center; }
        .info {
          background: #f0f0f0;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>Aperçu HTML du Contrat</h1>
      <div class="info">
        <h2>Mode Aperçu HTML</h2>
        <p>Cet aperçu s'affiche instantanément pendant que le PDF se génère.</p>
        <p>Une fois le PDF prêt, vous pouvez basculer vers l'affichage PDF avec tous les contrôles natifs du navigateur.</p>
      </div>
    </body>
    </html>
  `;

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Aperçu PDF avec Contrôles Natifs</h2>
      
      <Alert variant="info">
        <h5>ℹ️ À propos des contrôles PDF natifs</h5>
        <p className="mb-2">
          Lorsque vous affichez un PDF dans un iframe ou object, le navigateur affiche automatiquement ses contrôles PDF :
        </p>
        <ul className="mb-0">
          <li><strong>Chrome/Edge</strong> : Barre d'outils en haut avec zoom (25%-500%), navigation pages, rotation, impression, téléchargement</li>
          <li><strong>Firefox</strong> : Contrôles similaires avec zoom, navigation, mode présentation</li>
          <li><strong>Safari</strong> : Contrôles intégrés avec zoom et navigation</li>
        </ul>
      </Alert>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Options d'affichage</h4>
            <Button 
              variant={showRealPdf ? "primary" : "outline-primary"}
              onClick={() => setShowRealPdf(!showRealPdf)}
            >
              {showRealPdf ? '📄 Affichage PDF' : '📝 Affichage HTML'}
            </Button>
          </div>
        </Card.Header>
      </Card>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">🖼️ Méthode 1 : iframe (Recommandé)</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div style={{ height: '600px' }}>
                <ContratPdfViewerNative
                  pdfUrl={showRealPdf ? currentPdfUrl : null}
                  htmlContent={!showRealPdf ? htmlContent : null}
                  type={showRealPdf ? 'pdf' : 'html'}
                  height="100%"
                  title="Aperçu avec iframe"
                />
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              <small>
                <strong>Avantages :</strong> Contrôles PDF natifs complets, meilleure compatibilité, zoom fluide
              </small>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📑 Méthode 2 : object (Style ExtJS)</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div style={{ height: '600px', overflow: 'auto' }}>
                {showRealPdf ? (
                  <ContratPdfViewerSimple
                    pdfUrl={currentPdfUrl}
                    height="750"
                  />
                ) : (
                  <div style={{ padding: '20px', backgroundColor: '#f5f5f5', height: '100%' }}>
                    <p>La balise object ne supporte que les PDF, pas l'HTML.</p>
                    <p>Basculez en mode PDF pour voir le rendu.</p>
                  </div>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              <small>
                <strong>Note :</strong> Reproduction exacte du composant ExtJS, contrôles selon le navigateur
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5>💡 Intégration dans votre système</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Pour un aperçu simple avec contrôles natifs :</h6>
              <pre className="bg-light p-3 rounded">
{`<ContratPdfViewerNative
  pdfUrl={pdfUrlFromFirebase}
  type="pdf"
  height="750px"
/>`}
              </pre>
            </Col>
            <Col md={6}>
              <h6>Pour basculer entre HTML et PDF :</h6>
              <pre className="bg-light p-3 rounded">
{`<ContratPdfViewerNative
  pdfUrl={showPdf ? pdfUrl : null}
  htmlContent={!showPdf ? html : null}
  type={showPdf ? 'pdf' : 'html'}
/>`}
              </pre>
            </Col>
          </Row>

          <Alert variant="success" className="mt-3">
            <strong>✅ Résultat :</strong> Les utilisateurs verront automatiquement les contrôles PDF de leur navigateur 
            (zoom, impression, navigation) sans que vous ayez à les implémenter !
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContratPdfViewerComparison;