ANALYSE COMPLÈTE TERMINÉE

🎯 LE VRAI PROBLÈME (architecture globale) :

Ce n'est PAS ContactViewTabs qui a un problème - c'est
l'architecture d'onglets entière !

🔍 Voici ce qui se passe VRAIMENT :

1. Chaque clic sur contact → openContactTab() créé un
NOUVEL onglet
2. TabManagerProduction → Recreate <ContactViewTabs
key={...}>
3. React démonte/remonte complètement le composant
4. useUnifiedContact redémarre avec loading: true
5. EntityViewTabs affiche spinner automatiquement

🏗️ Pourquoi les autres pages n'ont pas ce problème :

| ContactViewTabs | ConcertsPage/autres |
| --- | --- |
| ✗ Système d'onglets complexe | ✅ Navigation directe |
| ✗ Key dynamique qui change | ✅ Pas de key |
| ✗ Remontage forcé | ✅ Composant préservé |
| ✗ Loading à chaque navigation | ✅ Pas de loading hook |

🎯 TOUS les problèmes identifiés :

1. TabsContext créé toujours de nouveaux onglets
2. TabManagerProduction utilise des keys qui changent
3. useUnifiedContact redémarre avec loading: true
4. EntityViewTabs affiche automatiquement le spinner
5. Pas de cache de composants montés

🧠 Recul architectural :

Le problème n'est PAS technique mais CONCEPTUEL :

- ContactViewTabs est traité comme une "page" mais
fonctionne comme un "onglet"
- L'architecture mélange navigation et système d'onglets
- Aucune persistance des composants montés

Il faut repenser TOUT le système d'onglets, pas juste
ContactViewTabs.

Si MÊME l'architecture d'onglets ne résout pas le
problème...

Solution de dernier recours : Bypass complet

1. Supprimer le système d'onglets pour ContactViewTabs
// Au lieu de passer par TabManager
// Naviguer directement avec React Router
navigate(`/contacts/${contactId}`);
2. Route directe sans onglets
// Dans App.js
<Route path="/contacts/:id" element={<ContactViewTabs />}
/>
3. ContactViewTabs devient une vraie page
- Plus de passage par TabManager
- Plus de système d'onglets complexe
- Navigation standard React Router
- Même comportement que ContactsList

Pourquoi ça marcherait :

ContactsList fonctionne parce qu'elle n'utilise PAS le
système d'onglets :

- Route directe : /contacts → <ContactsList>
- Pas de TabManager
- Pas de key dynamique
- Pas de démontage/remontage

ContactViewTabs planterait parce qu'elle utilise le système
d'onglets :

- Passage par TabManager
- Key qui change
- Démontage/remontage forcé

Solution finale :

Traiter ContactViewTabs EXACTEMENT comme ContactsList :

1. Route directe au lieu d'onglet
2. Navigation standard au lieu de openContactTab()
3. Pas de TabManager du tout pour les contacts
4. Même pattern que toutes les pages qui fonctionnent

Ça reviendrait à dire : "Le système d'onglets est
fondamentalement cassé pour les composants complexes, alors
on l'évite complètement."

Cette solution-là marcherait forcément car elle copie
exactement ce qui fonctionne déjà (ContactsList).