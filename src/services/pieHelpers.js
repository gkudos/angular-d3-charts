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

	return {
		addArc: function(scope, options) {
			var w = options.width - options.margin.left - options.margin.right;
			if(options.legend.show) {
				w -= options.legend.width;
			}
			var h = options.height - options.margin.top - options.margin.bottom;
			options.radius = Math.min(w, h) / 2;
			scope.arc = d3.arc()
		    .outerRadius(options.radius);

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
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			/*
			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});
			*/

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

			//scope.svg.selectAll('.' + scope.classPrefix + '-arc').remove();

			// ===========================================================================================
			// add and colour the pie slices
			scope.slices = scope.svg.selectAll('.' + scope.classPrefix + '-slices');
			var path = scope.slices.selectAll('path');
			var dataSlices = path.data();
			var pieData = scope.pie(data);

			var arcs = path.data(pieData, key);

			arcs
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
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
					return colors(d.data[options.x.key]);
				})
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attrTween('d', arcTween);

			arcs
				.exit()
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
				var left = options.radius*1.1;
				var top = -options.radius*0.9;
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
					svgHelpers.wrap(this, options.legend.width - 20);
				});

			items
				.selectAll('rect')
				.attr('fill', function() {
					var d = d3.select(this.parentNode).data()[0];
					return colors(d[options.x.key]);
				});

			var item = items.enter()
				.append('g')
				.attr('class', 'legend-item')
				.attr('transform', function(d, i) {
					return 'translate(0, ' + (i*25) + ')';
				});

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
				.attr('x', '25px')
				.attr('y', 0)
				.attr('dy', '0')
				.attr('dx', '25px')
				.html(function() {
					var d = d3.select(this.parentNode).data()[0];
					return d[options.x.key] + ' (' + percentFormat(d[options.y.key]/total) + ')';
				})
				.each(function() {
					svgHelpers.wrap(this, options.legend.width - 20);
				});

			items
				.exit()
				.remove();

			var currentY = 0;
			scope.legend
				.selectAll('.legend-item')
				.attr('transform', function(d, i) {
					var oldY = Math.max(currentY, 20*i);
					currentY += d3.select(this).select('text').node().getBoundingClientRect().height + 10;

					return 'translate(0, ' + oldY + ')';
				});
		},

		wrapLabels: function(scope, options) {
			scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
				.each(function() {
					var rect = this.getBoundingClientRect();
					if(rect.left < 0) {
						svgHelpers.wrap(this, rect.right);
					} else if(rect.right > options.width) {
						svgHelpers.wrap(this, options.width - rect.left);
					}
				});
		},

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
