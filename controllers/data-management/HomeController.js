var models = require('../../models');
var _ = require('lodash');

module.exports = function (app, route) {
    app.get(route, function(req, res){
        models.course.find({},function(err,courses){
            if (err) {
                res.send(err);
            }
            res.render('index.html', {courses: courses});
        })
        
    })
}