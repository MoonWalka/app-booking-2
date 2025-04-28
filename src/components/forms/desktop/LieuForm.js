import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import firebase from '@/firebase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationIQ } from '../../../hooks/useLocationIQ';
import '@/styles/index.css'; // Correction du chemin d'importation
import Spinner from '../../../components/common/Spinner';

import L from 'leaflet';

import { 
  getDoc,
  doc, 
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant pour mettre à jour automatiquement la vue de la carte
const MapPositionHandler = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

// Composant pour un marqueur déplaçable
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

const LieuForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  
  // États pour les suggestions d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Ajout d'un état pour suivre si le champ d'adresse est actif
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  
  // États pour la recherche de programmateurs
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // État pour l'affichage de la carte
  const [showMap, setShowMap] = useState(false);
  
  // Utilisation du hook LocationIQ
  const { isLoading: isApiLoading, error: apiError, searchAddress, getStaticMapUrl } = useLocationIQ();
  
  // Log pour vérifier que le hook est bien chargé
  useEffect(() => {
    console.log("LieuForm - hook LocationIQ chargé:", {
      isApiLoading,
      hasError: !!apiError,
      searchAddressFn: !!searchAddress,
      getStaticMapUrlFn: !!getStaticMapUrl
    });
    
    if (apiError) {
      console.error("Erreur hook LocationIQ:", apiError);
    }
  }, [isApiLoading, apiError, searchAddress, getStaticMapUrl]);
  
  // Effet pour afficher la carte lorsque les coordonnées sont disponibles
  useEffect(() => {
    if (lieu.latitude && lieu.longitude) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [lieu.latitude, lieu.longitude]);
  
  useEffect(() => {
    const fetchLieu = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const lieuDoc = await getDoc(doc(firebase.db, 'lieux', id));
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            
            // S'assurer que la propriété contact existe toujours
            const lieuWithDefaults = {
              ...lieuData,
              contact: lieuData.contact || {
                nom: '',
                telephone: '',
                email: ''
              }
            };
            
            setLieu(lieuWithDefaults);
            
            // Si un programmateur est associé, le récupérer
            if (lieuData.programmateurId) {
              try {
                const programmateurDoc = await getDoc(doc(firebase.db, 'programmateurs', lieuData.programmateurId));
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
          } else {
            console.error('Lieu non trouvé');
            navigate('/lieux');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du lieu:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLieu();
  }, [id, navigate]);

  // Effet pour la recherche d'adresse
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      console.log("handleSearch - état actuel:", {
        adresse: lieu.adresse,
        adresseLength: lieu.adresse?.length || 0,
        isApiLoading,
        isSearchingAddress,
        addressFieldActive
      });
      
      if (!lieu.adresse || lieu.adresse.length < 3 || isApiLoading) {
        console.log("Conditions non remplies pour la recherche");
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      console.log("Recherche démarrée pour:", lieu.adresse);
      
      try {
        // Appeler la fonction du hook
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
    
    // N'effectuer la recherche que si le champ est actif et l'adresse a au moins 3 caractères
    if (addressFieldActive && lieu.adresse && lieu.adresse.length >= 3 && !isApiLoading) {
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
  }, [lieu.adresse, isApiLoading, searchAddress, addressFieldActive]);
  
  // Log pour vérifier l'état des suggestions
  useEffect(() => {
    console.log("État des suggestions:", {
      count: addressSuggestions?.length || 0,
      isSearching: isSearchingAddress
    });
  }, [addressSuggestions, isSearchingAddress]);

  // Effet pour gérer la recherche de programmateurs
  useEffect(() => {
    // Nettoyer le timeout précédent si une nouvelle recherche est lancée
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // N'effectuer la recherche que si le terme a au moins 2 caractères
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      
      // Ajouter un délai pour éviter trop de requêtes
      searchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    // Nettoyage du timeout à la destruction du composant
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Gestionnaire de clic extérieur pour fermer la liste déroulante
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

  // Gestionnaire de clic extérieur pour fermer la liste des suggestions d'adresse
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

  // Fonction pour rechercher des programmateurs dans Firebase
  const searchProgrammateurs = async (term) => {
    try {
      // Créer une requête pour chercher les programmateurs dont le nom contient le terme
      const q = query(
        collection(firebase.db, 'programmateurs'),
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

  // Sélectionner une adresse parmi les suggestions
  const handleSelectAddress = (address) => {
    console.log("Adresse sélectionnée:", address);
    
    let codePostal = '';
    let ville = '';
    let pays = 'France';
    let adresse = '';
    
    // Extraire les composants d'adresse
    if (address.address) {
      // Extraire le code postal
      codePostal = address.address.postcode || '';
      
      // Extraire la ville
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Extraire le pays
      pays = address.address.country || 'France';
      
      // Construire l'adresse de rue
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Mettre à jour le state avec les informations d'adresse
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
    
    // Fermer les suggestions
    setAddressSuggestions([]);
  };

  // Fonction pour mettre à jour les coordonnées lorsque le marqueur est déplacé
  const handleMarkerPositionChange = (position) => {
    setLieu(prev => ({
      ...prev,
      latitude: position.latitude,
      longitude: position.longitude
    }));
  };

  // Fonction pour créer un nouveau programmateur
  const handleCreateProgrammateur = async () => {
    try {
      // Vérifier qu'un nom de programmateur a été saisi
      if (!searchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      // Créer directement un nouveau programmateur avec le nom saisi dans la recherche
      const newProgRef = doc(collection(firebase.db, 'programmateurs'));
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
      
      // Créer un objet programmateur avec l'ID et les données
      const newProg = { 
        id: newProgRef.id,
        ...progData
      };
      
      // Sélectionner automatiquement le nouveau programmateur
      handleSelectProgrammateur(newProg);
      
      // Afficher un message de confirmation
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

  // Fonction pour sélectionner un programmateur
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
    
    // Mettre à jour le lieu avec le programmateur sélectionné (juste l'ID et le nom)
    setLieu(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
  };
  
  // Fonction pour supprimer le programmateur sélectionné
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setLieu(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

  // Gestion de la saisie dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Log pour vérifier les changements dans le champ adresse
    if (name === 'adresse') {
      console.log("Modification du champ adresse:", value);
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLieu(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}), // Utiliser un objet vide si prev[parent] n'existe pas
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

  const validateForm = () => {
    return lieu.nom && lieu.adresse && lieu.codePostal && lieu.ville && lieu.pays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const lieuId = id && id !== 'nouveau' ? id : doc(collection(firebase.db, 'lieux')).id;
      const lieuData = {
        ...lieu,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      await setDoc(doc(firebase.db, 'lieux', lieuId), lieuData, { merge: true });
      navigate('/lieux');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lieu:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du lieu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id !== 'nouveau') {
    return <Spinner message="Chargement du lieu..." contentOnly={true} />;
  }

  if (isApiLoading) {
    return <Spinner message="Chargement de l'API de géolocalisation..." contentOnly={true} />;
  }

  return (
    <div className="lieu-form-container">
      <div className="form-header-container">
        <h2 className="modern-title">
          {id === 'nouveau' ? 'Créer un nouveau lieu' : 'Modifier le lieu'}
        </h2>
        <div className="breadcrumb-container">
          {/* Correction : ajout accessibilité (role/button + tabIndex) */}
          <span className="breadcrumb-item" onClick={() => navigate('/lieux')} role="button" tabIndex={0}>Lieux</span>
          <i className="bi bi-chevron-right"></i>
          <span className="breadcrumb-item active">
            {id === 'nouveau' ? 'Nouveau lieu' : lieu.nom}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modern-form">
        {/* Première carte - Informations principales */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-building"></i>
            <h3>Informations principales</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="nom" className="form-label">Nom du lieu <span className="required">*</span></label>
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

        {/* Deuxième carte - Adresse */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Adresse</h3>
          </div>
          <div className="card-body">
            <div className="mb-3 address-search-container">
              <label htmlFor="adresse" className="form-label">Adresse <span className="required">*</span></label>
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
                    // Délai pour permettre le clic sur une suggestion
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
              
              {/* Log pour déboguer l'affichage des suggestions */}
              {console.log("Rendu des suggestions:", {
                hasSuggestions: addressSuggestions?.length > 0,
                suggestionsCount: addressSuggestions?.length || 0,
                isSearching: isSearchingAddress
              })}
              
              {/* Suggestions d'adresse */}
              {addressSuggestions && addressSuggestions.length > 0 && (
                <div className="address-suggestions" ref={suggestionsRef}>
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="address-suggestion-item"
                      onClick={() => handleSelectAddress(suggestion)}
                    >
                      <div className="suggestion-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                      </div>
                      <div className="suggestion-text">
                        <div className="suggestion-name">{suggestion.display_name}</div>
                        {suggestion.address && (
                          <div className="suggestion-details">
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
              
              {/* Indicateur de recherche */}
              {isSearchingAddress && (
                <div className="address-searching">
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
                  <label htmlFor="codePostal" className="form-label">Code postal <span className="required">*</span></label>
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
                  <label htmlFor="ville" className="form-label">Ville <span className="required">*</span></label>
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
              <label htmlFor="pays" className="form-label">Pays <span className="required">*</span></label>
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
            
            {/* Carte interactive */}
            {showMap && (
              <div className="map-preview mt-3">
                <div className="interactive-map-container">
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
            )}
          </div>
        </div>

        {/* Nouvelle carte - Programmateur */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-badge"></i>
            <h3>Programmateur</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Associer un programmateur</label>
              
              {!selectedProgrammateur ? (
                <div className="programmateur-search-container" ref={dropdownRef}>
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
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {searchResults.map(prog => (
                        <div 
                          key={prog.id} 
                          className="dropdown-item programmateur-item"
                          onClick={() => handleSelectProgrammateur(prog)}
                        >
                          <div className="programmateur-name">{prog.nom}</div>
                          <div className="programmateur-details">
                            {prog.structure && <span className="programmateur-structure">{prog.structure}</span>}
                            {prog.email && <span className="programmateur-email">{prog.email}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun programmateur trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-programmateur">
                  <div className="programmateur-card">
                    <div className="programmateur-info">
                      <span className="programmateur-name">{selectedProgrammateur.nom}</span>
                      {selectedProgrammateur.structure && (
                        <span className="programmateur-structure">{selectedProgrammateur.structure}</span>
                      )}
                      <div className="programmateur-contacts">
                        {selectedProgrammateur.email && (
                          <span className="programmateur-contact-item">
                            <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                          </span>
                        )}
                        {selectedProgrammateur.telephone && (
                          <span className="programmateur-contact-item">
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

              {/* Carte - Informations de contact */}
              <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-lines-fill"></i>
            <h3>Informations de contact</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="contact.nom" className="form-label">Personne à contacter</label>
              <input
                type="text"
                className="form-control"
                id="contact.nom"
                name="contact.nom"
                value={lieu.contact?.nom || ''}
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
                      value={lieu.contact?.telephone || ''}
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
                      value={lieu.contact?.email || ''}
                      onChange={handleChange}
                      placeholder="Ex: contact@exemple.fr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
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
      </form>
    </div>
  );
};

export default LieuForm;
