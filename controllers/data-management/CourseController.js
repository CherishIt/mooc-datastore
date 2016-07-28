var models = require('../../models')

module.exports = function (app, route) {
    app.get(route, function(req, res){
        res.render('addCourse.html',{name:'MOOC Manngmt'});
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
        res.render('addCourse.html',{name:'Success!'})
    });
}