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
  getDocs
} from 'firebase/firestore';
import '../../style/programmateurForm.css';
import '../../style/formPublic.css'; // Ajout du CSS pour le formulaire public


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
  const [submitted, setSubmitted] = useState(false); // Nouvel état pour gérer l'affichage après soumission

  // Déterminer si nous sommes en mode formulaire public ou en mode édition standard
  const isPublicFormMode = Boolean(token && concertId && formLinkId);

  useEffect(() => {
    console.log("ProgrammateurForm - ID depuis params:", id);
    const fetchProgrammateur = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const docRef = doc(db, 'programmateurs', id);
          const snap = await getDoc(docRef);
          
          if (snap.exists()) {
            const data = snap.data();
            const adaptedData = {
              contact: {
                nom: data.nom?.split(' ')[0] || '',
                prenom: data.prenom || (data.nom?.includes(' ') ? data.nom.split(' ').slice(1).join(' ') : ''),
                fonction: data.fonction || '',
                email: data.email || '',
                telephone: data.telephone || ''
              },
              structure: {
                raisonSociale: data.structure || '',
                type: data.structureType || '',
                adresse: data.structureAdresse || '',
                codePostal: data.structureCodePostal || '',
                ville: data.structureVille || '',
                pays: data.structurePays || 'France',
                siret: data.siret || '',
                tva: data.tva || ''
              },
              concertsAssocies: data.concertsAssocies || []
            };
            
            setFormData(adaptedData);
          } else {
            console.error('Aucun programmateur trouvé avec cet ID');
            // Ne pas naviguer en mode formulaire public
            if (!isPublicFormMode) {
              navigate('/programmateurs');
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
          setError('Une erreur est survenue lors de la récupération des données.');
        } finally {
          setLoading(false);
        }
      } else if (isPublicFormMode) {
        // En mode formulaire public, pré-remplir avec les infos du concert si possible
        setLoading(true);
        try {
          // Récupérer le concert et voir s'il a un programmateur associé ou une soumission existante
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            
            // Vérifier s'il existe déjà une soumission pour ce concert
            if (concertData.formSubmissionId) {
              try {
                const submissionDoc = await getDoc(doc(db, 'formSubmissions', concertData.formSubmissionId));
                if (submissionDoc.exists()) {
                  const submissionData = submissionDoc.data();
                  
                  // Si la soumission contient des données, les utiliser pour pré-remplir le formulaire
                  if (submissionData.data) {
                    setFormData({
                      contact: {
                        nom: submissionData.data.nom || '',
                        prenom: submissionData.data.prenom || '',
                        fonction: submissionData.data.fonction || '',
                        email: submissionData.data.email || '',
                        telephone: submissionData.data.telephone || ''
                      },
                      structure: {
                        raisonSociale: submissionData.data.raisonSociale || '',
                        type: submissionData.data.type || '',
                        adresse: submissionData.data.adresse || '',
                        codePostal: submissionData.data.codePostal || '',
                        ville: submissionData.data.ville || '',
                        pays: submissionData.data.pays || 'France',
                        siret: submissionData.data.siret || '',
                        tva: submissionData.data.tva || ''
                      },
                      concertsAssocies: []
                    });
                  }
                  // Ou si la soumission contient programmateurData
                  else if (submissionData.programmateurData) {
                    const progData = submissionData.programmateurData;
                    setFormData({
                      contact: {
                        nom: progData.nom?.split(' ')[0] || '',
                        prenom: progData.prenom || (progData.nom?.includes(' ') ? progData.nom.split(' ').slice(1).join(' ') : ''),
                        fonction: progData.fonction || '',
                        email: progData.email || '',
                        telephone: progData.telephone || ''
                      },
                      structure: {
                        raisonSociale: progData.structure || '',
                        type: progData.structureType || '',
                        adresse: progData.structureAdresse || '',
                        codePostal: progData.structureCodePostal || '',
                        ville: progData.structureVille || '',
                        pays: progData.structurePays || 'France',
                        siret: progData.siret || '',
                        tva: progData.tva || ''
                      },
                      concertsAssocies: []
                    });
                  }
                }
              } catch (error) {
                console.error('Erreur lors de la récupération de la soumission:', error);
              }
            }
            // Si pas de soumission mais un programmateur associé
            else if (concertData.programmateurId) {
              const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (progDoc.exists()) {
                const progData = progDoc.data();
                // Pré-remplir le formulaire avec les données existantes
                setFormData({
                  contact: {
                    nom: progData.nom?.split(' ')[0] || '',
                    prenom: progData.prenom || (progData.nom?.includes(' ') ? progData.nom.split(' ').slice(1).join(' ') : ''),
                    fonction: progData.fonction || '',
                    email: progData.email || '',
                    telephone: progData.telephone || ''
                  },
                  structure: {
                    raisonSociale: progData.structure || '',
                    type: progData.structureType || '',
                    adresse: progData.structureAdresse || '',
                    codePostal: progData.structureCodePostal || '',
                    ville: progData.structureVille || '',
                    pays: progData.structurePays || 'France',
                    siret: progData.siret || '',
                    tva: progData.tva || ''
                  },
                  concertsAssocies: progData.concertsAssocies || []
                });
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgrammateur();
  }, [id, concertId, navigate, isPublicFormMode]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (ex: contact.nom, structure.adresse, etc.)
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation des champs obligatoires - uniquement le nom est requis
      if (!formData.contact.nom) {
        alert('Le nom est obligatoire');
        setIsSubmitting(false);
        return;
      }

      // 1. Si nous sommes en mode formulaire public, vérifier d'abord s'il y a un programmateur existant
      let progId = id && id !== 'nouveau' ? id : null;
      
      if (isPublicFormMode) {
        // Vérifier si un programmateur avec cet email existe déjà
        try {
          // Seulement si un email a été fourni
          if (formData.contact.email) {
            const progsQuery = query(
              collection(db, 'programmateurs'), 
              where('email', '==', formData.contact.email)
            );
            
            const progsSnapshot = await getDocs(progsQuery);
            
            if (!progsSnapshot.empty) {
              // On a trouvé un programmateur existant avec cet email
              progId = progsSnapshot.docs[0].id;
              console.log('Programmateur existant trouvé:', progId);
            }
          } else if (concertId) {
            // Si le concert a déjà un programmateur associé, utiliser cet ID
            const concertDoc = await getDoc(doc(db, 'concerts', concertId));
            if (concertDoc.exists() && concertDoc.data().programmateurId) {
              progId = concertDoc.data().programmateurId;
              console.log('Programmateur associé au concert trouvé:', progId);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'existence du programmateur:', error);
        }
      }

      // Récupérer les données existantes si on met à jour un programmateur
      let existingProgData = {};
      if (progId) {
        try {
          const existingProgDoc = await getDoc(doc(db, 'programmateurs', progId));
          if (existingProgDoc.exists()) {
            existingProgData = existingProgDoc.data();
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données existantes:', error);
        }
      }

      // Créer une copie sécurisée de formData avec structure définie
      const safeFormData = {
        ...formData,
        structure: formData.structure || {}
      };

      // 2. Préparer les données du programmateur
      const flattenedData = {
        // Champs principaux pour l'affichage dans la liste
        nom: `${safeFormData.contact.nom} ${safeFormData.contact.prenom}`.trim(),
        structure: safeFormData.structure.raisonSociale || '',
        email: safeFormData.contact.email,
        telephone: safeFormData.contact.telephone,
        
        // Ajouter tous les champs détaillés
        ...safeFormData.contact,
      };
      
      // Ajouter les champs de structure avec préfixe
      Object.keys(safeFormData.structure).forEach(key => {
        flattenedData[`structure${key.charAt(0).toUpperCase() + key.slice(1)}`] = safeFormData.structure[key];
      });
      
      // 3. Si c'est un nouveau programmateur, ajouter la date de création
      if (!existingProgData.createdAt) {
        flattenedData.createdAt = serverTimestamp();
      }
      
      // 4. Ajouter le timestamp de mise à jour
      flattenedData.updatedAt = serverTimestamp();
      
      // 5. Gestion des concerts associés
      let concertsAssocies = [];
      
      if (existingProgData.concertsAssocies) {
        concertsAssocies = [...existingProgData.concertsAssocies];
      }
      
      if (isPublicFormMode && concertId) {
        // Vérifier si le concert est déjà associé
        const concertAlreadyAssociated = concertsAssocies.some(c => c.id === concertId);
        
        if (!concertAlreadyAssociated) {
          // Récupérer les détails du concert pour l'association
          try {
            const concertDoc = await getDoc(doc(db, 'concerts', concertId));
            if (concertDoc.exists()) {
              const concertData = concertDoc.data();
              
              concertsAssocies.push({
                id: concertId,
                titre: concertData.titre || 'Sans titre',
                date: concertData.date || null,
                lieu: concertData.lieuNom || null
              });
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des détails du concert:', error);
          }
        }
      } else if (safeFormData.concertsAssocies && safeFormData.concertsAssocies.length > 0) {
        concertsAssocies = safeFormData.concertsAssocies;
      }
      
      // Ajouter les concerts associés aux données
      flattenedData.concertsAssocies = concertsAssocies;

      // 7. Traitement spécifique au mode formulaire public
      if (isPublicFormMode) {
        console.log('Mode formulaire public, concertId:', concertId, 'formLinkId:', formLinkId);
        
        // Vérifier si une soumission existe déjà pour ce concert
        let existingSubmissionId = null;
        
        // Si le concert a déjà un formSubmissionId associé
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists() && concertDoc.data().formSubmissionId) {
          existingSubmissionId = concertDoc.data().formSubmissionId;
        } else {
          // Chercher dans formSubmissions par concertId
          const submissionsQuery = query(
            collection(db, 'formSubmissions'),
            where('concertId', '==', concertId)
          );
          
          const submissionsSnapshot = await getDocs(submissionsQuery);
          if (!submissionsSnapshot.empty) {
            existingSubmissionId = submissionsSnapshot.docs[0].id;
          }
        }
        
        // Préparer les données de soumission
        const submissionData = {
          concertId,
          formLinkId,
          programmId: progId,
          programmateurData: {
            ...flattenedData
          },
          data: {
            ...safeFormData.contact,
            ...safeFormData.structure
          },
          submittedAt: existingSubmissionId ? formData.submittedAt || serverTimestamp() : serverTimestamp(),
          status: 'pending', // statut en attente de validation
          updatedAt: serverTimestamp() // Timestamp de mise à jour
        };
        
        // Si une soumission existe déjà, la mettre à jour
        if (existingSubmissionId) {
          await updateDoc(doc(db, 'formSubmissions', existingSubmissionId), submissionData);
          console.log('Soumission existante mise à jour avec ID:', existingSubmissionId);
        } 
        // Sinon, créer une nouvelle soumission
        else {
          const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
          existingSubmissionId = submissionRef.id;
          console.log('Nouvelle soumission créée avec ID:', existingSubmissionId);
          
          // Mettre à jour le lien et le concert uniquement lors de la première soumission
          await updateDoc(doc(db, 'formLinks', formLinkId), {
            completed: true,
            completedAt: serverTimestamp()
          });
          
          await updateDoc(doc(db, 'concerts', concertId), {
            formSubmissionId: existingSubmissionId,
            updatedAt: serverTimestamp()
          });
        }
        
        // CHANGEMENT IMPORTANT: Ne pas mettre à jour le programmateur tout de suite
        // Nous allons laisser l'administrateur valider les données avant de les appliquer
        
        // Appeler le callback de succès si fourni
        if (onSubmitSuccess) {
          console.log('Appel du callback onSubmitSuccess');
          onSubmitSuccess();
        } else {
          // Afficher un message de succès si pas de callback
          setSubmitted(true); // Marquer le formulaire comme soumis
        }
      } 
      // 8. Traitement spécifique au mode édition standard (inchangé)
      else {
        console.log('Mode édition standard');
        
        // En mode admin standard, mettre à jour le programmateur
        await setDoc(doc(db, 'programmateurs', progId), flattenedData, { merge: true });
        
        // Mise à jour réciproque : ajouter le programmateur à chaque concert
        for (const concert of concertsAssocies) {
          const concertRef = doc(db, 'concerts', concert.id);
          await updateDoc(concertRef, {
            programmateurs: arrayUnion({
              id: progId,
              nom: flattenedData.nom
            })
          });
          console.log('Programmateur associé au concert:', concert.id);
        }
        
        // Rediriger vers la liste des programmateurs
        navigate('/programmateurs');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des données...</div>;
  }

  // Si le formulaire a été soumis avec succès et qu'on est en mode formulaire public
  if (submitted && isPublicFormMode) {
    return (
      <div className="form-public-container">
        <div className="form-success text-center">
          <div className="success-icon my-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
          </div>
          <h2 className="mb-3">Merci pour votre soumission !</h2>
          <p className="lead mb-4">Vos informations ont été enregistrées avec succès.</p>
          <p>Vous pouvez modifier vos informations à tout moment jusqu'à leur validation par notre équipe.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setSubmitted(false)} // Permet de revenir au formulaire
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifier vos informations
          </button>
        </div>
      </div>
    );
  }

  // Déterminer les classes CSS à utiliser selon le mode
  const containerClass = isPublicFormMode ? 'form-public-container' : 'programmateur-form-container';
  const formClass = isPublicFormMode ? 'form-public' : 'modern-form';

  return (
    <div className={containerClass}>
      {!isPublicFormMode && (
        <div className="form-header-container">
          <h2 className="modern-title">
            {id && id !== 'nouveau' ? 'Modifier le programmateur' : 'Ajouter un programmateur'}
          </h2>
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate('/programmateurs')}>Programmateurs</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">
              {id && id !== 'nouveau' ? formData.contact.nom || 'Édition' : 'Nouveau'}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={formClass}>
        {/* Section Informations du contact */}
        <div className={isPublicFormMode ? "form-section" : "form-card"}>
          <div className="card-header">
            <i className="bi bi-person-vcard"></i>
            <h3>Informations du contact</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.nom" className="form-label">Nom <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.nom"
                    name="contact.nom"
                    value={formData.contact.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Dupont"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.prenom" className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.prenom"
                    name="contact.prenom"
                    value={formData.contact.prenom}
                    onChange={handleChange}
                    placeholder="Ex: Jean"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact.fonction" className="form-label">Fonction</label>
              <input
                type="text"
                className="form-control"
                id="contact.fonction"
                name="contact.fonction"
                value={formData.contact.fonction}
                onChange={handleChange}
                placeholder="Ex: Directeur artistique"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.email" className="form-label">Email {/*<span className="required">*</span>*/}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleChange}
                      //required
                      placeholder="Ex: jean.dupont@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact.telephone"
                      name="contact.telephone"
                      value={formData.contact.telephone}
                      onChange={handleChange}
                      placeholder="Ex: 01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Structure juridique */}
        <div className={isPublicFormMode ? "form-section" : "form-card"}>
          <div className="card-header">
            <i className="bi bi-building"></i>
            <h3>Structure juridique</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-7">
                <div className="form-group">
                  <label htmlFor="structure.raisonSociale" className="form-label">Raison sociale</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.raisonSociale"
                    name="structure.raisonSociale"
                    value={formData.structure.raisonSociale}
                    onChange={handleChange}
                    placeholder="Ex: Association Culturelle XYZ"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="form-group">
                  <label htmlFor="structure.type" className="form-label">Type de structure</label>
                  <select
                    className="form-select"
                    id="structure.type"
                    name="structure.type"
                    value={formData.structure.type}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="association">Association</option>
                    <option value="mairie">Mairie / Collectivité</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="structure.adresse" className="form-label">Adresse complète</label>
              <input
                type="text"
                className="form-control"
                id="structure.adresse"
                name="structure.adresse"
                value={formData.structure.adresse}
                onChange={handleChange}
                placeholder="Numéro et nom de rue"
              />
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="structure.codePostal" className="form-label">Code postal</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.codePostal"
                    name="structure.codePostal"
                    value={formData.structure.codePostal}
                    onChange={handleChange}
                    placeholder="Ex: 75001"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="form-group">
                  <label htmlFor="structure.ville" className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.ville"
                    name="structure.ville"
                    value={formData.structure.ville}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="structure.pays" className="form-label">Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.pays"
                    name="structure.pays"
                    value={formData.structure.pays}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="structure.siret" className="form-label">SIRET</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.siret"
                    name="structure.siret"
                    value={formData.structure.siret}
                    onChange={handleChange}
                    placeholder="Ex: 123 456 789 00012"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="structure.tva" className="form-label">N° TVA intracommunautaire <span className="optional">(facultatif)</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.tva"
                    name="structure.tva"
                    value={formData.structure.tva}
                    onChange={handleChange}
                    placeholder="Ex: FR123456789"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Concerts associés - visible uniquement en mode édition standard */}
        {!isPublicFormMode && (
          <div className="form-card">
            <div className="card-header">
              <i className="bi bi-music-note-list"></i>
              <h3>Concerts associés</h3>
            </div>
            <div className="card-body">
              <div className="associated-concerts">
                <h4 className="mb-3 concerts-title">
                  {formData.concertsAssocies.length > 0 
                    ? `Concerts associés (${formData.concertsAssocies.length})` 
                    : 'Aucun concert associé'}
                </h4>
                
                {formData.concertsAssocies.length > 0 ? (
                  <div className="concert-list">
                                        {formData.concertsAssocies.map(concert => (
                      <div key={concert.id} className="concert-card">
                        <div className="concert-card-body">
                          <div className="concert-info">
                            <h5 className="concert-name">
                              <i className="bi bi-music-note me-2"></i>
                              {concert.titre}
                            </h5>
                            <div className="concert-details">
                              {concert.date && (
                                <span className="concert-detail">
                                  <i className="bi bi-calendar-event"></i>
                                  {typeof concert.date === 'object' && concert.date.seconds
                                    ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR')
                                    : concert.date}
                                </span>
                              )}
                              {concert.lieu && (
                                <span className="concert-detail">
                                  <i className="bi bi-geo-alt"></i>
                                  {concert.lieu}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Aucun concert n'est associé à ce programmateur.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Message d'information et consentement RGPD - visible uniquement en mode formulaire public */}
        {isPublicFormMode && (
          <div className="form-section">
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <p className="mb-0">
                  Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé 
                  à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », 
                  vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={isPublicFormMode ? "form-actions text-center" : "form-actions"}>
          {!isPublicFormMode && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/programmateurs')}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle me-2"></i>
              Annuler
            </button>
          )}
          <button
            type="submit"
            className={isPublicFormMode ? "btn-submit-public btn-lg" : "btn btn-primary"}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isPublicFormMode ? 'Envoi en cours...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {isPublicFormMode 
                  ? 'Envoyer mes informations' 
                  : (id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le programmateur')}
              </>
            )}
          </button>
        </div>

        {isPublicFormMode && (
          <div className="form-footer mt-4">
            <p className="text-muted text-center small">
              © {new Date().getFullYear()} - Vos informations resteront confidentielles et ne seront utilisées que dans le cadre de la relation contractuelle.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProgrammateurForm;
