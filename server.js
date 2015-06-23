// Filename: server.js

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var url = require('url');
var config = require('./config');

app.use(bodyParser.json());
app.listen(config.PORT);

mongoose.connect(config.MONGODB_ADDRESS);

var Subscription = mongoose.model(config.MONGODB_MODEL_NAME, {
  email: String,
  city: String,
  location: String
});

app.get('/api/search', function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var request = require("request");
	request.get("http://autocomplete.wunderground.com/aq?query="+query.query,function(error, response, body){
		if(error) {
			res.send([]);
			return;
		}

		var results = JSON.parse(response.body);
		var locations = [];

		for(var i=0; i<results.RESULTS.length; i++) {
			locations.push({name:results.RESULTS[i].name, l: results.RESULTS[i].l});
		}

		res.send(locations);
	});
});

app.post('/api/subscribe', function(req, res) {
	Subscription.create({
			email: req.body.email, 
			city: req.body.city, 
			location: req.body.location
		}, function(err, weather) {
			res.send({success:true});
		}
	);
});

app.post('/api/unsubscribe', function(req, res) {
	Subscription.remove({
			email: req.body.email, 
			location: req.body.location
		}, function(err) {
			if(err) {
				res.send({error: 'Could not find subscription'});
				return;
			}

			res.send(JSON.stringify({success:true}));
		}
	);
})

app.use(express.static(__dirname + '/public'));

console.log('App listening on port '+config.PORT);