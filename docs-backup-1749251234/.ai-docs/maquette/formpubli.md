<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Formulaire Programmateur</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* TourCraft Design System Variables */
        :root {
            /* Couleurs principales TourCraft */
            --tc-color-primary: #213547;
            --tc-color-primary-light: #2d4a63;
            --tc-color-primary-dark: #1a2b3a;
            --tc-color-primary-hover: #1a2b3a;
            --tc-color-secondary: #1e88e5;
            --tc-color-secondary-light: #64b5f6;
            --tc-color-secondary-dark: #1565c0;
            --tc-color-accent: #4db6ac;

            /* Couleurs de statut */
            --tc-color-success: #4caf50;
            --tc-color-success-light: #81c784;
            --tc-color-success-dark: #388e3c;
            --tc-color-warning: #ffc107;
            --tc-color-warning-light: #ffecb3;
            --tc-color-warning-dark: #f57c00;
            --tc-color-error: #f44336;
            --tc-color-error-light: #ef5350;
            --tc-color-error-dark: #d32f2f;
            --tc-color-info: #2196f3;
            --tc-color-info-light: #64b5f6;
            --tc-color-info-dark: #1976d2;

            /* Couleurs neutres */
            --tc-color-white: #ffffff;
            --tc-color-black: #000000;
            --tc-color-gray-50: #f9fafb;
            --tc-color-gray-100: #f3f4f6;
            --tc-color-gray-200: #e5e7eb;
            --tc-color-gray-300: #d1d5db;
            --tc-color-gray-400: #9ca3af;
            --tc-color-gray-500: #6b7280;
            --tc-color-gray-600: #4b5563;
            --tc-color-gray-700: #374151;
            --tc-color-gray-800: #1f2937;
            --tc-color-gray-900: #111827;

            /* Couleurs de fond */
            --tc-bg-default: #ffffff;
            --tc-bg-light: #f5f7f9;
            --tc-bg-body: #f9fafb;
            --tc-bg-sidebar: var(--tc-color-primary);
            --tc-bg-hover: #f8f9fa;
            --tc-bg-overlay: rgba(0, 0, 0, 0.5);
            --tc-bg-card: #ffffff;
            --tc-bg-surface: #ffffff;
            --tc-bg-subtle: #f8f9fa;
            --tc-bg-input: #ffffff;

            /* Couleurs de fond par statut */
            --tc-bg-success: #e8f5e8;
            --tc-bg-warning: #fff3cd;
            --tc-bg-error: #fdeaea;
            --tc-bg-info: #e3f2fd;

            /* Couleurs de texte */
            --tc-text-default: #333333;
            --tc-text-secondary: #555555;
            --tc-text-muted: #888888;
            --tc-text-light: #ffffff;
            --tc-text-primary: var(--tc-color-primary);
            --tc-text-link: var(--tc-color-primary);
            --tc-text-tertiary: #999999;
            --tc-text-placeholder: #aaaaaa;
            --tc-text-dark: #222222;

            /* Couleurs de bordures */
            --tc-border-default: #e0e0e0;
            --tc-border-light: #dee2e6;
            --tc-border-primary: var(--tc-color-primary);
            --tc-border-ultralight: #f0f0f0;
            --tc-border-input: #d1d5db;

            /* Typographie */
            --tc-font-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            --tc-font-size-xs: 0.75rem;
            --tc-font-size-sm: 0.875rem;
            --tc-font-size-base: 1rem;
            --tc-font-size-md: 1rem;
            --tc-font-size-lg: 1.125rem;
            --tc-font-size-xl: 1.5rem;
            --tc-font-size-2xl: 2rem;
            --tc-font-weight-normal: 400;
            --tc-font-weight-medium: 500;
            --tc-font-weight-semibold: 600;
            --tc-font-weight-bold: 700;
            --tc-line-height-normal: 1.5;

            /* Espacements */
            --tc-space-1: 0.25rem;
            --tc-space-2: 0.5rem;
            --tc-space-3: 0.75rem;
            --tc-space-4: 1rem;
            --tc-space-5: 1.25rem;
            --tc-space-6: 1.5rem;
            --tc-space-8: 2rem;
            --tc-space-10: 2.5rem;

            /* Effets */
            --tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
            --tc-shadow-md: 0 4px 8px rgba(0,0,0,0.1);
            --tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
            --tc-shadow-focus: 0 0 0 3px rgba(33, 53, 71, 0.1);

            /* Border-radius */
            --tc-radius-sm: 0.25rem;
            --tc-radius-base: 0.375rem;
            --tc-radius-md: 0.5rem;
            --tc-radius-lg: 0.75rem;

            /* Transitions */
            --tc-transition-fast: 150ms ease;
            --tc-transition-base: 300ms ease;
        }

        /* Reset et base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--tc-font-sans);
            font-size: var(--tc-font-size-base);
            line-height: var(--tc-line-height-normal);
            color: var(--tc-text-default);
            background-color: var(--tc-bg-body);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Layout principal */
        .form-isolated-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: var(--tc-bg-default);
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: var(--tc-shadow-lg);
        }

        /* Header */
        .form-header {
            background-color: var(--tc-color-primary);
            padding: var(--tc-space-4) var(--tc-space-8);
            border-bottom: 1px solid var(--tc-border-default);
            box-shadow: var(--tc-shadow-sm);
        }

        .form-logo {
            text-align: center;
        }

        .form-logo h2 {
            margin: 0;
            color: var(--tc-text-light);
            font-size: var(--tc-font-size-xl);
            font-weight: var(--tc-font-weight-bold);
        }

        /* Contenu principal */
        .form-content {
            flex-grow: 1;
            padding: var(--tc-space-8);
            background-color: var(--tc-bg-light);
        }

        .form-container {
            max-width: 800px;
            margin: 0 auto;
        }

        /* États de chargement */
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--tc-space-10);
            text-align: center;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--tc-color-gray-200);
            border-left: 4px solid var(--tc-color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: var(--tc-space-4);
        }

        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid var(--tc-color-gray-300);
            border-left: 2px solid var(--tc-color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: var(--tc-space-2);
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Alertes */
        .alert {
            padding: var(--tc-space-4);
            margin-bottom: var(--tc-space-6);
            border-radius: var(--tc-radius-base);
            border: 1px solid transparent;
            display: flex;
            align-items: flex-start;
            gap: var(--tc-space-2);
        }

        .alert-success {
            background-color: var(--tc-bg-success);
            border-color: var(--tc-color-success-light);
            color: var(--tc-color-success-dark);
        }

        .alert-warning {
            background-color: var(--tc-bg-warning);
            border-color: var(--tc-color-warning-light);
            color: var(--tc-color-warning-dark);
        }

        .alert-error {
            background-color: var(--tc-bg-error);
            border-color: var(--tc-color-error-light);
            color: var(--tc-color-error-dark);
        }

        .alert-info {
            background-color: var(--tc-bg-info);
            border-color: var(--tc-color-info-light);
            color: var(--tc-color-info-dark);
        }

        .alert-icon {
            font-size: var(--tc-font-size-lg);
            margin-top: 2px;
        }

        .alert-content h3 {
            margin-bottom: var(--tc-space-2);
            font-weight: var(--tc-font-weight-semibold);
        }

        /* Cartes */
        .card {
            background-color: var(--tc-bg-card);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-base);
            margin-bottom: var(--tc-space-6);
            overflow: hidden;
            border: 1px solid var(--tc-border-light);
        }

        .card-header {
            background-color: var(--tc-bg-subtle);
            padding: var(--tc-space-4);
            border-bottom: 1px solid var(--tc-border-light);
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .card-header i {
            font-size: var(--tc-font-size-lg);
            color: var(--tc-color-primary);
        }

        .card-header h3 {
            margin: 0;
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
        }

        .card-body {
            padding: var(--tc-space-6);
        }

        /* Sections */
        .section-header {
            margin-bottom: var(--tc-space-4);
        }

        .section-header h3 {
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-color-primary);
            margin-bottom: var(--tc-space-2);
        }

        .section-header h3 i {
            font-size: var(--tc-font-size-lg);
        }

        .form-subtitle {
            color: var(--tc-text-secondary);
            font-size: var(--tc-font-size-sm);
            margin: 0;
        }

        .form-section {
            background-color: var(--tc-bg-card);
            border-radius: var(--tc-radius-lg);
            padding: var(--tc-space-6);
            margin-bottom: var(--tc-space-6);
            border: 1px solid var(--tc-border-light);
            box-shadow: var(--tc-shadow-sm);
        }

        /* Informations du concert */
        .concert-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--tc-space-4);
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: var(--tc-space-1);
        }

        .info-label {
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-secondary);
            font-size: var(--tc-font-size-sm);
        }

        .info-value {
            color: var(--tc-text-default);
            font-size: var(--tc-font-size-base);
        }

        /* Formulaire */
        .form-group {
            margin-bottom: var(--tc-space-4);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--tc-space-4);
        }

        .form-label {
            display: block;
            margin-bottom: var(--tc-space-1);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-secondary);
            font-size: var(--tc-font-size-sm);
        }

        .form-control {
            width: 100%;
            padding: var(--tc-space-2) var(--tc-space-3);
            border: 1px solid var(--tc-border-input);
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-base);
            background-color: var(--tc-bg-input);
            transition: all var(--tc-transition-fast);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--tc-color-primary);
            box-shadow: var(--tc-shadow-focus);
        }

        .form-control::placeholder {
            color: var(--tc-text-placeholder);
        }

        .form-help {
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-xs);
            margin-top: var(--tc-space-1);
        }

        /* SIRET Search Results */
        .siret-results {
            position: relative;
            background: var(--tc-bg-card);
            border: 1px solid var(--tc-border-input);
            border-radius: var(--tc-radius-base);
            box-shadow: var(--tc-shadow-md);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
        }

        .siret-result-item {
            padding: var(--tc-space-3);
            border-bottom: 1px solid var(--tc-border-light);
            cursor: pointer;
            transition: background-color var(--tc-transition-fast);
        }

        .siret-result-item:last-child {
            border-bottom: none;
        }

        .siret-result-item:hover {
            background-color: var(--tc-bg-hover);
        }

        .siret-result-name {
            font-weight: var(--tc-font-weight-semibold);
            margin-bottom: var(--tc-space-1);
        }

        .siret-result-details {
            font-size: var(--tc-font-size-sm);
            color: var(--tc-text-muted);
        }

        /* Address suggestions */
        .address-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--tc-bg-card);
            border: 1px solid var(--tc-border-input);
            border-top: none;
            border-radius: 0 0 var(--tc-radius-base) var(--tc-radius-base);
            box-shadow: var(--tc-shadow-md);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
        }

        .address-suggestion {
            padding: var(--tc-space-2) var(--tc-space-3);
            cursor: pointer;
            border-bottom: 1px solid var(--tc-border-ultralight);
            transition: background-color var(--tc-transition-fast);
        }

        .address-suggestion:last-child {
            border-bottom: none;
        }

        .address-suggestion:hover {
            background-color: var(--tc-bg-hover);
        }

        /* Boutons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-2);
            padding: var(--tc-space-3) var(--tc-space-6);
            border: none;
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-base);
            font-weight: var(--tc-font-weight-medium);
            text-decoration: none;
            cursor: pointer;
            transition: all var(--tc-transition-fast);
            justify-content: center;
        }

        .btn-primary {
            background-color: var(--tc-color-primary);
            color: var(--tc-text-light);
        }

        .btn-primary:hover:not(:disabled) {
            background-color: var(--tc-color-primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--tc-shadow-md);
        }

        .btn:disabled {
            background-color: var(--tc-color-gray-300);
            color: var(--tc-color-gray-500);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .btn-large {
            padding: var(--tc-space-4) var(--tc-space-8);
            font-size: var(--tc-font-size-lg);
        }

        /* Actions de formulaire */
        .form-actions {
            margin-top: var(--tc-space-8);
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: var(--tc-space-4);
            align-items: center;
        }

        /* Messages d'erreur */
        .error-message {
            background-color: var(--tc-bg-error);
            color: var(--tc-color-error-dark);
            padding: var(--tc-space-3);
            border-radius: var(--tc-radius-base);
            border: 1px solid var(--tc-color-error-light);
            margin-bottom: var(--tc-space-4);
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        /* Footer */
        .form-footer {
            padding: var(--tc-space-6) var(--tc-space-8);
            background-color: var(--tc-bg-subtle);
            border-top: 1px solid var(--tc-border-light);
            text-align: center;
        }

        .form-footer p {
            margin: 0;
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-sm);
            line-height: 1.6;
        }

        /* États interactifs */
        .form-state-hidden {
            display: none;
        }

        .form-state-visible {
            display: block;
            animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Position relative pour les dropdowns */
        .position-relative {
            position: relative;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .form-header,
            .form-content,
            .form-footer {
                padding-left: var(--tc-space-4);
                padding-right: var(--tc-space-4);
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .concert-info-grid {
                grid-template-columns: 1fr;
            }

            .form-actions {
                margin-top: var(--tc-space-6);
            }

            .form-section {
                padding: var(--tc-space-4);
            }
        }

        /* Utilities */
        .text-center {
            text-align: center;
        }

        .mb-4 {
            margin-bottom: var(--tc-space-4);
        }

        .mt-3 {
            margin-top: var(--tc-space-3);
        }

        .fw-bold {
            font-weight: var(--tc-font-weight-bold);
        }

        .text-muted {
            color: var(--tc-text-muted);
        }
    </style>
</head>
<body>
    <div class="form-isolated-container">
        <!-- Header -->
        <header class="form-header">
            <div class="form-logo">
                <h2>Label Musical</h2>
            </div>
        </header>
        
        <!-- Contenu principal -->
        <main class="form-content">
            <div class="form-container">
                <!-- États du formulaire -->
                <div id="loading-state" class="loading-container form-state-hidden">
                    <div class="spinner"></div>
                    <p>Chargement du formulaire...</p>
                </div>

                <div id="error-state" class="form-state-hidden">
                    <div class="alert alert-error">
                        <i class="bi bi-exclamation-triangle alert-icon"></i>
                        <div class="alert-content">
                            <h3>Erreur</h3>
                            <p>Une erreur est survenue lors du chargement du formulaire. Veuillez vérifier le lien ou contacter l'organisateur.</p>
                        </div>
                    </div>
                </div>

                <div id="expired-state" class="form-state-hidden">
                    <div class="alert alert-warning">
                        <i class="bi bi-clock alert-icon"></i>
                        <div class="alert-content">
                            <h3>Lien expiré</h3>
                            <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
                        </div>
                    </div>
                </div>

                <div id="completed-state" class="form-state-hidden">
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle alert-icon"></i>
                        <div class="alert-content">
                            <h3>Formulaire déjà complété</h3>
                            <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
                            <button class="btn btn-primary mt-3" onclick="showForm()">
                                <i class="bi bi-pencil-square"></i>
                                Modifier vos informations
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Formulaire principal -->
                <div id="form-state" class="form-state-visible">
                    <!-- En-tête du formulaire -->
                    <div class="section-header">
                        <h3>
                            <i class="bi bi-file-earmark-text"></i>
                            Formulaire programmateur
                        </h3>
                    </div>

                    <!-- Informations du concert -->
                    <div class="card">
                        <div class="card-header">
                            <i class="bi bi-calendar-event"></i>
                            <h3>Informations sur le concert</h3>
                        </div>
                        <div class="card-body">
                            <div class="concert-info-grid">
                                <div class="info-item">
                                    <div class="info-label">Date</div>
                                    <div class="info-value">15 juin 2024</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Lieu</div>
                                    <div class="info-value">Salle de concerts Le Zenith</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Montant</div>
                                    <div class="info-value">2 500,00 €</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Artiste</div>
                                    <div class="info-value">Les Harmoniques</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Formulaire -->
                    <form id="programmateur-form">
                        <!-- Section 1: Adresse du lieu -->
                        <div class="section-header">
                            <h3>
                                <i class="bi bi-geo-alt"></i>
                                Adresse du lieu de l'événement
                            </h3>
                            <p class="form-subtitle">
                                Veuillez indiquer l'adresse exacte où se déroulera l'événement.
                            </p>
                        </div>
                        
                        <div class="form-section">
                            <div class="form-group position-relative">
                                <label for="lieuAdresse" class="form-label">Adresse du lieu *</label>
                                <input
                                    type="text"
                                    id="lieuAdresse"
                                    name="lieuAdresse"
                                    class="form-control"
                                    placeholder="Commencez à taper pour rechercher une adresse..."
                                    required
                                    autocomplete="off"
                                >
                                <div id="address-suggestions" class="address-suggestions" style="display: none;"></div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="lieuCodePostal" class="form-label">Code postal *</label>
                                    <input
                                        type="text"
                                        id="lieuCodePostal"
                                        name="lieuCodePostal"
                                        class="form-control"
                                        placeholder="75000"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="lieuVille" class="form-label">Ville *</label>
                                    <input
                                        type="text"
                                        id="lieuVille"
                                        name="lieuVille"
                                        class="form-control"
                                        placeholder="Paris"
                                        required
                                    >
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="lieuPays" class="form-label">Pays *</label>
                                <input
                                    type="text"
                                    id="lieuPays"
                                    name="lieuPays"
                                    class="form-control"
                                    value="France"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Section 2: Recherche Structure -->
                        <div class="section-header">
                            <h3>
                                <i class="bi bi-building"></i>
                                Informations de votre structure
                            </h3>
                            <p class="form-subtitle">
                                Recherchez votre entreprise/association par SIRET ou nom pour pré-remplir automatiquement, ou remplissez manuellement.
                            </p>
                        </div>
                        
                        <div class="form-section">
                            <div class="form-group position-relative">
                                <label for="siretSearch" class="form-label">Recherche par SIRET ou nom</label>
                                <input
                                    type="text"
                                    id="siretSearch"
                                    class="form-control"
                                    placeholder="Numéro SIRET, nom ou raison sociale"
                                    autocomplete="off"
                                >
                                <div id="siret-loading" class="form-help" style="display: none;">
                                    <span class="loading-spinner"></span>
                                    Recherche en cours...
                                </div>
                                <div id="siret-error" class="form-help" style="color: var(--tc-color-error); display: none;"></div>
                                <div id="siret-results" class="siret-results" style="display: none;"></div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="structureNom" class="form-label">Nom / Raison sociale *</label>
                                    <input
                                        type="text"
                                        id="structureNom"
                                        name="structureNom"
                                        class="form-control"
                                        placeholder="Nom de votre structure"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="structureSiret" class="form-label">SIRET</label>
                                    <input
                                        type="text"
                                        id="structureSiret"
                                        name="structureSiret"
                                        class="form-control"
                                        placeholder="14 chiffres"
                                    >
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="structureAdresse" class="form-label">Adresse de la structure *</label>
                                <input
                                    type="text"
                                    id="structureAdresse"
                                    name="structureAdresse"
                                    class="form-control"
                                    placeholder="Adresse de votre structure"
                                    required
                                >
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="structureCodePostal" class="form-label">Code postal *</label>
                                    <input
                                        type="text"
                                        id="structureCodePostal"
                                        name="structureCodePostal"
                                        class="form-control"
                                        placeholder="75000"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="structureVille" class="form-label">Ville *</label>
                                    <input
                                        type="text"
                                        id="structureVille"
                                        name="structureVille"
                                        class="form-control"
                                        placeholder="Ville"
                                        required
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: Informations du signataire du contrat -->
                        <div class="section-header">
                            <h3>
                                <i class="bi bi-person-check"></i>
                                Informations du signataire du contrat
                            </h3>
                            <p class="form-subtitle">
                                Personne habilitée à signer le contrat pour votre structure.
                            </p>
                        </div>
                        
                        <div class="form-section">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="signatairePrenom" class="form-label">Prénom *</label>
                                    <input
                                        type="text"
                                        id="signatairePrenom"
                                        name="signatairePrenom"
                                        class="form-control"
                                        placeholder="Prénom du signataire"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="signataireNom" class="form-label">Nom *</label>
                                    <input
                                        type="text"
                                        id="signataireNom"
                                        name="signataireNom"
                                        class="form-control"
                                        placeholder="Nom du signataire"
                                        required
                                    >
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="signataireFonction" class="form-label">Fonction / Qualité *</label>
                                <input
                                    type="text"
                                    id="signataireFonction"
                                    name="signataireFonction"
                                    class="form-control"
                                    placeholder="Ex: Directeur, Président, Responsable programmation..."
                                    required
                                >
                                <small class="form-help">
                                    Indiquez votre fonction au sein de la structure
                                </small>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="signataireEmail" class="form-label">Email</label>
                                    <input
                                        type="email"
                                        id="signataireEmail"
                                        name="signataireEmail"
                                        class="form-control"
                                        placeholder="email@exemple.com"
                                    >
                                    <small class="form-help">
                                        Facultatif - Nous utiliserons cet email pour les communications futures si renseigné
                                    </small>
                                </div>
                                <div class="form-group">
                                    <label for="signataireTelephone" class="form-label">Téléphone</label>
                                    <input
                                        type="tel"
                                        id="signataireTelephone"
                                        name="signataireTelephone"
                                        class="form-control"
                                        placeholder="06 12 34 56 78"
                                    >
                                    <small class="form-help">
                                        Facultatif
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Messages d'erreur -->
                        <div id="submit-error" class="error-message" style="display: none;">
                            <i class="bi bi-exclamation-circle"></i>
                            <span id="error-text"></span>
                        </div>

                        <!-- Actions du formulaire -->
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-large" id="submit-btn">
                                <i class="bi bi-send"></i>
                                Envoyer les informations
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="form-footer">
            <p>
                © 2024 Label Musical - Formulaire sécurisé<br>
                Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé 
                à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », 
                vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier.
            </p>
        </footer>
    </div>

    <script>
        // Variables globales
        let addressTimeout = null;
        let siretTimeout = null;
        let addressAbortController = null;
        let siretAbortController = null;

        // Simulation des états du formulaire
        function showLoading() {
            hideAllStates();
            document.getElementById('loading-state').classList.remove('form-state-hidden');
            document.getElementById('loading-state').classList.add('form-state-visible');
        }

        function showError() {
            hideAllStates();
            document.getElementById('error-state').classList.remove('form-state-hidden');
            document.getElementById('error-state').classList.add('form-state-visible');
        }

        function showExpired() {
            hideAllStates();
            document.getElementById('expired-state').classList.remove('form-state-hidden');
            document.getElementById('expired-state').classList.add('form-state-visible');
        }

        function showCompleted() {
            hideAllStates();
            document.getElementById('completed-state').classList.remove('form-state-hidden');
            document.getElementById('completed-state').classList.add('form-state-visible');
        }

        function showForm() {
            hideAllStates();
            document.getElementById('form-state').classList.remove('form-state-hidden');
            document.getElementById('form-state').classList.add('form-state-visible');
        }

        function hideAllStates() {
            const states = ['loading-state', 'error-state', 'expired-state', 'completed-state', 'form-state'];
            states.forEach(stateId => {
                const element = document.getElementById(stateId);
                element.classList.add('form-state-hidden');
                element.classList.remove('form-state-visible');
            });
        }

        // Autocomplétion d'adresse
        function setupAddressAutocomplete() {
            const addressInput = document.getElementById('lieuAdresse');
            const suggestionsContainer = document.getElementById('address-suggestions');

            addressInput.addEventListener('input', function(e) {
                const query = e.target.value.trim();
                
                // Clear previous timeout and abort request
                if (addressTimeout) {
                    clearTimeout(addressTimeout);
                }
                if (addressAbortController) {
                    addressAbortController.abort();
                }

                if (query.length < 3) {
                    hideSuggestions();
                    return;
                }

                // Debounce
                addressTimeout = setTimeout(() => {
                    searchAddresses(query);
                }, 300);
            });

            addressInput.addEventListener('blur', function() {
                // Delay to allow click on suggestion
                setTimeout(() => {
                    hideSuggestions();
                }, 200);
            });
        }

        async function searchAddresses(query) {
            try {
                addressAbortController = new AbortController();
                
                const response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
                    { signal: addressAbortController.signal }
                );

                if (!response.ok) {
                    throw new Error('Erreur de recherche d\'adresse');
                }

                const data = await response.json();
                displayAddressSuggestions(data.features || []);

            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erreur recherche adresse:', error);
                    hideSuggestions();
                }
            }
        }

        function displayAddressSuggestions(features) {
            const container = document.getElementById('address-suggestions');
            
            if (features.length === 0) {
                hideSuggestions();
                return;
            }

            container.innerHTML = features.map(feature => {
                const props = feature.properties;
                return `
                    <div class="address-suggestion" onclick="selectAddress('${props.label}', '${props.postcode || ''}', '${props.city || ''}')">
                        ${props.label}
                    </div>
                `;
            }).join('');

            container.style.display = 'block';
        }

        function selectAddress(label, postcode, city) {
            document.getElementById('lieuAdresse').value = label;
            if (postcode) document.getElementById('lieuCodePostal').value = postcode;
            if (city) document.getElementById('lieuVille').value = city;
            hideSuggestions();
        }

        function hideSuggestions() {
            document.getElementById('address-suggestions').style.display = 'none';
        }

        // Recherche SIRET
        function setupSiretSearch() {
            const siretInput = document.getElementById('siretSearch');
            
            siretInput.addEventListener('input', function(e) {
                const query = e.target.value.trim();
                
                // Clear previous timeout and abort request
                if (siretTimeout) {
                    clearTimeout(siretTimeout);
                }
                if (siretAbortController) {
                    siretAbortController.abort();
                }

                if (query.length < 3) {
                    hideSiretResults();
                    hideSiretError();
                    return;
                }

                // Debounce
                siretTimeout = setTimeout(() => {
                    searchSiret(query);
                }, 300);
            });

            siretInput.addEventListener('blur', function() {
                // Delay to allow click on result
                setTimeout(() => {
                    hideSiretResults();
                }, 200);
            });
        }

        async function searchSiret(query) {
            showSiretLoading(true);
            hideSiretError();
            hideSiretResults();

            try {
                siretAbortController = new AbortController();
                
                const response = await fetch(
                    `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=5`,
                    { signal: siretAbortController.signal }
                );

                if (!response.ok) {
                    throw new Error('Erreur de recherche');
                }

                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    displaySiretResults(data.results);
                } else {
                    showSiretError('Aucune entreprise trouvée');
                }

            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erreur recherche SIRET:', error);
                    showSiretError('Erreur lors de la recherche');
                }
            } finally {
                showSiretLoading(false);
            }
        }

        function displaySiretResults(results) {
            const container = document.getElementById('siret-results');
            
            container.innerHTML = results.map(entreprise => {
                const nom = entreprise.nom_complet || 
                           entreprise.nom_raison_sociale ||
                           entreprise.denomination ||
                           `${entreprise.prenom || ''} ${entreprise.nom || ''}`.trim();

                const siege = entreprise.siege || {};
                const siret = siege.siret || entreprise.siren;
                const ville = siege.libelle_commune || '';

                return `
                    <div class="siret-result-item" onclick="selectEntreprise(${JSON.stringify(entreprise).replace(/"/g, '&quot;')})">
                        <div class="siret-result-name">${nom}</div>
                        <div class="siret-result-details">
                            SIRET: ${siret} | ${ville}
                        </div>
                    </div>
                `;
            }).join('');

            container.style.display = 'block';
        }

        function selectEntreprise(entreprise) {
            const nom = entreprise.nom_complet || 
                       entreprise.nom_raison_sociale ||
                       entreprise.denomination ||
                       `${entreprise.prenom || ''} ${entreprise.nom || ''}`.trim();

            const siege = entreprise.siege || {};
            const numeroVoie = siege.numero_voie || '';
            const typeVoie = siege.type_voie || '';
            const libelleVoie = siege.libelle_voie || '';
            const adresse = `${numeroVoie} ${typeVoie} ${libelleVoie}`.trim();

            // Remplir les champs
            document.getElementById('structureNom').value = nom;
            document.getElementById('structureSiret').value = siege.siret || entreprise.siren || '';
            document.getElementById('structureAdresse').value = adresse || siege.adresse || '';
            document.getElementById('structureCodePostal').value = siege.code_postal || '';
            document.getElementById('structureVille').value = siege.libelle_commune || '';

            // Mettre à jour le champ de recherche
            document.getElementById('siretSearch').value = nom;
            
            hideSiretResults();
            hideSiretError();
        }

        function showSiretLoading(show) {
            document.getElementById('siret-loading').style.display = show ? 'block' : 'none';
        }

        function showSiretError(message) {
            const errorElement = document.getElementById('siret-error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function hideSiretError() {
            document.getElementById('siret-error').style.display = 'none';
        }

        function hideSiretResults() {
            document.getElementById('siret-results').style.display = 'none';
        }

        // Validation du formulaire
        function validateForm() {
            const errors = [];
            
            // Validation adresse du lieu
            if (!document.getElementById('lieuAdresse').value.trim()) errors.push('L\'adresse du lieu est obligatoire');
            if (!document.getElementById('lieuCodePostal').value.trim()) errors.push('Le code postal du lieu est obligatoire');
            if (!document.getElementById('lieuVille').value.trim()) errors.push('La ville du lieu est obligatoire');
            
            // Validation structure
            if (!document.getElementById('structureNom').value.trim()) errors.push('Le nom de la structure est obligatoire');
            if (!document.getElementById('structureAdresse').value.trim()) errors.push('L\'adresse de la structure est obligatoire');
            if (!document.getElementById('structureCodePostal').value.trim()) errors.push('Le code postal de la structure est obligatoire');
            if (!document.getElementById('structureVille').value.trim()) errors.push('La ville de la structure est obligatoire');
            
            // Validation signataire
            if (!document.getElementById('signataireNom').value.trim()) errors.push('Le nom du signataire est obligatoire');
            if (!document.getElementById('signatairePrenom').value.trim()) errors.push('Le prénom du signataire est obligatoire');
            if (!document.getElementById('signataireFonction').value.trim()) errors.push('La fonction du signataire est obligatoire');
            
            // Validation email si renseigné
            const email = document.getElementById('signataireEmail').value.trim();
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    errors.push('Format d\'email invalide');
                }
            }

            return errors;
        }

        function showSubmitError(message) {
            const errorElement = document.getElementById('submit-error');
            const errorText = document.getElementById('error-text');
            errorText.textContent = message;
            errorElement.style.display = 'flex';
        }

        function hideSubmitError() {
            document.getElementById('submit-error').style.display = 'none';
        }

        // Soumission du formulaire
        document.getElementById('programmateur-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation
            const errors = validateForm();
            if (errors.length > 0) {
                showSubmitError(errors.join(', '));
                return;
            }

            hideSubmitError();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Simulation d'envoi
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Envoi en cours...';
            
            setTimeout(() => {
                // Simulation réussie
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success';
                successAlert.innerHTML = `
                    <i class="bi bi-check-circle alert-icon"></i>
                    <div class="alert-content">
                        <h3>Formulaire envoyé avec succès !</h3>
                        <p>Vos informations ont été transmises. Vous recevrez une confirmation par email sous peu.</p>
                    </div>
                `;
                
                const formContainer = document.querySelector('.form-container');
                formContainer.insertBefore(successAlert, formContainer.firstChild);
                
                // Scroll vers le haut
                successAlert.scrollIntoView({ behavior: 'smooth' });
                
                // Réinitialiser le bouton
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Masquer l'alerte après 5 secondes
                setTimeout(() => {
                    successAlert.remove();
                }, 5000);
                
            }, 2000);
        });

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            // Démarrer avec le formulaire visible
            showForm();
            
            // Initialiser les fonctionnalités
            setupAddressAutocomplete();
            setupSiretSearch();
        });
    </script>
</body>
</html>
