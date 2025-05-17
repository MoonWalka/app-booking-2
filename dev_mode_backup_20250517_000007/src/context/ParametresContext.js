import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from '@/firebaseInit';
import { db } from '@/firebaseInit';

const ParametresContext = createContext();

export const useParametres = () => {
  const context = useContext(ParametresContext);
  if (!context) {
    throw new Error('useParametres doit être utilisé dans un ParametresProvider');
  }
  return context;
};

export const ParametresProvider = ({ children }) => {
  console.log('[TRACE-UNIQUE][ParametresProvider] Provider exécuté !');
  
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
                // Fusionner la section avec les valeurs par défaut
                newParams[section] = {
                  ...newParams[section],
                  ...parametresServeur[section]
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

  const sauvegarderParametres = async (section, nouvellesValeurs) => {
    try {
      const parametresMisAJour = {
        ...parametres,
        [section]: {
          ...parametres[section],
          ...nouvellesValeurs
        }
      };

      await setDoc(doc(db, 'parametres', 'global'), parametresMisAJour);
      setParametres(parametresMisAJour);
      return true;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      setError(err.message);
      return false;
    }
  };

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