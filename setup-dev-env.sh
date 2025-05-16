#!/bin/bash

# Script de mise en place de l'environnement de développement pour TourCraft
# Ce script configure l'application pour fonctionner en mode développement local
# sans affecter l'environnement de production.

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages d'information
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Fonction pour afficher les messages de succès
success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérification des prérequis
check_prerequisites() {
    info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command_exists node; then
        error "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        warning "Version de Node.js détectée: $NODE_VERSION. La version recommandée est 18.x ou supérieure."
        read -p "Voulez-vous continuer quand même? (o/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Oo]$ ]]; then
            exit 1
        fi
    else
        success "Version de Node.js compatible détectée: $NODE_VERSION"
    fi
    
    # Vérifier npm
    if ! command_exists npm; then
        error "npm n'est pas installé. Veuillez l'installer avant de continuer."
        exit 1
    fi
    
    success "Tous les prérequis sont satisfaits."
}

# Fonction pour sauvegarder les fichiers de configuration existants
backup_config_files() {
    info "Sauvegarde des fichiers de configuration existants..."
    
    BACKUP_DIR="./config_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarder les fichiers .env s'ils existent
    if [ -f .env ]; then
        cp .env "$BACKUP_DIR/.env.backup"
    fi
    
    if [ -f .env.development ]; then
        cp .env.development "$BACKUP_DIR/.env.development.backup"
    fi
    
    if [ -f .env.production ]; then
        cp .env.production "$BACKUP_DIR/.env.production.backup"
    fi
    
    success "Sauvegarde effectuée dans le répertoire $BACKUP_DIR"
}

# Fonction pour configurer les fichiers d'environnement
setup_env_files() {
    info "Configuration des fichiers d'environnement..."
    
    # Créer ou mettre à jour .env.development pour le mode local
    cat > .env.development << EOL
# Configuration pour le mode développement hors ligne
REACT_APP_MODE=local
REACT_APP_BYPASS_AUTH=true
REACT_APP_USE_MOCK_DATA=true
REACT_APP_DEMO_DATA=true

# Variables Firebase non utilisées en mode local mais définies pour éviter des erreurs
REACT_APP_FIREBASE_API_KEY=dev-placeholder
REACT_APP_FIREBASE_AUTH_DOMAIN=dev-placeholder
REACT_APP_FIREBASE_PROJECT_ID=dev-placeholder
REACT_APP_FIREBASE_STORAGE_BUCKET=dev-placeholder
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=dev-placeholder
REACT_APP_FIREBASE_APP_ID=dev-placeholder
EOL
    
    # Créer un fichier .env qui pointe vers le mode développement
    cat > .env << EOL
# Fichier .env principal - pointe vers l'environnement de développement
# Pour passer en production, remplacer par .env.production
REACT_APP_MODE=local
REACT_APP_BYPASS_AUTH=true
REACT_APP_USE_MOCK_DATA=true
REACT_APP_DEMO_DATA=true
EOL
    
    success "Fichiers d'environnement configurés avec succès."
}

# Fonction pour mettre à jour le fichier package.json avec les scripts nécessaires
update_package_json() {
    info "Mise à jour des scripts dans package.json..."
    
    # Vérifier si jq est installé
    if ! command_exists jq; then
        warning "L'outil jq n'est pas installé. Mise à jour manuelle de package.json..."
        echo "Veuillez ajouter les scripts suivants à votre package.json:"
        echo "\"start:local\": \"env-cmd -f .env.development craco start\","
        echo "\"build:local\": \"env-cmd -f .env.development craco build\","
        echo "\"start:prod\": \"env-cmd -f .env.production craco start\","
        echo "\"build:prod\": \"env-cmd -f .env.production craco build\","
    else
        # Sauvegarder l'original
        cp package.json package.json.backup
        
        # Ajouter les scripts avec jq
        jq '.scripts += {
            "start:local": "env-cmd -f .env.development craco start",
            "build:local": "env-cmd -f .env.development craco build",
            "start:prod": "env-cmd -f .env.production craco start",
            "build:prod": "env-cmd -f .env.production craco build"
        }' package.json > package.json.tmp && mv package.json.tmp package.json
        
        success "Scripts ajoutés avec succès à package.json"
    fi
    
    # Installer env-cmd si nécessaire
    info "Installation du package env-cmd..."
    npm install --save-dev env-cmd
}

# Fonction pour corriger la syntaxe TypeScript dans firebaseInit.js
fix_firebase_init() {
    info "Vérification et correction de firebaseInit.js..."
    
    # Chemin du fichier
    FIREBASE_INIT="./src/firebaseInit.js"
    
    # Vérifier si le fichier contient la syntaxe TypeScript problématique
    if grep -q "as collection" "$FIREBASE_INIT"; then
        info "Correction de la syntaxe TypeScript dans firebaseInit.js..."
        
        # Sauvegarder l'original
        cp "$FIREBASE_INIT" "${FIREBASE_INIT}.backup"
        
        # Remplacer la section problématique
        sed -i '/\/\/ Export des éléments individuels/,/\/\/ Auth exports/c\
// Export des éléments individuels, conditionnés selon le mode\
// Définir les exports conditionnels\
const exportCollection = IS_LOCAL_MODE ? localDB.collection : collection;\
const exportDoc = IS_LOCAL_MODE ? localDB.doc : doc;\
const exportGetDoc = IS_LOCAL_MODE ? localDB.getDoc : enhancedGetDoc;\
const exportGetDocs = IS_LOCAL_MODE ? localDB.getDocs : enhancedGetDocs;\
const exportSetDoc = IS_LOCAL_MODE ? localDB.setDoc : setDoc;\
const exportAddDoc = IS_LOCAL_MODE ? localDB.addDoc : addDoc;\
const exportUpdateDoc = IS_LOCAL_MODE ? localDB.updateDoc : updateDoc;\
const exportDeleteDoc = IS_LOCAL_MODE ? localDB.deleteDoc : deleteDoc;\
const exportQuery = IS_LOCAL_MODE ? localDB.query : query;\
const exportWhere = IS_LOCAL_MODE ? localDB.where : where;\
const exportOrderBy = IS_LOCAL_MODE ? localDB.orderBy : orderBy;\
const exportLimit = IS_LOCAL_MODE ? localDB.limit : limit;\
const exportStartAfter = IS_LOCAL_MODE ? localDB.startAfter : startAfter;\
const exportServerTimestamp = IS_LOCAL_MODE ? localDB.serverTimestamp : serverTimestamp;\
const exportArrayUnion = IS_LOCAL_MODE ? localDB.arrayUnion : arrayUnion;\
const exportArrayRemove = IS_LOCAL_MODE ? localDB.arrayRemove : arrayRemove;\
const exportTimestamp = IS_LOCAL_MODE ? localDB.Timestamp : Timestamp;\
\
export {\
  db,\
  auth,\
  storage,\
  remoteConfig,\
  BYPASS_AUTH,\
  IS_LOCAL_MODE,\
  // Exporter les bonnes fonctions selon le mode\
  exportCollection as collection,\
  exportDoc as doc,\
  exportGetDoc as getDoc,\
  exportGetDocs as getDocs,\
  exportSetDoc as setDoc,\
  exportAddDoc as addDoc,\
  exportUpdateDoc as updateDoc,\
  exportDeleteDoc as deleteDoc,\
  exportQuery as query,\
  exportWhere as where,\
  exportOrderBy as orderBy,\
  exportLimit as limit,\
  exportStartAfter as startAfter,\
  exportServerTimestamp as serverTimestamp,\
  exportArrayUnion as arrayUnion,\
  exportArrayRemove as arrayRemove,\
  exportTimestamp as Timestamp,\
  // Auth exports' "$FIREBASE_INIT"
        
        success "Correction de firebaseInit.js effectuée avec succès."
    else
        success "Aucune correction nécessaire dans firebaseInit.js."
    fi
}

# Fonction pour créer un composant EnvironmentBanner
create_environment_banner() {
    info "Création du composant EnvironmentBanner..."
    
    # Créer le répertoire si nécessaire
    mkdir -p ./src/components/common
    
    # Créer le fichier du composant
    cat > ./src/components/common/EnvironmentBanner.js << EOL
import React from 'react';
import { CURRENT_MODE } from '../../firebaseInit';
import './EnvironmentBanner.css';

/**
 * Composant qui affiche une bannière indiquant l'environnement actuel
 * Ne s'affiche pas en production
 */
const EnvironmentBanner = () => {
  if (CURRENT_MODE === 'production') return null;
  
  const bannerText = CURRENT_MODE === 'local' ? 
    '🔌 MODE HORS LIGNE' : 
    '🧪 ENVIRONNEMENT DE DÉVELOPPEMENT';
    
  return (
    <div className={\`environment-banner environment-\${CURRENT_MODE}\`}>
      {bannerText}
    </div>
  );
};

export default EnvironmentBanner;
EOL
    
    # Créer le fichier CSS associé
    cat > ./src/components/common/EnvironmentBanner.css << EOL
.environment-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  z-index: 9999;
  font-size: 14px;
}

.environment-local {
  background-color: #ff9800;
  color: #000;
}

.environment-development {
  background-color: #2196f3;
  color: #fff;
}
EOL
    
    success "Composant EnvironmentBanner créé avec succès."
    
    # Vérifier si App.js existe pour suggérer l'intégration
    if [ -f ./src/App.js ]; then
        info "Pour intégrer la bannière, ajoutez le composant dans App.js:"
        echo "import EnvironmentBanner from './components/common/EnvironmentBanner';"
        echo "// Et ajoutez <EnvironmentBanner /> à la fin du JSX de retour"
    fi
}

# Fonction pour installer les dépendances
install_dependencies() {
    info "Installation des dépendances..."
    npm install
    success "Dépendances installées avec succès."
}

# Fonction principale
main() {
    echo "========================================================"
    echo "  Configuration de l'environnement de développement"
    echo "  pour l'application TourCraft"
    echo "========================================================"
    echo
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Sauvegarder les fichiers de configuration
    backup_config_files
    
    # Configurer les fichiers d'environnement
    setup_env_files
    
    # Mettre à jour package.json
    update_package_json
    
    # Corriger firebaseInit.js
    fix_firebase_init
    
    # Créer le composant EnvironmentBanner
    create_environment_banner
    
    # Installer les dépendances
    install_dependencies
    
    echo
    echo "========================================================"
    success "Configuration de l'environnement de développement terminée!"
    echo "========================================================"
    echo
    info "Pour démarrer l'application en mode développement local:"
    echo "  npm run start:local"
    echo
    info "Pour construire l'application en mode développement local:"
    echo "  npm run build:local"
    echo
    warning "N'oubliez pas que ce mode est complètement isolé de la production."
    echo "Aucune donnée réelle ne sera affectée."
    echo
}

# Exécuter la fonction principale
main
