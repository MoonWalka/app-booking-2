import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const useInvitationNotifications = () => {
  const { currentUser } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    if (!currentUser?.email) return;

    // Écouter les invitations pour cet email
    const invitationsQuery = query(
      collection(db, 'entreprise_invitations'),
      where('email', '==', currentUser.email),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(invitationsQuery, (snapshot) => {
      const invitations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Vérifier que l'invitation n'est pas expirée
        if (data.expiresAt && data.expiresAt.toDate() > new Date()) {
          // Vérifier que l'utilisateur n'a pas déjà utilisé cette invitation
          if (!data.usedBy || !data.usedBy.includes(currentUser.uid)) {
            invitations.push({
              id: doc.id,
              ...data
            });
          }
        }
      });

      setPendingInvitations(invitations);

      // Afficher une notification si il y a de nouvelles invitations
      if (invitations.length > 0 && !hasShownNotification) {
        const message = invitations.length === 1
          ? `Vous avez une invitation en attente de ${invitations[0].entrepriseName}`
          : `Vous avez ${invitations.length} invitations en attente`;

        toast.info(
          <div>
            <p>{message}</p>
            <button 
              className="btn btn-sm btn-primary mt-2"
              onClick={() => {
                // Rediriger vers la page de gestion des entreprises
                window.location.href = '/onboarding?action=join';
              }}
            >
              Voir les invitations
            </button>
          </div>,
          {
            position: 'top-right',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
          }
        );
        
        setHasShownNotification(true);
      }
    }, (error) => {
      console.error('Erreur lors de la récupération des invitations:', error);
    });

    return () => unsubscribe();
  }, [currentUser, hasShownNotification]);

  return { pendingInvitations };
};

export default useInvitationNotifications;