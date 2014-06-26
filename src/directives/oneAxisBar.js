angular.module('angular-d3-charts').directive('a3oabar', function ($log, d3Helpers, svgHelpers, barHelpers, barDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options',
			data: '=data'
		},
		template: '<div class="angular-a3oabar"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] One Axis Bar scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			if(!jQuery) {
				$log.error('JQuery is not loaded');
				return;
			}
			scope.container = element;
			scope.type = 'oneAxisBar';
			scope.classPrefix = 'a3oabar';
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			// Orient option disabled for this chart.
			options.x.orient = 'bottom';

			barHelpers.setXScale(scope, options);
			barHelpers.setYScale(scope, options);
			if(isDefined(options.zoom) && options.zoom) {
				svgHelpers.addZoomBehaviour(scope, barHelpers.zoomBehaviour);
			}
			svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			barHelpers.addOneAxis(scope, options);
			svgHelpers.updateStyles(scope, options);

			scope.$watch('data', function() {
				barHelpers.updateData(scope, options);
			});
		}
	};
});
