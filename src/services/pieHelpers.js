angular.module('angular-d3-charts').factory('pieHelpers', function ($log, d3Helpers/*, svgHelpers*/) {
	function _tweenPie(scope, options, b) {
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
		var i = d3.interpolate(start, b);
		return function(t) {
			return scope.arc(i(t));
		};
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
			var data = d3Helpers.getDataFromScope(scope, options);
			if(d3Helpers.isUndefinedOrEmpty(data)) {
				$log.warn('[Angular - D3] No data for pie');
				return;
			}

			var total = d3.sum(data, function(d) {
				return d[options.y.key];
			});

			var colors = d3.scale.category20();
			var g = scope.svg.selectAll('.' + scope.classPrefix + '-arc')
	      .data(scope.pie(data))
				.enter().append('g')
	      .attr('class', scope.classPrefix + '-arc');

			g.append('path')
				.style('opacity', 0)
				.style('fill', function(d) {
					return colors(d.data[options.x.key]);
				})
				.style('stroke', options.borderColor)
				.interrupt()
				.transition()
				.duration(1500)
				.ease('cubic-in-out')
	      .attrTween('d', function(d) {
					return _tweenPie(scope, options, d);
				})
				.style('opacity', 1);

			g.append('text')
	      .attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
	      .attr('dy', '-0.75em')
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

			g.append('text')
				.attr('transform', function(d) { return 'translate(' + scope.arc.centroid(d) + ')'; })
				.attr('dy', '.75em')
				.style('text-anchor', 'middle')
				.text(function(d) {
					return d.data[options.x.key];
				});

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
