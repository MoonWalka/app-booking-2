import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook pour gérer les associations entre un concert et d'autres entités
 */
const useConcertAssociations = () => {
  // Mise à jour des associations programmateur-concert
  const updateProgrammateurAssociation = async (concertId, concertData, newProgrammateurId, oldProgrammateurId, currentLieu) => {
    try {
      // Si un nouveau programmateur est sélectionné
      if (newProgrammateurId) {
        const progRef = doc(db, 'programmateurs', newProgrammateurId);
        
        // Ajouter le concert à la liste des concerts associés du programmateur
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: currentLieu?.nom || null
        };
        
        await updateDoc(progRef, {
          concertsAssocies: arrayUnion(concertReference),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Si un ancien programmateur était associé et a changé
      if (oldProgrammateurId && oldProgrammateurId !== newProgrammateurId) {
        const oldProgRef = doc(db, 'programmateurs', oldProgrammateurId);
        const oldProgDoc = await getDoc(oldProgRef);
        
        if (oldProgDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce concert
          const oldProgData = oldProgDoc.data();
          const updatedConcerts = (oldProgData.concertsAssocies || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldProgRef, {
            concertsAssocies: updatedConcerts,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations programmateur-concert:', error);
    }
  };

  // Mise à jour des associations artiste-concert
  const updateArtisteAssociation = async (concertId, concertData, newArtisteId, oldArtisteId, currentLieu) => {
    try {
      // Si un nouvel artiste est sélectionné
      if (newArtisteId) {
        const artisteRef = doc(db, 'artistes', newArtisteId);
        
        // Ajouter le concert à la liste des concerts de l'artiste
        const concertReference = {
          id: concertId,
          titre: concertData.titre || 'Sans titre',
          date: concertData.date || null,
          lieu: currentLieu?.nom || null
        };
        
        await updateDoc(artisteRef, {
          concerts: arrayUnion(concertReference),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Si un ancien artiste était associé et a changé
      if (oldArtisteId && oldArtisteId !== newArtisteId) {
        const oldArtisteRef = doc(db, 'artistes', oldArtisteId);
        const oldArtisteDoc = await getDoc(oldArtisteRef);
        
        if (oldArtisteDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce concert
          const oldArtisteData = oldArtisteDoc.data();
          const updatedConcerts = (oldArtisteData.concerts || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldArtisteRef, {
            concerts: updatedConcerts,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations artiste-concert:', error);
    }
  };

  // Mise à jour des associations structure-concert
  const updateStructureAssociation = async (concertId, concertData, newStructureId, oldStructureId, currentLieu) => {
    try {
      // Si une nouvelle structure est sélectionnée
      if (newStructureId) {
        const structureRef = doc(db, 'structures', newStructureId);
        const structureDoc = await getDoc(structureRef);
        
        if (structureDoc.exists()) {
          // Ajouter le concert à la liste des concerts associés de la structure
          const concertReference = {
            id: concertId,
            titre: concertData.titre || 'Sans titre',
            date: concertData.date || null,
            lieu: currentLieu?.nom || null
          };
          
          await updateDoc(structureRef, {
            concertsAssocies: arrayUnion(concertReference),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Si une ancienne structure était associée et a changé
      if (oldStructureId && oldStructureId !== newStructureId) {
        const oldStructureRef = doc(db, 'structures', oldStructureId);
        const oldStructureDoc = await getDoc(oldStructureRef);
        
        if (oldStructureDoc.exists()) {
          // Récupérer la liste actuelle et supprimer ce concert
          const oldStructureData = oldStructureDoc.data();
          const updatedConcerts = (oldStructureData.concertsAssocies || [])
            .filter(c => c.id !== concertId);
          
          await updateDoc(oldStructureRef, {
            concertsAssocies: updatedConcerts,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations structure-concert:', error);
    }
  };

  return {
    updateProgrammateurAssociation,
    updateArtisteAssociation,
    updateStructureAssociation
  };
};

export default useConcertAssociations;