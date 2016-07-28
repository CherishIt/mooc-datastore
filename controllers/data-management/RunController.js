var models = require('../../models');

module.exports = function (app, route) {
    /*app.get(route, function(req, res){
        models.run.find({}, function(err, results){
            res.render('addCourse.html',{name:'MOOC Manngmt'});
        })
    });*/

    app.post(route, function(req, res){
        var run = new models.run({
            course_code: req.params.course_code,
            number: req.body.number, 
            start_date: req.body.start_date,
            end_date: req.body.end_date
        });
        console.log('body',req.body)
        console.log(run);
        run.save(function(err, data){
            if (err) {
                res.send(err);
                console.log(err);
            } else {
                console.log("Saved.", data);
                res.send('success!');
            }
        });
    });
}