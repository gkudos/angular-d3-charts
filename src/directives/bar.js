angular.module('angular-d3-charts', []).directive('a3bar', function ($log, d3Helpers, svgHelpers, barHelpers, barDefaults) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			options: '=options'
		},
		template: '<div class="angular-a3bar"></div>',
		controller: function($scope) {
			$log.info('[Angular - D3] Bar scope controller', $scope);
		},
		link: function(scope, element, attrs) {
			scope.container = element;
			var isDefined = d3Helpers.isDefined,
				options = barDefaults.setDefaults(scope.options, attrs.id);

			// Set width and height if they are defined
			var w = isDefined(attrs.width)? attrs.width:options.width,
				h = isDefined(attrs.height)? attrs.height:options.height,
				svg;
			
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

			barHelpers.setXScale(scope, options);
			barHelpers.setYScale(scope, options);
			svg = svgHelpers.addSVG(scope, element.get(0), options);

			element.width(options.containerWidth);
			element.height(options.containerHeight);

			barHelpers.addAxis(scope, options);
			svgHelpers.updateStyles(scope, options);
		}
	};
});