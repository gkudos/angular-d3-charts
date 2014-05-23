angular.module('angular-d3-charts').factory('pieDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			radius: 0,
			x: {
				key: 'x',
				label: 'x',
			},
			y: {
				key: 'y',
				label: 'y',
			},
			defaultData: [{
				id: 1,
				x: 'Fruits',
				y: 54,
				tooltip: 'Fruits tooltip'
			}, {
				id: 2,
				x: 'Vegetables',
				y: 23,
				tooltip: 'Vegetables tooltip'
			}, {
				id: 3,
				x: 'Meet',
				y: 41,
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
			var pieId = obtainEffectiveChartId(defaults, scopeId);
			return defaults[pieId];
		},

		getCreationDefaults: function (scopeId) {
			var d = this.getDefaults(scopeId);

			var pieDefaults = {};
			angular.extend(pieDefaults, d);
			return pieDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				d3Helpers.setDefaults(newDefaults, userDefaults);

				newDefaults.radius = d3Helpers.isDefined(userDefaults.radius)?  userDefaults.radius:newDefaults.radius;

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

			var pieId = obtainEffectiveChartId(defaults, scopeId);
			defaults[pieId] = newDefaults;
			return newDefaults;
		}
	};
});
