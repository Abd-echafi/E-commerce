const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  _id: {
    type: String, // Ex : "storeConfig" ou "orderAssignment"
    required: true
  },

  // Pour l'affectation des commandes
  lastWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  },

  // Paramètres du store
  storeName: {
    type: String,
    default: 'My Store'
  },
  bannerColor: {
    type: String,
    default: '#ffffff'
  },
  storeImage: {
    type: String,
  },
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
