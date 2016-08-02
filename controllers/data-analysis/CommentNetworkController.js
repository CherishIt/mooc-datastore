var models = require('../../models');
var _ = require('lodash');
var dl = require('datalib');

module.exports = function (app, route) {

    app.get(route, function(req, res) {
        models.comment.find({
            course_code: req.params.course_code,
            run: req.params.run,
        },{
            id:1,
            parent_id:1,
            likes:1,
            _id:0, 
            step:1, 
            timestamp:1
        }).lean().exec(function(err, results){
            if (err) {
                res.send(err);
            } else {
                for (var i = 0; i < results.length; i++) {
                    var date = new Date(results[i].timestamp);
                    results[i].week = date.getWeek();
                    results[i].day = date.getDay();
                }
                var byWeek = dl.groupby('week').execute(results);
                res.send(byWeek);
            }
        })

        // models.comment.aggregate([
        // //{$project: {parent_id:1, step:1, step_number:{$substr:['$step',2,-1]}, week_number:{$substr:['$step',0,1]}}},
        // {
        //     $match: { 
        //         course_code: req.params.course_code,
        //         run: req.params.run
        //     }
        // },
        // {
        //     $group: { 
        //         _id: '$parent_id', 
        //         reply: {$sum: 1}
        //     }
        // },
        // {
        //     $group: { 
        //         _id: '$reply', 
        //         count: {$sum: 1}
        //     }
        // },
        // {
        //     $sort: {_id: 1}
        // }],
        // function(err, results){
        //     if (err) {
        //         res.send(err);
        //     } else {
        //         console.log(results.length);
        //         //comments with no replies
        //         var single = results.pop();
        //         results.unshift({'_id':0, 'count':single._id})
        //         res.send(results);
        //     }
        // });
    });
}