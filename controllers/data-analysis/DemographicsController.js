var models = require('../../models');
var _ = require('lodash');
var countries = require('country-data').countries;

module.exports = function(app, route) {

  app.get(route, function(req, res) {
    var demographics = {};
    //gender
    models.enrolment.aggregate([{
        $project: {
          course_code: 1,
          run: 1,
          gender: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $group: {
          _id: '$gender',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          demographics.gender = results;
          respond();
        }
      });
    //age_range
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $project: {
          age_range: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $group: {
          _id: '$age_range',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          demographics.age_range = results;
          respond();
        }
      });
    //country
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $project: {
          country: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $group: {
          _id: '$country',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          results.forEach(function(e){
            if (e._id === 'Unknown')
              return;
            console.log(e._id,countries[e._id])
            e.name = countries[e._id].name;
          });
          demographics.country = results;
          respond();
        }
      });
    //highest_education_level
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $project: {
          highest_education_level: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $group: {
          _id: '$highest_education_level',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          demographics.highest_education_level = results;
          respond();
        }
      });
    //employment_status
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $project: {
          employment_status: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $group: {
          _id: '$employment_status',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          demographics.employment_status = results;
          respond();
        }
      });
    //employment_area
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
          run: req.params.run
        }
      }, {
        $project: {
          employment_area: 1,
          purchased_statement_at: 1,
          fully_participated_at: 1
        }
      }, {
        $group: {
          _id: '$employment_area',
          number: {
            $sum: 1
          },
          purchased_statement_number: {
            $sum: {
              $cond: [{$ne: ['$purchased_statement_at','']},1,0]
            }
          },
          fully_participated_number: {
            $sum: {
              $cond: [{$ne: ['$fully_participated_at','']},1,0]
            }
          }
        }
      }, {
        $sort: {
          number: -1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          demographics.employment_area = results;
          respond();
        }
      });

    function respond() {
      // Use the totol Number of measures here to judge whether all async queries are done.
      // need modify when measure numbers change.
      if (Object.keys(demographics).length == 6) {
        //compute overview metrics
        demographics.overview = {
          total:0,
          fully_participated:0,
          purchased_statement:0,
          with_demo:0
        };
        demographics.gender.forEach(function(e){
          demographics.overview.total += e.number;
          demographics.overview.fully_participated += e.fully_participated_number;
          demographics.overview.purchased_statement += e.purchased_statement_number;
          demographics.overview.with_demo += e._id === 'Unknown' ? 0 : e.number;
        })

        res.send(demographics);
      }
    }

  });

};