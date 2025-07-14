/**
 * Test pour vérifier la recherche par nom/raison sociale
 */

import { searchService } from '../services/searchService';

// Test unitaire pour la méthode handleContains
describe('SearchService - handleContains', () => {
  it('devrait retourner true pour une recherche partielle insensible à la casse', () => {
    const service = new searchService.constructor();
    
    // Test avec "mairie" dans "Mairie de Pomerol"
    expect(service.handleContains('Mairie de Pomerol', 'mairie')).toBe(true);
    expect(service.handleContains('MAIRIE DE POMEROL', 'mairie')).toBe(true);
    expect(service.handleContains('mairie de pomerol', 'MAIRIE')).toBe(true);
    
    // Test négatif
    expect(service.handleContains('Ville de Paris', 'mairie')).toBe(false);
  });
});

// Test unitaire pour la recherche combinée nom/raisonSociale
describe('SearchService - applyLocalFilters avec nom_ou_raisonSociale', () => {
  it('devrait trouver une structure par nom OU raison sociale', () => {
    const service = new searchService.constructor();
    
    const structures = [
      { id: '1', nom: 'Structure Test', raisonSociale: 'Mairie de Pomerol' },
      { id: '2', nom: 'Autre nom', raisonSociale: 'Ville de Paris' },
      { id: '3', nom: 'Mairie de Bordeaux', raisonSociale: 'Commune de Bordeaux' }
    ];
    
    const criteria = [{
      field: 'nom_ou_raisonSociale',
      operator: 'contient',
      value: 'mairie',
      fieldPath: 'nom_ou_raisonSociale',
      type: 'local'
    }];
    
    const results = service.applyLocalFilters(structures, criteria);
    
    // Devrait trouver les structures 1 et 3
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id)).toContain('1');
    expect(results.map(r => r.id)).toContain('3');
    expect(results.map(r => r.id)).not.toContain('2');
  });
});

// Exemple d'utilisation pour debug
console.log('Test de recherche "mairie" dans différents cas :');
const service = new searchService.constructor();

const testCases = [
  { nom: null, raisonSociale: 'Mairie de Pomerol' },
  { nom: 'Mairie de Bordeaux', raisonSociale: null },
  { nom: 'Contact', raisonSociale: 'Mairie de Paris' },
  { nom: 'Ville de Lyon', raisonSociale: 'Commune de Lyon' }
];

const criterion = {
  field: 'nom_ou_raisonSociale',
  operator: 'contient',
  value: 'mairie'
};

testCases.forEach((testCase, index) => {
  const nomMatch = testCase.nom ? service.handleContains(testCase.nom, 'mairie') : false;
  const raisonSocialeMatch = testCase.raisonSociale ? service.handleContains(testCase.raisonSociale, 'mairie') : false;
  const matches = nomMatch || raisonSocialeMatch;
  
  console.log(`Test ${index + 1}: nom="${testCase.nom}", raisonSociale="${testCase.raisonSociale}" => ${matches ? 'TROUVÉ' : 'NON TROUVÉ'}`);
});