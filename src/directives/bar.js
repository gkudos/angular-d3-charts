angular.module("angular-d3-charts", []).directive('a3bar', function ($log, d3Helpers, barDefaults) {
	return {
		restrict: "EA",
		replace: true,
		scope: {
		},
		template: '<div class="angular-a3bar"></div>',
		controller: function($scope) {
			$log.info("[Angular - D3] Bar scope controller", $scope);
		},
		link: function(scope, element, attrs) {
			var isDefined = d3Helpers.isDefined,
				defaults = barDefaults.setDefaults(scope.defaults, attrs.id);

			// Set width and height if they are defined
			var w = isDefined(attrs.width)? attrs.width:defaults.width,
				h = isDefined(attrs.height)? attrs.height:defaults.height;
			
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
			

			defaults.width = element.width();
			defaults.height = element.height();
		}
	};
});