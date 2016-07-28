var models = require('../../models');

module.exports = function (app, route) {

    app.get(route, function(req, res) {
        models.enrolment.find({
            course_code: req.params.course_code,
            run: req.params.run
        }, function(err, results){
        if (err) {
            res.send(err);
        } else {
            console.log(results.length);
            res.send(results);
        }
    });
    });
}