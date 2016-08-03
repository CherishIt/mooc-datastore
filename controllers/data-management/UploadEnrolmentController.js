var models = require('../../models');
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer');

var upload = multer({dest: 'uploads/'})

module.exports = function (app, route) {

    app.post(route, upload.single('csv'), function(req, res) {
        console.log(req.file.path);
        
        var stream = fs.createReadStream(req.file.path);

        models.enrolment.collection.remove({
            course_code: req.body.course_code, 
            run: req.body.run
        },function(err){
            if (err) {
                console.log(err);
            }
        });

        var items = [];
    
        var csvStream = csv()
            .on("data", function(data){
                if (data[0] === 'learner_id')
                    return;

                var enrolment = {
                    course_code : req.body.course_code,
                    run: req.body.run,
                    learner_id : data[0],
                    enrolled_at : new Date(data[1]),
                    unenrolled_at : data[2]? new Date(data[2]) : '',
                    role : data[3],
                    fully_participated_at : data[4] ? new Date(data[4]) : '',
                    purchased_statement_at : data[5] ? new Date(data[5]) : '',
                    gender : data[6],
                    country : data[7],
                    age_range : data[8],
                    highest_education_level : data[9],
                    employment_status : data[10],
                    employment_area : data[11]
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
        
        res.send(req.file);
    })
}