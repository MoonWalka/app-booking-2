import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import structuresService from './structuresService';
import personnesService from './personnesService';
import liaisonsService from './liaisonsService';

/**
 * Service de détection et fusion de doublons
 * Compatible avec la logique Bob Booking
 */
class DuplicatesService {

  /**
   * Algorithmes de détection de similarité
   */
  static SIMILARITY_ALGORITHMS = {
    
    /**
     * Calcul de distance de Levenshtein simplifiée
     */
    levenshtein(str1, str2) {
      if (!str1 || !str2) return 0;
      
      const a = str1.toLowerCase();
      const b = str2.toLowerCase();
      
      if (a === b) return 1;
      
      const matrix = [];
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      const maxLen = Math.max(a.length, b.length);
      return 1 - matrix[b.length][a.length] / maxLen;
    },

    /**
     * Comparaison phonétique simplifiée (français)
     */
    soundex(str) {
      if (!str) return '';
      
      const s = str.toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/[aeiouy]/g, '0')
        .replace(/[bfpv]/g, '1')
        .replace(/[cgjkqsxz]/g, '2')
        .replace(/[dt]/g, '3')
        .replace(/[l]/g, '4')
        .replace(/[mn]/g, '5')
        .replace(/[r]/g, '6');
      
      return s.charAt(0) + s.slice(1).replace(/0/g, '').substring(0, 3).padEnd(3, '0');
    },

    /**
     * Normalisation pour comparaison
     */
    normalize(str) {
      if (!str) return '';
      return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
    }
  };

  /**
   * Détecter les doublons de structures
   */
  static async detectStructureDuplicates(organizationId, threshold = 0.8) {
    try {
      console.log('🔍 Détection des doublons de structures...');
      
      // Récupérer toutes les structures
      const structuresResult = await structuresService.listStructures(organizationId);
      if (!structuresResult.success) {
        throw new Error('Impossible de récupérer les structures');
      }
      
      const structures = structuresResult.data;
      const duplicateGroups = [];
      const processed = new Set();

      // Comparer chaque structure avec les autres
      for (let i = 0; i < structures.length; i++) {
        if (processed.has(structures[i].id)) continue;
        
        const group = [structures[i]];
        processed.add(structures[i].id);
        
        for (let j = i + 1; j < structures.length; j++) {
          if (processed.has(structures[j].id)) continue;
          
          const similarity = this.calculateStructureSimilarity(structures[i], structures[j]);
          
          if (similarity.score >= threshold) {
            group.push(structures[j]);
            processed.add(structures[j].id);
          }
        }
        
        // Si plus d'une structure dans le groupe, c'est un doublon
        if (group.length > 1) {
          duplicateGroups.push({
            type: 'structure',
            score: Math.max(...group.map((_, idx) => 
              idx === 0 ? 0 : this.calculateStructureSimilarity(group[0], group[idx]).score
            )),
            items: group,
            reasons: group.length > 1 ? 
              this.calculateStructureSimilarity(group[0], group[1]).reasons : []
          });
        }
      }

      console.log(`✅ ${duplicateGroups.length} groupes de doublons structures détectés`);
      return {
        success: true,
        duplicates: duplicateGroups
      };
      
    } catch (error) {
      console.error('Erreur détection doublons structures:', error);
      return {
        success: false,
        error: error.message,
        duplicates: []
      };
    }
  }

  /**
   * Détecter les doublons de personnes
   */
  static async detectPersonneDuplicates(organizationId, threshold = 0.8) {
    try {
      console.log('🔍 Détection des doublons de personnes...');
      
      // Récupérer toutes les personnes
      const personnesResult = await personnesService.listPersonnes(organizationId);
      if (!personnesResult.success) {
        throw new Error('Impossible de récupérer les personnes');
      }
      
      const personnes = personnesResult.data;
      const duplicateGroups = [];
      const processed = new Set();

      // Comparer chaque personne avec les autres
      for (let i = 0; i < personnes.length; i++) {
        if (processed.has(personnes[i].id)) continue;
        
        const group = [personnes[i]];
        processed.add(personnes[i].id);
        
        for (let j = i + 1; j < personnes.length; j++) {
          if (processed.has(personnes[j].id)) continue;
          
          const similarity = this.calculatePersonneSimilarity(personnes[i], personnes[j]);
          
          if (similarity.score >= threshold) {
            group.push(personnes[j]);
            processed.add(personnes[j].id);
          }
        }
        
        // Si plus d'une personne dans le groupe, c'est un doublon
        if (group.length > 1) {
          duplicateGroups.push({
            type: 'personne',
            score: Math.max(...group.map((_, idx) => 
              idx === 0 ? 0 : this.calculatePersonneSimilarity(group[0], group[idx]).score
            )),
            items: group,
            reasons: group.length > 1 ? 
              this.calculatePersonneSimilarity(group[0], group[1]).reasons : []
          });
        }
      }

      console.log(`✅ ${duplicateGroups.length} groupes de doublons personnes détectés`);
      return {
        success: true,
        duplicates: duplicateGroups
      };
      
    } catch (error) {
      console.error('Erreur détection doublons personnes:', error);
      return {
        success: false,
        error: error.message,
        duplicates: []
      };
    }
  }

  /**
   * Calculer la similarité entre deux structures
   */
  static calculateStructureSimilarity(struct1, struct2) {
    const reasons = [];
    let totalScore = 0;
    let weightSum = 0;

    // Comparaisons avec poids
    const comparisons = [
      {
        field: 'raisonSociale',
        weight: 40,
        value1: struct1.raisonSociale,
        value2: struct2.raisonSociale,
        method: 'levenshtein'
      },
      {
        field: 'email',
        weight: 30,
        value1: struct1.email,
        value2: struct2.email,
        method: 'exact'
      },
      {
        field: 'telephone1',
        weight: 20,
        value1: struct1.telephone1,
        value2: struct2.telephone1,
        method: 'phone'
      },
      {
        field: 'adresse',
        weight: 10,
        value1: struct1.adresse,
        value2: struct2.adresse,
        method: 'levenshtein'
      }
    ];

    comparisons.forEach(comp => {
      if (!comp.value1 || !comp.value2) return;
      
      let score = 0;
      
      switch (comp.method) {
        case 'exact':
          score = comp.value1.toLowerCase() === comp.value2.toLowerCase() ? 1 : 0;
          break;
        case 'levenshtein':
          score = this.SIMILARITY_ALGORITHMS.levenshtein(comp.value1, comp.value2);
          break;
        case 'phone':
          const phone1 = this.SIMILARITY_ALGORITHMS.normalize(comp.value1);
          const phone2 = this.SIMILARITY_ALGORITHMS.normalize(comp.value2);
          score = phone1 === phone2 ? 1 : 0;
          break;
      }
      
      if (score > 0.7) {
        reasons.push({
          field: comp.field,
          score: score,
          method: comp.method
        });
      }
      
      totalScore += score * comp.weight;
      weightSum += comp.weight;
    });

    return {
      score: weightSum > 0 ? totalScore / weightSum : 0,
      reasons
    };
  }

  /**
   * Calculer la similarité entre deux personnes
   */
  static calculatePersonneSimilarity(pers1, pers2) {
    const reasons = [];
    let totalScore = 0;
    let weightSum = 0;

    // Comparaisons avec poids
    const comparisons = [
      {
        field: 'email',
        weight: 40,
        value1: pers1.email,
        value2: pers2.email,
        method: 'exact'
      },
      {
        field: 'nom',
        weight: 25,
        value1: pers1.nom,
        value2: pers2.nom,
        method: 'soundex'
      },
      {
        field: 'prenom',
        weight: 25,
        value1: pers1.prenom,
        value2: pers2.prenom,
        method: 'soundex'
      },
      {
        field: 'telephone',
        weight: 10,
        value1: pers1.telephone || pers1.mobile,
        value2: pers2.telephone || pers2.mobile,
        method: 'phone'
      }
    ];

    comparisons.forEach(comp => {
      if (!comp.value1 || !comp.value2) return;
      
      let score = 0;
      
      switch (comp.method) {
        case 'exact':
          score = comp.value1.toLowerCase() === comp.value2.toLowerCase() ? 1 : 0;
          break;
        case 'levenshtein':
          score = this.SIMILARITY_ALGORITHMS.levenshtein(comp.value1, comp.value2);
          break;
        case 'soundex':
          const sound1 = this.SIMILARITY_ALGORITHMS.soundex(comp.value1);
          const sound2 = this.SIMILARITY_ALGORITHMS.soundex(comp.value2);
          score = sound1 === sound2 ? 0.8 : this.SIMILARITY_ALGORITHMS.levenshtein(comp.value1, comp.value2);
          break;
        case 'phone':
          const phone1 = this.SIMILARITY_ALGORITHMS.normalize(comp.value1);
          const phone2 = this.SIMILARITY_ALGORITHMS.normalize(comp.value2);
          score = phone1 === phone2 ? 1 : 0;
          break;
      }
      
      if (score > 0.6) {
        reasons.push({
          field: comp.field,
          score: score,
          method: comp.method
        });
      }
      
      totalScore += score * comp.weight;
      weightSum += comp.weight;
    });

    return {
      score: weightSum > 0 ? totalScore / weightSum : 0,
      reasons
    };
  }

  /**
   * Sauvegarder les doublons détectés pour review manuelle
   */
  static async saveDuplicatesForReview(duplicates, organizationId, userId) {
    try {
      const batch = writeBatch(db);
      const timestamp = new Date();
      
      duplicates.forEach((duplicateGroup, index) => {
        const duplicateRef = doc(collection(db, 'duplicates'));
        const duplicateData = {
          organizationId,
          type: duplicateGroup.type,
          score: duplicateGroup.score,
          reasons: duplicateGroup.reasons,
          items: duplicateGroup.items.map(item => ({
            id: item.id,
            displayName: duplicateGroup.type === 'structure' 
              ? item.raisonSociale 
              : `${item.prenom} ${item.nom}`,
            data: item
          })),
          status: 'pending', // pending, reviewed, merged, dismissed
          createdAt: serverTimestamp(),
          createdBy: userId,
          reviewedAt: null,
          reviewedBy: null
        };
        
        batch.set(duplicateRef, duplicateData);
      });
      
      await batch.commit();
      
      console.log(`✅ ${duplicates.length} groupes de doublons sauvegardés pour review`);
      return {
        success: true,
        saved: duplicates.length
      };
      
    } catch (error) {
      console.error('Erreur sauvegarde doublons:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les doublons en attente de review
   */
  static async getPendingDuplicates(organizationId) {
    try {
      const q = query(
        collection(db, 'duplicates'),
        where('organizationId', '==', organizationId),
        where('status', '==', 'pending'),
        orderBy('score', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const duplicates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        success: true,
        data: duplicates
      };
      
    } catch (error) {
      console.error('Erreur récupération doublons:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Fusionner des structures
   */
  static async mergeStructures(principalId, toMergeIds, userId) {
    try {
      console.log(`🔀 Fusion structures: ${principalId} <- ${toMergeIds.join(', ')}`);
      
      // Récupérer la structure principale
      const principalResult = await structuresService.getStructure(principalId);
      if (!principalResult.success) {
        throw new Error('Structure principale non trouvée');
      }

      const batch = writeBatch(db);
      const mergedData = [];

      // Traiter chaque structure à fusionner
      for (const mergeId of toMergeIds) {
        const structureResult = await structuresService.getStructure(mergeId);
        if (!structureResult.success) continue;
        
        const structure = structureResult.data;
        
        // Transférer toutes les liaisons vers la structure principale
        const liaisonsQuery = query(
          collection(db, 'liaisons'),
          where('structureId', '==', mergeId)
        );
        const liaisonsSnapshot = await getDocs(liaisonsQuery);
        
        liaisonsSnapshot.docs.forEach(liaisonDoc => {
          batch.update(liaisonDoc.ref, {
            structureId: principalId,
            notes: `Fusionné depuis ${mergeId}`,
            updatedAt: serverTimestamp(),
            updatedBy: userId
          });
        });
        
        // Archiver la structure fusionnée
        const archiveRef = doc(collection(db, 'structures_archives'));
        batch.set(archiveRef, {
          ...structure,
          archivedAt: serverTimestamp(),
          archivedBy: userId,
          mergedInto: principalId,
          reason: 'merge'
        });
        
        // Supprimer l'ancienne structure
        batch.delete(doc(db, 'structures', mergeId));
        
        mergedData.push({
          id: mergeId,
          liaisonsMoved: liaisonsSnapshot.size
        });
      }

      // Exécuter toutes les opérations
      await batch.commit();
      
      console.log(`✅ Fusion terminée: ${mergedData.length} structures fusionnées`);
      return {
        success: true,
        principalId,
        merged: mergedData
      };
      
    } catch (error) {
      console.error('Erreur fusion structures:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fusionner des personnes
   */
  static async mergePersonnes(principalId, toMergeIds, userId) {
    try {
      console.log(`🔀 Fusion personnes: ${principalId} <- ${toMergeIds.join(', ')}`);
      
      // Utiliser la méthode du service personnes
      const results = [];
      for (const mergeId of toMergeIds) {
        const result = await personnesService.mergePersonnes(principalId, mergeId, userId);
        results.push(result);
      }
      
      return {
        success: true,
        principalId,
        merged: results
      };
      
    } catch (error) {
      console.error('Erreur fusion personnes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marquer des doublons comme "pas des doublons"
   */
  static async dismissDuplicates(duplicateId, userId) {
    try {
      const duplicateRef = doc(db, 'duplicates', duplicateId);
      await setDoc(duplicateRef, {
        status: 'dismissed',
        reviewedAt: serverTimestamp(),
        reviewedBy: userId
      }, { merge: true });
      
      return {
        success: true,
        id: duplicateId
      };
      
    } catch (error) {
      console.error('Erreur dismiss duplicates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Exécuter une détection complète des doublons
   */
  static async runFullDuplicateDetection(organizationId, userId) {
    try {
      console.log('🚀 Détection complète des doublons...');
      
      const results = {
        structures: await this.detectStructureDuplicates(organizationId),
        personnes: await this.detectPersonneDuplicates(organizationId)
      };
      
      // Sauvegarder tous les doublons trouvés
      const allDuplicates = [
        ...results.structures.duplicates,
        ...results.personnes.duplicates
      ];
      
      if (allDuplicates.length > 0) {
        await this.saveDuplicatesForReview(allDuplicates, organizationId, userId);
      }
      
      console.log(`✅ Détection terminée: ${allDuplicates.length} groupes de doublons`);
      return {
        success: true,
        stats: {
          structureDuplicates: results.structures.duplicates.length,
          personneDuplicates: results.personnes.duplicates.length,
          totalSaved: allDuplicates.length
        }
      };
      
    } catch (error) {
      console.error('Erreur détection complète:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default DuplicatesService;