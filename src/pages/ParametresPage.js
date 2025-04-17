import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Form, Button, Card } from 'react-bootstrap';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ContratTemplatesPage from './contratTemplatesPage';
import ContratTemplatesEditPage from './contratTemplatesEditPage';

const ParametresPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('general');

  // Déterminer l'onglet actif en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/parametres/contrats')) {
      setActiveKey('contrats');
    } else if (path.includes('/parametres/account')) {
      setActiveKey('account');
    } else if (path.includes('/parametres/notifications')) {
      setActiveKey('notifications');
    } else if (path.includes('/parametres/appearance')) {
      setActiveKey('appearance');
    } else if (path.includes('/parametres/export')) {
      setActiveKey('export');
    } else if (path.includes('/parametres/entreprise')) {
      setActiveKey('entreprise');
    } else {
      setActiveKey('general');
    }
  }, [location]);

  // Gestionnaire pour le changement d'onglet
  const handleTabChange = (key) => {
    setActiveKey(key);
    
    // Naviguer vers la bonne route en fonction de l'onglet sélectionné
    switch(key) {
      case 'contrats':
        navigate('/parametres/contrats');
        break;
      case 'account':
        navigate('/parametres/account');
        break;
      case 'notifications':
        navigate('/parametres/notifications');
        break;
      case 'appearance':
        navigate('/parametres/appearance');
        break;
      case 'export':
        navigate('/parametres/export');
        break;
      case 'entreprise':
        navigate('/parametres/entreprise');
        break;
      default:
        navigate('/parametres');
        break;
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Paramètres</h2>
      
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'general'} 
                onClick={() => handleTabChange('general')}
              >
                Général
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'account'} 
                onClick={() => handleTabChange('account')}
              >
                Compte utilisateur
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'notifications'} 
                onClick={() => handleTabChange('notifications')}
              >
                Notifications
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'appearance'} 
                onClick={() => handleTabChange('appearance')}
              >
                Apparence
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'entreprise'} 
                onClick={() => handleTabChange('entreprise')}
              >
                Informations de l'entreprise
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'contrats'} 
                onClick={() => handleTabChange('contrats')}
              >
                Modèles de contrats
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeKey === 'export'} 
                onClick={() => handleTabChange('export')}
              >
                Import/Export
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={9}>
          <Routes>
            <Route path="/" element={
              <ParametresGeneralContent />
            } />
            <Route path="/account" element={
              <ParametresAccountContent />
            } />
            <Route path="/notifications" element={
              <ParametresNotificationsContent />
            } />
            <Route path="/appearance" element={
              <ParametresAppearanceContent />
            } />
            <Route path="/entreprise" element={
              <ParametresEntrepriseContent />
            } />
            <Route path="/contrats" element={
              <ContratTemplatesPage />
            } />
            <Route path="/contrats/:id" element={
              <ContratTemplatesEditPage />
            } />
            <Route path="/export" element={
              <ParametresExportContent />
            } />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

// Composant pour les informations de l'entreprise
const ParametresEntrepriseContent = () => {
  const [entrepriseInfo, setEntrepriseInfo] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    siteWeb: '',
    siret: '',
    codeAPE: '',
    logo: '',
    mentionsLegales: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les informations d'entreprise de Firestore
    const fetchEntrepriseInfo = async () => {
      try {
        const docRef = doc(db, 'parametres', 'entreprise');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEntrepriseInfo(docSnap.data());
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des infos de l'entreprise:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntrepriseInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrepriseInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'parametres', 'entreprise'), entrepriseInfo);
      alert("Informations de l'entreprise enregistrées avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des infos de l'entreprise:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Informations de l'entreprise</h3>
        <p className="text-muted">Ces informations apparaîtront dans les entêtes et pieds de page des contrats générés.</p>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom de l'entreprise</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={entrepriseInfo.nom}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Logo (URL)</Form.Label>
                <Form.Control
                  type="text"
                  name="logo"
                  value={entrepriseInfo.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Adresse</Form.Label>
            <Form.Control
              type="text"
              name="adresse"
              value={entrepriseInfo.adresse}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Code postal</Form.Label>
                <Form.Control
                  type="text"
                  name="codePostal"
                  value={entrepriseInfo.codePostal}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  name="ville"
                  value={entrepriseInfo.ville}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="text"
                  name="telephone"
                  value={entrepriseInfo.telephone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={entrepriseInfo.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Site web</Form.Label>
            <Form.Control
              type="text"
              name="siteWeb"
              value={entrepriseInfo.siteWeb}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SIRET</Form.Label>
                <Form.Control
                  type="text"
                  name="siret"
                  value={entrepriseInfo.siret}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code APE</Form.Label>
                <Form.Control
                  type="text"
                  name="codeAPE"
                  value={entrepriseInfo.codeAPE}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Mentions légales (pied de page)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="mentionsLegales"
              value={entrepriseInfo.mentionsLegales}
              onChange={handleChange}
              placeholder="Association loi 1901, etc."
            />
          </Form.Group>
          
          <Button type="submit" variant="primary">Enregistrer les informations</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};
// Les autres composants de contenu avec des retours JSX valides
const ParametresGeneralContent = () => (
  <Card>
    <Card.Body>
      <h3 className="mb-3">Paramètres généraux</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nom de l'application</Form.Label>
          <Form.Control type="text" defaultValue="TourCraft" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Langue</Form.Label>
          <Form.Select>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Format de date</Form.Label>
          <Form.Select>
            <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
            <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
            <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary">Enregistrer</Button>
      </Form>
    </Card.Body>
  </Card>
);

const ParametresAccountContent = () => (
  <Card>
    <Card.Body>
      <h3 className="mb-3">Compte utilisateur</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" defaultValue="user@example.com" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mot de passe actuel</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nouveau mot de passe</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirmer mot de passe</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Button variant="primary">Mettre à jour le compte</Button>
      </Form>
    </Card.Body>
  </Card>
);

const ParametresNotificationsContent = () => (
  <Card>
    <Card.Body>
      <h3 className="mb-3">Paramètres de notifications</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="email-notif"
            label="Recevoir des notifications par email"
            defaultChecked
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="concert-reminder"
            label="Rappels avant les concerts"
            defaultChecked
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Délai de rappel pour les concerts</Form.Label>
          <Form.Select>
            <option value="1">1 jour avant</option>
            <option value="2">2 jours avant</option>
            <option value="7">1 semaine avant</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary">Enregistrer</Button>
      </Form>
    </Card.Body>
  </Card>
);

const ParametresAppearanceContent = () => (
  <Card>
    <Card.Body>
      <h3 className="mb-3">Apparence</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Thème</Form.Label>
          <div>
            <Form.Check 
              inline
              type="radio"
              name="theme"
              id="light-theme"
              label="Clair"
              defaultChecked
            />
            <Form.Check 
              inline
              type="radio"
              name="theme"
              id="dark-theme"
              label="Sombre"
            />
            <Form.Check 
              inline
              type="radio"
              name="theme"
              id="system-theme"
              label="Système"
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Taille de police</Form.Label>
          <Form.Range 
            min="80"
            max="120"
            defaultValue="100"
          />
        </Form.Group>
        <Button variant="primary">Appliquer</Button>
      </Form>
    </Card.Body>
  </Card>
);

const ParametresExportContent = () => (
  <Card>
    <Card.Body>
      <h3 className="mb-3">Import / Export de données</h3>
      <div className="mb-4">
        <h5>Exporter les données</h5>
        <p>Téléchargez toutes vos données sous forme de fichier JSON ou CSV.</p>
        <div className="d-flex gap-2">
          <Button variant="outline-primary">Exporter en JSON</Button>
          <Button variant="outline-primary">Exporter en CSV</Button>
        </div>
      </div>
      
      <div>
        <h5>Importer des données</h5>
        <p>Importez des données depuis un fichier JSON ou CSV.</p>
        <Form.Group className="mb-3">
          <Form.Control type="file" />
          <Form.Text className="text-muted">
            Formats acceptés: .json, .csv
          </Form.Text>
        </Form.Group>
        <Button variant="primary">Importer</Button>
      </div>
    </Card.Body>
  </Card>
);


export default ParametresPage;
