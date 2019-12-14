// const algoliasearch = require('algoliasearch');
// const request = require('request');

// const ndjson = require('ndjson');
// const {bindNodeCallback} = require('rxjs');
// const {streamToRx} = require('rxjs-stream');
// const {bufferCount, map, mergeMap, toArray, tap} = require('rxjs/operators');

// // Algolia configuration
// const algoliaApp = '63VMOTLCS6';
// const algoliaIndex = 'sanity';

// module.exports = function indexContent(req, token) {
//   // Sanity configuration
//   const projectId = req.projectId;
//   const dataset = req.dataset;
//   const sanityExportURL = `https://${projectId}.api.sanity.io/v1/data/export/${dataset}`;
//   // Initiate an Algolia client
//   const client = algoliasearch(algoliaApp, token);
//   // Initiate the Algolia index
//   const index = client.initIndex(algoliaIndex);
  
//   // bind the update function to use it as an observable
//   const partialUpdateObjects = bindNodeCallback((...args) => index.saveObjects(...args));
//   streamToRx(
//     request(sanityExportURL).pipe(ndjson())
//   ).pipe(
//     /* 
//      * Pick and prepare fields you want to index,
//      * here we reduce structured text to plain text
//      */
//     map(function sanityToAlgolia(doc) {
//       return {
//         objectID: doc._id,
//         body: blocksToText(doc.body || []),
//         blurb: blocksToText(doc.blurb || []),
//         title: doc.title,
//         name: doc.name,
//         slug: doc.slug,
//         _geoloc: {
//           lat: doc.lat,
//           lng: doc.lon
//         }
//       };
//     }),
//     // buffer batches in chunks of 100
//     bufferCount(100),
//     // 👇uncomment to console.log objects for debugging
//     // tap(console.log),
//     // submit actions, one batch at a time
//     mergeMap(docs => partialUpdateObjects(docs), 1),
//     // collect all batches and emit when the stream is complete
//     toArray()
//   )
//     .subscribe(batchResults => {
//       const totalLength = batchResults.reduce((count, batchResult) => count + batchResult.objectIDs.length, 0);
//       console.log(`Updated ${totalLength} documents in ${batchResults.length} batches`);
//     });
// };

// // below the module.export function
// const defaults = {nonTextBehavior: 'remove'};

// function blocksToText(blocks, opts = {}) {
//   const options = Object.assign({}, defaults, opts)
//   return blocks
//     .map(block => {
//       if (block._type !== 'block' || !block.children) {
//         return options.nonTextBehavior === 'remove' ? '' : `[${block._type} block]`;
//       }

//       return block.children.map(child => child.text).join('');
//     })
//     .join('\n\n');
// }