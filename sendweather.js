// sendweather.js
var config = require('./config');

var mongoose = require('mongoose');
mongoose.connect(config.MONGODB_ADDRESS);

var request = require('request');
var sendgrid = require('sendgrid')(config.SENDGRID_USERNAME, config.SENDGRID_PASSWORD);

var Subscription = mongoose.model(config.MONGODB_MODEL_NAME, {
  email: String,
  city: String,
  location: String
});

function getWeather(sub, callback) {
	request.get('http://api.wunderground.com/api/'+config.WUNDERGROUND_API_KEY+'/forecast'+sub.location+'.json',function(error,response,body){
	   if(error) {
	        return;
	   }

	   var weather = JSON.parse(response.body);
	   callback(sub, weather);
	});
}

function sendEmail(email, subject, content)
{
	try {
	    sendgrid.send({
	        to: email,
	        from: config.SENDGRID_FROM,
	        subject: subject,
	        text: content
	    }, function(err, json) {
	        if(err) 
	        	return console.error(err);
	    });
	} catch(e) {
	    console.log(e);
	}
}

Subscription.find({}, function(err, subscriptions) {
	for(var i=0; i<subscriptions.length; i++) {
		getWeather({
			location: subscriptions[i].location, 
			city: subscriptions[i].city, 
			email: subscriptions[i].email
		}, function(sub, weather) {
			var content = weather.forecast.txt_forecast.forecastday[0].title+'\n'+weather.forecast.txt_forecast.forecastday[0].fcttext+'\n\n' +
						  weather.forecast.txt_forecast.forecastday[1].title+'\n'+weather.forecast.txt_forecast.forecastday[1].fcttext+'\n\n';
			sendEmail(sub.email, 'Weather for '+sub.city, content);
		});
	}

});

process.exit();