var models = require('../../models');

module.exports = function (app, route) {

    app.get(route, function(req, res) {
        models.comment.aggregate([
    //{$project: {parent_id:1, step:1, step_number:{$substr:['$step',2,-1]}, week_number:{$substr:['$step',0,1]}}},
    {
        $match: { 
            course_code: req.params.course_code,
            run: req.params.run
        }
    },
    {
        $group: { 
            _id: '$step', 
            week_number: {$min: '$week_number'},
            step_number: {$min: '$step_number'},
            post: {$sum: {$cond: [{$ne: ['$parent_id','']},0,1]}},
            reply: {$sum: {$cond: [{$ne: ['$parent_id','']},1,0]}}
        }
    },
    //{$sort: {_id: 1}}],//, step_number:'$step_number', week_number:'$week_number'}}, 
    {$sort: {week_number:1, step_number:1}}],
    function(err, results){
        if (err) {
            res.send(err);
        } else {
            console.log(results.length);
            res.send(results);
            // models.comment.aggregate([
            // { $match: { parent_id: {$ne: ''}}},
            // { $group: { _id: '$step', replies: {$sum: 1}}},
            // { $sort: {_id: 1}}], 
            // function(err, results2){
            //     if (err) {
            //         res.send(err);
            //     } else {
            //         console.log(results.length);
            //         res.send([results,results2]);
            //     }
            // });     
        }
    });
    });
}