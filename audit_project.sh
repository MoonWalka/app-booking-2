#!/usr/bin/env bash
# audit_project.sh — Audit complet du projet React/Firestore

set -euo pipefail
IFS=$'\n\t'

echo "=== 1. Git history pour les fichiers critiques ==="
git log -p -- src/firebaseInit.js \
          src/hooks/common/useGenericEntityDetails.js \
          src/components/programmateurs/ProgrammateurDetails.js || true

echo
echo "=== 2. Rechercher tout appel REST vers Firestore ==="
grep -R "firestore.googleapis.com" -n . || echo "Aucun appel REST trouvé"

echo
echo "=== 3. Vérifier les routes parent /* dans App.js ==="
grep -n 'path="[^\"]\+/\*"' src/App.js || echo "Routes parent sans /* : à corriger"

echo
echo "=== 4. Repérer les appels conditionnels à des hooks React ==="
# Rechercher un "if" contenant useXxx(
grep -R -nE 'if[[:space:]]*\([^)]*(use[A-Z]\w*)\(' src/pages src/components \
  || echo "Aucun appel conditionnel de hook détecté"

echo
echo "=== 5. Injection de console.log dans useFirestoreSubscription ==="
# Sauvegarde de sécurité
cp src/hooks/common/useFirestoreSubscription.js \
   src/hooks/common/useFirestoreSubscription.js.bak

# Ajout de logs au démarrage, à la réception et à l’erreur
# (déjà injecté manuellement précédemment)
echo "Injection déjà appliquée dans useFirestoreSubscription.js"

echo
echo "=== 6. Vérifier l’absence d’émulateur/firestore.settings() en prod ==="
grep -R "connectFirestoreEmulator" -n src \
  && echo "⚠️ connectFirestoreEmulator trouvé ! Vérifier usage conditionnel" \
  || echo "OK — pas de connectFirestoreEmulator"
grep -R "settings\s*\(" -n src \
  && echo "⚠️ firestore.settings() trouvé ! Vérifier environnement" \
  || echo "OK — pas de settings() custom"

echo
echo "=== 7. Proposition de sandbox CRA pour ProgrammateurDetails ==="
cat << 'EOF'
# Pour créer un mini-sandbox isolé :
npx create-react-app sandbox-programmateur --template cra-template-pwa
cd sandbox-programmateur
npm install firebase react-router-dom
# Copier src/components/programmateurs/ProgrammateurDetails.js et mockStorage.js
# Mettre en place un Provider minimal, importer useFirestoreSubscription et mocker Firestore
# Lancer : npm start
EOF

echo
echo "=== Audit terminé ==="