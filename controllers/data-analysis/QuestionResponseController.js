var models = require('../../models');
var _ = require('lodash');

module.exports = function(app, route) {

  app.get(route, function(req, res) {
    var all_try = {};
    var first_try = {};
    var last_try = {};
    models.question_response.find({
      course_code: req.params.course_code,
      run: req.params.run
    }).sort({
      week_number : 1,
      step_number : 1,
      question_number :1,
      submitted_at :1
    }).lean().exec(function(err,results){
      if (err) {
        console.log(err);
        res.send(err)
        return;
      }
      //group by question
      var byQuestion = _.groupBy(results, 'quiz_question')
      _.forEach(byQuestion, function(value, key){
        //
        all_try[key] = {
          question_number : key,
          total : 0,
          correct : 0,
          wrong : 0
        };
        first_try[key] = {
          question_number : key,
          total : 0,
          correct : 0,
          wrong : 0
        };
        last_try[key] = {
          question_number : key,
          total : 0,
          correct : 0,
          wrong : 0
        };
        // get array of first and last try
        var byLearner = _.groupBy(value, 'learner_id');
        var first = [];
        var last = [];
        _.forEach(byLearner,function(v){
          //console.log(v.length);
          first.push(v[0]);
          last.push(v.pop());
        })

        value.forEach(function(n){
          all_try[key].total ++;
          if (n.correct)
            all_try[key].correct ++;
          else
            all_try[key].wrong ++;
        });
        first.forEach(function(n){
          first_try[key].total ++;
          if (n.correct)
            first_try[key].correct ++;
          else
            first_try[key].wrong ++;
        });
        last.forEach(function(n){
          last_try[key].total ++;
          if (n.correct)
            last_try[key].correct ++;
          else
            last_try[key].wrong ++;
        });

        all_try[key].learners = Object.keys(byLearner).length;
        all_try[key].average_try = (all_try[key].total/all_try[key].learners).toFixed(3);
        all_try[key].correct_rate = (all_try[key].correct/all_try[key].total).toFixed(3);
        first_try[key].correct_rate = (first_try[key].correct/first_try[key].total).toFixed(3);
        last_try[key].correct_rate = (last_try[key].correct/last_try[key].total).toFixed(3);
        // first_try[key].learners = Object.keys(byLearner).length;
        // first_try[key].average_try = (first_try[key].total/first_try[key].learners).toFixed(3);
        // last_try[key].learners = Object.keys(byLearner).length;
        // last_try[key].average_try = (last_try[key].total/last_try[key].learners).toFixed(3);
      })
      res.send({
        all: _.values(all_try),
        first: _.values(first_try),
        last: _.values(last_try) 
      });
    })
  });
}