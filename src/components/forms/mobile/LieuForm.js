// src/components/forms/mobile/LieuForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase.js.m1fix.bak';
import { useLocationIQ } from '@hooks/useLocationIQ';
import StepNavigation from '../../common/steps/StepNavigation.js';
import '../../../style/formsResponsive.css';

// Étape 1: Informations de base
const BasicInfoStep = ({ data, onNext, onBack }) => {
  const [nom, setNom] = useState(data.nom || '');
  const [capacite, setCapacite] = useState(data.capacite || '');
  
  const handleNext = () => {
    if (!nom.trim()) {
      alert('Le nom du lieu est obligatoire');
      return;
    }
    
    onNext({ nom, capacite });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label htmlFor="nom">Nom du lieu *</label>
        <input
          type="text"
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: La Cigale, Zenith de Paris..."
          required
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="capacite">Capacité (en personnes)</label>
        <input
          type="number"
          id="capacite"
          value={capacite}
          onChange={(e) => setCapacite(e.target.value)}
          placeholder="Ex: 1000"
        />
      </div>
      
      <div className="step-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

// Étape 2: Adresse
const AddressStep = ({ data, onNext, onBack }) => {
  const [adresse, setAdresse] = useState(data.adresse || '');
  const [codePostal, setCodePostal] = useState(data.codePostal || '');
  const [ville, setVille] = useState(data.ville || '');
  const [pays, setPays] = useState(data.pays || 'France');
  const [searchTerm, setSearchTerm] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const { searchAddress } = useLocationIQ();
  
  // Fonction pour rechercher des adresses
  const handleAddressSearch = async () => {
    if (searchTerm.length < 3) return;
    
    setSearching(true);
    try {
      const results = await searchAddress(searchTerm);
      setAddressResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
    } finally {
      setSearching(false);
    }
  };
  
  // Effet pour déclencher la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        handleAddressSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Sélectionner une adresse dans les résultats
  const handleSelectAddress = (result) => {
    setAdresse(result.address.house_number ? `${result.address.house_number} ${result.address.road}` : result.address.road || '');
    setCodePostal(result.address.postcode || '');
    setVille(result.address.city || '');
    setPays(result.address.country || 'France');
    setSearchTerm('');
    setAddressResults([]);
  };
  
  const handleNext = () => {
    onNext({ adresse, codePostal, ville, pays });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label htmlFor="search">Rechercher une adresse</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ex: 10 rue de la paix, Paris"
        />
        {searching && <div className="searching-indicator">Recherche en cours...</div>}
        
        {addressResults.length > 0 && (
          <div className="address-results">
            {addressResults.map((result, index) => (
              <div 
                key={index} 
                className="address-result-item"
                onClick={() => handleSelectAddress(result)}
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="step-form-group">
        <label htmlFor="adresse">Adresse</label>
        <input
          type="text"
          id="adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Ex: 10 rue de la paix"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="codePostal">Code postal</label>
        <input
          type="text"
          id="codePostal"
          value={codePostal}
          onChange={(e) => setCodePostal(e.target.value)}
          placeholder="Ex: 75000"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="ville">Ville</label>
        <input
          type="text"
          id="ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder="Ex: Paris"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="pays">Pays</label>
        <input
          type="text"
          id="pays"
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          placeholder="Ex: France"
        />
      </div>
      
      <div className="step-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

// Étape 3: Contacts
const ContactStep = ({ data, onNext, onBack }) => {
  const [email, setEmail] = useState(data.email || '');
  const [telephone, setTelephone] = useState(data.telephone || '');
  const [siteWeb, setSiteWeb] = useState(data.siteWeb || '');
  
  const handleNext = () => {
    onNext({ email, telephone, siteWeb });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: contact@lieu.com"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="telephone">Téléphone</label>
        <input
          type="tel"
          id="telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Ex: 01 23 45 67 89"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="siteWeb">Site web</label>
        <input
          type="url"
          id="siteWeb"
          value={siteWeb}
          onChange={(e) => setSiteWeb(e.target.value)}
          placeholder="Ex: https://www.exemple.com"
        />
      </div>
      
      <div className="step-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

// Composant principal du formulaire
const LieuFormMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [initialData, setInitialData] = useState({});
  
  useEffect(() => {
    const fetchLieu = async () => {
      if (id && id !== 'nouveau') {
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', id));
          if (lieuDoc.exists()) {
            setInitialData(lieuDoc.data());
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du lieu:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchLieu();
  }, [id]);
  
  const handleComplete = async (data) => {
    try {
      // Fusionner les données de toutes les étapes
      const lieuData = {
        ...data,
        updatedAt: serverTimestamp(),
        nomLowercase: data.nom.toLowerCase() // Pour faciliter les recherches
      };
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un lieu existant
        await setDoc(doc(db, 'lieux', id), lieuData, { merge: true });
      } else {
        // Création d'un nouveau lieu
        lieuData.createdAt = serverTimestamp();
        const newLieuRef = doc(collection(db, 'lieux'));
        await setDoc(newLieuRef, lieuData);
      }
      
      navigate('/lieux');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lieu:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du lieu.');
    }
  };
  
  const handleCancel = () => {
    navigate('/lieux');
  };
  
  if (loading) {
    return <div className="loading-indicator">Chargement...</div>;
  }
  
  // Définir les étapes du formulaire
  const steps = [
    { 
      title: 'Informations de base', 
      component: BasicInfoStep 
    },
    { 
      title: 'Adresse', 
      component: AddressStep 
    },
    { 
      title: 'Contacts', 
      component: ContactStep 
    }
  ];
  
  return (
    <div className="lieu-form-mobile">
      <div className="mobile-form-header">
        <h1>{id !== 'nouveau' ? 'Modifier le lieu' : 'Nouveau lieu'}</h1>
      </div>
      
      <StepNavigation 
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialStep={0}
      />
    </div>
  );
};

export default LieuFormMobile;
