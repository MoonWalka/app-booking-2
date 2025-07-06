import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from './OrganizationContext';
import { 
  encryptSensitiveFields, 
  decryptSensitiveFields,
  generateAuditHash 
} from '@/utils/cryptoUtils';

export const ParametresContext = createContext(null);

export const useParametres = () => {
  const context = useContext(ParametresContext);
  if (!context) {
    throw new Error('useParametres doit être utilisé à l\'intérieur d\'un ParametresProvider');
  }
  return context;
};

export const ParametresProvider = ({ children }) => {
  const { currentOrganization } = useOrganization();
  const [parametres, setParametres] = useState({
    entreprise: {},
    generaux: {
      langue: 'fr',
      formatDate: 'dd/mm/yyyy',
      nomApplication: 'TourCraft'
    },
    apparence: {
      theme: 'light',
      couleurPrincipale: '#2c3e50',
      taillePolicePx: 16,
      animations: true
    },
    notifications: {
      email: true,
      dates: true,
      contrats: true,
      artistes: true
    },
    export: {
      formatParDefaut: 'json',
      sauvegardeAuto: true,
      frequenceSauvegarde: 'daily'
    },
    tva: [
      { id: 1, libelle: 'Billetterie', taux: 2.1 },
      { id: 2, libelle: 'Réduit', taux: 5.5 },
      { id: 3, libelle: 'Normal', taux: 20 }
    ],
    unites: [
      { id: 1, nom: 'affiche', pluriel: 'affiches', categorie: 'quantite' },
      { id: 2, nom: 'atelier', pluriel: 'ateliers', categorie: 'service' },
      { id: 3, nom: 'heure', pluriel: 'heures', categorie: 'temps' },
      { id: 4, nom: 'jour', pluriel: 'jours', categorie: 'temps' },
      { id: 5, nom: 'km', pluriel: 'km', categorie: 'distance' },
      { id: 6, nom: 'nuit', pluriel: 'nuits', categorie: 'temps' },
      { id: 7, nom: 'personne', pluriel: 'personnes', categorie: 'quantite' },
      { id: 8, nom: 'repas', pluriel: 'repas', categorie: 'service' },
      { id: 9, nom: 'représentation', pluriel: 'représentations', categorie: 'service' },
      { id: 10, nom: 'forfait', pluriel: 'forfaits', categorie: 'service' }
    ],
    email: {
      provider: 'smtp', // 'smtp' ou 'brevo'
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        user: '',
        pass: '',
        from: '',
        fromName: ''
      },
      brevo: {
        enabled: false,
        apiKey: '',
        fromEmail: '',
        fromName: '',
        templates: {
          formulaire: '',
          relance: '',
          contrat: '',
          confirmation: ''
        }
      },
      templates: {
        useCustomTemplates: false,
        signatureName: '',
        footerText: ''
      }
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const chargerParametres = async () => {
      // Ne pas charger si aucune organisation n'est sélectionnée
      if (!currentOrganization?.id) {
        console.log('ℹ️ Aucune organisation sélectionnée, paramètres par défaut utilisés');
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Chargement paramètres pour organisation:', currentOrganization.id);
        
        // Charger depuis organizations/{id}/parametres/settings
        const parametresDoc = await getDoc(
          doc(db, 'organizations', currentOrganization.id, 'parametres', 'settings')
        );
        
        if (parametresDoc.exists()) {
          const parametresServeur = parametresDoc.data();
          
          // Fusion améliorée des paramètres avec gestion correcte des sous-objets
          setParametres(prev => {
            const newParams = { ...prev };
            
            // Parcourir toutes les sections
            Object.keys(parametresServeur).forEach(section => {
              if (typeof parametresServeur[section] === 'object' && parametresServeur[section] !== null) {
                let sectionData = parametresServeur[section];
                
                // Déchiffrer les données sensibles pour la section email
                if (section === 'email') {
                  sectionData = {
                    ...sectionData,
                    smtp: decryptSensitiveFields(sectionData.smtp || {}, ['pass', 'user']),
                    brevo: decryptSensitiveFields(sectionData.brevo || {}, ['apiKey'])
                  };
                }
                
                // Pour les sections TVA et unites, gérer la conversion objet->tableau si nécessaire
                if (section === 'tva' || section === 'unites') {
                  if (Array.isArray(sectionData)) {
                    // Si c'est déjà un tableau, l'utiliser directement
                    newParams[section] = sectionData;
                  } else if (typeof sectionData === 'object' && sectionData !== null) {
                    // Si c'est un objet, le convertir en tableau
                    console.warn(`⚠️ ${section} est stocké comme objet, conversion en tableau...`);
                    // Convertir l'objet en tableau en préservant les propriétés
                    newParams[section] = Object.keys(sectionData)
                      .filter(key => !isNaN(parseInt(key))) // Filtrer uniquement les clés numériques
                      .map(key => sectionData[key])
                      .filter(item => item && typeof item === 'object'); // S'assurer que chaque élément est valide
                  } else {
                    // Utiliser les valeurs par défaut si invalide
                    console.error(`❌ ${section} a un format invalide, utilisation des valeurs par défaut`);
                    // Garder les valeurs par défaut de newParams[section]
                  }
                } else {
                  // Fusionner la section avec les valeurs par défaut
                  newParams[section] = {
                    ...newParams[section],
                    ...sectionData
                  };
                }
              } else {
                // Pour les valeurs simples
                newParams[section] = parametresServeur[section];
              }
            });
            
            return newParams;
          });
          
          // Vérifier si une migration est nécessaire pour les données mal formatées
          const needsMigration = {
            tva: parametresServeur.tva && !Array.isArray(parametresServeur.tva),
            unites: parametresServeur.unites && !Array.isArray(parametresServeur.unites)
          };
          
          if (needsMigration.tva || needsMigration.unites) {
            console.warn('🔧 Migration nécessaire pour corriger le format des données');
            // La migration sera effectuée après le chargement complet via un effet séparé
            setParametres(prev => ({
              ...prev,
              _needsMigration: needsMigration
            }));
          }
          
          // Appliquer les paramètres d'apparence immédiatement au chargement
          if (parametresServeur.apparence) {
            if (parametresServeur.apparence.couleurPrincipale) {
              document.documentElement.style.setProperty('--tc-primary-color', parametresServeur.apparence.couleurPrincipale);
            }
            if (parametresServeur.apparence.taillePolicePx) {
              document.documentElement.style.setProperty('--tc-font-size-base', `${parametresServeur.apparence.taillePolicePx}px`);
            }
            if (parametresServeur.apparence.theme) {
              document.body.setAttribute('data-theme', parametresServeur.apparence.theme);
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    chargerParametres();
  }, [currentOrganization?.id]); // Recharger quand l'organisation change

  const sauvegarderParametres = useCallback(async (section, nouvellesValeurs) => {
    // Vérifier qu'une organisation est sélectionnée
    if (!currentOrganization?.id) {
      throw new Error('Aucune organisation sélectionnée. Impossible de sauvegarder les paramètres.');
    }

    try {
      console.log('💾 Sauvegarde paramètres pour organisation:', currentOrganization.id, 'section:', section);
      
      let valeursPourSauvegarde = nouvellesValeurs;
      
      // Pour les sections tva et unites, s'assurer que c'est un tableau
      if ((section === 'tva' || section === 'unites') && Array.isArray(nouvellesValeurs)) {
        valeursPourSauvegarde = nouvellesValeurs;
      }
      
      // Chiffrer les données sensibles avant sauvegarde
      if (section === 'email') {
        valeursPourSauvegarde = {
          ...nouvellesValeurs,
          smtp: encryptSensitiveFields(nouvellesValeurs.smtp || {}, ['pass', 'user']),
          brevo: encryptSensitiveFields(nouvellesValeurs.brevo || {}, ['apiKey'])
        };
        
        // Audit log pour les clés API (sans révéler la clé)
        if (nouvellesValeurs.brevo?.apiKey) {
          const auditHash = generateAuditHash(nouvellesValeurs.brevo.apiKey);
          console.info(`[AUDIT] Clé API Brevo mise à jour - Hash: ${auditHash}`);
        }
      }
      
      const parametresMisAJour = {
        ...parametres,
        [section]: (section === 'tva' || section === 'unites') && Array.isArray(valeursPourSauvegarde)
          ? valeursPourSauvegarde
          : {
              ...parametres[section],
              ...valeursPourSauvegarde
            }
      };

      // Sauvegarder dans organizations/{id}/parametres/settings
      await setDoc(
        doc(db, 'organizations', currentOrganization.id, 'parametres', 'settings'), 
        parametresMisAJour
      );
      
      // Mettre à jour l'état local avec les valeurs non chiffrées
      const parametresLocalMisAJour = {
        ...parametres,
        [section]: (section === 'tva' || section === 'unites') && Array.isArray(nouvellesValeurs)
          ? nouvellesValeurs
          : {
              ...parametres[section],
              ...nouvellesValeurs
            }
      };
      
      setParametres(parametresLocalMisAJour);
      return true;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      setError(err.message);
      return false;
    }
  }, [parametres, currentOrganization?.id]);

  // Effet séparé pour gérer la migration des données mal formatées
  useEffect(() => {
    const executerMigration = async () => {
      if (parametres._needsMigration && currentOrganization?.id && !loading) {
        console.log('🔄 Exécution de la migration automatique...');
        try {
          let migrationExecuted = false;
          
          if (parametres._needsMigration.tva && Array.isArray(parametres.tva)) {
            await sauvegarderParametres('tva', parametres.tva);
            migrationExecuted = true;
          }
          
          if (parametres._needsMigration.unites && Array.isArray(parametres.unites)) {
            await sauvegarderParametres('unites', parametres.unites);
            migrationExecuted = true;
          }
          
          if (migrationExecuted) {
            console.log('✅ Migration terminée avec succès');
            // Supprimer le flag de migration
            setParametres(prev => {
              const { _needsMigration, ...rest } = prev;
              return rest;
            });
          }
        } catch (err) {
          console.error('❌ Erreur lors de la migration:', err);
        }
      }
    };
    
    executerMigration();
  }, [parametres._needsMigration, currentOrganization?.id, loading, sauvegarderParametres, parametres.tva, parametres.unites]);

  const value = {
    parametres,
    loading,
    error,
    sauvegarderParametres
  };

  return (
    <ParametresContext.Provider value={value}>
      {children}
    </ParametresContext.Provider>
  );
};