<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Détails du Contrat</title>
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

        /* Container principal */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: var(--tc-space-6);
        }

        /* Header du contrat */
        .contrat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--tc-space-6);
            gap: var(--tc-space-4);
        }

        .contrat-title-section {
            flex: 1;
        }

        .contrat-title {
            font-size: var(--tc-font-size-2xl);
            font-weight: var(--tc-font-weight-bold);
            color: var(--tc-color-primary);
            margin-bottom: var(--tc-space-2);
        }

        .contrat-meta {
            display: flex;
            align-items: center;
            gap: var(--tc-space-4);
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-sm);
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-1);
            padding: var(--tc-space-1) var(--tc-space-3);
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-xs);
            font-weight: var(--tc-font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge.draft {
            background-color: var(--tc-bg-warning);
            color: var(--tc-color-warning-dark);
        }

        .status-badge.sent {
            background-color: var(--tc-bg-info);
            color: var(--tc-color-info-dark);
        }

        .status-badge.signed {
            background-color: var(--tc-bg-success);
            color: var(--tc-color-success-dark);
        }

        /* Actions du contrat */
        .contrat-actions {
            background-color: var(--tc-bg-card);
            border: 1px solid var(--tc-border-light);
            border-radius: var(--tc-radius-lg);
            padding: var(--tc-space-4);
            margin-bottom: var(--tc-space-6);
            box-shadow: var(--tc-shadow-base);
        }

        .actions-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tc-space-3);
            align-items: center;
        }

        /* Boutons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-2);
            padding: var(--tc-space-2) var(--tc-space-4);
            border: none;
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-sm);
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

        .btn-primary:hover {
            background-color: var(--tc-color-primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--tc-shadow-md);
        }

        .btn-secondary {
            background-color: var(--tc-color-gray-500);
            color: var(--tc-text-light);
        }

        .btn-secondary:hover {
            background-color: var(--tc-color-gray-600);
        }

        .btn-success {
            background-color: var(--tc-color-success);
            color: var(--tc-text-light);
        }

        .btn-success:hover {
            background-color: var(--tc-color-success-dark);
        }

        .btn-warning {
            background-color: var(--tc-color-warning);
            color: var(--tc-color-warning-dark);
        }

        .btn-warning:hover {
            background-color: var(--tc-color-warning-dark);
            color: var(--tc-text-light);
        }

        .btn-outline {
            background-color: transparent;
            border: 1px solid var(--tc-border-default);
            color: var(--tc-text-default);
        }

        .btn-outline:hover {
            background-color: var(--tc-bg-hover);
        }

        .btn:disabled {
            background-color: var(--tc-color-gray-300);
            color: var(--tc-color-gray-500);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Cartes */
        .card {
            background-color: var(--tc-bg-card);
            border: 1px solid var(--tc-border-light);
            border-radius: var(--tc-radius-lg);
            margin-bottom: var(--tc-space-6);
            box-shadow: var(--tc-shadow-base);
            overflow: hidden;
        }

        .card-header {
            background-color: var(--tc-bg-subtle);
            padding: var(--tc-space-4);
            border-bottom: 1px solid var(--tc-border-light);
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .card-header h3 {
            margin: 0;
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
            flex: 1;
        }

        .card-header i {
            font-size: var(--tc-font-size-lg);
            color: var(--tc-color-primary);
        }

        .card-body {
            padding: var(--tc-space-6);
        }

        /* Grilles d'informations */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        /* Variables du contrat */
        .variables-section {
            margin-top: var(--tc-space-4);
        }

        .variables-toggle {
            background: none;
            border: none;
            color: var(--tc-color-primary);
            font-size: var(--tc-font-size-sm);
            cursor: pointer;
            padding: var(--tc-space-2) 0;
            display: flex;
            align-items: center;
            gap: var(--tc-space-1);
        }

        .variables-content {
            display: none;
            margin-top: var(--tc-space-3);
            padding: var(--tc-space-4);
            background-color: var(--tc-bg-subtle);
            border-radius: var(--tc-radius-base);
        }

        .variables-content.show {
            display: block;
        }

        .variable-item {
            display: flex;
            justify-content: space-between;
            padding: var(--tc-space-2) 0;
            border-bottom: 1px solid var(--tc-border-ultralight);
        }

        .variable-item:last-child {
            border-bottom: none;
        }

        .variable-name {
            font-weight: var(--tc-font-weight-medium);
            color: var(--tc-text-secondary);
        }

        .variable-value {
            color: var(--tc-text-default);
            font-family: monospace;
        }

        /* Onglets PDF */
        .pdf-tabs {
            display: flex;
            border-bottom: 1px solid var(--tc-border-light);
            margin-bottom: var(--tc-space-4);
            background-color: var(--tc-bg-card);
            border-radius: var(--tc-radius-lg) var(--tc-radius-lg) 0 0;
            overflow: hidden;
        }

        .pdf-tab {
            padding: var(--tc-space-3) var(--tc-space-6);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            color: var(--tc-text-muted);
            font-weight: var(--tc-font-weight-medium);
            transition: all var(--tc-transition-fast);
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .pdf-tab:hover {
            background-color: var(--tc-bg-hover);
            color: var(--tc-text-default);
        }

        .pdf-tab.active {
            color: var(--tc-color-primary);
            border-bottom-color: var(--tc-color-primary);
            background-color: var(--tc-bg-light);
        }

        .pdf-tab:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Visualiseur PDF */
        .pdf-viewer {
            background-color: var(--tc-bg-card);
            border: 1px solid var(--tc-border-light);
            border-radius: 0 0 var(--tc-radius-lg) var(--tc-radius-lg);
            min-height: 600px;
            padding: var(--tc-space-6);
            box-shadow: var(--tc-shadow-base);
        }

        .pdf-content {
            background-color: var(--tc-bg-default);
            border: 1px solid var(--tc-border-light);
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-8);
            min-height: 500px;
            font-size: var(--tc-font-size-sm);
            line-height: 1.6;
        }

        .pdf-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            color: var(--tc-text-muted);
            text-align: center;
        }

        .pdf-placeholder i {
            font-size: 4rem;
            margin-bottom: var(--tc-space-4);
            color: var(--tc-color-gray-300);
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

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .small-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--tc-color-gray-300);
            border-left: 2px solid var(--tc-color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        /* Alertes */
        .alert {
            padding: var(--tc-space-4);
            margin-bottom: var(--tc-space-4);
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

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: var(--tc-space-4);
            }

            .contrat-header {
                flex-direction: column;
                gap: var(--tc-space-3);
            }

            .actions-row {
                flex-direction: column;
                align-items: stretch;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .pdf-tabs {
                flex-direction: column;
            }

            .card-body {
                padding: var(--tc-space-4);
            }
        }

        /* Optimisations pour PDF export */
        @media print {
            body {
                background-color: white;
            }
            
            .container {
                max-width: none;
                margin: 0;
                padding: 0;
            }
            
            .card, .contrat-actions {
                box-shadow: none;
                border: 1px solid #ddd;
                margin-bottom: 20px;
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

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- États de chargement et d'erreur (cachés par défaut) -->
        <div id="loading-state" class="loading-container hidden">
            <div class="spinner"></div>
            <p>Chargement du contrat...</p>
        </div>

        <div id="error-state" class="hidden">
            <div class="alert alert-error">
                <i class="bi bi-exclamation-triangle"></i>
                <div>
                    <h4>Erreur</h4>
                    <p>Ce contrat n'existe pas ou n'a pas pu être chargé.</p>
                </div>
            </div>
            <button class="btn btn-primary" onclick="window.history.back()">
                <i class="bi bi-arrow-left"></i>
                Retour à la liste des contrats
            </button>
        </div>

        <!-- Contenu principal (visible par défaut) -->
        <div id="main-content">
            <!-- ContratHeader -->
            <div class="contrat-header">
                <div class="contrat-title-section">
                    <h1 class="contrat-title">Contrat de Spectacle - Festival d'Été 2024</h1>
                    <div class="contrat-meta">
                        <span><i class="bi bi-calendar3"></i> Créé le 15 mai 2024</span>
                        <span><i class="bi bi-person"></i> Les Harmoniques</span>
                        <span><i class="bi bi-geo-alt"></i> Salle de concerts Le Zenith</span>
                    </div>
                </div>
                <div class="status-badge sent">
                    <i class="bi bi-send"></i>
                    Envoyé
                </div>
            </div>

            <!-- ContratActions -->
            <div class="contrat-actions">
                <div class="actions-row">
                    <button class="btn btn-primary" onclick="togglePdfViewer()">
                        <i class="bi bi-eye"></i>
                        Aperçu PDF
                    </button>
                    <button class="btn btn-warning" onclick="sendContract()">
                        <i class="bi bi-send"></i>
                        Envoyer
                    </button>
                    <button class="btn btn-success" onclick="markAsSigned()">
                        <i class="bi bi-check-circle"></i>
                        Marquer comme signé
                    </button>
                    <button class="btn btn-secondary" onclick="downloadPdf()">
                        <i class="bi bi-download"></i>
                        Télécharger PDF
                    </button>
                    <button class="btn btn-outline" onclick="window.history.back()">
                        <i class="bi bi-arrow-left"></i>
                        Retour
                    </button>
                </div>
            </div>

            <!-- ContratInfoCard -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-info-circle"></i>
                    <h3>Informations du contrat</h3>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Template utilisé</div>
                            <div class="info-value">Contrat Standard v2.1</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Concert</div>
                            <div class="info-value">Festival d'Été 2024 - Concert principal</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Date du spectacle</div>
                            <div class="info-value">15 juin 2024 à 20h30</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Lieu</div>
                            <div class="info-value">Salle de concerts Le Zenith - Paris</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Artiste</div>
                            <div class="info-value">Les Harmoniques</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Programmateur</div>
                            <div class="info-value">Production Musicale SARL</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Montant</div>
                            <div class="info-value">2 500,00 €</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Statut</div>
                            <div class="info-value">
                                <span class="status-badge sent">
                                    <i class="bi bi-send"></i>
                                    Envoyé
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ContratVariablesCard -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-code-square"></i>
                    <h3>Variables du contrat</h3>
                    <button class="variables-toggle" onclick="toggleVariables()">
                        <i class="bi bi-chevron-down" id="variables-icon"></i>
                        <span id="variables-text">Afficher les variables</span>
                    </button>
                </div>
                <div class="variables-content" id="variables-content">
                    <div class="variable-item">
                        <span class="variable-name">{{ARTISTE_NOM}}</span>
                        <span class="variable-value">Les Harmoniques</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{CONCERT_DATE}}</span>
                        <span class="variable-value">15 juin 2024</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{CONCERT_HEURE}}</span>
                        <span class="variable-value">20h30</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{LIEU_NOM}}</span>
                        <span class="variable-value">Salle de concerts Le Zenith</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{LIEU_ADRESSE}}</span>
                        <span class="variable-value">123 Avenue de la Musique, 75001 Paris</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{PROGRAMMATEUR_NOM}}</span>
                        <span class="variable-value">Production Musicale SARL</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{PROGRAMMATEUR_ADRESSE}}</span>
                        <span class="variable-value">456 Rue des Spectacles, 75002 Paris</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{MONTANT_CACHET}}</span>
                        <span class="variable-value">2 500,00 €</span>
                    </div>
                    <div class="variable-item">
                        <span class="variable-name">{{DATE_SIGNATURE}}</span>
                        <span class="variable-value">15 mai 2024</span>
                    </div>
                </div>
            </div>

            <!-- Section PDF (cachée par défaut) -->
            <div id="pdf-section" class="hidden">
                <!-- ContratPdfTabs -->
                <div class="pdf-tabs">
                    <button class="pdf-tab active" data-tab="html" onclick="switchTab('html')">
                        <i class="bi bi-globe"></i>
                        Aperçu HTML
                    </button>
                    <button class="pdf-tab" data-tab="pdf" onclick="switchTab('pdf')">
                        <i class="bi bi-file-earmark-pdf"></i>
                        Aperçu PDF
                    </button>
                </div>

                <!-- ContratPdfViewer -->
                <div class="pdf-viewer">
                    <div id="html-content" class="pdf-content">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h2 style="color: var(--tc-color-primary); margin-bottom: 0.5rem;">CONTRAT DE SPECTACLE</h2>
                            <p style="font-size: 1.2rem; color: var(--tc-text-secondary);">Festival d'Été 2024</p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 1 - Les Parties</h3>
                            <p><strong>Le Producteur :</strong> Production Musicale SARL<br>
                            Adresse : 456 Rue des Spectacles, 75002 Paris<br>
                            SIRET : 123 456 789 01234</p>
                            
                            <p><strong>L'Artiste :</strong> Les Harmoniques<br>
                            Représenté par : [Nom du représentant]<br>
                            Adresse : [Adresse de l'artiste]</p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 2 - Objet du Contrat</h3>
                            <p>Le présent contrat a pour objet l'organisation d'un spectacle dans le cadre du Festival d'Été 2024.</p>
                            
                            <p><strong>Date du spectacle :</strong> 15 juin 2024 à 20h30<br>
                            <strong>Lieu :</strong> Salle de concerts Le Zenith<br>
                            <strong>Adresse :</strong> 123 Avenue de la Musique, 75001 Paris</p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 3 - Obligations du Producteur</h3>
                            <ul>
                                <li>Mettre à disposition la salle et les équipements techniques nécessaires</li>
                                <li>Assurer la promotion de l'événement</li>
                                <li>Prendre en charge les frais de sécurité et d'accueil du public</li>
                                <li>Verser la rémunération convenue selon les modalités prévues</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 4 - Obligations de l'Artiste</h3>
                            <ul>
                                <li>Se présenter à l'heure convenue pour les répétitions et le spectacle</li>
                                <li>Fournir une prestation artistique de qualité professionnelle</li>
                                <li>Respecter la durée de spectacle convenue</li>
                                <li>Fournir la fiche technique dans les délais</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 5 - Rémunération</h3>
                            <p><strong>Montant du cachet :</strong> 2 500,00 € TTC</p>
                            <p><strong>Modalités de paiement :</strong></p>
                            <ul>
                                <li>Acompte de 30% à la signature : 750,00 €</li>
                                <li>Solde le jour du spectacle : 1 750,00 €</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: var(--tc-color-primary); border-bottom: 2px solid var(--tc-color-primary); padding-bottom: 0.5rem;">Article 6 - Signatures</h3>
                            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                                <div style="text-align: center; width: 45%;">
                                    <p><strong>Le Producteur</strong></p>
                                    <p>Production Musicale SARL</p>
                                    <div style="border-bottom: 1px solid #000; height: 60px; margin: 1rem 0;"></div>
                                    <p style="font-size: 0.9rem;">Date et signature</p>
                                </div>
                                <div style="text-align: center; width: 45%;">
                                    <p><strong>L'Artiste</strong></p>
                                    <p>Les Harmoniques</p>
                                    <div style="border-bottom: 1px solid #000; height: 60px; margin: 1rem 0;"></div>
                                    <p style="font-size: 0.9rem;">Date et signature</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="pdf-content" class="pdf-placeholder hidden">
                        <i class="bi bi-file-earmark-pdf"></i>
                        <h4>Aperçu PDF</h4>
                        <p>Cliquez sur "Générer PDF" pour voir l'aperçu du contrat au format PDF.</p>
                        <button class="btn btn-primary" onclick="generatePdf()">
                            <span id="pdf-loading" class="small-spinner hidden"></span>
                            <i class="bi bi-file-earmark-pdf" id="pdf-icon"></i>
                            <span id="pdf-text">Générer PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // État global
        let currentTab = 'html';
        let showPdf = false;
        let showVariables = false;

        // Fonction pour basculer l'affichage du visualiseur PDF
        function togglePdfViewer() {
            const pdfSection = document.getElementById('pdf-section');
            showPdf = !showPdf;
            
            if (showPdf) {
                pdfSection.classList.remove('hidden');
                // Scroll vers la section PDF
                pdfSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                pdfSection.classList.add('hidden');
            }
        }

        // Fonction pour changer d'onglet
        function switchTab(tab) {
            // Mettre à jour les onglets
            document.querySelectorAll('.pdf-tab').forEach(t => {
                t.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

            // Mettre à jour le contenu
            document.getElementById('html-content').classList.toggle('hidden', tab !== 'html');
            document.getElementById('pdf-content').classList.toggle('hidden', tab !== 'pdf');
            
            currentTab = tab;
        }

        // Fonction pour basculer l'affichage des variables
        function toggleVariables() {
            const content = document.getElementById('variables-content');
            const icon = document.getElementById('variables-icon');
            const text = document.getElementById('variables-text');
            
            showVariables = !showVariables;
            
            if (showVariables) {
                content.classList.add('show');
                icon.className = 'bi bi-chevron-up';
                text.textContent = 'Masquer les variables';
            } else {
                content.classList.remove('show');
                icon.className = 'bi bi-chevron-down';
                text.textContent = 'Afficher les variables';
            }
        }

        // Simulation de génération PDF
        function generatePdf() {
            const loadingSpinner = document.getElementById('pdf-loading');
            const icon = document.getElementById('pdf-icon');
            const text = document.getElementById('pdf-text');
            
            // Afficher le loading
            loadingSpinner.classList.remove('hidden');
            icon.classList.add('hidden');
            text.textContent = 'Génération en cours...';
            
            // Simuler un délai de génération
            setTimeout(() => {
                loadingSpinner.classList.add('hidden');
                icon.classList.remove('hidden');
                text.textContent = 'PDF généré';
                
                // Remplacer le placeholder par un aperçu simulé
                const pdfContent = document.getElementById('pdf-content');
                pdfContent.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="bi bi-check-circle" style="font-size: 3rem; color: var(--tc-color-success); margin-bottom: 1rem;"></i>
                        <h4>PDF généré avec succès</h4>
                        <p>Le contrat a été généré au format PDF.</p>
                        <div style="border: 1px solid var(--tc-border-light); border-radius: var(--tc-radius-base); height: 400px; background-color: var(--tc-bg-subtle); display: flex; align-items: center; justify-content: center; margin: 1rem 0; position: relative;">
                            <div style="text-align: center;">
                                <i class="bi bi-file-earmark-pdf" style="font-size: 2rem; color: var(--tc-color-error); margin-bottom: 1rem;"></i>
                                <p>Aperçu du contrat PDF</p>
                                <small style="color: var(--tc-text-muted);">Version haute qualité disponible au téléchargement</small>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="downloadPdf()">
                            <i class="bi bi-download"></i>
                            Télécharger le PDF
                        </button>
                    </div>
                `;
            }, 2000);
        }

        // Actions du contrat
        function sendContract() {
            if (confirm('Êtes-vous sûr de vouloir envoyer ce contrat ?')) {
                // Simulation d'envoi
                const statusBadge = document.querySelector('.status-badge');
                statusBadge.className = 'status-badge sent';
                statusBadge.innerHTML = '<i class="bi bi-send"></i> Envoyé';
                
                // Afficher un message de succès
                showAlert('success', 'Contrat envoyé avec succès !');
            }
        }

        function markAsSigned() {
            if (confirm('Marquer ce contrat comme signé ?')) {
                // Simulation de signature
                const statusBadge = document.querySelector('.status-badge');
                statusBadge.className = 'status-badge signed';
                statusBadge.innerHTML = '<i class="bi bi-check-circle"></i> Signé';
                
                showAlert('success', 'Contrat marqué comme signé !');
            }
        }

        function downloadPdf() {
            // Simulation de téléchargement
            showAlert('info', 'Téléchargement du PDF en cours...');
            
            // Créer un lien de téléchargement fictif
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = '#';
                link.download = 'contrat-festival-ete-2024.pdf';
                link.click();
                
                showAlert('success', 'PDF téléchargé avec succès !');
            }, 1000);
        }

        // Fonction utilitaire pour afficher des alertes
        function showAlert(type, message) {
            const alertClass = `alert-${type}`;
            const iconClass = type === 'success' ? 'bi-check-circle' : 
                             type === 'error' ? 'bi-exclamation-triangle' : 
                             type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle';
            
            const alert = document.createElement('div');
            alert.className = `alert ${alertClass}`;
            alert.innerHTML = `
                <i class="bi ${iconClass}"></i>
                <div>${message}</div>
            `;
            
            // Insérer l'alerte en haut du contenu
            const mainContent = document.getElementById('main-content');
            mainContent.insertBefore(alert, mainContent.firstChild);
            
            // Supprimer l'alerte après 5 secondes
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }

        // Simulation des états de chargement/erreur (pour test)
        function showLoading() {
            document.getElementById('main-content').classList.add('hidden');
            document.getElementById('error-state').classList.add('hidden');
            document.getElementById('loading-state').classList.remove('hidden');
        }

        function showError() {
            document.getElementById('main-content').classList.add('hidden');
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
        }

        function showMain() {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('error-state').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            // Démarrer avec le contenu principal visible
            showMain();
            
            // Initialiser l'onglet HTML comme actif
            switchTab('html');
        });
    </script>
</body>
</html>
