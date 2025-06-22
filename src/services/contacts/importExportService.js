import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import structuresService from './structuresService';
import personnesService from './personnesService';
import liaisonsService from './liaisonsService';
import { validateImportRow } from '@/schemas/ContactRefactoredSchemas';

/**
 * Service d'import/export Excel compatible avec Bob Booking
 * Supporte le format standard avec 3 personnes par ligne de structure
 */
class ImportExportService {
  
  /**
   * Template de colonnes pour l'export/import Excel (compatible Bob Booking)
   */
  static EXCEL_COLUMNS = {
    // Structure
    raisonSociale: 'Raison Sociale',
    type: 'Type',
    adresse: 'Adresse',
    suiteAdresse: 'Complément d\'adresse',
    codePostal: 'Code Postal',
    ville: 'Ville',
    departement: 'Département',
    region: 'Région',
    pays: 'Pays',
    telephone1: 'Téléphone',
    telephone2: 'Téléphone 2',
    email: 'Email',
    siteWeb: 'Site Web',
    tags: 'Tags',
    isClient: 'Client',
    
    // Personne 1
    personne1Prenom: 'Personne 1 Prénom',
    personne1Nom: 'Personne 1 Nom',
    personne1Fonction: 'Personne 1 Fonction',
    personne1Email: 'Personne 1 Email',
    personne1Telephone: 'Personne 1 Téléphone',
    
    // Personne 2
    personne2Prenom: 'Personne 2 Prénom',
    personne2Nom: 'Personne 2 Nom',
    personne2Fonction: 'Personne 2 Fonction',
    personne2Email: 'Personne 2 Email',
    personne2Telephone: 'Personne 2 Téléphone',
    
    // Personne 3
    personne3Prenom: 'Personne 3 Prénom',
    personne3Nom: 'Personne 3 Nom',
    personne3Fonction: 'Personne 3 Fonction',
    personne3Email: 'Personne 3 Email',
    personne3Telephone: 'Personne 3 Téléphone'
  };

  /**
   * Créer un template Excel vierge pour l'import
   */
  static createImportTemplate() {
    const headers = Object.values(this.EXCEL_COLUMNS);
    
    // Données d'exemple
    const exampleData = [
      {
        'Raison Sociale': 'Festival de Jazz de Montreux',
        'Type': 'festival',
        'Adresse': 'Avenue Claude Nobs 5',
        'Code Postal': '1820',
        'Ville': 'Montreux',
        'Pays': 'Suisse',
        'Téléphone': '+41 21 966 44 44',
        'Email': 'info@montreuxjazzfestival.com',
        'Site Web': 'https://www.montreuxjazzfestival.com',
        'Tags': 'festival;jazz;international',
        'Client': 'Non',
        'Personne 1 Prénom': 'Claude',
        'Personne 1 Nom': 'Nobs',
        'Personne 1 Fonction': 'Directeur Artistique',
        'Personne 1 Email': 'claude.nobs@montreuxjazz.com',
        'Personne 1 Téléphone': '+41 21 966 44 45'
      },
      {
        'Raison Sociale': 'Théâtre National',
        'Type': 'salle',
        'Adresse': '2 rue de Richelieu',
        'Code Postal': '75001',
        'Ville': 'Paris',
        'Pays': 'France',
        'Téléphone': '01 44 58 15 15',
        'Email': 'contact@theatre-national.fr',
        'Tags': 'théâtre;national;paris',
        'Client': 'Oui',
        'Personne 1 Prénom': 'Marie',
        'Personne 1 Nom': 'Dubois',
        'Personne 1 Fonction': 'Directrice',
        'Personne 1 Email': 'marie.dubois@theatre-national.fr',
        'Personne 2 Prénom': 'Jean',
        'Personne 2 Nom': 'Martin',
        'Personne 2 Fonction': 'Programmateur',
        'Personne 2 Email': 'jean.martin@theatre-national.fr'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    
    // Ajouter une feuille d'instructions
    const instructions = [
      ['INSTRUCTIONS D\'IMPORT'],
      [''],
      ['1. Remplissez une ligne par structure'],
      ['2. Jusqu\'à 3 personnes par structure sur la même ligne'],
      ['3. Pour plus de 3 personnes, dupliquez la ligne structure'],
      ['4. Tags séparés par des points-virgules (ex: festival;rock;lyon)'],
      ['5. Client: Oui/Non ou true/false'],
      ['6. Champs obligatoires: Raison Sociale, Personne 1 Prénom/Nom/Email'],
      [''],
      ['PERSONNES LIBRES:'],
      ['- Laissez la Raison Sociale vide'],
      ['- Remplissez uniquement Personne 1'],
      [''],
      ['FORMATS:'],
      ['- Téléphone: 0123456789 ou +33123456789'],
      ['- Email: format standard'],
      ['- Code Postal: 5 chiffres'],
      [''],
      ['⚠️  Supprimez ces lignes d\'exemple avant l\'import !']
    ];
    
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    
    return wb;
  }

  /**
   * Télécharger le template Excel
   */
  static downloadTemplate() {
    const wb = this.createImportTemplate();
    const fileName = `template-import-contacts-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Parser un fichier Excel d'import
   */
  static async parseImportFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lire la première feuille
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir en JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          });
          
          if (jsonData.length < 2) {
            reject(new Error('Le fichier doit contenir au moins une ligne de données'));
            return;
          }
          
          // Récupérer les en-têtes
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          // Convertir en objets
          const parsedRows = rows.map((row, index) => {
            const rowObj = {};
            headers.forEach((header, colIndex) => {
              rowObj[header] = row[colIndex] || '';
            });
            rowObj._lineNumber = index + 2; // +2 car ligne 1 = headers
            return rowObj;
          });
          
          resolve({
            headers,
            rows: parsedRows,
            totalRows: parsedRows.length
          });
          
        } catch (error) {
          reject(new Error(`Erreur de lecture du fichier: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Valider une ligne d'import
   */
  static async validateImportRow(row) {
    try {
      // Mapper les colonnes vers le schéma
      const mappedRow = this.mapImportRowToSchema(row);
      
      // Valider avec Yup
      const validation = await validateImportRow(mappedRow);
      
      if (!validation.valid) {
        return {
          valid: false,
          errors: validation.errors,
          warnings: []
        };
      }
      
      // Validations métier supplémentaires
      const warnings = [];
      
      // Vérifier qu'il y a au moins une structure ou une personne
      if (!mappedRow.raisonSociale && !mappedRow.personne1Prenom) {
        return {
          valid: false,
          errors: [{ field: 'general', message: 'Ligne vide ou incomplète' }],
          warnings: []
        };
      }
      
      // Avertissement si email en doublon potentiel
      const emails = [
        mappedRow.personne1Email,
        mappedRow.personne2Email,
        mappedRow.personne3Email
      ].filter(Boolean);
      
      const uniqueEmails = new Set(emails);
      if (emails.length > uniqueEmails.size) {
        warnings.push({ field: 'emails', message: 'Emails en doublon sur la même ligne' });
      }
      
      return {
        valid: true,
        data: mappedRow,
        warnings
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [{ field: 'general', message: error.message }],
        warnings: []
      };
    }
  }

  /**
   * Mapper une ligne Excel vers le schéma d'import
   */
  static mapImportRowToSchema(row) {
    // Fonction helper pour nettoyer les valeurs
    const clean = (value) => {
      if (typeof value !== 'string') return value;
      return value.trim() || null;
    };
    
    // Convertir Client en booléen
    const parseClient = (value) => {
      if (!value) return false;
      const cleaned = value.toString().toLowerCase().trim();
      return cleaned === 'oui' || cleaned === 'true' || cleaned === '1';
    };
    
    return {
      // Structure
      raisonSociale: clean(row['Raison Sociale']),
      type: clean(row['Type']),
      adresse: clean(row['Adresse']),
      suiteAdresse: clean(row['Complément d\'adresse']),
      codePostal: clean(row['Code Postal']),
      ville: clean(row['Ville']),
      departement: clean(row['Département']),
      region: clean(row['Région']),
      pays: clean(row['Pays']) || 'France',
      telephone: clean(row['Téléphone']),
      telephone2: clean(row['Téléphone 2']),
      email: clean(row['Email']),
      siteWeb: clean(row['Site Web']),
      tags: clean(row['Tags']),
      isClient: parseClient(row['Client']),
      
      // Personne 1
      personne1Prenom: clean(row['Personne 1 Prénom']),
      personne1Nom: clean(row['Personne 1 Nom']),
      personne1Fonction: clean(row['Personne 1 Fonction']),
      personne1Email: clean(row['Personne 1 Email']),
      personne1Telephone: clean(row['Personne 1 Téléphone']),
      
      // Personne 2
      personne2Prenom: clean(row['Personne 2 Prénom']),
      personne2Nom: clean(row['Personne 2 Nom']),
      personne2Fonction: clean(row['Personne 2 Fonction']),
      personne2Email: clean(row['Personne 2 Email']),
      personne2Telephone: clean(row['Personne 2 Téléphone']),
      
      // Personne 3
      personne3Prenom: clean(row['Personne 3 Prénom']),
      personne3Nom: clean(row['Personne 3 Nom']),
      personne3Fonction: clean(row['Personne 3 Fonction']),
      personne3Email: clean(row['Personne 3 Email']),
      personne3Telephone: clean(row['Personne 3 Téléphone']),
      
      // Métadonnées
      _lineNumber: row._lineNumber
    };
  }

  /**
   * Importer des contacts depuis Excel
   */
  static async importContacts(file, organizationId, userId, options = {}) {
    const { dryRun = false, skipValidation = false } = options;
    
    try {
      // Parser le fichier
      console.log('📖 Lecture du fichier Excel...');
      const { rows } = await this.parseImportFile(file);
      
      const results = {
        totalRows: rows.length,
        processed: 0,
        created: {
          structures: 0,
          personnes: 0,
          liaisons: 0
        },
        updated: {
          structures: 0,
          personnes: 0
        },
        errors: [],
        warnings: [],
        duplicates: []
      };

      // Valider et traiter chaque ligne
      for (const row of rows) {
        try {
          console.log(`📋 Traitement ligne ${row._lineNumber}...`);
          
          // Validation
          if (!skipValidation) {
            const validation = await this.validateImportRow(row);
            if (!validation.valid) {
              results.errors.push({
                line: row._lineNumber,
                errors: validation.errors
              });
              continue;
            }
            
            if (validation.warnings.length > 0) {
              results.warnings.push({
                line: row._lineNumber,
                warnings: validation.warnings
              });
            }
          }
          
          const mappedRow = this.mapImportRowToSchema(row);
          
          if (!dryRun) {
            // Importer la ligne
            const lineResult = await this.importSingleRow(mappedRow, organizationId, userId);
            
            // Agréger les résultats
            if (lineResult.structure) {
              if (lineResult.structure.isNew) {
                results.created.structures++;
              } else {
                results.updated.structures++;
              }
            }
            
            lineResult.personnes.forEach(p => {
              if (p.isNew) {
                results.created.personnes++;
              } else {
                results.updated.personnes++;
              }
            });
            
            results.created.liaisons += lineResult.liaisons.length;
          }
          
          results.processed++;
          
        } catch (error) {
          results.errors.push({
            line: row._lineNumber,
            errors: [{ field: 'general', message: error.message }]
          });
        }
      }

      return results;
      
    } catch (error) {
      throw new Error(`Erreur d'import: ${error.message}`);
    }
  }

  /**
   * Importer une seule ligne
   */
  static async importSingleRow(row, organizationId, userId) {
    const result = {
      structure: null,
      personnes: [],
      liaisons: []
    };

    // Créer la structure si fournie
    let structureId = null;
    if (row.raisonSociale) {
      const structureData = {
        raisonSociale: row.raisonSociale,
        type: row.type,
        adresse: row.adresse,
        suiteAdresse: row.suiteAdresse,
        codePostal: row.codePostal,
        ville: row.ville,
        departement: row.departement,
        region: row.region,
        pays: row.pays,
        telephone1: row.telephone,
        telephone2: row.telephone2,
        email: row.email,
        siteWeb: row.siteWeb,
        tags: row.tags ? row.tags.split(';').map(t => t.trim()).filter(Boolean) : [],
        isClient: row.isClient
      };
      
      const structureResult = await structuresService.upsertStructure(
        structureData,
        organizationId,
        userId
      );
      
      if (structureResult.success) {
        structureId = structureResult.id;
        result.structure = {
          id: structureId,
          isNew: structureResult.isNew
        };
      }
    }

    // Créer les personnes (1 à 3)
    const personnes = [
      { prenom: row.personne1Prenom, nom: row.personne1Nom, fonction: row.personne1Fonction, email: row.personne1Email, telephone: row.personne1Telephone },
      { prenom: row.personne2Prenom, nom: row.personne2Nom, fonction: row.personne2Fonction, email: row.personne2Email, telephone: row.personne2Telephone },
      { prenom: row.personne3Prenom, nom: row.personne3Nom, fonction: row.personne3Fonction, email: row.personne3Email, telephone: row.personne3Telephone }
    ].filter(p => p.prenom && p.nom && p.email);

    for (let i = 0; i < personnes.length; i++) {
      const personneData = personnes[i];
      
      // Créer la personne
      const personneResult = await personnesService.upsertPersonne(
        personneData,
        organizationId,
        userId
      );
      
      if (personneResult.success) {
        result.personnes.push({
          id: personneResult.id,
          isNew: personneResult.isNew
        });
        
        // Créer la liaison si on a une structure
        if (structureId) {
          const liaisonResult = await liaisonsService.createLiaison({
            organizationId,
            structureId,
            personneId: personneResult.id,
            fonction: personneData.fonction || '',
            actif: true,
            prioritaire: i === 0, // Premier contact = prioritaire
            interesse: false
          }, userId);
          
          if (liaisonResult.success) {
            result.liaisons.push(liaisonResult.id);
          }
        } else {
          // Marquer comme personne libre
          await personnesService.setPersonneLibreStatus(personneResult.id, true, userId);
        }
      }
    }

    return result;
  }

  /**
   * Exporter les contacts vers Excel
   */
  static async exportContacts(organizationId, options = {}) {
    const { mode = 'structures', includeInactive = false } = options;
    
    try {
      if (mode === 'structures') {
        return this.exportByStructures(organizationId, includeInactive);
      } else {
        return this.exportByPersonnes(organizationId, includeInactive);
      }
    } catch (error) {
      throw new Error(`Erreur d'export: ${error.message}`);
    }
  }

  /**
   * Export par structures (une ligne par structure avec contact prioritaire)
   */
  static async exportByStructures(organizationId, includeInactive) {
    // TODO: Implémenter l'export par structures
    // Récupérer toutes les structures avec leurs contacts prioritaires
    throw new Error('Export par structures non encore implémenté');
  }

  /**
   * Export par personnes (une ligne par personne)
   */
  static async exportByPersonnes(organizationId, includeInactive) {
    // TODO: Implémenter l'export par personnes
    // Récupérer toutes les personnes avec leurs structures
    throw new Error('Export par personnes non encore implémenté');
  }
}

export default ImportExportService;