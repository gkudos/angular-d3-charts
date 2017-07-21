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
		return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
	      : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
	      : null;
	}

	// calculates the angle for the middle of a slice
	var midAngle = function(d) {
		return d.startAngle + (d.endAngle - d.startAngle) / 2;
	};

	// function to create the HTML string for the tool tip. Loops through each key in data object
	// and returns the html string key: value
	var toolTipHTML = function(data) {
		var tip = '', i   = 0;

		for(var key in data.data) {
			// if value is a number, format it as a percentage
			var value = data.data[key];

			// leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
			// tspan effectively imitates a line break.
			if (i === 0) {
				tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
			} else {
				tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
			}
			i++;
		}

		return tip;
	};

	return {
		addArc: function(scope, options) {
			var w = options.width - options.margin.left - options.margin.right;
			var h = options.height - options.margin.top - options.margin.bottom;
			options.radius = Math.min(w, h) / 2;
			scope.arc = d3.arc()
		    .outerRadius(options.radius);

			if(angular.isUndefined(options.innerRadius)) {
				options.innerRadius = options.radius * 0.8;
			}
			scope.arc.innerRadius(options.innerRadius);

			scope.outerArc = d3.arc()
        .outerRadius(options.radius)
        .innerRadius(options.radius);

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
			var percentFormat = d3.format(',.2%');
			var colors = d3Helpers.setColors(options.pie.colors);
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});

			// function that creates and adds the tool tip to a selected element
			var toolTip = function(selection) {
				// add tooltip (svg circle element) when mouse enters label or slice
				selection.on('mouseenter', function(data) {
					scope.svg.append('text')
						.attr('class', 'toolCircle')
						.attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
						.html(toolTipHTML(data)) // add text to the circle.
						.style('font-size', '.9em')
						.style('text-anchor', 'middle'); // centres text in tooltip

					scope.svg.append('circle')
						.attr('class', 'toolCircle')
						.attr('r', options.innerRadius - 5) // radius of tooltip circle
						.style('fill', colors(data.data[options.x.key])) // colour based on category mouse is over
						.style('fill-opacity', 0.40);

				});

				// remove the tooltip when mouse leaves the slice/label
				selection.on('mouseout', function () {
					d3.selectAll('.toolCircle').remove();
				});
			};

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
			// add and colour the donut slices
			scope.slices = scope.svg.selectAll('.' + scope.classPrefix + '-slices');
			var dataSlices = scope.slices.selectAll('path').data();
			var pieData = scope.pie(data);

			var arcs = scope.slices
				.selectAll('path')
				.data(pieData, key);

			arcs.enter()
				.append('path')
				.attr('fill', function(d) {
					return colors(d.data[options.x.key]);
				})
				.attr('d', scope.arc);

			arcs
				.exit()
				.datum(function(d, i) {
					$log.debug('This', this);
					return findNeighborArc(i, pieData, dataSlices, key) || d;
				})
				.interrupt()
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.remove();

			scope.slices.selectAll('path')
				.interrupt()
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attrTween('d', arcTween)
				.style('opacity', 1);
			// ===========================================================================================

			// ===========================================================================================
			// add text labels
			scope.labels = scope.svg.selectAll('.' + scope.classPrefix + '-labelName');

			var labels = scope.labels
				.selectAll('text')
				.data(pieData, key);

			labels
				.enter()
				.append('text')
				.attr('dy', '.35em')
				.html(function(d) {
					// add "key: value" for given category. Number inside tspan is bolded in stylesheet.
					return d.data[options.x.key] + ': <tspan>' + percentFormat(d.data[options.y.key]/total) + '</tspan>';
				})
				.attr('transform', function(d) {
					// effectively computes the centre of the slice.
					// see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
					var pos = scope.outerArc.centroid(d);

					// changes the point to be on left or right depending on where label is.
					pos[0] = options.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					return 'translate(' + pos + ')';
				})
				.style('text-anchor', function(d) {
					// if slice centre is on the left, anchor text to start, otherwise anchor to end
					return (midAngle(d)) < Math.PI ? 'start' : 'end';
				});

			labels.exit().remove();

			scope.labels.selectAll('text')
				.attr('dy', '.35em')
				.html(function(d) {
					// add "key: value" for given category. Number inside tspan is bolded in stylesheet.
					return d.data[options.x.key] + ': <tspan>' + percentFormat(d.data[options.y.key]/total) + '</tspan>';
				})
				.interrupt()
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attr('transform', function(d) {
					// effectively computes the centre of the slice.
					// see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
					var pos = scope.outerArc.centroid(d);

					// changes the point to be on left or right depending on where label is.
					pos[0] = options.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					return 'translate(' + pos + ')';
				})
				.style('text-anchor', function(d) {
					// if slice centre is on the left, anchor text to start, otherwise anchor to end
					return (midAngle(d)) < Math.PI ? 'start' : 'end';
				});
			// ===========================================================================================

			// ===========================================================================================
			// add lines connecting labels to slice. A polyline creates straight lines connecting several points
			scope.polylines = scope.svg.select('.' + scope.classPrefix + '-lines');

			var polylines = scope.polylines
				.selectAll('polyline')
				.data(pieData, key);

			polylines
				.enter()
				.append('polyline')
				.style('opacity', '0.3')
				.style('stroke', 'black')
				.style('stroke-width', '2px')
				.style('fill', 'none')
				.attr('points', function(d) {
					// see label transform function for explanations of these three lines.
					var pos = scope.outerArc.centroid(d);
					pos[0] = options.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					return [scope.arc.centroid(d), scope.outerArc.centroid(d), pos];
				});

			polylines.exit().remove();

			scope.polylines.selectAll('polyline')
				.interrupt()
				.transition()
				.duration(options.animations.time)
				.ease(options.animations.ease)
				.attrTween('points', function(d) {
					// see label transform function for explanations of these three lines.
					var pos = scope.outerArc.centroid(d);
					pos[0] = options.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					return d3.interpolateString(
						this.getAttribute('points'),
						[scope.arc.centroid(d), scope.outerArc.centroid(d), pos]
					);
				});
			// ===========================================================================================

			// ===========================================================================================
      // add tooltip to mouse events on slices and labels
      d3.selectAll('.' + scope.classPrefix + '-labelName text, .' + scope.classPrefix + '-slices path').call(toolTip);
      // ===========================================================================================
			/*
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
			*/
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
