'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
describe('Directive a3pie', function() {
	var $compile, $rootScope, scope;
	var directive = '<a3pie></a3pie>';

	beforeEach(module('angular-d3-charts'));
	beforeEach(inject(function(_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();
	}));

	afterEach(inject(function($rootScope) {
		$rootScope.$apply();
	}));


	it('Should have loaded pie chart inside the directive', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg').length).toEqual(1);
	});

	it('Should have 3 arcs for default data', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .a3pie-slices path').length).toEqual(3);
	});

	it('Should have 4 arcs for new data', function() {
		var element = angular.element(directive);
		element.attr('data', 'values');
		scope.values = [];
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .a3pie-slices path').length).toEqual(3);
		scope.values = [{
			id: 1,
			x: 'Ene',
			y: 45
		}, {
			id: 2,
			x: 'Feb',
			y: 275
		}, {
			id: 3,
			x: 'Mar',
			y: 85
		}, {
			id: 4,
			x: 'Apr',
			y: 300
		}];
		scope.$digest();
		expect(element.find('svg .a3pie-slices path').length).toEqual(4);
	});
});
