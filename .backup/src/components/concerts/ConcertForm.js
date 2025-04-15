// Au début de votre fichier ConcertForm.jsx, ajoutez :
import '../../style/searchDropdown.css'; // Adaptez le chemin selon votre structure

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import LieuForm from '../forms/LieuForm';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [showLieuForm, setShowLieuForm] = useState(false);
  const [newLieu, setNewLieu] = useState(null);
  
  // États pour la recherche
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [progSearchTerm, setProgSearchTerm] = useState('');
  const [lieuResults, setLieuResults] = useState([]);
  const [progResults, setProgResults] = useState([]);
  const [showLieuResults, setShowLieuResults] = useState(false);
  const [showProgResults, setShowProgResults] = useState(false);
  
  // Refs pour les dropdowns
  const lieuDropdownRef = useRef(null);
  const progDropdownRef = useRef(null);
  
  // Timeout refs pour la recherche
  const lieuSearchTimeoutRef = useRef(null);
  const progSearchTimeoutRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    lieuId: '',
    lieuNom: '',
    lieuAdresse: '',
    lieuCodePostal: '',
    lieuVille: '',
    lieuCapacite: '',
    programmateurId: '',
    programmateurNom: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération initiale limitée (juste pour avoir quelques résultats par défaut)
        const lieuxRef = collection(db, 'lieux');
        const lieuxQuery = query(lieuxRef, orderBy('nom'), limit(10));
        const lieuxSnapshot = await getDocs(lieuxQuery);
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
        
        const progsRef = collection(db, 'programmateurs');
        const progsQuery = query(progsRef, orderBy('nom'), limit(10));
        const programmateursSnapshot = await getDocs(progsQuery);
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
  
        // Si c'est une modification, récupérer les détails du concert
        if (id && id !== 'nouveau') {
          const concertRef = doc(db, 'concerts', id);
          const concertDoc = await getDoc(concertRef);
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            console.log('Données du concert chargées:', concertData);
            
            // Si on a un lieu associé, le récupérer s'il n'est pas dans la liste initiale
            if (concertData.lieuId && !lieuxData.some(l => l.id === concertData.lieuId)) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  const lieuData = lieuDoc.data();
                  setLieux(prev => [...prev, { id: concertData.lieuId, ...lieuData }]);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du lieu:', error);
              }
            }
            
            // Si on a un programmateur associé, le récupérer s'il n'est pas dans la liste initiale
            if (concertData.programmateurId && !programmateursData.some(p => p.id === concertData.programmateurId)) {
              try {
                const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
                if (progDoc.exists()) {
                  const progData = progDoc.data();
                  setProgrammateurs(prev => [...prev, { id: concertData.programmateurId, ...progData }]);
                }
              } catch (error) {
                console.error('Erreur lors de la récupération du programmateur:', error);
              }
            }
            
            // Initialiser le lieu et le programmateur dans les champs de recherche
            if (concertData.lieuNom) {
              setLieuSearchTerm(concertData.lieuNom);
            }
            
            if (concertData.programmateurNom) {
              setProgSearchTerm(concertData.programmateurNom);
            }
            
            setFormData({
              ...concertData,
              date: concertData.date || '',
              montant: concertData.montant || '',
              statut: concertData.statut || 'En attente',
              lieuId: concertData.lieuId || '',
              lieuNom: concertData.lieuNom || '',
              lieuAdresse: concertData.lieuAdresse || '',
              lieuCodePostal: concertData.lieuCodePostal || '',
              lieuVille: concertData.lieuVille || '',
              lieuCapacite: concertData.lieuCapacite || '',
              programmateurId: concertData.programmateurId || '',
              programmateurNom: concertData.programmateurNom || '',
              notes: concertData.notes || ''
            });
          } else {
            console.error('Concert non trouvé');
            navigate('/concerts');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, navigate]);

  // Gestionnaire de clics en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lieuDropdownRef.current && !lieuDropdownRef.current.contains(event.target)) {
        setShowLieuResults(false);
      }
      if (progDropdownRef.current && !progDropdownRef.current.contains(event.target)) {
        setShowProgResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effets pour la recherche de lieux
  useEffect(() => {
    if (lieuSearchTimeoutRef.current) {
      clearTimeout(lieuSearchTimeoutRef.current);
    }
    
    if (lieuSearchTerm.length >= 2) {
      lieuSearchTimeoutRef.current = setTimeout(() => {
        searchLieux(lieuSearchTerm);
      }, 300);
    } else if (lieuSearchTerm.length === 0) {
      // Si le champ est vidé, réinitialiser le lieu sélectionné
      if (formData.lieuId) {
        setFormData(prev => ({
          ...prev,
          lieuId: '',
          lieuNom: '',
          lieuAdresse: '',
          lieuCodePostal: '',
          lieuVille: '',
          lieuCapacite: ''
        }));
      }
      setLieuResults([]);
    }
    
    return () => {
      if (lieuSearchTimeoutRef.current) {
        clearTimeout(lieuSearchTimeoutRef.current);
      }
    };
  }, [lieuSearchTerm]);

  // Effets pour la recherche de programmateurs
  useEffect(() => {
    if (progSearchTimeoutRef.current) {
      clearTimeout(progSearchTimeoutRef.current);
    }
    
    if (progSearchTerm.length >= 2) {
      progSearchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(progSearchTerm);
      }, 300);
    } else if (progSearchTerm.length === 0) {
      // Si le champ est vidé, réinitialiser le programmateur sélectionné
      if (formData.programmateurId) {
        setFormData(prev => ({
          ...prev,
          programmateurId: '',
          programmateurNom: ''
        }));
      }
      setProgResults([]);
    }
    
    return () => {
      if (progSearchTimeoutRef.current) {
        clearTimeout(progSearchTimeoutRef.current);
      }
    };
  }, [progSearchTerm]);

  // Fonction pour rechercher des lieux
  const searchLieux = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // D'abord chercher dans les lieux déjà chargés
      const filteredLieux = lieux.filter(lieu => 
        lieu.nom?.toLowerCase().includes(termLower) || 
        lieu.ville?.toLowerCase().includes(termLower)
      );
      
      // Puis faire une requête dans Firestore pour compléter
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
      
      // Fusionner et dédupliquer les résultats
      const allResults = [...filteredLieux];
      
      lieuxData.forEach(lieu => {
        if (!allResults.some(l => l.id === lieu.id)) {
          allResults.push(lieu);
        }
      });
      
      setLieuResults(allResults);
      setShowLieuResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
    }
  };

  // Fonction pour rechercher des programmateurs
  const searchProgrammateurs = async (term) => {
    try {
      const termLower = term.toLowerCase();
      
      // D'abord chercher dans les programmateurs déjà chargés
      const filteredProgs = programmateurs.filter(prog => 
        prog.nom?.toLowerCase().includes(termLower) || 
        prog.structure?.toLowerCase().includes(termLower)
      );
      
      // Puis faire une requête dans Firestore pour compléter
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
      
      // Fusionner et dédupliquer les résultats
      const allResults = [...filteredProgs];
      
      progsData.forEach(prog => {
        if (!allResults.some(p => p.id === prog.id)) {
          allResults.push(prog);
        }
      });
      
      setProgResults(allResults);
      setShowProgResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectLieu = (lieu) => {
    setLieuSearchTerm(lieu.nom);
    setFormData(prev => ({
      ...prev,
      lieuId: lieu.id,
      lieuNom: lieu.nom || '',
      lieuAdresse: lieu.adresse || '',
      lieuCodePostal: lieu.codePostal || '',
      lieuVille: lieu.ville || '',
      lieuCapacite: lieu.capacite || ''
    }));
    setShowLieuResults(false);
  };

  const handleSelectProgrammateur = (prog) => {
    setProgSearchTerm(prog.nom);
    setFormData(prev => ({
      ...prev,
      programmateurId: prog.id,
      programmateurNom: prog.nom || ''
    }));
    setShowProgResults(false);
  };

  const handleLieuCreated = (lieu) => {
    // Ajouter le nouveau lieu à la liste
    const newLieuWithId = { ...lieu, id: newLieu.id };
    setLieux(prev => [...prev, newLieuWithId]);
    
    // Mettre à jour le formulaire avec le nouveau lieu
    setLieuSearchTerm(lieu.nom);
    setFormData(prev => ({
      ...prev,
      lieuId: newLieu.id,
      lieuNom: lieu.nom || '',
      lieuAdresse: lieu.adresse || '',
      lieuCodePostal: lieu.codePostal || '',
      lieuVille: lieu.ville || '',
      lieuCapacite: lieu.capacite || ''
    }));
    
    // Fermer le formulaire de lieu
    setShowLieuForm(false);
  };

  const handleCreateLieu = async () => {
    try {
      // Vérifier qu'un nom de lieu a été saisi
      if (!lieuSearchTerm.trim()) {
        alert('Veuillez saisir un nom de lieu avant de créer un nouveau lieu.');
        return;
      }
      
      // Créer directement un nouveau lieu avec le nom saisi dans la recherche
      const newLieuRef = doc(collection(db, 'lieux'));
      const lieuData = {
        nom: lieuSearchTerm.trim(),
        nomLowercase: lieuSearchTerm.trim().toLowerCase(),
        adresse: '',
        codePostal: '',
        ville: '',
        capacite: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newLieuRef, lieuData);
      
      // Ajouter le nouveau lieu à la liste des lieux
      const newLieuWithId = { ...lieuData, id: newLieuRef.id };
      setLieux(prev => [...prev, newLieuWithId]);
      
      // Mettre à jour le formulaire avec le nouveau lieu
      setFormData(prev => ({
        ...prev,
        lieuId: newLieuRef.id,
        lieuNom: lieuData.nom,
        lieuAdresse: '',
        lieuCodePostal: '',
        lieuVille: '',
        lieuCapacite: ''
      }));
      
      // Fermer le dropdown de résultats de recherche
      setShowLieuResults(false);
      
      // Afficher un message de confirmation
      alert(`Le lieu "${lieuData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert('Une erreur est survenue lors de la création du lieu.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Vérifier que les champs obligatoires sont remplis
      if (!formData.date || !formData.montant || !formData.lieuId) {
        alert('Veuillez remplir tous les champs obligatoires.');
        setIsSubmitting(false);
        return;
      }
  
      // Correction du format de date
      let correctedDate = formData.date;
      if (formData.date.includes('/')) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
          correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
  
      const concertData = {
        date: correctedDate,
        montant: formData.montant,
        statut: formData.statut,
        
        // Infos du lieu
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        lieuAdresse: formData.lieuAdresse,
        lieuCodePostal: formData.lieuCodePostal,
        lieuVille: formData.lieuVille,
        lieuCapacite: formData.lieuCapacite,
        
        // Infos du programmateur
        programmateurId: formData.programmateurId,
        programmateurNom: formData.programmateurNom,
        
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Données à enregistrer:', concertData);
  
      if (id && id !== 'nouveau') {
        // Mise à jour d'un concert existant
        await updateDoc(doc(db, 'concerts', id), concertData);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = new Date().toISOString();
        const newConcertRef = doc(collection(db, 'concerts'));
        await setDoc(newConcertRef, concertData);
      }
  
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement du concert...</div>;
  }

  if (showLieuForm && newLieu) {
    return (
      <div>
        <h2>Créer un nouveau lieu</h2>
        <LieuForm lieu={newLieu} onSave={handleLieuCreated} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2>{id && id !== 'nouveau' ? 'Modifier le concert' : 'Ajouter un concert'}</h2>
      </div>

      <div className="mb-3">
        <label htmlFor="date" className="form-label">Date du concert *</label>
        <input
          type="date"
          className="form-control"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="montant" className="form-label">Montant (€) *</label>
        <input
          type="number"
          className="form-control"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="statut" className="form-label">Statut</label>
        <select
          className="form-select"
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
        >
          <option value="En attente">En attente</option>
          <option value="Confirmé">Confirmé</option>
          <option value="Annulé">Annulé</option>
          <option value="Terminé">Terminé</option>
        </select>
      </div>

      {/* Barre de recherche pour les lieux */}
      <div className="mb-3" ref={lieuDropdownRef}>
        <label htmlFor="lieuSearch" className="form-label">Lieu *</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="lieuSearch"
            placeholder="Rechercher un lieu..."
            value={lieuSearchTerm}
            onChange={(e) => setLieuSearchTerm(e.target.value)}
            onFocus={() => lieuSearchTerm.length >= 2 && setShowLieuResults(true)}
            required={formData.lieuId === ''}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCreateLieu}
          >
            Créer un lieu
          </button>
        </div>
        
        {/* Résultats de recherche pour les lieux */}
        {showLieuResults && lieuResults.length > 0 && (
          <div className="dropdown-menu show w-100 mt-1">
            {lieuResults.map(lieu => (
              <div 
                key={lieu.id} 
                className="dropdown-item lieu-item"
                onClick={() => handleSelectLieu(lieu)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{lieu.nom}</div>
                    <div className="small text-muted">
                      {lieu.adresse && lieu.ville ? `${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}` : 'Adresse non spécifiée'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showLieuResults && lieuResults.length === 0 && lieuSearchTerm.length >= 2 && (
          <div className="dropdown-menu show w-100 mt-1">
            <div className="dropdown-item text-muted">Aucun lieu trouvé</div>
          </div>
        )}
      </div>

      {formData.lieuId && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Détails du lieu</h5>
            <p><strong>Nom:</strong> {formData.lieuNom}</p>
            <p><strong>Adresse:</strong> {formData.lieuAdresse}</p>
            <p><strong>Code postal:</strong> {formData.lieuCodePostal}</p>
            <p><strong>Ville:</strong> {formData.lieuVille}</p>
            {formData.lieuCapacite && <p><strong>Capacité:</strong> {formData.lieuCapacite}</p>}
          </div>
        </div>
      )}

      {/* Barre de recherche pour les programmateurs */}
      <div className="mb-3" ref={progDropdownRef}>
        <label htmlFor="programmateurSearch" className="form-label">Programmateur</label>
        <input
          type="text"
          className="form-control"
          id="programmateurSearch"
          placeholder="Rechercher un programmateur..."
          value={progSearchTerm}
          onChange={(e) => setProgSearchTerm(e.target.value)}
          onFocus={() => progSearchTerm.length >= 2 && setShowProgResults(true)}
        />
        
        {/* Résultats de recherche pour les programmateurs */}
        {showProgResults && progResults.length > 0 && (
          <div className="dropdown-menu show w-100 mt-1">
            {progResults.map(prog => (
              <div 
                key={prog.id} 
                className="dropdown-item prog-item"
                onClick={() => handleSelectProgrammateur(prog)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{prog.nom}</div>
                    {prog.structure && <div className="small text-muted">{prog.structure}</div>}
                    {prog.email && <div className="small text-muted">{prog.email}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showProgResults && progResults.length === 0 && progSearchTerm.length >= 2 && (
          <div className="dropdown-menu show w-100 mt-1">
            <div className="dropdown-item text-muted">Aucun programmateur trouvé</div>
          </div>
        )}
      </div>

      {formData.programmateurId && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Programmateur sélectionné</h5>
            <p><strong>Nom:</strong> {formData.programmateurNom}</p>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="notes" className="form-label">Notes</label>
        <textarea
          className="form-control"
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/concerts')}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le concert'}
        </button>
      </div>
    </form>
  );
};

export default ConcertForm;