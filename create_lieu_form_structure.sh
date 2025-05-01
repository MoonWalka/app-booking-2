#!/bin/bash

# Base directories
COMPONENTS_DIR="src/components/lieux/desktop"
SECTIONS_DIR="$COMPONENTS_DIR/sections"
HOOKS_DIR="src/hooks/lieux"

# Create hook files
echo "Creating hook files..."

# 1. useLieuForm hook
cat > "$HOOKS_DIR/useLieuForm.js" << 'EOF'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to manage the venue form state and operations
 */
export const useLieuForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lieu, setLieu] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    capacite: '',
    type: '',
    contact: {
      nom: '',
      telephone: '',
      email: ''
    },
    programmateurId: null,
    programmateurNom: null,
    latitude: null,
    longitude: null,
    display_name: ''
  });

  // Load lieu data if editing an existing lieu
  useEffect(() => {
    const fetchLieu = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        setError(null);
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', id));
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            
            // Ensure contact property always exists
            const lieuWithDefaults = {
              ...lieuData,
              contact: lieuData.contact || {
                nom: '',
                telephone: '',
                email: ''
              }
            };
            
            setLieu(lieuWithDefaults);
          } else {
            console.error('Lieu non trouvé');
            navigate('/lieux');
          }
        } catch (err) {
          console.error('Erreur lors de la récupération du lieu:', err);
          setError('Une erreur est survenue lors du chargement des données. Veuillez réessayer.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLieu();
  }, [id, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLieu(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setLieu(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    return lieu.nom && lieu.adresse && lieu.codePostal && lieu.ville && lieu.pays;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const lieuId = id && id !== 'nouveau' ? id : doc(collection(db, 'lieux')).id;
      const lieuData = {
        ...lieu,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      await setDoc(doc(db, 'lieux', lieuId), lieuData, { merge: true });
      navigate('/lieux');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lieu:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du lieu');
    } finally {
      setLoading(false);
    }
  };

  return {
    id,
    lieu,
    setLieu,
    loading,
    error,
    handleChange,
    validateForm,
    handleSubmit
  };
};

export default useLieuForm;
EOF

# 2. useAddressSearch hook
cat > "$HOOKS_DIR/useAddressSearch.js" << 'EOF'
import { useState, useEffect, useRef } from 'react';
import { useLocationIQ } from '@/hooks/common/useLocationIQ';

/**
 * Hook to handle address search and selection
 */
export const useAddressSearch = (lieu, setLieu) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Use LocationIQ API
  const { isLoading, error, searchAddress } = useLocationIQ();

  // Log to verify hook is loaded
  useEffect(() => {
    console.log("useAddressSearch - hook LocationIQ chargé:", {
      isLoading,
      hasError: !!error,
      searchAddressFn: !!searchAddress
    });
    
    if (error) {
      console.error("Erreur hook LocationIQ:", error);
    }
  }, [isLoading, error, searchAddress]);

  // Effect for address search
  useEffect(() => {
    // Clear previous timeout
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      console.log("handleSearch - état actuel:", {
        adresse: lieu.adresse,
        adresseLength: lieu.adresse?.length || 0,
        isLoading,
        isSearchingAddress,
        addressFieldActive
      });
      
      if (!lieu.adresse || lieu.adresse.length < 3 || isLoading) {
        console.log("Conditions non remplies pour la recherche");
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      console.log("Recherche démarrée pour:", lieu.adresse);
      
      try {
        // Call the hook function
        const results = await searchAddress(lieu.adresse);
        console.log("Résultats de recherche reçus:", results?.length || 0);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // Only search if address field is active and address has at least 3 characters
    if (addressFieldActive && lieu.adresse && lieu.adresse.length >= 3 && !isLoading) {
      console.log("Planification de la recherche après délai");
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [lieu.adresse, isLoading, searchAddress, addressFieldActive]);
  
  // Log to check suggestion state
  useEffect(() => {
    console.log("État des suggestions:", {
      count: addressSuggestions?.length || 0,
      isSearching: isSearchingAddress
    });
  }, [addressSuggestions, isSearchingAddress]);

  // Handle clicks outside address suggestion list
  useEffect(() => {
    const handleClickOutsideAddressSuggestions = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideAddressSuggestions);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAddressSuggestions);
    };
  }, []);

  // Select an address from suggestions
  const handleSelectAddress = (address) => {
    console.log("Adresse sélectionnée:", address);
    
    let codePostal = '';
    let ville = '';
    let pays = 'France';
    let adresse = '';
    
    // Extract address components
    if (address.address) {
      // Extract postal code
      codePostal = address.address.postcode || '';
      
      // Extract city
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Extract country
      pays = address.address.country || 'France';
      
      // Build street address
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Update state with address information
    setLieu(prev => ({
      ...prev,
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville,
      pays,
      latitude: address.lat,
      longitude: address.lon,
      display_name: address.display_name
    }));
    
    console.log("État du lieu mis à jour avec les coordonnées:", {
      lat: address.lat, 
      lon: address.lon
    });
    
    // Close suggestions
    setAddressSuggestions([]);
  };

  return {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive,
    setAddressFieldActive,
    addressInputRef,
    suggestionsRef,
    handleSelectAddress
  };
};

export default useAddressSearch;
EOF

# 3. useProgrammateurSearch hook
cat > "$HOOKS_DIR/useProgrammateurSearch.js" << 'EOF'
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to handle programmateur search and selection
 */
export const useProgrammateurSearch = (lieu, setLieu) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load initial programmateur if a venue has one
  useEffect(() => {
    const loadProgrammateur = async () => {
      if (lieu.programmateurId) {
        try {
          const programmateurDoc = await getDoc(doc(db, 'programmateurs', lieu.programmateurId));
          if (programmateurDoc.exists()) {
            setSelectedProgrammateur({
              id: programmateurDoc.id,
              ...programmateurDoc.data()
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        }
      }
    };

    if (lieu.programmateurId) {
      loadProgrammateur();
    }
  }, [lieu.programmateurId]);

  // Effect for programmateur search
  useEffect(() => {
    // Clear previous timeout if a new search is initiated
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if term has at least 2 characters
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      
      // Add delay to avoid too many requests
      searchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for programmateurs in Firebase
  const searchProgrammateurs = async (term) => {
    try {
      // Create query to find programmateurs whose name contains the term
      const q = query(
        collection(db, 'programmateurs'),
        where('nom', '>=', term),
        where('nom', '<=', term + '\uf8ff'),
        orderBy('nom'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Create a new programmateur
  const handleCreateProgrammateur = async () => {
    try {
      // Check if a programmateur name has been entered
      if (!searchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      // Create a new programmateur directly with the name entered in the search
      const newProgRef = doc(collection(db, 'programmateurs'));
      const progData = {
        nom: searchTerm.trim(),
        nomLowercase: searchTerm.trim().toLowerCase(),
        structure: '',
        email: '',
        telephone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      // Create a programmateur object with ID and data
      const newProg = { 
        id: newProgRef.id,
        ...progData
      };
      
      // Automatically select the new programmateur
      handleSelectProgrammateur(newProg);
      
      // Show a confirmation message
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

  // Select a programmateur
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
    
    // Update lieu with the selected programmateur (just the ID and name)
    setLieu(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
  };
  
  // Remove the selected programmateur
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setLieu(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedProgrammateur,
    dropdownRef,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleCreateProgrammateur
  };
};

export default useProgrammateurSearch;
EOF

# Create component files
echo "Creating component files..."

# Main LieuForm component
cat > "$COMPONENTS_DIR/LieuForm.js" << 'EOF'
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import styles from './LieuForm.module.css';

// Import custom hooks
import { useLieuForm } from '@/hooks/lieux/useLieuForm';
import { useAddressSearch } from '@/hooks/lieux/useAddressSearch';
import { useProgrammateurSearch } from '@/hooks/lieux/useProgrammateurSearch';

// Import sections
import LieuFormHeader from './sections/LieuFormHeader';
import LieuInfoSection from './sections/LieuInfoSection';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuProgrammateurSection from './sections/LieuProgrammateurSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuFormActions from './sections/LieuFormActions';

const LieuForm = () => {
  const navigate = useNavigate();
  
  // Use custom hooks
  const {
    id,
    lieu,
    setLieu,
    loading,
    error,
    handleChange,
    validateForm,
    handleSubmit
  } = useLieuForm();

  const addressSearch = useAddressSearch(lieu, setLieu);
  
  const programmateurSearch = useProgrammateurSearch(lieu, setLieu);

  if (loading) {
    return <Spinner message="Chargement du lieu..." contentOnly={true} />;
  }

  return (
    <div className={styles.lieuFormContainer}>
      <LieuFormHeader id={id} lieuNom={lieu.nom} navigate={navigate} />

      <form onSubmit={handleSubmit} className={styles.modernForm}>
        {/* Main venue information */}
        <LieuInfoSection 
          lieu={lieu} 
          handleChange={handleChange} 
        />

        {/* Address and map */}
        <LieuAddressSection 
          lieu={lieu}
          handleChange={handleChange}
          addressSearch={addressSearch}
        />

        {/* Programmateur */}
        <LieuProgrammateurSection 
          programmateurSearch={programmateurSearch}
        />

        {/* Contact information */}
        <LieuContactSection 
          contact={lieu.contact} 
          handleChange={handleChange} 
        />

        {/* Form actions */}
        <LieuFormActions 
          loading={loading}
          id={id}
          navigate={navigate}
        />

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 shadow-sm rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-danger me-2"></i>
            <div>{error}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default LieuForm;
EOF

# Form header section
cat > "$SECTIONS_DIR/LieuFormHeader.js" << 'EOF'
import React from 'react';
import styles from './LieuFormHeader.module.css';

const LieuFormHeader = ({ id, lieuNom, navigate }) => {
  const isNewLieu = id === 'nouveau';

  return (
    <div className={styles.formHeaderContainer}>
      <h2 className={styles.modernTitle}>
        {isNewLieu ? 'Créer un nouveau lieu' : 'Modifier le lieu'}
      </h2>
      <div className={styles.breadcrumbContainer}>
        <span 
          className={styles.breadcrumbItem} 
          onClick={() => navigate('/lieux')} 
          role="button" 
          tabIndex={0}
        >
          Lieux
        </span>
        <i className="bi bi-chevron-right"></i>
        <span className={`${styles.breadcrumbItem} ${styles.active}`}>
          {isNewLieu ? 'Nouveau lieu' : lieuNom}
        </span>
      </div>
    </div>
  );
};

export default LieuFormHeader;
EOF

# Venue info section
cat > "$SECTIONS_DIR/LieuInfoSection.js" << 'EOF'
import React from 'react';
import styles from './LieuInfoSection.module.css';

const LieuInfoSection = ({ lieu, handleChange }) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-building"></i>
        <h3>Informations principales</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label htmlFor="nom" className="form-label">
            Nom du lieu <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            value={lieu.nom}
            onChange={handleChange}
            required
            placeholder="Ex: Le Café des Artistes"
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Type de lieu</label>
          <select
            className="form-select"
            id="type"
            name="type"
            value={lieu.type || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionnez un type</option>
            <option value="bar">Bar</option>
            <option value="festival">Festival</option>
            <option value="salle">Salle</option>
            <option value="plateau">Plateau</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="capacite" className="form-label">Capacité</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            id="capacite"
            name="capacite"
            value={lieu.capacite}
            onChange={handleChange}
            placeholder="Nombre maximum de personnes que le lieu peut accueillir"
          />
        </div>
      </div>
    </div>
  );
};

export default LieuInfoSection;
EOF

# Address section with map
cat > "$SECTIONS_DIR/LieuAddressSection.js" << 'EOF'
import React from 'react';
import styles from './LieuAddressSection.module.css';
import LieuMapDisplay from './LieuMapDisplay';

const LieuAddressSection = ({ lieu, handleChange, addressSearch }) => {
  const {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive,
    setAddressFieldActive,
    addressInputRef,
    suggestionsRef,
    handleSelectAddress
  } = addressSearch;

  // Check if we should show the map
  const showMap = lieu.latitude && lieu.longitude;

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-geo-alt"></i>
        <h3>Adresse</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3 address-search-container">
          <label htmlFor="adresse" className="form-label">
            Adresse <span className={styles.required}>*</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="adresse"
              name="adresse"
              ref={addressInputRef}
              value={lieu.adresse}
              onChange={handleChange}
              required
              placeholder="Commencez à taper une adresse..."
              autoComplete="off"
              onFocus={() => setAddressFieldActive(true)}
              onBlur={() => {
                // Delay to allow clicking on a suggestion
                setTimeout(() => setAddressFieldActive(false), 200);
              }}
            />
            <span className="input-group-text">
              <i className="bi bi-geo-alt"></i>
            </span>
          </div>
          <small className="form-text text-muted">
            Commencez à taper pour voir des suggestions d'adresses
          </small>
          
          {/* Address suggestions */}
          {addressSuggestions && addressSuggestions.length > 0 && (
            <div className={styles.addressSuggestions} ref={suggestionsRef}>
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.addressSuggestionItem}
                  onClick={() => handleSelectAddress(suggestion)}
                >
                  <div className={styles.suggestionIcon}>
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div className={styles.suggestionText}>
                    <div className={styles.suggestionName}>{suggestion.display_name}</div>
                    {suggestion.address && (
                      <div className={styles.suggestionDetails}>
                        {suggestion.address.postcode && suggestion.address.city && (
                          <span>{suggestion.address.postcode} {suggestion.address.city}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search indicator */}
          {isSearchingAddress && (
            <div className={styles.addressSearching}>
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Recherche en cours...</span>
              </div>
              <span className="searching-text">Recherche d'adresses...</span>
            </div>
          )}
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="mb-md-0">
              <label htmlFor="codePostal" className="form-label">
                Code postal <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="codePostal"
                name="codePostal"
                value={lieu.codePostal}
                onChange={handleChange}
                required
                placeholder="Ex: 75001"
              />
            </div>
          </div>
          <div className="col-md-8">
            <div className="mb-md-0">
              <label htmlFor="ville" className="form-label">
                Ville <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="ville"
                name="ville"
                value={lieu.ville}
                onChange={handleChange}
                required
                placeholder="Ex: Paris"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pays" className="form-label">
            Pays <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="pays"
            name="pays"
            value={lieu.pays}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Display map when coordinates are available */}
        {showMap && (
          <LieuMapDisplay
            lieu={lieu}
            setLieu={lieu => {}} // This will be filled in with proper function
          />
        )}
      </div>
    </div>
  );
};

export default LieuAddressSection;
EOF

# Map component
cat > "$SECTIONS_DIR/LieuMapDisplay.js" << 'EOF'
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LieuMapDisplay.module.css';
import L from 'leaflet';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to automatically update the map view
const MapPositionHandler = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

// Draggable marker component
const DraggableMarker = ({ position, setPosition, lieu }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latLng = marker.getLatLng();
        setPosition({
          latitude: latLng.lat,
          longitude: latLng.lng
        });
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <strong>{lieu.nom}</strong><br />
        {lieu.adresse}<br />
        {lieu.codePostal} {lieu.ville}<br />
        <small>Déplacez ce marqueur pour ajuster l'emplacement précis</small>
      </Popup>
    </Marker>
  );
};

const LieuMapDisplay = ({ lieu, setLieu }) => {
  // Function to update coordinates when marker is moved
  const handleMarkerPositionChange = (position) => {
    setLieu(prev => ({
      ...prev,
      latitude: position.latitude,
      longitude: position.longitude
    }));
  };

  return (
    <div className={styles.mapPreview}>
      <div className={styles.interactiveMapContainer}>
        <MapContainer 
          center={[lieu.latitude, lieu.longitude]} 
          zoom={15} 
          style={{ height: '300px', width: '100%', borderRadius: '4px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker 
            position={[lieu.latitude, lieu.longitude]} 
            setPosition={handleMarkerPositionChange}
            lieu={lieu}
          />
          <MapPositionHandler position={{ lat: lieu.latitude, lng: lieu.longitude }} />
        </MapContainer>
      </div>
      <small className="form-text text-muted">
        Vous pouvez zoomer et vous déplacer dans la carte. Déplacez le marqueur pour ajuster l'emplacement précis.
      </small>
    </div>
  );
};

export default LieuMapDisplay;
EOF

# Programmateur section
cat > "$SECTIONS_DIR/LieuProgrammateurSection.js" << 'EOF'
import React from 'react';
import styles from './LieuProgrammateurSection.module.css';

const LieuProgrammateurSection = ({ programmateurSearch }) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedProgrammateur,
    dropdownRef,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleCreateProgrammateur
  } = programmateurSearch;

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-badge"></i>
        <h3>Programmateur</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label className="form-label">Associer un programmateur</label>
          
          {!selectedProgrammateur ? (
            <div className={styles.programmateurSearchContainer} ref={dropdownRef}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un programmateur par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCreateProgrammateur}
                >
                  Créer un programmateur
                </button>
              </div>
              
              {isSearching && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                  <div className="dropdown-item text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Recherche en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                  {searchResults.map(prog => (
                    <div 
                      key={prog.id} 
                      className={`dropdown-item ${styles.programmateurItem}`}
                      onClick={() => handleSelectProgrammateur(prog)}
                    >
                      <div className={styles.programmateurName}>{prog.nom}</div>
                      <div className={styles.programmateurDetails}>
                        {prog.structure && <span className={styles.programmateurStructure}>{prog.structure}</span>}
                        {prog.email && <span className="programmateur-email">{prog.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                  <div className="dropdown-item text-center text-muted">
                    Aucun programmateur trouvé
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.selectedProgrammateur}>
              <div className={styles.programmateurCard}>
                <div className={styles.programmateurInfo}>
                  <span className={styles.programmateurName}>{selectedProgrammateur.nom}</span>
                  {selectedProgrammateur.structure && (
                    <span className={styles.programmateurStructure}>{selectedProgrammateur.structure}</span>
                  )}
                  <div className={styles.programmateurContacts}>
                    {selectedProgrammateur.email && (
                      <span className={styles.programmateurContactItem}>
                        <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                      </span>
                    )}
                    {selectedProgrammateur.telephone && (
                      <span className={styles.programmateurContactItem}>
                        <i className="bi bi-telephone"></i> {selectedProgrammateur.telephone}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={handleRemoveProgrammateur}
                  aria-label="Supprimer ce programmateur"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          )}
          
          <small className="form-text text-muted">
            Tapez au moins 2 caractères pour rechercher un programmateur par nom.
          </small>
        </div>
      </div>
    </div>
  );
};

export default LieuProgrammateurSection;
EOF

# Contact section
cat > "$SECTIONS_DIR/LieuContactSection.js" << 'EOF'
import React from 'react';
import styles from './LieuContactSection.module.css';

const LieuContactSection = ({ contact, handleChange }) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-lines-fill"></i>
        <h3>Informations de contact</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label htmlFor="contact.nom" className="form-label">Personne à contacter</label>
          <input
            type="text"
            className="form-control"
            id="contact.nom"
            name="contact.nom"
            value={contact?.nom || ''}
            onChange={handleChange}
            placeholder="Nom et prénom du contact"
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="mb-md-0">
              <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                <input
                  type="tel"
                  className="form-control"
                  id="contact.telephone"
                  name="contact.telephone"
                  value={contact?.telephone || ''}
                  onChange={handleChange}
                  placeholder="Ex: 01 23 45 67 89"
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-md-0">
              <label htmlFor="contact.email" className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  id="contact.email"
                  name="contact.email"
                  value={contact?.email || ''}
                  onChange={handleChange}
                  placeholder="Ex: contact@exemple.fr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuContactSection;
EOF

# Form actions section
cat > "$SECTIONS_DIR/LieuFormActions.js" << 'EOF'
import React from 'react';
import styles from './LieuFormActions.module.css';

const LieuFormActions = ({ loading, id, navigate }) => {
  return (
    <div className={styles.formActions}>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => navigate('/lieux')}
      >
        <i className="bi bi-x-circle me-2"></i>
        Annuler
      </button>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Enregistrement...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>
            {id === 'nouveau' ? 'Créer le lieu' : 'Enregistrer les modifications'}
          </>
        )}
      </button>
    </div>
  );
};

export default LieuFormActions;
EOF

# Create CSS modules for all components
echo "Creating CSS module files..."

# Create main CSS module
cat > "$COMPONENTS_DIR/LieuForm.module.css" << 'EOF'
.lieuFormContainer {
  margin: 20px;
  max-width: 1200px;
}

.modernForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formHeaderContainer {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.modernTitle {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.breadcrumbContainer {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.breadcrumbItem {
  cursor: pointer;
}

.breadcrumbItem:hover {
  color: #0d6efd;
}

.breadcrumbItem.active {
  color: #0d6efd;
  font-weight: 500;
}
EOF

# Create CSS modules for each section
for SECTION in LieuFormHeader LieuInfoSection LieuAddressSection LieuMapDisplay LieuProgrammateurSection LieuContactSection LieuFormActions; do
  cat > "$SECTIONS_DIR/$SECTION.module.css" << EOF
/* Styles for $SECTION */

.formCard {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.cardHeader {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  gap: 10px;
}

.cardHeader h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.cardHeader i {
  font-size: 1.2rem;
  color: #0d6efd;
}

.cardBody {
  padding: 20px;
}

.required {
  color: #dc3545;
}
EOF
done

# Additional styles for address section
cat >> "$SECTIONS_DIR/LieuAddressSection.module.css" << 'EOF'
.addressSuggestions {
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 5px;
}

.addressSuggestionItem {
  display: flex;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.addressSuggestionItem:hover {
  background-color: #f8f9fa;
}

.addressSuggestionItem:last-child {
  border-bottom: none;
}

.suggestionIcon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #0d6efd;
}

.suggestionText {
  flex: 1;
}

.suggestionName {
  font-weight: 500;
}

.suggestionDetails {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 2px;
}

.addressSearching {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  color: #6c757d;
}
EOF

# Additional styles for map display
cat >> "$SECTIONS_DIR/LieuMapDisplay.module.css" << 'EOF'
.mapPreview {
  margin-top: 20px;
}

.interactiveMapContainer {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ced4da;
  margin-bottom: 10px;
}
EOF

# Additional styles for programmateur section
cat >> "$SECTIONS_DIR/LieuProgrammateurSection.module.css" << 'EOF'
.programmateurSearchContainer {
  position: relative;
}

.dropdownMenu {
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.programmateurItem {
  padding: 10px;
  cursor: pointer;
}

.programmateurName {
  font-weight: 500;
}

.programmateurDetails {
  font-size: 0.85rem;
  color: #6c757d;
  display: flex;
  flex-direction: column;
}

.programmateurStructure {
  font-style: italic;
}

.selectedProgrammateur {
  margin-top: 10px;
}

.programmateurCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.programmateurInfo {
  display: flex;
  flex-direction: column;
}

.programmateurContacts {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  margin-top: 5px;
}

.programmateurContactItem {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
}
EOF

# Additional styles for form actions
cat >> "$SECTIONS_DIR/LieuFormActions.module.css" << 'EOF'
.formActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
EOF

# Make the script executable
chmod +x create_lieu_form_structure.sh

echo "Done! Created structure for modular LieuForm components."
