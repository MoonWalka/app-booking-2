[Log] [DEBUG][ProgrammateurDetails] APRES imports (bundle.js, line 384226)
[Log] [UEF] Hook useEntrepriseForm importé (bundle.js, line 424511)
[Log]  (bundle.js, line 402718)
📊 Pour utiliser l'outil de diagnostic de performance:
1. Démarrer: performanceDiagnostic.start()
2. Naviguer vers la page Concerts et interagir avec l'application
3. Arrêter et voir le rapport: performanceDiagnostic.stop()

[Warning] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (bundle.js, line 316515)
[Warning] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (bundle.js, line 316515)
[Log] Recherche de formulaire pour le concert: – "con-1748478427366-7jpzsj" (bundle.js, line 415960)
[Log] Concert trouvé: – {id: "con-1748478427366-7jpzsj", programmateurNom: "lolo", titre: "testre", …} (bundle.js, line 415975)
{id: "con-1748478427366-7jpzsj", programmateurNom: "lolo", titre: "testre", lieuId: "", description: "", …}Object
[Log] Recherche dans formSubmissions par concertId (bundle.js, line 415999)
[Log] Soumissions trouvées: – 1 (bundle.js, line 416027)
[Log] FormSubmissionId sélectionné: – "mDEoBPH1Q3TrynwDWBcL" (bundle.js, line 416042)
[Log] Soumission trouvée: – {id: "mDEoBPH1Q3TrynwDWBcL", formLinkId: "Hh10PXfrsCL4w88VH6gn", lieuData: Object, …} (bundle.js, line 416053)
{id: "mDEoBPH1Q3TrynwDWBcL", formLinkId: "Hh10PXfrsCL4w88VH6gn", lieuData: Object, submittedAt: Timestamp, rawData: Object, …}Object
[Log] Données de lieu trouvées dans la soumission: – {adresse: "", codePostal: "", nom: "", …} (bundle.js, line 416068)
{adresse: "", codePostal: "", nom: "", capacite: "", ville: ""}Object
[Error] Error: Objects are not valid as a React child (found: object with keys {adresse, pays, tva, ville, type, codePostal, raisonSociale, siret}). If you meant to render a collection of children, use an array instead.
	throwOnInvalidObjectType (bundle.js:271356:278)
	reconcileChildFibers (bundle.js:272132)
	reconcileChildren (bundle.js:276547)
	updateHostComponent (bundle.js:277198)
	callCallback (bundle.js:263608)
	dispatchEvent
	invokeGuardedCallbackDev (bundle.js:263652)
	invokeGuardedCallback (bundle.js:263709)
	beginWork$1 (bundle.js:283607)
	performUnitOfWork (bundle.js:282855)
	workLoopSync (bundle.js:282778)
	renderRootSync (bundle.js:282751)
	performConcurrentWorkOnRoot (bundle.js:282146:93)
	workLoop (bundle.js:285974)
	flushWork (bundle.js:285952)
	performWorkUntilDeadline (bundle.js:286189)
	(fonction anonyme) (bundle.js:121832)
	run (bundle.js:121809)
	eventListener (bundle.js:121818)
[Error] Error: Objects are not valid as a React child (found: object with keys {adresse, pays, tva, ville, type, codePostal, raisonSociale, siret}). If you meant to render a collection of children, use an array instead.
	throwOnInvalidObjectType (bundle.js:271356:278)
	reconcileChildFibers (bundle.js:272132)
	reconcileChildren (bundle.js:276547)
	updateHostComponent (bundle.js:277198)
	callCallback (bundle.js:263608)
	dispatchEvent
	invokeGuardedCallbackDev (bundle.js:263652)
	invokeGuardedCallback (bundle.js:263709)
	beginWork$1 (bundle.js:283607)
	performUnitOfWork (bundle.js:282855)
	workLoopSync (bundle.js:282778)
	renderRootSync (bundle.js:282751)
	recoverFromConcurrentError (bundle.js:282243)
	performConcurrentWorkOnRoot (bundle.js:282156)
	workLoop (bundle.js:285974)
	flushWork (bundle.js:285952)
	performWorkUntilDeadline (bundle.js:286189)
	(fonction anonyme) (bundle.js:121832)
	run (bundle.js:121809)
	eventListener (bundle.js:121818)
[Error] The above error occurred in the <td> component:

td
tr
FieldValidationRow@http://localhost:3000/static/js/bundle.js:365616:12
tbody
table
div
div
div
ValidationSection@http://localhost:3000/static/js/bundle.js:366993:8
div
FormValidationInterface@http://localhost:3000/static/js/bundle.js:366127:67
RenderedRoute@http://localhost:3000/static/js/bundle.js:316101:11
Routes@http://localhost:3000/static/js/bundle.js:316834:12
div
ConcertsPage@http://localhost:3000/static/js/bundle.js:428494:81
Suspense
PrivateRoute@http://localhost:3000/static/js/bundle.js:333209:11
RenderedRoute@http://localhost:3000/static/js/bundle.js:316101:11
Outlet@http://localhost:3000/static/js/bundle.js:316745:25
main
div
DesktopLayout@http://localhost:3000/static/js/bundle.js:341336:11
Layout@http://localhost:3000/static/js/bundle.js:339737:88
RenderedRoute@http://localhost:3000/static/js/bundle.js:316101:11
Routes@http://localhost:3000/static/js/bundle.js:316834:12
Suspense
ModalProvider@http://localhost:3000/static/js/bundle.js:402218:11
ParametresProvider@http://localhost:3000/static/js/bundle.js:402399:11
AuthProvider@http://localhost:3000/static/js/bundle.js:401996:11
Router@http://localhost:3000/static/js/bundle.js:316773:12
BrowserRouter@http://localhost:3000/static/js/bundle.js:314670:12
ErrorBoundary@http://localhost:3000/static/js/bundle.js:333096:10
App

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
	logCapturedError (bundle.js:276133)
	callback (bundle.js:276184)
	callCallback (bundle.js:272963)
	commitUpdateQueue (bundle.js:272981)
	commitLayoutEffectOnFiber (bundle.js:280123)
	commitLayoutMountEffects_complete (bundle.js:281237)
	commitLayoutEffects_begin (bundle.js:281226)
	commitLayoutEffects (bundle.js:281172)
	commitRootImpl (bundle.js:283081)
	commitRoot (bundle.js:282961)
	finishConcurrentRender (bundle.js:282281)
	performConcurrentWorkOnRoot (bundle.js:282209)
	workLoop (bundle.js:285974)
	flushWork (bundle.js:285952)
	performWorkUntilDeadline (bundle.js:286189)
	(fonction anonyme) (bundle.js:121832)
	run (bundle.js:121809)
	eventListener (bundle.js:121818)
[Error] Erreur capturée par ErrorBoundary: (2)
Error: Objects are not valid as a React child (found: object with keys {adresse, pays, tva, ville, type, codePostal, raisonSociale, siret}). If you meant to render a collection of children, use an array instead. — react-dom.development.js:13123
{componentStack: "↵td↵tr↵FieldValidationRow@http://localhost:3000/st…/localhost:3000/static/js/bundle.js:333096:10↵App"}
	componentDidCatch (bundle.js:333112)
	callback (bundle.js:276195)
	callCallback (bundle.js:272963)
	commitUpdateQueue (bundle.js:272981)
	commitLayoutEffectOnFiber (bundle.js:280123)
	commitLayoutMountEffects_complete (bundle.js:281237)
	commitLayoutEffects_begin (bundle.js:281226)
	commitLayoutEffects (bundle.js:281172)
	commitRootImpl (bundle.js:283081)
	commitRoot (bundle.js:282961)
	finishConcurrentRender (bundle.js:282281)
	performConcurrentWorkOnRoot (bundle.js:282209)
	workLoop (bundle.js:285974)
	flushWork (bundle.js:285952)
	performWorkUntilDeadline (bundle.js:286189)
	(fonction anonyme) (bundle.js:121832)
	run (bundle.js:121809)
	eventListener (bundle.js:121818)