#!/bin/bash

# Script pour créer un environnement de développement en mode test CSS
# Ce script met en place un environnement de développement isolé pour tester
# les modifications CSS sans affecter l'application principale.

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Création de l'environnement de test CSS ===${NC}"

# 1. Créer un répertoire de sauvegarde avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="dev_mode_backup_${TIMESTAMP}"

echo -e "${YELLOW}Création d'une sauvegarde dans ${BACKUP_DIR}...${NC}"

# Créer le répertoire de sauvegarde
mkdir -p ${BACKUP_DIR}

# 2. Sauvegarder les fichiers de configuration pertinents
cp package.json ${BACKUP_DIR}/
cp craco.config.js ${BACKUP_DIR}/ 2>/dev/null || :
cp .env ${BACKUP_DIR}/ 2>/dev/null || :
cp jsconfig.json ${BACKUP_DIR}/ 2>/dev/null || :

# 3. Créer un fichier CSS de test qui sera chargé globalement pour le mode test
echo -e "${YELLOW}Création du fichier de test CSS...${NC}"

cat > src/styles/test-mode.css << EOL
/**
 * Mode de test CSS
 * Ce fichier est chargé uniquement en mode test pour faciliter
 * le développement et la vérification des corrections CSS.
 */

/* Bannière de mode test */
body::before {
  content: "MODE TEST CSS - Les modifications ne sont pas en production";
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--tc-warning-color, #ffc107);
  color: var(--tc-dark-color, #212529);
  text-align: center;
  padding: 5px;
  font-size: 14px;
  z-index: 9999;
  font-weight: bold;
}

/* Surlignage des éléments avec styles directs */
[style*="color"], [style*="background"], [style*="margin"], [style*="padding"], [style*="font-size"] {
  outline: 2px dashed rgba(255, 0, 0, 0.5);
}

/* Grid de référence pour faciliter l'alignement - activé avec .show-grid sur body */
body.show-grid::after {
  content: "";
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 255, 0.05) 0%,
    rgba(0, 0, 255, 0.05) 50%,
    rgba(0, 0, 255, 0.02) 50%,
    rgba(0, 0, 255, 0.02) 100%
  );
  background-size: calc(100% / 12) 100%;
  pointer-events: none;
  z-index: 9998;
}

/* Contour des éléments pour une meilleure visualisation des marges */
.test-mode-active .container,
.test-mode-active .row,
.test-mode-active .col,
.test-mode-active [class*="col-"] {
  position: relative;
}

.test-mode-active .container::after,
.test-mode-active .row::after,
.test-mode-active .col::after,
.test-mode-active [class*="col-"]::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 1px dashed rgba(0, 0, 255, 0.2);
  pointer-events: none;
}

/* Utilitaires de test */
.test-mode-highlight {
  background-color: rgba(255, 255, 0, 0.3) !important;
  outline: 2px solid rgba(255, 0, 0, 0.7) !important;
}
EOL

# 4. Créer une page de test qui affiche les composants UI
echo -e "${YELLOW}Création de la page de test des composants UI...${NC}"

mkdir -p src/pages/test

cat > src/pages/test/StyleTestPage.js << EOL
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Importer les styles de test
import '../../styles/test-mode.css';

// Composants UI à tester
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button as TCButton from '../../components/ui/Button';
import InfoPanel from '../../components/ui/InfoPanel';
import Spinner from '../../components/ui/Spinner';

const StyleTestPage = () => {
  const [showGrid, setShowGrid] = useState(false);
  const [testModeActive, setTestModeActive] = useState(false);

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    if (!showGrid) {
      document.body.classList.add('show-grid');
    } else {
      document.body.classList.remove('show-grid');
    }
  };

  const toggleTestMode = () => {
    setTestModeActive(!testModeActive);
    if (!testModeActive) {
      document.body.classList.add('test-mode-active');
    } else {
      document.body.classList.remove('test-mode-active');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Page de test des composants UI</h1>
          <p className="lead">
            Cette page permet de tester l'apparence des composants UI et de vérifier les corrections CSS.
          </p>
          <div className="mb-3">
            <Link to="/" className="btn btn-secondary mr-2">Retour à l'accueil</Link>
            <Button variant="outline-primary" onClick={toggleGrid} className="mx-2">
              {showGrid ? 'Masquer' : 'Afficher'} la grille
            </Button>
            <Button variant="outline-warning" onClick={toggleTestMode} className="mx-2">
              {testModeActive ? 'Désactiver' : 'Activer'} le mode test
            </Button>
          </div>
        </Col>
      </Row>

      <hr className="my-4" />

      <Row className="mb-4">
        <Col lg={6}>
          <h2>Boutons</h2>
          <div className="mb-3">
            <h4>Boutons Bootstrap originaux</h4>
            <Button variant="primary" className="m-1">Primary</Button>
            <Button variant="secondary" className="m-1">Secondary</Button>
            <Button variant="success" className="m-1">Success</Button>
            <Button variant="danger" className="m-1">Danger</Button>
            <Button variant="warning" className="m-1">Warning</Button>
            <Button variant="info" className="m-1">Info</Button>
          </div>
          
          <div className="mb-3">
            <h4>Boutons TourCraft</h4>
            <TCButton variant="primary" className="m-1">Primary</TCButton>
            <TCButton variant="secondary" className="m-1">Secondary</TCButton>
            <TCButton variant="success" className="m-1">Success</TCButton>
            <TCButton variant="danger" className="m-1">Danger</TCButton>
            <TCButton variant="warning" className="m-1">Warning</TCButton>
            <TCButton variant="info" className="m-1">Info</TCButton>
          </div>
        </Col>
        
        <Col lg={6}>
          <h2>Badges</h2>
          <div className="mb-3">
            <h4>Badges Bootstrap originaux</h4>
            <span className="badge badge-primary m-1">Primary</span>
            <span className="badge badge-secondary m-1">Secondary</span>
            <span className="badge badge-success m-1">Success</span>
            <span className="badge badge-danger m-1">Danger</span>
            <span className="badge badge-warning m-1">Warning</span>
            <span className="badge badge-info m-1">Info</span>
          </div>
          
          <div className="mb-3">
            <h4>Badges TourCraft</h4>
            <Badge variant="primary" className="m-1">Primary</Badge>
            <Badge variant="secondary" className="m-1">Secondary</Badge>
            <Badge variant="success" className="m-1">Success</Badge>
            <Badge variant="danger" className="m-1">Danger</Badge>
            <Badge variant="warning" className="m-1">Warning</Badge>
            <Badge variant="info" className="m-1">Info</Badge>
          </div>
        </Col>
      </Row>

      <hr className="my-4" />

      <Row className="mb-4">
        <Col lg={6}>
          <h2>Cards</h2>
          <div className="mb-3">
            <h4>Card Bootstrap original</h4>
            <div className="card">
              <div className="card-header">Header</div>
              <div className="card-body">
                <h5 className="card-title">Card Title</h5>
                <p className="card-text">Contenu de la carte avec Bootstrap standard.</p>
                <Button variant="primary">Action</Button>
              </div>
              <div className="card-footer">Footer</div>
            </div>
          </div>
          
          <div className="mb-3">
            <h4>Card TourCraft</h4>
            <Card>
              <Card.Header>Header</Card.Header>
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>Contenu de la carte avec composant TourCraft.</Card.Text>
                <TCButton variant="primary">Action</TCButton>
              </Card.Body>
              <Card.Footer>Footer</Card.Footer>
            </Card>
          </div>
        </Col>
        
        <Col lg={6}>
          <h2>Autres composants</h2>
          
          <div className="mb-3">
            <h4>InfoPanel</h4>
            <InfoPanel type="primary">Ceci est un message d'information primaire.</InfoPanel>
            <InfoPanel type="success">Opération réussie avec succès!</InfoPanel>
            <InfoPanel type="warning">Attention, vérifiez ces informations.</InfoPanel>
            <InfoPanel type="danger">Une erreur critique s'est produite.</InfoPanel>
          </div>
          
          <div className="mb-3">
            <h4>Spinner</h4>
            <div className="d-flex align-items-center">
              <Spinner size="sm" className="mr-2" />
              <Spinner className="mr-2" />
              <Spinner size="lg" />
            </div>
          </div>
        </Col>
      </Row>
      
      <hr className="my-4" />
      
      <Row>
        <Col>
          <h2>Variables CSS</h2>
          <div className="row">
            <div className="col-md-4 mb-3">
              <h4>Couleurs primaires</h4>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-primary-color, #0d6efd)', color: 'white', marginBottom: '10px' }}>
                --tc-primary-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-secondary-color, #6c757d)', color: 'white', marginBottom: '10px' }}>
                --tc-secondary-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-success-color, #28a745)', color: 'white', marginBottom: '10px' }}>
                --tc-success-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-danger-color, #dc3545)', color: 'white', marginBottom: '10px' }}>
                --tc-danger-color
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <h4>Couleurs secondaires</h4>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-warning-color, #ffc107)', marginBottom: '10px' }}>
                --tc-warning-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-info-color, #17a2b8)', color: 'white', marginBottom: '10px' }}>
                --tc-info-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-light-color, #f8f9fa)', border: '1px solid #ddd', marginBottom: '10px' }}>
                --tc-light-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-dark-color, #343a40)', color: 'white', marginBottom: '10px' }}>
                --tc-dark-color
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <h4>Tailles standard</h4>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-sm, 0.25rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-sm (0.25rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-md, 0.5rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-md (0.5rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-lg, 1rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-lg (1rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-xl, 1.5rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-xl (1.5rem)
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StyleTestPage;
EOL

# 5. Ajouter la route de test dans App.js
echo -e "${YELLOW}Ajout de la route de test dans App.js...${NC}"

# Vérifier si App.js existe
if [ -f src/App.js ]; then
  # Sauvegarder l'original
  cp src/App.js ${BACKUP_DIR}/
  
  # Ajouter la route de test - nous utilisons sed pour l'insérer avant la dernière Route
  sed -i.bak '/Route.*path=".*"/i\          <Route path="/test-style" element={<StyleTestPage />} \/>' src/App.js
  
  # Ajouter l'import du composant StyleTestPage
  sed -i.bak '/import React/a\import StyleTestPage from "./pages/test/StyleTestPage";' src/App.js
else
  echo -e "${RED}Erreur: src/App.js non trouvé${NC}"
fi

# 6. Mettre à jour package.json pour ajouter les scripts de test CSS
echo -e "${YELLOW}Mise à jour de package.json avec les scripts de test...${NC}"

# On utilise jq si disponible, sinon on utilise sed
if command -v jq >/dev/null 2>&1; then
  jq '.scripts += {"start:test-css": "REACT_APP_CSS_TEST_MODE=true npm start", "css:fix": "node scripts/check-css-vars.js --fix", "bootstrap:fix": "node scripts/audit-bootstrap.js --fix"}' package.json > package.json.new
  mv package.json.new package.json
else
  # Backup
  cp package.json package.json.bak
  
  # Ajouter les scripts avec sed
  sed -i.bak 's/"scripts": {/"scripts": {\n    "start:test-css": "REACT_APP_CSS_TEST_MODE=true npm start",\n    "css:fix": "node scripts\/check-css-vars.js --fix",\n    "bootstrap:fix": "node scripts\/audit-bootstrap.js --fix",/g' package.json
fi

# 7. Créer un fichier README pour expliquer comment utiliser cet environnement
echo -e "${YELLOW}Création de la documentation d'environnement de test...${NC}"

cat > CSS_TEST_ENV_README.md << EOL
# Environnement de test CSS - TourCraft

Cet environnement permet de tester les modifications CSS sans affecter l'application principale.

## Démarrage

Pour lancer l'application en mode test CSS :

\`\`\`bash
npm run start:test-css
\`\`\`

## Fonctionnalités disponibles

1. **Page de test CSS** : Accessible à l'URL \`/test-style\`
2. **Indicateurs visuels** :
   - Bannière de mode test en bas de l'écran
   - Surbrillance des éléments avec styles inline
   - Grille visuelle pour aligner les éléments
3. **Outils de correction** :
   - \`npm run css:fix\` pour standardiser les variables CSS
   - \`npm run bootstrap:fix\` pour corriger les classes Bootstrap

## Comment utiliser

1. Accédez à \`/test-style\` pour voir la page de démonstration des composants
2. Utilisez les boutons "Afficher la grille" et "Activer le mode test" pour vérifier les alignements
3. Naviguez dans l'application pour voir les indicateurs visuels sur toutes les pages
4. Effectuez vos corrections CSS
5. Vérifiez les changements en rechargeant l'application

## Restauration

Pour revenir à l'environnement normal, utilisez :

\`\`\`bash
npm start
\`\`\`

Une sauvegarde des fichiers modifiés a été créée dans le dossier \`${BACKUP_DIR}\`.
EOL

echo -e "${GREEN}Configuration de l'environnement de test CSS terminée avec succès !${NC}"
echo -e "${GREEN}Consultez CSS_TEST_ENV_README.md pour plus d'informations sur l'utilisation.${NC}"
echo -e "${YELLOW}Pour démarrer l'environnement de test : npm run start:test-css${NC}"