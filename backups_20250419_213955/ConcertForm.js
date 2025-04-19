// src/components/concerts/mobile/ConcertForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import StepNavigation from '../../common/steps/StepNavigation';
import '../../../style/concertForm.css';
import '../../../style/formsResponsive.css';

// Étape 1: Informations de base
const BasicInfoStep = ({ data, onNext, onBack }) => {
  const [titre, setTitre] = useState(data.titre || '');
  const [date, setDate] = useState(data.date || '');
  const [montant, setMontant] = useState(data.montant || '');
  const [statut, setStatut] = useState(data.statut || 'contact');
  
  const handleNext = () => {
    if (!date) {
      alert('La date du concert est obligatoire');
      return;
    }
    
    onNext({ titre, date, montant, statut });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label htmlFor="titre">Titre du concert</label>
        <input
          type="text"
          id="titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex: Concert de jazz, Festival d'été..."
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="date">Date du concert *</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="montant">Montant (€)</label>
        <input
          type="number"
          id="montant"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Ex: 1000"
        />
      </div>
      
      <div className="step-form-group">
        <label htmlFor="statut">Statut</label>
        <select
          id="statut"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="contact">Contact</option>
          <option value="preaccord">Pré-accord</option>
          <option value="contrat">Contrat</option>
          <option value="acompte">Acompte</option>
          <option value="solde">Solde</option>
          <option value="annule">Annulé</option>
        </select>
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

// Étape 2: Lieu
const LieuStep = ({ data, onNext, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lieuxResults, setLieuxResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLieu, setSelectedLieu] = useState(data.lieu || null);
  
  // Rechercher des lieux
  useEffect(() => {
    const searchLieux = async () => {
      if (searchTerm.length < 2) return;
      
      setSearching(true);
      try {
        const lieuxRef = collection(db, 'lieux');
        const q = query(
          lieuxRef,
          where('nomLowercase', '>=', searchTerm.toLowerCase()),
          where('nomLowercase', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLieuxResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche de lieux:', error);
      } finally {
        setSearching(false);
      }
    };
    
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchLieux();
      } else {
        setLieuxResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSelectLieu = (lieu) => {
    setSelectedLieu(lieu);
    setSearchTerm('');
    setLieuxResults([]);
  };
  
  const handleRemoveLieu = () => {
    setSelectedLieu(null);
  };
  
  const handleNext = () => {
    if (!selectedLieu) {
      alert('Veuillez sélectionner un lieu');
      return;
    }
    
    onNext({ lieu: selectedLieu });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label>Lieu du concert *</label>
        
        {!selectedLieu ? (
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un lieu par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {searching && (
              <div className="searching-indicator">
                <div className="spinner-border spinner-border-sm" role="status"></div>
                <span>Recherche en cours...</span>
              </div>
            )}
            
            {lieuxResults.length > 0 && (
              <div className="search-results">
                {lieuxResults.map(lieu => (
                  <div 
                    key={lieu.id} 
                    className="search-result-item"
                    onClick={() => handleSelectLieu(lieu)}
                  >
                    <div className="result-name">{lieu.nom}</div>
                    {lieu.adresse && lieu.ville && (
                      <div className="result-detail">
                        {lieu.adresse}, {lieu.codePostal} {lieu.ville}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 2 && lieuxResults.length === 0 && !searching && (
              <div className="no-results">
                <p>Aucun lieu trouvé. <button type="button" className="btn-link">Créer "{searchTerm}"</button></p>
              </div>
            )}
          </div>
        ) : (
          <div className="selected-item">
            <div className="selected-item-info">
              <div className="selected-item-name">{selectedLieu.nom}</div>
              {selectedLieu.adresse && (
                <div className="selected-item-detail">
                  {selectedLieu.adresse}, {selectedLieu.codePostal} {selectedLieu.ville}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="selected-item-remove" 
              onClick={handleRemoveLieu}
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="step-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedLieu}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

// Étape 3: Programmateur
const ProgrammateurStep = ({ data, onNext, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [progResults, setProgResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(data.programmateur || null);
  
  // Rechercher des programmateurs
  useEffect(() => {
    const searchProgrammateurs = async () => {
      if (searchTerm.length < 2) return;
      
      setSearching(true);
      try {
        const progsRef = collection(db, 'programmateurs');
        const q = query(
          progsRef,
          where('nomLowercase', '>=', searchTerm.toLowerCase()),
          where('nomLowercase', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProgResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche de programmateurs:', error);
      } finally {
        setSearching(false);
      }
    };
    
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchProgrammateurs();
      } else {
        setProgResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSelectProgrammateur = (prog) => {
    setSelectedProgrammateur(prog);
    setSearchTerm('');
    setProgResults([]);
  };
  
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
  };
  
  const handleNext = () => {
    onNext({ programmateur: selectedProgrammateur });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label>Programmateur (optionnel)</label>
        
        {!selectedProgrammateur ? (
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un programmateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {searching && (
              <div className="searching-indicator">
                <div className="spinner-border spinner-border-sm" role="status"></div>
                <span>Recherche en cours...</span>
              </div>
            )}
            
            {progResults.length > 0 && (
              <div className="search-results">
                {progResults.map(prog => (
                  <div 
                    key={prog.id} 
                    className="search-result-item"
                    onClick={() => handleSelectProgrammateur(prog)}
                  >
                    <div className="result-name">{prog.nom}</div>
                    {prog.structure && (
                      <div className="result-detail">
                        {prog.structure}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 2 && progResults.length === 0 && !searching && (
              <div className="no-results">
                <p>Aucun programmateur trouvé. <button type="button" className="btn-link">Créer "{searchTerm}"</button></p>
              </div>
            )}
          </div>
        ) : (
          <div className="selected-item">
            <div className="selected-item-info">
              <div className="selected-item-name">{selectedProgrammateur.nom}</div>
              {selectedProgrammateur.structure && (
                <div className="selected-item-detail">
                  {selectedProgrammateur.structure}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="selected-item-remove" 
              onClick={handleRemoveProgrammateur}
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        )}
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

// Étape 4: Artiste
const ArtisteStep = ({ data, onNext, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artisteResults, setArtisteResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedArtiste, setSelectedArtiste] = useState(data.artiste || null);
  
  // Rechercher des artistes
  useEffect(() => {
    const searchArtistes = async () => {
      if (searchTerm.length < 2) return;
      
      setSearching(true);
      try {
        const artistesRef = collection(db, 'artistes');
        const q = query(
          artistesRef,
          where('nom', '>=', searchTerm),
          where('nom', '<=', searchTerm + '\uf8ff'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setArtisteResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'artistes:', error);
      } finally {
        setSearching(false);
      }
    };
    
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchArtistes();
      } else {
        setArtisteResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSelectArtiste = (artiste) => {
    setSelectedArtiste(artiste);
    setSearchTerm('');
    setArtisteResults([]);
  };
  
  const handleRemoveArtiste = () => {
    setSelectedArtiste(null);
  };
  
  const handleNext = () => {
    onNext({ artiste: selectedArtiste });
  };
  
  return (
    <div className="step-form">
      <div className="step-form-group">
        <label>Artiste (optionnel)</label>
        
        {!selectedArtiste ? (
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un artiste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {searching && (
              <div className="searching-indicator">
                <div className="spinner-border spinner-border-sm" role="status"></div>
                <span>Recherche en cours...</span>
              </div>
            )}
            
            {artisteResults.length > 0 && (
              <div className="search-results">
                {artisteResults.map(artiste => (
                  <div 
                    key={artiste.id} 
                    className="search-result-item"
                    onClick={() => handleSelectArtiste(artiste)}
                  >
                    <div className="result-name">{artiste.nom}</div>
                    {artiste.genre && (
                      <div className="result-detail">
                        {artiste.genre}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 2 && artisteResults.length === 0 && !searching && (
              <div className="no-results">
                <p>Aucun artiste trouvé. <button type="button" className="btn-link">Créer "{searchTerm}"</button></p>
              </div>
            )}
          </div>
        ) : (
          <div className="selected-item">
            <div className="selected-item-info">
              <div className="selected-item-name">{selectedArtiste.nom}</div>
              {selectedArtiste.genre && (
                <div className="selected-item-detail">
                  {selectedArtiste.genre}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="selected-item-remove" 
              onClick={handleRemoveArtiste}
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="step-form-group">
        <label htmlFor="notes">Notes (optionnel)</label>
        <textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => onNext({ notes: e.target.value })}
          placeholder="Informations supplémentaires..."
          rows="4"
        ></textarea>
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

// Composant principal
const ConcertFormMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [initialData, setInitialData] = useState({});
  const [formData, setFormData] = useState({});
  
  // Charger les données du concert si on est en mode édition
  useEffect(() => {
    const fetchConcert = async () => {
      if (id && id !== 'nouveau') {
        try {
          const concertDoc = await getDoc(doc(db, 'concerts', id));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setInitialData(concertData);
            
            // Préparer les données pour le formulaire
            const formattedData = {
              titre: concertData.titre || '',
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'contact',
              notes: concertData.notes || ''
            };
            
            setFormData(formattedData);
            
            // Charger le lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setFormData(prev => ({
                  ...prev,
                  lieu: {
                    id: concertData.lieuId,
                    ...lieuDoc.data()
                  }
                }));
              }
            }
            
            // Charger le programmateur
            if (concertData.programmateurId) {
              const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (progDoc.exists()) {
                setFormData(prev => ({
                  ...prev,
                  programmateur: {
                    id: concertData.programmateurId,
                    ...progDoc.data()
                  }
                }));
              }
            }
            
            // Charger l'artiste
            if (concertData.artisteId) {
              const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
              if (artisteDoc.exists()) {
                setFormData(prev => ({
                  ...prev,
                  artiste: {
                    id: concertData.artisteId,
                    ...artisteDoc.data()
                  }
                }));
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du concert:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchConcert();
  }, [id]);
  
  // Gérer la complétion du formulaire
  const handleComplete = async (data) => {
    try {
      // Préparer les données du concert
      const concertData = {
        titre: data.titre || '',
        date: data.date || '',
        montant: data.montant ? parseFloat(data.montant) : 0,
        statut: data.statut || 'contact',
        notes: data.notes || '',
        
        lieuId: data.lieu?.id || null,
        lieuNom: data.lieu?.nom || null,
        lieuAdresse: data.lieu?.adresse || null,
        lieuCodePostal: data.lieu?.codePostal || null,
        lieuVille: data.lieu?.ville || null,
        
        programmateurId: data.programmateur?.id || null,
        programmateurNom: data.programmateur?.nom || null,
        
        artisteId: data.artiste?.id || null,
        artisteNom: data.artiste?.nom || null,
        
        updatedAt: serverTimestamp()
      };
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un concert existant
        await updateDoc(doc(db, 'concerts', id), concertData);
        
        // Mettre à jour les relations bidirectionnelles
        await updateRelations(id, concertData, initialData);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = serverTimestamp();
        const newConcertRef = doc(collection(db, 'concerts'));
        await setDoc(newConcertRef, concertData);
        
        // Créer les relations bidirectionnelles
        await updateRelations(newConcertRef.id, concertData, {});
      }
      
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    }
  };
  
  // Mettre à jour les relations bidirectionnelles
  const updateRelations = async (concertId, newData, oldData) => {
    try {
      // Mettre à jour les relations avec le programmateur
      if (newData.programmateurId && newData.programmateurId !== oldData.programmateurId) {
        const progRef = doc(db, 'programmateurs', newData.programmateurId);
        
        // Ajouter le concert au programmateur
        const concertRef = {
          id: concertId,
          titre: newData.titre,
          date: newData.date,
          lieu: newData.lieuNom
        };
        
        await updateDoc(progRef, {
          concertsAssocies: arrayUnion(concertRef),
          updatedAt: serverTimestamp()
        });
      }
      
      // Supprimer l'ancien lien avec le programmateur si changé
      if (oldData.programmateurId && oldData.programmateurId !== newData.programmateurId) {
        const oldProgRef = doc(db, 'programmateurs', oldData.programmateurId);
        const oldProgDoc = await getDoc(oldProgRef);
        
        if (oldProgDoc.exists()) {
          const oldProgData = oldProgDoc.data();
          const updatedConcerts = (oldProgData.concertsAssocies || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldProgRef, {
            concertsAssocies: updatedConcerts,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Mettre à jour les relations avec l'artiste
      if (newData.artisteId && newData.artisteId !== oldData.artisteId) {
        const artisteRef = doc(db, 'artistes', newData.artisteId);
        
        // Ajouter le concert à l'artiste
        const concertRef = {
          id: concertId,
          titre: newData.titre,
          date: newData.date,
          lieu: newData.lieuNom
        };
        
        await updateDoc(artisteRef, {
          concertsAssocies: arrayUnion(concertRef),
          updatedAt: serverTimestamp()
        });
      }
      
      // Supprimer l'ancien lien avec l'artiste si changé
      if (oldData.artisteId && oldData.artisteId !== newData.artisteId) {
        const oldArtisteRef = doc(db, 'artistes', oldData.artisteId);
        const oldArtisteDoc = await getDoc(oldArtisteRef);
        
        if (oldArtisteDoc.exists()) {
          const oldArtisteData = oldArtisteDoc.data();
          const updatedConcerts = (oldArtisteData.concertsAssocies || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldArtisteRef, {
            concertsAssocies: updatedConcerts,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des relations:', error);
      throw error;
    }
  };
  
  const handleCancel = () => {
    navigate('/concerts');
  };
  
  if (loading) {
    return <div className="loading-container">Chargement du concert...</div>;
  }
  
  // Définir les étapes du formulaire
  const steps = [
    { 
      title: 'Informations', 
      component: BasicInfoStep 
    },
    { 
      title: 'Lieu', 
      component: LieuStep 
    },
    { 
      title: 'Programmateur', 
      component: ProgrammateurStep 
    },
    { 
      title: 'Artiste', 
      component: ArtisteStep 
    }
  ];
  
  return (
    <div className="concert-form-mobile">
      <div className="mobile-form-header">
        <h1>{id !== 'nouveau' ? 'Modifier le concert' : 'Nouveau concert'}</h1>
      </div>
      
      <StepNavigation 
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialStep={0}
        initialData={formData}
      />
    </div>
  );
};

export default ConcertFormMobile;
