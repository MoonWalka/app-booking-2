import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
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
      concerts: true,
      contrats: true,
      artistes: true
    },
    export: {
      formatParDefaut: 'json',
      sauvegardeAuto: true,
      frequenceSauvegarde: 'daily'
    },
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
      try {
        const parametresDoc = await getDoc(doc(db, 'parametres', 'global'));
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
                
                // Fusionner la section avec les valeurs par défaut
                newParams[section] = {
                  ...newParams[section],
                  ...sectionData
                };
              } else {
                // Pour les valeurs simples
                newParams[section] = parametresServeur[section];
              }
            });
            
            return newParams;
          });
          
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
  }, []);

  const sauvegarderParametres = useCallback(async (section, nouvellesValeurs) => {
    try {
      let valeursPourSauvegarde = nouvellesValeurs;
      
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
        [section]: {
          ...parametres[section],
          ...valeursPourSauvegarde
        }
      };

      await setDoc(doc(db, 'parametres', 'global'), parametresMisAJour);
      
      // Mettre à jour l'état local avec les valeurs non chiffrées
      const parametresLocalMisAJour = {
        ...parametres,
        [section]: {
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
  }, [parametres]);

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