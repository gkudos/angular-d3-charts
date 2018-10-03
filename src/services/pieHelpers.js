angular.module('angular-d3-charts').factory('pieHelpers', function ($log, d3Helpers, svgHelpers) {

	function _tweenPie($this, scope, options, b) {
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
				if(!d3Helpers.isDefined(options.pieAnimation) || options.pieAnimation === '') {
					$log.warn('[Angular - D3] The option "pieAnimation" is undefined or it has a invalid value. Setting to "normal"');
					options.pieAnimation = 'normal';
				}
				start = {startAngle: 0, endAngle: 0};
				break;
		}
		if($this._current) {
			start = $this._current;
		}
		var i = d3.interpolate(start, b);
		$this._current = i(0);
		return function(t) {
			return scope.arc(i(t));
		};
	}

	// Find the element in data0 that joins the highest preceding element in data1.
	function findPreceding(i, data0, data1, key) {
		var m = data0.length;
		while (--i >= 0) {
			var k = key(data1[i]);
			for (var j = 0; j < m; ++j) {
				if (key(data0[j]) === k) {
					return data0[j];
				}
			}
		}
	}

	// Find the element in data0 that joins the lowest following element in data1.
	function findFollowing(i, data0, data1, key) {
		var n = data1.length, m = data0.length;
		while (++i < n) {
			var k = key(data1[i]);
			for (var j = 0; j < m; ++j) {
				if (key(data0[j]) === k) {
					return data0[j];
				}
			}
		}
	}

	function findNeighborArc(i, data0, data1, key) {
    var d;
		var obj;
    if(d = findPreceding(i, data0, data1, key)) {
      obj = angular.copy(d);
      obj.startAngle = d.endAngle;
      return obj;
    } else if(d = findFollowing(i, data0, data1, key)) {
      obj = angular.copy(d);
      obj.endAngle = d.startAngle;
      return obj;
    }
    return null;
  }

	var pathAnim = function(path, dir, options) {
		switch(dir) {
			case 0:
				path
					.style('stroke', null)
					.transition('pie-animation')
					.duration(500)
					.ease(d3.easeBounce)
					.style('stroke-opacity', 0)
					.style('stroke-width', 0)
					.attr('d', d3.arc()
						.outerRadius(options.radius * 0.9)
					);
				break;
			case 1:
				path
					.style('stroke', function() {
						return d3.color(d3.select(this).attr('fill')).darker();
					})
					.style('stroke-opacity', 0)
					.style('stroke-width', 0)
					.transition('pie-animation')
					.style('stroke-opacity', 1)
					.style('stroke-width', 1)
					.attr('d', d3.arc()
						.outerRadius(options.radius * 0.95)
					);
				break;
			case 2:
				path
					.style('stroke', function() {
						return d3.color(d3.select(this).attr('fill')).darker();
					})
					.style('stroke-opacity', 0)
					.style('stroke-width', 0)
					.transition('pie-animation')
					.style('stroke-opacity', 1)
					.style('stroke-width', 1)
					.attr('d', d3.arc()
						.outerRadius(options.radius * 0.95)
					);
				break;
		}
	};

	var midAngle = function(d) {
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	};

	var _wrapLabels = function(scope, options) {
		scope.svg.selectAll('.' + scope.classPrefix + '-lines g text')
			.each(function() {
				var rect = this.parentNode.getBoundingClientRect();
				if(rect.left < 0) {
					svgHelpers.wrap(this, rect.right);
				} else if(rect.right > options.width) {
					svgHelpers.wrap(this, options.width - rect.left);
				}
			});
	};

	return {
		addArc: function(scope, options) {
			var w = options.width - options.margin.left - options.margin.right;
			if(options.legend.show && options.legend.type === 'vertical') {
				w -= options.legend.size;
			}
			var h = options.height - options.margin.top - options.margin.bottom;
			options.radius = Math.min(w, h) / 2;
			scope.arc = d3.arc()
				.outerRadius(options.radius * 0.9);

			scope.outerArc = d3.arc()
				.innerRadius(options.radius * 1)
				.outerRadius(options.radius * 1);

			scope.pie = d3.pie()
				.value(function(d) { return d[options.y.key]; })
		    .sort(null);

			// ===========================================================================================
	    // g elements to keep elements within svg modular
			scope.svg.append('g').attr('class', scope.classPrefix + '-slices');
			scope.svg.append('g').attr('class', scope.classPrefix + '-labelName');
	    scope.svg.append('g').attr('class', scope.classPrefix + '-lines');
	    // ===========================================================================================
		},

		updateData: function(scope, options) {
			$log.debug('Update data');
			// var percentFormat = d3.format(',.2%');
			var colors = d3Helpers.setColors(options.pie.colors);
			var data = d3Helpers.getDataFromScope(scope, options);
			data = data.filter(function(d) {
				return d3Helpers.isDefined(d[options.y.key]) && !isNaN(d[options.y.key]);
			});

			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			// Key function for get data.
			var key = function(d) {
				if(angular.isUndefined(d)) {
					return d;
				}
				if(angular.isUndefined(d.data)) {
					return d.data;
				}
				return d.data[options.idKey];
			};

			var arcTween = function() {
				return _tweenPie(this, scope, options, d3.select(this).data()[0]);
			};

			var removeTooltip = function() {
				var lines = scope.svg.select('.a3pie-lines');
				lines
					.selectAll('g')
					.remove();

				return lines;
			};

			var onTooltip = function(d) {
				pathAnim(d3.select(this), 1, options);
				var lines = removeTooltip();
				var g = lines.append('g');
				var polyline = g.append('polyline');

				polyline
					.style('opacity', 0.3)
					.style('stroke', 'black')
					.style('stroke-width', '2px')
					.style('fill', 'none')
					.transition().duration(1000)
					.attrTween('points', function() {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);

						return function(t) {
							var d2 = interpolate(t);
							var pos = scope.outerArc.centroid(d2);
							pos[0] = options.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
							return [scope.arc.centroid(d2), scope.outerArc.centroid(d2), pos];
						};
					});

				var text = g.append('text')
					.attr('dy', '.35em')
					.html(function() {
						return d.data[options.x.key];
					});

				text
					.attr('transform', function() {
						this._current = this._current || d;
						var pos = scope.outerArc.centroid(this._current);
						pos[0] = options.radius * (midAngle(this._current) < Math.PI ? 1 : -1);
						return 'translate('+ pos +')';
					})
					.style('text-anchor', function(){
						this._current = this._current || d;
						return midAngle(this._current) < Math.PI ? 'start':'end';
					})
					.each(function() {
						svgHelpers.wrap(this, options.tooltipSize);
					});
			};

			//scope.svg.selectAll('.' + scope.classPrefix + '-arc').remove();

			// ===========================================================================================
			// add and colour the pie slices
			scope.slices = scope.svg.selectAll('.' + scope.classPrefix + '-slices');
			var path = scope.slices.selectAll('path');
			var dataSlices = path.data();
			var pieData = scope.pie(data);

			var arcs = path.data(pieData, key);

			arcs
				.on('mouseout', null)
				.on('mouseover', null)
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.on('end', function() {
					d3.select(this)
						.on('mouseover', function(d) {
							pathAnim(d3.select(this), 1, options);
							onTooltip(d);
						})
						.on('mouseout', function() {
							removeTooltip();
							pathAnim(d3.select(this), 0, options);
						})
						.on('click', onTooltip);
				})
				.attr('fill', function(d) {
					if(angular.isDefined(options.colorKey) && angular.isDefined(d.data[options.colorKey])) {
						return d.data[options.colorKey];
					}
					return colors(d.data[options.x.key]);
				})
				.attrTween('d', arcTween);

			arcs.enter()
				.append('path')
				.each(function(d, i) {
					var narc = findNeighborArc(i, dataSlices, pieData, key);
					if(narc) {
						this._current = narc;
						this._previous = narc;
					} else {
						this._current = d;
					}
				})
				.attr('fill', function(d) {
					if(angular.isDefined(options.colorKey) && angular.isDefined(d.data[options.colorKey])) {
						return d.data[options.colorKey];
					}
					return colors(d.data[options.x.key]);
				})
				.transition('pie-enter')
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.on('end', function() {
					d3.select(this)
						.on('mouseover', function(d) {
							pathAnim(d3.select(this), 1, options);
							onTooltip(d);
						})
						.on('mouseout', function() {
							removeTooltip();
							pathAnim(d3.select(this), 0, options);
						})
						.on('click', onTooltip);
				})
				.attrTween('d', arcTween);

			arcs
				.exit()
				.each(function() {
					d3.select(this)
					.on('mouseout', null)
					.on('mouseover', null);
				})
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attrTween('d', function(d, idx) {
					var previous = this._previous? this._previous:findNeighborArc(idx, pieData, dataSlices, key);
					var i = d3.interpolateObject(d, previous);
					return function(t) {
						return scope.arc(i(t));
					};
				})
				.remove();

			// ===========================================================================================

			this.setStyles(scope, options);

			if(options.legend.show) {
				this.createLegend(scope, options, colors);
			}
		},

		createLegend: function(scope, options, colors) {
			var percentFormat = d3.format(',.2%');
			var data = d3Helpers.getDataFromScope(scope, options);

			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});

			// Key function for get data.
			var key = function(d) {
				if(angular.isUndefined(d)) {
					return d;
				}
				return d[options.idKey];
			};


			if(!scope.legend) {
				var left;
				var top;
				if(options.legend.type === 'vertical') {
					left = options.radius + options.legend.gap;
					top = -options.radius*0.9;
				} else {
					left = -options.containerWidth/2 + options.margin.left;
					top = options.radius + options.legend.gap;
				}
				scope.legend = scope.svg
					.append('g')
					.attr('class', 'legend')
					.attr('transform', 'translate(' + left  +', ' + top + ')');
			}

			var items = scope.legend
				.selectAll('.legend-item')
				.data(data, key);

			items
				.selectAll('text')
				.html(function() {
					var d = d3.select(this.parentNode).data()[0];
					return d[options.x.key] + ' (' + percentFormat(d[options.y.key]/total) + ')';
				})
				.each(function() {
					if(options.legend.type === 'vertical') {
						svgHelpers.wrap(this, options.legend.size - 20);
					}
				});

			items
				.selectAll('rect')
				.attr('fill', function() {
					var d = d3.select(this.parentNode).data()[0];
					return colors(d[options.x.key]);
				});

			var item = items.enter()
				.append('g')
				.attr('class', 'legend-item');

			item
				.append('rect')
				.attr('width', 18)
				.attr('height', 18)
				.attr('transform', 'translate(0, -13)')
				.attr('fill', function() {
					var d = d3.select(this.parentNode).data()[0];
					return colors(d[options.x.key]);
				});

			item
				.append('text')
				// .attr('x', '25px')
				.attr('y', 0)
				.attr('dy', '0')
				.attr('dx', '25px')
				.html(function() {
					var d = d3.select(this.parentNode).data()[0];
					return d[options.x.key] + ' (' + percentFormat(d[options.y.key]/total) + ')';
				})
				.each(function() {
					if(options.legend.type === 'vertical') {
						svgHelpers.wrap(this, options.legend.size - 20);
					}
				});

			items
				.exit()
				.remove();

			var currentX = 0;
			var currentY = 0, iy = 0;
			scope.legend
				.selectAll('.legend-item')
				.attr('transform', function() {
					var oldY = Math.max(currentY, 25*iy);
					var oldX = currentX;

					var clientRect =
						d3.select(this)
							//.select('text')
							.node()
							.getBoundingClientRect();

					if(options.legend.type === 'vertical') {
						currentY += clientRect.height + 5;
						iy++;
					} else {
						if(currentX + clientRect.width > options.containerWidth) {
							currentX = 0;
							oldX = 0;
							iy++;
							oldY = Math.max(currentY, 25*iy);
						}

						currentX += clientRect.width + 10;
					}
					return 'translate(' + oldX + ', ' + oldY + ')';
				});

			var legendRect = scope.legend.node().getBoundingClientRect();
			if(scope.container) {
				$log.debug('SVG:', scope.svg.node().parentNode);
				var svg = d3.select(scope.svg.node().parentNode);
				if(legendRect.bottom > options.containerHeight) {
					d3.selectAll(scope.container)
						.style('height', legendRect.bottom + 'px');

					svg.attr('height', legendRect.bottom);
				} else {
					d3.selectAll(scope.container)
						.style('height', options.containerHeight + 'px');

					svg.attr('height', options.containerHeight);
				}
			}
		},

		wrapLabels: _wrapLabels,

		setStyles: function(scope, options) {
			scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
				.style('fill', options.axis.color)
				.style('font-weight', options.axis.fontWeight);

			scope.svg
				.style('font-family', options.fontFamily)
				.style('font-size', options.fontSize);
		}
	};
});
