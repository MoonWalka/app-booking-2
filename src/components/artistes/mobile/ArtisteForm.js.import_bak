// src/components/artistes/mobile/ArtisteForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc, setDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase.js.m1fix.bak';
import StepNavigation from '../../common/steps/StepNavigation.js';
import '../../../style/artisteForm.css';

// Composant pour l'étape 1 : Informations de base
const BasicInfoStep = ({ data, onNext, onBack }) => {
  const [nom, setNom] = useState(data.nom || '');
  const [genre, setGenre] = useState(data.genre || '');
  const [description, setDescription] = useState(data.description || '');
  
  const handleNext = () => {
    if (!nom.trim()) {
      alert('Le nom de l\'artiste est obligatoire');
      return;
    }
    
    onNext({ nom, genre, description });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label htmlFor="nom">Nom de l'artiste *</label>
        <input
          type="text"
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: Les Rockeurs du Dimanche"
          required
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="genre">Genre musical</label>
        <input
          type="text"
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Ex: Rock, Jazz, Pop..."
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Présentez l'artiste en quelques lignes..."
        ></textarea>
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

// Composant pour l'étape 2 : Contacts
const ContactStep = ({ data, onNext, onBack }) => {
  const [email, setEmail] = useState(data.contacts?.email || '');
  const [telephone, setTelephone] = useState(data.contacts?.telephone || '');
  const [siteWeb, setSiteWeb] = useState(data.contacts?.siteWeb || '');
  const [instagram, setInstagram] = useState(data.contacts?.instagram || '');
  const [facebook, setFacebook] = useState(data.contacts?.facebook || '');
  
  const handleNext = () => {
    const contacts = { email, telephone, siteWeb, instagram, facebook };
    onNext({ contacts });
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
          placeholder="Ex: contact@artiste.com"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="telephone">Téléphone</label>
        <input
          type="tel"
          id="telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Ex: 06 12 34 56 78"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="siteWeb">Site web</label>
        <input
          type="url"
          id="siteWeb"
          value={siteWeb}
          onChange={(e) => setSiteWeb(e.target.value)}
          placeholder="Ex: https://www.artiste.com"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="instagram">Instagram</label>
        <input
          type="text"
          id="instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Ex: artisteofficiel"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="facebook">Facebook</label>
        <input
          type="text"
          id="facebook"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="Ex: artisteofficiel"
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

// Composant pour l'étape 3 : Membres
const MembersStep = ({ data, onNext, onBack }) => {
  const [membres, setMembres] = useState(data.membres || []);
  const [nouveauMembre, setNouveauMembre] = useState('');
  
  const ajouterMembre = () => {
    if (nouveauMembre.trim()) {
      setMembres([...membres, nouveauMembre.trim()]);
      setNouveauMembre('');
    }
  };
  
  const supprimerMembre = (index) => {
    const newMembres = [...membres];
    newMembres.splice(index, 1);
    setMembres(newMembres);
  };
  
  const handleNext = () => {
    onNext({ membres });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label>Membres du groupe</label>
        <div className="add-membre-container">
          <input
            type="text"
            value={nouveauMembre}
            onChange={(e) => setNouveauMembre(e.target.value)}
            placeholder="Nom du membre"
          />
          <button 
            type="button" 
            className="btn btn-sm btn-outline-primary"
            onClick={ajouterMembre}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
        
        <div className="membres-list">
          {membres.length === 0 ? (
            <div className="text-muted small">Aucun membre ajouté</div>
          ) : (
            <ul className="list-group">
              {membres.map((membre, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {membre}
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => supprimerMembre(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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

// Composant principal ArtisteForm pour mobile
const ArtisteFormMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [initialData, setInitialData] = useState({});
  
  useEffect(() => {
    const fetchArtiste = async () => {
      if (id && id !== 'nouveau') {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', id));
          if (artisteDoc.exists()) {
            setInitialData(artisteDoc.data());
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'artiste:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchArtiste();
  }, [id]);
  
  const handleComplete = async (data) => {
    try {
      // Fusionner les données de toutes les étapes
      const artisteData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un artiste existant
        await updateDoc(doc(db, 'artistes', id), artisteData);
      } else {
        // Création d'un nouvel artiste
        artisteData.createdAt = serverTimestamp();
        const newArtisteRef = doc(collection(db, 'artistes'));
        await setDoc(newArtisteRef, artisteData);
      }
      
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'artiste:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'artiste.');
    }
  };
  
  const handleCancel = () => {
    navigate('/artistes');
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
      title: 'Coordonnées', 
      component: ContactStep 
    },
    { 
      title: 'Membres', 
      component: MembersStep 
    }
  ];
  
  return (
    <div className="artiste-form-mobile">
      <div className="mobile-form-header">
        <h1>{id !== 'nouveau' ? 'Modifier l\'artiste' : 'Nouvel artiste'}</h1>
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

export default ArtisteFormMobile;
