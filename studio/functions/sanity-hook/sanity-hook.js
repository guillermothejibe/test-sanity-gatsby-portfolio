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

    const request = JSON.parse(event.body);
    var clinics = await getClinics(request);
    console.log(clinics);
    mutations = await asyncForEach(clinics, await getMutation);
    updates = await updateClinics(request, mutations);
    return {
      statusCode: 200,
      body: JSON.stringify({clinics: updates})
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}

function getClinics(request) {
  const ids = request.ids.updated.concat(request.ids.created);
  const sanityClient = sanity({
    projectId: request.projectId,
    dataset: request.dataset,
    token: process.env.SANITY_API_KEY,
    useCdn: false
  });
  var query = `*[_type == "sampleProject" && _id in [${ids.map(id => `"${id}"`).join(',')}]] {_id, title, google_place_id, webhookAt}`;
  return sanityClient.fetch(query).then(function(results){ return results});
}

function getMutation(clinic) {
  if (clinic.google_place_id && (clinic.webhookAt==null || (Date.parse(clinic.webhookAt) + 10000) < now)) {
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
              webhookAt: now.toISOString()
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

function updateClinics(request, mutations) {
  return fetch(`https://${request.projectId}.api.sanity.io/v1/data/mutate/${request.dataset}`, {
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

