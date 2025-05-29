import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';
import AddressInput from '@components/ui/AddressInput';
import useCompanySearch from '@/hooks/common/useCompanySearch';
import styles from './StructureFormEnhanced.module.css';

/**
 * Composant de formulaire structure enrichi - Style moderne TourCraft
 * Avec recherche SIRET et gestion des associations
 */
const StructureFormEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = location.pathname.endsWith('/nouveau');
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    raisonSociale: '',
    type: '',
    siret: '',
    tva: '',
    telephone: '',
    email: '',
    siteWeb: '',
    notes: ''
  });

  // Adresse du lieu (séparée des infos structure)
  const [adresseLieu, setAdresseLieu] = useState({
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France'
  });

  // Informations du signataire du contrat
  const [signataire, setSignataire] = useState({
    prenom: '',
    nom: '',
    fonction: '',
    email: '',
    telephone: ''
  });

  // État pour les associations
  const [programmateursAssocies, setProgrammateursAssocies] = useState([]);
  const [concertsAssocies, setConcertsAssocies] = useState([]);
  const [contratsAssocies] = useState([]);
  const [lieuxAssocies, setLieuxAssocies] = useState([]);

  // Callback mémorisé pour la sélection de structure via recherche
  const handleCompanySelect = useCallback((company) => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        nom: String(company.nom || ''),
        raisonSociale: String(company.nom || ''),
        siret: String(company.siret || ''),
        type: company.statutJuridique ? 'entreprise' : prev.type
      }));

      // Remplir l'adresse du lieu avec les données de l'entreprise
      setAdresseLieu({
        adresse: String(company.adresse || ''),
        codePostal: String(company.codePostal || ''),
        ville: String(company.ville || ''),
        pays: 'France'
      });

      toast.success('Informations de la structure importées');
    }
  }, []);

  // Hook de recherche d'entreprise
  const companySearch = useCompanySearch({
    onCompanySelect: handleCompanySelect
  });

  // États pour la recherche de programmateurs
  const [programmateurSearchTerm, setProgrammateurSearchTerm] = useState('');
  const [programmateurSearchResults, setProgrammateurSearchResults] = useState([]);

  // États pour la recherche de concerts
  const [concertSearchTerm, setConcertSearchTerm] = useState('');
  const [concertSearchResults, setConcertSearchResults] = useState([]);

  // États pour la recherche de lieux
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [lieuSearchResults, setLieuSearchResults] = useState([]);

  // Fonction pour charger les associations
  const loadAssociations = useCallback(async (structure) => {
    try {
      // Charger les programmateurs associés
      if (structure.programmateursIds?.length > 0) {
        const programmateurPromises = structure.programmateursIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, 'programmateurs', id));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
        const programmateurs = (await Promise.all(programmateurPromises)).filter(p => p !== null);
        setProgrammateursAssocies(programmateurs);
      }

      // Charger les concerts associés
      if (structure.concertsIds?.length > 0) {
        const concertPromises = structure.concertsIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, 'concerts', id));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
        const concerts = (await Promise.all(concertPromises)).filter(c => c !== null);
        setConcertsAssocies(concerts);
      }

      // Charger les lieux associés
      if (structure.lieuxIds?.length > 0) {
        const lieuPromises = structure.lieuxIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, 'lieux', id));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
        const lieux = (await Promise.all(lieuPromises)).filter(l => l !== null);
        setLieuxAssocies(lieux);
      }

      // TODO: Charger les contrats quand la collection sera disponible
      
    } catch (error) {
      console.error('Erreur lors du chargement des associations:', error);
    }
  }, []);

  // Chargement des données de la structure
  useEffect(() => {
    const loadStructure = async () => {
      if (isNewFromUrl) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'structures', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const structure = { id: docSnap.id, ...data };
          
          setFormData({
            nom: data.nom || '',
            raisonSociale: data.raisonSociale || '',
            type: data.type || '',
            siret: data.siret || '',
            tva: data.tva || '',
            telephone: data.telephone || '',
            email: data.email || '',
            siteWeb: data.siteWeb || '',
            notes: data.notes || ''
          });

          // Charger l'adresse du lieu
          setAdresseLieu({
            adresse: data.adresseLieu?.adresse || data.adresse || '',
            codePostal: data.adresseLieu?.codePostal || data.codePostal || '',
            ville: data.adresseLieu?.ville || data.ville || '',
            pays: data.adresseLieu?.pays || data.pays || 'France'
          });

          // Charger les infos du signataire
          setSignataire({
            prenom: data.signataire?.prenom || '',
            nom: data.signataire?.nom || '',
            fonction: data.signataire?.fonction || '',
            email: data.signataire?.email || data.email || '',
            telephone: data.signataire?.telephone || data.telephone || ''
          });

          // Charger les associations
          await loadAssociations(structure);
        } else {
          setError('Structure introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement de la structure');
      } finally {
        setLoading(false);
      }
    };

    loadStructure();
  }, [id, isNewFromUrl, loadAssociations]);

  // Effet pour préremplir les infos du signataire avec le premier programmateur associé
  useEffect(() => {
    if (programmateursAssocies.length > 0 && 
        (!signataire.prenom && !signataire.nom && !signataire.fonction)) {
      const programmateur = programmateursAssocies[0];
      setSignataire(prev => ({
        ...prev,
        prenom: programmateur.contact?.prenom || '',
        nom: programmateur.contact?.nom || programmateur.nom || '',
        fonction: programmateur.contact?.fonction || programmateur.fonction || '',
        email: programmateur.contact?.email || programmateur.email || '',
        telephone: programmateur.contact?.telephone || programmateur.telephone || ''
      }));
    }
  }, [programmateursAssocies, signataire.prenom, signataire.nom, signataire.fonction]);

  // Gestionnaire de changement des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'siret') {
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

  // Gestionnaire de changement pour l'adresse du lieu
  const handleAdresseLieuChange = (e) => {
    const { name, value } = e.target;
    setAdresseLieu(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestionnaire de changement pour les infos du signataire
  const handleSignataireChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'telephone') {
      // Téléphone : formater automatiquement
      processedValue = formatPhoneNumber(value);
    }
    
    setSignataire(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Callback pour quand une adresse complète est sélectionnée via autocomplétion
  const handleAddressSelected = useCallback((addressData) => {
    setAdresseLieu({
      adresse: addressData.adresse || '',
      codePostal: addressData.codePostal || '',
      ville: addressData.ville || '',
      pays: addressData.pays || 'France'
    });
  }, []);

  // Utilitaire de formatage téléphone français
  const formatPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length <= 10) {
      return cleanPhone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    }
    return phone;
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.nom.trim()) {
      errors.push('Le nom est obligatoire');
    }
    
    if (!formData.type) {
      errors.push('Le type de structure est obligatoire');
    }

    // Validation des champs du signataire obligatoires
    if (!signataire.prenom.trim()) {
      errors.push('Le prénom du signataire est obligatoire');
    }

    if (!signataire.nom.trim()) {
      errors.push('Le nom du signataire est obligatoire');
    }

    if (!signataire.fonction.trim()) {
      errors.push('La fonction du signataire est obligatoire');
    }
    
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }

    if (signataire.email.trim() && !/^\S+@\S+\.\S+$/.test(signataire.email)) {
      errors.push('Format d\'email du signataire invalide');
    }
    
    if (formData.siret.trim() && formData.siret.length !== 14) {
      errors.push('Le SIRET doit contenir exactement 14 chiffres');
    }
    
    return errors;
  };

  // Fonctions de recherche
  const searchProgrammateurs = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProgrammateurSearchResults([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'programmateurs'),
        where('nom', '>=', searchTerm),
        where('nom', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const programmateurs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProgrammateurSearchResults(programmateurs.filter(p => 
        !programmateursAssocies.find(pa => pa.id === p.id)
      ));
    } catch (error) {
      console.error('Erreur recherche programmateurs:', error);
    }
  }, [programmateursAssocies]);

  const searchConcerts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setConcertSearchResults([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'concerts'),
        where('titre', '>=', searchTerm),
        where('titre', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const concerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConcertSearchResults(concerts.filter(c => 
        !concertsAssocies.find(ca => ca.id === c.id)
      ));
    } catch (error) {
      console.error('Erreur recherche concerts:', error);
    }
  }, [concertsAssocies]);

  const searchLieux = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setLieuSearchResults([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'lieux'),
        where('nom', '>=', searchTerm),
        where('nom', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const lieux = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLieuSearchResults(lieux.filter(l => 
        !lieuxAssocies.find(la => la.id === l.id)
      ));
    } catch (error) {
      console.error('Erreur recherche lieux:', error);
    }
  }, [lieuxAssocies]);

  // Effets pour la recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProgrammateurs(programmateurSearchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [programmateurSearchTerm, searchProgrammateurs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchConcerts(concertSearchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [concertSearchTerm, searchConcerts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLieux(lieuSearchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [lieuSearchTerm, searchLieux]);

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
      const structureData = {
        ...formData,
        adresseLieu,
        signataire,
        programmateursIds: programmateursAssocies.map(p => p.id),
        concertsIds: concertsAssocies.map(c => c.id),
        lieuxIds: lieuxAssocies.map(l => l.id),
        contratsIds: contratsAssocies.map(c => c.id),
        updatedAt: new Date()
      };

      if (isNewFromUrl) {
        structureData.createdAt = new Date();
        const docRef = await addDoc(collection(db, 'structures'), structureData);
        toast.success('Structure créée avec succès !');
        navigate(`/structures/${docRef.id}`);
      } else {
        const docRef = doc(db, 'structures', id);
        await updateDoc(docRef, structureData);
        toast.success('Structure modifiée avec succès !');
        navigate(`/structures/${id}`);
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
        <LoadingSpinner message="Chargement de la structure..." />
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

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSave}>
        <div className={styles.formContainer}>
          {/* Header */}
          <div className={styles.formHeader}>
            <h1 className={styles.headerTitle}>
              <i className="bi bi-building"></i>
              {isNewFromUrl ? 'Nouvelle Structure' : 'Modifier Structure'}
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
                onClick={() => navigate(isNewFromUrl ? '/structures' : `/structures/${id}`)}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle"></i>
                Annuler
              </button>
            </div>
          </div>

          <div className={styles.sectionBody}>
            {/* Section Recherche SIRET */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-search section-icon"></i>
                  <h3 className={styles.sectionTitle}>Rechercher une structure existante</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.searchBar}>
                    <div className={styles.searchInputGroup}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Rechercher par nom ou SIRET..."
                        value={companySearch.searchTerm}
                        onChange={(e) => companySearch.setSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.searchBtn}
                        onClick={companySearch.searchCompany}
                        disabled={companySearch.isSearchingCompany}
                      >
                        {companySearch.isSearchingCompany ? (
                          <>
                            <div className={styles.loadingSpinner}></div>
                            Recherche...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search"></i>
                            Rechercher
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Résultats de recherche */}
                  {companySearch.searchResults.length > 0 && (
                    <div className={styles.searchResults}>
                      {companySearch.searchResults.map((company, index) => (
                        <div
                          key={index}
                          className={styles.searchResultItem}
                          onClick={() => companySearch.handleSelectCompany(company)}
                        >
                          <div className={styles.companyName}>{company.nom}</div>
                          <div className={styles.companyDetails}>
                            <span><i className="bi bi-building"></i> SIRET: {company.siret}</span>
                            {company.ville && <span><i className="bi bi-geo-alt"></i> {company.ville}</span>}
                            {company.statutJuridique && <span><i className="bi bi-tag"></i> {company.statutJuridique}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Suite du formulaire dans la partie 2... */}

            {/* Section Informations de base */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-info-circle section-icon"></i>
                  <h3 className={styles.sectionTitle}>Informations de base</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
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
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Raison sociale</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="raisonSociale"
                        value={formData.raisonSociale}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Type <span className={styles.required}>*</span>
                      </label>
                      <select 
                        className={styles.formControl}
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="association">Association</option>
                        <option value="entreprise">Entreprise</option>
                        <option value="administration">Administration</option>
                        <option value="collectivite">Collectivité</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>SIRET</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="siret"
                        value={formData.siret}
                        onChange={handleChange}
                        placeholder="14 chiffres"
                        maxLength="14"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>TVA Intracommunautaire</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="tva"
                        value={formData.tva}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Adresse du lieu */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-geo-alt section-icon"></i>
                  <h3 className={styles.sectionTitle}>Adresse du lieu</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formGroup}>
                    <AddressInput
                      label="Adresse"
                      value={adresseLieu.adresse}
                      onChange={(e) => setAdresseLieu(prev => ({ ...prev, adresse: e.target.value }))}
                      onAddressSelected={handleAddressSelected}
                      placeholder="Commencez à taper pour rechercher une adresse..."
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Code postal</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="codePostal"
                        value={adresseLieu.codePostal}
                        onChange={handleAdresseLieuChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ville</label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="ville"
                        value={adresseLieu.ville}
                        onChange={handleAdresseLieuChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Pays</label>
                    <input 
                      type="text" 
                      className={styles.formControl}
                      name="pays"
                      value={adresseLieu.pays}
                      onChange={handleAdresseLieuChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Coordonnées de contact */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-telephone section-icon"></i>
                  <h3 className={styles.sectionTitle}>Coordonnées de contact</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
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
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input 
                        type="email" 
                        className={styles.formControl}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Site web</label>
                    <input 
                      type="url" 
                      className={styles.formControl}
                      name="siteWeb"
                      value={formData.siteWeb}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations du signataire du contrat */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-person-check section-icon"></i>
                  <h3 className={styles.sectionTitle}>Informations du signataire du contrat</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formHelp}>
                    <i className="bi bi-info-circle"></i>
                    Ces informations seront utilisées pour générer le contrat. Merci de renseigner le représentant légal ou la personne habilitée à signer pour la structure.
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Prénom <span className={styles.required}>*</span>
                      </label>
                      <input 
                        type="text" 
                        className={styles.formControl}
                        name="prenom"
                        value={signataire.prenom}
                        onChange={handleSignataireChange}
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
                        value={signataire.nom}
                        onChange={handleSignataireChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Fonction / Qualité <span className={styles.required}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className={styles.formControl}
                      name="fonction"
                      value={signataire.fonction}
                      onChange={handleSignataireChange}
                      placeholder="Ex: Directeur, Président, Responsable..."
                      required
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email (facultatif)</label>
                      <input 
                        type="email" 
                        className={styles.formControl}
                        name="email"
                        value={signataire.email}
                        onChange={handleSignataireChange}
                        placeholder="Email du signataire"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Téléphone (facultatif)</label>
                      <input 
                        type="tel" 
                        className={styles.formControl}
                        name="telephone"
                        value={signataire.telephone}
                        onChange={handleSignataireChange}
                        placeholder="Téléphone du signataire"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Programmateurs associés */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-person-badge section-icon"></i>
                  <h3 className={styles.sectionTitle}>Programmateurs associés ({programmateursAssocies.length})</h3>
                </div>
                <div className={styles.sectionBody}>
                  {/* Recherche de programmateurs */}
                  <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
                    <div className={styles.searchInputGroup}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Rechercher un programmateur à associer..."
                        value={programmateurSearchTerm}
                        onChange={(e) => setProgrammateurSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.searchBtn}
                        onClick={() => navigate('/programmateurs/nouveau')}
                      >
                        <i className="bi bi-plus"></i>
                        Nouveau
                      </button>
                    </div>

                    {/* Résultats de recherche */}
                    {programmateurSearchResults.length > 0 && (
                      <div className={styles.searchResults}>
                        {programmateurSearchResults.map((programmateur) => (
                          <div
                            key={programmateur.id}
                            className={styles.searchResultItem}
                            onClick={() => {
                              setProgrammateursAssocies(prev => [...prev, programmateur]);
                              setProgrammateurSearchTerm('');
                              setProgrammateurSearchResults([]);
                              toast.success(`Programmateur "${programmateur.nom}" ajouté`);
                            }}
                          >
                            <div className={styles.resultTitle}>
                              {programmateur.contact?.prenom} {programmateur.contact?.nom || programmateur.nom}
                            </div>
                            <div className={styles.resultDetails}>
                              {programmateur.structure?.raisonSociale && 
                                <span><i className="bi bi-building"></i> {programmateur.structure.raisonSociale}</span>
                              }
                              {programmateur.contact?.email && 
                                <span><i className="bi bi-envelope"></i> {programmateur.contact.email}</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Liste des programmateurs associés */}
                  {programmateursAssocies.length > 0 ? (
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {programmateursAssocies.map((programmateur) => (
                            <tr key={programmateur.id}>
                              <td>
                                <strong>
                                  {programmateur.contact?.prenom} {programmateur.contact?.nom || programmateur.nom}
                                </strong>
                              </td>
                              <td>{programmateur.contact?.email || programmateur.email || '-'}</td>
                              <td>{programmateur.contact?.telephone || programmateur.telephone || '-'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                                    onClick={() => navigate(`/programmateurs/${programmateur.id}`)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-eye"></i>
                                    Voir
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                                    onClick={() => {
                                      setProgrammateursAssocies(prev => 
                                        prev.filter(p => p.id !== programmateur.id)
                                      );
                                      toast.info('Programmateur retiré');
                                    }}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-trash"></i>
                                    Retirer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.alert}>
                      <i className="bi bi-info-circle"></i>
                      Aucun programmateur associé pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Concerts associés */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-music-note section-icon"></i>
                  <h3 className={styles.sectionTitle}>Concerts associés ({concertsAssocies.length})</h3>
                </div>
                <div className={styles.sectionBody}>
                  {/* Recherche de concerts */}
                  <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
                    <div className={styles.searchInputGroup}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Rechercher un concert à associer..."
                        value={concertSearchTerm}
                        onChange={(e) => setConcertSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Résultats de recherche */}
                    {concertSearchResults.length > 0 && (
                      <div className={styles.searchResults}>
                        {concertSearchResults.map((concert) => (
                          <div
                            key={concert.id}
                            className={styles.searchResultItem}
                            onClick={() => {
                              setConcertsAssocies(prev => [...prev, concert]);
                              setConcertSearchTerm('');
                              setConcertSearchResults([]);
                              toast.success(`Concert "${concert.titre}" ajouté`);
                            }}
                          >
                            <div className={styles.concertTitle}>{concert.titre || 'Concert sans titre'}</div>
                            <div className={styles.concertDetails}>
                              {concert.date && <span><i className="bi bi-calendar"></i> {new Date(concert.date).toLocaleDateString('fr-FR')}</span>}
                              {concert.lieuNom && <span><i className="bi bi-geo-alt"></i> {concert.lieuNom}</span>}
                              {concert.artisteNom && <span><i className="bi bi-person"></i> {concert.artisteNom}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Liste des concerts associés */}
                  {concertsAssocies.length > 0 ? (
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Concert</th>
                            <th>Date</th>
                            <th>Lieu</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {concertsAssocies.map((concert) => (
                            <tr key={concert.id}>
                              <td>
                                <strong>{concert.titre || 'Concert sans titre'}</strong>
                                {concert.artisteNom && <div style={{ fontSize: '12px', color: '#666' }}>Artiste: {concert.artisteNom}</div>}
                              </td>
                              <td>{concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : '-'}</td>
                              <td>{concert.lieuNom || concert.lieu || '-'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                                    onClick={() => navigate(`/concerts/${concert.id}`)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-eye"></i>
                                    Voir
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                                    onClick={() => {
                                      setConcertsAssocies(prev => 
                                        prev.filter(c => c.id !== concert.id)
                                      );
                                      toast.info('Concert retiré');
                                    }}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-trash"></i>
                                    Retirer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.alert}>
                      <i className="bi bi-info-circle"></i>
                      Aucun concert associé pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Lieux associés */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-geo-alt section-icon"></i>
                  <h3 className={styles.sectionTitle}>Lieux associés ({lieuxAssocies.length})</h3>
                </div>
                <div className={styles.sectionBody}>
                  {/* Recherche de lieux */}
                  <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
                    <div className={styles.searchInputGroup}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Rechercher un lieu à associer..."
                        value={lieuSearchTerm}
                        onChange={(e) => setLieuSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.searchBtn}
                        onClick={() => navigate('/lieux/nouveau')}
                      >
                        <i className="bi bi-plus"></i>
                        Nouveau lieu
                      </button>
                    </div>

                    {/* Résultats de recherche */}
                    {lieuSearchResults.length > 0 && (
                      <div className={styles.searchResults}>
                        {lieuSearchResults.map((lieu) => (
                          <div
                            key={lieu.id}
                            className={styles.searchResultItem}
                            onClick={() => {
                              setLieuxAssocies(prev => [...prev, lieu]);
                              setLieuSearchTerm('');
                              setLieuSearchResults([]);
                              toast.success(`Lieu "${lieu.nom}" ajouté`);
                            }}
                          >
                            <div className={styles.lieuName}>{lieu.nom}</div>
                            <div className={styles.lieuDetails}>
                              {lieu.adresse && <span><i className="bi bi-geo-alt"></i> {lieu.adresse}</span>}
                              {lieu.ville && <span><i className="bi bi-map"></i> {lieu.ville}</span>}
                              {lieu.capacite && <span><i className="bi bi-people"></i> {lieu.capacite} places</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Liste des lieux associés */}
                  {lieuxAssocies.length > 0 ? (
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Nom du lieu</th>
                            <th>Ville</th>
                            <th>Capacité</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lieuxAssocies.map((lieu) => (
                            <tr key={lieu.id}>
                              <td>
                                <strong>{lieu.nom}</strong>
                                {lieu.type && <div className={styles.badge}>{lieu.type}</div>}
                              </td>
                              <td>{lieu.ville || '-'}</td>
                              <td>{lieu.capacite ? `${lieu.capacite} places` : '-'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                                    onClick={() => navigate(`/lieux/${lieu.id}`)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-eye"></i>
                                    Voir
                                  </button>
                                  <button
                                    type="button"
                                    className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                                    onClick={() => {
                                      setLieuxAssocies(prev => 
                                        prev.filter(l => l.id !== lieu.id)
                                      );
                                      toast.info('Lieu retiré');
                                    }}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    <i className="bi bi-trash"></i>
                                    Retirer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.alert}>
                      <i className="bi bi-info-circle"></i>
                      Aucun lieu associé pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Notes */}
            <div className={styles.formSection}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <i className="bi bi-pencil-square section-icon"></i>
                  <h3 className={styles.sectionTitle}>Notes</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formGroup}>
                    <textarea
                      className={styles.formControl}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Notes internes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StructureFormEnhanced; 