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
			scope.container = element;
			scope.type = 'oneAxisBar';
			scope.classPrefix = 'a3oabar';
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			// Set width and height if they are defined
			var w = isDefined(attrs.width)? attrs.width:options.width,
				h = isDefined(attrs.height)? attrs.height:options.height;

			if (isNaN(w)) {
				element.css('width', w);
			} else {
				element.css('width', w + 'px');
			}

			if (isNaN(h)) {
				element.css('height', h);
			} else {
				element.css('height', h + 'px');
			}

			options.width = element.width();
			options.height = element.height();

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

			barHelpers.updateData(scope, options);
		}
	};
});
