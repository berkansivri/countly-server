/*global countlyCommon,jQuery*/
(function(countlyMyMetricPlugin, $) {
    var _data = {};
    /**
     * This is for initializing model
     * @param {object} query user drill filter query
     * @return {func} ajax func to request data and store in _data
    */

   var getPeriodArray = function() {
        var periodArray = [];
        var periodObject = countlyCommon.getPeriodObj();

        if (parseInt(periodObject.numberOfDays) === 1 || periodObject.currentPeriodArr === undefined || (periodObject.activePeriod !== undefined && typeof periodObject.activePeriod !== 'string')) {
            for (var i = periodObject.periodMin; i <= periodObject.periodMax; i++) {
                periodArray.push(periodObject.activePeriod + '.' + i);
            }
        }
        else {
            periodArray = periodObject.currentPeriodArr;
        }

        return periodArray;
    };

  countlyMyMetricPlugin.requestMetricData = () => {
      const periodArr = countlyCommon.getPeriodObj().currentPeriodArr
      const period = [periodArr[0], periodArr[periodArr.length - 1]]
      return $.ajax({
          type: "GET",
          url: countlyCommon.API_URL + "/o/my-metric",
          data: {
              app_id: countlyCommon.ACTIVE_APP_ID,
              period: JSON.stringify(period)
          },
          success: function(json) {
            console.log("response",json);
            const chartDP = countlyMyMetricPlugin.convertToChartData("my-metric", json);
            console.log("chartDP", chartDP)
            _data = {
              chartDP
            };
          }
      });
  }

  countlyMyMetricPlugin.convertToChartData = (key, data) => {
    const line = { 
        [key]: {
            data: data.map((d) => [d.created_at, d.my_metric_count]),
            color: countlyCommon.GRAPH_COLORS[0],
            label: 'My Metric'
        }
    };
    return line;
  }

  countlyMyMetricPlugin.initialize = function(query) {
      return $.when(this.requestMetricData())   
  };

  countlyMyMetricPlugin.getMetricData = function() {
      return _data;
  };

}(window.countlyMyMetricPlugin = window.countlyMyMetricPlugin || {}, jQuery));