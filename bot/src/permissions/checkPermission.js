const checkOwner = require('./checkOwner');
const checkAdmin = require('./checkAdmin');

module.exports = async (interaction, required) => {
  if (checkOwner(interaction)) return true;

  if (required === 'admin') {
    return await checkAdmin(interaction);
  }

  if (required === 'member') {
    return true;
  }

  return false;
};