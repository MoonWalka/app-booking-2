// Script pour créer un modèle de contrat par défaut
import { db } from '@/services/firebase-service';
import { collection, addDoc, getDocs, query, where } from '@/services/firebase-service';

export const createDefaultContractTemplate = async () => {
  try {
    console.log('Vérification des modèles de contrats existants...');
    
    // Vérifier s'il existe déjà un modèle par défaut
    const templatesQuery = query(
      collection(db, 'contratTemplates'),
      where('isDefault', '==', true)
    );
    const existingTemplates = await getDocs(templatesQuery);
    
    if (!existingTemplates.empty) {
      console.log('Un modèle par défaut existe déjà');
      return existingTemplates.docs[0].id;
    }

    // Créer le modèle par défaut
    const defaultTemplate = {
      name: 'Modèle Standard',
      type: 'contrat_cession',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Configuration des dimensions
      headerHeight: 30,
      footerHeight: 20,
      headerBottomMargin: 10,
      footerTopMargin: 10,
      
      // Contenu du titre
      titleTemplate: 'CONTRAT DE CESSION DU DROIT D\'EXPLOITATION D\'UN SPECTACLE',
      dateTemplate: '',
      
      // En-tête
      headerContent: `<p style="text-align: center;"><strong>[nom_entreprise]</strong></p>
<p style="text-align: center;">[adresse_entreprise]</p>
<p style="text-align: center;">Tel: [telephone_entreprise] - Email: [email_entreprise]</p>`,
      
      // Corps du contrat
      bodyContent: `<h3>ENTRE LES SOUSSIGNÉS</h3>
<p><strong>D'une part,</strong></p>
<p>[nom_entreprise], association représentée par [representant_entreprise] en qualité de [fonction_representant],<br/>
Adresse : [adresse_entreprise]<br/>
N° SIRET : [siret_entreprise]<br/>
Ci-après dénommée "<strong>LE PRODUCTEUR</strong>"</p>

<p><strong>D'autre part,</strong></p>
<p>[contact_nom] [contact_prenom]<br/>
Structure : [contact_structure]<br/>
Adresse : [contact_adresse]<br/>
Email : [contact_email]<br/>
Téléphone : [contact_telephone]<br/>
Ci-après dénommé "<strong>L'ORGANISATEUR</strong>"</p>

<h3>IL A ÉTÉ CONVENU CE QUI SUIT :</h3>

<h4>Article 1 - OBJET</h4>
<p>Le présent contrat a pour objet la cession du droit d'exploitation du spectacle suivant :</p>
<ul>
<li>Artiste : <strong>[artiste_nom]</strong></li>
<li>Genre : [artiste_genre]</li>
<li>Titre du spectacle : <strong>[date_titre]</strong></li>
<li>Date : <strong>[date_date]</strong></li>
<li>Heure : [date_heure]</li>
<li>Lieu : [lieu_nom], [lieu_adresse]</li>
</ul>

<h4>Article 2 - CONDITIONS FINANCIÈRES</h4>
<p>En contrepartie de la cession des droits d'exploitation du spectacle, L'ORGANISATEUR s'engage à verser au PRODUCTEUR la somme de :</p>
<p style="text-align: center; font-size: 18px;"><strong>[date_montant]</strong></p>
<p>Cette somme sera versée par virement bancaire dans les 30 jours suivant la représentation.</p>

<h4>Article 3 - OBLIGATIONS DU PRODUCTEUR</h4>
<p>Le PRODUCTEUR s'engage à :</p>
<ul>
<li>Fournir le spectacle en ordre de marche</li>
<li>Assurer le transport du matériel et des artistes</li>
<li>Fournir les éléments de communication nécessaires</li>
</ul>

<h4>Article 4 - OBLIGATIONS DE L'ORGANISATEUR</h4>
<p>L'ORGANISATEUR s'engage à :</p>
<ul>
<li>Mettre à disposition le lieu en ordre de marche</li>
<li>Assurer la promotion du spectacle</li>
<li>Fournir le personnel technique nécessaire</li>
</ul>

<h4>Article 5 - ASSURANCES</h4>
<p>Chaque partie déclare être assurée pour les risques liés à son activité.</p>

<h4>Article 6 - ANNULATION</h4>
<p>En cas d'annulation du fait de l'une des parties, celle-ci devra indemniser l'autre partie des frais engagés.</p>

<h4>Article 7 - LITIGES</h4>
<p>En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, le tribunal compétent sera celui du siège social du PRODUCTEUR.</p>`,
      
      // Pied de page
      footerContent: `<p style="text-align: center; font-size: 10px;">Page {page} / {total}</p>`,
      
      // Signature
      signatureTemplate: `<p>Fait à [lieu_signature], le [date_signature]</p>
<p>En deux exemplaires originaux</p>
<br/>
<table style="width: 100%;">
<tr>
<td style="width: 50%; text-align: center;">
<p><strong>LE PRODUCTEUR</strong></p>
<p>[nom_entreprise]</p>
<p>Représenté par [representant_entreprise]</p>
<br/><br/><br/>
<p>Signature :</p>
</td>
<td style="width: 50%; text-align: center;">
<p><strong>L'ORGANISATEUR</strong></p>
<p>[contact_nom] [contact_prenom]</p>
<p>[contact_structure]</p>
<br/><br/><br/>
<p>Signature :</p>
</td>
</tr>
</table>`
    };

    const docRef = await addDoc(collection(db, 'contratTemplates'), defaultTemplate);
    console.log('Modèle de contrat par défaut créé avec succès, ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création du modèle par défaut:', error);
    // S'assurer que l'erreur lancée est une instance Error avec un message string
    if (error instanceof Error) {
      throw error;
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erreur inconnue lors de la création du modèle');
    }
  }
};

// Fonction utilitaire pour vérifier et créer le modèle si nécessaire
export const ensureDefaultTemplate = async () => {
  try {
    const templatesSnapshot = await getDocs(collection(db, 'contratTemplates'));
    
    if (templatesSnapshot.empty) {
      console.log('Aucun modèle trouvé, création du modèle par défaut...');
      return await createDefaultContractTemplate();
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la vérification des modèles:', error);
    // Ne pas propager l'erreur pour éviter de casser le flux
    return null;
  }
}; 