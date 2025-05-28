import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import FormField from '@/components/ui/FormField';

// Note: Les imports utilisent React Bootstrap pour les composants UI, ajoutent un hook useAuth
// et importent '@styles/index.css' au lieu d'un fichier CSS spécifique
// Assurez-vous que ces dépendances sont installées et que le hook useAuth est implémenté

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation d'authentification
      if (email === 'test@example.com' && password === 'password') {
        // Redirection vers le dashboard après connexion réussie
        navigate('/');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Version React Bootstrap de la branche refacto-structure-scriptshell - pour implémentation future
  /*
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Connexion</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </div>
              </Form>
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Pour les tests, utilisez: test@example.com / password
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
  */
  
  // Version avec les composants standardisés TourCraft
  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <Card 
            title="Connexion"
            variant="primary"
          >
            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <FormField
                type="email"
                id="email"
                name="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
              
              <FormField
                type="password"
                id="password"
                name="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
              />
              
              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={loading ? null : <i className="bi bi-key"></i>}
                  className="w-100"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </div>
            </form>
            
            <div className="mt-3 text-center">
              <small className="text-muted">
                Pour les tests, utilisez: test@example.com / password
              </small>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
