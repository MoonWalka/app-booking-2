import { useNavigate } from 'react-router-dom';

/**
 * Hook to manage concert action handlers
 */
export const useConcertActions = () => {
  const navigate = useNavigate();
  
  // Navigation function to view concert details
  const handleViewConcert = (concertId) => {
    navigate(`/concerts/${concertId}`);
  };
  
  // Function to navigate to form page
  const handleViewForm = (concertId) => {
    navigate(`/concerts/${concertId}/form`);
  };
  
  // Function to send a form (navigate to form management page)
  const handleSendForm = (concertId) => {
    navigate(`/concerts/${concertId}/form`);
  };
  
  // Function to navigate to contract page
  const handleViewContract = (contractId) => {
    navigate(`/contrats/${contractId}`);
  };
  
  // Function to generate a new contract
  const handleGenerateContract = (concertId) => {
    navigate(`/contrats/generate/${concertId}`);
  };
  
  return {
    handleViewConcert,
    handleViewForm,
    handleSendForm,
    handleViewContract,
    handleGenerateContract
  };
};

export default useConcertActions;