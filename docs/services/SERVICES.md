# Services

## Introduction

Les services dans TourCraft sont des modules qui encapsulent la logique métier et fournissent des fonctionnalités réutilisables aux composants et hooks de l'application. Ils servent de couche d'abstraction entre les sources de données externes (API, Firebase, etc.) et la logique d'interface utilisateur.

## FirestoreService

**But :** Fournir une interface unifiée pour interagir avec Firestore, la base de données de Firebase.

**Fonctions principales :**
- `getDocument(collection, id)` : Récupérer un document par ID
- `getDocuments(collection, query)` : Récupérer des documents avec filtrage
- `addDocument(collection, data)` : Ajouter un nouveau document
- `updateDocument(collection, id, data)` : Mettre à jour un document existant
- `deleteDocument(collection, id)` : Supprimer un document
- `batchUpdate(operations)` : Effectuer plusieurs opérations dans une transaction
- `listenToDocument(collection, id, callback)` : Observer les changements d'un document en temps réel
- `listenToQuery(collection, query, callback)` : Observer les résultats d'une requête en temps réel

**Implémentation :**
```javascript
// services/FirestoreService.js
import { firestore } from '../firebaseInit';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

class FirestoreService {
  // Récupérer un document par ID
  async getDocument(collectionName, documentId) {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du document ${documentId}:`, error);
      throw error;
    }
  }
  
  // Récupérer des documents avec filtrage
  async getDocuments(collectionName, queryOptions = {}) {
    try {
      let queryRef = collection(firestore, collectionName);
      
      // Construire la requête avec les filtres
      if (queryOptions) {
        const constraints = [];
        
        if (queryOptions.filters) {
          queryOptions.filters.forEach(filter => {
            constraints.push(where(filter.field, filter.operator, filter.value));
          });
        }
        
        if (queryOptions.orderBy) {
          constraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
        }
        
        if (queryOptions.limit) {
          constraints.push(limit(queryOptions.limit));
        }
        
        queryRef = query(queryRef, ...constraints);
      }
      
      const querySnapshot = await getDocs(queryRef);
      
      const documents = [];
      querySnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error(`Erreur lors de la récupération des documents de ${collectionName}:`, error);
      throw error;
    }
  }
  
  // Ajouter un nouveau document
  async addDocument(collectionName, data) {
    try {
      const collectionRef = collection(firestore, collectionName);
      
      // Ajouter des timestamps automatiques
      const documentData = {
        ...data,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp()
      };
      
      const docRef = await addDoc(collectionRef, documentData);
      return docRef.id;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un document à ${collectionName}:`, error);
      throw error;
    }
  }
  
  // Mettre à jour un document existant
  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      
      // Ajouter un timestamp de modification
      const updateData = {
        ...data,
        dateModification: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du document ${documentId}:`, error);
      throw error;
    }
  }
  
  // Supprimer un document
  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du document ${documentId}:`, error);
      throw error;
    }
  }
  
  // Effectuer plusieurs opérations dans une transaction
  async batchUpdate(operations) {
    try {
      const batch = writeBatch(firestore);
      
      operations.forEach(operation => {
        const { type, collection: collectionName, id, data } = operation;
        const docRef = doc(firestore, collectionName, id);
        
        switch (type) {
          case 'add':
            batch.set(docRef, {
              ...data,
              dateCreation: serverTimestamp(),
              dateModification: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              dateModification: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Type d'opération inconnu: ${type}`);
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'exécution du batch update:', error);
      throw error;
    }
  }
  
  // Observer les changements d'un document en temps réel
  listenToDocument(collectionName, documentId, callback) {
    const docRef = doc(firestore, collectionName, documentId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    }, error => {
      console.error(`Erreur lors de l'écoute du document ${documentId}:`, error);
      callback(null, error);
    });
    
    return unsubscribe;
  }
  
  // Observer les résultats d'une requête en temps réel
  listenToQuery(collectionName, queryOptions = {}, callback) {
    let queryRef = collection(firestore, collectionName);
    
    // Construire la requête avec les filtres
    if (queryOptions) {
      const constraints = [];
      
      if (queryOptions.filters) {
        queryOptions.filters.forEach(filter => {
          constraints.push(where(filter.field, filter.operator, filter.value));
        });
      }
      
      if (queryOptions.orderBy) {
        constraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }
      
      if (queryOptions.limit) {
        constraints.push(limit(queryOptions.limit));
      }
      
      queryRef = query(queryRef, ...constraints);
    }
    
    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      callback(documents);
    }, error => {
      console.error(`Erreur lors de l'écoute de la requête sur ${collectionName}:`, error);
      callback([], error);
    });
    
    return unsubscribe;
  }
}

export default new FirestoreService();
```

**Exemple d'utilisation :**
```javascript
import FirestoreService from '../services/FirestoreService';

// Récupérer un concert par ID
async function getConcert(concertId) {
  try {
    const concert = await FirestoreService.getDocument('concerts', concertId);
    return concert;
  } catch (error) {
    console.error('Erreur lors de la récupération du concert:', error);
    throw error;
  }
}

// Récupérer les concerts d'un artiste
async function getArtistConcerts(artisteId) {
  try {
    const concerts = await FirestoreService.getDocuments('concerts', {
      filters: [{ field: 'artisteId', operator: '==', value: artisteId }],
      orderBy: { field: 'date', direction: 'asc' }
    });
    return concerts;
  } catch (error) {
    console.error('Erreur lors de la récupération des concerts:', error);
    throw error;
  }
}

// Mettre à jour le statut d'un concert
async function updateConcertStatus(concertId, newStatus) {
  try {
    await FirestoreService.updateDocument('concerts', concertId, {
      statut: newStatus,
      dateMiseAJourStatut: new Date()
    });
    console.log('Statut du concert mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
}

// Observer les modifications d'un concert en temps réel
function listenToConcertChanges(concertId, onConcertChanged) {
  return FirestoreService.listenToDocument('concerts', concertId, (concert, error) => {
    if (error) {
      console.error('Erreur lors de l\'écoute des changements:', error);
      return;
    }
    
    if (concert) {
      onConcertChanged(concert);
    } else {
      console.log('Le concert a été supprimé ou n\'existe pas');
    }
  });
}
```

## StorageService

**But :** Gérer le téléchargement, la récupération et la suppression de fichiers dans Firebase Storage.

**Fonctions principales :**
- `uploadFile(file, path, metadata)` : Télécharger un fichier
- `getDownloadURL(path)` : Récupérer l'URL de téléchargement d'un fichier
- `deleteFile(path)` : Supprimer un fichier
- `listFiles(directoryPath)` : Lister les fichiers d'un répertoire
- `generateThumbnail(file, options)` : Générer une miniature d'une image

**Implémentation :**
```javascript
// services/StorageService.js
import { storage } from '../firebaseInit';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL as getFirebaseDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  // Télécharger un fichier
  async uploadFile(file, customPath = null, metadata = {}) {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = customPath || `${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload est ${progress}% terminé`);
          },
          (error) => {
            console.error('Erreur lors du téléchargement:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getFirebaseDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: fileName,
              metadata: uploadTask.snapshot.metadata
            });
          }
        );
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      throw error;
    }
  }
  
  // Récupérer l'URL de téléchargement d'un fichier
  async getDownloadURL(path) {
    try {
      const storageRef = ref(storage, path);
      const url = await getFirebaseDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL de téléchargement pour ${path}:`, error);
      throw error;
    }
  }
  
  // Supprimer un fichier
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${path}:`, error);
      throw error;
    }
  }
  
  // Lister les fichiers d'un répertoire
  async listFiles(directoryPath) {
    try {
      const directoryRef = ref(storage, directoryPath);
      const result = await listAll(directoryRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getFirebaseDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error(`Erreur lors de la liste des fichiers dans ${directoryPath}:`, error);
      throw error;
    }
  }
  
  // Générer une miniature d'une image
  async generateThumbnail(file, options = { maxWidth: 200, maxHeight: 200, quality: 0.7 }) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const { maxWidth, maxHeight, quality } = options;
          
          // Calculer les dimensions proportionnelles
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // Créer un canvas pour le redimensionnement
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en JPEG et résoudre avec le Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  new File([blob], `thumb_${file.name}`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  })
                );
              } else {
                reject(new Error('Échec de la génération de miniature'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default new StorageService();
```

**Exemple d'utilisation :**
```javascript
import StorageService from '../services/StorageService';

// Télécharger un document pour un artiste
async function uploadArtisteDocument(artisteId, file) {
  try {
    // Construire un chemin personnalisé
    const customPath = `artistes/${artisteId}/documents/${file.name}`;
    
    // Ajouter des métadonnées
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: 'userId',
        category: 'document',
        originalName: file.name
      }
    };
    
    // Télécharger le fichier
    const result = await StorageService.uploadFile(file, customPath, metadata);
    
    // Retourner les détails du fichier téléchargé
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      url: result.url,
      path: result.path,
      uploadDate: new Date()
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    throw error;
  }
}

// Télécharger une image avec génération de miniature
async function uploadArtistePhoto(artisteId, imageFile) {
  try {
    // Générer une miniature
    const thumbnail = await StorageService.generateThumbnail(imageFile, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.8
    });
    
    // Télécharger l'image originale
    const originalPath = `artistes/${artisteId}/photos/original_${imageFile.name}`;
    const originalResult = await StorageService.uploadFile(imageFile, originalPath);
    
    // Télécharger la miniature
    const thumbnailPath = `artistes/${artisteId}/photos/thumbnail_${imageFile.name}`;
    const thumbnailResult = await StorageService.uploadFile(thumbnail, thumbnailPath);
    
    // Retourner les détails
    return {
      original: {
        url: originalResult.url,
        path: originalResult.path
      },
      thumbnail: {
        url: thumbnailResult.url,
        path: thumbnailResult.path
      }
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement de la photo:', error);
    throw error;
  }
}

// Récupérer tous les documents d'un artiste
async function getArtisteDocuments(artisteId) {
  try {
    const documents = await StorageService.listFiles(`artistes/${artisteId}/documents`);
    return documents;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
}

// Supprimer un document
async function deleteDocument(path) {
  try {
    await StorageService.deleteFile(path);
    console.log('Document supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
}
```

## PDFService

**But :** Générer, manipuler et enregistrer des documents PDF.

**Fonctions principales :**
- `generateFromTemplate(template, data)` : Générer un PDF à partir d'un template et des données
- `convertHTMLToPDF(html, options)` : Convertir du HTML en PDF
- `mergePDFs(pdfFiles)` : Fusionner plusieurs PDF
- `savePDF(blob, filename)` : Enregistrer un PDF localement
- `uploadPDF(blob, path)` : Télécharger un PDF vers Firebase Storage

**Implémentation :**
```javascript
// services/PDFService.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import StorageService from './StorageService';
import FirestoreService from './FirestoreService';

class PDFService {
  // Générer un PDF à partir d'un template et des données
  async generateFromTemplate(template, data) {
    try {
      // Remplacer les variables dans le template HTML
      let html = template.html;
      
      // Fonction récursive pour remplacer les variables imbriquées
      const replaceVariables = (text, dataObject, parentKey = '') => {
        return text.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
          // Gestion des propriétés imbriquées (ex: "artiste.nom")
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          const keyParts = fullKey.split('.');
          
          let value = dataObject;
          for (const part of keyParts) {
            if (value && typeof value === 'object' && part in value) {
              value = value[part];
            } else {
              return match; // Variable non trouvée, laisser le placeholder
            }
          }
          
          // Formatage de valeurs spécifiques
          if (key === 'date' && value instanceof Date) {
            return value.toLocaleDateString('fr-FR');
          }
          
          if (value === undefined || value === null) {
            return '';
          }
          
          return value;
        });
      };
      
      html = replaceVariables(html, data);
      
      // Convertir le HTML en PDF
      const pdfBlob = await this.convertHTMLToPDF(html, {
        format: template.format || 'a4',
        orientation: template.orientation || 'portrait',
        margins: template.margins || { top: 20, right: 20, bottom: 20, left: 20 }
      });
      
      return pdfBlob;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF à partir du template:', error);
      throw error;
    }
  }
  
  // Convertir du HTML en PDF
  async convertHTMLToPDF(html, options = {}) {
    try {
      // Créer un conteneur temporaire pour le HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      
      // Appliquer les styles et dimensionnement
      container.style.width = options.width || '794px'; // A4 width in px at 96dpi
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.padding = '0';
      
      // Générer le canvas à partir du HTML
      const canvas = await html2canvas(container, {
        scale: options.scale || 2, // Meilleure qualité
        useCORS: true,
        logging: false
      });
      
      document.body.removeChild(container);
      
      // Créer le PDF avec le format souhaité
      const format = options.format || 'a4';
      const orientation = options.orientation || 'portrait';
      const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };
      
      const pdf = new jsPDF(orientation, 'pt', format);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculer les dimensions pour ajuster l'image au PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculer le ratio pour ajuster l'image à la page
      let ratio = Math.min(
        (pdfWidth - margins.left - margins.right) / imgWidth,
        (pdfHeight - margins.top - margins.bottom) / imgHeight
      );
      
      // Si l'image est plus grande que la page, la redimensionner
      let finalWidth = imgWidth * ratio;
      let finalHeight = imgHeight * ratio;
      
      // Ajouter l'image au PDF
      pdf.addImage(
        imgData,
        'JPEG',
        margins.left,
        margins.top,
        finalWidth,
        finalHeight
      );
      
      // Si l'image dépasse une page, ajouter des pages supplémentaires
      if (finalHeight > pdfHeight - margins.top - margins.bottom) {
        const pageCount = Math.ceil(finalHeight / (pdfHeight - margins.top - margins.bottom));
        
        for (let i = 1; i < pageCount; i++) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            'JPEG',
            margins.left,
            margins.top - i * (pdfHeight - margins.top - margins.bottom),
            finalWidth,
            finalHeight
          );
        }
      }
      
      // Convertir en Blob pour faciliter la manipulation
      const blob = pdf.output('blob');
      return blob;
    } catch (error) {
      console.error('Erreur lors de la conversion HTML en PDF:', error);
      throw error;
    }
  }
  
  // Fusionner plusieurs PDF
  async mergePDFs(pdfBlobs) {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfBlob of pdfBlobs) {
        // Convertir le Blob en ArrayBuffer
        const arrayBuffer = await pdfBlob.arrayBuffer();
        
        // Charger le PDF
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Copier toutes les pages dans le PDF final
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      
      // Générer le PDF fusionné
      const mergedPdfBytes = await mergedPdf.save();
      
      return new Blob([mergedPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur lors de la fusion des PDFs:', error);
      throw error;
    }
  }
  
  // Enregistrer un PDF localement
  savePDF(blob, filename = 'document.pdf') {
    try {
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement local du PDF:', error);
      throw error;
    }
  }
  
  // Télécharger un PDF vers Firebase Storage
  async uploadPDF(blob, path) {
    try {
      // Créer un File à partir du Blob pour le téléchargement
      const file = new File([blob], path.split('/').pop() || 'document.pdf', {
        type: 'application/pdf',
        lastModified: Date.now()
      });
      
      // Utiliser StorageService pour télécharger le fichier
      const result = await StorageService.uploadFile(file, path, {
        contentType: 'application/pdf'
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  }
  
  // Enregistrer un contrat généré
  async saveGeneratedContract(pdfBlob, contractData) {
    try {
      // 1. Télécharger le PDF
      const pdfPath = `contrats/${contractData.reference || Date.now()}.pdf`;
      const pdfResult = await this.uploadPDF(pdfBlob, pdfPath);
      
      // 2. Enregistrer les métadonnées du contrat dans Firestore
      const contratId = await FirestoreService.addDocument('contrats', {
        ...contractData,
        pdfUrl: pdfResult.url,
        pdfPath: pdfResult.path,
        statut: contractData.statut || 'brouillon'
      });
      
      return {
        contratId,
        pdfUrl: pdfResult.url
      };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du contrat généré:', error);
      throw error;
    }
  }
}

export default new PDFService();
```

**Exemple d'utilisation :**
```javascript
import PDFService from '../services/PDFService';
import FirestoreService from '../services/FirestoreService';

// Générer un contrat à partir d'un template
async function generateContractPDF(concertId) {
  try {
    // 1. Récupérer les données nécessaires
    const concert = await FirestoreService.getDocument('concerts', concertId);
    const artiste = await FirestoreService.getDocument('artistes', concert.artisteId);
    const lieu = await FirestoreService.getDocument('lieux', concert.lieuId);
    const parametres = await FirestoreService.getDocument('parametres', 'entreprise');
    
    // 2. Récupérer le template de contrat
    const template = await FirestoreService.getDocument('templates', 'contrat_standard');
    
    // 3. Préparer les données pour le template
    const data = {
      concert,
      artiste,
      lieu,
      entreprise: parametres,
      date: new Date(),
      reference: `CONT-${concertId.substring(0, 6)}-${new Date().toISOString().substring(0, 10)}`
    };
    
    // 4. Générer le PDF
    const pdfBlob = await PDFService.generateFromTemplate(template, data);
    
    // 5. Enregistrer le contrat
    const result = await PDFService.saveGeneratedContract(pdfBlob, {
      reference: data.reference,
      concertId,
      artisteId: artiste.id,
      lieuId: lieu.id,
      dateCreation: new Date(),
      creePar: 'userId',
      type: 'contrat_standard'
    });
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la génération du contrat:', error);
    throw error;
  }
}

// Télécharger un PDF localement
function downloadContract(contratId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Récupérer les informations du contrat
      const contrat = await FirestoreService.getDocument('contrats', contratId);
      
      if (!contrat || !contrat.pdfUrl) {
        throw new Error('PDF non trouvé pour ce contrat');
      }
      
      // Télécharger le fichier PDF
      const response = await fetch(contrat.pdfUrl);
      const blob = await response.blob();
      
      // Enregistrer localement
      PDFService.savePDF(blob, `Contrat_${contrat.reference}.pdf`);
      
      resolve(true);
    } catch (error) {
      console.error('Erreur lors du téléchargement du contrat:', error);
      reject(error);
    }
  });
}
```

## EmailService

**But :** Envoyer des emails depuis l'application, comme des confirmations, des rappels ou des documents.

**Fonctions principales :**
- `sendMail(options)` : Envoyer un email simple
- `sendTemplatedMail(templateId, data, recipients)` : Envoyer un email à partir d'un template
- `sendContractEmail(contratId, recipientEmail, message)` : Envoyer un contrat par email
- `sendInvoiceEmail(factureId, recipientEmail)` : Envoyer une facture par email

**Implémentation :**
```javascript
// services/EmailService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseInit';
import FirestoreService from './FirestoreService';

class EmailService {
  // Envoyer un email simple (via Cloud Functions)
  async sendMail(options) {
    try {
      const sendMailFunction = httpsCallable(functions, 'sendMail');
      
      const result = await sendMailFunction({
        to: options.to,
        cc: options.cc || [],
        bcc: options.bcc || [],
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || []
      });
      
      return result.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }
  
  // Envoyer un email à partir d'un template
  async sendTemplatedMail(templateId, data, recipients) {
    try {
      // Récupérer le template d'email
      const template = await FirestoreService.getDocument('emailTemplates', templateId);
      
      if (!template) {
        throw new Error(`Template d'email non trouvé: ${templateId}`);
      }
      
      // Remplacer les variables dans le template
      let subject = template.subject;
      let html = template.html;
      
      // Fonction pour remplacer les variables
      const replaceVariables = (text, data) => {
        return text.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
          const keyParts = key.split('.');
          let value = data;
          
          for (const part of keyParts) {
            if (value && typeof value === 'object' && part in value) {
              value = value[part];
            } else {
              return match;
            }
          }
          
          return value !== undefined && value !== null ? value : '';
        });
      };
      
      subject = replaceVariables(subject, data);
      html = replaceVariables(html, data);
      
      // Envoyer l'email
      const result = await this.sendMail({
        to: recipients.to,
        cc: recipients.cc,
        bcc: recipients.bcc,
        subject,
        html,
        attachments: recipients.attachments
      });
      
      // Enregistrer l'envoi d'email
      await FirestoreService.addDocument('emailsSent', {
        templateId,
        recipients,
        subject,
        dateSent: new Date(),
        success: true
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email avec template:', error);
      
      // Enregistrer l'échec
      await FirestoreService.addDocument('emailsSent', {
        templateId,
        recipients,
        subject: `Échec d'envoi: ${templateId}`,
        dateSent: new Date(),
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  // Envoyer un contrat par email
  async sendContractEmail(contratId, recipientEmail, message = '') {
    try {
      // Récupérer les données du contrat
      const contrat = await FirestoreService.getDocument('contrats', contratId);
      
      if (!contrat || !contrat.pdfUrl) {
        throw new Error('Contrat non trouvé ou PDF indisponible');
      }
      
      // Récupérer les données associées
      const concert = await FirestoreService.getDocument('concerts', contrat.concertId);
      const artiste = await FirestoreService.getDocument('artistes', contrat.artisteId);
      
      // Télécharger le fichier pour l'attachement
      const response = await fetch(contrat.pdfUrl);
      const blob = await response.blob();
      const fileReader = new FileReader();
      
      return new Promise((resolve, reject) => {
        fileReader.onloadend = async () => {
          try {
            // Préparer l'attachement au format Base64
            const base64data = fileReader.result.split(',')[1];
            
            // Envoyer l'email avec le template "contrat"
            const result = await this.sendTemplatedMail('envoi_contrat', {
              nomArtiste: artiste.nom,
              nomConcert: concert.titre,
              dateConcert: new Date(concert.date).toLocaleDateString('fr-FR'),
              messagePersonnalise: message
            }, {
              to: [recipientEmail],
              attachments: [
                {
                  filename: `Contrat_${contrat.reference}.pdf`,
                  content: base64data,
                  encoding: 'base64',
                  contentType: 'application/pdf'
                }
              ]
            });
            
            // Mettre à jour le statut du contrat
            await FirestoreService.updateDocument('contrats', contratId, {
              emailEnvoye: true,
              dateEnvoiEmail: new Date(),
              destinataireEmail: recipientEmail
            });
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        
        fileReader.onerror = () => {
          reject(new Error('Échec de lecture du fichier PDF'));
        };
        
        fileReader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du contrat par email:', error);
      throw error;
    }
  }
  
  // Envoyer une facture par email
  async sendInvoiceEmail(factureId, recipientEmail) {
    // Implémentation similaire à sendContractEmail
    // ...
  }
}

export default new EmailService();
```

**Exemple d'utilisation :**
```javascript
import EmailService from '../services/EmailService';

// Fonction pour envoyer un contrat
async function envoyerContrat(contratId, emailDestinataire, message) {
  try {
    await EmailService.sendContractEmail(contratId, emailDestinataire, message);
    console.log('Contrat envoyé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du contrat:', error);
    throw error;
  }
}

// Fonction pour envoyer une notification de concert confirmé
async function notifierConfirmationConcert(concertId) {
  try {
    // Récupérer les informations nécessaires
    const concert = await FirestoreService.getDocument('concerts', concertId);
    const artiste = await FirestoreService.getDocument('artistes', concert.artisteId);
    const lieu = await FirestoreService.getDocument('lieux', concert.lieuId);
    
    // Préparer les destinataires
    const recipients = {
      to: [artiste.email, lieu.email],
      cc: ['manager@meltin.fr']
    };
    
    // Envoyer l'email avec le template approprié
    await EmailService.sendTemplatedMail('confirmation_concert', {
      nomConcert: concert.titre,
      nomArtiste: artiste.nom,
      nomLieu: lieu.nom,
      adresseLieu: lieu.adresse,
      dateConcert: new Date(concert.date).toLocaleDateString('fr-FR'),
      heureConcert: concert.heure
    }, recipients);
    
    console.log('Email de confirmation envoyé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    throw error;
  }
}

// Envoyer un email personnalisé
async function envoyerEmailPersonnalise(options) {
  try {
    const result = await EmailService.sendMail({
      to: options.destinataires,
      cc: options.copie,
      subject: options.sujet,
      html: options.contenuHtml,
      text: options.contenuTexte
    });
    
    console.log('Email personnalisé envoyé avec succès');
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email personnalisé:', error);
    throw error;
  }
}
```

## Navigation
- [Retour à la documentation principale](../README.md)
- [Documentation des hooks](../hooks/HOOKS.md)
- [Documentation des contextes](../contexts/CONTEXTS.md)