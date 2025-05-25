#!/usr/bin/env python3
"""
Analyse de la documentation des dépendances entre hooks
Évalue la qualité de la documentation existante et identifie
les améliorations possibles pour documenter les dépendances.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter

class HookDocumentationAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.docs_dir = self.project_root / "docs"
        self.hooks_dir = self.project_root / "src" / "hooks"
        
        # Patterns pour analyser la documentation
        self.dependency_patterns = [
            r'dépend(?:ance)?s?\s+(?:de|sur|avec)',
            r'utilise\s+(?:le\s+hook|les\s+hooks)',
            r'import.*from.*hooks',
            r'relation(?:s)?\s+avec',
            r'connecté\s+(?:à|avec)',
            r'basé\s+sur'
        ]
        
        self.documentation_quality_indicators = [
            r'@param',
            r'@returns?',
            r'@example',
            r'@deprecated',
            r'@see',
            r'@since',
            r'@description'
        ]
        
        # Résultats de l'analyse
        self.documentation_inventory = {}
        self.dependency_documentation = defaultdict(list)
        self.quality_scores = {}
        
    def scan_documentation(self):
        """Scanne toute la documentation liée aux hooks"""
        print("📚 Analyse de la documentation hooks...")
        
        # Analyse des fichiers de documentation hooks
        hooks_docs_dir = self.docs_dir / "hooks"
        if hooks_docs_dir.exists():
            for doc_file in hooks_docs_dir.rglob("*.md"):
                self._analyze_doc_file(doc_file, "hooks_docs")
        
        # Analyse des fichiers README dans les dossiers hooks
        for hook_dir in self.hooks_dir.iterdir():
            if hook_dir.is_dir():
                readme_file = hook_dir / "README.md"
                if readme_file.exists():
                    self._analyze_doc_file(readme_file, f"hook_readme_{hook_dir.name}")
        
        # Analyse des commentaires dans les fichiers hooks
        for hook_file in self.hooks_dir.rglob("*.js"):
            if "__tests__" not in str(hook_file) and "index.js" not in hook_file.name:
                self._analyze_hook_file_comments(hook_file)
    
    def _analyze_doc_file(self, file_path: Path, category: str):
        """Analyse un fichier de documentation"""
        try:
            content = file_path.read_text(encoding='utf-8')
            relative_path = file_path.relative_to(self.project_root)
            
            doc_info = {
                'path': str(relative_path),
                'category': category,
                'file_size': len(content),
                'line_count': len(content.splitlines()),
                'dependency_mentions': self._find_dependency_mentions(content),
                'quality_score': self._calculate_doc_quality(content),
                'sections': self._extract_sections(content),
                'hook_references': self._find_hook_references(content),
                'missing_elements': self._identify_missing_elements(content)
            }
            
            self.documentation_inventory[str(relative_path)] = doc_info
            
        except Exception as e:
            print(f"⚠️ Erreur lors de l'analyse de {file_path}: {e}")
    
    def _analyze_hook_file_comments(self, file_path: Path):
        """Analyse les commentaires dans un fichier hook"""
        try:
            content = file_path.read_text(encoding='utf-8')
            relative_path = file_path.relative_to(self.hooks_dir)
            
            # Extrait les commentaires JSDoc
            jsdoc_pattern = r'/\*\*(.*?)\*/'
            jsdoc_comments = re.findall(jsdoc_pattern, content, re.DOTALL)
            
            # Extrait les commentaires inline
            inline_pattern = r'//\s*(.*?)$'
            inline_comments = re.findall(inline_pattern, content, re.MULTILINE)
            
            hook_info = {
                'path': str(relative_path),
                'category': 'hook_file',
                'jsdoc_comments': len(jsdoc_comments),
                'inline_comments': len(inline_comments),
                'has_description': any('description' in comment.lower() for comment in jsdoc_comments),
                'has_params_doc': any('@param' in comment for comment in jsdoc_comments),
                'has_returns_doc': any('@return' in comment for comment in jsdoc_comments),
                'has_examples': any('@example' in comment for comment in jsdoc_comments),
                'dependency_mentions': self._find_dependency_mentions(content),
                'documentation_ratio': self._calculate_documentation_ratio(content)
            }
            
            self.documentation_inventory[f"hook_file_{relative_path}"] = hook_info
            
        except Exception as e:
            print(f"⚠️ Erreur lors de l'analyse de {file_path}: {e}")
    
    def _find_dependency_mentions(self, content: str) -> list:
        """Trouve les mentions de dépendances dans le contenu"""
        mentions = []
        for pattern in self.dependency_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                # Extrait le contexte autour de la mention
                start = max(0, match.start() - 50)
                end = min(len(content), match.end() + 50)
                context = content[start:end].replace('\n', ' ').strip()
                mentions.append({
                    'pattern': pattern,
                    'context': context,
                    'position': match.start()
                })
        return mentions
    
    def _calculate_doc_quality(self, content: str) -> int:
        """Calcule un score de qualité de la documentation"""
        score = 0
        
        # Points pour la structure
        if '# ' in content: score += 10  # Titre principal
        if '## ' in content: score += 10  # Sections
        if '### ' in content: score += 5   # Sous-sections
        
        # Points pour le contenu
        if 'exemple' in content.lower() or 'example' in content.lower(): score += 15
        if 'utilisation' in content.lower() or 'usage' in content.lower(): score += 10
        if 'paramètre' in content.lower() or 'parameter' in content.lower(): score += 10
        if 'retour' in content.lower() or 'return' in content.lower(): score += 10
        
        # Points pour les références
        if 'voir aussi' in content.lower() or 'see also' in content.lower(): score += 5
        if 'dépendance' in content.lower() or 'dependency' in content.lower(): score += 15
        
        # Points pour les indicateurs de qualité
        for indicator in self.documentation_quality_indicators:
            if re.search(indicator, content, re.IGNORECASE):
                score += 5
        
        # Bonus pour la longueur (documentation détaillée)
        if len(content) > 1000: score += 10
        if len(content) > 2000: score += 5
        
        return min(score, 100)  # Maximum 100
    
    def _extract_sections(self, content: str) -> list:
        """Extrait les sections de la documentation"""
        sections = []
        section_pattern = r'^(#{1,6})\s+(.+)$'
        
        for match in re.finditer(section_pattern, content, re.MULTILINE):
            level = len(match.group(1))
            title = match.group(2).strip()
            sections.append({
                'level': level,
                'title': title,
                'position': match.start()
            })
        
        return sections
    
    def _find_hook_references(self, content: str) -> list:
        """Trouve les références à des hooks dans le contenu"""
        hook_pattern = r'use[A-Z][a-zA-Z]*(?:Hook)?'
        references = []
        
        for match in re.finditer(hook_pattern, content):
            hook_name = match.group(0)
            # Extrait le contexte
            start = max(0, match.start() - 30)
            end = min(len(content), match.end() + 30)
            context = content[start:end].replace('\n', ' ').strip()
            
            references.append({
                'hook_name': hook_name,
                'context': context,
                'position': match.start()
            })
        
        return references
    
    def _identify_missing_elements(self, content: str) -> list:
        """Identifie les éléments manquants dans la documentation"""
        missing = []
        
        # Vérifie la présence d'éléments essentiels
        essential_elements = {
            'description': ['description', 'objectif', 'purpose'],
            'usage': ['utilisation', 'usage', 'comment utiliser'],
            'parameters': ['paramètre', 'parameter', 'props'],
            'returns': ['retour', 'return', 'valeur retournée'],
            'examples': ['exemple', 'example'],
            'dependencies': ['dépendance', 'dependency', 'require']
        }
        
        for element, keywords in essential_elements.items():
            if not any(keyword in content.lower() for keyword in keywords):
                missing.append(element)
        
        return missing
    
    def _calculate_documentation_ratio(self, content: str) -> float:
        """Calcule le ratio de documentation par rapport au code"""
        lines = content.splitlines()
        comment_lines = 0
        code_lines = 0
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            elif stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
                comment_lines += 1
            else:
                code_lines += 1
        
        if code_lines == 0:
            return 0.0
        
        return comment_lines / (comment_lines + code_lines)
    
    def analyze_dependency_documentation_gaps(self):
        """Analyse les lacunes dans la documentation des dépendances"""
        print("🔍 Analyse des lacunes de documentation...")
        
        gaps = {
            'undocumented_dependencies': [],
            'poorly_documented_hooks': [],
            'missing_relationship_docs': [],
            'inconsistent_documentation': []
        }
        
        # Charge les données d'audit des hooks
        audit_file = self.project_root / "tools" / "audit" / "rapport_dependances_hooks.json"
        if audit_file.exists():
            with open(audit_file, 'r', encoding='utf-8') as f:
                audit_data = json.load(f)
            
            # Analyse chaque hook
            for hook_key, hook_info in audit_data['hooks_inventory'].items():
                hook_doc_key = f"hook_file_{hook_info['path']}"
                
                # Vérifie si le hook a de la documentation
                if hook_doc_key in self.documentation_inventory:
                    doc_info = self.documentation_inventory[hook_doc_key]
                    
                    # Hook mal documenté
                    if doc_info['documentation_ratio'] < 0.1:  # Moins de 10% de commentaires
                        gaps['poorly_documented_hooks'].append({
                            'hook': hook_key,
                            'ratio': doc_info['documentation_ratio'],
                            'reason': 'Ratio de documentation faible'
                        })
                    
                    # Dépendances non documentées
                    if hook_info.get('imports') and not doc_info['dependency_mentions']:
                        gaps['undocumented_dependencies'].append({
                            'hook': hook_key,
                            'dependencies': hook_info['imports'],
                            'reason': 'Dépendances non documentées'
                        })
                
                else:
                    # Hook sans documentation du tout
                    gaps['poorly_documented_hooks'].append({
                        'hook': hook_key,
                        'ratio': 0.0,
                        'reason': 'Aucune documentation trouvée'
                    })
        
        return gaps
    
    def generate_documentation_improvement_plan(self):
        """Génère un plan d'amélioration de la documentation"""
        print("📋 Génération du plan d'amélioration...")
        
        self.scan_documentation()
        gaps = self.analyze_dependency_documentation_gaps()
        
        # Analyse de la qualité globale
        total_docs = len(self.documentation_inventory)
        avg_quality = sum(doc.get('quality_score', 0) for doc in self.documentation_inventory.values()) / total_docs if total_docs > 0 else 0
        
        # Statistiques par catégorie
        category_stats = defaultdict(list)
        for doc_info in self.documentation_inventory.values():
            category_stats[doc_info['category']].append(doc_info.get('quality_score', 0))
        
        plan = []
        plan.append("# 📚 PLAN D'AMÉLIORATION DE LA DOCUMENTATION DES HOOKS")
        plan.append(f"*Généré le: {self._get_current_date()}*\n")
        
        # État actuel
        plan.append("## 📊 ÉTAT ACTUEL DE LA DOCUMENTATION")
        plan.append(f"- **Documents analysés**: {total_docs}")
        plan.append(f"- **Qualité moyenne**: {avg_quality:.1f}/100")
        plan.append(f"- **Hooks mal documentés**: {len(gaps['poorly_documented_hooks'])}")
        plan.append(f"- **Dépendances non documentées**: {len(gaps['undocumented_dependencies'])}")
        plan.append("")
        
        # Analyse par catégorie
        plan.append("## 🏗️ ANALYSE PAR CATÉGORIE")
        for category, scores in category_stats.items():
            if scores:
                avg_score = sum(scores) / len(scores)
                plan.append(f"### {category.upper()}")
                plan.append(f"- **Documents**: {len(scores)}")
                plan.append(f"- **Qualité moyenne**: {avg_score:.1f}/100")
                plan.append("")
        
        # Problèmes identifiés
        plan.append("## ⚠️ PROBLÈMES IDENTIFIÉS")
        
        plan.append("### 📉 HOOKS MAL DOCUMENTÉS")
        if gaps['poorly_documented_hooks']:
            for hook_info in gaps['poorly_documented_hooks'][:10]:  # Top 10
                plan.append(f"- **{hook_info['hook']}**: {hook_info['reason']} (ratio: {hook_info['ratio']:.2f})")
        else:
            plan.append("*Aucun problème majeur identifié*")
        plan.append("")
        
        plan.append("### 🔗 DÉPENDANCES NON DOCUMENTÉES")
        if gaps['undocumented_dependencies']:
            for dep_info in gaps['undocumented_dependencies'][:10]:  # Top 10
                plan.append(f"- **{dep_info['hook']}**: {len(dep_info['dependencies'])} dépendances non documentées")
                for dep in dep_info['dependencies'][:3]:  # Première 3 dépendances
                    plan.append(f"  - {dep}")
        else:
            plan.append("*Toutes les dépendances sont documentées*")
        plan.append("")
        
        # Recommandations
        plan.append("## 💡 RECOMMANDATIONS D'AMÉLIORATION")
        
        # Priorités basées sur l'analyse
        high_priority_hooks = [h for h in gaps['poorly_documented_hooks'] if h['ratio'] < 0.05]
        medium_priority_hooks = [h for h in gaps['poorly_documented_hooks'] if 0.05 <= h['ratio'] < 0.15]
        
        plan.append("### ⚡ PRIORITÉ HAUTE")
        if high_priority_hooks:
            plan.append(f"**{len(high_priority_hooks)} hooks** nécessitent une documentation urgente:")
            for hook_info in high_priority_hooks[:5]:
                plan.append(f"- {hook_info['hook']}")
        else:
            plan.append("*Aucune action urgente requise*")
        plan.append("")
        
        plan.append("### 📊 PRIORITÉ MOYENNE")
        if medium_priority_hooks:
            plan.append(f"**{len(medium_priority_hooks)} hooks** nécessitent une amélioration de documentation:")
            for hook_info in medium_priority_hooks[:5]:
                plan.append(f"- {hook_info['hook']}")
        plan.append("")
        
        # Plan d'action
        plan.append("## 📋 PLAN D'ACTION DÉTAILLÉ")
        
        total_work = len(high_priority_hooks) + len(medium_priority_hooks) + len(gaps['undocumented_dependencies'])
        
        plan.append("### 🎯 OBJECTIFS")
        plan.append("1. **Documenter toutes les dépendances entre hooks**")
        plan.append("2. **Améliorer la qualité de documentation** (objectif: >80/100)")
        plan.append("3. **Standardiser le format** de documentation")
        plan.append("4. **Créer des exemples d'utilisation** pour chaque hook")
        plan.append("")
        
        plan.append("### 📅 PHASES D'EXÉCUTION")
        
        if total_work <= 20:
            plan.append("#### 🟢 FAISABILITÉ ÉLEVÉE")
            plan.append(f"- **Travail total**: {total_work} éléments à documenter")
            plan.append("- **Durée estimée**: 1-2 semaines")
            plan.append("- **Approche**: Documentation en une seule phase")
        elif total_work <= 50:
            plan.append("#### 🟡 FAISABILITÉ MODÉRÉE")
            plan.append(f"- **Travail total**: {total_work} éléments à documenter")
            plan.append("- **Durée estimée**: 3-4 semaines")
            plan.append("- **Phase 1**: Hooks priorité haute + dépendances critiques")
            plan.append("- **Phase 2**: Hooks priorité moyenne + amélioration générale")
        else:
            plan.append("#### 🟠 FAISABILITÉ COMPLEXE")
            plan.append(f"- **Travail total**: {total_work} éléments à documenter")
            plan.append("- **Durée estimée**: 6-8 semaines")
            plan.append("- **Approche progressive** par domaine métier")
        
        # Templates et standards
        plan.append("### 📝 TEMPLATES ET STANDARDS")
        plan.append("#### Template de documentation hook:")
        plan.append("```javascript")
        plan.append("/**")
        plan.append(" * @description Description claire du hook")
        plan.append(" * @param {Object} config - Configuration du hook")
        plan.append(" * @param {string} config.entityType - Type d'entité")
        plan.append(" * @returns {Object} État et méthodes du hook")
        plan.append(" * @example")
        plan.append(" * const { data, loading } = useMyHook({ entityType: 'concerts' });")
        plan.append(" * @dependencies")
        plan.append(" * - useGenericEntityDetails")
        plan.append(" * - useEntityValidation")
        plan.append(" */")
        plan.append("```")
        plan.append("")
        
        # Outils et automatisation
        plan.append("### 🛠️ OUTILS ET AUTOMATISATION")
        plan.append("1. **Script de validation** de la documentation")
        plan.append("2. **Linter personnalisé** pour les commentaires JSDoc")
        plan.append("3. **Génération automatique** de la documentation des dépendances")
        plan.append("4. **Tests de documentation** dans la CI/CD")
        plan.append("")
        
        # Métriques de suivi
        plan.append("### 📈 MÉTRIQUES DE SUIVI")
        plan.append("- **Ratio de documentation** par hook (objectif: >20%)")
        plan.append("- **Score de qualité** par document (objectif: >80/100)")
        plan.append("- **Couverture des dépendances** (objectif: 100%)")
        plan.append("- **Temps de compréhension** pour nouveaux développeurs")
        
        return "\n".join(plan)
    
    def _get_current_date(self):
        """Retourne la date actuelle formatée"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y à %H:%M")

def main():
    """Fonction principale"""
    project_root = os.getcwd()
    analyzer = HookDocumentationAnalyzer(project_root)
    
    print("🚀 Analyse de la documentation des hooks...")
    
    try:
        plan = analyzer.generate_documentation_improvement_plan()
        
        # Sauvegarde le plan
        output_file = Path(project_root) / "tools" / "audit" / "plan_amelioration_documentation.md"
        output_file.write_text(plan, encoding='utf-8')
        
        print(f"✅ Plan généré: {output_file}")
        print("\n" + "="*60)
        print(plan)
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 