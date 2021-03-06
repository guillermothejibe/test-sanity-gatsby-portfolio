const algolia = require('./algolia-index.js');
const fetch = require('node-fetch')
const sanity = require('@sanity/client')
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY,
  Promise: Promise
});
const now = new Date();

exports.handler = async (event, context) => {
  try {

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

    const req = JSON.parse(event.body);
    console.log(req);
    // Get Created/Updated clinics
    var clinics = await getClinics(req);
    console.log(clinics);
    // Get mutations
    mutations = await asyncForEach(clinics, await getMutation);
    console.log(mutations);
    // Update clinics if needed
    updates = [];
    if (mutations.length > 0)
      updates = await updateClinics(req, mutations);
    console.log(updates);
    indexRes = await algolia(clinics, process.env.ALGOLIA_API_KEY);
    console.log(indexRes);
    return {
      statusCode: 200,
      body: JSON.stringify({clinics: updates, index: indexRes})
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}

function algoliaIndex(req) {
  const sanityExportURL = `https://${req.projectId}.api.sanity.io/v1/data/export/${req.dataset}`;
}

function getClinics(req) {
  const ids = req.ids.updated.concat(req.ids.created);
  const sanityClient = sanity({
    projectId: req.projectId,
    dataset: req.dataset,
    token: process.env.SANITY_API_KEY,
    useCdn: false
  });
  var query = `*[_type == "sampleProject" && _id in [${ids.map(id => `"${id}"`).join(',')}]]`;
  return sanityClient.fetch(query).then(function(results){ return results});
}

function getMutation(clinic) {
  if (
      clinic.google_place_id && 
      (clinic.webhookAt==null || (Date.parse(clinic.webhookAt) + 10000) < now) && // Every 10 seconds 
      (clinic.googleUpdatedAt==null || (Date.parse(clinic.googleUpdatedAt) + 60000) < now) // Every 60 seconds 
    ) {
    return googleMapsClient.place({
      placeid: clinic.google_place_id,
      fields: ['name', 'formatted_address', 'place_id', 'geometry']
    })
    .asPromise()
    .then((response) => {
      googlePlace = response.json.result;
      console.log(googlePlace);
      if (googlePlace) {
        return {
          patch: {
            id: clinic._id,
            set: {
              lat: googlePlace.geometry.location.lat,
              lon: googlePlace.geometry.location.lng,
              webhookAt: now.toISOString(),
              googleUpdatedAt: now.toISOString()
            }
          }
        };
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
}

function updateClinics(req, mutations) {
  return fetch(`https://${req.projectId}.api.sanity.io/v1/data/mutate/${req.dataset}`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${process.env.SANITY_API_KEY}`
    },
    body: JSON.stringify({mutations})
  })
    .then(response => response.json())
    .then(function(result) {
      return result;
    })
  .catch(error => console.error(error));
}

async function asyncForEach(array, callback) {
  var results = [];
  for (let index = 0; index < array.length; index++) {
    result = await callback(array[index], index, array);
    if (result) {
      results.push(result);
    }
  }
  return results;
}

