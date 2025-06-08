# Service Email

Le service email permet d'envoyer des emails transactionnels depuis l'application TourCraft via SMTP.

## Architecture

Le service utilise une architecture en deux parties :
- **Backend** : Cloud Function `sendEmail` utilisant nodemailer
- **Frontend** : Service `emailService.js` qui appelle la Cloud Function

## Installation et Configuration

### 1. Configuration des variables d'environnement

#### Pour le développement local

Créez un fichier `.env` dans le dossier `functions/` :

```bash
# Copier le fichier exemple
cp functions/.env.example functions/.env

# Éditer avec vos paramètres SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM="TourCraft" <noreply@tourcraft.app>
```

#### Pour la production (Firebase)

```bash
# Configurer les variables Firebase
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="votre-email@gmail.com"
firebase functions:config:set smtp.pass="votre-mot-de-passe-app"
firebase functions:config:set smtp.from="TourCraft <noreply@tourcraft.app>"
```

### 2. Configuration Gmail (recommandé)

1. Activez la vérification en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `SMTP_PASS`

### 3. Autres fournisseurs SMTP

- **SendGrid** : `smtp.sendgrid.net` (port 587)
- **Mailgun** : `smtp.mailgun.org` (port 587)
- **Amazon SES** : `email-smtp.[region].amazonaws.com` (port 587)
- **OVH** : `ssl0.ovh.net` (port 587)

## Utilisation

### Import du service

```javascript
import emailService from '@/services/emailService';
// ou
import { sendMail, sendContractEmail } from '@/services/emailService';
```

### Envoi d'un email simple

```javascript
try {
  const result = await emailService.sendMail({
    to: 'destinataire@example.com',
    subject: 'Sujet de l\'email',
    html: '<h1>Bonjour</h1><p>Contenu de l\'email</p>',
    text: 'Bonjour, Contenu de l\'email' // Fallback texte optionnel
  });
  
  console.log('Email envoyé:', result.messageId);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Envoi avec template

#### Template Formulaire

```javascript
await emailService.sendFormEmail({
  to: 'contact@example.com',
  nomContact: 'Jean Dupont',
  nomConcert: 'Concert Rock Festival',
  lienFormulaire: 'https://tourcraft.app/form/abc123',
  dateEcheance: '15/01/2025'
});
```

#### Template Contrat

```javascript
await emailService.sendContractEmail({
  to: 'contact@example.com',
  nomContact: 'Jean Dupont',
  nomConcert: 'Concert Rock Festival',
  dateSignature: '20/01/2025'
});
```

#### Template Relance

```javascript
await emailService.sendRelanceEmail({
  to: 'contact@example.com',
  nomContact: 'Jean Dupont',
  sujet: 'Rappel signature contrat',
  message: 'Nous attendons toujours votre signature...'
});
```

### Envoi avec pièces jointes

```javascript
// Avec un PDF en base64
const pdfContent = await generatePDF(); // Votre fonction de génération

await emailService.sendMail({
  to: 'contact@example.com',
  subject: 'Contrat en pièce jointe',
  html: '<p>Veuillez trouver le contrat ci-joint</p>',
  attachments: [{
    filename: 'contrat.pdf',
    content: pdfContent,
    encoding: 'base64'
  }]
});
```

### Email de test

```javascript
// Utile pour vérifier la configuration
await emailService.sendTestEmail('test@example.com');
```

## Intégration dans les workflows

### Workflow Concert

Dans le processus de création/édition de concert :

```javascript
// Après validation du formulaire
if (concertData.sendFormToContact) {
  await emailService.sendFormEmail({
    to: contact.email,
    nomContact: contact.nom,
    nomConcert: concert.titre,
    lienFormulaire: formUrl,
    dateEcheance: concert.dateEcheance
  });
}
```

### Workflow Contrat

Lors de la génération du contrat :

```javascript
// Après génération du PDF
if (contratData.sendByEmail) {
  await emailService.sendContractEmail({
    to: contact.email,
    nomContact: contact.nom,
    nomConcert: concert.titre,
    dateSignature: contrat.dateSignature,
    attachment: {
      content: pdfBase64
    }
  });
}
```

### Système de relances

Dans le service de relances automatiques :

```javascript
// Pour chaque relance à envoyer
for (const relance of relancesAEnvoyer) {
  await emailService.sendRelanceEmail({
    to: relance.contact.email,
    nomContact: relance.contact.nom,
    sujet: relance.sujet,
    message: relance.message
  });
  
  // Marquer comme envoyée
  await updateRelanceStatus(relance.id, 'sent');
}
```

## Gestion des erreurs

Le service gère automatiquement :
- Validation des adresses email
- Retry automatique (3 tentatives)
- Logs détaillés
- Messages d'erreur explicites

```javascript
try {
  await emailService.sendMail(data);
} catch (error) {
  if (error.message.includes('Configuration SMTP')) {
    // Erreur de configuration
  } else if (error.message.includes('Adresse email invalide')) {
    // Email invalide
  } else {
    // Autre erreur
  }
}
```

## Monitoring et logs

Les logs sont disponibles dans :
- **Développement** : Console du navigateur et terminal Firebase
- **Production** : Firebase Functions logs

```bash
# Voir les logs
firebase functions:log

# Suivre en temps réel
firebase functions:log --follow
```

## Limites et quotas

- **Timeout** : 60 secondes par email
- **Taille max** : 10MB par email (incluant pièces jointes)
- **Rate limit** : Dépend du fournisseur SMTP

## Sécurité

- Les credentials SMTP ne sont jamais exposés côté client
- Validation des adresses email
- Sanitization des noms de fichiers
- CORS configuré pour votre domaine uniquement

## Templates personnalisés

Pour ajouter un nouveau template, modifiez `functions/sendMail.js` :

```javascript
const emailTemplates = {
  // ... templates existants
  
  monTemplate: (data) => {
    return {
      subject: `Sujet: ${data.titre}`,
      html: `<html>...</html>`
    };
  }
};
```

## Troubleshooting

### Erreur "Configuration SMTP manquante"
- Vérifiez les variables d'environnement
- Redéployez les functions après configuration

### Emails non reçus
- Vérifiez les spams
- Testez avec un email de test
- Vérifiez les logs Firebase

### Erreur d'authentification
- Gmail : Utilisez un mot de passe d'application
- Vérifiez que l'authentification 2FA est activée