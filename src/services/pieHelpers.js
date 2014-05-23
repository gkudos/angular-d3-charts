angular.module('angular-d3-charts').factory('pieHelpers', function ($log, d3Helpers/*, svgHelpers*/) {
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
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			var colors = d3.scale.category20();
			var g = scope.svg.selectAll('.' + scope.classPrefix + '-arc')
	      .data(scope.pie(data))
				.enter().append('g')
	      .attr('class', scope.classPrefix + '-arc');

			g.append('path')
	      .attr('d', scope.arc)
	      .style('fill', function(d) {
					return colors(d.data[options.x.key]);
				});
		}
	};
});
