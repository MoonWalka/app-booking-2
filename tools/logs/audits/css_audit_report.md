# Rapport d'audit CSS - TourCraft

*Date de génération: 5/17/2025, 3:54:00 AM*

## Table des matières

1. [Résumé](#résumé)
2. [Variables CSS](#variables-css)
3. [Classes Bootstrap](#classes-bootstrap)
4. [Composants Card](#composants-card)
5. [Plan d'action](#plan-daction)

## Résumé

Ce rapport présente une analyse complète des problèmes CSS identifiés dans l'application TourCraft. Il couvre trois domaines principaux :

1. **Variables CSS** : Utilisation des variables CSS standardisées avec le préfixe `--tc-`
2. **Classes Bootstrap** : Remplacement des classes Bootstrap par des composants UI standardisés
3. **Composants Card** : Migration vers le composant Card standardisé

## Variables CSS

### Résultats de l'audit

```
[1m[34m=== Vérification des standards CSS ===[0m
Chemin de base: ./src
Mode: Analyse uniquement

[1m252 fichiers CSS trouvés.[0m

[1msrc/styles/theme.css:[0m
  [33m- Tailles codées en dur (2):[0m 1px, 200px

[1msrc/styles/pages/structures.css:[0m
  [31m- Couleurs codées en dur (11):[0m rgba(13, 202, 240, 0.1), #0dcaf0, rgba(13, 110, 253, 0.1), #0d6efd, rgba(25, 135, 84, 0.1), #198754, rgba(108, 117, 125, 0.1), #6c757d, rgba(248, 249, 250, 0.6), #fff, rgba(0, 0, 0, 0.075)
  [33m- Tailles codées en dur (3):[0m 0.125rem, 70px, 100px

[1msrc/styles/pages/programmateurs.css:[0m
  [31m- Couleurs codées en dur (29):[0m #6f42c1, #f0e6fa, #fff, rgba(0, 0, 0, 0.1), #666, #fff9e6, #f0c674, rgba(0, 0, 0, 0.075), #f0f0f0, #344767, #6c757d, #0d6efd, #343a40, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08), #f8f9fa, #e9ecef, #333, #0a58ca, #f5f5f5, rgba(0, 0, 0, 0.15), #4a90e2, #e3f2fd, #0d47a1, #f9f9f9, rgba(var(--tc-primary-rgb, 13, 110, 253), #dee2e6, #495057, #999
  [33m- Tailles codées en dur (21):[0m 20px, 8px, 2px, 4px, 24px, 5px, 10px, 15px, 800px, 0.125rem, 0.875rem, 1px, 2.5rem, 3px, 12px, 250px, 0.375rem, 0.5px, 0.35rem, 0.65rem, 0.7rem

[1msrc/styles/pages/lieux.css:[0m
  [31m- Couleurs codées en dur (30):[0m #0dcaf0, #e9f6fd, #198754, #ffc107, #f8f9fa, #6c757d, #dee2e6, #fff, rgba(0, 0, 0, 0.075), #f0f0f0, #343a40, #344767, rgba(50, 50, 93, 0.11), rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.05), #e9ecef, #495057, #0a58ca, rgba(50, 50, 93, 0.1), rgba(40, 167, 69, 0.1), #28a745, rgba(255, 193, 7, 0.1), rgba(0, 0, 0, 0.1), rgba(0, 123, 255, 0.05), #f0f4ff, #3a86ff, #e9f2ff, #3b7ddd, #0c5460, #adb5bd
  [33m- Tailles codées en dur (37):[0m 0.875rem, 1px, 0.125rem, 2px, 1.75rem, 0.35em, 0.65em, 0.375rem, 4px, 6px, 3px, 20px, 1400px, 24px, 16px, 1.8rem, 8px, 7px, 14px, 50px, 12px, 5px, 600px, 45px, 10px, 15px, 0.7em, 0.05rem, 250px, 36px, 60px, 500px, 40px, 3rem, 30px, 768px, 2.5rem

[1msrc/styles/pages/forms.css:[0m
  [31m- Couleurs codées en dur (7):[0m #f5f7fa, #f8f9fa, #7f8c8d, #fff3cd, #856404, #d4edda, #155724
  [33m- Tailles codées en dur (9):[0m 30px, 10px, 100vh, 15px, 800px, 12px, 50px, 20px, 64px

[1msrc/styles/pages/formPublic.css:[0m
  [31m- Couleurs codées en dur (19):[0m #f9f9f9, #333, #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eaeaea, #4a90e2, #555, #ddd, rgba(74, 144, 226, 0.2), #e74c3c, #95a5a6, #6c757d, #3a7bc8, #cccccc, #888, rgba(74, 144, 226, 0.1), #fff3cd, #ffc107
  [33m- Tailles codées en dur (15):[0m 800px, 40px, 20px, 100vh, 30px, 25px, 2px, 10px, 15px, 1px, 8px, 12px, 5px, 3px, 50px

[1msrc/styles/pages/contrats.css:[0m
  [33m- Tailles codées en dur (16):[0m 20px, 1200px, 300px, 50px, 15px, 3rem, 25px, 2px, 10px, 3px, 8px, 12px, 5px, 1px, 24px, 600px

[1msrc/styles/pages/concerts.css:[0m
  [31m- Couleurs codées en dur (33):[0m #5e72e4, #eef0fd, rgba(40, 167, 69, 0.15), #176639, rgba(255, 193, 7, 0.15), #964B00, rgba(220, 53, 69, 0.15), #a71d2a, rgba(108, 117, 125, 0.15), #45494e, #007bff, #6c757d, #0069d9, #5a6268, #fff, rgba(0, 0, 0, 0.1), #eee, #333, #666, #f5f5f5, #ddd, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.5), #f0f0f0, #f9f9f9, rgba(23, 162, 184, 0.15), #0a6c7e, rgba(0, 123, 255, 0.15), #0056b3, rgba(108, 117, 125, 0.1), rgba(255, 193, 7, 0.1), rgba(220, 53, 69, 0.7), rgba(220, 53, 69, 0)
  [33m- Tailles codées en dur (24):[0m 12px, 130px, 40px, 8px, 16px, 6px, 20px, 2px, 4px, 900px, 15px, 1px, 24px, 5px, 10px, 200px, 120px, 3px, 450px, 90vw, 11px, 768px, 14px, 0.85em

[1msrc/styles/pages/artistes.css:[0m
  [31m- Couleurs codées en dur (16):[0m #6610f2, #f0e6ff, rgba(0, 0, 0, 0.1), #e9ecef, #6c757d, #666, #495057, #dee2e6, #f8f9fa, #007bff, #fff, #e0e0e0, #f9f9f9, #ddd, #f0f0f0, rgba(0, 0, 0, 0.15)
  [33m- Tailles codées en dur (22):[0m 20px, 8px, 2px, 4px, 30px, 150px, 120px, 5px, 10px, 14px, 16px, 1px, 12px, 3px, 15px, 100px, 250px, 50px, 200px, 800px, 130px, 768px

[1msrc/styles/mixins/breakpoints.css:[0m
  [33m- Tailles codées en dur (4):[0m 576px, 768px, 992px, 1200px

[1msrc/styles/components/tables.css:[0m
  [33m- Tailles codées en dur (4):[0m 1px, 2px, 0.3rem, 768px

[1msrc/styles/components/spinner.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(var(--tc-primary-color-rgb), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.9), #333
  [33m- Tailles codées en dur (14):[0m 50px, 5px, 20px, 200px, 18px, 100px, 300px, 30px, 8px, 15px, 16px, 40px, 3rem, 0.25em

[1msrc/styles/components/quill-editor.css:[0m
  [31m- Couleurs codées en dur (4):[0m #fff, #ccc, rgba(0,0,0,0.1), rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (15):[0m 3px, 1px, 2px, 16px, 90vh, 140px, 28px, 2em, 0.5em, 1.5em, 1em, 200px, 12px, 20px, 6px

[1msrc/styles/components/navigation.css:[0m
  [33m- Tailles codées en dur (15):[0m 10px, 20px, 5px, 8px, 16px, 15px, 30px, 14px, 2px, 35px, 12px, 40px, 6px, 3px, 768px

[1msrc/styles/components/modals.css:[0m
  [31m- Couleurs codées en dur (3):[0m rgba(0, 0, 0, 0.1), #ccc, rgba(0, 0, 0, 0.03)
  [33m- Tailles codées en dur (22):[0m 600px, 90vh, 100vh, 1px, 60vh, 400px, 800px, 1100px, 2px, 10px, 70px, 200px, 8px, 150px, 14px, 28px, 3px, 12px, 15px, 768px, 80vh, 50vh

[1msrc/styles/components/lists.css:[0m
  [31m- Couleurs codées en dur (23):[0m #324265, #2048c3, #fff, rgba(47, 54, 100, 0.04), #14377b, #f6f9fc, #e2e8f0, #f0f4fa, #565e74, #e3e8f1, rgba(61, 86, 118, .06), #3f4c65, #f2f6fa, #f0f3fa, #222d3a, #e7f1ff, #144d8b, #bfc8dc, #5c6791, #f6f8fd, #e6f0ff, #1573e1, rgba(40, 50, 90, 0.05)
  [33m- Tailles codées en dur (29):[0m 1.7rem, 2.05rem, 0.2px, 6px, 1px, 7px, 10px, 20px, 410px, 1.8rem, 8px, 1.05rem, 16px, 2px, 12px, 2.5rem, 1.06rem, 0.08em, 13px, 11px, 0.98rem, 4px, 15px, 023em, 5px, 600px, 14px, 6vw, 3px

[1msrc/styles/components/layout.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2), #f8f9fa, rgba(0, 0, 0, 0.05)
  [33m- Tailles codées en dur (24):[0m 100vh, 240px, 20px, 1px, 5px, 12px, 160px, 15px, 10px, 6px, 14px, 30px, 40px, 0.5px, 0.7rem, 0.3px, 24px, 300px, 2px, 4px, 768px, 8px, 70px, 1.3rem

[1msrc/styles/components/forms.css:[0m
  [33m- Tailles codées en dur (7):[0m 1px, 0.875rem, 0.125rem, 16px, 12px, 100px, 2.5rem

[1msrc/styles/components/errors.css:[0m
  [31m- Couleurs codées en dur (1):[0m #f8f9fa
  [33m- Tailles codées en dur (6):[0m 100vh, 12px, 5px, 10px, 20px, 16px

[1msrc/styles/components/dropdowns.css:[0m
  [31m- Couleurs codées en dur (10):[0m rgba(0, 0, 0, 0.1), #f5f5f5, #666, #eee, #ddd, #999, #e8e8e8, #4a90e2, #e3f2fd, #0d47a1
  [33m- Tailles codées en dur (14):[0m 5px, 180px, 2px, 10px, 15px, 1px, 8px, 12px, 35px, 14px, 4px, 6px, 200px, 20px

[1msrc/styles/components/details.css:[0m
  [31m- Couleurs codées en dur (2):[0m #ffffff, #7f8c8d
  [33m- Tailles codées en dur (9):[0m 20px, 30px, 15px, 10px, 1px, 250px, 12px, 5px, 40px

[1msrc/styles/components/contrat-print.css:[0m
  [31m- Couleurs codées en dur (10):[0m #000000, #f2f2f2, #000, #f8f9fa, rgba(0, 0, 0, 0.1), #999, #666, #fff3cd, #856404, #ffeeba
  [33m- Tailles codées en dur (11):[0m 1.5em, 0.75em, 2em, 0.5em, 1px, 20px, 15px, 30px, 10px, 2px, 0.9em

[1msrc/styles/components/contrat-editor.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(0,0,0,0.1), #f0f0f0, #ddd, rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (20):[0m 90vh, 12px, 0.375rem, 1px, 300px, 100px, 500px, 2px, 5px, 100vh, 200px, 10px, 700px, 20px, 80vh, 800px, 15px, 400px, 768px, 30px

[1msrc/styles/components/concerts.css:[0m
  [31m- Couleurs codées en dur (23):[0m #6c757d, #e9ecef, rgba(0, 123, 255, 0.05), rgba(0, 0, 0, 0.1), rgba(0, 123, 255, 0.15), #0056b3, rgba(40, 167, 69, 0.15), #155724, rgba(23, 162, 184, 0.15), #0c5460, rgba(255, 193, 7, 0.15), #856404, rgba(220, 53, 69, 0.15), #721c24, rgba(108, 117, 125, 0.15), #383d41, rgba(248, 249, 250, 0.8), rgba(108, 117, 125, 0.2), #ffc107, rgba(255, 193, 7, 0.1), rgba(0, 0, 0, 0.2), rgba(0, 123, 255, 0.25), #212529
  [33m- Tailles codées en dur (17):[0m 1400px, 2px, 1px, 180px, 992px, 140px, 768px, 100px, 50px, 120px, 0.3rem, 0.15rem, 4px, 0.4rem, 90px, 36px, 5px

[1msrc/styles/components/concerts-mobile.css:[0m
  [31m- Couleurs codées en dur (23):[0m rgba(0, 0, 0, 0.08), #007bff, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.12), #212529, #6c757d, rgba(0, 123, 255, 0.1), rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.15), rgba(23, 162, 184, 0.2), #0c5460, rgba(0, 123, 255, 0.2), #004085, rgba(40, 167, 69, 0.2), #155724, rgba(255, 193, 7, 0.2), #856404, rgba(108, 117, 125, 0.2), #383d41, rgba(220, 53, 69, 0.2), #721c24, rgba(248, 249, 250, 0.8), rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (20):[0m 2px, 5px, 4px, 12px, 10px, 70px, 1.4rem, 0.4rem, 14px, 0.35rem, 120px, 100px, 0.15rem, 180px, 50px, 36px, 1px, 3px, 8px, 2.5rem

[1msrc/styles/components/cards.css:[0m
  [31m- Couleurs codées en dur (8):[0m #fff, rgba(44, 62, 80, 0.08), rgba(44, 62, 80, 0.12), #f7faff, #edf3fb, #225ea8, #dce3ed, rgba(0, 0, 0, 0.08)
  [33m- Tailles codées en dur (17):[0m 4px, 12px, 2.3rem, 3px, 6px, 20px, 1px, 1.28rem, 1.8rem, 1.7rem, 1.3rem, 5px, 15px, 200px, 150px, 250px, 576px

[1msrc/styles/components/buttons.css:[0m
  [31m- Couleurs codées en dur (2):[0m rgba(var(--tc-primary-color-rgb), #212529
  [33m- Tailles codées en dur (15):[0m 8px, 16px, 14px, 1px, 0.375rem, 0.75rem, 6px, 12px, 10px, 15px, 20px, 768px, 0.25rem, 0.5rem, 1rem

[1msrc/styles/components/badges.css:[0m
  [31m- Couleurs codées en dur (14):[0m rgba(0, 0, 0, 0.12), #ffc107, #212529, #28a745, #17a2b8, #6c757d, rgba(0, 0, 0, 0.2), #007bff, #0069d9, #5a6268, #2c3e50, #ffffff, #f0ad4e, #fff
  [33m- Tailles codées en dur (23):[0m 5px, 10px, 20px, 12px, 80px, 1px, 3px, 2px, 8px, 60px, 6px, 14px, 100px, 16px, 9px, 24px, 576px, 11px, 70px, 90px, 18px, 4px, 0.85em

[1msrc/styles/components/alerts.css:[0m
  [33m- Tailles codées en dur (5):[0m 1px, 4px, 250px, 350px, 20px

[1msrc/styles/base/variables.css:[0m
  [31m- Couleurs codées en dur (50):[0m #0d6efd, #4d94ff, #0b5ed7, #6c757d, #868e96, #5a6268, #28a745, #48c564, #198754, #e35d6a, #c82333, #ffc107, #ffcd39, #e0a800, #17a2b8, #31c8e0, #0dcaf0, #f8f9fa, #212529, #ffffff, #f0f0f0, #e9ecef, #dee2e6, rgba(0, 0, 0, 0.075), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.175), rgba(13, 110, 253, 0.25), rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.5), rgba(52, 152, 219, 0.5), rgba(var(--tc-primary-color-rgb), #2c3e50, #3498db, #1e2b38, #2980b9, #27ae60, #f39c12, #e74c3c, #344767, #f5f7fa, #ddd, #121212, #e0e0e0, #1e1e1e, #333, #2a2a2a, rgba(0, 0, 0, 0.3)
  [33m- Tailles codées en dur (21):[0m 0.875rem, 1.8rem, 0.375rem, 3rem, 0.125rem, 576px, 768px, 992px, 1200px, 1400px, 2px, 10px, 8px, 24px, 4px, 12px, 60px, 240px, 64px, 3px, 14px

[1msrc/styles/base/typography.css:[0m
  [33m- Tailles codées en dur (8):[0m 1rem, 0.8rem, 0.6rem, 0.5rem, 0.5px, 0.25rem, 1px, 768px

[1msrc/styles/base/reset.css:[0m
  [31m- Couleurs codées en dur (2):[0m #212529, #f8f9fa

[1msrc/styles/base/colors.css:[0m
  [31m- Couleurs codées en dur (32):[0m #0d6efd, #2c3e50, rgba(var(--tc-primary-color-rgb), #3498db, #1e2b38, #2980b9, #1f618d, #27ae60, #f39c12, #e74c3c, #ecf0f1, #fafbfc, #f8f9fa, #e9ecef, #dee2e6, #ced4da, #adb5bd, #6c757d, #495057, #343a40, #212529, #344767, #ffffff, #f5f7fa, #ddd, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.1), rgba(var(--tc-secondary-color-rgb), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.5)
  [33m- Tailles codées en dur (4):[0m 2px, 4px, 8px, 12px

[1msrc/pages/Dashboard.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m rgba(0, 0, 0, 0.1), #3498db
  [33m- Tailles codées en dur (6):[0m 20px, 5px, 2px, 200px, 36px, 10px

[1msrc/pages/ContratDetailsPage.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 1.5rem, 5rem

[1msrc/components/ui/StatutBadge.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 50rem, 0.9em, 576px

[1msrc/components/ui/Spinner.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m rgba(255, 255, 255, 0.8), #f3f3f3, #6c757d, #4a6da7, #28a745, #ffc107, #dc3545, #17a2b8
  [33m- Tailles codées en dur (12):[0m 0.25rem, 5px, 50px, 20px, 3px, 35px, 4px, 70px, 6px, 1rem, 576px, 0.875rem

[1msrc/components/ui/ListWithFilters.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m #fff, rgba(0, 0, 0, 0.05), #333, #e0e0e0, #666, #f5f5f5, #4a6da7, #f9f9f9, #ccc, #3c5986, #fff5f5, #dc3545, #ffcdd2
  [33m- Tailles codées en dur (13):[0m 0.5rem, 2px, 4px, 1.5rem, 2rem, 1.25rem, 1px, 0.25rem, 1rem, 200px, 0.875rem, 0.75rem, 768px

[1msrc/components/ui/LegalInfoSection.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1px, 300px, 992px, 250px, 768px, 576px

[1msrc/components/ui/InfoPanel.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #e3f2fd, #2196f3, #d1e7dd, #198754, #fff3cd, #ffc107, #f8d7da, #dc3545, #333, #555
  [33m- Tailles codées en dur (6):[0m 4px, 15px, 20px, 8px, 576px, 12px

[1msrc/components/ui/EntitySelector.module.css:[0m
  [31m- Couleurs codées en dur (14):[0m #333, #dc3545, #ced4da, #fff, #a3c9ff, #4a6da7, rgba(74, 109, 167, 0.25), #e9ecef, #6c757d, #343a40, rgba(0, 0, 0, 0.15), #f8f9fa, rgba(74, 109, 167, 0.1), rgba(0, 0, 0, 0.2)
  [33m- Tailles codées en dur (20):[0m 1rem, 0.5rem, 0.25rem, 1px, 0.375rem, 0.75rem, 38px, 0.9rem, 20px, 4px, 2px, 5px, 300px, 250px, 1.25rem, 0.875em, 768px, 70vh, 10px, 50px

[1msrc/components/ui/EntitySearchField.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1px, 300px, 768px, 250px, 576px, 200px

[1msrc/components/ui/ContactDisplay.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 1px, 576px

[1msrc/components/ui/Card.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08), #f8f9fa, #dee2e6, #4a6da7, rgba(248, 249, 250, 0.7), #28a745, #ffc107, #dc3545, #17a2b8, rgba(74, 109, 167, 0.1)
  [33m- Tailles codées en dur (17):[0m 0.375rem, 2px, 4px, 1.5rem, 3px, 5px, 15px, 1rem, 1px, 0.75rem, 1.2rem, 1.1rem, 0.5rem, 6px, 768px, 576px, 0.25rem

[1msrc/components/ui/Button.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #4a6da7, #fff, #395582, #6c757d, #5a6268, #dc3545, #c82333, #28a745, #218838, #ffc107, #212529, #17a2b8
  [33m- Tailles codées en dur (10):[0m 1px, 0.375rem, 0.75rem, 1rem, 0.25rem, 0.5rem, 0.875rem, 1.25rem, 576px, 768px

[1msrc/components/ui/Badge.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #ffc107, #212529, #28a745, #dc3545, #4a6da7, #6c757d, #17a2b8
  [33m- Tailles codées en dur (9):[0m 0.25em, 0.4em, 0.25rem, 50rem, 1px, 0.2em, 0.3em, 0.5em, 576px

[1msrc/components/ui/AddressInput.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 1px, 300px, 768px, 250px, 576px

[1msrc/components/ui/AddressDisplay.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1px, 768px, 576px

[1msrc/components/structures/mobile/StructuresList.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #adb5bd, #ced4da, #6c757d, rgba(0, 0, 0, 0.05), #212529, #007bff, #e9ecef, #495057, #cfe2ff
  [33m- Tailles codées en dur (13):[0m 1rem, 1.5rem, 1.75rem, 2rem, 3rem, 10px, 2px, 5px, 0.75rem, 1.25rem, 0.875rem, 0.5rem, 36px

[1msrc/components/structures/mobile/StructureForm.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m #6c757d, rgba(0, 0, 0, 0.05), #dee2e6, rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (6):[0m 2px, 4px, 1px, 0.375rem, 10px, 70px

[1msrc/components/structures/mobile/StructureDetails.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #6c757d, rgba(0, 0, 0, 0.05), #dee2e6, #007bff, #f8f9fa
  [33m- Tailles codées en dur (3):[0m 2px, 4px, 1px

[1msrc/components/structures/desktop/StructuresList.module.css:[0m
  [31m- Couleurs codées en dur (19):[0m #f0f0f0, #333, #007bff, #0069d9, rgba(0, 0, 0, 0.05), #f8f9fa, #6c757d, rgba(0, 0, 0, 0.03), rgba(0, 123, 255, 0.05), #28a745, #17a2b8, #ffc107, #212529, rgba(0, 123, 255, 0.1), rgba(220, 53, 69, 0.1), #dc3545, #b0b0b0, #e0e0e0, rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (23):[0m 1.5rem, 1rem, 1px, 0.5rem, 1.75rem, 0.25rem, 2px, 4px, 200px, 0.75rem, 0.875rem, 0.35em, 0.65em, 0.75em, 32px, 3rem, 1.125rem, 2rem, 0.25em, 992px, 768px, 576px, 2.25rem

[1msrc/components/structures/desktop/StructureLegalSection.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #666, #333
  [33m- Tailles codées en dur (8):[0m 1.5rem, 250px, 1rem, 0.875rem, 0.25rem, 768px, 576px, 0.75rem

[1msrc/components/structures/desktop/StructureForm.module.css:[0m
  [31m- Couleurs codées en dur (17):[0m #f9fafb, #f0f0f0, #333, #f8d7da, #842029, #f5c2c7, rgba(0, 0, 0, 0.05), #f8f9fa, #007bff, #fff, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25), #6c757d, #dc3545, #0069d9, #0d6efd
  [33m- Tailles codées en dur (22):[0m 1200px, 1.5rem, 0.5rem, 1rem, 1px, 1.75rem, 0.25rem, 0.75rem, 0.375rem, 1.25rem, 2px, 4px, 2.25rem, 16px, 12px, 100px, 0.875em, 2rem, 0.25em, 992px, 768px, 576px

[1msrc/components/structures/desktop/StructureDetails.module.css:[0m
  [31m- Couleurs codées en dur (16):[0m #f0f0f0, #333, #007bff, #0069d9, rgba(220, 53, 69, 0.1), #dc3545, #6c757d, rgba(0, 0, 0, 0.05), #f8f9fa, #28a745, #17a2b8, #ffc107, #212529, #b0b0b0, rgba(0,0,0,0.05), rgba(255, 193, 7, 0.1)
  [33m- Tailles codées en dur (27):[0m 20px, 1200px, 1.5rem, 1rem, 1px, 0.5rem, 1.75rem, 0.25rem, 2px, 4px, 1.1rem, 10px, 1.2rem, 0.35em, 0.65em, 0.75em, 0.875rem, 0.75rem, 2rem, 3rem, 0.25em, 8px, 0.95rem, 15px, 992px, 768px, 576px

[1msrc/components/structures/desktop/sections/StructureNotesSection.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #fff, rgba(0, 0, 0, 0.1), rgba(0,0,0,0.05), #f8f9fa, #dee2e6, #0d6efd, #212529, #6c757d, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253)
  [33m- Tailles codées en dur (17):[0m 0.375rem, 1px, 3px, 1.5rem, 1rem, 2px, 4px, 0.75rem, 1.25rem, 1.1rem, 0.95rem, 0.5rem, 0.9rem, 0.25rem, 120px, 768px, 100px

[1msrc/components/structures/desktop/sections/StructureIdentitySection.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #fff, rgba(0, 0, 0, 0.1), #f0f0f0, #f9f9f9, #0d6efd, #ced4da, #212529, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #dc3545
  [33m- Tailles codées en dur (17):[0m 0.375rem, 1px, 3px, 1.5rem, 1rem, 1.25rem, 0.75rem, 1.15rem, 0.5rem, 0.9rem, 0.25rem, 0.95rem, 2rem, 16px, 12px, 0.875rem, 768px

[1msrc/components/structures/desktop/sections/StructureHeader.module.css:[0m
  [31m- Couleurs codées en dur (16):[0m #fff, rgba(0,0,0,0.05), #6c757d, #0d6efd, #212529, #cfe2ff, #0a58ca, #d1e7dd, #146c43, #cff4fc, #087990, #fff3cd, #997404, #e2e3e5, #41464b, #dc3545
  [33m- Tailles codées en dur (11):[0m 0.375rem, 1rem, 2px, 4px, 0.75rem, 0.875rem, 0.5rem, 1.75rem, 0.25rem, 1px, 768px

[1msrc/components/structures/desktop/sections/StructureGeneralInfo.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #fff, rgba(0,0,0,0.05), #f8f9fa, #dee2e6, #212529, #0d6efd, #6c757d
  [33m- Tailles codées en dur (13):[0m 0.375rem, 1rem, 2px, 4px, 0.75rem, 1px, 1.1rem, 0.5rem, 1.25rem, 250px, 0.85rem, 0.25rem, 768px

[1msrc/components/structures/desktop/sections/StructureFormHeader.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #0d6efd, #dee2e6, #6c757d, #f8f9fa, #495057
  [33m- Tailles codées en dur (8):[0m 1.5rem, 0.5rem, 0.75rem, 1px, 0.25rem, 0.875rem, 768px, 1.25rem

[1msrc/components/structures/desktop/sections/StructureFormActions.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #dee2e6, #6c757d, #f8f9fa, #343a40, #c6c7c8, #0d6efd, #0b5ed7
  [33m- Tailles codées en dur (11):[0m 1rem, 2rem, 0.5rem, 1px, 0.625rem, 1.25rem, 0.25rem, 0.9375rem, 0.375rem, 0.15em, 768px

[1msrc/components/structures/desktop/sections/StructureContactSection.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #fff, rgba(0, 0, 0, 0.1), rgba(0,0,0,0.05), #f8f9fa, #dee2e6, #0d6efd, #212529, #6c757d, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #0b5ed7
  [33m- Tailles codées en dur (16):[0m 0.375rem, 1px, 3px, 1.5rem, 1rem, 2px, 4px, 0.75rem, 1.25rem, 0.5rem, 1.1rem, 0.9rem, 0.85rem, 0.25rem, 0.95rem, 768px

[1msrc/components/structures/desktop/sections/StructureBillingSection.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #fff, rgba(0, 0, 0, 0.1), #f0f0f0, #f9f9f9, #0d6efd, #212529, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253)
  [33m- Tailles codées en dur (16):[0m 0.375rem, 1px, 3px, 1.5rem, 1rem, 1.25rem, 0.75rem, 1.15rem, 0.5rem, 0.9rem, 0.25rem, 0.95rem, 2rem, 16px, 12px, 768px

[1msrc/components/structures/desktop/sections/StructureAssociationsSection.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #fff, rgba(0,0,0,0.05), #f8f9fa, #dee2e6, #212529, #0d6efd, rgba(0,0,0,0.08), #86b7fe, #0b5ed7, #6c757d, #cff4fc, #055160
  [33m- Tailles codées en dur (18):[0m 0.375rem, 1rem, 2px, 4px, 0.75rem, 1px, 1.1rem, 1.25rem, 0.5rem, 3px, 8px, 0.9rem, 0.25rem, 0.95rem, 2.5rem, 1.5rem, 0.2rem, 768px

[1msrc/components/structures/desktop/sections/StructureAddressSection.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #fff, rgba(0, 0, 0, 0.1), rgba(0,0,0,0.05), #f8f9fa, #dee2e6, #0d6efd, #212529, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #6c757d, #0b5ed7
  [33m- Tailles codées en dur (16):[0m 0.375rem, 1px, 3px, 1.5rem, 1rem, 2px, 4px, 0.75rem, 1.25rem, 0.5rem, 1.1rem, 0.9rem, 0.25rem, 0.95rem, 0.85rem, 768px

[1msrc/components/programmateurs/sections/StructureInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (17):[0m #f8f9fa, rgba(0, 0, 0, 0.12), #212529, #dee2e6, rgba(var(--tc-bs-primary-rgb), #495057, #fff, #ced4da, rgba(var(--tc-bs-info-rgb), rgba(0, 0, 0, 0.1), #e9ecef, #0d6efd, rgba(var(--tc-bs-success-rgb), #dc3545, #b02a37, #d1e7dd, #0f5132
  [33m- Tailles codées en dur (18):[0m 1.5rem, 1rem, 0.375rem, 1px, 3px, 1.25rem, 0.5rem, 0.15rem, 0.25rem, 2.5rem, 250px, 4px, 6px, 300px, 0.8rem, 0.9rem, 768px, 200px

[1msrc/components/programmateurs/sections/ProgrammateurFormHeader.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #f8f9fa, #dee2e6, #0d6efd, #212529, #6c757d, #0b5ed7, #fff
  [33m- Tailles codées en dur (9):[0m 1rem, 1px, 0.375rem, 1.5rem, 0.5rem, 1.25rem, 0.875rem, 0.25rem, 768px

[1msrc/components/programmateurs/sections/ProgrammateurFormActions.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m #f8f9fa, #dee2e6, #6c757d, #fff, #e9ecef, #0d6efd, #0b5ed7, #dc3545
  [33m- Tailles codées en dur (7):[0m 1rem, 1px, 0.375rem, 1.5rem, 0.5rem, 0.25rem, 768px

[1msrc/components/programmateurs/sections/LieuInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (14):[0m #f8f9fa, rgba(0, 0, 0, 0.12), #212529, #dee2e6, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #fff, rgba(0, 0, 0, 0.1), #e9ecef, #6c757d, #dc3545, rgba(var(--tc-color-danger-rgb, 220, 53, 69), #0d6efd
  [33m- Tailles codées en dur (14):[0m 1.5rem, 1rem, 0.375rem, 1px, 3px, 1.25rem, 0.5rem, 0.25rem, 4px, 6px, 300px, 0.875rem, 768px, 200px

[1msrc/components/programmateurs/sections/DeleteConfirmModal.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m rgba(0, 0, 0, 0.5), #fff, rgba(0, 0, 0, 0.15), #dee2e6, #dc3545, #6c757d, #212529, #ffc107, #f8f9fa, #e9ecef, #b02a37
  [33m- Tailles codées en dur (10):[0m 0.375rem, 0.5rem, 1rem, 500px, 1px, 1.25rem, 1.5rem, 0.25rem, 20px, 768px

[1msrc/components/programmateurs/sections/ContactInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #f8f9fa, rgba(0, 0, 0, 0.12), #212529, #dee2e6, #495057, #fff, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #dc3545, #6c757d
  [33m- Tailles codées en dur (10):[0m 1.5rem, 1rem, 0.375rem, 1px, 3px, 1.25rem, 0.5rem, 0.25rem, 0.875rem, 768px

[1msrc/components/programmateurs/sections/CompanySearchSection.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m #f8f9fa, rgba(0, 0, 0, 0.12), #212529, #dee2e6, #fff, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), rgba(0, 0, 0, 0.1), #e9ecef, #6c757d, #dc3545, #f8d7da
  [33m- Tailles codées en dur (14):[0m 1.5rem, 1rem, 0.375rem, 1px, 3px, 1.25rem, 0.5rem, 0.25rem, 4px, 6px, 300px, 0.875rem, 768px, 200px

[1msrc/components/programmateurs/mobile/ProgrammateursList.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m #fff, #eee, #333, #6c757d, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1), #344767, #3a86ff
  [33m- Tailles codées en dur (8):[0m 1px, 1.75rem, 2.5rem, 3rem, 2px, 4px, 6px, 0.875rem

[1msrc/components/programmateurs/mobile/ProgrammateurForm.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #fff, #eee, #333, #344767, #d2d6da, #3a86ff, rgba(58, 134, 255, 0.25), #f8f9fa, #6c757d, rgba(0, 0, 0, 0.15)
  [33m- Tailles codées en dur (5):[0m 1px, 1.75rem, 0.875rem, 200px, 100px

[1msrc/components/programmateurs/desktop/ProgrammateursList.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m rgba(0, 0, 0, 0.075), #212529, #e9ecef, #f8f9fa, #f9fafb, #0d6efd, #6c757d, #cff4fc, #0dcaf0, #fff3cd, #ffc107, #f8d7da, #dc3545
  [33m- Tailles codées en dur (14):[0m 1rem, 0.5rem, 0.125rem, 0.25rem, 1.5rem, 300px, 0.75rem, 1px, 0.875rem, 32px, 500px, 2rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurStructuresSection.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #fff, rgba(0, 0, 0, 0.1), #0056b3, #e9ecef, #6c757d, #0d6efd, rgba(13, 202, 240, 0.1), #0dcaf0, #adb5bd
  [33m- Tailles codées en dur (16):[0m 0.375rem, 2px, 4px, 1.5rem, 1rem, 1.25rem, 1px, 0.5rem, 0.75rem, 1.1rem, 0.25rem, 0.9rem, 0.8rem, 2rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurLieuxSection.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m rgba(0, 0, 0, 0.05), #f8f9fa, #eee, #e0e0e0, rgba(0, 0, 0, 0.1), #f0f0f0, #dee2e6, #6c757d
  [33m- Tailles codées en dur (10):[0m 1rem, 8px, 2px, 4px, 1.5rem, 1px, 0.75rem, 10px, 300px, 768px

[1msrc/components/programmateurs/desktop/ProgrammateurLegalSection.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #ffffff, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08), #f8f9fa, #dee2e6, #6c757d, rgba(248, 249, 250, 0.5), rgba(206, 212, 218, 0.5), #fff, rgba(0, 0, 0, 0.1), #e5e5e5, #333
  [33m- Tailles codées en dur (21):[0m 1rem, 0.375rem, 2px, 4px, 1.5rem, 3px, 5px, 15px, 1px, 0.75rem, 1.25rem, 0.5rem, 0.9rem, 0.5px, 0.85rem, 0.8rem, 1.5em, 0.25rem, 250px, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurHeader.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #6c757d, #adb5bd
  [33m- Tailles codées en dur (7):[0m 1rem, 1.5rem, 0.5rem, 0.9rem, 0.8rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurGeneralInfo.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #f8f9fa, rgba(0, 0, 0, 0.05), #e9ecef, #495057, #6c757d, #0d6efd, #dee2e6
  [33m- Tailles codées en dur (13):[0m 1.5rem, 8px, 1.25rem, 1px, 3px, 0.75rem, 1rem, 0.875rem, 0.25rem, 50px, 0.5rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurForm.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #007bff, rgba(0, 123, 255, 0.1), #333, #dc3545, #6c757d, #f0f0f0, #ced4da
  [33m- Tailles codées en dur (22):[0m 1200px, 8px, 2px, 4px, 24px, 16px, 20px, 1px, 12px, 1.2rem, 32px, 6px, 1.25rem, 18px, 0.85rem, 1rem, 200px, 10px, 15px, 768px, 576px, 1.1rem

[1msrc/components/programmateurs/desktop/ProgrammateurDetails.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m rgba(0, 0, 0, 0.05), #f8f9fa, #e9ecef, #6c757d, #4a6da7, #adb5bd, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.1), #f8d7da, #721c24, #4dabf7, #e5e5e5, #333
  [33m- Tailles codées en dur (21):[0m 1200px, 1.5rem, 0.5rem, 2px, 4px, 0.75rem, 1rem, 1px, 0.5px, 0.9rem, 0.375rem, 5px, 300px, 0.25rem, 0.8rem, 8px, 1.25rem, 2rem, 1.75rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurContactSection.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #fff, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.08), #f8f9fa, #e9ecef, #6c757d, rgba(248, 249, 250, 0.5), rgba(206, 212, 218, 0.5), #adb5bd
  [33m- Tailles codées en dur (17):[0m 1rem, 8px, 2px, 4px, 20px, 3px, 5px, 15px, 10px, 1px, 0.85rem, 1.5em, 0.75rem, 0.375rem, 0.25rem, 768px, 576px

[1msrc/components/programmateurs/desktop/ProgrammateurConcertsSection.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m rgba(0, 0, 0, 0.05), #fff, rgba(25, 135, 84, 0.1), #198754, rgba(255, 193, 7, 0.1), #ffc107, rgba(220, 53, 69, 0.1), #dc3545, rgba(13, 110, 253, 0.1), #0d6efd, rgba(13, 110, 253, 0.05)
  [33m- Tailles codées en dur (11):[0m 1px, 0.375rem, 2px, 5px, 1.5rem, 0.5rem, 0.75rem, 1rem, 1.25rem, 0.25rem, 0.875rem
  [36m- Variables sans préfixe tc- (4):[0m var(--bs-border-color, var(--bs-primary, var(--bs-gray-600, var(--bs-gray-700

[1msrc/components/programmateurs/desktop/ProgrammateurAddressSection.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08), #f8f9fa, #eee, #e0e0e0, #f0f7ff
  [33m- Tailles codées en dur (15):[0m 1rem, 8px, 2px, 4px, 1.5rem, 3px, 5px, 15px, 1px, 0.75rem, 1.25rem, 0.5rem, 250px, 768px, 576px

[1msrc/components/programmateurs/desktop/DeleteProgrammateurModal.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2), #e9ecef, #6c757d, #000, #f8d7da, #721c24, #fff3cd, #856404
  [33m- Tailles codées en dur (12):[0m 1rem, 8px, 500px, 5px, 15px, 1px, 1.5rem, 0.5rem, 0.75rem, 4px, 576px, 0.25rem

[1msrc/components/pdf/ContratPDFWrapper.module.css:[0m
  [33m- Tailles codées en dur (8):[0m 800px, 1000px, 1px, 4px, 992px, 768px, 576px, 600px

[1msrc/components/parametres/ParametresNotifications.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/parametres/ParametresGeneraux.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 200px, 768px, 576px

[1msrc/components/parametres/ParametresExport.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/parametres/ParametresEntreprise.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 200px, 1px, 1200px, 992px, 768px, 576px

[1msrc/components/parametres/ParametresCompte.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/parametres/ParametresApparence.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 40px, 1px, 120px, 768px, 576px

[1msrc/components/parametres/Parametres.css:[0m
  [31m- Couleurs codées en dur (2):[0m #495057, rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (10):[0m 0.5rem, 0.25rem, 2px, 4px, 2rem, 1.5rem, 1rem, 100px, 38px, 768px

[1msrc/components/parametres/sync/SyncManager.css:[0m
  [31m- Couleurs codées en dur (8):[0m rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #495057, #007bff, #fff, #17a2b8, #ffc107
  [33m- Tailles codées en dur (8):[0m 4px, 12px, 8px, 900px, 1px, 2px, 10px, 6px

[1msrc/components/parametres/sections/EntrepriseSubmitActions.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1px, 768px, 576px

[1msrc/components/parametres/sections/EntrepriseSearchResults.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 1px, 300px, 768px, 250px, 576px

[1msrc/components/parametres/sections/EntrepriseSearchOptions.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/parametres/sections/EntrepriseHeader.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/parametres/sections/EntrepriseFormFields.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 1px, 200px, 768px, 576px, 180px

[1msrc/components/molecules/GenericList.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1px, 992px, 576px

[1msrc/components/lieux/mobile/LieuxList.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #344767, rgba(50, 50, 93, 0.11), #fff, rgba(0, 0, 0, 0.05), #6c757d, #dee2e6, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.12), #f8f9fa, #f0f0f0, #0d6efd, #e9f2ff
  [33m- Tailles codées en dur (18):[0m 40px, 4px, 6px, 410px, 1.8rem, 45px, 12px, 2px, 5px, 8px, 15px, 3rem, 20px, 10px, 1px, 30px, 50px, 36px

[1msrc/components/lieux/mobile/LieuView.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m #eaeaea, #ffffff, rgba(0, 0, 0, 0.1), #f9f9f9, #f0f0f0, #666
  [33m- Tailles codées en dur (4):[0m 1px, 3px, 50vh, 6px

[1msrc/components/lieux/desktop/LieuxList.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #fff, rgba(0, 0, 0, 0.1), #dee2e6, #0d6efd, rgba(13, 110, 253, 0.25), #6c757d, #495057, rgba(0, 123, 255, 0.05), #f8f9fa
  [33m- Tailles codées en dur (21):[0m 1.25rem, 8px, 1px, 3px, 1.5rem, 0.5rem, 1rem, 600px, 2.5rem, 0.2rem, 10px, 0.8rem, 0.25rem, 6px, 2px, 0.75rem, 0.875rem, 38px, 992px, 768px, 576px

[1msrc/components/lieux/desktop/LieuForm.module.css:[0m
  [31m- Couleurs codées en dur (15):[0m #333, #6c757d, #0d6efd, #e5e5e5, rgba(0, 0, 0, 0.04), #4a5568, #ced4da, #ffffff, rgba(13, 110, 253, 0.15), #fff, #b9bcc0, rgba(0, 0, 0, 0.1), #f8f9fa, rgba(0, 0, 0, 0.08), #495057
  [33m- Tailles codées en dur (29):[0m 20px, 1200px, 1.75rem, 10px, 0.9rem, 1.5rem, 1px, 1rem, 8px, 2px, 6px, 1.25rem, 0.5rem, 3px, 50px, 250px, 0.95rem, 0.75rem, 0.25rem, 2.5rem, 12px, 300px, 5px, 0.85rem, 1.1rem, 2rem, 992px, 768px, 576px

[1msrc/components/lieux/desktop/LieuDetails.module.css:[0m
  [33m- Tailles codées en dur (12):[0m 20px, 1280px, 24px, 400px, 800px, 100px, 16px, 992px, 768px, 576px, 12px, 50px

[1msrc/components/lieux/desktop/sections/LieuxTableRow.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(0, 123, 255, 0.05), #fff, #495057, #0d6efd
  [33m- Tailles codées en dur (7):[0m 10px, 0.25rem, 0.5rem, 0.75rem, 0.875rem, 38px, 6px

[1msrc/components/lieux/desktop/sections/LieuxStatsCards.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m #fff, rgba(0, 0, 0, 0.1), rgba(13, 110, 253, 0.1), #0d6efd, rgba(25, 135, 84, 0.1), #198754, rgba(108, 117, 125, 0.1), #6c757d, rgba(220, 53, 69, 0.1), #dc3545, rgba(255, 193, 7, 0.1), #ffc107, #212529
  [33m- Tailles codées en dur (17):[0m 1rem, 1.5rem, 150px, 0.625rem, 2px, 4px, 3px, 8px, 48px, 0.5rem, 0.875rem, 0.25rem, 992px, 0.75rem, 768px, 140px, 576px

[1msrc/components/lieux/desktop/sections/LieuxResultsTable.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m rgba(0, 0, 0, 0.1), #fff, #495057, #dee2e6, #e9ecef, #f8f9fa, #6c757d
  [33m- Tailles codées en dur (16):[0m 1rem, 0.375rem, 1px, 3px, 2px, 0.75rem, 200px, 120px, 180px, 100px, 0.875rem, 0.25rem, 992px, 768px, 0.5rem, 576px

[1msrc/components/lieux/desktop/sections/LieuxListSearchFilter.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m #6c757d
  [33m- Tailles codées en dur (6):[0m 1rem, 600px, 2.5rem, 0.8rem, 0.25rem, 0.5rem

[1msrc/components/lieux/desktop/sections/LieuxListHeader.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #212529, #6c757d, #0d6efd, #fff, #0b5ed7, #dee2e6, #f8f9fa
  [33m- Tailles codées en dur (10):[0m 1.5rem, 1rem, 1.75rem, 0.25rem, 0.875rem, 0.5rem, 1px, 0.375rem, 0.75rem, 768px

[1msrc/components/lieux/desktop/sections/LieuxListEmptyState.module.css:[0m
  [31m- Couleurs codées en dur (3):[0m #f8f9fa, #6c757d, #dee2e6
  [33m- Tailles codées en dur (4):[0m 1.25rem, 6px, 1px, 1rem

[1msrc/components/lieux/desktop/sections/LieuStructuresSection.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m rgba(var(--tc-bs-info-rgb), rgba(var(--tc-bs-primary-rgb)
  [33m- Tailles codées en dur (13):[0m 1.5rem, 0.75rem, 1rem, 0.5rem, 300px, 1px, 1.1rem, 0.25rem, 0.9rem, 0.8rem, 2rem, 1.25rem, 768px

[1msrc/components/lieux/desktop/sections/LieuProgrammateurSection.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #0d6efd, #dc3545, #6c757d
  [33m- Tailles codées en dur (13):[0m 8px, 2px, 4px, 20px, 16px, 1px, 10px, 1.2rem, 5px, 300px, 0.85rem, 15px, 0.9rem

[1msrc/components/lieux/desktop/sections/LieuOrganizerSection.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m rgba(0, 0, 0, 0.05)
  [33m- Tailles codées en dur (21):[0m 1px, 8px, 2px, 6px, 24px, 16px, 20px, 10px, 1.2rem, 1.1rem, 1.5rem, 0.5rem, 4px, 300px, 15px, 0.85em, 12px, 5px, 0.9em, 120px, 200px

[1msrc/components/lieux/desktop/sections/LieuMapDisplay.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #212529, #0d6efd, #ced4da, #adb5bd, #f8d7da, #dc3545
  [33m- Tailles codées en dur (14):[0m 0.5rem, 2px, 4px, 1.25rem, 1rem, 1px, 0.625rem, 1.2rem, 0.25rem, 400px, 0.375rem, 1.1rem, 768px, 300px

[1msrc/components/lieux/desktop/sections/LieuInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #0d6efd, #dc3545
  [33m- Tailles codées en dur (8):[0m 8px, 2px, 4px, 20px, 16px, 1px, 10px, 1.2rem

[1msrc/components/lieux/desktop/sections/LieuHeader.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #6c757d, #0d6efd, #0b5ed7, #495057, #212529
  [33m- Tailles codées en dur (10):[0m 1.5rem, 1rem, 250px, 0.5rem, 0.9rem, 0.75rem, 1.75rem, 0.375rem, 0.25rem, 768px

[1msrc/components/lieux/desktop/sections/LieuGeneralInfo.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #dee2e6, #fff, rgba(0, 0, 0, 0.05), #f8f9fa, #0d6efd, #212529, #495057, #dc3545, #6c757d
  [33m- Tailles codées en dur (14):[0m 1px, 0.5rem, 2px, 6px, 1.5rem, 1rem, 1.25rem, 0.625rem, 1.2rem, 1.1rem, 250px, 0.375rem, 0.25rem, 768px

[1msrc/components/lieux/desktop/sections/LieuFormHeader.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #0d6efd, #6c757d, #dee2e6, #f8f9fa, #495057, #fff, rgba(0, 0, 0, 0.1), #e9ecef, #212529, #dc3545
  [33m- Tailles codées en dur (13):[0m 1.5rem, 0.25rem, 0.875rem, 0.5rem, 0.75rem, 1px, 2px, 4px, 1.25rem, 1rem, 0.625rem, 1.2rem, 768px

[1msrc/components/lieux/desktop/sections/LieuFormActions.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #dee2e6, #6c757d, #f8f9fa, #343a40, #c6c7c8, #0d6efd, #0b5ed7, #dc3545, #c82333
  [33m- Tailles codées en dur (11):[0m 1rem, 2rem, 0.5rem, 1px, 0.625rem, 1.25rem, 0.25rem, 0.9375rem, 0.375rem, 0.15em, 768px

[1msrc/components/lieux/desktop/sections/LieuContactSection.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #212529, #0d6efd, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #0b5ed7, #dc3545
  [33m- Tailles codées en dur (14):[0m 0.5rem, 2px, 4px, 1.25rem, 1rem, 1px, 0.625rem, 1.2rem, 250px, 0.375rem, 0.75rem, 0.25rem, 1.5rem, 768px

[1msrc/components/lieux/desktop/sections/LieuConcertsSection.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (17):[0m 1px, 8px, 2px, 6px, 24px, 16px, 20px, 1.1rem, 10px, 1.2rem, 12px, 15px, 4px, 5px, 1.05rem, 0.9rem, 60px

[1msrc/components/lieux/desktop/sections/LieuAddressSection.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #e9ecef, #212529, #0d6efd, #ced4da, #86b7fe, rgba(var(--tc-color-primary-rgb, 13, 110, 253), #dc3545, #f0f0f0, #6c757d
  [33m- Tailles codées en dur (17):[0m 0.5rem, 2px, 4px, 1.25rem, 1rem, 1px, 0.625rem, 1.2rem, 0.375rem, 0.75rem, 0.25rem, 300px, 8px, 0.85rem, 0.125rem, 768px, 250px

[1msrc/components/lieux/desktop/sections/DeleteLieuModal.module.css:[0m
  [33m- Tailles codées en dur (8):[0m 1px, 1rem, 1.25rem, 0.5rem, 1.2rem, 4px, 0.75rem, 0.25rem

[1msrc/components/layout/Sidebar.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m rgba(0,0,0,0.1), rgba(255,255,255,0.1), #f8f9fa, rgba(255,255,255,0.2), #4a6da7, rgba(0, 0, 0, 0.5)
  [33m- Tailles codées en dur (10):[0m 250px, 100vh, 2px, 5px, 20px, 1px, 10px, 4px, 1.2em, 992px

[1msrc/components/layout/Navbar.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m #343a40, #fff, rgba(255,255,255,.1), rgba(255,255,255,.5), rgba(255,255,255,.55), rgba(255,255,255,.75), #f8f9fa, #000
  [33m- Tailles codées en dur (15):[0m 0.5rem, 1rem, 15px, 0.3125rem, 1.25rem, 0.25rem, 0.75rem, 1px, 1.5em, 0.5%, 0.875rem, 0.2rem, 992px, 0.02px, 75vh

[1msrc/components/layout/Layout.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #f8f9fa, rgba(0, 0, 0, 0.05)
  [33m- Tailles codées en dur (7):[0m 100vh, 250px, 20px, 15px, 2px, 4px, 992px

[1msrc/components/forms/Form.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #e74c3c, #fdf7f7, #333, #fff, #ccc, #3f51b5, rgba(63, 81, 181, 0.25)
  [33m- Tailles codées en dur (14):[0m 800px, 20px, 14px, 5px, 10px, 16px, 1px, 4px, 0.2rem, 25px, 992px, 768px, 576px, 15px

[1msrc/components/forms/validation/ValidationSummary.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #28a745, #d1e7dd, #0f5132, #0a3622, #dc3545, #f8d7da, #842029, #58151c, #ffc107, #fff3cd, #664d03, #513c01
  [33m- Tailles codées en dur (10):[0m 1.5rem, 1px, 0.375rem, 1rem, 3rem, 0.75rem, 768px, 2.5rem, 1.25rem, 576px

[1msrc/components/forms/validation/ValidationSection.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #dee2e6, #0d6efd, #0dcaf0, #6c757d, #f8f9fa, #cff4fc, #055160, rgba(0, 0, 0, 0.1), #495057
  [33m- Tailles codées en dur (12):[0m 1.5rem, 1px, 0.375rem, 0.75rem, 1.25rem, 0.5rem, 250px, 0.25rem, 3px, 768px, 1rem, 576px

[1msrc/components/forms/validation/ValidationModal.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.15), #dee2e6, #343a40, #6c757d, #495057, #e9ecef, #0d6efd, #0b5ed7
  [33m- Tailles codées en dur (10):[0m 0.5rem, 1rem, 500px, 20px, 1px, 1.25rem, 1.5rem, 0.25rem, 0.2em, 576px

[1msrc/components/forms/validation/ValidationActionBar.module.css:[0m
  [31m- Couleurs codées en dur (3):[0m #0d6efd, #0b5ed7, #adb5bd
  [33m- Tailles codées en dur (13):[0m 2rem, 0.5rem, 0.75rem, 1.5rem, 1.125rem, 0.375rem, 350px, 1.25rem, 0.2em, 768px, 280px, 1rem, 576px

[1msrc/components/forms/validation/FormHeader.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #ced4da, #495057, #f8f9fa, #adb5bd, #dee2e6
  [33m- Tailles codées en dur (9):[0m 1.5rem, 1rem, 1.75rem, 0.5rem, 1px, 0.25rem, 768px, 0.75rem, 576px

[1msrc/components/forms/validation/FieldValidationRow.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #dee2e6, #adb5bd, #0d6efd, #cfe2ff, #ced4da, rgba(13, 110, 253, 0.25), #e9ecef
  [33m- Tailles codées en dur (16):[0m 1px, 0.75rem, 150px, 250px, 60px, 4px, 0.25rem, 0.5rem, 0.375rem, 992px, 200px, 768px, 120px, 0.875rem, 180px, 576px

[1msrc/components/forms/public/PublicFormLayout.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #f8f9fa, rgba(0, 0, 0, 0.1), #fff, #e9ecef, rgba(0, 0, 0, 0.05), #212529, #6c757d
  [33m- Tailles codées en dur (9):[0m 100vh, 1200px, 20px, 1rem, 2rem, 1px, 2px, 4px, 0.9rem

[1msrc/components/forms/public/PublicFormContainer.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1000px, 20px, 768px, 15px, 576px, 10px

[1msrc/components/forms/public/FormSubmitBlock.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m #6c757d
  [33m- Tailles codées en dur (5):[0m 2rem, 1.5rem, 0.9rem, 1.25rem, 0.75rem

[1msrc/components/forms/public/FormPageHeader.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #212529, #6c757d
  [33m- Tailles codées en dur (4):[0m 1.5rem, 2rem, 0.5rem, 1.1rem

[1msrc/components/forms/public/FormLoadingState.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 2rem

[1msrc/components/forms/public/FormErrorPanel.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1.25rem, 0.75rem, 1rem

[1msrc/components/forms/public/FormContentWrapper.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #e9ecef, #6c757d
  [33m- Tailles codées en dur (5):[0m 1.5rem, 1px, 1.25rem, 0.5rem, 0.9rem

[1msrc/components/forms/public/ConcertInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m #e9ecef
  [33m- Tailles codées en dur (3):[0m 1px, 0.25rem, 1.25rem

[1msrc/components/forms/public/AdminFormValidation.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #f8f9fa, #e9ecef
  [33m- Tailles codées en dur (5):[0m 1rem, 1.5rem, 1.75rem, 0.25rem, 1px

[1msrc/components/forms/mobile/FormValidationInterface.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m #6c757d, #0d6efd, #f8f9fa, #dee2e6, rgba(0, 0, 0, 0.1), #666, #ddd, #eee
  [33m- Tailles codées en dur (17):[0m 50vh, 3rem, 300px, 5rem, 250px, 1px, 0.875rem, 3px, 0.375rem, 2.5rem, 100px, 200px, 2px, 10px, 60px, 4px, 0.95rem

[1msrc/components/forms/mobile/sections/ValidationSummary.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m rgba(0, 0, 0, 0.08)
  [33m- Tailles codées en dur (3):[0m 2px, 5px, 4px

[1msrc/components/forms/mobile/sections/ValidationSection.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m rgba(0, 0, 0, 0.08), #f8f9fa, #eee, #333, #6c757d, #0d6efd
  [33m- Tailles codées en dur (9):[0m 2px, 5px, 1px, 0.95rem, 6px, 3px, 8px, 0.7rem, 576px

[1msrc/components/forms/mobile/sections/ValidationModal.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #6c757d, #e9ecef
  [33m- Tailles codées en dur (3):[0m 12px, 0.95rem, 1px

[1msrc/components/forms/mobile/sections/ValidationActionBar.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (2):[0m 2px, 10px

[1msrc/components/forms/mobile/sections/FormHeader.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m #dee2e6
  [33m- Tailles codées en dur (2):[0m 1px, 576px

[1msrc/components/examples/ModalExample.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #4a90e2, #3a7bc8, #d4d4d4, #f5f5f5, rgba(74, 144, 226, 0.2)
  [33m- Tailles codées en dur (13):[0m 2rem, 800px, 1.5rem, 1rem, 0.75rem, 1.25rem, 4px, 300px, 1.2rem, 0.5rem, 1px, 0.9rem, 2px
  [36m- Variables sans préfixe tc- (4):[0m var(--text-primary, var(--primary-color, var(--primary-color-dark, var(--text-secondary

[1msrc/components/contrats/editor-modal.css:[0m
  [31m- Couleurs codées en dur (12):[0m #dee2e6, #6c757d, #dc3545, #17a2b8, #fff, #ccc, #06c, rgba(0,0,0,0.04), rgba(0,0,0,.125), rgba(0,0,0,.03), rgba(0,0,0,.2), rgba(0,0,0,.15)
  [33m- Tailles codées en dur (25):[0m 90vh, 10px, 15px, 20px, 1px, 5px, 0.25rem, 0.5rem, 0.875rem, 0.2rem, 4px, 8px, 24px, 28px, 3px, 150px, 14px, 12px, 1.5rem, 25rem, 75rem, 1.25rem, 1rem, 0px, 2px

[1msrc/components/contrats/FullscreenEditorModal.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m rgba(0, 0, 0, 0.5), #dee2e6, #0d6efd, #ccc, #f8f9fa
  [33m- Tailles codées en dur (8):[0m 100vh, 15px, 20px, 1px, 1.25rem, 16px, 800px, 10px

[1msrc/components/contrats/ContratVariable.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #dee2e6, #f8f9fa, #cfe2ff, #0d6efd, #6c757d
  [33m- Tailles codées en dur (5):[0m 8px, 12px, 4px, 1px, 0.875rem

[1msrc/components/contrats/ContratTemplateEditorModal.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m rgba(0, 0, 0, 0.5)
  [33m- Tailles codées en dur (1):[0m 100vh

[1msrc/components/contrats/sections/ContratVariablesCard.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 400px, 1px, 768px, 350px, 576px

[1msrc/components/contrats/sections/ContratPdfViewer.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 1px, 600px, 992px, 576px, 400px

[1msrc/components/contrats/sections/ContratHeader.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 576px

[1msrc/components/contrats/sections/ContratActions.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/contrats/desktop/ContratTemplateEditor.module.css:[0m
  [31m- Couleurs codées en dur (23):[0m #eee, #6c757d, #dc3545, rgba(0, 0, 0, 0.1), #ccc, #f0f0f0, #ddd, #f8f9fa, #e9ecef, rgba(0,0,0,0.1), #dee2e6, #495057, rgba(0,0,0,0.15), #f0f6ff, #d0e0ff, #0055cc, #e0efff, #a0c0ff, #344767, #333, #fff, rgba(0, 0, 0, 0.05), #eaeaea
  [33m- Tailles codées en dur (32):[0m 1px, 1rem, 1.5rem, 10px, 1.25rem, 4px, 6px, 20px, 300px, 100px, 2px, 5px, 3px, 12px, 500px, 15px, 0.875rem, 320px, 400px, 8px, 0.9rem, 0.85rem, 1.75rem, 60px, 700px, 992px, 0.75rem, 768px, 280px, 576px, 0.5rem, 50vh

[1msrc/components/contrats/desktop/ContratGenerator.module.css:[0m
  [31m- Couleurs codées en dur (3):[0m #333, #6c757d, rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (15):[0m 1400px, 1rem, 1.5rem, 1.75rem, 0.25rem, 0.875rem, 8px, 1px, 3px, 1.25rem, 300px, 992px, 768px, 576px, 0.75rem

[1msrc/components/contrats/desktop/sections/VariablesDropdown.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #f0f7ff, #2563eb, #bfdbfe, #dbeafe, #93c5fd, rgba(0, 0, 0, 0.1), #e5e7eb, #f3f4f6, #4b5563, #f9fafb, #6366f1
  [33m- Tailles codées en dur (18):[0m 1px, 4px, 6px, 12px, 0.85rem, 280px, 340px, 400px, 16px, 0.9rem, 300px, 8px, 10px, 2px, 0.8rem, 5px, 768px, 240px

[1msrc/components/contrats/desktop/sections/UserGuide.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m #f8f9fa, rgba(0, 0, 0, 0.1), #e9ecef, #dee2e6, #344767, #495057
  [33m- Tailles codées en dur (11):[0m 8px, 2px, 20px, 1px, 15px, 10px, 1.125rem, 16px, 1rem, 1.25rem, 4px

[1msrc/components/contrats/desktop/sections/ContratTemplateTitleSection.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m #6c757d, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25), #f8f9fa, #212529
  [33m- Tailles codées en dur (8):[0m 12px, 0.875rem, 8px, 4px, 1rem, 1px, 0.25rem, 0.75rem

[1msrc/components/contrats/desktop/sections/ContratTemplateSignatureSection.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1px, 150px, 4px, 768px, 576px, 120px

[1msrc/components/contrats/desktop/sections/ContratTemplateSelector.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 400px, 576px

[1msrc/components/contrats/desktop/sections/ContratTemplatePreview.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #e0e0e0, #fafafa, #f0f0f0, #344767, #f5f5f5
  [33m- Tailles codées en dur (8):[0m 1.5rem, 0.75rem, 1px, 4px, 1.25rem, 0.25rem, 0.5rem, 700px

[1msrc/components/contrats/desktop/sections/ContratTemplateInfoSection.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1px, 768px, 576px

[1msrc/components/contrats/desktop/sections/ContratTemplateHeaderSection.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #6c757d, #e9ecef, #f8f9fa, #dee2e6, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25)
  [33m- Tailles codées en dur (13):[0m 16px, 0.875rem, 8px, 150px, 70px, 1px, 4px, 20px, 6px, 12px, 0.9rem, 120px, 0.25rem

[1msrc/components/contrats/desktop/sections/ContratTemplateHeader.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m #e9ecef, #6c757d, #0d6efd, #212529, #dee2e6, #000
  [33m- Tailles codées en dur (12):[0m 20px, 12px, 1px, 8px, 0.9rem, 16px, 1.5rem, 10px, 1rem, 1.25rem, 0.25rem, 0.5rem

[1msrc/components/contrats/desktop/sections/ContratTemplateFooterSection.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #6c757d, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25), #f8f9fa
  [33m- Tailles codées en dur (13):[0m 16px, 0.875rem, 8px, 20px, 6px, 12px, 0.9rem, 1px, 4px, 100px, 0.25rem, 0.75rem, 0.85rem

[1msrc/components/contrats/desktop/sections/ContratTemplateBodySection.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #ffffff, #e9ecef, rgba(0, 0, 0, 0.05), #344767, #6c757d, #f8f9fa, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25), #eaeef2, #dee2e6
  [33m- Tailles codées en dur (17):[0m 6px, 1px, 1.25rem, 1.5rem, 3px, 16px, 1rem, 0.85rem, 2px, 4px, 0.8rem, 20px, 400px, 12px, 0.9rem, 0.25rem, 0.875rem

[1msrc/components/contrats/desktop/sections/ContratNoTemplates.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 1rem

[1msrc/components/contrats/desktop/sections/ContratLoadingSpinner.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m #6c757d
  [33m- Tailles codées en dur (2):[0m 2rem, 1rem

[1msrc/components/contrats/desktop/sections/ContratGenerationActions.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/contrats/desktop/sections/ContratDebugPanel.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m #ddd, #f8f9fa, #eee, #f0f0f0
  [33m- Tailles codées en dur (9):[0m 2rem, 1rem, 1px, 4px, 0.75rem, 0.5rem, 3px, 200px, 0.8rem

[1msrc/components/contrats/desktop/sections/ContratAlerts.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 576px

[1msrc/components/contrats/desktop/sections/CollapsibleSection.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #ffffff, #e9ecef, rgba(0, 0, 0, 0.05), #f8f9fa, #344767
  [33m- Tailles codées en dur (6):[0m 6px, 1px, 1rem, 3px, 0.75rem, 1.25rem

[1msrc/components/concerts/ConcertForm.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #f8f9fa, #6c757d, #fff, rgba(0, 0, 0, 0.1), #e9ecef, #333, #007bff
  [33m- Tailles codées en dur (20):[0m 1.5rem, 1000px, 900px, 1200px, 300px, 1rem, 1.1rem, 20px, 500px, 8px, 2px, 4px, 0.5rem, 1px, 250px, 1.25rem, 992px, 768px, 576px, 0.75rem

[1msrc/components/concerts/sections/SelectedEntityCard.module.css:[0m
  [31m- Couleurs codées en dur (12):[0m #ffffff, #e9ecef, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1), #f0f0f0, rgba(13, 110, 253, 0.1), #0d6efd, #344767, #6c757d, #f8d7da, #dc3545, #495057
  [33m- Tailles codées en dur (15):[0m 1px, 8px, 2px, 5px, 1rem, 4px, 0.75rem, 32px, 6px, 1.1rem, 24px, 0.5rem, 0.875rem, 16px, 0.8rem

[1msrc/components/concerts/sections/SearchDropdown.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1px, 300px, 260px, 768px, 250px, 576px

[1msrc/components/concerts/sections/ProgrammateurSearchSection.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 1px, 992px, 768px, 576px

[1msrc/components/concerts/sections/NotesSection.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 1px, 120px, 992px, 768px, 576px, 100px

[1msrc/components/concerts/sections/LieuSearchSection.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 1px, 992px, 768px, 576px

[1msrc/components/concerts/sections/DeleteConfirmModal.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 500px, 1px, 768px, 576px

[1msrc/components/concerts/sections/ConcertsTable.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(0, 0, 0, 0.05), #f8f9fa, #495057, #6c757d
  [33m- Tailles codées en dur (9):[0m 1rem, 0.5rem, 2px, 4px, 0.75rem, 0.9rem, 2rem, 768px, 700px

[1msrc/components/concerts/sections/ConcertsListHeader.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 576px

[1msrc/components/concerts/sections/ConcertStatusTabs.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/concerts/sections/ConcertSearchBar.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m #ced4da, #007bff, #6c757d, #dc3545
  [33m- Tailles codées en dur (10):[0m 1.5rem, 1rem, 450px, 0.5rem, 2.5rem, 1px, 0.25rem, 0.75rem, 180px, 768px

[1msrc/components/concerts/sections/ConcertRow.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m rgba(0, 0, 0, 0.04), #6c757d
  [33m- Tailles codées en dur (7):[0m 100px, 0.75rem, 180px, 0.85rem, 150px, 140px, 120px

[1msrc/components/concerts/sections/ConcertInfoSectionEdit.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #333, #212529, #fff, #ced4da, #86b7fe, rgba(13, 110, 253, 0.25), #e9ecef, #dc3545, #6c757d
  [33m- Tailles codées en dur (17):[0m 20px, 8px, 1.5em, 0.75rem, 2px, 0.375rem, 1rem, 1px, 0.25rem, 2.25rem, 16px, 12px, 10px, 250px, 4px, 0.875rem, 24px

[1msrc/components/concerts/sections/ConcertInfoSection.module.css:[0m
  [31m- Couleurs codées en dur (14):[0m #ffffff, rgba(0, 0, 0, 0.1), #e9ecef, #f8f9fa, rgba(0, 123, 255, 0.1), #007bff, #333333, #ced4da, #fff, #86b7fe, rgba(13, 110, 253, 0.25), #6c757d, #dc3545, #212529
  [33m- Tailles codées en dur (21):[0m 8px, 2px, 4px, 1.5rem, 1px, 1rem, 1.25rem, 32px, 6px, 0.5rem, 250px, 0.75rem, 0.25rem, 16px, 12px, 0.875rem, 992px, 768px, 576px, 24px, 1.125rem

[1msrc/components/concerts/sections/ConcertFormHeader.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/concerts/sections/ConcertFormActions.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 1px, 768px, 576px

[1msrc/components/concerts/sections/ConcertActions.module.css:[0m
  [33m- Tailles codées en dur (1):[0m 576px

[1msrc/components/concerts/sections/ArtisteSearchSection.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 1px, 992px, 768px, 576px

[1msrc/components/concerts/mobile/ConcertsList.module.css:[0m
  [31m- Couleurs codées en dur (11):[0m #f8f9fa, #fff, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1), #007bff, #6c757d, #555, #f0f0f0, #28a745, #f8d7da, #721c24
  [33m- Tailles codées en dur (14):[0m 100vh, 56px, 4px, 2px, 8px, 60px, 0.875rem, 0.375rem, 16px, 0.125rem, 1px, 3rem, 576px, 50px

[1msrc/components/concerts/mobile/ConcertDetails.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #f8f9fa, #fff, rgba(0, 0, 0, 0.05), #0d6efd, rgba(0, 0, 0, 0.1), #f0f0f0, #6c757d, #dee2e6, #555
  [33m- Tailles codées en dur (14):[0m 100vh, 56px, 70px, 2px, 4px, 12px, 0.375rem, 1px, 3px, 6px, 16px, 2.5rem, 50vh, 576px

[1msrc/components/concerts/mobile/sections/DeleteConcertModalMobile.module.css:[0m
  [31m- Couleurs codées en dur (2):[0m #6c757d, #dee2e6
  [33m- Tailles codées en dur (5):[0m 10px, 3rem, 0.95rem, 1px, 100px

[1msrc/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #eee, #555, #ddd, #666, #f8f9fa, #dee2e6, #d1e7dd, #0f5132, #0d6efd, #6c757d
  [33m- Tailles codées en dur (5):[0m 1px, 2.5rem, 200px, 20px, 2rem

[1msrc/components/concerts/mobile/sections/ConcertLocationSectionMobile.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #eee, #555, #ddd, #666, #f8f9fa, #dee2e6, #6c757d
  [33m- Tailles codées en dur (5):[0m 1px, 2.5rem, 200px, 20px, 2rem

[1msrc/components/concerts/mobile/sections/ConcertHeaderMobile.module.css:[0m
  [31m- Couleurs codées en dur (3):[0m rgba(0, 0, 0, 0.1), #333, #666
  [33m- Tailles codées en dur (2):[0m 1px, 3px

[1msrc/components/concerts/mobile/sections/ConcertGeneralInfoMobile.module.css:[0m
  [31m- Couleurs codées en dur (5):[0m #555, #eee, rgba(220, 53, 69, 0.1), #666, #f8f9fa
  [33m- Tailles codées en dur (2):[0m 100px, 1px

[1msrc/components/concerts/mobile/sections/ConcertArtistSectionMobile.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #eee, #555, #ddd, #666, #f8f9fa, #dee2e6, #6c757d
  [33m- Tailles codées en dur (5):[0m 1px, 2.5rem, 200px, 20px, 2rem

[1msrc/components/concerts/mobile/sections/ActionBarMobile.module.css:[0m
  [31m- Couleurs codées en dur (1):[0m rgba(0, 0, 0, 0.1)
  [33m- Tailles codées en dur (3):[0m 2px, 10px, 360px

[1msrc/components/concerts/desktop/DeleteConcertModal.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m rgba(0, 0, 0, 0.5), #fff, rgba(0, 0, 0, 0.15), #eee
  [33m- Tailles codées en dur (8):[0m 0.5rem, 450px, 90vw, 4px, 20px, 1rem, 1px, 1.5rem

[1msrc/components/concerts/desktop/ConcertsList.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #333, #6c757d, #007bff, #0069d9, #f8f9fa, #e9ecef, rgba(0, 0, 0, 0.1), #dee2e6, rgba(0, 123, 255, 0.05), #adb5bd
  [33m- Tailles codées en dur (16):[0m 1400px, 1rem, 1.5rem, 1.75rem, 0.25rem, 0.875rem, 0.5rem, 1px, 200px, 3px, 0.75rem, 3rem, 1.25rem, 500px, 992px, 768px

[1msrc/components/concerts/desktop/ConcertStructureSection.module.css:[0m
  [31m- Couleurs codées en dur (6):[0m #ffffff, rgba(0, 0, 0, 0.05), #e9ecef, #f8f9fa, #6c757d, #0d6efd
  [33m- Tailles codées en dur (15):[0m 8px, 2px, 4px, 20px, 1px, 15px, 10px, 18px, 1.2rem, 14px, 5px, 3px, 13px, 12px, 6px

[1msrc/components/concerts/desktop/ConcertOrganizerSection.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eee, #007bff, #ddd, #666
  [33m- Tailles codées en dur (16):[0m 8px, 2px, 4px, 1.5rem, 1rem, 1px, 0.5rem, 1.1rem, 1.25rem, 6px, 0.75rem, 0.875rem, 0.25rem, 0.375rem, 0.8rem, 768px

[1msrc/components/concerts/desktop/ConcertLocationSection.module.css:[0m
  [31m- Couleurs codées en dur (8):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eee, #007bff, #dc3545, #ddd, #666
  [33m- Tailles codées en dur (17):[0m 8px, 2px, 4px, 1.5rem, 1rem, 1px, 0.5rem, 1.1rem, 1.25rem, 3px, 6px, 0.75rem, 0.875rem, 0.25rem, 0.375rem, 0.8rem, 768px

[1msrc/components/concerts/desktop/ConcertHeader.module.css:[0m
  [31m- Couleurs codées en dur (3):[0m #007bff, #333, #6c757d
  [33m- Tailles codées en dur (7):[0m 1.5rem, 0.5rem, 0.875rem, 12px, 130px, 40px, 768px

[1msrc/components/concerts/desktop/ConcertGeneralInfo.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eee, #007bff, #dc3545, #ffc107
  [33m- Tailles codées en dur (13):[0m 8px, 2px, 4px, 1.5rem, 1rem, 1px, 0.5rem, 1.1rem, 1.25rem, 3px, 0.85rem, 0.25rem, 768px

[1msrc/components/concerts/desktop/ConcertForm.module.css:[0m
  [31m- Couleurs codées en dur (16):[0m #f8f9fa, #007bff, #333, #6c757d, #fff, rgba(0, 0, 0, 0.1), #eee, #e9ecef, #dc3545, #ced4da, rgba(0, 123, 255, 0.25), #ddd, #666, #f0f0f0, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.15)
  [33m- Tailles codées en dur (34):[0m 1000px, 1.5rem, 1200px, 0.5rem, 0.875rem, 0.75rem, 130px, 40px, 1rem, 20px, 8px, 2px, 4px, 24px, 1px, 16px, 1.1rem, 1.25rem, 18px, 6px, 3px, 0.25rem, 0.2rem, 10px, 0.375rem, 0.85rem, 200px, 15px, 2rem, 450px, 90vw, 300px, 768px, 12px

[1msrc/components/concerts/desktop/ConcertDetails.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m #007bff, #333, #6c757d, #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eee, #dc3545, #ffc107, #ddd, #666, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.15)
  [33m- Tailles codées en dur (28):[0m 900px, 20px, 1.5rem, 0.5rem, 0.875rem, 12px, 130px, 40px, 8px, 2px, 4px, 1rem, 1px, 1.1rem, 1.25rem, 3px, 0.85rem, 0.25rem, 6px, 0.75rem, 0.375rem, 450px, 90vw, 992px, 16px, 768px, 576px, 95vw

[1msrc/components/concerts/desktop/ConcertArtistSection.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #fff, rgba(0, 0, 0, 0.1), #f8f9fa, #eee, #007bff, #ddd, #666
  [33m- Tailles codées en dur (15):[0m 8px, 2px, 4px, 1.5rem, 1rem, 1px, 0.5rem, 1.1rem, 1.25rem, 6px, 0.75rem, 0.875rem, 0.25rem, 0.8rem, 768px

[1msrc/components/common/StatusWithInfo.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 0.2px, 576px

[1msrc/components/common/Modal.module.css:[0m
  [31m- Couleurs codées en dur (14):[0m rgba(0, 0, 0, 0.5), #fff, rgba(0, 0, 0, 0.15), #e5e5e5, #f8f9fa, #333, #6c757d, #343a40, rgba(0, 0, 0, 0.05), #dc3545, #28a745, #ffc107, #17a2b8, #0d6efd
  [33m- Tailles codées en dur (23):[0m 600px, 90vh, 400px, 800px, 1px, 992px, 700px, 768px, 80vh, 50vh, 576px, 8px, 4px, 20px, 480px, 640px, 920px, 1rem, 1.5rem, 1.25rem, 0.75rem, 0.25rem, 2px

[1msrc/components/common/EnvironmentBanner.css:[0m
  [31m- Couleurs codées en dur (4):[0m #ff9800, #000, #2196f3, #fff
  [33m- Tailles codées en dur (2):[0m 8px, 14px

[1msrc/components/common/ActionButton.module.css:[0m
  [33m- Tailles codées en dur (3):[0m 32px, 576px, 36px

[1msrc/components/common/ui/Card.module.css:[0m
  [31m- Couleurs codées en dur (9):[0m #333, rgba(0, 0, 0, 0.1), #e0e0e0, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.18), #666, #f5f5f5
  [33m- Tailles codées en dur (17):[0m 0.5rem, 2px, 5px, 1px, 4px, 12px, 8px, 16px, 1rem, 48px, 1.125rem, 0.25rem, 0.875rem, 0.75rem, 1.5rem, 768px, 1.25rem
  [36m- Variables sans préfixe tc- (4):[0m var(--text-primary, var(--border-color, var(--text-secondary, var(--background-secondary

[1msrc/components/common/ui/Card.css:[0m
  [31m- Couleurs codées en dur (8):[0m #ffffff, #e0e0e0, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.15), #f9f9f9, #333333, #666666
  [33m- Tailles codées en dur (12):[0m 8px, 1rem, 2px, 4px, 16px, 1px, 0.75rem, 1.25rem, 0.25rem, 0.875rem, 768px, 1.125rem

[1msrc/components/common/steps/StepProgress.module.css:[0m
  [33m- Tailles codées en dur (12):[0m 2.25rem, 1px, 6px, 3px, 1.3rem, 768px, 1.75rem, 1.1rem, 576px, 1.5rem, 4px, 0.9rem

[1msrc/components/common/steps/StepNavigation.module.css:[0m
  [33m- Tailles codées en dur (9):[0m 600px, 2rem, 1px, 6px, 3px, 1.25rem, 768px, 576px, 1.75rem

[1msrc/components/artistes/sections/ArtistesTable.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 1px, 768px, 576px, 540px

[1msrc/components/artistes/sections/ArtistesStatsCards.module.css:[0m
  [33m- Tailles codées en dur (6):[0m 5px, 50px, 768px, 40px, 576px, 36px

[1msrc/components/artistes/sections/ArtistesListHeader.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/artistes/sections/ArtistesEmptyState.module.css:[0m
  [33m- Tailles codées en dur (2):[0m 768px, 576px

[1msrc/components/artistes/sections/ArtisteSearchBar.module.css:[0m
  [33m- Tailles codées en dur (7):[0m 1px, 300px, 40px, 768px, 250px, 576px, 32px

[1msrc/components/artistes/sections/ArtisteRow.module.css:[0m
  [33m- Tailles codées en dur (5):[0m 350px, 40px, 768px, 576px, 32px

[1msrc/components/artistes/sections/ArtisteHeader.module.css:[0m
  [33m- Tailles codées en dur (4):[0m 80px, 768px, 60px, 576px

[1msrc/components/artistes/mobile/ArtistesList.module.css:[0m
  [31m- Couleurs codées en dur (16):[0m #fff, #eee, #333, #f8f9fa, #dee2e6, #0d6efd, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1), #6c757d, #0dcaf0, #ffc107, rgba(0, 0, 0, 0.15), #212529, #f0f0f0, #e9ecef, rgba(13, 110, 253, 0.05)
  [33m- Tailles codées en dur (16):[0m 1px, 1.75rem, 2.5rem, 0.875rem, 2px, 4px, 8px, 120px, 3rem, 40px, 0.375rem, 300px, 36px, 48px, 0.35rem, 16px

[1msrc/components/artistes/mobile/ArtisteForm.module.css:[0m
  [31m- Couleurs codées en dur (7):[0m #fff, #eee, rgba(0, 0, 0, 0.05), #344767, #f0f0f0, #f8f9fa, #dee2e6
  [33m- Tailles codées en dur (4):[0m 200px, 1px, 2px, 4px

[1msrc/components/artistes/mobile/ArtisteDetail.module.css:[0m
  [31m- Couleurs codées en dur (10):[0m #dee2e6, #f8f9fa, #212529, #007bff, rgba(0, 0, 0, 0.1), #e9ecef, #adb5bd, #6c757d, #cfe2ff, #ced4da
  [33m- Tailles codées en dur (17):[0m 16px, 36px, 1px, 12px, 2px, 8px, 180px, 48px, 5px, 80px, 10px, 4px, 200px, 6px, 40px, 2.5rem, 300px

[1msrc/components/artistes/desktop/ArtistesList.module.css:[0m
  [31m- Couleurs codées en dur (14):[0m rgba(13, 110, 253, 0.1), #dee2e6, rgba(0, 0, 0, 0.15), #212529, #f0f0f0, #f8f9fa, #0d6efd, #f0f8ff, #e9ecef, #6c757d, rgba(0, 0, 0, 0.075), #495057, #fff8e8, #fff3d1
  [33m- Tailles codées en dur (21):[0m 3px, 50px, 1px, 0.375rem, 0.5rem, 1rem, 0.75rem, 40px, 1.25rem, 0.125rem, 0.25rem, 1.5rem, 250px, 48px, 1200px, 300px, 2rem, 992px, 768px, 700px, 576px

[1msrc/components/artistes/desktop/ArtisteForm.module.css:[0m
  [31m- Couleurs codées en dur (4):[0m #333, rgba(0,0,0,0.05), #ddd, #6c757d
  [33m- Tailles codées en dur (17):[0m 800px, 20px, 30px, 1.8rem, 8px, 2px, 4px, 25px, 10px, 1px, 14px, 100px, 15px, 200px, 18px, 768px, 576px

[1msrc/components/artistes/desktop/ArtisteDetail.module.css:[0m
  [31m- Couleurs codées en dur (13):[0m #f8f9fa, #dee2e6, #e9ecef, #007bff, #0069d9, rgba(0, 0, 0, 0.1), #adb5bd, #212529, #6c757d, #f0f7ff, #cfe2ff, #ced4da, #dc3545
  [33m- Tailles codées en dur (32):[0m 1200px, 20px, 2rem, 8px, 12px, 1px, 4px, 16px, 2px, 240px, 64px, 0.5rem, 1.75rem, 1rem, 1.5rem, 1.1rem, 0.75rem, 200px, 10px, 6px, 15px, 100px, 0.9rem, 250px, 50px, 40px, 3rem, 992px, 768px, 180px, 576px, 300px

[1m[34m=== Résumé ===[0m
Fichiers analysés: 252
Fichiers avec problèmes: 236
Couleurs codées en dur: 1502
Tailles codées en dur: 2509
Variables sans préfixe tc-: 12

[33mPour corriger automatiquement ces problèmes, exécutez:[0m
  node check-css-vars.js --fix
```


## Classes Bootstrap

*Date de génération: 5/17/2025, 3:53:39 AM*

## Résumé

- **Fichiers analysés**: 481
- **Fichiers avec problèmes**: 76
- **Problèmes de boutons**: 55
- **Problèmes de cartes**: 19
- **Autres problèmes**: 149

## Recommandations

### Boutons

Remplacer les classes Bootstrap par les classes standardisées TourCraft :

**Exemple avant** :
```jsx
<button className="btn btn-primary">Enregistrer</button>
```

**Exemple après** :
```jsx
<button className="tc-btn tc-btn-primary">Enregistrer</button>
```

### Cartes

Utiliser le composant Card standardisé au lieu des classes Bootstrap :

**Exemple avant** :
```jsx
<div className="card"><div className="card-body">Contenu</div></div>
```

**Exemple après** :
```jsx
<Card>Contenu</Card>
```

## Fichiers à corriger

### Priorité haute (plus de 5 occurrences)

- **src/pages/DashboardPage.js** (16 occurrences)
- **src/components/exemples/ProgrammateurFormExemple.js** (15 occurrences)
- **src/components/exemples/ArtisteFormExemple.js** (10 occurrences)
- **src/components/concerts/desktop/ConcertOrganizerSection.js** (9 occurrences)
- **src/components/concerts/desktop/ConcertGeneralInfo.js** (9 occurrences)
- **src/components/concerts/desktop/ConcertStructureSection.js** (8 occurrences)
- **src/components/exemples/FormulairesOptimisesIndex.js** (7 occurrences)
- **src/components/concerts/desktop/ConcertLocationSection.js** (7 occurrences)
- **src/components/concerts/desktop/ConcertArtistSection.js** (7 occurrences)

### Priorité moyenne (2-5 occurrences)

- **src/components/programmateurs/desktop/ProgrammateurContactSection.js** (5 occurrences)
- **src/components/lieux/desktop/sections/LieuOrganizerSection.js** (5 occurrences)
- **src/components/forms/FormGenerator.js** (5 occurrences)
- **src/components/programmateurs/desktop/ProgrammateurAddressSection.js** (4 occurrences)
- **src/components/lieux/desktop/sections/LieuAddressSection.js** (4 occurrences)
- **src/components/forms/validation/FormValidationInterfaceNew.js** (4 occurrences)
- **src/components/forms/validation/FormValidationInterface.js** (4 occurrences)
- **src/components/contrats/desktop/sections/ContratGenerationActions.js** (4 occurrences)
- **src/components/artistes/desktop/ArtisteForm.js** (4 occurrences)
- **src/pages/LoginPage.js** (3 occurrences)
- **src/components/structures/desktop/StructuresList.js** (3 occurrences)
- **src/components/programmateurs/mobile/ProgrammateurForm.js** (3 occurrences)
- **src/components/programmateurs/desktop/DeleteProgrammateurModal.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuStructuresSection.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuInfoSection.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuContactSection.js** (3 occurrences)
- **src/components/forms/public/AdminFormValidation.js** (3 occurrences)
- **src/components/contrats/sections/ContratPdfViewer.js** (3 occurrences)
- **src/components/common/layout/MobileLayout.js** (3 occurrences)
- **src/pages/contratTemplatesEditPage.js** (2 occurrences)
- **src/components/ui/LegalInfoSection.js** (2 occurrences)
- **src/components/structures/desktop/sections/StructureAssociationsSection.js** (2 occurrences)
- **src/components/programmateurs/RenderedView.jsx** (2 occurrences)
- **src/components/parametres/sections/EntrepriseSearchResults.js** (2 occurrences)
- **src/components/molecules/GenericList.js** (2 occurrences)
- **src/components/lieux/mobile/LieuView.js** (2 occurrences)
- **src/components/lieux/desktop/LieuView.js** (2 occurrences)
- **src/components/lieux/desktop/LieuFormOptimized.js** (2 occurrences)
- **src/components/lieux/desktop/LieuDetails.js** (2 occurrences)
- **src/components/lieux/desktop/sections/LieuGeneralInfo.js** (2 occurrences)
- **src/components/lieux/desktop/sections/LieuConcertsSection.js** (2 occurrences)
- **src/components/forms/public/FormSubmitBlock.js** (2 occurrences)
- **src/components/debug/PerformanceMonitor.js** (2 occurrences)
- **src/components/contrats/sections/ContratPdfTabs.js** (2 occurrences)
- **src/components/contrats/desktop/sections/ContratTemplateHeaderSection.js** (2 occurrences)
- **src/components/contrats/desktop/sections/ContratTemplateFooterSection.js** (2 occurrences)
- **src/components/concerts/desktop/DeleteConcertModal.js** (2 occurrences)

### Priorité basse (1 occurrence)

- **src/pages/contratTemplatesPage.js**
- **src/pages/ContratDetailsPage.js**
- **src/components/structures/desktop/sections/StructureBillingSection.js**
- **src/components/programmateurs/desktop/ProgrammateursList.js**
- **src/components/programmateurs/desktop/ProgrammateurLegalSection.js**
- **src/components/programmateurs/desktop/ProgrammateurHeader.js**
- **src/components/parametres/sections/EntrepriseHeader.js**
- **src/components/lieux/desktop/LieuForm.js**
- **src/components/lieux/desktop/sections/LieuxListEmptyState.js**
- **src/components/forms/public/PublicFormContainer.js**
- **src/components/contrats/fullscreenEditorModal.js**
- **src/components/contrats/desktop/ContratTemplateEditor.js**
- **src/components/contrats/desktop/sections/ContratTemplateInfoSection.js**
- **src/components/contrats/desktop/sections/ContratTemplateHeader.js**
- **src/components/contrats/desktop/sections/ContratNoTemplates.js**
- **src/components/concerts/sections/SearchDropdown.js**
- **src/components/concerts/sections/DeleteConfirmModal.js**
- **src/components/concerts/sections/ConcertsListHeader.js**
- **src/components/concerts/sections/ConcertFormActions.js**
- **src/components/concerts/mobile/sections/ConcertLocationSectionMobile.js**
- **src/components/concerts/desktop/ConcertsList.js**
- **src/components/concerts/desktop/ConcertHeader.js**
- **src/components/concerts/desktop/ConcertDetails.js**
- **src/components/common/Modal.js**
- **src/components/common/Layout.js**
- **src/components/common/layout/DesktopLayout.js**
- **src/components/artistes/mobile/ArtisteView.js**
- **src/components/artistes/desktop/ArtistesList.js**
- **src/components/artistes/desktop/ArtisteView.js**
- **src/components/artistes/desktop/ArtisteDetail.js**

## Composants Card

### Résultats de l'audit

```

> app-booking@0.1.0 audit:card
> node scripts/audit_card_usage.js

Démarrage de l'audit des composants Card...
Analyse de 464 fichiers JS/JSX...
Rapport d'audit généré: /Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/card_audit_report.md

=== Résumé de l'audit ===
Fichiers analysés: 464
Fichiers utilisant Card: 55
Fichiers avec import correct: 38
Fichiers avec import problématique: 0
Fichiers avec implémentation "DIY": 0

✅ Tous les composants utilisent correctement le composant Card standardisé.
Pour plus d'informations sur les standards, consultez docs/standards/components-standardises.md
```


## Plan d'action

Sur la base des résultats de cet audit, voici les actions prioritaires à mettre en œuvre :

### 1. Standardisation des variables CSS

- [ ] Remplacer toutes les valeurs codées en dur par des variables CSS
- [ ] Ajouter le préfixe `--tc-` à toutes les variables CSS
- [ ] Supprimer les fallbacks codés en dur dans les fichiers CSS
### 2. Migration des classes Bootstrap

- [ ] Migrer les boutons vers les classes `tc-btn` et `tc-btn-*`
- [ ] Remplacer les classes de cartes par le composant Card standardisé
- [ ] Évaluer et migrer les autres composants Bootstrap (formulaires, alertes, etc.)
### 3. Standardisation des composants Card

- [ ] Identifier tous les composants utilisant des cartes personnalisées
- [ ] Migrer vers le composant Card standardisé
- [ ] Tester les composants migrés pour assurer la cohérence visuelle
### 4. Documentation et formation

- [ ] Mettre à jour la documentation CSS existante
- [ ] Former l'équipe aux standards de développement CSS
- [ ] Mettre en place un processus de revue code pour assurer le respect des standards
