angular.module('angular-d3-charts').factory('svgHelpers', function ($log, d3Helpers) {
	return {
		addSVG: function(scope, container, options) {
			var w = options.width + options.margin.left + options.margin.right;
			w += options.legend.show? options.legend.width:0;
			var h = options.height + options.margin.top + options.margin.bottom + (options.axis.show? 30:0);

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
				.attr('width', options.width)
				.attr('height', options.height);
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
			if(options.axis.show && options.y.position === 'left') {
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
			if(options.axis.show && options.x.position === 'top') {
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

			if(options.axis.show === true) {
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
			} else {
				scope.svg.selectAll('.axis')
					.style('display', 'none');
			}

			scope.svg.style('font-family', options.fontFamily);
			scope.svg.style('font-size', options.fontSize);
		}
	};
});
