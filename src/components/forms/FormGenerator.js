import React from 'react';
import { useFormGenerator } from '../../hooks/useFormGenerator';

const FormGenerator = ({ concertId, programmateurId, onFormGenerated }) => {
  const {
    loading,
    loadingExisting,
    formLink,
    existingLink,
    expiryDate,
    copied,
    generateForm,
    copyToClipboard,
    formatExpiryDate
  } = useFormGenerator(concertId, programmateurId);

  if (loadingExisting) {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h3>Formulaire pour le programmateur</h3>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Vérification des liens existants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Formulaire pour le programmateur</h3>
      </div>
      <div className="card-body">
        {!formLink ? (
          <div>
            <p>
              Générez un lien de formulaire à envoyer au programmateur pour qu'il puisse remplir ses informations.
            </p>
            <button
              className="btn btn-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un formulaire'}
            </button>
          </div>
        ) : (
          <div>
            <div className="alert alert-success mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Un lien de formulaire est actif</strong> - Valable jusqu'au {formatExpiryDate(expiryDate)}
            </div>
            
            <p>
              Voici le lien du formulaire à envoyer au programmateur :
            </p>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={formLink}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={copyToClipboard}
              >
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle me-2"></i>
              <span>Ce lien permet au programmateur de remplir ses informations pour ce concert sans avoir accès au reste de l'application.</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <p className="text-muted">
                Ce lien est valable jusqu'au {formatExpiryDate(expiryDate)}.
              </p>
              <button
                className="btn btn-outline-primary"
                onClick={generateForm}
                disabled={loading}
              >
                {loading ? 'Génération en cours...' : 'Générer un nouveau lien'}
              </button>
            </div>
            
            {existingLink && existingLink.completed && (
              <div className="alert alert-warning mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Attention :</strong> Le formulaire a déjà été complété par le programmateur. Générer un nouveau lien si vous souhaitez qu'il puisse soumettre de nouvelles informations.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormGenerator;
