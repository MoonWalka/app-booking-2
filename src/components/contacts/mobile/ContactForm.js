// src/components/contacts/mobile/ContactForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {  collection, doc, getDoc, setDoc, serverTimestamp  } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useLocationIQ } from '@/hooks/common';
import StepNavigation from '../../common/steps/StepNavigation.js';
import Button from '@ui/Button';
import styles from './ContactForm.module.css';

// Étape 1: Informations de contact
const ContactInfoStep = ({ data, onNext, onBack }) => {
  const [nom, setNom] = useState(data.nom || '');
  const [prenom, setPrenom] = useState(data.prenom || '');
  const [fonction, setFonction] = useState(data.fonction || '');
  const [email, setEmail] = useState(data.email || '');
  const [telephone, setTelephone] = useState(data.telephone || '');
  
  const handleNext = () => {
    if (!nom.trim()) {
      alert('Le nom est obligatoire');
      return;
    }
    
    onNext({ nom, prenom, fonction, email, telephone });
  };
  
  return (
    <div className={styles.stepForm}>
      <div className={styles.stepFormGroup}>
        <label htmlFor="nom">Nom *</label>
        <input
          type="text"
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: Dupont"
          required
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="prenom">Prénom</label>
        <input
          type="text"
          id="prenom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Ex: Jean"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="fonction">Fonction</label>
        <input
          type="text"
          id="fonction"
          value={fonction}
          onChange={(e) => setFonction(e.target.value)}
          placeholder="Ex: Directeur artistique"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: jean.dupont@example.com"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="telephone">Téléphone</label>
        <input
          type="tel"
          id="telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Ex: 06 12 34 56 78"
        />
      </div>
      
      <div className={styles.stepFormActions}>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

// Étape 2: Informations sur la structure
const StructureStep = ({ data, onNext, onBack }) => {
  const [structure, setStructure] = useState(data.structure || '');
  const [structureType, setStructureType] = useState(data.structureType || 'association');
  const [siret, setSiret] = useState(data.siret || '');
  const [codeAPE, setCodeAPE] = useState(data.codeAPE || '');
  
  const handleNext = () => {
    onNext({ structure, structureType, siret, codeAPE });
  };
  
  return (
    <div className={styles.stepForm}>
      <div className={styles.stepFormGroup}>
        <label htmlFor="structure">Nom de la structure</label>
        <input
          type="text"
          id="structure"
          value={structure}
          onChange={(e) => setStructure(e.target.value)}
          placeholder="Ex: Association Culturelle XYZ"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="structureType">Type de structure</label>
        <select
          id="structureType"
          value={structureType}
          onChange={(e) => setStructureType(e.target.value)}
        >
          <option value="association">Association</option>
          <option value="sarl">SARL</option>
          <option value="sas">SAS</option>
          <option value="eurl">EURL</option>
          <option value="auto-entrepreneur">Auto-entrepreneur</option>
          <option value="collectivite">Collectivité</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="siret">SIRET</label>
        <input
          type="text"
          id="siret"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          placeholder="Ex: 123 456 789 00012"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="codeAPE">Code APE</label>
        <input
          type="text"
          id="codeAPE"
          value={codeAPE}
          onChange={(e) => setCodeAPE(e.target.value)}
          placeholder="Ex: 9001Z"
        />
      </div>
      
      <div className={styles.stepFormActions}>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

// Étape 3: Adresse
const AddressStep = ({ data, onNext, onBack }) => {
  const [adresse, setAdresse] = useState(data.structureAdresse || '');
  const [codePostal, setCodePostal] = useState(data.structureCodePostal || '');
  const [ville, setVille] = useState(data.structureVille || '');
  const [pays, setPays] = useState(data.structurePays || 'France');
  const [searchTerm, setSearchTerm] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const { searchAddress } = useLocationIQ();
  
  // Fonction pour rechercher des adresses
  const handleAddressSearch = useCallback(async () => {
    if (searchTerm.length < 3) return;
    
    setSearching(true);
    try {
      const results = await searchAddress(searchTerm);
      setAddressResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, searchAddress]);
  
  // Effet pour déclencher la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        handleAddressSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, handleAddressSearch]);
  
  // Sélectionner une adresse dans les résultats
  const handleSelectAddress = (result) => {
    setAdresse(result.address.house_number ? `${result.address.house_number} ${result.address.road}` : result.address.road || '');
    setCodePostal(result.address.postcode || '');
    setVille(result.address.city || '');
    setPays(result.address.country || 'France');
    setSearchTerm('');
    setAddressResults([]);
  };
  
  const handleNext = () => {
    onNext({ 
      structureAdresse: adresse, 
      structureCodePostal: codePostal, 
      structureVille: ville, 
      structurePays: pays 
    });
  };
  
  return (
    <div className={styles.stepForm}>
      <div className={styles.stepFormGroup}>
        <label htmlFor="search">Rechercher une adresse</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ex: 10 rue de la paix, Paris"
        />
        {searching && <div className={styles.searchingIndicator}>Recherche en cours...</div>}
        
        {addressResults.length > 0 && (
          <div className={styles.addressResults}>
            {addressResults.map((result, index) => (
              <div 
                key={index} 
                className={styles.addressResultItem}
                onClick={() => handleSelectAddress(result)}
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="adresse">Adresse</label>
        <input
          type="text"
          id="adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Ex: 10 rue de la paix"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="codePostal">Code postal</label>
        <input
          type="text"
          id="codePostal"
          value={codePostal}
          onChange={(e) => setCodePostal(e.target.value)}
          placeholder="Ex: 75000"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="ville">Ville</label>
        <input
          type="text"
          id="ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder="Ex: Paris"
        />
      </div>
      
      <div className={styles.stepFormGroup}>
        <label htmlFor="pays">Pays</label>
        <input
          type="text"
          id="pays"
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          placeholder="Ex: France"
        />
      </div>
      
      <div className={styles.stepFormActions}>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Terminer
        </Button>
      </div>
    </div>
  );
};

// Composant principal du formulaire
const ContactFormMobile = ({ 
  // Props pour le mode public
  token,
  concertId,
  formLinkId,
  initialLieuData,
  onSubmitSuccess
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  
  // Détecter le mode public vs normal
  const isPublicMode = !!(token && concertId);
  
  // En mode public, on n'utilise pas l'ID de l'URL
  const contactId = isPublicMode ? null : id;
  
  const [loading, setLoading] = useState(!!contactId && contactId !== 'nouveau');
  const [initialData, setInitialData] = useState({});
  
  useEffect(() => {
    const fetchContact = async () => {
      if (contactId && contactId !== 'nouveau') {
        try {
          const progDoc = await getDoc(doc(db, 'contacts', contactId));
          if (progDoc.exists()) {
            setInitialData(progDoc.data());
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du contact:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchContact();
  }, [contactId]);
  
  const handleComplete = async (data) => {
    try {
      if (isPublicMode) {
        // Mode public : créer une soumission de formulaire
        console.log('Soumission publique (mobile):', { token, concertId, formLinkId, data });
        
        // TODO: Implémenter la création de formSubmission
        // await createFormSubmission(token, concertId, formLinkId, data);
        
        // Appeler le callback de succès
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        // Mode normal : enregistrer le contact
        const contact = {
          ...data,
          nomLowercase: data.nom.toLowerCase(), // Pour faciliter les recherches
          updatedAt: serverTimestamp()
        };
        
        if (contactId && contactId !== 'nouveau') {
          // Mise à jour d'un contact existant
          await setDoc(doc(db, 'contacts', contactId), contact, { merge: true });
        } else {
          // Création d'un nouveau contact
          contact.createdAt = serverTimestamp();
          // ✅ FIX: Ajouter automatiquement l'organizationId
          if (currentOrganization?.id) {
            contact.organizationId = currentOrganization.id;
          }
          const newProgRef = doc(collection(db, 'contacts'));
          await setDoc(newProgRef, contact);
        }
        
        navigate('/contacts');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du contact:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du contact.');
    }
  };
  
  const handleCancel = () => {
    if (isPublicMode) {
      // En mode public, on ne fait rien ou on peut rappeler onSubmitSuccess
      // avec un flag d'annulation si nécessaire
    } else {
      navigate('/contacts');
    }
  };
  
  if (loading) {
    return <div className={styles.loadingIndicator}>Chargement...</div>;
  }
  
  // Définir les étapes du formulaire
  const steps = [
    { 
      title: 'Contact', 
      component: ContactInfoStep 
    },
    { 
      title: 'Structure', 
      component: StructureStep 
    },
    // En mode public, on peut ne pas afficher l'étape adresse si non nécessaire
    ...(!isPublicMode ? [{ 
      title: 'Adresse', 
      component: AddressStep 
    }] : [])
  ];
  
  return (
    <div className={styles.contactsFormMobile}>
      <div className={styles.mobileFormHeader}>
        {/* Remplacer ou supprimer le <h1> selon le contexte */}
      </div>
      
      <StepNavigation 
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialStep={0}
        initialData={initialData}
      />
    </div>
  );
};

export default ContactFormMobile;
