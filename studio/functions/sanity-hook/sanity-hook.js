const fetch = require('node-fetch')
const sanityClient = require('@sanity/client')

exports.handler = async (event, context) => {
  const token = 'skREWWibYTntp8pQezYW4wApNhl977vwoCszt5MIG5H4eEk8d2G4G6sYVKd87RRjo5S1mZ1e0kulUFNH3WBlSQvPyLccRUjAeIVv5FFFKhKlKsQ2cKpSEYT2xvWULgQ4UHqzPxe7JzAPdOMLRNfiG9POyOBkarWI8lcr1T6Jd0YXrtKX0gAa';
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
    var body = JSON.parse(event.body);

    request = JSON.parse(event.body);

    const client = sanityClient({
      projectId: request.projectId,
      dataset: request.dataset,
      token: token, // or leave blank to be anonymous user
      useCdn: false // `false` if you want to ensure fresh data
    })

    var project = null;
    const query = '*[_type == "sampleProject" && _id == "791d011b-71ab-4a17-96e7-bd442663002e"] {title, excerpt}'
    await client.fetch(query).then(projects => {
      // projects.forEach(project => {
      //   console.log(`${project.title}`)
      // })
      project = projects[0];
    });

    var patchedProject = null;
    const mutations = [{
      patch: {
        id: '791d011b-71ab-4a17-96e7-bd442663002e',
        set: {
          title: 'Testingggg!'
        }
      }
    }]

    await fetch(`https://${request.projectId}.api.sanity.io/v1/data/mutate/${request.dataset}`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({mutations})
    })
      .then(response => response.json())
      .then(function(result) {
        patchedProject = result;
      })
      .catch(error => console.error(error))

    return {
      statusCode: 200,
      body: JSON.stringify(patchedProject) // Could be a custom message or object i.e. JSON.stringify(err)
    }   

    // if (!response.ok) {
    //   // NOT res.status >= 200 && res.status < 300
    //   return { statusCode: response.status, body: response.statusText }
    // }
    // const data = await response.json()


  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
