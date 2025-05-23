#!/bin/bash

# Script de correction du mode développement
# À exécuter à la racine du projet

echo "Correction du mode développement pour TourCraft (Version macOS)"
echo "================================================"

# 1. Sauvegarde des fichiers originaux
echo "Création d'une sauvegarde..."
BACKUP_DIR="./dev_mode_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r ./src $BACKUP_DIR/
echo "Sauvegarde créée dans $BACKUP_DIR"

# 2. Correction des imports directs Firebase
echo "Correction des imports directs Firebase..."
FILES_WITH_IMPORTS=$(grep -l "import.*from 'firebase/firestore'" --include="*.js" -r ./src)

for FILE in $FILES_WITH_IMPORTS; do
  echo "Traitement de $FILE"
  
  # Vérifier si le fichier importe déjà depuis firebaseInit
  if grep -q "import.*from '@/firebaseInit'" $FILE; then
    # Ajouter les imports manquants à l'import existant
    CURRENT_IMPORTS=$(grep "import.*from '@/firebaseInit'" $FILE | sed -E 's/import \{(.*)\} from.*/\1/')
    FIREBASE_IMPORTS=$(grep "import.*from 'firebase/firestore'" $FILE | sed -E 's/import \{(.*)\} from.*/\1/')
    
    # Adapter pour macOS - créer un fichier temporaire
    sed -E "s/import \{ $CURRENT_IMPORTS \} from '@\/firebaseInit'/import { $CURRENT_IMPORTS, $FIREBASE_IMPORTS } from '@\/firebaseInit'/" "$FILE" > "$FILE.tmp"
    mv "$FILE.tmp" "$FILE"
    
    # Supprimer l'import Firebase direct - adapter pour macOS
    grep -v "import.*from 'firebase/firestore'" "$FILE" > "$FILE.tmp"
    mv "$FILE.tmp" "$FILE"
  else
    # Remplacer l'import direct par un import depuis firebaseInit - adapter pour macOS
    sed -E "s/import \{(.*)\} from 'firebase\/firestore'/import { \1 } from '@\/firebaseInit'/" "$FILE" > "$FILE.tmp"
    mv "$FILE.tmp" "$FILE"
  fi
done

# 3. Amélioration de l'implémentation des mocks
echo "Amélioration de l'implémentation des mocks..."
# Créer un fichier de patch pour firebaseInit.js
cat > ./firebase_init_patch.js << 'EOL'
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
EOL

# 4. Initialisation automatique des données de démonstration
echo "Ajout de l'initialisation automatique des données de démonstration..."
# Créer un patch pour mockStorage.js
cat > ./mock_storage_patch.js << 'EOL'
// Ajouter à la fin du fichier mockStorage.js
// Initialiser automatiquement les données de démonstration en mode local
if (process.env.REACT_APP_MODE === 'local' || process.env.NODE_ENV === 'development') {
  console.log('Mode développement détecté - Initialisation des données de démonstration');
  // Vérifier si des données existent déjà
  const hasData = Object.values(localData).some(collection => Object.keys(collection).length > 0);
  if (!hasData) {
    seedLocalData(true);
  }
}
EOL

echo "================================================"
echo "Corrections terminées !"
echo ""
echo "Actions manuelles requises :"
echo "1. Vérifier et appliquer le patch firebase_init_patch.js dans src/firebaseInit.js"
echo "2. Vérifier et appliquer le patch mock_storage_patch.js dans src/mockStorage.js"
echo "3. Tester l'application en mode développement sans connexion internet"
echo ""
echo "Pour restaurer la version originale :"
echo "cp -r $BACKUP_DIR/src ."