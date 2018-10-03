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
			if(!jQuery) {
				$log.error('JQuery is not loaded');
				return;
			}
			scope.container = element;
			scope.type = 'pie';
			scope.classPrefix = 'a3pie';
			var options = pieDefaults.setDefaults(scope.options, attrs.id);

			d3Helpers.setSize(element, options, attrs);

			svgHelpers.addSVG(scope, element.get(0), options);
			var w = options.width + options.margin.left + options.margin.right;
			w -= options.legend.show && options.legend.type === 'vertical'? options.legend.size:0;
			scope.svg.attr('transform', 'translate(' + w / 2 + ',' + options.height / 2 + ')');

			pieHelpers.addArc(scope, options);
			//svgHelpers.updateStyles(scope, options);

			//pieHelpers.updateData(scope, options);

			scope.$watch('data', function() {
				pieHelpers.updateData(scope, options);
			});
		}
	};
});
