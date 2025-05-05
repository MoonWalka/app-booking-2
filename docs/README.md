# Documentation TourCraft

*Document mis à jour le: 5 mai 2025*

Ce dossier contient toute la documentation technique du projet TourCraft. Ce fichier README sert d'index central pour naviguer efficacement dans la documentation disponible.

## 🔄 État des Migrations et Refactorisations

- [📊 **État Consolidé des Migrations et Refactorisations**](/docs/migration/ETAT_MIGRATION_CONSOLIDATION.md) - Vision globale et centralisée de l'avancement de tous les chantiers de refactorisation en cours
- [📋 **Audit Global de la Documentation**](/docs/analyses/AUDIT_GLOBAL_DOCUMENTATION.md) - Analyse des incohérences et plan de consolidation de la documentation

## 🏗️ Architecture & Structure

- [🔍 **Architecture**](/docs/architecture/ARCHITECTURE_LEGACY.md) - Architecture globale du projet et principes techniques
- [📐 **Guide d'Architecture**](/docs/architecture/GUIDE_ARCHITECTURE.md) - Guide détaillé de l'architecture du projet
- [📐 **Refactoring Structure**](/docs/architecture/REFACTORING_STRUCTURE.md) - Plan de refactorisation de la structure du projet

## 🎨 CSS & Design

- [📝 **Guide de Style CSS**](/docs/standards/CSS_STYLE_GUIDE.md) - Standards et conventions CSS
- [📋 **Plan de Refactorisation CSS**](/docs/css/PLAN_REFACTORISATION_CSS_PROGRESSIF.md) - Plan de refactorisation progressive du CSS
- [📑 **Résumé de la Refactorisation CSS**](/docs/css/RESUME_REFACTORISATION_CSS.md) - Résumé des travaux de refactorisation CSS effectués
- [📊 **Rapport d'audit CSS**](/docs/analyses/css_audit_report.md) - Résultats de l'audit des styles CSS
- [📊 **Rapport d'audit CSS global**](/docs/analyses/global_css_audit_report.md) - Résultats de l'audit global des styles CSS

## 🧩 Composants

- [📚 **Guide des Composants Génériques**](/docs/components/GUIDE_COMPOSANTS_GENERIQUES.md) - Guide d'utilisation des composants génériques
- [📝 **Plan de Refactorisation des Composants**](/docs/components/PLAN_REFACTORISATION_COMPOSANTS.md) - Plan de refactorisation des composants
- [📋 **Exemple de Composant Générique**](/docs/components/EXEMPLE_COMPOSANT_GENERIQUE.md) - Exemple détaillé d'implémentation d'un composant générique
- [📝 **Concert Refactoring**](/docs/components/CONCERT_REFACTORING.md) - Plan de refactorisation des composants de concert

### Types de Composants

- [📑 **Composants Communs**](/docs/components/COMMON_COMPONENTS.md) - Documentation des composants communs
- [📑 **Composants de Formulaire**](/docs/components/FORM_COMPONENTS.md) - Documentation des composants de formulaire
- [📑 **Composants de Mise en Page**](/docs/components/LAYOUT_COMPONENTS.md) - Documentation des composants de mise en page
- [📑 **Composants PDF**](/docs/components/PDF_COMPONENTS.md) - Documentation des composants d'export PDF
- [📑 **Composants UI**](/docs/components/UI_COMPONENTS.md) - Documentation des composants d'interface utilisateur

## 🪝 Hooks

- [📚 **Guide des Hooks**](/docs/hooks/HOOKS.md) - Guide général d'utilisation des hooks
- [📝 **Plan de Migration des Hooks Génériques**](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md) - **[ARCHIVÉ]** Plan de migration vers des hooks génériques (voir la [version archivée complète](/docs/archive/PLAN_MIGRATION_HOOKS_GENERIQUES_ARCHIVE.md))
- [📋 **Journal de Migration des Hooks**](/docs/hooks/JOURNAL_MIGRATION_HOOKS.md) - Journal détaillé de la migration des hooks
- [📐 **Plan de Restructuration des Hooks**](/docs/hooks/PLAN_RESTRUCTURATION_HOOKS.md) - Plan de restructuration du dossier hooks

### Hooks Spécifiques

- [📑 **Hooks Communs**](/docs/hooks/COMMON_HOOKS.md) - Documentation des hooks communs et utilitaires
- [📑 **Hooks Artiste**](/docs/hooks/ARTISTE_HOOKS.md) - Documentation des hooks liés aux artistes
- [📑 **Hooks Concert**](/docs/hooks/CONCERT_HOOKS.md) - Documentation des hooks liés aux concerts
- [📑 **Hooks Contrat**](/docs/hooks/CONTRAT_HOOKS.md) - Documentation des hooks liés aux contrats

## 🔥 Migration Firebase

- [📝 **Plan de Migration Firebase**](/docs/migration/PLAN_MIGRATION_FIREBASE.md) - Plan de migration vers la nouvelle structure Firebase

## 🧪 Tests

- [📋 **Plan de Tests des Hooks Génériques**](/docs/hooks/PLAN_TESTS_GENERIC_ENTITY_LIST.md) - Plan de tests pour les hooks génériques

## 📊 Analyses & Audits

- [📊 **Analyse des Dépendances**](/docs/analyses/ANALYSE_DEPENDANCES.md) - Analyse des dépendances du projet
- [📊 **Analyses & Audits**](/docs/analyses/ANALYSES_AUDITS.md) - Synthèse des analyses et audits effectués
- [📊 **Audit des Composants Similaires**](/docs/analyses/AUDIT_COMPOSANTS_SIMILAIRES.md) - Analyse des composants avec des fonctionnalités similaires

## 📌 Comment Utiliser Cette Documentation

### Pour les Développeurs

1. **Nouveaux sur le projet**: Commencez par lire l'[Architecture](/docs/architecture/ARCHITECTURE_LEGACY.md) et les guides des [Composants](/docs/components/GUIDE_COMPOSANTS_GENERIQUES.md) et [Hooks](/docs/hooks/HOOKS.md)

2. **Pour contribuer au CSS**: Consultez le [Guide de Style CSS](/docs/standards/CSS_STYLE_GUIDE.md) et le [Plan de Refactorisation CSS](/docs/css/PLAN_REFACTORISATION_CSS_PROGRESSIF.md)

3. **Pour contribuer aux composants**: Voir le [Guide des Composants Génériques](/docs/components/GUIDE_COMPOSANTS_GENERIQUES.md) et l'[Exemple de Composant Générique](/docs/components/EXEMPLE_COMPOSANT_GENERIQUE.md)

4. **Pour contribuer aux hooks**: Voir le [Guide des Hooks](/docs/hooks/HOOKS.md) et les hooks génériques dans le dossier `src/hooks/common/`

### Pour les Tech Leads & Managers

- [État Consolidé des Migrations et Refactorisations](/docs/migration/ETAT_MIGRATION_CONSOLIDATION.md): Vision globale de tous les chantiers
- [Audit Global de la Documentation](/docs/analyses/AUDIT_GLOBAL_DOCUMENTATION.md): Analyse des incohérences et plan d'amélioration
- Documents de planification: Pour comprendre la stratégie de refactorisation et les prochaines étapes

## 📁 Structure des Dossiers de Documentation

- **[analyses/](/docs/analyses/)** - Analyses et audits du code, de la documentation et des performances
- **[architecture/](/docs/architecture/)** - Documents d'architecture et de structure du projet
- **[archive/](/docs/archive/)** - Documents historiques et obsolètes conservés pour référence
- **[components/](/docs/components/)** - Documentation des composants et plans de refactorisation
- **[contexts/](/docs/contexts/)** - Documentation des contextes React
- **[css/](/docs/css/)** - Plans et résumés de la refactorisation CSS
- **[hooks/](/docs/hooks/)** - Documentation des hooks React et plans de migration
- **[migration/](/docs/migration/)** - Plans et état des migrations (Firebase, etc.)
- **[services/](/docs/services/)** - Documentation des services
- **[standards/](/docs/standards/)** - Standards, conventions et guides de style
- **[tests/](/docs/tests/)** - Documentation sur les tests
- **[utils/](/docs/utils/)** - Documentation des utilitaires
- **[workflows/](/docs/workflows/)** - Documentation des workflows et processus

## 🔄 Processus de Mise à Jour de la Documentation

1. **Mise à jour hebdomadaire**: Le document [État Consolidé des Migrations et Refactorisations](/docs/migration/ETAT_MIGRATION_CONSOLIDATION.md) est mis à jour tous les vendredis

2. **Création/Modification de documentation**:
   - Suivre les standards de formatation Markdown
   - Ajouter systématiquement la date de création et de dernière mise à jour
   - Mettre à jour cet index si un nouveau document est créé

3. **Résolution des incohérences**:
   - Signaler toute incohérence à l'équipe documentation (documentation@tourcraft.com)
   - Ne pas modifier plusieurs documents connexes sans coordination

---

*Index maintenu par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*