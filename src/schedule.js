const axios = require('axios');

const baseURL = (process.env.baseURL || 'https://apis.is');
const instance = axios.create({ baseURL });

/**
 * Fetches all available channels from endpoint, returns a promise that when
 * resolved returns an array.
 *
 * @returns {Promise}
 */
function flights() {
  return instance.get('/flight');
}


module.exports = {
  flights,
};
