'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
describe('Directive a3oabar', function() {
	var $compile, $rootScope, $timeout, barDefaults, scope;
	var directive = '<a3oabar></a3oabar>';

	beforeEach(module('angular-d3-charts'));
	beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _barDefaults_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
		barDefaults = _barDefaults_;
		scope = $rootScope.$new();
	}));

	afterEach(inject(function($rootScope) {
		$rootScope.$apply();
	}));


	it('Should have loaded bar chart inside the directive', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg').length).toEqual(1);
	});

	it('Should have 1 axis', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .axis').length).toEqual(1);
	});

	it('Should have 1 "g" tag for bars', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .a3oabar-bars').length).toEqual(1);
	});
});
