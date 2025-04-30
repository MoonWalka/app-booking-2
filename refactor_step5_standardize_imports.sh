#!/bin/bash
# Étape 5: Standardisation des imports (chemins relatifs/absolus)

# Définir le répertoire racine du projet
PROJECT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"
SRC_DIR="$PROJECT_DIR/src"

echo "Standardisation des imports vers des chemins basés sur les alias définis dans jsconfig.json..."

# Définir les correspondances alias -> chemin relatif de base pour la recherche
# (Basé sur jsconfig.json)
ALIASES=(
  "@components/:src/components/"
  "@hooks/:src/hooks/"
  "@context/:src/context/"
  "@utils/:src/utils/"
  "@styles/:src/styles/"
  "@services/:src/services/"
  "@pages/:src/pages/"
  "@/:src/"
)

# Parcourir tous les fichiers JS dans src
find "$SRC_DIR" -type f -name "*.js" | while read -r file; do
  echo "Traitement de $file..."

  # Flag pour savoir si le fichier a été modifié
  modified=false

  # Lire chaque ligne du fichier
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Chercher les lignes d'importation avec des chemins relatifs commençant par ../
    if [[ "$line" == *"import"* && "$line" == *"from"* && "$line" == *"'../"* ]]; then
      # Extraire le chemin relatif
      relative_path=$(echo "$line" | sed -n "s/.*from '\([^']*.js\)'.*/\1/p")
      if [ -z "$relative_path" ]; then
         relative_path=$(echo "$line" | sed -n "s/.*from '\([^']*\)'.*/\1/p")
      fi
      
      # Ignorer les imports firebase
      if [[ "$relative_path" == *"firebase"* ]]; then
        echo "  Ignoré (Firebase): $line"
        echo "$line" >> "$file.tmp"
        continue
      fi

      if [ -n "$relative_path" ]; then
        # Obtenir le chemin absolu du fichier importé
        current_dir=$(dirname "$file")
        absolute_path=$(realpath --canonicalize-missing "$current_dir/$relative_path")
        
        # Trouver le meilleur alias correspondant
        best_alias=""
        longest_match=0
        
        for alias_map in "${ALIASES[@]}"; do
          alias_prefix=$(echo "$alias_map" | cut -d':' -f1)
          base_path_rel=$(echo "$alias_map" | cut -d':' -f2)
          base_path_abs="$PROJECT_DIR/$base_path_rel"
          
          # Vérifier si le chemin absolu commence par le chemin de base de l'alias
          if [[ "$absolute_path" == "$base_path_abs"* ]]; then
            # Vérifier si c'est une correspondance plus longue
            if [ ${#base_path_abs} -gt $longest_match ]; then
              longest_match=${#base_path_abs}
              # Construire le chemin avec alias
              path_suffix=${absolute_path#$base_path_abs}
              best_alias="${alias_prefix}${path_suffix}"
              # Supprimer l'extension .js si présente dans le chemin aliasé
              best_alias=${best_alias%.js}
            fi
          fi
        done
        
        # Si un alias a été trouvé, remplacer le chemin relatif
        if [ -n "$best_alias" ]; then
          new_line=$(echo "$line" | sed "s|'\([^']*.js\)'|'$best_alias'|" | sed "s|'\([^']*.\)'|'$best_alias'|")
          echo "  Remplacé: '$relative_path' -> '$best_alias'"
          echo "$new_line" >> "$file.tmp"
          modified=true
        else
          echo "  Aucun alias trouvé pour: $relative_path"
          echo "$line" >> "$file.tmp"
        fi
      else
        echo "$line" >> "$file.tmp"
      fi
    else
      # Copier les lignes non modifiées
      echo "$line" >> "$file.tmp"
    fi
  done < "$file.bak"

  # Remplacer l'ancien fichier par le nouveau si modifié
  if [ "$modified" = true ]; then
    mv "$file.tmp" "$file"
    echo "  Fichier mis à jour: $file"
  else
    rm "$file.tmp"
  fi
done

echo ""
echo "Étape 5 (Standardisation Imports) terminée."
echo "NOTE: Ce script a tenté de remplacer les imports relatifs commençant par '../' par des imports basés sur les alias."
echo "Les imports Firebase ont été ignorés."
echo "Une vérification manuelle est recommandée pour s'assurer de l'exactitude des remplacements."

