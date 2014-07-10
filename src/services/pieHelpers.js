angular.module('angular-d3-charts').factory('pieHelpers', function ($log, d3Helpers/*, svgHelpers*/) {
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
				if(!d3Helpers.isDefined(options.pieAnimation) || options.pieAnimation !== '') {
					$log.warn('[Angular - D3] The option "pieAnimation" is undefined or it has a invalid value. Setting to "normal"');
					options.pieAnimation = 'normal';
				}
				start = {startAngle: 0, endAngle: 0};
				break;
		}
		if($this.parentNode._current) {
			start = $this.parentNode._current;
		}
		var i = d3.interpolate(start, b);
		$this.parentNode._current = i(0);
		return function(t) {
			return scope.arc(i(t));
		};
	}

	function findNeighborArc(i, data0, data1, key) {
		var d;
		return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
	      : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
	      : null;
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
			$log.debug('Update data');
			var colors = d3Helpers.setColors(options.pie.colors);
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});

			//scope.svg.selectAll('.' + scope.classPrefix + '-arc').remove();

			var g = scope.svg.selectAll('.' + scope.classPrefix + '-arc');

			var data0 = g.data(),
      data1 = scope.pie(data);

			var key = function(d) {
				return d.data[options.idKey];
			};

			var arcTween = function() {
				return _tweenPie(this, scope, options, d3.select(this.parentNode).data()[0]);
			};

			var gData = g.data(data1, key);

			g = gData.enter().append('g')
				.each(function(d, i) {
					this._current = findNeighborArc(i, data0, data1, key) || d;
				})
	      .attr('class', scope.classPrefix + '-arc');

			g.append('path')
				.style('opacity', 0)
				.style('fill', function(d) {
					return colors(d.data[options.x.key]);
				})
				.style('stroke', options.borderColor);

			g.append('text')
	      .attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
	      .attr('dy', options.x.show? '-0.75em':0)
				.attr('class', scope.classPrefix + '-arc-val')
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

			if(options.x.show) {
				g.append('text')
					.attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
					.attr('dy', '.75em')
					.attr('class', scope.classPrefix + '-arc-label')
					.style('text-anchor', 'middle')
					.text(function(d) {
						return d.data[options.x.key];
					});
			}

			gData.exit()
				.datum(function(d, i) { return findNeighborArc(i, data1, data0, key) || d; })
				.remove();

			gData.selectAll('path')
				.interrupt()
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attrTween('d', arcTween)
				.style('opacity', 1);

			gData.selectAll('.' + scope.classPrefix + '-arc-val')
				.text(function() {
					var d = d3.select(this.parentNode).data()[0];
					var text;

					if(options.showPercent) {
						var format = d3.format('%');
						text = format(d.data[options.y.key]/total);
					} else {
						text = d.data[options.y.key];
					}
					return text;
				})
				.transition()
				.duration(750)
				.attrTween('transform', function(da, i, a) {
					var d = d3.select(this.parentNode).data()[0];
					return d3.interpolateTransform(a, 'translate(' + scope.arc.centroid(d) + ')');
				});

			if(options.x.show) {
				gData.selectAll('.' + scope.classPrefix + '-arc-label')
					.text(function() {
						var d = d3.select(this.parentNode).data()[0];
						return d.data[options.x.key];
					})
					.transition()
					.duration(750)
					.attrTween('transform', function(da, i, a) {
						var d = d3.select(this.parentNode).data()[0];
						return d3.interpolateTransform(a, 'translate(' + scope.arc.centroid(d) + ')');
					});
			}

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
