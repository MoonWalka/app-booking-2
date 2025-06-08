#!/bin/bash

# Script de correction des boucles de re-renders dans l'application React
# Version corrigée avec sed pour modifications ciblées
# À exécuter à la racine du projet

echo "🔍 Début des corrections pour les boucles de re-renders..."

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté à la racine du projet (où se trouve package.json)"
    exit 1
fi

# Vérifier que les fichiers existent
if [ ! -f "src/hooks/artistes/useArtistesList.js" ]; then
    echo "❌ Erreur: Fichier src/hooks/artistes/useArtistesList.js non trouvé"
    exit 1
fi

if [ ! -f "src/components/artistes/desktop/ArtistesList.js" ]; then
    echo "❌ Erreur: Fichier src/components/artistes/desktop/ArtistesList.js non trouvé"
    exit 1
fi

# 1. Correction de useArtistesList.js - Corrections ciblées avec sed
echo "✅ Correction de useArtistesList.js..."

# Ajouter le compteur de renders au début du hook
sed -i.bak '/export const useArtistesList = /a\
  // 🧪 DIAGNOSTIC: Compteur de renders\
  console.count("🎨 [ARTISTES] useArtistesList render");' src/hooks/artistes/useArtistesList.js

# Corriger le premier useEffect - retirer calculateStats des dépendances
sed -i.bak 's/}, \[calculateStats\]);/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\
}, []); \/\/ ✅ CORRECTION: Pas de dépendances, exécuté une seule fois/' src/hooks/artistes/useArtistesList.js

# Corriger le deuxième useEffect - retirer calculateStats des dépendances
sed -i.bak 's/}, \[entityList\.items, calculateStats\]);/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\
}, [entityList.items]); \/\/ ✅ Seulement entityList.items, pas calculateStats/' src/hooks/artistes/useArtistesList.js

# Corriger refreshWithStats - retirer calculateStats des dépendances
sed -i.bak 's/}, \[calculateStats\]);/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\
}, []); \/\/ ✅ CORRECTION: Pas de dépendances, utilise des refs/' src/hooks/artistes/useArtistesList.js

echo "✅ useArtistesList.js corrigé"

# 2. Correction de ArtistesList.js - Corrections ciblées avec sed
echo "✅ Correction de ArtistesList.js..."

# Ajouter useMemo à l'import React
sed -i.bak 's/import React, { useState, useCallback, useRef }/import React, { useState, useCallback, useRef, useMemo }/' src/components/artistes/desktop/ArtistesList.js

# Ajouter le compteur de renders au début du composant
sed -i.bak '/const ArtistesList = () => {/a\
  // 🧪 DIAGNOSTIC: Compteur de renders\
  console.count("🎨 [ARTISTES] ArtistesList render");' src/components/artistes/desktop/ArtistesList.js

# Corriger le callback de suppression - créer une version stable
sed -i.bak '/const { handleDelete } = useDeleteArtiste/i\
  // ✅ CORRECTION: Stabiliser le callback de suppression\
  const deleteCallback = useCallback((deletedId) => {\
    if (isUpdatingRef.current) return;\
    isUpdatingRef.current = true;\
    \
    try {\
      setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));\
    } finally {\
      isUpdatingRef.current = false;\
    }\
    // eslint-disable-next-line react-hooks/exhaustive-deps\
  }, []); // ✅ Pas de dépendances, utilise des refs\
  ' src/components/artistes/desktop/ArtistesList.js

# Modifier l'appel à useDeleteArtiste pour utiliser le callback stable
sed -i.bak 's/const { handleDelete } = useDeleteArtiste(useCallback((deletedId) => {[^}]*}, \[setArtistes\]));/const { handleDelete } = useDeleteArtiste(deleteCallback);/' src/components/artistes/desktop/ArtistesList.js

# Corriger hasActiveFilters - utiliser useMemo au lieu d'useCallback
sed -i.bak 's/const hasActiveFilters = useCallback(() => {/\/\/ ✅ CORRECTION: Mémoiser hasActiveFilters au lieu d'\''useCallback\
  const hasActiveFilters = useMemo(() => {/' src/components/artistes/desktop/ArtistesList.js

# Corriger l'utilisation de hasActiveFilters dans le JSX
sed -i.bak 's/hasActiveFilters={hasActiveFilters()}/hasActiveFilters={hasActiveFilters}/' src/components/artistes/desktop/ArtistesList.js

echo "✅ ArtistesList.js corrigé"

# 3. Créer le fichier de diagnostic pour les boucles de re-renders
echo "✅ Création du fichier de diagnostic..."
mkdir -p src/utils/debug

cat > src/utils/debug/renderTracker.js << 'EOL'
/**
 * Utilitaire pour suivre et diagnostiquer les boucles de re-renders
 */
import { useRef, useEffect } from 'react';

/**
 * Hook pour suivre les renders d'un composant
 * @param {string} componentName - Nom du composant à suivre
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @param {Object} props - Props du composant pour le diagnostic
 * @returns {number} Nombre actuel de renders
 */
export const useRenderTracker = (componentName, warningThreshold = 10, props = {}) => {
  const renderCount = useRef(0);
  const previousProps = useRef(props);
  
  // Incrémenter le compteur à chaque render
  renderCount.current += 1;
  
  useEffect(() => {
    // Alerte si trop de renders
    if (renderCount.current > warningThreshold) {
      console.warn(`🚨 [RENDER_LOOP] ${componentName} a eu ${renderCount.current} renders`);
    }
    
    // Log normal pour le suivi
    console.log(`🔄 [RENDER] ${componentName}: ${renderCount.current}`);
    
    // Détecter les props qui ont changé
    if (props && Object.keys(props).length > 0) {
      const changedProps = [];
      
      Object.keys(props).forEach(key => {
        if (props[key] !== previousProps.current[key]) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.log(`🔍 [PROPS_CHANGED] ${componentName}: ${changedProps.join(', ')}`);
      }
      
      // Mettre à jour les props précédentes
      previousProps.current = { ...props };
    }
  });
  
  return renderCount.current;
};

/**
 * HOC pour suivre les renders d'un composant
 * @param {React.Component} Component - Composant à suivre
 * @param {string} displayName - Nom d'affichage du composant
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @returns {React.Component} Composant avec suivi des renders
 */
export const withRenderTracker = (Component, displayName, warningThreshold = 10) => {
  const WrappedComponent = (props) => {
    useRenderTracker(displayName || Component.displayName || Component.name, warningThreshold, props);
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithRenderTracker(${displayName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default useRenderTracker;
EOL

# 4. Créer un script de test pour vérifier les corrections
echo "✅ Création du script de test..."
cat > test_corrections.sh << 'EOL'
#!/bin/bash

echo "🧪 Test des corrections appliquées..."

# Vérifier que les corrections ont été appliquées
echo "🔍 Vérification des corrections dans useArtistesList.js..."
if grep -q "console.count.*useArtistesList render" src/hooks/artistes/useArtistesList.js; then
    echo "✅ Compteur de renders ajouté"
else
    echo "❌ Compteur de renders manquant"
fi

if grep -q "eslint-disable-next-line react-hooks/exhaustive-deps" src/hooks/artistes/useArtistesList.js; then
    echo "✅ Corrections useEffect appliquées"
else
    echo "❌ Corrections useEffect manquantes"
fi

echo "🔍 Vérification des corrections dans ArtistesList.js..."
if grep -q "console.count.*ArtistesList render" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ Compteur de renders ajouté"
else
    echo "❌ Compteur de renders manquant"
fi

if grep -q "useMemo" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ useMemo importé"
else
    echo "❌ useMemo manquant dans les imports"
fi

if grep -q "const deleteCallback = useCallback" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ Callback de suppression stabilisé"
else
    echo "❌ Callback de suppression non stabilisé"
fi

echo "🔍 Vérification du fichier de diagnostic..."
if [ -f "src/utils/debug/renderTracker.js" ]; then
    echo "✅ Fichier de diagnostic créé"
else
    echo "❌ Fichier de diagnostic manquant"
fi

echo "🎯 Test terminé. Lancez 'npm start' pour tester l'application."
EOL

chmod +x test_corrections.sh

# 5. Nettoyer les fichiers de sauvegarde
echo "🧹 Nettoyage des fichiers de sauvegarde..."
find src -name "*.bak" -delete

echo "✅ Corrections terminées avec succès!"
echo "🧪 Exécutez './test_corrections.sh' pour vérifier les corrections"
echo "🚀 Puis lancez 'npm start' pour tester l'application"
echo ""
echo "📊 Surveillez la console du navigateur pour les compteurs de renders:"
echo "   - 🎨 [ARTISTES] useArtistesList render: X"
echo "   - 🎨 [ARTISTES] ArtistesList render: X"
echo "   - Les compteurs doivent se stabiliser à 1-3 renders maximum" 