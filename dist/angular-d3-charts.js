(function() {

"use strict";

angular.module("angular-d3-charts", []).directive('a3bar', function ($log, d3Helpers, barDefaults) {
	return {
		restrict: "EA",
		replace: true,
		scope: {
		},
		template: '<div class="angular-a3bar"></div>',
		controller: function($scope) {
			$log.info("[Angular - D3] Bar scope controller", $scope);
		},
		link: function(scope, element, attrs) {
			var isDefined = d3Helpers.isDefined,
				defaults = barDefaults.setDefaults(scope.defaults, attrs.id);

			// Set width and height if they are defined
			var w = isDefined(attrs.width)? attrs.width:defaults.width,
				h = isDefined(attrs.height)? attrs.height:defaults.height;
			
			if (isNaN(w)) {
				element.css('width', w);
			} else {
				element.css('width', w + 'px');
			}
		
			if (isNaN(h)) {
				element.css('height', h);
			} else {
				element.css('height', h + 'px');
			}
			

			defaults.width = element.width();
			defaults.height = element.height();
		}
	};
});
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
angular.module("angular-d3-charts").factory('barDefaults', function (d3Helpers) {
	function _getDefaults() {
		return {
			width: 300,
			heigth: 250,
			zoom: true
		};
	}

	var isDefined = d3Helpers.isDefined,
		obtainEffectiveChartId = d3Helpers.obtainEffectiveChartId,
		defaults = {};


	return {
		getDefaults: function (scopeId) {
			var barId = obtainEffectiveChartId(defaults, scopeId);
			return defaults[barId];
		},

		getCreationDefaults: function (scopeId) {
			var d = this.getDefaults(scopeId);

			var barDefaults = {
				zoom: d.zoom
			};

			return barDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				newDefaults.width = isDefined(userDefaults.width) ?  userDefaults.width : newDefaults.width;
				newDefaults.heigth = isDefined(userDefaults.heigth) ?  userDefaults.heigth : newDefaults.heigth;
				newDefaults.zoom = isDefined(userDefaults.zoom) ?  userDefaults.zoom : newDefaults.zoom;
			}

			var barId = obtainEffectiveChartId(defaults, scopeId);
			defaults[barId] = newDefaults;
			return newDefaults;
		}
	};
});
angular.module("angular-d3-charts").factory('svgHelpers', function () {
	return {
		addSVG: function(container) {
			var svg = d3.select(container)
				.append("svg");
			return svg;
		}
	};
});
}());