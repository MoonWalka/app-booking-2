import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './PreContratFormPublic.module.css';

const PreContratFormPublic = ({ dateData, entrepriseData, onSubmit, existingData = {} }) => {
  console.log('[WORKFLOW_TEST] 5. Passage des données au formulaire public - PreContratFormPublic reçoit:', {
    existingData,
    hasData: !!existingData && Object.keys(existingData).length > 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fonction pour mapper les données existantes vers le format du formulaire
  const mapExistingData = (data) => {
    console.log('[WORKFLOW_TEST] 5. Passage des données au formulaire public - mapExistingData');
    console.log('[PreContratFormPublic] mapExistingData - Données reçues:', data);
    
    if (!data) {
      console.log('[PreContratFormPublic] mapExistingData - Pas de données');
      return {};
    }
    
    // Debug détaillé des champs d'adresse
    console.log('[PreContratFormPublic] mapExistingData - Champs adresse:', {
      'data.adresse': data.adresse,
      'data.suiteAdresse': data.suiteAdresse,
      'data.cp': data.cp,
      'data.ville': data.ville,
      'data.pays': data.pays,
      'type de data.adresse': typeof data.adresse
    });
    
    // Si publicFormData existe, regarder dedans aussi
    if (data.publicFormData) {
      console.log('[PreContratFormPublic] mapExistingData - publicFormData trouvé:', data.publicFormData);
      console.log('[PreContratFormPublic] mapExistingData - Adresse dans publicFormData:', {
        'publicFormData.adresse': data.publicFormData.adresse,
        'publicFormData.cp': data.publicFormData.cp,
        'publicFormData.ville': data.publicFormData.ville
      });
    }
    
    return {
      // Date
      heureDebut: data.horaireDebut || '',
      heureFin: data.horaireFin || '',
      payant: data.payant ? 'payant' : 'gratuit',
      nombreRepresentations: data.nbRepresentations || '1',
      salle: data.salle || '',
      capacite: data.capacite || '',
      nombreAdmis: data.nbAdmins || '',
      invitationsExos: data.invitations || '',
      festivalEvenement: data.festival || '',
      
      // Négociation
      contratPropose: data.contratPropose || '',
      cachetMinimum: data.montantHT || '',
      modePaiement: data.moyenPaiement || '',
      devise: data.devise || 'EUR',
      acompte: data.acompte || '',
      frais: data.frais || '',
      precisionNego: data.precisionsNegoc || '',
      
      // Organisateur
      raisonSociale: data.raisonSociale || '',
      adresseOrga: data.adresse || '',
      suiteAdresseOrga: data.suiteAdresse || '',
      codePostalOrga: data.cp || '',
      villeOrga: data.ville || '',
      paysOrga: data.pays || 'France',
      telOrga: data.tel || '',
      faxOrga: data.fax || '',
      emailOrga: data.email || '',
      siteWebOrga: data.site || '',
      siret: data.siret || '',
      codeAPE: data.codeActivite || '',
      tvaIntracom: data.numeroTvaIntracommunautaire || '',
      licences: data.numeroLicence || '',
      signataire: data.nomSignataire || '',
      qualiteSignataire: data.qualiteSignataire || '',
      
      // Régie
      nomRegie: data.responsableRegie || '',
      emailRegie: data.emailProRegie || '',
      telRegie: data.telProRegie || '',
      mobileRegie: data.mobileProRegie || '',
      horairesRegie: data.horaires || '',
      
      // Promo
      nomPromo: data.responsablePromo || '',
      emailPromo: data.emailProPromo || '',
      telPromo: data.telProPromo || '',
      mobilePromo: data.mobileProPromo || '',
      demandePromo: data.demandePromo || '',
      
      // Autres
      prixPlaces: data.prixPlaces || '',
      divers: data.divers || ''
    };
  };

  const [formData, setFormData] = useState(() => {
    console.log('[WORKFLOW_TEST] 5. Passage des données au formulaire public - initialisation du state');
    console.log('[PreContratFormPublic] Initialisation - existingData:', existingData);
    const mappedData = mapExistingData(existingData);
    console.log('[PreContratFormPublic] Initialisation - mappedData:', mappedData);
    console.log('[PreContratFormPublic] Initialisation - Adresse mappée:', {
      adresseOrga: mappedData.adresseOrga,
      codePostalOrga: mappedData.codePostalOrga,
      villeOrga: mappedData.villeOrga
    });
    
    return {
      // Date
      heureDebut: mappedData.heureDebut || '',
      heureFin: mappedData.heureFin || '',
      payant: mappedData.payant || 'gratuit',
      nombreRepresentations: mappedData.nombreRepresentations || '1',
      salle: mappedData.salle || '',
      adresseSalle: '',
      suiteAdresseSalle: '',
      codePostalSalle: '',
      villeSalle: '',
      paysSalle: 'France',
      capacite: mappedData.capacite || '',
      nombreAdmis: mappedData.nombreAdmis || '',
      invitationsExos: mappedData.invitationsExos || '',
      festivalEvenement: mappedData.festivalEvenement || '',
      
      // Négociation
      contratPropose: mappedData.contratPropose || '',
      cachetMinimum: mappedData.cachetMinimum || '',
      modePaiement: mappedData.modePaiement || '',
      devise: mappedData.devise || 'EUR',
      acompte: mappedData.acompte || '',
      frais: mappedData.frais || '',
      precisionNego: mappedData.precisionNego || '',
      
      // Organisateur
      raisonSociale: mappedData.raisonSociale || '',
      adresseOrga: mappedData.adresseOrga || '',
      suiteAdresseOrga: mappedData.suiteAdresseOrga || '',
      codePostalOrga: mappedData.codePostalOrga || '',
      villeOrga: mappedData.villeOrga || '',
      paysOrga: mappedData.paysOrga || 'France',
      telOrga: mappedData.telOrga || '',
      faxOrga: mappedData.faxOrga || '',
      emailOrga: mappedData.emailOrga || '',
      siteWebOrga: mappedData.siteWebOrga || '',
      siret: mappedData.siret || '',
      codeAPE: mappedData.codeAPE || '',
      tps: '',
      tvq: '',
      tvaIntracom: mappedData.tvaIntracom || '',
      licences: mappedData.licences || '',
      signataire: mappedData.signataire || '',
      qualiteSignataire: mappedData.qualiteSignataire || '',
      nomResponsable: '',
      telResponsable: '',
      emailResponsable: '',
      mobileResponsable: '',
      
      // Régie
      nomRegie: mappedData.nomRegie || '',
      emailRegie: mappedData.emailRegie || '',
      telRegie: mappedData.telRegie || '',
      mobileRegie: mappedData.mobileRegie || '',
      horairesRegie: mappedData.horairesRegie || '',
      autresArtistes: existingData.autresArtistes || '',
      
      // Promo
      nomPromo: mappedData.nomPromo || '',
      emailPromo: mappedData.emailPromo || '',
      telPromo: mappedData.telPromo || '',
      mobilePromo: mappedData.mobilePromo || '',
      adresseEnvoiPromo: existingData.adresseEnvoiPromo || '',
      demandePromo: mappedData.demandePromo || '',
      
      // Autres infos
      accueilHebergement: existingData.receptif || '',
      prixPlaces: mappedData.prixPlaces || '',
      divers: mappedData.divers || ''
    };
  });

  // Initialiser avec les données existantes
  useEffect(() => {
    console.log('[PreContratFormPublic] useEffect - existingData changé:', existingData);
    if (existingData && Object.keys(existingData).length > 0) {
      console.log('[PreContratFormPublic] useEffect - Mise à jour des données du formulaire');
      const mappedData = mapExistingData(existingData);
      console.log('[PreContratFormPublic] useEffect - Données mappées pour mise à jour:', mappedData);
      setFormData(prev => {
        const newData = {
          ...prev,
          ...mappedData
        };
        console.log('[PreContratFormPublic] useEffect - Nouveau formData:', newData);
        console.log('[PreContratFormPublic] useEffect - Adresse après mise à jour:', {
          adresseOrga: newData.adresseOrga,
          codePostalOrga: newData.codePostalOrga,
          villeOrga: newData.villeOrga
        });
        return newData;
      });
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData, 'save');
      toast.success('Formulaire enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    try {
      setIsSubmitting(true);
      console.log('[DEBUG PreContratFormPublic] Envoi du formulaire avec les données:', {
        codePostalOrga: formData.codePostalOrga,
        adresseOrga: formData.adresseOrga,
        villeOrga: formData.villeOrga
      });
      await onSubmit(formData, 'send');
      toast.success('Formulaire envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Header avec infos date */}
      <div className={styles.header}>
        <h1>{typeof dateData?.artiste === 'string' ? dateData.artiste : dateData?.artiste?.nom || 'Artiste'}</h1>
        <p className={styles.dateDate}>
          {dateData?.date ? new Date(dateData.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Date à définir'}
        </p>
        {entrepriseData?.name && (
          <p className={styles.entrepriseName}>
            Formulaire de pré-contrat • {entrepriseData.name}
          </p>
        )}
      </div>

      <form className={styles.form}>
        {/* Section Date */}
        <section className={styles.section}>
          <h2>Date</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="heureDebut">Heure de début</label>
              <input
                type="time"
                id="heureDebut"
                name="heureDebut"
                value={formData.heureDebut}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="heureFin">Heure de fin</label>
              <input
                type="time"
                id="heureFin"
                name="heureFin"
                value={formData.heureFin}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="payant">Type d'entrée</label>
              <select
                id="payant"
                name="payant"
                value={formData.payant}
                onChange={handleChange}
              >
                <option value="gratuit">Gratuit</option>
                <option value="payant">Payant</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="nombreRepresentations">Nombre de représentations</label>
              <input
                type="number"
                id="nombreRepresentations"
                name="nombreRepresentations"
                value={formData.nombreRepresentations}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="salle">Salle / Lieu</label>
              <input
                type="text"
                id="salle"
                name="salle"
                value={formData.salle}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="capacite">Capacité</label>
              <input
                type="number"
                id="capacite"
                name="capacite"
                value={formData.capacite}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="adresseSalle">Adresse</label>
              <input
                type="text"
                id="adresseSalle"
                name="adresseSalle"
                value={formData.adresseSalle}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="suiteAdresseSalle">Suite adresse</label>
              <input
                type="text"
                id="suiteAdresseSalle"
                name="suiteAdresseSalle"
                value={formData.suiteAdresseSalle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="codePostalSalle">Code postal</label>
              <input
                type="text"
                id="codePostalSalle"
                name="codePostalSalle"
                value={formData.codePostalSalle}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="villeSalle">Ville</label>
              <input
                type="text"
                id="villeSalle"
                name="villeSalle"
                value={formData.villeSalle}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="paysSalle">Pays</label>
              <input
                type="text"
                id="paysSalle"
                name="paysSalle"
                value={formData.paysSalle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="nombreAdmis">Nombre d'admis</label>
              <input
                type="number"
                id="nombreAdmis"
                name="nombreAdmis"
                value={formData.nombreAdmis}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="invitationsExos">Invitations / Exos</label>
              <input
                type="text"
                id="invitationsExos"
                name="invitationsExos"
                value={formData.invitationsExos}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="festivalEvenement">Festival / Évènement</label>
              <input
                type="text"
                id="festivalEvenement"
                name="festivalEvenement"
                value={formData.festivalEvenement}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Section Négociation */}
        <section className={styles.section}>
          <h2>Négociation</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="contratPropose">Contrat proposé</label>
              <input
                type="text"
                id="contratPropose"
                name="contratPropose"
                value={formData.contratPropose}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="cachetMinimum">Cachet ou minimum</label>
              <input
                type="text"
                id="cachetMinimum"
                name="cachetMinimum"
                value={formData.cachetMinimum}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="modePaiement">Mode de paiement</label>
              <input
                type="text"
                id="modePaiement"
                name="modePaiement"
                value={formData.modePaiement}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="devise">Devise</label>
              <select
                id="devise"
                name="devise"
                value={formData.devise}
                onChange={handleChange}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="acompte">Acompte</label>
              <input
                type="text"
                id="acompte"
                name="acompte"
                value={formData.acompte}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="frais">Frais</label>
              <input
                type="text"
                id="frais"
                name="frais"
                value={formData.frais}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="precisionNego">Précision négo.</label>
            <textarea
              id="precisionNego"
              name="precisionNego"
              value={formData.precisionNego}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {dateData?.presta && (
            <div className={styles.prestaInfo}>
              <strong>Presta:</strong> {dateData.presta}
            </div>
          )}
        </section>

        {/* Section Organisateur */}
        <section className={styles.section}>
          <h2>Organisateur</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="raisonSociale">Raison sociale</label>
              <input
                type="text"
                id="raisonSociale"
                name="raisonSociale"
                value={formData.raisonSociale}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="adresseOrga">Adresse</label>
              <input
                type="text"
                id="adresseOrga"
                name="adresseOrga"
                value={formData.adresseOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="suiteAdresseOrga">Suite adresse</label>
              <input
                type="text"
                id="suiteAdresseOrga"
                name="suiteAdresseOrga"
                value={formData.suiteAdresseOrga}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="codePostalOrga">Code postal</label>
              <input
                type="text"
                id="codePostalOrga"
                name="codePostalOrga"
                value={formData.codePostalOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="villeOrga">Ville</label>
              <input
                type="text"
                id="villeOrga"
                name="villeOrga"
                value={formData.villeOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="paysOrga">Pays</label>
              <input
                type="text"
                id="paysOrga"
                name="paysOrga"
                value={formData.paysOrga}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="telOrga">Tél.</label>
              <input
                type="tel"
                id="telOrga"
                name="telOrga"
                value={formData.telOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="faxOrga">Fax</label>
              <input
                type="tel"
                id="faxOrga"
                name="faxOrga"
                value={formData.faxOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="emailOrga">Email</label>
              <input
                type="email"
                id="emailOrga"
                name="emailOrga"
                value={formData.emailOrga}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="siteWebOrga">Site web</label>
              <input
                type="url"
                id="siteWebOrga"
                name="siteWebOrga"
                value={formData.siteWebOrga}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="siret">N° Siret</label>
              <input
                type="text"
                id="siret"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="codeAPE">Code APE</label>
              <input
                type="text"
                id="codeAPE"
                name="codeAPE"
                value={formData.codeAPE}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="tps">TPS (Canada)</label>
              <input
                type="text"
                id="tps"
                name="tps"
                value={formData.tps}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="tvq">TVQ (Canada)</label>
              <input
                type="text"
                id="tvq"
                name="tvq"
                value={formData.tvq}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="tvaIntracom">TVA Intracom</label>
              <input
                type="text"
                id="tvaIntracom"
                name="tvaIntracom"
                value={formData.tvaIntracom}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="licences">N° License(s)</label>
              <input
                type="text"
                id="licences"
                name="licences"
                value={formData.licences}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="signataire">Signataire</label>
              <input
                type="text"
                id="signataire"
                name="signataire"
                value={formData.signataire}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="qualiteSignataire">Qualité du signataire</label>
              <input
                type="text"
                id="qualiteSignataire"
                name="qualiteSignataire"
                value={formData.qualiteSignataire}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="nomResponsable">Nom du responsable</label>
              <input
                type="text"
                id="nomResponsable"
                name="nomResponsable"
                value={formData.nomResponsable}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="telResponsable">Tél.</label>
              <input
                type="tel"
                id="telResponsable"
                name="telResponsable"
                value={formData.telResponsable}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="emailResponsable">Email</label>
              <input
                type="email"
                id="emailResponsable"
                name="emailResponsable"
                value={formData.emailResponsable}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="mobileResponsable">Mobile</label>
              <input
                type="tel"
                id="mobileResponsable"
                name="mobileResponsable"
                value={formData.mobileResponsable}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Section Régie */}
        <section className={styles.section}>
          <h2>Régie</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="nomRegie">Nom du responsable</label>
              <input
                type="text"
                id="nomRegie"
                name="nomRegie"
                value={formData.nomRegie}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="emailRegie">Email</label>
              <input
                type="email"
                id="emailRegie"
                name="emailRegie"
                value={formData.emailRegie}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="telRegie">Tél.</label>
              <input
                type="tel"
                id="telRegie"
                name="telRegie"
                value={formData.telRegie}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="mobileRegie">Mobile</label>
              <input
                type="tel"
                id="mobileRegie"
                name="mobileRegie"
                value={formData.mobileRegie}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="horairesRegie">Horaires régie</label>
            <textarea
              id="horairesRegie"
              name="horairesRegie"
              value={formData.horairesRegie}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="autresArtistes">Autres artistes</label>
            <textarea
              id="autresArtistes"
              name="autresArtistes"
              value={formData.autresArtistes}
              onChange={handleChange}
              rows="2"
            />
          </div>
        </section>

        {/* Section Promo */}
        <section className={styles.section}>
          <h2>Promo</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="nomPromo">Nom du responsable</label>
              <input
                type="text"
                id="nomPromo"
                name="nomPromo"
                value={formData.nomPromo}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="emailPromo">Email</label>
              <input
                type="email"
                id="emailPromo"
                name="emailPromo"
                value={formData.emailPromo}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="telPromo">Tél.</label>
              <input
                type="tel"
                id="telPromo"
                name="telPromo"
                value={formData.telPromo}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="mobilePromo">Mobile</label>
              <input
                type="tel"
                id="mobilePromo"
                name="mobilePromo"
                value={formData.mobilePromo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="adresseEnvoiPromo">Adresse envoi promo</label>
            <textarea
              id="adresseEnvoiPromo"
              name="adresseEnvoiPromo"
              value={formData.adresseEnvoiPromo}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="demandePromo">Demande promo</label>
            <textarea
              id="demandePromo"
              name="demandePromo"
              value={formData.demandePromo}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </section>

        {/* Section Autres infos */}
        <section className={styles.section}>
          <h2>Autres infos</h2>
          <div className={styles.fieldGroup}>
            <label htmlFor="accueilHebergement">Accueil - Hébergement - Restauration</label>
            <textarea
              id="accueilHebergement"
              name="accueilHebergement"
              value={formData.accueilHebergement}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="prixPlaces">Prix des places</label>
            <textarea
              id="prixPlaces"
              name="prixPlaces"
              value={formData.prixPlaces}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="divers">Divers</label>
            <textarea
              id="divers"
              name="divers"
              value={formData.divers}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </section>

        {/* Boutons d'action */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className={styles.saveButton}
          >
            <i className="bi bi-save"></i>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le brouillon'}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className={styles.sendButton}
          >
            <i className="bi bi-send"></i>
            {isSubmitting ? 'Envoi...' : 'Envoyer le formulaire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreContratFormPublic;