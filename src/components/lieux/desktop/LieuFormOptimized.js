import React from 'react';
import { useLieuForm } from '@/hooks/lieux';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SectionTitle from '@/components/ui/SectionTitle';

/**
 * Formulaire de lieu optimisé utilisant le hook basé sur useGenericEntityForm
 * Cette approche est recommandée pour tous les nouveaux développements
 */
const LieuFormOptimized = ({ lieuId }) => {
  // Utilisation du hook optimisé qui utilise directement useGenericEntityForm
  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    submitting,
    error,
    formErrors,
    addEquipement,
    removeEquipement,
    programmateur,
    handleSelectRelatedEntity
  } = useLieuForm(lieuId);

  // Affichage du chargement
  if (loading) {
    return (
      <Card>
        <LoadingSpinner label="Chargement des informations du lieu..." />
      </Card>
    );
  }

  // Gestion des équipements
  const equipements = [
    'Sono', 'Lumières', 'Backline', 'Restauration', 'Loges', 'Écran'
  ];

  const handleEquipementChange = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      addEquipement(value);
    } else {
      removeEquipement(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lieu-form">
      {error && <ErrorMessage message={error} />}
      
      <Card>
        <SectionTitle>
          {lieuId === 'nouveau' ? 'Nouveau lieu' : 'Modifier le lieu'}
        </SectionTitle>
        
        <div className="form-group">
          <label htmlFor="nom">Nom du lieu*</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom || ''}
            onChange={handleChange}
            className={formErrors.nom ? 'input-error' : ''}
          />
          {formErrors.nom && <div className="error-message">{formErrors.nom}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse*</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.adresse || ''}
            onChange={handleChange}
            className={formErrors.adresse ? 'input-error' : ''}
          />
          {formErrors.adresse && <div className="error-message">{formErrors.adresse}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codePostal">Code postal</label>
            <input
              type="text"
              id="codePostal"
              name="codePostal"
              value={formData.codePostal || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ville">Ville</label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pays">Pays</label>
          <input
            type="text"
            id="pays"
            name="pays"
            value={formData.pays || 'France'}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacite">Capacité</label>
          <input
            type="number"
            id="capacite"
            name="capacite"
            value={formData.capacite || ''}
            onChange={handleChange}
            className={formErrors.capacite ? 'input-error' : ''}
          />
          {formErrors.capacite && <div className="error-message">{formErrors.capacite}</div>}
        </div>

        <div className="form-group">
          <label>Équipements disponibles</label>
          <div className="checkbox-group">
            {equipements.map(equip => (
              <label key={equip} className="checkbox-label">
                <input
                  type="checkbox"
                  value={equip}
                  checked={formData.equipements?.includes(equip) || false}
                  onChange={handleEquipementChange}
                />
                {equip}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="actif">Statut</label>
          <select
            id="actif"
            name="actif"
            value={formData.actif ? 'true' : 'false'}
            onChange={handleChange}
          >
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </Card>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitting}
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default LieuFormOptimized;