import React, { useState } from 'react';
import { Button, Alert, Card, ProgressBar, Badge } from 'react-bootstrap';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';

// Modèles codés en dur à migrer
const TEMPLATES_TO_MIGRATE = [
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

const MigrateContractTemplates = () => {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const checkTemplateExists = async (name) => {
    const q = query(
      collection(db, 'contratTemplates'),
      where('name', '==', name),
      where('organizationId', '==', currentOrganization.id)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const migrateTemplates = async () => {
    if (!currentOrganization?.id || !currentUser?.email) {
      setError('Organisation ou utilisateur non disponible');
      return;
    }

    setMigrating(true);
    setError(null);
    setResults([]);
    setProgress(0);

    const migrationResults = [];
    const totalTemplates = TEMPLATES_TO_MIGRATE.length;

    try {
      for (let i = 0; i < TEMPLATES_TO_MIGRATE.length; i++) {
        const template = TEMPLATES_TO_MIGRATE[i];
        setProgress(((i + 1) / totalTemplates) * 100);

        // Vérifier si le modèle existe déjà
        const exists = await checkTemplateExists(template.name);
        if (exists) {
          migrationResults.push({
            name: template.name,
            status: 'skipped',
            message: 'Modèle déjà existant'
          });
          continue;
        }

        // Créer le modèle
        const templateData = {
          name: template.name,
          templateType: template.templateType,
          bodyContent: template.bodyContent,
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
          organizationId: currentOrganization.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.email,
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
        migrationResults.push({
          name: template.name,
          status: 'success',
          message: `Créé avec l'ID: ${docRef.id}`
        });
      }

      setResults(migrationResults);
    } catch (err) {
      setError(`Erreur lors de la migration: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-arrow-down-circle me-2"></i>
          Migration des modèles de contrat
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Cette fonction migre les modèles de contrat codés en dur vers Firebase. 
          Les modèles déjà existants seront ignorés.
        </p>

        {!migrating && results.length === 0 && (
          <div className="text-center">
            <p className="mb-3">
              <strong>{TEMPLATES_TO_MIGRATE.length}</strong> modèles seront migrés :
            </p>
            <div className="mb-4">
              {TEMPLATES_TO_MIGRATE.map((t, idx) => (
                <Badge key={idx} bg="secondary" className="me-2 mb-2">
                  {t.name}
                </Badge>
              ))}
            </div>
            <Button 
              variant="primary" 
              onClick={migrateTemplates}
              disabled={!currentOrganization?.id}
            >
              <i className="bi bi-play-fill me-2"></i>
              Lancer la migration
            </Button>
            {!currentOrganization?.id && (
              <p className="text-danger mt-2">
                <small>Veuillez sélectionner une organisation</small>
              </p>
            )}
          </div>
        )}

        {migrating && (
          <div>
            <p className="text-center mb-3">Migration en cours...</p>
            <ProgressBar 
              animated 
              now={progress} 
              label={`${Math.round(progress)}%`}
              className="mb-3"
            />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <div>
            <h6 className="mb-3">Résultats de la migration :</h6>
            <div className="list-group">
              {results.map((result, idx) => (
                <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{result.name}</span>
                  <div>
                    {result.status === 'success' ? (
                      <Badge bg="success">
                        <i className="bi bi-check-circle me-1"></i>
                        Créé
                      </Badge>
                    ) : (
                      <Badge bg="warning">
                        <i className="bi bi-dash-circle me-1"></i>
                        Ignoré
                      </Badge>
                    )}
                    <small className="text-muted ms-2">{result.message}</small>
                  </div>
                </div>
              ))}
            </div>
            
            {results.some(r => r.status === 'success') && (
              <Alert variant="info" className="mt-4">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Prochaines étapes
                </h6>
                <ol className="mb-0">
                  <li>Vérifiez les modèles dans Admin {'>'} Paramétrage {'>'} Modèles de contrat</li>
                  <li>Personnalisez le contenu des modèles selon vos besoins</li>
                  <li>Définissez un modèle par défaut si souhaité</li>
                </ol>
              </Alert>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MigrateContractTemplates;