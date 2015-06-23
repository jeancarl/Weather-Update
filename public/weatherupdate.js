// Filename: public/weatherupdate.js

angular.module('weatherUpdateApp', [])
.controller('WeatherUpdateCtrl', function($scope, $http) {
	$scope.email = '';
	$scope.city = '';
	$scope.results = [];

	$scope.searchWeather = function() {
		$http.get('/api/search?query='+$scope.city).success(function(results) {
			$scope.results = results;
		});
	}

	$scope.subscribe = function(location) {
		$http.post('/api/subscribe', {email: $scope.email, city: location.name, location: location.l}).success(function(results) {
			console.log(results);
		});

		location.subscribed = true;
	}

	$scope.unsubscribe = function(location) {
		$http.post('/api/unsubscribe', {email: $scope.email, location: location.l}).success(function(results) {
			console.log(results);
		});

		location.subscribed = false;
	}	
});