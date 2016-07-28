var models = require('../../models');
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer');

var upload = multer({dest: 'uploads/'})

module.exports = function (app, route) {

    app.post(route, upload.single('csv'), function(req, res) {
        console.log(req.file.path);
        
        var stream = fs.createReadStream(req.file.path);

        var items = [];
    
        var csvStream = csv()
            .on("data", function(data){
                var enrolment = {
                    course_code : req.body.course_code,
                    run: req.body.run,
                    learner_id : data[0],
                    enrolled_at : data[1],
                    unenrolled_at : data[2]
                }
                items.push(enrolment);
                console.log(enrolment.learner_id);
            })
            .on("end", function(){
                console.log(items.length)
                models.enrolment.collection.insert(items);
                console.log("done");
            });
    
        stream.pipe(csvStream);
        
        res.send(req.files);
    })
}