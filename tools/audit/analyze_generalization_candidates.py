#!/usr/bin/env python3
"""
Analyse spécifique des candidats à la généralisation des hooks
Se base sur les données de l'audit des dépendances pour identifier
les hooks spécifiques qui pourraient être généralisés.
"""

import json
import os
from pathlib import Path
from collections import defaultdict, Counter

class GeneralizationCandidateAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.audit_data = None
        
    def load_audit_data(self):
        """Charge les données de l'audit précédent"""
        audit_file = self.project_root / "tools" / "audit" / "rapport_dependances_hooks.json"
        if not audit_file.exists():
            raise FileNotFoundError(f"Fichier d'audit non trouvé: {audit_file}")
        
        with open(audit_file, 'r', encoding='utf-8') as f:
            self.audit_data = json.load(f)
    
    def identify_non_generic_hooks(self):
        """Identifie les hooks qui n'utilisent pas encore les génériques"""
        non_generic = []
        
        for hook_key, hook_info in self.audit_data['hooks_inventory'].items():
            if not hook_info['uses_generic'] and not hook_info['deprecated']:
                # Exclut les hooks de base et utilitaires
                if hook_info['domain'] not in ['common', 'root'] and 'index' not in hook_info['name'].lower():
                    non_generic.append((hook_key, hook_info))
        
        return non_generic
    
    def analyze_patterns_in_non_generic(self, non_generic_hooks):
        """Analyse les patterns dans les hooks non génériques"""
        patterns = {
            'form': [],
            'list': [],
            'search': [],
            'details': [],
            'status': [],
            'actions': [],
            'validation': [],
            'filters': [],
            'data': [],
            'submission': [],
            'associations': []
        }
        
        for hook_key, hook_info in non_generic_hooks:
            name = hook_info['name'].lower()
            
            # Identifie les patterns
            for pattern in patterns.keys():
                if pattern in name:
                    patterns[pattern].append((hook_key, hook_info))
        
        return patterns
    
    def evaluate_generalization_potential(self, patterns):
        """Évalue le potentiel de généralisation pour chaque pattern"""
        evaluations = {}
        
        for pattern, hooks in patterns.items():
            if not hooks:
                continue
                
            # Calcule les métriques
            total_hooks = len(hooks)
            total_complexity = sum(h[1]['complexity_score'] for h in hooks)
            avg_complexity = total_complexity / total_hooks if total_hooks > 0 else 0
            total_lines = sum(h[1]['line_count'] for h in hooks)
            
            # Analyse des domaines
            domains = Counter(h[1]['domain'] for h in hooks)
            
            # Calcule le score de généralisation
            generalization_score = 0
            
            # Plus il y a de hooks similaires, plus le score est élevé
            generalization_score += min(total_hooks * 10, 50)
            
            # Plus la complexité est élevée, plus la généralisation est bénéfique
            generalization_score += min(avg_complexity, 30)
            
            # Plus il y a de domaines différents, plus la généralisation est justifiée
            generalization_score += min(len(domains) * 15, 45)
            
            # Bonus pour les patterns déjà partiellement généralisés
            if pattern in ['form', 'details', 'search', 'list']:
                generalization_score += 20
            
            evaluations[pattern] = {
                'hooks': hooks,
                'total_hooks': total_hooks,
                'avg_complexity': round(avg_complexity, 1),
                'total_lines': total_lines,
                'domains': dict(domains),
                'generalization_score': generalization_score,
                'priority': self._get_priority(generalization_score),
                'estimated_effort': self._estimate_effort(total_hooks, avg_complexity),
                'potential_savings': self._calculate_savings(total_lines, total_hooks)
            }
        
        return evaluations
    
    def _get_priority(self, score):
        """Détermine la priorité basée sur le score"""
        if score >= 80:
            return "HAUTE"
        elif score >= 50:
            return "MOYENNE"
        elif score >= 30:
            return "BASSE"
        else:
            return "TRÈS BASSE"
    
    def _estimate_effort(self, hook_count, avg_complexity):
        """Estime l'effort de généralisation"""
        base_effort = hook_count * 0.5  # 0.5 jour par hook
        complexity_factor = min(avg_complexity / 50, 2)  # Facteur de complexité
        
        total_days = base_effort * complexity_factor
        
        if total_days <= 2:
            return f"{total_days:.1f} jours (FACILE)"
        elif total_days <= 5:
            return f"{total_days:.1f} jours (MODÉRÉ)"
        elif total_days <= 10:
            return f"{total_days:.1f} jours (COMPLEXE)"
        else:
            return f"{total_days:.1f} jours (TRÈS COMPLEXE)"
    
    def _calculate_savings(self, total_lines, hook_count):
        """Calcule les économies potentielles"""
        if hook_count <= 1:
            return "Aucune économie"
        
        # Estime qu'on peut réduire de 60-80% le code avec la généralisation
        reduction_factor = 0.7
        saved_lines = int(total_lines * reduction_factor)
        
        return f"~{saved_lines} lignes économisées ({reduction_factor*100:.0f}%)"
    
    def analyze_specific_hooks(self, non_generic_hooks):
        """Analyse spécifique de hooks individuels intéressants"""
        interesting_hooks = []
        
        for hook_key, hook_info in non_generic_hooks:
            # Critères pour un hook intéressant
            is_interesting = (
                hook_info['complexity_score'] > 40 or  # Complexité élevée
                hook_info['line_count'] > 100 or       # Beaucoup de code
                any(pattern in hook_info['name'].lower() 
                    for pattern in ['form', 'list', 'search', 'details'])  # Pattern générique
            )
            
            if is_interesting:
                # Analyse plus poussée
                analysis = {
                    'hook_key': hook_key,
                    'hook_info': hook_info,
                    'generalization_potential': self._analyze_individual_hook(hook_info),
                    'migration_complexity': self._assess_migration_complexity(hook_info),
                    'business_impact': self._assess_business_impact(hook_info)
                }
                interesting_hooks.append(analysis)
        
        return interesting_hooks
    
    def _analyze_individual_hook(self, hook_info):
        """Analyse le potentiel de généralisation d'un hook individuel"""
        name = hook_info['name'].lower()
        
        # Identifie le type de hook
        if 'form' in name:
            return "Candidat pour useGenericEntityForm"
        elif 'list' in name or 'filter' in name:
            return "Candidat pour useGenericEntityList"
        elif 'search' in name:
            return "Candidat pour useGenericEntitySearch"
        elif 'details' in name:
            return "Candidat pour useGenericEntityDetails"
        elif 'status' in name or 'state' in name:
            return "Candidat pour nouveau hook générique useGenericEntityStatus"
        elif 'action' in name:
            return "Candidat pour nouveau hook générique useGenericEntityActions"
        elif 'validation' in name:
            return "Candidat pour nouveau hook générique useGenericValidation"
        else:
            return "Analyse manuelle requise"
    
    def _assess_migration_complexity(self, hook_info):
        """Évalue la complexité de migration"""
        complexity = hook_info['complexity_score']
        lines = hook_info['line_count']
        
        if complexity > 100 or lines > 400:
            return "ÉLEVÉE - Nécessite analyse approfondie"
        elif complexity > 50 or lines > 200:
            return "MODÉRÉE - Migration standard"
        else:
            return "FAIBLE - Migration simple"
    
    def _assess_business_impact(self, hook_info):
        """Évalue l'impact métier"""
        domain = hook_info['domain']
        name = hook_info['name'].lower()
        
        # Hooks critiques pour le métier
        if domain in ['concerts', 'contrats'] and any(critical in name for critical in ['form', 'details', 'status']):
            return "CRITIQUE - Tests approfondis requis"
        elif domain in ['programmateurs', 'artistes', 'lieux'] and 'form' in name:
            return "IMPORTANT - Tests standards requis"
        else:
            return "STANDARD - Tests de base requis"
    
    def generate_detailed_report(self):
        """Génère un rapport détaillé des candidats à la généralisation"""
        self.load_audit_data()
        
        non_generic_hooks = self.identify_non_generic_hooks()
        patterns = self.analyze_patterns_in_non_generic(non_generic_hooks)
        evaluations = self.evaluate_generalization_potential(patterns)
        specific_analysis = self.analyze_specific_hooks(non_generic_hooks)
        
        report = []
        report.append("# 🎯 ANALYSE DÉTAILLÉE DES CANDIDATS À LA GÉNÉRALISATION")
        report.append(f"*Généré le: {self._get_current_date()}*\n")
        
        # Résumé exécutif
        total_non_generic = len(non_generic_hooks)
        high_priority_patterns = len([p for p in evaluations.values() if p['priority'] == 'HAUTE'])
        
        report.append("## 📊 RÉSUMÉ EXÉCUTIF")
        report.append(f"- **Hooks non génériques analysés**: {total_non_generic}")
        report.append(f"- **Patterns haute priorité**: {high_priority_patterns}")
        report.append(f"- **Hooks individuels intéressants**: {len(specific_analysis)}")
        report.append("")
        
        # Analyse par patterns
        report.append("## 🔍 ANALYSE PAR PATTERNS")
        
        # Trie par score de généralisation
        sorted_patterns = sorted(evaluations.items(), 
                               key=lambda x: x[1]['generalization_score'], 
                               reverse=True)
        
        for pattern, eval_data in sorted_patterns:
            if eval_data['total_hooks'] == 0:
                continue
                
            report.append(f"### {pattern.upper()} - Priorité {eval_data['priority']}")
            report.append(f"- **Score de généralisation**: {eval_data['generalization_score']}/100")
            report.append(f"- **Hooks concernés**: {eval_data['total_hooks']}")
            report.append(f"- **Complexité moyenne**: {eval_data['avg_complexity']}")
            report.append(f"- **Lignes totales**: {eval_data['total_lines']}")
            report.append(f"- **Domaines**: {', '.join(eval_data['domains'].keys())}")
            report.append(f"- **Effort estimé**: {eval_data['estimated_effort']}")
            report.append(f"- **Économies potentielles**: {eval_data['potential_savings']}")
            
            if eval_data['priority'] in ['HAUTE', 'MOYENNE']:
                report.append("- **Hooks détaillés**:")
                for hook_key, hook_info in eval_data['hooks']:
                    report.append(f"  - `{hook_info['name']}` ({hook_info['domain']}) - {hook_info['line_count']} lignes, complexité {hook_info['complexity_score']}")
            
            report.append("")
        
        # Analyse des hooks individuels
        report.append("## 🔬 ANALYSE DES HOOKS INDIVIDUELS INTÉRESSANTS")
        
        # Trie par complexité décroissante
        sorted_hooks = sorted(specific_analysis, 
                            key=lambda x: x['hook_info']['complexity_score'], 
                            reverse=True)
        
        for analysis in sorted_hooks[:15]:  # Top 15
            hook_info = analysis['hook_info']
            report.append(f"### {hook_info['name']} ({hook_info['domain']})")
            report.append(f"- **Lignes**: {hook_info['line_count']}")
            report.append(f"- **Complexité**: {hook_info['complexity_score']}")
            report.append(f"- **Potentiel**: {analysis['generalization_potential']}")
            report.append(f"- **Complexité migration**: {analysis['migration_complexity']}")
            report.append(f"- **Impact métier**: {analysis['business_impact']}")
            report.append("")
        
        # Recommandations
        report.append("## 💡 RECOMMANDATIONS PRIORITAIRES")
        
        # Identifie les actions prioritaires
        high_priority_patterns = [p for p, e in evaluations.items() if e['priority'] == 'HAUTE']
        medium_priority_patterns = [p for p, e in evaluations.items() if e['priority'] == 'MOYENNE']
        
        if high_priority_patterns:
            report.append("### ⚡ ACTIONS IMMÉDIATES (Haute Priorité)")
            for pattern in high_priority_patterns:
                eval_data = evaluations[pattern]
                report.append(f"1. **Généraliser les hooks {pattern.upper()}**")
                report.append(f"   - {eval_data['total_hooks']} hooks concernés")
                report.append(f"   - Effort: {eval_data['estimated_effort']}")
                report.append(f"   - ROI: {eval_data['potential_savings']}")
        
        if medium_priority_patterns:
            report.append("### 📊 ACTIONS SECONDAIRES (Moyenne Priorité)")
            for pattern in medium_priority_patterns:
                eval_data = evaluations[pattern]
                report.append(f"- **{pattern.upper()}**: {eval_data['total_hooks']} hooks, {eval_data['estimated_effort']}")
        
        # Plan d'action suggéré
        report.append("### 📋 PLAN D'ACTION SUGGÉRÉ")
        
        total_effort = sum(float(e['estimated_effort'].split()[0]) for e in evaluations.values() if e['priority'] in ['HAUTE', 'MOYENNE'])
        
        if total_effort <= 10:
            report.append("#### 🟢 FAISABILITÉ ÉLEVÉE")
            report.append(f"- **Effort total estimé**: {total_effort:.1f} jours")
            report.append("- **Approche**: Migration en une seule phase")
            report.append("- **Durée**: 2-3 semaines")
        elif total_effort <= 20:
            report.append("#### 🟡 FAISABILITÉ MODÉRÉE")
            report.append(f"- **Effort total estimé**: {total_effort:.1f} jours")
            report.append("- **Approche**: Migration en 2 phases")
            report.append("- **Phase 1**: Patterns haute priorité")
            report.append("- **Phase 2**: Patterns moyenne priorité")
            report.append("- **Durée**: 4-6 semaines")
        else:
            report.append("#### 🟠 FAISABILITÉ COMPLEXE")
            report.append(f"- **Effort total estimé**: {total_effort:.1f} jours")
            report.append("- **Approche**: Migration progressive sur 3+ phases")
            report.append("- **Priorisation stricte** requise")
            report.append("- **Durée**: 2-3 mois")
        
        # Risques et considérations
        report.append("## ⚠️ RISQUES ET CONSIDÉRATIONS")
        
        critical_hooks = [a for a in specific_analysis if 'CRITIQUE' in a['business_impact']]
        if critical_hooks:
            report.append("### 🚨 HOOKS CRITIQUES IDENTIFIÉS")
            for analysis in critical_hooks:
                hook_info = analysis['hook_info']
                report.append(f"- **{hook_info['name']}** ({hook_info['domain']}) - {analysis['business_impact']}")
        
        report.append("### 📋 MESURES DE MITIGATION")
        report.append("1. **Tests exhaustifs** pour tous les hooks critiques")
        report.append("2. **Migration progressive** avec rollback possible")
        report.append("3. **Documentation** des changements d'API")
        report.append("4. **Formation** de l'équipe sur les nouveaux patterns")
        report.append("5. **Monitoring** post-migration")
        
        return "\n".join(report)
    
    def _get_current_date(self):
        """Retourne la date actuelle formatée"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y à %H:%M")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    analyzer = GeneralizationCandidateAnalyzer(project_root)
    
    print("🚀 Analyse des candidats à la généralisation...")
    
    try:
        report = analyzer.generate_detailed_report()
        
        # Sauvegarde le rapport
        output_file = Path(project_root) / "tools" / "audit" / "candidats_generalisation.md"
        output_file.write_text(report, encoding='utf-8')
        
        print(f"✅ Rapport généré: {output_file}")
        print("\n" + "="*60)
        print(report)
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 