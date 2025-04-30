// src/components/artistes/mobile/ArtisteForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../firebaseInit';
import styles from './ArtisteForm.module.css';

// Version mobile simplifiée du formulaire d'artiste
const ArtisteFormMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  
  // État pour stocker toutes les données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    genre: '',
    description: '',
    contacts: {
      email: '',
      telephone: '',
      siteWeb: '',
      instagram: '',
      facebook: ''
    },
    membres: []
  });
  
  // État pour gérer la saisie d'un nouveau membre
  const [nouveauMembre, setNouveauMembre] = useState('');
  
  // Chargement des données si mode édition
  useEffect(() => {
    const fetchArtiste = async () => {
      if (id && id !== 'nouveau') {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', id));
          if (artisteDoc.exists()) {
            // Pré-remplir le formulaire avec les données existantes
            const data = artisteDoc.data();
            setFormData({
              nom: data.nom || '',
              genre: data.genre || '',
              description: data.description || '',
              contacts: {
                email: data.contacts?.email || '',
                telephone: data.contacts?.telephone || '',
                siteWeb: data.contacts?.siteWeb || '',
                instagram: data.contacts?.instagram || '',
                facebook: data.contacts?.facebook || ''
              },
              membres: data.membres || []
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'artiste:', error);
          alert('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchArtiste();
  }, [id]);
  
  // Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Pour les champs imbriqués comme "contacts.email"
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Ajout d'un membre
  const ajouterMembre = () => {
    if (nouveauMembre.trim()) {
      setFormData({
        ...formData,
        membres: [...formData.membres, nouveauMembre.trim()]
      });
      setNouveauMembre('');
    }
  };
  
  // Suppression d'un membre
  const supprimerMembre = (index) => {
    const nouveauxMembres = [...formData.membres];
    nouveauxMembres.splice(index, 1);
    setFormData({
      ...formData,
      membres: nouveauxMembres
    });
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('Le nom de l\'artiste est obligatoire');
      return;
    }
    
    try {
      // Préparation des données
      const artisteData = {
        ...formData,
        updatedAt: Timestamp.now()
      };
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un artiste existant
        await updateDoc(doc(db, 'artistes', id), artisteData);
      } else {
        // Création d'un nouvel artiste
        artisteData.createdAt = Timestamp.now();
        const newArtisteRef = doc(collection(db, 'artistes'));
        await setDoc(newArtisteRef, artisteData);
      }
      
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'artiste:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    }
  };
  
  // Annulation et retour à la liste
  const handleCancel = () => {
    navigate('/artistes');
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.artisteFormMobile}>
      <div className={styles.mobileFormHeader}>
        <h1 className="mb-3">{id !== 'nouveau' ? 'Modifier l\'artiste' : 'Nouvel artiste'}</h1>
        <p className="text-muted small">Tous les champs avec * sont obligatoires</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.mobileForm}>
        {/* Section Informations de base */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Informations de base</h3>
          
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom de l'artiste"
              required
            />
            <label htmlFor="nom">Nom de l'artiste *</label>
          </div>
          
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Genre musical"
            />
            <label htmlFor="genre">Genre musical</label>
          </div>
          
          <div className="form-floating mb-3">
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              style={{height: "100px"}}
            ></textarea>
            <label htmlFor="description">Description</label>
          </div>
        </div>
        
        {/* Section Contacts */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Coordonnées</h3>
          
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="email"
              name="contacts.email"
              value={formData.contacts.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <label htmlFor="email">Email</label>
          </div>
          
          <div className="form-floating mb-3">
            <input
              type="tel"
              className="form-control"
              id="telephone"
              name="contacts.telephone"
              value={formData.contacts.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
            />
            <label htmlFor="telephone">Téléphone</label>
          </div>
          
          <div className="form-floating mb-3">
            <input
              type="url"
              className="form-control"
              id="siteWeb"
              name="contacts.siteWeb"
              value={formData.contacts.siteWeb}
              onChange={handleChange}
              placeholder="Site web"
            />
            <label htmlFor="siteWeb">Site web</label>
          </div>
          
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="instagram"
              name="contacts.instagram"
              value={formData.contacts.instagram}
              onChange={handleChange}
              placeholder="Instagram"
            />
            <label htmlFor="instagram">Instagram</label>
          </div>
          
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="facebook"
              name="contacts.facebook"
              value={formData.contacts.facebook}
              onChange={handleChange}
              placeholder="Facebook"
            />
            <label htmlFor="facebook">Facebook</label>
          </div>
        </div>
        
        {/* Section Membres */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Membres</h3>
          
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nom du membre"
              value={nouveauMembre}
              onChange={(e) => setNouveauMembre(e.target.value)}
            />
            <button 
              type="button" 
              className="tc-btn-primary"
              onClick={ajouterMembre}
            >
              <i className="bi bi-plus-lg"></i> Ajouter
            </button>
          </div>
          
          {formData.membres.length === 0 ? (
            <div className="text-muted text-center my-3">Aucun membre ajouté</div>
          ) : (
            <div className={styles.membresList}>
              {formData.membres.map((membre, index) => (
                <div key={index} className={styles.membreItem}>
                  <span>{membre}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => supprimerMembre(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className={styles.formActions}>
          <button type="submit" className="tc-btn-primary btn-lg">
            <i className="bi bi-check-lg me-2"></i>
            {id !== 'nouveau' ? 'Enregistrer' : 'Créer l\'artiste'}
          </button>
          <button 
            type="button" 
            className="tc-btn-outline-secondary btn-lg"
            onClick={handleCancel}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtisteFormMobile;
