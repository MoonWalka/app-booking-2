import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';
import { collection, query, getDocs, limit, orderBy, doc, updateDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import EntitySelector from '@/components/ui/EntitySelector';
import Button from '@/components/ui/Button';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Version améliorée de ArtisteSearchSection qui peut chercher sans filtre organizationId
 * si aucun résultat n'est trouvé avec le filtre
 */
const ArtisteSearchSectionWithFallback = ({ 
  formData, 
  updateFormData, 
  displayMode = 'form',
  className = ''
}) => {
  const { currentOrganization } = useOrganization();
  const [showAllArtistes, setShowAllArtistes] = useState(false);
  const [allArtistesResults, setAllArtistesResults] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  
  const {
    results,
    isSearching,
    searchTerm,
    setSearchTerm,
    handleSelect,
    handleRemove
  } = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['style'],
    maxResults: 10,
    onChange: (artiste) => {
      updateFormData({
        artisteId: artiste?.id || '',
        artisteNom: artiste?.nom || '',
        artisteEmail: artiste?.email || '',
        artisteTelephone: artiste?.telephone || ''
      });
    }
  });

  // Rechercher dans TOUS les artistes (sans filtre organizationId)
  const searchAllArtistes = async (term) => {
    if (!term || term.length < 2) {
      setAllArtistesResults([]);
      return;
    }

    setIsLoadingAll(true);
    try {
      const artistesRef = collection(db, 'artistes');
      const q = query(
        artistesRef,
        orderBy('nom'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const allArtistes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(artiste => 
          artiste.nom?.toLowerCase().includes(term.toLowerCase()) ||
          artiste.style?.toLowerCase().includes(term.toLowerCase())
        );
      
      setAllArtistesResults(allArtistes);
    } catch (error) {
      console.error('Erreur recherche tous artistes:', error);
      setAllArtistesResults([]);
    }
    setIsLoadingAll(false);
  };

  // Déclencher la recherche globale si pas de résultats avec le filtre
  useEffect(() => {
    if (searchTerm && results.length === 0 && !isSearching) {
      searchAllArtistes(searchTerm);
    } else if (!searchTerm) {
      setAllArtistesResults([]);
      setShowAllArtistes(false);
    }
  }, [searchTerm, results.length, isSearching]);

  // Gérer la sélection d'un artiste sans organizationId
  const handleSelectWithFix = async (artiste) => {
    if (!artiste.organizationId && currentOrganization?.id) {
      const confirmFix = window.confirm(
        `L'artiste "${artiste.nom}" n'appartient à aucune organisation.\n\n` +
        `Voulez-vous l'associer à votre organisation "${currentOrganization.name}" ?`
      );
      
      if (confirmFix) {
        try {
          // Mettre à jour l'artiste avec l'organizationId
          const artisteRef = doc(db, 'artistes', artiste.id);
          await updateDoc(artisteRef, {
            organizationId: currentOrganization.id,
            updatedAt: new Date()
          });
          
          // Mettre à jour l'objet local
          artiste.organizationId = currentOrganization.id;
          console.log(`✅ Artiste ${artiste.nom} associé à l'organisation`);
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'artiste:', error);
        }
      }
    }
    
    handleSelect(artiste);
  };

  // Afficher les résultats appropriés
  const displayResults = showAllArtistes ? allArtistesResults : results;
  const isLoading = showAllArtistes ? isLoadingAll : isSearching;

  return (
    <div className={className}>
      <EntitySelector
        entityType="artistes"
        value={formData.artisteId}
        onChange={handleSelectWithFix}
        onRemove={handleRemove}
        onSearch={setSearchTerm}
        searchResults={displayResults}
        isSearching={isLoading}
        label="Artiste"
        placeholder="Rechercher un artiste..."
        displayMode={displayMode}
        required
        allowCreate={true}
        searchFields={['nom', 'style']}
      />
      
      {/* Message si résultats trouvés sans filtre */}
      {searchTerm && results.length === 0 && allArtistesResults.length > 0 && (
        <div className="alert alert-warning mt-2">
          <small>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {allArtistesResults.length} artiste(s) trouvé(s) dans d'autres organisations.
            {!showAllArtistes && (
              <Button
                variant="link"
                size="sm"
                className="p-0 ms-2"
                onClick={() => setShowAllArtistes(true)}
              >
                Afficher quand même
              </Button>
            )}
          </small>
        </div>
      )}
      
      {/* Avertissement pour les artistes sans organization */}
      {showAllArtistes && allArtistesResults.some(a => !a.organizationId) && (
        <div className="alert alert-info mt-2">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            Certains artistes n'appartiennent à aucune organisation. 
            Ils seront automatiquement associés à votre organisation lors de la sélection.
          </small>
        </div>
      )}
    </div>
  );
};

ArtisteSearchSectionWithFallback.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  displayMode: PropTypes.oneOf(['form', 'view']),
  className: PropTypes.string
};

export default ArtisteSearchSectionWithFallback;