const loki = require('lokijs');

export default callback => {	
	var db = new loki('database.json', {
		autosave: true
		, autosaveInterval: 1e3
		, autoload: true
		, autoloadCallback: () => callback(db)
		, serializationMethod: 'pretty'
	});
}
