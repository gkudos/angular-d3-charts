angular.module('angular-d3-charts').factory('d3Helpers', function ($log) {
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
				id = 'main';
			} else {
				$log.error('[AngularJS - D3] - You have more than 1 object on the DOM, you must provide the object ID');
			}
		} else {
			id = chartId;
		}

		return id;
	}

	function _getCommonDefaults() {
		return {
			idKey: 'id',
			width: 300,
			heigth: 250,
			zoom: true,
			margin: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10
			},
			legend: {
				show: true,
				size: 120,
				type: 'vertical',
				gap: 20
			},
			timeFormat: '%d-%m-%Y',
			fontFamily: 'Arial',
			fontSize: '0.75em',
			tooltipSize: 120,
			axis: {
				show: true,
				stroke: '#000',
				color: '#000',
				label: {
					color: '#000',
					fontWeight: 'bold'
				},
				fontWeight: 'normal'
			},
			showDefaultData: true,
			locale: null,
			animations: {
				time: 750,
				ease: d3.easeCubic
			}
		};
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

		getCommonDefaults: _getCommonDefaults,

		setDefaults: function(newDefaults, userDefaults) {
			if (this.isDefined(userDefaults)) {
				newDefaults.idKey = this.isDefined(userDefaults.idKey) ?  userDefaults.idKey : newDefaults.idKey;
				newDefaults.colorKey = this.isDefined(userDefaults.colorKey) ?  userDefaults.colorKey : newDefaults.colorKey;
				newDefaults.width = this.isDefined(userDefaults.width) ?  userDefaults.width : newDefaults.width;
				newDefaults.heigth = this.isDefined(userDefaults.heigth) ?  userDefaults.heigth : newDefaults.heigth;
				newDefaults.zoom = this.isDefined(userDefaults.zoom) ?  userDefaults.zoom : newDefaults.zoom;
				newDefaults.timeFormat = this.isDefined(userDefaults.timeFormat) ?  userDefaults.timeFormat : newDefaults.timeFormat;
				newDefaults.fontFamily = this.isDefined(userDefaults.fontFamily) ?  userDefaults.fontFamily : newDefaults.fontFamily;
				newDefaults.fontSize = this.isDefined(userDefaults.fontSize) ?  userDefaults.fontSize : newDefaults.fontSize;
				newDefaults.tooltipSize = this.isDefined(userDefaults.tooltipSize) ?  userDefaults.tooltipSize : newDefaults.tooltipSize;
				newDefaults.showDefaultData = this.isDefined(userDefaults.showDefaultData) ?  userDefaults.showDefaultData : newDefaults.showDefaultData;
				newDefaults.locale = this.isDefined(userDefaults.locale) ?  userDefaults.locale : newDefaults.locale;

				if(this.isDefined(userDefaults.margin)) {
					angular.extend(newDefaults.margin, userDefaults.margin);
				}
				if(this.isDefined(userDefaults.legend)) {
					angular.extend(newDefaults.legend, userDefaults.legend);
				}

				if(this.isDefined(userDefaults.axis)) {
					angular.extend(newDefaults.axis, userDefaults.axis);
				}

				if(this.isDefined(userDefaults.animations)) {
					angular.extend(newDefaults.animations, userDefaults.animations);
				}
			}
		},

		setSize: function(element, options, attrs) {
			// Set width and height if they are defined
			var w = this.isDefined(attrs.width)? attrs.width:options.width,
				h = this.isDefined(attrs.height)? attrs.height:options.height;

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

			options.width = element.width();
			options.height = element.height();
		},

		setColors: function(userColors, defaultColors) {
			var colors = defaultColors || d3.scaleOrdinal(d3.schemePaired);
			if(this.isDefined(userColors)) {
				colors = this.isArray(userColors)? d3.scaleOrdinal().range(userColors):colors;
				colors = this.isString(userColors)? d3.scaleOrdinal().range([userColors]):colors;
				colors = this.isFunction(userColors)? userColors:colors;
			}
			return colors;
		},

		getDataFromScope: function(scope, options) {
			var data = null;
			if(this.isUndefinedOrEmpty(scope.data) && options.showDefaultData &&
				!this.isUndefinedOrEmpty(options.defaultData)) {
				data = options.defaultData;
			} else if(this.isString(scope.data)) {

			} else {
				data = scope.data;
			}
			return data;
		},

		getRandomString: function(length) {
			var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
			var string_length = length || 8;
			var randomstring = '';
			for (var i = 0; i < string_length; i++) {
				var rnum = Math.floor(Math.random() * chars.length);
				randomstring += chars.substring(rnum, rnum+1);
			}
			return randomstring;
    },

    getRandomColor: function() {
			// random values between 0 and 255, these are the 3 colour values
			var r = Math.floor(Math.random()*256);
			var g = Math.floor(Math.random()*256);
			var b = Math.floor(Math.random()*256);

			// puts the hex value inside this element (e is a jquery object)
			return d3.rgb(r,g,b);
		},

		obtainEffectiveChartId: _obtainEffectiveChartId
	};
});
