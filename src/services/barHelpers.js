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