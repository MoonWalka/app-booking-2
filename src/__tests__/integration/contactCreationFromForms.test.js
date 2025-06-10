import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase-service';
import { AuthContext } from '../../context/AuthContext';
import { OrganizationContext } from '../../context/OrganizationContext';
import LieuForm from '../../components/lieux/LieuForm';
import ConcertForm from '../../components/concerts/ConcertForm';
import ContactsList from '../../components/contacts/ContactsList';

// Mock user et organisation pour les tests
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com'
};

const mockOrganization = {
  id: 'test-org-id',
  nom: 'Test Organization'
};

// Helper pour nettoyer les données de test
const cleanupTestData = async () => {
  const collections = ['contacts', 'lieux', 'concerts'];
  
  for (const collectionName of collections) {
    const q = query(
      collection(db, collectionName),
      where('organizationId', '==', mockOrganization.id)
    );
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
  }
};

// Wrapper pour les tests avec contexts
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={{ user: mockUser }}>
      <OrganizationContext.Provider value={{ 
        currentOrganization: mockOrganization,
        organizations: [mockOrganization]
      }}>
        {children}
      </OrganizationContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Création de contacts depuis différents formulaires', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Création de contact depuis le formulaire Lieu', () => {
    it('devrait créer un contact et l\'associer au lieu avec relations bidirectionnelles', async () => {
      const user = userEvent.setup();
      let lieuId = null;
      let contactId = null;

      render(
        <TestWrapper>
          <LieuForm />
        </TestWrapper>
      );

      // Remplir les champs du lieu
      const nomInput = screen.getByLabelText(/nom du lieu/i);
      await user.type(nomInput, 'Salle de concert Test');

      // Chercher un contact qui n'existe pas
      const contactSearch = screen.getByPlaceholderText(/rechercher un contact/i);
      await user.type(contactSearch, 'Jean Dupont Test');

      // Attendre que le bouton "Nouveau contact" apparaisse
      await waitFor(() => {
        expect(screen.getByText(/nouveau contact/i)).toBeInTheDocument();
      });

      // Cliquer sur "Nouveau contact"
      const newContactButton = screen.getByText(/nouveau contact/i);
      await user.click(newContactButton);

      // Vérifier que le contact est ajouté à la liste
      await waitFor(() => {
        expect(screen.getByText('Jean Dupont Test')).toBeInTheDocument();
      });

      // Sauvegarder le lieu
      const saveButton = screen.getByText(/enregistrer/i);
      await user.click(saveButton);

      // Attendre la création et récupérer les IDs
      await waitFor(async () => {
        // Vérifier que le lieu a été créé
        const lieuxQuery = query(
          collection(db, 'lieux'),
          where('nom', '==', 'Salle de concert Test'),
          where('organizationId', '==', mockOrganization.id)
        );
        const lieuxSnapshot = await getDocs(lieuxQuery);
        expect(lieuxSnapshot.size).toBe(1);
        lieuId = lieuxSnapshot.docs[0].id;

        // Vérifier que le contact a été créé
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('nom', '==', 'Jean Dupont Test'),
          where('organizationId', '==', mockOrganization.id)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        expect(contactsSnapshot.size).toBe(1);
        contactId = contactsSnapshot.docs[0].id;
      }, { timeout: 10000 });

      // Vérifier les relations bidirectionnelles
      await waitFor(async () => {
        // Vérifier que le lieu contient le contact
        const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
        const lieuData = lieuDoc.data();
        expect(lieuData.contactIds).toContain(contactId);

        // Vérifier que le contact contient le lieu
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        const contactData = contactDoc.data();
        expect(contactData.lieuxIds).toContain(lieuId);
      });

      // Vérifier que le contact apparaît dans la liste des contacts
      render(
        <TestWrapper>
          <ContactsList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont Test')).toBeInTheDocument();
      });
    });
  });

  describe('Création de contact depuis le formulaire Concert', () => {
    it('devrait créer un contact et l\'associer au concert avec relations bidirectionnelles', async () => {
      const user = userEvent.setup();
      let concertId = null;
      let contactId = null;

      render(
        <TestWrapper>
          <ConcertForm />
        </TestWrapper>
      );

      // Remplir les champs du concert
      const nomInput = screen.getByLabelText(/nom du concert/i);
      await user.type(nomInput, 'Festival Test 2024');

      // Ajouter une date
      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, '2024-12-31');

      // Chercher un contact qui n'existe pas
      const contactSearch = screen.getByPlaceholderText(/rechercher un contact/i);
      await user.type(contactSearch, 'Marie Martin Test');

      // Attendre que le bouton "Nouveau contact" apparaisse
      await waitFor(() => {
        expect(screen.getByText(/nouveau contact/i)).toBeInTheDocument();
      });

      // Cliquer sur "Nouveau contact"
      const newContactButton = screen.getByText(/nouveau contact/i);
      await user.click(newContactButton);

      // Vérifier que le contact est ajouté
      await waitFor(() => {
        expect(screen.getByText('Marie Martin Test')).toBeInTheDocument();
      });

      // Sauvegarder le concert
      const saveButton = screen.getByText(/enregistrer/i);
      await user.click(saveButton);

      // Attendre la création et récupérer les IDs
      await waitFor(async () => {
        // Vérifier que le concert a été créé
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('nom', '==', 'Festival Test 2024'),
          where('organizationId', '==', mockOrganization.id)
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        expect(concertsSnapshot.size).toBe(1);
        concertId = concertsSnapshot.docs[0].id;

        // Vérifier que le contact a été créé
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('nom', '==', 'Marie Martin Test'),
          where('organizationId', '==', mockOrganization.id)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        expect(contactsSnapshot.size).toBe(1);
        contactId = contactsSnapshot.docs[0].id;
      }, { timeout: 10000 });

      // Vérifier les relations bidirectionnelles
      await waitFor(async () => {
        // Vérifier que le concert contient le contact
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        const concertData = concertDoc.data();
        expect(concertData.contactId).toBe(contactId);

        // Vérifier que le contact contient le concert
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        const contactData = contactDoc.data();
        expect(contactData.concertsIds).toContain(concertId);
      });
    });
  });

  describe('Création de contact partagé entre plusieurs entités', () => {
    it('devrait permettre d\'associer le même contact à un lieu ET un concert', async () => {
      const user = userEvent.setup();
      let lieuId = null;
      let concertId = null;
      let contactId = null;

      // Étape 1: Créer un lieu avec un nouveau contact
      render(
        <TestWrapper>
          <LieuForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/nom du lieu/i), 'Lieu Partagé Test');
      await user.type(screen.getByPlaceholderText(/rechercher un contact/i), 'Contact Partagé Test');
      
      await waitFor(() => {
        expect(screen.getByText(/nouveau contact/i)).toBeInTheDocument();
      });
      
      await user.click(screen.getByText(/nouveau contact/i));
      await user.click(screen.getByText(/enregistrer/i));

      // Récupérer les IDs
      await waitFor(async () => {
        const lieuxQuery = query(
          collection(db, 'lieux'),
          where('nom', '==', 'Lieu Partagé Test')
        );
        const lieuxSnapshot = await getDocs(lieuxQuery);
        lieuId = lieuxSnapshot.docs[0].id;

        const contactsQuery = query(
          collection(db, 'contacts'),
          where('nom', '==', 'Contact Partagé Test')
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        contactId = contactsSnapshot.docs[0].id;
      });

      // Étape 2: Créer un concert et associer le contact existant
      render(
        <TestWrapper>
          <ConcertForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/nom du concert/i), 'Concert Partagé Test');
      await user.type(screen.getByLabelText(/date/i), '2024-12-31');
      
      // Rechercher le contact existant
      const contactSearch = screen.getByPlaceholderText(/rechercher un contact/i);
      await user.type(contactSearch, 'Contact Partagé');

      // Le contact existant devrait apparaître dans les résultats
      await waitFor(() => {
        expect(screen.getByText('Contact Partagé Test')).toBeInTheDocument();
      });

      // Sélectionner le contact existant
      await user.click(screen.getByText('Contact Partagé Test'));
      await user.click(screen.getByText(/enregistrer/i));

      // Récupérer l'ID du concert
      await waitFor(async () => {
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('nom', '==', 'Concert Partagé Test')
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        concertId = concertsSnapshot.docs[0].id;
      });

      // Vérifier que le contact est associé aux deux entités
      await waitFor(async () => {
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        const contactData = contactDoc.data();
        
        expect(contactData.lieuxIds).toContain(lieuId);
        expect(contactData.concertsIds).toContain(concertId);
      });
    });
  });

  describe('Test en temps réel des mises à jour', () => {
    it('devrait mettre à jour la liste des contacts en temps réel', async () => {
      const user = userEvent.setup();
      
      // Rendre la liste des contacts
      const { rerender } = render(
        <TestWrapper>
          <ContactsList />
        </TestWrapper>
      );

      // Vérifier que la liste est vide initialement
      await waitFor(() => {
        expect(screen.getByText(/aucun contact/i)).toBeInTheDocument();
      });

      // Dans une autre "fenêtre", créer un contact via un formulaire lieu
      const { unmount } = render(
        <TestWrapper>
          <LieuForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/nom du lieu/i), 'Lieu Temps Réel');
      await user.type(screen.getByPlaceholderText(/rechercher un contact/i), 'Contact Temps Réel');
      
      await waitFor(() => {
        expect(screen.getByText(/nouveau contact/i)).toBeInTheDocument();
      });
      
      await user.click(screen.getByText(/nouveau contact/i));
      await user.click(screen.getByText(/enregistrer/i));

      // Démonter le formulaire
      unmount();

      // Re-rendre la liste des contacts
      rerender(
        <TestWrapper>
          <ContactsList />
        </TestWrapper>
      );

      // La liste devrait maintenant afficher le nouveau contact
      await waitFor(() => {
        expect(screen.queryByText(/aucun contact/i)).not.toBeInTheDocument();
        expect(screen.getByText('Contact Temps Réel')).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });
});