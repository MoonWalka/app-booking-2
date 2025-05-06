// src/hooks/concerts/useFormSubmission.js
/**
 * ATTENTION: Ce fichier a été remplacé par un re-export vers la version commune
 * dans le cadre de la consolidation des hooks utilitaires.
 * 
 * L'ancienne implémentation était spécifique aux concerts et gérait:
 * - Les associations avec les programmateurs (updateProgrammateurAssociation)
 * - Les associations avec les artistes (updateArtisteAssociation)
 * - Des formulaires spécifiques aux concerts
 * 
 * Pour recréer cette fonctionnalité spécifique avec le hook générique:
 * 
 * ```
 * const concertFormSubmission = useFormSubmission({
 *   collection: 'concerts',
 *   validate: (data) => {
 *     return !!data.date && !!data.montant && !!selectedLieu;
 *   },
 *   associations: {
 *     programmateur: {
 *       targetCollection: 'programmateurs',
 *       targetField: 'concertIds',
 *       oldValue: initialProgrammateurId,
 *       newValue: selectedProgrammateur?.id
 *     },
 *     artiste: {
 *       targetCollection: 'artistes',
 *       targetField: 'concertIds',
 *       oldValue: initialArtisteId,
 *       newValue: selectedArtiste?.id
 *     }
 *   },
 *   transformData: (data) => ({
 *     ...data,
 *     lieuId: selectedLieu?.id || null,
 *     lieuNom: selectedLieu?.nom || null,
 *     // ...autres transformations
 *   }),
 *   onSuccess: () => navigate('/concerts')
 * });
 * ```
 */

// Re-export the common implementation
import useFormSubmission from '../common/useFormSubmission';
export default useFormSubmission;
