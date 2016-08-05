var models = require('../../models');

module.exports = function(app, route) {

  app.get(route, function(req, res) {

    var stats = {}
    //1. runs
    models.run.find({
      course_code: req.params.course_code
    }, {
      _id: 0
    }, function(err, results) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        stats.runs = results;
        respond();
      }
    });

    //2. enrolment
    models.enrolment.aggregate([{
        $match: {
          course_code: req.params.course_code,
        }
      }, {
        $group: {
          _id: '$run',
          enrolled: {
            $sum: 1
          },
          unenrolled: {
            $sum: {
              $cond: [{
                $ne: ['$unenrolled_at', '']
              }, 1, 0]
            }
          },
          purchased_statement: {
            $sum: {
              $cond: [{
                $ne: ['$purchased_statement_at', '']
              }, 1, 0]
            }
          },
          fully_participated: {
            $sum: {
              $cond: [{
                $ne: ['$fully_participated_at', '']
              }, 1, 0]
            }
          }
        }
      }, {
        $sort: {
          _id: 1
        }
      }],
      function(err, results) {
        if (err) {
          res.send(err);
        } else {
          stats.enrolment = results;
          respond();
        }
      });

    //3. comments
    models.comment.aggregate([{
      $match: {
        course_code: req.params.course_code,
      }
    }, {
      $group: {
        _id: '$run',
        comments: {
          $sum: 1
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }], function(err, results) {
      var count = 0;
      if (results.length===0) {
        stats.comment = results;
        return;
      }
      // models.comment.collection.aggregate([{
      //   $match: {
      //     course_code: req.params.course_code
      //   }
      // },{
      //   $group: {
      //     _id: '$run',
      //     total_commentor: {
      //       $sum: 1
      //     }
      //   }
      // }, {
      //   $sort: {
      //     _id: 1
      //   }
      // }]
      // ,function(err, total){
      //   if (err) {
      //     console.log(err);
      //     return;
      //   }
      //   for (var i = 0; i < total.length; i++) {
      //     results[i].total_commentor = total[i].total_commentor;
      //   }
      //   stats.comment = results;
      //   respond();
      // })
      results.forEach(function(r) {
        models.comment.find({
          course_code: req.params.course_code,
          run: r._id
        }).distinct('author_id',  function(err, result) {
          if (err) {
            console.log(err)
          } else {
            r.total_commentor = result.length;
            count++;
            if (count === results.length){
              stats.comment = results;
              respond();
            }
          }
        });
      });
    });

    //4. step_activities
    models.step_activity.aggregate([{
      $match: {
        course_code: req.params.course_code,
      }
    }, {
      $group: {
        _id: '$run',
        step_started: {
          $sum: {
            $cond: [{
              $ne: ['$first_visited_at', '']
            }, 1, 0]
          }
        },
        step_completed: {
          $sum: {
            $cond: [{
              $ne: ['$last_completed_at', '']
            }, 1, 0]
          }
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }], function(err, results) {
      var count = 0;
      if (results.length===0) {
        stats.step_activity = results;
        return;
      }
      results.forEach(function(r) {
      // models.step_activity.collection.aggregate([{
      //   $match: {
      //     course_code: req.params.course_code
      //   }
      // },{
      //   $group: {
      //     _id: '$run',
      //     total_learner: {
      //       $sum: 1
      //     }
      //   }
      // }, {
      //   $sort: {
      //     _id: 1
      //   }
      // }]
      // ,function(err, total){
      //   if (err) {
      //     console.log(err);
      //     return;
      //   }
      //   for (var i = 0; i < total.length; i++) {
      //     results[i].total_learner = total[i].total_learner;
      //   }
      //   stats.step_activity = results;
      //   respond();
      // })
        models.step_activity.find({
          course_code: req.params.course_code,
          run: r._id
        }).distinct('learner_id', function(err, result) {
          if (err) {
            console.log(err)
          } else {
            //console.log(req.params.course_code,r._id,result)
            r.total_learner = result.length;
            count++;
            if (count === results.length){
              stats.step_activity = results;
              respond();
            }
          }
        });
      });
    });

    //5. question_response
    models.question_response.aggregate([{
      $match: {
        course_code: req.params.course_code,
      }
    }, {
      $group: {
        _id: '$run',
        submitted: {
          $sum: {
            $cond: [{
              $ne: ['$submitted_at', '']
            }, 1, 0]
          }
        },
        correct: {
          $sum: {
            $cond: [{
              $eq: ['$correct', true]
            }, 1, 0]
          }
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }], function(err, results) {
      var count = 0;
      if (results.length===0) {
        stats.question_response = results;
        return;
      }
      results.forEach(function(r) {
        models.question_response.collection.distinct('learner_id', {
          course_code: req.params.course_code,
          run: r._id
        }, function(err, result) {
          if (err) {
            console.log(err)
          } else {
            //console.log(req.params.course_code,r._id,result)
            r.total_learner = result.length;
            count++;
            if (count === results.length){
              stats.question_response = results;
              respond();
            }
          }
        });
      });
      // stats.question_response = results;
      // respond();
    });

    //6. peer_review_assignment
    models.peer_review_assignment.aggregate([{
      $match: {
        course_code: req.params.course_code,
      }
    }, {
      $group: {
        _id: '$run',
        submitted: {
          $sum: {
            $cond: [{
              $ne: ['$submitted_at', '']
            }, 1, 0]
          }
        },
        reviews: {
          $sum: '$review_count'
        },
        moderated: {
          $sum: {
            $cond: [{
              $ne: ['$moderated', '']
            }, 1, 0]
          }
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }], function(err, results) {
      var count = 0;
      console.log(results);
      if (results.length===0) {
        stats.peer_review_assignment = results;
        return;
      }
      results.forEach(function(r) {
        models.peer_review_assignment.distinct('author_id', {
          course_code: req.params.course_code,
          run: r._id
        }, function(err, learners) {
          if (err) {
            console.log(err);
            return;
          }
          //console.log(req.params.course_code,r._id,result)
          models.peer_review_review.distinct('reviewer_id',{
            course_code: req.params.course_code,
            run: r._id
          }, function(err, reviewers){
            if (err) {
              console.log(err);
              return;
            } 
            r.total_learner = learners.length;
            r.total_reviewers = reviewers.length;
            count++;
            //console.log(count, learners.length)
            if (count === results.length,reviewers.length){
              stats.peer_review_assignment = results;
              respond();
            }
          })
        });
      });
    });

    function respond() {
      //console.log(Object.keys(stats).length, Object.keys(stats))
      if (Object.keys(stats).length === 6) {
        res.send(stats);
      }
    }

  });
}