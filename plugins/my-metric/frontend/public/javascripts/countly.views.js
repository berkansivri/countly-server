window.myMetricView = countlyView.extend({
    templateData: {},

    beforeRender: function() {
        return $.when(T.render('/my-metric/templates/my-metric.html', (src) => {
            this.template = src
        }), countlyMyMetricPlugin.initialize())
    },
    /**
   * This is for rendering chart and table.
   * especially, in the table, if server contains "users" plugin,
   * will show a column enable to show users list by clicking the button.
   * @namespace countlyMyMetricPlugin
   * @method initialize
   * @param {}
   * @return {func} ajax func to request data and store in _data
   */

    renderCommon: function(isRefresh) {
        if(!isRefresh) {
          $(this.el).html(this.template(this.templateData));
          this.updateView(false);
        }
    },
    updateChart: function() {
      const data = this.getData();
      this.renderChart(data.chartDP);
    },
    drillInitProcess: function(self) {
        self.initDrill();
        setTimeout(function() {
            self.filterBlockClone = $("#filter-view").clone(true);
            if (self._query) {
                if ($(".filter-view-container").is(":visible")) {
                    $("#filter-view").hide();
                    $(".filter-view-container").hide();
                }
                else {
                    $("#filter-view").show();
                    $(".filter-view-container").show();
                    self.adjustFilters();
                }

                $(".flot-text").hide().show(0);
                var filter = self._query;
                var inputs = [];
                var subs = {};
                for (var i in filter) {
                    inputs.push(i);
                    subs[i] = [];
                    for (var j in filter[i]) {
                        if (filter[i][j].length) {
                            for (var k = 0; k < filter[i][j].length; k++) {
                                subs[i].push([j, filter[i][j][k]]);
                            }
                        }
                        else {
                            subs[i].push([j, filter[i][j]]);
                        }
                    }
                }
                self.setInput(inputs, subs, 0, 0, 1);
            }
        }, 500);
    },
    setInput: function(inputs, subs, cur, sub, total) {
        var self = this;
        sub = sub || 0;
        if (inputs[cur]) {
            var filterType = subs[inputs[cur]][sub][0];

            if (filterType === "$in") {
                filterType = "=";
            }
            else if (filterType === "$nin") {
                filterType = "!=";
            }
            var val = subs[inputs[cur]][sub][1];
            var el = $(".query:nth-child(" + (total) + ")");
            $(el).data("query_value", val + ""); //saves value as attribute for selected query
            el.find(".filter-name").trigger("click");
            el.find(".filter-type").trigger("click");


            if (inputs[cur].indexOf("chr.") === 0) {
                el.find(".filter-name").find(".select-items .item[data-value='chr']").trigger("click");
                if (val === "t") {
                    el.find(".filter-type").find(".select-items .item[data-value='=']").trigger("click");
                }
                else {
                    el.find(".filter-type").find(".select-items .item[data-value='!=']").trigger("click");
                }
                val = inputs[cur].split(".")[1];
                subs[inputs[cur]] = ["true"];
            }
            else if (inputs[cur] === "did" || inputs[cur] === "chr" || inputs[cur].indexOf(".") > -1) {
                el.find(".filter-name").find(".select-items .item[data-value='" + inputs[cur] + "']").trigger("click");
            }
            else {
                el.find(".filter-name").find(".select-items .item[data-value='up." + inputs[cur] + "']").trigger("click");
            }

            el.find(".filter-type").find(".select-items .item[data-value='" + filterType + "']").trigger("click");
            setTimeout(function() {
                el.find(".filter-value").not(".hidden").trigger("click");
                if (el.find(".filter-value").not(".hidden").find(".select-items .item[data-value='" + val + "']").length) {
                    el.find(".filter-value").not(".hidden").find(".select-items .item[data-value='" + val + "']").trigger("click");
                }
                else if (_.isNumber(val) && (val + "").length === 10) {
                    el.find(".filter-value.date").find("input").val(countlyCommon.formatDate(moment(val * 1000), "DD MMMM, YYYY"));
                    el.find(".filter-value.date").find("input").data("timestamp", val);
                }
                else {
                    el.find(".filter-value").not(".hidden").find("input").val(val);
                }

                if (subs[inputs[cur]].length === sub + 1) {
                    cur++;
                    sub = 0;
                }
                else {
                    sub++;
                }
                total++;
                if (inputs[cur]) {
                    $("#filter-add-container").trigger("click");
                    if (sub > 0) {
                        setTimeout(function() {
                            var elChild = $(".query:nth-child(" + (total) + ")");
                            elChild.find(".and-or").find(".select-items .item[data-value='OR']").trigger("click");
                            self.setInput(inputs, subs, cur, sub, total);
                        }, 500);
                    }
                    else {
                        self.setInput(inputs, subs, cur, sub, total);
                    }
                }
                else {
                    setTimeout(function() {
                        $("#apply-filter").removeClass("disabled");
                        $("#no-filter").hide();
                        var filterData = self.getFilterObjAndByVal();
                        $("#current-filter").show().find(".text").text(filterData.bookmarkText);
                        $("#connector-container").show();
                    }, 500);
                }
            }, 500);
        }
    },
    loadAndRefresh: function() {
        var filter = {};
        for (var i in this.filterObj) {
            filter[i.replace("up.", "")] = this.filterObj[i];
        }
        this._query = filter;
        app.navigate("/my-metric/" + JSON.stringify(filter), false);
        this.refresh();
    },
    refresh: function() {
        $.when(
            countlyMyMetricPlugin.requestMetricData()
        ).done(() => {
            this.updateView(true);
        });
    },

    renderChart: function(data) {
      console.log("renderChart", data);
      countlyCommon.drawTimeGraph(data, "#chartContainer")
    },

    updateView: function(isRefresh) {
      const data = this.getData();
      this.renderChart(data.chartDP);
    },
    
    getData: function() {
      return countlyMyMetricPlugin.getMetricData();
    }
});

//register views
app.myMetricView = new myMetricView();

app.route("/my-metric", 'my-metric', function() {
    this.myMetricView._query = undefined;
    this.renderWhenReady(this.myMetricView);
});

$(document).ready(function() {
    app.addSubMenu("analytics", {code: "my-metric", url: "#/my-metric", text: "my-metric.title", priority: 30});
});