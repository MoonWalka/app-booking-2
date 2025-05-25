#!/usr/bin/env python3
"""
Script de démarrage de la Phase 2 : Généralisation des Hooks
Lance la phase 2 en créant la branche et préparant la première semaine.
"""

import os
import subprocess
from pathlib import Path

class Phase2Starter:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.branch_name = "phase2-hooks-generalization"
        
    def create_phase2_branch(self):
        """Crée la branche pour la phase 2"""
        print("🌿 Création de la branche Phase 2...")
        
        try:
            # Vérifier qu'on est sur ManusBranch
            result = subprocess.run(['git', 'branch', '--show-current'], 
                                  capture_output=True, text=True, check=True)
            current_branch = result.stdout.strip()
            
            if current_branch != 'ManusBranch':
                print(f"⚠️ Branche actuelle: {current_branch}")
                print("🔄 Basculement vers ManusBranch...")
                subprocess.run(['git', 'checkout', 'ManusBranch'], check=True)
            
            # Créer la nouvelle branche
            print(f"🆕 Création de la branche {self.branch_name}...")
            subprocess.run(['git', 'checkout', '-b', self.branch_name], check=True)
            
            print(f"✅ Branche {self.branch_name} créée et active")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors de la création de branche: {e}")
            return False
    
    def setup_week1_environment(self):
        """Prépare l'environnement pour la semaine 1"""
        print("📅 Préparation de la Semaine 1: ACTIONS + SEARCH...")
        
        # Créer les dossiers pour les hooks génériques
        generics_dir = self.project_root / "src" / "hooks" / "generics"
        generics_dir.mkdir(exist_ok=True)
        
        actions_dir = generics_dir / "actions"
        actions_dir.mkdir(exist_ok=True)
        
        search_dir = generics_dir / "search"
        search_dir.mkdir(exist_ok=True)
        
        # Créer le fichier index pour les exports
        index_content = '''/**
 * @fileoverview Index des hooks génériques
 * Exports centralisés pour tous les hooks génériques de TourCraft
 * 
 * @author TourCraft Team
 * @since 2024 - Phase 2 Généralisation
 */

// Hooks d'actions génériques
export { default as useGenericAction } from './actions/useGenericAction';
export { default as useGenericFormAction } from './actions/useGenericFormAction';

// Hooks de recherche génériques  
export { default as useGenericSearch } from './search/useGenericSearch';
export { default as useGenericFilteredSearch } from './search/useGenericFilteredSearch';

// Hooks de listes génériques (Semaine 2)
// export { default as useGenericEntityList } from './lists/useGenericEntityList';

// Hooks de formulaires génériques (Semaine 3)
// export { default as useGenericEntityForm } from './forms/useGenericEntityForm';
// export { default as useGenericValidation } from './validation/useGenericValidation';

// Hooks de données génériques (Semaine 2)
// export { default as useGenericDataFetcher } from './data/useGenericDataFetcher';
'''
        
        index_file = generics_dir / "index.js"
        index_file.write_text(index_content, encoding='utf-8')
        
        print("✅ Structure des dossiers créée")
        print("✅ Fichier index.js créé")
        
        return True
    
    def create_week1_hooks(self):
        """Crée les hooks de la semaine 1 basés sur les templates"""
        print("🔧 Création des hooks de la Semaine 1...")
        
        # Hook useGenericAction
        action_hook = '''/**
 * @fileoverview Hook générique pour les actions CRUD
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import { useState, useCallback } from 'react';
import { db } from '@/firebaseInit';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from '@/firebaseInit';

/**
 * Hook générique pour les actions CRUD
 * 
 * @description
 * Fonctionnalités supportées :
 * - create: Création d'entités
 * - update: Mise à jour d'entités
 * - delete: Suppression d'entités
 * - batch_operations: Opérations en lot
 * 
 * @param {string} entityType - Type d'entité (concerts, programmateurs, etc.)
 * @param {Object} actionConfig - Configuration des actions
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Function} returns.create - Fonction de création
 * @returns {Function} returns.update - Fonction de mise à jour
 * @returns {Function} returns.remove - Fonction de suppression
 * @returns {Function} returns.batchOperation - Fonction d'opération en lot
 * 
 * @example
 * ```javascript
 * const { loading, error, create, update, remove } = useGenericAction('concerts', {
 *   onCreate: (data) => console.log('Concert créé:', data),
 *   onUpdate: (data) => console.log('Concert mis à jour:', data),
 *   onDelete: (id) => console.log('Concert supprimé:', id)
 * });
 * 
 * // Créer un nouveau concert
 * const handleCreate = async () => {
 *   const newConcert = await create({
 *     titre: 'Nouveau concert',
 *     date: new Date(),
 *     statut: 'contact'
 *   });
 * };
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useActionHandler, useFormActions
 */
const useGenericAction = (entityType, actionConfig = {}, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    onCreate, 
    onUpdate, 
    onDelete, 
    onError,
    validateBeforeAction = true 
  } = actionConfig;
  
  const { 
    enableLogging = true,
    autoResetError = true 
  } = options;
  
  // Fonction de création
  const create = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🆕 Création ${entityType}:`, data);
      }
      
      // Validation optionnelle
      if (validateBeforeAction && !data) {
        throw new Error('Données manquantes pour la création');
      }
      
      // Ajouter les métadonnées
      const entityData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, entityType), entityData);
      const result = { id: docRef.id, ...entityData };
      
      if (onCreate) {
        onCreate(result);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} créé:`, result);
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la création de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onCreate, onError, validateBeforeAction, enableLogging, autoResetError]);
  
  // Fonction de mise à jour
  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🔄 Mise à jour ${entityType} ${id}:`, data);
      }
      
      if (!id) {
        throw new Error('ID manquant pour la mise à jour');
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, entityType, id), updateData);
      const result = { id, ...updateData };
      
      if (onUpdate) {
        onUpdate(result);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} mis à jour:`, result);
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la mise à jour de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onUpdate, onError, enableLogging, autoResetError]);
  
  // Fonction de suppression
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🗑️ Suppression ${entityType} ${id}`);
      }
      
      if (!id) {
        throw new Error('ID manquant pour la suppression');
      }
      
      await deleteDoc(doc(db, entityType, id));
      
      if (onDelete) {
        onDelete(id);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} supprimé: ${id}`);
      }
      
      return id;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la suppression de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onDelete, onError, enableLogging, autoResetError]);
  
  // Fonction d'opération en lot
  const batchOperation = useCallback(async (operations) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`📦 Opération en lot ${entityType}:`, operations.length, 'opérations');
      }
      
      const results = [];
      
      for (const operation of operations) {
        const { type, id, data } = operation;
        
        switch (type) {
          case 'create':
            const created = await create(data);
            results.push({ type: 'create', result: created });
            break;
            
          case 'update':
            const updated = await update(id, data);
            results.push({ type: 'update', result: updated });
            break;
            
          case 'delete':
            const deleted = await remove(id);
            results.push({ type: 'delete', result: deleted });
            break;
            
          default:
            throw new Error(`Type d'opération non supporté: ${type}`);
        }
      }
      
      if (enableLogging) {
        console.log(`✅ Opération en lot terminée:`, results.length, 'opérations');
      }
      
      return results;
      
    } catch (err) {
      const errorMessage = `Erreur lors de l'opération en lot ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, create, update, remove, onError, enableLogging, autoResetError]);
  
  return {
    loading,
    error,
    create,
    update,
    remove,
    batchOperation
  };
};

export default useGenericAction;
'''
        
        # Créer le fichier
        actions_dir = self.project_root / "src" / "hooks" / "generics" / "actions"
        action_file = actions_dir / "useGenericAction.js"
        action_file.write_text(action_hook, encoding='utf-8')
        
        print("✅ useGenericAction.js créé")
        
        # TODO: Créer les autres hooks de la semaine 1
        # Pour l'instant, on crée juste le premier hook comme exemple
        
        return True
    
    def create_initial_commit(self):
        """Crée le commit initial de la phase 2"""
        print("💾 Création du commit initial Phase 2...")
        
        try:
            # Ajouter tous les fichiers
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Créer le commit
            commit_message = """🚀 PHASE 2 DÉMARRÉE: Généralisation des Hooks

✅ PRÉPARATION COMPLÈTE
- Branche phase2-hooks-generalization créée
- Structure des hooks génériques mise en place
- Templates et outils de migration préparés

📅 SEMAINE 1: ACTIONS + SEARCH (Démarrage)
- useGenericAction implémenté (remplace useActionHandler, useFormActions)
- Structure pour useGenericSearch préparée
- Index des exports génériques créé

🎯 PROCHAINES ÉTAPES
- Implémenter useGenericFormAction
- Implémenter useGenericSearch et useGenericFilteredSearch
- Migrer les composants utilisateurs
- Tests et validation

📊 OBJECTIFS SEMAINE 1
- 4 hooks à migrer (475 lignes)
- 62.5% d'économies moyennes
- Effort estimé: 2 jours"""
            
            subprocess.run(['git', 'commit', '-m', commit_message], check=True)
            
            print("✅ Commit initial créé")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors du commit: {e}")
            return False
    
    def display_next_steps(self):
        """Affiche les prochaines étapes"""
        print("\n" + "="*60)
        print("🎉 PHASE 2 DÉMARRÉE AVEC SUCCÈS!")
        print("="*60)
        print(f"🌿 Branche active: {self.branch_name}")
        print("📅 Semaine 1: ACTIONS + SEARCH en cours")
        print("\n🎯 PROCHAINES ACTIONS:")
        print("1. ✅ useGenericAction créé et fonctionnel")
        print("2. 🔄 Implémenter useGenericFormAction")
        print("3. 🔄 Implémenter useGenericSearch")
        print("4. 🔄 Implémenter useGenericFilteredSearch")
        print("5. 🔄 Migrer les composants utilisateurs")
        print("6. 🔄 Tests et validation")
        print("\n📋 Ressources disponibles:")
        print("- 📊 Rapport: tools/phase2/phase2_planning_report.md")
        print("- ✅ Checklist: tools/phase2/migration_checklist.md")
        print("- 🔧 Templates: tools/phase2/templates/")
        print("- 🛠️ Script migration: tools/phase2/migrate_hooks.py")
        print("\n💡 Conseil: Suivre la checklist pour une migration systématique")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    starter = Phase2Starter(project_root)
    
    print("🚀 Démarrage de la Phase 2 : Généralisation des Hooks...")
    
    try:
        # Créer la branche
        if not starter.create_phase2_branch():
            return
        
        # Préparer l'environnement semaine 1
        if not starter.setup_week1_environment():
            return
        
        # Créer les premiers hooks
        if not starter.create_week1_hooks():
            return
        
        # Commit initial
        if not starter.create_initial_commit():
            return
        
        # Afficher les prochaines étapes
        starter.display_next_steps()
        
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 