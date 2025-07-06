#!/bin/bash

echo "=== ANALYSE DÉTAILLÉE DES PATTERNS 'CONCERT' ==="
echo ""

echo "1. COLLECTIONS FIREBASE"
echo "----------------------"
echo "References à collection('concerts'):"
grep -r "collection.*concerts" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "2. PROPRIÉTÉS D'OBJETS"
echo "---------------------"
echo "Patterns .concert (propriété):"
grep -r "\.concert[^s]" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""
echo "Patterns .concerts (propriété plurielle):"
grep -r "\.concerts" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "3. VARIABLES ET CONSTANTES"
echo "-------------------------"
echo "const/let/var concert ="
grep -rE "(const|let|var) concert[^s]* =" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""
echo "const/let/var concerts ="
grep -rE "(const|let|var) concerts =" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "4. PARAMÈTRES DE FONCTION"
echo "------------------------"
echo "Fonctions avec paramètre concert:"
grep -rE "\(.*concert[^s].*\)" src --include="*.js" --include="*.jsx" | grep -v node_modules | grep -E "function|=>" | wc -l
echo ""

echo "5. ROUTES ET NAVIGATION"
echo "----------------------"
echo "Routes /concert:"
grep -r "/concert" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "6. IDS ET RELATIONS"
echo "-------------------"
echo "concertId:"
grep -r "concertId" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""
echo "concertsIds:"
grep -r "concertsIds" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "7. IMPORTS/EXPORTS"
echo "-----------------"
echo "Imports contenant concert:"
grep -rE "import.*concert|from.*concert" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "8. COMMENTAIRES ET DOCUMENTATION"
echo "--------------------------------"
echo "Commentaires contenant concert:"
grep -rE "//.*concert|/\*.*concert|\* .*concert" src --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l
echo ""

echo "9. FICHIERS LES PLUS IMPACTÉS"
echo "-----------------------------"
echo "Top 10 fichiers avec le plus d'occurrences:"
grep -r "concert" src --include="*.js" --include="*.jsx" -c | grep -v node_modules | sort -t: -k2 -nr | head -10
echo ""

echo "10. CONTEXTE DES USAGES"
echo "----------------------"
echo "Exemples de 'concert' dans différents contextes:"
echo ""
echo "a) Dans les hooks:"
grep -r "concert" src/hooks --include="*.js" --include="*.jsx" | grep -v node_modules | head -5
echo ""
echo "b) Dans les services:"
grep -r "concert" src/services --include="*.js" --include="*.jsx" | grep -v node_modules | head -5
echo ""
echo "c) Dans les pages:"
grep -r "concert" src/pages --include="*.js" --include="*.jsx" | grep -v node_modules | head -5