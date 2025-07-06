#!/bin/bash

echo "=== MIGRATION CONCERTS → DATES ==="
echo "Ce script va migrer toutes les références 'concert' vers 'date' dans le code"
echo ""

# Fonction pour faire un backup
backup_files() {
    echo "📁 Création d'un backup..."
    cp -r src src_backup_$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup créé"
}

# Demander confirmation
read -p "Voulez-vous créer un backup avant de commencer ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    backup_files
fi

echo ""
echo "🔄 Début de la migration..."
echo ""

# 1. COLLECTIONS FIREBASE
echo "1️⃣ Migration des collections Firebase..."
find src -name "*.js" -exec sed -i '' "s/collection(db, 'concerts')/collection(db, 'dates')/g" {} +
find src -name "*.js" -exec sed -i '' "s/collection('concerts')/collection('dates')/g" {} +
echo "✅ Collections migrées"

# 2. VARIABLES concertId → dateId
echo ""
echo "2️⃣ Migration concertId → dateId..."
find src -name "*.js" -exec sed -i '' "s/concertId/dateId/g" {} +
echo "✅ concertId migré"

# 3. VARIABLES concertTitle → dateTitle
echo ""
echo "3️⃣ Migration concertTitle → dateTitle..."
find src -name "*.js" -exec sed -i '' "s/concertTitle/dateTitle/g" {} +
echo "✅ concertTitle migré"

# 4. VARIABLES concertDate → dateDate (attention aux doublons)
echo ""
echo "4️⃣ Migration concertDate → dateOfEvent..."
find src -name "*.js" -exec sed -i '' "s/concertDate/dateOfEvent/g" {} +
echo "✅ concertDate migré"

# 5. FONCTIONS openConcertTab → openDateTab
echo ""
echo "5️⃣ Migration openConcertTab → openDateTab..."
find src -name "*.js" -exec sed -i '' "s/openConcertTab/openDateTab/g" {} +
echo "✅ openConcertTab migré"

# 6. VARIABLES concert. → date. (dans les map, filter, etc)
echo ""
echo "6️⃣ Migration concert.* → date.* dans les fonctions..."
find src -name "*.js" -exec sed -i '' "s/concert\./date\./g" {} +
echo "✅ concert.* migré"

# 7. PARAMETRES (concert) → (date)
echo ""
echo "7️⃣ Migration des paramètres de fonction..."
find src -name "*.js" -exec sed -i '' "s/(concert)/(date)/g" {} +
find src -name "*.js" -exec sed -i '' "s/, concert)/, date)/g" {} +
find src -name "*.js" -exec sed -i '' "s/(concert,/(date,/g" {} +
echo "✅ Paramètres migrés"

# 8. CHAMPS DE FORMULAIRE
echo ""
echo "8️⃣ Migration des champs de formulaire..."
find src -name "*.js" -exec sed -i '' "s/formData\.concert/formData\.date/g" {} +
find src -name "*.js" -exec sed -i '' "s/setFormData.*concert/setFormData.*date/g" {} +
echo "✅ Champs de formulaire migrés"

echo ""
echo "🎯 Migration terminée !"
echo ""
echo "⚠️  IMPORTANT :"
echo "1. Vérifiez que le build fonctionne : npm run build"
echo "2. Testez l'application"
echo "3. Commitez les changements si tout est OK"
echo ""
echo "Si problème, restaurez depuis le backup : src_backup_*"