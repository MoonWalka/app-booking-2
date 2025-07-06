import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, db } from '@/services/firebase-service';

/**
 * Hook pour gérer les associations entre un date et d'autres entités
 */
const useDateAssociations = () => {
  // Mise à jour des associations contact-date
  const updateContactAssociation = async (dateId, dateData, newContactId, oldContactId, currentLieu) => {
    try {
      // Si un nouveau contact est sélectionné
      if (newContactId) {
        const progRef = doc(db, 'contacts', newContactId);
        
        // Ajouter le date à la liste des dates associés du contact
        const dateReference = {
          id: dateId,
          titre: dateData.titre || 'Sans titre',
          date: dateData.date || null,
          lieu: currentLieu?.nom || null
        };
        
        await updateDoc(progRef, {
          datesAssocies: arrayUnion(dateReference),
          updatedAt: serverTimestamp()
        });
      }
      
      // Si un ancien contact était associé et a changé
      if (oldContactId && oldContactId !== newContactId) {
        const oldProgRef = doc(db, 'contacts', oldContactId);
        const oldProgDoc = await getDoc(oldProgRef);
        
        if (oldProgDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce date
          const oldProgData = oldProgDoc.data();
          const updatedDates = (oldProgData.datesAssocies || [])
            .filter(c => c.id !== dateId);
          
          await updateDoc(oldProgRef, {
            datesAssocies: updatedDates,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations contact-date:', error);
    }
  };

  // Mise à jour des associations artiste-date
  const updateArtisteAssociation = async (dateId, dateData, newArtisteId, oldArtisteId, currentLieu) => {
    try {
      // Si un nouvel artiste est sélectionné
      if (newArtisteId) {
        const artisteRef = doc(db, 'artistes', newArtisteId);
        
        // Ajouter le date à la liste des dates de l'artiste
        const dateReference = {
          id: dateId,
          titre: dateData.titre || 'Sans titre',
          date: dateData.date || null,
          lieu: currentLieu?.nom || null
        };
        
        await updateDoc(artisteRef, {
          dates: arrayUnion(dateReference),
          updatedAt: serverTimestamp()
        });
      }
      
      // Si un ancien artiste était associé et a changé
      if (oldArtisteId && oldArtisteId !== newArtisteId) {
        const oldArtisteRef = doc(db, 'artistes', oldArtisteId);
        const oldArtisteDoc = await getDoc(oldArtisteRef);
        
        if (oldArtisteDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce date
          const oldArtisteData = oldArtisteDoc.data();
          const updatedDates = (oldArtisteData.dates || [])
            .filter(c => c.id !== dateId);
          
          await updateDoc(oldArtisteRef, {
            dates: updatedDates,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations artiste-date:', error);
    }
  };

  // Mise à jour des associations structure-date
  const updateStructureAssociation = async (dateId, dateData, newStructureId, oldStructureId, currentLieu) => {
    try {
      // Si une nouvelle structure est sélectionnée
      if (newStructureId) {
        const structureRef = doc(db, 'structures', newStructureId);
        const structureDoc = await getDoc(structureRef);
        
        if (structureDoc.exists()) {
          // Ajouter le date à la liste des dates associés de la structure
          const dateReference = {
            id: dateId,
            titre: dateData.titre || 'Sans titre',
            date: dateData.date || null,
            lieu: currentLieu?.nom || null
          };
          
          await updateDoc(structureRef, {
            datesAssocies: arrayUnion(dateReference),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Si une ancienne structure était associée et a changé
      if (oldStructureId && oldStructureId !== newStructureId) {
        const oldStructureRef = doc(db, 'structures', oldStructureId);
        const oldStructureDoc = await getDoc(oldStructureRef);
        
        if (oldStructureDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce date
          const oldStructureData = oldStructureDoc.data();
          const updatedDates = (oldStructureData.datesAssocies || [])
            .filter(c => c.id !== dateId);
          
          await updateDoc(oldStructureRef, {
            datesAssocies: updatedDates,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations structure-date:', error);
    }
  };

  // Mise à jour des associations lieu-date
  const updateLieuAssociation = async (dateId, dateData, newLieuId, oldLieuId) => {
    try {
      // Si un nouveau lieu est sélectionné
      if (newLieuId) {
        const lieuRef = doc(db, 'lieux', newLieuId);
        
        // Ajouter le date à la liste des dates associés du lieu
        const dateReference = {
          id: dateId,
          titre: dateData.titre || 'Sans titre',
          date: dateData.date || null,
          contactNom: dateData.contactNom || null
        };
        
        await updateDoc(lieuRef, {
          datesAssocies: arrayUnion(dateReference),
          updatedAt: serverTimestamp()
        });
      }
      
      // Si un ancien lieu était associé et a changé
      if (oldLieuId && oldLieuId !== newLieuId) {
        const oldLieuRef = doc(db, 'lieux', oldLieuId);
        const oldLieuDoc = await getDoc(oldLieuRef);
        
        if (oldLieuDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce date
          const oldLieuData = oldLieuDoc.data();
          const updatedDates = (oldLieuData.datesAssocies || [])
            .filter(c => c.id !== dateId);
          
          await updateDoc(oldLieuRef, {
            datesAssocies: updatedDates,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations lieu-date:', error);
    }
  };

  return {
    updateContactAssociation,
    updateArtisteAssociation,
    updateStructureAssociation,
    updateLieuAssociation
  };
};

export default useDateAssociations;