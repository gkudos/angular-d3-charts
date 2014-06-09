angular.module('angular-d3-charts').directive('a3line', function ($log, d3Helpers, svgHelpers, lineHelpers, lineDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3line"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Line scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			if(!jQuery) {
				$log.error('JQuery is not loaded');
				return;
			}
			scope.container = element;
			scope.type = 'line';
			scope.classPrefix = 'a3line';

			var options = lineDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);
		}
	};
});
