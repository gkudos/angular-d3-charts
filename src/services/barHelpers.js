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
