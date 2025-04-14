import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import '../../style/programmateurForm.css';
import '../../style/formPublic.css';

const ProgrammateurForm = ({ token, concertId, formLinkId, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    contact: {
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: ''
    },
    structure: {
      raisonSociale: '',
      type: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      siret: '',
      tva: ''
    },
    concertsAssocies: []
  });
  const [submitted, setSubmitted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const isPublicFormMode = Boolean(token && concertId && formLinkId);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      // Code inchangé de récupération des données
    };
    fetchProgrammateur();
  }, [id, concertId, navigate, isPublicFormMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const searchConcerts = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const concertsRef = collection(db, 'concerts');
      const q = query(concertsRef, orderBy('titre'), limit(10));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.titre?.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: doc.id,
            titre: data.titre,
            date: data.date || null,
            lieu: data.lieuNom || 'Lieu non spécifié'
          });
        }
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Erreur recherche concerts:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchConcerts(searchQuery);
        setShowResults(true);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addConcertToAssociated = (concert) => {
    const exists = formData.concertsAssocies.some(c => c.id === concert.id);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        concertsAssocies: [...prev.concertsAssocies, concert]
      }));
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const removeConcertFromAssociated = (concertId) => {
    setFormData(prev => ({
      ...prev,
      concertsAssocies: prev.concertsAssocies.filter(c => c.id !== concertId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.contact.nom) {
        alert('Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }

      // Reste de la fonction handleSubmit existante inchangé
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      setError('Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu du formulaire et UI existante inchangés ici

  return (
    <div className={isPublicFormMode ? 'form-public-container' : 'programmateur-form-container'}>
      {/* Rendu UI existant inchangé, insertion du champ de recherche si nécessaire */}

      {!isPublicFormMode && (
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-music-note-list"></i>
            <h3>Concerts associés</h3>
          </div>
          <div className="card-body">
            <label>Rechercher un concert</label>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Titre du concert" className="form-control" />
            {showResults && (
              <ul className="list-group mt-2">
                {searchResults.map(c => (
                  <li key={c.id} className="list-group-item" onClick={() => addConcertToAssociated(c)}>
                    <strong>{c.titre}</strong> – {c.date?.seconds ? new Date(c.date.seconds * 1000).toLocaleDateString('fr-FR') : ''} – {c.lieu}
                  </li>
                ))}
              </ul>
            )}
            <div className="concert-list mt-3">
              {formData.concertsAssocies.map(c => (
                <div key={c.id} className="concert-card">
                  <div className="concert-card-body d-flex justify-content-between">
                    <div>
                      <div className="concert-name"><i className="bi bi-music-note"></i> {c.titre}</div>
                      <div className="concert-details">
                        {c.date && <span className="concert-detail"><i className="bi bi-calendar-event"></i> {typeof c.date === 'object' && c.date.seconds ? new Date(c.date.seconds * 1000).toLocaleDateString('fr-FR') : c.date}</span>}
                        {c.lieu && <span className="concert-detail"><i className="bi bi-geo-alt"></i> {c.lieu}</span>}
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeConcertFromAssociated(c.id)}>
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurForm;
