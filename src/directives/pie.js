angular.module('angular-d3-charts').directive('a3pie', function ($log, d3Helpers, svgHelpers, pieHelpers, pieDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3pie"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Pie scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			scope.type = 'pie';
			scope.classPrefix = 'a3pie';
			var options = pieDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			svgHelpers.addSVG(scope, element.get(0), options);
			scope.svg.attr('transform', 'translate(' + options.width / 2 + ',' + options.height / 2 + ')');

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			pieHelpers.addArc(scope, options);
			//svgHelpers.updateStyles(scope, options);

			pieHelpers.updateData(scope, options);

		}
	};
});
