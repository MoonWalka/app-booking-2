# 🎨 Templates Brevo TourCraft - Prêts à Utiliser

> **Instructions** : Copiez le code HTML de chaque template et collez-le directement dans Brevo lors de la création de vos templates transactionnels.

---

## 📋 Template 1 : Envoi Formulaire Programmateur

**Nom du template dans Brevo** : `TourCraft - Formulaire Programmateur`
**Variables utilisées** : `{{params.nomContact}}`, `{{params.nomConcert}}`, `{{params.dateConcert}}`, `{{params.lienFormulaire}}`, `{{params.dateEcheance}}`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulaire TourCraft</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .header .subtitle { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
            font-size: 16px; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .concert-info { 
            background: #f8f9ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #667eea; 
        }
        .concert-info h3 { 
            color: #667eea; 
            margin-top: 0; 
            font-size: 18px; 
        }
        .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 600; 
            font-size: 16px; 
            margin: 20px 0; 
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); 
            transition: transform 0.2s; 
        }
        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); 
        }
        .deadline { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            color: #856404; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center; 
        }
        .deadline strong { 
            color: #d63031; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #6c757d; 
            font-size: 14px; 
            border-top: 1px solid #dee2e6; 
        }
        .icon { 
            font-size: 24px; 
            margin-right: 10px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 TourCraft</h1>
            <div class="subtitle">Plateforme de gestion de concerts</div>
        </div>
        
        <div class="content">
            <h2>Bonjour {{params.nomContact}},</h2>
            
            <p>Nous vous remercions pour votre intérêt concernant l'organisation d'un concert. Nous avons bien reçu votre demande et sommes ravis de pouvoir collaborer avec vous.</p>
            
            <div class="concert-info">
                <h3>🎤 Détails du Concert</h3>
                <p><strong>Événement :</strong> {{params.nomConcert}}</p>
                <p><strong>Date prévue :</strong> {{params.dateConcert}}</p>
                <p><strong>Statut :</strong> En cours de validation</p>
            </div>
            
            <p>Afin de finaliser l'organisation et de préparer tous les documents nécessaires, nous vous invitons à compléter le formulaire de renseignements complémentaires :</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.lienFormulaire}}" class="btn">
                    📝 Compléter le formulaire
                </a>
            </div>
            
            <div class="deadline">
                <strong>⏰ Date limite de réponse :</strong> {{params.dateEcheance}}
            </div>
            
            <p>Ce formulaire nous permettra de :</p>
            <ul>
                <li>✅ Finaliser les détails techniques de votre événement</li>
                <li>✅ Préparer le contrat de prestation</li>
                <li>✅ Coordonner la logistique avec votre équipe</li>
                <li>✅ Vous fournir un devis précis et personnalisé</li>
            </ul>
            
            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter directement.</p>
            
            <p>Nous avons hâte de concrétiser ce projet avec vous !</p>
            
            <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe TourCraft</strong><br>
                <small>Votre partenaire pour des concerts réussis</small>
            </p>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement via TourCraft</p>
            <p>Si vous ne souhaitez plus recevoir ces emails, contactez-nous.</p>
        </div>
    </div>
</body>
</html>
```

---

## 📄 Template 2 : Envoi de Contrat

**Nom du template dans Brevo** : `TourCraft - Contrat Prêt`
**Variables utilisées** : `{{params.nomContact}}`, `{{params.nomConcert}}`, `{{params.dateConcert}}`, `{{params.dateSignature}}`, `{{params.montantCachet}}`, `{{params.lieuNom}}`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat TourCraft</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .contract-info { 
            background: #f0fff4; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border: 2px solid #00b894; 
        }
        .contract-info h3 { 
            color: #00b894; 
            margin-top: 0; 
            font-size: 20px; 
            text-align: center; 
        }
        .info-grid { 
            display: grid; 
            gap: 10px; 
            margin: 15px 0; 
        }
        .info-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px dotted #ddd; 
        }
        .info-label { 
            font-weight: 600; 
            color: #555; 
        }
        .info-value { 
            color: #00b894; 
            font-weight: 500; 
        }
        .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 600; 
            font-size: 16px; 
            margin: 20px 0; 
            box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4); 
        }
        .signature-deadline { 
            background: #e8f5e8; 
            border-left: 4px solid #00b894; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 0 8px 8px 0; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #6c757d; 
            font-size: 14px; 
        }
        .legal-notice { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-size: 14px; 
            border: 1px solid #ffeaa7; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Contrat de Prestation</h1>
            <div style="margin-top: 10px; opacity: 0.9;">TourCraft</div>
        </div>
        
        <div class="content">
            <h2>Bonjour {{params.nomContact}},</h2>
            
            <p>Excellente nouvelle ! Votre contrat de prestation artistique est maintenant prêt et disponible pour signature.</p>
            
            <div class="contract-info">
                <h3>📋 Récapitulatif du Contrat</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">🎵 Événement :</span>
                        <span class="info-value">{{params.nomConcert}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📅 Date :</span>
                        <span class="info-value">{{params.dateConcert}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📍 Lieu :</span>
                        <span class="info-value">{{params.lieuNom}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">💰 Cachet :</span>
                        <span class="info-value">{{params.montantCachet}} €</span>
                    </div>
                </div>
            </div>
            
            <p>Le contrat comprend :</p>
            <ul>
                <li>✅ <strong>Conditions de prestation</strong> - Durée, horaires, matériel technique</li>
                <li>✅ <strong>Modalités financières</strong> - Cachet, acompte, modalités de paiement</li>
                <li>✅ <strong>Clauses techniques</strong> - Son, éclairage, backline</li>
                <li>✅ <strong>Assurances et responsabilités</strong> - Couverture complète</li>
                <li>✅ <strong>Conditions d'annulation</strong> - Force majeure, météo</li>
            </ul>
            
            <div class="signature-deadline">
                <h4 style="margin-top: 0; color: #00b894;">⏰ Signature Requise</h4>
                <p style="margin: 0;"><strong>Date limite de signature :</strong> {{params.dateSignature}}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                    Merci de nous retourner le contrat signé avant cette date pour confirmer définitivement votre prestation.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">
                    📝 Télécharger et Signer le Contrat
                </a>
            </div>
            
            <div class="legal-notice">
                <h4 style="margin-top: 0;">📌 Important</h4>
                <p style="margin: 0; font-size: 13px;">
                    Ce contrat a été établi selon les standards de l'industrie musicale et respecte la législation en vigueur. 
                    En cas de questions juridiques, n'hésitez pas à consulter votre conseil habituel.
                </p>
            </div>
            
            <p>Pour toute question concernant ce contrat ou pour demander des modifications, contactez-nous immédiatement.</p>
            
            <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe TourCraft</strong><br>
                <small>🎤 Production & Management</small>
            </p>
        </div>
        
        <div class="footer">
            <p>Contrat généré automatiquement via TourCraft</p>
            <p>Document confidentiel - Destiné uniquement à {{params.nomContact}}</p>
        </div>
    </div>
</body>
</html>
```

---

## 🔔 Template 3 : Relance Documents Manquants

**Nom du template dans Brevo** : `TourCraft - Relance Documents`
**Variables utilisées** : `{{params.nomContact}}`, `{{params.nomConcert}}`, `{{params.dateConcert}}`, `{{params.sujet}}`, `{{params.message}}`, `{{params.documentsManquants}}`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relance TourCraft</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .urgency-banner { 
            background: linear-gradient(135deg, #e17055 0%, #d63031 100%); 
            color: white; 
            padding: 20px; 
            margin: -20px -20px 25px -20px; 
            text-align: center; 
            font-weight: 600; 
            font-size: 18px; 
        }
        .concert-info { 
            background: #fef9e7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #fdcb6e; 
        }
        .missing-docs { 
            background: #fff5f5; 
            border: 2px solid #fed7d7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
        }
        .missing-docs h4 { 
            color: #c53030; 
            margin-top: 0; 
            font-size: 18px; 
        }
        .missing-docs ul { 
            color: #2d3748; 
            margin: 15px 0; 
        }
        .missing-docs li { 
            margin: 8px 0; 
            padding-left: 10px; 
        }
        .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 600; 
            font-size: 16px; 
            margin: 20px 0; 
            box-shadow: 0 4px 15px rgba(253, 203, 110, 0.4); 
        }
        .timeline { 
            background: #e8f5e8; 
            border-left: 4px solid #48bb78; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 0 8px 8px 0; 
        }
        .contact-info { 
            background: #f7fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border: 1px solid #e2e8f0; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #6c757d; 
            font-size: 14px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Relance Importante</h1>
            <div style="margin-top: 10px; opacity: 0.9;">TourCraft</div>
        </div>
        
        <div class="content">
            <div class="urgency-banner">
                🚨 ACTION REQUISE - Documents manquants
            </div>
            
            <h2>Bonjour {{params.nomContact}},</h2>
            
            <p><strong>Objet :</strong> {{params.sujet}}</p>
            
            <div class="concert-info">
                <h3>🎵 Concert Concerné</h3>
                <p><strong>Événement :</strong> {{params.nomConcert}}</p>
                <p><strong>Date :</strong> {{params.dateConcert}}</p>
                <p><strong>Statut :</strong> ⏳ En attente de documents</p>
            </div>
            
            <p>{{params.message}}</p>
            
            <div class="missing-docs">
                <h4>📋 Documents Manquants</h4>
                <p>Pour finaliser l'organisation de votre concert, nous avons besoin des éléments suivants :</p>
                <ul>
                    <li>📄 Fiche technique complétée</li>
                    <li>🎤 Liste du matériel backline requis</li>
                    <li>👥 Liste définitive des musiciens</li>
                    <li>🏨 Besoins en hébergement et restauration</li>
                    <li>🚐 Informations transport/déchargement</li>
                    <li>📋 Rider technique et artistique</li>
                </ul>
                <p><small><em>Cette liste peut varier selon votre situation spécifique.</em></small></p>
            </div>
            
            <div class="timeline">
                <h4 style="margin-top: 0; color: #48bb78;">⏰ Planning Critique</h4>
                <p>Afin de respecter les délais de production et assurer le bon déroulement de votre événement, 
                nous devons recevoir ces documents <strong>dans les plus brefs délais</strong>.</p>
                <p style="margin: 0;">
                    <strong>Date limite recommandée :</strong> 15 jours avant le concert<br>
                    <strong>Date limite absolue :</strong> 7 jours avant le concert
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">
                    📤 Envoyer les Documents
                </a>
            </div>
            
            <div class="contact-info">
                <h4 style="margin-top: 0;">💬 Besoin d'Aide ?</h4>
                <p>Si vous avez des questions ou rencontrez des difficultés pour rassembler ces documents :</p>
                <ul style="margin: 10px 0;">
                    <li>📞 <strong>Téléphone :</strong> Contactez-nous directement</li>
                    <li>📧 <strong>Email :</strong> Répondez à cet email</li>
                    <li>💬 <strong>WhatsApp :</strong> Pour un échange rapide</li>
                </ul>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    Notre équipe est là pour vous accompagner dans la préparation de votre concert.
                </p>
            </div>
            
            <p>Nous comptons sur votre réactivité pour garantir le succès de cet événement.</p>
            
            <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe Production TourCraft</strong><br>
                <small>📞 Toujours disponible pour vous accompagner</small>
            </p>
        </div>
        
        <div class="footer">
            <p>Relance automatique envoyée via TourCraft</p>
            <p>Cet email nécessite une action de votre part</p>
        </div>
    </div>
</body>
</html>
```

---

## ✅ Template 4 : Confirmation Concert Finalisé

**Nom du template dans Brevo** : `TourCraft - Confirmation Concert`
**Variables utilisées** : `{{params.nomContact}}`, `{{params.nomConcert}}`, `{{params.dateConcert}}`, `{{params.heureArrivee}}`, `{{params.lieuNom}}`, `{{params.lieuAdresse}}`, `{{params.contactProduction}}`, `{{params.telephoneProduction}}`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation Concert TourCraft</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .success-banner { 
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-weight: 600; 
            font-size: 20px; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .concert-details { 
            background: #f8f7ff; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border: 2px solid #a29bfe; 
        }
        .concert-details h3 { 
            color: #6c5ce7; 
            margin-top: 0; 
            font-size: 22px; 
            text-align: center; 
        }
        .detail-grid { 
            display: grid; 
            gap: 15px; 
            margin: 20px 0; 
        }
        .detail-item { 
            display: flex; 
            align-items: center; 
            padding: 12px; 
            background: white; 
            border-radius: 8px; 
            border: 1px solid #e0e7ff; 
        }
        .detail-icon { 
            font-size: 24px; 
            margin-right: 15px; 
            width: 30px; 
        }
        .detail-content { 
            flex: 1; 
        }
        .detail-label { 
            font-size: 12px; 
            color: #666; 
            text-transform: uppercase; 
            font-weight: 600; 
            margin-bottom: 2px; 
        }
        .detail-value { 
            font-size: 16px; 
            color: #333; 
            font-weight: 500; 
        }
        .checklist { 
            background: #f0fff4; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #00b894; 
        }
        .checklist h4 { 
            color: #00b894; 
            margin-top: 0; 
        }
        .checklist-item { 
            display: flex; 
            align-items: center; 
            margin: 10px 0; 
            padding: 8px; 
            background: white; 
            border-radius: 6px; 
        }
        .contact-production { 
            background: #fff3cd; 
            border: 2px solid #ffeaa7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
        }
        .contact-production h4 { 
            color: #856404; 
            margin-top: 0; 
        }
        .emergency-contact { 
            background: #f8d7da; 
            border: 1px solid #f5c6cb; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #6c757d; 
            font-size: 14px; 
        }
        .btn { 
            display: inline-block; 
            padding: 12px 25px; 
            background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 25px; 
            font-weight: 600; 
            font-size: 14px; 
            margin: 10px 5px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Concert Confirmé !</h1>
            <div style="margin-top: 10px; opacity: 0.9;">TourCraft</div>
        </div>
        
        <div class="success-banner">
            ✅ Votre concert est officiellement confirmé et organisé !
        </div>
        
        <div class="content">
            <h2>Félicitations {{params.nomContact}} !</h2>
            
            <p>Toutes les formalités sont terminées et votre concert est maintenant officiellement confirmé. 
            Voici tous les détails pour le jour J :</p>
            
            <div class="concert-details">
                <h3>🎵 {{params.nomConcert}}</h3>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-icon">📅</div>
                        <div class="detail-content">
                            <div class="detail-label">Date & Heure</div>
                            <div class="detail-value">{{params.dateConcert}}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">🕐</div>
                        <div class="detail-content">
                            <div class="detail-label">Heure d'arrivée</div>
                            <div class="detail-value">{{params.heureArrivee}}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">📍</div>
                        <div class="detail-content">
                            <div class="detail-label">Lieu</div>
                            <div class="detail-value">{{params.lieuNom}}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">🗺️</div>
                        <div class="detail-content">
                            <div class="detail-label">Adresse</div>
                            <div class="detail-value">{{params.lieuAdresse}}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="checklist">
                <h4>📋 Checklist Jour J - Tout est Prêt !</h4>
                <div class="checklist-item">
                    ✅ <strong>Contrat signé</strong> - Documents officiels validés
                </div>
                <div class="checklist-item">
                    ✅ <strong>Technique confirmée</strong> - Son, éclairage, backline
                </div>
                <div class="checklist-item">
                    ✅ <strong>Planning établi</strong> - Balances, soundcheck, show
                </div>
                <div class="checklist-item">
                    ✅ <strong>Logistique organisée</strong> - Accès, déchargement, loges
                </div>
                <div class="checklist-item">
                    ✅ <strong>Équipe mobilisée</strong> - Techniciens, régisseurs, sécurité
                </div>
            </div>
            
            <div class="contact-production">
                <h4>👨‍💼 Contact Production - Jour J</h4>
                <p><strong>Votre référent :</strong> {{params.contactProduction}}</p>
                <p><strong>Téléphone direct :</strong> {{params.telephoneProduction}}</p>
                <p style="margin: 0; font-size: 14px;">
                    Disponible 24h/24 le jour du concert pour toute question ou urgence.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">📱 Infos de Contact</a>
                <a href="#" class="btn">🗺️ Plan d'Accès</a>
                <a href="#" class="btn">📋 Planning Détaillé</a>
            </div>
            
            <div class="emergency-contact">
                <h4 style="margin-top: 0; color: #721c24;">🚨 Urgence Jour J</h4>
                <p style="margin: 0; font-weight: 600;">
                    En cas d'urgence le jour du concert :<br>
                    📞 <strong>{{params.telephoneProduction}}</strong>
                </p>
            </div>
            
            <p><strong>Derniers conseils :</strong></p>
            <ul>
                <li>🕐 Arrivez 15 minutes avant l'heure convenue</li>
                <li>📱 Gardez votre téléphone chargé et accessible</li>
                <li>🎵 Préparez votre matériel et vérifiez votre setlist</li>
                <li>😊 Profitez de ce moment, tout est organisé pour vous !</li>
            </ul>
            
            <p>Nous sommes impatients de vivre ce concert avec vous et de contribuer au succès de votre événement !</p>
            
            <p style="margin-top: 30px;">
                À très bientôt,<br>
                <strong>Toute l'équipe TourCraft</strong><br>
                <small>🎤 Fiers de vous accompagner dans votre succès</small>
            </p>
        </div>
        
        <div class="footer">
            <p>Concert confirmé via TourCraft</p>
            <p>Conservez cet email comme confirmation officielle</p>
        </div>
    </div>
</body>
</html>
```

---

## 📝 Variables TourCraft Disponibles

### Variables Communes
```
{{params.nomContact}}          - Nom du contact principal
{{params.emailContact}}        - Email du contact
{{params.telephoneContact}}    - Téléphone du contact
{{params.nomConcert}}          - Titre/nom du concert
{{params.dateConcert}}         - Date formatée du concert
{{params.heureConcert}}        - Heure du concert
{{params.lieuNom}}            - Nom du lieu
{{params.lieuAdresse}}        - Adresse complète du lieu
{{params.lieuVille}}          - Ville du lieu
{{params.organizationNom}}    - Nom de votre organisation
```

### Variables Spécifiques par Template

**Formulaire :**
- `{{params.lienFormulaire}}` - URL du formulaire à compléter
- `{{params.dateEcheance}}` - Date limite de réponse

**Contrat :**
- `{{params.montantCachet}}` - Montant du cachet
- `{{params.dateSignature}}` - Date limite de signature
- `{{params.modalitesPaiement}}` - Conditions de paiement

**Relance :**
- `{{params.sujet}}` - Sujet de la relance
- `{{params.message}}` - Message personnalisé
- `{{params.documentsManquants}}` - Liste des documents requis

**Confirmation :**
- `{{params.heureArrivee}}` - Heure d'arrivée prévue
- `{{params.contactProduction}}` - Nom du responsable production
- `{{params.telephoneProduction}}` - Téléphone direct production

---

## 🚀 Instructions d'Usage

1. **Copiez** le code HTML du template souhaité
2. **Connectez-vous** à [app.brevo.com](https://app.brevo.com)
3. **Allez** dans **Campaigns** → **Templates** → **Create Template**
4. **Choisissez** "Transactional email template"
5. **Collez** le code HTML dans l'éditeur
6. **Sauvegardez** avec un nom explicite
7. **Testez** avec des données de démonstration
8. **Configurez** dans TourCraft → Paramètres → Email

Ces templates sont prêts à l'emploi et peuvent être personnalisés selon vos besoins !