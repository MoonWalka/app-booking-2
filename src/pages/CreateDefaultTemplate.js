import React, { useState } from 'react';
import { createDefaultContractTemplate } from '@/utils/createDefaultContractTemplate';
import { useNavigate } from 'react-router-dom';

const CreateDefaultTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreateTemplate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const templateId = await createDefaultContractTemplate();
      setMessage(`Modèle créé avec succès ! ID: ${templateId}`);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/parametres/contrats/modeles');
      }, 2000);
    } catch (error) {
      // S'assurer que le message est une chaîne
      const errorMessage = error?.message || error?.toString() || 'Une erreur inconnue est survenue';
      setMessage(`Erreur: ${errorMessage}`);
      console.error('Erreur lors de la création du modèle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="card-title mb-4">Initialisation du modèle de contrat</h2>
              
              <p className="mb-4">
                Cliquez sur le bouton ci-dessous pour créer un modèle de contrat par défaut.
              </p>
              
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCreateTemplate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Création en cours...
                  </>
                ) : (
                  'Créer le modèle par défaut'
                )}
              </button>
              
              {message && (
                <div className={`alert mt-4 ${message.includes('Erreur') ? 'alert-danger' : 'alert-success'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDefaultTemplate; 