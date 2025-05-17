import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useLocationIQ } from '@/hooks/common/useLocationIQ';

/**
 * Hook complet pour gérer le formulaire de lieu
 * Combine la logique de useLieuForm, useAddressSearch et useProgrammateurSearch
 */
export const useLieuFormComplete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États du formulaire principal
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

  // États pour la recherche d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
  
  // États pour la recherche de programmateurs
  const [programmateurs, setProgrammateurs] = useState([]);
  const [programmateurSearchQuery, setProgrammateurSearchQuery] = useState('');
  const [isProgrammateurSearchLoading, setProgrammateurSearchLoading] = useState(false);
  
  // Récupération de l'API de géolocalisation
  const { geocode, search, isLoading: isLocationIQLoading } = useLocationIQ();

  // Chargement du lieu si on est en mode édition
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

  // Gestion des changements de champs du formulaire
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

  // Validation du formulaire
  const validateForm = () => {
    return lieu.nom && lieu.adresse && lieu.codePostal && lieu.ville && lieu.pays;
  };

  // Soumission du formulaire
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

  // Fonctions pour la recherche d'adresse
  const handleAddressSearch = async (query) => {
    setAddressSearchQuery(query);
    if (query.length < 3) return;

    setIsAddressSearchLoading(true);
    try {
      const results = await search(query);
      setAddressSuggestions(results || []);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
    } finally {
      setIsAddressSearchLoading(false);
    }
  };

  const selectAddress = (address) => {
    setLieu(prev => ({
      ...prev,
      adresse: address.address?.road || address.address?.house_number ? 
              `${address.address?.house_number || ''} ${address.address?.road || ''}`.trim() : 
              address.display_name.split(',')[0],
      codePostal: address.address?.postcode || '',
      ville: address.address?.city || address.address?.town || address.address?.village || '',
      pays: address.address?.country || 'France',
      latitude: parseFloat(address.lat) || null,
      longitude: parseFloat(address.lon) || null,
      display_name: address.display_name
    }));
    setAddressSuggestions([]);
    setAddressSearchQuery('');
  };

  // Fonction pour géocoder l'adresse actuelle
  const geocodeCurrentAddress = async () => {
    if (!lieu.adresse || !lieu.ville) {
      alert('Veuillez entrer une adresse et une ville pour géolocaliser');
      return;
    }

    setIsAddressSearchLoading(true);
    try {
      const query = `${lieu.adresse}, ${lieu.codePostal || ''} ${lieu.ville}, ${lieu.pays}`;
      const results = await geocode(query);
      
      if (results && results.length > 0) {
        const firstResult = results[0];
        setLieu(prev => ({
          ...prev,
          latitude: parseFloat(firstResult.lat) || null,
          longitude: parseFloat(firstResult.lon) || null,
          display_name: firstResult.display_name
        }));
      } else {
        alert('Aucun résultat trouvé pour cette adresse');
      }
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
      alert('Erreur de géolocalisation');
    } finally {
      setIsAddressSearchLoading(false);
    }
  };

  // Fonctions pour la recherche de programmateurs
  const handleProgrammateurSearch = async (query) => {
    setProgrammateurSearchQuery(query);
    if (query.length < 2) return;

    setProgrammateurSearchLoading(true);
    try {
      // Simulation d'une recherche - à remplacer par une vraie requête Firestore
      const programmateursSnapshot = await getDocs(
        query(collection(db, 'programmateurs'), 
              where('nom', '>=', query),
              where('nom', '<=', query + '\uf8ff'),
              limit(10))
      );
      
      const programmateursList = [];
      programmateursSnapshot.forEach((doc) => {
        programmateursList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setProgrammateurs(programmateursList);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setProgrammateurSearchLoading(false);
    }
  };

  const selectProgrammateur = (programmateur) => {
    setLieu(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
    setProgrammateurs([]);
    setProgrammateurSearchQuery('');
  };

  const removeProgrammateur = () => {
    setLieu(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

  // Regroupement des fonctions liées à la recherche d'adresse
  const addressSearch = {
    query: addressSearchQuery,
    setQuery: setAddressSearchQuery,
    suggestions: addressSuggestions,
    isLoading: isAddressSearchLoading,
    handleSearch: handleAddressSearch,
    selectAddress,
    geocodeCurrentAddress
  };

  // Regroupement des fonctions liées à la recherche de programmateurs
  const programmateurSearch = {
    query: programmateurSearchQuery,
    setQuery: setProgrammateurSearchQuery,
    programmateurs,
    isLoading: isProgrammateurSearchLoading,
    handleSearch: handleProgrammateurSearch,
    selectProgrammateur,
    removeProgrammateur
  };

  return {
    id,
    lieu,
    setLieu,
    loading: loading || isLocationIQLoading,
    error,
    handleChange,
    validateForm,
    handleSubmit,
    addressSearch,
    programmateurSearch
  };
};

export default useLieuFormComplete;