<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Formulaire Programmateur</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        /* Variables CSS TourCraft */
        :root {
            --tc-color-primary: #213547;
            --tc-color-primary-light: #2d4a63;
            --tc-color-primary-dark: #1a2b3a;
            --tc-color-secondary: #1e88e5;
            --tc-color-secondary-light: #64b5f6;
            --tc-color-success: #4caf50;
            --tc-color-warning: #ffc107;
            --tc-color-error: #f44336;
            --tc-color-info: #2196f3;
            
            --tc-color-white: #ffffff;
            --tc-color-gray-50: #f9fafb;
            --tc-color-gray-100: #f5f7f9;
            --tc-color-gray-200: #e5e7eb;
            --tc-color-gray-300: #d1d5db;
            --tc-color-gray-500: #6b7280;
            --tc-color-gray-600: #4b5563;
            --tc-color-gray-700: #374151;
            --tc-color-gray-800: #1f2937;
            
            --tc-bg-default: #ffffff;
            --tc-bg-light: #f5f7f9;
            --tc-bg-subtle: #f8f9fa;
            --tc-text-default: #333333;
            --tc-text-secondary: #555555;
            --tc-text-muted: #888888;
            --tc-border-default: #e0e0e0;
            --tc-border-light: #dee2e6;
            
            --tc-font-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            --tc-font-size-xs: 0.75rem;
            --tc-font-size-sm: 0.875rem;
            --tc-font-size-base: 1rem;
            --tc-font-size-lg: 1.125rem;
            --tc-font-size-xl: 1.5rem;
            --tc-font-weight-normal: 400;
            --tc-font-weight-medium: 500;
            --tc-font-weight-semibold: 600;
            --tc-font-weight-bold: 700;
            
            --tc-space-1: 0.25rem;
            --tc-space-2: 0.5rem;
            --tc-space-3: 0.75rem;
            --tc-space-4: 1rem;
            --tc-space-5: 1.25rem;
            --tc-space-6: 1.5rem;
            --tc-space-8: 2rem;
            
            --tc-radius-sm: 0.25rem;
            --tc-radius-base: 0.375rem;
            --tc-radius-lg: 0.75rem;
            --tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
            --tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
            --tc-transition-base: 300ms ease;
        }

        /* Base styles */
        body {
            font-family: var(--tc-font-sans);
            background-color: var(--tc-bg-light);
            color: var(--tc-text-default);
            line-height: 1.5;
            margin: 0;
            padding: var(--tc-space-4);
        }

        /* Container principal */
        .form-container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--tc-bg-default);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-base);
            overflow: hidden;
        }

        /* Header */
        .form-header {
            background: linear-gradient(135deg, var(--tc-color-primary), var(--tc-color-primary-light));
            color: white;
            padding: var(--tc-space-6);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--tc-space-4);
        }

        .header-title {
            margin: 0;
            font-size: var(--tc-font-size-xl);
            font-weight: var(--tc-font-weight-bold);
        }

        .header-actions {
            display: flex;
            gap: var(--tc-space-2);
            flex-wrap: wrap;
        }

        /* Boutons */
        .tc-btn {
            padding: var(--tc-space-2) var(--tc-space-4);
            border-radius: var(--tc-radius-base);
            border: none;
            font-weight: var(--tc-font-weight-medium);
            font-size: var(--tc-font-size-sm);
            cursor: pointer;
            transition: var(--tc-transition-base);
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-2);
            text-decoration: none;
            min-width: 120px;
            justify-content: center;
        }

        .tc-btn-primary {
            background-color: var(--tc-color-success);
            color: white;
        }

        .tc-btn-primary:hover {
            background-color: #388e3c;
            transform: translateY(-1px);
        }

        .tc-btn-secondary {
            background-color: var(--tc-color-gray-500);
            color: white;
        }

        .tc-btn-secondary:hover {
            background-color: var(--tc-color-gray-600);
        }

        .tc-btn-danger {
            background-color: var(--tc-color-error);
            color: white;
        }

        .tc-btn-danger:hover {
            background-color: #d32f2f;
        }

        .tc-btn-outline {
            background-color: transparent;
            border: 1px solid var(--tc-color-primary);
            color: var(--tc-color-primary);
        }

        .tc-btn-outline:hover {
            background-color: var(--tc-color-primary);
            color: white;
        }

        /* Sections */
        .form-section {
            margin-bottom: var(--tc-space-6);
        }

        .section-card {
            background: var(--tc-bg-default);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-sm);
            overflow: hidden;
            margin-bottom: var(--tc-space-4);
        }

        .section-header {
            background: var(--tc-color-gray-50);
            padding: var(--tc-space-4);
            border-bottom: 1px solid var(--tc-border-light);
            display: flex;
            align-items: center;
            gap: var(--tc-space-3);
        }

        .section-icon {
            color: var(--tc-color-primary);
            font-size: var(--tc-font-size-lg);
        }

        .section-title {
            margin: 0;
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
        }

        .section-body {
            padding: var(--tc-space-6);
        }

        /* Form elements */
        .form-group {
            margin-bottom: var(--tc-space-4);
        }

        .form-label {
            display: block;
            margin-bottom: var(--tc-space-2);
            font-weight: var(--tc-font-weight-medium);
            color: var(--tc-text-default);
        }

        .required {
            color: var(--tc-color-error);
        }

        .form-control {
            width: 100%;
            padding: var(--tc-space-3);
            border: 1px solid var(--tc-border-default);
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-base);
            transition: var(--tc-transition-base);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--tc-color-primary);
            box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.1);
        }

        /* Search sections */
        .search-section {
            background: var(--tc-bg-subtle);
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-4);
            margin-bottom: var(--tc-space-4);
        }

        .search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--tc-space-3);
        }

        .search-title {
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
            margin: 0;
        }

        .search-bar {
            position: relative;
            margin-bottom: var(--tc-space-3);
        }

        .search-input-group {
            display: flex;
            gap: var(--tc-space-2);
        }

        .search-input {
            flex: 1;
            padding: var(--tc-space-3);
            border: 1px solid var(--tc-border-default);
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-base);
        }

        .search-btn {
            padding: var(--tc-space-3) var(--tc-space-4);
            background: var(--tc-color-primary);
            color: white;
            border: none;
            border-radius: var(--tc-radius-base);
            cursor: pointer;
            transition: var(--tc-transition-base);
            white-space: nowrap;
        }

        .search-btn:hover {
            background: var(--tc-color-primary-dark);
        }

        .search-results {
            background: white;
            border: 1px solid var(--tc-border-light);
            border-radius: var(--tc-radius-base);
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }

        .search-result-item {
            padding: var(--tc-space-3);
            border-bottom: 1px solid var(--tc-border-light);
            cursor: pointer;
            transition: var(--tc-transition-base);
        }

        .search-result-item:hover {
            background: var(--tc-color-gray-50);
        }

        .search-result-item:last-child {
            border-bottom: none;
        }

        /* Grid layout */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--tc-space-4);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--tc-space-4);
        }

        /* Messages */
        .alert {
            padding: var(--tc-space-3);
            border-radius: var(--tc-radius-base);
            margin-bottom: var(--tc-space-4);
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .alert-info {
            background: rgba(33, 150, 243, 0.1);
            border: 1px solid rgba(33, 150, 243, 0.2);
            color: var(--tc-color-info);
        }

        .alert-warning {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.2);
            color: var(--tc-color-warning);
        }

        /* Loading states */
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid var(--tc-color-gray-300);
            border-radius: 50%;
            border-top-color: var(--tc-color-primary);
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            body {
                padding: var(--tc-space-2);
            }
            
            .form-header {
                flex-direction: column;
                text-align: center;
            }
            
            .header-actions {
                width: 100%;
                justify-content: center;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .section-body {
                padding: var(--tc-space-4);
            }
            
            .search-input-group {
                flex-direction: column;
            }
        }

        /* PDF optimization */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .form-container {
                box-shadow: none;
                border: none;
            }
            
            .tc-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="header-title">
                <i class="bi bi-person-badge me-2"></i>
                Formulaire Programmateur
            </h1>
            <div class="header-actions">
                <button type="button" class="tc-btn tc-btn-primary">
                    <i class="bi bi-check-circle"></i>
                    Enregistrer
                </button>
                <button type="button" class="tc-btn tc-btn-secondary">
                    <i class="bi bi-x-circle"></i>
                    Annuler
                </button>
                <button type="button" class="tc-btn tc-btn-danger">
                    <i class="bi bi-trash"></i>
                    Supprimer
                </button>
            </div>
        </div>

        <div class="section-body">
            <!-- Section Contact -->
            <div class="form-section">
                <div class="section-card">
                    <div class="section-header">
                        <i class="bi bi-person-circle section-icon"></i>
                        <h3 class="section-title">Informations de contact</h3>
                    </div>
                    <div class="section-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Prénom <span class="required">*</span>
                                </label>
                                <input type="text" class="form-control" value="Jean" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">
                                    Nom <span class="required">*</span>
                                </label>
                                <input type="text" class="form-control" value="Dupont" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Email <span class="required">*</span>
                                </label>
                                <input type="email" class="form-control" value="jean.dupont@example.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Téléphone</label>
                                <input type="tel" class="form-control" value="06 12 34 56 78">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Adresse</label>
                            <input type="text" class="form-control" value="123 Rue de la Musique">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Code postal</label>
                                <input type="text" class="form-control" value="75001">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ville</label>
                                <input type="text" class="form-control" value="Paris">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section Structure -->
            <div class="form-section">
                <div class="section-card">
                    <div class="section-header">
                        <i class="bi bi-building section-icon"></i>
                        <h3 class="section-title">Structure</h3>
                    </div>
                    <div class="section-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Nom de la structure</label>
                                <input type="text" class="form-control" value="Production Musicale SAS">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Type de structure</label>
                                <select class="form-control">
                                    <option>Association</option>
                                    <option selected>SAS</option>
                                    <option>SARL</option>
                                    <option>Entreprise individuelle</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">SIRET</label>
                                <input type="text" class="form-control" value="12345678901234">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Site web</label>
                                <input type="url" class="form-control" value="https://www.production-musicale.com">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section Recherche de Structure -->
            <div class="form-section">
                <div class="search-section">
                    <div class="search-header">
                        <h4 class="search-title">
                            <i class="bi bi-building me-2"></i>
                            Rechercher une structure
                        </h4>
                    </div>
                    <div class="search-bar">
                        <div class="search-input-group">
                            <input type="text" class="search-input" placeholder="Rechercher par nom de structure ou SIRET...">
                            <button class="search-btn">
                                <i class="bi bi-search me-1"></i>
                                Rechercher
                            </button>
                            <button class="tc-btn tc-btn-outline">
                                <i class="bi bi-plus-circle me-1"></i>
                                Nouvelle structure
                            </button>
                        </div>
                        <div class="search-results" id="structureResults">
                            <div class="search-result-item">
                                <strong>Production Events SARL</strong><br>
                                <small class="text-muted">SIRET: 98765432109876 - Lyon</small>
                            </div>
                            <div class="search-result-item">
                                <strong>Music Corp SAS</strong><br>
                                <small class="text-muted">SIRET: 11223344556677 - Marseille</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section Recherche de Lieu -->
            <div class="form-section">
                <div class="search-section">
                    <div class="search-header">
                        <h4 class="search-title">
                            <i class="bi bi-geo-alt me-2"></i>
                            Ajouter un lieu
                        </h4>
                    </div>
                    <div class="search-bar">
                        <div class="search-input-group">
                            <input type="text" class="search-input" placeholder="Rechercher un lieu par nom ou adresse...">
                            <button class="search-btn">
                                <i class="bi bi-search me-1"></i>
                                Rechercher
                            </button>
                            <button class="tc-btn tc-btn-outline">
                                <i class="bi bi-plus-circle me-1"></i>
                                Nouveau lieu
                            </button>
                        </div>
                        <div class="search-results" id="lieuResults">
                            <div class="search-result-item">
                                <strong>Olympia</strong><br>
                                <small class="text-muted">28 Boulevard des Capucines, 75009 Paris - Capacité: 2000</small>
                            </div>
                            <div class="search-result-item">
                                <strong>Zenith de Paris</strong><br>
                                <small class="text-muted">211 Avenue Jean Jaurès, 75019 Paris - Capacité: 6300</small>
                            </div>
                        </div>
                    </div>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i>
                        Recherchez et sélectionnez un lieu existant ou créez-en un nouveau.
                    </div>
                </div>
            </div>

            <!-- Section Recherche de Concert -->
            <div class="form-section">
                <div class="search-section">
                    <div class="search-header">
                        <h4 class="search-title">
                            <i class="bi bi-music-note me-2"></i>
                            Ajouter un concert
                        </h4>
                    </div>
                    <div class="search-bar">
                        <div class="search-input-group">
                            <input type="text" class="search-input" placeholder="Rechercher un concert par titre ou artiste...">
                            <button class="search-btn">
                                <i class="bi bi-search me-1"></i>
                                Rechercher
                            </button>
                            <button class="tc-btn tc-btn-outline">
                                <i class="bi bi-plus-circle me-1"></i>
                                Nouveau concert
                            </button>
                        </div>
                        <div class="search-results" id="concertResults">
                            <div class="search-result-item">
                                <strong>Concert Jazz Festival</strong><br>
                                <small class="text-muted">Artiste: Miles Davis Tribute - Date: 15/06/2024 - Montant: 5,000€</small>
                            </div>
                            <div class="search-result-item">
                                <strong>Soirée Rock</strong><br>
                                <small class="text-muted">Artiste: Electric Band - Date: 22/06/2024 - Montant: 3,500€</small>
                            </div>
                        </div>
                    </div>
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle"></i>
                        Associez des concerts existants à ce programmateur ou créez de nouveaux concerts.
                    </div>
                </div>
            </div>

            <!-- Section Lieux associés -->
            <div class="form-section">
                <div class="section-card">
                    <div class="section-header">
                        <i class="bi bi-geo-alt section-icon"></i>
                        <h3 class="section-title">Lieux associés</h3>
                    </div>
                    <div class="section-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            Aucun lieu associé pour le moment. Utilisez la recherche ci-dessus pour ajouter des lieux.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section Concerts associés -->
            <div class="form-section">
                <div class="section-card">
                    <div class="section-header">
                        <i class="bi bi-music-note section-icon"></i>
                        <h3 class="section-title">Concerts associés</h3>
                    </div>
                    <div class="section-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th>Date</th>
                                        <th>Lieu</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Concert Jazz Festival</td>
                                        <td>15/06/2024</td>
                                        <td>Olympia</td>
                                        <td>5,000€</td>
                                        <td><span class="badge bg-success">Confirmé</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Soirée Rock</td>
                                        <td>22/06/2024</td>
                                        <td>Zenith de Paris</td>
                                        <td>3,500€</td>
                                        <td><span class="badge bg-warning">En attente</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Simulation des fonctionnalités de recherche
        document.addEventListener('DOMContentLoaded', function() {
            // Gestion des barres de recherche
            const searchInputs = document.querySelectorAll('.search-input');
            const searchBtns = document.querySelectorAll('.search-btn');
            
            searchInputs.forEach((input, index) => {
                input.addEventListener('input', function() {
                    if (this.value.length >= 2) {
                        showSearchResults(index);
                    } else {
                        hideSearchResults(index);
                    }
                });
                
                input.addEventListener('focus', function() {
                    if (this.value.length >= 2) {
                        showSearchResults(index);
                    }
                });
            });
            
            // Cliquer en dehors pour fermer les résultats
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.search-bar')) {
                    hideAllSearchResults();
                }
            });
            
            // Gestion des clics sur les résultats de recherche
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', function() {
                    const text = this.querySelector('strong').textContent;
                    const searchInput = this.closest('.search-section').querySelector('.search-input');
                    searchInput.value = text;
                    hideAllSearchResults();
                    
                    // Simulation d'ajout
                    showSuccessMessage('Élément ajouté avec succès!');
                });
            });
            
            // Gestion des boutons de recherche
            searchBtns.forEach((btn, index) => {
                btn.addEventListener('click', function() {
                    const input = this.closest('.search-input-group').querySelector('.search-input');
                    if (input.value.trim()) {
                        showSearchResults(index);
                        showLoadingState(btn);
                    }
                });
            });
            
            // Gestion des boutons "Nouveau"
            document.querySelectorAll('.tc-btn-outline').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.textContent.trim().split(' ')[1]; // Récupère "structure", "lieu", etc.
                    showSuccessMessage(`Formulaire de création de ${type} ouvert!`);
                });
            });
            
            // Gestion des boutons principaux
            document.querySelector('.tc-btn-primary').addEventListener('click', function() {
                showLoadingState(this);
                setTimeout(() => {
                    showSuccessMessage('Programmateur enregistré avec succès!');
                    resetButtonState(this, 'Enregistrer');
                }, 2000);
            });
            
            document.querySelector('.tc-btn-secondary').addEventListener('click', function() {
                showSuccessMessage('Modifications annulées');
            });
            
            document.querySelector('.tc-btn-danger').addEventListener('click', function() {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce programmateur?')) {
                    showSuccessMessage('Programmateur supprimé');
                }
            });
        });
        
        function showSearchResults(index) {
            const results = document.querySelectorAll('.search-results')[index];
            if (results) {
                results.style.display = 'block';
            }
        }
        
        function hideSearchResults(index) {
            const results = document.querySelectorAll('.search-results')[index];
            if (results) {
                results.style.display = 'none';
            }
        }
        
        function hideAllSearchResults() {
            document.querySelectorAll('.search-results').forEach(results => {
                results.style.display = 'none';
            });
        }
        
        function showLoadingState(button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="loading-spinner me-2"></span>Chargement...';
            button.disabled = true;
            
            setTimeout(() => {
                resetButtonState(button, originalText);
            }, 2000);
        }
        
        function resetButtonState(button, originalText) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
        
        function showSuccessMessage(message) {
            // Créer et afficher un message de succès temporaire
            const alert = document.createElement('div');
            alert.className = 'alert alert-success position-fixed';
            alert.style.cssText = 'top: 20px; right: 20px; z-index: 1000; min-width: 300px;';
            alert.innerHTML = `<i class="bi bi-check-circle me-2"></i>${message}`;
            
            document.body.appendChild(alert);
            
            setTimeout(() => {
                alert.remove();
            }, 3000);
        }
    </script>
</body>
</html>
