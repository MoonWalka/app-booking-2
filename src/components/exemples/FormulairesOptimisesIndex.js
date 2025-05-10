/**
 * Index des composants exemples pour les formulaires optimisés
 * 
 * Ce composant présente tous les exemples disponibles des formulaires utilisant
 * les hooks optimisés directement basés sur useGenericEntityForm, conformément
 * au plan de dépréciation officiel (mai 2025).
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '@styles/index.css';

// Cards pour les différents exemples de formulaires
const ExampleCard = ({ title, description, link, tags, icon }) => {
  return (
    <div className="card example-card mb-4">
      <div className="card-header">
        <h3>
          <i className={`bi bi-${icon}`}></i> {title}
        </h3>
      </div>
      <div className="card-body">
        <p>{description}</p>
        <div className="tags mb-3">
          {tags.map((tag, index) => (
            <span key={index} className="badge badge-pill badge-info mr-2">{tag}</span>
          ))}
        </div>
        <Link to={link} className="btn btn-primary">
          Voir l'exemple
        </Link>
      </div>
    </div>
  );
};

/**
 * Composant d'index présentant tous les exemples de formulaires optimisés
 */
const FormulairesOptimisesIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Définition des exemples disponibles
  const exemples = [
    {
      id: 'concert',
      title: 'Formulaire de Concert Optimisé',
      description: 'Exemple d\'un formulaire de concert utilisant useConcertFormOptimized basé directement sur useGenericEntityForm avec gestion de dates, lieux et artistes.',
      link: '/exemples/formulaires/concert',
      tags: ['concert', 'formulaire', 'optimisé', 'dates', 'validation'],
      icon: 'calendar-event',
      category: 'evenement'
    },
    {
      id: 'artiste',
      title: 'Formulaire d\'Artiste Optimisé',
      description: 'Exemple d\'un formulaire d\'artiste utilisant useArtisteFormOptimized avec gestion des membres et des étapes multiples.',
      link: '/exemples/formulaires/artiste',
      tags: ['artiste', 'formulaire', 'optimisé', 'étapes', 'membres'],
      icon: 'music-note-beamed',
      category: 'personne'
    },
    {
      id: 'programmateur',
      title: 'Formulaire de Programmateur Optimisé',
      description: 'Exemple d\'un formulaire de programmateur utilisant useProgrammateurFormOptimized avec sections pliables et gestion des structures liées.',
      link: '/exemples/formulaires/programmateur',
      tags: ['programmateur', 'formulaire', 'optimisé', 'sections', 'structures'],
      icon: 'person-badge',
      category: 'personne'
    },
    {
      id: 'structure',
      title: 'Formulaire de Structure Optimisé',
      description: 'Exemple d\'un formulaire de structure utilisant useStructureFormOptimized avec validation SIRET et gestion des adresses.',
      link: '/exemples/formulaires/structure',
      tags: ['structure', 'formulaire', 'optimisé', 'validation', 'siret'],
      icon: 'building',
      category: 'organisation'
    }
  ];

  // Filtrer les exemples en fonction de la recherche et du filtre
  const filteredExamples = exemples.filter(exemple => {
    // Filtrer par catégorie
    if (filter !== 'all' && exemple.category !== filter) {
      return false;
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        exemple.title.toLowerCase().includes(searchLower) ||
        exemple.description.toLowerCase().includes(searchLower) ||
        exemple.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  return (
    <div className="container formulaires-optimises-index mt-4">
      <div className="jumbotron bg-light">
        <h1>Exemples de Formulaires Optimisés</h1>
        <p className="lead">
          Ces exemples montrent comment utiliser les hooks de formulaires optimisés qui sont directement
          basés sur <code>useGenericEntityForm</code>, conformément au plan de dépréciation officiel.
        </p>
        <div className="alert alert-info">
          <i className="bi bi-info-circle"></i> <strong>Note importante (mai 2025):</strong> Les hooks spécifiques originaux et leurs versions
          migrées V2 seront dépréciés d'ici novembre 2025. Il est fortement recommandé d'utiliser directement les
          versions optimisées présentées ici pour les nouveaux développements.
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="searchExamples">Rechercher des exemples</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="searchExamples"
                    placeholder="Rechercher par nom, description ou tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="filterCategory">Filtrer par catégorie</label>
                <select
                  className="form-control"
                  id="filterCategory"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="evenement">Événements</option>
                  <option value="personne">Personnes</option>
                  <option value="organisation">Organisations</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des exemples */}
      <div className="row">
        {filteredExamples.length > 0 ? (
          filteredExamples.map((exemple) => (
            <div key={exemple.id} className="col-lg-6">
              <ExampleCard {...exemple} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-warning">
              Aucun exemple ne correspond à votre recherche.
            </div>
          </div>
        )}
      </div>

      {/* Section d'aide et documentation */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Comment utiliser ces exemples</h3>
        </div>
        <div className="card-body">
          <p>
            Ces exemples sont destinés à servir de modèles pour l'implémentation de formulaires
            dans votre application. Ils démontrent les meilleures pratiques pour utiliser les hooks
            optimisés directement basés sur les hooks génériques.
          </p>
          
          <h5>Pour utiliser ces exemples :</h5>
          <ol>
            <li>Consultez l'exemple qui correspond à votre besoin</li>
            <li>Explorez le code source pour comprendre l'implémentation</li>
            <li>Copiez et adaptez les parties pertinentes à votre cas d'usage</li>
            <li>Référencez-vous à la documentation des hooks dans les commentaires de code</li>
          </ol>
          
          <h5>Avantages des hooks optimisés :</h5>
          <ul>
            <li>Utilisation directe des hooks génériques (sans wrappers)</li>
            <li>Meilleure maintenabilité à long terme</li>
            <li>Facilité d'extension et d'adaptation</li>
            <li>Validation et transformation des données intégrées</li>
            <li>Gestion des entités liées</li>
          </ul>
          
          <div className="text-center mt-4">
            <Link to="/docs/hooks/formulaires" className="btn btn-outline-primary">
              Consulter la documentation complète des hooks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulairesOptimisesIndex;