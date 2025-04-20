import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ParametresContext = createContext();

export const useParametres = () => {
  const context = useContext(ParametresContext);
  if (!context) {
    throw new Error('useParametres doit être utilisé dans un ParametresProvider');
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
      couleurPrincipale: '#0d6efd',
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
          setParametres(prev => ({
            ...prev,
            ...parametresDoc.data()
          }));
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