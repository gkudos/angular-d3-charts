'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
describe('Directive a3bar', function() {
	var $compile, $rootScope, $timeout, barDefaults, scope, iconHelpers;
	var directive = '<a3bar></a3bar>';

	beforeEach(module('angular-d3-charts'));
	beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _barDefaults_, _iconHelpers_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
		barDefaults = _barDefaults_;
		scope = $rootScope.$new();
		iconHelpers = _iconHelpers_;
	}));

	afterEach(inject(function($rootScope) {
		$rootScope.$apply();
	}));


	it('Should have loaded bar chart inside the directive', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg').size()).toEqual(1);
	});

	it('Should have 2 axis', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .axis').size()).toEqual(2);
	});

	it('Should have 1 "g" tag for bars', function() {
		var element = angular.element(directive);
		element = $compile(element)(scope);
		scope.$digest();
		expect(element.find('svg .a3bar-bars').size()).toEqual(1);
	});

	it('With icons should have loaded bar chart inside the directive', function() {
		var element = angular.element(directive);
		element.attr('options', 'options');
		element = $compile(element)(scope);
		angular.extend(scope, {
			options: {
				bar: {
					path: iconHelpers.tree
				}
			}
		});
		scope.$digest();
		expect(element.find('svg').size()).toEqual(1);
		expect(element.find('svg .a3bar-bars .a3bar-group-bar .a3bar-bar').size()).toEqual(9);
	});
});
