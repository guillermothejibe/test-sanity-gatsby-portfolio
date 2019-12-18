const algoliasearch = require('algoliasearch');
// Algolia configuration
const algoliaApp = '63VMOTLCS6';
const algoliaIndex = 'sanity';
const fetch = require('node-fetch')
const sanity = require('@sanity/client')

exports.handler = async (event, context, callback) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept',
        },
        body: JSON.stringify({}),
      }
      return response;
    }

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

    const req = JSON.parse(event.body);
    console.log(req);
    // Initiate an Algolia client
    const client = algoliasearch(algoliaApp, process.env.ALGOLIA_API_KEY);
    // Initiate the Algolia index
    const index = client.initIndex(algoliaIndex);
    var clinicIds = []
    return index.search(req.search)
            .then(res => {
              return res.hits.map(x => x.objectID);
            })
            .then(getClinics)
            .then(function(clinics) {
              return {
                statusCode: 200,
                body: JSON.stringify(clinics)
              }
            });

    // var clinics = await getClinics(clinicIds);




    // // Get Created/Updated clinics
    // var clinics = await getClinics(req);
    // console.log(clinics);
    // // Get mutations
    // mutations = await asyncForEach(clinics, await getMutation);
    // console.log(mutations);
    // // Update clinics if needed
    // updates = [];
    // if (mutations.length > 0)
    //   updates = await updateClinics(req, mutations);
    // console.log(updates);
    // indexRes = await algolia(clinics, process.env.ALGOLIA_API_KEY);
    // console.log(indexRes);
    // callback(null, {
    //   statusCode: 200,
    //   body: JSON.stringify(clinics)
    // });

    // console.log('HEEEEEEEY!!!!!');
    // return;
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}

function getClinics(ids) {
  const sanityClient = sanity({
    projectId: 'syaw3jo0',
    dataset: 'production',
    token: process.env.SANITY_API_KEY,
    useCdn: false
  });
  var query = `*[_type == "sampleProject" && _id in [${ids.map(id => `"${id}"`).join(',')}]]`;
  return sanityClient.fetch(query);
}