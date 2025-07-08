// Script de migration des modèles de contrat codés en dur vers Firebase
// À exécuter une seule fois pour migrer les modèles existants

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Configuration Firebase (à adapter selon votre environnement)
const firebaseConfig = {
  // Copiez votre configuration Firebase ici depuis src/services/firebase-service.js
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Modèles codés en dur à migrer (depuis ContratModelsModal.js)
const modelsToMigrate = [
  {
    name: 'Cession – date unique',
    templateType: 'cession',
    bodyContent: `<h2>CONTRAT DE CESSION DU DROIT D'EXPLOITATION D'UN SPECTACLE</h2>

<p><strong>Entre les soussignés :</strong></p>

<p><strong>L'ORGANISATEUR :</strong><br/>
{structure_nom}<br/>
{structure_adresse}<br/>
{structure_code_postal} {structure_ville}<br/>
SIRET : {structure_siret}<br/>
N° TVA Intracommunautaire : {structure_numero_intracommunautaire}<br/>
Représenté(e) par : {contact_nom} {contact_prenom}, {contact_qualite_representant}<br/>
Ci-après dénommé(e) « l'Organisateur »</p>

<p><strong>Et</strong></p>

<p><strong>LE PRODUCTEUR :</strong><br/>
{nom_entreprise}<br/>
{adresse_entreprise}<br/>
SIRET : {siret_entreprise}<br/>
Représenté(e) par : {representant_entreprise}, {fonction_representant}<br/>
Ci-après dénommé(e) « le Producteur »</p>

<h3>IL A ÉTÉ CONVENU CE QUI SUIT :</h3>

<h4>Article 1 - OBJET</h4>
<p>Le présent contrat a pour objet la cession du droit d'exploitation du spectacle suivant :</p>
<p><strong>Artiste :</strong> {artiste_nom}<br/>
<strong>Titre du spectacle :</strong> {concert_titre}<br/>
<strong>Genre :</strong> {artiste_genre}</p>

<h4>Article 2 - REPRÉSENTATION</h4>
<p>L'Organisateur s'engage à accueillir le spectacle dans les conditions suivantes :</p>
<p><strong>Date :</strong> {concert_date}<br/>
<strong>Horaire :</strong> {concert_heure}<br/>
<strong>Lieu :</strong> {lieu_nom}<br/>
<strong>Adresse :</strong> {lieu_adresse}, {lieu_code_postal} {lieu_ville}<br/>
<strong>Capacité :</strong> {lieu_capacite} places</p>

<h4>Article 3 - CONDITIONS FINANCIÈRES</h4>
<p>En contrepartie de la cession des droits d'exploitation du spectacle, l'Organisateur versera au Producteur :</p>
<p><strong>Montant net de TVA :</strong> {concert_montant} €<br/>
<strong>Montant en lettres :</strong> {concert_montant_lettres}</p>

<h4>Article 4 - CONDITIONS DE RÈGLEMENT</h4>
<p>Le règlement sera effectué selon les modalités définies dans le présent contrat.</p>

<h4>Article 5 - OBLIGATIONS DU PRODUCTEUR</h4>
<p>Le Producteur s'engage à :</p>
<ul>
<li>Fournir le spectacle en ordre de marche</li>
<li>Assurer la rémunération de l'ensemble du personnel artistique et technique</li>
<li>Fournir les éléments nécessaires à la publicité du spectacle</li>
</ul>

<h4>Article 6 - OBLIGATIONS DE L'ORGANISATEUR</h4>
<p>L'Organisateur s'engage à :</p>
<ul>
<li>Mettre à disposition le lieu en ordre de marche</li>
<li>Assurer la sécurité du public et des artistes</li>
<li>Assurer la promotion locale du spectacle</li>
</ul>

<p>Fait à {lieu_ville}, le {date_complete}</p>

<p><strong>Pour l'Organisateur :</strong><br/>
{contact_nom} {contact_prenom}<br/>
{contact_qualite_representant}</p>

<p><strong>Pour le Producteur :</strong><br/>
{representant_entreprise}<br/>
{fonction_representant}</p>`
  },
  {
    name: 'Cession – dates multiples',
    templateType: 'cession',
    bodyContent: `<h2>CONTRAT DE CESSION DU DROIT D'EXPLOITATION D'UN SPECTACLE - TOURNÉE</h2>

<p><strong>Entre les soussignés :</strong></p>

<p><strong>L'ORGANISATEUR :</strong><br/>
{structure_nom}<br/>
Représenté(e) par : {contact_nom} {contact_prenom}<br/>
Ci-après dénommé(e) « l'Organisateur »</p>

<p><strong>Et LE PRODUCTEUR :</strong><br/>
{nom_entreprise}<br/>
Représenté(e) par : {representant_entreprise}<br/>
Ci-après dénommé(e) « le Producteur »</p>

<h3>IL A ÉTÉ CONVENU CE QUI SUIT :</h3>

<h4>Article 1 - OBJET</h4>
<p>Le présent contrat a pour objet la cession du droit d'exploitation du spectacle de {artiste_nom} pour une série de représentations.</p>

<h4>Article 2 - CALENDRIER DES REPRÉSENTATIONS</h4>
<p>Les représentations auront lieu aux dates et lieux suivants :</p>
<p>[À COMPLÉTER : Liste des dates, horaires et lieux]</p>

<h4>Article 3 - CONDITIONS FINANCIÈRES</h4>
<p>Pour l'ensemble des représentations, l'Organisateur versera au Producteur un cachet global de [MONTANT] € net de TVA.</p>

<p>Fait à {lieu_ville}, le {date_complete}</p>`
  },
  {
    name: 'Contrat de résidence artistique',
    templateType: 'residence',
    bodyContent: `<h2>CONTRAT DE RÉSIDENCE ARTISTIQUE</h2>

<p><strong>Entre :</strong></p>

<p><strong>LA STRUCTURE D'ACCUEIL :</strong><br/>
{structure_nom}<br/>
Représentée par : {contact_nom} {contact_prenom}</p>

<p><strong>Et L'ARTISTE/LA COMPAGNIE :</strong><br/>
{artiste_nom}<br/>
Représenté(e) par : {representant_entreprise}</p>

<h3>OBJET DE LA RÉSIDENCE</h3>
<p>La présente convention a pour objet de définir les conditions d'accueil en résidence de {artiste_nom} du [DATE DÉBUT] au [DATE FIN].</p>

<h4>Article 1 - MISE À DISPOSITION</h4>
<p>La structure met à disposition :</p>
<ul>
<li>Un espace de travail adapté</li>
<li>Le matériel technique nécessaire</li>
<li>Un accompagnement artistique et technique</li>
</ul>

<h4>Article 2 - ENGAGEMENTS DE L'ARTISTE</h4>
<p>L'artiste s'engage à :</p>
<ul>
<li>Mener son travail de création pendant la période définie</li>
<li>Présenter une étape de travail ou une représentation publique</li>
<li>Participer aux actions culturelles définies</li>
</ul>

<h4>Article 3 - CONDITIONS FINANCIÈRES</h4>
<p>La structure versera à l'artiste une bourse de résidence de [MONTANT] €.</p>

<p>Fait à {lieu_ville}, le {date_complete}</p>`
  },
  {
    name: 'Convention de partenariat',
    templateType: 'partenariat',
    bodyContent: `<h2>CONVENTION DE PARTENARIAT CULTUREL</h2>

<p><strong>Entre :</strong></p>
<p>{structure_nom}, représentée par {contact_nom} {contact_prenom}</p>
<p><strong>Et</strong></p>
<p>{nom_entreprise}, représentée par {representant_entreprise}</p>

<h3>PRÉAMBULE</h3>
<p>Les parties souhaitent collaborer pour la réalisation du projet culturel "{concert_titre}".</p>

<h4>Article 1 - OBJET</h4>
<p>La présente convention définit les modalités du partenariat pour [DESCRIPTION DU PROJET].</p>

<h4>Article 2 - ENGAGEMENTS DES PARTIES</h4>
<p>Chaque partie s'engage selon les modalités définies dans la présente convention.</p>

<h4>Article 3 - DURÉE</h4>
<p>Le partenariat est conclu pour la période du [DATE DÉBUT] au [DATE FIN].</p>

<p>Fait à {lieu_ville}, le {date_complete}</p>`
  },
  {
    name: 'Coréalisation avec seuil',
    templateType: 'corealisation',
    bodyContent: `<h2>CONTRAT DE CORÉALISATION</h2>

<p><strong>Entre :</strong></p>
<p><strong>LE LIEU :</strong> {structure_nom}</p>
<p><strong>LE PRODUCTEUR :</strong> {nom_entreprise}</p>

<h3>POUR LE SPECTACLE</h3>
<p><strong>Artiste :</strong> {artiste_nom}<br/>
<strong>Date :</strong> {concert_date}</p>

<h4>Article 1 - PRINCIPE DE CORÉALISATION</h4>
<p>Les parties conviennent de coréaliser le spectacle selon les modalités suivantes.</p>

<h4>Article 2 - PARTAGE DES RECETTES</h4>
<p>Après déduction des charges, les recettes seront partagées selon :</p>
<ul>
<li>Jusqu'à [SEUIL] € de recettes : [X]% Lieu / [Y]% Producteur</li>
<li>Au-delà de [SEUIL] € : [X']% Lieu / [Y']% Producteur</li>
</ul>

<h4>Article 3 - MINIMUM GARANTI</h4>
<p>Le Lieu garantit au Producteur un minimum de [MONTANT] € HT.</p>

<p>Fait à {lieu_ville}, le {date_complete}</p>`
  },
  {
    name: 'Promo locale – date unique',
    templateType: 'promotion',
    bodyContent: `<h2>CONTRAT DE PROMOTION LOCALE</h2>

<p><strong>Entre :</strong></p>
<p>{structure_nom} (L'Organisateur)</p>
<p><strong>Et</strong></p>
<p>{nom_entreprise} (Le Producteur)</p>

<h3>POUR LE SPECTACLE DE {artiste_nom}</h3>
<p>Le {concert_date} à {lieu_nom}</p>

<h4>Article 1 - OBJET</h4>
<p>L'Organisateur assure la promotion locale du spectacle.</p>

<h4>Article 2 - ENGAGEMENTS</h4>
<p>L'Organisateur prend en charge :</p>
<ul>
<li>La communication locale</li>
<li>La billetterie</li>
<li>L'accueil du public</li>
</ul>

<h4>Article 3 - CONDITIONS FINANCIÈRES</h4>
<p>Le Producteur verse à l'Organisateur une commission de [X]% sur les recettes billetterie.</p>

<p>Fait à {lieu_ville}, le {date_complete}</p>`
  }
];

// Fonction pour vérifier si un modèle existe déjà
async function templateExists(name, entrepriseId) {
  const q = query(
    collection(db, 'contratTemplates'),
    where('name', '==', name),
    where('entrepriseId', '==', entrepriseId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Fonction principale de migration
async function migrateTemplates() {
  try {
    console.log('🚀 Début de la migration des modèles de contrat...\n');
    
    // Demander les credentials
    const email = process.argv[2];
    const password = process.argv[3];
    const entrepriseId = process.argv[4];
    
    if (!email || !password || !entrepriseId) {
      console.error('❌ Usage: node migrate-contract-templates.js <email> <password> <entrepriseId>');
      process.exit(1);
    }
    
    // Se connecter
    console.log('🔐 Connexion à Firebase...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connecté avec succès\n');
    
    // Migrer chaque modèle
    for (const model of modelsToMigrate) {
      console.log(`📄 Migration du modèle: ${model.name}`);
      
      // Vérifier si le modèle existe déjà
      const exists = await templateExists(model.name, entrepriseId);
      if (exists) {
        console.log(`⚠️  Le modèle "${model.name}" existe déjà, ignoré.\n`);
        continue;
      }
      
      // Créer le modèle
      const templateData = {
        name: model.name,
        templateType: model.templateType,
        bodyContent: model.bodyContent,
        headerContent: '',
        footerContent: '',
        signatureTemplate: `<div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="width: 45%; text-align: center;">
            <p style="margin-bottom: 60px;">Pour l'Organisateur :</p>
            <p>{contact_nom} {contact_prenom}</p>
            <p style="border-top: 1px solid #000; margin-top: 5px; padding-top: 5px;">
              {contact_qualite_representant}
            </p>
          </div>
          <div style="width: 45%; text-align: center;">
            <p style="margin-bottom: 60px;">Pour le Producteur :</p>
            <p>{representant_entreprise}</p>
            <p style="border-top: 1px solid #000; margin-top: 5px; padding-top: 5px;">
              {fonction_representant}
            </p>
          </div>
        </div>`,
        isDefault: false,
        entrepriseId: entrepriseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: email,
        // Paramètres de mise en page
        paperSize: 'a4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        headerHeight: 20,
        headerBottomMargin: 10,
        footerHeight: 15,
        footerTopMargin: 10,
        titleTemplate: 'Contrat - {concert_titre}',
      };
      
      const docRef = await addDoc(collection(db, 'contratTemplates'), templateData);
      console.log(`✅ Modèle créé avec l'ID: ${docRef.id}\n`);
    }
    
    console.log('🎉 Migration terminée avec succès!');
    console.log(`\n📌 Prochaines étapes:`);
    console.log(`1. Vérifiez les modèles dans Admin > Paramétrage > Modèles de contrat`);
    console.log(`2. Personnalisez le contenu des modèles selon vos besoins`);
    console.log(`3. Définissez un modèle par défaut si souhaité`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Lancer la migration
migrateTemplates();