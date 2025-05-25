#!/usr/bin/env python3
"""
Script de planification et préparation pour la Phase 2 : Généralisation des Hooks
Prépare la migration des hooks spécifiques vers des hooks génériques selon les priorités identifiées.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Tuple

class Phase2GeneralizationPlanner:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.hooks_dir = self.project_root / "src" / "hooks"
        self.generics_dir = self.hooks_dir / "generics"
        
        # Plan de migration basé sur l'audit
        self.migration_plan = {
            "WEEK_1": {
                "title": "Hooks ACTIONS + SEARCH (Faible risque)",
                "effort_days": 2.0,
                "hooks": [
                    {
                        "source": "actions/useActionHandler.js",
                        "target": "generics/useGenericAction.js",
                        "complexity": "LOW",
                        "lines": 156,
                        "savings": 70
                    },
                    {
                        "source": "actions/useFormActions.js", 
                        "target": "generics/useGenericFormAction.js",
                        "complexity": "LOW",
                        "lines": 89,
                        "savings": 65
                    },
                    {
                        "source": "search/useSearchHandler.js",
                        "target": "generics/useGenericSearch.js", 
                        "complexity": "LOW",
                        "lines": 134,
                        "savings": 60
                    },
                    {
                        "source": "search/useFilteredSearch.js",
                        "target": "generics/useGenericFilteredSearch.js",
                        "complexity": "MEDIUM",
                        "lines": 96,
                        "savings": 55
                    }
                ]
            },
            "WEEK_2": {
                "title": "Hooks LISTS + DATA (Complexité modérée)",
                "effort_days": 4.0,
                "hooks": [
                    {
                        "source": "lists/useConcertsList.js",
                        "target": "generics/useGenericEntityList.js",
                        "complexity": "HIGH",
                        "lines": 209,
                        "savings": 75,
                        "business_critical": True
                    },
                    {
                        "source": "lists/useProgrammateursList.js",
                        "target": "generics/useGenericEntityList.js",
                        "complexity": "MEDIUM", 
                        "lines": 284,
                        "savings": 70
                    },
                    {
                        "source": "data/useDataFetcher.js",
                        "target": "generics/useGenericDataFetcher.js",
                        "complexity": "MEDIUM",
                        "lines": 178,
                        "savings": 65
                    },
                    {
                        "source": "data/useCachedData.js",
                        "target": "generics/useGenericCachedData.js",
                        "complexity": "HIGH",
                        "lines": 237,
                        "savings": 80
                    }
                ]
            },
            "WEEK_3": {
                "title": "Hooks FORM + VALIDATION (Haute valeur)",
                "effort_days": 6.0,
                "hooks": [
                    {
                        "source": "forms/useFormValidationData.js",
                        "target": "generics/useGenericEntityForm.js",
                        "complexity": "VERY_HIGH",
                        "lines": 255,
                        "savings": 85,
                        "business_critical": True,
                        "documented": True
                    },
                    {
                        "source": "forms/useAdminFormValidation.js",
                        "target": "generics/useGenericEntityDetails.js", 
                        "complexity": "LOW",
                        "lines": 71,
                        "savings": 60,
                        "documented": True
                    },
                    {
                        "source": "validation/useFormValidator.js",
                        "target": "generics/useGenericValidation.js",
                        "complexity": "HIGH",
                        "lines": 198,
                        "savings": 75
                    },
                    {
                        "source": "validation/useFieldValidation.js",
                        "target": "generics/useGenericFieldValidation.js",
                        "complexity": "MEDIUM",
                        "lines": 142,
                        "savings": 70
                    }
                ]
            }
        }
        
        # Templates de hooks génériques à créer
        self.generic_templates = {
            "useGenericAction": {
                "description": "Hook générique pour les actions CRUD",
                "parameters": ["entityType", "actionConfig", "options"],
                "features": ["create", "update", "delete", "batch_operations"]
            },
            "useGenericEntityList": {
                "description": "Hook générique pour les listes d'entités avec pagination",
                "parameters": ["entityType", "queryConfig", "paginationConfig"],
                "features": ["pagination", "search", "filters", "sorting"]
            },
            "useGenericEntityForm": {
                "description": "Hook générique pour les formulaires d'entités",
                "parameters": ["entityType", "formConfig", "validationRules"],
                "features": ["validation", "submission", "error_handling", "auto_save"]
            },
            "useGenericValidation": {
                "description": "Hook générique pour la validation",
                "parameters": ["validationRules", "validationConfig"],
                "features": ["field_validation", "form_validation", "async_validation"]
            },
            "useGenericSearch": {
                "description": "Hook générique pour la recherche",
                "parameters": ["searchConfig", "searchFields", "options"],
                "features": ["text_search", "filters", "suggestions", "history"]
            },
            "useGenericDataFetcher": {
                "description": "Hook générique pour la récupération de données",
                "parameters": ["dataSource", "fetchConfig", "cacheConfig"],
                "features": ["caching", "error_handling", "retry", "pagination"]
            }
        }
    
    def analyze_current_state(self) -> Dict:
        """Analyse l'état actuel des hooks avant migration"""
        print("🔍 Analyse de l'état actuel des hooks...")
        
        analysis = {
            "total_hooks": 0,
            "hooks_to_migrate": 0,
            "estimated_effort": 0,
            "potential_savings": 0,
            "business_critical_count": 0,
            "documented_count": 0,
            "by_week": {}
        }
        
        for week, week_data in self.migration_plan.items():
            week_analysis = {
                "hooks_count": len(week_data["hooks"]),
                "effort_days": week_data["effort_days"],
                "total_lines": sum(h["lines"] for h in week_data["hooks"]),
                "total_savings": sum(h["savings"] for h in week_data["hooks"]),
                "business_critical": sum(1 for h in week_data["hooks"] if h.get("business_critical", False)),
                "documented": sum(1 for h in week_data["hooks"] if h.get("documented", False))
            }
            
            analysis["by_week"][week] = week_analysis
            analysis["total_hooks"] += week_analysis["hooks_count"]
            analysis["estimated_effort"] += week_analysis["effort_days"]
            analysis["potential_savings"] += week_analysis["total_savings"]
            analysis["business_critical_count"] += week_analysis["business_critical"]
            analysis["documented_count"] += week_analysis["documented"]
        
        analysis["hooks_to_migrate"] = analysis["total_hooks"]
        
        return analysis
    
    def create_migration_checklist(self) -> str:
        """Crée une checklist détaillée pour la migration"""
        checklist = []
        checklist.append("# 📋 CHECKLIST PHASE 2 : GÉNÉRALISATION DES HOOKS")
        checklist.append(f"*Générée le: {self._get_current_date()}*\n")
        
        # Préparation générale
        checklist.append("## 🚀 PRÉPARATION GÉNÉRALE")
        checklist.append("- [ ] Backup complet de la branche actuelle")
        checklist.append("- [ ] Création de la branche `phase2-hooks-generalization`")
        checklist.append("- [ ] Mise en place des tests de régression")
        checklist.append("- [ ] Configuration de l'environnement de développement")
        checklist.append("- [ ] Validation de la documentation Phase 1")
        checklist.append("")
        
        # Plan par semaine
        for week, week_data in self.migration_plan.items():
            week_num = week.split("_")[1]
            checklist.append(f"## 📅 SEMAINE {week_num}: {week_data['title']}")
            checklist.append(f"**Effort estimé**: {week_data['effort_days']} jours")
            checklist.append("")
            
            for i, hook in enumerate(week_data["hooks"], 1):
                checklist.append(f"### {i}. Migration {hook['source']}")
                checklist.append(f"- [ ] **Analyse**: Étudier la logique actuelle ({hook['lines']} lignes)")
                checklist.append(f"- [ ] **Design**: Concevoir l'interface générique")
                checklist.append(f"- [ ] **Implémentation**: Créer {hook['target']}")
                checklist.append(f"- [ ] **Tests**: Écrire les tests unitaires")
                checklist.append(f"- [ ] **Migration**: Adapter les composants utilisateurs")
                checklist.append(f"- [ ] **Validation**: Tests de régression")
                
                if hook.get("business_critical"):
                    checklist.append("- [ ] **⚠️ CRITIQUE**: Tests métier approfondis")
                
                if hook.get("documented"):
                    checklist.append("- [ ] **📚 DOCUMENTÉ**: Vérifier la cohérence avec la doc")
                
                checklist.append(f"- [ ] **Nettoyage**: Supprimer l'ancien hook")
                checklist.append(f"- [ ] **Commit**: `feat: migrate {hook['source']} to generic hook`")
                checklist.append("")
        
        # Validation finale
        checklist.append("## ✅ VALIDATION FINALE")
        checklist.append("- [ ] Tests de régression complets")
        checklist.append("- [ ] Validation des performances")
        checklist.append("- [ ] Review de code par l'équipe")
        checklist.append("- [ ] Documentation des nouveaux hooks génériques")
        checklist.append("- [ ] Mise à jour du guide de développement")
        checklist.append("- [ ] Déploiement en environnement de test")
        checklist.append("- [ ] Validation métier")
        checklist.append("- [ ] Merge vers la branche principale")
        checklist.append("")
        
        return "\n".join(checklist)
    
    def create_generic_hook_templates(self) -> Dict[str, str]:
        """Crée les templates des hooks génériques"""
        templates = {}
        
        for hook_name, config in self.generic_templates.items():
            template = self._generate_hook_template(hook_name, config)
            templates[f"{hook_name}.js"] = template
        
        return templates
    
    def _generate_hook_template(self, hook_name: str, config: Dict) -> str:
        """Génère le template d'un hook générique"""
        params = ", ".join(config["parameters"])
        features_list = "\n * - ".join(config["features"])
        
        template = f"""/**
 * @fileoverview {config["description"]}
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import {{ useState, useEffect, useCallback }} from 'react';

/**
 * {config["description"]}
 * 
 * @description
 * Fonctionnalités supportées :
 * - {features_list}
 * 
 * @param {{Object}} {config["parameters"][0]} - Configuration principale
 * @param {{Object}} options - Options additionnelles
 * 
 * @returns {{Object}} Interface du hook générique
 * 
 * @example
 * ```javascript
 * const {{ data, loading, error, actions }} = {hook_name}({params});
 * 
 * // Utilisation basique
 * if (loading) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {{error}}</div>;
 * 
 * // Utiliser les données et actions
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces Multiple specific hooks
 */
const {hook_name} = ({params}) => {{
  // États de base
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // TODO: Implémenter la logique générique
  // Cette template doit être adaptée selon les besoins spécifiques
  
  // Interface de retour standardisée
  return {{
    data,
    loading,
    error,
    // Actions spécifiques selon le type de hook
  }};
}};

export default {hook_name};
"""
        return template
    
    def generate_migration_report(self) -> str:
        """Génère le rapport de planification de migration"""
        analysis = self.analyze_current_state()
        
        report = []
        report.append("# 📊 RAPPORT DE PLANIFICATION PHASE 2")
        report.append(f"*Généré le: {self._get_current_date()}*\n")
        
        # Résumé exécutif
        report.append("## 🎯 RÉSUMÉ EXÉCUTIF")
        report.append(f"- **Hooks à migrer**: {analysis['hooks_to_migrate']}")
        report.append(f"- **Effort total estimé**: {analysis['estimated_effort']} jours")
        report.append(f"- **Économies potentielles**: {analysis['potential_savings']}% en moyenne")
        report.append(f"- **Hooks critiques métier**: {analysis['business_critical_count']}")
        report.append(f"- **Hooks déjà documentés**: {analysis['documented_count']}")
        report.append("")
        
        # Planning détaillé
        report.append("## 📅 PLANNING DÉTAILLÉ")
        
        for week, week_data in self.migration_plan.items():
            week_num = week.split("_")[1]
            week_analysis = analysis["by_week"][week]
            
            report.append(f"### Semaine {week_num}: {week_data['title']}")
            report.append(f"- **Effort**: {week_analysis['effort_days']} jours")
            report.append(f"- **Hooks**: {week_analysis['hooks_count']}")
            report.append(f"- **Lignes totales**: {week_analysis['total_lines']}")
            report.append(f"- **Économies moyennes**: {week_analysis['total_savings'] / week_analysis['hooks_count']:.1f}%")
            
            if week_analysis['business_critical'] > 0:
                report.append(f"- **⚠️ Hooks critiques**: {week_analysis['business_critical']}")
            
            if week_analysis['documented'] > 0:
                report.append(f"- **📚 Hooks documentés**: {week_analysis['documented']}")
            
            report.append("")
            
            # Détail des hooks
            for hook in week_data["hooks"]:
                status_icons = []
                if hook.get("business_critical"):
                    status_icons.append("⚠️")
                if hook.get("documented"):
                    status_icons.append("📚")
                
                status = " ".join(status_icons) + " " if status_icons else ""
                
                report.append(f"  - {status}**{hook['source']}** → `{hook['target']}`")
                report.append(f"    - Complexité: {hook['complexity']}")
                report.append(f"    - Lignes: {hook['lines']}")
                report.append(f"    - Économies: {hook['savings']}%")
            
            report.append("")
        
        # Hooks génériques à créer
        report.append("## 🔧 HOOKS GÉNÉRIQUES À CRÉER")
        for hook_name, config in self.generic_templates.items():
            report.append(f"### {hook_name}")
            report.append(f"- **Description**: {config['description']}")
            report.append(f"- **Paramètres**: {', '.join(config['parameters'])}")
            report.append(f"- **Fonctionnalités**: {', '.join(config['features'])}")
            report.append("")
        
        # Risques et mitigation
        report.append("## ⚠️ RISQUES ET MITIGATION")
        report.append("### Risques identifiés")
        report.append("- **Régression fonctionnelle**: Hooks critiques métier")
        report.append("- **Performance**: Généralisation peut impacter les performances")
        report.append("- **Complexité**: Hooks génériques plus complexes à maintenir")
        report.append("- **Adoption**: Équipe doit s'adapter aux nouveaux patterns")
        report.append("")
        
        report.append("### Mesures de mitigation")
        report.append("- **Tests exhaustifs**: Couverture 100% des hooks critiques")
        report.append("- **Migration progressive**: Une semaine par type de hook")
        report.append("- **Rollback plan**: Possibilité de revenir en arrière")
        report.append("- **Documentation**: Guide complet pour l'équipe")
        report.append("- **Code review**: Validation par pairs systématique")
        report.append("")
        
        # Métriques de succès
        report.append("## 📈 MÉTRIQUES DE SUCCÈS")
        report.append("- **Réduction du code**: -70% en moyenne")
        report.append("- **Temps de développement**: -50% pour nouveaux hooks")
        report.append("- **Maintenabilité**: +80% (moins de duplication)")
        report.append("- **Consistance**: 100% des patterns standardisés")
        report.append("- **Performance**: Maintien ou amélioration")
        report.append("")
        
        return "\n".join(report)
    
    def prepare_phase2_environment(self):
        """Prépare l'environnement pour la phase 2"""
        print("🚀 Préparation de l'environnement Phase 2...")
        
        # Créer les dossiers nécessaires
        phase2_dir = self.project_root / "tools" / "phase2"
        phase2_dir.mkdir(exist_ok=True)
        
        templates_dir = phase2_dir / "templates"
        templates_dir.mkdir(exist_ok=True)
        
        # Générer les templates
        templates = self.create_generic_hook_templates()
        for filename, content in templates.items():
            template_file = templates_dir / filename
            template_file.write_text(content, encoding='utf-8')
            print(f"✅ Template créé: {filename}")
        
        # Générer la checklist
        checklist = self.create_migration_checklist()
        checklist_file = phase2_dir / "migration_checklist.md"
        checklist_file.write_text(checklist, encoding='utf-8')
        print(f"✅ Checklist créée: migration_checklist.md")
        
        # Générer le rapport
        report = self.generate_migration_report()
        report_file = phase2_dir / "phase2_planning_report.md"
        report_file.write_text(report, encoding='utf-8')
        print(f"✅ Rapport créé: phase2_planning_report.md")
        
        # Créer le script de migration
        migration_script = self._create_migration_script()
        script_file = phase2_dir / "migrate_hooks.py"
        script_file.write_text(migration_script, encoding='utf-8')
        print(f"✅ Script de migration créé: migrate_hooks.py")
        
        return {
            "templates_created": len(templates),
            "checklist_file": str(checklist_file),
            "report_file": str(report_file),
            "script_file": str(script_file)
        }
    
    def _create_migration_script(self) -> str:
        """Crée le script de migration automatique"""
        script = '''#!/usr/bin/env python3
"""
Script de migration automatique pour la Phase 2
Aide à la migration des hooks spécifiques vers les hooks génériques
"""

import os
import shutil
from pathlib import Path

class HookMigrator:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.hooks_dir = self.project_root / "src" / "hooks"
        self.backup_dir = self.project_root / "tools" / "phase2" / "backups"
        
    def backup_hook(self, hook_path: str):
        """Sauvegarde un hook avant migration"""
        source = self.hooks_dir / hook_path
        if source.exists():
            self.backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = self.backup_dir / hook_path
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, backup_path)
            print(f"✅ Backup créé: {hook_path}")
    
    def migrate_hook(self, source_path: str, target_path: str):
        """Migre un hook spécifique vers un hook générique"""
        print(f"🔄 Migration: {source_path} → {target_path}")
        # TODO: Implémenter la logique de migration
        # Cette fonction sera développée selon les besoins spécifiques
        
    def validate_migration(self, hook_path: str):
        """Valide qu'une migration s'est bien passée"""
        # TODO: Implémenter la validation
        pass

if __name__ == "__main__":
    migrator = HookMigrator(os.getcwd())
    print("🚀 Script de migration Phase 2 prêt")
    print("Utilisez les méthodes du migrator pour effectuer les migrations")
'''
        return script
    
    def _get_current_date(self):
        """Retourne la date actuelle formatée"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y à %H:%M")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    planner = Phase2GeneralizationPlanner(project_root)
    
    print("🚀 Préparation de la Phase 2 : Généralisation des Hooks...")
    
    try:
        # Analyser l'état actuel
        analysis = planner.analyze_current_state()
        print(f"📊 Analyse terminée: {analysis['hooks_to_migrate']} hooks à migrer")
        
        # Préparer l'environnement
        result = planner.prepare_phase2_environment()
        
        print("\n" + "="*60)
        print("✅ PHASE 2 PRÉPARÉE AVEC SUCCÈS")
        print("="*60)
        print(f"📁 Templates créés: {result['templates_created']}")
        print(f"📋 Checklist: {result['checklist_file']}")
        print(f"📊 Rapport: {result['report_file']}")
        print(f"🔧 Script: {result['script_file']}")
        print("\n🎯 PROCHAINES ÉTAPES:")
        print("1. Consulter le rapport de planification")
        print("2. Suivre la checklist de migration")
        print("3. Commencer par la Semaine 1 (ACTIONS + SEARCH)")
        print("4. Utiliser les templates pour créer les hooks génériques")
        
    except Exception as e:
        print(f"❌ Erreur lors de la préparation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 