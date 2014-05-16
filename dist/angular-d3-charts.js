(function() {

"use strict";

angular.module('angular-d3-charts', []).directive('a3bar', function ($log, d3Helpers, svgHelpers, barHelpers, barDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options'
		},
		template: '<div class="angular-a3bar"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Bar scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			// Set width and height if they are defined
			var w = isDefined(attrs.width)? attrs.width:options.width,
				h = isDefined(attrs.height)? attrs.height:options.height,
				svg;
			
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

			barHelpers.setXScale(scope, options);
			barHelpers.setYScale(scope, options);
			svg = svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			barHelpers.addAxis(scope, options);
			svgHelpers.updateStyles(scope, options);
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

		obtainEffectiveChartId: _obtainEffectiveChartId
	};
});
angular.module('angular-d3-charts').factory('barDefaults', function (d3Helpers) {
	function _getDefaults() {
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
			series: ['A', 'B', 'C', 'D'],
			x: {
				domain: ['Fruits', 'Vegetables', 'Meet'],
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
			timeFormat: '%d-%m-%Y',
			fontFamily: 'Arial',
			fontSize: '0.75em',
			axis: {
				stroke: '#000',
				fill: '#000'
			},
			defaultData: [{
				x: 'Fruits',
				y: [ 54, 0, 879 ],
				tooltip: 'Fruits tooltip'
			}, {
				x: 'Vegetables',
				y: [ 12, 34, 15 ],
				tooltip: 'Vegetables tooltip'
			}, {
				x: 'Meet',
				y: [ 54, 432, 234 ],
				tooltip: 'Meet tooltip'
			}],
			showDefaultData: true,
			locale: null
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

			var barDefaults = {};
			angular.extend(barDefaults, d);
			return barDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				newDefaults.width = isDefined(userDefaults.width) ?  userDefaults.width : newDefaults.width;
				newDefaults.heigth = isDefined(userDefaults.heigth) ?  userDefaults.heigth : newDefaults.heigth;
				newDefaults.zoom = isDefined(userDefaults.zoom) ?  userDefaults.zoom : newDefaults.zoom;
				newDefaults.timeFormat = isDefined(userDefaults.timeFormat) ?  userDefaults.timeFormat : newDefaults.timeFormat;
				newDefaults.fontFamily = isDefined(userDefaults.fontFamily) ?  userDefaults.fontFamily : newDefaults.fontFamily;
				newDefaults.fontSize = isDefined(userDefaults.fontSize) ?  userDefaults.fontSize : newDefaults.fontSize;
				newDefaults.showDefaultData = isDefined(userDefaults.showDefaultData) ?  userDefaults.showDefaultData : newDefaults.showDefaultData;
				newDefaults.locale = isDefined(userDefaults.locale) ?  userDefaults.locale : newDefaults.locale;
				
				if(isDefined(userDefaults.margin)) {
					angular.extend(newDefaults.margin, userDefaults.margin);
				}
				if(isDefined(userDefaults.legend)) {
					angular.extend(newDefaults.legend, userDefaults.legend);
				}

				if(isDefined(userDefaults.x)) {
					angular.extend(newDefaults.x, userDefaults.x);
				}

				if(isDefined(userDefaults.y)) {
					angular.extend(newDefaults.y, userDefaults.y);
				}

				if(isDefined(userDefaults.axis)) {
					angular.extend(newDefaults.axis, userDefaults.axis);
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
angular.module('angular-d3-charts').factory('barHelpers', function ($log, d3Helpers) {
	return {
		addAxis: function(scope, options) {
			scope.xl = scope.svg.append('g').
				attr('class', 'x axis');

			scope.xlLeftOffset = 0;
			if(options.y.position === 'left') {
				scope.xlLeftOffset = 30;
				if(options.y.orient === 'right') {
					scope.xlLeftOffset += 10;
				}
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
					.text(options.x.label);
			}

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
			this.addSubdivideTicks(scope.yl, scope.y, scope.yAxis, options.y);
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
			
			scope.x.domain(options.x.domain).rangeBands([0, options.width], 0.2);
			scope.xAxis.tickFormat(options.x.tickFormat);
			if(d3Helpers.isDefined(scope.chartData)) {
				this.updateData(scope.chartData);
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

			scope.y.range([0, options.width]);
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
			if(d3Helpers.isDefined(scope.chartData)) {
				this.updateData(scope.chartData);
			}
		},

		updateData: function() {

		}
	};
});
angular.module('angular-d3-charts').factory('svgHelpers', function (d3Helpers) {
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

		updateStyles: function(scope, options) {
			scope.svg.selectAll('.axis path').
				style('stroke', options.axis.stroke).
				style('fill', 'none').
				style('shape-rendering', 'crispEdges');
			
			scope.svg.selectAll('.axis .tick line').
				style('stroke', options.axis.stroke).
				style('fill', options.axis.fill);
				
			scope.svg.selectAll('.axis .tick.minor').
				style('stroke', options.axis.stroke).
				style('fill', options.axis.fill);
				
			scope.svg.style('font-family', options.fontFamily);
			scope.svg.style('font-size', options.fontSize);
		}
	};
});
}());