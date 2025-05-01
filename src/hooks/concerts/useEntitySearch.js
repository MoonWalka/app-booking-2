import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, limit, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseInit';

/**
 * Hook personnalisé pour gérer la recherche d'entités (lieux, programmateurs, artistes)
 * 
 * @returns {Object} États et fonctions pour gérer les recherches d'entités
 */
const useEntitySearch = () => {
  // États pour les termes de recherche
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [progSearchTerm, setProgSearchTerm] = useState('');
  const [artisteSearchTerm, setArtisteSearchTerm] = useState('');
  
  // États pour les résultats de recherche
  const [lieuResults, setLieuResults] = useState([]);
  const [progResults, setProgResults] = useState([]);
  const [artisteResults, setArtisteResults] = useState([]);
  
  // États pour contrôler l'affichage des résultats
  const [showLieuResults, setShowLieuResults] = useState(false);
  const [showProgResults, setShowProgResults] = useState(false);
  const [showArtisteResults, setShowArtisteResults] = useState(false);
  
  // États pour les indicateurs de chargement
  const [isSearchingLieux, setIsSearchingLieux] = useState(false);
  const [isSearchingProgs, setIsSearchingProgs] = useState(false);
  const [isSearchingArtistes, setIsSearchingArtistes] = useState(false);
  
  // Références pour les menus déroulants et les timeouts de recherche
  const lieuDropdownRef = useRef(null);
  const progDropdownRef = useRef(null);
  const artisteDropdownRef = useRef(null);
  const lieuSearchTimeoutRef = useRef(null);
  const progSearchTimeoutRef = useRef(null);
  const artisteSearchTimeoutRef = useRef(null);
  
  // Effet pour gérer les clics en dehors des menus déroulants
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lieuDropdownRef.current && !lieuDropdownRef.current.contains(event.target)) {
        setShowLieuResults(false);
      }
      if (progDropdownRef.current && !progDropdownRef.current.contains(event.target)) {
        setShowProgResults(false);
      }
      if (artisteDropdownRef.current && !artisteDropdownRef.current.contains(event.target)) {
        setShowArtisteResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effet pour la recherche de lieux avec debounce
  useEffect(() => {
    if (lieuSearchTimeoutRef.current) {
      clearTimeout(lieuSearchTimeoutRef.current);
    }
    
    if (lieuSearchTerm.length >= 2) {
      setIsSearchingLieux(true);
      lieuSearchTimeoutRef.current = setTimeout(() => {
        searchLieux(lieuSearchTerm);
      }, 300);
    } else {
      setLieuResults([]);
      setIsSearchingLieux(false);
    }
    
    return () => {
      if (lieuSearchTimeoutRef.current) {
        clearTimeout(lieuSearchTimeoutRef.current);
      }
    };
  }, [lieuSearchTerm]);
  
  // Effet pour la recherche de programmateurs avec debounce
  useEffect(() => {
    if (progSearchTimeoutRef.current) {
      clearTimeout(progSearchTimeoutRef.current);
    }
    
    if (progSearchTerm.length >= 2) {
      setIsSearchingProgs(true);
      progSearchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(progSearchTerm);
      }, 300);
    } else {
      setProgResults([]);
      setIsSearchingProgs(false);
    }
    
    return () => {
      if (progSearchTimeoutRef.current) {
        clearTimeout(progSearchTimeoutRef.current);
      }
    };
  }, [progSearchTerm]);
  
  // Effet pour la recherche d'artistes avec debounce
  useEffect(() => {
    if (artisteSearchTimeoutRef.current) {
      clearTimeout(artisteSearchTimeoutRef.current);
    }
    
    if (artisteSearchTerm.length >= 2) {
      setIsSearchingArtistes(true);
      artisteSearchTimeoutRef.current = setTimeout(() => {
        searchArtistes(artisteSearchTerm);
      }, 300);
    } else {
      setArtisteResults([]);
      setIsSearchingArtistes(false);
    }
    
    return () => {
      if (artisteSearchTimeoutRef.current) {
        clearTimeout(artisteSearchTimeoutRef.current);
      }
    };
  }, [artisteSearchTerm]);
  
  // Fonction pour rechercher des lieux
  const searchLieux = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      const lieuxRef = collection(db, 'lieux');
      const lieuxQuery = query(
        lieuxRef,
        where('nomLowercase', '>=', termLower),
        where('nomLowercase', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const lieuxSnapshot = await getDocs(lieuxQuery);
      const lieuxData = lieuxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Résultats de la recherche de lieux:', lieuxData);
      setLieuResults(lieuxData);
      setShowLieuResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
    } finally {
      setIsSearchingLieux(false);
    }
  };
  
  // Fonction pour rechercher des programmateurs
  const searchProgrammateurs = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      const progsRef = collection(db, 'programmateurs');
      const progsQuery = query(
        progsRef,
        where('nomLowercase', '>=', termLower),
        where('nomLowercase', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const progsSnapshot = await getDocs(progsQuery);
      const progsData = progsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Résultats de la recherche de programmateurs:', progsData);
      setProgResults(progsData);
      setShowProgResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setIsSearchingProgs(false);
    }
  };
  
  // Fonction pour rechercher des artistes
  const searchArtistes = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      const artistesRef = collection(db, 'artistes');
      const artistesQuery = query(
        artistesRef,
        where('nomLowercase', '>=', termLower),
        where('nomLowercase', '<=', termLower + '\uf8ff'),
        limit(10)
      );
      
      const artistesSnapshot = await getDocs(artistesQuery);
      const artistesData = artistesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Résultats de la recherche d\'artistes:', artistesData);
      setArtisteResults(artistesData);
      setShowArtisteResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'artistes:', error);
    } finally {
      setIsSearchingArtistes(false);
    }
  };
  
  // Fonction pour créer un nouveau lieu
  const handleCreateLieu = async (nom, onCreated) => {
    try {
      if (!nom.trim()) {
        alert('Veuillez saisir un nom de lieu avant de créer un nouveau lieu.');
        return;
      }
      
      const newLieuRef = doc(collection(db, 'lieux'));
      const lieuData = {
        nom: nom.trim(),
        nomLowercase: nom.trim().toLowerCase(),
        adresse: '',
        codePostal: '',
        ville: '',
        capacite: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newLieuRef, lieuData);
      
      const newLieuWithId = { 
        id: newLieuRef.id,
        ...lieuData
      };
      
      console.log('Nouveau lieu créé:', newLieuWithId);
      
      if (onCreated) onCreated(newLieuWithId);
      setShowLieuResults(false);
      
      alert(`Le lieu "${lieuData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert('Une erreur est survenue lors de la création du lieu.');
    }
  };
  
  // Fonction pour créer un nouveau programmateur
  const handleCreateProgrammateur = async (nom, onCreated) => {
    try {
      if (!nom.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      const newProgRef = doc(collection(db, 'programmateurs'));
      const progData = {
        nom: nom.trim(),
        nomLowercase: nom.trim().toLowerCase(),
        structure: '',
        telephone: '',
        email: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      const newProgWithId = { 
        id: newProgRef.id,
        ...progData
      };
      
      console.log('Nouveau programmateur créé:', newProgWithId);
      
      if (onCreated) onCreated(newProgWithId);
      setShowProgResults(false);
      
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };
  
  // Fonction pour créer un nouvel artiste
  const handleCreateArtiste = async (nom, onCreated) => {
    try {
      if (!nom.trim()) {
        alert('Veuillez saisir un nom d\'artiste avant de créer un nouvel artiste.');
        return;
      }
      
      const newArtisteRef = doc(collection(db, 'artistes'));
      const artisteData = {
        nom: nom.trim(),
        nomLowercase: nom.trim().toLowerCase(),
        genre: '',
        nbMembres: 1,
        email: '',
        telephone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newArtisteRef, artisteData);
      
      const newArtisteWithId = { 
        id: newArtisteRef.id,
        ...artisteData
      };
      
      console.log('Nouvel artiste créé:', newArtisteWithId);
      
      if (onCreated) onCreated(newArtisteWithId);
      setShowArtisteResults(false);
      
      alert(`L'artiste "${artisteData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
    } catch (error) {
      console.error('Erreur lors de la création de l\'artiste:', error);
      alert('Une erreur est survenue lors de la création de l\'artiste.');
    }
  };

  return {
    // Termes de recherche
    lieuSearchTerm, setLieuSearchTerm,
    progSearchTerm, setProgSearchTerm,
    artisteSearchTerm, setArtisteSearchTerm,
    
    // Résultats de recherche
    lieuResults,
    progResults,
    artisteResults,
    
    // États d'affichage
    showLieuResults, setShowLieuResults,
    showProgResults, setShowProgResults,
    showArtisteResults, setShowArtisteResults,
    
    // États de chargement
    isSearchingLieux,
    isSearchingProgs,
    isSearchingArtistes,
    
    // Références
    lieuDropdownRef,
    progDropdownRef,
    artisteDropdownRef,
    
    // Fonctions de recherche
    searchLieux,
    searchProgrammateurs,
    searchArtistes,
    
    // Fonctions de création
    handleCreateLieu,
    handleCreateProgrammateur,
    handleCreateArtiste
  };
};

export default useEntitySearch;
