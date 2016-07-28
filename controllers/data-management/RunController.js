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
                if (data[0] === 'uni_name')
                    return;
                var run = {
                    course_code : req.body.course_code,
                    uni_name : data[0],
                    course_name: data[1],
                    run: data[2],
                    start_date: data[3],
                    end_date: data[4],
                    duration_weeks: data[5]
                }
                items.push(run);
                console.log(run);
            })
            .on("end", function(){
                models.run.collection.insert(items);
                console.log("done");
                res.send("done");
            });
    
        stream.pipe(csvStream);

    })

}