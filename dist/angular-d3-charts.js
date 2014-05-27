(function() {

"use strict";

angular.module('angular-d3-charts', []).directive('a3bar', function ($log, d3Helpers, svgHelpers, barHelpers, barDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3bar"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Bar scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			scope.type = 'bar';
			scope.classPrefix = 'a3bar';
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			barHelpers.setXScale(scope, options);
			barHelpers.setYScale(scope, options);
			if(isDefined(options.zoom) && options.zoom) {
				svgHelpers.addZoomBehaviour(scope, barHelpers.zoomBehaviour);
			}
			svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			barHelpers.addAxis(scope, options);
			svgHelpers.updateStyles(scope, options);

			barHelpers.updateData(scope, options);
		}
	};
});

angular.module('angular-d3-charts').directive('a3oabar', function ($log, d3Helpers, svgHelpers, barHelpers, barDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3oabar"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] One Axis Bar scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			scope.type = 'oneAxisBar';
			scope.classPrefix = 'a3oabar';
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			// Orient option disabled for this chart.
			options.x.orient = 'bottom';

			barHelpers.setXScale(scope, options);
			barHelpers.setYScale(scope, options);
			if(isDefined(options.zoom) && options.zoom) {
				svgHelpers.addZoomBehaviour(scope, barHelpers.zoomBehaviour);
			}
			svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			barHelpers.addOneAxis(scope, options);
			svgHelpers.updateStyles(scope, options);

			barHelpers.updateData(scope, options);
		}
	};
});

angular.module('angular-d3-charts').directive('a3pie', function ($log, d3Helpers, svgHelpers, pieHelpers, pieDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3pie"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Pie scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			scope.type = 'pie';
			scope.classPrefix = 'a3pie';
			var options = pieDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			svgHelpers.addSVG(scope, element.get(0), options);
			scope.svg.attr('transform', 'translate(' + options.width / 2 + ',' + options.height / 2 + ')');

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			pieHelpers.addArc(scope, options);
			//svgHelpers.updateStyles(scope, options);

			pieHelpers.updateData(scope, options);

		}
	};
});

angular.module('angular-d3-charts').directive('a3line', function ($log, d3Helpers, svgHelpers, lineHelpers, lineDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3line"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Line scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			scope.type = 'line';
			scope.classPrefix = 'a3line';

			var options = lineDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);
		}
	};
});

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
				width: 120
			},
			timeFormat: '%d-%m-%Y',
			fontFamily: 'Arial',
			fontSize: '0.75em',
			axis: {
				stroke: '#000',
				color: '#000',
				label: {
					color: '#000',
					fontWeight: 'bold'
				},
				fontWeight: 'normal'
			},
			showDefaultData: true,
			locale: null
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
				newDefaults.width = this.isDefined(userDefaults.width) ?  userDefaults.width : newDefaults.width;
				newDefaults.heigth = this.isDefined(userDefaults.heigth) ?  userDefaults.heigth : newDefaults.heigth;
				newDefaults.zoom = this.isDefined(userDefaults.zoom) ?  userDefaults.zoom : newDefaults.zoom;
				newDefaults.timeFormat = this.isDefined(userDefaults.timeFormat) ?  userDefaults.timeFormat : newDefaults.timeFormat;
				newDefaults.fontFamily = this.isDefined(userDefaults.fontFamily) ?  userDefaults.fontFamily : newDefaults.fontFamily;
				newDefaults.fontSize = this.isDefined(userDefaults.fontSize) ?  userDefaults.fontSize : newDefaults.fontSize;
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

angular.module('angular-d3-charts').factory('barDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			series: ['A', 'B', 'C', 'D'],
			barGap: 0.2,
			x: {
				tickFormat: null,
				tickSize: 6,
				orient: 'bottom',
				position: 'bottom',
				key: 'x',
				label: 'x',
				ticks: 5,
				tickSubdivide: 4
			},
			y: {
				scale: 'linear',
				tickFormat: null,
				tickSize: 6,
				orient: 'left',
				position: 'left',
				key: 'y',
				label: 'y',
				ticks: 5,
				tickSubdivide: 4
			},
			axis: {
				valuesColor: '#000',
				percentColor: '#000',
				label: {
					color: '#000',
					fontWeight: 'bold'
				}
			},
			defaultData: [{
				id: 1,
				x: 'Fruits',
				y: [ 54, 0, 879 ],
				tooltip: 'Fruits tooltip'
			}, {
				id: 2,
				x: 'Vegetables',
				y: [ 12, 34, 15 ],
				tooltip: 'Vegetables tooltip'
			}, {
				id: 3,
				x: 'Meet',
				y: [ 154, 432, 234 ],
				tooltip: 'Meet tooltip'
			}]
		});
		return commonDefaults;
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

			var barDefaults = {};
			angular.extend(barDefaults, d);
			return barDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				d3Helpers.setDefaults(newDefaults, userDefaults);
				newDefaults.barGap = d3Helpers.isDefined(userDefaults.barGap)?  userDefaults.barGap:newDefaults.barGap;

				if(isDefined(userDefaults.x)) {
					angular.extend(newDefaults.x, userDefaults.x);
				}

				if(isDefined(userDefaults.y)) {
					angular.extend(newDefaults.y, userDefaults.y);
				}

				if(isDefined(newDefaults.defaultData)) {
					angular.extend(newDefaults.defaultData, newDefaults.defaultData);
				}
			}

			var barId = obtainEffectiveChartId(defaults, scopeId);
			defaults[barId] = newDefaults;
			return newDefaults;
		}
	};
});

angular.module('angular-d3-charts').factory('pieDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			radius: 0,
			x: {
				key: 'x',
				label: 'x'
			},
			y: {
				key: 'y',
				label: 'y'
			},
			defaultData: [{
				id: 1,
				x: 'Fruits',
				y: 54,
				tooltip: 'Fruits tooltip'
			}, {
				id: 2,
				x: 'Vegetables',
				y: 23,
				tooltip: 'Vegetables tooltip'
			}, {
				id: 3,
				x: 'Meet',
				y: 41,
				tooltip: 'Meet tooltip'
			}],
			showPercent: false,
			borderColor: '#FFF',
			pieAnimation: 'normal'
		});
		return commonDefaults;
	}

	var isDefined = d3Helpers.isDefined,
		obtainEffectiveChartId = d3Helpers.obtainEffectiveChartId,
		defaults = {};

	return {
		getDefaults: function (scopeId) {
			var pieId = obtainEffectiveChartId(defaults, scopeId);
			return defaults[pieId];
		},

		getCreationDefaults: function (scopeId) {
			var d = this.getDefaults(scopeId);

			var pieDefaults = {};
			angular.extend(pieDefaults, d);
			return pieDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				d3Helpers.setDefaults(newDefaults, userDefaults);

				newDefaults.radius = d3Helpers.isDefined(userDefaults.radius)?  userDefaults.radius:newDefaults.radius;
				newDefaults.showPercent = d3Helpers.isDefined(userDefaults.showPercent)?  userDefaults.showPercent:newDefaults.showPercent;
				newDefaults.borderColor = d3Helpers.isDefined(userDefaults.borderColor)?  userDefaults.borderColor:newDefaults.borderColor;
				newDefaults.pieAnimation = d3Helpers.isDefined(userDefaults.pieAnimation)?  userDefaults.pieAnimation:newDefaults.pieAnimation;

				if(isDefined(userDefaults.x)) {
					angular.extend(newDefaults.x, userDefaults.x);
				}

				if(isDefined(userDefaults.y)) {
					angular.extend(newDefaults.y, userDefaults.y);
				}

				if(isDefined(newDefaults.defaultData)) {
					angular.extend(newDefaults.defaultData, newDefaults.defaultData);
				}
			}

			var pieId = obtainEffectiveChartId(defaults, scopeId);
			defaults[pieId] = newDefaults;
			return newDefaults;
		}
	};
});

angular.module('angular-d3-charts').factory('lineDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			series: ['A', 'B', 'C', 'D'],
			x: {
				scale: 'linear',
				tickFormat: null,
				tickSize: 6,
				orient: 'bottom',
				position: 'bottom',
				key: 'x',
				label: 'x',
				ticks: 5,
				tickSubdivide: 4
			},
			y: {
				scale: 'linear',
				tickFormat: null,
				tickSize: 6,
				orient: 'left',
				position: 'left',
				key: 'y',
				label: 'y',
				ticks: 5,
				tickSubdivide: 4
			},
			axis: {
				valuesColor: '#000',
				percentColor: '#000',
				label: {
					color: '#000',
					fontWeight: 'bold'
				}
			},
			defaultData: [{
				id: 1,
				x: 'Fruits',
				y: [ 54, 0, 879 ],
				tooltip: 'Fruits tooltip'
			}, {
				id: 2,
				x: 'Vegetables',
				y: [ 12, 34, 15 ],
				tooltip: 'Vegetables tooltip'
			}, {
				id: 3,
				x: 'Meet',
				y: [ 154, 432, 234 ],
				tooltip: 'Meet tooltip'
			}]
		});
		return commonDefaults;
	}

	var isDefined = d3Helpers.isDefined,
		obtainEffectiveChartId = d3Helpers.obtainEffectiveChartId,
		defaults = {};

	return {
		getDefaults: function (scopeId) {
			var lineId = obtainEffectiveChartId(defaults, scopeId);
			return defaults[lineId];
		},

		getCreationDefaults: function (scopeId) {
			var d = this.getDefaults(scopeId);

			var lineDefaults = {};
			angular.extend(lineDefaults, d);
			return lineDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				d3Helpers.setDefaults(newDefaults, userDefaults);

				if(isDefined(userDefaults.x)) {
					angular.extend(newDefaults.x, userDefaults.x);
				}

				if(isDefined(userDefaults.y)) {
					angular.extend(newDefaults.y, userDefaults.y);
				}

				if(isDefined(newDefaults.defaultData)) {
					angular.extend(newDefaults.defaultData, newDefaults.defaultData);
				}
			}

			var lineId = obtainEffectiveChartId(defaults, scopeId);
			defaults[lineId] = newDefaults;
			return newDefaults;
		}
	};
});

angular.module('angular-d3-charts').factory('barHelpers', function ($log, d3Helpers, svgHelpers) {
	var _idFunction = function(d) {
		return d.id;
	};

	return {
		addAxis: function(scope, options) {
			svgHelpers.addXAxis(scope, options);
			svgHelpers.addYAxis(scope, options);
			svgHelpers.addSubdivideTicks(scope.yl, scope.y, scope.yAxis, options.y);
		},

		addOneAxis: function(scope, options) {
			svgHelpers.addXAxis(scope, options);
			scope.ylTopOffset = options.x.position === 'top'? options.height*0.125:options.height*0.2;

			scope.guide = scope.svg.append('g')
				.attr('class', 'guide');

			scope.guide
				.append('line')
				.attr('x1', scope.xlLeftOffset)
				.attr('x2', options.width + scope.xlLeftOffset)
				.attr('y1', scope.ylTopOffset - options.height*0.03)
				.attr('y2', scope.ylTopOffset - options.height*0.03)
				.style('stroke', '#BBB')
				.style('stroke-width', 1)
				.style('shape-rendering', 'crispEdges');
		},

		setXScale: function(scope, options) {
			scope.x = d3.scale.ordinal();
			//scope.x.range([0, options.width]);

			if(!d3Helpers.isDefined(scope.xAxis)) {
				if(!d3Helpers.isDefined(options.x.orient) || !d3Helpers.isString(options.x.orient) ||
					(options.x.orient !== 'bottom' && options.x.orient !== 'top')) {
					$log.warn('[Angular - D3] Tick orient must be a string. Setting default value "bottom"');
					options.x.orient = 'bottom';
				}
				scope.xAxis = d3.svg.axis().scale(scope.x).orient(options.x.orient);
			} else {
				scope.xAxis.scale(scope.x);
			}

			if(d3Helpers.isDefined(options.x.tickSize) && d3Helpers.isNumber(options.x.tickSize)) {
				scope.xAxis.tickSize(options.x.tickSize);
			} else {
				$log.warn('[Angular - D3] Ticksize must be a number. Setting default value 6');
				options.x.tickSize = 6;
				scope.xAxis.tickSize(options.x.tickSize);
			}

			var data  = d3Helpers.getDataFromScope(scope, options);
			scope.x.domain(data.map(function(d) { return d[options.x.key]; })).rangeBands([0, options.width], options.barGap);
			scope.xAxis.tickFormat(options.x.tickFormat);
			if(d3Helpers.isDefined(scope.data)) {
				this.updateData(scope.data, options);
			}
		},

		setYScale: function(scope, options) {
			switch(options.y.scale) {
				case 'log':
					scope.y = d3.scale.log().clamp(true);
					break;
				case 'sqrt':
					scope.y = d3.scale.sqrt();
					break;
				case 'time':
					scope.y = d3.time.scale();
					break;
				default:
					if(options.y.scale !== 'linear') {
						$log.warn('[Angular - D3] Ticksize must be a string and ["linear", "log", "time", "sqrt"]. Setting default value "linear"');
						options.y.scale = 'linear';
					}
					scope.y = d3.scale.linear();
					break;
			}

			scope.y.range([0, options.height - (scope.type === 'oneAxisBar'? options.height*0.2:0)]);
			if(!d3Helpers.isDefined(scope.yAxis)) {
				if(!d3Helpers.isDefined(options.y.orient) || !d3Helpers.isString(options.y.orient)) {
					$log.warn('[Angular - D3] Tick orient must be a string. Setting default value "left"');
					options.y.orient = 'left';
				}
				scope.yAxis = d3.svg.axis().scale(scope.y).orient(options.y.orient);
			} else {
				scope.yAxis.scale(scope.y);
			}

			if(d3Helpers.isDefined(options.y.tickSize) && d3Helpers.isNumber(options.y.tickSize)) {
				scope.yAxis.tickSize(options.y.tickSize);
			} else {
				$log.warn('[Angular - D3] Ticksize must be a number. Setting default value 6');
				options.y.tickSize = 6;
				scope.yAxis.tickSize(options.y.tickSize);
			}

			switch(options.y.scale) {
				case 'log':
					if(!d3Helpers.isDefined(options.y.tickFormat)) {
						options.y.tickFormat = function(d) {
							var base = d3.round(Math.log(d)/Math.LN10, 3);
							return base%1 === 0? d:'';
						};
					}
					scope.yAxis.ticks(options.y.ticks);
					scope.y.domain([0.1, 1000]);
					break;
				case 'time':
					if(!d3Helpers.isDefined(options.y.tickFormat)) {
						var locale = d3Helpers.isDefined(options.locale)? options.locale.timeFormat:d3.time.format;
						options.y.tickFormat = locale.multi([
							['.%L', function(d) { return d.getMilliseconds(); }],
							[':%S', function(d) { return d.getSeconds(); }],
							['%I:%M', function(d) { return d.getMinutes(); }],
							['%I %p', function(d) { return d.getHours(); }],
							['%a %d', function(d) { return d.getDay() && d.getDate() !== 1; }],
							['%b %d', function(d) { return d.getDate() !== 1; }],
							['%B', function(d) { return d.getMonth(); }],
							['%Y', function() { return true; }]
						]);
					}
					scope.yAxis.ticks(options.y.ticks);
					break;
				default:
					scope.yAxis.ticks(options.y.ticks + options.y.ticks * options.y.tickSubdivide);
					scope.y.domain([0, 100]);
					break;
			}
			scope.yAxis.tickFormat(options.y.tickFormat);
			if(d3Helpers.isDefined(scope.data)) {
				this.updateData(scope.data, options);
			}
		},

		zoomBehaviour: function() {
		},

		updateData: function(scope, options) {
			if(!d3Helpers.isDefined(scope.x) || !d3Helpers.isDefined(scope.y)) {
				return;
			}
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for bars');
				return;
			}
			$log.debug('[Angular - D3] Data for bars:', data);

			var formatTime = d3.time.format(options.timeFormat);
			var mapFunction = function(d) {
				return d[options.y.key].map(function(e) {
					return {
						x: d[options.x.key],
						y: e
					};
				});
			};

			var domain = data.map(function(d) { return d[options.x.key]; });
			scope.x.domain(domain);
			$log.debug('[Angular - D3] x domain:', domain);

			var totals = [];
			var min = d3.min(data, function(d) {
				return d3.min(d[options.y.key], function(v, i) {
					if(options.y.scale === 'time' && !(v instanceof Date)) {
						v = formatTime.parse(v);
					}
					if(!d3Helpers.isDefined(totals[i])) {
						totals.push(v);
					} else {
						totals[i] += v;
					}
					return v;
				});
			});
			$log.debug('[Angular - D3] Totals:', totals);
			$log.debug('[Angular - D3] Data min for bars:', min);

			var max = d3.max(data, function(d) {
				return d3.max(d[options.y.key]);
			});
			$log.debug('[Angular - D3] Data max for bars:', max);

			if(min === undefined || max === undefined || (min === 0 && max === 0)) {
				min = 0;
				max = options.y.scale === 'time'? new Date():100;
			} else if((min - max) === 0) {
				min = min instanceof Date? 0:(min - Math.abs(min/2));
				max = max instanceof Date? max:(max + Math.abs(max/2));
			}

			scope.y.domain([min, max]);
			if(min < max) {
				scope.y.nice();
			}
			if(scope.type === 'bar') {
				scope.yl.call(scope.yAxis);
				svgHelpers.addSubdivideTicks(scope.yl, scope.y, scope.yAxis, options.y);
			}

			if(d3Helpers.isDefined(scope.zoom) && d3Helpers.isDefined(options.zoom) && options.zoom) {
				scope.zoom.x(scope.x).y(scope.y);
			}

			var yMaxPoints = d3.max(data.map(function(d){ return d[options.y.key].length; }));
			var x0 = d3.scale.ordinal().domain(d3.range(yMaxPoints)).rangeRoundBands([0, scope.x.rangeBand()]);

			var barsContainer = scope.svg.select('g.' + scope.classPrefix + '-bars');
			if(barsContainer.empty()) {
				barsContainer = scope.svg.append('g')
					.attr('transform', 'translate(' + scope.xlLeftOffset + ',' + scope.ylTopOffset + ')')
					.attr('class', scope.classPrefix + '-bars')
					.attr('clip-path', 'url(#'+scope.idClip+')');
			} else {

			}

			var barGroups = barsContainer.selectAll('.' + scope.classPrefix + '-group-bar')
				.data(data, _idFunction)
				.interrupt();

			var series = barGroups.enter()
				.append('g')
				.attr('class', scope.classPrefix + '-group-bar');

			var bars = series.selectAll('.' + scope.classPrefix + '-bar')
				.data(mapFunction)
				.interrupt()
				.enter()
				.append('rect')
				.attr('class', scope.classPrefix + '-bar');

			var colors = d3.scale.category20();
			bars.attr('width', x0.rangeBand())
				.attr('x', function(d, i) {
					return scope.x(d.x) + x0(i);
				})
				.attr('height', 0)
				.style('opacity', 0)
				.style('fill', function(d, i) {
					var color = d3.rgb(colors(i));
					var factor = 0.5 + d.y/max;
					return factor <= 1? color.brighter(1-factor):color.darker(factor);
				})
				.transition()
				.ease('cubic-in-out')
				.duration(1000)
				.attr('height', function(d) {
					return Math.abs(scope.y(d.y) - scope.y(0));
				})
				.style('opacity', 1);

			if(scope.type === 'oneAxisBar') {
				var helpTextContainer = scope.svg.select('g.' + scope.classPrefix +'-helptext');

				if(helpTextContainer.empty()) {
					helpTextContainer = scope.svg.append('g')
						.attr('transform', 'translate(' + scope.xlLeftOffset + ',' +
							(scope.ylTopOffset - (options.x.position === 'bottom'? options.height*0.15:-options.height*0.85)) + ')')
						.attr('class', scope.classPrefix + '-helptext');
				} else {

				}

				var textGroups = helpTextContainer.selectAll('.' + scope.classPrefix + '-values')
					.data(data, _idFunction)
					.interrupt();

				series = textGroups.enter()
					.append('g')
					.attr('class', scope.classPrefix + '-values');

				series.selectAll('.' + scope.classPrefix + '-val')
					.data(mapFunction)
					.interrupt()
					.enter()
					.append('text')
					.attr('x', function(d, i) {
						return scope.x(d.x) + x0(i) + x0.rangeBand()/2;
					})
					.attr('class', scope.classPrefix + '-val')
					.style('text-anchor', 'middle')
					.style('fill', options.axis.valuesColor)
					.text(function(d) {
						return d.y;
					});

				series.selectAll('.' + scope.classPrefix + '-percent')
					.data(mapFunction)
					.interrupt()
					.enter()
					.append('text')
					.attr('x', function(d, i) {
						return scope.x(d.x) + x0(i) + x0.rangeBand()/2;
					})
					.attr('y', options.height*0.065)
					.attr('class', scope.classPrefix + '-percent')
					.style('text-anchor', 'middle')
					.style('font-size', '0.85em')
					.style('font-weight', 'bold')
					.style('fill', options.axis.percentColor)
					.text(function(d, i) {
						var format = d3.format('%');
						return format(d.y/totals[i]);
					});
			}

			svgHelpers.updateStyles(scope, options);
		}
	};
});

angular.module('angular-d3-charts').factory('pieHelpers', function ($log, d3Helpers/*, svgHelpers*/) {
	function _tweenPie(scope, options, b) {
		b.innerRadius = 0;
		var start = null;
		switch(options.pieAnimation) {
			case 'inverse':
				start = {startAngle: 2*Math.PI, endAngle: 2*Math.PI};
				break;
			case 'crossfade':
				start = {startAngle: 2*Math.PI, endAngle: 0};
				break;
			case 'crossfade-inverse':
				start = {startAngle: 0, endAngle: 2*Math.PI};
				break;
			default:
				if(!d3Helpers.isDefined(options.pieAnimation) || options.pieAnimation !== '') {
					$log.warn('[Angular - D3] The option "pieAnimation" is undefined or it has a invalid value. Setting to "normal"');
					options.pieAnimation = 'normal';
				}
				start = {startAngle: 0, endAngle: 0};
				break;
		}
		var i = d3.interpolate(start, b);
		return function(t) {
			return scope.arc(i(t));
		};
	}

	return {
		addArc: function(scope, options) {
			scope.arc = d3.svg.arc()
		    .outerRadius(options.width/2 - options.margin.left)
		    .innerRadius(options.radius);

			scope.pie = d3.layout.pie()
		    .sort(null)
		    .value(function(d) { return d[options.y.key]; });

		},

		updateData: function(scope, options) {
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});

			var colors = d3.scale.category20();
			var g = scope.svg.selectAll('.' + scope.classPrefix + '-arc')
	      .data(scope.pie(data))
				.enter().append('g')
	      .attr('class', scope.classPrefix + '-arc');

			g.append('path')
				.style('opacity', 0)
				.style('fill', function(d) {
					return colors(d.data[options.x.key]);
				})
				.style('stroke', options.borderColor)
				.interrupt()
				.transition()
				.duration(1500)
				.ease('cubic-in-out')
	      .attrTween('d', function(d) {
					return _tweenPie(scope, options, d);
				})
				.style('opacity', 1);

			g.append('text')
	      .attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
	      .attr('dy', '-0.75em')
	      .style('text-anchor', 'middle')
	      .text(function(d) {
					var text;

					if(options.showPercent) {
						var format = d3.format('%');
						text = format(d.data[options.y.key]/total);
					} else {
						text = d.data[options.y.key];
					}
					return text;
				});

			g.append('text')
				.attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
				.attr('dy', '.75em')
				.style('text-anchor', 'middle')
				.text(function(d) {
					return d.data[options.x.key];
				});

			this.setStyles(scope, options);
		},

		setStyles: function(scope, options) {
			scope.svg.selectAll('.' + scope.classPrefix + '-arc text')
				.style('fill', options.axis.color)
				.style('font-weight', options.axis.fontWeight);

			scope.svg
				.style('font-family', options.fontFamily)
				.style('font-size', options.fontSize);
		}
	};
});

angular.module('angular-d3-charts').factory('lineHelpers', function ($log, d3Helpers, svgHelpers) {
	/*
	var _idFunction = function(d) {
		return d.id;
	};
	*/

	return {
		addAxis: function(scope, options) {
			svgHelpers.addXAxis(scope, options);
			svgHelpers.addYAxis(scope, options);
			svgHelpers.addSubdivideTicks(scope.yl, scope.y, scope.yAxis, options.y);
		}
	};
});

angular.module('angular-d3-charts').factory('svgHelpers', function ($log, d3Helpers) {
	return {
		addSVG: function(scope, container, options) {
			var w = options.width + options.margin.left + options.margin.right;
			w += options.legend.show? options.legend.width:0;
			var h = options.height + options.margin.top + options.margin.bottom + 30;

			options.containerWidth = w;
			options.containerHeight = h;
			var svg = d3.select(container)
				.append('svg')
				.attr('width', w)
				.attr('height', h)
				.append('g')
				.attr('transform', 'translate(' + options.margin.left + ',' + options.margin.top + ')')
				.style('cursor', 'pointer');

			// Mask for zoom and pan behavior.
			scope.idClip = 'clip-' + d3Helpers.getRandomString();
			svg.append('clipPath')
				.attr('id', scope.idClip)
				.append('rect')
				.attr('width', options.width - 1)
				.attr('height', options.height - 20);
			scope.svg = svg;
			return svg;
		},

		addZoomBehaviour: function(scope, behavior) {
			if(!d3Helpers.isDefined(scope.x)) {
				$log.warn('[Angular - D3] x scale is not defined, unable set zoom behavior');
				return;
			}
			if(!d3Helpers.isDefined(scope.y)) {
				$log.warn('[Angular - D3] y scale is not defined, unable set zoom behavior');
				return;
			}
			scope.zoom = d3.behavior.zoom()
				.x(scope.x)
				.y(scope.y)
				.scaleExtent([0.5, 100])
				.on('zoom', behavior);
		},

		addXAxis: function(scope, options) {
			scope.xl = scope.svg.append('g')
				.attr('class', 'x axis');

			scope.xlLeftOffset = 0;
			if(options.y.position === 'left') {
				scope.xlLeftOffset = 30;
				if(options.y.orient === 'right') {
					scope.xlLeftOffset += 10;
				}
			}

			if(scope.type === 'oneAxisBar') {
				scope.xlLeftOffset = 0;
			}

			if(!d3Helpers.isDefined(options.x.position) || d3Helpers.isString(options.x.position)) {
				switch(options.x.position) {
					case 'top':
						scope.xl.attr('transform', 'translate(' + scope.xlLeftOffset + ', ' + (options.x.orient === 'bottom'? 0:20) + ')');
						break;
					default:
						if(!d3Helpers.isDefined(options.x.position) || !d3Helpers.isString(options.x.position) ||
							options.x.position !== 'bottom') {
							$log.warn('[Angular - D3] X Axis position must be a string. Setting default value "bottom"');
							options.x.position = 'bottom';
						}
						scope.xl.attr('transform', 'translate(' + scope.xlLeftOffset + ', ' +
							(options.height + (options.x.orient === 'bottom'? 0:20))+ ')');
						break;
				}
			} else if(d3Helpers.isNumber(options.x.position)) {
				scope.xl.attr('transform', 'translate(' + scope.xlLeftOffset + ', ' +
					(options.x.orient === 'bottom'? (options.x.position + 20):options.x.position) + ')');
			}

			scope.xl.call(scope.xAxis);

			if(d3Helpers.isDefined(options.x.label) && options.x.label !== false) {
				scope.xl.append('text')
					.attr('class', 'label')
					.attr('transform', 'translate(' + (options.width) + ')')
					.attr('dx', '0.8em')
					.attr('dy', options.x.orient === 'bottom'? '1.35em':0)
					.style('text-anchor', 'start')
					.style('font-size', '1.1em')
					.style('font-weight', 'bold')
					.text(options.x.label);
			}
		},

		addYAxis: function(scope, options) {
			scope.yl = scope.svg.append('g')
				.attr('class', 'y axis');

			scope.ylTopOffset = 0;
			if(options.x.position === 'top') {
				scope.ylTopOffset = 30;
			}

			if(!d3Helpers.isDefined(options.y.position) || d3Helpers.isString(options.y.position)) {
				switch(options.y.position) {
					case 'right':
						scope.yl.attr('transform', 'translate(' + (options.width + (options.y.orient === 'left'? 20:0)) + ',' +
								(scope.ylTopOffset) + ')');
						break;
					default:
						if(!d3Helpers.isDefined(options.y.position) || !d3Helpers.isString(options.y.position) ||
							options.y.position !== 'left') {
							$log.warn('[Angular - D3] Y Axis position must be a string. Setting default value "left"');
							options.y.position = 'left';
						}
						scope.yl.attr('transform', 'translate(' + (options.y.orient === 'left'? 20:0) + ',' +
								(scope.ylTopOffset) + ')');
						break;
				}
			} else if(d3Helpers.isNumber(options.y.position)) {
				scope.yl.attr('transform', 'translate(' + (options.y.position - (options.y.orient === 'left'? 20:0)) + ',' +
						(scope.ylTopOffset) + ')');
			}

			scope.yl.call(scope.yAxis);

			if(d3Helpers.isDefined(options.y.label) && options.y.label !== false) {
				scope.yl.append('text')
					.attr('class', 'label')
					.attr('dy', options.y.position === 'right'? 4:(options.x.position === 'top'? 0:'-1em'))
					.attr('x', options.y.position === 'right'? '1.5em':'1em')
					.attr('y', options.x.position === 'top'? options.height:0)
					.style('text-anchor', 'start')
					.style('font-size', '1.1em')
					.style('font-weight', 'bold')
					.text(options.y.label);
			}
		},

		addSubdivideTicks: function(g, scale, axis, options) {
			g.selectAll('.tick.minor')
				.classed('minor', false)
				.selectAll('text')
				.style('display', null)
				.style('stroke-width', 0);
			if(options.scale !== 'sqrt' && options.scale !== 'linear') {
				return;
			}

			g.selectAll('.tick')
				.data(scale.ticks(options.ticks), function(d) { return d; })
				.exit()
				.classed('minor', true)
				.selectAll('text')
				.style('display', 'none');

			switch(axis.orient()) {
				case 'left':
					g.selectAll('.tick.minor line')
						.attr('x2', -4);
					break;
				case 'bottom':
					g.selectAll('.tick.minor line')
						.attr('y2', 4);
					break;
				case 'top':
					g.selectAll('.tick.minor line')
						.attr('y2', -4);
					break;
				case 'right':
					g.selectAll('.tick.minor line')
						.attr('x2', 4);
					break;
			}
		},

		updateStyles: function(scope, options) {
			var stroke = scope.type === 'bar'? options.axis.stroke:null;

			scope.svg.selectAll('.axis path')
				.style('stroke', stroke)
				.style('fill', 'none')
				.style('shape-rendering', 'crispEdges');

			scope.svg.selectAll('.axis .tick line')
				.style('stroke', stroke)
				.style('fill', 'none');

			scope.svg.selectAll('.axis .tick.minor')
				.style('stroke', stroke)
				.style('fill', 'none');

			scope.svg.selectAll('.axis text')
				.style('fill', options.axis.color)
				.style('font-weight', options.axis.fontWeight);

			scope.svg.selectAll('.axis .label')
				.style('fill', options.axis.label.color)
				.style('font-weight', options.axis.label.fontWeight);

			scope.svg.style('font-family', options.fontFamily);
			scope.svg.style('font-size', options.fontSize);
		}
	};
});

}());