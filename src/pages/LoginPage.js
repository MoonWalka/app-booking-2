import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase-service';
import styles from './LoginPage.module.css';

// Note: Les imports utilisent React Bootstrap pour les composants UI, ajoutent un hook useAuth
// et importent '@styles/index.css' au lieu d'un fichier CSS spécifique
// Assurez-vous que ces dépendances sont installées et que le hook useAuth est implémenté

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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
    if (!email || !password || (isSignUp && (!confirmPassword || !firstName || !lastName))) {
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

    // Validations spécifiques à l'inscription
    if (isSignUp) {
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        // 🔒 SÉCURITÉ : Création de compte Firebase sécurisée
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Mise à jour du profil utilisateur avec le nom
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });
        
        console.log('✅ Inscription réussie pour:', user.email);
        setSuccess(true);
        setLoading(false);
        
        // Redirection vers l'onboarding après 1 seconde
        setTimeout(() => {
          navigate('/onboarding?action=create');
        }, 1000);
        
      } else {
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
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
      
      // Gestion sécurisée des erreurs d'authentification
      let errorMessage = isSignUp ? 'Une erreur est survenue lors de l\'inscription' : 'Une erreur est survenue lors de la connexion';
      
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
        case 'auth/email-already-in-use':
          errorMessage = 'Un compte existe déjà avec cet email';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        default:
          errorMessage = isSignUp ? 'Erreur lors de l\'inscription. Veuillez réessayer.' : 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
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

  // Basculer entre connexion et inscription
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess(false);
    // Vider les champs spécifiques à l'inscription
    if (isSignUp) {
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
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
          <div className={styles.modeSelector}>
            <button
              type="button"
              className={`${styles.modeButton} ${!isSignUp ? styles.active : ''}`}
              onClick={toggleMode}
              disabled={loading}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${isSignUp ? styles.active : ''}`}
              onClick={toggleMode}
              disabled={loading}
            >
              Inscription
            </button>
          </div>
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

          {/* Formulaire de connexion/inscription */}
          <form onSubmit={handleSubmit}>
            {/* Champs spécifiques à l'inscription */}
            {isSignUp && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.formLabel}>
                      <i className="bi bi-person-fill"></i>
                      Prénom
                    </label>
                    <div className={styles.inputGroup}>
                      <i className={`${styles.inputIcon} bi bi-person`}></i>
                      <input
                        type="text"
                        className={`${styles.formControl} ${styles.withIcon}`}
                        id="firstName"
                        name="firstName"
                        placeholder="Votre prénom"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onInput={hideErrorAlert}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.formLabel}>
                      <i className="bi bi-person-fill"></i>
                      Nom
                    </label>
                    <div className={styles.inputGroup}>
                      <i className={`${styles.inputIcon} bi bi-person`}></i>
                      <input
                        type="text"
                        className={`${styles.formControl} ${styles.withIcon}`}
                        id="lastName"
                        name="lastName"
                        placeholder="Votre nom"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onInput={hideErrorAlert}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
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
                  placeholder={isSignUp ? "Choisissez un mot de passe (min. 6 caractères)" : "Votre mot de passe"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={hideErrorAlert}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            {/* Confirmation mot de passe pour l'inscription */}
            {isSignUp && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <i className="bi bi-shield-lock-fill"></i>
                  Confirmer le mot de passe
                </label>
                <div className={styles.inputGroup}>
                  <i className={`${styles.inputIcon} bi bi-lock`}></i>
                  <input
                    type="password"
                    className={`${styles.formControl} ${styles.withIcon}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirmez votre mot de passe"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onInput={hideErrorAlert}
                    onKeyDown={handleKeyDown}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`${styles.loginButton} ${success ? styles.success : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>{isSignUp ? 'Inscription en cours...' : 'Connexion en cours...'}</span>
                </>
              ) : success ? (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{isSignUp ? 'Inscription réussie !' : 'Connexion réussie !'}</span>
                </>
              ) : (
                <>
                  <i className={isSignUp ? "bi bi-person-plus" : "bi bi-shield-lock-fill"}></i>
                  <span>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</span>
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
