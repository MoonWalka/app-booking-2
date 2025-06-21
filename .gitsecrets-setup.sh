#!/bin/bash
# Script pour configurer git-secrets sur ce projet

echo "🔒 Configuration de git-secrets pour la sécurité..."

# Installer les hooks
git secrets --install

# Ajouter les patterns pour différents types de clés/tokens
echo "📋 Ajout des patterns de détection..."

# Clés Google/Firebase API
git secrets --add 'AIza[0-9A-Za-z_-]{35}'

# Tokens OAuth Google
git secrets --add 'ya29\.[0-9A-Za-z\-_]+'

# Client IDs Google
git secrets --add '[0-9]+-[0-9A-Za-z_]{40}\.apps\.googleusercontent\.com'

# Clés OpenAI
git secrets --add 'sk-[a-zA-Z0-9]{48}'

# Clés AWS (patterns basiques pour éviter les conflits)
git secrets --add 'AKIA[0-9A-Z]{16}'

# Tokens GitHub
git secrets --add 'ghp_[A-Za-z0-9]{36}'
git secrets --add 'gho_[A-Za-z0-9]{36}'
git secrets --add 'ghu_[A-Za-z0-9]{36}'
git secrets --add 'ghs_[A-Za-z0-9]{36}'
git secrets --add 'ghr_[A-Za-z0-9]{36}'

# Clés Stripe
git secrets --add 'sk_live_[0-9a-zA-Z]{24}'
git secrets --add 'sk_test_[0-9a-zA-Z]{24}'

# Patterns génériques pour passwords/secrets
git secrets --add 'password\s*=\s*["\'][^"\']{8,}["\']'
git secrets --add 'secret\s*=\s*["\'][^"\']{8,}["\']'

echo "✅ Configuration terminée !"
echo ""
echo "ℹ️  Pour tester : essayez de commiter un fichier avec une clé API"
echo "ℹ️  Pour bypasser temporairement : git commit --no-verify"
echo "ℹ️  Pour scanner l'historique : git secrets --scan-history"
echo ""
echo "🛡️  Votre repo est maintenant protégé contre les commits de secrets !"