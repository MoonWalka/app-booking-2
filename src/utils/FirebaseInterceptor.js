/**
 * INTERCEPTEUR FIREBASE - MONITORING EN TEMPS RÉEL
 * 
 * Ce module intercepte TOUTES les opérations Firebase pour :
 * 1. Valider automatiquement la présence d'organizationId
 * 2. Logger les opérations problématiques
 * 3. Bloquer les opérations dangereuses en mode strict
 * 4. Générer des alertes pour le debugging
 */

import { useOrganization } from '@/context/OrganizationContext';

class FirebaseInterceptor {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.strictMode = false; // Si true, bloque les opérations problématiques
    this.operations = [];
    this.violations = [];
    this.startTime = Date.now();
    
    this.install();
  }

  install() {
    if (!this.isEnabled) return;
    
    console.log('🔒 Firebase Interceptor activé');
    
    // Intercepter les imports Firebase
    this.interceptFirebaseImports();
    
    // Installer les listeners globaux
    this.installGlobalListeners();
  }

  interceptFirebaseImports() {
    // Wrapper pour addDoc
    const originalAddDoc = window.addDoc;
    if (originalAddDoc) {
      window.addDoc = (collectionRef, data) => {
        this.validateCreateOperation('addDoc', collectionRef, data);
        return originalAddDoc(collectionRef, data);
      };
    }

    // Wrapper pour setDoc
    const originalSetDoc = window.setDoc;
    if (originalSetDoc) {
      window.setDoc = (docRef, data, options) => {
        this.validateCreateOperation('setDoc', docRef, data);
        return originalSetDoc(docRef, data, options);
      };
    }

    // Wrapper pour updateDoc
    const originalUpdateDoc = window.updateDoc;
    if (originalUpdateDoc) {
      window.updateDoc = (docRef, data) => {
        this.validateUpdateOperation('updateDoc', docRef, data);
        return originalUpdateDoc(docRef, data);
      };
    }

    // Wrapper pour getDocs
    const originalGetDocs = window.getDocs;
    if (originalGetDocs) {
      window.getDocs = (query) => {
        this.validateReadOperation('getDocs', query);
        return originalGetDocs(query);
      };
    }
  }

  validateCreateOperation(operation, ref, data) {
    const violation = {
      type: 'CREATE_OPERATION',
      operation,
      timestamp: Date.now(),
      path: this.extractPath(ref),
      data: this.sanitizeData(data),
      issues: []
    };

    // Vérifier la présence d'organizationId
    if (!data || !data.organizationId) {
      violation.issues.push({
        severity: 'CRITICAL',
        code: 'MISSING_ORGANIZATION_ID',
        message: 'Opération de création sans organizationId',
        recommendation: 'Ajouter organizationId aux données avant création'
      });
    }

    // Vérifier les collections sensibles
    const sensitiveCollections = ['contacts', 'lieux', 'concerts', 'structures'];
    const collectionName = this.extractCollectionName(ref);
    
    if (sensitiveCollections.includes(collectionName) && !data?.organizationId) {
      violation.issues.push({
        severity: 'CRITICAL',
        code: 'SENSITIVE_COLLECTION_WITHOUT_ORG_ID',
        message: `Création dans ${collectionName} sans organizationId`,
        recommendation: `Toujours ajouter organizationId pour ${collectionName}`
      });
    }

    this.logViolation(violation);
  }

  validateUpdateOperation(operation, ref, data) {
    const violation = {
      type: 'UPDATE_OPERATION',
      operation,
      timestamp: Date.now(),
      path: this.extractPath(ref),
      data: this.sanitizeData(data),
      issues: []
    };

    // Avertir si on modifie organizationId
    if (data?.organizationId) {
      violation.issues.push({
        severity: 'HIGH',
        code: 'ORGANIZATION_ID_MODIFICATION',
        message: 'Modification de organizationId détectée',
        recommendation: 'Vérifier que cette modification est intentionnelle'
      });
    }

    if (violation.issues.length > 0) {
      this.logViolation(violation);
    }
  }

  validateReadOperation(operation, query) {
    const violation = {
      type: 'READ_OPERATION',
      operation,
      timestamp: Date.now(),
      query: this.extractQueryInfo(query),
      issues: []
    };

    // Vérifier si la query a un filtre organizationId
    const hasOrgFilter = this.queryHasOrganizationFilter(query);
    
    if (!hasOrgFilter) {
      const collectionName = this.extractCollectionFromQuery(query);
      const sensitiveCollections = ['contacts', 'lieux', 'concerts', 'structures'];
      
      if (sensitiveCollections.includes(collectionName)) {
        violation.issues.push({
          severity: 'CRITICAL',
          code: 'READ_WITHOUT_ORG_FILTER',
          message: `Lecture de ${collectionName} sans filtre organizationId`,
          recommendation: `Ajouter where('organizationId', '==', currentOrganization.id)`
        });
      }
    }

    if (violation.issues.length > 0) {
      this.logViolation(violation);
    }
  }

  logViolation(violation) {
    this.violations.push(violation);
    
    // Logger selon la sévérité
    const criticalIssues = violation.issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = violation.issues.filter(i => i.severity === 'HIGH');
    
    if (criticalIssues.length > 0) {
      console.error('🚨 VIOLATION CRITIQUE Firebase:', violation);
      
      if (this.strictMode) {
        throw new Error(`Opération Firebase bloquée: ${criticalIssues[0].message}`);
      }
    } else if (highIssues.length > 0) {
      console.warn('⚠️ Avertissement Firebase:', violation);
    }

    // Afficher dans l'interface de debug
    this.updateDebugUI();
  }

  // Extraction d'informations
  extractPath(ref) {
    try {
      return ref?.path || ref?._path?.segments?.join('/') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  extractCollectionName(ref) {
    try {
      const path = this.extractPath(ref);
      return path.split('/')[0];
    } catch {
      return 'unknown';
    }
  }

  extractQueryInfo(query) {
    try {
      return {
        collection: this.extractCollectionFromQuery(query),
        constraints: query?._query?.filters?.length || 0
      };
    } catch {
      return { collection: 'unknown', constraints: 0 };
    }
  }

  extractCollectionFromQuery(query) {
    try {
      return query?._query?.path?.segments?.[0] || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  queryHasOrganizationFilter(query) {
    try {
      const filters = query?._query?.filters || [];
      return filters.some(filter => 
        filter?.field?.segments?.includes('organizationId') ||
        filter?.field?.segments?.[0] === 'organizationId'
      );
    } catch {
      return false;
    }
  }

  sanitizeData(data) {
    if (!data) return null;
    
    // Limiter la taille pour les logs
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    });
    
    return sanitized;
  }

  // Interface de debug
  updateDebugUI() {
    if (typeof window !== 'undefined') {
      window.firebaseViolations = this.violations;
      
      // Créer un badge de statut
      this.createStatusBadge();
    }
  }

  createStatusBadge() {
    if (typeof document === 'undefined') return;
    
    let badge = document.getElementById('firebase-interceptor-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'firebase-interceptor-badge';
      badge.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        padding: 8px 12px;
        border-radius: 4px;
        color: white;
        font-family: monospace;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(badge);
      
      badge.addEventListener('click', () => {
        this.showDetailedReport();
      });
    }
    
    const criticalCount = this.violations.filter(v => 
      v.issues.some(i => i.severity === 'CRITICAL')
    ).length;
    
    if (criticalCount > 0) {
      badge.style.backgroundColor = '#dc3545';
      badge.textContent = `🚨 ${criticalCount} violations critiques`;
    } else {
      badge.style.backgroundColor = '#28a745';
      badge.textContent = `✅ Firebase sécurisé`;
    }
  }

  showDetailedReport() {
    const report = this.generateReport();
    console.group('📊 RAPPORT FIREBASE INTERCEPTOR');
    console.log('Violations détectées:', report);
    console.groupEnd();
    
    // Afficher une modal si possible
    if (typeof window !== 'undefined' && window.confirm) {
      const message = `
RAPPORT FIREBASE INTERCEPTOR

Violations critiques: ${report.critical}
Avertissements: ${report.warnings}
Total opérations: ${report.totalOperations}

Voir la console pour les détails.
      `;
      window.alert(message.trim());
    }
  }

  generateReport() {
    const critical = this.violations.filter(v => 
      v.issues.some(i => i.severity === 'CRITICAL')
    ).length;
    
    const warnings = this.violations.filter(v => 
      v.issues.some(i => i.severity === 'HIGH')
    ).length;
    
    return {
      critical,
      warnings,
      totalOperations: this.operations.length,
      violations: this.violations,
      uptime: Date.now() - this.startTime
    };
  }

  installGlobalListeners() {
    // Écouter les erreurs globales
    window.addEventListener('error', (event) => {
      if (event.message?.includes('firebase') || event.message?.includes('firestore')) {
        this.violations.push({
          type: 'RUNTIME_ERROR',
          timestamp: Date.now(),
          error: event.message,
          issues: [{
            severity: 'HIGH',
            code: 'FIREBASE_RUNTIME_ERROR',
            message: 'Erreur Firebase détectée',
            recommendation: 'Vérifier la configuration et les opérations'
          }]
        });
        this.updateDebugUI();
      }
    });
  }

  // API publique
  enableStrictMode() {
    this.strictMode = true;
    console.warn('🔒 Mode strict Firebase activé - les violations critiques bloqueront les opérations');
  }

  getViolations() {
    return this.violations;
  }

  getCriticalViolations() {
    return this.violations.filter(v => 
      v.issues.some(i => i.severity === 'CRITICAL')
    );
  }

  clearViolations() {
    this.violations = [];
    this.updateDebugUI();
  }
}

// Singleton
let interceptorInstance = null;

export function initializeFirebaseInterceptor() {
  if (!interceptorInstance && typeof window !== 'undefined') {
    interceptorInstance = new FirebaseInterceptor();
    
    // Exposer l'API globalement en développement
    if (process.env.NODE_ENV === 'development') {
      window.firebaseInterceptor = interceptorInstance;
      console.log('🔧 Firebase Interceptor disponible via window.firebaseInterceptor');
    }
  }
  
  return interceptorInstance;
}

export function getFirebaseInterceptor() {
  return interceptorInstance;
}

export default FirebaseInterceptor; 