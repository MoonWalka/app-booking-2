#!/usr/bin/env python3
"""
Script de validation et amélioration de la documentation des hooks prioritaires
Vérifie la qualité de la documentation JSDoc et propose des améliorations.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

class HookDocumentationValidator:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.hooks_dir = self.project_root / "src" / "hooks"
        
        # Hooks prioritaires identifiés dans l'audit
        self.priority_hooks = [
            "forms/useFormValidationData.js",
            "forms/useAdminFormValidation.js", 
            "lists/useConcertsList.js",
            "lieux/useLieuxQuery.js",
            "programmateurs/useAdresseValidation.js",
            "contrats/useContratGenerator.js"
        ]
        
        # Éléments requis pour une documentation complète
        self.required_elements = {
            '@description': 'Description détaillée du hook',
            '@param': 'Documentation des paramètres',
            '@returns': 'Documentation de la valeur de retour',
            '@example': 'Exemple d\'utilisation',
            '@dependencies': 'Dépendances du hook',
            '@complexity': 'Niveau de complexité',
            '@businessCritical': 'Criticité métier'
        }
        
    def analyze_hook_documentation(self, hook_path: str) -> Dict:
        """Analyse la documentation d'un hook spécifique"""
        full_path = self.hooks_dir / hook_path
        
        if not full_path.exists():
            return {
                'exists': False,
                'error': f"Fichier non trouvé: {hook_path}"
            }
        
        try:
            content = full_path.read_text(encoding='utf-8')
            
            # Extrait le bloc JSDoc principal
            jsdoc_pattern = r'/\*\*(.*?)\*/'
            jsdoc_matches = re.findall(jsdoc_pattern, content, re.DOTALL)
            
            analysis = {
                'exists': True,
                'path': hook_path,
                'file_size': len(content),
                'line_count': len(content.splitlines()),
                'jsdoc_blocks': len(jsdoc_matches),
                'has_main_documentation': False,
                'documentation_score': 0,
                'missing_elements': [],
                'present_elements': [],
                'suggestions': []
            }
            
            # Analyse du bloc principal (le plus long)
            if jsdoc_matches:
                main_jsdoc = max(jsdoc_matches, key=len)
                analysis['has_main_documentation'] = True
                analysis['main_jsdoc_length'] = len(main_jsdoc)
                
                # Vérifie la présence des éléments requis
                for element, description in self.required_elements.items():
                    if element in main_jsdoc:
                        analysis['present_elements'].append(element)
                        analysis['documentation_score'] += 10
                    else:
                        analysis['missing_elements'].append({
                            'element': element,
                            'description': description
                        })
                
                # Bonus pour la qualité
                if 'workflow' in main_jsdoc.lower():
                    analysis['documentation_score'] += 5
                if 'errorhandling' in main_jsdoc.lower():
                    analysis['documentation_score'] += 5
                if len(main_jsdoc) > 1000:
                    analysis['documentation_score'] += 10
                    
            else:
                analysis['missing_elements'] = [
                    {'element': element, 'description': description}
                    for element, description in self.required_elements.items()
                ]
            
            # Génère des suggestions d'amélioration
            analysis['suggestions'] = self._generate_suggestions(analysis)
            
            return analysis
            
        except Exception as e:
            return {
                'exists': True,
                'error': f"Erreur lors de l'analyse: {str(e)}"
            }
    
    def _generate_suggestions(self, analysis: Dict) -> List[str]:
        """Génère des suggestions d'amélioration"""
        suggestions = []
        
        if not analysis['has_main_documentation']:
            suggestions.append("🚨 CRITIQUE: Ajouter un bloc JSDoc principal au hook")
        
        if analysis['documentation_score'] < 30:
            suggestions.append("⚠️ FAIBLE: Score de documentation très bas, amélioration urgente requise")
        elif analysis['documentation_score'] < 50:
            suggestions.append("📊 MOYEN: Documentation incomplète, ajouter les éléments manquants")
        elif analysis['documentation_score'] < 70:
            suggestions.append("✅ BIEN: Documentation correcte, quelques améliorations possibles")
        else:
            suggestions.append("🎉 EXCELLENT: Documentation de qualité professionnelle")
        
        # Suggestions spécifiques
        missing_critical = [m for m in analysis['missing_elements'] 
                          if m['element'] in ['@description', '@param', '@returns']]
        if missing_critical:
            suggestions.append("📝 Ajouter la documentation de base: description, paramètres, retour")
        
        missing_advanced = [m for m in analysis['missing_elements'] 
                          if m['element'] in ['@example', '@dependencies', '@complexity']]
        if missing_advanced:
            suggestions.append("🔧 Ajouter la documentation avancée: exemples, dépendances, complexité")
        
        if analysis.get('line_count', 0) > 200 and '@complexity' not in analysis['present_elements']:
            suggestions.append("⚡ Hook complexe: Ajouter @complexity et @businessCritical")
        
        return suggestions
    
    def generate_documentation_template(self, hook_path: str, analysis: Dict) -> str:
        """Génère un template de documentation pour un hook"""
        hook_name = Path(hook_path).stem
        
        template = f"""/**
 * @fileoverview {hook_name} - [DESCRIPTION DU FICHIER]
 * [Description détaillée de l'objectif du hook]
 * 
 * @author TourCraft Team
 * @since 2024
 */

/**
 * [DESCRIPTION PRINCIPALE DU HOOK]
 * 
 * @description
 * Fonctionnalités principales :
 * - [Fonctionnalité 1]
 * - [Fonctionnalité 2]
 * - [Fonctionnalité 3]
 * 
 * @param {{[TYPE]}} [paramName] - [Description du paramètre]
 * 
 * @returns {{Object}} [Description de l'objet retourné]
 * @returns {{[TYPE]}} returns.[property] - [Description de la propriété]
 * 
 * @example
 * ```javascript
 * const {{ data, loading, error }} = {hook_name}([params]);
 * 
 * if (loading) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {{error}}</div>;
 * 
 * // Utiliser les données
 * ```
 * 
 * @dependencies
 * - [Dépendance 1]
 * - [Dépendance 2]
 * 
 * @complexity [LOW|MEDIUM|HIGH]
 * @businessCritical [true|false]
 * @migrationCandidate [Hook générique candidat]
 * 
 * @workflow
 * 1. [Étape 1]
 * 2. [Étape 2]
 * 3. [Étape 3]
 * 
 * @errorHandling
 * - [Type d'erreur 1]: "[Message d'erreur]"
 * - [Type d'erreur 2]: "[Message d'erreur]"
 */"""
        
        return template
    
    def validate_all_priority_hooks(self) -> Dict:
        """Valide tous les hooks prioritaires"""
        print("🔍 Validation de la documentation des hooks prioritaires...")
        
        results = {
            'total_hooks': len(self.priority_hooks),
            'analyzed': 0,
            'well_documented': 0,
            'needs_improvement': 0,
            'critical_issues': 0,
            'hooks_analysis': {}
        }
        
        for hook_path in self.priority_hooks:
            print(f"📋 Analyse de {hook_path}...")
            analysis = self.analyze_hook_documentation(hook_path)
            
            if analysis.get('exists', False) and 'error' not in analysis:
                results['analyzed'] += 1
                
                score = analysis.get('documentation_score', 0)
                if score >= 70:
                    results['well_documented'] += 1
                elif score >= 30:
                    results['needs_improvement'] += 1
                else:
                    results['critical_issues'] += 1
                    
                results['hooks_analysis'][hook_path] = analysis
            else:
                results['critical_issues'] += 1
                results['hooks_analysis'][hook_path] = analysis
        
        return results
    
    def generate_improvement_report(self, results: Dict) -> str:
        """Génère un rapport d'amélioration"""
        report = []
        report.append("# 📚 RAPPORT DE VALIDATION DOCUMENTATION HOOKS PRIORITAIRES")
        report.append(f"*Généré le: {self._get_current_date()}*\n")
        
        # Résumé exécutif
        report.append("## 📊 RÉSUMÉ EXÉCUTIF")
        report.append(f"- **Hooks analysés**: {results['analyzed']}/{results['total_hooks']}")
        report.append(f"- **Bien documentés**: {results['well_documented']} (≥70 points)")
        report.append(f"- **À améliorer**: {results['needs_improvement']} (30-69 points)")
        report.append(f"- **Problèmes critiques**: {results['critical_issues']} (<30 points)")
        
        # Calcul du taux de qualité
        if results['analyzed'] > 0:
            quality_rate = (results['well_documented'] / results['analyzed']) * 100
            report.append(f"- **Taux de qualité**: {quality_rate:.1f}%")
        report.append("")
        
        # Analyse détaillée par hook
        report.append("## 🔍 ANALYSE DÉTAILLÉE PAR HOOK")
        
        for hook_path, analysis in results['hooks_analysis'].items():
            if 'error' in analysis:
                report.append(f"### ❌ {hook_path}")
                report.append(f"**Erreur**: {analysis['error']}")
                report.append("")
                continue
                
            score = analysis.get('documentation_score', 0)
            status = "🎉 EXCELLENT" if score >= 70 else "📊 MOYEN" if score >= 30 else "🚨 CRITIQUE"
            
            report.append(f"### {status} {hook_path}")
            report.append(f"- **Score**: {score}/100")
            report.append(f"- **Lignes**: {analysis.get('line_count', 0)}")
            report.append(f"- **Blocs JSDoc**: {analysis.get('jsdoc_blocks', 0)}")
            
            if analysis.get('present_elements'):
                report.append(f"- **Éléments présents**: {', '.join(analysis['present_elements'])}")
            
            if analysis.get('missing_elements'):
                report.append("- **Éléments manquants**:")
                for missing in analysis['missing_elements']:
                    report.append(f"  - `{missing['element']}`: {missing['description']}")
            
            if analysis.get('suggestions'):
                report.append("- **Suggestions**:")
                for suggestion in analysis['suggestions']:
                    report.append(f"  - {suggestion}")
            
            report.append("")
        
        # Plan d'action
        report.append("## 📋 PLAN D'ACTION PRIORITAIRE")
        
        critical_hooks = [path for path, analysis in results['hooks_analysis'].items() 
                         if analysis.get('documentation_score', 0) < 30]
        
        if critical_hooks:
            report.append("### 🚨 ACTIONS IMMÉDIATES (Critique)")
            for hook_path in critical_hooks:
                report.append(f"1. **{hook_path}**: Documentation complète requise")
                # Génère le template
                analysis = results['hooks_analysis'][hook_path]
                template = self.generate_documentation_template(hook_path, analysis)
                report.append(f"   - Template disponible dans le rapport")
        
        improvement_hooks = [path for path, analysis in results['hooks_analysis'].items() 
                           if 30 <= analysis.get('documentation_score', 0) < 70]
        
        if improvement_hooks:
            report.append("### 📊 AMÉLIORATIONS (Moyenne priorité)")
            for hook_path in improvement_hooks:
                analysis = results['hooks_analysis'][hook_path]
                missing_count = len(analysis.get('missing_elements', []))
                report.append(f"- **{hook_path}**: {missing_count} éléments manquants")
        
        # Estimation de l'effort
        total_work = len(critical_hooks) * 2 + len(improvement_hooks) * 1  # heures
        report.append(f"\n### ⏱️ ESTIMATION DE L'EFFORT")
        report.append(f"- **Hooks critiques**: {len(critical_hooks)} × 2h = {len(critical_hooks) * 2}h")
        report.append(f"- **Hooks à améliorer**: {len(improvement_hooks)} × 1h = {len(improvement_hooks)}h")
        report.append(f"- **Total estimé**: {total_work}h ({total_work/8:.1f} jours)")
        
        return "\n".join(report)
    
    def _get_current_date(self):
        """Retourne la date actuelle formatée"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y à %H:%M")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    validator = HookDocumentationValidator(project_root)
    
    print("🚀 Validation de la documentation des hooks prioritaires...")
    
    try:
        results = validator.validate_all_priority_hooks()
        report = validator.generate_improvement_report(results)
        
        # Sauvegarde le rapport
        output_file = Path(project_root) / "tools" / "audit" / "validation_documentation_hooks.md"
        output_file.write_text(report, encoding='utf-8')
        
        print(f"✅ Rapport de validation généré: {output_file}")
        print("\n" + "="*60)
        print(report)
        
    except Exception as e:
        print(f"❌ Erreur lors de la validation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 