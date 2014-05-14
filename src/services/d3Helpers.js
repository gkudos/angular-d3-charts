angular.module("angular-d3-charts").factory('d3Helpers', function ($log) {
	function _obtainEffectiveChartId(d, chartId) {
		var id, i;
		if (!angular.isDefined(chartId)) {
			if (Object.keys(d).length === 1) {
				for (i in d) {
					if (d.hasOwnProperty(i)) {
						id = i;
					}
				}
			} else if (Object.keys(d).length === 0) {
				id = "main";
			} else {
				$log.error("[AngularJS - D3] - You have more than 1 object on the DOM, you must provide the object ID");
			}
		} else {
			id = chartId;
		}

		return id;
	}

	return {
		//Determine if a reference is {}
		isEmpty: function(value) {
			return Object.keys(value).length === 0;
		},

		//Determine if a reference is undefined or {}
		isUndefinedOrEmpty: function (value) {
			return (angular.isUndefined(value) || value === null) || Object.keys(value).length === 0;
		},

		// Determine if a reference is defined
		isDefined: function(value) {
			return angular.isDefined(value) && value !== null;
		},

		// Determine if a reference is a number
		isNumber: function(value) {
			return angular.isNumber(value);
		},

		// Determine if a reference is a string
		isString: function(value) {
			return angular.isString(value);
		},

		// Determine if a reference is an array
		isArray: function(value) {
			return angular.isArray(value);
		},

		// Determine if a reference is an object
		isObject: function(value) {
			return angular.isObject(value);
		},

		// Determine if a reference is a function.
		isFunction: function(value) {
			return angular.isFunction(value);
		},

		// Determine if two objects have the same properties
		equals: function(o1, o2) {
			return angular.equals(o1, o2);
		},

		safeApply: function($scope, fn) {
			var phase = $scope.$root.$$phase;
			if (phase === '$apply' || phase === '$digest') {
				$scope.$eval(fn);
			} else {
				$scope.$apply(fn);
			}
		},

		obtainEffectiveChartId: _obtainEffectiveChartId
	};
});