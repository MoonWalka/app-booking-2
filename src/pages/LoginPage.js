import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase-service';
import styles from './LoginPage.module.css';

// Note: Les imports utilisent React Bootstrap pour les composants UI, ajoutent un hook useAuth
// et importent '@styles/index.css' au lieu d'un fichier CSS spécifique
// Assurez-vous que ces dépendances sont installées et que le hook useAuth est implémenté

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Focus automatique sur le premier champ au chargement
  useEffect(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation client basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format d\'email invalide');
      setLoading(false);
      return;
    }

    try {
      // 🔒 SÉCURITÉ : Authentification Firebase sécurisée
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Connexion réussie pour:', user.email);
      
      // Afficher le succès avant la redirection
      setSuccess(true);
      setLoading(false);
      
      // Redirection vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setLoading(false);
      
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
          errorMessage = 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
      }
      
      setError(errorMessage);
    }
  };

  // Masquer l'alerte d'erreur quand l'utilisateur tape
  const hideErrorAlert = () => {
    if (error) {
      setError('');
    }
  };

  // Gestion des touches clavier pour navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target.id === 'email' && email) {
        document.getElementById('password').focus();
      } else if (e.target.id === 'password' && password) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* En-tête avec logo et titre */}
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            <i className="bi bi-music-note-beamed"></i>
          </div>
          <h1 className={styles.loginTitle}>TourCraft</h1>
          <p className={styles.loginSubtitle}>Plateforme de gestion de concerts</p>
        </div>

        {/* Carte de connexion */}
        <div className={styles.loginCard}>
          {/* Alerte d'erreur */}
          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                <i className="bi bi-envelope-fill"></i>
                Adresse email
              </label>
              <div className={styles.inputGroup}>
                <i className={`${styles.inputIcon} bi bi-envelope`}></i>
                <input
                  type="email"
                  className={`${styles.formControl} ${styles.withIcon}`}
                  id="email"
                  name="email"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={hideErrorAlert}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                <i className="bi bi-shield-lock-fill"></i>
                Mot de passe
              </label>
              <div className={styles.inputGroup}>
                <i className={`${styles.inputIcon} bi bi-lock`}></i>
                <input
                  type="password"
                  className={`${styles.formControl} ${styles.withIcon}`}
                  id="password"
                  name="password"
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={hideErrorAlert}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.loginButton} ${success ? styles.success : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Connexion en cours...</span>
                </>
              ) : success ? (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Connexion réussie !</span>
                </>
              ) : (
                <>
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Informations de sécurité */}
        <div className={styles.securityInfo}>
          <p>
            <i className="bi bi-shield-check"></i>
            Connexion sécurisée avec Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
