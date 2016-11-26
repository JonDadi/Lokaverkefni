const axios = require('axios');

const baseURL = (process.env.baseURL || 'https://apis.is');
const instance = axios.create({ baseURL });

/**
 * Fetches all departures from endpoint, returns a promise that when
 * resolved returns an array.
 * @param   {lang} // either 'en' or 'is'
 * @returns {Promise}
 */
function flights(lang) {
  let url = `/flight?language=${lang}&type=departures`;
  console.log(url);
  return instance.get(`/flight?language=${lang}&type=departures`);
}


module.exports = {
  flights,
};
