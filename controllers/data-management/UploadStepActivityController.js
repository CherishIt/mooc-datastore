var models = require('../../models');
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer');

var upload = multer({dest: 'uploads/'})

module.exports = function (app, route) {

    app.post(route, upload.single('csv'), function(req, res) {
        console.log(req.file.path);
        
        var stream = fs.createReadStream(req.file.path);

        var items = []
    
        var csvStream = csv()
            .on("data", function(data){
                /*bulk.insert({
                    course_code : req.body.course_code,
                    run : req.body.run,
                    learner_id : data[0],
                    step: data[1],
                    week_number: data[2],
                    step_number: data[3],
                    first_visited_at: data[4],
                    last_completed_at: data[5]
                })
                counter ++;
                if (counter % 1000 === 0) {
                    bulk.execute(function(err,result){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Saved.', result);
                        }
                    })
                }*/
                if (data[0] === 'learner_id')
                    return;
                var step_activity = {
                    course_code : req.body.course_code,
                    run : req.body.run,
                    learner_id : data[0],
                    step: data[1],
                    week_number: data[2],
                    step_number: data[3],
                    first_visited_at: data[4],
                    last_completed_at: data[5]
                }
                items.push(step_activity);
                
                console.log(step_activity.learner_id);
            })
            .on("end", function(){
                /*if ( counter % 1000 !== 0 ) {
                    bulk.execute(function(err,result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Saved.', result);
                        }
                    });
                }*/
                console.log(items.length)
                models.step_activity.collection.insert(items);
                console.log("done");
            });
    
        stream.pipe(csvStream);
        
        res.send(req.files);
    })
}