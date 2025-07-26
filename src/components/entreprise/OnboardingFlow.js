import React, { useState } from 'react';
import { createEntreprise, joinEntreprise } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import './OnboardingFlow.css';

const OnboardingFlow = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { loadUserEntreprises } = useEntreprise();
  
  // Vérifier les paramètres d'URL pour démarrer directement sur la bonne étape
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  // Récupérer les données du nouvel utilisateur depuis sessionStorage
  const newUserDataStr = sessionStorage.getItem('newUserData');
  const newUserData = newUserDataStr ? JSON.parse(newUserDataStr) : null;
  
  const getInitialStep = () => {
    if (action === 'create') return 'create';
    if (action === 'join') return 'join';
    return 'choice';
  };
  
  const [step, setStep] = useState(getInitialStep()); // 'choice', 'create', 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [entrepriseData, setEntrepriseData] = useState({
    name: '',
    type: 'salle_spectacle',
    description: '',
    settings: {
      timezone: 'Europe/Paris',
      currency: 'EUR'
    }
  });
  
  const [joinData, setJoinData] = useState({
    invitationCode: ''
  });

  const handleCreateEntreprise = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Création de l\'entreprise:', entrepriseData.name);
      
      // Passer les données utilisateur si disponibles
      const entrepriseId = await createEntreprise(entrepriseData, currentUser.uid, newUserData);
      console.log('✅ Entreprise créée:', entrepriseId);
      
      // Nettoyer les données temporaires
      if (newUserData) {
        sessionStorage.removeItem('newUserData');
      }
      
      // Recharger les entreprises
      await loadUserEntreprises();
      
      // Appeler le callback de complétion si fourni
      if (onComplete) {
        onComplete(entrepriseId);
      }
      
    } catch (error) {
      console.error('❌ Erreur création entreprise:', error);
      setError(error.message || 'Erreur lors de la création de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEntreprise = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Tentative de rejoindre avec le code:', joinData.invitationCode);
      
      const result = await joinEntreprise(joinData.invitationCode, currentUser.uid);
      console.log('✅ Entreprise rejointe:', result);
      
      // Recharger les entreprises pour inclure la nouvelle
      await loadUserEntreprises();
      
      // Appeler le callback de complétion si fourni
      if (onComplete) {
        onComplete(result.entrepriseId);
      }
      
    } catch (error) {
      console.error('❌ Erreur pour rejoindre:', error);
      setError(error.message || 'Erreur lors de la tentative de rejoindre l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-flow">
      {/* Étape 1: Choix */}
      {step === 'choice' && (
        <div className="onboarding-step choice-step">
          <div className="text-center mb-5">
            <h2 className="h1 mb-3">Bienvenue sur TourCraft ! 🎭</h2>
            <p className="lead text-muted">
              Pour commencer, vous devez créer ou rejoindre une entreprise
            </p>
          </div>
          
          <div className="row g-4 mt-4">
            <div className="col-md-6">
              <div className="choice-card h-100" onClick={() => setStep('create')}>
                <div className="choice-icon">
                  <i className="bi bi-plus-circle-fill"></i>
                </div>
                <h3>Créer une entreprise</h3>
                <p className="text-muted">
                  Vous êtes responsable d'une salle, d'un festival ou d'une agence ? 
                  Créez votre entreprise pour commencer.
                </p>
                <button className="btn btn-primary mt-auto">
                  Créer <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="choice-card h-100" onClick={() => setStep('join')}>
                <div className="choice-icon">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3>Rejoindre une entreprise</h3>
                <p className="text-muted">
                  Vous avez reçu une invitation ? 
                  Utilisez votre code pour rejoindre une entreprise existante.
                </p>
                <button className="btn btn-outline-primary mt-auto">
                  Rejoindre <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2: Créer une entreprise */}
      {step === 'create' && (
        <div className="onboarding-step create-step">
          <button 
            className="btn btn-link p-0 mb-4"
            onClick={() => setStep('choice')}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour
          </button>
          
          <h2 className="mb-4">Créer votre entreprise</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleCreateEntreprise}>
            <div className="mb-4">
              <label htmlFor="entrepriseName" className="form-label">
                Nom de l'entreprise <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="entrepriseName"
                value={entrepriseData.name}
                onChange={(e) => setEntrepriseData({...entrepriseData, name: e.target.value})}
                required
                disabled={loading}
                placeholder="Ex: Salle Pleyel, Festival d'Avignon..."
              />
            </div>

            <div className="mb-4">
              <label htmlFor="entrepriseType" className="form-label">
                Type d'entreprise <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-lg"
                id="entrepriseType"
                value={entrepriseData.type}
                onChange={(e) => setEntrepriseData({...entrepriseData, type: e.target.value})}
                disabled={loading}
              >
                <option value="salle_spectacle">🏛️ Salle de spectacle</option>
                <option value="festival">🎪 Festival</option>
                <option value="agence_booking">📞 Agence de booking</option>
                <option value="management_artistes">🎤 Management d'artistes</option>
                <option value="production">🎬 Production</option>
                <option value="autre">📋 Autre</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="entrepriseDescription" className="form-label">
                Description (optionnel)
              </label>
              <textarea
                className="form-control"
                id="entrepriseDescription"
                rows="3"
                value={entrepriseData.description}
                onChange={(e) => setEntrepriseData({...entrepriseData, description: e.target.value})}
                disabled={loading}
                placeholder="Décrivez brièvement votre entreprise..."
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="timezone" className="form-label">
                  Fuseau horaire
                </label>
                <select
                  className="form-select"
                  id="timezone"
                  value={entrepriseData.settings.timezone}
                  onChange={(e) => setEntrepriseData({
                    ...entrepriseData, 
                    settings: {...entrepriseData.settings, timezone: e.target.value}
                  })}
                  disabled={loading}
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/London">Europe/Londres</option>
                  <option value="Europe/Brussels">Europe/Bruxelles</option>
                  <option value="America/Montreal">Amérique/Montréal</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="currency" className="form-label">
                  Devise
                </label>
                <select
                  className="form-select"
                  id="currency"
                  value={entrepriseData.settings.currency}
                  onChange={(e) => setEntrepriseData({
                    ...entrepriseData, 
                    settings: {...entrepriseData.settings, currency: e.target.value}
                  })}
                  disabled={loading}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100"
              disabled={loading || !entrepriseData.name.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer l'entreprise <i className="bi bi-check-circle ms-2"></i>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Étape 3: Rejoindre une entreprise */}
      {step === 'join' && (
        <div className="onboarding-step join-step">
          <button 
            className="btn btn-link p-0 mb-4"
            onClick={() => setStep('choice')}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour
          </button>
          
          <h2 className="mb-4">Rejoindre une entreprise</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleJoinEntreprise}>
            <div className="mb-4">
              <label htmlFor="invitationCode" className="form-label">
                Code d'invitation <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="invitationCode"
                value={joinData.invitationCode}
                onChange={(e) => setJoinData({...joinData, invitationCode: e.target.value})}
                required
                disabled={loading}
                placeholder="Entrez votre code d'invitation"
              />
              <div className="form-text">
                Vous devriez avoir reçu ce code par email de la part de l'administrateur de l'entreprise.
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100"
              disabled={loading || !joinData.invitationCode.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Vérification en cours...
                </>
              ) : (
                <>
                  Rejoindre l'entreprise <i className="bi bi-people ms-2"></i>
                </>
              )}
            </button>
          </form>
          
          <div className="alert alert-info mt-4" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Pas de code ? Demandez à l'administrateur de votre entreprise de vous envoyer une invitation.
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow; 