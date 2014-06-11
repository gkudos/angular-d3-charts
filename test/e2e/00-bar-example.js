'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
describe('Loading bar-example.html', function() {

    var ptor, driver;
    beforeEach(function() {
        ptor = protractor.getInstance();
        browser.get('bar-example.html');
        driver = ptor.driver;
    }, 30000);

    it('Should have loaded bar chart inside the directive', function() {
        expect(
					element(by.className('angular-a3bar'))
						.element(by.tagName('svg')).isPresent())
					.toBe(true);
    });
});
