angular.module('angular-d3-charts').factory('lineHelpers', function ($log, d3Helpers, svgHelpers) {
	/*
	var _idFunction = function(d) {
		return d.id;
	};
	*/

	return {
		addAxis: function(scope, options) {
			svgHelpers.addXAxis(scope, options);
			svgHelpers.addYAxis(scope, options);
			svgHelpers.addSubdivideTicks(scope.yl, scope.y, scope.yAxis, options.y);
		}
	};
});
