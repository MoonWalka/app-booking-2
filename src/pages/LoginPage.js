import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase-service';
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
      // 🔒 SÉCURITÉ : Authentification Firebase sécurisée
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Connexion réussie pour:', user.email);
      
      // Redirection vers le dashboard après connexion réussie
      navigate('/');
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Gestion sécurisée des erreurs d'authentification
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives échouées. Réessayez plus tard';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Problème de connexion réseau';
          break;
        default:
          errorMessage = 'Identifiants invalides';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Interface sécurisée - AUCUN identifiant de test affiché
  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <Card 
            title="Connexion Sécurisée"
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
                autoComplete="email"
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
                autoComplete="current-password"
              />
              
              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={loading ? null : <i className="bi bi-shield-lock"></i>}
                  className="w-100"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </div>
            </form>
            
            {/* 🔒 SÉCURITÉ : Plus d'identifiants de test affichés */}
            <div className="mt-3 text-center">
              <small className="text-muted">
                🔒 Connexion sécurisée avec Firebase Authentication
              </small>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
