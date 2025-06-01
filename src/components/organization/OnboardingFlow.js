import React, { useState } from 'react';
import { createOrganization, joinOrganization } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import './OnboardingFlow.css';

const OnboardingFlow = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { loadUserOrganizations } = useOrganization();
  
  // Vérifier les paramètres d'URL pour démarrer directement sur la bonne étape
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  const getInitialStep = () => {
    if (action === 'create') return 'create';
    if (action === 'join') return 'join';
    return 'choice';
  };
  
  const [step, setStep] = useState(getInitialStep()); // 'choice', 'create', 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [orgData, setOrgData] = useState({
    name: '',
    type: 'venue',
    description: '',
    settings: {
      timezone: 'Europe/Paris',
      currency: 'EUR'
    }
  });
  
  const [joinData, setJoinData] = useState({
    invitationCode: ''
  });

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Création de l\'organisation:', orgData.name);
      
      const orgId = await createOrganization(orgData, currentUser.uid);
      console.log('✅ Organisation créée:', orgId);
      
      // Recharger les organisations
      await loadUserOrganizations();
      
      // Appeler le callback de complétion si fourni
      if (onComplete) {
        onComplete(orgId);
      }
      
    } catch (error) {
      console.error('❌ Erreur création organisation:', error);
      setError(error.message || 'Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Tentative de rejoindre avec le code:', joinData.invitationCode);
      
      const result = await joinOrganization(joinData.invitationCode, currentUser.uid);
      console.log('✅ Organisation rejointe:', result);
      
      // Recharger les organisations pour inclure la nouvelle
      await loadUserOrganizations();
      
      // Appeler le callback de complétion si fourni
      if (onComplete) {
        onComplete(result.organizationId);
      }
      
    } catch (error) {
      console.error('❌ Erreur pour rejoindre:', error);
      setError(error.message || 'Erreur lors de la tentative de rejoindre l\'organisation');
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
              Pour commencer, vous devez créer ou rejoindre une organisation
            </p>
          </div>
          
          <div className="row g-4 mt-4">
            <div className="col-md-6">
              <div className="choice-card h-100" onClick={() => setStep('create')}>
                <div className="choice-icon">
                  <i className="bi bi-plus-circle-fill"></i>
                </div>
                <h3>Créer une organisation</h3>
                <p className="text-muted">
                  Vous êtes responsable d'une salle, d'un festival ou d'une agence ? 
                  Créez votre organisation pour commencer.
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
                <h3>Rejoindre une organisation</h3>
                <p className="text-muted">
                  Vous avez reçu une invitation ? 
                  Utilisez votre code pour rejoindre une organisation existante.
                </p>
                <button className="btn btn-outline-primary mt-auto">
                  Rejoindre <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2: Créer une organisation */}
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
          
          <h2 className="mb-4">Créer votre organisation</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleCreateOrganization}>
            <div className="mb-4">
              <label htmlFor="orgName" className="form-label">
                Nom de l'organisation <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="orgName"
                value={orgData.name}
                onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                required
                disabled={loading}
                placeholder="Ex: Salle Pleyel, Festival d'Avignon..."
              />
            </div>

            <div className="mb-4">
              <label htmlFor="orgType" className="form-label">
                Type d'organisation <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-lg"
                id="orgType"
                value={orgData.type}
                onChange={(e) => setOrgData({...orgData, type: e.target.value})}
                disabled={loading}
              >
                <option value="venue">🏛️ Salle de spectacle</option>
                <option value="festival">🎪 Festival</option>
                <option value="booking_agency">📞 Agence de booking</option>
                <option value="artist_management">🎤 Management d'artistes</option>
                <option value="production">🎬 Production</option>
                <option value="other">📋 Autre</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="orgDescription" className="form-label">
                Description (optionnel)
              </label>
              <textarea
                className="form-control"
                id="orgDescription"
                rows="3"
                value={orgData.description}
                onChange={(e) => setOrgData({...orgData, description: e.target.value})}
                disabled={loading}
                placeholder="Décrivez brièvement votre organisation..."
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
                  value={orgData.settings.timezone}
                  onChange={(e) => setOrgData({
                    ...orgData, 
                    settings: {...orgData.settings, timezone: e.target.value}
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
                  value={orgData.settings.currency}
                  onChange={(e) => setOrgData({
                    ...orgData, 
                    settings: {...orgData.settings, currency: e.target.value}
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
              disabled={loading || !orgData.name.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer l'organisation <i className="bi bi-check-circle ms-2"></i>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Étape 3: Rejoindre une organisation */}
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
          
          <h2 className="mb-4">Rejoindre une organisation</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleJoinOrganization}>
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
                Vous devriez avoir reçu ce code par email de la part de l'administrateur de l'organisation.
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
                  Rejoindre l'organisation <i className="bi bi-people ms-2"></i>
                </>
              )}
            </button>
          </form>
          
          <div className="alert alert-info mt-4" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Pas de code ? Demandez à l'administrateur de votre organisation de vous envoyer une invitation.
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow; 