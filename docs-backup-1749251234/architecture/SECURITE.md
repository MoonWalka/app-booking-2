# Plan d'Action : Renforcement de la Sécurité

## 1. Gestion des Accès et des Données Sensibles

- **Objectif :** Assurer que l'accès aux données est correctement contrôlé et que les informations sensibles ne sont pas exposées.
- **Priorité :** Critique

### Actions :

1.  **Mettre en place et versionner les règles Firestore (`firestore.rules`)** :
    *   Contexte : Aucun fichier `firestore.rules` n'a été trouvé à la racine du projet. La documentation `docs/analyses/ANALYSES_AUDITS.md` mentionne que les règles sont gérées via la console Firebase, ce qui est moins traçable et plus sujet aux erreurs manuelles.
    *   Action : Créer un fichier `firestore.rules` à la racine du projet. Y définir des règles de sécurité granulaires pour chaque collection, en suivant le principe du moindre privilège. Tester ces règles avec l'émulateur Firestore ou les outils de test de règles Firebase.
    *   Versionner ce fichier dans le dépôt Git.
    *   Documentation : Documenter la structure des règles et la manière de les mettre à jour.

2.  **Revue des protections des formulaires (CSRF/Tokens)** :
    *   Contexte : Une utilisation de tokens semble être en place (hooks liés à `FormGenerator.js`, `FormResponsePage.js`, `useFormTokenValidation.js`).
    *   Action : Confirmer que tous les formulaires sensibles (modification de données, actions avec effets de bord) sont protégés contre les attaques CSRF. S'assurer que les tokens sont générés de manière sécurisée, ont une durée de vie limitée et sont correctement validés côté serveur (ou via des Cloud Functions sécurisées si applicable).

3.  **Prévention de l'exposition de données sensibles côté client** :
    *   Contexte : La configuration Firebase (`firebaseConfig`) est présente dans le code client, ce qui est normal pour les applications Firebase. Cependant, il faut s'assurer qu'aucune autre clé d'API sensible, mot de passe ou secret n'est codé en dur dans le code source client.
    *   Action : Confirmer que toutes les clés d'API tierces (si utilisées) et autres secrets sont gérés via des variables d'environnement (`.env.local` pour le développement, variables d'environnement du serveur d'hébergement pour la production) et ne sont jamais incluses dans le build frontend.
    *   Revoir spécifiquement le fichier `src/config/firebase.js` pour s'assurer qu'il ne contient que la configuration Firebase publique.

## 2. Prévention des Failles d'Injection

- **Objectif :** Protéger l'application contre les injections de code malveillant (XSS, NoSQL Injection, etc.).
- **Priorité :** Haute

### Actions :

1.  **Éviter `dangerouslySetInnerHTML`** :
    *   Contexte : Une utilisation de `dangerouslySetInnerHTML` a été détectée dans `src/components/contrats/ContratPDFWrapper.js` et `src/components/contrats/ContratTemplateEditor.js`.
    *   Action : Analyser en détail ces usages. Si possible, remplacer `dangerouslySetInnerHTML` par des alternatives plus sûres (ex: rendu direct de composants React, utilisation de bibliothèques de sanitization reconnues si le HTML provient d'une source non fiable).
    *   Si l'utilisation est inévitable (ex: éditeur WYSIWYG dont le contenu est contrôlé), s'assurer que le contenu HTML est systématiquement et rigoureusement épuré (sanitized) avant d'être injecté, en utilisant une bibliothèque robuste comme DOMPurify.

2.  **Prévenir les injections JavaScript** :
    *   Contexte : Aucune utilisation directe de `eval()` ou `new Function()` n'a été détectée, ce qui est positif.
    *   Action : Maintenir cette vigilance. S'assurer que toutes les données provenant de l'utilisateur ou de sources externes sont traitées comme non fiables et correctement échappées ou encodées avant d'être affichées ou utilisées dans des contextes sensibles.

3.  **Prévenir les injections NoSQL (Firestore)** :
    *   Contexte : Aucune concaténation directe de chaînes non validées dans les requêtes Firestore n'a été explicitement trouvée, mais la vigilance reste de mise.
    *   Action : Toujours utiliser les méthodes paramétrées des SDK Firebase pour construire les requêtes. Ne jamais construire des chemins de collection/document ou des filtres de requête par concaténation de chaînes provenant directement de l'entrée utilisateur sans validation et/ou sanitization stricte.
    *   S'appuyer sur les règles de sécurité Firestore (voir action 1.1) comme une défense en profondeur.

## Checklist de Sécurité

- [ ] Fichier `firestore.rules` créé, versionné et testé.
- [ ] Protection CSRF confirmée pour tous les formulaires sensibles.
- [ ] Aucune clé API sensible ou secret exposé côté client (hors `firebaseConfig`).
- [ ] Usages de `dangerouslySetInnerHTML` revus, sécurisés ou remplacés.
- [ ] Vigilance maintenue contre les injections JavaScript.
- [ ] Bonnes pratiques pour la construction des requêtes Firestore suivies.

