const models = require('../models/index'); // adjust path if needed

//model finder by role
function getModelByRole(req) {
  const role = req.originalUrl.split('/')[4];
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
  const Model = models[capitalizedRole];

  if (!Model) {
    throw new Error(`Invalid role: ${role}`);
  }

  return Model;
}

module.exports = getModelByRole;