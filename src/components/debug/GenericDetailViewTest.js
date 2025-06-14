import React, { useState } from 'react';
import GenericDetailView from '@/components/common/GenericDetailView';
import RelationCard from '@/components/common/RelationCard';
import Card from '@/components/ui/Card';
import styles from './GenericDetailViewTest.module.css';

/**
 * Page de test pour visualiser GenericDetailView et RelationCard
 * Permet de voir à quoi ressembleraient ces composants une fois implémentés
 */
const GenericDetailViewTest = () => {
  const [selectedView, setSelectedView] = useState('demo');
  
  // Données de démonstration
  const demoContact = {
    id: 'contact-demo-1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '06 12 34 56 78',
    fonction: 'Directeur artistique',
    structure: {
      id: 'struct-1',
      nom: 'Festival des Arts',
      type: 'Festival'
    }
  };
  
  const demoLieu = {
    id: 'lieu-demo-1',
    nom: 'Salle Pleyel',
    ville: 'Paris',
    codePostal: '75008',
    type: 'Salle de concert',
    adresse: {
      rue: '252 rue du Faubourg Saint-Honoré',
      ville: 'Paris'
    }
  };
  
  const demoConcert = {
    id: 'concert-demo-1',
    titre: 'Concert de Printemps',
    date: '2025-03-15',
    heure: '20:30',
    lieu: demoLieu,
    statut: 'Confirmé'
  };
  
  const demoArtiste = {
    id: 'artiste-demo-1',
    nom: 'Les Harmoniques',
    style: 'Jazz Fusion',
    nombreMembres: 5
  };
  
  const demoStructure = {
    id: 'structure-demo-1',
    nom: 'Productions Culturelles XYZ',
    type: 'Association',
    siret: '123 456 789 00012'
  };

  return (
    <div className={styles.testContainer}>
      <Card className={styles.header}>
        <h1>Test Visual : GenericDetailView & RelationCard</h1>
        <p className={styles.description}>
          Cette page montre à quoi ressembleraient les composants génériques une fois implémentés.
          Ces composants permettraient de remplacer toutes les vues de détails spécifiques par une seule architecture modulaire.
        </p>
      </Card>

      {/* Sélecteur de démo */}
      <Card className={styles.selector}>
        <h2>Choisir une démo :</h2>
        <div className={styles.buttonGroup}>
          <button 
            className={selectedView === 'demo' ? styles.active : ''}
            onClick={() => setSelectedView('demo')}
          >
            RelationCard (Cartes)
          </button>
          <button 
            className={selectedView === 'contact' ? styles.active : ''}
            onClick={() => setSelectedView('contact')}
          >
            Contact avec GenericDetailView
          </button>
          <button 
            className={selectedView === 'lieu' ? styles.active : ''}
            onClick={() => setSelectedView('lieu')}
          >
            Lieu avec GenericDetailView
          </button>
          <button 
            className={selectedView === 'structure' ? styles.active : ''}
            onClick={() => setSelectedView('structure')}
          >
            Structure avec GenericDetailView
          </button>
        </div>
      </Card>

      {/* Affichage des démos */}
      {selectedView === 'demo' && (
        <Card className={styles.demoSection}>
          <h2>Exemples de RelationCard</h2>
          <p>Voici comment les différentes entités s'affichent avec RelationCard :</p>
          
          <div className={styles.cardsGrid}>
            <div className={styles.cardWrapper}>
              <h3>Contact</h3>
              <RelationCard 
                entity={demoContact}
                type="contact"
                onClick={() => alert('Clic sur contact')}
              />
            </div>
            
            <div className={styles.cardWrapper}>
              <h3>Lieu</h3>
              <RelationCard 
                entity={demoLieu}
                type="lieu"
                onClick={() => alert('Clic sur lieu')}
              />
            </div>
            
            <div className={styles.cardWrapper}>
              <h3>Concert</h3>
              <RelationCard 
                entity={demoConcert}
                type="concert"
                onClick={() => alert('Clic sur concert')}
              />
            </div>
            
            <div className={styles.cardWrapper}>
              <h3>Artiste</h3>
              <RelationCard 
                entity={demoArtiste}
                type="artiste"
                onClick={() => alert('Clic sur artiste')}
              />
            </div>
            
            <div className={styles.cardWrapper}>
              <h3>Structure</h3>
              <RelationCard 
                entity={demoStructure}
                type="structure"
                onClick={() => alert('Clic sur structure')}
              />
            </div>
            
            <div className={styles.cardWrapper}>
              <h3>Sans badge</h3>
              <RelationCard 
                entity={demoContact}
                type="contact"
                showBadge={false}
                onClick={() => alert('Clic sur contact sans badge')}
              />
            </div>
          </div>
        </Card>
      )}

      {selectedView === 'contact' && (
        <div className={styles.detailViewDemo}>
          <h2>Vue Contact avec GenericDetailView</h2>
          <p className={styles.note}>
            Note : GenericDetailView utilise normalement useSafeRelations pour charger les données.
            Cette démo simule l'affichage avec des sections personnalisées.
          </p>
          
          {/* Simulation de GenericDetailView pour un contact */}
          <div className={styles.mockDetailView}>
            <div className={styles.mockHeader}>
              <h1>Jean Dupont</h1>
              <div className={styles.headerActions}>
                <button className="btn btn-primary">Modifier</button>
                <button className="btn btn-danger">Supprimer</button>
              </div>
            </div>
            
            <div className={styles.sections}>
              <Card>
                <h3><i className="bi bi-person-vcard"></i> Informations générales</h3>
                <div className={styles.infoGrid}>
                  <div><strong>Nom :</strong> Dupont</div>
                  <div><strong>Prénom :</strong> Jean</div>
                  <div><strong>Email :</strong> jean.dupont@example.com</div>
                  <div><strong>Téléphone :</strong> 06 12 34 56 78</div>
                  <div><strong>Fonction :</strong> Directeur artistique</div>
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-building"></i> Structure associée</h3>
                <RelationCard 
                  entity={demoContact.structure}
                  type="structure"
                />
              </Card>
              
              <Card>
                <h3><i className="bi bi-geo-alt"></i> Lieux associés (2)</h3>
                <div className={styles.relationsList}>
                  <RelationCard entity={demoLieu} type="lieu" />
                  <RelationCard 
                    entity={{...demoLieu, id: 'lieu-2', nom: 'Olympia', ville: 'Paris'}} 
                    type="lieu" 
                  />
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-calendar-event"></i> Concerts associés (1)</h3>
                <RelationCard entity={demoConcert} type="concert" />
              </Card>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'lieu' && (
        <div className={styles.detailViewDemo}>
          <h2>Vue Lieu avec GenericDetailView</h2>
          
          <div className={styles.mockDetailView}>
            <div className={styles.mockHeader}>
              <h1>Salle Pleyel</h1>
              <div className={styles.headerActions}>
                <button className="btn btn-primary">Modifier</button>
                <button className="btn btn-danger">Supprimer</button>
              </div>
            </div>
            
            <div className={styles.sections}>
              <Card>
                <h3><i className="bi bi-geo-alt"></i> Informations du lieu</h3>
                <div className={styles.infoGrid}>
                  <div><strong>Nom :</strong> Salle Pleyel</div>
                  <div><strong>Type :</strong> Salle de concert</div>
                  <div><strong>Adresse :</strong> 252 rue du Faubourg Saint-Honoré</div>
                  <div><strong>Ville :</strong> Paris</div>
                  <div><strong>Code postal :</strong> 75008</div>
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-person"></i> Contacts associés (2)</h3>
                <div className={styles.relationsList}>
                  <RelationCard entity={demoContact} type="contact" />
                  <RelationCard 
                    entity={{...demoContact, id: 'contact-2', nom: 'Martin', prenom: 'Sophie'}} 
                    type="contact" 
                  />
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-calendar-event"></i> Concerts programmés (3)</h3>
                <div className={styles.relationsList}>
                  <RelationCard entity={demoConcert} type="concert" />
                  <RelationCard 
                    entity={{...demoConcert, id: 'concert-2', titre: 'Festival d\'été', date: '2025-07-20'}} 
                    type="concert" 
                  />
                  <RelationCard 
                    entity={{...demoConcert, id: 'concert-3', titre: 'Soirée Jazz', date: '2025-09-10'}} 
                    type="concert" 
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'structure' && (
        <div className={styles.detailViewDemo}>
          <h2>Vue Structure avec GenericDetailView</h2>
          
          <div className={styles.mockDetailView}>
            <div className={styles.mockHeader}>
              <h1>Productions Culturelles XYZ</h1>
              <div className={styles.headerActions}>
                <button className="btn btn-primary">Modifier</button>
                <button className="btn btn-danger">Supprimer</button>
              </div>
            </div>
            
            <div className={styles.sections}>
              <Card>
                <h3><i className="bi bi-building"></i> Informations de la structure</h3>
                <div className={styles.infoGrid}>
                  <div><strong>Nom :</strong> Productions Culturelles XYZ</div>
                  <div><strong>Type :</strong> Association</div>
                  <div><strong>SIRET :</strong> 123 456 789 00012</div>
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-person"></i> Contacts de la structure (3)</h3>
                <div className={styles.relationsList}>
                  <RelationCard entity={demoContact} type="contact" />
                  <RelationCard 
                    entity={{...demoContact, id: 'contact-2', nom: 'Martin', prenom: 'Sophie', fonction: 'Chargée de production'}} 
                    type="contact" 
                  />
                  <RelationCard 
                    entity={{...demoContact, id: 'contact-3', nom: 'Durand', prenom: 'Pierre', fonction: 'Comptable'}} 
                    type="contact" 
                  />
                </div>
              </Card>
              
              <Card>
                <h3><i className="bi bi-geo-alt"></i> Lieux partenaires (1)</h3>
                <RelationCard entity={demoLieu} type="lieu" />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Explications */}
      <Card className={styles.explanations}>
        <h2>💡 Avantages de cette approche</h2>
        <ul>
          <li><strong>Cohérence visuelle</strong> : Toutes les entités s'affichent de la même manière</li>
          <li><strong>Maintenance centralisée</strong> : Un seul composant à maintenir au lieu de 5+</li>
          <li><strong>Extensibilité</strong> : Ajouter un nouveau type d'entité est trivial</li>
          <li><strong>Performance</strong> : Évite les boucles infinies avec useSafeRelations</li>
          <li><strong>Configuration</strong> : Tout est piloté par entityConfigurations.js</li>
        </ul>
        
        <h3>🔧 Comment ça marche ?</h3>
        <p>
          <code>GenericDetailView</code> lit la configuration de l'entité et génère automatiquement :
        </p>
        <ul>
          <li>Le header avec les actions</li>
          <li>Les sections d'informations</li>
          <li>Les relations avec d'autres entités (via RelationCard)</li>
          <li>La navigation et les interactions</li>
        </ul>
        
        <p>
          <code>RelationCard</code> est utilisé pour afficher chaque entité liée de manière uniforme,
          avec navigation automatique au clic.
        </p>
      </Card>
    </div>
  );
};

export default GenericDetailViewTest;