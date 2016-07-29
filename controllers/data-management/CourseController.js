var models = require('../../models');
var _ = require('lodash');

module.exports = function (app, route) {
    app.get(route, function(req, res){
        models.run.find({}, function(err,results){
            if (err) {
                res.send(err);
            }
            res.send(_.groupBy(results,'course_name'));
        })
    });

    app.post(route, function(req, res){
        var course = new models.course({name: req.body.name, code: req.body.code});
        course.save(function(err, data){
            if (err) {
                console.log(err);
            } else {
                console.log("Saved.", data)
            }
        });
        res.send('Success!');
    });
}