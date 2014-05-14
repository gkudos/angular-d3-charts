angular.module("angular-d3-charts").factory('barDefaults', function (d3Helpers) {
	function _getDefaults() {
		return {
			width: 300,
			heigth: 250,
			zoom: true
		};
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

			var barDefaults = {
				zoom: d.zoom
			};

			return barDefaults;
		},

		setDefaults: function(userDefaults, scopeId) {
			var newDefaults = _getDefaults();

			if (isDefined(userDefaults)) {
				newDefaults.width = isDefined(userDefaults.width) ?  userDefaults.width : newDefaults.width;
				newDefaults.heigth = isDefined(userDefaults.heigth) ?  userDefaults.heigth : newDefaults.heigth;
				newDefaults.zoom = isDefined(userDefaults.zoom) ?  userDefaults.zoom : newDefaults.zoom;
			}

			var barId = obtainEffectiveChartId(defaults, scopeId);
			defaults[barId] = newDefaults;
			return newDefaults;
		}
	};
});