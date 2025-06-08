<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Connexion Sécurisée</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* TourCraft Design System Variables */
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
            --tc-color-warning: #ffc107;
            --tc-color-error: #f44336;
            --tc-color-info: #2196f3;

            /* Couleurs neutres */
            --tc-color-white: #ffffff;
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
            --tc-bg-subtle: #f8f9fa;

            /* Couleurs de texte */
            --tc-text-default: #333333;
            --tc-text-secondary: #555555;
            --tc-text-muted: #888888;
            --tc-text-light: #ffffff;
            --tc-text-primary: var(--tc-color-primary);

            /* Couleurs de bordures */
            --tc-border-default: #e0e0e0;
            --tc-border-light: #dee2e6;
            --tc-border-input: #d1d5db;

            /* Typographie */
            --tc-font-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            --tc-font-size-xs: 0.75rem;
            --tc-font-size-sm: 0.875rem;
            --tc-font-size-base: 1rem;
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

        body {
            font-family: var(--tc-font-sans);
            background-color: var(--tc-bg-body);
            color: var(--tc-text-default);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-container {
            width: 100%;
            max-width: 480px;
            padding: var(--tc-space-4);
        }

        .login-header {
            text-align: center;
            margin-bottom: var(--tc-space-8);
        }

        .login-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--tc-color-primary), var(--tc-color-secondary));
            border-radius: var(--tc-radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--tc-space-4);
            box-shadow: var(--tc-shadow-md);
        }

        .login-logo i {
            font-size: 2.5rem;
            color: var(--tc-text-light);
        }

        .login-title {
            font-size: var(--tc-font-size-2xl);
            font-weight: var(--tc-font-weight-bold);
            color: var(--tc-color-primary);
            margin-bottom: var(--tc-space-2);
        }

        .login-subtitle {
            font-size: var(--tc-font-size-base);
            color: var(--tc-text-secondary);
            margin-bottom: 0;
        }

        .login-card {
            background: var(--tc-bg-card);
            border-radius: var(--tc-radius-lg);
            box-shadow: var(--tc-shadow-lg);
            border: 1px solid var(--tc-border-light);
            padding: var(--tc-space-8);
            margin-bottom: var(--tc-space-6);
        }

        .form-group {
            margin-bottom: var(--tc-space-6);
        }

        .form-label {
            font-size: var(--tc-font-size-sm);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-default);
            margin-bottom: var(--tc-space-2);
            display: block;
        }

        .form-control {
            background-color: var(--tc-bg-default);
            border: 1px solid var(--tc-border-input);
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-3) var(--tc-space-4);
            font-size: var(--tc-font-size-base);
            font-family: var(--tc-font-sans);
            width: 100%;
            transition: all var(--tc-transition-base);
            height: 48px;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--tc-color-primary);
            box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.1);
        }

        .form-control::placeholder {
            color: var(--tc-text-muted);
        }

        .input-group {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: var(--tc-space-4);
            top: 50%;
            transform: translateY(-50%);
            color: var(--tc-text-muted);
            font-size: var(--tc-font-size-lg);
            z-index: 1;
        }

        .form-control.with-icon {
            padding-left: calc(var(--tc-space-4) + 1.5rem + var(--tc-space-2));
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--tc-color-primary), var(--tc-color-primary-light));
            border: none;
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-3) var(--tc-space-6);
            font-size: var(--tc-font-size-base);
            font-weight: var(--tc-font-weight-semibold);
            color: var(--tc-text-light);
            cursor: pointer;
            transition: all var(--tc-transition-base);
            width: 100%;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--tc-space-2);
            box-shadow: var(--tc-shadow-sm);
        }

        .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, var(--tc-color-primary-hover), var(--tc-color-primary));
            transform: translateY(-1px);
            box-shadow: var(--tc-shadow-md);
        }

        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .alert {
            border-radius: var(--tc-radius-base);
            padding: var(--tc-space-4);
            margin-bottom: var(--tc-space-4);
            border: 1px solid;
            display: flex;
            align-items: center;
            gap: var(--tc-space-2);
        }

        .alert-danger {
            background-color: rgba(244, 67, 54, 0.1);
            border-color: rgba(244, 67, 54, 0.2);
            color: var(--tc-color-error);
        }

        .security-info {
            text-align: center;
            margin-top: var(--tc-space-6);
            padding: var(--tc-space-4);
            background: var(--tc-bg-subtle);
            border-radius: var(--tc-radius-base);
            border: 1px solid var(--tc-border-light);
        }

        .security-info p {
            margin: 0;
            font-size: var(--tc-font-size-sm);
            color: var(--tc-text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--tc-space-2);
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive Design */
        @media (max-width: 576px) {
            .login-container {
                padding: var(--tc-space-2);
            }
            
            .login-card {
                padding: var(--tc-space-6);
                margin: var(--tc-space-2);
            }
            
            .login-title {
                font-size: var(--tc-font-size-xl);
            }
        }

        /* Animation d'entrée progressive */
        .login-header {
            animation: fadeIn 0.8s ease-out;
        }

        .login-card {
            animation: fadeIn 1s ease-out 0.2s both;
        }

        .security-info {
            animation: fadeIn 1.2s ease-out 0.4s both;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <!-- En-tête avec logo et titre -->
        <div class="login-header">
            <div class="login-logo">
                <i class="bi bi-music-note-beamed"></i>
            </div>
            <h1 class="login-title">TourCraft</h1>
            <p class="login-subtitle">Plateforme de gestion de concerts</p>
        </div>

        <!-- Carte de connexion -->
        <div class="login-card">
            <!-- Alerte d'erreur (masquée par défaut) -->
            <div id="error-alert" class="alert alert-danger" style="display: none;">
                <i class="bi bi-exclamation-triangle"></i>
                <span id="error-message"></span>
            </div>

            <!-- Formulaire de connexion -->
            <form id="login-form">
                <div class="form-group">
                    <label for="email" class="form-label">
                        <i class="bi bi-envelope-fill me-1"></i>
                        Adresse email
                    </label>
                    <div class="input-group">
                        <i class="input-icon bi bi-envelope"></i>
                        <input 
                            type="email" 
                            class="form-control with-icon" 
                            id="email" 
                            name="email" 
                            placeholder="votre@email.com"
                            autocomplete="email"
                            required
                        >
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">
                        <i class="bi bi-shield-lock-fill me-1"></i>
                        Mot de passe
                    </label>
                    <div class="input-group">
                        <i class="input-icon bi bi-lock"></i>
                        <input 
                            type="password" 
                            class="form-control with-icon" 
                            id="password" 
                            name="password" 
                            placeholder="Votre mot de passe"
                            autocomplete="current-password"
                            required
                        >
                    </div>
                </div>

                <button type="submit" class="btn-primary" id="login-btn">
                    <i class="bi bi-shield-lock-fill" id="login-icon"></i>
                    <div class="spinner" id="loading-spinner" style="display: none;"></div>
                    <span id="login-text">Se connecter</span>
                </button>
            </form>
        </div>

        <!-- Informations de sécurité -->
        <div class="security-info">
            <p>
                <i class="bi bi-shield-check"></i>
                Connexion sécurisée avec Firebase Authentication
            </p>
        </div>
    </div>

    <script>
        // Simulation du comportement de connexion
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const loginBtn = document.getElementById('login-btn');
            const loginIcon = document.getElementById('login-icon');
            const loadingSpinner = document.getElementById('loading-spinner');
            const loginText = document.getElementById('login-text');
            const errorAlert = document.getElementById('error-alert');
            const errorMessage = document.getElementById('error-message');

            // Validation simple
            if (!emailInput.value || !passwordInput.value) {
                showError('Veuillez remplir tous les champs');
                return;
            }

            // Validation email basique
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                showError('Format d\'email invalide');
                return;
            }

            // Démarrer l'état de chargement
            startLoading();

            // Simuler une requête de connexion
            setTimeout(() => {
                // Simulation d'erreurs possibles (pour démonstration)
                const randomError = Math.random();
                
                if (randomError < 0.3) {
                    // Simuler une erreur
                    stopLoading();
                    showError('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
                } else {
                    // Simuler une connexion réussie
                    stopLoading();
                    showSuccess();
                }
            }, 2000);

            function startLoading() {
                loginBtn.disabled = true;
                loginIcon.style.display = 'none';
                loadingSpinner.style.display = 'block';
                loginText.textContent = 'Connexion en cours...';
                errorAlert.style.display = 'none';
            }

            function stopLoading() {
                loginBtn.disabled = false;
                loginIcon.style.display = 'block';
                loadingSpinner.style.display = 'none';
                loginText.textContent = 'Se connecter';
            }

            function showError(message) {
                errorMessage.textContent = message;
                errorAlert.style.display = 'flex';
                errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            function showSuccess() {
                // Simuler une redirection réussie
                loginBtn.style.background = 'linear-gradient(135deg, var(--tc-color-success), #66bb6a)';
                loginIcon.className = 'bi bi-check-circle-fill';
                loginText.textContent = 'Connexion réussie !';
                
                setTimeout(() => {
                    alert('Connexion réussie ! Redirection vers le dashboard...');
                    // Dans une vraie application, vous feriez une redirection ici
                    // window.location.href = '/dashboard';
                }, 1000);
            }
        });

        // Masquer l'alerte d'erreur quand l'utilisateur commence à taper
        document.getElementById('email').addEventListener('input', hideErrorAlert);
        document.getElementById('password').addEventListener('input', hideErrorAlert);

        function hideErrorAlert() {
            const errorAlert = document.getElementById('error-alert');
            if (errorAlert.style.display !== 'none') {
                errorAlert.style.display = 'none';
            }
        }

        // Amélioration UX : focus automatique sur le premier champ
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('email').focus();
        });

        // Gestion de l'accessibilité clavier
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && (e.target.id === 'email' || e.target.id === 'password')) {
                if (e.target.id === 'email' && e.target.value) {
                    document.getElementById('password').focus();
                } else if (e.target.id === 'password' && e.target.value) {
                    document.getElementById('login-form').dispatchEvent(new Event('submit'));
                }
            }
        });
    </script>
</body>
</html>
