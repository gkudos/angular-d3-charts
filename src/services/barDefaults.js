angular.module('angular-d3-charts').factory('barDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			series: ['A', 'B', 'C', 'D'],
			barGap: 0.2,
			barPath: null,
			x: {
				tickFormat: null,
				tickSize: 6,
				orient: 'bottom',
				position: 'bottom',
				key: 'x',
				label: 'x',
				ticks: 5,
				tickSubdivide: 4
			},
			y: {
				scale: 'linear',
				tickFormat: null,
				tickSize: 6,
				orient: 'left',
				position: 'left',
				key: 'y',
				label: 'y',
				ticks: 5,
				tickSubdivide: 4
			},
			axis: {
				valuesColor: '#000',
				percentColor: '#000',
				label: {
					color: '#000',
					fontWeight: 'bold'
				}
			},
			defaultData: [{
				id: 1,
				x: 'Fruits',
				y: [ 54, 0, 879 ],
				tooltip: 'Fruits tooltip'
			}, {
				id: 2,
				x: 'Vegetables',
				y: [ 12, 34, 15 ],
				tooltip: 'Vegetables tooltip'
			}, {
				id: 3,
				x: 'Meet',
				y: [ 154, 432, 234 ],
				tooltip: 'Meet tooltip'
			}]
		});
		return commonDefaults;
	}

	var isDefined = d3Helpers.isDefined,
		obtainEffectiveChartId = d3Helpers.obtainEffectiveChartId,
		defaults = {};

	return {
		getDefaults: function (scopeId) {
			var barId = obtainEffectiveChartId(defaults, scopeId);
			return defaults[barId];
		},

		getCreationDefaults: function (scopeId) {
			var d = this.getDefaults(scopeId);

			var barDefaults = {};
			angular.extend(barDefaults, d);
			return barDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				d3Helpers.setDefaults(newDefaults, userDefaults);
				newDefaults.barGap = d3Helpers.isDefined(userDefaults.barGap)?  userDefaults.barGap:newDefaults.barGap;
				newDefaults.barPath = d3Helpers.isDefined(userDefaults.barPath)?  userDefaults.barPath:newDefaults.barPath;

				if(isDefined(userDefaults.x)) {
					angular.extend(newDefaults.x, userDefaults.x);
				}

				if(isDefined(userDefaults.y)) {
					angular.extend(newDefaults.y, userDefaults.y);
				}

				if(isDefined(newDefaults.defaultData)) {
					angular.extend(newDefaults.defaultData, newDefaults.defaultData);
				}
			}

			var barId = obtainEffectiveChartId(defaults, scopeId);
			defaults[barId] = newDefaults;
			return newDefaults;
		}
	};
});
