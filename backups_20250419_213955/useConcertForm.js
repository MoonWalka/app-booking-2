import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { concertService, lieuService, programmateurService } from '../services/firebaseService';

export function useConcertForm(concertId) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    heure: '',
    montant: '',
    lieuId: '',
    programmateurId: '',
    statut: 'contact',
    notes: ''
  });
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lieuNom, setLieuNom] = useState('');
  const [programmateurNom, setProgrammateurNom] = useState('');

  // Charger les données du concert si on est en mode édition
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les lieux et programmateurs pour les sélecteurs
        const lieuxResult = await lieuService.getAll(100);
        setLieux(lieuxResult.items);
        
        const programmateursResult = await programmateurService.getAll(100);
        setProgrammateurs(programmateursResult.items);
        
        // Si on est en mode édition, charger les données du concert
        if (concertId && concertId !== 'nouveau') {
          const concertData = await concertService.getById(concertId);
          
          if (concertData) {
            // Formater la date pour l'input date
            let formattedDate = '';
            if (concertData.date) {
              // Gérer différents formats de date possibles
              let dateObj;
              if (concertData.date instanceof Date) {
                dateObj = concertData.date;
              } else if (concertData.date.toDate) {
                // Timestamp Firestore
                dateObj = concertData.date.toDate();
              } else if (typeof concertData.date === 'string') {
                dateObj = new Date(concertData.date);
              }
              
              if (dateObj && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
              }
            }
            
            // Mettre à jour le formulaire avec les données du concert
            setFormData({
              titre: concertData.titre || '',
              date: formattedDate,
              heure: concertData.heure || '',
              montant: concertData.montant ? concertData.montant.toString() : '',
              lieuId: concertData.lieuId || '',
              programmateurId: concertData.programmateurId || '',
              statut: concertData.statut || 'contact',
              notes: concertData.notes || ''
            });
            
            // Mettre à jour les noms du lieu et du programmateur
            if (concertData.lieuId) {
              const lieu = lieuxResult.items.find(l => l.id === concertData.lieuId);
              if (lieu) {
                setLieuNom(lieu.nom);
              }
            }
            
            if (concertData.programmateurId) {
              const programmateur = programmateursResult.items.find(p => p.id === concertData.programmateurId);
              if (programmateur) {
                setProgrammateurNom(programmateur.nom);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [concertId]);

  // Gérer les changements dans le formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mettre à jour les noms du lieu et du programmateur
    if (name === 'lieuId') {
      const lieu = lieux.find(l => l.id === value);
      if (lieu) {
        setLieuNom(lieu.nom);
      } else {
        setLieuNom('');
      }
    }
    
    if (name === 'programmateurId') {
      const programmateur = programmateurs.find(p => p.id === value);
      if (programmateur) {
        setProgrammateurNom(programmateur.nom);
      } else {
        setProgrammateurNom('');
      }
    }
  }, [lieux, programmateurs]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validation des champs obligatoires
      if (!formData.titre) {
        setError('Le titre du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      if (!formData.date) {
        setError('La date du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      // Correction du format de date - s'assurer que la date est au format YYYY-MM-DD
      let correctedDate = formData.date;
      
      // Si la date est au format MM/DD/YYYY ou similaire, la convertir
      if (formData.date.includes('/')) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
          correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      console.log('Date corrigée:', correctedDate);
      
      // Préparer les données du concert
      const concertData = {
        titre: formData.titre,
        date: correctedDate,
        heure: formData.heure,
        montant: formData.montant ? parseFloat(formData.montant) : null,
        lieuId: formData.lieuId || null,
        programmateurId: formData.programmateurId || null,
        statut: formData.statut,
        notes: formData.notes,
        lieuNom: lieuNom,
        programmateurNom: programmateurNom
      };
      
      // Créer ou mettre à jour le concert
      if (concertId && concertId !== 'nouveau') {
        await concertService.update(concertId, concertData);
      } else {
        const newConcert = await concertService.create(concertData);
        concertId = newConcert.id;
      }
      
      // Rediriger vers la page du concert
      navigate(`/concerts/${concertId}`);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue lors de l\'enregistrement du concert. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, concertId, navigate, lieuNom, programmateurNom]);

  return {
    formData,
    lieux,
    programmateurs,
    loading,
    submitting,
    error,
    handleChange,
    handleSubmit
  };
}
