<html lang="fr"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft - Interface Harmonisée</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css">
    <style>
        :root {
            --primary: #213547;
            --primary-light: #2d4a63;
            --secondary: #1e88e5;
            --secondary-light: #64b5f6;
            --accent: #4db6ac;
            --gray-light: #f5f7f9;
            --border-color: #e0e0e0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            background-color: #f9fafb;
        }
        
        /* Sidebar */
        .sidebar {
            background-color: var(--primary);
            min-height: 100vh;
            width: 240px;
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 10;
        }
        
        .sidebar-link {
            color: rgba(255, 255, 255, 0.7);
            transition: all 0.3s;
            border-left: 3px solid transparent;
        }
        
        .sidebar-link:hover, .sidebar-link.active {
            color: white;
            background-color: var(--primary-light);
            border-left: 3px solid var(--accent);
        }
        
        .sidebar-link i {
            width: 20px;
            text-align: center;
            margin-right: 10px;
        }
        
        .main-content {
            margin-left: 240px;
            padding: 20px 30px;
        }
        
        /* Cards & Stats */
        .stat-card {
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: all 0.2s;
        }
        
        .stat-card:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
        }
        
        /* Buttons */
        .btn-primary {
            background-color: var(--secondary);
            color: white;
            border-radius: 6px;
            padding: 8px 16px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-primary:hover {
            background-color: #1976d2;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .btn-outline {
            border: 1px solid var(--secondary);
            color: var(--secondary);
            background-color: white;
            border-radius: 6px;
            padding: 6px 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-outline:hover {
            background-color: var(--secondary);
            color: white;
        }
        
        .btn-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            transition: all 0.2s;
        }
        
        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }
        
        .data-table th {
            background-color: var(--gray-light);
            font-weight: 600;
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            color: #555;
        }
        
        .data-table td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
        }
        
        .data-table tr:hover {
            background-color: rgba(0, 0, 0, 0.01);
        }
        
        /* Status indicators */
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 6px;
        }
        
        .status-green {
            background-color: #4caf50;
        }
        
        .status-yellow {
            background-color: #ffc107;
        }
        
        .status-blue {
            background-color: #2196f3;
        }
        
        .status-gray {
            background-color: #9e9e9e;
        }
        
        .status-red {
            background-color: #f44336;
        }
        
        /* Tabs system */
        .tabs-container {
            margin-bottom: 20px;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .tab-button {
            background-color: transparent;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            color: #666;
            font-weight: 500;
        }
        
        .tab-button:hover {
            color: var(--secondary);
        }
        
        .tab-button.active {
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
        }
        
        /* Search box */
        .search-box {
            display: flex;
            align-items: center;
            background-color: white;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 12px;
            max-width: 300px;
        }
        
        .search-box i {
            color: #888;
            margin-right: 8px;
        }
        
        .search-box input {
            border: none;
            outline: none;
            flex-grow: 1;
            padding: 4px 0;
        }
        
        /* Badge */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-blue {
            background-color: rgba(33, 150, 243, 0.1);
            color: var(--secondary);
        }
        
        .badge-green {
            background-color: rgba(76, 175, 80, 0.1);
            color: #43a047;
        }
        
        .badge-yellow {
            background-color: rgba(255, 193, 7, 0.1);
            color: #ffa000;
        }
        
        .badge-red {
            background-color: rgba(244, 67, 54, 0.1);
            color: #e53935;
        }

        /* Filter dropdown */
        .dropdown {
            position: relative;
            display: inline-block;
        }
        
        .dropdown-content {
            display: none;
            position: absolute;
            background-color: white;
            min-width: 160px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            z-index: 1;
            border-radius: 4px;
            border: 1px solid var(--border-color);
        }
        
        .dropdown:hover .dropdown-content {
            display: block;
        }
        
        .dropdown-item {
            color: #333;
            padding: 8px 16px;
            text-decoration: none;
            display: block;
            transition: background 0.2s;
        }
        
        .dropdown-item:hover {
            background-color: var(--gray-light);
        }
        
        /* Form elements */
        .form-control {
            display: block;
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: white;
            transition: border-color 0.2s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--secondary);
            box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.1);
        }
        
        .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #555;
        }
        
        /* Section headers */
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
        }

        .footer {
            margin-top: 40px;
            padding: 20px 0;
            text-align: center;
            font-size: 14px;
            color: #888;
            border-top: 1px solid var(--border-color);
        }

        .section-nav {
            background-color: var(--gray-light);
            border-radius: 6px;
            padding: 10px 16px;
            margin-bottom: 20px;
        }

        .section-nav-link {
            color: #555;
            padding: 4px 10px;
            margin: 0 5px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .section-nav-link:hover, .section-nav-link.active {
            background-color: white;
            color: var(--secondary);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .sidebar {
                width: 60px;
            }
            
            .sidebar-link span {
                display: none;
            }
            
            .main-content {
                margin-left: 60px;
            }
        }
    </style>
<style>
    .genspark-notice-dialog {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      align-items: center;
      justify-content: center;
    }

    .genspark-notice-content {
      background-color: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      box-sizing: border-box;
      padding: 10px 30px 30px 30px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      font-size: 16px;
    }

    .genspark-notice-title {
      color: #000;
      font-family: Arial;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; 
    }

    .genspark-notice-list {
      margin: 24px 0;
      
      color: #606366;
      font-family: Arial;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      padding-left: 12px;
    }

    .genspark-notice-list li {
      margin-bottom: 12px;
      list-style-type: disc;
    }

    .genspark-notice-list li a {
      color: #606366;
      text-decoration: underline;
    }

    .genspark-notice-checkbox {
      display: flex;
      align-items: center;
      margin-top: 20px;
      gap: 10px;

      color: #232425;

      font-family: Arial;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }

    .genspark-notice-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
      
    .genspark-notice-ok {
      color: #232425;

      text-align: center;
      font-family: Arial;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 150%; 

      cursor: pointer;
      display: flex;
      height: 40px;
      padding: 6px 14px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      align-self: stretch;
      border-radius: 8px;
      border: 1px solid #000;
      box-sizing: border-box;
      width: 100%;
    }
  </style></head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="px-4 py-6">
            <h1 class="text-2xl font-bold text-white">TourCraft</h1>
        </div>
        <nav class="mt-6">
            <a href="#dashboard" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('dashboard')">
                <i class="fas fa-tachometer-alt"></i>
                <span>Tableau de bord</span>
            </a>
            <a href="#concerts" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('concerts')">
                <i class="fas fa-music"></i>
                <span>Concerts</span>
            </a>
            <a href="#programmateurs" class="sidebar-link flex items-center py-3 px-4 active" onclick="showTab('programmateurs')">
                <i class="fas fa-users"></i>
                <span>Programmateurs</span>
            </a>
            <a href="#lieux" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('lieux')">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lieux</span>
            </a>
            <a href="#structures" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('structures')">
                <i class="fas fa-building"></i>
                <span>Structures</span>
            </a>
            <a href="#contrats" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('contrats')">
                <i class="fas fa-file-contract"></i>
                <span>Contrats</span>
            </a>
            <a href="#artistes" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('artistes')">
                <i class="fas fa-guitar"></i>
                <span>Artistes</span>
            </a>
            <a href="#parametres" class="sidebar-link flex items-center py-3 px-4" onclick="showTab('parametres')">
                <i class="fas fa-cog"></i>
                <span>Paramètres</span>
            </a>
        </nav>
        <div class="absolute bottom-0 w-full pb-4 px-4">
            <div class="text-white opacity-70 text-xs mb-2">dev@exemple.com</div>
            <button class="text-white opacity-70 text-sm py-2 px-3 rounded hover:bg-primary-light">
                <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Dashboard -->
        <div id="dashboard" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Tableau de bord</h2>
                <div>
                    <span class="text-sm text-gray-600">Aujourd'hui: <b>25 Avril 2023</b></span>
                </div>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="stat-card bg-white p-5">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-gray-600 font-medium">Concerts</h3>
                        <i class="fas fa-music text-blue-500"></i>
                    </div>
                    <div class="text-3xl font-bold">3</div>
                    <div class="text-sm text-gray-500 mt-1">2 à venir | 1 à confirmer</div>
                </div>
                
                <div class="stat-card bg-white p-5">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-gray-600 font-medium">Artistes</h3>
                        <i class="fas fa-guitar text-green-500"></i>
                    </div>
                    <div class="text-3xl font-bold">2</div>
                    <div class="text-sm text-gray-500 mt-1">1 en tournée | 1 en pause</div>
                </div>
                
                <div class="stat-card bg-white p-5">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-gray-600 font-medium">Contrats</h3>
                        <i class="fas fa-file-contract text-yellow-500"></i>
                    </div>
                    <div class="text-3xl font-bold">1</div>
                    <div class="text-sm text-gray-500 mt-1">0 en attente | 1 signé</div>
                </div>
                
                <div class="stat-card bg-white p-5">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-gray-600 font-medium">Lieux</h3>
                        <i class="fas fa-map-marker-alt text-red-500"></i>
                    </div>
                    <div class="text-3xl font-bold">1</div>
                    <div class="text-sm text-gray-500 mt-1">Capacité totale: 150</div>
                </div>
            </div>
            
            <!-- Recent Events -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 class="text-lg font-semibold mb-4">Prochains concerts</h3>
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Concert</th>
                            <th>Lieu</th>
                            <th>Artiste</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>11-04-23</td>
                            <td>Concert test</td>
                            <td>Lieu non spécifié</td>
                            <td>lnp</td>
                            <td>
                                <span class="badge badge-yellow">À confirmer</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>15-05-23</td>
                            <td>Festival de Printemps</td>
                            <td>Waterloo (59150)</td>
                            <td>lnp roots family</td>
                            <td>
                                <span class="badge badge-green">Confirmé</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Recent Activity -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-semibold mb-4">Activité récente</h3>
                <div class="space-y-4">
                    <div class="flex items-start border-b border-gray-100 pb-3">
                        <div class="bg-blue-100 text-blue-500 p-2 rounded mr-3">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div>
                            <div class="font-medium">Nouveau concert ajouté</div>
                            <div class="text-sm text-gray-500">Concert test créé pour lnp</div>
                            <div class="text-xs text-gray-400 mt-1">Il y a 3 jours</div>
                        </div>
                    </div>
                    <div class="flex items-start border-b border-gray-100 pb-3">
                        <div class="bg-green-100 text-green-500 p-2 rounded mr-3">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div>
                            <div class="font-medium">Nouveau programmateur</div>
                            <div class="text-sm text-gray-500">Franck Blabla ajouté en tant que directeur</div>
                            <div class="text-xs text-gray-400 mt-1">Il y a 5 jours</div>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="bg-purple-100 text-purple-500 p-2 rounded mr-3">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div class="font-medium">Nouveau lieu ajouté</div>
                            <div class="text-sm text-gray-500">Lieu "chez tutu" créé à Waterloo</div>
                            <div class="text-xs text-gray-400 mt-1">Il y a 7 jours</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Concerts -->
        <div id="concerts" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Liste des concerts</h2>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Ajouter un concert
                </button>
            </div>
            
            <div class="section-nav flex items-center">
                <a href="#" class="section-nav-link active">Tous les concerts</a>
                <a href="#" class="section-nav-link">Contact établi</a>
                <a href="#" class="section-nav-link">Pré-accord</a>
                <a href="#" class="section-nav-link">Contrat signé</a>
                <a href="#" class="section-nav-link">Acompte facturé</a>
                <a href="#" class="section-nav-link">Soldé facturé</a>
                <a href="#" class="section-nav-link">Annulé</a>
            </div>
            
            <div class="mb-6 flex items-center justify-between">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher un concert...">
                </div>
                
                <div class="dropdown">
                    <button class="btn-outline flex items-center">
                        <i class="fas fa-filter mr-2"></i> Filtrer
                    </button>
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item">Date (croissant)</a>
                        <a href="#" class="dropdown-item">Date (décroissant)</a>
                        <a href="#" class="dropdown-item">Nom</a>
                        <a href="#" class="dropdown-item">Statut</a>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Concert</th>
                            <th>Lieu</th>
                            <th>Programmateur</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>11-04-23</td>
                            <td>Concert test</td>
                            <td>Lieu non spécifié</td>
                            <td>Non spécifié</td>
                            <td>
                                <span class="badge badge-yellow">À confirmer</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>15-05-23</td>
                            <td>Festival de Printemps</td>
                            <td>Chez tutu, Waterloo (59150)</td>
                            <td>Franck Blabla</td>
                            <td>
                                <span class="badge badge-green">Confirmé</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>20-06-23</td>
                            <td>Concert d'été</td>
                            <td>Chez tutu, Waterloo (59150)</td>
                            <td>Franck Blabla</td>
                            <td>
                                <span class="badge badge-blue">Pré-accord</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Programmateurs -->
        <div id="programmateurs" class="tab-content active">
            <div class="section-header">
                <h2 class="section-title">Liste des programmateurs</h2>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Nouveau programmateur
                </button>
            </div>
            
            <div class="mb-6 flex items-center justify-between">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher un programmateur...">
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Structure</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-medium">Franck Blabla</td>
                            <td>Non spécifiée</td>
                            <td>er@free.com</td>
                            <td>Non spécifié</td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Lieux -->
        <div id="lieux" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Liste des lieux</h2>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Ajouter un lieu
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-blue-100 text-blue-500 p-2 rounded-full mr-3">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Total des lieux</div>
                            <div class="text-xl font-bold">1</div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-green-100 text-green-500 p-2 rounded-full mr-3">
                            <i class="fas fa-music"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Avec concerts</div>
                            <div class="text-xl font-bold">1</div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-gray-100 text-gray-500 p-2 rounded-full mr-3">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Sans concerts</div>
                            <div class="text-xl font-bold">0</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6 flex items-center justify-between">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher un lieu...">
                </div>
                
                <div class="flex items-center space-x-3">
                    <div class="dropdown">
                        <button class="btn-outline flex items-center">
                            <i class="fas fa-filter mr-2"></i> Tous les lieux
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="dropdown-item">Tous les lieux</a>
                            <a href="#" class="dropdown-item">Avec concerts</a>
                            <a href="#" class="dropdown-item">Sans concerts</a>
                        </div>
                    </div>
                    
                    <div class="dropdown">
                        <button class="btn-outline flex items-center">
                            <i class="fas fa-sort mr-2"></i> Trier par
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="dropdown-item">Nom</a>
                            <a href="#" class="dropdown-item">Ville</a>
                            <a href="#" class="dropdown-item">Nombre de concerts</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Ville/Code postal</th>
                            <th>Jauge</th>
                            <th>Concerts</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-medium">chez tutu</td>
                            <td>Non spécifié</td>
                            <td>Waterloo (59150)</td>
                            <td>Non spécifiée</td>
                            <td>
                                <span class="badge badge-blue">1 concert</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-icon text-blue-500 hover:bg-blue-50"><i class="fas fa-eye"></i></button>
                                    <button class="btn-icon text-green-500 hover:bg-green-50"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Structures -->
        <div id="structures" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Structures</h2>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Ajouter une structure
                </button>
            </div>
            
            <div class="mb-6 flex items-center justify-between">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher une structure...">
                </div>
                
                <div class="dropdown">
                    <button class="btn-outline flex items-center">
                        <i class="fas fa-filter mr-2"></i> Tous les types
                    </button>
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item">Tous les types</a>
                        <a href="#" class="dropdown-item">Salle de concert</a>
                        <a href="#" class="dropdown-item">Association</a>
                        <a href="#" class="dropdown-item">Commune</a>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div class="mb-4">
                    <i class="fas fa-building text-gray-300 text-6xl"></i>
                </div>
                <h3 class="text-lg text-gray-500 mb-4">Aucune structure n'a été créée pour le moment</h3>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Créer ma première structure
                </button>
            </div>
        </div>

        <!-- Contrats -->
        <div id="contrats" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Contrats</h2>
                <button class="btn-primary">
                    <i class="fas fa-file-contract mr-2"></i> Gérer les modèles
                </button>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div class="mb-4">
                    <i class="fas fa-file-contract text-gray-300 text-6xl"></i>
                </div>
                <h3 class="text-lg text-gray-500 mb-2">Aucun contrat n'a été généré</h3>
                <p class="text-gray-500 mb-4">Rendez-vous sur la page de détail d'un concert pour générer un contrat.</p>
                <button class="btn-outline">
                    <i class="fas fa-file mr-2"></i> Gérer les modèles de contrats
                </button>
            </div>
        </div>

        <!-- Artistes -->
        <div id="artistes" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Gestion des artistes</h2>
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> Nouvel artiste
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-blue-100 text-blue-500 p-2 rounded-full mr-3">
                            <i class="fas fa-users"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Total artistes</div>
                            <div class="text-xl font-bold">2</div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-green-100 text-green-500 p-2 rounded-full mr-3">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Avec concerts</div>
                            <div class="text-xl font-bold">1</div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card bg-white p-4">
                    <div class="flex items-center">
                        <div class="bg-yellow-100 text-yellow-500 p-2 rounded-full mr-3">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Sans concerts</div>
                            <div class="text-xl font-bold">1</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6 flex items-center justify-between">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher un artiste...">
                </div>
                
                <div class="flex items-center space-x-3">
                    <div class="dropdown">
                        <button class="btn-outline flex items-center">
                            <i class="fas fa-filter mr-2"></i> Tous les artistes
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="dropdown-item">Tous les artistes</a>
                            <a href="#" class="dropdown-item">Avec concerts</a>
                            <a href="#" class="dropdown-item">Sans concerts</a>
                        </div>
                    </div>
                    
                    <div class="dropdown">
                        <button class="btn-outline flex items-center">
                            <i class="fas fa-sort mr-2"></i> Trier par
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="dropdown-item">Nom</a>
                            <a href="#" class="dropdown-item">Date</a>
                            <a href="#" class="dropdown-item">Cachets</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Artiste</th>
                            <th>Lieu</th>
                            <th>Cachet</th>
                            <th>Concerts</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-medium">
                                <div class="flex items-center">
                                    <i class="fas fa-music mr-2 text-gray-400"></i>
                                    lnp
                                </div>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                                <span class="badge badge-blue">1</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-outline text-sm">Voir</button>
                                    <button class="btn-outline text-sm">Modifier</button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="font-medium">
                                <div class="flex items-center">
                                    <i class="fas fa-music mr-2 text-gray-400"></i>
                                    lnp roots family
                                </div>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                                <span class="badge badge-yellow">0</span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn-outline text-sm">Voir</button>
                                    <button class="btn-outline text-sm">Modifier</button>
                                    <button class="btn-icon text-red-500 hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Parametres -->
        <div id="parametres" class="tab-content">
            <div class="section-header">
                <h2 class="section-title">Paramètres</h2>
            </div>
            
            <div class="tabs-container">
                <div class="border-b border-gray-200 mb-4">
                    <button class="tab-button active" onclick="showParametreTab('entreprise')">Entreprise</button>
                    <button class="tab-button" onclick="showParametreTab('generaux')">Paramètres généraux</button>
                    <button class="tab-button" onclick="showParametreTab('utilisateur')">Compte utilisateur</button>
                    <button class="tab-button" onclick="showParametreTab('notifications')">Notifications</button>
                    <button class="tab-button" onclick="showParametreTab('apparence')">Apparence</button>
                    <button class="tab-button" onclick="showParametreTab('modeles')">Modèles de contrats</button>
                    <button class="tab-button" onclick="showParametreTab('export')">Export et sauvegarde</button>
                    <button class="tab-button" onclick="showParametreTab('sync')">Synchronisation des données</button>
                </div>
                
                <div id="entreprise" class="parametre-tab active">
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold mb-4">Informations de l'entreprise</h3>
                        <p class="text-gray-600 mb-4">Ces informations apparaîtront dans les en-têtes et footers des contrats générés.</p>
                        
                        <div class="flex items-center mb-4">
                            <button class="btn-outline mr-3">
                                <i class="fas fa-pen mr-2"></i> Saisie manuelle
                            </button>
                            <button class="btn-outline mr-3">
                                <i class="fas fa-search mr-2"></i> Recherche par nom
                            </button>
                            <button class="btn-outline">
                                <i class="fas fa-building mr-2"></i> Recherche par SIREN/SIRET
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Nom de l'entreprise</label>
                                    <input type="text" class="form-control" value="Mesur Records">
                                </div>
                                
                                <div>
                                    <label class="form-label">Adresse</label>
                                    <input type="text" class="form-control" value="123 Chemin Fleurbais">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="form-label">Code postal</label>
                                        <input type="text" class="form-control" value="59150">
                                    </div>
                                    <div>
                                        <label class="form-label">Ville</label>
                                        <input type="text" class="form-control" value="Lille Porte-Maritime">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="form-label">Téléphone</label>
                                    <input type="text" class="form-control">
                                </div>
                            </div>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Logo (URL)</label>
                                    <input type="text" class="form-control" value="https://exemple.com/logo.png">
                                </div>
                                
                                <div>
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control">
                                </div>
                                
                                <div>
                                    <label class="form-label">Site web</label>
                                    <input type="url" class="form-control">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="form-label">SIRET</label>
                                        <input type="text" class="form-control" placeholder="Numéro d'identification (14 chiffres)">
                                    </div>
                                    <div>
                                        <label class="form-label">Code APE</label>
                                        <input type="text" class="form-control" value="5920Z/9002Z">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <label class="form-label">Mentions légales</label>
                            <textarea class="form-control" rows="4" placeholder="Mentions légales de la structure"></textarea>
                        </div>
                        
                        <div class="mt-6">
                            <label class="form-label">TVA intracommunautaire</label>
                            <input type="text" class="form-control" placeholder="Numéro de TVA">
                        </div>
                        
                        <div class="mt-6 flex justify-end">
                            <button class="btn-primary">
                                <i class="fas fa-save mr-2"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="generaux" class="parametre-tab hidden">
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold mb-4">Paramètres généraux</h3>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="form-label">Fuseau horaire</label>
                                <select class="form-control">
                                    <option selected="">Europe/Paris (UTC+01:00)</option>
                                    <option>Europe/London (UTC+00:00)</option>
                                    <option>Europe/Berlin (UTC+01:00)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="form-label">Format de date</label>
                                <select class="form-control">
                                    <option selected="">JJ/MM/AAAA</option>
                                    <option>MM/JJ/AAAA</option>
                                    <option>AAAA-MM-JJ</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="form-label">Devise</label>
                                <select class="form-control">
                                    <option selected="">€ - Euro</option>
                                    <option>$ - Dollar américain</option>
                                    <option>£ - Livre sterling</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="form-label">Nombre d'éléments par page</label>
                                <select class="form-control">
                                    <option>10</option>
                                    <option selected="">25</option>
                                    <option>50</option>
                                    <option>100</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="autoSave" class="mr-2">
                                <label for="autoSave">Enregistrement automatique des formulaires</label>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end">
                            <button class="btn-primary">
                                <i class="fas fa-save mr-2"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="utilisateur" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet utilisateur -->
                </div>
                
                <div id="notifications" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet notifications -->
                </div>
                
                <div id="apparence" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet apparence -->
                </div>
                
                <div id="modeles" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet modèles de contrats -->
                </div>
                
                <div id="export" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet export et sauvegarde -->
                </div>
                
                <div id="sync" class="parametre-tab hidden">
                    <!-- Contenu pour l'onglet synchronisation -->
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2023 TourCraft - Logiciel de gestion pour l'industrie musicale - Version 1.0</p>
        </div>
    </div>

    <script>
        // Tab system functionality
        function showTab(tabId) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
            
            // Update sidebar links
            const sidebarLinks = document.querySelectorAll('.sidebar-link');
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Activate clicked sidebar link
            const activeLink = document.querySelector(`.sidebar-link[href="#${tabId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
        
        // Parametre tabs functionality
        function showParametreTab(tabId) {
            // Hide all parametre tab contents
            const parametreTabs = document.querySelectorAll('.parametre-tab');
            parametreTabs.forEach(tab => {
                tab.classList.remove('active');
                tab.classList.add('hidden');
            });
            
            // Show selected parametre tab content
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
                activeTab.classList.remove('hidden');
            }
            
            // Update tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Activate clicked tab button
            const activeButton = document.querySelector(`.tab-button[onclick="showParametreTab('${tabId}')"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }
    </script>


    <script id="html_badge_script1">
        window.__genspark_remove_badge_link = "https://www.genspark.ai/api/html_badge/" +
            "remove_badge?token=To%2FBnjzloZ3UfQdcSaYfDm6XsLC0sM26xPK%2F2BH6KJMlYJQeYjcQ8dc227jS91y6resn9NVghIigFNC1hjoPLqDCqUwLZ4euNnR%2BvuFkZz5E8ueOqhZETJ1ciEwpxQIm7gsJk8wWCLHjjgwyjzpb2qQAupvEO2OtRLlU3LjdlmTvTcWy%2B6Pmat3o%2BUnKu0M2Fswwdswmv2M9j8EhDFs2XPUXoSPnKy9IlIhXcYrdYwqAHRDdYFkhprWP9KFDpIRyb9qpYcx1o602LPLz589BLR44ZrMVvh4ZrqfiM5P3d5P4oV2%2FuIjYw3QxXfc80%2F7%2F95cfC7ATG6eD8vrghHmwV6s2CiodwjazPzwZJERiGiN7eseV5TshsEs0CkDsdgl7ZjXeZMGjg2mkhrfHeK3puYdOs6YJ6iiWGl8T6pQfn1GShZvFYCm2hsskt7KCkxv2n8s1KZ%2BLyxT%2Fpr59PDeEokrTnjVMO4zqOXr5TejDg3ewim%2BPPgi0%2Bw5yQW5a6s5eVDbAuvMB05OXpVHSEWHefw%3D%3D";
        window.__genspark_locale = "fr-FR";
        window.__genspark_token = "To/BnjzloZ3UfQdcSaYfDm6XsLC0sM26xPK/2BH6KJMlYJQeYjcQ8dc227jS91y6resn9NVghIigFNC1hjoPLqDCqUwLZ4euNnR+vuFkZz5E8ueOqhZETJ1ciEwpxQIm7gsJk8wWCLHjjgwyjzpb2qQAupvEO2OtRLlU3LjdlmTvTcWy+6Pmat3o+UnKu0M2Fswwdswmv2M9j8EhDFs2XPUXoSPnKy9IlIhXcYrdYwqAHRDdYFkhprWP9KFDpIRyb9qpYcx1o602LPLz589BLR44ZrMVvh4ZrqfiM5P3d5P4oV2/uIjYw3QxXfc80/7/95cfC7ATG6eD8vrghHmwV6s2CiodwjazPzwZJERiGiN7eseV5TshsEs0CkDsdgl7ZjXeZMGjg2mkhrfHeK3puYdOs6YJ6iiWGl8T6pQfn1GShZvFYCm2hsskt7KCkxv2n8s1KZ+LyxT/pr59PDeEokrTnjVMO4zqOXr5TejDg3ewim+PPgi0+w5yQW5a6s5eVDbAuvMB05OXpVHSEWHefw==";
    </script>
    
    <script id="html_notice_dialog_script" src="https://www.genspark.ai/notice_dialog.js"></script>
    </body></html>