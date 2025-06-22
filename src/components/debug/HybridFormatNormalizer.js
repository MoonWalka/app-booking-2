import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Outil de normalisation des formats hybrides vers le format nested unique
 * Résout le problème des fallbacks multiples (contact.structure?.raisonSociale || contact.structureRaisonSociale)
 */
const HybridFormatNormalizer = () => {
  const { currentOrganization } = useOrganization();
  const [analyzing, setAnalyzing] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [migrationLog, setMigrationLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLog(prev => [...prev, { timestamp, message, type }]);
    console.log(`[HybridNormalizer ${type}] ${message}`);
  };

  // Analyser les formats hybrides dans contacts_unified
  const analyzeHybridFormats = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setMigrationLog([]);

    try {
      addLog('🔍 Analyse des formats hybrides dans contacts_unified');
      
      const snapshot = await getDocs(collection(db, 'contacts_unified'));
      addLog(`📊 ${snapshot.size} document(s) à analyser`);

      const analysis = {
        total: 0,
        alreadyNested: 0,
        needsNesting: 0,
        hybridConflict: 0,
        noData: 0,
        details: []
      };

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docId = docSnap.id;
        analysis.total++;

        // Détecter le format hybride
        const hybridStatus = detectHybridFormat(data);
        const entityName = getEntityDisplayName(data);

        const detail = {
          id: docId,
          entityName,
          entityType: data.entityType || 'unknown',
          status: hybridStatus,
          issues: []
        };

        // Analyser les problèmes spécifiques
        if (hybridStatus === 'hybrid-conflict') {
          detail.issues = findConflicts(data);
          analysis.hybridConflict++;
        } else if (hybridStatus === 'needs-nesting') {
          detail.issues = findFlatFields(data);
          analysis.needsNesting++;
        } else if (hybridStatus === 'already-nested') {
          analysis.alreadyNested++;
        } else {
          analysis.noData++;
        }

        if (hybridStatus !== 'already-nested' && hybridStatus !== 'no-data') {
          analysis.details.push(detail);
        }
      });

      addLog(`✅ Analyse terminée : ${analysis.hybridConflict} conflits, ${analysis.needsNesting} à normaliser, ${analysis.alreadyNested} déjà corrects`);
      setAnalysis(analysis);

    } catch (err) {
      console.error('❌ Erreur analyse:', err);
      addLog(`❌ Erreur: ${err.message}`, 'error');
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Détecter le format hybride d'un document
  const detectHybridFormat = (data) => {
    // Vérifier les champs structure
    const structureRootFields = [
      'structureRaisonSociale', 'structureEmail', 'structureTelephone1', 
      'structureAdresse', 'structureVille', 'structureCodePostal'
    ];
    const personneRootFields = [
      'prenom', 'nom', 'mailDirect', 'telDirect', 'mobile', 'fonction'
    ];

    const hasStructureRoot = structureRootFields.some(field => data[field]);
    const hasStructureNested = data.structure && Object.keys(data.structure).length > 0;
    const hasPersonneRoot = personneRootFields.some(field => data[field]);
    const hasPersonneNested = data.personne && Object.keys(data.personne).length > 0;

    // Détecter les conflits (les deux formats présents)
    if ((hasStructureRoot && hasStructureNested) || (hasPersonneRoot && hasPersonneNested)) {
      return 'hybrid-conflict';
    }

    // Détecter les champs à la racine qui devraient être nested
    if (hasStructureRoot || hasPersonneRoot) {
      return 'needs-nesting';
    }

    // Déjà au bon format
    if (hasStructureNested || hasPersonneNested) {
      return 'already-nested';
    }

    return 'no-data';
  };

  // Trouver les conflits entre formats
  const findConflicts = (data) => {
    const conflicts = [];

    // Conflits structure
    if (data.structureRaisonSociale && data.structure?.raisonSociale) {
      if (data.structureRaisonSociale !== data.structure.raisonSociale) {
        conflicts.push(`structureRaisonSociale: "${data.structureRaisonSociale}" ≠ structure.raisonSociale: "${data.structure.raisonSociale}"`);
      }
    }
    if (data.structureEmail && data.structure?.email) {
      if (data.structureEmail !== data.structure.email) {
        conflicts.push(`structureEmail: "${data.structureEmail}" ≠ structure.email: "${data.structure.email}"`);
      }
    }

    // Conflits personne
    if (data.prenom && data.personne?.prenom) {
      if (data.prenom !== data.personne.prenom) {
        conflicts.push(`prenom: "${data.prenom}" ≠ personne.prenom: "${data.personne.prenom}"`);
      }
    }

    return conflicts;
  };

  // Trouver les champs à la racine
  const findFlatFields = (data) => {
    const flatFields = [];
    
    const structureFields = [
      'structureRaisonSociale', 'structureEmail', 'structureTelephone1',
      'structureAdresse', 'structureVille', 'structureCodePostal'
    ];
    const personneFields = ['prenom', 'nom', 'mailDirect', 'telDirect', 'fonction'];

    structureFields.forEach(field => {
      if (data[field]) flatFields.push(field);
    });
    personneFields.forEach(field => {
      if (data[field]) flatFields.push(field);
    });

    return flatFields;
  };

  // Obtenir le nom d'affichage de l'entité
  const getEntityDisplayName = (data) => {
    if (data.structure?.raisonSociale || data.structureRaisonSociale) {
      return data.structure?.raisonSociale || data.structureRaisonSociale;
    }
    if (data.personne?.prenom || data.prenom) {
      const prenom = data.personne?.prenom || data.prenom || '';
      const nom = data.personne?.nom || data.nom || '';
      return `${prenom} ${nom}`.trim();
    }
    return 'Entité sans nom';
  };

  // Normaliser vers le format nested
  const normalizeToNested = async () => {
    if (!analysis || analysis.details.length === 0) {
      addLog('❌ Aucune donnée à normaliser', 'error');
      return;
    }

    setNormalizing(true);
    setResults(null);

    try {
      addLog('🔄 Début de la normalisation vers le format nested');
      const normalizedDocs = [];

      for (const detail of analysis.details) {
        const docRef = doc(db, 'contacts_unified', detail.id);
        const snapshot = await getDocs(collection(db, 'contacts_unified'));
        const docSnap = snapshot.docs.find(d => d.id === detail.id);
        
        if (!docSnap) {
          addLog(`❌ Document ${detail.id} non trouvé`, 'error');
          continue;
        }

        const data = docSnap.data();
        addLog(`🔄 Normalisation de: ${detail.entityName}`);

        // Construire la version normalisée
        const normalized = await buildNormalizedDocument(data);

        // Appliquer la normalisation
        await updateDoc(docRef, normalized);

        normalizedDocs.push({
          id: detail.id,
          entityName: detail.entityName,
          status: detail.status,
          normalized: true
        });

        addLog(`✅ Normalisé: ${detail.entityName}`, 'success');
      }

      addLog(`🎉 Normalisation terminée ! ${normalizedDocs.length} document(s) normalisé(s)`, 'success');
      setResults(normalizedDocs);

    } catch (err) {
      console.error('❌ Erreur normalisation:', err);
      addLog(`❌ Erreur: ${err.message}`, 'error');
      setError(err.message);
    } finally {
      setNormalizing(false);
    }
  };

  // Construire le document normalisé
  const buildNormalizedDocument = async (data) => {
    const normalized = { ...data };

    // Normaliser les champs structure
    if (data.structureRaisonSociale || data.structureEmail || data.structureAdresse) {
      normalized.structure = {
        raisonSociale: data.structureRaisonSociale || data.structure?.raisonSociale || '',
        nom: data.structureNom || data.structure?.nom || '',
        email: data.structureEmail || data.structure?.email || '',
        telephone1: data.structureTelephone1 || data.structure?.telephone1 || '',
        telephone2: data.structureTelephone2 || data.structure?.telephone2 || '',
        mobile: data.structureMobile || data.structure?.mobile || '',
        fax: data.structureFax || data.structure?.fax || '',
        siteWeb: data.structureSiteWeb || data.structure?.siteWeb || '',
        siret: data.structureSiret || data.structure?.siret || '',
        type: data.structureType || data.structure?.type || '',
        adresse: data.structureAdresse || data.structure?.adresse || '',
        suiteAdresse: data.structureSuiteAdresse1 || data.structure?.suiteAdresse || '',
        codePostal: data.structureCodePostal || data.structure?.codePostal || '',
        ville: data.structureVille || data.structure?.ville || '',
        departement: data.structureDepartement || data.structure?.departement || '',
        region: data.structureRegion || data.structure?.region || '',
        pays: data.structurePays || data.structure?.pays || 'France'
      };

      // Supprimer les anciens champs racine structure
      delete normalized.structureRaisonSociale;
      delete normalized.structureNom;
      delete normalized.structureEmail;
      delete normalized.structureTelephone1;
      delete normalized.structureTelephone2;
      delete normalized.structureMobile;
      delete normalized.structureFax;
      delete normalized.structureSiteWeb;
      delete normalized.structureSiret;
      delete normalized.structureType;
      delete normalized.structureAdresse;
      delete normalized.structureSuiteAdresse1;
      delete normalized.structureCodePostal;
      delete normalized.structureVille;
      delete normalized.structureDepartement;
      delete normalized.structureRegion;
      delete normalized.structurePays;
    }

    // Normaliser les champs personne
    if (data.prenom || data.nom || data.mailDirect) {
      normalized.personne = {
        prenom: data.prenom || data.personne?.prenom || '',
        nom: data.nom || data.personne?.nom || '',
        fonction: data.fonction || data.personne?.fonction || '',
        civilite: data.civilite || data.personne?.civilite || '',
        email: data.mailDirect || data.email || data.personne?.email || '',
        mailDirect: data.mailDirect || data.personne?.mailDirect || '',
        mailPerso: data.mailPerso || data.personne?.mailPerso || '',
        telephone: data.telDirect || data.telephone || data.personne?.telephone || '',
        telDirect: data.telDirect || data.personne?.telDirect || '',
        telPerso: data.telPerso || data.personne?.telPerso || '',
        mobile: data.mobile || data.personne?.mobile || '',
        fax: data.fax || data.personne?.fax || '',
        adresse: data.adresse || data.personne?.adresse || '',
        suiteAdresse: data.suiteAdresse || data.personne?.suiteAdresse || '',
        codePostal: data.codePostal || data.personne?.codePostal || '',
        ville: data.ville || data.personne?.ville || '',
        departement: data.departement || data.personne?.departement || '',
        region: data.region || data.personne?.region || '',
        pays: data.pays || data.personne?.pays || 'France'
      };

      // Supprimer les anciens champs racine personne
      delete normalized.prenom;
      delete normalized.nom;
      delete normalized.fonction;
      delete normalized.civilite;
      delete normalized.email;
      delete normalized.mailDirect;
      delete normalized.mailPerso;
      delete normalized.telephone;
      delete normalized.telDirect;
      delete normalized.telPerso;
      delete normalized.mobile;
      delete normalized.fax;
      delete normalized.adresse;
      delete normalized.suiteAdresse;
      delete normalized.codePostal;
      delete normalized.ville;
      delete normalized.departement;
      delete normalized.region;
      delete normalized.pays;
    }

    // Ajouter les métadonnées de normalisation
    normalized.normalizedVersion = 'nested-v1';
    normalized.normalizedAt = new Date();
    normalized.updatedAt = new Date();

    return normalized;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <h2>🔧 Normalisation des formats hybrides</h2>
          <p>
            Cet outil normalise les contacts vers le format nested unique pour éliminer 
            les fallbacks multiples et simplifier le code.
          </p>
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
            <strong>Objectif :</strong> Centraliser toutes les données dans les objets <code>structure</code> et <code>personne</code>
            <br/>
            <strong>Avant :</strong> <code>contact.structure?.raisonSociale || contact.structureRaisonSociale</code>
            <br/>
            <strong>Après :</strong> <code>contact.structure.raisonSociale</code>
          </div>
        </div>

        {currentOrganization?.id && (
          <p><strong>Organisation:</strong> {currentOrganization.name} (ID: {currentOrganization.id})</p>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Button 
            onClick={analyzeHybridFormats} 
            disabled={analyzing}
            variant="secondary"
          >
            {analyzing ? 'Analyse en cours...' : '🔍 Analyser les formats'}
          </Button>

          <Button 
            onClick={normalizeToNested} 
            disabled={normalizing || !analysis}
            variant="primary"
          >
            {normalizing ? 'Normalisation en cours...' : '🔧 Normaliser vers nested'}
          </Button>
        </div>

        {error && (
          <Alert type="error" style={{ marginBottom: '20px' }}>
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        {/* Résultats d'analyse */}
        {analysis && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📊 Résultats d'analyse</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
              <div style={{ padding: '10px', background: '#e9ecef', borderRadius: '5px', textAlign: 'center' }}>
                <strong>{analysis.total}</strong><br/>Total
              </div>
              <div style={{ padding: '10px', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                <strong>{analysis.alreadyNested}</strong><br/>Déjà corrects
              </div>
              <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '5px', textAlign: 'center' }}>
                <strong>{analysis.needsNesting}</strong><br/>À normaliser
              </div>
              <div style={{ padding: '10px', background: '#f8d7da', borderRadius: '5px', textAlign: 'center' }}>
                <strong>{analysis.hybridConflict}</strong><br/>Conflits hybrides
              </div>
            </div>

            {analysis.details.length > 0 && (
              <div>
                <h4>📋 Détails des problèmes détectés</h4>
                {analysis.details.slice(0, 10).map((detail, index) => (
                  <div key={index} style={{ 
                    marginBottom: '10px', 
                    padding: '10px', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '5px',
                    background: detail.status === 'hybrid-conflict' ? '#f8d7da' : '#fff3cd'
                  }}>
                    <strong>{detail.entityName}</strong> ({detail.entityType})
                    <br/>
                    <small>Status: {detail.status}</small>
                    {detail.issues.length > 0 && (
                      <div style={{ marginTop: '5px', fontSize: '12px' }}>
                        {detail.issues.slice(0, 3).map((issue, i) => (
                          <div key={i}>• {issue}</div>
                        ))}
                        {detail.issues.length > 3 && <div>... et {detail.issues.length - 3} autres</div>}
                      </div>
                    )}
                  </div>
                ))}
                {analysis.details.length > 10 && (
                  <p>... et {analysis.details.length - 10} autres problèmes</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Log de migration */}
        {migrationLog.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📋 Journal des opérations</h3>
            <div style={{ 
              background: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '5px', 
              padding: '15px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {migrationLog.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '3px',
                  color: log.type === 'error' ? '#dc3545' : 
                        log.type === 'warning' ? '#fd7e14' : 
                        log.type === 'success' ? '#28a745' : '#6c757d'
                }}>
                  <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats de normalisation */}
        {results && results.length > 0 && (
          <div>
            <h3>✅ Résultats de normalisation ({results.length} document(s))</h3>
            {results.map((result, index) => (
              <div key={index} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: '1px solid #28a745', 
                borderRadius: '5px',
                background: '#f8fff9'
              }}>
                <strong>{result.entityName}</strong>
                <br/>
                <small>✅ Normalisé vers le format nested</small>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
          <h4>ℹ️ Impact de la normalisation</h4>
          <ul>
            <li><strong>Code simplifié</strong> : Plus de fallbacks <code>||</code> partout</li>
            <li><strong>Requêtes possibles</strong> : Index Firestore sur <code>structure.raisonSociale</code></li>
            <li><strong>Cohérence garantie</strong> : Une seule source de vérité par champ</li>
            <li><strong>Performance améliorée</strong> : Fin des vérifications multiples</li>
            <li><strong>Maintenance facilitée</strong> : Structure claire et prévisible</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default HybridFormatNormalizer;