# 🎯 Plan de Migration Sans Risque - Système Contacts

## Principe : Actions minimales, impact maximal, zéro sur-ingénierie

### ✅ Phase 1 : Nettoyage immédiat (5 minutes)

#### Action 1.1 : Identifier l'unique import de contactService
```bash
grep -r "from.*contactService['\"]" src/ --include="*.js" | grep -v "contactServiceRelational"
```

#### Action 1.2 : Remplacer par contactServiceRelational
- Changer l'import
- Vérifier que ça compile

#### Action 1.3 : Supprimer contactService.js
```bash
rm src/services/contactService.js
```

**Risque : ZÉRO** - Un seul fichier à modifier

---

### 🔧 Phase 2 : Migration simple des affichages (30 minutes)

#### Action 2.1 : Migrer ConcertOrganizerSection.js

**Fichier confirmé** : `src/components/concerts/desktop/ConcertOrganizerSection.js`

**Changements simples** :
```javascript
// AVANT
contact.structure || contact.structureNom

// APRÈS  
contact.structures?.[0]?.nom || contact.structureNom
```

**Lignes à modifier** : 
- Ligne avec `contact.structure`
- Ligne avec `contact.structureAdresse`

**Test** : Ouvrir une fiche concert, vérifier l'affichage

---

### 📝 Phase 3 : Adapter les sélecteurs (1 heure)

#### Action 3.1 : Lister les 4 UnifiedContactSelector

```bash
find src/ -name "*UnifiedContactSelector*"
```

#### Action 3.2 : Pour chaque fichier
1. Vérifier s'il est utilisé (grep sur le nom du composant)
2. Si utilisé : adapter pour utiliser contactServiceRelational
3. Si non utilisé : le supprimer

**Point d'attention** : Ne PAS refactoriser, juste changer le service

---

### 🔄 Phase 4 : Hooks minimaux (2 heures)

#### Action 4.1 : Identifier les 5 hooks exactement

```bash
grep -r "collection(db, ['\"]contacts['\"]" src/hooks --include="*.js" | cut -d: -f1 | sort | uniq
```

#### Action 4.2 : Pour chaque hook
1. Vérifier s'il a un équivalent relationnel
2. Si oui : rediriger vers l'équivalent
3. Si non : adapter a minima pour chercher dans structures/personnes

**Exemple de redirection simple** :
```javascript
// Au lieu de refactoriser, juste rediriger
export { useContactsRelational as default } from './useContactsRelational';
```

---

### 🚫 CE QU'ON NE FAIT PAS

1. **On ne touche PAS** :
   - ContactFormUnified (formulaire de compatibilité)
   - Scripts de migration dans /debug/
   - Les 39 références à contacts_unified (scripts de debug)

2. **On ne refactorise PAS** :
   - Pas de réécriture complète
   - Pas de changement d'architecture
   - Pas de migration massive

3. **On ne migre PAS** :
   - Le format personne1/2/3 (24 occurrences) - trop complexe
   - Les contactsIds (21 occurrences) - risque de casser les relations

---

### 📊 Résultat attendu

Après ces 4 phases simples :
- **-50% de références** à l'ancien système
- **Zéro risque** de régression
- **3-4 heures** de travail maximum

### 🎯 Critères de succès

1. L'application compile sans erreur
2. Les concerts affichent toujours les contacts
3. Les sélecteurs de contacts fonctionnent
4. Pas de régression visible

### ⏭️ Prochaine itération (plus tard)

Une fois ces changements validés et stables, on pourra envisager :
- Migration du format personne1/2/3
- Nettoyage des scripts de debug
- Migration complète de ContactFormUnified

Mais **PAS MAINTENANT** - Une étape à la fois !