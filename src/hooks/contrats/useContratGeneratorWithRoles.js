/**
 * Version améliorée de useContratGenerator qui gère les rôles des contacts
 * Utilise le contact avec le rôle "signataire" pour les variables de contrat
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc,
  updateDoc,
  serverTimestamp
} from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Helper pour trouver le contact avec un rôle spécifique
 */
const findContactByRole = (contacts, role) => {
  if (!Array.isArray(contacts)) return null;
  return contacts.find(c => c.role === role);
};

/**
 * Helper pour obtenir le contact à utiliser pour les variables
 * Priorité : signataire > principal > premier contact
 */
const getContactForVariables = (concertData, contacts) => {
  // Si on a une liste de contacts avec rôles
  if (Array.isArray(contacts) && contacts.length > 0) {
    // Priorité 1 : Contact avec le rôle "signataire"
    const signataire = findContactByRole(contacts, 'signataire');
    if (signataire) return signataire;
    
    // Priorité 2 : Contact principal
    const principal = contacts.find(c => c.isPrincipal);
    if (principal) return principal;
    
    // Priorité 3 : Premier contact de la liste
    return contacts[0];
  }
  
  // Fallback : ancien système avec un seul contact
  if (concertData?.contact) {
    return concertData.contact;
  }
  
  return null;
};

const useContratGeneratorWithRoles = (concertId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [concertData, setConcertData] = useState(null);
  const [contactsWithRoles, setContactsWithRoles] = useState([]);
  const [templates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // Variables conservées pour future utilisation
  // eslint-disable-next-line no-unused-vars
  const [variables] = useState({});
  const [error, setError] = useState(null);
  const { currentOrganization } = useOrganization();

  // Charger les données du concert et ses contacts
  useEffect(() => {
    const loadConcertData = async () => {
      if (!concertId || !currentOrganization?.id) return;
      
      try {
        setIsLoading(true);
        
        // Charger le concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          throw new Error('Concert non trouvé');
        }
        
        const concert = { id: concertDoc.id, ...concertDoc.data() };
        setConcertData(concert);
        
        // Charger les contacts avec leurs rôles
        if (concert.contactsWithRoles && Array.isArray(concert.contactsWithRoles)) {
          // Nouveau système avec rôles
          const contactsPromises = concert.contactsWithRoles.map(async (contactRef) => {
            const contactDoc = await getDoc(doc(db, 'contacts', contactRef.contactId));
            if (contactDoc.exists()) {
              return {
                id: contactDoc.id,
                ...contactDoc.data(),
                role: contactRef.role,
                isPrincipal: contactRef.isPrincipal
              };
            }
            return null;
          });
          
          const loadedContacts = (await Promise.all(contactsPromises)).filter(Boolean);
          setContactsWithRoles(loadedContacts);
        } else if (concert.contactId) {
          // Ancien système : un seul contact
          const contactDoc = await getDoc(doc(db, 'contacts', concert.contactId));
          if (contactDoc.exists()) {
            setContactsWithRoles([{
              id: contactDoc.id,
              ...contactDoc.data(),
              role: 'coordinateur',
              isPrincipal: true
            }]);
          }
        }
        
      } catch (err) {
        console.error('Erreur chargement concert:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConcertData();
  }, [concertId, currentOrganization?.id]);

  // Préparer les variables avec le bon contact
  const prepareVariables = useCallback(() => {
    if (!concertData) return {};
    
    // Obtenir le contact approprié (signataire en priorité)
    const contact = getContactForVariables(concertData, contactsWithRoles);
    const structureData = concertData.structure;
    const entrepriseInfo = currentOrganization;
    
    // Déterminer le rôle du contact utilisé
    const contactRole = contact?.role || 'coordinateur';
    const isSignataire = contactRole === 'signataire';
    
    return {
      // Variables entreprise
      nom_entreprise: entrepriseInfo?.nom || 'Non spécifié',
      adresse_entreprise: entrepriseInfo?.adresse || 'Non spécifiée',
      siret_entreprise: entrepriseInfo?.siret || 'Non spécifié',
      telephone_entreprise: entrepriseInfo?.telephone || 'Non spécifié',
      email_entreprise: entrepriseInfo?.email || 'Non spécifié',
      representant_entreprise: entrepriseInfo?.representant || 'Non spécifié',
      fonction_representant: entrepriseInfo?.fonctionRepresentant || 'Non spécifiée',
      
      // Variables contact (utilise le signataire si disponible)
      contact_nom: contact?.nom || 'Non spécifié',
      contact_prenom: contact?.prenom || '',
      contact_fonction: contact?.fonction || 'Non spécifiée',
      contact_structure: structureData?.nom || contact?.structure || 'Non spécifiée',
      contact_email: contact?.email || 'Non spécifié',
      contact_telephone: contact?.telephone || 'Non spécifié',
      contact_siret: structureData?.siret || contact?.siret || 'Non spécifié',
      
      // Variables spécifiques au signataire
      signataire_nom: isSignataire ? contact?.nom : (findContactByRole(contactsWithRoles, 'signataire')?.nom || contact?.nom || 'Non spécifié'),
      signataire_prenom: isSignataire ? contact?.prenom : (findContactByRole(contactsWithRoles, 'signataire')?.prenom || contact?.prenom || ''),
      signataire_fonction: isSignataire ? contact?.fonction : (findContactByRole(contactsWithRoles, 'signataire')?.fonction || contact?.fonction || 'Non spécifiée'),
      signataire_email: isSignataire ? contact?.email : (findContactByRole(contactsWithRoles, 'signataire')?.email || contact?.email || 'Non spécifié'),
      
      // Compatibilité rétrograde - ancienne nomenclature programmateur
      programmateur_nom: contact?.nom || 'Non spécifié',
      programmateur_prenom: contact?.prenom || '',
      programmateur_structure: structureData?.nom || contact?.structure || 'Non spécifiée',
      programmateur_email: contact?.email || 'Non spécifié',
      programmateur_telephone: contact?.telephone || 'Non spécifié',
      programmateur_siret: structureData?.siret || contact?.siret || 'Non spécifié',
      
      // Variables adresse
      contact_adresse: (() => {
        if (structureData?.adresse) {
          return typeof structureData.adresse === 'object' 
            ? `${structureData.adresse.adresse || ''} ${structureData.adresse.codePostal || ''} ${structureData.adresse.ville || ''}`.trim()
            : structureData.adresse;
        }
        return contact?.adresse || 'Non spécifiée';
      })(),
      
      // Représentant et qualité
      contact_representant: isSignataire ? contact?.nom : (contact?.representant || contact?.nom || 'Non spécifié'),
      contact_qualite_representant: isSignataire ? contact?.fonction : (contact?.qualiteRepresentant || contact?.fonction || 'Non spécifiée'),
      programmateur_representant: contact?.representant || contact?.nom || 'Non spécifié',
      programmateur_qualite_representant: contact?.qualiteRepresentant || contact?.fonction || 'Non spécifiée',
      
      // Informations sur les rôles (pour debug/info)
      _contact_role: contactRole,
      _contacts_count: contactsWithRoles.length,
      _has_signataire: !!findContactByRole(contactsWithRoles, 'signataire'),
      
      // Variables concert
      concert_titre: concertData.titre || 'Non spécifié',
      concert_date: concertData.date || 'Non spécifiée',
      concert_lieu: concertData.lieu?.nom || 'Non spécifié',
      concert_montant: concertData.montant || 'Non spécifié',
      
      // Autres variables...
    };
  }, [concertData, contactsWithRoles, currentOrganization]);

  // Fonction pour ajouter un contact signataire depuis le formulaire public
  const addSignataireFromPublicForm = useCallback(async (signataireData) => {
    if (!concertId || !currentOrganization?.id) return;
    
    try {
      // Créer le nouveau contact
      const newContactData = {
        nom: `${signataireData.prenom} ${signataireData.nom}`,
        prenom: signataireData.prenom,
        nomLowercase: `${signataireData.prenom} ${signataireData.nom}`.toLowerCase(),
        email: signataireData.email || '',
        telephone: signataireData.telephone || '',
        fonction: signataireData.fonction || '',
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Relations
        concertsIds: [concertId],
        lieuxIds: [],
        structureId: '',
        structureNom: '',
        // Marqueur
        isFromPublicForm: true
      };
      
      // Créer le contact dans Firestore
      const contactRef = await addDoc(collection(db, 'contacts'), newContactData);
      
      // Mettre à jour le concert avec le nouveau contact signataire
      const updatedContactsWithRoles = [
        ...(concertData.contactsWithRoles || []),
        {
          contactId: contactRef.id,
          role: 'signataire',
          isPrincipal: false
        }
      ];
      
      await updateDoc(doc(db, 'concerts', concertId), {
        contactsWithRoles: updatedContactsWithRoles,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour l'état local
      const newContact = {
        id: contactRef.id,
        ...newContactData,
        role: 'signataire',
        isPrincipal: false
      };
      
      setContactsWithRoles([...contactsWithRoles, newContact]);
      
      return newContact;
      
    } catch (error) {
      console.error('Erreur création contact signataire:', error);
      throw error;
    }
  }, [concertId, currentOrganization?.id, concertData, contactsWithRoles]);

  return {
    isLoading,
    concertData,
    contactsWithRoles,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    variables: prepareVariables(),
    error,
    addSignataireFromPublicForm,
    // Helpers
    getSignataireContact: () => findContactByRole(contactsWithRoles, 'signataire'),
    getCoordinateurContact: () => findContactByRole(contactsWithRoles, 'coordinateur'),
    // ... autres méthodes du hook original
  };
};

export default useContratGeneratorWithRoles;