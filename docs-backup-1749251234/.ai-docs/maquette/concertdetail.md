<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Détails du Concert</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* Variables CSS TourCraft */
        :root {
            /* Couleurs principales */
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
            --tc-color-gray-100: rgba(0, 0, 0, 0.01);
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

            /* Couleurs de texte */
            --tc-text-default: #333333;
            --tc-text-secondary: #555555;
            --tc-text-muted: #888888;
            --tc-text-light: #ffffff;
            --tc-text-primary: var(--tc-color-primary);
            --tc-text-link: var(--tc-color-primary);

            /* Couleurs de bordures */
            --tc-border-default: #e0e0e0;
            --tc-border-light: #dee2e6;
            --tc-border-primary: var(--tc-color-primary);

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

            /* Espacements */
            --tc-space-1: 0.25rem;
            --tc-space-2: 0.5rem;
            --tc-space-3: 0.75rem;
            --tc-space-4: 1rem;
            --tc-space-5: 1.25rem;
            --tc-space-6: 1.5rem;
            --tc-space-8: 2rem;

            /* Effets */
            --tc-radius-sm: 0.25rem;
            --tc-radius-base: 0.375rem;
            --tc-radius-md: 0.5rem;
            --tc-radius-lg: 0.75rem;
            --tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
            --tc-shadow-md: 0 4px 8px rgba(0,0,0,0.1);
            --tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
            --tc-transition-base: 300ms ease;
        }

        /* Styles globaux */
        body {
            font-family: var(--tc-font-sans);
            background-color: var(--tc-bg-body);
            color: var(--tc-text-default);
            line-height: 1.5;
        }

        /* Container principal */
        .concert-view-container {
            background-color: var(--tc-bg-default);
            border-radius: var(--tc-radius-base);
            box-shadow: var(--tc-shadow-base);
            border: 1px solid var(--tc-border-default);
            padding: var(--tc-space-4);
            margin: var(--tc-space-4);
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Card Section */
        .form-card {
            background-color: var(--tc-color-white);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-sm);
            margin-bottom: var(--tc-space-6);
            overflow: hidden;
            border: 1px solid var(--tc-border-light);
        }

        .card-header {
            display: flex;
            align-items: center;
            background-color: var(--tc-color-gray-50);
            padding: var(--tc-space-4);
            border-bottom: 1px solid var(--tc-border-default);
        }

        .card-header i {
            margin-right: var(--tc-space-2);
            color: var(--tc-color-primary);
            font-size: var(--tc-font-size-lg);
        }

        .card-header h3 {
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            margin: 0;
            flex-grow: 1;
            color: var(--tc-text-default);
        }

        .card-header-action {
            margin-left: auto;
        }

        .card-body {
            padding: var(--tc-space-6);
        }

        /* Header */
        .details-header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--tc-space-6);
            gap: var(--tc-space-4);
            padding-bottom: var(--tc-space-4);
            border-bottom: 2px solid var(--tc-border-light);
        }

        .title-container {
            flex: 1;
            min-width: 0;
        }

        .modern-title {
            font-size: var(--tc-font-size-2xl);
            font-weight: var(--tc-font-weight-bold);
            color: var(--tc-color-primary);
            margin: 0;
            margin-bottom: var(--tc-space-2);
        }

        .breadcrumb-container {
            display: flex;
            align-items: center;
            gap: var(--tc-space-1);
            font-size: var(--tc-font-size-sm);
            color: var(--tc-text-muted);
            margin-bottom: var(--tc-space-2);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tc-space-2);
            align-items: flex-start;
            flex-shrink: 0;
        }

        /* Boutons */
        .tc-btn {
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-1);
            padding: var(--tc-space-2) var(--tc-space-4);
            border-radius: var(--tc-radius-base);
            font-weight: var(--tc-font-weight-medium);
            text-decoration: none;
            transition: var(--tc-transition-base);
            border: 1px solid transparent;
            min-height: 40px;
            justify-content: center;
        }

        .tc-btn-primary {
            background-color: var(--tc-color-primary);
            color: var(--tc-color-white);
            border-color: var(--tc-color-primary);
        }

        .tc-btn-primary:hover {
            background-color: var(--tc-color-primary-dark);
            border-color: var(--tc-color-primary-dark);
            color: var(--tc-color-white);
        }

        .tc-btn-outline-primary {
            background-color: transparent;
            color: var(--tc-color-primary);
            border-color: var(--tc-color-primary);
        }

        .tc-btn-outline-primary:hover {
            background-color: var(--tc-color-primary);
            color: var(--tc-color-white);
        }

        .tc-btn-outline-secondary {
            background-color: transparent;
            color: var(--tc-color-gray-600);
            border-color: var(--tc-color-gray-300);
        }

        .tc-btn-outline-secondary:hover {
            background-color: var(--tc-color-gray-100);
            color: var(--tc-color-gray-700);
        }

        .tc-btn-sm {
            padding: var(--tc-space-1) var(--tc-space-3);
            font-size: var(--tc-font-size-sm);
            min-height: 32px;
        }

        /* Status badges */
        .badge {
            padding: var(--tc-space-1) var(--tc-space-2);
            border-radius: var(--tc-radius-sm);
            font-size: var(--tc-font-size-xs);
            font-weight: var(--tc-font-weight-semibold);
        }

        .badge.bg-success {
            background-color: var(--tc-color-success) !important;
            color: white;
        }

        .badge.bg-primary {
            background-color: var(--tc-color-primary) !important;
            color: white;
        }

        .badge.bg-warning {
            background-color: var(--tc-color-warning) !important;
            color: var(--tc-color-gray-800);
        }

        .badge.bg-info {
            background-color: var(--tc-color-info) !important;
            color: white;
        }

        .badge.bg-danger {
            background-color: var(--tc-color-error) !important;
            color: white;
        }

        .badge.bg-secondary {
            background-color: var(--tc-color-gray-500) !important;
            color: white;
        }

        /* Liens */
        .contact-link {
            color: var(--tc-color-primary);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-1);
        }

        .contact-link:hover {
            color: var(--tc-color-primary-dark);
            text-decoration: underline;
        }

        .artiste-link {
            color: var(--tc-color-primary);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-1);
        }

        .artiste-link:hover {
            color: var(--tc-color-primary-dark);
            text-decoration: underline;
        }

        /* Notes content */
        .notes-content {
            background-color: var(--tc-bg-subtle);
            border: 1px solid var(--tc-border-light);
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-3);
            white-space: pre-line;
            color: var(--tc-text-secondary);
        }

        /* Status display */
        .status-display {
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .action-needed {
            display: flex;
            align-items: center;
            font-size: var(--tc-font-size-sm);
            color: var(--tc-color-warning-dark);
        }

        /* Social links */
        .social-links {
            display: flex;
            gap: var(--tc-space-2);
            flex-wrap: wrap;
        }

        .social-link {
            display: inline-flex;
            align-items: center;
            gap: var(--tc-space-1);
            padding: var(--tc-space-1) var(--tc-space-2);
            border-radius: var(--tc-radius-sm);
            font-size: var(--tc-font-size-sm);
            text-decoration: none;
            border: 1px solid;
            transition: var(--tc-transition-base);
        }

        .social-link-website {
            color: var(--tc-color-gray-600);
            border-color: var(--tc-color-gray-300);
        }

        .social-link-website:hover {
            background-color: var(--tc-color-gray-100);
            color: var(--tc-color-gray-700);
        }

        .social-link-instagram {
            color: #e4405f;
            border-color: #e4405f;
        }

        .social-link-instagram:hover {
            background-color: #e4405f;
            color: white;
        }

        .social-link-facebook {
            color: #1877f2;
            border-color: #1877f2;
        }

        .social-link-facebook:hover {
            background-color: #1877f2;
            color: white;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .concert-view-container {
                margin: var(--tc-space-2);
                padding: var(--tc-space-3);
            }

            .details-header-container {
                flex-direction: column;
                align-items: flex-start;
            }

            .action-buttons {
                width: 100%;
                justify-content: stretch;
            }

            .tc-btn {
                flex: 1;
                min-width: 0;
            }

            .card-body {
                padding: var(--tc-space-4);
            }

            .modern-title {
                font-size: var(--tc-font-size-xl);
            }
        }

        /* Print styles for PDF export */
        @media print {
            body {
                background-color: white !important;
            }
            
            .concert-view-container {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 20px !important;
            }
            
            .form-card {
                box-shadow: none !important;
                border: 1px solid #ddd !important;
                break-inside: avoid;
                margin-bottom: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="concert-view-container">
        <!-- Concert Header -->
        <div class="details-header-container">
            <div class="title-container">
                <div class="breadcrumb-container">
                    <i class="bi bi-house"></i>
                    <span>Accueil</span>
                    <i class="bi bi-chevron-right"></i>
                    <span>Concerts</span>
                    <i class="bi bi-chevron-right"></i>
                    <span class="text-muted">Festival Jazz 2024</span>
                </div>
                <h1 class="modern-title">Festival Jazz 2024</h1>
            </div>
            <div class="action-buttons">
                <a href="#" class="tc-btn tc-btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i>
                    <span>Retour</span>
                </a>
                <a href="#" class="tc-btn tc-btn-outline-primary">
                    <i class="bi bi-pencil"></i>
                    <span>Modifier</span>
                </a>
            </div>
        </div>

        <!-- Concert General Info -->
        <div class="form-card">
            <div class="card-header">
                <i class="bi bi-info-circle"></i>
                <h3>Informations générales</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Titre:</div>
                            <div>Festival Jazz 2024</div>
                        </div>
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Date:</div>
                            <div>15 juillet 2024</div>
                        </div>
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Montant:</div>
                            <div>2 500,00 €</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Artiste:</div>
                            <div>
                                <a href="#" class="artiste-link">
                                    <i class="bi bi-music-note"></i>
                                    The Jazz Collective
                                </a>
                            </div>
                        </div>
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Statut:</div>
                            <div class="status-display">
                                <span class="badge bg-success">Contrat</span>
                            </div>
                        </div>
                        <div class="mb-4">
                            <div class="fw-bold mb-1">Formulaire:</div>
                            <div>
                                <span class="badge bg-success">
                                    <i class="bi bi-check-circle me-1"></i>
                                    Formulaire validé
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="mb-3">
                            <div class="fw-bold mb-2">Notes:</div>
                            <div class="notes-content">Concert en plein air dans le parc municipal. Prévoir système de sonorisation adapté aux conditions extérieures. Contact technique à prévoir 48h avant l'événement.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Concert Location Section -->
        <div class="form-card">
            <div class="card-header">
                <i class="bi bi-geo-alt"></i>
                <h3>Lieu</h3>
                <div class="card-header-action">
                    <a href="#" class="tc-btn tc-btn-outline-primary tc-btn-sm">
                        <i class="bi bi-eye"></i>
                        <span>Voir détails</span>
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Nom:</div>
                            <div>Parc Municipal des Arts</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Adresse:</div>
                            <div>
                                <div>15 Avenue des Tilleuls</div>
                                <div>75001 Paris</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Capacité:</div>
                            <div>500 personnes</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Contact:</div>
                            <div>
                                <div>
                                    <a href="mailto:contact@parcarts.fr" class="contact-link">
                                        <i class="bi bi-envelope"></i>
                                        contact@parcarts.fr
                                    </a>
                                </div>
                                <div class="mt-1">
                                    <a href="tel:+33145678901" class="contact-link">
                                        <i class="bi bi-telephone"></i>
                                        01 45 67 89 01
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Concert Organizer Section -->
        <div class="form-card">
            <div class="card-header">
                <i class="bi bi-person-badge"></i>
                <h3>Programmateur</h3>
                <div class="card-header-action">
                    <a href="#" class="tc-btn tc-btn-outline-primary tc-btn-sm">
                        <i class="bi bi-eye"></i>
                        <span>Voir détails</span>
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Nom:</div>
                            <div>Marie Dubois</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Structure:</div>
                            <div>Festival Jazz Paris</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Email:</div>
                            <div>
                                <a href="mailto:marie.dubois@jazzparis.fr" class="contact-link">
                                    <i class="bi bi-envelope"></i>
                                    marie.dubois@jazzparis.fr
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Téléphone:</div>
                            <div>
                                <a href="tel:+33123456789" class="contact-link">
                                    <i class="bi bi-telephone"></i>
                                    01 23 45 67 89
                                </a>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Adresse:</div>
                            <div>
                                <div>42 Rue de la Musique</div>
                                <div>75011 Paris</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Concert Artist Section -->
        <div class="form-card">
            <div class="card-header">
                <i class="bi bi-music-note"></i>
                <h3>Artiste</h3>
                <div class="card-header-action">
                    <a href="#" class="tc-btn tc-btn-outline-primary tc-btn-sm">
                        <i class="bi bi-eye"></i>
                        <span>Voir détails</span>
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Nom:</div>
                            <div>The Jazz Collective</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Genre:</div>
                            <div>Jazz contemporain</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Email:</div>
                            <div>
                                <a href="mailto:booking@jazzcollective.com" class="contact-link">
                                    <i class="bi bi-envelope"></i>
                                    booking@jazzcollective.com
                                </a>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Téléphone:</div>
                            <div>
                                <a href="tel:+33987654321" class="contact-link">
                                    <i class="bi bi-telephone"></i>
                                    09 87 65 43 21
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="mb-3">
                            <div class="fw-bold mb-2">Description:</div>
                            <div class="notes-content">
                                Quartet de jazz contemporain formé en 2018. Influences multiples allant du bebop au jazz fusion moderne. Albums acclaimés par la critique spécialisée.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="mb-3">
                            <div class="fw-bold mb-2">Membres:</div>
                            <ul class="list-group">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Thomas Martin
                                    <span class="badge bg-primary rounded-pill">Piano</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Sarah Johnson
                                    <span class="badge bg-primary rounded-pill">Saxo</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    David Rodriguez
                                    <span class="badge bg-primary rounded-pill">Contrebasse</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Emma Thompson
                                    <span class="badge bg-primary rounded-pill">Batterie</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <div class="fw-bold mb-2">Réseaux sociaux:</div>
                    <div class="social-links">
                        <a href="https://jazzcollective.com" target="_blank" class="social-link social-link-website">
                            <i class="bi bi-globe"></i>
                            <span>Site web</span>
                        </a>
                        <a href="https://instagram.com/jazzcollective" target="_blank" class="social-link social-link-instagram">
                            <i class="bi bi-instagram"></i>
                            <span>Instagram</span>
                        </a>
                        <a href="https://facebook.com/jazzcollective" target="_blank" class="social-link social-link-facebook">
                            <i class="bi bi-facebook"></i>
                            <span>Facebook</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Concert Structure Section -->
        <div class="form-card">
            <div class="card-header">
                <i class="bi bi-building"></i>
                <h3>Structure</h3>
                <div class="card-header-action">
                    <a href="#" class="tc-btn tc-btn-outline-primary tc-btn-sm">
                        <i class="bi bi-eye"></i>
                        <span>Voir détails</span>
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Nom:</div>
                            <div>Productions Musicales Paris</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Type:</div>
                            <div>SARL</div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">SIRET:</div>
                            <div>12345678901234</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="fw-bold">Adresse:</div>
                            <div>
                                <div>25 Boulevard de la République</div>
                                <div>75010 Paris</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Email:</div>
                            <div>
                                <a href="mailto:contact@productionsparis.fr" class="contact-link">
                                    <i class="bi bi-envelope"></i>
                                    contact@productionsparis.fr
                                </a>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="fw-bold">Téléphone:</div>
                            <div>
                                <a href="tel:+33198765432" class="contact-link">
                                    <i class="bi bi-telephone"></i>
                                    01 98 76 54 32
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
