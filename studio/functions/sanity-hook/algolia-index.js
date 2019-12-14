const algoliasearch = require('algoliasearch');

// Algolia configuration
const algoliaApp = '63VMOTLCS6';
const algoliaIndex = 'sanity';

module.exports = function indexContent(docs, token) {
  // Initiate an Algolia client
  const client = algoliasearch(algoliaApp, token);
  // Initiate the Algolia index
  const index = client.initIndex(algoliaIndex);
  
    /* 
     * Pick and prepare fields you want to index,
     * here we reduce structured text to plain text
     */
  indexed = [];
  docs.forEach(function(doc){
    indexed.push({
      objectID: doc._id,
      body: blocksToText(doc.body || []),
      blurb: blocksToText(doc.blurb || []),
      title: doc.title,
      name: doc.name,
      slug: doc.slug,
      _geoloc: {
        lat: doc.lat,
        lng: doc.lon
      }
    });
  });
  return index.saveObjects(indexed);
};

// below the module.export function
const defaults = {nonTextBehavior: 'remove'};

function blocksToText(blocks, opts = {}) {
  const options = Object.assign({}, defaults, opts)
  return blocks
    .map(block => {
      if (block._type !== 'block' || !block.children) {
        return options.nonTextBehavior === 'remove' ? '' : `[${block._type} block]`;
      }

      return block.children.map(child => child.text).join('');
    })
    .join('\n\n');
}