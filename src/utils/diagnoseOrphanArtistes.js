/**
 * Script de diagnostic pour identifier les artistes orphelins
 * (artistes sans organizationId)
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

export const diagnoseOrphanArtistes = async () => {
  try {
    console.log('🔍 Diagnostic des artistes orphelins...');
    
    // Récupérer TOUS les artistes
    const artistesRef = collection(db, 'artistes');
    const snapshot = await getDocs(artistesRef);
    
    const allArtistes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Identifier les orphelins
    const orphanArtistes = allArtistes.filter(artiste => 
      !artiste.organizationId || artiste.organizationId === null || artiste.organizationId === ''
    );
    
    // Identifier ceux avec organizationId
    const validArtistes = allArtistes.filter(artiste => 
      artiste.organizationId && artiste.organizationId !== null && artiste.organizationId !== ''
    );
    
    // Analyser les doublons potentiels
    const orphanNames = orphanArtistes.map(a => a.nom?.toLowerCase()).filter(Boolean);
    const validNames = validArtistes.map(a => a.nom?.toLowerCase()).filter(Boolean);
    const potentialDuplicates = orphanNames.filter(name => validNames.includes(name));
    
    const report = {
      totalArtistes: allArtistes.length,
      orphanArtistes: orphanArtistes.length,
      validArtistes: validArtistes.length,
      potentialDuplicates: potentialDuplicates.length,
      orphanList: orphanArtistes.map(a => ({
        id: a.id,
        nom: a.nom,
        email: a.email,
        createdAt: a.createdAt?.toDate?.() || a.createdAt,
        isPotentialDuplicate: potentialDuplicates.includes(a.nom?.toLowerCase())
      }))
    };
    
    console.log('📊 Rapport de diagnostic:', report);
    return report;
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  }
};

// Fonction pour afficher un rapport détaillé
export const displayOrphanReport = (report) => {
  console.log('\n=== RAPPORT ARTISTES ORPHELINS ===');
  console.log(`📈 Total artistes: ${report.totalArtistes}`);
  console.log(`✅ Artistes valides: ${report.validArtistes}`);
  console.log(`⚠️  Artistes orphelins: ${report.orphanArtistes}`);
  console.log(`🔄 Doublons potentiels: ${report.potentialDuplicates}`);
  
  if (report.orphanList.length > 0) {
    console.log('\n📋 Liste des artistes orphelins:');
    report.orphanList.forEach((artiste, index) => {
      console.log(`${index + 1}. ${artiste.nom} ${artiste.isPotentialDuplicate ? '(🔄 Doublon possible)' : ''}`);
      console.log(`   ID: ${artiste.id}`);
      console.log(`   Email: ${artiste.email || 'N/A'}`);
      console.log(`   Créé: ${artiste.createdAt || 'N/A'}`);
      console.log('');
    });
  }
  
  return report;
}; 