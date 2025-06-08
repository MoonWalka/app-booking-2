import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { useParametres } from '@/context/ParametresContext';
import factureService from '@/services/factureService';
import pdfService from '@/services/pdfService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import FactureTemplateEditor from '@/components/factures/FactureTemplateEditor';
import styles from './ContratDetailsPage.module.css';

const FactureGenerationPage = () => {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { parametres } = useParametres();
  
  const [loading, setLoading] = useState(true);
  const [concert, setConcert] = useState(null);
  const [structure, setStructure] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [preview, setPreview] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [montantHT, setMontantHT] = useState('');
  const [tauxTVA, setTauxTVA] = useState(20);
  const [typeFacture, setTypeFacture] = useState('complete'); // complete, acompte, solde
  const [pourcentageAcompte, setPourcentageAcompte] = useState(30);
  const [factureAcompteId, setFactureAcompteId] = useState(null); // Pour lier la facture de solde
  const [montantAcompte, setMontantAcompte] = useState(0);
  const [lignesSupplementaires, setLignesSupplementaires] = useState([]); // Lignes supplémentaires

  // Charger les données nécessaires
  useEffect(() => {
    const loadData = async () => {
      if (!user || !currentOrganization?.id || !concertId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Charger les données du concert
        const concertRef = doc(db, 'concerts', concertId);
        const concertSnap = await getDoc(concertRef);
        
        if (!concertSnap.exists()) {
          throw new Error('Concert introuvable');
        }
        
        const concertData = { id: concertSnap.id, ...concertSnap.data() };
        setConcert(concertData);
        
        // Définir le montant par défaut si disponible
        if (concertData.montant) {
          setMontantHT(concertData.montant.toString());
        }
        
        // Vérifier s'il existe déjà une facture d'acompte pour ce concert
        const facturesRef = collection(db, 'organizations', currentOrganization.id, 'factures');
        const q = query(
          facturesRef, 
          where('concertId', '==', concertId),
          where('typeFacture', '==', 'acompte')
        );
        const facturesSnap = await getDocs(q);
        
        if (!facturesSnap.empty) {
          const factureAcompte = facturesSnap.docs[0];
          setFactureAcompteId(factureAcompte.id);
          setMontantAcompte(factureAcompte.data().montantHT || 0);
          // Si une facture d'acompte existe, proposer par défaut de faire le solde
          setTypeFacture('solde');
        }
        
        // 2. Charger la structure si elle existe
        if (concertData.structureId) {
          const structureRef = doc(db, 'structures', concertData.structureId);
          const structureSnap = await getDoc(structureRef);
          
          if (structureSnap.exists()) {
            const structureData = { id: structureSnap.id, ...structureSnap.data() };
            setStructure(structureData);
          }
        }
        
        // 3. Charger les templates de facture
        let templatesData = await factureService.getFactureTemplates(currentOrganization.id);
        
        // Si aucun template utilisateur, utiliser le modèle système
        if (templatesData.length === 0) {
          const systemTemplate = await factureService.getDefaultTemplateOrSystem(currentOrganization.id);
          templatesData = [systemTemplate];
        }
        
        setTemplates(templatesData);
        
        // 4. Sélectionner le template par défaut
        const defaultTemplate = templatesData.find(t => t.isDefault) || templatesData[0];
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [concertId, user, currentOrganization]);

  // Ajouter une ligne supplémentaire
  const ajouterLigneSupplementaire = () => {
    setLignesSupplementaires([
      ...lignesSupplementaires,
      { id: Date.now(), description: '', montant: 0, type: 'montant' }
    ]);
  };
  
  // Ajouter une ligne de pourcentage
  const ajouterLignePourcentage = () => {
    setLignesSupplementaires([
      ...lignesSupplementaires,
      { id: Date.now(), description: '', montant: 0, type: 'pourcentage', pourcentage: 0 }
    ]);
  };

  // Mettre à jour une ligne supplémentaire
  const updateLigneSupplementaire = (id, field, value) => {
    setLignesSupplementaires(
      lignesSupplementaires.map(ligne =>
        ligne.id === id ? { ...ligne, [field]: value } : ligne
      )
    );
  };

  // Supprimer une ligne supplémentaire
  const supprimerLigneSupplementaire = (id) => {
    setLignesSupplementaires(
      lignesSupplementaires.filter(ligne => ligne.id !== id)
    );
  };

  // Calculer le montant total avec les lignes supplémentaires
  const calculerMontantTotal = () => {
    let montantBase = parseFloat(montantHT) || 0;
    let total = montantBase;
    
    // Traiter chaque ligne supplémentaire
    lignesSupplementaires.forEach(ligne => {
      if (ligne.type === 'montant') {
        // Ligne avec montant fixe
        total += parseFloat(ligne.montant) || 0;
      } else if (ligne.type === 'pourcentage') {
        // Ligne avec pourcentage (calculé sur le montant de base)
        const pourcentage = parseFloat(ligne.pourcentage) || 0;
        const montantCalcule = (montantBase * pourcentage) / 100;
        ligne.montant = montantCalcule; // Stocker le montant calculé
        total += montantCalcule;
      }
    });
    
    return total;
  };

  // Générer l'aperçu de la facture
  useEffect(() => {
    const generatePreview = async () => {
      if (!selectedTemplate || !concert || !montantHT) return;
      
      try {
        // Calculer le montant total avec lignes supplémentaires
        const montantTotalAvecSupplements = calculerMontantTotal();
        
        // Calculer le montant en fonction du type de facture
        let montantFacture = montantTotalAvecSupplements;
        if (typeFacture === 'acompte') {
          montantFacture = montantFacture * pourcentageAcompte / 100;
        } else if (typeFacture === 'solde' && factureAcompteId) {
          montantFacture = montantFacture - montantAcompte;
        }
        
        // Préparer les variables
        const variables = await factureService.prepareFactureVariables({
          concert,
          structure,
          entreprise: parametres?.entreprise || {},
          montantHT: montantFacture,
          montantTotal: montantTotalAvecSupplements,
          tauxTVA,
          templateType: selectedTemplate.templateType,
          typeFacture,
          pourcentageAcompte: typeFacture === 'acompte' ? pourcentageAcompte : null,
          montantAcompte: typeFacture === 'solde' ? montantAcompte : null,
          lignesSupplementaires: lignesSupplementaires
        }, currentOrganization.id);
        
        // Remplacer les variables dans le template
        const htmlContent = factureService.replaceVariables(
          selectedTemplate.content || selectedTemplate.bodyContent || '',
          variables
        );
        
        setPreview(htmlContent);
      } catch (err) {
        console.error('Erreur lors de la génération de l\'aperçu:', err);
      }
    };

    generatePreview();
  }, [selectedTemplate, concert, structure, montantHT, tauxTVA, parametres, currentOrganization, typeFacture, pourcentageAcompte, montantAcompte, factureAcompteId, lignesSupplementaires]);

  // Générer la facture PDF
  const handleGenerateFacture = async () => {
    if (!selectedTemplate || !concert || !montantHT) {
      alert('Veuillez sélectionner un modèle et saisir un montant');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      // Calculer le montant total avec lignes supplémentaires
      const montantTotalAvecSupplements = calculerMontantTotal();
      
      // Calculer le montant en fonction du type de facture
      let montantFacture = montantTotalAvecSupplements;
      if (typeFacture === 'acompte') {
        montantFacture = montantFacture * pourcentageAcompte / 100;
      } else if (typeFacture === 'solde' && factureAcompteId) {
        montantFacture = montantFacture - montantAcompte;
      }

      // 1. Préparer les variables
      const variables = await factureService.prepareFactureVariables({
        concert,
        structure,
        entreprise: parametres?.entreprise || {},
        montantHT: montantFacture,
        montantTotal: montantTotalAvecSupplements, // Montant total du concert avec suppléments
        tauxTVA,
        templateType: selectedTemplate.templateType,
        typeFacture,
        pourcentageAcompte: typeFacture === 'acompte' ? pourcentageAcompte : null,
        montantAcompte: typeFacture === 'solde' ? montantAcompte : null,
        factureAcompteId: typeFacture === 'solde' ? factureAcompteId : null,
        lignesSupplementaires: lignesSupplementaires
      }, currentOrganization.id);
      
      // 2. Créer la facture dans Firebase
      const factureId = await factureService.createFacture({
        concertId: concert.id,
        structureId: structure?.id,
        templateId: selectedTemplate.id || 'standard', // Utiliser 'standard' si pas d'ID
        templateName: selectedTemplate.name || 'Modèle Standard',
        numeroFacture: variables.numero_facture,
        montantHT: montantFacture,
        montantTotal: montantTotalAvecSupplements,
        tauxTVA,
        montantTVA: variables.montantTVA,
        montantTTC: variables.montantTTC,
        dateFacture: new Date(),
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        status: 'generated',
        typeFacture,
        pourcentageAcompte: typeFacture === 'acompte' ? pourcentageAcompte : null,
        factureAcompteId: typeFacture === 'solde' ? factureAcompteId : null,
        lignesSupplementaires: lignesSupplementaires
      }, currentOrganization.id, user.uid);
      
      // 3. Générer le PDF
      const htmlContent = factureService.replaceVariables(
        selectedTemplate.content || selectedTemplate.bodyContent || '',
        variables
      );
      
      // Le template contient déjà tout le HTML nécessaire, on l'encapsule juste dans une page HTML complète
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture ${variables.numero_facture}</title>
          <style>
            @page {
              size: A4;
              margin: 30px;
            }
            html, body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #333;
              font-size: 13px;
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
            }
            /* Conteneur principal avec contraintes A4 */
            .pdf-container {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
              box-sizing: border-box;
              overflow: hidden;
              position: relative;
            }
            /* Styles pour assurer la compatibilité avec l'aperçu */
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: none;
              padding: 8px;
              text-align: left;
            }
            /* Éviter les débordements */
            * {
              box-sizing: border-box;
            }
            /* Ajustements pour l'impression */
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }
              .pdf-container {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
      
      // Générer le PDF avec des options optimisées pour A4
      const pdfBlob = await pdfService.generatePdf(
        fullHtml,
        `Facture_${variables.numero_facture}_${concert.nom || concert.titre || 'Concert'}`,
        {
          format: 'A4',
          margin: {
            top: '30px',
            right: '30px',
            bottom: '30px',
            left: '30px'
          },
          printBackground: true,
          preferCSSPageSize: false
        }
      );
      
      // 4. Télécharger le PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${variables.numero_facture}_${concert.nom || concert.titre || 'Concert'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // 5. Attendre que la facture soit disponible dans Firestore avant de naviguer
      console.log('Facture créée avec ID:', factureId);
      console.log('Attente de la disponibilité de la facture dans Firestore...');
      
      // Utiliser onSnapshot pour s'assurer que le document est bien écrit
      const factureRef = doc(db, 'organizations', currentOrganization.id, 'factures', factureId);
      let navigated = false;
      
      // Timeout de sécurité après 5 secondes
      const timeoutId = setTimeout(() => {
        if (!navigated) {
          console.log('Timeout atteint, navigation forcée vers la facture');
          navigated = true;
          unsubscribe();
          navigate(`/factures/${factureId}`);
        }
      }, 5000);
      
      const unsubscribe = onSnapshot(factureRef, (docSnap) => {
        if (docSnap.exists() && !navigated) {
          console.log('Facture confirmée dans Firestore, redirection...');
          navigated = true;
          clearTimeout(timeoutId);
          unsubscribe(); // Arrêter l'écoute
          navigate(`/factures/${factureId}`);
        }
      }, (error) => {
        console.error('Erreur lors de l\'écoute de la facture:', error);
        if (!navigated) {
          navigated = true;
          clearTimeout(timeoutId);
          unsubscribe();
          // Tenter quand même la navigation après un court délai
          setTimeout(() => {
            navigate(`/factures/${factureId}`);
          }, 1000);
        }
      });
      
    } catch (err) {
      console.error('Erreur lors de la génération de la facture:', err);
      setError(err.message || 'Erreur lors de la génération de la facture');
    } finally {
      setGenerating(false);
    }
  };

  // Créer un nouveau modèle
  const handleCreateTemplate = async (templateData) => {
    if (!currentOrganization?.id) return;
    
    try {
      await factureService.createTemplate(templateData, currentOrganization.id, user.uid);
      
      // Recharger les templates
      const templatesData = await factureService.getFactureTemplates(currentOrganization.id);
      setTemplates(templatesData);
      
      // Sélectionner le nouveau template
      const newTemplate = templatesData.find(t => t.name === templateData.name);
      if (newTemplate) {
        setSelectedTemplate(newTemplate);
      }
      
      setShowTemplateModal(false);
    } catch (err) {
      console.error('Erreur lors de la création du modèle:', err);
      alert('Erreur lors de la création du modèle');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Erreur</h4>
        <p>{error}</p>
        <hr />
        <button 
          className="btn btn-outline-danger"
          onClick={() => navigate('/concerts')}
        >
          Retour à la liste des concerts
        </button>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        Concert introuvable
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Générer une facture</h2>
          <p className="text-muted">
            Concert : {concert.nom || 'Sans titre'} - {concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : 'Date non définie'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/concerts/${concertId}`)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour au concert
        </Button>
      </div>

      {/* Alertes */}
      {!structure && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Aucune structure associée au concert. Les informations du client seront incomplètes.
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.mainSection}>
          {/* Sélection du modèle et montant */}
          <Card>
            <div className={styles.templateSection}>
              <h4>Configuration de la facture</h4>
              
              {/* Type de facture */}
              <div className="mb-3">
                <label className="form-label">Type de facture</label>
                <div className="btn-group d-flex" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="typeFacture"
                    id="typeComplete"
                    value="complete"
                    checked={typeFacture === 'complete'}
                    onChange={(e) => setTypeFacture(e.target.value)}
                    disabled={factureAcompteId !== null}
                  />
                  <label className="btn btn-outline-primary" htmlFor="typeComplete">
                    <i className="bi bi-file-text me-2"></i>
                    Facture complète
                  </label>
                  
                  <input
                    type="radio"
                    className="btn-check"
                    name="typeFacture"
                    id="typeAcompte"
                    value="acompte"
                    checked={typeFacture === 'acompte'}
                    onChange={(e) => setTypeFacture(e.target.value)}
                    disabled={factureAcompteId !== null}
                  />
                  <label className="btn btn-outline-primary" htmlFor="typeAcompte">
                    <i className="bi bi-percent me-2"></i>
                    Facture d'acompte
                  </label>
                  
                  <input
                    type="radio"
                    className="btn-check"
                    name="typeFacture"
                    id="typeSolde"
                    value="solde"
                    checked={typeFacture === 'solde'}
                    onChange={(e) => setTypeFacture(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="typeSolde">
                    <i className="bi bi-calculator me-2"></i>
                    Facture de solde
                  </label>
                </div>
              </div>

              {/* Message si facture d'acompte existe */}
              {factureAcompteId && (
                <div className="alert alert-info mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Une facture d'acompte existe déjà pour ce concert (montant : {montantAcompte.toFixed(2)} €).
                  Vous pouvez générer la facture de solde.
                </div>
              )}

              {/* Pourcentage d'acompte */}
              {typeFacture === 'acompte' && (
                <div className="mb-3">
                  <label className="form-label">Pourcentage d'acompte</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={pourcentageAcompte}
                      onChange={(e) => setPourcentageAcompte(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="100"
                      step="5"
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <small className="text-muted">
                    Montant de l'acompte : {((parseFloat(montantHT) || 0) * pourcentageAcompte / 100).toFixed(2)} € HT
                  </small>
                </div>
              )}

              {/* Montant */}
              <div className="mb-3">
                <label className="form-label">
                  {typeFacture === 'complete' ? 'Montant HT *' : 
                   typeFacture === 'acompte' ? 'Montant total HT du concert *' :
                   'Montant total HT du concert *'}
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={montantHT}
                  onChange={(e) => setMontantHT(e.target.value)}
                  placeholder="Montant hors taxes"
                  step="0.01"
                  required
                  disabled={typeFacture === 'solde' && factureAcompteId}
                />
                {typeFacture === 'solde' && (
                  <small className="text-muted">
                    Montant du solde : {((parseFloat(montantHT) || 0) - montantAcompte).toFixed(2)} € HT
                  </small>
                )}
              </div>
              
              {/* Taux TVA */}
              <div className="mb-3">
                <label className="form-label">Taux de TVA</label>
                <select
                  className="form-select"
                  value={tauxTVA}
                  onChange={(e) => setTauxTVA(parseFloat(e.target.value))}
                >
                  <option value={0}>0% (Exonéré)</option>
                  <option value={5.5}>5.5% (Taux réduit)</option>
                  <option value={10}>10% (Taux intermédiaire)</option>
                  <option value={20}>20% (Taux normal)</option>
                </select>
              </div>
              
              {/* Sélection du modèle */}
              <div className="mb-3">
                <label className="form-label">Modèle de facture</label>
                {templates.length > 0 ? (
                  <select
                    className="form-select"
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setSelectedTemplate(template);
                    }}
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault && ' (Par défaut)'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="alert alert-info">
                    Aucun modèle de facture disponible.
                  </div>
                )}
              </div>

              {/* Lignes supplémentaires */}
              <div className="mb-3">
                <label className="form-label">Lignes supplémentaires</label>
                {lignesSupplementaires.map((ligne) => (
                  <div key={ligne.id} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={ligne.type === 'pourcentage' ? "Description (ex: Commission)" : "Description (ex: Frais de route)"}
                      value={ligne.description}
                      onChange={(e) => updateLigneSupplementaire(ligne.id, 'description', e.target.value)}
                    />
                    {ligne.type === 'montant' ? (
                      <>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Montant HT"
                          value={ligne.montant}
                          onChange={(e) => updateLigneSupplementaire(ligne.id, 'montant', e.target.value)}
                          step="0.01"
                          style={{ maxWidth: '150px' }}
                        />
                        <span className="input-group-text">€</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Pourcentage"
                          value={ligne.pourcentage}
                          onChange={(e) => updateLigneSupplementaire(ligne.id, 'pourcentage', e.target.value)}
                          step="0.1"
                          style={{ maxWidth: '100px' }}
                        />
                        <span className="input-group-text">%</span>
                        <span className="input-group-text" style={{ minWidth: '100px' }}>
                          = {((parseFloat(montantHT) || 0) * (parseFloat(ligne.pourcentage) || 0) / 100).toFixed(2)} €
                        </span>
                      </>
                    )}
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={() => supprimerLigneSupplementaire(ligne.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
                <div className="d-flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={ajouterLigneSupplementaire}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Ajouter un montant
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={ajouterLignePourcentage}
                  >
                    <i className="bi bi-percent me-2"></i>
                    Ajouter un pourcentage
                  </Button>
                </div>
                
                {lignesSupplementaires.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Montant total : {calculerMontantTotal().toFixed(2)} € HT
                      {typeFacture === 'acompte' && ` (Acompte : ${(calculerMontantTotal() * pourcentageAcompte / 100).toFixed(2)} € HT)`}
                    </small>
                  </div>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Créer un modèle
                </Button>
                
                {selectedTemplate && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/parametres/factures/${selectedTemplate.id}`)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Modifier le modèle
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Aperçu */}
          {preview && (
            <Card className="mt-4">
              <div className={styles.previewSection}>
                <h4>Aperçu de la facture</h4>
                <div 
                  className={styles.previewContent}
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsSection}>
          <Card>
            <h4>Actions</h4>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={handleGenerateFacture}
                disabled={!selectedTemplate || generating || !montantHT}
              >
                {generating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Générer la facture PDF
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(`/concerts/${concertId}`)}
                disabled={generating}
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal pour créer un nouveau modèle */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Créer un modèle de facture"
        size="xl"
      >
        <FactureTemplateEditor
          onSave={handleCreateTemplate}
          onClose={() => setShowTemplateModal(false)}
          isModalContext={true}
        />
      </Modal>
    </div>
  );
};

export default FactureGenerationPage;