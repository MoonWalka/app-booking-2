const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

/**
 * Fonction proxy pour l'autocomplétion d'adresse avec LocationIQ
 */
exports.locationiqAutocomplete = functions.region("europe-west1").https.onCall(async (data) => {
  // Le paramètre context a été retiré car il n'est pas utilisé
  // Si vous avez besoin de l'authentification plus tard, vous pourrez le remettre

  try {
    const { query } = data;
    
    if (!query || typeof query !== "string" || query.length < 3) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "La requête doit être une chaîne de caractères d'au moins 3 caractères"
      );
    }

    // Appel à l'API LocationIQ
    const response = await axios.get("https://api.locationiq.com/v1/autocomplete.php", {
      params: {
        key: functions.config().locationiq.key,
        q: query,
        limit: 5,
        countrycodes: "fr",
        tag: "place:city,place:town,place:village,place:hamlet,amenity,building,highway",
        dedupe: 1,
        "accept-language": "fr"
      }
    });

    // Retourner les résultats
    return response.data;
  } catch (error) {
    console.error("Erreur LocationIQ:", error);
    
    throw new functions.https.HttpsError(
      "internal",
      "Erreur lors de la recherche d'adresse",
      error.message
    );
  }
});

/**
 * Fonction proxy pour obtenir une carte statique de LocationIQ
 */
exports.locationiqStaticMap = functions.region("europe-west1").https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const { lat, lon, zoom = 15, width = 600, height = 300 } = request.query;
      
      if (!lat || !lon) {
        response.status(400).send("Paramètres latitude et longitude requis");
        return;
      }

      // URL de la carte statique LocationIQ
      const url = `https://maps.locationiq.com/v3/staticmap?key=${functions.config().locationiq.key}&center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&format=png&markers=icon:large-red-cutout|${lat},${lon}`;
      
      // Rediriger vers l'image (option simple)
      response.redirect(url);
    } catch (error) {
      console.error("Erreur carte statique:", error);
      response.status(500).send("Erreur lors de la génération de la carte");
    }
  });
});
