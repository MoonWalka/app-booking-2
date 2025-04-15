import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import '../../style/artisteForm.css';

const ArtisteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [artiste, setArtiste] = useState({
    nom: '',
    description: '',
    genre: '',
    membres: [],
    contacts: {
      email: '',
      telephone: '',
      siteWeb: '',
      instagram: '',
      facebook: ''
    },
    cachetMoyen: '',
    photoPrincipale: '',
    dateCreation: '',
    concertsAssocies: [],
    contrats: [],
    stats: {
      nombreConcerts: 0,
      montantTotal: 0,
      programmateursFrequents: [],
      lieuxFrequents: []
    }
  });

  useEffect(() => {
    if (id && id !== 'nouveau') {
      setLoading(true);
      const fetchArtiste = async () => {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', id));
          if (artisteDoc.exists()) {
            setArtiste({
              ...artiste,
              ...artisteDoc.data()
            });
          } else {
            navigate('/artistes');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'artiste:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchArtiste();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setArtiste(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setArtiste(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMembresChange = (e, index) => {
    const newMembres = [...artiste.membres];
    newMembres[index] = e.target.value;
    setArtiste(prev => ({
      ...prev,
      membres: newMembres
    }));
  };

  const addMembre = () => {
    setArtiste(prev => ({
      ...prev,
      membres: [...prev.membres, '']
    }));
  };

  const removeMembre = (index) => {
    const newMembres = [...artiste.membres];
    newMembres.splice(index, 1);
    setArtiste(prev => ({
      ...prev,
      membres: newMembres
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artiste.nom) {
      alert('Le nom de l\'artiste est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const artisteId = id && id !== 'nouveau' ? id : doc(collection(db, 'artistes')).id;
      const artisteData = {
        ...artiste,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };

      // Convertir cachetMoyen en nombre si c'est une chaîne
      if (artisteData.cachetMoyen && typeof artisteData.cachetMoyen === 'string') {
        artisteData.cachetMoyen = parseInt(artisteData.cachetMoyen, 10) || 0;
      }

      await setDoc(doc(db, 'artistes', artisteId), artisteData, { merge: true });
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'artiste:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Chargement de l'artiste...</div>;
  }

  return (
    <div className="artiste-form-container">
      <div className="form-header">
        <h2 className="page-title">
          {id === 'nouveau' ? 'Créer un nouvel artiste' : 'Modifier l\'artiste'}
        </h2>
        <div className="breadcrumb">
          <span className="breadcrumb-item" onClick={() => navigate('/artistes')}>Artistes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {id === 'nouveau' ? 'Nouveau' : artiste.nom}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="artiste-form">
        {/* Carte - Informations principales */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-music-note"></i>
            <h3>Informations principales</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="nom" className="form-label">Nom de l'artiste <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                id="nom"
                name="nom"
                value={artiste.nom}
                onChange={handleChange}
                required
                placeholder="Nom de l'artiste ou du groupe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description / Biographie</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={artiste.description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Description courte ou biographie de l'artiste"
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="genre" className="form-label">Genre musical</label>
                  <input
                    type="text"
                    className="form-control"
                    id="genre"
                    name="genre"
                    value={artiste.genre || ''}
                    onChange={handleChange}
                    placeholder="Ex: Rock, Jazz, Électro..."
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="cachetMoyen" className="form-label">Cachet moyen (€)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="cachetMoyen"
                    name="cachetMoyen"
                    value={artiste.cachetMoyen || ''}
                    onChange={handleChange}
                    placeholder="Montant moyen du cachet"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="photoPrincipale" className="form-label">Photo principale (URL)</label>
              <input
                type="url"
                className="form-control"
                id="photoPrincipale"
                name="photoPrincipale"
                value={artiste.photoPrincipale || ''}
                onChange={handleChange}
                placeholder="URL de la photo principale"
              />
              {artiste.photoPrincipale && (
                <div className="photo-preview mt-2">
                  <img 
                    src={artiste.photoPrincipale} 
                    alt="Aperçu" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carte - Membres du groupe */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-people"></i>
            <h3>Membres</h3>
          </div>
          <div className="card-body">
            <div className="membres-list">
              {artiste.membres && artiste.membres.map((membre, index) => (
                <div className="membre-item" key={index}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={membre}
                      onChange={(e) => handleMembresChange(e, index)}
                      placeholder="Nom du membre"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeMembre(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-outline-primary mt-2"
              onClick={addMembre}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un membre
            </button>
          </div>
        </div>

        {/* Carte - Informations de contact */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-envelope"></i>
            <h3>Informations de contact</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="contacts.email"
                    name="contacts.email"
                    value={artiste.contacts?.email || ''}
                    onChange={handleChange}
                    placeholder="Email de contact"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.telephone" className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="contacts.telephone"
                    name="contacts.telephone"
                    value={artiste.contacts?.telephone || ''}
                    onChange={handleChange}
                    placeholder="Numéro de téléphone"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contacts.siteWeb" className="form-label">Site web</label>
              <input
                type="url"
                className="form-control"
                id="contacts.siteWeb"
                name="contacts.siteWeb"
                value={artiste.contacts?.siteWeb || ''}
                onChange={handleChange}
                placeholder="URL du site web"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.instagram" className="form-label">Instagram</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="text"
                      className="form-control"
                      id="contacts.instagram"
                      name="contacts.instagram"
                      value={artiste.contacts?.instagram || ''}
                      onChange={handleChange}
                      placeholder="Nom d'utilisateur Instagram"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="contacts.facebook" className="form-label">Facebook</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contacts.facebook"
                    name="contacts.facebook"
                    value={artiste.contacts?.facebook || ''}
                    onChange={handleChange}
                    placeholder="Nom de la page Facebook"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/artistes')}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtisteForm;
