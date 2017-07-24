angular.module('angular-d3-charts').factory('barHelpers', function ($log, d3Helpers, svgHelpers) {
	/*
	var wrap = function (text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr('y'),
				dy = parseFloat(text.attr('dy')),
				tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(' '));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(' '));
					line = [word];
					tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
				}
			}
		});
	};
	*/

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

			var guidePosition =
				options.axis.guidePosition === 'bottom'? options.height*1:(scope.ylTopOffset - options.height*0.03);
			scope.guide
				.append('line')
				.attr('x1', scope.xlLeftOffset)
				.attr('x2', options.width + scope.xlLeftOffset)
				.attr('y1', guidePosition)
				.attr('y2', guidePosition)
				.style('stroke', '#BBB')
				.style('stroke-width', 1)
				.style('shape-rendering', 'crispEdges');
		},

		setXScale: function(scope, options) {
			scope.x = d3.scaleBand();
			scope.x
				.range([0, options.width]);

			if(!d3Helpers.isDefined(scope.xAxis)) {
				if(!d3Helpers.isDefined(options.x.orient) || !d3Helpers.isString(options.x.orient) ||
					(options.x.orient !== 'axisBottom' && options.x.orient !== 'axisTop')) {
					$log.warn('[Angular - D3] Tick orient must be a string. Setting default value "axisBottom"');
					options.x.orient = 'axisBottom';
				}
				scope.xAxis = d3[options.x.orient](scope.x);
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
			scope.x
				.domain(data.map(function(d) { return d[options.x.key]; }))
				.rangeRound([0, options.width])
				.paddingInner(options.bar.gap);
			scope.xAxis.tickFormat(options.x.tickFormat);
			if(d3Helpers.isDefined(scope.data)) {
				this.updateData(scope.data, options);
			}
		},

		setYScale: function(scope, options) {
			switch(options.y.scale) {
				case 'log':
					scope.y = d3.scaleLog().clamp(true);
					break;
				case 'sqrt':
					scope.y = d3.scaleSqrt();
					break;
				case 'time':
					scope.y = d3.scaleTime();
					break;
				default:
					if(options.y.scale !== 'linear') {
						$log.warn('[Angular - D3] Ticksize must be a string and ["linear", "log", "time", "sqrt"]. Setting default value "linear"');
						options.y.scale = 'linear';
					}
					scope.y = d3.scaleLinear();
					break;
			}

			var dy = 0;
			if(scope.type === 'oneAxisBar') {
				dy = options.height*0.2;

				if(options.axis.guidePosition === 'bottom') {
					dy += options.height*0.05;
				}
			}
			if(options.y.direction === 'btt') {
				scope.y.range([options.height - dy, 0]);
			} else {
				scope.y.range([0, options.height - dy]);
			}
			if(!d3Helpers.isDefined(scope.yAxis)) {
				if(!d3Helpers.isDefined(options.y.orient) || !d3Helpers.isString(options.y.orient)) {
					$log.warn('[Angular - D3] Tick orient must be a string. Setting default value "left"');
					options.y.orient = 'axisLeft';
				}
				scope.yAxis = d3[options.y.orient](scope.y);
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
						var locale = d3Helpers.isDefined(options.locale)? options.locale.timeFormat:d3.timeFormat;
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
			var _idFunction = function(d) {
				return d[options.idKey];
			};
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for bars');
				return;
			}
			$log.debug('[Angular - D3] Data for bars:', data);

			var formatTime = d3.timeFormat(options.timeFormat);
			var colors = d3Helpers.setColors(options.bar.colors);

			var mapFunction = function(d) {
				return d[options.y.key].map(function(e) {
					return {
						parentId: d[options.idKey],
						x: d[options.x.key],
						y: e
					};
				});
			};

			var domain = data.map(function(d) { return d[options.x.key]; });
			scope.x.domain(domain);
			scope.xl.call(scope.xAxis);
			$log.debug('[Angular - D3] x domain:', domain);

			var totals = [];
			var max = d3.max(data, function(d) {
				return d3.max(d[options.y.key], function(v, i) {
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

			var min = 0;

			if(!options.y.minFromZero) {
				min = d3.min(data, function(d) {
					return d3.min(d[options.y.key]);
				});
			}

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
				// scope.zoom.x(scope.x).y(scope.y);
			}

			var yMaxPoints = d3.max(data.map(function(d){ return d[options.y.key].length; }));
			var x0 = d3.scaleBand()
				.domain(d3.range(yMaxPoints))
				.rangeRound([0, scope.x.bandwidth()]);

			var barsContainer = scope.svg.select('g.' + scope.classPrefix + '-bars');
			if(barsContainer.empty()) {
				barsContainer = scope.svg.append('g')
					.attr('transform', 'translate(' + scope.xlLeftOffset + ',' + scope.ylTopOffset + ')')
					.attr('class', scope.classPrefix + '-bars')
					.attr('clip-path', 'url(#'+scope.idClip+')');
			}

			var updateBars = function(bars, update) {
				if(d3Helpers.isDefined(options.bar.path)) {
					bars
						.transition()
						.duration(options.animations.time)
						.attrTween('transform', function(d, i, a) {
							var iconHeight = 115;
							var percentH = Math.abs((scope.y(d.y) - scope.y(min))/iconHeight);
							var dy = 0;
							var trans = 'translate(' + (scope.x(d.x) + x0(i) - 102*percentH/2 + x0.bandwidth()/2) + ', ' + dy + ')';
							var inp = d3.interpolateString(a, trans);
							return function(t) {
								return inp(t);
							};
						});

					if(update) {
						bars = bars.selectAll('path');
					} else {
						bars = bars.append('path')
							.attr('d', options.bar.path)
							.attr('class', 'a3bar-bar-path')
							.attr('fill-rule', 'evenodd')
							.attr('transform', 'scale(0)')
							.style('opacity', 0);
					}

					bars
						.style('fill', function(d, i) {
							var color = d3.rgb(colors(i));
							return color;
						})
						.style('stroke', function(d, i) {
							return d3.rgb(colors(i)).darker();
						})
						.style('stroke-width', 1)
						.transition()
						.ease(options.animations.ease)
						.duration(options.animations.time)
						.attrTween('transform', function(d, i, a) {
							d = d3.select(this.parentNode).data()[0];
							var percentW = x0.bandwidth()/102;
							var percentH = Math.abs((scope.y(d.y) - scope.y(min))/115);
							return d3.interpolateString(a, 'scale(' + percentW + ', ' + percentH + ')');
						})
						.style('opacity', 0.8);
				} else {
					bars
						.attr('width', x0.bandwidth())
						.attr('title', function(d) {
							var format = d3.format('.3');
							return format(d.y);
						})
						.attr('x', function(d, i) {
							return scope.x(d.x) + x0(i);
						})
						.attr('y', function() {
							var h = d3.select(this).attr('height');
							var dy = options.y.direction === 'btt'? scope.y(0)-h:0;
							return dy;
						})
						.attr('height', function() {
							var h = d3.select(this).attr('height');
							return h? h:0;
						})
						//.style('opacity', 0)
						.style('fill', function() {
							var fill = d3.select(this).style('fill');
							return fill === 'rgb(0, 0, 0)'?
								d3.rgb(255,255,255):fill;
						})
						.transition()
						.ease(options.animations.ease)
						.duration(options.animations.time)
						.attr('height', function(d) {
							return Math.abs(scope.y(d.y) - scope.y(min));
						})
						.attr('y', function(d) {
							var h = Math.abs(scope.y(d.y) - scope.y(min));
							var dy = options.y.direction === 'btt'? scope.y(0)-h:0;
							return dy;
						})
						/*
						.attrTween('transform', function(d, i, a) {
							var h = Math.abs(scope.y(d.y) - scope.y(min));
							var dy = options.y.direction === 'btt'? (scope.y.range()[1] - h):0;
							var inp = d3.interpolateTransformSvg(a, 'translate(0, ' + dy + ')');
							return inp;
						})
						*/
						.styleTween('fill', function(d, i, a) {
							var color = d3.rgb(colors(i));
							var inp;
							if(d3Helpers.isDefined(options.bar.colorInterpolator) && d3Helpers.isFunction(options.bar.colorInterpolator)) {
								inp = options.bar.colorInterpolator(color.brighter(), color.darker());
								color = inp(d.y/max);
							}

							// TODO Check subcolors.
							var returnColor = d3Helpers.isDefined(options.bar.subcolors)? options.bar.subcolors[d.parentId-1]:color;
							inp = d3.interpolateRgb(a, returnColor);
							return inp;
						});
						//.style('opacity', 1);
				}
				bars.select('title').remove();
				bars.append('title')
					.text(function(d) {
						var format = d3.format('.3g');
						return format(d.y);
					});
			};

			var barGroups = barsContainer.selectAll('.' + scope.classPrefix + '-group-bar')
				.data(data, _idFunction);
			barGroups.interrupt();

			barGroups.exit().remove();

			var bars = barGroups.selectAll('.' + scope.classPrefix + '-bar').data(mapFunction);
			bars.interrupt();
			updateBars(bars, true);
			bars.exit().remove();

			var series = barGroups.enter()
				.append('g')
				.attr('class', scope.classPrefix + '-group-bar');

			bars = series.selectAll('.' + scope.classPrefix + '-bar')
				.data(mapFunction)
				.interrupt()
				.enter()
				.append(d3Helpers.isDefined(options.bar.path)? 'g':'rect')
				.attr('class', scope.classPrefix + '-bar');
			updateBars(bars);

			if(scope.type === 'oneAxisBar') {
				scope.svg.select('g.' + scope.classPrefix +'-helptext').remove();

				var helpTextContainer = scope.svg.append('g')
					.attr('transform', 'translate(' + scope.xlLeftOffset + ',' +
						(scope.ylTopOffset - (options.x.position === 'bottom'? options.height*0.15:-options.height*0.85)) + ')')
					.attr('class', scope.classPrefix + '-helptext');

				var textGroups = helpTextContainer.selectAll('.' + scope.classPrefix + '-values')
					.data(data, _idFunction)
					.interrupt();

				series = textGroups.enter()
					.append('g')
					.attr('class', scope.classPrefix + '-values');

				if(options.axis.showValues) {
					series.selectAll('.' + scope.classPrefix + '-val')
						.data(mapFunction)
						.interrupt()
						.enter()
						.append('text')
						.attr('x', function(d, i) {
							return scope.x(d.x) + x0(i) + x0.bandwidth()/2;
						})
						.attr('dy', !options.axis.showPercent? '0.5em':0)
						.attr('class', scope.classPrefix + '-val')
						.style('text-anchor', 'middle')
						.style('fill', options.axis.valuesColor)
						.text(function(d) {
							var format = d3.format('.3g');
							return format(d.y);
						});
				}

				if(options.axis.showPercent) {
					series.selectAll('.' + scope.classPrefix + '-percent')
						.data(mapFunction)
						.interrupt()
						.enter()
						.append('text')
						.attr('x', function(d, i) {
							return scope.x(d.x) + x0(i) + x0.bandwidth()/2;
						})
						.attr('y', options.height*0.065)
						.attr('dy', !options.axis.showValues? '-0.5em':0)
						.attr('class', scope.classPrefix + '-percent')
						.style('text-anchor', 'middle')
						.style('font-size', '0.85em')
						.style('font-weight', 'bold')
						.style('fill', options.axis.percentColor)
						.text(function(d, i) {
							var format = d3.format('.3p');
							return format(d.y/totals[i]);
						});
				}
			}

			svgHelpers.updateStyles(scope, options);
		}
	};
});
