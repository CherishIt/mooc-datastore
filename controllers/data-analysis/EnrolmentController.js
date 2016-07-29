var models = require('../../models');
var _ = require('lodash');

module.exports = function(app, route) {

  app.get(route, function(req, res) {
    models.enrolment.aggregate([{
        $project: {
          course_code: 1,
          run: 1,
          enrolled_at: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: "$enrolled_at"
            }
          }
        }
      }, {
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
            //last_completed_at: { $ne : ''}
        }
      }, {
        $group: {
          _id: '$enrolled_at',
          enrolled_number: {
            $sum: 1
          }
        }
      }, {
        $sort: {
          enrolled_at: 1
        }
      }],
      //result1 is the aggregated value of enrolment by day
      function(err, results1) {
        if (err) {
          res.send(err);
        } else {
          console.log(results1.length);
          // results1.sort(function(m,n){
          //   m=m._id.split('-');
          //   n=n._id.split('-');
          //   for (var i = 0; i < m.length; i++) {
          //       var r = parseInt(m[i]) - parseInt(n[i]);
          //       if(r!==0){
          //           return r;
          //       }
          //   }
          //   return 0;
          // });

          models.enrolment.aggregate([{
              $match: {
                course_code: req.params.course_code,
                run: req.params.run,
                unenrolled_at: {
                  $ne: ''
                }
              }
            }, {
              $project: {
                course_code: 1,
                run: 1,
                unenrolled_at: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: "$enrolled_at"
                  }
                }
              }
            }, {
              $group: {
                _id: '$unenrolled_at',
                unenrolled_number: {
                  $sum: 1
                }
              }
            }, {
              $sort: {
                unenrolled_at: 1
              }
            }],
            function(err, results2) {
              if (err) {
                res.send(err);
              } else {
                console.log(results2.length);
                // results2.sort(function(m,n){
                //   m=m._id.split('-');
                //   n=n._id.split('-');
                //   for (var i = 0; i < m.length; i++) {
                //       var r = parseInt(m[i]) - parseInt(n[i]);
                //       if(r!==0){
                //           return r;
                //       }
                //   }
                //   return 0;
                // })

                var byDate = _.groupBy(results1.concat(results2),'_id');
                var sorted = Object.keys(byDate).sort(function(m,n){
                  m=m.split('-');
                  n=n.split('-');
                  for (var i = 0; i < m.length; i++) {
                      var r = parseInt(m[i]) - parseInt(n[i]);
                      if(r!==0){
                          return r;
                      }
                  }
                  return 0;
                }).reduce(function(result,key){
                    var obj = {}
                    obj.date = key;
                    byDate[key].forEach(function(item){
                      var type = Object.keys(item)[1]
                      obj[type] = item[type];
                    })
                    result.push(obj);
                    return result;
                },[]);

                res.send(sorted);
              }
            });
        }
      });

  });
}