// Remplacer la ligne simple du mock onSnapshot par cette implémentation
onSnapshot: IS_LOCAL_MODE ? 
  (docRef, callback) => {
    console.log('Mock onSnapshot appelé pour', docRef);
    // Extraire le chemin et l'ID du document
    const path = typeof docRef.path === 'string' ? docRef.path : '';
    const pathParts = path.split('/');
    const collectionName = pathParts.length > 0 ? pathParts[0] : '';
    const docId = pathParts.length > 1 ? pathParts[1] : '';
    
    // Récupérer les données mockées
    setTimeout(() => {
      try {
        if (localDB && typeof localDB.getDoc === 'function') {
          const mockDoc = localDB.doc(collectionName, docId);
          localDB.getDoc(mockDoc).then(snapshot => {
            callback(snapshot);
          });
        } else {
          // Fallback si localDB n'est pas disponible
          callback({
            exists: () => false,
            data: () => null,
            id: docId
          });
        }
      } catch (e) {
        console.error('Erreur dans mock onSnapshot:', e);
        callback({
          exists: () => false,
          data: () => null,
          id: docId
        });
      }
    }, 100);
    
    // Retourner une fonction de nettoyage
    return () => console.log('Mock onSnapshot unsubscribe');
  } : 
  onSnapshot,
