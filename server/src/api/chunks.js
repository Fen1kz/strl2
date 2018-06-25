import resource from 'resource-router-middleware';

import chunksConfig from '../models/chunks';

export default ({ config, db }) => {
  const chunks = chunksConfig(db);

  const mapChunk = (chunk) => {
  	chunk.id = chunk.$loki;
  	return chunk;
	};
  
  return resource({
  	/** Property name to store preloaded entity on `request`. */
  	id : 'chunk',

  	/** For requests with an `id`, you can auto-load the entity.
  	 *  Errors terminate the request, success sets `req[id] = data`.
  	 */
  	load(req, id, callback) {
  		console.log('load');
  		const chunk = chunks.findOne({'$loki': +id});
      if (chunk) {
  		    callback(null, mapChunk(chunk));
      } else {
  		    callback('Not found');
      }
  	},

  	/** GET / - List all entities */
  	index({ params }, res) {
  		res.json(chunks.find().map(mapChunk).reduce((result, data) => {
  			result[data.id] = data;
  			return result;
			}, {}));
  	},

  	/** POST / - Create a new entity */
  	create({ body }, res) {
  		chunks.insert(body);
  		res.json(body);
  	},

  	/** GET /:id - Return a given entity */
  	read({ chunk }, res) {
  		res.json(chunk);
  	},

  	/** PUT /:id - Update a given entity */
  	update({ chunk, body }, res) {
  		for (let key in body) {
  			if (key !== 'id') {
  				chunk[key] = body[key];
  			}
  		}
  		res.sendStatus(204);
  	},

  	/** DELETE /:id - Delete a given entity */
  	delete({ chunk }, res) {
  		chunks.remove(chunk);
  		res.sendStatus(204);
  	}
  });
};
