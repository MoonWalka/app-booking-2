# Organisation de la Documentation

Suite à la réorganisation du 16 juillet 2025, voici la structure actuelle de la documentation :

## Structure des dossiers

### `/docs/audits/`
- **root-files/** : Fichiers d'audit provenant de la racine du projet
- Contient tous les audits du système, analyses de code et rapports forensiques

### `/docs/migration/`
- **root-files/** : Fichiers de migration provenant de la racine
- Plans et rapports de migration (concert→date, organisation→entreprise, etc.)
- Instructions et guides de migration

### `/docs/rapports/`
- **nettoyage/root-files/** : Rapports de nettoyage provenant de la racine
- **root-files/** : Autres rapports provenant de la racine
- Tous les rapports d'analyse, de performance et de validation

### `/docs/architecture/`
- Documentation de l'architecture V2
- Structure de l'application
- Décisions architecturales

### `/docs/bugs/`
- **corrections/** : Solutions aux bugs identifiés
- Diagnostics et résolutions de problèmes

### `/docs/plans/`
- Plans d'implémentation et de développement
- Stratégies et roadmaps

### `/docs/components/`
- Documentation des composants
- Guides d'utilisation

### `/docs/hooks/`
- Documentation des hooks personnalisés
- Guides d'utilisation et spécifications

### `/docs/css/`
- Architecture CSS
- Guides de standardisation
- Variables et thèmes

### `/docs/guides/`
- Guides pour l'équipe de développement
- Bonnes pratiques
- Troubleshooting

### `/docs/workflows/`
- Workflows de l'application
- Processus métier documentés

## Fichiers à la racine

Seulement 2 fichiers restent à la racine :
- **README.md** : Documentation principale du projet
- **CHANGELOG-CONTRATS-COMPATIBILITY.md** : Historique des changements

## Navigation

Pour trouver rapidement un document :
1. Les **audits** sont dans `/audits/`
2. Les **migrations** sont dans `/migration/`
3. Les **rapports** sont dans `/rapports/`
4. Les **guides pratiques** sont dans `/guides/`
5. La documentation **technique** est organisée par sujet (hooks, components, css, etc.)

---
*Organisation effectuée le 16 juillet 2025 pour améliorer la lisibilité et la maintenance de la documentation.*