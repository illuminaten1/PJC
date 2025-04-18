import axios from 'axios';

const API_URL = '/api';

// Configuration d'Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API pour les affaires
export const affairesAPI = {
  getAll: (params) => api.get('/affaires', { params }),
  getById: (id) => api.get(`/affaires/${id}`),
  getArborescence: (id) => api.get(`/affaires/${id}/arborescence`),
  create: (data) => api.post('/affaires', data),
  update: (id, data) => api.put(`/affaires/${id}`, data),
  delete: (id) => api.delete(`/affaires/${id}`),
  archive: (id, archive) => api.patch(`/affaires/${id}/archive`, { archive })
};

// API pour les avocats
export const avocatsAPI = {
  getAll: () => axios.get('/api/avocats'),
  getById: (id) => axios.get(`/api/avocats/${id}`),
  create: (data) => axios.post('/api/avocats', data),
  update: (id, data) => axios.put(`/api/avocats/${id}`, data),
  delete: (id) => axios.delete(`/api/avocats/${id}`),
  getCabinets: () => axios.get('/api/avocats/utils/cabinets'),
  getVilles: () => axios.get('/api/avocats/utils/villes'),
  searchByVille: (ville) => axios.get(`/api/avocats/search/ville/${ville}`)
};

// API pour les militaires
export const militairesAPI = {
  getAll: (params) => api.get('/militaires', { params }),
  getById: (id) => api.get(`/militaires/${id}`),
  create: (data) => api.post('/militaires', data),
  update: (id, data) => api.put(`/militaires/${id}`, data),
  delete: (id) => api.delete(`/militaires/${id}`)
  // Pas de fonction d'archivage, car géré uniquement au niveau de l'affaire
};

// API pour les bénéficiaires
export const beneficiairesAPI = {
  getAll: (params) => api.get('/beneficiaires', { params }),
  getById: (id) => api.get(`/beneficiaires/${id}`),
  create: (data) => api.post('/beneficiaires', data),
  update: (id, data) => api.put(`/beneficiaires/${id}`, data),
  delete: (id) => api.delete(`/beneficiaires/${id}`),
  addConvention: (id, data) => api.post(`/beneficiaires/${id}/conventions`, data),
  addPaiement: (id, data) => api.post(`/beneficiaires/${id}/paiements`, data)
};

// API pour les documents
export const documentsAPI = {
  // Générer une convention d'honoraires (avec support PDF et ODT)
  genererConvention: (beneficiaireId, conventionIndex, format = 'pdf') => 
    api.post(`/documents/convention/${beneficiaireId}/${conventionIndex}?format=${format}`, {}, 
      { responseType: 'blob' }),
  
  // Générer une fiche de règlement (avec support PDF et ODT)
  genererReglement: (beneficiaireId, paiementIndex, format = 'pdf') => 
    api.post(`/documents/reglement/${beneficiaireId}/${paiementIndex}?format=${format}`, {}, 
      { responseType: 'blob' }),
  
  // Générer une fiche d'information
  genererFicheInformation: (data, format = 'docx') => 
    api.post('/documents/fiche-information', { ...data, format }, 
      { responseType: 'blob' }),

  // Générer une fiche de synthèse
  genererSyntheseAffaire: (affaireId, format = 'pdf') =>
    api.post(`/documents/synthese-affaire/${affaireId}?format=${format}`, {}, 
      { responseType: 'blob' })
  
};

// API pour les statistiques
export const statistiquesAPI = {
  getAll: (params) => api.get('/statistiques', { params }),
  getByAnnee: (annee) => api.get(`/statistiques/annee/${annee}`),
  getByAffaire: (id) => api.get(`/statistiques/affaire/${id}`),
  getByMilitaire: (id) => api.get(`/statistiques/militaire/${id}`),
  getBudgetByAnnee: (annee) => api.get(`/statistiques/budget/${annee}`)
};

// API pour les paramètres
export const parametresAPI = {
  getAll: () => api.get('/parametres'),
  getByType: (type) => api.get(`/parametres/${type}`),
  updateByType: (type, valeurs) => api.post(`/parametres/${type}`, { valeurs }),
  addValue: (type, valeur) => api.put(`/parametres/${type}`, { valeur }),
  deleteValue: (type, index) => api.delete(`/parametres/${type}/${index}`),
  // Nouvelle méthode pour le transfert de portefeuille
  transferPortfolio: (sourceRedacteur, targetRedacteur) => 
    api.post('/parametres/transfert-portefeuille', { 
      sourceRedacteur, 
      targetRedacteur 
    })
    .catch(error => {
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      throw error;
    }),
  // Nouvelle méthode pour obtenir l'historique des transferts
  getTransferHistory: () => api.get('/parametres/historique-transferts')
};

// API pour les templates
export const templatesAPI = {
  // Récupérer le statut des templates (personnalisé ou par défaut)
  getStatus: () => api.get('/templates/status'),
  
  // Télécharger un template
  downloadTemplate: (templateType) => 
    api.get(`/templates/download/${templateType}`, { 
      responseType: 'blob' 
    }),
  
  // Uploader un template personnalisé
  uploadTemplate: (templateType, formData) => 
    api.post(`/templates/upload/${templateType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  // Restaurer un template par défaut
  restoreTemplate: (templateType) => api.post(`/templates/restore/${templateType}`),
  
  // Définir un nouveau template par défaut
  setDefaultTemplate: (templateType, formData) => 
    api.post(`/templates/set-default/${templateType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

// API pour les décisions
export const decisionsAPI = {
  // Récupérer toutes les décisions d'un bénéficiaire
  getByBeneficiaire: (beneficiaireId) => {
    return axios.get(`/api/decisions/beneficiaire/${beneficiaireId}`);
  },
  
  // Créer une nouvelle décision
  create: (data) => {
    return axios.post('/api/decisions', data);
  },
  
  // Supprimer une décision
  delete: (id) => {
    return axios.delete(`/api/decisions/${id}`);
  },
  
  // Générer un document de décision (PDF ou ODT)
  genererDocument: (id, format = 'pdf') => {
    // Utiliser window.open pour déclencher le téléchargement
    window.open(`/api/decisions/generer/${id}?format=${format}`, '_blank');
    // Retourner un objet qui simule une promesse résolue
    return { then: (callback) => callback() };
  }
};

export default api;