import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';
import styles from './ProgrammateurFormMaquette.module.css';

/**
 * Composant de formulaire programmateur - Style maquette adapté TourCraft
 * Version simplifiée pour éviter les boucles infinies
 */
const ProgrammateurFormMaquette = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = location.pathname.endsWith('/nouveau');
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    structureNom: '',
    structureType: '',
    structureSiret: '',
    structureSiteWeb: ''
  });

  // Chargement des données du programmateur
  useEffect(() => {
    const loadProgrammateur = async () => {
      if (isNewFromUrl) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'programmateurs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            prenom: data.contact?.prenom || data.prenom || '',
            nom: data.contact?.nom || data.nom || '',
            email: data.contact?.email || data.email || '',
            telephone: data.contact?.telephone || data.telephone || '',
            adresse: data.contact?.adresse || data.adresse || '',
            codePostal: data.contact?.codePostal || data.codePostal || '',
            ville: data.contact?.ville || data.ville || '',
            structureNom: data.structure?.raisonSociale || data.structureNom || '',
            structureType: data.structure?.type || data.structureType || '',
            structureSiret: data.structure?.siret || data.structureSiret || '',
            structureSiteWeb: data.structure?.siteWeb || data.structureSiteWeb || ''
          });
        } else {
          setError('Programmateur introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement du programmateur');
      } finally {
        setLoading(false);
      }
    };

    loadProgrammateur();
  }, [id, isNewFromUrl]);

  // Gestionnaire de changement des champs avec validation automatique SIRET
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour différents types de champs
    let processedValue = value;
    
    if (name === 'structureSiret') {
      // SIRET : garder seulement les chiffres, max 14
      processedValue = value.replace(/\D/g, '').slice(0, 14);
    } else if (name === 'telephone') {
      // Téléphone : formater automatiquement
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.prenom.trim()) {
      errors.push('Le prénom est obligatoire');
    }
    
    if (!formData.nom.trim()) {
      errors.push('Le nom est obligatoire');
    }
    
    if (!formData.email.trim()) {
      errors.push('L\'email est obligatoire');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }
    
    // Validation du téléphone si fourni
    if (formData.telephone.trim() && !validatePhoneNumber(formData.telephone)) {
      errors.push('Le téléphone doit être un numéro français valide (10 chiffres)');
    }
    
    // Validation du SIRET si fourni
    if (formData.structureSiret.trim() && !validateSiret(formData.structureSiret.trim())) {
      errors.push('Le SIRET doit contenir exactement 14 chiffres');
    }
    
    return errors;
  };

  // Utilitaire de validation SIRET
  const validateSiret = (siret) => {
    // Supprimer tous les espaces et caractères non numériques
    const cleanSiret = siret.replace(/\D/g, '');
    
    // Vérifier la longueur exacte de 14 chiffres
    return cleanSiret.length === 14;
  };

  // Utilitaire de formatage téléphone français
  const formatPhoneNumber = (phone) => {
    // Supprimer tous les caractères non numériques
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formater selon le standard français (10 chiffres)
    if (cleanPhone.length <= 10) {
      // Format: 01 23 45 67 89
      return cleanPhone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    }
    
    return phone; // Retourner tel quel si plus de 10 chiffres
  };

  // Validation du téléphone français (optionnel)
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return true; // Optionnel
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Téléphone français : 10 chiffres commençant par 01-09
    return cleanPhone.length === 10 && /^0[1-9]/.test(cleanPhone);
  };

  // Gestionnaire de sauvegarde
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const programmateur = {
        contact: {
          prenom: formData.prenom.trim(),
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          adresse: formData.adresse.trim(),
          codePostal: formData.codePostal.trim(),
          ville: formData.ville.trim()
        },
        structure: {
          raisonSociale: formData.structureNom.trim(),
          type: formData.structureType,
          siret: formData.structureSiret.trim(),
          siteWeb: formData.structureSiteWeb.trim()
        },
        updatedAt: new Date()
      };

      if (isNewFromUrl) {
        programmateur.createdAt = new Date();
        const docRef = await addDoc(collection(db, 'programmateurs'), programmateur);
        toast.success('Programmateur créé avec succès !');
        navigate(`/programmateurs/${docRef.id}`);
      } else {
        const docRef = doc(db, 'programmateurs', id);
        await updateDoc(docRef, programmateur);
        toast.success('Programmateur modifié avec succès !');
        navigate(`/programmateurs/${id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire d'annulation
  const handleCancel = () => {
    toast.info('Édition annulée');
    if (isNewFromUrl) {
      navigate('/programmateurs');
    } else {
      navigate(`/programmateurs/${id}`);
    }
  };

  // Gestionnaire de suppression
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Confirmation de suppression
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const docRef = doc(db, 'programmateurs', id);
      await deleteDoc(docRef);
      toast.success('Programmateur supprimé avec succès');
      navigate('/programmateurs');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fermeture du modal de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner message="Chargement du programmateur..." />
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

  console.log('🎨 [ProgrammateurFormMaquette] Rendering with maquette style');

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSave}>
        <div className={styles.formContainer}>
          {/* Header - Style maquette */}
          <div className={styles.formHeader}>
            <h1 className={styles.headerTitle}>
              <i className="bi bi-person-badge"></i>
              {isNewFromUrl ? 'Nouveau Programmateur' : 'Modifier Programmateur'}
            </h1>
            <div className={styles.headerActions}>
              <button 
                type="submit" 
                className={`${styles.tcBtn} ${styles.tcBtnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Enregistrer
                  </>
                )}
              </button>
              <button 
                type="button" 
                className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle"></i>
                Annuler
              </button>
              {!isNewFromUrl && (
                <button 
                  type="button" 
                  className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-trash"></i>
                  Supprimer
                </button>
              )}
            </div>
          </div>

          <div className={styles.sectionBody}>
            {/* Section Contact */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-person-circle section-icon"></i>
                  <h3 className={styles.sectionTitle}>Informations de contact</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Prénom <span className={styles.required}>*</span>
                      </label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Nom <span className={styles.required}>*</span>
                      </label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Email <span className={styles.required}>*</span>
                      </label>
                      <input 
                        type="email" 
                        className={styles.formControl}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Téléphone</label>
                      <input 
                        type="tel" 
                        className={styles.formControl}
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Adresse</label>
                    <input 
                      type="text" 
                      className={styles.formControl}
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Code postal</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ville</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Structure */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-building section-icon"></i>
                  <h3 className={styles.sectionTitle}>Structure</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nom de la structure</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="structureNom"
                        value={formData.structureNom}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Type de structure</label>
                      <select 
                        className={styles.formControl}
                        name="structureType"
                        value={formData.structureType}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="Association">Association</option>
                        <option value="SAS">SAS</option>
                        <option value="SARL">SARL</option>
                        <option value="Entreprise individuelle">Entreprise individuelle</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>SIRET</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="structureSiret"
                        value={formData.structureSiret}
                        onChange={handleChange}
                        placeholder="14 chiffres"
                        maxLength="14"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Site web</label>
                      <input 
                        type="url" 
                        className={styles.formControl}
                        name="structureSiteWeb"
                        value={formData.structureSiteWeb}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Recherche de Structure - Temporairement simplifiée */}
            <div className={styles.formSection}>
              <div className={styles.searchSection}>
                <div className={styles.searchHeader}>
                  <h4 className={styles.searchTitle}>
                    <i className="bi bi-building"></i>
                    Rechercher une structure
                  </h4>
                </div>
                <div className={styles.alert}>
                  <i className="bi bi-info-circle"></i>
                  Fonctionnalité de recherche en cours de développement. Utilisez les champs ci-dessus pour saisir manuellement.
                </div>
              </div>
            </div>

            {/* Section Recherche de Lieu - Temporairement simplifiée */}
            <div className={styles.formSection}>
              <div className={styles.searchSection}>
                <div className={styles.searchHeader}>
                  <h4 className={styles.searchTitle}>
                    <i className="bi bi-geo-alt"></i>
                    Ajouter un lieu
                  </h4>
                </div>
                <div className={styles.alert}>
                  <i className="bi bi-info-circle"></i>
                  Fonctionnalité de recherche en cours de développement.
                </div>
              </div>
            </div>

            {/* Section Lieux associés */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-geo-alt section-icon"></i>
                  <h3 className={styles.sectionTitle}>Lieux associés</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.alert}>
                    <i className="bi bi-info-circle"></i>
                    Aucun lieu associé pour le moment.
                  </div>
                </div>
              </div>
            </div>

            {/* Section Concerts associés */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-music-note section-icon"></i>
                  <h3 className={styles.sectionTitle}>Concerts associés</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.alert}>
                    <i className="bi bi-info-circle"></i>
                    Aucun concert associé pour le moment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <i className="bi bi-exclamation-triangle" style={{ 
                color: '#f44336', 
                fontSize: '24px', 
                marginRight: '12px' 
              }}></i>
              <h3 style={{ margin: 0, color: '#213547' }}>
                Confirmer la suppression
              </h3>
            </div>
            
            <p style={{ marginBottom: '25px', lineHeight: '1.5' }}>
              Êtes-vous sûr de vouloir supprimer le programmateur <strong>{formData.prenom} {formData.nom}</strong> ?
              <br />
              <span style={{ color: '#f44336', fontSize: '14px' }}>
                Cette action est irréversible.
              </span>
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button 
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #6b7280',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  backgroundColor: '#f44336',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isDeleting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash"></i>
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurFormMaquette; 