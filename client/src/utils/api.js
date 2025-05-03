import axios from 'axios';

// Configuration d'axios pour les requêtes API
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si le token est expiré ou invalide, déconnecter l'utilisateur
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API pour l'authentification
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  verify: () => api.get('/auth/verify'),
  initAdmin: () => api.post('/auth/init')
};

// API pour la gestion des utilisateurs
export const utilisateursAPI = {
  getAll: () => api.get('/utilisateurs'),
  getById: (id) => api.get(`/utilisateurs/${id}`),
  create: (userData) => api.post('/utilisateurs', userData),
  update: (id, userData) => api.put(`/utilisateurs/${id}`, userData),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
  changePassword: (id, password) => api.patch(`/utilisateurs/${id}/password`, { password }),
  toggleStatus: (id) => api.patch(`/utilisateurs/${id}/toggle-actif`)
};

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
  getAll: (params) => api.get('/avocats', { params }),
  getById: (id) => api.get(`/avocats/${id}`),
  getCabinets: () => api.get('/avocats/utils/cabinets'),
  getVilles: () => api.get('/avocats/utils/villes'),
  searchByVille: (ville) => api.get(`/avocats/search/ville/${ville}`),
  create: (data) => api.post('/avocats', data),
  update: (id, data) => api.put(`/avocats/${id}`, data),
  delete: (id, motDePasse) => api.delete(`/avocats/${id}`, { 
    data: { motDePasse } 
  })
};

// API pour les bénéficiaires
export const beneficiairesAPI = {
  getAll: (params) => api.get('/beneficiaires', { params }),
  getById: (id) => api.get(`/beneficiaires/${id}`),
  create: (data) => api.post('/beneficiaires', data),
  update: (id, data) => api.put(`/beneficiaires/${id}`, data),
  delete: (id, motDePasse) => api.delete(`/beneficiaires/${id}`, { 
    data: { motDePasse } 
  }),
  addConvention: (id, data) => api.post(`/beneficiaires/${id}/conventions`, data),
  updateConvention: (id, conventionId, data) => api.put(`/beneficiaires/${id}/conventions/${conventionId}`, data),
  addPaiement: (id, data) => api.post(`/beneficiaires/${id}/paiements`, data)
};

// API pour les militaires
export const militairesAPI = {
  getAll: (params) => api.get('/militaires', { params }),
  getById: (id) => api.get(`/militaires/${id}`),
  create: (data) => api.post('/militaires', data),
  update: (id, data) => api.put(`/militaires/${id}`, data),
  delete: (id, motDePasse) => api.delete(`/militaires/${id}`, { 
    data: { motDePasse } 
  })
};

// API pour la génération de documents
export const documentsAPI = {
  genererConvention: (beneficiaireId, conventionId, format = 'pdf') => 
    api.post(`/documents/convention/${beneficiaireId}/${conventionId}?format=${format}`, {}, { 
      responseType: 'blob' 
    }),
  genererReglement: (beneficiaireId, paiementId, format = 'pdf') => 
    api.post(`/documents/reglement/${beneficiaireId}/${paiementId}?format=${format}`, {}, { 
      responseType: 'blob' 
    }),
  genererSyntheseAffaire: (affaireId, format = 'pdf') => 
    api.post(`/documents/synthese-affaire/${affaireId}?format=${format}`, {}, { 
      responseType: 'blob' 
    })
};

// API pour les templates
export const templatesAPI = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  getStatus: () => api.get('/templates/status'),
  downloadTemplate: (type) => api.get(`/templates/download/${type}`, { 
    responseType: 'blob' 
  }),
  uploadTemplate: (type, formData) => api.post(`/templates/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  restoreTemplate: (type) => api.post(`/templates/restore/${type}`)
};

// API pour les paramètres
export const parametresAPI = {
  getAll: () => api.get('/parametres'),
  getByType: (type) => api.get(`/parametres/${type}`),
  addValue: (type, valeur) => api.post(`/parametres/${type}`, { valeur }),
  deleteValue: (type, index) => api.delete(`/parametres/${type}/${index}`),
  transferPortfolio: (sourceRedacteur, targetRedacteur) =>
    api.post('/parametres/transfert-portefeuille', { sourceRedacteur, targetRedacteur }),
  getTransferHistory: () => api.get('/parametres/historique-transferts')
};

// API pour les statistiques
export const statistiquesAPI = {
  getAll: () => api.get('/statistiques'),
  getByAnnee: (year) => api.get(`/statistiques/annee/${year}`),
  getByYear: (year) => api.get(`/statistiques/annee/${year}`), // pour la compatibilité
  getByAffaire: (affaireId) => api.get(`/statistiques/affaire/${affaireId}`),
  getByMilitaire: (militaireId) => api.get(`/statistiques/militaire/${militaireId}`),
  getBudget: (year) => api.get(`/statistiques/budget/${year}`),
  getBudgetByAnnee: (year) => api.get(`/statistiques/budget/${year}`) // pour la compatibilité
};

// API pour les fichiers
export const fichiersAPI = {
  upload: (beneficiaireId, formData) => api.post(`/fichiers/${beneficiaireId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getByBeneficiaire: (beneficiaireId) => api.get(`/fichiers/beneficiaire/${beneficiaireId}`),
  delete: (id) => api.delete(`/fichiers/${id}`),
  updateDescription: (id, description) => api.patch(`/fichiers/${id}/description`, { description }),
  // Les routes de prévisualisation et téléchargement seront utilisées directement via des URL
  // Nouvelles méthodes pour les emails
  getEmailPreview: (id) => api.get(`/fichiers/preview-email/${id}`),
  getEmailAttachment: (fileId, attachmentId) => ({
    // Ici, nous renvoyons simplement l'URL car la requête sera faite directement via le navigateur
    url: `${api.defaults.baseURL}/fichiers/email-attachment/${fileId}/${attachmentId}`
  })
};

// API pour les exports
export const exportAPI = {
  // Méthode pour obtenir l'URL d'export avec le token
  getBeneficiairesExcelUrl: () => {
    const token = localStorage.getItem('token');
    return `/api/export/beneficiaires?token=${token}`;
  },
  
  // Méthode alternative si vous préférez utiliser une fonction JavaScript pour déclencher l'export
  exportBeneficiairesExcel: () => {
    const token = localStorage.getItem('token');
    window.location.href = `/api/export/beneficiaires?token=${token}`;
  }
};

export default api;