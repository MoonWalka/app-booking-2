import { useCallback, useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';

/**
 * Hook personnalisé pour gérer toutes les actions liées aux contacts
 * Centralise la logique métier de ContactViewTabs
 */
export function useContactActions(contactId) {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const { openCommentModal } = useContactModals();
  const { openContactTab } = useTabs();
  
  // État local pour les données modifiables
  const [localTags, setLocalTags] = useState([]);
  const [localPersonnes, setLocalPersonnes] = useState([]);
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);

  // Gestion des tags
  const handleTagsChange = useCallback(async (newTags) => {
    try {
      const contactRef = doc(db, 'contacts_unified', contactId);
      await updateDoc(contactRef, {
        'qualification.tags': newTags,
        updatedAt: serverTimestamp()
      });
      
      setLocalTags(newTags);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags:', error);
      throw error;
    }
  }, [contactId]);

  const handleRemoveTag = useCallback(async (tagToRemove) => {
    try {
      const currentTags = localTags || [];
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      
      const contactRef = doc(db, 'contacts_unified', contactId);
      await updateDoc(contactRef, {
        'qualification.tags': newTags,
        updatedAt: serverTimestamp()
      });
      
      setLocalTags(newTags);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      throw error;
    }
  }, [contactId, localTags]);

  // Gestion des personnes associées
  const handleAssociatePersons = useCallback(async (selectedPersons) => {
    try {
      if (!selectedPersons || selectedPersons.length === 0) {
        return false;
      }
      
      const contactRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];

      const newPersonnes = selectedPersons.map(person => {
        const personneData = person.personne || {};
        
        return {
          id: person.id,
          prenom: personneData.prenom || person.prenom || '',
          nom: personneData.nom || person.nomFamille || '',
          fonction: personneData.fonction || person.fonction || '',
          email: personneData.email || person.email || '',
          telephone: personneData.telephone || personneData.mobile || person.telephone || '',
          mobile: personneData.mobile || '',
          mailPerso: personneData.mailPerso || '',
          telDirect: personneData.telDirect || '',
          telPerso: personneData.telPerso || '',
          adresse: personneData.adresse || '',
          codePostal: personneData.codePostal || '',
          ville: personneData.ville || '',
          pays: personneData.pays || ''
        };
      });

      const existingIds = currentPersonnes.map(p => p.id);
      const uniqueNewPersonnes = newPersonnes.filter(p => !existingIds.includes(p.id));
      
      if (uniqueNewPersonnes.length === 0) {
        return false;
      }
      
      const updatedPersonnes = [...currentPersonnes, ...uniqueNewPersonnes];
      
      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      setLocalPersonnes(updatedPersonnes);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'association des personnes:', error);
      throw error;
    }
  }, [contactId, currentOrganization]);

  const handleUpdatePerson = useCallback(async (updatedPersonData) => {
    try {
      const contactRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];

      const updatedPersonnes = currentPersonnes.map(p => {
        if (p.id === updatedPersonData.id) {
          return {
            ...p,
            prenom: updatedPersonData.prenom,
            nom: updatedPersonData.nom,
            fonction: updatedPersonData.fonction,
            email: updatedPersonData.mailDirect,
            telephone: updatedPersonData.telDirect,
            mobile: updatedPersonData.mobile,
            mailPerso: updatedPersonData.mailPerso,
            telPerso: updatedPersonData.telPerso,
            adresse: updatedPersonData.adresse,
            codePostal: updatedPersonData.codePostal,
            ville: updatedPersonData.ville,
            departement: updatedPersonData.departement,
            region: updatedPersonData.region,
            pays: updatedPersonData.pays
          };
        }
        return p;
      });

      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      setLocalPersonnes(updatedPersonnes);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la personne:', error);
      throw error;
    }
  }, [contactId]);

  const handleDissociatePerson = useCallback(async (personne) => {
    try {
      const personDisplayName = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'cette personne';
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir dissocier "${personDisplayName}" de cette structure ?\n\n` +
        `Cette action retirera la personne de la structure.`
      );
      
      if (!confirmation) {
        return false;
      }

      const contactRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];
      const updatedPersonnes = currentPersonnes.filter(p => p.id !== personne.id);
      
      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      // Créer une personne libre si elle n'existe pas
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
      let personneLibreQuery = query(
        collection(db, 'contacts_unified'),
        where('entityType', '==', 'personne_libre'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      if (prenomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.prenom', '==', prenomSafe));
      }
      if (nomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.nom', '==', nomSafe));
      }
      
      const personneLibreSnapshot = await getDocs(personneLibreQuery);
      
      if (personneLibreSnapshot.empty) {
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || '',
            mailPerso: personne.mailPerso || '',
            telPerso: personne.telPerso || '',
            adresse: personne.adresse || '',
            codePostal: personne.codePostal || '',
            ville: personne.ville || '',
            departement: personne.departement || '',
            region: personne.region || '',
            pays: personne.pays || 'France'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'contacts_unified'), personneLibreData);
      }

      setLocalPersonnes(updatedPersonnes);
      alert(`"${personDisplayName}" a été dissocié(e) de la structure avec succès.`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la dissociation de la personne:', error);
      throw error;
    }
  }, [contactId, currentOrganization]);

  const handleOpenPersonFiche = useCallback(async (personne) => {
    try {
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
      let personneLibreQuery = query(
        collection(db, 'contacts_unified'),
        where('entityType', '==', 'personne_libre'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      if (prenomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.prenom', '==', prenomSafe));
      }
      if (nomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.nom', '==', nomSafe));
      }
      
      const personneLibreSnapshot = await getDocs(personneLibreQuery);
      
      if (!personneLibreSnapshot.empty) {
        const existingPersonDoc = personneLibreSnapshot.docs[0];
        const personneLibreId = existingPersonDoc.id;
        const personneData = existingPersonDoc.data();
        const personneNom = `${personneData.personne?.prenom || ''} ${personneData.personne?.nom || ''}`.trim() || 'Personne';
        
        openContactTab(personneLibreId, personneNom);
      } else {
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || '',
            mailPerso: personne.mailPerso || '',
            telPerso: personne.telPerso || '',
            adresse: personne.adresse || '',
            codePostal: personne.codePostal || '',
            ville: personne.ville || '',
            departement: personne.departement || '',
            region: personne.region || '',
            pays: personne.pays || 'France'
          },
          metadata: {
            createdFrom: 'structure_person_view',
            sourceStructureId: contactId,
            createdForViewing: true
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts_unified'), personneLibreData);
        const newPersonneId = docRef.id;
        const newPersonneNom = `${prenomSafe} ${nomSafe}`.trim() || 'Nouvelle personne';
        
        openContactTab(newPersonneId, newPersonneNom);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la fiche personne:', error);
      throw error;
    }
  }, [contactId, currentOrganization, openContactTab]);

  // Gestion des commentaires
  const handleAddComment = useCallback(async (content) => {
    try {
      const docRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Document non trouvé');
      
      const existingData = docSnap.data();
      const existingComments = existingData.commentaires || [];
      
      const newComment = {
        id: Date.now().toString(),
        contenu: content || '',
        auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
        date: new Date(),
        modifie: false
      };
      
      await updateDoc(docRef, {
        commentaires: [...existingComments, newComment],
        updatedAt: serverTimestamp()
      });
      
      const now = Date.now();
      setLocalCommentaires([...existingComments, newComment]);
      setLastLocalUpdate(now);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }, [contactId, currentUser]);

  const handleDeleteComment = useCallback(async (commentaire) => {
    try {
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir supprimer ce commentaire ?\n\n` +
        `« ${commentaire.contenu.substring(0, 100)}${commentaire.contenu.length > 100 ? '...' : ''} »`
      );
      
      if (!confirmation) {
        return false;
      }

      const docRef = doc(db, 'contacts_unified', contactId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Document non trouvé');
      
      const existingData = docSnap.data();
      const existingComments = existingData.commentaires || [];
      const updatedComments = existingComments.filter(c => c.id !== commentaire.id);
      
      await updateDoc(docRef, {
        commentaires: updatedComments,
        updatedAt: serverTimestamp()
      });
      
      const now = Date.now();
      setLocalCommentaires(updatedComments);
      setLastLocalUpdate(now);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  }, [contactId]);

  const handleAddCommentToPerson = useCallback(async (personne) => {
    const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    
    openCommentModal({
      title: `Nouveau commentaire - ${personneNom}`,
      onSave: async (content) => {
        // Logique pour ajouter un commentaire à une personne
        // (implémenter selon les besoins)
      }
    });
  }, [openCommentModal]);

  return {
    // État local
    localTags,
    setLocalTags,
    localPersonnes,
    setLocalPersonnes,
    localCommentaires,
    setLocalCommentaires,
    lastLocalUpdate,
    
    // Actions sur les tags
    handleTagsChange,
    handleRemoveTag,
    
    // Actions sur les personnes
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddCommentToPerson,
    
    // Actions sur les commentaires
    handleAddComment,
    handleDeleteComment
  };
}