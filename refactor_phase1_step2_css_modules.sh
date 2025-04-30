#!/bin/bash
# Script pour initier la migration vers CSS Modules (macOS compatible sed)

# Utilisation du chemin relatif au lieu d'un chemin codé en dur
PROJECT_DIR="$(pwd)"
SRC_DIR="$PROJECT_DIR/src"

echo "Initiation de la migration vers CSS Modules..."

# Liste des composants cibles étendue
COMPONENTS=(
  # Concerts
  "components/concerts/ConcertDetails"
  "components/concerts/desktop/ConcertDetails"
  "components/concerts/mobile/ConcertDetails"
  # Lieux
  "components/lieux/LieuDetails"
  "components/lieux/desktop/LieuDetails"
  "components/lieux/mobile/LieuDetails"
  # Programmateurs
  "components/programmateurs/ProgrammateurDetails"
  "components/programmateurs/desktop/ProgrammateurDetails"
  "components/programmateurs/mobile/ProgrammateurDetails"
  # Artistes
  "components/artistes/ArtisteDetails"
  "components/artistes/desktop/ArtisteDetails"
  "components/artistes/mobile/ArtisteDetails"
  "components/artistes/ArtisteDetail"
  # Structures
  "components/structures/StructureDetails"
  "components/structures/desktop/StructureDetails"
  "components/structures/mobile/StructureDetails"
  # Formulaires associés
  "components/forms/ConcertForm"
  "components/forms/desktop/ConcertForm"
  "components/forms/mobile/ConcertForm"
)

for comp_path in "${COMPONENTS[@]}"; do
  js_file="$SRC_DIR/${comp_path}.js"
  css_file="$SRC_DIR/${comp_path}.css"
  module_css_file="$SRC_DIR/${comp_path}.module.css"
  comp_name=$(basename "$comp_path")

  echo "Traitement de $comp_name..."

  # 1. Renommer le fichier CSS s'il existe et n'est pas déjà un module
  if [ -f "$css_file" ] && [ ! -f "$module_css_file" ]; then
    echo "  Renommage de $css_file -> $module_css_file"
    mv "$css_file" "$module_css_file"
    css_file=$module_css_file # Mettre à jour le nom pour l'import
  elif [ -f "$module_css_file" ]; then
     echo "  INFO: Fichier $module_css_file existe déjà."
     css_file=$module_css_file # S'assurer qu'on utilise le bon nom pour l'import
  else
    echo "  INFO: Pas de fichier CSS trouvé pour $comp_name."
    continue # Passer au composant suivant si pas de CSS
  fi

  # 2. Mettre à jour l'import dans le fichier JS (tentative basique)
  if [ -f "$js_file" ]; then
    # Vérifier si l'import existe déjà
    if ! grep -q "import styles from " "$js_file"; then
       echo "  Ajout/Modification de l'import CSS dans $js_file"
       # Supprimer l'ancien import CSS direct (si présent)
       # Utilisation de sed compatible macOS (-i '')
       sed -i '' "s|import '.*${comp_name}.css';||g" "$js_file"
       sed -i '' "s|import '.*${comp_name}.module.css';||g" "$js_file" # Au cas où un import module existait sans 'styles'
       
       # Ajouter le nouvel import de module (après les imports existants)
       # Rechercher la dernière ligne d'import pour insérer après
       last_import_line=$(grep -n "^import " "$js_file" | tail -1 | cut -d':' -f1)
       if [ -n "$last_import_line" ]; then
         sed -i '' "${last_import_line}a\\
import styles from './${comp_name}.module.css';" "$js_file"
       else
         # Si aucun import n'est trouvé, ajouter au début du fichier
         sed -i '' "1s|^|import styles from './${comp_name}.module.css';\n|" "$js_file"
       fi
    else
        echo "  INFO: Import 'styles' déjà présent dans $js_file."
    fi
    
    # 3. Rechercher les className traditionnels et les marquer pour conversion manuelle
    if grep -q "className=\"" "$js_file"; then
      echo "  Marquage des className à convertir dans $js_file"
      # On crée un fichier temporaire avec des commentaires pour guider la conversion manuelle
      conversion_guide="$PROJECT_DIR/conversion_guides/${comp_path}_conversion.txt"
      mkdir -p "$(dirname "$conversion_guide")"
      
      echo "Conversion guide pour $js_file" > "$conversion_guide"
      echo "Voici les className traditionnels trouvés à convertir en CSS Modules:" >> "$conversion_guide"
      echo "-----------------------------------------------------" >> "$conversion_guide"
      grep -n "className=\"" "$js_file" | sed 's/^/Ligne /' >> "$conversion_guide"
      echo "-----------------------------------------------------" >> "$conversion_guide"
      echo "Pour chaque occurrence, convertir:" >> "$conversion_guide"
      echo "  className=\"ma-classe\"" >> "$conversion_guide"
      echo "en:" >> "$conversion_guide"
      echo "  className={styles['ma-classe']}" >> "$conversion_guide"
      echo "ou:" >> "$conversion_guide"
      echo "  className={styles.maClasse} (si le nom de classe est compatible avec la notation par point)" >> "$conversion_guide"
      
      echo "  Guide de conversion créé dans $conversion_guide"
    fi
  fi
done

echo ""
echo "Script terminé. Étapes manuelles requises:"
echo "1. Consultez les guides de conversion dans le dossier 'conversion_guides'"
echo "2. Vérifier/Ajuster les imports ajoutés."
echo "3. Adapter les sélecteurs dans les fichiers *.module.css."
echo "4. Remplacer className='...' par className={styles....} dans les fichiers JS."
echo "5. Pour les classes multiples, utiliser: className={\`\${styles.class1} \${styles.class2}\`}"
echo "6. Tester le rendu et le build."

