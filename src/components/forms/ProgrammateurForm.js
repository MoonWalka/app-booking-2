import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import '../../style/programmateurForm.css'; // Nouveau fichier CSS

const ProgrammateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    lieu: {
      nom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France'
    }
  });

  useEffect(() => {
    const fetchProgrammateur = async () => {
      if (id && id !== 'nouveau') {
        setLoading(true);
        try {
          const docRef = doc(db, 'programmateurs', id);
          const snap = await getDoc(docRef);
          
          if (snap.exists()) {
            // Si le document existe mais n'a pas la structure actuelle,
            // adapter les données existantes à la nouvelle structure
            const data = snap.data();
            const adaptedData = {
              contact: {
                nom: data.nom || '',
                prenom: data.prenom || '',
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
              lieu: {
                nom: data.lieuNom || '',
                adresse: data.lieuAdresse || '',
                codePostal: data.lieuCodePostal || '',
                ville: data.lieuVille || '',
                pays: data.lieuPays || 'France'
              }
            };
            setFormData(adaptedData);
          } else {
            console.error('Aucun programmateur trouvé avec cet ID');
            navigate('/programmateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

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
  
    try {
      // Validation des champs obligatoires
      if (!formData.contact.nom || !formData.contact.email) {
        alert('Le nom et l\'email sont obligatoires');
        setIsSubmitting(false);
        return;
      }
  
      const progId = id && id !== 'nouveau'
        ? id
        : doc(collection(db, 'programmateurs')).id;
  
      // Préparer les données en aplatissant la structure pour la compatibilité avec l'affichage liste
      const flattenedData = {
        // Champs principaux pour l'affichage dans la liste
        nom: `${formData.contact.nom} ${formData.contact.prenom}`.trim(),
        structure: formData.structure.raisonSociale,
        email: formData.contact.email,
        telephone: formData.contact.telephone,
        
        // Ajouter tous les champs détaillés
        ...formData.contact,
        ...Object.keys(formData.structure).reduce((acc, key) => {
          acc[`structure${key.charAt(0).toUpperCase() + key.slice(1)}`] = formData.structure[key];
          return acc;
        }, {}),
        ...Object.keys(formData.lieu).reduce((acc, key) => {
          acc[`lieu${key.charAt(0).toUpperCase() + key.slice(1)}`] = formData.lieu[key];
          return acc;
        }, {}),
        
        // Timestamps
        updatedAt: serverTimestamp()
      };
  
      if (!id || id === 'nouveau') {
        flattenedData.createdAt = serverTimestamp();
      }
  
      await setDoc(doc(db, 'programmateurs', progId), flattenedData, { merge: true });
      navigate('/programmateurs');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du programmateur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du programmateur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/programmateurs');
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement du programmateur...</div>;
  }

  return (
    <div className="programmateur-form-container">
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

      <form onSubmit={handleSubmit} className="modern-form">
        {/* Section Informations du contact */}
        <div className="form-card">
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
                  <label htmlFor="contact.email" className="form-label">Email <span className="required">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleChange}
                      required
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
        <div className="form-card">
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

        {/* Section Lieu du concert */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Lieu du concert</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="lieu.nom" className="form-label">Nom du lieu</label>
              <input
                type="text"
                className="form-control"
                id="lieu.nom"
                name="lieu.nom"
                value={formData.lieu.nom}
                onChange={handleChange}
                placeholder="Ex: Salle des fêtes municipale"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lieu.adresse" className="form-label">Adresse</label>
              <input
                type="text"
                className="form-control"
                id="lieu.adresse"
                name="lieu.adresse"
                value={formData.lieu.adresse}
                onChange={handleChange}
                placeholder="Numéro et nom de rue"
              />
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="lieu.codePostal" className="form-label">Code postal</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lieu.codePostal"
                    name="lieu.codePostal"
                    value={formData.lieu.codePostal}
                    onChange={handleChange}
                    placeholder="Ex: 75001"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="form-group">
                  <label htmlFor="lieu.ville" className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lieu.ville"
                    name="lieu.ville"
                    value={formData.lieu.ville}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="lieu.pays" className="form-label">Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lieu.pays"
                    name="lieu.pays"
                    value={formData.lieu.pays}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {id && id !== 'nouveau' ? 'Enregistrer les modifications' : 'Créer le programmateur'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgrammateurForm;
