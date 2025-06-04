import React from 'react';
import Card from '@/components/ui/Card';
import styles from './Dashboard.module.css';

// Imports modifiés de la branche refacto-structure-scriptshell - pour implémentation future
// Note: Les imports utilisent React Bootstrap pour les composants UI et ajoutent useState, useEffect, useNavigate
// Vous devrez vérifier que ces dépendances sont installées et configurées correctement

const DashboardPage = () => {
  // Code React Bootstrap de la branche refacto-structure-scriptshell - pour implémentation future
  /*
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    concerts: 0,
    programmateurs: 1,
    lieux: 1,
    contrats: 0
  });
  
  useEffect(() => {
    // Ici, vous pourriez récupérer des statistiques depuis Firebase
    // setStats({...});
  }, []);
  
  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <Row className="mt-4">
        <Col md={3} className="mb-4">
          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title>Concerts</Card.Title>
              <p className="card-text display-4">{stats.concerts}</p>
              <p className="card-text">Concerts à venir</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card bg="success" text="white">
            <Card.Body>
              <Card.Title>Programmateurs</Card.Title>
              <p className="card-text display-4">{stats.programmateurs}</p>
              <p className="card-text">Programmateurs actifs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card bg="info" text="white">
            <Card.Body>
              <Card.Title>Lieux</Card.Title>
              <p className="card-text display-4">{stats.lieux}</p>
              <p className="card-text">Lieux disponibles</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card bg="warning" text="dark">
            <Card.Body>
              <Card.Title>Contrats</Card.Title>
              <p className="card-text display-4">{stats.contrats}</p>
              <p className="card-text">Contrats en cours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Concerts à venir</Card.Header>
            <Card.Body>
              <p className="text-center">Aucun concert à venir</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Activité récente</Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Création du lieu "La Cigale"</li>
                <li className="list-group-item">Création du programmateur "Jean Dupont"</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
  */
  
  // Version actuelle avec composant Card standardisé
  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <div className={styles.dashboardStats}>
        <div className={styles.statCard}>
          <Card>
            <h5 className="card-title">Concerts</h5>
            <p className={styles.statValue}>0</p>
            <p className="card-text">Concerts à venir</p>
          </Card>
        </div>
        <div className={styles.statCard}>
          <Card>
            <h5 className="card-title">Programmateurs</h5>
            <p className={styles.statValue}>1</p>
            <p className="card-text">Programmateurs actifs</p>
          </Card>
        </div>
        <div className={styles.statCard}>
          <Card>
            <h5 className="card-title">Lieux</h5>
            <p className={styles.statValue}>1</p>
            <p className="card-text">Lieux disponibles</p>
          </Card>
        </div>
        <div className={styles.statCard}>
          <Card>
            <h5 className="card-title">Contrats</h5>
            <p className={styles.statValue}>0</p>
            <p className="card-text">Contrats en cours</p>
          </Card>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <Card
            title="Concerts à venir"
          >
            <p className="text-center">Aucun concert à venir</p>
          </Card>
        </div>
        <div className="col-md-6 mb-4">
          <Card
            title="Activité récente"
          >
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Création du lieu "La Cigale"</li>
              <li className="list-group-item">Création du programmateur "Jean Dupont"</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Note: La version React Bootstrap utilise les composants Card, Row, Col au lieu des classes Bootstrap,
// et ajoute un état local avec useState et useEffect pour potentiellement récupérer des données dynamiques.

export default DashboardPage;
