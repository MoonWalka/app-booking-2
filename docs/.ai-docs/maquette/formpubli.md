<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Formulaire Programmateur</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* TourCraft CSS Variables */
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
            --tc-bg-hover: #f8f9fa;
            --tc-bg-card: #ffffff;
            --tc-bg-surface: #ffffff;
            --tc-bg-subtle: #f8f9fa;
            --tc-bg-input: #ffffff;

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
            --tc-radius-sm: 0.25rem;
            --tc-radius-base: 0.375rem;
            --tc-radius-md: 0.5rem;
            --tc-radius-lg: 0.75rem;
            --tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
            --tc-shadow-md: 0 4px 8px rgba(0,0,0,0.1);
            --tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
            --tc-transition-base: 300ms ease;
            --tc-transition-fast: 150ms ease;
        }

        /* Styles globaux */
        body {
            font-family: var(--tc-font-sans);
            background-color: var(--tc-bg-body);
            color: var(--tc-text-default);
            line-height: var(--tc-line-height-normal);
            margin: 0;
            padding: 0;
        }

        /* Layout principal isolé */
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
            border-bottom: 1px solid var(--tc-border-light);
            box-shadow: var(--tc-shadow-sm);
        }

        .form-logo h2 {
            margin: 0;
            color: var(--tc-text-light);
            text-align: center;
            font-size: var(--tc-font-size-xl);
            font-weight: var(--tc-font-weight-bold);
        }

        /* Contenu principal */
        .form-content {
            flex-grow: 1;
            padding: var(--tc-space-8);
            background-color: var(--tc-bg-light);
        }

        /* Footer */
        .form-footer {
            padding: var(--tc-space-4) var(--tc-space-8);
            background-color: var(--tc-color-gray-50);
            border-top: 1px solid var(--tc-border-light);
            text-align: center;
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-sm);
        }

        /* Titre principal */
        .page-title {
            text-align: center;
            margin-bottom: var(--tc-space-6);
            color: var(--tc-color-primary);
            font-size: var(--tc-font-size-2xl);
            font-weight: var(--tc-font-weight-bold);
        }

        /* Cards */
        .tc-card {
            background-color: var(--tc-bg-card);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-base);
            margin-bottom: var(--tc-space-6);
            overflow: hidden;
            border: 1px solid var(--tc-border-light);
        }

        .tc-card-header {
            background-color: var(--tc-color-gray-50);
            padding: var(--tc-space-4);
            border-bottom: 1px solid var(--tc-border-light);
            display: flex;
            align-items: center;
        }

        .tc-card-header i {
            font-size: var(--tc-font-size-lg);
            margin-right: var(--tc-space-2);
            color: var(--tc-color-primary);
        }

        .tc-card-header h3 {
            margin: 0;
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
        }

        .tc-card-body {
            padding: var(--tc-space-6);
        }

        /* Informations concert */
        .concert-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--tc-space-4);
        }

        .concert-info-item {
            text-align: center;
        }

        .concert-info-label {
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-sm);
            margin-bottom: var(--tc-space-1);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .concert-info-value {
            font-size: var(--tc-font-size-lg);
            font-weight: var(--tc-font-weight-medium);
            color: var(--tc-color-primary);
        }

        /* Formulaire */
        .form-group {
            margin-bottom: var(--tc-space-5);
        }

        .form-label {
            display: block;
            margin-bottom: var(--tc-space-2);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
            font-size: var(--tc-font-size-sm);
        }

        .form-control {
            width: 100%;
            padding: var(--tc-space-3) var(--tc-space-4);
            border: 1px solid var(--tc-border-input);
            border-radius: var(--tc-radius-base);
            font-size: var(--tc-font-size-base);
            background-color: var(--tc-bg-input);
            transition: var(--tc-transition-base);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--tc-color-primary);
            box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.1);
        }

        .form-control::placeholder {
            color: var(--tc-text-placeholder);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--tc-space-4);
        }

        /* Boutons */
        .btn-primary {
            background-color: var(--tc-color-primary);
            border-color: var(--tc-color-primary);
            color: var(--tc-text-light);
            padding: var(--tc-space-3) var(--tc-space-6);
            font-size: var(--tc-font-size-base);
            font-weight: var(--tc-font-weight-medium);
            border-radius: var(--tc-radius-base);
            transition: var(--tc-transition-base);
            border: none;
            cursor: pointer;
        }

        .btn-primary:hover {
            background-color: var(--tc-color-primary-hover);
            border-color: var(--tc-color-primary-hover);
            color: var(--tc-text-light);
        }

        .btn-primary:disabled {
            background-color: var(--tc-color-gray-400);
            border-color: var(--tc-color-gray-400);
            cursor: not-allowed;
        }

        /* Texte d'aide */
        .form-subtitle {
            color: var(--tc-text-secondary);
            margin-bottom: var(--tc-space-4);
            font-size: var(--tc-font-size-base);
        }

        .legal-notice {
            background-color: var(--tc-color-gray-50);
            padding: var(--tc-space-4);
            border-radius: var(--tc-radius-base);
            border-left: 4px solid var(--tc-color-info);
            margin-top: var(--tc-space-6);
        }

        .legal-notice p {
            margin: 0;
            font-size: var(--tc-font-size-sm);
            color: var(--tc-text-muted);
            line-height: 1.6;
        }

        /* Spinner de chargement */
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid var(--tc-color-gray-300);
            border-radius: 50%;
            border-top-color: var(--tc-text-light);
            animation: spin 1s ease-in-out infinite;
            margin-right: var(--tc-space-2);
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .form-content {
                padding: var(--tc-space-4);
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .concert-info-grid {
                grid-template-columns: 1fr;
            }
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
            <h1 class="page-title">Formulaire Programmateur</h1>

            <!-- Informations du concert -->
            <div class="tc-card">
                <div class="tc-card-header">
                    <i class="bi bi-calendar-event"></i>
                    <h3>Informations sur le concert</h3>
                </div>
                <div class="tc-card-body">
                    <div class="concert-info-grid">
                        <div class="concert-info-item">
                            <div class="concert-info-label">Date</div>
                            <div class="concert-info-value">15 Juin 2025</div>
                        </div>
                        <div class="concert-info-item">
                            <div class="concert-info-label">Lieu</div>
                            <div class="concert-info-value">Salle de Concert TourCraft</div>
                        </div>
                        <div class="concert-info-item">
                            <div class="concert-info-label">Montant</div>
                            <div class="concert-info-value">2 500,00 €</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Formulaire -->
            <div class="tc-card">
                <div class="tc-card-header">
                    <i class="bi bi-person-lines-fill"></i>
                    <h3>Vos informations de contact</h3>
                </div>
                <div class="tc-card-body">
                    <p class="form-subtitle">
                        Veuillez remplir le formulaire ci-dessous avec vos informations de contact.
                    </p>

                    <form id="programmateurForm">
                        <!-- Nom et Prénom -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="nom" class="form-label">Nom *</label>
                                <input 
                                    type="text" 
                                    id="nom" 
                                    name="nom" 
                                    class="form-control" 
                                    placeholder="Votre nom"
                                    required
                                >
                            </div>
                            <div class="form-group">
                                <label for="prenom" class="form-label">Prénom *</label>
                                <input 
                                    type="text" 
                                    id="prenom" 
                                    name="prenom" 
                                    class="form-control" 
                                    placeholder="Votre prénom"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Email et Téléphone -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="email" class="form-label">Email *</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    class="form-control" 
                                    placeholder="votre@email.com"
                                    required
                                >
                            </div>
                            <div class="form-group">
                                <label for="telephone" class="form-label">Téléphone *</label>
                                <input 
                                    type="tel" 
                                    id="telephone" 
                                    name="telephone" 
                                    class="form-control" 
                                    placeholder="06 12 34 56 78"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Adresse -->
                        <div class="form-group">
                            <label for="adresse" class="form-label">Adresse *</label>
                            <input 
                                type="text" 
                                id="adresse" 
                                name="adresse" 
                                class="form-control" 
                                placeholder="Numéro et nom de rue"
                                required
                            >
                        </div>

                        <!-- Code postal et Ville -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="codePostal" class="form-label">Code postal *</label>
                                <input 
                                    type="text" 
                                    id="codePostal" 
                                    name="codePostal" 
                                    class="form-control" 
                                    placeholder="75000"
                                    required
                                >
                            </div>
                            <div class="form-group">
                                <label for="ville" class="form-label">Ville *</label>
                                <input 
                                    type="text" 
                                    id="ville" 
                                    name="ville" 
                                    class="form-control" 
                                    placeholder="Votre ville"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Bouton de soumission -->
                        <div class="text-center" style="margin-top: 2rem;">
                            <button type="submit" class="btn-primary" id="submitBtn">
                                <span id="submitText">
                                    <i class="bi bi-send me-2"></i>
                                    Envoyer le formulaire
                                </span>
                                <span id="submitLoading" style="display: none;">
                                    <span class="loading-spinner"></span>
                                    Envoi en cours...
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Notice légale -->
            <div class="legal-notice">
                <p>
                    <i class="bi bi-info-circle me-2"></i>
                    Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé 
                    à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », 
                    vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier.
                </p>
            </div>
        </main>

        <!-- Footer -->
        <footer class="form-footer">
            <p>© 2025 Label Musical - Formulaire sécurisé</p>
        </footer>
    </div>

    <script>
        // Simulation de la soumission du formulaire
        document.getElementById('programmateurForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const submitText = document.getElementById('submitText');
            const submitLoading = document.getElementById('submitLoading');
            
            // Afficher l'état de chargement
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline-flex';
            
            // Simuler l'envoi (2 secondes)
            setTimeout(() => {
                alert('Formulaire envoyé avec succès !');
                
                // Réinitialiser le bouton
                submitBtn.disabled = false;
                submitText.style.display = 'inline-flex';
                submitLoading.style.display = 'none';
                
                // Réinitialiser le formulaire
                this.reset();
            }, 2000);
        });

        // Validation en temps réel
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.style.borderColor = 'var(--tc-color-success)';
                } else {
                    this.style.borderColor = 'var(--tc-border-input)';
                }
            });
        });
    </script>
</body>
</html>
