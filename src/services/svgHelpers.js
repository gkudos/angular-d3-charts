angular.module('angular-d3-charts').factory('svgHelpers', function ($log, d3Helpers) {
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
