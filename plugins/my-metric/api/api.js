'use strict';

const plugins = require('../../pluginManager'),
    common = require('../../../api/utils/common.js'),
    plugin = {},
    moment = require('moment');

(function(plugin) {

    plugins.register("/i/my-metric", (ob) => {
        const { app_key, device_id, my_metric, my_metric_count } = ob.params.qstring;
        console.log(ob);
        if (app_key && device_id) {
            const data = { app_key, device_id, my_metric, my_metric_count, created_at: new Date() };
                common.db.collection('my-metric').insert(data, (err,app) => {
                    if(err) {
                        common.returnMessage(ob.params, 200, err)
                    } else {
                        common.returnMessage(ob.params, 200, app)
                    }
                });
              return true;
        }
        return false
    });

    // plugins.register('/o/my-metric', (ob) => {
    //   const { qstring: { app_id, period, timezone, timestamp }, appTimezone } = ob.params
    //   const params = {
    //     app_id,
    //     appTimezone,
    //     qstring: {
    //       period
    //     },
    //     time: common.initTimeObj(timezone, timestamp)
    //   }

    //   fetch.getTimeObj('my-metric', params, (doc) => {
    //     common.returnOutput(params, doc)
    //   })
    //   return true
    // })

    // plugins.register("/o", function(ob) {
    //     var params = ob.params;
    //     var validateUserForDataReadAPI = ob.validateUserForDataReadAPI;
    //     if (params.qstring.method === "my-metric") {
    //         validateUserForDataReadAPI(params, fetch.fetchTimeObj, 'my-metric');
    //         return true;
    //     }
    //     return false;
    // });

    // plugins.register("/o/my-metric", function(ob) {
    //     common.db.collection('my-metric').find().toArray((err, res) => {
    //       common.returnOutput(ob.params, res)
    //     });
        
    //     return true
    // });

    plugins.register("/o/my-metric", function(ob) {
      let period = JSON.parse(ob.params.qstring.period);
      const startDate = new Date(period[0])
      const endDate = new Date(moment(period[1]).add(1, 'days'))
      common.db.collection('my-metric').find({ 
        created_at: {
            $gt: startDate,
            $lt: endDate,
        }}).toArray((err, res) => {
        if(err) {
          common.returnMessage(err)
        } else {
          common.returnOutput(ob.params, res)
        }
      });

    // plugins.register("/o/my-metric", function(ob) {
    //   const { device_id } = ob.params.qstring;
    //   common.db.collection('my-metric').find({ device_id: device_id }).toArray((err, res) => {
    //     if(err) {
    //       common.returnMessage(err)
    //     } else {
    //       common.returnOutput(ob.params, res)
    //     }
    // });

      
      // const { app_id, period, timezone, timestamp } = ob.params.qstring
      // const params = {
      //   app_id,
      //   qstring: {
      //     period
      //   },
      //   appTimezone: ob.params.appTimezone,
      //   time: common.initTimeObj(timezone, timestamp)
      // }
      // fetch.getTimeObj('my-metric', params, (data) => {
      //   common.returnOutput(params, data)
      // });

      return true;
    });

}(plugin));

module.exports = plugin;