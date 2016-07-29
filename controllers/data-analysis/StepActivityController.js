var models = require('../../models');

module.exports = function (app, route) {

    app.get(route, function(req, res) {

        models.step_activity.aggregate([
        {
            $match:{
                course_code: req.params.course_code,
                run: req.params.run
                //last_completed_at: { $ne : ''}
            }
        },
        {
            $group:{
                _id: '$step',
                week_number: {$min: '$week_number'},
                step_number: {$min: '$step_number'},
                started: {$sum: 1},
                completed: {$sum: {$cond: [{$ne: ['$last_completed_at','']},1,0]}}
            }
        },
        {
            $sort:{
                week_number: 1,
                step_number: 1
            }
        }], 
        function(err, results){
            if (err) {
                res.send(err);
            } else {
                console.log(results.length);

                res.send(results);
            }
        });
    });
}