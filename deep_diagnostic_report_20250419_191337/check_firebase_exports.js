  const fs = require('fs');
  
  try {
    const content = fs.readFileSync('./src/firebase.js', 'utf8');
    
    // Vérifier les éléments essentiels
    const checks = [
      { name: 'db', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)db\b|export\s+{\s*(?:[^}]*,\s*)?db\b/ },
      { name: 'auth', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)auth\b|export\s+{\s*(?:[^}]*,\s*)?auth\b/ },
      { name: 'storage', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)storage\b|export\s+{\s*(?:[^}]*,\s*)?storage\b/ },
      { name: 'collection', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)collection\b|export\s+{\s*(?:[^}]*,\s*)?collection\b/ },
      { name: 'doc', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)doc\b|export\s+{\s*(?:[^}]*,\s*)?doc\b/ }
    ];
    
    console.log("=== VÉRIFICATION DES EXPORTATIONS FIREBASE ===");
    
    const results = checks.map(check => {
      const isExported = check.pattern.test(content);
      return { name: check.name, exported: isExported };
    });
    
    results.forEach(result => {
      console.log(`${result.name}: ${result.exported ? '✓ Exporté' : '✗ Non exporté'}`);
    });
    
    // Vérifier les doublons d'exportation
    const exportLines = content.match(/export\s+{[^}]+}\s+from\s+['"]/g) || [];
    const duplicateExports = new Set();
    
    if (exportLines.length > 0) {
      const exportedItems = new Map();
      
      exportLines.forEach(line => {
        const items = line.match(/export\s+{\s*([^}]+)\s*}/)[1].split(',').map(i => i.trim());
        
        items.forEach(item => {
          const cleanItem = item.split(' as ')[0].trim();
          if (exportedItems.has(cleanItem)) {
            duplicateExports.add(cleanItem);
          } else {
            exportedItems.set(cleanItem, line);
          }
        });
      });
      
      if (duplicateExports.size > 0) {
        console.log("\n=== DOUBLONS D'EXPORTATION DÉTECTÉS ===");
        [...duplicateExports].forEach(item => {
          console.log(`! "${item}" est exporté plusieurs fois`);
        });
      }
    }
    
    // Vérifier les imports Firebase
    const firebaseImports = content.match(/import\s+{[^}]+}\s+from\s+['"]firebase\//g) || [];
    console.log(`\n${firebaseImports.length} imports Firebase trouvés`);
    
  } catch (error) {
    console.error("Erreur lors de la vérification de firebase.js:", error.message);
  }
