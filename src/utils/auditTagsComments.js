/**
 * Script d'audit pour tracer le flux des tags et commentaires
 * À intégrer temporairement dans le code pour déboguer
 */

class TagsCommentsAuditor {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  // Enregistrer un événement
  log(step, data) {
    const timestamp = Date.now() - this.startTime;
    const entry = {
      timestamp,
      step,
      data,
      stackTrace: new Error().stack
    };
    
    this.logs.push(entry);
    
    // Affichage en temps réel
    console.log(
      `%c[AUDIT ${timestamp}ms] ${step}`,
      'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px;',
      data
    );
  }

  // Points d'audit pour le flux des tags
  auditTags = {
    // 1. Modal de sélection
    modalOpen: (currentTags) => {
      this.log('TAGS_MODAL_OPEN', { currentTags });
    },
    
    modalSave: (newTags) => {
      this.log('TAGS_MODAL_SAVE', { newTags });
    },
    
    // 2. Handler dans le composant
    handleTagsChangeStart: (newTags, contactId, contactType) => {
      this.log('HANDLE_TAGS_CHANGE_START', { newTags, contactId, contactType });
    },
    
    handleTagsChangeEnd: (result) => {
      this.log('HANDLE_TAGS_CHANGE_END', { success: result });
    },
    
    // 3. Service de mise à jour
    updateServiceStart: (contactId, updates) => {
      this.log('UPDATE_SERVICE_START', { contactId, updates });
    },
    
    updateServiceEnd: (result) => {
      this.log('UPDATE_SERVICE_END', result);
    },
    
    // 4. Firebase
    firebaseUpdateStart: (docRef, data) => {
      this.log('FIREBASE_UPDATE_START', { 
        path: docRef.path, 
        data 
      });
    },
    
    firebaseUpdateEnd: (success) => {
      this.log('FIREBASE_UPDATE_END', { success });
    },
    
    // 5. Listeners
    listenerTriggered: (type, docId, data) => {
      this.log('LISTENER_TRIGGERED', { 
        type, 
        docId, 
        tags: data.tags,
        commentaires: data.commentaires?.length 
      });
    },
    
    // 6. État local
    stateUpdated: (type, newData) => {
      this.log('STATE_UPDATED', { 
        type, 
        count: newData.length,
        sample: newData[0] 
      });
    },
    
    // 7. Cache
    cacheRead: (contactId, source, data) => {
      this.log('CACHE_READ', { 
        contactId, 
        source,
        found: !!data,
        tags: data?.tags,
        commentaires: data?.commentaires?.length
      });
    },
    
    // 8. Transformation
    dataTransformed: (stage, data) => {
      this.log('DATA_TRANSFORMED', {
        stage,
        tags: data?.tags || data?.qualification?.tags,
        tagsPath: data?.tags ? 'direct' : 'qualification',
        commentaires: data?.commentaires?.length
      });
    },
    
    // 9. Rendu
    componentRendered: (component, props) => {
      this.log('COMPONENT_RENDERED', {
        component,
        tagsCount: props.tags?.length,
        commentsCount: props.commentaires?.length
      });
    }
  };

  // Analyser les résultats
  analyze() {
    console.group('%c📊 ANALYSE D\'AUDIT', 'color: #FF5722; font-size: 16px; font-weight: bold;');
    
    // 1. Chronologie
    console.group('⏱️ Chronologie des événements');
    this.logs.forEach((log, i) => {
      const nextLog = this.logs[i + 1];
      const duration = nextLog ? nextLog.timestamp - log.timestamp : 0;
      console.log(
        `${log.timestamp}ms: ${log.step}`,
        duration > 100 ? `⚠️ (${duration}ms jusqu'au suivant)` : ''
      );
    });
    console.groupEnd();
    
    // 2. Analyse des données
    console.group('📦 Cohérence des données');
    
    // Vérifier la présence des tags à chaque étape
    const tagSteps = this.logs.filter(l => l.data.tags !== undefined);
    console.log('Tags détectés à ces étapes:');
    tagSteps.forEach(step => {
      console.log(`- ${step.step}:`, step.data.tags);
    });
    
    // Identifier où les tags disparaissent
    for (let i = 0; i < tagSteps.length - 1; i++) {
      const current = tagSteps[i];
      const next = tagSteps[i + 1];
      if (current.data.tags?.length > 0 && (!next.data.tags || next.data.tags.length === 0)) {
        console.error(`❌ Tags perdus entre ${current.step} et ${next.step}`);
      }
    }
    console.groupEnd();
    
    // 3. Délais suspects
    console.group('⚠️ Délais suspects');
    for (let i = 0; i < this.logs.length - 1; i++) {
      const current = this.logs[i];
      const next = this.logs[i + 1];
      const duration = next.timestamp - current.timestamp;
      if (duration > 100) {
        console.warn(`${current.step} → ${next.step}: ${duration}ms`);
      }
    }
    console.groupEnd();
    
    // 4. Erreurs potentielles
    console.group('❌ Problèmes détectés');
    
    // Vérifier si Firebase a été mis à jour
    const firebaseUpdate = this.logs.find(l => l.step === 'FIREBASE_UPDATE_END');
    if (!firebaseUpdate || !firebaseUpdate.data.success) {
      console.error('Firebase n\'a pas été mis à jour avec succès');
    }
    
    // Vérifier si les listeners ont été déclenchés
    const listenerLogs = this.logs.filter(l => l.step === 'LISTENER_TRIGGERED');
    if (listenerLogs.length === 0) {
      console.error('Aucun listener Firebase n\'a été déclenché');
    }
    
    // Vérifier la cohérence du cache
    const cacheReads = this.logs.filter(l => l.step === 'CACHE_READ');
    cacheReads.forEach(read => {
      if (!read.data.found) {
        console.error(`Cache miss pour ${read.data.contactId}`);
      }
    });
    
    console.groupEnd();
    
    console.groupEnd();
    
    // Retourner un résumé
    return {
      totalDuration: this.logs[this.logs.length - 1]?.timestamp || 0,
      steps: this.logs.length,
      firebaseUpdated: !!firebaseUpdate?.data.success,
      listenersTriggered: listenerLogs.length > 0,
      cacheMisses: cacheReads.filter(r => !r.data.found).length,
      dataLost: tagSteps.some((step, i) => {
        const next = tagSteps[i + 1];
        return step.data.tags?.length > 0 && (!next?.data.tags || next.data.tags.length === 0);
      })
    };
  }

  // Générer un rapport
  generateReport() {
    const analysis = this.analyze();
    
    return `
# Rapport d'Audit - Tags et Commentaires

## Résumé
- Durée totale: ${analysis.totalDuration}ms
- Étapes tracées: ${analysis.steps}
- Firebase mis à jour: ${analysis.firebaseUpdated ? '✅' : '❌'}
- Listeners déclenchés: ${analysis.listenersTriggered ? '✅' : '❌'}
- Cache miss: ${analysis.cacheMisses}
- Données perdues: ${analysis.dataLost ? '❌' : '✅'}

## Logs détaillés
${this.logs.map(log => `
### ${log.timestamp}ms - ${log.step}
\`\`\`json
${JSON.stringify(log.data, null, 2)}
\`\`\`
`).join('\n')}
`;
  }
}

// Instance globale pour l'audit
window.__tagsCommentsAuditor = new TagsCommentsAuditor();

export default window.__tagsCommentsAuditor;