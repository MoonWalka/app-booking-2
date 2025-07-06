// services/historiqueEchangesService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  db
} from './firebase-service';

const COLLECTION_NAME = 'historique_echanges';

// Types d'échanges possibles
export const TYPES_ECHANGES = {
  EMAIL: 'email',
  APPEL: 'appel',
  REUNION: 'reunion',
  SMS: 'sms',
  AUTRE: 'autre'
};

// Statuts possibles
export const STATUTS_ECHANGES = {
  ENVOYE: 'envoye',
  RECU: 'recu',
  PLANIFIE: 'planifie'
};

/**
 * Service pour gérer l'historique des échanges avec les contacts
 */
class HistoriqueEchangesService {
  /**
   * Créer un nouvel échange
   */
  async createEchange(data) {
    try {
      console.log('[HistoriqueEchangesService] Données reçues pour création:', data);
      
      const echange = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('[HistoriqueEchangesService] Données à envoyer à Firebase:', echange);

      const docRef = await addDoc(collection(db, COLLECTION_NAME), echange);
      console.log('[HistoriqueEchangesService] Échange créé avec ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur création échange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour un échange
   */
  async updateEchange(id, data) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      console.log('[HistoriqueEchangesService] Échange mis à jour:', id);
      return {
        success: true,
        id
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur mise à jour échange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer un échange
   */
  async deleteEchange(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('[HistoriqueEchangesService] Échange supprimé:', id);
      
      return {
        success: true,
        id
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur suppression échange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer l'historique des échanges pour un contact
   */
  async getEchangesByContact(contactId, organizationId) {
    try {
      // Requête simplifiée temporaire sans orderBy pour éviter l'erreur d'index
      const q = query(
        collection(db, COLLECTION_NAME),
        where('contactId', '==', contactId),
        where('organizationId', '==', organizationId)
      );

      const snapshot = await getDocs(q);
      const echanges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Trier côté client pour le moment
      echanges.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA; // Ordre décroissant
      });

      console.log(`[HistoriqueEchangesService] ${echanges.length} échanges trouvés pour contact ${contactId}`);
      return {
        success: true,
        data: echanges
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur récupération échanges:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer l'historique des échanges pour une date
   */
  async getEchangesByDate(dateId, organizationId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('dateId', '==', dateId),
        where('organizationId', '==', organizationId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const echanges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[HistoriqueEchangesService] ${echanges.length} échanges trouvés pour date ${dateId}`);
      return {
        success: true,
        data: echanges
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur récupération échanges date:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer les échanges avec rappel à venir
   */
  async getEchangesAvecRappel(organizationId) {
    try {
      const now = new Date();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        where('rappel', '>', now),
        orderBy('rappel', 'asc')
      );

      const snapshot = await getDocs(q);
      const echanges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[HistoriqueEchangesService] ${echanges.length} échanges avec rappel trouvés`);
      return {
        success: true,
        data: echanges
      };
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur récupération rappels:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Écouter les changements en temps réel pour un contact
   */
  subscribeToContactEchanges(contactId, organizationId, callback) {
    try {
      // Requête simplifiée temporaire sans orderBy pour éviter l'erreur d'index
      const q = query(
        collection(db, COLLECTION_NAME),
        where('contactId', '==', contactId),
        where('organizationId', '==', organizationId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const echanges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier côté client pour le moment
        echanges.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA; // Ordre décroissant
        });
        
        callback({
          success: true,
          data: echanges
        });
      }, (error) => {
        console.error('[HistoriqueEchangesService] Erreur écoute temps réel:', error);
        callback({
          success: false,
          error: error.message,
          data: []
        });
      });

      return unsubscribe;
    } catch (error) {
      console.error('[HistoriqueEchangesService] Erreur subscription:', error);
      return () => {};
    }
  }

  /**
   * Formater un échange pour l'affichage
   */
  formatEchange(echange) {
    const typeLabels = {
      email: 'Email',
      appel: 'Appel',
      reunion: 'Réunion',
      sms: 'SMS',
      autre: 'Autre'
    };

    const statutLabels = {
      envoye: 'Envoyé',
      recu: 'Reçu',
      planifie: 'Planifié'
    };

    const typeIcons = {
      email: 'bi-envelope',
      appel: 'bi-telephone',
      reunion: 'bi-people',
      sms: 'bi-chat-dots',
      autre: 'bi-three-dots'
    };

    return {
      ...echange,
      typeLabel: typeLabels[echange.type] || echange.type,
      statutLabel: statutLabels[echange.statut] || echange.statut,
      typeIcon: typeIcons[echange.type] || 'bi-three-dots',
      dateFormatted: this.formatDate(echange.date),
      rappelFormatted: echange.rappel ? this.formatDate(echange.rappel) : null
    };
  }

  /**
   * Formater une date pour l'affichage
   */
  formatDate(date) {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now - d;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Si c'est aujourd'hui
    if (diffDays === 0) {
      return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Si c'est hier
    if (diffDays === 1) {
      return `Hier à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Si c'est dans la semaine
    if (diffDays < 7) {
      return d.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Sinon date complète
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

const historiqueEchangesServiceInstance = new HistoriqueEchangesService();
export default historiqueEchangesServiceInstance;