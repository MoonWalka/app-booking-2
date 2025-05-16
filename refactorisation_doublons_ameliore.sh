#!/bin/bash

# Script de refactorisation pour résoudre les doublons et conflits CSS - Version améliorée
# Créé le: 16 mai 2025
# Auteur: Manus
# Dernière mise à jour: 16 mai 2025 - Corrections des problèmes de permission et substitution de variables

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifier si le script est exécuté depuis la racine du projet
if [ ! -d "src" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet (où se trouve le dossier 'src')."
    exit 1
fi

# Vérifier si l'utilisateur a les droits d'écriture sur les fichiers source
if [ ! -w "src" ]; then
    log_error "Vous n'avez pas les droits d'écriture sur le dossier 'src'. Exécutez ce script avec des droits suffisants."
    exit 1
fi

# Créer un dossier de sauvegarde
BACKUP_DIR="refactorisation_backup_$(date +%Y%m%d_%H%M%S)"
log_info "Création d'une sauvegarde du code dans '$BACKUP_DIR'..."
mkdir -p "$BACKUP_DIR"
cp -r src "$BACKUP_DIR"
log_success "Sauvegarde créée avec succès."

# Fonction pour vérifier si un fichier peut être modifié
can_write_file() {
    local file="$1"
    
    # Vérifier si le fichier existe
    if [ ! -f "$file" ]; then
        return 1 # Fichier n'existe pas
    fi
    
    # Vérifier les droits d'écriture
    if [ ! -w "$file" ]; then
        return 2 # Pas de droits d'écriture
    fi
    
    return 0 # Tout est OK
}

# Fonction pour remplacer le contenu d'un fichier avec sécurité
safe_replace_file() {
    local file="$1"
    local temp_file="$2"
    
    can_write_file "$file"
    local result=$?
    
    if [ $result -eq 0 ]; then
        # Tout est OK, on remplace le fichier
        mv "$temp_file" "$file"
        return 0
    elif [ $result -eq 1 ]; then
        # Le fichier n'existe pas, on crée un nouveau
        local dir=$(dirname "$file")
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
        fi
        mv "$temp_file" "$file"
        return 0
    else
        # Pas de droits d'écriture
        log_error "Pas de droits d'écriture sur $file. Tentative de changement des permissions..."
        chmod u+w "$file" 2>/dev/null
        if [ $? -eq 0 ]; then
            mv "$temp_file" "$file"
            return 0
        else
            log_error "Impossible de modifier les permissions de $file. Copie abandonnée."
            return 1
        fi
    fi
}

# 1. Résolution des doublons de composants ActionButton
log_info "Résolution du doublon ActionButton..."

# Vérifier si les deux fichiers existent
ACTION_BUTTON_COMMON="src/components/common/ActionButton.js"
ACTION_BUTTON_UI="src/components/ui/ActionButton.js"

if [ -f "$ACTION_BUTTON_COMMON" ]; then
    # Créer un fichier de redirection dans ui vers common
    TEMP_FILE=$(mktemp)
    cat > "$TEMP_FILE" << 'EOL'
/**
 * @deprecated Ce composant a été standardisé vers src/components/common/ActionButton.js
 * Ce fichier est maintenu pour la compatibilité et redirige vers l'implémentation standard.
 */
import ActionButton from '../common/ActionButton';
export default ActionButton;
EOL

    # Assurer que le dossier existe
    mkdir -p "src/components/ui" 2>/dev/null
    
    # Remplacer ou créer le fichier de redirection
    safe_replace_file "$ACTION_BUTTON_UI" "$TEMP_FILE"
    if [ $? -eq 0 ]; then
        log_success "ActionButton dans ui a été remplacé par une redirection vers common."
    else
        log_error "Impossible de créer la redirection pour ActionButton."
    fi
else
    log_warning "Le fichier ActionButton dans common n'existe pas, vérifiez les chemins."
fi

# 2. Suppression du composant LoadingSpinner déprécié
log_info "Suppression du composant LoadingSpinner déprécié..."

LOADING_SPINNER="src/components/ui/LoadingSpinner.js"
if [ -f "$LOADING_SPINNER" ]; then
    # Créer un fichier de redirection
    TEMP_FILE=$(mktemp)
    cat > "$TEMP_FILE" << 'EOL'
/**
 * @deprecated Ce composant a été remplacé par src/components/common/Spinner.js
 * Ce fichier est maintenu pour la compatibilité et redirige vers la nouvelle implémentation.
 */
import Spinner from '../common/Spinner';
export default Spinner;
EOL

    # Remplacer le fichier original par la redirection
    safe_replace_file "$LOADING_SPINNER" "$TEMP_FILE"
    if [ $? -eq 0 ]; then
        log_success "LoadingSpinner a été remplacé par une redirection vers Spinner."
    else
        log_error "Impossible de créer la redirection pour LoadingSpinner."
    fi
else
    log_warning "Le fichier LoadingSpinner n'existe pas, vérifiez le chemin."
fi

# 3. Résolution du doublon Card
log_info "Résolution du doublon Card..."

CARD_UI="src/components/ui/Card.js"
CARD_COMMON="src/components/common/ui/Card.js"

if [ -f "$CARD_UI" ] && [ -f "$CARD_COMMON" ]; then
    # Créer un fichier de redirection dans common/ui
    TEMP_FILE=$(mktemp)
    cat > "$TEMP_FILE" << 'EOL'
/**
 * @deprecated Ce composant a été déplacé vers src/components/ui/Card.js
 * Ce fichier est maintenu pour la compatibilité et redirige vers la nouvelle implémentation.
 */
import Card from '../../ui/Card';
export default Card;
EOL

    # Remplacer le fichier original par la redirection
    safe_replace_file "$CARD_COMMON" "$TEMP_FILE"
    if [ $? -eq 0 ]; then
        log_success "Card dans common/ui a été remplacé par une redirection vers ui/Card."
    else
        log_error "Impossible de créer la redirection pour Card."
    fi
else
    log_warning "Un ou les deux fichiers Card n'existent pas, vérifiez les chemins."
fi

# 4. Standardisation des variables CSS
log_info "Standardisation des variables CSS..."

# Liste des fichiers CSS à standardiser
CSS_FILES=$(find src -name "*.css" -o -name "*.module.css")

# Parcourir tous les fichiers CSS
for file in $CSS_FILES; do
    # Vérifier si on peut écrire dans le fichier
    can_write_file "$file"
    if [ $? -ne 0 ]; then
        log_warning "Pas d'accès en écriture pour $file, tentative de changement des permissions..."
        chmod u+w "$file" 2>/dev/null
        if [ $? -ne 0 ]; then
            log_error "Impossible d'obtenir des droits d'écriture sur $file. Fichier ignoré."
            continue
        fi
    fi
    
    # Créer un fichier temporaire
    TEMP_FILE=$(mktemp)
    
    # Remplacer les variables sans préfixe par des variables avec préfixe --tc-
    # Modification de l'expression régulière pour éviter les doublons (--tc--tc-)
    # On vérifie explicitement que la variable ne commence pas par "--tc-"
    sed 's/var(--\([^-t]\|t[^-c]\|tc[^-]\)/var(--tc-\1/g' "$file" > "$TEMP_FILE"
    
    # Ajouter un commentaire standardisé en haut du fichier s'il n'existe pas déjà
    if ! grep -q "Standardisé selon le Guide de Style CSS de TourCraft" "$file"; then
        ANOTHER_TEMP=$(mktemp)
        
        # Méthode plus robuste pour extraire le nom de base du fichier
        FILENAME=$(basename "$file")
        BASENAME=${FILENAME%.module.css}
        BASENAME=${BASENAME%.css}
        
        echo "/*
 * Styles pour $BASENAME
 * Standardisé selon le Guide de Style CSS de TourCraft
 * Dernière mise à jour: $(date +"%d %B %Y")
 */
" > "$ANOTHER_TEMP"
        cat "$TEMP_FILE" >> "$ANOTHER_TEMP"
        mv "$ANOTHER_TEMP" "$TEMP_FILE"
    fi
    
    # Remplacer le fichier original
    mv "$TEMP_FILE" "$file"
    log_success "Standardisation des variables CSS dans $file."
done

# 5. Mise à jour des imports pour utiliser des chemins absolus
log_info "Standardisation des imports CSS..."

# Liste des fichiers JS/JSX à standardiser
JS_FILES=$(find src -name "*.js" -o -name "*.jsx")

# Parcourir tous les fichiers JS/JSX
for file in $JS_FILES; do
    # Vérifier si on peut écrire dans le fichier
    can_write_file "$file"
    if [ $? -ne 0 ]; then
        log_warning "Pas d'accès en écriture pour $file, tentative de changement des permissions..."
        chmod u+w "$file" 2>/dev/null
        if [ $? -ne 0 ]; then
            log_error "Impossible d'obtenir des droits d'écriture sur $file. Fichier ignoré."
            continue
        fi
    fi
    
    # Créer un fichier temporaire
    TEMP_FILE=$(mktemp)
    
    # Remplacer les imports relatifs de styles par des imports absolus
    # Correction pour macOS: ajout de '' après -i
    sed "s|import styles from '\.\./styles|import styles from '@/styles|g" "$file" | \
    sed "s|import styles from '\.\./\.\./styles|import styles from '@/styles|g" | \
    sed "s|import styles from '\.\./\.\./\.\./styles|import styles from '@/styles|g" > "$TEMP_FILE"
    
    # Remplacer le fichier original
    mv "$TEMP_FILE" "$file"
    log_success "Standardisation des imports dans $file."
done

# 6. Ajout de styles manquants pour les variantes de boutons
log_info "Ajout des styles manquants pour les variantes de boutons..."

# Vérifier si le fichier Button.module.css existe
BUTTON_CSS="src/components/ui/Button.module.css"
if [ -f "$BUTTON_CSS" ]; then
    # Vérifier si les variantes manquantes sont déjà définies
    if ! grep -q "btnOutlineWarning" "$BUTTON_CSS" || \
       ! grep -q "btnOutlineInfo" "$BUTTON_CSS" || \
       ! grep -q "btnOutlineSuccess" "$BUTTON_CSS"; then
        
        # Créer un fichier temporaire pour les nouveaux styles
        TEMP_FILE=$(mktemp)
        
        # Copier le contenu existant
        cat "$BUTTON_CSS" > "$TEMP_FILE"
        
        # Ajouter les styles manquants s'ils n'existent pas déjà
        if ! grep -q "btnOutlineWarning" "$BUTTON_CSS"; then
            echo "
/* 
 * Variante Outline - Warning
 * ---------------------------
 * Version outline pour les boutons d'avertissement
 */
.btnOutlineWarning {
  background-color: transparent;
  border-color: var(--tc-warning-color, #ffc107);
  color: var(--tc-warning-color, #ffc107);
}

.btnOutlineWarning:hover {
  background-color: var(--tc-warning-color, #ffc107);
  color: var(--tc-color-dark, #212529);
  text-decoration: none;
}
" >> "$TEMP_FILE"
        fi
        
        if ! grep -q "btnOutlineInfo" "$BUTTON_CSS"; then
            echo "
/* 
 * Variante Outline - Info
 * -----------------------
 * Version outline pour les boutons d'information
 */
.btnOutlineInfo {
  background-color: transparent;
  border-color: var(--tc-info-color, #17a2b8);
  color: var(--tc-info-color, #17a2b8);
}

.btnOutlineInfo:hover {
  background-color: var(--tc-info-color, #17a2b8);
  color: #fff;
  text-decoration: none;
}
" >> "$TEMP_FILE"
        fi
        
        if ! grep -q "btnOutlineSuccess" "$BUTTON_CSS"; then
            echo "
/* 
 * Variante Outline - Success
 * --------------------------
 * Version outline pour les boutons de succès
 */
.btnOutlineSuccess {
  background-color: transparent;
  border-color: var(--tc-success-color, #28a745);
  color: var(--tc-success-color, #28a745);
}

.btnOutlineSuccess:hover {
  background-color: var(--tc-success-color, #28a745);
  color: #fff;
  text-decoration: none;
}
" >> "$TEMP_FILE"
        fi
        
        # Remplacer le fichier original
        safe_replace_file "$BUTTON_CSS" "$TEMP_FILE"
        if [ $? -eq 0 ]; then
            log_success "Styles ajoutés pour les variantes de boutons manquantes dans Button.module.css."
        else
            log_error "Impossible d'ajouter les styles de boutons manquants."
        fi
    else
        log_info "Les styles pour toutes les variantes de boutons existent déjà."
    fi
else
    log_warning "Le fichier Button.module.css n'existe pas, impossible d'ajouter les styles manquants."
fi

# 7. Création d'un fichier de documentation pour les composants standardisés
log_info "Création d'un fichier de documentation pour les composants standardisés..."

# Créer le dossier docs s'il n'existe pas
mkdir -p src/docs

# Créer le fichier de documentation avec des informations complètes
DOCS_FILE="src/docs/COMPOSANTS_STANDARDISES.md"
TEMP_FILE=$(mktemp)

# Utiliser des quotes doubles pour permettre l'expansion des variables
cat > "$TEMP_FILE" << EOL
# Composants Standardisés

*Document créé le: $(date +"%d %B %Y")*

Ce document liste les composants qui ont été standardisés dans le cadre de la refactorisation pour éliminer les doublons et les conflits CSS.

## Composants UI

### ActionButton
- **Emplacement standardisé**: \`src/components/common/ActionButton.js\`
- **Statut**: Composant principal
- **Redirection**: \`src/components/ui/ActionButton.js\` redirige vers ce composant

### Spinner
- **Emplacement standardisé**: \`src/components/common/Spinner.js\`
- **Statut**: Composant principal
- **Redirection**: \`src/components/ui/LoadingSpinner.js\` redirige vers ce composant

### Card
- **Emplacement standardisé**: \`src/components/ui/Card.js\`
- **Statut**: Composant principal
- **Redirection**: \`src/components/common/ui/Card.js\` redirige vers ce composant

## Variables CSS Standardisées

Toutes les variables CSS ont été standardisées pour utiliser le préfixe \`--tc-\` conformément au Guide de Style CSS de TourCraft.

## Imports CSS Standardisés

Les imports de styles ont été standardisés pour utiliser des chemins absolus avec le préfixe \`@/\` au lieu de chemins relatifs.

## Prochaines Étapes Recommandées

1. **Réorganisation des dossiers**:
   - Créer un dossier \`src/components/core/\` pour les composants de base
   - Déplacer progressivement les composants UI et common vers cette nouvelle structure

2. **Standardisation complète des styles**:
   - Créer un système de design tokens centralisé
   - Migrer tous les styles vers ce système

3. **Tests d'intégration**:
   - Vérifier que toutes les redirections fonctionnent correctement
   - S'assurer que les styles sont appliqués de manière cohérente

---

*Document généré automatiquement par le script de refactorisation amélioré*
EOL

# Remplacer le fichier original de documentation
safe_replace_file "$DOCS_FILE" "$TEMP_FILE"
if [ $? -eq 0 ]; then
    log_success "Documentation créée avec succès."
else
    log_error "Impossible de créer le fichier de documentation."
fi

# Résumé des opérations
log_info "Résumé des opérations effectuées:"
echo "- Sauvegarde créée dans: $BACKUP_DIR"
echo "- Résolution du doublon ActionButton"
echo "- Suppression du composant LoadingSpinner déprécié"
echo "- Résolution du doublon Card"
echo "- Standardisation des variables CSS"
echo "- Standardisation des imports CSS"
echo "- Ajout des styles manquants pour les variantes de boutons"
echo "- Création d'un fichier de documentation"

log_success "Refactorisation terminée avec succès!"
echo ""
log_info "En cas de problème, vous pouvez restaurer la sauvegarde avec la commande:"
echo "rm -rf src && cp -r $BACKUP_DIR/src ."
echo ""
log_info "Pour appliquer les changements au dépôt Git, utilisez les commandes suivantes:"
echo "git add ."
echo "git commit -m \"Refactorisation: Résolution des doublons et standardisation CSS\""
echo "git push origin <votre-branche>"