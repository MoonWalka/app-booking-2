#!/usr/bin/env python3
"""
Audit des dépendances entre hooks TourCraft
Analyse les hooks spécifiques qui pourraient être généralisés
et documente les dépendances entre hooks.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple

class HookDependencyAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.hooks_dir = self.project_root / "src" / "hooks"
        self.components_dir = self.project_root / "src" / "components"
        
        # Patterns pour identifier les hooks
        self.hook_import_pattern = re.compile(r'import\s+.*?from\s+[\'"]@?/?hooks/([^\'\"]+)[\'"]')
        self.hook_usage_pattern = re.compile(r'use[A-Z][a-zA-Z]*')
        self.generic_hooks = {
            'useGenericEntityDetails', 'useGenericEntityForm', 
            'useGenericEntitySearch', 'useGenericEntityList',
            'useGenericEntityDelete'
        }
        
        # Résultats de l'analyse
        self.hooks_inventory = {}
        self.dependencies = defaultdict(set)
        self.usage_stats = defaultdict(int)
        self.generic_adoption = defaultdict(list)
        self.domain_patterns = defaultdict(list)

    def scan_hooks_directory(self) -> Dict:
        """Scanne le répertoire hooks et inventorie tous les hooks"""
        print("🔍 Analyse du répertoire hooks...")
        
        for hook_file in self.hooks_dir.rglob("*.js"):
            if "__tests__" in str(hook_file) or "index.js" in hook_file.name:
                continue
                
            relative_path = hook_file.relative_to(self.hooks_dir)
            domain = relative_path.parts[0] if len(relative_path.parts) > 1 else "root"
            hook_name = hook_file.stem
            
            # Analyse du contenu du fichier
            content = self._read_file_safe(hook_file)
            if not content:
                continue
                
            hook_info = {
                'path': str(relative_path),
                'domain': domain,
                'name': hook_name,
                'file_size': len(content),
                'line_count': len(content.splitlines()),
                'imports': self._extract_imports(content),
                'exports': self._extract_exports(content),
                'uses_generic': self._uses_generic_hooks(content),
                'complexity_score': self._calculate_complexity(content),
                'is_wrapper': self._is_wrapper_hook(content),
                'deprecated': '@deprecated' in content or 'DEPRECATED' in content
            }
            
            self.hooks_inventory[f"{domain}/{hook_name}"] = hook_info
            
        return self.hooks_inventory

    def analyze_dependencies(self):
        """Analyse les dépendances entre hooks"""
        print("🔗 Analyse des dépendances...")
        
        for hook_key, hook_info in self.hooks_inventory.items():
            for import_path in hook_info['imports']:
                # Nettoie le chemin d'import
                clean_path = import_path.replace('@/hooks/', '').replace('../', '')
                if clean_path != hook_key:
                    self.dependencies[hook_key].add(clean_path)

    def analyze_usage_in_components(self):
        """Analyse l'utilisation des hooks dans les composants"""
        print("📊 Analyse de l'utilisation dans les composants...")
        
        for component_file in self.components_dir.rglob("*.js"):
            content = self._read_file_safe(component_file)
            if not content:
                continue
                
            # Trouve les imports de hooks
            imports = self.hook_import_pattern.findall(content)
            for import_path in imports:
                self.usage_stats[import_path] += 1
                
            # Analyse l'adoption des hooks génériques
            for generic_hook in self.generic_hooks:
                if generic_hook in content:
                    self.generic_adoption[generic_hook].append(str(component_file.relative_to(self.project_root)))

    def identify_generalization_candidates(self) -> Dict:
        """Identifie les hooks candidats à la généralisation"""
        print("🎯 Identification des candidats à la généralisation...")
        
        candidates = {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': [],
            'already_generic': []
        }
        
        # Groupe les hooks par patterns
        pattern_groups = defaultdict(list)
        
        for hook_key, hook_info in self.hooks_inventory.items():
            domain = hook_info['domain']
            name = hook_info['name']
            
            # Identifie les patterns communs
            if any(pattern in name.lower() for pattern in ['search', 'filter']):
                pattern_groups['search'].append((hook_key, hook_info))
            elif any(pattern in name.lower() for pattern in ['list', 'filters']):
                pattern_groups['list'].append((hook_key, hook_info))
            elif any(pattern in name.lower() for pattern in ['form', 'validation']):
                pattern_groups['form'].append((hook_key, hook_info))
            elif any(pattern in name.lower() for pattern in ['details', 'view']):
                pattern_groups['details'].append((hook_key, hook_info))
            elif any(pattern in name.lower() for pattern in ['delete', 'remove']):
                pattern_groups['delete'].append((hook_key, hook_info))
            elif any(pattern in name.lower() for pattern in ['status', 'state']):
                pattern_groups['status'].append((hook_key, hook_info))
            
            # Vérifie si déjà générique
            if hook_info['uses_generic']:
                candidates['already_generic'].append((hook_key, hook_info))
        
        # Évalue les candidats par priorité
        for pattern, hooks in pattern_groups.items():
            if len(hooks) >= 3:  # Au moins 3 hooks similaires
                for hook_key, hook_info in hooks:
                    if not hook_info['uses_generic'] and not hook_info['deprecated']:
                        usage_count = self.usage_stats.get(hook_info['path'], 0)
                        complexity = hook_info['complexity_score']
                        
                        if usage_count >= 5 and complexity >= 15:
                            candidates['high_priority'].append((hook_key, hook_info, pattern))
                        elif usage_count >= 2 and complexity >= 10:
                            candidates['medium_priority'].append((hook_key, hook_info, pattern))
                        else:
                            candidates['low_priority'].append((hook_key, hook_info, pattern))
        
        return candidates

    def analyze_domain_specific_hooks(self) -> Dict:
        """Analyse les hooks spécifiques par domaine"""
        print("🏗️ Analyse des hooks spécifiques par domaine...")
        
        domain_analysis = {}
        
        for domain in ['artistes', 'concerts', 'contrats', 'lieux', 'programmateurs', 'structures']:
            domain_hooks = [
                (key, info) for key, info in self.hooks_inventory.items() 
                if info['domain'] == domain
            ]
            
            if not domain_hooks:
                continue
                
            # Statistiques du domaine
            total_hooks = len(domain_hooks)
            generic_hooks = len([h for _, h in domain_hooks if h['uses_generic']])
            deprecated_hooks = len([h for _, h in domain_hooks if h['deprecated']])
            wrapper_hooks = len([h for _, h in domain_hooks if h['is_wrapper']])
            
            # Complexité moyenne
            avg_complexity = sum(h['complexity_score'] for _, h in domain_hooks) / total_hooks if total_hooks > 0 else 0
            
            # Patterns communs
            patterns = Counter()
            for _, hook_info in domain_hooks:
                name = hook_info['name'].lower()
                if 'search' in name: patterns['search'] += 1
                if 'list' in name or 'filter' in name: patterns['list'] += 1
                if 'form' in name: patterns['form'] += 1
                if 'details' in name: patterns['details'] += 1
                if 'delete' in name: patterns['delete'] += 1
                if 'status' in name or 'state' in name: patterns['status'] += 1
            
            domain_analysis[domain] = {
                'total_hooks': total_hooks,
                'generic_adoption': f"{generic_hooks}/{total_hooks} ({generic_hooks/total_hooks*100:.1f}%)" if total_hooks > 0 else "0%",
                'deprecated_hooks': deprecated_hooks,
                'wrapper_hooks': wrapper_hooks,
                'avg_complexity': round(avg_complexity, 1),
                'patterns': dict(patterns),
                'hooks': [(key, info['name'], info['complexity_score'], info['uses_generic']) for key, info in domain_hooks]
            }
        
        return domain_analysis

    def generate_dependency_graph(self) -> Dict:
        """Génère un graphe des dépendances"""
        print("📈 Génération du graphe des dépendances...")
        
        graph = {
            'nodes': [],
            'edges': [],
            'clusters': defaultdict(list)
        }
        
        # Noeuds
        for hook_key, hook_info in self.hooks_inventory.items():
            node = {
                'id': hook_key,
                'label': hook_info['name'],
                'domain': hook_info['domain'],
                'complexity': hook_info['complexity_score'],
                'uses_generic': hook_info['uses_generic'],
                'deprecated': hook_info['deprecated'],
                'usage_count': self.usage_stats.get(hook_info['path'], 0)
            }
            graph['nodes'].append(node)
            graph['clusters'][hook_info['domain']].append(hook_key)
        
        # Arêtes
        for source, targets in self.dependencies.items():
            for target in targets:
                graph['edges'].append({
                    'source': source,
                    'target': target,
                    'type': 'dependency'
                })
        
        return graph

    def _read_file_safe(self, file_path: Path) -> str:
        """Lit un fichier de manière sécurisée"""
        try:
            return file_path.read_text(encoding='utf-8')
        except Exception:
            return ""

    def _extract_imports(self, content: str) -> List[str]:
        """Extrait les imports de hooks"""
        imports = []
        for match in self.hook_import_pattern.finditer(content):
            imports.append(match.group(1))
        return imports

    def _extract_exports(self, content: str) -> List[str]:
        """Extrait les exports"""
        exports = []
        export_patterns = [
            r'export\s+(?:default\s+)?(?:const|function)\s+(\w+)',
            r'export\s+\{\s*([^}]+)\s*\}',
            r'export\s+default\s+(\w+)'
        ]
        
        for pattern in export_patterns:
            matches = re.findall(pattern, content)
            exports.extend(matches)
        
        return exports

    def _uses_generic_hooks(self, content: str) -> bool:
        """Vérifie si le hook utilise des hooks génériques"""
        return any(generic in content for generic in self.generic_hooks)

    def _calculate_complexity(self, content: str) -> int:
        """Calcule un score de complexité approximatif"""
        lines = content.splitlines()
        score = 0
        
        # Facteurs de complexité
        score += len(lines) // 10  # Longueur
        score += content.count('useState') * 2
        score += content.count('useEffect') * 3
        score += content.count('useCallback') * 2
        score += content.count('useMemo') * 2
        score += content.count('if (') + content.count('if(')
        score += content.count('for (') + content.count('for(')
        score += content.count('while (') + content.count('while(')
        score += content.count('try {') * 2
        score += content.count('catch') * 2
        
        return score

    def _is_wrapper_hook(self, content: str) -> bool:
        """Détermine si c'est un hook wrapper"""
        return (
            any(generic in content for generic in self.generic_hooks) and
            content.count('return') <= 2 and
            len(content.splitlines()) < 50
        )

    def generate_report(self) -> str:
        """Génère le rapport d'audit complet"""
        print("📋 Génération du rapport...")
        
        # Exécute toutes les analyses
        self.scan_hooks_directory()
        self.analyze_dependencies()
        self.analyze_usage_in_components()
        candidates = self.identify_generalization_candidates()
        domain_analysis = self.analyze_domain_specific_hooks()
        dependency_graph = self.generate_dependency_graph()
        
        # Génère le rapport
        report = []
        report.append("# 🔍 AUDIT DES DÉPENDANCES ENTRE HOOKS TOURCRAFT")
        report.append(f"*Généré le: {self._get_current_date()}*\n")
        
        # Résumé exécutif
        report.append("## 📊 RÉSUMÉ EXÉCUTIF")
        report.append(f"- **Total hooks analysés**: {len(self.hooks_inventory)}")
        report.append(f"- **Hooks utilisant des génériques**: {len(candidates['already_generic'])}")
        report.append(f"- **Candidats haute priorité**: {len(candidates['high_priority'])}")
        report.append(f"- **Candidats moyenne priorité**: {len(candidates['medium_priority'])}")
        report.append(f"- **Dépendances identifiées**: {sum(len(deps) for deps in self.dependencies.values())}")
        report.append("")
        
        # Analyse par domaine
        report.append("## 🏗️ ANALYSE PAR DOMAINE")
        for domain, analysis in domain_analysis.items():
            report.append(f"### {domain.upper()}")
            report.append(f"- **Total hooks**: {analysis['total_hooks']}")
            report.append(f"- **Adoption génériques**: {analysis['generic_adoption']}")
            report.append(f"- **Hooks dépréciés**: {analysis['deprecated_hooks']}")
            report.append(f"- **Hooks wrappers**: {analysis['wrapper_hooks']}")
            report.append(f"- **Complexité moyenne**: {analysis['avg_complexity']}")
            
            if analysis['patterns']:
                report.append("- **Patterns identifiés**:")
                for pattern, count in analysis['patterns'].items():
                    report.append(f"  - {pattern}: {count} hooks")
            report.append("")
        
        # Candidats à la généralisation
        report.append("## 🎯 CANDIDATS À LA GÉNÉRALISATION")
        
        report.append("### ⚡ HAUTE PRIORITÉ")
        if candidates['high_priority']:
            for hook_key, hook_info, pattern in candidates['high_priority']:
                usage = self.usage_stats.get(hook_info['path'], 0)
                report.append(f"- **{hook_info['name']}** ({hook_info['domain']})")
                report.append(f"  - Pattern: {pattern}")
                report.append(f"  - Complexité: {hook_info['complexity_score']}")
                report.append(f"  - Utilisation: {usage} composants")
                report.append(f"  - Lignes: {hook_info['line_count']}")
        else:
            report.append("*Aucun candidat haute priorité identifié*")
        report.append("")
        
        report.append("### 📊 MOYENNE PRIORITÉ")
        if candidates['medium_priority']:
            for hook_key, hook_info, pattern in candidates['medium_priority'][:10]:  # Limite à 10
                usage = self.usage_stats.get(hook_info['path'], 0)
                report.append(f"- **{hook_info['name']}** ({hook_info['domain']}) - {pattern} - Complexité: {hook_info['complexity_score']} - Usage: {usage}")
        else:
            report.append("*Aucun candidat moyenne priorité identifié*")
        report.append("")
        
        # Hooks déjà migrés
        report.append("## ✅ HOOKS DÉJÀ MIGRÉS VERS LES GÉNÉRIQUES")
        if candidates['already_generic']:
            for hook_key, hook_info in candidates['already_generic']:
                report.append(f"- **{hook_info['name']}** ({hook_info['domain']}) - {hook_info['line_count']} lignes")
        else:
            report.append("*Aucun hook migré identifié*")
        report.append("")
        
        # Dépendances critiques
        report.append("## 🔗 DÉPENDANCES CRITIQUES")
        critical_deps = [(hook, deps) for hook, deps in self.dependencies.items() if len(deps) >= 3]
        if critical_deps:
            for hook, deps in critical_deps[:10]:
                report.append(f"- **{hook}**: {len(deps)} dépendances")
                for dep in list(deps)[:5]:
                    report.append(f"  - {dep}")
                if len(deps) > 5:
                    report.append(f"  - ... et {len(deps) - 5} autres")
        else:
            report.append("*Aucune dépendance critique identifiée*")
        report.append("")
        
        # Recommandations
        report.append("## 💡 RECOMMANDATIONS")
        
        # Calcul des métriques pour les recommandations
        total_hooks = len(self.hooks_inventory)
        generic_adoption_rate = len(candidates['already_generic']) / total_hooks * 100 if total_hooks > 0 else 0
        high_priority_count = len(candidates['high_priority'])
        
        if generic_adoption_rate < 50:
            report.append("### 🚨 PRIORITÉ CRITIQUE")
            report.append(f"- **Taux d'adoption des génériques**: {generic_adoption_rate:.1f}% (objectif: >80%)")
            report.append("- **Action**: Accélérer la migration vers les hooks génériques")
        
        if high_priority_count > 0:
            report.append("### ⚡ ACTIONS IMMÉDIATES")
            report.append(f"- **{high_priority_count} hooks haute priorité** à migrer")
            report.append("- **Focus**: Hooks avec forte utilisation et complexité élevée")
        
        report.append("### 📋 PLAN D'ACTION SUGGÉRÉ")
        report.append("1. **Documentation des dépendances**: Créer une cartographie détaillée")
        report.append("2. **Migration progressive**: Commencer par les hooks haute priorité")
        report.append("3. **Standardisation**: Établir des patterns clairs pour chaque type")
        report.append("4. **Tests**: Assurer la couverture des hooks migrés")
        report.append("5. **Formation**: Sensibiliser l'équipe aux hooks génériques")
        
        # Faisabilité
        report.append("## ✅ ÉVALUATION DE FAISABILITÉ")
        
        feasible_count = len(candidates['high_priority']) + len(candidates['medium_priority'])
        already_migrated = len(candidates['already_generic'])
        
        if feasible_count <= 10:
            report.append("### 🟢 FAISABILITÉ ÉLEVÉE")
            report.append(f"- **{feasible_count} hooks** à migrer (charge raisonnable)")
            report.append(f"- **{already_migrated} hooks** déjà migrés (base solide)")
            report.append("- **Estimation**: 2-3 semaines de travail")
        elif feasible_count <= 20:
            report.append("### 🟡 FAISABILITÉ MODÉRÉE")
            report.append(f"- **{feasible_count} hooks** à migrer (charge importante)")
            report.append("- **Recommandation**: Migration par phases")
            report.append("- **Estimation**: 4-6 semaines de travail")
        else:
            report.append("### 🟠 FAISABILITÉ COMPLEXE")
            report.append(f"- **{feasible_count} hooks** à migrer (charge très importante)")
            report.append("- **Recommandation**: Priorisation stricte et migration étalée")
            report.append("- **Estimation**: 2-3 mois de travail")
        
        return "\n".join(report)

    def _get_current_date(self) -> str:
        """Retourne la date actuelle formatée"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y à %H:%M")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    analyzer = HookDependencyAnalyzer(project_root)
    
    print("🚀 Démarrage de l'audit des dépendances entre hooks...")
    
    try:
        report = analyzer.generate_report()
        
        # Sauvegarde le rapport
        output_file = Path(project_root) / "tools" / "audit" / "rapport_dependances_hooks.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(report, encoding='utf-8')
        
        print(f"✅ Rapport généré: {output_file}")
        print("\n" + "="*60)
        print(report)
        
        # Sauvegarde aussi les données JSON pour analyse ultérieure
        json_file = output_file.with_suffix('.json')
        json_data = {
            'hooks_inventory': analyzer.hooks_inventory,
            'dependencies': {k: list(v) for k, v in analyzer.dependencies.items()},
            'usage_stats': dict(analyzer.usage_stats),
            'generic_adoption': {k: list(v) for k, v in analyzer.generic_adoption.items()}
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Données JSON sauvegardées: {json_file}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'audit: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 