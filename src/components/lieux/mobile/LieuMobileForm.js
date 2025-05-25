import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { toast } from 'react-toastify';

// MIGRATION: Utilisation du hook optimisé au lieu du hook complet
import { useLieuForm } from '@/hooks/lieux';
import useLieuDelete from '@/hooks/lieux/useLieuDelete';

// Import styles
import styles from './LieuForm.module.css';

/**
 * LieuMobileForm Component - Mobile version
 * Formulaire optimisé pour mobile avec interface tactile et navigation intuitive
 * Architecture responsive avec validation en temps réel
 * MIGRATION: Utilise FormField standardisé TourCraft
 */
const LieuMobileForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // MIGRATION: Utilisation du hook optimisé
  const {
    lieu,
    loading,
    error,
    handleChange,
    handleSubmit,
    programmateurSearch,
    submitting
  } = useLieuForm(id);

  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDeleteLieu
  } = useLieuDelete(() => {
    toast.success('🗑️ Lieu supprimé avec succès', {
      position: 'bottom-center',
      autoClose: 2000,
      hideProgressBar: true,
    });
    navigate('/lieux');
  });

  // Handlers mobile avec notifications
  const handleBackWithNotification = () => {
    const hasChanges = JSON.stringify(lieu) !== JSON.stringify({});
    
    if (hasChanges && !window.confirm('Voulez-vous vraiment quitter ? Les modifications non sauvegardées seront perdues.')) {
      return;
    }
    
    toast.dismiss(); // Fermer toutes les notifications
    navigate('/lieux');
  };

  const handleSubmitWithNotification = async (e) => {
    try {
      await handleSubmit(e);
      toast.success(id === 'nouveau' ? '✅ Lieu créé avec succès' : '✅ Lieu mis à jour avec succès', {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error('❌ Erreur lors de la sauvegarde', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  const handleDeleteWithConfirmation = () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le lieu "${lieu.nom}" ?\n\nCette action est irréversible.`
    );
    
    if (confirmed) {
      handleDeleteLieu(id);
    }
  };

  if (loading && id !== 'nouveau') {
    return (
      <div className={styles?.mobileContainer || "mobile-container p-3"}>
        <div className={styles.spinnerContainer}>
          <Spinner variant="primary" message="Chargement du lieu..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles?.mobileContainer || "mobile-container p-3"}>
      {/* Header mobile avec navigation */}
      <div className={styles?.header || "mobile-header d-flex justify-content-between align-items-center mb-4"}>
        <div className="d-flex align-items-center">
          <Button 
            variant="text" 
            onClick={handleBackWithNotification}
            className="p-0 me-3"
            icon={<i className="bi bi-arrow-left fs-4"></i>}
          />
          <h1 className="mb-0 h4">
            {id === 'nouveau' ? 'Nouveau lieu' : `Modifier ${lieu.nom || 'le lieu'}`}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmitWithNotification} className={styles?.mobileForm || "mobile-form"}>
        {/* Section Informations principales */}
        <div className={styles?.formSection || "form-section mb-4 p-3 border rounded"}>
          <h2 className="h6 mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Informations principales
          </h2>
          
          <FormField
            type="text"
            id="nom"
            name="nom"
            label="Nom du lieu"
            placeholder="Ex: Le Zénith de Paris"
            value={lieu.nom || ''}
            onChange={(e) => handleChange('nom', e.target.value)}
            required
            size="lg"
          />

          <div className="row">
            <div className="col-6">
              <FormField
                type="select"
                id="type"
                name="type"
                label="Type"
                value={lieu.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="">Sélectionner...</option>
                <option value="salle">Salle de concert</option>
                <option value="zenith">Zénith</option>
                <option value="palais-des-sports">Palais des sports</option>
                <option value="theatre">Théâtre</option>
                <option value="club">Club</option>
                <option value="festival">Site de festival</option>
                <option value="plein-air">Plein air</option>
                <option value="autre">Autre</option>
              </FormField>
            </div>
            <div className="col-6">
              <FormField
                type="number"
                id="capacite"
                name="capacite"
                label="Capacité"
                placeholder="Ex: 2000"
                value={lieu.capacite || ''}
                onChange={(e) => handleChange('capacite', e.target.value)}
              />
            </div>
          </div>

          <FormField
            type="textarea"
            id="description"
            name="description"
            label="Description"
            placeholder="Description du lieu, équipements, particularités..."
            value={lieu.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Section Adresse */}
        <div className={styles?.formSection || "form-section mb-4 p-3 border rounded"}>
          <h2 className="h6 mb-3">
            <i className="bi bi-geo-alt me-2"></i>
            Adresse
          </h2>
          
          <FormField
            type="text"
            id="adresse"
            name="adresse"
            label="Adresse"
            placeholder="Ex: 211 Avenue Jean Jaurès"
            value={lieu.adresse || ''}
            onChange={(e) => handleChange('adresse', e.target.value)}
            required
          />

          <div className="row">
            <div className="col-4">
              <FormField
                type="text"
                id="codePostal"
                name="codePostal"
                label="Code postal"
                placeholder="75019"
                value={lieu.codePostal || ''}
                onChange={(e) => handleChange('codePostal', e.target.value)}
                required
              />
            </div>
            <div className="col-8">
              <FormField
                type="text"
                id="ville"
                name="ville"
                label="Ville"
                placeholder="Paris"
                value={lieu.ville || ''}
                onChange={(e) => handleChange('ville', e.target.value)}
                required
              />
            </div>
          </div>

          <FormField
            type="text"
            id="pays"
            name="pays"
            label="Pays"
            placeholder="France"
            value={lieu.pays || 'France'}
            onChange={(e) => handleChange('pays', e.target.value)}
          />
        </div>

        {/* Section Contact */}
        <div className={styles?.formSection || "form-section mb-4 p-3 border rounded"}>
          <h2 className="h6 mb-3">
            <i className="bi bi-person me-2"></i>
            Contact
          </h2>
          
          <FormField
            type="text"
            id="contactNom"
            name="contactNom"
            label="Nom du contact"
            placeholder="Ex: Jean Dupont"
            value={lieu.contactNom || ''}
            onChange={(e) => handleChange('contactNom', e.target.value)}
          />

          <FormField
            type="email"
            id="contactEmail"
            name="contactEmail"
            label="Email"
            placeholder="contact@venue.com"
            value={lieu.contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
          />

          <FormField
            type="tel"
            id="contactTelephone"
            name="contactTelephone"
            label="Téléphone"
            placeholder="01 42 39 30 30"
            value={lieu.contactTelephone || ''}
            onChange={(e) => handleChange('contactTelephone', e.target.value)}
          />
        </div>

        {/* NOUVEAU: Section Programmateurs associés */}
        <div className={styles?.formSection || "form-section mb-4 p-3 border rounded"}>
          <h2 className="h6 mb-3">
            <i className="bi bi-people me-2"></i>
            Programmateurs associés
          </h2>
          
          {/* Interface de recherche de programmateurs */}
          <FormField
            type="text"
            id="programmateurSearch"
            name="programmateurSearch"
            label="Rechercher et associer des programmateurs"
            placeholder="Rechercher un programmateur..."
            value={programmateurSearch.searchTerm || ''}
            onChange={(e) => programmateurSearch.setSearchTerm(e.target.value)}
          />

          {/* Résultats de recherche */}
          {programmateurSearch.searchTerm && (
            <div className={styles?.searchResults || "search-results border rounded p-2 mb-3"}>
              {programmateurSearch.loading ? (
                <div className="text-center p-2">
                  <Spinner size="sm" className="me-2" />
                  Recherche en cours...
                </div>
              ) : programmateurSearch.results && programmateurSearch.results.length > 0 ? (
                <div>
                  <div className="small text-muted mb-2">
                    {programmateurSearch.results.length} résultat{programmateurSearch.results.length !== 1 ? 's' : ''}
                  </div>
                  {programmateurSearch.results.map(prog => (
                    <div 
                      key={prog.id}
                      className="d-flex justify-content-between align-items-center p-2 border-bottom"
                    >
                      <div className="flex-1">
                        <div className="fw-semibold">{prog.nom} {prog.prenom}</div>
                        <div className="small text-muted">{prog.email}</div>
                        {prog.structureNom && (
                          <div className="small text-muted">{prog.structureNom}</div>
                        )}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => programmateurSearch.associateProgrammateur(prog.id)}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted p-2">
                  Aucun programmateur trouvé
                </div>
              )}
            </div>
          )}

          {/* Programmateurs déjà associés */}
          {lieu.programmateursAssocies && lieu.programmateursAssocies.length > 0 && (
            <div>
              <div className="small text-muted mb-2">Programmateurs associés :</div>
              {lieu.programmateursAssocies.map(prog => (
                <div 
                  key={prog.id}
                  className="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2"
                >
                  <div className="flex-1">
                    <div className="fw-semibold">{prog.nom} {prog.prenom}</div>
                    <div className="small text-muted">{prog.email}</div>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => programmateurSearch.dissociateProgrammateur(prog.id)}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message si aucun programmateur associé */}
          {(!lieu.programmateursAssocies || lieu.programmateursAssocies.length === 0) && (
            <div className="text-center text-muted p-3 border rounded bg-light">
              <i className="bi bi-people-fill fs-4 d-block mb-2 opacity-50"></i>
              Aucun programmateur associé à ce lieu
              <div className="small mt-1">
                Utilisez la recherche ci-dessus pour associer des programmateurs
              </div>
            </div>
          )}
        </div>

        {/* Actions mobile - boutons en bas */}
        <div className={styles?.actionsSection || "actions-section mt-4 pb-4"}>
          <div className="d-grid gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting || loading}
              className="w-100"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {id === 'nouveau' ? 'Création...' : 'Mise à jour...'}
                </>
              ) : (
                <>
                  <i className={`bi ${id === 'nouveau' ? 'bi-plus-circle' : 'bi-check-circle'} me-2`}></i>
                  {id === 'nouveau' ? 'Créer le lieu' : 'Mettre à jour'}
                </>
              )}
            </Button>

            {id !== 'nouveau' && (
              <Button
                type="button"
                variant="danger"
                size="lg"
                disabled={isDeleting || loading}
                onClick={handleDeleteWithConfirmation}
                className="w-100"
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Supprimer le lieu
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline-secondary"
              size="lg"
              onClick={handleBackWithNotification}
              className="w-100"
            >
              <i className="bi bi-x-circle me-2"></i>
              Annuler
            </Button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className={styles.errorAlert}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default LieuMobileForm; 