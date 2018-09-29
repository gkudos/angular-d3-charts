angular.module('angular-d3-charts').factory('pieDefaults', function (d3Helpers) {
	function _getDefaults() {
		var commonDefaults = d3Helpers.getCommonDefaults();
		angular.extend(commonDefaults, {
			pie: {
				colors: d3.scaleOrdinal(d3.schemePaired)
			},
			radius: 0,
			x: {
				key: 'x',
				label: 'x',
				show: true
			},
			y: {
				key: 'y',
				label: 'y'
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
			}],
			showPercent: false,
			borderColor: '#FFF',
			pieAnimation: 'normal'
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
				newDefaults.showPercent = d3Helpers.isDefined(userDefaults.showPercent)?  userDefaults.showPercent:newDefaults.showPercent;
				newDefaults.borderColor = d3Helpers.isDefined(userDefaults.borderColor)?  userDefaults.borderColor:newDefaults.borderColor;
				newDefaults.pieAnimation = d3Helpers.isDefined(userDefaults.pieAnimation)?  userDefaults.pieAnimation:newDefaults.pieAnimation;

				if(isDefined(userDefaults.pie)) {
					angular.extend(newDefaults.pie, userDefaults.pie);
				}

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
