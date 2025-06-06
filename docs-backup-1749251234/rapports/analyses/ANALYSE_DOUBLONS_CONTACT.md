# ANALYSE DES DOUBLONS CONTACT

**Date:** 05/06/2025 04:52:28

## 📄 CONTACT DETAILS

### ./src/components/contacts/ContactDetails.js
- **Lignes:** 75
- **Taille:** 2074 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactDetails
- **Usages:** 49
- **Technologies:** React, useEffect

**Utilisé dans:**
- `./src/components/concerts/desktop/ConcertOrganizerSection.js:  navigateToContactDetails,`
- `./src/components/concerts/desktop/ConcertOrganizerSection.js:          onClick={() => navigateToContactDetails(contact.id)}`
- `./src/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.js:  navigateToContactDetails,`
- `./src/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.js:                  onClick={() => navigateToContactDetails(contact.id)}`
- `./src/components/concerts/mobile/ConcertView.js:          navigateToContactDetails={(progId) => navigate(`/contacts/${progId}`)}`

### ./src/components/contacts/ContactDetailsModern.js
- **Lignes:** 34
- **Taille:** 1105 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactDetailsModern
- **Usages:** 4
- **Technologies:** React

**Utilisé dans:**
- `./src/components/contacts/desktop/ContactViewModern.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewModern.js:  const detailsHook = useContactDetailsModern(id);`
- `./src/components/contacts/desktop/ContactViewV2.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewV2.js:  const detailsHook = useContactDetailsModern(id);`

### ./src/components/contacts/mobile/ContactDetails.js
- **Lignes:** 13
- **Taille:** 351 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactDetails
- **Usages:** 49
- **Technologies:** React

**Utilisé dans:**
- `./src/components/concerts/desktop/ConcertOrganizerSection.js:  navigateToContactDetails,`
- `./src/components/concerts/desktop/ConcertOrganizerSection.js:          onClick={() => navigateToContactDetails(contact.id)}`
- `./src/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.js:  navigateToContactDetails,`
- `./src/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.js:                  onClick={() => navigateToContactDetails(contact.id)}`
- `./src/components/concerts/mobile/ConcertView.js:          navigateToContactDetails={(progId) => navigate(`/contacts/${progId}`)}`

### ./src/hooks/contacts/useContactDetails.js
- **Lignes:** 316
- **Taille:** 12162 bytes
- **Modifié:** 6/5/2025
- **Composant:** details
- **Usages:** 36
- **Technologies:** useState, useEffect

**Utilisé dans:**
- `./src/components/contacts/desktop/ContactViewModern.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewModern.js:  const detailsHook = useContactDetailsModern(id);`
- `./src/components/contacts/desktop/ContactViewV2.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewV2.js:  const detailsHook = useContactDetailsModern(id);`
- `./src/components/contacts/mobile/ContactView.js:import { useContactDetails } from '@/hooks/contacts';`

### ./src/hooks/contacts/useContactDetailsModern.js
- **Lignes:** 490
- **Taille:** 18954 bytes
- **Modifié:** 6/5/2025
- **Composant:** useContactDetailsModern
- **Usages:** 4
- **Technologies:** Aucune détectée

**Utilisé dans:**
- `./src/components/contacts/desktop/ContactViewModern.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewModern.js:  const detailsHook = useContactDetailsModern(id);`
- `./src/components/contacts/desktop/ContactViewV2.js:import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';`
- `./src/components/contacts/desktop/ContactViewV2.js:  const detailsHook = useContactDetailsModern(id);`


## 👁️ CONTACT VIEW

### ./src/components/contacts/desktop/ContactView.js
- **Lignes:** 167
- **Taille:** 5719 bytes
- **Modifié:** 6/5/2025
- **Composant:** ContactView
- **Usages:** 32
- **Technologies:** React, useState, CSS Modules, Bootstrap Icons

**Utilisé dans:**
- `./src/components/contacts/ContactDetailsModern.js:import ContactDesktopView from './desktop/ContactViewModern';`
- `./src/components/contacts/ContactDetailsModern.js:import ContactMobileView from './mobile/ContactView';`
- `./src/components/contacts/desktop/ContactViewModern.js:// src/components/contacts/desktop/ContactViewModern.js`
- `./src/components/contacts/desktop/ContactViewModern.js:import styles from './ContactViewModern.module.css';`
- `./src/components/contacts/desktop/ContactViewModern.js:function ContactViewModern({ id: propId }) {`

### ./src/components/contacts/desktop/ContactViewModern.js
- **Lignes:** 286
- **Taille:** 10114 bytes
- **Modifié:** 6/5/2025
- **Composant:** navigate
- **Usages:** 1
- **Technologies:** React, CSS Modules, Bootstrap Icons

**Utilisé dans:**
- `./src/components/contacts/ContactDetailsModern.js:import ContactDesktopView from './desktop/ContactViewModern';`

### ./src/components/contacts/desktop/ContactViewV2.js
- **Lignes:** 243
- **Taille:** 9428 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactViewV2
- **Usages:** 0
- **Technologies:** React, useState, CSS Modules

**Aucun usage détecté**

### ./src/components/contacts/mobile/ContactView.js
- **Lignes:** 224
- **Taille:** 6864 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactView
- **Usages:** 32
- **Technologies:** React, Bootstrap Icons

**Utilisé dans:**
- `./src/components/contacts/ContactDetailsModern.js:import ContactDesktopView from './desktop/ContactViewModern';`
- `./src/components/contacts/ContactDetailsModern.js:import ContactMobileView from './mobile/ContactView';`
- `./src/components/contacts/desktop/ContactViewModern.js:// src/components/contacts/desktop/ContactViewModern.js`
- `./src/components/contacts/desktop/ContactViewModern.js:import styles from './ContactViewModern.module.css';`
- `./src/components/contacts/desktop/ContactViewModern.js:function ContactViewModern({ id: propId }) {`


## 📝 CONTACT FORM

### ./src/components/contacts/ContactForm.js
- **Lignes:** 25
- **Taille:** 643 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactForm
- **Usages:** 28
- **Technologies:** React

**Utilisé dans:**
- `./src/utils/validation.js:export const validateContactForm = (data) => {`
- `./src/components/contacts/sections/StructureInfoSection.js:  formData = null, // Support hook useContactForm`
- `./src/components/contacts/sections/StructureInfoSection.js:  handleChange = null, // Handler pour useContactForm`
- `./src/components/contacts/sections/ContactFormHeader.js:import styles from './ContactFormHeader.module.css';`
- `./src/components/contacts/sections/ContactFormHeader.js: * ContactFormHeader - En-tête du formulaire de contact`

### ./src/components/contacts/desktop/ContactForm.js
- **Lignes:** 354
- **Taille:** 11378 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactForm
- **Usages:** 28
- **Technologies:** React, CSS Modules

**Utilisé dans:**
- `./src/utils/validation.js:export const validateContactForm = (data) => {`
- `./src/components/contacts/sections/StructureInfoSection.js:  formData = null, // Support hook useContactForm`
- `./src/components/contacts/sections/StructureInfoSection.js:  handleChange = null, // Handler pour useContactForm`
- `./src/components/contacts/sections/ContactFormHeader.js:import styles from './ContactFormHeader.module.css';`
- `./src/components/contacts/sections/ContactFormHeader.js: * ContactFormHeader - En-tête du formulaire de contact`

### ./src/components/contacts/desktop/ContactFormMaquette.js
- **Lignes:** 1046
- **Taille:** 42379 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactFormMaquette
- **Usages:** 3
- **Technologies:** React, useState, useEffect, CSS Modules, Bootstrap Icons

**Utilisé dans:**
- `./src/pages/ContactsPage.js:import ContactFormMaquette from '@/components/contacts/desktop/ContactFormMaquette';`
- `./src/pages/ContactsPage.js:        <Route path="/nouveau" element={<ContactFormMaquette />} />`
- `./src/pages/ContactsPage.js:        <Route path="/:id/edit" element={<ContactFormMaquette />} />`

### ./src/components/contacts/mobile/ContactForm.js
- **Lignes:** 443
- **Taille:** 13132 bytes
- **Modifié:** 6/4/2025
- **Composant:** ContactInfoStep
- **Usages:** 28
- **Technologies:** React, useState, useEffect, CSS Modules

**Utilisé dans:**
- `./src/utils/validation.js:export const validateContactForm = (data) => {`
- `./src/components/contacts/sections/StructureInfoSection.js:  formData = null, // Support hook useContactForm`
- `./src/components/contacts/sections/StructureInfoSection.js:  handleChange = null, // Handler pour useContactForm`
- `./src/components/contacts/sections/ContactFormHeader.js:import styles from './ContactFormHeader.module.css';`
- `./src/components/contacts/sections/ContactFormHeader.js: * ContactFormHeader - En-tête du formulaire de contact`

### ./src/hooks/contacts/useContactForm.js
- **Lignes:** 300
- **Taille:** 9967 bytes
- **Modifié:** 6/4/2025
- **Composant:** useContactForm
- **Usages:** 5
- **Technologies:** useState

**Utilisé dans:**
- `./src/components/contacts/sections/StructureInfoSection.js:  formData = null, // Support hook useContactForm`
- `./src/components/contacts/sections/StructureInfoSection.js:  handleChange = null, // Handler pour useContactForm`
- `./src/components/contacts/desktop/ContactForm.js:import { useContactForm } from '@/hooks/contacts';`
- `./src/components/contacts/desktop/ContactForm.js:  } = useContactForm(contactId);`
- `./src/hooks/contacts/index.js:export { default as useContactForm } from './useContactForm';`


## 🎯 RECOMMANDATIONS DE CONSOLIDATION

### Stratégie recommandée:

1. **ContactView** - Utiliser comme version principale:
   - `./src/components/contacts/desktop/ContactView.js` (déjà utilisé dans ContactsPage)
   
2. **ContactForm** - Utiliser comme version principale:
   - `./src/components/contacts/desktop/ContactFormMaquette.js` (déjà utilisé dans ContactsPage)

3. **Fichiers à supprimer (après vérification):**
   - Versions non utilisées ou obsolètes
   - Fichiers de migration temporaires

### Plan d'action:

1. **Phase 1:** Identifier les versions actives
2. **Phase 2:** Migrer les dernières dépendances
3. **Phase 3:** Supprimer les doublons
4. **Phase 4:** Mettre à jour la documentation

---
*Analyse automatisée le 05/06/2025 04:52:28*
