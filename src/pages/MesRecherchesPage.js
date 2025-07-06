import React from 'react';
import RechercheLayout from '@/components/recherches/RechercheLayout';
import IdentificationSection from '@/components/recherches/sections/IdentificationSection';
import HistoriqueSection from '@/components/recherches/sections/HistoriqueSection';
import PersonnesSection from '@/components/recherches/sections/PersonnesSection';
import ActivitesSection from '@/components/recherches/sections/ActivitesSection';
import ReseauxSection from '@/components/recherches/sections/ReseauxSection';
import GenresSection from '@/components/recherches/sections/GenresSection';
import GeolocalisationSection from '@/components/recherches/sections/GeolocalisationSection';
import FestivalsSection from '@/components/recherches/sections/FestivalsSection';
import MesSelectionsSection from '@/components/recherches/sections/MesSelectionsSection';
import SallesSection from '@/components/recherches/sections/SallesSection';
import InfosArtisteSection from '@/components/recherches/sections/InfosArtisteSection';
import DatesSection from '@/components/recherches/sections/DatesSection';

/**
 * Page Mes recherches - Interface de recherche avancée multi-critères
 */
const MesRecherchesPage = ({ activeSection, onCriteriaChange, selectedCriteria }) => {
  // Fonction pour rendre la section appropriée selon la sélection
  const renderSection = () => {
    switch (activeSection) {
      case 'identification':
        return <IdentificationSection onCriteriaChange={onCriteriaChange} />;
      
      case 'activites':
        return <ActivitesSection onCriteriaChange={onCriteriaChange} />;
      
      case 'reseaux':
        return <ReseauxSection onCriteriaChange={onCriteriaChange} />;
      
      case 'genres':
        return <GenresSection onCriteriaChange={onCriteriaChange} />;
      
      case 'festivals':
        return <FestivalsSection onCriteriaChange={onCriteriaChange} />;
      
      case 'historique':
        return <HistoriqueSection onCriteriaChange={onCriteriaChange} />;
      
      case 'personnes':
        return <PersonnesSection onCriteriaChange={onCriteriaChange} />;
      
      case 'mots-cles':
        return (
          <div className="p-4 text-center">
            <i className="bi bi-tags display-4 text-muted"></i>
            <h4 className="mt-3">Section Mots-clés</h4>
            <p className="text-muted">Cette section sera implémentée prochainement</p>
          </div>
        );
      
      case 'mes-selections':
        return <MesSelectionsSection onCriteriaChange={onCriteriaChange} />;
      
      case 'suivi':
        return (
          <div className="p-4 text-center">
            <i className="bi bi-eye display-4 text-muted"></i>
            <h4 className="mt-3">Section Suivi</h4>
            <p className="text-muted">Cette section sera implémentée prochainement</p>
          </div>
        );
      
      case 'geolocalisation':
        return <GeolocalisationSection onCriteriaChange={onCriteriaChange} />;
      
      case 'salles':
        return <SallesSection onCriteriaChange={onCriteriaChange} />;
      
      case 'docs-promo':
        return (
          <div className="p-4 text-center">
            <i className="bi bi-file-earmark-text display-4 text-muted"></i>
            <h4 className="mt-3">Section Docs promo</h4>
            <p className="text-muted">Cette section sera implémentée prochainement</p>
          </div>
        );
      
      case 'infos-artiste':
        return <InfosArtisteSection onCriteriaChange={onCriteriaChange} />;
      
      case 'emailing':
        return (
          <div className="p-4 text-center">
            <i className="bi bi-envelope display-4 text-muted"></i>
            <h4 className="mt-3">Section eMailing</h4>
            <p className="text-muted">Cette section sera implémentée prochainement</p>
          </div>
        );
      
      case 'gestion-projets':
        return (
          <div className="p-4 text-center">
            <i className="bi bi-kanban display-4 text-muted"></i>
            <h4 className="mt-3">Section Gestion de projets</h4>
            <p className="text-muted">Cette section sera implémentée prochainement</p>
          </div>
        );
      
      case 'dates':
        return <DatesSection onCriteriaChange={onCriteriaChange} />;
      
      default:
        return <IdentificationSection onCriteriaChange={onCriteriaChange} />;
    }
  };

  return renderSection();
};

// Wrapper pour utiliser avec le layout
const MesRecherchesPageWithLayout = () => {
  return (
    <RechercheLayout>
      <MesRecherchesPage />
    </RechercheLayout>
  );
};

export default MesRecherchesPageWithLayout;