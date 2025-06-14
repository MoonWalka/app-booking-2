import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';
import AddressInput from '@components/ui/AddressInput';
import FormHeader from '@/components/ui/FormHeader';
import useCompanySearch from '@/hooks/common/useCompanySearch';
import StructureIdentitySection from './sections/StructureIdentitySection';
import StructureSignataireSection from './sections/StructureSignataireSection';
import StructureBillingSection from './sections/StructureBillingSection';
import StructureNotesSection from './sections/StructureNotesSection';
import StructureContactsSection from './sections/StructureContactsSection';
import StructureConcertsManagementSection from './sections/StructureConcertsManagementSection';
import StructureSiretSearchSection from './sections/StructureSiretSearchSection';
import styles from './StructureForm.module.css';

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
    notes: '',
    numeroIntracommunautaire: '',
    // Champs de facturation
    adresseFacturation: '',
    codePostalFacturation: '',
    villeFacturation: '',
    paysFacturation: ''
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
  const [contactsAssocies, setContactsAssocies] = useState([]);
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
      const companyAdresse = typeof company.adresse === 'object' ? company.adresse?.adresse || '' : String(company.adresse || '');
      
      // Essayer d'extraire le code postal et la ville depuis l'adresse si pas fournis séparément
      let codePostal = String(company.codePostal || '');
      let ville = String(company.ville || '');
      
      if (companyAdresse && (!codePostal || !ville)) {
        // Regex pour extraire code postal (5 chiffres) et ville
        const addressMatch = companyAdresse.match(/(\d{5})\s+([A-Za-zÀ-ÿ\s\-']+)$/);
        if (addressMatch) {
          if (!codePostal) codePostal = addressMatch[1];
          if (!ville) ville = addressMatch[2].trim();
        }
      }
      
      setAdresseLieu({
        adresse: companyAdresse,
        codePostal: codePostal,
        ville: ville,
        pays: 'France'
      });

      toast.success('Informations de la structure importées');
    }
  }, []);

  // Hook de recherche d'entreprise
  const companySearch = useCompanySearch({
    onCompanySelect: handleCompanySelect
  });

  // États pour la recherche de lieux
  const [lieuSearchTerm, setLieuSearchTerm] = useState('');
  const [lieuSearchResults, setLieuSearchResults] = useState([]);

  // Fonction pour charger les associations
  const loadAssociations = useCallback(async (structure) => {
    try {
      // Charger les contacts associés
      if (structure.contactIds?.length > 0) { // Format harmonisé
        const contactPromises = structure.contactIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, 'contacts', id));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
        const contacts = (await Promise.all(contactPromises)).filter(p => p !== null);
        setContactsAssocies(contacts);
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
            notes: data.notes || '',
            numeroIntracommunautaire: data.numeroIntracommunautaire || '',
            // Champs de facturation
            adresseFacturation: data.adresseFacturation || '',
            codePostalFacturation: data.codePostalFacturation || '',
            villeFacturation: data.villeFacturation || '',
            paysFacturation: data.paysFacturation || ''
          });

          // Charger l'adresse du lieu
          const existingAdresse = data.adresseLieu?.adresse || 
                                 (typeof data.adresse === 'object' ? data.adresse?.adresse || '' : data.adresse || '');
          let existingCodePostal = data.adresseLieu?.codePostal || data.codePostal || '';
          let existingVille = data.adresseLieu?.ville || data.ville || '';
          
          // Si les champs code postal ou ville sont vides mais qu'on a une adresse,
          // essayer de les extraire depuis l'adresse
          if (existingAdresse && (!existingCodePostal || !existingVille)) {
            const addressMatch = existingAdresse.match(/(\d{5})\s+([A-Za-zÀ-ÿ\s\-']+)$/);
            if (addressMatch) {
              if (!existingCodePostal) existingCodePostal = addressMatch[1];
              if (!existingVille) existingVille = addressMatch[2].trim();
            }
          }
          
          setAdresseLieu({
            adresse: existingAdresse,
            codePostal: existingCodePostal,
            ville: existingVille,
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

  // Effet pour extraire automatiquement code postal et ville depuis l'adresse au chargement
  useEffect(() => {
    // Si on a une adresse mais pas de code postal ou ville, essayer d'extraire
    if (adresseLieu.adresse && (!adresseLieu.codePostal || !adresseLieu.ville)) {
      const addressMatch = adresseLieu.adresse.match(/(\d{5})\s+([A-Za-zÀ-ÿ\s\-']+)$/);
      if (addressMatch) {
        const newCodePostal = adresseLieu.codePostal || addressMatch[1];
        const newVille = adresseLieu.ville || addressMatch[2].trim();
        
        // Seulement mettre à jour si on a réellement extrait quelque chose de nouveau
        if (newCodePostal !== adresseLieu.codePostal || newVille !== adresseLieu.ville) {
          setAdresseLieu(prev => ({
            ...prev,
            codePostal: newCodePostal,
            ville: newVille
          }));
        }
      }
    }
  }, [adresseLieu.adresse, adresseLieu.codePostal, adresseLieu.ville]); // Dépendances complètes

  // Effet pour préremplir les infos du signataire avec le premier contact associé
  useEffect(() => {
    if (contactsAssocies.length > 0 && 
        (!signataire.prenom && !signataire.nom && !signataire.fonction)) {
      const contact = contactsAssocies[0];
      setSignataire(prev => ({
        ...prev,
        prenom: contact.contact?.prenom || '',
        nom: contact.contact?.nom || contact.nom || '',
        fonction: contact.contact?.fonction || contact.fonction || '',
        email: contact.contact?.email || contact.email || '',
        telephone: contact.contact?.telephone || contact.telephone || ''
      }));
    }
  }, [contactsAssocies, signataire.prenom, signataire.nom, signataire.fonction]);

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
        contactIds: contactsAssocies.map(p => p.id), // Format harmonisé
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
          {/* Header avec FormHeader standardisé */}
          <FormHeader
            title={isNewFromUrl ? 'Nouvelle Structure' : 'Modifier Structure'}
            icon={<i className="bi bi-building"></i>}
            isLoading={isSubmitting}
            roundedTop={true}
            actions={[
              <button 
                key="save"
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
              </button>,
              <button 
                key="cancel"
                type="button" 
                className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                onClick={() => navigate(isNewFromUrl ? '/structures' : `/structures/${id}`)}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle"></i>
                Annuler
              </button>
            ]}
          />

          <div className={styles.sectionBody}>
            {/* Section Recherche SIRET */}
            <StructureSiretSearchSection companySearch={companySearch} />

            {/* Suite du formulaire dans la partie 2... */}

            {/* Section Informations de base - Composant modulaire */}
            <StructureIdentitySection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

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

            {/* Section Informations du signataire du contrat - Composant modulaire */}
            <StructureSignataireSection 
              signataire={signataire}
              handleSignataireChange={handleSignataireChange}
              errors={{}}
            />

            {/* Section Contacts associés */}
            <StructureContactsSection
              contactIds={contactsAssocies.map(c => c.id)}
              onChange={(contactIds) => {
                // Gérer la mise à jour des contacts
                const newContactIds = Array.isArray(contactIds) ? contactIds : [contactIds].filter(Boolean);
                
                // Si on a des nouveaux contacts à charger
                const loadNewContacts = async () => {
                  const currentIds = contactsAssocies.map(c => c.id);
                  const idsToLoad = newContactIds.filter(id => !currentIds.includes(id));
                  
                  if (idsToLoad.length > 0) {
                    try {
                      const newContacts = await Promise.all(
                        idsToLoad.map(async (id) => {
                          const docSnap = await getDoc(doc(db, 'contacts', id));
                          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
                        })
                      );
                      
                      const validContacts = newContacts.filter(c => c !== null);
                      setContactsAssocies(prev => [...prev, ...validContacts]);
                    } catch (error) {
                      console.error('Erreur lors du chargement des contacts:', error);
                    }
                  }
                  
                  // Si on a des contacts à retirer
                  const idsToRemove = currentIds.filter(id => !newContactIds.includes(id));
                  if (idsToRemove.length > 0) {
                    setContactsAssocies(prev => prev.filter(c => !idsToRemove.includes(c.id)));
                  }
                };
                
                loadNewContacts();
              }}
              entityId={!isNewFromUrl ? id : null}
              isEditing={true}
            />

            {/* Section Concerts associés */}
            <StructureConcertsManagementSection
              concertIds={concertsAssocies.map(c => c.id)}
              onChange={(concertIds) => {
                // Gérer la mise à jour des concerts
                const newConcertIds = Array.isArray(concertIds) ? concertIds : [concertIds].filter(Boolean);
                
                // Si on a des nouveaux concerts à charger
                const loadNewConcerts = async () => {
                  const currentIds = concertsAssocies.map(c => c.id);
                  const idsToLoad = newConcertIds.filter(id => !currentIds.includes(id));
                  
                  if (idsToLoad.length > 0) {
                    try {
                      const newConcerts = await Promise.all(
                        idsToLoad.map(async (id) => {
                          const docSnap = await getDoc(doc(db, 'concerts', id));
                          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
                        })
                      );
                      
                      const validConcerts = newConcerts.filter(c => c !== null);
                      setConcertsAssocies(prev => [...prev, ...validConcerts]);
                    } catch (error) {
                      console.error('Erreur lors du chargement des concerts:', error);
                    }
                  }
                  
                  // Si on a des concerts à retirer
                  const idsToRemove = currentIds.filter(id => !newConcertIds.includes(id));
                  if (idsToRemove.length > 0) {
                    setConcertsAssocies(prev => prev.filter(c => !idsToRemove.includes(c.id)));
                  }
                };
                
                loadNewConcerts();
              }}
              entityId={!isNewFromUrl ? id : null}
              isEditing={true}
            />

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

            {/* Section Facturation */}
            <StructureBillingSection 
              formData={formData}
              handleChange={handleChange}
            />

            {/* Section Notes */}
            <StructureNotesSection
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

export default StructureFormEnhanced; 