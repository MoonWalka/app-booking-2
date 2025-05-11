import { useState, useEffect } from 'react';
import { db, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@/firebaseInit';

const useFormValidationData = (concertId) => {
  const [formData, setFormData] = useState(null);
  const [formId, setFormId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  
  // Liste des champs à comparer et valider pour le programmateur
  const contactFields = [
    { id: 'nom', label: 'Nom' },
    { id: 'prenom', label: 'Prénom' },
    { id: 'fonction', label: 'Fonction' },
    { id: 'email', label: 'Email' },
    { id: 'telephone', label: 'Téléphone' }
  ];
  
  const structureFields = [
    { id: 'raisonSociale', label: 'Raison sociale' },
    { id: 'type', label: 'Type de structure' },
    { id: 'adresse', label: 'Adresse' },
    { id: 'codePostal', label: 'Code postal' },
    { id: 'ville', label: 'Ville' },
    { id: 'pays', label: 'Pays' },
    { id: 'siret', label: 'SIRET' }
  ];

  // Liste des champs à comparer et valider pour le lieu
  const lieuFields = [
    { id: 'nom', label: 'Nom du lieu' },
    { id: 'adresse', label: 'Adresse' },
    { id: 'codePostal', label: 'Code postal' },
    { id: 'ville', label: 'Ville' },
    { id: 'capacite', label: 'Capacité' }
  ];

  const fetchData = async () => {
    try {
      console.log("Recherche de formulaire pour le concert:", concertId);
      
      // 1. D'abord, récupérer les données du concert
      const concertRef = doc(db, 'concerts', concertId);
      const concertDoc = await getDoc(concertRef);
      
      if (!concertDoc.exists()) {
        console.error("Concert non trouvé:", concertId);
        setError("Ce concert n'existe pas.");
        setLoading(false);
        return;
      }
      
      const concertData = {
        id: concertDoc.id,
        ...concertDoc.data()
      };
      
      console.log("Concert trouvé:", concertData);
      setConcert(concertData);
      
      // Récupérer les données du lieu si existant
      if (concertData.lieuId) {
        const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
        if (lieuDoc.exists()) {
          const lieuData = {
            id: lieuDoc.id,
            ...lieuDoc.data()
          };
          setLieu(lieuData);
          console.log("Lieu trouvé:", lieuData);
        }
      }
      
      // 2. Chercher la soumission de formulaire associée au concert
      let formSubmissionId = null;
      
      // Si le concert a déjà un formSubmissionId associé
      if (concertData.formSubmissionId) {
        console.log("FormSubmissionId trouvé dans le concert:", concertData.formSubmissionId);
        formSubmissionId = concertData.formSubmissionId;
      } else {
        console.log("Recherche dans formSubmissions par concertId");
        // Chercher dans la collection formSubmissions
        const submissionsQuery = query(
          collection(db, 'formSubmissions'), 
          where('concertId', '==', concertId)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (submissionsSnapshot.empty) {
          console.log("Aucune soumission trouvée, recherche dans formLinks");
          // Si aucune soumission, vérifier si un lien a été généré
          const linksQuery = query(
            collection(db, 'formLinks'), 
            where('concertId', '==', concertId)
          );
          
          const linksSnapshot = await getDocs(linksQuery);
          
          if (linksSnapshot.empty) {
            console.error("Aucun formulaire trouvé pour ce concert");
            setError("Aucun formulaire n'a été soumis pour ce concert.");
            setLoading(false);
            return;
          }
          
          console.log("Lien trouvé, mais aucune soumission");
          setError("Un lien de formulaire a été généré mais le programmateur n'a pas encore soumis de réponse.");
          setLoading(false);
          return;
        }
        
        // Prendre la soumission la plus récente
        const submissions = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Soumissions trouvées:", submissions.length);
        
        // Trier par date de soumission (du plus récent au plus ancien)
        submissions.sort((a, b) => {
          const dateA = a.submittedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
          const dateB = b.submittedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        
        formSubmissionId = submissions[0].id;
        
        // Mettre à jour le concert avec l'ID de la soumission
        await updateDoc(doc(db, 'concerts', concertId), {
          formSubmissionId: formSubmissionId
        });
        
        console.log("FormSubmissionId sélectionné:", formSubmissionId);
      }
      
      setFormId(formSubmissionId);
      
      // 3. Récupérer les données de la soumission
      const formDoc = await getDoc(doc(db, 'formSubmissions', formSubmissionId));

      if (formDoc.exists()) {
        const formDocData = {
          id: formDoc.id,
          ...formDoc.data()
        };
        
        console.log("Soumission trouvée:", formDocData);
        setFormData(formDocData);
        
        // Création des valeurs initiales à partir des données existantes
        const initialValues = {};
        
        // Si un lieu existe, initialiser avec ses données en priorité
        if (lieu) {
          lieuFields.forEach(field => {
            initialValues[`lieu.${field.id}`] = lieu[field.id] || '';
          });
        }
        
        // Si la soumission contient des données de lieu, les prendre en compte après
        if (formDocData.lieuData) {
          console.log("Données de lieu trouvées dans la soumission:", formDocData.lieuData);
          lieuFields.forEach(field => {
            if (formDocData.lieuData[field.id]) {
              initialValues[`lieu.${field.id}`] = formDocData.lieuData[field.id];
            }
          });
        }
        
        // Récupérer les données existantes du programmateur (s'il existe)
        if (formDocData.programmId) {
          try {
            const progDoc = await getDoc(doc(db, 'programmateurs', formDocData.programmId));
            if (progDoc.exists()) {
              // Définir les données existantes du programmateur
              const programmData = progDoc.data();
              setProgrammateur(programmData);
              
              // Initialiser les champs de contact avec les valeurs existantes
              contactFields.forEach(field => {
                initialValues[`contact.${field.id}`] = programmData[field.id] || '';
              });
              
              // Initialiser les champs de structure avec les valeurs existantes
              structureFields.forEach(field => {
                if (field.id === 'raisonSociale') {
                  initialValues[`structure.${field.id}`] = programmData.structure || '';
                } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
                  const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                  initialValues[`structure.${field.id}`] = programmData[fieldKey] || '';
                } else {
                  initialValues[`structure.${field.id}`] = programmData[field.id] || '';
                }
              });
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données du programmateur:", error);
          }
        }
        
        // Si la soumission a déjà été validée, utiliser les champs validés existants
        if (formDocData.status === 'validated' && formDocData.validatedFields) {
          setValidatedFields(formDocData.validatedFields);
          setValidated(true);
        } else {
          // Sinon, initialiser les champs validés avec les valeurs existantes
          setValidatedFields(initialValues);
        }
      } else {
        console.error("Soumission non trouvée avec ID:", formSubmissionId);
        setError("La soumission de formulaire n'a pas été trouvée.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(`Impossible de charger les données du formulaire: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (concertId) {
      fetchData();
    }
  }, [concertId]);

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateString && dateString.seconds) {
      return new Date(dateString.seconds * 1000).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
    
    // Sinon, traiter comme une chaîne de date standard
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatCurrency = (value) => {
    if (!value) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return {
    formData,
    formId,
    concert,
    loading,
    error,
    validated,
    setValidated,
    validatedFields,
    setValidatedFields,
    programmateur,
    lieu,
    contactFields,
    structureFields,
    lieuFields,
    formatDate,
    formatCurrency
  };
};

export default useFormValidationData;
