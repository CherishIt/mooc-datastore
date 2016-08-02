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
            _id: '$parent_id', 
            reply: {$sum: 1}
        }
    },
    {
        $group: { 
            _id: '$reply', 
            count: {$sum: 1}
        }
    },
    {
        $sort: {_id: 1}
    }],
    function(err, results){
        if (err) {
            res.send(err);
        } else {
            console.log(results.length);
            //comments with no replies
            var single = results.pop();
            results.unshift({'_id':0, 'count':single._id})
            res.send(results);
        }
    });
    });
}