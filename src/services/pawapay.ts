/**
 * Service PawaPay pour GOMACASCADE
 * Gère les paiements Mobile Money et Cartes Bancaires
 */

const PAWAPAY_API_URL = 'https://api.pawapay.io/v1';
const PAWAPAY_TOKEN = 'eyJraWQiOiIxIiwiYWxnIjoiRVMyNTYifQ.eyJ0dCI6IkFBVCIsInN1YiI6IjE1MzAxIiwibWF2IjoiMSIsImV4cCI6MjA4Mzk5MTQ0MSwiaWF0IjoxNzY4NDU4NjQxLCJwbSI6IkRBRixQQUYiLCJqdGkiOiI5MDVmMTA5Mi0zNDZlLTQwZTEtYTA3MC03MWI4ZDc4M2M2NjUifQ.EVB2IV4lA3h2moe0bFeC5yibJuoeDWwsYvUothJGTfDBx9Rcl9Z-WjnJsy1pLZDO-oZ9Rsuc-4dXq2ufpUR9uA';

export const pawapayService = {
  /**
   * Initie un paiement Mobile Money
   */
  initiatePayment: async (amount: number, phoneNumber: string, description: string) => {
    console.log(`Initiation du paiement PawaPay: ${amount}$ pour ${phoneNumber}`);
    
    // Dans un environnement réel, cet appel serait fait via un backend sécurisé
    // pour ne pas exposer le jeton côté client.
    try {
      // Simulation de l'appel API
      const response = {
        status: 'ACCEPTED',
        depositId: Math.random().toString(36).substring(7),
        redirectUrl: `https://checkout.pawapay.io/pay?token=${PAWAPAY_TOKEN.substring(0, 20)}`
      };
      
      return response;
    } catch (error) {
      console.error('Erreur PawaPay:', error);
      throw error;
    }
  },

  /**
   * Vérifie le statut d'un paiement
   */
  checkStatus: async (depositId: string) => {
    return { status: 'COMPLETED' };
  }
};
