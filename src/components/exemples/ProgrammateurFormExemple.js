/**
 * Composant exemple démontrant l'utilisation de useProgrammateurForm
 * 
 * Ce composant montre comment utiliser le hook optimisé useProgrammateurForm
 * qui représente l'approche recommandée utilisant directement les hooks génériques
 * conformément au plan de dépréciation officiel.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgrammateurForm } from '@/hooks/programmateurs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import '@styles/index.css';

/**
 * Composant exemple démontrant l'utilisation de useProgrammateurForm
 */
const ProgrammateurFormExemple = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Utilisation du hook optimisé
  const {
    isSubmitting,
    isLoading,
    saveForm
  } = useProgrammateurForm(id);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    saveForm();
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    navigate('/programmateurs');
  };
  
  // Afficher le loader pendant le chargement des données
  if (isLoading) {
    return <div className="loader-container">Chargement des données du programmateur...</div>;
  }
  
  return (
    <div className="container programmateur-form-exemple">
      <Card
        title="Formulaire de programmateur"
      >
        <form onSubmit={handleSubmit}>
          {/* Section contact */}
          <div className="form-section">
            <div className="section-header">
              <h3>Informations du contact</h3>
            </div>
            
            <div className="section-content">
              <FormField
                label="Nom *"
                type="text"
                id="contactNom"
                required
              />
              
              <FormField
                label="Prénom"
                type="text"
                id="contactPrenom"
              />
              
              <FormField
                label="Fonction"
                type="text"
                id="contactFonction"
                placeholder="Ex: Directeur de programmation"
              />
              
              <FormField
                label="Email *"
                type="email"
                id="contactEmail"
                required
              />
              
              <FormField
                label="Téléphone"
                type="tel"
                id="contactTelephone"
              />
            </div>
          </div>
          
          {/* Section structure */}
          <div className="form-section mt-4">
            <div className="section-header">
              <h3>Structure associée</h3>
            </div>
            
            <div className="section-content">
              <FormField
                label="Rechercher une structure existante"
                as="entity-search"
                entityType="structure"
                placeholder="Rechercher une structure par nom, ville ou SIRET"
              />
              
              <FormField
                label="Raison sociale"
                type="text"
                id="structureRaisonSociale"
              />
              
              <FormField
                label="Type de structure"
                type="select"
                id="structureType"
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'association', label: 'Association' },
                  { value: 'sarl', label: 'SARL' },
                  { value: 'sas', label: 'SAS' },
                  { value: 'eurl', label: 'EURL' },
                  { value: 'collectivite', label: 'Collectivité' },
                  { value: 'autre', label: 'Autre' }
                ]}
              />
              
              <FormField
                label="Adresse"
                type="text"
                id="structureAdresse"
              />
              
              <FormField
                label="Code postal"
                type="text"
                id="structureCodePostal"
              />
              
              <FormField
                label="Ville"
                type="text"
                id="structureVille"
              />
              
              <FormField
                label="SIRET"
                type="text"
                id="structureSiret"
              />
              
              <FormField
                label="N° TVA"
                type="text"
                id="structureTva"
              />
            </div>
          </div>
          
          {/* Section pour les concerts associés (affichage uniquement) */}
          <div className="form-section mt-4">
            <div className="section-header">
              <h3>Concerts associés</h3>
            </div>
            
            <div className="section-content">
              {/* Contenu de la section des concerts associés */}
            </div>
          </div>
          
          {/* Boutons de soumission du formulaire */}
          <div className="form-actions mt-4">
            <Button
              variant="outline-secondary"
              className="mr-2"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Aide et documentation */}
      <Card
        title="Utilisation du hook useProgrammateurForm"
        className="mt-4"
      >
        <p>
          Ce composant démontre l'utilisation du hook <code>useProgrammateurForm</code> qui est basé directement
          sur <code>useGenericEntityForm</code>, conformément au plan de dépréciation officiel.
        </p>
        <p>
          <strong>Avantages :</strong>
        </p>
        <ul>
          <li>Gestion optimisée des formulaires de programmateurs avec validation intégrée</li>
          <li>Fonctionnalités de plier/déplier les sections pour une meilleure UX</li>
          <li>Gestion des structures associées (recherche ou création)</li>
          <li>Gestion simplifiée des champs imbriqués via <code>updateContact</code> et <code>updateStructure</code></li>
          <li>Affichage des entités liées (concerts associés)</li>
        </ul>
      </Card>
    </div>
  );
};

export default ProgrammateurFormExemple;