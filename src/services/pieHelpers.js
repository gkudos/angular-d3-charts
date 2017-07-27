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

	var intersect = function(a, b) {
	  return (a.left <= b.right &&
	          b.left <= a.right &&
	          a.top <= b.bottom &&
	          b.top <= a.bottom);
	};

	var wrap = function(text, width) {
    text = d3.select(text);
		var words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    while(word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if(tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
	};

	var getTranslation = function(transform) {
		// Create a dummy g for calculation purposes only. This will never
		// be appended to the DOM and will be discarded once this function
		// returns.
		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		// Set the transform attribute to the provided string value.
		g.setAttributeNS(null, 'transform', transform);

		// consolidate the SVGTransformList containing all transformations
		// to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
		// its SVGMatrix.
		var matrix = g.transform.baseVal.consolidate().matrix;

		// As per definition values e and f are the ones for the translation.
		return [matrix.e, matrix.f];
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
					var rect1 = this.getBoundingClientRect();
					$log.debug('Rectangle Enter:', rect1.top, rect1.left);
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
					var rect1 = this.getBoundingClientRect();
					// var $this = this;
					$log.debug('Rectangle:', rect1.top, rect1.left);

					if(rect1.left < 0) {
						wrap(this, rect1.right);
					} else if(rect1.right > options.width) {
						wrap(this, options.width - rect1.left);
					}

					var pos = scope.outerArc.centroid(d);

					/*
					var intersects = 0;
					scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
						.each(function() {
							var rect2 = this.getBoundingClientRect();
							var data = d3.select(this).data()[0];
							if(intersect(rect1, rect2) && this !== $this) {
								$log.debug('Intersect', d.data[options.x.key], data.data[options.x.key]);
								intersects++;
							}
						});

					*/

					// changes the point to be on left or right depending on where label is.
					pos[0] = options.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					// pos[1] = pos[1] + rect1.height * intersects;
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

			this.setStyles(scope, options);
			// this.wrapLabels(scope, options);
			//this.resolveLabelConflics(scope, options);
			this.arrangeLabels(scope, options);
			/*
			while(hasIntersections) {
				hasIntersections = this.resolveLabelConflics(scope, options);
			}
			*/
		},

		resolveLabelConflics: function(scope, options) {
			var labels = scope.svg.selectAll('.' + scope.classPrefix + '-labelName text');
			var countMoves = 0;
			labels
				.each(function() {
					var rect1 = this.getBoundingClientRect();
					var text1 = d3.select(this);
					var $this = this;
					var moved = true;

					var move = function() {
						countMoves++;
						var rect2 = this.getBoundingClientRect();
						//var text2 = d3.select(this);

						if($this !== this) {
							if(intersect(rect1, rect2)) {
								var d = text1.data()[0];
								var pos = scope.outerArc.centroid(d);
								var toRight = (midAngle(d) < Math.PI ? 1 : -1) * (rect1.left < 0? -1:1);
								pos[0] = options.radius * 0.95 * toRight;
								if(!d.data.intersects) {
									d.data.intersects = 0;
								}

								d.data.intersects++;
								pos[1] = pos[1] + rect1.height*d.data.intersects;
								$log.debug('Data:', d, pos);
								text1
									.interrupt()
									.attr('transform', 'translate(' + pos + ')')
									.style('fill', 'red')
									.style('text-anchor', toRight === 1? 'start':'end');
								rect1 = $this.getBoundingClientRect();
								moved = true;
							}
						}
					};
					if(moved) {
						moved = false;
						labels.each(move);
					}

					$log.debug('Moves', countMoves);
				});
		},

		arrangeLabels: function(scope, options) {
			var move = 1;
			var moveLabels = function() {
				var that = this,
				a = this.getBoundingClientRect();
				scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
					.each(function() {
						if(this !== that) {
							var b = this.getBoundingClientRect();
							if(intersect(a, b)) {
								// overlap, move labels
								var dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom))*0.1,
								tt = getTranslation(d3.select(this).attr('transform')),
								to = getTranslation(d3.select(that).attr('transform'));
								move += Math.abs(dy);

								var ttAnchor = d3.select(this).style('text-anchor');
								var toAnchor = d3.select(that).style('text-anchor');
								if((to[1] + dy) < options.radius) {
									to = [ to[0], to[1] + dy ];
								} else {
									to = [ -to[0], to[1]];
									toAnchor = toAnchor === 'start'? 'end':'start';
								}

								if((tt[1] - dy) > -options.radius) {
									tt = [ tt[0], tt[1] - dy ];
								} else {
									tt = [ -tt[0], tt[1] ];
									ttAnchor = ttAnchor === 'start'? 'end':'start';
								}

								d3.select(this)
									.interrupt()
									.attr('transform', 'translate(' + tt + ')')
									.style('text-anchor', ttAnchor);
								d3.select(that)
									.interrupt()
									.attr('transform', 'translate(' + to + ')')
									.style('text-anchor', toAnchor);
								a = this.getBoundingClientRect();
							}
						}
					});
			};
			while(move > 0) {
				move = 0;
				scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
					.each(moveLabels);
			}
		},

		wrapLabels: function(scope, options) {
			scope.svg.selectAll('.' + scope.classPrefix + '-labelName text')
				.each(function() {
					var rect = this.getBoundingClientRect();
					if(rect.left < 0) {
						wrap(this, rect.right);
					} else if(rect.right > options.width) {
						wrap(this, options.width - rect.left);
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
