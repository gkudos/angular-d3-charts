angular.module("angular-d3-charts").factory('svgHelpers', function () {
	return {
		addSVG: function(container) {
			var svg = d3.select(container)
				.append("svg");
			return svg;
		}
	};
});