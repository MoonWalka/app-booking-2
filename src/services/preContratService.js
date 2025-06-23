/**
 * Service de gestion des pré-contrats
 * Gère la création, l'envoi, la validation et le suivi des pré-contrats
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase-service';
import emailService from './emailService';
import { debugLog } from '@/utils/logUtils';
import { generateSecureToken } from '@/utils/cryptoUtils';

class PreContratService {
  /**
   * Génère un token unique pour un pré-contrat
   * @returns {string} Token sécurisé
   */
  generateToken() {
    // Génère un token de 32 caractères
    return generateSecureToken(32);
  }

  /**
   * Crée un nouveau pré-contrat
   * @param {Object} preContratData - Données du pré-contrat
   * @param {string} concertId - ID du concert associé
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} - Pré-contrat créé avec ID
   */
  async createPreContrat(preContratData, concertId, organizationId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non authentifié');

      const token = this.generateToken();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // Expire dans 30 jours

      const preContrat = {
        ...preContratData,
        concertId,
        organizationId,
        token,
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        expiresAt: expirationDate,
        validatedAt: null,
        validatedBy: null,
        emailsSent: [],
        history: [{
          action: 'created',
          date: new Date(),
          userId: user.uid,
          userName: user.displayName || user.email
        }]
      };

      debugLog('[PreContratService] Création pré-contrat:', {
        concertId,
        organizationId,
        destinataires: preContratData.destinataires?.length || 0
      }, 'info');

      const docRef = await addDoc(
        collection(db, 'preContrats'),
        preContrat
      );

      return {
        id: docRef.id,
        ...preContrat
      };
    } catch (error) {
      debugLog('[PreContratService] Erreur création pré-contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Met à jour un pré-contrat existant
   * @param {string} preContratId - ID du pré-contrat
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<void>}
   */
  async updatePreContrat(preContratId, updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non authentifié');

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      await updateDoc(
        doc(db, 'preContrats', preContratId),
        updateData
      );

      debugLog('[PreContratService] Pré-contrat mis à jour:', preContratId, 'success');
    } catch (error) {
      debugLog('[PreContratService] Erreur mise à jour pré-contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Envoie un pré-contrat par email via Brevo
   * @param {string} preContratId - ID du pré-contrat
   * @param {Array<string>} destinataires - Emails des destinataires
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendPreContrat(preContratId, destinataires = []) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer le pré-contrat
      const preContratDoc = await getDoc(doc(db, 'preContrats', preContratId));
      if (!preContratDoc.exists()) {
        throw new Error('Pré-contrat introuvable');
      }

      const preContrat = { id: preContratId, ...preContratDoc.data() };
      
      // Récupérer les données du concert
      const concertDoc = await getDoc(doc(db, 'concerts', preContrat.concertId));
      if (!concertDoc.exists()) {
        throw new Error('Concert associé introuvable');
      }
      
      const concert = { id: preContrat.concertId, ...concertDoc.data() };

      // Utiliser les destinataires fournis ou ceux du pré-contrat
      const emailList = destinataires.length > 0 ? destinataires : preContrat.destinataires;
      
      if (!emailList || emailList.length === 0) {
        throw new Error('Aucun destinataire spécifié');
      }

      // Générer le lien de validation
      const validationLink = this.generateValidationLink(preContrat.concertId, preContrat.token);

      debugLog('[PreContratService] Envoi pré-contrat:', {
        preContratId,
        destinataires: emailList,
        concertNom: concert.titre || concert.nom,
        validationLink
      }, 'info');

      // Envoyer à chaque destinataire
      const results = [];
      for (const email of emailList) {
        try {
          // Créer un objet contact pour l'email
          const contact = {
            email,
            nom: this.extractNameFromEmail(email),
            prenom: ''
          };

          // Utiliser le service Brevo pour envoyer avec le template "formulaire"
          const result = await emailService.sendBrevoFormEmail(
            concert,
            contact,
            validationLink
          );

          results.push({
            email,
            success: true,
            messageId: result.messageId
          });

          // Enregistrer l'envoi dans l'historique
          await this.addToHistory(preContratId, {
            action: 'sent',
            recipient: email,
            messageId: result.messageId,
            date: new Date(),
            userId: user.uid,
            userName: user.displayName || user.email
          });

        } catch (emailError) {
          debugLog(`[PreContratService] Erreur envoi à ${email}:`, emailError, 'error');
          results.push({
            email,
            success: false,
            error: emailError.message
          });
        }
      }

      // Mettre à jour le statut si au moins un envoi réussi
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        await this.updatePreContrat(preContratId, {
          status: 'sent',
          sentAt: serverTimestamp(),
          sentBy: user.uid,
          emailsSent: [...(preContrat.emailsSent || []), ...results.filter(r => r.success).map(r => ({
            email: r.email,
            sentAt: new Date(),
            messageId: r.messageId
          }))]
        });
      }

      return {
        success: successCount > 0,
        total: results.length,
        successCount,
        errorCount: results.length - successCount,
        results
      };

    } catch (error) {
      debugLog('[PreContratService] Erreur envoi pré-contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Génère le lien de validation pour un pré-contrat
   * @param {string} concertId - ID du concert
   * @param {string} token - Token du pré-contrat
   * @returns {string} - URL complète de validation
   */
  generateValidationLink(concertId, token) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/pre-contrat/${concertId}/${token}`;
  }

  /**
   * Extrait un nom depuis une adresse email
   * @param {string} email - Adresse email
   * @returns {string} - Nom extrait
   */
  extractNameFromEmail(email) {
    const [localPart] = email.split('@');
    return localPart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Valide un token de pré-contrat
   * @param {string} concertId - ID du concert
   * @param {string} token - Token à valider
   * @returns {Promise<Object>} - Pré-contrat si valide
   */
  async validateToken(concertId, token) {
    try {
      const q = query(
        collection(db, 'preContrats'),
        where('concertId', '==', concertId),
        where('token', '==', token)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { valid: false, reason: 'Token invalide' };
      }

      const preContratDoc = querySnapshot.docs[0];
      const preContrat = { id: preContratDoc.id, ...preContratDoc.data() };

      // Vérifier l'expiration
      if (preContrat.expiresAt && preContrat.expiresAt.toDate() < new Date()) {
        return { valid: false, reason: 'Token expiré', preContrat };
      }

      // Vérifier si déjà validé
      if (preContrat.status === 'validated') {
        return { valid: true, alreadyValidated: true, preContrat };
      }

      return { valid: true, preContrat };

    } catch (error) {
      debugLog('[PreContratService] Erreur validation token:', error, 'error');
      throw error;
    }
  }

  /**
   * Sauvegarde les données du formulaire public
   * @param {string} preContratId - ID du pré-contrat
   * @param {Object} formData - Données du formulaire
   * @returns {Promise<void>}
   */
  async savePublicFormData(preContratId, formData) {
    try {
      // Récupérer les données existantes
      const preContratDoc = await getDoc(doc(db, 'preContrats', preContratId));
      if (!preContratDoc.exists()) {
        throw new Error('Pré-contrat introuvable');
      }

      const existingData = preContratDoc.data();
      
      // Stocker les données du formulaire public séparément pour validation
      const updateData = {
        ...existingData,
        publicFormData: formData, // Stocké séparément pour validation
        publicFormCompleted: true,
        lastPublicFormSave: serverTimestamp(),
        publicFormSavedBy: formData.publicFormEmail || formData.emailOrga || 'Anonyme'
      };

      await updateDoc(
        doc(db, 'preContrats', preContratId),
        updateData
      );

      // Ajouter à l'historique
      await this.addToHistory(preContratId, {
        action: 'publicFormSaved',
        date: new Date(),
        savedBy: formData.publicFormEmail || formData.emailOrga || 'Anonyme',
        modifications: Object.keys(formData)
      });

      debugLog('[PreContratService] Formulaire public sauvegardé:', preContratId, 'success');
    } catch (error) {
      debugLog('[PreContratService] Erreur sauvegarde formulaire public:', error, 'error');
      throw error;
    }
  }

  /**
   * Valide un pré-contrat (soumission du formulaire)
   * @param {string} preContratId - ID du pré-contrat
   * @param {Object} validationData - Données de validation
   * @returns {Promise<void>}
   */
  async validatePreContrat(preContratId, validationData) {
    try {
      // D'abord sauvegarder les données
      await this.savePublicFormData(preContratId, validationData);
      
      // Puis marquer comme validé
      const updateData = {
        status: 'validated',
        validatedAt: serverTimestamp(),
        validatedBy: validationData.publicFormEmail || validationData.email || 'Anonyme'
      };

      await updateDoc(
        doc(db, 'preContrats', preContratId),
        updateData
      );

      // Ajouter à l'historique
      await this.addToHistory(preContratId, {
        action: 'validated',
        date: new Date(),
        validatedBy: validationData.publicFormEmail || validationData.email || 'Anonyme',
        modifications: Object.keys(validationData)
      });

      debugLog('[PreContratService] Pré-contrat validé:', preContratId, 'success');
    } catch (error) {
      debugLog('[PreContratService] Erreur validation pré-contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Ajoute une entrée à l'historique du pré-contrat
   * @param {string} preContratId - ID du pré-contrat
   * @param {Object} historyEntry - Entrée d'historique
   * @returns {Promise<void>}
   */
  async addToHistory(preContratId, historyEntry) {
    try {
      const preContratDoc = await getDoc(doc(db, 'preContrats', preContratId));
      if (!preContratDoc.exists()) return;

      const history = preContratDoc.data().history || [];
      history.push(historyEntry);

      await updateDoc(
        doc(db, 'preContrats', preContratId),
        { history }
      );
    } catch (error) {
      debugLog('[PreContratService] Erreur ajout historique:', error, 'error');
      // Ne pas propager l'erreur pour ne pas bloquer le processus principal
    }
  }

  /**
   * Récupère les pré-contrats d'un concert
   * @param {string} concertId - ID du concert
   * @returns {Promise<Array>} - Liste des pré-contrats
   */
  async getPreContratsByConcert(concertId) {
    try {
      const q = query(
        collection(db, 'preContrats'),
        where('concertId', '==', concertId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      debugLog('[PreContratService] Erreur récupération pré-contrats:', error, 'error');
      throw error;
    }
  }

  /**
   * Récupère un pré-contrat par son ID
   * @param {string} preContratId - ID du pré-contrat
   * @returns {Promise<Object>} - Pré-contrat avec son ID
   */
  async getPreContratById(preContratId) {
    try {
      const docRef = doc(db, 'preContrats', preContratId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Pré-contrat introuvable');
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      debugLog('[PreContratService] Erreur récupération pré-contrat:', error, 'error');
      throw error;
    }
  }

  /**
   * Renvoie un pré-contrat (relance)
   * @param {string} preContratId - ID du pré-contrat
   * @param {Array<string>} destinataires - Emails des destinataires (optionnel)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async resendPreContrat(preContratId, destinataires = []) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer le pré-contrat
      const preContratDoc = await getDoc(doc(db, 'preContrats', preContratId));
      if (!preContratDoc.exists()) {
        throw new Error('Pré-contrat introuvable');
      }

      const preContrat = { id: preContratId, ...preContratDoc.data() };

      // Ajouter à l'historique
      await this.addToHistory(preContratId, {
        action: 'resent',
        date: new Date(),
        userId: user.uid,
        userName: user.displayName || user.email,
        recipients: destinataires.length > 0 ? destinataires : preContrat.destinataires
      });

      // Utiliser la méthode sendPreContrat existante
      return await this.sendPreContrat(preContratId, destinataires);

    } catch (error) {
      debugLog('[PreContratService] Erreur renvoi pré-contrat:', error, 'error');
      throw error;
    }
  }
}

// Export d'une instance unique
const preContratService = new PreContratService();
export default preContratService;

// Export des méthodes individuelles
export const {
  generateToken,
  createPreContrat,
  updatePreContrat,
  sendPreContrat,
  validateToken,
  savePublicFormData,
  validatePreContrat,
  getPreContratsByConcert,
  getPreContratById,
  resendPreContrat
} = preContratService;