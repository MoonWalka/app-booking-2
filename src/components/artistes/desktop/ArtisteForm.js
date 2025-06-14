// src/components/artistes/desktop/ArtisteForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormHeader from '@/components/ui/FormHeader';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import {
  ArtisteBasicInfoSection,
  ArtisteContactSection,
  ArtisteNotesSection,
  ArtisteMembersSection
} from './sections';
import styles from './ArtisteForm.module.css';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import useDeleteArtiste from '@/hooks/artistes/useDeleteArtiste';


/**
 * Composant de formulaire d'artiste enrichi - Style moderne TourCraft
 * Architecture modulaire avec sections réutilisables
 */
const ArtisteFormDesktop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = !id || id === 'nouveau';
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    genre: '',
    description: '',
    email: '',
    telephone: '',
    siteWeb: '',
    instagram: '',
    facebook: '',
    membres: [],
    notes: ''
  });
  
  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDelete
  } = useDeleteArtiste(() => navigate('/artistes'));
  
  // Chargement des données de l'artiste
  useEffect(() => {
    const loadArtiste = async () => {
      if (isNewFromUrl) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'artistes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Normaliser les données pour le formulaire
          setFormData({
            nom: data.nom || '',
            genre: data.genre || '',
            description: data.description || '',
            email: data.email || data.contacts?.email || '',
            telephone: data.telephone || data.contacts?.telephone || '',
            siteWeb: data.siteWeb || data.contacts?.siteWeb || '',
            instagram: data.instagram || data.contacts?.instagram || '',
            facebook: data.facebook || data.contacts?.facebook || '',
            membres: data.membres || [],
            notes: data.notes || ''
          });
        } else {
          setError('Artiste introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement de l\'artiste');
      } finally {
        setLoading(false);
      }
    };

    loadArtiste();
  }, [id, isNewFromUrl]);

  // Gestionnaire de changement des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.nom.trim()) {
      errors.push('Le nom de l\'artiste est obligatoire');
    }
    
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }
    
    return errors;
  };
  
  // Gestionnaire de sauvegarde
  const handleSave = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const artisteData = {
        ...formData,
        updatedAt: Timestamp.now()
      };

      if (isNewFromUrl) {
        artisteData.createdAt = Timestamp.now();
        const newArtisteRef = doc(collection(db, 'artistes'));
        await setDoc(newArtisteRef, artisteData);
        toast.success('Artiste créé avec succès !');
        navigate('/artistes');
      } else {
        const docRef = doc(db, 'artistes', id);
        await updateDoc(docRef, artisteData);
        toast.success('Artiste modifié avec succès !');
        navigate(`/artistes/${id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner message="Chargement de l'artiste..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error} />
      </div>
    );
  }
  
  // Préparer les actions pour le header
  const headerActions = [];
  
  if (id !== 'nouveau') {
    headerActions.push(
      <Button
        key="delete"
        variant="danger"
        onClick={() => handleDelete(id)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Suppression...
          </>
        ) : (
          <>
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </>
        )}
      </Button>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSave}>
        <div className={styles.formContainer}>
          {/* Header avec FormHeader standardisé */}
          <FormHeader
            title={isNewFromUrl ? 'Nouvel Artiste' : 'Modifier Artiste'}
            icon={<i className="bi bi-person-music"></i>}
            isLoading={isSubmitting}
            roundedTop={true}
            actions={[
              <Button 
                key="save"
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Enregistrer
                  </>
                )}
              </Button>,
              <Button 
                key="cancel"
                type="button" 
                variant="secondary"
                onClick={() => navigate(isNewFromUrl ? '/artistes' : `/artistes/${id}`)}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </Button>,
              ...(headerActions || [])
            ]}
          />

          <div className={styles.sectionBody}>
            {/* Section Informations de base */}
            <ArtisteBasicInfoSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Coordonnées de contact */}
            <ArtisteContactSection
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Membres du groupe */}
            <ArtisteMembersSection
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Notes */}
            <ArtisteNotesSection
              formData={formData}
              handleChange={handleChange}
              isEditing={true}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtisteFormDesktop;
